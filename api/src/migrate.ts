import { readFile } from 'node:fs/promises';
import { db } from './db.js';

const migrations = [
  '008_create_budget_reports.sql',
  '009_seed_budget_report.sql',
  '010_add_budget_period_metadata.sql',
];

try {
  for (const migration of migrations) {
    const sql = await readFile(new URL(`../sql/${migration}`, import.meta.url), 'utf8');
    await db.query(sql);
  }

  console.log('Database schema is ready.');
} finally {
  await db.end();
}
