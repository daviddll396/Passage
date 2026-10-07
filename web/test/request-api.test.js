import { createServer } from 'node:http';
import test from 'node:test';
import assert from 'node:assert/strict';

const requestApi = await import('../utils/requestApi.js').catch(() => ({}));

test('submitRequest posts report JSON and returns the saved report', async (t) => {
  assert.equal(typeof requestApi.submitRequest, 'function');

  const payload = { title: 'Broken streetlight', description: 'The light is out.', location: 'Yaba' };
  let receivedMethod;
  let receivedUrl;
  let receivedType;
  let receivedBody;
  const server = createServer(async (request, response) => {
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    receivedMethod = request.method;
    receivedUrl = request.url;
    receivedType = request.headers['content-type'];
    receivedBody = JSON.parse(Buffer.concat(chunks).toString());
    response.writeHead(201, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ id: 42, ...payload, status: 'new' }));
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const result = await requestApi.submitRequest(payload, `http://127.0.0.1:${server.address().port}`);

  assert.equal(receivedMethod, 'POST');
  assert.equal(receivedUrl, '/requests');
  assert.match(receivedType, /application\/json/);
  assert.deepEqual(receivedBody, payload);
  assert.equal(result.id, 42);
});

test('submitRequest surfaces the API validation message', async (t) => {
  assert.equal(typeof requestApi.submitRequest, 'function');

  const server = createServer((_request, response) => {
    response.writeHead(400, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ error: 'location is required' }));
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));

  await assert.rejects(
    requestApi.submitRequest({}, `http://127.0.0.1:${server.address().port}`),
    /location is required/,
  );
});
