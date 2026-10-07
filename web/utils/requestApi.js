export async function getRequests(apiBase) {
  const response = await fetch(`${apiBase}/requests`);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Could not load reports. Please try again.');
  }

  return result;
}

export async function updateRequestStatus(id, status, apiBase) {
  const response = await fetch(`${apiBase}/requests/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Could not update the report. Please try again.');
  }

  return result;
}

export async function submitRequest(request, apiBase) {
  const response = await fetch(`${apiBase}/requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Could not submit the report. Please try again.');
  }

  return result;
}
