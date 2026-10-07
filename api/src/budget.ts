import { createHash, randomBytes } from 'node:crypto';
import express from 'express';
import type { Request, Response } from 'express';
import type { RowDataPacket } from 'mysql2';
import { db } from './db.js';
import { answerBudgetQuestion, answerBudgetQuestionFromPdf, extractBudgetReport } from './budget-ai.js';
import type { BudgetEvidence, BudgetMetric, BudgetReport } from './budget-ai.js';

const PDF_LIMIT = 8 * 1024 * 1024;
const UPLOAD_TTL_MS = 30 * 60 * 1000;
const MAX_TEMP_REPORTS = 200;

interface BudgetRow extends RowDataPacket {
  id: string;
  title: string;
  organization: string;
  period: string;
  summary: string;
  source_name: string;
  source_url: string;
  metrics: unknown;
  evidence: unknown;
  published_at: Date | string;
}

interface TemporaryReport {
  report: Omit<BudgetReport, 'id'>;
  pdfDigest: string;
  expiresAt: number;
}

type PublicReportSummary = Omit<BudgetReport, 'evidence'> & {
  sourceName: string;
  sourceUrl: string;
  publishedAt: string | null;
};

type PublicReportDetail = PublicReportSummary & { evidence: BudgetEvidence[] };

const temporaryReports = new Map<string, TemporaryReport>();
// ponytail: temporary uploads stay on one process; use shared TTL storage if the API runs on multiple instances.

function createRateLimiter(maximum: number, windowMs: number) {
  const buckets = new Map<string, { count: number; resetsAt: number }>();
  return (request: Request, response: Response, next: express.NextFunction) => {
    const now = Date.now();
    const key = request.ip || request.socket.remoteAddress || 'unknown';
    let bucket = buckets.get(key);
    if (!bucket || bucket.resetsAt <= now) {
      bucket = { count: 0, resetsAt: now + windowMs };
      buckets.set(key, bucket);
      // ponytail: per-process limits are enough for the local demo; use shared storage if the API scales out.
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

function parseJsonArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function dateString(value: Date | string | null | undefined) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
}

function reportFromRow(row: BudgetRow, includeEvidence: true): PublicReportDetail;
function reportFromRow(row: BudgetRow, includeEvidence?: false): PublicReportSummary;
function reportFromRow(row: BudgetRow, includeEvidence = false): PublicReportSummary | PublicReportDetail {
  const report: PublicReportSummary = {
    id: row.id,
    title: row.title,
    organization: row.organization,
    period: row.period,
    summary: row.summary,
    sourceName: row.source_name,
    sourceUrl: row.source_url,
    publishedAt: dateString(row.published_at),
    metrics: parseJsonArray(row.metrics) as BudgetMetric[],
  };
  return includeEvidence ? { ...report, evidence: parseJsonArray(row.evidence) as BudgetEvidence[] } : report;
}

function pruneTemporaryReports() {
  const now = Date.now();
  for (const [id, value] of temporaryReports) {
    if (value.expiresAt <= now) temporaryReports.delete(id);
  }
}

function validQuestion(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.trim().length <= 1_000;
}

function validPdf(request: Request, value: unknown): value is Buffer {
  return request.is('application/pdf') === 'application/pdf' && Buffer.isBuffer(value) && value.length >= 8 &&
    value.subarray(0, 5).toString('ascii') === '%PDF-';
}

function logBudgetFailure(action: string, error: unknown) {
  const reason = error instanceof Error ? error.message : 'unknown error';
  console.error(`[Passage] ${action} failed: ${reason}`);
}

async function findPublishedReport(id: string) {
  const [rows] = await db.execute<BudgetRow[]>(
    `SELECT id, title, organization, period, summary, source_name, source_url,
            metrics, evidence, published_at
     FROM budget_reports WHERE id = ? AND published_at IS NOT NULL`,
    [id],
  );
  return rows[0] ?? null;
}

export function createBudgetRoutes() {
  const router = express.Router();
  const limitUploads = createRateLimiter(3, 10 * 60_000);
  const limitQuestions = createRateLimiter(12, 60_000);
  const limitSourceQuestions = createRateLimiter(4, 60_000);

  router.get('/reports', async (_request, response) => {
    try {
      const [rows] = await db.execute<BudgetRow[]>(
        `SELECT id, title, organization, period, summary, source_name, source_url,
                metrics, evidence, published_at
         FROM budget_reports WHERE published_at IS NOT NULL
         ORDER BY published_at DESC, id LIMIT 100`,
      );
      return response.json({ reports: rows.map((row) => reportFromRow(row)) });
    } catch {
      return response.status(503).json({ status: 'not_ready', database: 'unavailable' });
    }
  });

  router.get('/reports/:id', async (request, response) => {
    const id = request.params.id;
    if (typeof id !== 'string' || !/^[a-z0-9-]{1,80}$/i.test(id)) {
      return response.status(400).json({ error: 'A valid report ID is required' });
    }
    try {
      const row = await findPublishedReport(id);
      if (!row) return response.status(404).json({ error: 'Report not found' });
      return response.json({ report: reportFromRow(row, true) });
    } catch {
      return response.status(503).json({ status: 'not_ready', database: 'unavailable' });
    }
  });

  router.post('/uploads', limitUploads, express.raw({ type: 'application/pdf', limit: PDF_LIMIT }), async (request, response) => {
    const pdf: unknown = request.body;
    if (!validPdf(request, pdf)) {
      return response.status(400).json({ error: 'Upload a valid PDF file up to 8 MB' });
    }

    try {
      const extracted = await extractBudgetReport(pdf);
      pruneTemporaryReports();
      if (temporaryReports.size >= MAX_TEMP_REPORTS) {
        const oldest = temporaryReports.keys().next().value;
        if (oldest) temporaryReports.delete(oldest);
      }
      const uploadId = randomBytes(24).toString('base64url');
      temporaryReports.set(uploadId, {
        report: extracted,
        pdfDigest: createHash('sha256').update(pdf).digest('hex'),
        expiresAt: Date.now() + UPLOAD_TTL_MS,
      });
      return response.status(201).json({
        uploadId,
        report: {
          id: uploadId,
          ...extracted,
          sourceName: 'Your document',
          sourceUrl: null,
          publishedAt: null,
        },
      });
    } catch (error) {
      logBudgetFailure('PDF extraction', error);
      return response.status(502).json({ error: 'Unable to extract cited information from this document right now' });
    }
  });

  router.post('/reports/:id/ask', limitQuestions, async (request, response) => {
    const id = request.params.id;
    const question = request.body?.question;
    if (!validQuestion(question)) return response.status(400).json({ error: 'question must contain 1 to 1,000 characters' });
    if (typeof id !== 'string' || !/^[a-z0-9-]{1,80}$/i.test(id)) return response.status(400).json({ error: 'A valid report ID is required' });
    try {
      const row = await findPublishedReport(id);
      if (!row) return response.status(404).json({ error: 'Report not found' });
      const report = reportFromRow(row, true);
      const answer = await answerBudgetQuestion(question.trim(), report);
      return response.json(answer);
    } catch (error) {
      logBudgetFailure('Published report Q&A', error);
      return response.status(502).json({ error: 'Unable to answer from this document right now' });
    }
  });

  router.post('/uploads/:uploadId/ask', limitQuestions, async (request, response) => {
    const uploadId = request.params.uploadId;
    const question = request.body?.question;
    if (!validQuestion(question)) return response.status(400).json({ error: 'question must contain 1 to 1,000 characters' });
    if (typeof uploadId !== 'string' || !/^[A-Za-z0-9_-]{32}$/.test(uploadId)) return response.status(400).json({ error: 'A valid upload ID is required' });
    pruneTemporaryReports();
    const temporary = temporaryReports.get(uploadId);
    if (!temporary) return response.status(404).json({ error: 'This upload has expired. Upload the PDF again to continue.' });
    try {
      return response.json(await answerBudgetQuestion(question.trim(), temporary.report));
    } catch (error) {
      logBudgetFailure('Uploaded report Q&A', error);
      return response.status(502).json({ error: 'Unable to answer from this document right now' });
    }
  });

  router.post('/uploads/:uploadId/ask-source', limitSourceQuestions, express.raw({ type: 'application/pdf', limit: PDF_LIMIT }), async (request, response) => {
    const uploadId = request.params.uploadId;
    const question = request.get('X-Passage-Question');
    const pdf: unknown = request.body;
    if (!validQuestion(question)) return response.status(400).json({ error: 'X-Passage-Question must contain 1 to 1,000 characters' });
    if (typeof uploadId !== 'string' || !/^[A-Za-z0-9_-]{32}$/.test(uploadId)) return response.status(400).json({ error: 'A valid upload ID is required' });
    if (!validPdf(request, pdf)) return response.status(400).json({ error: 'Upload a valid PDF file up to 8 MB' });
    pruneTemporaryReports();
    const temporary = temporaryReports.get(uploadId);
    if (!temporary) return response.status(404).json({ error: 'This upload has expired. Upload the PDF again to continue.' });
    if (createHash('sha256').update(pdf).digest('hex') !== temporary.pdfDigest) {
      return response.status(400).json({ error: 'This PDF does not match the uploaded document' });
    }
    try {
      return response.json(await answerBudgetQuestionFromPdf(question.trim(), pdf));
    } catch (error) {
      logBudgetFailure('Uploaded PDF source Q&A', error);
      return response.status(502).json({ error: 'Unable to answer from this document right now' });
    }
  });

  router.use((error: unknown, _request: Request, response: Response, next: express.NextFunction) => {
    if (isRecord(error) && error.type === 'entity.too.large') {
      return response.status(413).json({ error: 'PDF must be 8 MB or smaller' });
    }
    return next(error);
  });

  return router;
}
