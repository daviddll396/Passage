# Passage

Passage helps people understand PDFs. Visitors can explore a published example or upload a PDF, inspect extracted details, and ask questions that link back to evidence in the document. The current example library starts with public budget reports.

**Live demo:** [passage.tolani.xyz](https://passage.tolani.xyz/)

## Try the demo

1. Select **Try an example** and ask a question about the sample report.
2. Or select **Add a PDF**, upload your document, and submit a question.
3. Read the answer and check its supporting passages and page references.

The app accepts documents beyond budgets, including resumes and reports. An answer can state that the document does not contain enough information.

## What the project demonstrates

- A Nuxt 3 and Vue frontend with PDF upload, a chat interface, answer text reveal, automatic chat scrolling, and supporting passages.
- An Express and TypeScript API that calls Gemini, checks structured model output, and validates citation references.
- A MySQL sample report library, with repeatable schema and seed scripts.
- A second question path that sends the original PDF when the extracted evidence cannot answer the question.
- Offline and live prompt evaluations, request limits, and frontend error messages.
- Deployment to Vercel, GCP Cloud Run, and Aiven, with verified database TLS and an explicit list of allowed frontend origins.

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

The temporary upload session is held by one API process. It expires after 30 minutes and is lost when the API restarts. A multi-instance deployment needs shared, expiring session storage.

## Request limits

The API limits requests by client IP:

- PDF uploads: 3 every 10 minutes.
- Questions about sample reports or extracted upload details: 12 per minute.
- Questions that search the original uploaded PDF: 4 per minute.

When a limit is reached, the API returns `429` and a `Retry-After` value in seconds. Passage reads that header and tells the visitor how long to wait. The counters are held in API process memory, so they reset when the process restarts and are not shared across multiple instances. Behind a hosting proxy, confirm the forwarded IP chain and configure Express to trust only the correct proxy hops before relying on per-visitor limits. The current API does not configure proxy trust, so visitors can share a proxy IP limit. Use shared rate-limit storage before running multiple API instances.

## Public report data

The seeded October 2025 Federal Government of Nigeria budget performance report is published by the [Open Treasury portal](https://opentreasury.gov.ng/index.php/component/content/article/175-y-2025/12397-fgn-monthly-2025?Itemid=101). Passage links to the [source PDF](https://www.opentreasury.gov.ng/images/2025/MONTHLYBUDPERF/BUDGET_PERF/FUNCTIONS/OCTOBER---PDF.pdf). The library seed includes Education and Health values from page 1.

## Prompt evaluation

Run `npm run eval:budget:offline` in `api` for a quick local check of prompt safeguards and five fixed expected cases. It does not call Gemini.

Run `npm run eval:budget:live` in `api` to send those five cases through the configured Gemini model and check answer content, citations, and abstention. This makes five Gemini requests. To rerun one case, add a name filter, for example `npm run eval:budget:live -- "year-to-date"`.

The live evaluation checks the extracted-evidence Q&A prompt with prepared budget-report evidence. It does not yet evaluate PDF extraction or the full-PDF fallback against uploaded files.

## Live deployment

| Component | Platform | Configuration |
|---|---|---|
| Frontend | Vercel | Nuxt project, root directory `web` |
| API | GCP Cloud Run | Containerized Express/TypeScript service from `api` |
| Database | Aiven | Managed MySQL 8.4 with certificate verification |
| Document AI | Gemini API | Server-side API key |

The public frontend is available at [passage.tolani.xyz](https://passage.tolani.xyz/). The backend has been deployed to GCP Cloud Run, replacing Render as the target host. Use `/health` on the Cloud Run URL to check the API process and `/ready` to check database access. The frontend must use the Cloud Run URL in `NUXT_PUBLIC_API_BASE`; the live frontend still pointed to Render when this documentation was updated.

### Vercel

Import the `web` project with the Nuxt preset. Set `NUXT_PUBLIC_API_BASE` to the Cloud Run service URL, then redeploy the frontend. Use the default Nuxt build settings. Add the custom domain and use the CNAME target supplied by Vercel in the domain provider's DNS settings.

### GCP Cloud Run and Aiven

The backend was moved from Render to GCP Cloud Run. The frontend remains on Vercel, and MySQL remains on Aiven.

Use the container built from `api/Dockerfile` with `api` as the build context. The Dockerfile compiles TypeScript and starts the application with `npm start`. The server listens on `0.0.0.0` and reads the host-supplied `PORT`.

Set `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD` from Aiven. Mount the Aiven CA certificate and set `DB_SSL_CA_PATH` to the mounted file path. The API verifies the database server certificate. Keep passwords and Gemini credentials outside the repository.

Set `GEMINI_API_KEY`, `GEMINI_MODEL`, `FRONTEND_ORIGIN`, and `NODE_ENV=production`. Use exact frontend origins without trailing slashes. For multiple origins, separate them with commas.

At startup, the API applies the repeatable schema and seed scripts before starting the server. If a script fails, startup stops. Check `/ready` after deployment to confirm database access.

For a small demo, use request-based billing, minimum instances of 0 and maximum instances of 1. These settings reduce usage; they do not guarantee zero charges.

The deployed frontend origins are configured as:

```text
FRONTEND_ORIGIN=https://passage-three-liart.vercel.app,https://passage.tolani.xyz
```

### Current limits

- With minimum instances set to 0, Cloud Run can scale to zero. The first request can take longer while the service starts.
- Upload sessions and request counters are temporary and stay in one API process.
- Gemini quotas can block a request even when the app's own request limit has not been reached.
- The prompt evaluation covers five prepared sample-report cases. It does not prove accuracy for every uploaded PDF.
- Upload sessions can expire or be lost when a Cloud Run instance stops. Request counters are not shared across instances.

## Stack

Nuxt 3, Vue, Express, TypeScript, MySQL, Docker Compose, and the Gemini API.
