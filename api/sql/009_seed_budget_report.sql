INSERT IGNORE INTO budget_reports (
  id, title, organization, period, summary, source_name, source_url,
  metrics, evidence, published_at
) VALUES (
  'fgn-budget-performance-by-function-oct-2025',
  'Budget performance by function',
  'Federal Government of Nigeria',
  'October 2025',
  'Official federal budget performance by function for October 2025. This sample shows reported fields for Education and Health. It does not explain the reasons behind spending levels.',
  'Open Treasury, Federal Government of Nigeria',
  'https://www.opentreasury.gov.ng/images/2025/MONTHLYBUDPERF/BUDGET_PERF/FUNCTIONS/OCTOBER---PDF.pdf',
  JSON_ARRAY(
    JSON_OBJECT('label', 'Education · Budget amount', 'value', '19,015,862,165,219.64', 'unit', '₦', 'sourcePage', 1),
    JSON_OBJECT('label', 'Education · October', 'value', '147,723,385,765.15', 'unit', '₦', 'sourcePage', 1),
    JSON_OBJECT('label', 'Education · Payments YTD', 'value', '1,830,924,173,157.64', 'unit', '₦', 'sourcePage', 1),
    JSON_OBJECT('label', 'Education · Budget balance', 'value', '17,184,937,992,062.00', 'unit', '₦', 'sourcePage', 1),
    JSON_OBJECT('label', 'Education · Percentage', 'value', '9.63', 'unit', '%', 'sourcePage', 1),
    JSON_OBJECT('label', 'Health · Budget amount', 'value', '6,369,927,731,487.20', 'unit', '₦', 'sourcePage', 1),
    JSON_OBJECT('label', 'Health · October', 'value', '66,239,504,169.53', 'unit', '₦', 'sourcePage', 1),
    JSON_OBJECT('label', 'Health · Payments YTD', 'value', '687,857,616,123.62', 'unit', '₦', 'sourcePage', 1),
    JSON_OBJECT('label', 'Health · Budget balance', 'value', '5,682,070,115,363.58', 'unit', '₦', 'sourcePage', 1),
    JSON_OBJECT('label', 'Health · Percentage', 'value', '10.80', 'unit', '%', 'sourcePage', 1)
  ),
  JSON_ARRAY(
    JSON_OBJECT('label', 'Education', 'page', 1, 'quote', 'Name Education | BUDGET AMOUNT 19 015 862 165 219.64 | OCTOBER 147 723 385 765.15 | PAYMENTS YTD 1 830 924 173 157.64 | BUDGET BALANCE 17 184 937 992 062.00 | PERCENTAGE 9.63'),
    JSON_OBJECT('label', 'Health', 'page', 1, 'quote', 'Name Health | BUDGET AMOUNT 6 369 927 731 487.20 | OCTOBER 66 239 504 169.53 | PAYMENTS YTD 687 857 616 123.62 | BUDGET BALANCE 5 682 070 115 363.58 | PERCENTAGE 10.80')
  ),
  UTC_TIMESTAMP()
);
