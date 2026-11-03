# 🌿 Vessa — Skincare Lab Inventory & Supply Management System

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF.svg)](https://vitejs.dev/)
[![GSAP](https://img.shields.io/badge/GSAP-3.12-88CE02.svg)](https://gsap.com/)
[![Playwright](https://img.shields.io/badge/Playwright-E2E-45ba4b.svg)](https://playwright.dev/)
[![Clean Architecture](https://img.shields.io/badge/Architecture-Feature--First-orange.svg)]()

> **Vessa** is an enterprise-grade inventory, production batch tracking, sales order fulfillment (Pick-Pack-Ship), purchasing, and multi-location warehouse management system designed for specialized cosmetic and skincare laboratories.

---

## 📑 Table of Contents
1. [Key Features](#-key-features)
2. [Architecture Overview](#-architecture-overview)
3. [Tech Stack](#-tech-stack)
4. [Project Structure](#-project-structure)
5. [Quickstart & Development](#-quickstart--development)
6. [Automated Testing](#-automated-testing)
7. [Enterprise Documentation Suite](#-enterprise-documentation-suite)

---

## 🚀 Key Features

### 1. 📊 Executive Dashboard & KPIs
- **Real-Time KPIs**: Units on hand, Total stock valuation (at cost & retail), and Low-stock / Expiring alerts.
- **Interactive SVG Charts**: Dynamic stock-in vs. stock-out bar charts, fan gauge meters, and sparkline trends.
- **Ships Today & Live Activity Feed**: Immediate overview of daily fulfillment progress and chronological lab activity.

### 2. 🧴 Products & Production Batch Management
- **12 Flagship Cosmetic SKUs**: Complete catalog with categorical filters (Cleanse, Treat, Moisturise, Protect, Body).
- **Batch / Lot Tracking**: Regulatory compliance with QA Release status (`quarantine`, `released`, `hold`, `expired`), production dates, and expiry countdowns.
- **Stock Movement Ledger**: Full audit trail of receipts, productions, allocations, and manual adjustments.

### 3. 📦 Order Fulfillment (Pick-Pack-Ship Kanban)
- **Interactive Kanban Board**: Visual stages (`New`, `Picking`, `Packed`, `Shipped`, `Delivered`).
- **Omnichannel Support**: Segregated channels for Wholesale Stockists, Direct Online Shoppers, and Studio Retail.
- **Customer Returns**: RMA workflow with return reasons, QA inspection, restocking, and refund tracking.

### 4. 🛒 Purchasing & Supplier Directory
- **Purchase Orders (PO)**: Raw materials procurement, partial receipts, draft-to-sent lifecycle.
- **Global Suppliers**: Directory of certified ingredient suppliers with lead times, contacts, and material links.

### 5. 🏭 Multi-Location Warehouses & Cycle Counts
- **3 Coordinated Sites**: Riverside DC (Distribution), Lab (Production), and Studio Shop (Retail).
- **Inter-site Transfers**: Planned, in-transit, and received stock relocations.
- **Cycle Counts**: Scheduled physical inventory reconciliation with variance calculation.

### 6. 📈 Financial & Valuation Analytics
- **Revenue Analytics**: Turnover ratios, gross margin analysis, sales trends by category.
- **CSV Data Exporter**: Instant client-side export for Orders, Stock on Hand, and Inventory Movements.

### 7. ⚙️ Lab Preferences, Roles & Command Palette
- **Command Palette (⌘K / Ctrl+K)**: Instant fuzzy search across products, orders, suppliers, and customers.
- **Theming & Accents**: Light/Dark mode with persistence, and lab accent palettes (Pine, Cobalt, Ocean, Graphite, Custom).
- **Role-Based Access**: Role definitions for Owner, Admin, Manager, Staff, and Viewer.

---

## 🏛️ Architecture Overview

The frontend is constructed using a **Pure Vanilla TypeScript, Feature-First Clean Architecture** inspired by Flutter and Clean Code principles:
- **No Heavy Framework Overhead**: Sub-millisecond rendering and direct DOM updates without React/Vue virtual-DOM reconciliation bottlenecks.
- **Feature-First Decoupling**: Each domain module (`features/*`) owns its logic, styles, and lifecycle hooks (`mount`, `enter`, `leave`).
- **Reactive State Container**: Centralized immutable event-driven store with persistent local storage caching.
- **Motion Engine**: Hardware-accelerated GSAP timelines with complete reduced-motion accessibility fallbacks.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Language** | **TypeScript 5.x** | Strict domain contracts, type-safe models, zero `any` |
| **Bundler / Dev** | **Vite 6.x** | Instant HMR, Rollup production bundling |
| **Animations** | **GSAP 3.12 + Flip** | Fluid micro-interactions, layout morphing, staggered reveals |
| **Styling** | **Native CSS Design Tokens** | CSS variables, container queries, color-mix light/dark modes |
| **Testing** | **Playwright Test 1.49** | End-to-end browser automation & visual assertions |
| **Icons** | **Inline SVG Engine** | Lightweight zero-network icon catalog |

---

## 📁 Project Structure

```
frontend/
├── index.html                  # HTML5 Shell & pre-paint theme bootstrap
├── package.json                # Project dependencies & scripts
├── tsconfig.json               # TypeScript compiler rules
├── vite.config.js              # Vite bundling pipeline
├── playwright.config.js        # Playwright test configuration
│
├── public/                     # Static media & assets
│   ├── favicon.ico, favicon.svg, apple-touch-icon.png
│   └── photos/vessa/           # Skincare product photography
│
├── tests/                      # Playwright E2E suites
│   └── vessa.spec.js           # 7 master test suites
│
└── src/                        # 🏛️ TypeScript Source
    ├── core/                   # Motion engine & reduced-motion helpers
    ├── data/                   # Business constants, status enums, color tones
    ├── types/                  # Strict TypeScript domain interfaces
    ├── ui/                     # Global interactive overlays (Modal, Drawer, Toast)
    ├── utils/                  # Pure utility functions (DOM, Formatters, CSV, Icons)
    ├── shared/widgets/         # Shared chart engine (Line, Bar, Donut, Fan meters)
    ├── features/               # 🎯 9 Decoupled Domain Modules
    │   ├── dashboard/
    │   ├── products/
    │   ├── orders/
    │   ├── purchasing/
    │   ├── warehouses/
    │   ├── analytics/
    │   ├── customers/
    │   ├── settings/
    │   └── help/
    ├── main.css                # Global stylesheet & design tokens
    └── main.ts                 # Application Shell & Dynamic Feature Router
```

---

## ⚡ Quickstart & Development

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 2. Installation
```bash
# Navigate to frontend directory
cd "E:\dashborad clone\frontend"

# Install dependencies
npm install
```

### 3. Local Development Server
```bash
npm run dev
```
Open your browser at: `http://localhost:5173`

### 4. Typecheck & Production Build
```bash
# Typecheck with TypeScript
npm run typecheck

# Production build
npm run build

# Preview production build locally
npm run preview
```

---

## 🧪 Automated Testing

The suite uses **Playwright** for deep cross-browser and interaction verification:
```bash
# Run all E2E tests headlessly
npm test

# Run tests with interactive UI mode
npx playwright test --ui
```

---

## 📚 Enterprise Documentation Suite

For comprehensive engineering specifications, consult the companion architectural guides:
- [ARCHITECTURE.md](file:///E:/dashborad%20clone/frontend/ARCHITECTURE.md) — Architectural patterns, dependency boundaries & lifecycle.
- [API_CONTRACTS.md](file:///E:/dashborad%20clone/frontend/API_CONTRACTS.md) — Backend REST specifications & payload schemas.
- [DATABASE_SCHEMA.md](file:///E:/dashborad%20clone/frontend/DATABASE_SCHEMA.md) — Relational schema & entity relationships for the Node.js backend.
- [PROJECT_STATE.md](file:///E:/dashborad%20clone/frontend/PROJECT_STATE.md) — Current sprint status & verified test receipts.
- [LESSONS_LEARNED.md](file:///E:/dashborad%20clone/frontend/LESSONS_LEARNED.md) — Incident logs & architectural decisions.
- [TESTING_STRATEGY.md](file:///E:/dashborad%20clone/frontend/TESTING_STRATEGY.md) — E2E test gates, assertions & fixtures.
- [SECURITY_AUDIT.md](file:///E:/dashborad%20clone/frontend/SECURITY_AUDIT.md) — RBAC matrix, XSS sanitization & data protection.
- [DEPLOYMENT_DEVOPS.md](file:///E:/dashborad%20clone/frontend/DEPLOYMENT_DEVOPS.md) — Docker, CI/CD pipelines & production hosting.
- [AI_DEV_GUIDELINES.md](file:///E:/dashborad%20clone/frontend/AI_DEV_GUIDELINES.md) — Coding conventions & engineering protocol for AI agents and human developers.
