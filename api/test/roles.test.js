import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.ts';
import { hashPassword } from '../src/auth.ts';
import { closeDatabase, db } from '../src/db.ts';

after(() => closeDatabase());

test('roles migration adds role storage and preserves CivicDesk tables', async (t) => {
  const [roleTables] = await db.query("SHOW TABLES LIKE 'roles'");
  const [requestTables] = await db.query("SHOW TABLES LIKE 'requests'");
  const [userTables] = await db.query("SHOW TABLES LIKE 'users'");
  assert.equal(roleTables.length, 1, 'roles table should exist');
  assert.equal(requestTables.length, 1, 'legacy requests table should remain');
  assert.equal(userTables.length, 1, 'existing users table should remain');
});

test('legacy request routes no longer expose or mutate resident reports', async (t) => {
  const server = createApp().listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
  });
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  const listResponse = await fetch(`${baseUrl}/requests`);
  assert.equal(listResponse.status, 404);

  const createResponse = await fetch(`${baseUrl}/requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'should not be inserted', description: 'x', location: 'Yaba' }),
  });
  assert.equal(createResponse.status, 404);

  const patchResponse = await fetch(`${baseUrl}/requests/1`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'resolved' }),
  });
  assert.equal(patchResponse.status, 404);
});

test('GET /roles returns published roles with source attribution and hides pending roles', async (t) => {
  const suffix = Date.now();
  const publishedTitle = `Public frontend role ${suffix}`;
  const pendingTitle = `Pending frontend role ${suffix}`;
  const [published] = await db.execute(
    `INSERT INTO roles (source_type, source_name, source_url, title, company_name, location,
      work_mode, skills, description, status, published_at)
     VALUES ('jobicy', 'Jobicy', 'https://jobicy.com/jobs/test-role', ?, 'Example Co', 'Worldwide',
      'remote', JSON_ARRAY('Vue'), 'A safe plain-text role description.', 'published', UTC_TIMESTAMP())`,
    [publishedTitle],
  );
  await db.execute(
    `INSERT INTO roles (source_type, source_name, title, company_name, location, skills, description, status)
     VALUES ('recruiter', 'Recruiter submitted', ?, 'Private Co', 'Lagos', JSON_ARRAY(), 'Pending details', 'pending')`,
    [pendingTitle],
  );
  const server = createApp().listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await db.execute('DELETE FROM roles WHERE title IN (?, ?)', [publishedTitle, pendingTitle]);
  });

  const response = await fetch(`http://127.0.0.1:${server.address().port}/roles`);
  assert.equal(response.status, 200);
  const result = await response.json();
  const visibleRole = result.roles.find((role) => role.id === String(published.insertId));
  assert.ok(visibleRole);
  assert.equal(visibleRole.sourceName, 'Jobicy');
  assert.equal(visibleRole.sourceUrl, 'https://jobicy.com/jobs/test-role');
  assert.equal(result.roles.some((role) => role.title === pendingTitle), false);
});

test('POST /roles/search applies all explicit filters to cached roles', async (t) => {
  const suffix = Date.now();
  const matchingTitle = `Frontend Engineer ${suffix}`;
  const wrongModeTitle = `Frontend Remote ${suffix}`;
  const unknownSalaryTitle = `Frontend Salary Unknown ${suffix}`;
  const unknownEligibilityTitle = `Frontend Eligibility Unknown ${suffix}`;
  const requiredFilters = [
    [matchingTitle, 'hybrid', 'Lagos, Nigeria', 700000, 'NGN', 'monthly', 24, JSON.stringify(['Nigeria']), JSON.stringify(['Vue'])],
    [wrongModeTitle, 'remote', 'Anywhere', 900000, 'NGN', 'monthly', 36, JSON.stringify(['Nigeria']), JSON.stringify(['Vue'])],
    [unknownSalaryTitle, 'hybrid', 'Lagos, Nigeria', null, null, null, 24, JSON.stringify(['Nigeria']), JSON.stringify(['Vue'])],
    [unknownEligibilityTitle, 'hybrid', 'Lagos', 800000, 'NGN', 'monthly', 24, null, JSON.stringify(['Vue'])],
  ];
  for (const [title, mode, location, salary, currency, period, experience, countries, skills] of requiredFilters) {
    await db.execute(
      `INSERT INTO roles (source_type, source_name, title, company_name, location, work_mode,
        salary_min, salary_currency, salary_period, minimum_experience_months, eligible_countries, skills,
        description, status, published_at)
       VALUES ('recruiter', 'Recruiter submitted', ?, 'Filter test', ?, ?, ?, ?, ?, ?, ?, ?, 'Role details', 'published', UTC_TIMESTAMP())`,
      [title, location, mode, salary, currency, period, experience, countries, skills],
    );
  }
  const server = createApp({
    parseSearchIntent: async () => ({
      titleTerms: ['frontend'],
      location: 'Lagos',
      workMode: 'hybrid',
      minimumSalary: 500000,
      salaryCurrency: 'NGN',
      salaryPeriod: 'monthly',
      minimumExperienceMonths: 24,
      skills: ['Vue'],
      eligibleCountry: 'Nigeria',
    }),
  }).listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await db.execute('DELETE FROM roles WHERE title IN (?, ?, ?, ?)', [matchingTitle, wrongModeTitle, unknownSalaryTitle, unknownEligibilityTitle]);
  });

  const response = await fetch(`http://127.0.0.1:${server.address().port}/roles/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'Frontend hybrid roles in Lagos, Nigeria, 500k NGN+, 2+ years and Vue' }),
  });
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.deepEqual(result.criteria, {
    titleTerms: ['frontend'],
    location: 'Lagos',
    workMode: 'hybrid',
    minimumSalary: 500000,
    salaryCurrency: 'NGN',
    salaryPeriod: 'monthly',
    minimumExperienceMonths: 24,
    skills: ['Vue'],
    eligibleCountry: 'Nigeria',
  });
  assert.deepEqual(result.roles.map((role) => role.title), [matchingTitle]);
});

test('POST /roles/search returns normalized filters separately from parsed criteria', async (t) => {
  const criteria = {
    titleTerms: ['frontend'],
    location: 'Lagos',
    workMode: 'remote',
    minimumSalary: null,
    salaryCurrency: null,
    salaryPeriod: null,
    minimumExperienceMonths: null,
    skills: [],
    eligibleCountry: 'Nigeria',
  };
  const server = createApp({ parseSearchIntent: async () => criteria }).listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(async () => new Promise((resolve) => server.close(resolve)));

  const response = await fetch(`http://127.0.0.1:${server.address().port}/roles/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'remote frontend jobs eligible in Nigeria' }),
  });
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.deepEqual(result.criteria, criteria);
  assert.deepEqual(result.appliedFilters, {
    ...criteria,
    location: null,
  });
});

test('POST /roles/submissions validates a contact URL and saves valid roles as pending', async (t) => {
  const title = `Submission test ${Date.now()}`;
  const server = createApp().listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await db.execute('DELETE FROM roles WHERE title = ?', [title]);
  });
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const draft = {
    title,
    companyName: 'Example Labs',
    employmentType: 'Full-time',
    location: 'Lagos, Nigeria',
    workMode: 'hybrid',
    salaryMin: 700000,
    salaryMax: 1000000,
    salaryCurrency: 'NGN',
    salaryPeriod: 'monthly',
    minimumExperienceMonths: 24,
    eligibleCountries: ['Nigeria'],
    skills: ['Vue', 'TypeScript'],
    applicationUrl: 'https://example.test/careers',
    applicationEmail: null,
  };
  const unsafeResponse = await fetch(`${baseUrl}/roles/submissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ draft: { ...draft, applicationUrl: 'javascript:alert(1)' }, description: 'A role.' }),
  });
  assert.equal(unsafeResponse.status, 400);

  const response = await fetch(`${baseUrl}/roles/submissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ draft, description: 'Build and maintain a responsive Vue application.' }),
  });
  assert.equal(response.status, 201);
  const submission = await response.json();
  assert.equal(submission.status, 'pending');
  const [rows] = await db.execute('SELECT status FROM roles WHERE id = ?', [submission.id]);
  assert.equal(rows[0].status, 'pending');
});

test('only a staff session can review and publish a pending role', async (t) => {
  const suffix = Date.now();
  const residentEmail = `openrole-resident-${suffix}@example.test`;
  const staffEmail = `openrole-staff-${suffix}@example.test`;
  const pendingTitle = `Staff review test ${suffix}`;
  const password = 'correct-horse-battery-staple-42';
  const passwordHash = await hashPassword(password);
  const [staff] = await db.execute(
    "INSERT INTO users (name, email, password_hash, role) VALUES ('OpenRole test staff', ?, ?, 'staff')",
    [staffEmail, passwordHash],
  );
  const [pending] = await db.execute(
    `INSERT INTO roles (source_type, source_name, title, company_name, location, skills, description, status)
     VALUES ('recruiter', 'Recruiter submitted', ?, 'Test Company', 'Lagos', JSON_ARRAY(), 'Pending role.', 'pending')`,
    [pendingTitle],
  );
  const server = createApp().listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await db.execute('DELETE FROM roles WHERE id = ?', [pending.insertId]);
    await db.execute('DELETE FROM users WHERE email IN (?, ?)', [residentEmail, staffEmail]);
  });
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  const anonymousResponse = await fetch(`${baseUrl}/staff/roles`);
  assert.equal(anonymousResponse.status, 401);

  const residentRegistration = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'OpenRole test resident', email: residentEmail, password }),
  });
  assert.equal(residentRegistration.status, 201);
  const residentCookie = residentRegistration.headers.get('set-cookie').split(';', 1)[0];
  const residentResponse = await fetch(`${baseUrl}/staff/roles`, { headers: { Cookie: residentCookie } });
  assert.equal(residentResponse.status, 403);

  const staffLogin = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: staffEmail, password }),
  });
  assert.equal(staffLogin.status, 200);
  const staffCookie = staffLogin.headers.get('set-cookie').split(';', 1)[0];
  const queueResponse = await fetch(`${baseUrl}/staff/roles`, { headers: { Cookie: staffCookie } });
  assert.equal(queueResponse.status, 200);
  assert.ok((await queueResponse.json()).roles.some((role) => role.title === pendingTitle));

  const publishResponse = await fetch(`${baseUrl}/staff/roles/${pending.insertId}`, {
    method: 'PATCH',
    headers: { Cookie: staffCookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'published' }),
  });
  assert.equal(publishResponse.status, 200);
  assert.equal((await publishResponse.json()).status, 'published');
});

test('Gemini-backed role endpoints each allow five calls per minute per client', async (t) => {
  let extractCalls = 0;
  let searchCalls = 0;
  const server = createApp({
    extractRoleDescription: async () => {
      extractCalls += 1;
      return { draft: {}, evidence: {}, questions: [] };
    },
    parseSearchIntent: async () => {
      searchCalls += 1;
      return {
        titleTerms: [],
        location: null,
        workMode: null,
        minimumSalary: null,
        salaryCurrency: null,
        salaryPeriod: null,
        minimumExperienceMonths: null,
        skills: [],
        eligibleCountry: null,
      };
    },
  }).listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(async () => new Promise((resolve) => server.close(resolve)));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  for (let call = 0; call < 6; call += 1) {
    const response = await fetch(`${baseUrl}/roles/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: 'A frontend engineer role.' }),
    });
    assert.equal(response.status, call < 5 ? 200 : 429);
    if (call === 5) assert.ok(Number(response.headers.get('retry-after')) > 0);
  }

  for (let call = 0; call < 6; call += 1) {
    const response = await fetch(`${baseUrl}/roles/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'frontend jobs' }),
    });
    assert.equal(response.status, call < 5 ? 200 : 429);
  }

  assert.equal(extractCalls, 5);
  assert.equal(searchCalls, 5);
});
