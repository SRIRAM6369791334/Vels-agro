# 🚀 Deployment, DevOps & Production Hardening

## 1. Production Architecture Overview

The frontend compiles to optimized static assets (HTML, CSS, JS chunks, WebP/JPEG images) that can be served via high-performance edge networks (Cloudflare Pages, Vercel, AWS CloudFront + S3) or co-hosted alongside the Node.js backend.

```
       [Client Browser]
              │
              ▼ HTTPS / TLS 1.3
     [Cloudflare CDN / Edge]
              │
       ┌──────┴──────┐
       │             │
       ▼             ▼
  [Static S3]   [Node.js API]
 (Frontend UI)    (/api/v1)
```

---

## 2. Production Build Pipeline

```bash
# 1. Clean installation of locked dependencies
npm ci

# 2. Strict static type check
npm run typecheck

# 3. Compile optimized production bundles
npm run build
```

### Build Output Specifications:
- Output Directory: `dist/`
- Target: `esnext`
- Chunks: Feature chunks (`dashboard-[hash].js`, `orders-[hash].js`, etc.) loaded asynchronously on demand.
- CSS: Single unified minified stylesheet (`index-[hash].css`) containing all feature tokens.

---

## 3. Docker Containerization

For self-hosted Kubernetes or Docker Swarm deployments, use this multi-stage `Dockerfile`:

```dockerfile
# Stage 1: Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json tsconfig.json vite.config.js ./
RUN npm ci
COPY . .
RUN npm run typecheck
RUN npm run build

# Stage 2: Minimal Production Web Server (Nginx Alpine)
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Production `nginx.conf`:
```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;

    # Immutable asset caching
    location ~* \.(?:css|js|woff2?|svg|png|jpg|ico)$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # SPA Router fallback
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
```

---

## 4. GitHub Actions CI/CD Pipeline (`.github/workflows/ci.yml`)

```yaml
name: Vessa Frontend CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: TypeScript Typecheck
        run: npm run typecheck

      - name: Production Build
        run: npm run build

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps

      - name: Run Playwright E2E Tests
        run: npm test

      - name: Upload Test Report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 5. Environment Configuration

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `http://localhost:3000/api/v1` | Backend Node.js REST API target. |
| `VITE_ENABLE_ANALYTICS` | `false` | Enable client-side telemetry. |
| `VITE_SIMULATE_TIME` | `true` | Anchors simulated demo timestamps for consistent QA. |
