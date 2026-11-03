# 🧠 UI Knowledge Library & Design System Architecture
> **Target Project:** `E:\dashborad clone\frontend`  
> **Audience:** AI Coding Agents & Full-Stack Engineers  
> **Domain:** Industrial Machinery Parts E-Commerce & Inventory Admin Application  
> **Last Updated:** 2026-10-26

---

## 1. Executive Summary & Design Philosophy

This frontend application is an ultra-modern, editorial, high-performance Web Application designed with a **tactile physical interface** aesthetic (soft rounded corners, layered neutral elevations, subtle glassmorphic glows, and GSAP micro-interactions).

### Key Architectural Traits
1. **Zero-Fat Pure TypeScript + Vite**: No heavy UI frameworks (No React/Vue overhead). Pure DOM manipulation optimized with GPU-accelerated GSAP transforms.
2. **Dual-Theme Engine**: Native Light and Dark themes with dynamic accent shifting (`pine`, `cobalt`, `ocean`, `graphite`).
3. **Flutter-Style Feature Architecture**: Organized strictly by feature domains (`src/features/*`), shared UI (`src/ui/*`), types (`src/types/*`), and core animations (`src/core/*`).
4. **Declarative Route & Pill-Tab System**: Sidebar controls top-level section; Header Pill Track (`#tabs`) controls sub-views with smooth FLIP sliding pills.

---

## 2. Global Design Tokens & Typography

Defined inside [src/main.css](file:///E:/dashborad%20clone/frontend/src/main.css):

### 2.1 Typography
* **Primary Font**: `'Urbanist', ui-sans-serif, system-ui, -apple-system, sans-serif`
* **Weights**: `400` (Regular), `500` (Medium), `600` (Semi-bold), `700` (Bold)
* **Type Scale**:
  * `--fs-2xs`: `11px` (Micro labels, table badges)
  * `--fs-xs`: `12px` (Filter counts, timestamps)
  * `--fs-sm`: `12.5px` (Secondary text, table headers)
  * `--fs-md`: `13.5px` (Button text, form labels)
  * `--fs-base`: `14px` (Standard body text)
  * `--fs-lg`: `15px` (Card titles, table values)
  * `--fs-xl`: `17px` (Section subtitles)
  * `--fs-2xl`: `20px` (Modal headers)
  * `--fs-3xl`: `22px` (View subheadings)
  * `--fs-4xl`: `26px` (Stat values)
  * `--fs-display`: `34px` (Main Page Title)

### 2.2 Color Roles & Surfaces
| Token | Light Theme | Dark Theme (`[data-theme="dark"]`) | Usage |
| :--- | :--- | :--- | :--- |
| `--bg` | `#eef0ec` (Muted Warm Bone) | `#0f1412` (Deep Charcoal Slate) | App Canvas |
| `--surface` | `#fcfdfc` (Off-white) | `#171d1a` (Elevated Panel) | Card body, Containers |
| `--surface-2` | `#f3f5f2` (Light Tint) | `#1c231f` (Mid Panel) | Hover states, Inputs |
| `--raised` | `#ffffff` (Pure White) | `#242c28` (Top Layer) | Modals, Dropdowns, Cards |
| `--well` | `#14241c0e` (Inset Shadow) | `#ffffff0e` | Inset backgrounds, Segments |
| `--line` | `#14241c16` | `#ffffff14` | Sub-dividers, card borders |
| `--line-2` | `#14241c2b` | `#ffffff29` | Table borders, active outlines |
| `--text` | `#18201b` (Near-Black) | `#ecf2ee` (Near-White) | Primary Headings, Text |
| `--muted` | `#56615a` | `#a8b4ad` | Sub-labels, Descriptions |
| `--faint` | `#6c7770` | `#88948d` | Disabled icons, place-holders |

### 2.3 Semantic Brand & Status Accents
* `--primary`: `#a8481c` (Industrial Terracotta / Burnt Orange)
* `--pine`: `#b9531f` (Primary warm accent)
* `--good`: `#23804d` / `#6fd38e` (In-Stock, Delivered, Active)
* `--warn`: `#93600a` / `#f2c056` (Low-Stock, Picking, Pending Approval)
* `--bad`: `#bf3a2d` / `#f58c7f` (Out of Stock, Cancelled, Danger action)
* `--info`: `#2f63b8` / `#8bb3f6` (Processing, Informative badges)
* `--ocean`: `#1f7f99` / `#5cbcd6` (Machinery / Equipment tags)
* `--ochre`: `#c88a12` / `#f2c056` (Batch / Lot warnings)
* `--teal`: `#1d8a7b` / `#4fcab8` (Logistics, Shipments)

---

## 3. Layout Shell Anatomy

The layout uses a 3-tier structure defined in [index.html](file:///E:/dashborad%20clone/frontend/index.html):

```
+-----------------------------------------------------------------------------------+
|  BRAND LOGO   |  TOP PILL TABS (#tabs)               | SEARCH ⌘K | NOTIF | + NEW | ME  |
|  (Fixed Top)  |  [Pill 1]  [Pill 2]  [Pill 3]        | (Top Tools bar)                |
+---------------+-------------------------------------------------------------------+
|  [RAIL SIDE]  |  MAIN VIEWPORT (#main)                                            |
|  • Dashboard  |  +-------------------------------------------------------------+  |
|  • Products   |  | .head (Page Title, Subtitle, Quick Action Buttons, KPI Stats)|  |
|  • Orders     |  +-------------------------------------------------------------+  |
|  • Purchasing |  |                                                             |  |
|  • Warehouses |  |  ACTIVE SUB-VIEW CONTAINER (data-sub="...")                 |  |
|  • Analytics  |  |  • Search / Filter bar (Pills, Sort dropdown, Grid/List)    |  |
|  • Customers  |  |  • Data Grid Cards or Table Rows                           |  |
|  • Settings   |  |                                                             |  |
|  -------------|  |                                                             |  |
|  ☼/☽ Theme Sw |  |                                                             |  |
|  Collapse Rail|  |                                                             |  |
+---------------+-------------------------------------------------------------------+
```

### 3.1 The Rail Sidebar (`.rail`)
* Width: `76px` collapsed (default desktop), expandable to `220px` via `.side-open`.
* Contains `.nav__track` with SVG icon buttons.
* Dynamic badge counts (`.nav__count`) bound to data store (`data-count="products"`).
* Interactive tooltips (`.rail-tip`) appear on hover when sidebar is collapsed.

### 3.2 The Top Header & Floating Pill Track (`.top`)
* Height: `80px`. Sticky at top.
* **Top Navigation Track (`#tabs`)**:
  * Houses the sub-tabs for the current active feature.
  * Driven by `Vu[route].subs` in [src/main.ts](file:///E:/dashborad%20clone/frontend/src/main.ts).
  * Has a sliding pill (`.tabs__pill`) that smoothly glides underneath the active tab using GSAP physics.

### 3.3 The Main Viewport (`#main`)
* Hosts multiple `<section class="view" data-view="..."></section>`.
* Only the active view is displayed (`hidden` attribute toggled by routing).

---

## 4. Routing & Pill-Tabs Engine

Navigation operates via hash-based routing: `#/feature/sub-tab[/id]`.

### 4.1 Route Definition Registry (`Vu` in `src/main.ts`)
```typescript
const Vu = {
  products: {
    label: "Products",
    icon: "box",
    subs: [
      ["catalog", "Master List"],
      ["edit", "Add / Edit Product"],
      ["categories", "Categories & Brands"],
      ["compatibility", "Model Compatibility"]
    ],
  },
  orders: {
    label: "Orders",
    icon: "orders",
    subs: [
      ["all", "All orders"],
      ["board", "Board"],
      ["returns", "Returns"],
    ],
  },
  // ...other features
};
```

### 4.2 How the Top Pill Bar Animates
1. User clicks or hash changes to `#/products/compatibility`.
2. Router parses route `name: "products"` and `params: ["compatibility"]`.
3. Function `nd(name, subKey)` in `main.ts` updates `.tab[data-sub]` elements.
4. Function `Hc(pillElement, trackElement, activeTab, animated)` calculates exact offset (`offsetLeft`, `offsetWidth`) and smoothly moves `.tabs__pill` with GSAP:
   ```typescript
   gsap.to(pill, {
     x: targetTab.offsetLeft,
     width: targetTab.offsetWidth,
     duration: 0.35,
     ease: "power3.out"
   });
   ```

---

## 5. UI Component Hierarchy & Design Patterns

### 5.1 Page Header (`.head`)
Every major view renders a consistent `.head`:
```html
<header class="head">
  <div class="head__lead">
    <p class="head__eyebrow">Inventory &amp; Spares</p>
    <h1 class="head__title">Catalog</h1>
  </div>
  <div class="head__actions">
    <button type="button" class="btn btn--ghost btn--sm">Export CSV</button>
    <button type="button" class="btn btn--primary btn--sm">+ Add Part</button>
  </div>
  <div class="head__stats">
    <!-- Stat Cards -->
  </div>
</header>
```

### 5.2 KPI Stat Cards (`.stat`)
Displays summary metrics with animated numbers and status tones:
```html
<div class="stat">
  <span class="stat__label">Units on hand</span>
  <div class="stat__row">
    <b class="stat__val">4,345</b>
    <span class="stat__sub">3 locations</span>
  </div>
</div>
```

### 5.3 Filter & Search Bar (`.filter-bar`)
```html
<div class="filter-bar">
  <div class="filter-bar__pills">
    <button class="pill is-active">All (12)</button>
    <button class="pill">JCB Spares</button>
    <button class="pill">Hydraulics</button>
  </div>
  <div class="filter-bar__search">
    <input type="text" placeholder="Search by SKU, Part No, Model..." class="input--search" />
  </div>
  <div class="filter-bar__view-toggle">
    <button class="seg-btn is-active">Grid</button>
    <button class="seg-btn">List</button>
  </div>
</div>
```

### 5.4 Standard Buttons (`.btn`)
* `.btn--primary`: Filled terracotta primary button with hover brightness.
* `.btn--ghost`: Frosted border with surface background.
* `.btn--soft`: Translucent tint background (ideal for secondary tags and actions).
* `.btn--danger` / `.btn--bad`: Alert red for destructive deletions.
* `.btn--sm`: 36px height (compact toolbars).
* `.btn--xs`: 30px height (table inline actions).
* `.ibtn`: 40px circular icon button for tools and close triggers.

### 5.5 Dialogs: Modals & Slide-over Drawers
All overlays reside in `index.html`:
* `<dialog class="modal" id="modal"></dialog>`: Centered popups (Quick Create, Adjust Stock, Delete Confirm).
* `<dialog class="drawer" id="drawer"></dialog>`: Right-side full-height slide-over (Batch Inspector, Product Detail, Order Details).
* `<div class="toast" id="toast"></div>`: Animated pill notifications.

---

## 6. GSAP Motion & Micro-Interaction System

Managed in [src/core/motion.ts](file:///E:/dashborad%20clone/frontend/src/core/motion.ts):

1. **Accessibility Gate (`prefers-reduced-motion`)**:
   `motionDuration(seconds)` returns `0` if user has reduced motion enabled. Always wrap durations in `motionDuration()`.
2. **Card Grid Stagger (`animateCards`)**:
   Enters cards with `opacity: 0, y: 34, scale: 0.985` staggered by `0.07s` using `power3.out`.
3. **Table Row Stagger (`animateRows`)**:
   Enters rows with `opacity: 0, y: 12` staggered by `0.045s`.
4. **Header Character Splits (`oo(element)`)**:
   Splits title letters into `<span class="ch">` and applies an editorial wave roll on mount.
5. **Magnetic Cursor Physics (`bindMagnetic`)**:
   Primary buttons and navigation pills gently pull toward cursor on hover.

---

## 7. Machine Parts Domain Adaptation Guide

How existing components map directly to the **Sai Techno Solutions Machinery Parts** spec:

| Feature Target | Existing UI Base | Machinery Adaptation Requirements |
| :--- | :--- | :--- |
| **Product Master List** | `features/products/products.ts` | Replace cosmetic jars with Machinery parts (Oil Filters, Hydraulic Pumps, Gaskets). Add Part Number & SKU search. |
| **Model Compatibility** | New Sub-view in `products` | Interactive table linking Part No $\to$ Machine Brand (JCB, CAT, Tata) $\to$ Machine Model (3DX, 432F) $\to$ Year. |
| **Central Inventory** | `features/warehouses/warehouses.ts` | Multi-location stock allocation (Central DC, Regional Hubs, Dealer Consignment). Stock-in / Stock-out logging. |
| **Order Packing Board** | `features/orders/orders.ts` (Board) | Drag-and-drop Pick $\to$ Pack $\to$ Ship $\to$ Deliver stages with AWB Courier integration. |
| **Dealers & Wholesale** | `features/customers/customers.ts` | B2B Dealer credit limits, Wholesale discount tiers, and KYC approval badges. |
| **RBAC Roles** | `features/settings/settings.ts` (`team`) | Super Admin, Inventory Manager, Dispatch Staff permissions matrix. |

---

## 8. AI Code Generation Rules (Strict Guardrails)

When generating or editing files in this codebase, **always adhere to these rules**:

1. **Never Inject Inlined Libraries**: Import GSAP from `'gsap'` and Flip from `'gsap/Flip'`.
2. **Never Break CSS Scoping**: Add feature styles in `src/features/<feature>/<feature>.css` and `@import` inside `main.css`.
3. **Always Clean Up Events**: For tables and lists, use event delegation on the container rather than binding listeners to every single row or button.
4. **Sanitize Dynamic Strings**: Always wrap user-supplied or dynamic data in `escapeHtml(string)`.
5. **Keep Types Synchronized**: Add all interfaces into `src/types/<domain>.ts` and re-export through `src/types/index.ts`.
6. **Zero-Error Build Target**: Any code change must cleanly pass:
   ```powershell
   npm run typecheck
   npm run build
   ```
