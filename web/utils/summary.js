export function getRequestSummary(requests) {
  return requests.reduce((summary, request) => {
    summary.total += 1;
    if (request.status === 'new') summary.new += 1;
    if (request.status === 'in_progress') summary.inProgress += 1;
    if (request.status === 'resolved') summary.resolved += 1;
    return summary;
  }, { total: 0, new: 0, inProgress: 0, resolved: 0 });
}
