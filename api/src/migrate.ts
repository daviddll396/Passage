import { readFile } from 'node:fs/promises';
import type { RowDataPacket } from 'mysql2';
import { db } from './db.js';

try {
  const schema = await readFile(new URL('../sql/001_create_requests.sql', import.meta.url), 'utf8');
  await db.query(schema);

  const [columns] = await db.query("SHOW COLUMNS FROM requests LIKE 'summary'");
  if (Array.isArray(columns) && columns.length === 0) {
    const summaryMigration = await readFile(new URL('../sql/002_add_summary.sql', import.meta.url), 'utf8');
    await db.query(summaryMigration);
  }

  const usersSchema = await readFile(new URL('../sql/003_create_users.sql', import.meta.url), 'utf8');
  await db.query(usersSchema);

  const sessionsSchema = await readFile(new URL('../sql/004_create_sessions.sql', import.meta.url), 'utf8');
  await db.query(sessionsSchema);

  const rolesSchema = await readFile(new URL('../sql/005_create_roles.sql', import.meta.url), 'utf8');
  await db.query(rolesSchema);

  const roleSyncSchema = await readFile(new URL('../sql/006_create_role_sync_state.sql', import.meta.url), 'utf8');
  await db.query(roleSyncSchema);

  const [lastSeenColumns] = await db.query<RowDataPacket[]>("SHOW COLUMNS FROM roles LIKE 'last_seen_at'");
  if (Array.isArray(lastSeenColumns) && lastSeenColumns.length === 0) {
    const freshnessMigration = await readFile(new URL('../sql/007_track_jobicy_freshness.sql', import.meta.url), 'utf8');
    await db.query(freshnessMigration);
    await db.execute("UPDATE role_sync_state SET synced_at = '1970-01-01 00:00:00' WHERE source_name = 'jobicy'");
  } else if (
    !Array.isArray(lastSeenColumns) || lastSeenColumns[0]?.Type?.toLowerCase() !== 'datetime' ||
    lastSeenColumns[0]?.Null !== 'YES'
  ) {
    throw new Error('roles.last_seen_at must be nullable DATETIME');
  }

  const budgetReportsSchema = await readFile(new URL('../sql/008_create_budget_reports.sql', import.meta.url), 'utf8');
  await db.query(budgetReportsSchema);

  const budgetReportSeed = await readFile(new URL('../sql/009_seed_budget_report.sql', import.meta.url), 'utf8');
  await db.query(budgetReportSeed);

  const [sessionColumns] = await db.query<RowDataPacket[]>('SHOW COLUMNS FROM sessions');
  const expectedSessionColumns = [
    ['token_hash', 'binary(32)', 'NO'],
    ['user_id', 'bigint unsigned', 'NO'],
    ['expires_at', 'datetime', 'NO'],
  ];
  for (const [name, type, nullable] of expectedSessionColumns) {
    const column = Array.isArray(sessionColumns) ? sessionColumns.find((entry) => entry.Field === name) : undefined;
    if (column?.Type?.toLowerCase() !== type || column?.Null !== nullable) {
      throw new Error(`sessions.${name} must be ${type} ${nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    }
  }

  const [sessionPrimaryKey] = await db.query<RowDataPacket[]>(
    "SHOW INDEX FROM sessions WHERE Key_name = 'PRIMARY'",
  );
  if (
    !Array.isArray(sessionPrimaryKey) || sessionPrimaryKey.length !== 1 ||
    sessionPrimaryKey[0]?.Column_name !== 'token_hash' || sessionPrimaryKey[0]?.Seq_in_index !== 1
  ) {
    throw new Error('sessions.token_hash must be the sole primary key');
  }

  const [sessionIndexes] = await db.query<RowDataPacket[]>(
    "SHOW INDEX FROM sessions WHERE Key_name = 'idx_sessions_user_expiry'",
  );
  if (Array.isArray(sessionIndexes) && sessionIndexes.length === 0) {
    await db.query('CREATE INDEX idx_sessions_user_expiry ON sessions (user_id, expires_at)');
  } else if (
    !Array.isArray(sessionIndexes) || sessionIndexes.length !== 2 ||
    !sessionIndexes.some((index) => index.Column_name === 'user_id' && index.Seq_in_index === 1) ||
    !sessionIndexes.some((index) => index.Column_name === 'expires_at' && index.Seq_in_index === 2)
  ) {
    throw new Error('idx_sessions_user_expiry must contain user_id, expires_at in that order');
  }

  const [sessionForeignKeys] = await db.query<RowDataPacket[]>(
    `SELECT kcu.CONSTRAINT_NAME, kcu.REFERENCED_TABLE_NAME, kcu.REFERENCED_COLUMN_NAME, rc.DELETE_RULE
     FROM information_schema.KEY_COLUMN_USAGE AS kcu
     JOIN information_schema.REFERENTIAL_CONSTRAINTS AS rc
       ON rc.CONSTRAINT_SCHEMA = kcu.CONSTRAINT_SCHEMA
       AND rc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
     WHERE kcu.TABLE_SCHEMA = DATABASE()
       AND kcu.TABLE_NAME = 'sessions'
       AND kcu.COLUMN_NAME = 'user_id'`,
  );
  const sessionForeignKey = Array.isArray(sessionForeignKeys)
    ? sessionForeignKeys.find((key) =>
      key.REFERENCED_TABLE_NAME === 'users' &&
      key.REFERENCED_COLUMN_NAME === 'id' &&
      key.DELETE_RULE === 'CASCADE',
    )
    : undefined;
  if (Array.isArray(sessionForeignKeys) && sessionForeignKeys.length === 0) {
    await db.query(
      `ALTER TABLE sessions
       ADD CONSTRAINT fk_sessions_user
       FOREIGN KEY (user_id) REFERENCES users(id)
       ON DELETE CASCADE`,
    );
  } else if (!Array.isArray(sessionForeignKeys) || sessionForeignKeys.length !== 1 || !sessionForeignKey) {
    throw new Error('sessions.user_id must reference users.id with ON DELETE CASCADE');
  }

  const [residentColumns] = await db.query<RowDataPacket[]>("SHOW COLUMNS FROM requests LIKE 'resident_id'");
  if (Array.isArray(residentColumns) && residentColumns.length === 0) {
    await db.query('ALTER TABLE requests ADD COLUMN resident_id BIGINT UNSIGNED NULL AFTER location');
  } else if (
    !Array.isArray(residentColumns) ||
    residentColumns[0]?.Type !== 'bigint unsigned' ||
    residentColumns[0]?.Null !== 'YES'
  ) {
    throw new Error('requests.resident_id must be nullable BIGINT UNSIGNED');
  }

  const [residentIndexes] = await db.query<RowDataPacket[]>(
    "SHOW INDEX FROM requests WHERE Key_name = 'idx_requests_resident_created'",
  );
  if (Array.isArray(residentIndexes) && residentIndexes.length === 0) {
    await db.query('CREATE INDEX idx_requests_resident_created ON requests (resident_id, created_at)');
  } else if (
    !Array.isArray(residentIndexes) ||
    residentIndexes.length !== 2 ||
    !residentIndexes.some((index) => index.Column_name === 'resident_id' && index.Seq_in_index === 1) ||
    !residentIndexes.some((index) => index.Column_name === 'created_at' && index.Seq_in_index === 2)
  ) {
    throw new Error('idx_requests_resident_created must contain resident_id, created_at in that order');
  }

  const [residentForeignKeys] = await db.query<RowDataPacket[]>(
    `SELECT kcu.CONSTRAINT_NAME, kcu.REFERENCED_TABLE_NAME, kcu.REFERENCED_COLUMN_NAME, rc.DELETE_RULE
     FROM information_schema.KEY_COLUMN_USAGE AS kcu
     JOIN information_schema.REFERENTIAL_CONSTRAINTS AS rc
       ON rc.CONSTRAINT_SCHEMA = kcu.CONSTRAINT_SCHEMA
       AND rc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
     WHERE kcu.TABLE_SCHEMA = DATABASE()
       AND kcu.TABLE_NAME = 'requests'
       AND kcu.COLUMN_NAME = 'resident_id'`,
  );
  const residentForeignKey = Array.isArray(residentForeignKeys)
    ? residentForeignKeys.find((key) =>
      key.REFERENCED_TABLE_NAME === 'users' &&
      key.REFERENCED_COLUMN_NAME === 'id' &&
      key.DELETE_RULE === 'SET NULL',
    )
    : undefined;
  if (Array.isArray(residentForeignKeys) && residentForeignKeys.length === 0) {
    await db.query(
      `ALTER TABLE requests
       ADD CONSTRAINT fk_requests_resident
       FOREIGN KEY (resident_id) REFERENCES users(id)
       ON DELETE SET NULL`,
    );
  } else if (!Array.isArray(residentForeignKeys) || residentForeignKeys.length !== 1 || !residentForeignKey) {
    throw new Error('requests.resident_id must reference users.id with ON DELETE SET NULL');
  }

  console.log('Database schema is ready.');
} finally {
  await db.end();
}
