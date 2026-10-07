import type { PoolConnection, RowDataPacket } from 'mysql2/promise';
import { db } from './db.js';
import { isSafeWebUrl } from './roles-ai.js';

const JOBICY_FEED_URL = 'https://jobicy.com/api/v2/remote-jobs?count=200&industry=engineering';
const SYNC_LOCK = 'openrole_jobicy_sync';

interface JobicyRole {
  sourceId: string;
  sourceUrl: string;
  title: string;
  companyName: string | null;
  employmentType: string | null;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  salaryPeriod: string | null;
  eligibleCountries: string[] | null;
  description: string;
  publishedAt: Date;
}

function text(value: unknown, maximum: number) {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, maximum) : null;
}

function numeric(value: unknown) {
  const number = typeof value === 'number' ? value : typeof value === 'string' && /^\d+(?:\.\d{1,2})?$/.test(value) ? Number(value) : NaN;
  return Number.isFinite(number) && number >= 0 && number <= 999_999_999_999_999 ? number : null;
}

export function stripJobicyHtml(value: unknown) {
  if (typeof value !== 'string') return '';
  return value
    .replace(/<!--([\s\S]*?)-->/g, ' ')
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(?:p|div|li|h[1-6])\s*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#(?:39|x27);/gi, "'")
    .replace(/&#(?:x([0-9a-f]+)|(\d+));/gi, (_match, hex: string | undefined, decimal: string | undefined) => {
      const codePoint = Number.parseInt(hex ?? decimal ?? '', hex ? 16 : 10);
      return Number.isInteger(codePoint) && codePoint > 0 && codePoint <= 0x10ffff
        ? String.fromCodePoint(codePoint)
        : ' ';
    })
    .replace(/[\t\r ]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{2,}/g, '\n')
    .trim()
    .slice(0, 20_000);
}

export function normalizeJobicyJob(value: unknown): JobicyRole | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const job = value as Record<string, unknown>;
  const sourceId = typeof job.id === 'number' && Number.isSafeInteger(job.id) && job.id > 0
    ? String(job.id)
    : typeof job.id === 'string' && /^[1-9]\d{0,63}$/.test(job.id) ? job.id : null;
  const sourceUrl = text(job.url, 2048);
  const title = text(job.jobTitle, 180);
  if (!sourceId || !sourceUrl || !title || !isSafeWebUrl(sourceUrl)) return null;
  try {
    const host = new URL(sourceUrl).hostname.toLowerCase();
    if (host !== 'jobicy.com' && host !== 'www.jobicy.com') return null;
  } catch {
    return null;
  }

  const geo = text(job.jobGeo, 180);
  const employment = Array.isArray(job.jobType)
    ? job.jobType.filter((item): item is string => typeof item === 'string').join(', ')
    : text(job.jobType, 120);
  const rawMinimum = numeric(job.salaryMin);
  const rawMaximum = numeric(job.salaryMax);
  const validSalaryRange = rawMinimum === null || rawMaximum === null || rawMinimum <= rawMaximum;
  const salaryCurrency = typeof job.salaryCurrency === 'string' && /^[A-Za-z]{3}$/.test(job.salaryCurrency)
    ? job.salaryCurrency.toUpperCase()
    : null;
  const rawDate = typeof job.pubDate === 'string' ? new Date(job.pubDate) : new Date();

  return {
    sourceId,
    sourceUrl,
    title,
    companyName: text(job.companyName, 180),
    employmentType: employment?.slice(0, 120) || null,
    location: geo,
    salaryMin: validSalaryRange ? rawMinimum : null,
    salaryMax: validSalaryRange ? rawMaximum : null,
    salaryCurrency,
    salaryPeriod: text(job.salaryPeriod, 40),
    eligibleCountries: geo ? [geo] : null,
    description: stripJobicyHtml(job.jobDescription),
    publishedAt: Number.isNaN(rawDate.getTime()) ? new Date() : rawDate,
  };
}

export async function importJobicyJobs(jobs: unknown[]) {
  let imported = 0;
  for (const candidate of jobs.slice(0, 200)) {
    const job = normalizeJobicyJob(candidate);
    if (!job) continue;
    await db.execute(
      `INSERT INTO roles (
        source_type, source_id, source_name, source_url, title, company_name, employment_type,
        location, work_mode, salary_min, salary_max, salary_currency, salary_period,
        eligible_countries, skills, description, status, published_at, last_seen_at
      ) VALUES ('jobicy', ?, 'Jobicy', ?, ?, ?, ?, ?, 'remote', ?, ?, ?, ?, ?, JSON_ARRAY(), ?, 'published', ?, UTC_TIMESTAMP())
      ON DUPLICATE KEY UPDATE
        source_url = VALUES(source_url), title = VALUES(title), company_name = VALUES(company_name),
        employment_type = VALUES(employment_type), location = VALUES(location),
        salary_min = VALUES(salary_min), salary_max = VALUES(salary_max),
        salary_currency = VALUES(salary_currency), salary_period = VALUES(salary_period),
        eligible_countries = VALUES(eligible_countries), description = VALUES(description),
        published_at = VALUES(published_at), last_seen_at = UTC_TIMESTAMP(),
        status = IF(roles.status = 'closed', 'closed', 'published')`,
      [
        job.sourceId,
        job.sourceUrl,
        job.title,
        job.companyName,
        job.employmentType,
        job.location,
        job.salaryMin,
        job.salaryMax,
        job.salaryCurrency,
        job.salaryPeriod,
        job.eligibleCountries ? JSON.stringify(job.eligibleCountries) : null,
        job.description,
        job.publishedAt,
      ],
    );
    imported += 1;
  }
  return imported;
}

export async function syncJobicyIfDue(fetchPage: typeof fetch = fetch) {
  const connection = await db.getConnection();
  let locked = false;
  try {
    const [lockRows] = await connection.query<RowDataPacket[]>(
      'SELECT GET_LOCK(?, 0) AS acquired',
      [SYNC_LOCK],
    );
    locked = Number(lockRows[0]?.acquired) === 1;
    if (!locked) return { status: 'already_running', imported: 0 };

    const [recentRuns] = await connection.query<RowDataPacket[]>(
      `SELECT source_name FROM role_sync_state
       WHERE source_name = 'jobicy' AND synced_at > DATE_SUB(UTC_TIMESTAMP(), INTERVAL 1 HOUR)`,
    );
    if (recentRuns.length > 0) return { status: 'recently_synced', imported: 0 };

    const response = await fetchPage(JOBICY_FEED_URL, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok) throw new Error(`Jobicy request failed (${response.status})`);
    const payload = await response.json();
    if (
      !payload || typeof payload !== 'object' || !Array.isArray(payload.jobs) ||
      payload.success === false || payload.jobs.length > 200
    ) throw new Error('Jobicy returned an invalid feed page');

    const imported = await importJobicyJobs(payload.jobs);
    await connection.execute(
      `INSERT INTO role_sync_state (source_name, synced_at) VALUES ('jobicy', UTC_TIMESTAMP())
       ON DUPLICATE KEY UPDATE synced_at = VALUES(synced_at)`,
    );
    return { status: 'synced', imported };
  } finally {
    if (locked) await connection.query('SELECT RELEASE_LOCK(?)', [SYNC_LOCK]).catch(() => undefined);
    connection.release();
  }
}
