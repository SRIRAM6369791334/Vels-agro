# Exploration & Modularization Blueprint: Warehouses Module & Main Shell Decoupling

**Author**: `explorer_m3_3`  
**Working Directory**: `E:\dashborad clone\.agents\teamwork\explorer_m3_3`  
**Target Modules**:  
1. Warehouses Module (`frontend/src/features/warehouses/`)
2. Main Shell Decoupling & Shared Modals Architecture (`frontend/src/main.ts`, `frontend/src/ui/`)

---

## 1. Observation

### 1.1 Code Inspections in `frontend/src/main.ts` (5,985 Lines, 127 Top-Level Functions)
Investigation of `frontend/src/main.ts` revealed that the file currently contains 127 top-level functions spanning 5,985 lines, categorized into 7 distinct functional layers:

1. **Layer 1: Animation & DOM Primitives (Lines 1–370)**:
   - `ro` (line 16), `G` (queryOne, line 19), `ao` (animateCounter, line 31), `oo` (animateTitle, line 65), `so` (animateCards, line 82), `co` (animateRows, line 100), `lo` (animateWobble, line 118), `uo` (animatePop, line 137), `fo` (flashElement, line 155), `po` (animateMagnetic, line 174), `ho` (animateCounter, line 194), `go` (playHaptic, line 221), `_o` (bindMagnetic, line 226), `yo` (initLiftAnimations, line 244).
   - *Observation*: These primitives have already been partially migrated to `frontend/src/core/motion.ts` and `frontend/src/utils/dom.ts`, but continue to exist in `main.ts` as legacy implementations and aliases.

2. **Layer 2: PRNG Deterministic Seed Data & Default Mock State (Lines 372–2070)**:
   - `Jo(seed)` (line 372): Mulberry32 pseudo-random number generator.
   - `$o` (lines 386–440): Initial team members (`Vels Okafor`, `Tomás Ferreira`, `Mei Lin Zhao`, `Hana Sato`, etc.).
   - Default datasets for `products`, `materials`, `locations`, `suppliers`, `batches`, `orders`, `pos`, `transfers`, `counts`, `customers`, `settings`, `moves`, `activity`, `history`, `notices`.
   - *Observation*: This ~1,700-line block belongs cleanly in `frontend/src/data/seed.ts` (currently missing) to eliminate immense deadweight from `main.ts`.

3. **Layer 3: Store State Subscriptions, Mutators & Queries (Lines 2073–2395 & 3218–3420)**:
   - `ms` (line 2108): `subscribeToStore` (aliased as `findLocationById` in obfuscated code).
   - `Z` (line 2112): `notifyStoreSubscribers`.
   - `_s` (line 2131): `logActivity`.
   - `vs` (line 2135): `addNotification`.
   - `js` (line 2152): `getActiveOrdersForLocation(productId, locId)`.
   - `Gl` (line 3243): `logStockMovement(itemId, locId, qty, reason, ref, cost)`.
   - `ql` (line 3266): `adjustStock(productId, locId, qtyDelta, reason)`.
   - `Jl` (line 3288): `openStockAdjustModal(productId, locId, fromElement)`.
   - `Zl` (line 3337): `advanceOrderStatus(orderId, targetStatus)`.
   - `eu` (line 3412): `markOrderPaid(orderId)`.

4. **Layer 4: UI Formatters & SVG Renderers (Lines 2396–2700)**:
   - `Oc` (line 2396): `renderAvatar(memberId, size)`.
   - `Pc` (line 2412): `renderEmptyState(title, sub, icon, actionHtml)`.
   - `Fc` (line 2415): `highlightSearchMatch(text, query)`.
   - `Ic` (line 2422): `renderTrendBadge(val)`.
   - `Lc` (line 2427): `renderPageHeader(config)`.
   - `Bc` (line 2447): `renderFilterBar`.
   - `Vc` (line 2451): `animatePageTransition(container)`.
   - `Wc` (line 2512): `initSegmentedControl`.
   - `Kc` (line 2541): `closeCurrentPopover`.
   - `qc` (line 2544): `openDropdownMenu` / `renderPagination`.

5. **Layer 5: Generic Form Dialog Runner (`$c`, Lines 2702–2773)**:
   - `function $c(e)`:
     ```typescript
     function $c(e) {
       let t = G(`#modal`),
         n = Yc.matches,
         r = () => Zc(t, n ? { y: 60 } : { y: 12, scale: 0.98 });
       (Qc(t),
         (t.__close = r),
         (t.innerHTML = `<form class="mform" method="dialog" novalidate>
         <header class="mform__head"><div><h2 class="mform__title">${q(e.title)}</h2>${e.sub ? `<p class="mform__sub">${q(e.sub)}</p>` : ``}</div>${Ec(`close`, `Close`, `data-close`)}</header>
         <div class="mform__grid">${e.fields.map(...).join(``)}${e.extra ?? ``}</div>
         <p class="mform__err" role="alert"></p>
         <footer class="mform__foot"><button type="button" class="btn btn--ghost" data-close>Cancel</button><button type="submit" class="btn ${e.danger ? `btn--danger` : `btn--primary`}">${q(e.submit)}</button></footer>
       </form>`));
       ...
       H.fromTo(t, a, { opacity: 1, x: 0, y: 0, scale: 1, duration: W(0.5), ease: `back.out(1.4)`, clearProps: `transform` });
       ...
     }
     ```
   - *Observation*: `$c` is the core dialog engine that powers ALL modal dialogs across the application. It handles `<form class="mform" method="dialog">` rendering into `#modal`, error display in `<p class="mform__err">`, GSAP origin zoom tweening from `e.from`, and form field validation. This is the implementation of `openPromptDialog(config)` specified in `PROJECT.md:132`.

6. **Layer 6: The 7 Shared Domain Modals & Transactions (Lines 3421–4280)**:
   - `tu(initialValues, fromElement, onCreated)` (lines 3421–3530): `openNewOrderModal`. Creates a sales order (`SO-XXX`), checks customer type, stock availability, carrier assignments, lines validation, updates `store.orders`, logs activity, shows toast.
   - `au(initialValues, fromElement)` (lines 3554–3607): `openNewPoModal`. Creates a draft purchase order (`PO-XXX`), computes supplier lead time & ETA, updates `store.pos`, logs activity, shows toast.
   - `mu(productId, fromElement, onBatchStarted)` (lines 3755–3805): `openMakeBatchModal`. Displays interactive BOM recipe consumption (`data-bom`), validates raw material inventory with `fu()`, deducts materials, creates a batch (`LOT-XXX`), updates `store.batches`, logs movements, shows toast.
   - `yu(initialValues, fromElement)` (lines 3843–3914): The true **Stock Transfer / Move Stock Modal**! (In `main.ts:5599`, `yu` was misleadingly aliased as `openNewBatchModal = yu;`, while `openMoveStockModal` was aliased to `_o` [bindMagnetic] and `openNewTransferModal` to `go` [playHaptic]). Generates a planned transfer (`TR-XXX`), checks origin location stock, updates `store.transfers`, logs activity, shows toast.
   - `bu(transferId)` (lines 3915–3953): `receiveTransfer`. Advances transfer from `planned` -> `in-transit` (deducts source stock, logs movements) or `in-transit` -> `received` (adds destination stock, logs movements).
   - `Cu(fromElement)` (lines 3956–4011): `openScheduleCountModal`. Schedules a cycle count (`CC-XXX`), builds line items for every product stocked at the target location, sets scheduled date & counter, updates `store.counts`, logs activity, shows toast.
   - `Du(fromElement, onCreated)` (lines 4057–4115): `openNewCustomerModal`. Adds a new customer (stockist or shopper), validates email format and uniqueness, updates `store.customers`, logs activity, shows toast.
   - `Ou(fromElement)` (lines 4116–4177): `openInviteTeammateModal`. Invites a teammate, assigns role and location, updates `store.team`, shows toast.

7. **Layer 7: Navigation Rail, Shell Overlays, Keyboard Routing & Bootstrapping (Lines 4701–5420)**:
   - `navigateTo(path)` (line 4707): Router navigation hook.
   - `Sd(anchorElement)` (lines 5023–5076): **Quick Create Dropdown Menu** (`#btn-new`). Binds all 7 quick actions:
     ```javascript
     { label: 'Sales order', icon: 'orders', onSelect: () => { navigateTo('#/orders/all'); tu({}, e); } },
     { label: 'Purchase order', icon: 'cart', onSelect: () => { navigateTo('#/purchasing/orders'); au({}, e); } },
     { label: 'Make a batch', icon: 'flask', onSelect: () => { navigateTo('#/products/batches'); mu(void 0, e, () => { navigateTo('#/products/batches'); }); } },
     { label: 'Move stock', icon: 'swap', onSelect: () => { navigateTo('#/warehouses/transfers'); yu({}, e); } },
     { label: 'Schedule a count', icon: 'clipCheck', onSelect: () => { navigateTo('#/warehouses/counts'); Cu(e); } },
     '-',
     { label: 'Customer', icon: 'userPlus', onSelect: () => { navigateTo('#/customers/stockists'); Du(e); } },
     { label: 'Invite teammate', icon: 'users', onSelect: () => { navigateTo('#/settings/team'); Ou(e); } },
     ```
   - `wd(isImmediate)` (lines 5098–5119): Theme switch knob tracking & sync.
   - `Ed()` and `Dd()` (lines 5121–5146): Sidebar collapse toggle (`#btn-side`, `.side-open`) and View Transition.
   - `kd()` (lines 5151–5202): Account menu popover (`#btn-me`) with CSV downloads (`Pu`, `Fu`, `Iu`), theme presets, demo data reset (`gs`).
   - Global keyboard shortcuts listener (lines 5266–5295): `Cmd+K` / `/` (command palette), `N` (new order), `C` (quick create menu), `[` (sidebar), `Escape` (dismiss overlays), `?` (shortcuts drawer).
   - `Rd()` and `Bd()` (lines 5337–5420): App ready timeline, `#app` mounting, hash normalization (`#/dashboard/overview`).

---

### 1.2 Detailed Inspection of `frontend/src/features/warehouses/warehouses.ts` (1,667 Lines)
The current `warehouses.ts` is a monolithic 1,667-line file with 11 inverted/obfuscated aliases and 3 distinct subtabs:

#### A. Obfuscated Aliases in `warehouses.ts`
1. `exportDataBackup(locId)` (lines 282, 396, 463, 532, 546, 639, 816, 817, 1107, 1175, 1309):
   - *Direct Observation*: In `main.ts:5563`, `const exportDataBackup = bs;`, where `bs` is `findLocationById(locId) => store.locations.find(l => l.id === locId)`.
   - *Fix*: Replace with canonical `findLocationById(locId)` from `src/core/store.ts`.
2. `findLocationById(sliceKey, callback)` (lines 1590, 1596, 1597, 1598, 1604, 1609, 1614):
   - *Direct Observation*: In `main.ts:5530`, `const findLocationById = ms;`, where `ms` is `subscribeToStore(sliceKey, callback)`.
   - *Fix*: Replace with canonical `subscribeToStore(sliceKey, callback)` from `src/core/store.ts`.
3. `openNewTransferModal(el)` (lines 684, 699, 707, 952, 964, 972, 1238, 1250, 1264, 1471, 1502):
   - *Direct Observation*: In `main.ts:5538`, `const openNewTransferModal = go;`, where `go` is `playHaptic(el)`.
   - *Fix*: Replace with canonical `playHaptic(el)` from `src/core/motion.ts`.
4. `openMoveStockModal(container)` (lines 654, 948, 1234):
   - *Direct Observation*: In `main.ts:5527`, `const openMoveStockModal = _o;`, where `_o` is `bindMagnetic(container)`.
   - *Fix*: Replace with canonical `bindMagnetic(container)` from `src/core/motion.ts`.
5. `bindMagnetic()` (zero-argument calls, lines 120, 572, 864):
   - *Direct Observation*: Checks if reduced motion is preferred (`prefersReducedMotion.matches`).
   - *Fix*: Replace with `prefersReducedMotion.matches` from `src/core/motion.ts`.
6. `CARRIERS` (lines 807–809, 829, 933):
   - *Direct Observation*: In `main.ts:5518`, `const CARRIERS = Ro;`, where `Ro` is `TRANSFER_STATUS_NAMES`.
   - *Fix*: Replace with `TRANSFER_STATUS_NAMES` from `src/core/constants.ts`.
7. `RETURN_REASONS` (lines 828, 829):
   - *Direct Observation*: In `main.ts:5513`, `const RETURN_REASONS = zo;`, where `zo` is `TRANSFER_STATUS_TONES`.
   - *Fix*: Replace with `TRANSFER_STATUS_TONES` from `src/core/constants.ts`.
8. `PO_STATUS_TONES` (lines 1163–1165, 1191, 1221, 1332):
   - *Direct Observation*: Used as display labels for cycle count statuses (`scheduled`, `counting`, `done`).
   - *Fix*: Define explicit domain constants `COUNT_STATUS_NAMES` and `COUNT_STATUS_TONES`.
9. `openNewBatchModal(config, fromEl)` (lines 708–714, 965):
   - *Direct Observation*: In `main.ts:5599`, `const openNewBatchModal = yu;`, where `yu` is the Move Stock Modal!
   - *Fix*: Replace with canonical `openMoveStockModal(config, fromEl)`.
10. `cancelCount(countId)` (lines 1265, 1504):
    - *Direct Observation*: In `main.ts:5483`, `const cancelCount = wu;`, where `wu` sets `count.status = 'counting'`.
    - *Fix*: Rename to `startCycleCount(countId)` in the domain service.
11. `bindModalDismiss(container, callback)` (lines 500, 524, 937, 1224):
    - *Direct Observation*: In `main.ts:5514`, `const bindModalDismiss = fl;`, where `fl` is `morphReplace(container, callback)`.
    - *Fix*: Replace with canonical `morphReplace(container, callback)` from `src/core/motion.ts`.

#### B. Subtab 1: Locations (`locations`)
- **Capacity Gauges & Metrics (`ze(location)`)**:
  - `units`: Total on-hand units across all products (`getLocationStockUnits(locId)`).
  - `cap`: Utilization fraction `units / location.capacity`.
  - `used`: Number of warehouse bins with items > 0.
  - `total`: Total bins across all zones in the facility.
  - `res`: Promised reserved units for active orders (`getActiveOrdersForLocation`).
- **Facility Switcher Cards (`.wh-locs`, `Ve()`)**:
  - Renders facility buttons for each location (`dc`, `lab`, `shop`).
  - Displays manager avatar, operating hours, capacity fraction badge, and GSAP scaleX meter fill (`Math.max(0.02, r)`).
- **Bin Allocation Engine (`Le(location)`)**:
  - Generates bin allocation grid across facility zones:
    * `dc` (Distribution Center): Uses SKU bin code (`product.bin`, e.g. `A-01`) for stock placement; assigns materials to dispatch zones.
    * `lab` (Production Lab): Cool room holds finished goods; zone R holds ingredients; zone P holds packaging; quarantine zone holds unreleased/hold lots.
    * `shop` (Retail Store): Front-of-store floor display (40%) vs back-room stock (60%).
  - Tracks fill levels: `empty`, `low` (<25%), `mid` (25–65%), `full` (≥66%), `out` (0 units).
- **Interactive Bin Map (`.wh-zones`, `Ue()`, `He()`)**:
  - Renders responsive CSS grid with dynamic column counts.
  - Mouseover/focus opens floating tooltip (`Ye`, `Je`), click opens bin popover (`Xe`) with product links.
- **Recent Movements Log (`.wh-mv`, `Ge()`)**:
  - Displays last 6 movements for current location from `store.moves` with relative timestamp, reference code, and +/- quantity.
- **Stock Inventory Table (`.wh-stable`, `W()`)**:
  - Table of products at current location with columns: Product SKU, On-hand, Reserved, Free stock.
  - Dynamic warning tones: `wh-bad` (free ≤ 0), `wh-warn` (free ≤ reorder point).

#### C. Subtab 2: Transfers (`transfers`)
- **Transit KPI Summary (`tt()`)**:
  - `road`: Total units currently in-transit across all routes.
  - `planned`: Count of planned transfers.
  - `recUnits`: Total units received in the last 30 days.
  - `hours`: Average transit turnaround time in hours.
- **Status Filter Toolbar (`.toolbar`, `Ne()`)**:
  - Filters by `all`, `planned`, `in-transit`, `received` with live item counts.
- **Active Transfer Route Cards (`.wh-tr`, `rt()`)**:
  - Route line `.wh-route` with SVG animated dashed track (`at()`, stroke-dashoffset loop).
  - Animated truck icon with dynamic percent progress `(Date.now() - createdAt) / (eta - createdAt)`.
  - Overdue warning pill (`Running late`).
  - Line items breakdown with thumbnail previews.
  - State Transition Actions:
    * `planned`: "Dispatch" button -> advances transfer to `in-transit`, deducts units from source location, logs to `store.moves`.
    * `in-transit`: "Receive" button -> advances transfer to `received`, adds units to destination location, logs to `store.moves`.
- **Received History Section (`.wh-histcard`, `it()`)**:
  - Lists landed transfers with thumbnail previews and completion dates.

#### D. Subtab 3: Cycle Counts (`counts`)
- **Auditing KPI Summary (`ht()`)**:
  - `sched`: Count of scheduled cycle counts.
  - `counting`: Count of active in-progress counts.
  - `acc`: 60-day line accuracy fraction `matchedLines / totalLines`.
  - `fixed`: Total absolute units adjusted.
- **Counts Table (`.wh-ctable`, `_t()`)**:
  - Columns: Count # (`CC-XXX`), Counter avatar, Scheduled date, Line progress meter (`counted / total`), Variance summary (`+N / -N units` and valuation at cost), Status pill, Action button.
- **Count Sheet Drawer (`.wh-sheet`, `xt()`, `St()`)**:
  - Opens via `openDrawer(xt(count))` with wide configuration.
  - Blind Counting Reveal Switch (`[data-reveal]`): Hides expected quantities (`•••`) until explicitly toggled.
  - Line Stepper Controls (`bt()`): Increments/decrements or inputs numeric counted value with debounced store updates.
  - Real-Time Variance Calculation (`pt(variance)`): `Match` (green check), `+N` / `-N` (tone based on magnitude), `Not counted`.
  - Completion Validation (`Dt`, `completeCount`): Enforces all lines counted before finalizing; upon completion, corrects `product.stock[locId]`, logs adjustment to `store.moves`, marks count `done`.

---

## 2. Logic Chain

1. **Decoupling Rationale for Shared Modals**:
   - `main.ts` currently mixes application initialization, router registration, topbar event handling, AND seven domain-specific modals.
   - Analysis of `$c` demonstrates that it is a pure, domain-agnostic UI component (`openPromptDialog`) that should reside in `src/ui/prompt-dialog.ts` (or `src/ui/modal.ts`).
   - The 7 domain modals (`openNewOrderModal`, `openNewPoModal`, `openMakeBatchModal`, `openMoveStockModal`, `openScheduleCountModal`, `openNewCustomerModal`, `openInviteTeammateModal`) represent feature business operations. Co-locating them in their respective feature folders (`features/<domain>/modals/`) maintains high cohesion and low coupling.
   - For backwards compatibility and cross-feature access (such as the topbar Quick Create menu `#btn-new` and analytical subtabs), `main.ts` can simply re-export these canonical modals from their dedicated feature homes.

2. **Decomposition Rationale for Warehouses Module**:
   - At 1,667 lines, `warehouses.ts` violates single-responsibility principles by handling three separate UI views (`locations`, `transfers`, `counts`), complex algorithmic bin allocation (`Le`), drawer sheet manipulation, and modal wrappers.
   - Breaking the module into subtabs (`subtabs/locations.ts`, `subtabs/transfers.ts`, `subtabs/counts.ts`), reusable components (`components/facility-card.ts`, `components/bin-map.ts`, `components/bin-tooltip.ts`, `components/transfer-card.ts`, `components/count-sheet-drawer.ts`), and calculation services (`services/bin-allocator.ts`, `services/warehouse-metrics.ts`, `services/transfer-service.ts`) creates clean, maintainable units with zero circular dependencies.

3. **Decoupling the Main Shell (`main.ts`)**:
   - By extracting:
     * PRNG seed data -> `frontend/src/data/seed.ts`
     * Shared modals -> `frontend/src/ui/prompt-dialog.ts` and `features/*/modals/`
     * Quick Create menu -> `frontend/src/ui/quick-create.ts`
     * Notifications popover -> `frontend/src/ui/notifications.ts`
     * Account popover -> `frontend/src/ui/account-menu.ts`
     * Global keyboard shortcuts -> `frontend/src/ui/shortcuts.ts`
     * App theme / accent controllers -> `frontend/src/core/theme.ts`
   - `main.ts` will shrink from ~5,500 lines to a minimal, readable ~120-line bootstrapper that configures the router, mounts the shell, and provides backward-compatible re-exports.

---

## 3. Caveats

1. **Topbar Quick Create Contract**:
   - `tests/adversarial_final_stress.spec.js:78` (`1.3 QuickCreate: All action buttons navigate to respective routes without dropped clicks`) asserts that clicking `#btn-new` and then selecting any quick action updates the URL hash to the target route (`#/orders/all`, `#/purchasing/orders`, `#/products/batches`, `#/warehouses/transfers`, `#/warehouses/counts`, `#/customers/stockists`, `#/settings/team`).
   - The quick action handlers MUST continue calling `navigateTo(targetUrl)` before launching the respective modal dialog.
2. **Backward-Compatibility Barrel Re-Exports**:
   - Until all Milestone 3 features (`dashboard`, `products`, `orders`, `purchasing`) are fully refactored, `main.ts` must maintain backward-compatible re-exports of all modal and domain functions (`openScheduleCountModal`, `openMakeBatchModal`, `openNewTransferModal`, `openMoveStockModal`, `openNewCustomerModal`, `openNewOrderModal`, `openNewPoModal`, `receiveTransfer`, `findLocationById`, etc.) so that existing modules do not break during compilation.
3. **Drawer History & Scrim Timing Invariants**:
   - Opening a cycle count sheet (`#/warehouses/counts/:id`) updates `history.replaceState`. Closing the drawer must restore `#/warehouses/counts` without triggering unhandled router re-renders.
   - Headless test timing: `scrim` fade-in tween must complete promptly (≤ 50ms) to satisfy Playwright opacity assertions (`opacity > 0.8`).

---

## 4. Conclusion & Modularization Blueprint

### 4.1 Warehouses Module Target Structure (`src/features/warehouses/`)

```
frontend/src/features/warehouses/
├── warehouses.ts                  # FeaturePage lifecycle: title, mount, enter, leave, subtab routing
├── warehouses.css                 # Preserved CSS rules for bin map, routes, counts table, drawer
├── types.ts                       # Location, LocationZone, BinItem, BinZone, Transfer, CycleCount
├── subtabs/
│   ├── locations.ts               # Locations subtab: facility switcher, bin map, movements, stock table
│   ├── transfers.ts               # Transfers subtab: filter chips, active transfer cards, landed history
│   └── counts.ts                  # Counts subtab: filter chips, cycle counts table, start/sheet buttons
├── components/
│   ├── facility-card.ts           # Facility selector button (.wh-loc) with capacity meter
│   ├── bin-map.ts                 # Interactive zone grid (.wh-zones) and bin button (.wh-bin)
│   ├── bin-tooltip.ts             # Hover tooltip (.wh-tip) and click popover (.wh-pop)
│   ├── transfer-card.ts           # Transfer card (.wh-tr) with SVG dashed track & truck icon
│   └── count-sheet-drawer.ts      # Cycle count drawer sheet, blind reveal switch, line steppers
├── services/
│   ├── bin-allocator.ts           # buildZoneBinMap(): maps products, materials, QA batches to bins
│   ├── warehouse-metrics.ts       # calculateLocationMetrics(), calculateTransferMetrics(), calculateCountMetrics()
│   └── transfer-service.ts        # dispatchTransfer(), receiveTransfer(), completeCycleCount()
└── modals/
    ├── move-stock-modal.ts        # openMoveStockModal(): Dialog for planning inter-facility transfers
    └── schedule-count-modal.ts    # openScheduleCountModal(): Dialog for scheduling cycle counts
```

#### Detailed Component Specifications
1. **`services/bin-allocator.ts`**:
   - `export function buildZoneBinMap(location: Location, products: Product[], materials: Material[], batches: Batch[]): Map<string, BinZone[]>`
   - Replaces `Le()`. Pure function calculating bin occupancy, items array, fill levels, and out-of-stock flags.
2. **`services/warehouse-metrics.ts`**:
   - `export function calculateLocationMetrics(location: Location): LocationMetrics` (replaces `ze`)
   - `export function calculateTransferMetrics(transfers: Transfer[]): TransferMetrics` (replaces `tt`)
   - `export function calculateCountMetrics(counts: CycleCount[]): CountMetrics` (replaces `ht`)
   - `export function calculateCountVariance(count: CycleCount): CountVariance` (replaces `Q`)
3. **`services/transfer-service.ts`**:
   - `export function receiveTransfer(transferId: string): string | void` (canonical implementation of `bu`)
   - `export function startCycleCount(countId: string): void` (canonical implementation of `wu`)
   - `export function updateCountLine(countId: string, productId: string, counted: number | null): void` (canonical implementation of `Tu`)
   - `export function completeCycleCount(countId: string): string | void` (canonical implementation of `Eu`)
4. **`modals/move-stock-modal.ts`**:
   - `export function openMoveStockModal(initial?: { from?: string; to?: string; productId?: string }, fromEl?: HTMLElement): void`
   - Canonical implementation of `yu`. Invokes `openPromptDialog` with location select options, product select options, units input, origin stock validation, and creates planned `Transfer`.
5. **`modals/schedule-count-modal.ts`**:
   - `export function openScheduleCountModal(fromEl?: HTMLElement): void`
   - Canonical implementation of `Cu`. Invokes `openPromptDialog` with location select, team counter select, scheduled date input, generates `CycleCount` with product lines, and unshifts to `store.counts`.

---

### 4.2 Shared Modals Architecture & Main Shell Decoupling

#### A. Generic Dialog Runner: `src/ui/prompt-dialog.ts`
Extract `$c` from `main.ts:2702-2773` into `src/ui/prompt-dialog.ts`:
```typescript
export interface PromptField {
  name: string;
  label: string;
  type?: 'text' | 'number' | 'select' | 'textarea' | 'date' | 'email' | 'tel';
  value?: any;
  required?: boolean;
  placeholder?: string;
  options?: [string, string][];
  min?: number;
  max?: number;
  step?: number;
  wide?: boolean;
  hint?: string;
}

export interface PromptDialogConfig {
  title: string;
  sub?: string;
  from?: HTMLElement | null;
  submit: string;
  danger?: boolean;
  fields: PromptField[];
  extra?: string;
  onMount?: (form: HTMLFormElement) => void;
  onSubmit: (values: Record<string, string>) => string | void;
}

export function openPromptDialog(config: PromptDialogConfig): void;
```

#### B. Co-location of Domain Modals
| Modal | Domain Module | Canonical File Path | Description |
|---|---|---|---|
| `openNewOrderModal` | Orders | `src/features/orders/modals/new-order-modal.ts` | Sales order creation with customer & product picker |
| `openNewPoModal` | Purchasing | `src/features/purchasing/modals/new-po-modal.ts` | Draft purchase order with lead time & ETA |
| `openMakeBatchModal` | Products | `src/features/products/modals/make-batch-modal.ts` | Production batch starter with live recipe BOM preview |
| `openMoveStockModal` | Warehouses | `src/features/warehouses/modals/move-stock-modal.ts` | Inter-facility transfer planner with stock check |
| `openScheduleCountModal` | Warehouses | `src/features/warehouses/modals/schedule-count-modal.ts` | Cycle count scheduler with automated line generation |
| `openNewCustomerModal` | Customers | `src/features/customers/modals/new-customer-modal.ts` | Stockist/shopper creation with email validation |
| `openInviteTeammateModal` | Settings | `src/features/settings/modals/invite-teammate-modal.ts` | Team member invitation with role assignment |

#### C. Minimal Main Shell (`src/main.ts`) Blueprint (~120 Lines)
```typescript
import './main.css';

// 1. Core Framework Primitives
import { initStore, store, subscribeToStore, notifyStoreSubscribers } from './core/store';
import { initRouter, navigateTo, startRouter } from './core/router';
import { initTheme, initAccent } from './core/theme';
import { initSidebar } from './core/sidebar';

// 2. Shell Overlay Controllers
import { initCommandPalette } from './ui/finder';
import { initNotificationsPopover } from './ui/notifications';
import { initQuickCreateMenu } from './ui/quick-create';
import { initAccountMenu } from './ui/account-menu';
import { initGlobalKeyboardShortcuts } from './ui/shortcuts';

// 3. Re-exported Domain Modals & Primitives (for cross-module backward compatibility)
export { openPromptDialog } from './ui/prompt-dialog';
export { openNewOrderModal } from './features/orders/modals/new-order-modal';
export { openNewPoModal } from './features/purchasing/modals/new-po-modal';
export { openMakeBatchModal } from './features/products/modals/make-batch-modal';
export { openMoveStockModal } from './features/warehouses/modals/move-stock-modal';
export { openScheduleCountModal } from './features/warehouses/modals/schedule-count-modal';
export { openNewCustomerModal } from './features/customers/modals/new-customer-modal';

// 4. Feature Route Registrations
const ROUTES = {
  dashboard: () => import('./features/dashboard/dashboard'),
  products: () => import('./features/products/products'),
  orders: () => import('./features/orders/orders'),
  purchasing: () => import('./features/purchasing/purchasing'),
  warehouses: () => import('./features/warehouses/warehouses'),
  analytics: () => import('./features/analytics/analytics'),
  customers: () => import('./features/customers/customers'),
  settings: () => import('./features/settings/settings'),
  help: () => import('./features/help/help'),
  login: () => import('./features/login/login'),
};

// 5. App Bootstrap
function bootstrap() {
  initTheme();
  initAccent();
  initSidebar();
  initCommandPalette();
  initNotificationsPopover();
  initQuickCreateMenu();
  initAccountMenu();
  initGlobalKeyboardShortcuts();
  initRouter(ROUTES);
  startRouter();
}

document.addEventListener('DOMContentLoaded', bootstrap);
```

---

## 5. Verification Method

To independently verify this exploration and test the target blueprints:

```bash
cd "E:\dashborad clone\frontend"

# 1. Typecheck: Verify static TypeScript compilation (0 errors required)
npm run typecheck

# 2. Production Build: Verify Vite bundle compilation
npm run build

# 3. Baseline Shell & Navigation: 7/7 passing tests
npx playwright test tests/vessa.spec.js

# 4. State & Navigation Stress: 10/10 passing tests
npx playwright test tests/state-nav-stress.spec.js

# 5. Adversarial Overlays & Modals: 20/20 passing tests
npx playwright test tests/adversarial_overlays.spec.js

# 6. Adversarial Final Stress: 10/10 passing tests
npx playwright test tests/adversarial_final_stress.spec.js

# 7. Complete Test Suite: 79/79 passing tests
npx playwright test
```

### Invalidation Conditions
- Any TypeScript diagnostic error during `npm run typecheck`.
- Any failure in Quick Create route transitions (`adversarial_final_stress.spec.js:78`).
- Any regression in modal dialog lifecycle (`challenger_m2_deep_empiric.spec.js:309`).
- Any remaining obfuscated alias (`exportDataBackup`, `openNewTransferModal`, `openMoveStockModal`, `CARRIERS`, `RETURN_REASONS`) inside `frontend/src/features/warehouses/`.
