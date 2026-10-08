import mysql from 'mysql2/promise';
import { readFileSync } from 'node:fs';

export const db = mysql.createPool({
  ...(process.env.DB_SOCKET_PATH
    ? { socketPath: process.env.DB_SOCKET_PATH }
    : { host: process.env.DB_HOST, port: Number(process.env.DB_PORT ?? 3306) }),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ...(process.env.DB_SSL_CA_PATH ? {
    ssl: { ca: readFileSync(process.env.DB_SSL_CA_PATH, 'utf8'), rejectUnauthorized: true },
  } : {}),
});

export async function checkDatabase() {
  await db.query('SELECT 1');
}

export function closeDatabase() {
  return db.end();
}
