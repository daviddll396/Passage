import express from 'express';
import type { Request, Response } from 'express';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { db } from './db.js';
import { requireStaff } from './auth.js';
import {
  extractRoleDescription as defaultExtractor,
  isSafeWebUrl,
  parseSearchIntent as defaultSearchParser,
} from './roles-ai.js';
import type { RoleDraft, RoleExtraction, SearchCriteria, WorkMode } from './roles-ai.js';

interface RoleRow extends RowDataPacket {
  id: string | number;
  source_type: 'jobicy' | 'recruiter';
  source_name: string;
  source_url: string | null;
  title: string | null;
  company_name: string | null;
  employment_type: string | null;
  location: string | null;
  work_mode: WorkMode | null;
  salary_min: string | number | null;
  salary_max: string | number | null;
  salary_currency: string | null;
  salary_period: string | null;
  minimum_experience_months: number | null;
  eligible_countries: unknown;
  skills: unknown;
  application_url: string | null;
  application_email: string | null;
  description: string;
  status: 'pending' | 'published' | 'closed';
  created_at: Date | string;
  published_at: Date | string | null;
}

interface RoleFilters {
  search?: string | null;
  titleTerms?: string[];
  location?: string | null;
  workMode?: WorkMode | null;
  minimumSalary?: number | null;
  salaryCurrency?: string | null;
  salaryPeriod?: string | null;
  minimumExperienceMonths?: number | null;
  skills?: string[];
  eligibleCountry?: string | null;
}

const CURRENT_JOBICY_ROLE = "(source_type <> 'jobicy' OR last_seen_at >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL 24 HOUR))";

interface ValidSubmission {
  title: string;
  companyName: string;
  employmentType: string | null;
  location: string | null;
  workMode: WorkMode | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  salaryPeriod: string | null;
  minimumExperienceMonths: number | null;
  eligibleCountries: string[] | null;
  skills: string[];
  applicationUrl: string | null;
  applicationEmail: string | null;
  sourceUrl: string | null;
  description: string;
}

interface RoleRouteOptions {
  extractRoleDescription?: (description: string) => Promise<RoleExtraction>;
  parseSearchIntent?: (query: string) => Promise<SearchCriteria>;
}

function asTextArray(value: unknown): string[] | null {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string');
  if (typeof value !== 'string') return null;
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : null;
  } catch {
    return null;
  }
}

function dateString(value: Date | string | null) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
}

function mapRole(row: RoleRow, includeDescription = false, includeStatus = false) {
  const description = String(row.description ?? '');
  return {
    id: String(row.id),
    sourceType: row.source_type,
    sourceName: row.source_name,
    sourceUrl: row.source_url,
    title: row.title,
    companyName: row.company_name,
    employmentType: row.employment_type,
    location: row.location,
    workMode: row.work_mode,
    salaryMin: row.salary_min === null ? null : Number(row.salary_min),
    salaryMax: row.salary_max === null ? null : Number(row.salary_max),
    salaryCurrency: row.salary_currency,
    salaryPeriod: row.salary_period,
    minimumExperienceMonths: row.minimum_experience_months,
    eligibleCountries: asTextArray(row.eligible_countries),
    skills: asTextArray(row.skills) ?? [],
    applicationUrl: row.application_url,
    applicationEmail: row.application_email,
    excerpt: description.length > 320 ? `${description.slice(0, 317).trimEnd()}...` : description,
    ...(includeDescription ? { description } : {}),
    ...(includeStatus ? { status: row.status } : {}),
    createdAt: dateString(row.created_at),
    publishedAt: dateString(row.published_at),
  };
}

function createRateLimiter(maximum: number, windowMs: number) {
  const buckets = new Map<string, { count: number; resetsAt: number }>();
  return (request: Request, response: Response, next: express.NextFunction) => {
    const now = Date.now();
    const key = request.ip || request.socket.remoteAddress || 'unknown';
    let bucket = buckets.get(key);
    if (!bucket || bucket.resetsAt <= now) {
      bucket = { count: 0, resetsAt: now + windowMs };
      buckets.set(key, bucket);
      // ponytail: local per-process limiter; use shared storage if the API runs across instances.
      if (buckets.size > 10_000) {
        for (const [address, entry] of buckets) if (entry.resetsAt <= now) buckets.delete(address);
      }
    }
    bucket.count += 1;
    if (bucket.count <= maximum) return next();
    response.set('Retry-After', String(Math.ceil((bucket.resetsAt - now) / 1000)));
    return response.status(429).json({ error: 'Too many requests. Try again shortly.' });
  };
}

function queryString(request: Request, key: string, maximum: number) {
  const value = request.query[key];
  if (value === undefined) return { value: null, invalid: false };
  if (typeof value !== 'string' || value.length > maximum) return { value: null, invalid: true };
  return { value: value.trim(), invalid: false };
}

function queryNumber(request: Request, key: string, maximum = Number.MAX_SAFE_INTEGER, integerOnly = false) {
  const value = request.query[key];
  if (value === undefined) return { value: null, invalid: false };
  if (typeof value !== 'string' || !(integerOnly ? /^\d+$/.test(value) : /^\d+(?:\.\d{1,2})?$/.test(value))) {
    return { value: null, invalid: true };
  }
  const number = Number(value);
  return { value: Number.isFinite(number) && number <= maximum ? number : null, invalid: !Number.isFinite(number) || number > maximum };
}

function pagination(request: Request) {
  const limitValue = queryNumber(request, 'limit', 100, true);
  const offsetValue = queryNumber(request, 'offset', 100_000, true);
  if (limitValue.invalid || offsetValue.invalid) return null;
  const limit = limitValue.value ?? 24;
  const offset = offsetValue.value ?? 0;
  if (limit < 1 || offset < 0) return null;
  return { limit, offset };
}

function whereFor(filters: RoleFilters) {
  const conditions = ["status = 'published'", CURRENT_JOBICY_ROLE];
  const values: (string | number)[] = [];
  const add = (condition: string, ...parameters: (string | number)[]) => {
    conditions.push(condition);
    values.push(...parameters);
  };

  if (filters.search) {
    const pattern = `%${filters.search}%`;
    add('(title LIKE ? OR company_name LIKE ? OR description LIKE ?)', pattern, pattern, pattern);
  }
  for (const term of filters.titleTerms ?? []) {
    const pattern = `%${term}%`;
    add('(title LIKE ? OR description LIKE ?)', pattern, pattern);
  }
  if (filters.location) add('location LIKE ?', `%${filters.location}%`);
  if (filters.workMode) add('work_mode = ?', filters.workMode);
  if (filters.minimumSalary !== null && filters.minimumSalary !== undefined) {
    add('salary_min >= ?', filters.minimumSalary);
  }
  if (filters.salaryCurrency) add('salary_currency = ?', filters.salaryCurrency);
  if (filters.salaryPeriod) add('salary_period = ?', filters.salaryPeriod);
  if (filters.minimumExperienceMonths !== null && filters.minimumExperienceMonths !== undefined) {
    add('minimum_experience_months >= ?', filters.minimumExperienceMonths);
  }
  for (const skill of filters.skills ?? []) {
    const pattern = `%${skill}%`;
    add('(JSON_CONTAINS(skills, JSON_QUOTE(?)) OR description LIKE ?)', skill, pattern);
  }
  if (filters.eligibleCountry) {
    const pattern = `%${filters.eligibleCountry}%`;
    add(`(JSON_CONTAINS(eligible_countries, JSON_QUOTE(?)) OR location LIKE ?
      OR JSON_CONTAINS(eligible_countries, JSON_QUOTE('Anywhere'))
      OR JSON_CONTAINS(eligible_countries, JSON_QUOTE('Worldwide'))
      OR JSON_CONTAINS(eligible_countries, JSON_QUOTE('Global'))
      OR location IN ('Anywhere', 'Worldwide', 'Global'))`, filters.eligibleCountry, pattern);
  }
  return { sql: conditions.join(' AND '), values };
}

async function listRoles(filters: RoleFilters, limit: number, offset: number) {
  const where = whereFor(filters);
  const [counts] = await db.execute<RowDataPacket[]>(`SELECT COUNT(*) AS total FROM roles WHERE ${where.sql}`, where.values);
  const [rows] = await db.execute<RoleRow[]>(
    `SELECT id, source_type, source_name, source_url, title, company_name, employment_type,
            location, work_mode, salary_min, salary_max, salary_currency, salary_period,
            minimum_experience_months, eligible_countries, skills, application_url,
            application_email, description, status, created_at, published_at
     FROM roles WHERE ${where.sql}
     ORDER BY COALESCE(published_at, created_at) DESC, id DESC
     LIMIT ? OFFSET ?`,
    [...where.values, limit, offset],
  );
  return {
    roles: rows.map((row) => mapRole(row)),
    total: Number(counts[0]?.total ?? 0),
    limit,
    offset,
  };
}

function validEmail(value: string | null): value is string {
  return typeof value === 'string' && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function optionalText(value: unknown, maximum: number): string | null | undefined {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string' || value.length > maximum) return undefined;
  return value.trim() || null;
}

function optionalMoney(value: unknown): number | null | undefined {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'number' && (typeof value !== 'string' || !/^\d+(?:\.\d{1,2})?$/.test(value))) return undefined;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : undefined;
}

function validateSubmission(value: unknown): ValidSubmission | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const submission = value as { draft?: unknown; description?: unknown; sourceUrl?: unknown };
  if (!submission.draft || typeof submission.draft !== 'object' || Array.isArray(submission.draft)) return null;
  const raw = submission.draft as Record<string, unknown>;
  const title = optionalText(raw.title, 180);
  const companyName = optionalText(raw.companyName, 180);
  const employmentType = optionalText(raw.employmentType, 120);
  const location = optionalText(raw.location, 180);
  const salaryCurrency = optionalText(raw.salaryCurrency, 3);
  const salaryPeriod = optionalText(raw.salaryPeriod, 40);
  const applicationUrl = optionalText(raw.applicationUrl, 2048);
  const applicationEmail = optionalText(raw.applicationEmail, 254);
  const sourceUrl = optionalText(submission.sourceUrl, 2048);
  const salaryMin = optionalMoney(raw.salaryMin);
  const salaryMax = optionalMoney(raw.salaryMax);
  const workMode: unknown = raw.workMode === '' || raw.workMode === undefined ? null : raw.workMode;
  const minimumExperienceMonths = raw.minimumExperienceMonths === '' || raw.minimumExperienceMonths === undefined || raw.minimumExperienceMonths === null
    ? null
    : raw.minimumExperienceMonths;
  const eligibleCountries = raw.eligibleCountries === undefined ? null : raw.eligibleCountries;
  const skills = raw.skills === undefined ? [] : raw.skills;
  const description = typeof submission.description === 'string' ? submission.description.trim() : '';

  if (
    title === undefined || !title || companyName === undefined || !companyName ||
    employmentType === undefined || location === undefined || salaryCurrency === undefined || salaryPeriod === undefined ||
    applicationUrl === undefined || applicationEmail === undefined || sourceUrl === undefined ||
    salaryMin === undefined || salaryMax === undefined || description.length < 1 || description.length > 8_000
  ) return null;
  if (workMode !== null && workMode !== 'remote' && workMode !== 'hybrid' && workMode !== 'onsite') return null;
  if (salaryCurrency !== null && !/^[A-Z]{3}$/.test(salaryCurrency)) return null;
  if (salaryPeriod !== null && !['hourly', 'daily', 'weekly', 'monthly', 'yearly', 'annual', 'contract'].includes(salaryPeriod.toLowerCase())) return null;
  if (salaryMin !== null && salaryMax !== null && salaryMin > salaryMax) return null;
  if (minimumExperienceMonths !== null && (!Number.isInteger(minimumExperienceMonths) || Number(minimumExperienceMonths) < 0 || Number(minimumExperienceMonths) > 600)) return null;
  if (!(eligibleCountries === null || (Array.isArray(eligibleCountries) && eligibleCountries.length <= 12 && eligibleCountries.every((item) => typeof item === 'string' && item.trim() && item.length <= 80)))) return null;
  if (!Array.isArray(skills) || skills.length > 12 || skills.some((item) => typeof item !== 'string' || !item.trim() || item.length > 80)) return null;
  if (applicationUrl !== null && !isSafeWebUrl(applicationUrl)) return null;
  if (sourceUrl !== null && !isSafeWebUrl(sourceUrl)) return null;
  if (applicationEmail !== null && !validEmail(applicationEmail)) return null;
  if (!applicationUrl && !applicationEmail) return null;
  if (!location && !workMode) return null;

  return {
    title,
    companyName,
    employmentType,
    location,
    workMode: workMode as WorkMode | null,
    salaryMin,
    salaryMax,
    salaryCurrency,
    salaryPeriod,
    minimumExperienceMonths: minimumExperienceMonths as number | null,
    eligibleCountries: eligibleCountries as string[] | null,
    skills: skills as string[],
    applicationUrl,
    applicationEmail,
    sourceUrl,
    description,
  };
}

export function createRoleRoutes({
  extractRoleDescription = defaultExtractor,
  parseSearchIntent = defaultSearchParser,
}: RoleRouteOptions = {}) {
  const router = express.Router();
  const limitSearchAi = createRateLimiter(5, 60_000);
  const limitExtractAi = createRateLimiter(5, 60_000);
  const limitSubmissions = createRateLimiter(5, 60_000);

  router.post('/roles/extract', limitExtractAi, async (request, response) => {
    const { description } = request.body ?? {};
    if (typeof description !== 'string' || !description.trim() || description.length > 8_000) {
      return response.status(400).json({ error: 'description must contain 1 to 8,000 characters' });
    }
    try {
      return response.json(await extractRoleDescription(description.trim()));
    } catch {
      return response.status(502).json({ error: 'Unable to analyze this job description right now' });
    }
  });

  router.post('/roles/search', limitSearchAi, async (request, response) => {
    const { query } = request.body ?? {};
    if (typeof query !== 'string' || !query.trim() || query.trim().length > 1_000) {
      return response.status(400).json({ error: 'query must contain 1 to 1,000 characters' });
    }
    const page = pagination(request);
    if (!page) return response.status(400).json({ error: 'limit and offset must be valid non-negative integers' });
    let criteria: SearchCriteria;
    try {
      criteria = await parseSearchIntent(query.trim());
    } catch {
      return response.status(502).json({ error: 'Unable to understand this job search right now' });
    }
    const filters: RoleFilters = {
      titleTerms: criteria.titleTerms,
      location: criteria.workMode === 'remote' && criteria.eligibleCountry ? null : criteria.location,
      workMode: criteria.workMode,
      minimumSalary: criteria.minimumSalary,
      salaryCurrency: criteria.salaryCurrency,
      salaryPeriod: criteria.salaryPeriod,
      minimumExperienceMonths: criteria.minimumExperienceMonths,
      skills: criteria.skills,
      eligibleCountry: criteria.eligibleCountry,
    };
    try {
      return response.json({ ...(await listRoles(filters, page.limit, page.offset)), criteria, appliedFilters: filters });
    } catch {
      return response.status(503).json({ status: 'not_ready', database: 'unavailable' });
    }
  });

  router.get('/roles', async (request, response) => {
    const page = pagination(request);
    const search = queryString(request, 'search', 120);
    const location = queryString(request, 'location', 120);
    const workMode = queryString(request, 'workMode', 20);
    const currency = queryString(request, 'currency', 3);
    const period = queryString(request, 'period', 40);
    const eligibleCountry = queryString(request, 'eligibleCountry', 80);
    const minimumSalary = queryNumber(request, 'minimumSalary');
    const minimumExperienceMonths = queryNumber(request, 'minimumExperienceMonths', 600, true);
    if (
      !page || search.invalid || location.invalid || workMode.invalid || currency.invalid || period.invalid ||
      eligibleCountry.invalid || minimumSalary.invalid || minimumExperienceMonths.invalid ||
      (workMode.value !== null && !['remote', 'hybrid', 'onsite'].includes(workMode.value)) ||
      (currency.value !== null && !/^[A-Z]{3}$/.test(currency.value)) ||
      (period.value !== null && !['hourly', 'daily', 'weekly', 'monthly', 'yearly', 'annual', 'contract'].includes(period.value.toLowerCase())) ||
      ((minimumSalary.value !== null) !== (currency.value !== null))
    ) return response.status(400).json({ error: 'Invalid role filters' });
    const filters: RoleFilters = {
      search: search.value,
      location: location.value,
      workMode: workMode.value as WorkMode | null,
      minimumSalary: minimumSalary.value,
      salaryCurrency: currency.value,
      salaryPeriod: period.value,
      minimumExperienceMonths: minimumExperienceMonths.value,
      eligibleCountry: eligibleCountry.value,
    };
    try {
      return response.json(await listRoles(filters, page.limit, page.offset));
    } catch {
      return response.status(503).json({ status: 'not_ready', database: 'unavailable' });
    }
  });

  router.get('/roles/:id', async (request, response) => {
    const id = request.params.id;
    if (typeof id !== 'string' || !/^[1-9]\d*$/.test(id)) return response.status(400).json({ error: 'A valid role ID is required' });
    try {
      const [rows] = await db.execute<RoleRow[]>(
        `SELECT id, source_type, source_name, source_url, title, company_name, employment_type,
                location, work_mode, salary_min, salary_max, salary_currency, salary_period,
                minimum_experience_months, eligible_countries, skills, application_url,
                application_email, description, status, created_at, published_at
         FROM roles WHERE id = ? AND status = 'published' AND ${CURRENT_JOBICY_ROLE}`,
        [id],
      );
      if (!rows[0]) return response.status(404).json({ error: 'Role not found' });
      const role = mapRole(rows[0], true);
      return response.json(role);
    } catch {
      return response.status(503).json({ status: 'not_ready', database: 'unavailable' });
    }
  });

  router.post('/roles/submissions', limitSubmissions, async (request, response) => {
    const submission = validateSubmission(request.body);
    if (!submission) return response.status(400).json({ error: 'Complete the required job details and provide an HTTP(S) application link or email' });
    try {
      const [result] = await db.execute<ResultSetHeader>(
        `INSERT INTO roles (
          source_type, source_name, source_url, title, company_name, employment_type, location,
          work_mode, salary_min, salary_max, salary_currency, salary_period,
          minimum_experience_months, eligible_countries, skills, application_url,
          application_email, description, status
        ) VALUES ('recruiter', 'Recruiter submitted', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [
          submission.sourceUrl,
          submission.title,
          submission.companyName,
          submission.employmentType,
          submission.location,
          submission.workMode,
          submission.salaryMin,
          submission.salaryMax,
          submission.salaryCurrency,
          submission.salaryPeriod,
          submission.minimumExperienceMonths,
          submission.eligibleCountries === null ? null : JSON.stringify(submission.eligibleCountries),
          JSON.stringify(submission.skills),
          submission.applicationUrl,
          submission.applicationEmail,
          submission.description,
        ],
      );
      return response.status(201).json({ id: String(result.insertId), status: 'pending' });
    } catch {
      return response.status(503).json({ status: 'not_ready', database: 'unavailable' });
    }
  });

  router.get('/staff/roles', requireStaff, async (request, response) => {
    const statusFilter = queryString(request, 'status', 20);
    if (statusFilter.invalid) return response.status(400).json({ error: 'Invalid role status' });
    const status = statusFilter.value ?? 'pending';
    if (!['pending', 'published', 'closed'].includes(status)) return response.status(400).json({ error: 'Invalid role status' });
    try {
      const [rows] = await db.execute<RoleRow[]>(
        `SELECT id, source_type, source_name, source_url, title, company_name, employment_type,
                location, work_mode, salary_min, salary_max, salary_currency, salary_period,
                minimum_experience_months, eligible_countries, skills, application_url,
                application_email, description, status, created_at, published_at
         FROM roles WHERE status = ? ORDER BY created_at DESC, id DESC LIMIT 100`,
        [status],
      );
      return response.json({ roles: rows.map((row) => mapRole(row, true, true)) });
    } catch {
      return response.status(503).json({ status: 'not_ready', database: 'unavailable' });
    }
  });

  router.patch('/staff/roles/:id', requireStaff, async (request, response) => {
    const id = request.params.id;
    const { status } = request.body ?? {};
    if (typeof id !== 'string' || !/^[1-9]\d*$/.test(id)) return response.status(400).json({ error: 'A valid role ID is required' });
    if (status !== 'published' && status !== 'closed') return response.status(400).json({ error: 'status must be published or closed' });
    try {
      await db.execute(
        `UPDATE roles
         SET published_at = CASE WHEN ? = 'published' AND status <> 'published' THEN UTC_TIMESTAMP() ELSE published_at END,
             status = ?
         WHERE id = ?`,
        [status, status, id],
      );
      const [rows] = await db.execute<RoleRow[]>(
        `SELECT id, source_type, source_name, source_url, title, company_name, employment_type,
                location, work_mode, salary_min, salary_max, salary_currency, salary_period,
                minimum_experience_months, eligible_countries, skills, application_url,
                application_email, description, status, created_at, published_at
         FROM roles WHERE id = ?`,
        [id],
      );
      if (!rows[0]) return response.status(404).json({ error: 'Role not found' });
      return response.json(mapRole(rows[0], true, true));
    } catch {
      return response.status(503).json({ status: 'not_ready', database: 'unavailable' });
    }
  });

  return router;
}
