# CivicDesk: recruiter-feedback course

## Goal

Build and publish one small, original project that gives concrete evidence for the gaps Ernest identified in the HeyGov feedback. Learn each part as we build it, then revise the CV using only work and outcomes we can verify.

## Project

CivicDesk is a small dashboard for municipal staff to review community service requests. Staff can see a request, update its status, and ask an AI helper for a suggested category, priority, and short summary. A staff member reviews the suggestion before saving it.

## Course

1. **Vue and Nuxt:** start the app, learn Vue templates/reactivity/components, and build the request inbox UI.
2. **Express and TypeScript:** add a small REST API, validate incoming data, and learn how request handlers work.
3. **MySQL:** save and retrieve requests with a minimal schema and parameterized queries.
4. **Connect the app:** call the API from Nuxt and handle loading, empty, and error states.
5. **AI workflow and evaluation:** add one LLM task, version the prompt, create representative cases, and measure its outputs with repeatable checks. Keep offline checks separate from calls to a paid or rate-limited API.
6. **GCP:** deploy the app and API if project access and any service costs are available; otherwise leave clear, runnable deployment steps.
7. **Evidence and CV:** publish the code and demo, capture verified results, remove generic or unsupported CV claims, and draft a concise reply to Ernest.

## Working rules

- Each lesson: explain the concept, build one small piece, run its focused check, and record what the result proves.
- Add no technology or feature unless it addresses the feedback or makes the demo usable.
- Never invent experience, metrics, deployment, or evaluation results. Confirm personal-work metrics before using them.
- Keep secrets and real personal or resident data out of Git.
- GCP provisioning waits until the project, account, and possible charges are clear.

## Done means

- The repo has a readable README, reproducible local setup, and the feature checks described above.
- A public demo and repo are available if account setup permits.
- The revised CV describes only completed, verifiable work, and Ernest receives an honest follow-up draft.
