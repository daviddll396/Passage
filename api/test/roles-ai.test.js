import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.ts';

test('POST /roles/extract returns an editable draft and missing-detail questions', async (t) => {
  const extracted = {
    draft: {
      companyName: 'Example Labs',
      title: 'Frontend Engineer',
      employmentType: 'Full-time',
      location: 'Lagos, Nigeria',
      workMode: 'hybrid',
      salaryMin: null,
      salaryMax: null,
      salaryCurrency: null,
      minimumExperienceMonths: 24,
      eligibleCountries: ['Nigeria'],
      skills: ['Vue', 'TypeScript'],
      applicationUrl: null,
      applicationEmail: 'careers@example.test',
    },
    evidence: {
      companyName: 'Example Labs',
      title: 'Frontend Engineer',
      employmentType: 'Full-time',
      location: 'Lagos, Nigeria',
      workMode: 'Hybrid',
      salaryMin: null,
      salaryMax: null,
      salaryCurrency: null,
      minimumExperienceMonths: '2+ years',
      eligibleCountries: 'Applicants in Nigeria are eligible.',
      skills: 'Vue and TypeScript',
      applicationUrl: null,
      applicationEmail: 'careers@example.test',
    },
    questions: ['What salary range is budgeted?'],
  };
  const server = createApp({ extractRoleDescription: async () => extracted }).listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const response = await fetch(`http://127.0.0.1:${server.address().port}/roles/extract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description: 'Example Labs is hiring a Full-time Frontend Engineer in Lagos, Nigeria. Hybrid. 2+ years. Applicants in Nigeria are eligible. Vue and TypeScript. Apply at careers@example.test.' }),
  });

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), extracted);
});
