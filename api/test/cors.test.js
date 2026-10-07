import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.ts';

test('OPTIONS /roles/submissions allows the OpenRole web app to submit JSON', async (t) => {
  const server = createApp().listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => server.close());

  const response = await fetch(`http://127.0.0.1:${server.address().port}/roles/submissions`, {
    method: 'OPTIONS',
    headers: {
      Origin: 'http://127.0.0.1:3000',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'content-type',
    },
  });

  assert.equal(response.status, 204);
  assert.equal(response.headers.get('access-control-allow-origin'), 'http://127.0.0.1:3000');
  assert.match(response.headers.get('access-control-allow-methods'), /POST/);
  assert.match(response.headers.get('access-control-allow-headers'), /content-type/i);
});
