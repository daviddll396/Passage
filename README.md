# Passage

Passage helps people understand PDFs. Visitors can explore a published example or upload a PDF, inspect extracted details, and ask questions that link back to evidence in the document. The current example library starts with public budget reports.

## Run locally

1. Copy `.env.example` to `.env` and add your Gemini API key. Keep `.env` private.
2. Start MySQL with `docker compose up -d mysql` from the project root.
3. In `api`, run `npm install` once, then `npm run dev`. The API applies database migrations and starts on port 4000.
4. In `web`, run `npm install` once, then `npm run dev`. Open `http://localhost:3000`.

## AI behavior

- Gemini runs only after a visitor uploads a PDF or submits a question.
- PDF extraction returns structured details and page evidence. It can return no structured details when a document has none, while still requiring citable page evidence.
- Answers use extracted evidence and validated citation indexes. If the document does not answer the question, the API returns an abstention without citations.
- The default model is `gemini-3.5-flash-lite`. Set `GEMINI_MODEL` in `.env` to use another model that supports PDF input and structured output.
- Uploaded PDFs are limited to 8 MB. The browser keeps the original PDF in the current tab. The API sends it to Gemini for extraction and discards the bytes; if extracted evidence cannot answer a question, the browser resends that same PDF for a source-grounded answer. The API keeps only the extracted report and a file digest in process memory for 30 minutes. Private uploads are not in the public example library.

The temporary upload session is held by one API process. This is suitable for the local demo. A multi-instance deployment needs shared, expiring session storage.

## Request limits

The API limits requests by client IP:

- PDF uploads: 3 every 10 minutes.
- Questions about sample reports or extracted upload details: 12 per minute.
- Questions that search the original uploaded PDF: 4 per minute.

When a limit is reached, the API returns `429` and a `Retry-After` value in seconds. Passage reads that header and tells the visitor how long to wait. The counters are held in API process memory, so they reset when the process restarts and are not shared across multiple instances. Behind Cloud Run, confirm the forwarded IP chain and configure Express to trust only the correct proxy hops before relying on per-visitor limits. Use shared rate-limit storage before running multiple API instances.

## Public report data

The seeded October 2025 Federal Government of Nigeria budget performance report is published by the [Open Treasury portal](https://opentreasury.gov.ng/index.php/component/content/article/175-y-2025/12397-fgn-monthly-2025?Itemid=101). Passage links to the [source PDF](https://www.opentreasury.gov.ng/images/2025/MONTHLYBUDPERF/BUDGET_PERF/FUNCTIONS/OCTOBER---PDF.pdf). The library seed includes Education and Health values from page 1.

## Prompt evaluation

Run `npm run eval:budget:offline` in `api` for a quick local check of prompt safeguards and five fixed expected cases. It does not call Gemini.

Run `npm run eval:budget:live` in `api` to send those five cases through the configured Gemini model and check answer content, citations, and abstention. This makes five Gemini requests. To rerun one case, add a name filter, for example `npm run eval:budget:live -- "year-to-date"`.

The live evaluation checks the extracted-evidence Q&A prompt with prepared budget-report evidence. It does not yet evaluate PDF extraction or the full-PDF fallback against uploaded files.

## Stack

Nuxt 3, Vue, Express, TypeScript, MySQL, Docker Compose, and the Gemini API.
