import { readFile } from 'node:fs/promises';
import { answerBudgetQuestion } from './budget-ai.js';
import type { BudgetEvidence, BudgetReport } from './budget-ai.js';

interface EvaluationCase {
  name: string;
  question: string;
  evidence: BudgetEvidence[];
  shouldAbstain: boolean;
  expectedCitationIndexes: number[];
  requiredAnswerText: string[];
}

const cases = JSON.parse(
  await readFile(new URL('../evals/budget-qa.json', import.meta.url), 'utf8'),
) as EvaluationCase[];
const filter = process.argv[2]?.toLowerCase();
const selectedCases = filter ? cases.filter((example) => example.name.toLowerCase().includes(filter)) : cases;
if (selectedCases.length === 0) throw new Error(`No evaluation case matches: ${filter}`);
const model = process.env.GEMINI_MODEL ?? 'gemini-3.5-flash-lite';
let failed = 0;

function normalizeForComparison(value: string) {
  return value.toLowerCase().replace(/(?<=\d)[,\s](?=\d)/g, '');
}

console.log(`Evaluating ${selectedCases.length} cases with ${model}; each case makes one Gemini request.`);

for (const example of selectedCases) {
  const report: Omit<BudgetReport, 'id'> = {
    title: 'Federal Government budget performance by function',
    organization: 'Federal Government of Nigeria',
    period: 'October 2025',
    summary: 'A monthly report of budget performance and payments by function.',
    metrics: [],
    evidence: example.evidence,
  };

  try {
    const result = await answerBudgetQuestion(example.question, report);
    const citationIndexes = result.citations.map((citation) => example.evidence.findIndex((source) =>
      source.label === citation.label && source.page === citation.page &&
      ('quote' in source ? 'quote' in citation && source.quote === citation.quote :
        'value' in source && 'value' in citation && source.value === citation.value && source.kind === citation.kind),
    ));
    const actualIndexes = [...citationIndexes].sort((a, b) => a - b);
    const expectedIndexes = [...example.expectedCitationIndexes].sort((a, b) => a - b);
    const citationsMatch = JSON.stringify(actualIndexes) === JSON.stringify(expectedIndexes);
    const abstentionMatches = result.abstained === example.shouldAbstain;
    const answerMatches = example.requiredAnswerText.every((text) =>
      normalizeForComparison(result.answer).includes(normalizeForComparison(text)),
    );

    if (citationsMatch && abstentionMatches && answerMatches) console.log(`PASS ${example.name}`);
    else {
      failed += 1;
      console.error(`FAIL ${example.name} (citations=${citationsMatch}, abstention=${abstentionMatches}, answer=${answerMatches})`);
      if (!answerMatches) console.error(`  Gemini answer: ${result.answer}`);
    }
  } catch (error) {
    failed += 1;
    console.error(`ERROR ${example.name}: ${error instanceof Error ? error.message : 'unknown error'}`);
    break;
  }
}

console.log(`${selectedCases.length - failed}/${selectedCases.length} live prompt cases passed.`);
if (failed > 0) process.exitCode = 1;
