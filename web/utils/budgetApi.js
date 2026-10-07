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
    const retryAfter = Number.parseInt(response.headers.get('Retry-After') || '', 10);
    const minutes = Math.floor(retryAfter / 60);
    const seconds = retryAfter % 60;
    const wait = minutes
      ? `${minutes} minute${minutes === 1 ? '' : 's'}${seconds ? ` and ${seconds} second${seconds === 1 ? '' : 's'}` : ''}`
      : `${retryAfter} second${retryAfter === 1 ? '' : 's'}`;
    const message = response.status === 429
      ? retryAfter > 0
        ? `You've reached the request limit. Try again in ${wait}.`
        : 'You’ve reached the request limit. Please wait a little and try again.'
      : result?.error || 'Something went wrong. Please try again.';
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return result;
}
