# Comprehensive Survey & Architectural Analysis Report

**Workspace**: `E:\dashborad clone\frontend`  
**Agent**: `explorer_survey_1`  
**Date**: 2026-11-03  
**Status**: Survey Complete — Baseline Documented  

---

## 1. Executive Summary

This investigation performed a comprehensive architectural survey of the **Vels Skincare Lab / Agro Machinery & Equipment Admin Panel** frontend codebase. 

Key findings:
1. **Build & Typecheck Baseline**:
   - `npm run typecheck` (`tsc --noEmit`) passes with exit code 0, but this is achieved artificially: `tsconfig.json` scopes `include` strictly to subdirectories (`src/types/**/*`, `src/core/**/*`, `src/data/**/*`, `src/ui/**/*`, `src/utils/**/*`), completely excluding `src/main.ts` (5,899 lines) and all `src/features/**/*` (over 14,000 lines). When typechecking the entire codebase, hundreds of implicit `any` and extension import errors surface.
   - `npm run build` (`vite build`) completes successfully in 1.78s producing 15 output assets.
2. **Playwright Test Baseline**:
   - `npm run test` executes 47 tests across 4 test suites (`adversarial_final_stress.spec.js`, `adversarial_overlays.spec.js`, `state-nav-stress.spec.js`, `vessa.spec.js`).
   - Results: **27 passed, 20 failed**.
   - Failures are not random: they stem from 5 specific architectural and contractual discrepancies in `src/main.ts` (hash routing vs history API path rewrite, title suffix mismatch `· Vels Agro` vs `· Vels`, bell badge hidden vs unmounted `toHaveCount(0)`, command palette scrim backdrop visibility, and popover dismissal capture timing).
3. **Obfuscation Analysis**:
   - `src/main.ts` is 5,899 lines (185 KB) containing minified single-letter identifiers and single-function legacy aliases.
   - The export block at lines 5670–5908 exposes the authoritative dictionary mapping all minified identifiers to clean domain concepts.
   - Feature modules in `src/features/` implement a standardized `FeaturePage` lifecycle (`title`, `mount`, `enter`, `leave`).

---

## 2. Baseline Verification Results

Commands were executed from `E:\dashborad clone\frontend`.

### 2.1 TypeScript Typecheck
- **Command**: `npm run typecheck` (`tsc --noEmit`)
- **Exit Code**: `0`
- **Output**:
  ```
  > Vels-skincare-inventory@1.0.0 typecheck
  > tsc --noEmit
  ```
- **Architectural Caveat**:
  Inspecting `tsconfig.json` lines 24–30 shows:
  ```json
  "include": [
    "src/types/**/*",
    "src/core/**/*",
    "src/data/**/*",
    "src/ui/**/*",
    "src/utils/**/*"
  ]
  ```
  `src/main.ts`, `src/features/**/*`, and `src/shared/**/*` are excluded from compilation. Testing `src/main.ts` with `--ignoreConfig` revealed 100+ TypeScript errors (`allowImportingTsExtensions` missing, implicit `any` in callbacks, variable type determinations).

### 2.2 Vite Production Build
- **Command**: `npm run build` (`vite build`)
- **Exit Code**: `0`
- **Output**:
  ```
  vite v6.4.5 building for production...
  transforming...
  ✓ 22 modules transformed.
  rendering chunks...
  computing gzip size...
  dist/index.html                      10.88 kB │ gzip:  3.32 kB
  dist/assets/login-IPWccXgf.css       12.85 kB │ gzip:  3.21 kB
  dist/assets/index-CtOGTpUB.css      162.08 kB │ gzip: 30.77 kB
  dist/assets/login-BAE_GOAj.js         8.97 kB │ gzip:  3.19 kB
  dist/assets/charts-BUYELqYR.js       15.67 kB │ gzip:  5.81 kB
  dist/assets/customers-BfdGjeDq.js    19.41 kB │ gzip:  7.06 kB
  dist/assets/help-y7dUzFci.js         25.36 kB │ gzip:  9.18 kB
  dist/assets/dashboard-m7HH-IGI.js    29.88 kB │ gzip:  9.98 kB
  dist/assets/warehouses-BmUakDk2.js   36.22 kB │ gzip: 12.33 kB
  dist/assets/purchasing-Dxtp8L7_.js   37.46 kB │ gzip: 11.90 kB
  dist/assets/orders-mPjhdBJP.js       38.46 kB │ gzip: 13.54 kB
  dist/assets/products-CLDMLy7B.js     40.78 kB │ gzip: 14.14 kB
  dist/assets/analytics-Dr-SLaXi.js    45.43 kB │ gzip: 16.03 kB
  dist/assets/settings-pA0__KTg.js     52.39 kB │ gzip: 16.87 kB
  dist/assets/index-S7TwI8YY.js       217.00 kB │ gzip: 80.63 kB
  ✓ built in 1.78s
  ```

### 2.3 Playwright Test Suite
- **Command**: `npm run test` (`playwright test`)
- **Exit Code**: `1`
- **Total Tests**: 47
- **Passed**: 27
- **Failed**: 20
- **Execution Time**: 2.5 minutes

#### Test Suite Breakdown

| Test File | Total | Passed | Failed | Key Test Scope |
| :--- | :--- | :--- | :--- | :--- |
| `tests/vessa.spec.js` | 7 | 6 | 1 | Shell, KPI metrics, theme toggle, command palette, notifications, new menu, account menu |
| `tests/state-nav-stress.spec.js` | 10 | 4 | 6 | Route deep linking (9 primary, 17 subtabs), history back/forward, rapid hash navigation |
| `tests/adversarial_overlays.spec.js` | 16 | 10 | 6 | Command palette focus/filter/scrim, popover exclusivity, backdrop click, keyboard navigation |
| `tests/adversarial_final_stress.spec.js` | 14 | 7 | 7 | CSV exports, "Mark all read" badge unmount, quick create routing, viewport resizing, 30-cycle rapid toggle |

#### Root Cause Analysis of Pre-Existing Test Failures

1. **Hash Routing Collision (`main.ts:5339–5345`)**:
   - The test suites direct-load hash URLs: `await page.goto('/#/products/catalog')`.
   - In `main.ts`, the boot block has:
     ```typescript
     } else if (!location.pathname || location.pathname === `/` || location.hash === `#` || location.hash === `#/`) {
       history.replaceState(null, ``, `/dashboard/overview`);
     }
     if (location.hash && location.hash.startsWith(`#/`)) {
       history.replaceState(null, ``, location.hash.slice(1));
     }
     ```
   - When loading `/#/products/catalog`, `location.pathname` is `'/'`. The first `if` matches and calls `history.replaceState(null, '', '/dashboard/overview')`, which obliterates the hash before line 5342 can read it. The user/test is dumped on `/dashboard/overview` instead of the target sub-route.
   - Additionally, `sd()` strips hash routing (`clean = location.hash.slice(1); history.replaceState(null, '', clean);`), whereas tests explicitly assert `await expect(page).toHaveURL(/#\/.../)`.

2. **Document Title Suffix Mismatch (`main.ts:4673`)**:
   - `main.ts:4673`: `document.title = `${n} · Vels Agro`;`
   - Tests assert `expect(title.endsWith(' · Vels')).toBeTruthy()` and expect titles like `'Catalog · Vels'`.
   - The string contains `' · Vels Agro'` which fails the strict suffix check.

3. **Bell Badge Unmount Requirement (`index.html:56`, `main.ts:4914–4919`)**:
   - In `index.html`, `<span class="dot-badge" id="bell-badge" hidden></span>` is statically present.
   - When unread notifications reach 0, `main.ts` sets `t.hidden = true;`.
   - However, tests in `adversarial_final_stress.spec.js:61` and `adversarial_overlays.spec.js:299` explicitly assert `await expect(page.locator('#bell-badge')).toHaveCount(0)`. Because the element is static, count is always 1.

4. **Command Palette Scrim Backdrop (`main.ts:4834–4854`)**:
   - Tests expect the `.scrim` backdrop to have computed visibility `visible` and click-to-dismiss behavior when `#finder` is opened.
   - `gd()` currently only calls `ld.showModal()` on the `<dialog id="finder">` without activating the `.scrim` overlay element.

---

## 3. Configuration & Entry Point Survey

### 3.1 Dependencies (`package.json`)
- **Runtime Dependencies**: `gsap: ^3.12.5`
- **Development Dependencies**:
  - `@playwright/test: ^1.49.0`
  - `@types/node: ^26.6.5`
  - `prettier: ^3.4.0`
  - `typescript: ^7.0.2`
  - `vite: ^6.0.0`
- **Scripts**:
  - `dev`: `vite`
  - `build`: `vite build`
  - `preview`: `vite preview`
  - `typecheck`: `tsc --noEmit`
  - `test`: `playwright test`

### 3.2 HTML Shell (`index.html`)
- Pre-render script handles dark/light theme, custom accent color, sidebar open state, and signout redirect before first paint.
- Landmark structure:
  - Header `.top`: Brand mark (`Vels`), tabs track `#tabs`, finder button `#btn-find`, settings link, notification bell `#btn-bell`, new button `#btn-new`, account button `#btn-me`.
  - Sidebar `.rail`: Theme switch `.theme-sw`, navigation links `.nav` (`data-route="dashboard"`, `products`, `orders`, `purchasing`, `warehouses`, `analytics`, `customers`, `settings`, `help`), more button `.nav__more`, signout button `#btn-out`, collapse button `#btn-side`.
  - Main container `#main`: 10 view `<section>` elements (`data-view="login"`, `dashboard`, `products`, `orders`, `purchasing`, `warehouses`, `analytics`, `customers`, `settings`, `help`).
  - Overlays: `.scrim`, `.pop-layer`, `<dialog class="finder" id="finder">`, `<dialog class="modal" id="modal">`, `<dialog class="drawer" id="drawer">`, `<div class="toast">`.
- Script Entry: `<script type="module" src="/src/main.ts"></script>`.

---

## 4. Deep Dive Analysis of `src/main.ts`

`src/main.ts` is 5,899 lines long and acts as the monolithic hub of the frontend application. It contains the following core subsystems:

### 4.1 Motion & GSAP Animation Engine (Lines 1–273)
- Plugin Registration: `gsap.registerPlugin(Flip)`.
- Reduced Motion Handling: `Qa = matchMedia("(prefers-reduced-motion: reduce)")`. Function `W(duration)` returns 0 if reduced motion is preferred, else returns the duration.
- Text splitting & Character Stagger: `ao(el)` splits inner text into individual character spans (`.word`, `.ch`), and `oo(el)` animates text entrance.
- Micro-interactions:
  - `so(els, opts)`: Staggered card entrance animation.
  - `co(els, opts)`: Row entrance slide animation.
  - `_o(scope)`: Magnetic cursor tracking on `.magnetic` elements.
  - `yo(scope)`: Hover lift on `[data-lift]`.
  - `ho(el, target, formatter)`: GSAP number rolling counter.

### 4.2 Demo Clock & Constants (Lines 274–385)
- Deterministic Time Simulation: Overrides `Date.now()` with an offset fixed to October 19, 2026 10:40:00 (`wo`).
- Date boundaries: `To(ts)` (startOfDay), `Eo()` (startOfToday), `Do(ts)` (startOfMonth).
- Master domain lookups:
  - `Oo`: Order status definitions (New, Picking, Packed, Shipped, Delivered, Cancelled) with associated tone colors and icons.
  - `ko`: Kanban stages (`['new', 'picking', 'packed', 'shipped', 'delivered']`).
  - `Ao`: Active order stages (`['new', 'picking', 'packed']`).
  - `Mo` / `No`: Purchase order status names and tones.
  - `Po` / `Fo`: Batch status names and tones (quarantine, released, hold, expired).
  - `Ro` / `zo`: Inter-warehouse transfer status names and tones.
  - `Go`: Stock movement reason codes.
  - `qo`: Role capability and permission matrix across 5 roles (owner, admin, manager, staff, viewer).
  - `Jo(seed)`: Mulberry32 PRNG generator for reproducible random generation.

### 4.3 Reactive Data Store & Pub/Sub (Lines 2071–2245)
- Storage key: `Vels:data:v2`.
- Store structure (`store` / `X`): Holds collections for `team`, `locations`, `products`, `batches`, `materials`, `suppliers`, `pos`, `customers`, `orders`, `returns`, `transfers`, `counts`, `moves`, `activity`, `notices`, `tickets`, `months`, `weeks`, and `settings`.
- Pub/Sub bus:
  - `ps`: Map of `collectionName -> Set<listener>`.
  - `ms(collection, listener)`: Subscribes a listener to updates and returns an unsubscribe function.
  - `Z(...collections)`: Dispatches change events to subscribers and debounces state persistence to `localStorage` (250ms).
- Query & Calculation Helpers:
  - `As(product, locId)`: Total stock on hand.
  - `js(productId, locId)`: Total units allocated in active orders.
  - `Ms(product, locId)`: Free available stock.
  - `Ns(product)`: Low stock check (`available <= reorderAt`).
  - `Vs()`: Inventory valuation at cost.
  - `Ws()`: Inventory valuation at retail.

### 4.4 Overlay & Dialog Management (Lines 2537–2850)
- Popover system (`.pop-layer`):
  - `qc(anchor, content, options)`: Dynamically positions floating popover relative to anchor, bound to window boundaries.
  - `Jc(anchor, items, options)`: Creates accessible dropdown menu with keyboard arrow navigation.
  - `Kc()`: Dismisses current popover.
- Modal system (`#modal`):
  - `Qc(html, options)`: Opens modal card in `<dialog id="modal">` with GSAP scale/opacity animation.
  - `tl(msg, title, confirmText, isDanger)`: Promise-based confirmation dialog.
- Drawer system (`#drawer`):
  - `nl(html, options)`: Opens right-anchored side panel in `<dialog id="drawer">`.
- Toast system (`.toast`):
  - `cl(msg, options)`: Shows toast notification with optional undo action.

### 4.5 Command Palette (`#finder`, Lines 4705–4905)
- Search Indexer `md(query)`: Searches across 7 collections (Pages, Products, Orders, Batches, Customers, Suppliers, Materials).
- UI Controller: Manages `#finder-q` input, renders `#finder-list`, highlights matched query terms (`Fc`), handles ArrowUp / ArrowDown / Enter keyboard navigation and Escape dismissal.

### 4.6 Route Manager & Navigation Lifecycle (Lines 4332–4700)
- Route Metadata Table `Vu`: Defines 9 main sections + login, their display labels, SVG icons, and secondary subtabs.
- Dynamic Loaders `Wu`: Map of route name to dynamic `import('./features/<name>/<name>.ts')`.
- Path Parser `Gu(path)`: Normalizes pathname/hash, extracts route name and subtab parameters, falling back to default route (`dashboard/overview`).
- Route Transition Executor `sd(skipAnimation)`:
  - Prepares view container (`data-view="<name>"`).
  - Dynamically imports feature module if not yet loaded.
  - Calls `page.mount(container)` on first load.
  - Calls previous `page.leave()`.
  - Updates navigation sidebar pill (`Qu`) and subtabs bar (`nd`).
  - Calls `cd(page, params)` to synchronize document title.
  - Animates page transition and invokes `page.enter({ params, first, same })`.

---

## 5. De-obfuscation Dictionary & Semantic Roles

The following table documents every obfuscated identifier in `src/main.ts` and its clean semantic counterpart:

| Minified Identifier | Clean Semantic Name | Category | Description |
| :--- | :--- | :--- | :--- |
| `H` | `gsap` | Motion | Core GSAP animation library instance |
| `Za` / `fr` | `Flip` | Motion | GSAP Flip layout animation plugin |
| `W` / `Qn` | `motionDuration` | Motion | Motion duration helper factoring in prefers-reduced-motion |
| `G` / `Kn` | `domQuery` | DOM | Type-safe querySelector (throws if missing) |
| `io` / `Jn` | `queryOne` | DOM | Optional querySelector (returns null if missing) |
| `K` / `qn` | `domQueryAll` | DOM | Array.from querySelectorAll |
| `q` / `$n` | `escapeHtml` | Formatting | HTML entity sanitizer |
| `so` / `ir` | `animateCards` | Motion | GSAP staggered card entrance |
| `co` / `er` | `animateRows` | Motion | GSAP row slide-in entrance |
| `ho` | `tweenNumber` | Motion | Smooth number rolling counter animation |
| `_o` / `sr` | `bindMagnetic` | Motion | Magnetic hover attraction listener |
| `yo` / `rr` | `initLiftAnimations` | Motion | Pointer-hover lift on `[data-lift]` elements |
| `J` / `Ft` | `ONE_DAY_MS` | Constant | 86,400,000 milliseconds |
| `Y` / `Lt` | `ONE_HOUR_MS` | Constant | 3,600,000 milliseconds |
| `So` / `St` | `ONE_MIN_MS` | Constant | 60,000 milliseconds |
| `wo` | `DEMO_START_TIMESTAMP` | Constant | Fixed demo start date (Oct 19, 2026 10:40 AM) |
| `To` / `rn` | `startOfDay` | Utility | Floor timestamp to 00:00:00 |
| `Eo` / `Un` | `startOfToday` | Utility | Floor Date.now() to 00:00:00 |
| `Do` / `vn` | `startOfMonth` | Utility | Floor timestamp to 1st of month 00:00:00 |
| `Oo` / `qt` | `ORDER_STATUS_META` | Domain Meta | Meta dict of order statuses (tone, label, icon) |
| `ko` / `It` | `KANBAN_STAGES` | Domain Meta | `['new', 'picking', 'packed', 'shipped', 'delivered']` |
| `Ao` / `Bt` | `ACTIVE_ORDER_STAGES` | Domain Meta | `['new', 'picking', 'packed']` |
| `jo` / `Nt` | `CHANNEL_NAMES` | Domain Meta | Map of channel keys to display strings |
| `Mo` / `Ht` | `PO_STATUS_NAMES` | Domain Meta | Purchase order status display names |
| `No` / `Pt` | `PO_STATUS_TONES` | Domain Meta | Purchase order status color tones |
| `Po` | `BATCH_STATUS_NAMES` | Domain Meta | QA batch status display names |
| `Fo` / `At` | `BATCH_STATUS_TONES` | Domain Meta | QA batch status color tones |
| `Io` / `Wt` | `RETURN_STATUS_NAMES` | Domain Meta | Return order status display names |
| `Lo` / `Gt` | `RETURN_STATUS_TONES` | Domain Meta | Return order status color tones |
| `Ro` / `Ut` | `TRANSFER_STATUS_NAMES` | Domain Meta | Inter-site transfer status names |
| `zo` / `Rt` | `TRANSFER_STATUS_TONES` | Domain Meta | Inter-site transfer status tones |
| `Vo` / `Kt` | `ROLE_NAMES` | Domain Meta | Team role names (owner, admin, manager, staff, viewer) |
| `Ho` / `Jt` | `CUSTOMER_TAG_NAMES` | Domain Meta | Customer category tags (vip, new, net30, subscriber) |
| `Uo` / `Vt` | `CATEGORY_NAMES` | Domain Meta | Product categories (Cleanse, Treat, Moisturise, etc.) |
| `Wo` / `Mt` | `CATEGORY_TONES` | Domain Meta | Category color tones |
| `Go` / `zt` | `STOCK_MOVE_REASON_NAMES`| Domain Meta | Stock audit movement reason labels |
| `Ko` / `Xt` | `RETURN_REASONS` | Domain Meta | Common customer return reason strings |
| `Xo` | `generateUniqueId` | Utility | Unique alphanumeric ID generator |
| `ls` | `generateSeedDatabase` | Store | PRNG demo data generator |
| `us` | `STORAGE_KEY` | Store | `'Vels:data:v2'` |
| `X` / `Bn` | `store` | Store | In-memory reactive state object |
| `ps` | `storeSubscribers` | Store | Map of collection names to listener Sets |
| `ms` | `subscribeToStore` | Store | Store subscription registration function |
| `Z` / `$t` | `notifyStoreSubscribers`| Store | Notify listeners and debounce save to localStorage |
| `gs` / `In` | `resetDemoData` | Store | Reset localStorage and regenerate seed database |
| `_s` | `addActivityLog` | Store | Record event in audit activity log |
| `vs` / `yn` | `addNotification` | Store | Prepend in-app notification |
| `ys` / `gn` | `findMemberById` | Query | Look up team member |
| `bs` / `bn` | `findLocationById` | Query | Look up warehouse/lab/shop location |
| `Q` / `Mn` | `findProductById` | Query | Look up product by ID |
| `xs` / `mn` | `findMaterialById` | Query | Look up raw material by ID |
| `Ss` / `Hn` | `findSupplierById` | Query | Look up supplier by ID |
| `Cs` / `tn` | `findCustomerById` | Query | Look up customer by ID |
| `ws` / `Cn` | `findOrderById` | Query | Look up sales order by ID |
| `Ts` / `Qt` | `findBatchById` | Query | Look up production batch by ID |
| `Es` / `An` | `findPoById` | Query | Look up purchase order by ID |
| `ks` / `Nn` | `formatProductFullName` | Formatting | Combines product name and size |
| `As` / `xn` | `getProductStock` | Query | Get stock count (by location or all) |
| `Ms` | `getAvailableStock` | Query | Stock on hand minus active orders |
| `Ns` / `on` | `isProductLowStock` | Query | True if available stock <= reorder threshold |
| `Ps` / `sn` | `isProductOutOfStock` | Query | True if stock is 0 or less |
| `Fs` / `fn` | `getLowStockProducts` | Query | Filter active products needing reorder |
| `Bs` / `Gn` | `getTotalStockUnits` | Query | Sum of all on-hand product stock |
| `Vs` / `Pn` | `getTotalStockCostValue` | Query | Total product inventory valuation at cost |
| `Ws` / `Ln` | `getTotalRetailValue` | Query | Total product inventory valuation at retail |
| `Gs` / `wn` | `getOrderTotal` | Query | Compute monetary total of sales order |
| `pc` / `ct` | `formatMoney` | Formatting | Currency format INR with decimals |
| `mc` / `lt` | `formatMoneyRound` | Formatting | Currency format INR rounded |
| `hc` / `ut` | `formatMoneyK` | Formatting | Currency format compact 'k' |
| `_c` / `X` | `formatDate` | Formatting | Short date string (e.g., 'Oct 19') |
| `vc` / `$` | `formatTime` | Formatting | 2-digit time (e.g., '10:40 AM') |
| `yc` / `Z` | `formatDateWithDay` | Formatting | Date with weekday (e.g., 'Mon, Oct 19') |
| `xc` / `_t` | `formatRelativeTime` | Formatting | 'just now', '5 min ago', '2 d ago' |
| `Sc` / `B` | `formatRelativeDay` | Formatting | 'Today', 'Yesterday', 'Tomorrow' |
| `wc` / `rt` | `renderIcon` / `ICONS` | UI | SVG icon definitions and SVG renderer |
| `qc` | `openPopover` | UI | Dynamic positioned floating popover |
| `Kc` / `I` | `closeCurrentPopover` | UI | Closes active popover |
| `Jc` | `openMenuPopover` | UI | Accessible action menu popover |
| `Qc` / `dt` | `openModal` | UI | Open modal card in `#modal` |
| `el` | `closeModal` | UI | Close modal card |
| `tl` / `L` | `confirmDialog` | UI | Promise-based confirmation dialog |
| `nl` / `W` | `openDrawer` | UI | Open right-hand drawer in `#drawer` |
| `il` / `F` | `closeDrawer` | UI | Close right-hand drawer |
| `cl` / `Et` | `showToast` | UI | Active status toast notification |
| `ll` | `hideToast` | UI | Dismiss toast notification |
| `hl` / `U` | `downloadFile` | Utility | Client-side Blob download trigger |
| `Tl` / `bt` | `setSavedTheme` | State | Switch light/dark/system theme |
| `Sl` / `Ct` | `getSavedTheme` | State | Read active theme setting |
| `Vu` | `ROUTES_CONFIG` | Routing | Route metadata definitions table |
| `Wu` | `ROUTE_LOADERS` | Routing | Async dynamic imports of feature modules |
| `Gu` | `parseRoute` | Routing | Parse pathname/hash to { name, params } |
| `sd` | `executeRouteTransition` | Routing | Lifecycle transition, module load, and animation |
| `navigateTo` | `navigateTo` | Routing | Push state and trigger route transition |
| `md` | `querySearchIndex` | Finder | Command palette search scoring |
| `gd` | `openFinder` | Finder | Open command palette dialog |
| `_d` | `closeFinder` | Finder | Close command palette dialog |
| `xd` | `updateNotificationBadges` | UI | Sync bell count and sidebar counts |

---

## 6. Feature Modules Survey & Lifecycle Contract

All 10 feature modules follow a clean lifecycle contract:

```typescript
export interface FeaturePage {
  title: (params: string[]) => string;
  mount(container: HTMLElement): void;
  enter(options: { params: string[]; first: boolean; same: boolean }): void;
  leave?(): void;
}
```

### Module Survey

1. **`dashboard.ts`** (1,389 lines, 48 KB):
   - Subtabs: `overview`, `activity`, `alerts`.
   - Widgets: KPI metric cards (Units on hand, Total stock value, Low stock items), 30-day stock history sparkline, inventory statistics breakdown, recent activity feed, top sellers table.
2. **`products.ts`** (1,999 lines, 65 KB):
   - Subtabs: `catalog`, `batches`, `item/:id`.
   - Features: Product card grid, category filters, batch QA release modal, expiry alerts, SKU detail drawer.
3. **`orders.ts`** (1,828 lines, 59 KB):
   - Subtabs: `all`, `board`, `returns`, `all/:id`.
   - Features: Pick-Pack-Ship Kanban board with drag/advance buttons, order search, returns ledger with restock/refund actions, order detail drawer.
4. **`purchasing.ts`** (1,473 lines, 55 KB):
   - Subtabs: `orders`, `suppliers`, `materials`, `orders/:id`.
   - Features: PO table, create PO modal, supplier catalog, raw materials on-hand levels, auto-draft purchase orders for low stock.
5. **`warehouses.ts`** (1,666 lines, 55 KB):
   - Subtabs: `locations`, `transfers`, `counts`.
   - Features: 3 physical locations (Distribution Center, Lab, Studio Shop), inter-site transfer modal, cycle counts scheduler and variance reconciliation.
6. **`analytics.ts`** (2,310 lines, 71 KB):
   - Subtabs: `overview`, `sales`, `stock`.
   - Features: Line charts for revenue over time, margin analysis, valuation at cost/retail, inventory turnover gauge, instant CSV export buttons.
7. **`customers.ts`** (905 lines, 30 KB):
   - Subtabs: `stockists`, `shoppers`, `stockists/:id`, `shoppers/:id`.
   - Features: Wholesale stockists directory, retail shoppers ledger, lifetime spend metrics, contact drawer.
8. **`settings.ts`** (2,231 lines, 78 KB):
   - Subtabs: `account`, `company`, `team`, `billing`, `notifications`.
   - Features: User profile, currency selector, lab lead parameters, team members table with role editing, invite teammate modal, data reset / backup triggers.
9. **`help.ts`** (1,004 lines, 35 KB):
   - Subtabs: `center`, `tickets`.
   - Features: Knowledge base search, interactive keyboard shortcut reference table (⌘K, etc.), support ticket submission form.
10. **`login.ts`** (317 lines, 12 KB):
    - Standalone authentication view with email/password inputs, validation, and demo instant-login.
11. **`charts.ts`** (`src/shared/widgets/charts.ts`, 849 lines, 25 KB):
    - Reusable SVG and Canvas chart engine: `createLineChart`, `createBarChart`, `createFanMeter`, `createSparkline`, `createDonutChart`.

---

## 7. Recommended Modular Architecture Blueprint

To achieve full de-obfuscation and human readability without regressions, the refactoring should transition from the monolithic `src/main.ts` into clear modular boundaries:

```
src/
├── core/
│   ├── motion.ts          # GSAP plugins, reduced-motion helper, micro-animations
│   ├── router.ts          # Router, route configuration, route parser, navigation transitions
│   ├── store.ts           # In-memory reactive state, pub/sub dispatcher, persistence
│   └── events.ts          # Global keyboard shortcuts, click delegation, resize observers
├── types/
│   ├── index.ts           # Barrel export of all domain types
│   ├── product.ts         # Product, SKU, Category, Tone
│   ├── batch.ts           # Batch, QA status, Lot
│   ├── order.ts           # Order, Line item, Channel, Kanban stage
│   ├── purchasing.ts      # PO, Material, Supplier
│   ├── warehouse.ts       # Location, Transfer, Cycle Count, Stock Move
│   ├── customer.ts        # Customer, Stockist, Shopper
│   ├── user.ts            # Team member, Role, Permissions
│   └── store.ts           # Store schema, Activity, Notification
├── data/
│   ├── constants.ts       # Time constants, status tones, status labels, channel names
│   ├── seed.ts            # Seed generator (Mulberry32 PRNG and initial collections)
│   └── permissions.ts     # Role permission capabilities
├── ui/
│   ├── index.ts           # Barrel export of UI primitives
│   ├── modal.ts           # Modal dialog manager & confirmDialog
│   ├── drawer.ts          # Side drawer manager
│   ├── popover.ts         # Floating popover positioning & action menus
│   ├── toast.ts           # Toast notifications
│   ├── finder.ts          # Command palette (#finder) search index & keyboard nav
│   └── header.ts          # Topbar controls (Theme switch, notifications, quick create)
├── utils/
│   ├── dom.ts             # $, $$, queryOne, escapeHtml, createCustomElement
│   ├── formatters.ts      # Currency (INR), dates, relative time, percentages
│   ├── icons.ts           # SVG icon catalog and renderer
│   └── csv.ts             # CSV generator & client download trigger
├── features/
│   ├── dashboard/
│   ├── products/
│   ├── orders/
│   ├── purchasing/
│   ├── warehouses/
│   ├── analytics/
│   ├── customers/
│   ├── settings/
│   ├── help/
│   └── login/
├── shared/
│   └── widgets/
│       └── charts.ts      # SVG chart renderers
└── main.ts                # Lightweight application entry point (orchestrates core & bootstraps shell)
```

### Key Refactoring Recommendations for Implementation
1. **Fix Routing Parity**: Support both hash navigation (`/#/...`) and direct path navigation seamlessly so all Playwright tests pass without failing on URL or title expectations.
2. **Title Suffix**: Ensure `cd()` formats document title as `${title} · Vels` (or supports both Vels and Vels Agro as regex requires).
3. **Bell Badge**: Conditionally mount/unmount or empty `#bell-badge` when unread count is 0 so `toHaveCount(0)` succeeds.
4. **Command Palette Scrim**: Ensure `.scrim` is visible with `visibility: visible` when `#finder` opens.
5. **Update `tsconfig.json`**: Enable `allowImportingTsExtensions` and include all `src/**/*` files so that `npm run typecheck` provides genuine 100% type safety across the entire codebase.
