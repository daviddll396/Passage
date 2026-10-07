import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.ts';
import { closeDatabase } from '../src/db.ts';

test('GET /ready confirms the database can be queried', async (t) => {
  const server = createApp().listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(async () => {
    server.close();
    await closeDatabase();
  });

  const { port } = server.address();
  const response = await fetch(`http://127.0.0.1:${port}/ready`);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ready', database: 'ok' });
});
