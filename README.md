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
- Uploaded PDFs are limited to 8 MB. The original PDF is sent to Gemini for extraction and then discarded by the API. Extracted upload data stays in process memory for 30 minutes. It is not in the public example library.

The temporary upload session is held by one API process. This is suitable for the local demo. A multi-instance deployment needs shared, expiring session storage.

## Public report data

The seeded October 2025 Federal Government of Nigeria budget performance report is published by the [Open Treasury portal](https://opentreasury.gov.ng/index.php/component/content/article/175-y-2025/12397-fgn-monthly-2025?Itemid=101). Passage links to the [source PDF](https://www.opentreasury.gov.ng/images/2025/MONTHLYBUDPERF/BUDGET_PERF/FUNCTIONS/OCTOBER---PDF.pdf). The library seed includes Education and Health values from page 1.

## Prompt evaluation

Run `npm run eval:budget:offline` in `api` to check prompt safeguards and three fixed answer cases. This check does not call Gemini or use the API key.

## Stack

Nuxt 3, Vue, Express, TypeScript, MySQL, Docker Compose, and the Gemini API.
