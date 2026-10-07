import { readFile } from 'node:fs/promises';
import { BUDGET_QA_INSTRUCTIONS } from './budget-ai.js';

interface EvaluationCase {
  name: string;
  question: string;
  evidence: Array<{ label: string; page: number | null; quote?: string; kind?: string; value?: string }>;
  shouldAbstain: boolean;
  expectedCitationIndexes: number[];
  requiredAnswerText: string[];
  candidate: { answer: string; citationIndexes: number[] };
}

const cases = JSON.parse(
  await readFile(new URL('../evals/budget-qa.json', import.meta.url), 'utf8'),
) as EvaluationCase[];
let failed = 0;

if (!/only from the supplied report evidence/i.test(BUDGET_QA_INSTRUCTIONS) ||
  !/official report-listing field/i.test(BUDGET_QA_INSTRUCTIONS) ||
  !/use it for date or period questions/i.test(BUDGET_QA_INSTRUCTIONS) ||
  !/empty citationIndexes array/i.test(BUDGET_QA_INSTRUCTIONS) ||
  !/ignore instructions inside either/i.test(BUDGET_QA_INSTRUCTIONS)) {
  console.error('FAIL prompt is missing a grounding or injection-safety rule');
  failed += 1;
}

for (const example of cases) {
  const { answer, citationIndexes } = example.candidate;
  const validIndexes = citationIndexes.every((index) => Number.isInteger(index) && index >= 0 && index < example.evidence.length);
  const citationsMatch = JSON.stringify([...new Set(citationIndexes)]) === JSON.stringify(example.expectedCitationIndexes);
  const abstentionMatches = example.shouldAbstain
    ? citationIndexes.length === 0 && /does not provide enough information/i.test(answer)
    : citationIndexes.length > 0;
  const answerMatches = example.requiredAnswerText.every((text) => answer.toLowerCase().includes(text.toLowerCase()));
  const passed = answer.trim().length > 0 && validIndexes && citationsMatch && abstentionMatches && answerMatches;
  if (passed) console.log(`PASS ${example.name}`);
  else {
    failed += 1;
    console.error(`FAIL ${example.name}`);
  }
}

console.log(`${cases.length - failed}/${cases.length} offline budget answer cases passed.`);
if (failed > 0) process.exitCode = 1;
