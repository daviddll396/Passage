import test from 'node:test';
import assert from 'node:assert/strict';
import { closeDatabase, db } from '../src/db.ts';

test('stores user identities and allows reports to have no resident owner', async (t) => {
  const email = `schema-check-${Date.now()}@example.test`;
  const linkedTitle = `Linked report ${Date.now()}`;
  const unownedTitle = `Unowned report ${Date.now()}`;
  t.after(async () => {
    await db.execute('DELETE FROM requests WHERE title IN (?, ?)', [linkedTitle, unownedTitle]);
    await db.execute('DELETE FROM users WHERE email = ?', [email]);
    await closeDatabase();
  });

  const [userTables] = await db.query("SHOW TABLES LIKE 'users'");
  assert.equal(userTables.length, 1, 'users table should exist');

  const [userColumns] = await db.query('SHOW COLUMNS FROM users');
  const userId = userColumns.find((column) => column.Field === 'id');
  const role = userColumns.find((column) => column.Field === 'role');
  assert.equal(userId.Type, 'bigint unsigned');
  assert.equal(role.Type, "enum('resident','staff')");

  const [requestColumns] = await db.query("SHOW COLUMNS FROM requests LIKE 'resident_id'");
  assert.equal(requestColumns.length, 1, 'requests should have a resident_id column');
  assert.equal(requestColumns[0].Type, 'bigint unsigned');
  assert.equal(requestColumns[0].Null, 'YES');

  const [requestIndexes] = await db.query(
    "SHOW INDEX FROM requests WHERE Key_name = 'idx_requests_resident_created'",
  );
  assert.deepEqual(
    requestIndexes
      .map((index) => [index.Column_name, index.Seq_in_index])
      .sort((a, b) => a[1] - b[1]),
    [['resident_id', 1], ['created_at', 2]],
    'resident request lookup should use the expected index order',
  );

  const [foreignKeys] = await db.execute(
    `SELECT CONSTRAINT_NAME
     FROM information_schema.KEY_COLUMN_USAGE
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'requests'
       AND COLUMN_NAME = 'resident_id'
       AND REFERENCED_TABLE_NAME = 'users'
       AND REFERENCED_COLUMN_NAME = 'id'`,
  );
  assert.equal(foreignKeys.length, 1, 'resident_id should reference users.id');

  const [userResult] = await db.execute(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    ['Schema Check', email, 'test-only-hash', 'resident'],
  );
  await db.execute(
    'INSERT INTO requests (title, description, location, resident_id) VALUES (?, ?, ?, ?)',
    [linkedTitle, 'A linked test report.', 'Yaba', userResult.insertId],
  );
  await db.execute(
    'INSERT INTO requests (title, description, location) VALUES (?, ?, ?)',
    [unownedTitle, 'An unowned legacy-style report.', 'Yaba'],
  );

  await db.execute('DELETE FROM users WHERE id = ?', [userResult.insertId]);
  const [linkedReports] = await db.execute('SELECT resident_id FROM requests WHERE title = ?', [linkedTitle]);
  const [unownedReports] = await db.execute('SELECT resident_id FROM requests WHERE title = ?', [unownedTitle]);
  assert.equal(linkedReports[0]?.resident_id, null, 'deleting a user should keep their report unowned');
  assert.equal(unownedReports[0]?.resident_id, null, 'reports may remain unowned');
});
