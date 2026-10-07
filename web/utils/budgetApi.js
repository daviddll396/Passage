export async function budgetRequest(apiBase, path, options = {}) {
  const headers = new Headers(options.headers || {});
  let body = options.body;

  if (body && Object.getPrototypeOf(body) === Object.prototype) {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(body);
  }

  const response = await fetch(`${apiBase}${path}`, { ...options, headers, body });
  const result = response.status === 204 ? null : await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(result?.error || 'Something went wrong. Please try again.');
    error.status = response.status;
    throw error;
  }
  return result;
}
