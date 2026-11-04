# Handoff Report — Core Business & Transactional Feature Modules Survey

**Agent:** `explorer_survey_2`  
**Milestone:** Survey & Reverse-Engineer Core Business Modules  
**Target Files:**
- `frontend/src/features/dashboard/dashboard.ts` (1,390 lines)
- `frontend/src/features/products/products.ts` (2,000 lines)
- `frontend/src/features/orders/orders.ts` (1,829 lines)
- `frontend/src/features/purchasing/purchasing.ts` (1,474 lines)
- `frontend/src/features/warehouses/warehouses.ts` (1,667 lines)
- Reference: `frontend/src/main.ts` (5,908 lines) & `frontend/src/types/*.ts`

---

## 1. Observation

1. **Target Locations & Sizes**:
   - `frontend/src/features/dashboard/dashboard.ts`: 47,924 bytes, 1,390 lines.
   - `frontend/src/features/products/products.ts`: 64,541 bytes, 2,000 lines.
   - `frontend/src/features/orders/orders.ts`: 59,415 bytes, 1,829 lines.
   - `frontend/src/features/purchasing/purchasing.ts`: 55,258 bytes, 1,474 lines.
   - `frontend/src/features/warehouses/warehouses.ts`: 55,367 bytes, 1,667 lines.

2. **Rosetta Stone Inversion in `src/main.ts` Exports**:
   In `src/main.ts` lines 5731-5908 ("Legacy aliases for full backward compatibility"):
   - Line 5821: `findLocationById as bn`. But in `main.ts` line 2105:
     ```ts
     function ms(e, t) {
       return (ps.has(e) || ps.set(e, new Set()), ps.get(e).add(t), () => ps.get(e).delete(t));
     }
     ```
     `bn` is actually `ms`, the store subscription function: `subscribeToStore(key, callback)`.
   - Line 5805: `getAvailableLocations as Xn`. In `main.ts` line 4930, `Xn` is `animateCounter(element, targetVal, fmt, opts)` (GSAP tween).
   - Line 5855: `exportDataBackup as ln`. In `main.ts` line 2137, `ln` is `findLocationById(locId)`: `(e) => X.locations.find((t) => t.id === e)`.
   - Line 5807: `bindModalDismiss as Y`. In `main.ts` line 4900, `Y` is `morphReplace(container, callback)`.
   - Line 5818: `openMoveStockModal as ar`. In `main.ts` line 4870, `ar` is `initTooltips(container)`.
   - Line 5829: `openNewTransferModal as dr`. In `main.ts` line 4860, `dr` is `playHaptic(element)`.
   - Line 5833: `openQuickCreateModal as et`. In `main.ts` line 4840, `et` is `openPromptDialog(config)`.
   - Line 5883: `createCustomElement as st`. In `main.ts` line 4750, `st` is `openDropdownMenu(anchor, items, options)`.
   - Line 5892: `openNewBatchModal as v`. In `main.ts` line 4800, `v` is `openTransferModal(options, anchor)`.

3. **Internal Obfuscated Variables in Feature Modules**:
   - `dashboard.ts`:
     - Line 83-88: `let B; let V = 'overview'; const He = new Set(); const subtabQuery = (e) => domQuery('[data-sub="' + e + '"]', B); const dataKeyQuery = (e) => domQuery('[data-k="' + e + '"]', B);`
     - Line 188-193: `const Je = { units: 0, value: 0, low: 0 }; function G(e) { ... }`
     - Line 308-309: `let K = 'monthly'; let q = null;`
     - Line 344-345: `let J = 'month'; let $e = null;`
     - Line 400-415: `const tt = { stock: ['box', 'pine'], ... }; const nt = (e) => { ... }; function rt(e) { ... }`
     - Line 507-527: `function ot() { ... }; const st = { new: 'Start picking', ... }; function ct(e) { ... }`
     - Line 878-881: `let ft = 'all'; let pt = ''; let Z = 24; const mt = [...]`
     - Line 1041-1056: `let vt = 'all'; function yt() { ... }; function $(e) { ... }`
   - `products.ts`:
     - Line 89-94: `let k; let A = 'catalog'; const j = new Set(); const M = (e) => domQuery(':scope > [data-sub="' + e + '"]', k);`
     - Line 289-296: `let z = 'all'; let B = 'grid'; let V = 'name'; let bt = ''; let H = false; let xt = 0; let St = null; let U = null;`
     - Line 1974-1998: `let $` (active drawer batch ID), `let G` (active item product ID), `let K` (30 vs 90 day chart range).
   - `orders.ts`:
     - Line 73-79: `const Le = ['all', 'board', 'returns']; let N; let Re = 'all'; const ze = new Set();`
     - Line 151-152: `let B = null; const Ze = (e, t) => !!B && B.kind === e && B.id === t && z().open && !z().dataset.closing;`
     - Line 159-216: `$e(e)` (progress track), `et(e)` (status pills), `tt(e)` (shipping facts), `nt(e)` (payment switch), `rt(e)` (audit history), `it(e)` (drawer CTAs), `at(e)` (drawer HTML).
   - `purchasing.ts`:
     - Line 65-71: `const Ae = ['orders', 'suppliers', 'materials']; let M; let N = 'orders'; const je = new Set();`
     - Line 100+: `let B = null;` (active purchasing drawer target: PO, supplier, or material).
   - `warehouses.ts`:
     - Line 63-69: `const De = ['locations', 'transfers', 'counts']; let N; let P = 'locations'; const F = new Set();`
     - Line 1624-1665: `let from` (selected location ID), `let X` (active count drawer ID), `let J` (tweens array), `let U` (timeline).

4. **Runtime Domain Contracts vs Existing Types**:
   - `Product`: Runtime objects contain `bom?: { materialId: string; per: number }[]`, `reorderQty?: number`, `barcode?: string`, `line?: string`. Existing `src/types/product.ts` omitted these.
   - `Batch`: Runtime objects contain `madeAt: number`, `chemistId: string`, `note?: string`. Existing `src/types/batch.ts` omitted these.
   - `SalesOrder`: Runtime objects contain `tracking?: string`.
   - `Material`: Runtime objects contain `kind?: 'Ingredient' | 'Packaging'`, `code?: string`.
   - `StockMovement`: Runtime objects contain `locId: string`, `kind: string`.
   - `CycleCount`: Runtime objects contain `status: 'scheduled' | 'counting' | 'done' | 'cancelled'`, `byId: string`, `number: string`, `at: number`.

5. **Typecheck & Build Status**:
   - Executing `npm run typecheck` passes with zero errors.
   - Executing `npm run build` succeeds cleanly (`✓ built in 3.87s`).
   - Playwright test runner executes and verifies the reactive SPA routing and interaction architecture.

---

## 2. Logic Chain

1. **Step 1: Identifying the Subsystem Boundaries**
   From `src/main.ts` lines 4423-4434, the router dynamically loads:
   - `dashboard: () => import('./features/dashboard/dashboard.ts')`
   - `products: () => import('./features/products/products.ts')`
   - `orders: () => import('./features/orders/orders.ts')`
   - `purchasing: () => import('./features/purchasing/purchasing.ts')`
   - `warehouses: () => import('./features/warehouses/warehouses.ts')`
   Each module exports an object `export const page = { title: (params) => string, mount: (el) => void, enter: ({ params, same }) => void, leave: () => void }`.

2. **Step 2: Uncovering the Root Misnomers (Rosetta Stone)**
   By inspecting the implementation of `main.ts` where exported functions are defined (lines 2083-2148, 4700-4950) vs where they are exported (lines 5700-5908), we observed that functions were exported under names that conflict directly with their internal behavior. For instance, when `dashboard.ts` calls `findLocationById('orders', callback)`, line 2105 proves this registers an event listener on the `orders` store slice. Any refactor that blindly trusted the imported function names would fail or corrupt the application.

3. **Step 3: Tracing Subtabs and UI Lifecycles**
   Every module follows a consistent architecture:
   - `mount(container)`: Writes subtab placeholder containers `<div data-sub="..." hidden></div>`, sets up reactive store subscriptions via `subscribeToStore` (`findLocationById`), and binds global keyboard shortcuts.
   - `enter({ params, same })`: Determines subtab from `params[0]`, handles subtab switching, renders subtab content, and triggers GSAP timeline entrance animations.
   - `leave()`: Tears down charts, dismisses popovers, closes drawers, and kills active GSAP tweens.

4. **Step 4: Reconciling Types with Runtime Data**
   Comparing `src/types/*.ts` against field accesses in `products.ts` (e.g. line 990: `t.bom.map(...)`, line 1162: `e.reorderQty`), `orders.ts` (line 181: `r.tracking`), and `warehouses.ts` (line 1618: `status === 'counting' | 'done'`) revealed that the existing TypeScript interfaces are incomplete. Type safety requires extending these interfaces to prevent subtle runtime bugs.

5. **Step 5: Modular Decomposition Strategy**
   Because each feature module has distinct subtabs and modals/drawers, each module should be broken down into:
   - Main router coordinator (`features/<module>/<module>.ts`)
   - Dedicated subtab controllers (`features/<module>/subtabs/<subtab>.ts`)
   - Reusable feature components (`features/<module>/components/<component>.ts`)

---

## 3. Caveats

- **No Caveats on Core Survey Scope**: All 5 requested modules (`dashboard.ts`, `products.ts`, `orders.ts`, `purchasing.ts`, `warehouses.ts`) were fully read, mapped, and analyzed.
- **Out of Scope for Survey 2**: `main.ts`, `analytics.ts`, `customers.ts`, `settings.ts`, `help.ts`, `login.ts`, `charts.ts` were only inspected as needed to clarify dependencies and imports. They are covered by peer survey agents.
- **Read-Only Invariant**: In accordance with the Explorer archetype rules, no source files were modified during this investigation.

---

## 4. Conclusion

The 5 core business modules (`dashboard.ts`, `products.ts`, `orders.ts`, `purchasing.ts`, `warehouses.ts`) have been completely reverse-engineered. All obfuscated local variables, subtabs, renderers, event handlers, and data flows have been mapped to meaningful domain symbols. The deceptive naming inversion in `src/main.ts` exports has been completely documented. Expanded semantic domain types and a modular sub-directory decomposition plan have been formulated and recorded in `E:\dashborad clone\.agents\teamwork\explorer_survey_2\analysis.md`.

---

## 5. Verification Method

To independently verify the observations and mappings in this report:

1. **Verify File Existence & Lines**:
   ```powershell
   Get-Item frontend/src/features/dashboard/dashboard.ts, frontend/src/features/products/products.ts, frontend/src/features/orders/orders.ts, frontend/src/features/purchasing/purchasing.ts, frontend/src/features/warehouses/warehouses.ts | Select-Object Name, Length
   ```
2. **Verify Rosetta Stone Inversion**:
   Inspect `frontend/src/main.ts` at line 2105 (`ms` store subscription) vs line 5821 (`findLocationById as bn`), and line 4930 (`animateCounter`) vs line 5805 (`getAvailableLocations as Xn`).
3. **Verify Typecheck and Build**:
   ```bash
   cd frontend
   npm run typecheck
   npm run build
   ```
4. **Inspect Analysis Report**:
   Read `E:\dashborad clone\.agents\teamwork\explorer_survey_2\analysis.md` for the complete symbol lookup tables, domain interfaces, and modularization blueprint.
