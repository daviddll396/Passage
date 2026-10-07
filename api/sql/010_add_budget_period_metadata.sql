UPDATE budget_reports
SET evidence = JSON_ARRAY_APPEND(
  evidence,
  '$',
  JSON_OBJECT('kind', 'metadata', 'label', 'Report period', 'page', NULL, 'value', 'October 2025')
)
WHERE id = 'fgn-budget-performance-by-function-oct-2025'
  AND JSON_CONTAINS(evidence, JSON_OBJECT('kind', 'metadata', 'label', 'Report period')) = 0;
