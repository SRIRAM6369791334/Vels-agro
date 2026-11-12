# 🔄 Development & Engineering Process (`PROCESS.md`)

## 1. 🏗️ Architecture Standards
- **Runtime**: Node.js v22+ (Native ES Modules `import`/`export`)
- **Backend Framework**: Express.js
- **Database Access**: `mysql2/promise` with Connection Pooling
- **Security Standard**: `helmet`, `express-rate-limit`, explicit origin `cors`
- **Environment Isolation**: `.env` for secrets, `.env.example` committed for templates

---

## 2. 📂 Project Organization & Directory Standards
```text
node/
├── src/
│   ├── config/        # Environment and DB pool configurations
│   ├── controllers/   # Request/response handlers, validation, status codes
│   ├── models/        # MySQL table models, queries, data mappers
│   ├── routes/        # Express routers grouped by feature (/api/v1/...)
│   └── middlewares/   # JWT auth guards, request validators, error handlers
├── .env              # Local runtime configuration (git-ignored)
├── .env.example      # Sample production template
├── .gitignore
├── package.json
└── server.js         # Entry point, middlewares, port listener, graceful shutdown
```

---

## 3. 🛡️ Coding & Production Rules
1. **Never Hardcode Secrets**: All database passwords, tokens, and sensitive ports must reside in `.env`.
   - `JWT_SECRET=vels_agro_super_secure_jwt_secret_key_2026_xyz`
   - `JWT_EXPIRES_IN=8h`
2. **Never Return Stack Traces in Production**: Error handlers must sanitize outputs when `NODE_ENV === 'production'`.
3. **Always Clean Up Connections**: Use `conn.release()` on pool connections or query directly via `pool.query()`.
4. **Graceful Shutdown**: The process must capture `SIGTERM` and `SIGINT` to close open sockets and DB pools safely.
5. **Port Binding**: Always bind to `0.0.0.0` to ensure Docker and cloud environment compatibility.

---

## 4. 🚀 Local Running Commands
```bash
# Start backend in development mode (hot-reloading)
cd node
npm run dev

# Start backend in production mode
npm start
```
