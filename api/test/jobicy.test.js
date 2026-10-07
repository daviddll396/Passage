import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { closeDatabase, db } from '../src/db.ts';
import { importJobicyJobs, normalizeJobicyJob, stripJobicyHtml, syncJobicyIfDue } from '../src/sync-jobicy.ts';

after(() => closeDatabase());

test('Jobicy descriptions become plain text and drop script/style content', () => {
  assert.equal(
    stripJobicyHtml('<p>Build &amp; ship&nbsp;apps</p><script>steal()</script><style>.x{}</style><li>Fast UI</li>'),
    'Build & ship apps\nFast UI',
  );
});

test('Jobicy normalization keeps the canonical source and skips unsafe links', () => {
  const job = normalizeJobicyJob({
    id: 12345,
    url: 'https://jobicy.com/jobs/example-role',
    jobTitle: 'Frontend Engineer',
    companyName: 'Example Labs',
    jobType: ['Full-Time'],
    jobGeo: 'Anywhere',
    jobDescription: '<p>Build responsive interfaces.</p>',
    pubDate: '2026-10-01T10:00:00Z',
    salaryMin: 70000,
    salaryMax: 90000,
    salaryCurrency: 'USD',
    salaryPeriod: 'yearly',
  });
  assert.equal(job.title, 'Frontend Engineer');
  assert.equal(job.sourceUrl, 'https://jobicy.com/jobs/example-role');
  assert.equal(job.description, 'Build responsive interfaces.');
  assert.equal(normalizeJobicyJob({ id: 12345, url: 'javascript:alert(1)', jobTitle: 'Unsafe' }), null);
});

test('re-importing a Jobicy listing updates one cached row and preserves a staff closure', async (t) => {
  const sourceId = String(Date.now());
  const job = {
    id: Number(sourceId),
    url: 'https://jobicy.com/jobs/openrole-import-test',
    jobTitle: 'OpenRole importer test',
    companyName: 'OpenRole test company',
    jobType: ['Full-Time'],
    jobGeo: 'Anywhere',
    jobDescription: '<p>Imported role.</p>',
    pubDate: '2026-10-01T10:00:00Z',
  };
  t.after(() => db.execute("DELETE FROM roles WHERE source_type = 'jobicy' AND source_id = ?", [sourceId]));

  await importJobicyJobs([job]);
  await importJobicyJobs([job]);
  await db.execute("UPDATE roles SET status = 'closed' WHERE source_type = 'jobicy' AND source_id = ?", [sourceId]);
  await importJobicyJobs([job]);

  const [rows] = await db.execute(
    "SELECT id, status FROM roles WHERE source_type = 'jobicy' AND source_id = ?",
    [sourceId],
  );
  assert.equal(rows.length, 1);
  assert.equal(rows[0].status, 'closed');
});

test('Jobicy sync skips the remote feed while the hourly cache is fresh', async (t) => {
  const [previous] = await db.execute("SELECT synced_at FROM role_sync_state WHERE source_name = 'jobicy'");
  t.after(async () => {
    if (previous[0]) {
      await db.execute(
        `INSERT INTO role_sync_state (source_name, synced_at) VALUES ('jobicy', ?)
         ON DUPLICATE KEY UPDATE synced_at = VALUES(synced_at)`,
        [previous[0].synced_at],
      );
    } else {
      await db.execute("DELETE FROM role_sync_state WHERE source_name = 'jobicy'");
    }
  });
  await db.execute(
    `INSERT INTO role_sync_state (source_name, synced_at) VALUES ('jobicy', UTC_TIMESTAMP())
     ON DUPLICATE KEY UPDATE synced_at = VALUES(synced_at)`,
  );
  let fetchCalls = 0;

  const result = await syncJobicyIfDue(async () => {
    fetchCalls += 1;
    return new Response(JSON.stringify({ success: true, jobs: [] }), { status: 200 });
  });

  assert.deepEqual(result, { status: 'recently_synced', imported: 0 });
  assert.equal(fetchCalls, 0);
});

test('due Jobicy sync fetches one feed page capped at 200 roles', async (t) => {
  const [previous] = await db.execute("SELECT synced_at FROM role_sync_state WHERE source_name = 'jobicy'");
  t.after(async () => {
    if (previous[0]) {
      await db.execute(
        `INSERT INTO role_sync_state (source_name, synced_at) VALUES ('jobicy', ?)
         ON DUPLICATE KEY UPDATE synced_at = VALUES(synced_at)`,
        [previous[0].synced_at],
      );
    } else {
      await db.execute("DELETE FROM role_sync_state WHERE source_name = 'jobicy'");
    }
  });
  await db.execute(
    `INSERT INTO role_sync_state (source_name, synced_at) VALUES ('jobicy', DATE_SUB(UTC_TIMESTAMP(), INTERVAL 2 HOUR))
     ON DUPLICATE KEY UPDATE synced_at = VALUES(synced_at)`,
  );
  const requestedUrls = [];

  const result = await syncJobicyIfDue(async (input) => {
    requestedUrls.push(String(input));
    return new Response(JSON.stringify({ success: true, jobs: [] }), { status: 200 });
  });

  assert.deepEqual(result, { status: 'synced', imported: 0 });
  assert.equal(requestedUrls.length, 1);
  assert.match(requestedUrls[0], /count=200/);
});
