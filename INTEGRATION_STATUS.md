# 🚀 Vels Agro — API Integration & Settings Architecture Status (`INTEGRATION_STATUS.md`)

This document is the central reference tracking all integrated APIs, backend API catalog, and the frontend settings page architecture.

---

## 📌 1. Currently Integrated & Active APIs (Frontend ↔ Backend Live)

The following endpoints are **100% integrated, tested, and actively functioning** between the Vite Vanilla TypeScript frontend (`http://localhost:5173`) and the Express.js MySQL backend (`http://localhost:5000`):

| # | Endpoint | Method | Status | Frontend Trigger / Location | Description & UI Experience |
|---|---|:---:|:---:|---|---|
| **1** | `/api/v1/auth/login` | `POST` | **LIVE** | [frontend/src/features/login/login.ts](file:///e:/dashborad%20clone/frontend/src/features/login/login.ts) | **Unified Auth Gateway**: Authenticates both Superadmin and Dashboard Staff in a single round-trip without duplicate requests or false lockout logs. |
| **2** | `/api/v1/auth/login` *(429 Handlers)* | `POST` | **LIVE** | [frontend/src/features/login/login.ts](file:///e:/dashborad%20clone/frontend/src/features/login/login.ts) | **Synchronized Lockout Box**: Receives dynamic `remainingSeconds` & `unlockAt` from backend; runs live MM:SS countdown; survives page reloads (F5) via `sessionStorage`. |
| **3** | Dynamic Account Switching | `Client` | **LIVE** | [frontend/src/features/login/login.ts](file:///e:/dashborad%20clone/frontend/src/features/login/login.ts) | **Per-Account Isolation**: If a staff email is locked, typing Superadmin (`admin@velsagro.com`) immediately clears the lockout banner and re-enables the submit button. |
| **4** | `/api/v1/auth/logout` | `POST` | **LIVE** | [frontend/src/main.ts](file:///e:/dashborad%20clone/frontend/src/main.ts) (`Nd()`) | **Server-Side Session Invalidation**: Revokes session in MySQL `sessions` table (`is_revoked = 1`), purges `localStorage`, and safely redirects to `/login`. |
| **5** | Session Hydration | `Local` | **LIVE** | [frontend/src/main.ts](file:///e:/dashborad%20clone/frontend/src/main.ts) (`kd()`) | **Topbar Profile Desync Fix**: Dynamically reads authenticated user data from `Vels:active_user` to show real name, initials, and role in `#btn-me`. |
| **6** | `/api/v1/auth/me` | `GET` | **LIVE** | [frontend/src/features/settings/subtabs/account.ts](file:///e:/dashborad%20clone/frontend/src/features/settings/subtabs/account.ts) | **Live User Profile**: Loads authenticated user profile (`name`, `email`, `jobTitle`, `phone`, `roleName`, `userType`, `createdAt`) into Account settings. |
| **7** | `/api/v1/auth/me` | `PUT` | **LIVE** | [frontend/src/features/settings/subtabs/account.ts](file:///e:/dashborad%20clone/frontend/src/features/settings/subtabs/account.ts) | **Save Profile & Email Lockout**: Updates full name, job title, and phone in MySQL DB (`admin_users` or `dashboard_users`). Strictly enforces immutability on Work Email (rejects tampering with `400 Bad Request`). |
| **8** | `/api/v1/auth/sessions` | `GET` | **LIVE** | [frontend/src/features/settings/subtabs/account.ts](file:///e:/dashborad%20clone/frontend/src/features/settings/subtabs/account.ts) | **Live Active Sessions**: Displays real sessions from MySQL `sessions` table with device/OS/browser, IP address, and "This device" tag. |
| **9** | `/api/v1/auth/sessions/revoke-others` | `POST` | **LIVE** | [frontend/src/features/settings/subtabs/account.ts](file:///e:/dashborad%20clone/frontend/src/features/settings/subtabs/account.ts) | **Sign Out Other Devices**: Revokes all other active sessions in the database while keeping current device active. |

---

## 📌 2. Backend REST API Catalog Ready for Integration

All of these endpoints are fully implemented with Zod validation, MySQL connection pooling, security headers, and tested in `node`:

### A. Staff User Management (`/api/v1/admin/dashboard-users`)
* `GET /api/v1/admin/dashboard-users` — List staff with search, pagination, and role filters.
* `GET /api/v1/admin/dashboard-users/:id` — Get single staff profile.
* `POST /api/v1/admin/dashboard-users` — Create new staff member (with bcrypt password and role ID).
* `PUT /api/v1/admin/dashboard-users/:id` — Update staff profile details (name, phone, role).
* `PATCH /api/v1/admin/dashboard-users/:id/status` — Toggle active / inactive status.
* `POST /api/v1/admin/dashboard-users/:id/reset-password` — Admin-initiated password reset.

### B. Roles & Permissions Matrix (`/api/v1/admin/roles`)
* `GET /api/v1/admin/roles` — List all roles with user count and permission codes.
* `GET /api/v1/admin/roles/permissions` — Catalog of all 16 system permissions.
* `GET /api/v1/admin/roles/:id` — Single role details and assigned permissions.
* `POST /api/v1/admin/roles` — Create custom role.
* `PUT /api/v1/admin/roles/:id` — Update role permissions.
* `DELETE /api/v1/admin/roles/:id` — Delete custom role (system roles are protected).

### C. Audit Logs & Security Telemetry (`/api/v1/admin`)
* `GET /api/v1/admin/audit-logs` — Paginated audit history (actor, action, resource, timestamp, IP).
* `GET /api/v1/admin/login-attempts` — Brute-force monitoring and lockout audit trail.

---

## 📌 3. Settings Pages Source Code Analysis

The settings module uses a unified subtab orchestrator:
* **Orchestrator**: [frontend/src/features/settings/settings.ts](file:///e:/dashborad%20clone/frontend/src/features/settings/settings.ts)
* **Styles**: [frontend/src/features/settings/settings.css](file:///e:/dashborad%20clone/frontend/src/features/settings/settings.css)
* **Shared Form Controls**: [frontend/src/features/settings/components/form-controls.ts](file:///e:/dashborad%20clone/frontend/src/features/settings/components/form-controls.ts)

Here is the exact analysis of the 3 requested pages:

### 1️⃣ Account Settings (`http://localhost:5173/settings/account`) — **[INTEGRATED & LIVE]**
* **Source File**: [frontend/src/features/settings/subtabs/account.ts](file:///e:/dashborad%20clone/frontend/src/features/settings/subtabs/account.ts)
* **What it currently renders**:
  1. **Profile Card**: Full name, Work email (read-only identity), Job title, Phone number. Connected live to `GET /api/v1/auth/me` and updates MySQL via `PUT /api/v1/auth/me`.
  2. **Active Sessions ("Where you’re signed in")**: Real sessions loaded from MySQL `sessions` table via `GET /api/v1/auth/sessions`. Clicking "Sign out other sessions" invokes `POST /api/v1/auth/sessions/revoke-others`.
  3. **Privileges & Security Card**: Displays live Account Tier (Tier 1 Super Administrator / Tier 2 Staff), Security status, Assigned role, and Session protocol.
  4. **Password Card**: **Removed** as requested (admin panel does not support self password changes on this page).
  5. **Appearance & Accent Theme**: Light / Dark / System theme selector and custom color palette accent picker.

---

### 2️⃣ Company Settings (`http://localhost:5173/settings/company`)
* **Source File**: [frontend/src/features/settings/subtabs/company.ts](file:///e:/dashborad%20clone/frontend/src/features/settings/subtabs/company.ts)
* **What it currently renders**:
  1. **Business Details Card**: Trading name, Legal name, Contact email, Phone, Registered address, EIN/Tax ID, Currency (INR/USD), Time zone, Financial year starting month. Reads/writes `store.settings.company`.
  2. **Data Export & Maintenance Card**: One-click CSV export buttons for Stock, Orders, and Stock Ledger, plus a "Reset demo data" danger zone button.
  3. **Stock & Inventory Preferences**: Expiry warning threshold (30d, 60d, 90d, 180d) and Location stock reorder rules.
* **Target Backend Mapping**:
  * Company details and inventory threshold preferences can be backed by a MySQL `company_settings` table or configuration endpoint.

---

### 3️⃣ Team & Roles Settings (`http://localhost:5173/settings/team`)
* **Source File**: [frontend/src/features/settings/subtabs/team.ts](file:///e:/dashborad%20clone/frontend/src/features/settings/subtabs/team.ts)
* **What it currently renders**:
  1. **Team Metrics Banner**: 4 KPI cards showing Total Members, Active today, Pending invites, and Seats left.
  2. **Members Roster Table**:
     - Search input ("Search people…") with live filtering.
     - Role filter chips (`Everyone`, `Admin`, `Manager`, `Staff`, `Viewer`).
     - Staff list showing Name, Work location, Role, Status badge (`Active`, `Away`, `Invited`), and Action menu.
  3. **Invite Teammate Action**: Opens the invite modal to create a new team user.
  4. **Permissions Matrix Table ("What each role can do")**: Comprehensive capability table listing allowed features per role.
  5. **Member Detail Drawer**: Clicking any staff member opens a slide-over drawer showing their details, role switcher, and remove button.
* **Target Backend Mapping**:
  * **100% Direct Match with our Backend API**:
    * Members list & search: `GET /api/v1/admin/dashboard-users`
    * Invite / Create staff: `POST /api/v1/admin/dashboard-users`
    * Role switcher: `PUT /api/v1/admin/dashboard-users/:id`
    * Toggle active / inactive status: `PATCH /api/v1/admin/dashboard-users/:id/status`
    * Role Matrix & Permissions: `GET /api/v1/admin/roles` & `GET /api/v1/admin/roles/permissions`

---

## 📌 4. Next Integration Priority
1. **Team & Roles (`/settings/team`)**: Wire the members table to live MySQL `dashboard_users` and role permissions from `roles` table.
2. **Account Profile (`/settings/account`)**: Bind current logged-in Superadmin/Staff details and live password update endpoint.
