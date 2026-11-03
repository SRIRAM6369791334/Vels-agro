# 🛡️ Security Audit, Role-Based Access Control (RBAC) & Data Protection

## 1. Security Overview

Vessa manages sensitive cosmetic formulation batches, commercial pricing, wholesale customer identities, and physical warehouse inventory. The frontend adheres to strict client-side security standards to prevent Cross-Site Scripting (XSS), data exfiltration, and unauthorized privilege escalation.

---

## 2. Threat Vector Mitigation Matrix

| Threat Vector | Risk Level | Client-Side Defense Mechanism | Implementation File |
| :--- | :--- | :--- | :--- |
| **DOM-based XSS** | Critical | Strict HTML escaping on all dynamic template interpolations via `escapeHtml()`. | `src/utils/dom.ts` |
| **Clickjacking** | High | Frame-busting headers (`X-Frame-Options: DENY`, `Content-Security-Policy: frame-ancestors 'none'`). | `vite.config.js` |
| **Token Theft** | High | Auth tokens stored in `httpOnly` secure cookies rather than `localStorage`. | `src/main.ts` |
| **Privilege Escalation**| Medium | Client-side UI gates backed by mandatory server-side JWT claim verification. | `src/features/settings/settings.ts` |
| **CSV Injection** | Medium | Quotation sanitization on formula characters (`=`, `+`, `-`, `@`) during export. | `src/utils/csv.ts` |

---

## 3. Role-Based Access Control (RBAC) Matrix

The system enforces 5 distinct authorization tiers:

```
[Owner] ──► [Admin] ──► [Manager] ──► [Staff] ──► [Viewer]
 (Full)     (Config)   (Operations)  (Picking)   (Read-Only)
```

| Action / Capability | Owner | Admin | Manager | Staff | Viewer |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **View Dashboard & Inventory Reports** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Pick-Pack-Ship Kanban Operations** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Create Sales Orders & Customer Accounts** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Create & Release Production Batches (QA)**| ✅ | ✅ | ✅ | ❌ | ❌ |
| **Issue Purchase Orders to Raw Suppliers** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Perform Physical Stock Adjustments** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Modify Lab Preferences & Expiry Thresholds**| ✅ | ✅ | ❌ | ❌ | ❌ |
| **Invite / Remove Teammates & Change Roles** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Export Commercial Financial Data (CSV)** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Delete Lab Account or Reset Data** | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 4. XSS Sanitization Standard

Dynamic HTML string concatenation in Vanilla TypeScript is vulnerable to injection if unescaped strings reach `.innerHTML`.
In Vessa, direct interpolation of user or API input without `escapeHtml()` is prohibited:

```typescript
// ❌ INSECURE: Dangerous innerHTML injection
container.innerHTML = `<h1>Welcome back, ${user.name}!</h1>`;

// ✅ SECURE: Escaped HTML sanitization
import { escapeHtml } from '@/utils';
container.innerHTML = `<h1>Welcome back, ${escapeHtml(user.name)}!</h1>`;
```

`escapeHtml()` sanitizes the 5 critical HTML control characters:
- `&` ➔ `&amp;`
- `<` ➔ `&lt;`
- `>` ➔ `&gt;`
- `"` ➔ `&quot;`
- `'` ➔ `&#39;`

---

## 5. CSV Data Export Sanitization

When generating CSV files for Excel, users might input malicious formulas into product names (e.g. `=cmd|' /C calc'!A0`).
`src/utils/csv.ts` automatically wraps fields in double quotes and prefixes dangerous formula triggers to prevent execution.
