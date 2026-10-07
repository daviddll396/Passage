import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import type { ResultSetHeader } from 'mysql2';
import type { PoolConnection, RowDataPacket } from 'mysql2/promise';
import type { NextFunction, Request, Response } from 'express';
import { db } from './db.js';

const SESSION_COOKIE = 'civicdesk_session';
const SESSION_MAX_AGE = 7 * 24 * 60 * 60;
const SCRYPT_OPTIONS = { N: 16_384, r: 8, p: 1, maxmem: 32 * 1024 * 1024 };
const SCRYPT_KEY_LENGTH = 64;

export type UserRole = 'resident' | 'staff';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface UserRow extends RowDataPacket {
  id: string | number;
  name: string;
  email: string;
  password_hash?: string;
  role: UserRole;
}

function deriveKey(password: string, salt: Buffer) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, SCRYPT_KEY_LENGTH, SCRYPT_OPTIONS, (error, key) => {
      if (error) reject(error);
      else resolve(key as Buffer);
    });
  });
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const digest = await deriveKey(password, salt);
  return `scrypt$v1$16384$8$1$${salt.toString('base64url')}$${digest.toString('base64url')}`;
}

async function verifyPassword(password: string, encoded: string) {
  const [algorithm, version, cost, blockSize, parallelism, saltText, digestText, ...extra] = encoded.split('$');
  if (
    algorithm !== 'scrypt' || version !== 'v1' || cost !== '16384' || blockSize !== '8' ||
    parallelism !== '1' || !saltText || !digestText || extra.length > 0
  ) return false;

  const salt = Buffer.from(saltText, 'base64url');
  const expected = Buffer.from(digestText, 'base64url');
  if (
    salt.length !== 16 || expected.length !== SCRYPT_KEY_LENGTH ||
    salt.toString('base64url') !== saltText || expected.toString('base64url') !== digestText
  ) return false;

  const actual = await deriveKey(password, salt);
  return timingSafeEqual(actual, expected);
}

function publicUser(row: UserRow): SessionUser {
  return { id: String(row.id), name: row.name, email: row.email, role: row.role };
}

function readSessionToken(request: Request) {
  const cookies = request.get('cookie')?.split(';') ?? [];
  const cookie = cookies.map((part) => part.trim()).find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  const token = cookie?.slice(SESSION_COOKIE.length + 1);
  return token && /^[A-Za-z0-9_-]{43}$/.test(token) ? token : null;
}

function hashSessionToken(token: string) {
  return createHash('sha256').update(token).digest();
}

function setSessionCookie(response: Response, token: string) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  response.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_MAX_AGE}${secure}`,
  );
}

function clearSessionCookie(response: Response) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  response.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure}`,
  );
}

async function createSession(connection: PoolConnection, userId: string) {
  await connection.execute('DELETE FROM sessions WHERE expires_at <= UTC_TIMESTAMP()');
  const token = randomBytes(32).toString('base64url');
  await connection.execute(
    `INSERT INTO sessions (token_hash, user_id, expires_at)
     VALUES (?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL 7 DAY))`,
    [hashSessionToken(token), userId],
  );
  return token;
}

async function findSessionUser(token: string): Promise<SessionUser | null> {
  const [rows] = await db.execute<UserRow[]>(
    `SELECT users.id, users.name, users.email, users.role
     FROM sessions
     JOIN users ON users.id = sessions.user_id
     WHERE sessions.token_hash = ? AND sessions.expires_at > UTC_TIMESTAMP()`,
    [hashSessionToken(token)],
  );
  return rows[0] ? publicUser(rows[0]) : null;
}

function validEmail(email: unknown): email is string {
  return typeof email === 'string' && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validPassword(password: unknown, allowShort = false): password is string {
  if (typeof password !== 'string' || password.length > 128) return false;
  const length = [...password].length;
  return length <= 128 && (allowShort ? length > 0 : length >= 15);
}

function isDuplicateEmail(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'ER_DUP_ENTRY';
}

export async function registerResident(request: Request, response: Response) {
  const { name, email, password } = request.body ?? {};
  if (
    typeof name !== 'string' || !name.trim() || name.trim().length > 100 ||
    !validEmail(email) || !validPassword(password)
  ) {
    return response.status(400).json({ error: 'Enter a name, valid email, and password of at least 15 characters' });
  }

  const cleanEmail = email.trim().toLowerCase();
  let connection: PoolConnection | undefined;
  try {
    const passwordHash = await hashPassword(password);
    connection = await db.getConnection();
    await connection.beginTransaction();
    const [result] = await connection.execute<ResultSetHeader>(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, \'resident\')',
      [name.trim(), cleanEmail, passwordHash],
    );
    const userId = String(result.insertId);
    const user = { id: userId, name: name.trim(), email: cleanEmail, role: 'resident' as const };
    const token = await createSession(connection, userId);
    await connection.commit();
    setSessionCookie(response, token);
    return response.status(201).json({ user });
  } catch (error) {
    if (connection) await connection.rollback().catch(() => undefined);
    if (isDuplicateEmail(error)) return response.status(409).json({ error: 'An account with this email already exists' });
    return response.status(503).json({ status: 'not_ready', database: 'unavailable' });
  } finally {
    connection?.release();
  }
}

export async function login(request: Request, response: Response) {
  const { email, password } = request.body ?? {};
  if (!validEmail(email) || !validPassword(password, true)) {
    return response.status(400).json({ error: 'Enter a valid email and password' });
  }

  try {
    const cleanEmail = email.trim().toLowerCase();
    const [rows] = await db.execute<UserRow[]>(
      'SELECT id, name, email, password_hash, role FROM users WHERE email = ?',
      [cleanEmail],
    );
    const row = rows[0];
    const matches = row
      ? await verifyPassword(password, row.password_hash ?? '')
      : timingSafeEqual(await deriveKey(password, Buffer.alloc(16, 1)), Buffer.alloc(SCRYPT_KEY_LENGTH));
    if (!row || !matches) return response.status(401).json({ error: 'Invalid email or password' });

    const connection = await db.getConnection();
    try {
      const token = await createSession(connection, String(row.id));
      setSessionCookie(response, token);
      return response.json({ user: publicUser(row) });
    } finally {
      connection.release();
    }
  } catch {
    return response.status(503).json({ status: 'not_ready', database: 'unavailable' });
  }
}

export async function currentUser(request: Request, response: Response) {
  const token = readSessionToken(request);
  if (!token) return response.status(401).json({ error: 'Authentication required' });
  try {
    const user = await findSessionUser(token);
    if (!user) return response.status(401).json({ error: 'Authentication required' });
    return response.json({ user });
  } catch {
    return response.status(503).json({ status: 'not_ready', database: 'unavailable' });
  }
}

export async function requireStaff(request: Request, response: Response, next: NextFunction) {
  const token = readSessionToken(request);
  if (!token) return response.status(401).json({ error: 'Authentication required' });
  try {
    const user = await findSessionUser(token);
    if (!user) return response.status(401).json({ error: 'Authentication required' });
    if (user.role !== 'staff') return response.status(403).json({ error: 'Staff access required' });
    return next();
  } catch {
    return response.status(503).json({ status: 'not_ready', database: 'unavailable' });
  }
}

export async function logout(request: Request, response: Response) {
  const token = readSessionToken(request);
  try {
    if (token) await db.execute('DELETE FROM sessions WHERE token_hash = ?', [hashSessionToken(token)]);
    clearSessionCookie(response);
    return response.sendStatus(204);
  } catch {
    clearSessionCookie(response);
    return response.status(503).json({ status: 'not_ready', database: 'unavailable' });
  }
}
