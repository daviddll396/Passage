export async function roleRequest(apiBase, path, options = {}) {
  const headers = new Headers(options.headers || {});
  let body = options.body;
  if (body !== undefined && !(body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(body);
  }

  const response = await fetch(`${apiBase}${path}`, { ...options, headers, body });
  const result = response.status === 204 ? null : await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = result?.error || (result?.status === 'not_ready' ? 'Role data is temporarily unavailable.' : 'Something went wrong. Please try again.');
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return result;
}

export function formatRoleSalary(role) {
  const { salaryMin, salaryMax, salaryCurrency, salaryPeriod } = role;
  if (salaryMin == null && salaryMax == null) return '';
  const format = (amount) => {
    if (!salaryCurrency) return Number(amount).toLocaleString();
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: salaryCurrency, maximumFractionDigits: 0 }).format(amount);
    } catch {
      return `${salaryCurrency} ${Number(amount).toLocaleString()}`;
    }
  };
  const range = salaryMin != null && salaryMax != null
    ? `${format(salaryMin)}–${format(salaryMax)}`
    : `${salaryMin == null ? 'Up to' : 'From'} ${format(salaryMin ?? salaryMax)}`;
  const periodNames = { hourly: 'hour', daily: 'day', weekly: 'week', monthly: 'month', yearly: 'year', annual: 'year', contract: 'contract' };
  const period = salaryPeriod ? ` / ${periodNames[salaryPeriod.toLowerCase()] || salaryPeriod}` : '';
  return `${range}${period}`;
}

export function formatExperience(months) {
  if (months == null) return '';
  if (months < 12) return `${months} ${months === 1 ? 'month' : 'months'} experience`;
  const years = months / 12;
  return `${Number.isInteger(years) ? years : years.toFixed(1)}+ years experience`;
}
