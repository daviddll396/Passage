# OpenRole Implementation Plan

**Goal:** Build OpenRole, a job discovery product that imports recent remote roles, lets job seekers search in natural language, and lets recruiters submit roles through an AI-assisted review flow.

**Architecture:** Reuse the existing Nuxt 3, Express 5/TypeScript, MySQL, and Gemini setup. Cache Jobicy's public remote listings in MySQL with source attribution, use Gemini to parse job-seeker criteria and recruiter descriptions, and keep matching, validation, and publication decisions in deterministic server code.

**Tech Stack:** Nuxt 3/Vue, Express 5, TypeScript, MySQL 8.4, Gemini API, Docker Compose, Google Cloud.

## Global Constraints

- Keep the user's `.env`, existing MySQL volume, and CivicDesk tables and data intact.
- Use Nuxt/Vue because that is a stated recruiter requirement; do not migrate this project to Next.js.
- Keep Jobicy canonical links and attribution; import no more than 200 results per response and run automated sync no more than hourly.
- Treat missing job facts as unknown; never claim a worldwide remote job accepts applicants from Nigeria unless the listing says so.
- Render only escaped plain-text descriptions; never fetch recruiter-provided URLs from the server.
- Limit and rate-limit public Gemini inputs; public search and matching must not send every listing to Gemini.
- Keep recruiter submissions pending until an authenticated staff member publishes them.
- Keep secret values out of `.env.example`, source control, logs, and public responses.

---

### Task 1: Preserve the database and add role records

**Files:**
- Create `api/sql/005_create_roles.sql`.
- Modify `api/src/migrate.ts` only as required to apply the new additive migration.
- Create or update `docs/design/DESIGN.md` and `docs/design/design-gate.json` for the Vue/Nuxt UI direction.

Add a role record that distinguishes imported Jobicy listings from recruiter submissions, retains provider IDs and source URLs, stores nullable salary/location/work-mode/eligibility fields, and supports pending, published, and closed states. Do not drop or repurpose CivicDesk tables.

**Check:** Run the migration against the existing local database and confirm prior request rows remain present.

### Task 2: Add bounded AI and Jobicy services

**Files:**
- Create `api/src/sync-jobicy.ts`.
- Replace the CivicDesk-specific prompt in `api/src/triage.ts` with role-intake and search-intent schemas or focused modules.
- Create `api/src/evaluate-roles.ts` and focused role extraction/search evaluation cases.
- Add `api/test/roles.test.js` and update package scripts in `api/package.json`.

Import at most one 200-item Jobicy engineering feed page, preserve each canonical Jobicy URL, normalize HTML descriptions to safe text, and upsert by provider ID. Add Gemini outputs for natural-language search criteria and recruiter field extraction with missing-field questions. Keep search matching based on cached database records and deterministic rules.

**Check:** API typecheck, focused tests using mocked model/provider responses, and a separate live prompt evaluation command using the configured Gemini key.

### Task 3: Build the Express product API

**Files:**
- Modify `api/src/app.ts` and `api/src/auth.ts`.
- Create focused role/search route or service files only where they fit existing patterns.
- Remove public access to obsolete `/requests` routes while preserving their tables.

Provide role list/detail, search-intent parse, recruiter extraction/submission, and staff queue/publish/close endpoints. Validate fields again before insert, limit request size, rate-limit both Gemini endpoints, accept only safe HTTP(S) source/apply URLs, and return conflict for duplicates. Public browsing returns only published, open roles with truthful source labels.

**Check:** Focused API/database tests cover search hard constraints, duplicate imports, invalid submissions, staff authorization, and public visibility.

### Task 4: Build the Nuxt user journeys

**Files:**
- Replace `web/pages/index.vue` with the public job search and results view.
- Replace `web/pages/report.vue` with the recruiter paste, AI preview, edit, and submit flow.
- Add only the small detail, staff queue, or API helper files needed by those flows.
- Update `web/app.vue` and package metadata as needed.

Support natural-language criteria with editable filter chips, source/eligibility labels, clear loading/error/empty states, and outbound apply links. Recruiters review AI fields and missing-information prompts before submitting. Staff publish from the existing authenticated account flow.

**Check:** Nuxt production build and browser checks at desktop and phone widths for search, detail, recruiter review, staff publication, and error states.

### Task 5: Document and deploy

**Files:**
- Create `README.md` with local setup, environment variables, Jobicy sync, AI evaluations, data provenance, and deployment instructions.
- Rename CivicDesk package labels and example configuration to OpenRole.
- Add GCP deployment configuration after selecting a current, cost-checked service layout.

Deploy only after project credentials and cost are known. Use secret management rather than committing API keys. Include a working demo URL and actual evaluation/build results when available.

**Check:** Fresh local setup, deployed smoke checks, and no unsupported metrics or claims in project/CV copy.
