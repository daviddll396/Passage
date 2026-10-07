import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.ts';
import { closeDatabase, db } from '../src/db.ts';

const frontendOrigin = 'http://127.0.0.1:3000';

test('resident registration, login, current-user lookup, and logout use a private session cookie', async (t) => {
  const email = `auth-test-${Date.now()}@example.test`;
  const password = 'correct-horse-battery-staple-42';
  const server = createApp().listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    const [sessionTables] = await db.query("SHOW TABLES LIKE 'sessions'");
    if (sessionTables.length > 0) {
      await db.execute(
        'DELETE FROM sessions WHERE user_id IN (SELECT id FROM users WHERE email = ?)',
        [email],
      );
    }
    await db.execute('DELETE FROM users WHERE email = ?', [email]);
    await closeDatabase();
  });

  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const registerResponse = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { Origin: frontendOrigin, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test Resident', email, password, role: 'staff' }),
  });
  assert.equal(registerResponse.status, 201);

  const registration = await registerResponse.json();
  assert.deepEqual(Object.keys(registration.user).sort(), ['email', 'id', 'name', 'role']);
  assert.equal(registration.user.role, 'resident');
  assert.equal(JSON.stringify(registration).includes(password), false);

  const firstSetCookie = registerResponse.headers.get('set-cookie');
  assert.match(firstSetCookie, /HttpOnly/i);
  assert.match(firstSetCookie, /SameSite=Lax/i);
  assert.match(firstSetCookie, /Path=\//i);
  const firstCookie = firstSetCookie.split(';', 1)[0];
  const firstToken = firstCookie.slice(firstCookie.indexOf('=') + 1);

  const [storedUsers] = await db.execute('SELECT password_hash FROM users WHERE email = ?', [email]);
  assert.notEqual(storedUsers[0].password_hash, password);
  assert.match(storedUsers[0].password_hash, /^scrypt\$v1\$/);

  const meResponse = await fetch(`${baseUrl}/auth/me`, { headers: { Cookie: firstCookie } });
  assert.equal(meResponse.status, 200);
  assert.equal((await meResponse.json()).user.email, email);

  const duplicateResponse = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { Origin: frontendOrigin, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test Resident', email, password }),
  });
  assert.equal(duplicateResponse.status, 409);

  const wrongPasswordResponse = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { Origin: frontendOrigin, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'not-the-password' }),
  });
  assert.equal(wrongPasswordResponse.status, 401);
  assert.deepEqual(await wrongPasswordResponse.json(), { error: 'Invalid email or password' });

  const logoutResponse = await fetch(`${baseUrl}/auth/logout`, {
    method: 'POST',
    headers: { Origin: frontendOrigin, Cookie: firstCookie },
  });
  assert.equal(logoutResponse.status, 204);
  assert.match(logoutResponse.headers.get('set-cookie'), /Max-Age=0/i);
  assert.equal((await fetch(`${baseUrl}/auth/me`, { headers: { Cookie: firstCookie } })).status, 401);

  const loginResponse = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { Origin: frontendOrigin, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  assert.equal(loginResponse.status, 200);
  assert.equal((await loginResponse.json()).user.role, 'resident');
  const loginCookie = loginResponse.headers.get('set-cookie').split(';', 1)[0];
  const secondToken = loginCookie.slice(loginCookie.indexOf('=') + 1);
  assert.notEqual(secondToken, firstToken);
});
