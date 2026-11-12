# 💡 Lessons Learned & Production Hardening (`LESSONS_LEARNED.md`)

This document records architectural decisions, potential production pitfalls identified, and their implemented resolutions.

---

### 1. CORS Wildcard & Credentials Mismatch
- **Issue**: Default `app.use(cors())` sets `Access-Control-Allow-Origin: *`. When the frontend sends `credentials: 'include'` (cookies, JWT headers), modern browsers reject the response with a strict CORS violation error.
- **Resolution**: Configured a dynamic CORS origin validator in `server.js` using `process.env.CLIENT_URL` (supporting multiple comma-separated origins). Allowed dev access while enforcing strict origin matching in production.

---

### 2. Managed Database `CREATE DATABASE` Permission Denials
- **Issue**: Running DDL statements like `CREATE DATABASE IF NOT EXISTS` at server boot causes fatal permission errors (`ER_DBACCESS_DENIED_ERROR`) in managed cloud environments (AWS RDS, PlanetScale, Google Cloud SQL) where the application user does not possess cluster-level administration rights.
- **Resolution**: Isolated `CREATE DATABASE` to local development mode only with a non-blocking `try/catch`. If denied, it safely logs a warning and proceeds with testing the connection pool against the pre-provisioned database.

---

### 3. Server Crash on Unhandled Errors & Information Leakage
- **Issue**: Any unhandled rejection or synchronous error in an Express route crashes the Node process or emits full stack traces detailing internal directory paths and SQL queries to client browsers.
- **Resolution**: Added a centralized global error handler middleware:
  - Catches all errors forwarded by `next(err)`.
  - In production, scrubs stack traces and returns structured JSON `{ success: false, message: 'Internal Server Error' }`.
  - Emits stack traces only in `development` mode for fast debugging.

---

### 4. Brute Force & DDoS Vulnerability
- **Issue**: Open REST endpoints without rate limiting are susceptible to brute force credential attacks and denial of service.
- **Resolution**: Added `express-rate-limit` to all `/api/` endpoints (100 requests per 15-minute window by default, configurable via `RATE_LIMIT_MAX`).

---

### 5. Docker / Cloud Container Port Isolation
- **Issue**: Binding exclusively to `localhost` (`127.0.0.1`) prevents ingress traffic from reaching Node.js apps deployed inside Docker containers or Kubernetes pods.
- **Resolution**: Bound the listener explicitly to `0.0.0.0:PORT`.

---

### 6. Broken Transactions During Deployments (SIGTERM / SIGINT)
- **Issue**: Abrupt server termination during rolling cloud deployments cuts off running database transactions midway, resulting in partial writes and data corruption.
- **Resolution**: Implemented graceful shutdown hooks on `SIGTERM` and `SIGINT` that halt accepting new connections, finish inflight requests, close the MySQL pool via `pool.end()`, and exit cleanly.

---

### 7. Migration Failures & Half-Applied DDL State
- **Issue**: Running multiple SQL migration scripts sequentially without transaction boundaries leaves the database half-configured if a statement fails halfway, making manual recovery complex.
- **Resolution**: Designed a Node.js transactional migration runner (`src/migrations/runner.js`) that wraps each migration file execution within `START TRANSACTION ... COMMIT`, recording execution in `schema_migrations`. If a file fails, it immediately triggers a `ROLLBACK` and aborts safely.

---

### 8. Sub-Millisecond Auth via InnoDB Covering Index
- **Issue**: Querying the sessions table on every single HTTP API call causes high disk I/O and query latency under heavy concurrency.
- **Resolution**: Implemented a composite covering index on `sessions (token_hash, is_revoked, expires_at, user_type, user_id)`. The database engine fulfills the entire auth middleware check directly from the index in the InnoDB Buffer Pool without scanning clustered data blocks.

---

### 9. Same-Second JWT Generation & Duplicate Token Hash Collision
- **Issue**: When a user logs in twice within the same second (e.g., automated test suites, rapid re-authentication), `jwt.sign()` generates an identical string because default timestamp resolution (`iat`) is in seconds. This triggers a MySQL `ER_DUP_ENTRY` error on the unique `token_hash` index in `sessions`.
- **Resolution**: Included a cryptographically random RFC-7519 `jti: crypto.randomUUID()` in every JWT payload. This ensures 100% entropy and uniqueness for every issued token regardless of concurrency.

---

### 10. Eliminating Insecure Hardcoded Fallbacks (Zero Fallback Secrets Policy)
- **Issue**: Using default strings with logical OR (e.g. `process.env.JWT_SECRET || 'fallback_secret'`) in code violates production security standards (CWE-798). If an environment variable is omitted in production, the app silently boots with known default credentials.
- **Resolution**: Implemented a centralized strict validator (`src/config/env.js`) with `requireEnv()`. If any required secret (`JWT_SECRET`, `DB_NAME`, `DB_USER`, `DB_HOST`, `SUPERADMIN_*`, etc.) is missing from `.env`, the server aborts execution immediately with a clear fatal error. Hardcoded fallbacks have been completely eradicated across the codebase.

---

### 11. Comprehensive Server-Side Schema Validation with Zod
- **Issue**: Clients sending unexpected data types (e.g. strings instead of booleans, strings instead of numeric IDs, missing keys) caused unhandled runtime type errors or cryptic database exceptions.
- **Resolution**: Integrated `zod` schema validators across all routes (`src/validators/`). An explicit validation middleware checks payloads before controllers execute, returning standardized `statusCode: 400` errors with exact field-level diagnostics (`{ field, message }`).

---

### 12. Mass Assignment & Parameter Pollution Defense via `.strict()`
- **Issue**: Malicious clients often attempt mass assignment attacks by injecting unauthorized parameters (e.g., `{ "is_super_admin": true, "balance": 9999 }`) into request payloads.
- **Resolution**: Configured all Zod schemas with `.strict()`. Any unapproved parameters in request bodies are immediately rejected with `400 Bad Request` prior to reaching application controllers.

---

### 13. Brotli / Gzip Payload Optimization & Connection Keep-Alive
- **Issue**: Large JSON arrays (such as roles, permissions catalogs, audit logs) introduce mobile network latency.
- **Resolution**: Added `compression()` middleware to negotiate Brotli/Gzip content encoding automatically, shrinking payloads by ~70%, and enabled TCP Keep-Alive in MySQL connection pools to eliminate TCP handshake latency.

---

### 14. SPA Clean URLs: Migrating from Hash Routing to HTML5 History API
- **Issue**: The frontend was forcing a `#` in all URLs (e.g. `http://localhost:5173/#/login`), which looks outdated and complicates query string handling and deep-linking.
- **Resolution**: Replaced `location.hash` and `hashchange` listeners with `window.history.pushState()`, `window.history.replaceState()`, and `location.pathname`. Added automatic normalization so legacy `#` bookmarks seamlessly redirect to clean paths without reloading.

---

### 15. Concurrency & CPU-Intensive Hashing Bottlenecks in Node.js Event Loop
- **Issue**: Simulating 100 concurrent logins at the exact same millisecond took ~8.78 seconds, while standard read endpoints took only 5ms.
- **Resolution**: Diagnosed that `bcrypt.compare` is intentionally CPU-intensive (cost 10 = 1024 iterations). Because Node.js delegates bcrypt to the Libuv worker thread pool (default 4 threads), 100 requests queue in batches of 4. Node.js successfully handled all 100 logins with 0 dropped connections and zero memory leaks. To scale beyond 1,000 concurrent logins in production, recommended raising `UV_THREADPOOL_SIZE=16` or using PM2 cluster mode to utilize all CPU cores.

---

### 16. Zero-Fallback Environment Configuration in Vite Build Systems
- **Issue**: Using fallback expressions like `const backendUrl = env.VITE_BACKEND_URL || 'http://localhost:5000'` masks missing environment configuration and breaks deployment portability across staging and production environments.
- **Resolution**: Enforced strict environment retrieval in `vite.config.js` via `const backendUrl = env.VITE_BACKEND_URL;` and `import.meta.env.VITE_API_URL`. All environments define their target host strictly via `.env` files with zero hardcoded fallbacks in source code.

---

### 17. Unified Smart Authentication Gateways in Multi-Table Auth Schemas
- **Issue**: When an enterprise system isolates Superadmins (`admin_users`) from Staff (`dashboard_users`) into distinct database tables and login endpoints, forcing users to manually select their role on the login UI degrades UX and introduces operational friction.
- **Resolution**: Engineered a Unified Smart Auth Gateway (`src/core/api/authService.ts`) in the frontend. It transparently routes credentials to the appropriate endpoint, securely saves role and session tokens, and presents a cohesive, single-form login experience with SweetAlert2 notifications and GSAP micro-animations.

---

### 18. Inverted Boolean Route Guards & Fresh Visitor Auth Bypasses
- **Issue**: Checking for a negative state flag (e.g. `localStorage.getItem('Vels:signedout') === '1'`) creates a catastrophic security hole for fresh visitors, incognito users, or cleared caches. Because `null === '1'` evaluates to `false`, the router treated unauthenticated visitors as logged in and routed them directly to protected dashboard views.
- **Resolution**: Refactored the route guard across `main.ts` and `router.ts` to enforce a strict positive assertion: authentication requires the presence of a valid, non-empty JWT token (`Vels:token`). Any route access without this token immediately redirects to `/login`.

---

### 19. Full-Cycle Session Revocation Across Client and Database Layers
- **Issue**: Client-side logout handlers often clear visual user state (`active_user`) while leaving raw JWT tokens in storage and failing to notify the server, leaving active tokens in the database `sessions` table.
- **Resolution**: Implemented a complete revocation cycle in `main.ts` (`Nd()`): sends `POST /api/v1/auth/logout` with Bearer token to trigger database session invalidation (`is_revoked = 1`), purges all storage tokens, and redirects to login with historical back-navigation protection.

---

### 20. The Golden Rule of API Integration: Zero UI Layout Alteration
- **Issue**: When connecting backend API logic to an existing UI, adding unstyled wrapper `div`s (e.g. `<div class="login-card__fields">`) or injecting decorative icons (`<svg class="field__ico">`) breaks parent CSS Grid rules, causes shrink-to-fit button regressions, and misaligns inputs.
- **Resolution**: API integration must strictly respect the designer's existing DOM hierarchy and CSS class names. Only bind dynamic behavior (handlers, error state classes, disabled states) to existing elements without modifying the markup structure.

---

### 21. Server-Client Lockout Countdown Synchronization & Session Storage Persistence
- **Issue**:
  1. **Timer Discrepancy**: The backend calculated dynamic remaining minutes from the database timestamp (e.g., *"Try again in 11 minute(s)"*), but the frontend started a hardcoded 900-second (15:00) timer on every 429 response, causing a confusing visual contradiction.
  2. **State Loss on Reload**: The lockout state was kept purely in transient JavaScript memory. Reloading the page (F5) cleared the alert and restored an active submit button, leaving users confused until their next submission failed again.
- **Resolution**:
  - Backend now returns structured data `{ remainingSeconds, remainingMinutes, unlockAt }` along with the 429 response.
  - Frontend persists `{ email, unlockAt, message }` in `sessionStorage` (`Vels:lockout`).
  - On page load (`mount` / `enter`), the app checks `sessionStorage` and calculates the real remaining seconds until `unlockAt`. If still active, the amber alert banner is immediately restored, countdown resumes seamlessly, and the submit button remains disabled (`Account Locked`). On timer expiration, the form automatically unlocks.

---

### 22. The Pitfall of `Date.now()` Monkeypatching in Legacy Mock-Driven Codebases
- **Issue**: In `frontend/src/main.ts`, `Date.now` was monkeypatched (`Date.now = () => e() + t;`) to simulate "October 19, 2026" for mock dashboard telemetry and chart dates. When the lockout logic subtracted `Date.now()` from the server's real UTC timestamp `unlockAt` (November 12, 2026), it created a phantom 24-day (~34,895 minutes) offset!
- **Resolution**: Switched to `new Date().getTime()` in client-side time calculations, which reads the true wall-clock time from the un-monkeypatched `Date` prototype constructor, completely neutralizing the simulation offset.

---

### 23. Account-Level Lockout vs Form-Level Lockout Isolation
- **Issue**: When a staff user account is locked due to too many failed attempts, frontend logic previously disabled the submit button globally on the entire form. When a Superadmin or another staff user sat at the same workstation and changed the email input to an unlocked account (e.g. `admin@velsagro.com`), the submit button remained disabled (`Account Locked`) and the lockout alert remained stuck, preventing legitimate administrators from logging in.
- **Resolution**: Lockout states must be mapped per individual account identity in storage (`Record<email, LockoutEntry>`). An `input` event listener on the email field dynamically re-evaluates whether the currently typed email is locked. If the user changes to an unlocked email (like Superadmin), the warning alert clears instantly and the submit button unlocks ("Sign in"). If they switch back to the locked email, the lockout box and countdown timer immediately re-assert.
