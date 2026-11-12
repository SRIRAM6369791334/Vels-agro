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
