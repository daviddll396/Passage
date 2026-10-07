import test from 'node:test';
import assert from 'node:assert/strict';
import { getRequestSummary } from '../utils/summary.js';

test('counts requests by status for the dashboard', () => {
  const requests = [
    { status: 'new' },
    { status: 'new' },
    { status: 'in_progress' },
    { status: 'resolved' },
  ];

  assert.deepEqual(getRequestSummary(requests), {
    total: 4,
    new: 2,
    inProgress: 1,
    resolved: 1,
  });
});
