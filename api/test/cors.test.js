import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.ts';

test('OPTIONS for PDF source questions allows the Passage web app request headers', async (t) => {
  const server = createApp().listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => server.close());

  const response = await fetch(`http://127.0.0.1:${server.address().port}/budget/uploads/example-upload/ask-source`, {
    method: 'OPTIONS',
    headers: {
      Origin: 'http://127.0.0.1:3000',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'content-type,x-passage-question,x-passage-history',
    },
  });

  assert.equal(response.status, 204);
  assert.equal(response.headers.get('access-control-allow-origin'), 'http://127.0.0.1:3000');
  assert.equal(response.headers.get('access-control-allow-methods'), 'GET, POST, OPTIONS');
  assert.match(response.headers.get('access-control-allow-headers'), /content-type/i);
  assert.match(response.headers.get('access-control-allow-headers'), /x-passage-question/i);
  assert.match(response.headers.get('access-control-allow-headers'), /x-passage-history/i);
});
