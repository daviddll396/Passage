# Role-Based Login Implementation Plan

**Goal:** Give residents and staff one login page, then enforce each role's access in the Express API.

**Architecture:** Keep authentication in the existing Express and MySQL backend. Store resident/staff accounts and server-side sessions in MySQL; put only a random, HTTP-only session token in the browser cookie. Nuxt uses the role returned by the API for navigation, while Express checks the stored role on every protected request.

**Tech stack:** Nuxt 3, Vue, Express 5, TypeScript, MySQL 8.4, Node.js `crypto`.

## Global constraints

- Public registration always creates a `resident`; never accept a requested role from the browser.
- Create staff accounts only with a private backend command that does not expose passwords in command history or process arguments.
- Keep existing reports with a nullable owner; only staff can see legacy reports without an owner.
- Hash passwords with asynchronous Node `scrypt` using a random salt and versioned parameters; compare fixed-length digests with `timingSafeEqual`.
- Generate 32-byte random session tokens, store only their SHA-256 hashes, and reject expired sessions.
- Use an HTTP-only, `SameSite=Lax` cookie, set `Secure` in production, and allow credentialed CORS only for the configured frontend origin.
- Reject state-changing browser requests with an unexpected `Origin`; never trust a role value supplied by frontend code.
- The frontend route guard is for navigation only. API authorization is the security boundary.
- Before GCP deployment, ensure the browser can send the API cookie through a same-site host/proxy arrangement.

## Stages

### 1. User identity and report ownership

**Files:** add `api/sql/003_create_users.sql`; update `api/src/migrate.ts`; add `api/test/auth-schema.test.js`.

Create `users` with a `BIGINT UNSIGNED` ID, name, normalized unique email, password hash, role enum (`resident`, `staff`), and creation time. Add nullable `requests.resident_id` with a matching unsigned type, index, and foreign key. Check the column, index, and foreign key independently so a partially applied migration can recover. Keep existing report rows unowned.

Run the migration and the focused schema check. Inspect both table definitions and pause for the learner to explain the foreign key and why old reports can have no owner.

### 2. Passwords and sessions

**Files:** add `api/src/auth.ts`, `api/sql/004_create_sessions.sql`, `api/test/auth.test.js`; update `api/src/app.ts`, `api/src/migrate.ts`, and `api/package.json`.

Add resident registration, shared login, current-user, and logout endpoints. Validate bounded input before hashing. Registration creates the user and first session in one transaction; duplicate email returns `409`. Login returns a generic `401` for bad credentials. Return only `{ id, name, email, role }`. Store the hashed 32-byte session token with an expiry; require `expires_at > UTC_TIMESTAMP()` when resolving it. Pause to trace what goes in the cookie versus MySQL.

Add `npm run staff:create`. Prompt for the password without echoing it or putting it in shell history, then insert the fixed `staff` role. There is no public staff registration route.

### 3. API authorization

**Files:** update `api/src/app.ts` and request API tests.

Protect request routes. Staff can list all reports and update status. Residents can create reports and list only reports whose `resident_id` matches their session. Set the owner from the authenticated session, never from request JSON. Reject residents' attempts to update status. Preserve parameterized SQL. Add exact-origin checks to registration, login, logout, report creation, and status updates. Enable credentials and `Vary: Origin` for the trusted frontend origin.

Pause to compare `401` (not authenticated) with `403` (authenticated, wrong role).

### 4. Shared login and role-specific pages

**Files:** add `web/pages/login.vue`, `web/utils/authApi.js`, `web/middleware/auth.global.js`; update `web/utils/requestApi.js`, `web/pages/index.vue`, `web/pages/report.vue`.

Use one page for resident registration and login. Route staff to `/` and residents to `/report` based on the backend response. Send cookies with browser API calls and forward the incoming cookie for Nuxt server-side checks. Show the signed-in account, add logout, load only the resident's requests on `/report`, and keep the staff inbox on `/`.

Pause to trace one login from the form through Express and MySQL back to the correct page.

### 5. Focused verification

Verify registration cannot create staff, bad login is generic, session expiry and logout return `401`, residents cannot see another resident's reports or change statuses, staff can see all reports and update status, and CORS rejects an untrusted origin. Check credentialed preflight/response headers and SSR cookie forwarding. Complete one browser walkthrough for each role.

## Known deployment condition

The local frontend and API share `127.0.0.1`, so an API-host-only cookie can be sent between their ports. Separate Cloud Run `run.app` hostnames are not a safe assumption for this cookie flow. Before deployment, put both behind the same public site via a custom domain/proxy, or select another verified same-site arrangement.
