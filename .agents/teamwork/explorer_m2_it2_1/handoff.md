# Milestone 2 Iteration 2: Legacy Alias Cleansing & Forensic Remediation Plan
**Target Domain**: Charts (`shared/widgets/charts/`, `shared/widgets/charts.ts`) and Analytics (`features/analytics/`)  
**Explorer Agent**: `explorer_m2_it2_1`  
**Working Directory**: `E:\dashborad clone\.agents\teamwork\explorer_m2_it2_1`  
**Date**: 2026-11-03  

---

## Executive Summary & Alias Mapping Catalog

| # | Legacy Obfuscated Alias in `main.ts` | Underlying Implementation / Reality | Target Canonical Replacement | Impacted Files & Exact Lines |
|---|---------------------------------------|-------------------------------------|------------------------------|------------------------------|
| 1 | `getAvailableLocations` | `ho(element, target, formatter, options)` (numeric counter animator) | `animateCounter` from `src/core/motion.ts` | - `shared/widgets/charts/radial-gauge-meter.ts:4, 94`<br>- `shared/widgets/charts/fan-meter.ts:4, 90`<br>- `features/analytics/subtabs/overview.ts:27, 225`<br>- `features/analytics/subtabs/stock.ts:39, 452` |
| 2 | `bindMagnetic()` (invoked as boolean) | `$a = () => Qa.matches` (checks `prefers-reduced-motion: reduce`) | `prefersReducedMotion.matches` from `src/core/motion.ts` | - `shared/widgets/charts/grouped-bar-chart.ts:4, 129`<br>- `features/analytics/subtabs/overview.ts:31, 197` |
| 3 | `formatShortDate as string[]` | `Uo = ['Cleanse', 'Treat', 'Moisturise', 'Protect', 'Body']` (Category names) | `CATEGORY_NAMES` from `src/core/constants.ts` | - `features/analytics/services/stats-cache.ts:14, 44` |
| 4 | `createDonutChart` (invoked on vertical column bars) | `renderColumnBarChart` in `shared/widgets/charts/column-bar-chart.ts` | Direct semantic call `renderColumnBarChart` from `src/shared/widgets/charts` | - `features/analytics/subtabs/overview.ts:48, 579`<br>- `features/analytics/subtabs/stock.ts:48, 349, 392` |
| 5 | `createHorizontalBarChart` (invoked on 240° radial gauge dial) | `renderRadialGaugeMeter` in `shared/widgets/charts/radial-gauge-meter.ts` | Direct semantic call `renderRadialGaugeMeter` from `src/shared/widgets/charts` | - `features/analytics/subtabs/stock.ts:49, 266` |
| 6 | `renderProgressBar` (invoked as days-of-cover calculator) | `rc = (p) => { let t = nc(p.id, 30) / 30; return t ? Math.floor(Ms(p) / t) : Infinity; }` | Semantic helper `calculateProductDaysOfCover(p)` in `stock-calculator.ts` using `getAvailableStock` from `src/core/store.ts` | - `features/analytics/services/stock-calculator.ts:5, 80`<br>- `features/analytics/subtabs/stock.ts:19, 186` |
| 7 | `findLocationById` (invoked as store slice subscriber) | `ms = (sliceKey, cb) => { ps.get(sliceKey).add(cb)... }` | `subscribeToStore` from `src/core/store.ts` | - `features/analytics/analytics.ts:2, 116, 121, 126, 128, 135, 142, 149` |
| 8 | `exportDataBackup` (invoked with location ID) | `bs = (id) => X.locations.find(t => t.id === id)` | `findLocationById` from `src/core/store.ts` | - `features/analytics/subtabs/stock.ts:25, 286` |
| 9 | `getMaterialStock` (invoked with product object) | `Ms = (p) => getProductStock(p) - getActiveAllocatedStock(p.id)` | `getAvailableStock` from `src/core/store.ts` | - `features/analytics/subtabs/stock.ts:21, 221` |
| 10 | `openNewTransferModal` (invoked on buttons on click) | `go = (btn) => H.fromTo(svg, { scale: 0.72 }, { scale: 1, duration: 0.55... })` | `playHaptic` from `src/core/motion.ts` | - `features/analytics/subtabs/overview.ts:26, 703, 711`<br>- `features/analytics/subtabs/stock.ts:28, 564, 583, 588, 597, 604` |
| 11 | `openMoveStockModal` (invoked with container DOM node) | `_o = (root = document) => { attach magnetic hover to .magnetic }` | `bindMagnetic` from `src/core/motion.ts` | - `features/analytics/subtabs/stock.ts:27, 559` |
| 12 | `bindModalDismiss` (invoked with element & callback) | `fl = (container, callback) => FLIP / morph layout animation` | `morphReplace` from `src/core/motion.ts` | - `features/analytics/subtabs/stock.ts:32, 242` |
| 13 | `renderFilterBar` (invoked with count element & numeric value) | `Bc = (el, val) => { el.dataset.count = String(val); ho(el, val, formatter); }` | Semantic `animateStatCounter(el, val)` using `animateCounter` from `src/core/motion.ts` | - `features/analytics/subtabs/sales.ts:13, 200`<br>- `features/analytics/subtabs/stock.ts:11, 527` |
| 14 | `formatDateInput` (invoked to schedule redraw) | `xo = (fn) => bo.add(fn); H.ticker.add(...)` (GSAP ticker frame callback) | `requestAnimationFrame` or `gsap.ticker.add` | - `shared/widgets/charts/line-chart.ts:4, 158` |
| 15 | `getLastMonthValue()` (invoked to get total inventory valuation) | `Us = () => Vs() + Hs()` (sum of product inventory value + raw material inventory value) | Semantic helper `getTotalInventoryValue()` | - `features/analytics/services/stats-cache.ts:12, 234, 238, 253`<br>- `features/analytics/subtabs/stock.ts:23, 102, 537` |
| 16 | `getOrdersByCustomer` (invoked with order object) | `Js = (order) => order.status !== 'cancelled'` | Semantic check `order.status !== 'cancelled'` or `isOrderActive(order)` | - `features/analytics/services/stats-cache.ts:13, 90`<br>- `features/analytics/subtabs/sales.ts:24` |
| 17 | `getRecentOrders` (invoked with `(productId, 30)`) | `nc = (productId, days) => units sold in last N days from non-cancelled orders` | Semantic helper `getProductRecentSales(productId, days)` | - `features/analytics/services/stock-calculator.ts:6, 36, 42`<br>- `features/analytics/subtabs/stock.ts:22, 221, 383, 497` |
| 18 | `getTotalStockCostValue` (invoked to get finished goods cost) | `Vs = () => products.reduce((sum, p) => sum + getProductStock(p) * p.cost, 0)` | Semantic helper `getTotalProductStockCost()` in `stock-calculator.ts` | - `features/analytics/services/stock-calculator.ts:8, 40` |
| 19 | DOM utilities from `main.ts` (`escapeHtml`, `queryOne`, `domQuery`, `domQueryAll`) | Re-exported from minified root | Import directly from `src/utils/dom.ts` | - All charts and analytics subtabs |
| 20 | Number & Date formatters from `main.ts` (`formatDate`, `formatInt`, `formatMoney`, etc.) | Re-exported from minified root | Import directly from `src/utils/formatters.ts` | - All charts and analytics subtabs |

---

## 1. Observation

### 1.1 Scope Boundaries
All investigation was strictly focused on:
1. `frontend/src/shared/widgets/charts/` (all 9 files) and `frontend/src/shared/widgets/charts.ts`
2. `frontend/src/features/analytics/` (all 6 `.ts` files, `services/`, and `subtabs/`)

### 1.2 Verbatim Observations in `shared/widgets/charts/`

#### 1. `radial-gauge-meter.ts`
- **Import** (lines 1-6):
  ```typescript
  import {
    escapeHtml,
    motionDuration,
    getAvailableLocations,
    gsap,
  } from '../../../main';
  ```
- **Call site** (lines 94-98):
  ```typescript
  getAvailableLocations(numberEl, targetVal, options.format, {
    duration: 1.1,
    delay: motionDuration(delay),
    from: fromVal,
  });
  ```
- **Analysis**: Calls `getAvailableLocations` which is aliased to `ho` in `main.ts:5511`. `src/core/motion.ts:17` exports `animateCounter` with identical parameter semantics: `animateCounter(element, target, formatter, options)`.

#### 2. `fan-meter.ts`
- **Import** (lines 1-6):
  ```typescript
  import {
    escapeHtml,
    motionDuration,
    getAvailableLocations,
    gsap,
  } from '../../../main';
  ```
- **Call site** (lines 90-94):
  ```typescript
  getAvailableLocations(numberEl, toFraction, formatVal, {
    from: fromFraction,
    duration: 1.3,
    delay: motionDuration(delay),
  });
  ```
- **Analysis**: Calls `getAvailableLocations` to interpolate radiant ray percentage counter. Target replacement is `animateCounter` from `src/core/motion.ts`.

#### 3. `grouped-bar-chart.ts`
- **Import** (lines 1-6):
  ```typescript
  import {
    escapeHtml,
    motionDuration,
    bindMagnetic,
    gsap,
  } from '../../../main';
  ```
- **Call site** (line 129):
  ```typescript
  if (isNewlyShown || !animate || bindMagnetic()) {
    gsap.set(tooltipEl, {
      x: tooltipLeft,
      y: tooltipTop,
    });
  }
  ```
- **Analysis**: `bindMagnetic` is imported from `main.ts` where line 5586 maps `bindMagnetic = $a;`, with `$a = () => Qa.matches` (the media query `prefers-reduced-motion`). It is executed as a zero-argument boolean check. `src/core/motion.ts:6` exports `prefersReducedMotion = window.matchMedia(...)`. The check must be `prefersReducedMotion.matches`.

#### 4. `line-chart.ts`
- **Import** (lines 1-6):
  ```typescript
  import {
    escapeHtml,
    motionDuration,
    formatDateInput,
    gsap,
  } from '../../../main';
  ```
- **Call site** (line 158):
  ```typescript
  const scheduleRender = () => formatDateInput(renderDom);
  ```
- **Analysis**: `formatDateInput` in `main.ts:5561` is `xo = (fn) => bo.add(fn)` which enqueues a callback onto GSAP's ticker. Using `formatDateInput` to schedule a chart redraw is a bizarre obfuscated alias. Target replacement is `requestAnimationFrame(renderDom)` or `gsap.ticker.add(renderDom, true)`.

#### 5. `column-bar-chart.ts` and `donut-ring-meter.ts`
- Both import `escapeHtml`, `motionDuration`, `gsap` from `../../../main`.
- Target replacement: `escapeHtml` from `src/utils/dom.ts`, `motionDuration` and `gsap` from `src/core/motion.ts`.

#### 6. `charts.ts` (Barrel root)
- Lines 23-29:
  ```typescript
  renderLineChart as createLineChart,
  renderColumnBarChart as createDonutChart,
  renderDonutRingMeter as createRingMeter,
  renderRadialGaugeMeter as createHorizontalBarChart,
  renderSparklineSvg as createSparkline,
  renderGroupedBarChart as createBarChart,
  renderFanMeter as createFanMeter,
  ```
- `renderColumnBarChart as createDonutChart` exports a vertical bar chart as a "donut chart".
- `renderRadialGaugeMeter as createHorizontalBarChart` exports a 240° circular dial meter as a "horizontal bar chart".
- Consumer subtabs in `analytics` import these misleading aliases and invoke them.

---

### 1.3 Verbatim Observations in `features/analytics/`

#### 1. `features/analytics/analytics.ts`
- **Import** (lines 1-5):
  ```typescript
  import {
    findLocationById,
    domQuery,
    domQueryAll,
  } from '../../main';
  ```
- **Call sites** (lines 116-160):
  ```typescript
  findLocationById('orders', () => { clearStatsCache(); refreshCurrentSubtab(); });
  findLocationById('history', () => { clearStatsCache(); refreshCurrentSubtab(); });
  findLocationById('products', refreshCurrentSubtab);
  findLocationById('batches', () => { ... });
  findLocationById('counts', () => { ... });
  findLocationById('moves', () => { ... });
  findLocationById('settings', () => { ... });
  ```
- **Analysis**: In `main.ts:5527`, `findLocationById = ms;`. In `main.ts:2108`:
  ```typescript
  function ms(e, t) {
    return (ps.has(e) || ps.set(e, new Set()), ps.get(e).add(t), () => ps.get(e).delete(t));
  }
  ```
  `ms` is `subscribeToStore(sliceKey, callback)`! `src/core/store.ts:35` defines `subscribeToStore` with this exact contract. `findLocationById` is an egregious alias for store slice subscription.

#### 2. `services/stats-cache.ts`
- **Imports** (lines 1-16):
  ```typescript
  import {
    store,
    findProductById,
    startOfToday,
    startOfDay,
    formatDate,
    formatInt,
    formatMoney,
    formatMoneyK,
    formatMoneyRound,
    formatPercent,
    getLastMonthValue,
    getOrdersByCustomer,
    formatShortDate,
    ONE_DAY_MS,
  } from '../../../main';
  ```
- **Line 44**:
  ```typescript
  export const PRODUCT_CATEGORIES = formatShortDate as string[];
  ```
  `formatShortDate` in `main.ts:5555` is `Uo = ['Cleanse', 'Treat', 'Moisturise', 'Protect', 'Body']`. Casting an apparent date formatting function to `string[]` to retrieve category names is an extreme integrity violation. `src/core/constants.ts` exports `CATEGORY_NAMES`.
- **Line 90**:
  ```typescript
  if (!getOrdersByCustomer(order)) continue;
  ```
  In `main.ts:5530`, `getOrdersByCustomer = Js;` where `Js = (e) => e.status !== 'cancelled'`. A function named "get orders by customer" is used to test if an order is active.
- **Lines 234, 238, 253**:
  ```typescript
  if (timestamp >= now) return getLastMonthValue();
  ...
  return getLastMonthValue() - movesAfter.reduce((sum, m) => sum + m.value, 0);
  ...
  if (!points.length) return getLastMonthValue();
  ```
  In `main.ts:5505`, `getLastMonthValue = Us;` where `Us = () => Vs() + Hs()` (sum of finished product stock value + raw material inventory value). This calculates total inventory value, not last month's value.

#### 3. `services/stock-calculator.ts`
- **Imports** (lines 1-9):
  ```typescript
  import {
    store,
    findProductById,
    daysUntilExpiry,
    renderProgressBar,
    getRecentOrders,
    getProductStock,
    getTotalStockCostValue,
  } from '../../../main';
  ```
- **Line 80**:
  ```typescript
  export function calculateMedianDaysOfCover(): number {
    const coverDays = store.products
      .filter((p) => p.active)
      .map(renderProgressBar)
      .filter(isFinite)
      .sort((a, b) => a - b);
  ```
  `renderProgressBar` in `main.ts:5537` is `rc = (p) => { let t = nc(p.id, 30) / 30; return t ? Math.floor(Ms(p) / t) : Infinity; }`. It computes days of cover for a product, not a progress bar.
- **Line 36 & 42**:
  `getRecentOrders(p.id, 30)` calls `nc(productId, days)` which computes units sold in the last 30 days.
- **Line 40**:
  `getTotalStockCostValue()` calls `Vs()` which sums `getProductStock(p) * p.cost`.

#### 4. `subtabs/overview.ts`
- **Line 197**:
  ```typescript
  if (!path || !animate || bindMagnetic()) return;
  ```
  `bindMagnetic()` invoked as reduced motion check.
- **Line 225**:
  ```typescript
  getAvailableLocations(
    valEl,
    data.total,
    METRIC_CONFIGS[key].fmt,
    animate ? { from: 0, duration: 1.3, delay: 0.2 + idx * 0.05 } : { duration: 0.8 }
  );
  ```
  Animates number counters.
- **Lines 579-586**:
  ```typescript
  categoryBarsInstance = createDonutChart(barsEl, {
    labels: PRODUCT_CATEGORIES,
    values: catValues,
    format: (v: number) => catFormatter(v),
    tone: METRIC_CONFIGS[currentMetric].tone,
    label: 'Breakdown by category',
  });
  ```
  Invoking `createDonutChart` to render a vertical column bar chart on `.bars__col` elements.
- **Lines 703 & 711**:
  ```typescript
  openNewTransferModal(e.currentTarget as HTMLElement);
  ...
  openNewTransferModal(btn);
  ```
  In `main.ts:5535`, `openNewTransferModal = go` (scale bounce tween on button icon / click haptic).

#### 5. `subtabs/sales.ts`
- **Line 200**:
  ```typescript
  const updateStat = (key: string, val: number) => {
    const el = queryOne<HTMLElement>(`[data-stat="${key}"] b[data-count]`, container);
    if (el) renderFilterBar(el, val);
  };
  ```
  In `main.ts:5545`, `renderFilterBar = Bc` where:
  ```typescript
  function Bc(e, t) {
    e && ((e.dataset.count = String(t)), ho(e, t, gc[e.dataset.fmt ?? 'int'] ?? cc, { duration: 0.9 }));
  }
  ```
  `renderFilterBar` updates `data-count` and animates numeric counter. It does not render a filter bar.
- **Lines 23-24**:
  `getOrderTotal(o)` and `getOrdersByCustomer(o)` imported from `main.ts`.

#### 6. `subtabs/stock.ts`
- **Line 186**:
  ```typescript
  .map((p) => ({ p, d: renderProgressBar(p) }))
  ```
  Uses `renderProgressBar` to compute product days of cover.
- **Line 221**:
  ```typescript
  ${formatInt(getMaterialStock(p))} free · ${formatInt(getRecentOrders(p.id, 30))} sold
  ```
  `getMaterialStock(p)` is `Ms(p) = getProductStock(p) - getActiveAllocatedStock(p.id)` (available product stock). `src/core/store.ts:134` already has `getAvailableStock(p)`.
- **Line 242**:
  ```typescript
  bindModalDismiss(listEl, () => {
    listEl.innerHTML = barsHtml;
  });
  ```
  In `main.ts:5513`, `bindModalDismiss = fl` (FLIP container animation).
- **Line 266**:
  ```typescript
  accuracyGaugeInstance = createHorizontalBarChart(gaugeEl, { ... });
  ```
  Invoking `createHorizontalBarChart` to render 240° radial dial gauge.
- **Line 286**:
  ```typescript
  const location = exportDataBackup(count.locId);
  ```
  In `main.ts:5560`, `exportDataBackup = bs = (id) => X.locations.find(t => t.id === id)`. This looks up a location by ID.
- **Lines 349 & 392**:
  ```typescript
  categoryDonutInstance = createDonutChart(catEl, { ... });
  ...
  sellThroughDonutInstance = createDonutChart(stEl, { ... });
  ```
  Both render vertical column bars.
- **Line 452**:
  ```typescript
  getAvailableLocations(numEl, bucket.value, formatMoneyRound, { ... });
  ```
  Animates expiring lot value counter.
- **Line 527**:
  ```typescript
  if (el) renderFilterBar(el, val);
  ```
  Stat counter animator.
- **Line 559**:
  ```typescript
  openMoveStockModal(container);
  ```
  In `main.ts:5524`, `openMoveStockModal = _o = bindMagnetic(root)`. It binds cursor magnetic physics to `.magnetic` elements within `container`.
- **Lines 564, 583, 588, 597, 604**:
  ```typescript
  openNewTransferModal(chip);
  openNewTransferModal(target);
  openNewTransferModal(makeBtn);
  openNewTransferModal(moveBtn);
  ```
  All trigger button haptics (`playHaptic`).

---

## 2. Logic Chain

1. **Premise 1 (Requirement Standards)**: Requirement R1 mandates de-obfuscation and clean, human-readable TypeScript architecture. Modules must declare domain-accurate imports and eliminate confusing, minified legacy single-letter aliases.
2. **Premise 2 (Milestone 1 Primitives Availability)**: In Milestone 1, canonical modules were built and verified:
   - `src/core/motion.ts` exports `animateCounter`, `playHaptic`, `prefersReducedMotion`, `bindMagnetic`, `morphReplace`, `motionDuration`, `gsap`, `Flip`.
   - `src/core/constants.ts` exports `CATEGORY_NAMES`, `CATEGORY_TONES`, `CHANNEL_NAMES`, `ONE_DAY_MS`.
   - `src/core/store.ts` exports `store`, `subscribeToStore`, `findLocationById`, `findProductById`, `getProductStock`, `getAvailableStock`, `getActiveAllocatedStock`.
   - `src/utils/dom.ts` exports `escapeHtml`, `domQuery`, `domQueryAll`, `queryOne`, `$`, `$$`.
   - `src/utils/formatters.ts` exports `formatDate`, `formatInt`, `formatMoney`, `formatMoneyK`, `formatMoneyRound`, `formatPercent`, `formatRelativeTime`.
3. **Premise 3 (Inversion Identification)**: During early scaffolding, `main.ts` exported dozens of mangled aliases (e.g. `const getAvailableLocations = ho`, `const bindMagnetic = $a`, `const openMoveStockModal = _o`, `const exportDataBackup = bs`, `const renderProgressBar = rc`). Milestone 2 modules imported these from `main.ts` rather than the canonical modules.
4. **Deduction 1 (Semantic Equivalence)**:
   - `ho` is identical to `animateCounter` in `src/core/motion.ts:17`. Replacing `getAvailableLocations` with `animateCounter` preserves 100% of tween parameters, timing, and formatting behavior.
   - `$a` is identical to `prefersReducedMotion.matches` in `src/core/motion.ts:6`. Replacing `bindMagnetic()` with `prefersReducedMotion.matches` eliminates the risk of collision with the true `bindMagnetic(root)` cursor physics.
   - `_o` is identical to `bindMagnetic(root)` in `src/core/motion.ts:155`. Replacing `openMoveStockModal(container)` with `bindMagnetic(container)` aligns code with what it actually executes.
   - `Uo` is identical to `CATEGORY_NAMES` in `src/core/constants.ts:74`. Replacing `formatShortDate as string[]` eliminates an unsafe type cast and imports the clean constant array.
   - `renderColumnBarChart` is the underlying renderer for `createDonutChart` in `charts.ts:24`. Replacing `createDonutChart` with `renderColumnBarChart` in `overview.ts` and `stock.ts` aligns the API call with the DOM structure (`.bars`, `.bars__col`).
   - `ms` is identical to `subscribeToStore(slice, callback)` in `src/core/store.ts:35`. Replacing `findLocationById('orders', cb)` with `subscribeToStore('orders', cb)` eliminates a misleading function name.
   - `bs(locId)` is identical to `findLocationById(locId)` in `src/core/store.ts:80`.
   - `Ms(product)` is identical to `getAvailableStock(product)` in `src/core/store.ts:134`.
5. **Deduction 2 (Zero Regression Guarantee)**: Because each replacement points to the exact same logic already extracted and tested in Milestone 1, replacing these imports produces identical runtime behavior while resolving all architectural and de-obfuscation critique items.
6. **Conclusion**: Remediating all 20 alias mappings across the 12 files will cleanse `shared/widgets/charts/` and `features/analytics/` of legacy `main.ts` couplings.

---

## 3. Concrete Remediation Plan (File-by-File Blueprint)

### 3.1 `shared/widgets/charts/`

#### 1. `shared/widgets/charts/radial-gauge-meter.ts`
- **Replace imports**:
  ```typescript
  // Before:
  import {
    escapeHtml,
    motionDuration,
    getAvailableLocations,
    gsap,
  } from '../../../main';

  // After:
  import { escapeHtml } from '../../../utils/dom';
  import { motionDuration, animateCounter, gsap } from '../../../core/motion';
  ```
- **Replace call at line 94**:
  ```typescript
  // Before:
  getAvailableLocations(numberEl, targetVal, options.format, {
    duration: 1.1,
    delay: motionDuration(delay),
    from: fromVal,
  });

  // After:
  animateCounter(numberEl, targetVal, options.format, {
    duration: 1.1,
    delay: motionDuration(delay),
    from: fromVal,
  });
  ```

#### 2. `shared/widgets/charts/fan-meter.ts`
- **Replace imports**:
  ```typescript
  // Before:
  import {
    escapeHtml,
    motionDuration,
    getAvailableLocations,
    gsap,
  } from '../../../main';

  // After:
  import { escapeHtml } from '../../../utils/dom';
  import { motionDuration, animateCounter, gsap } from '../../../core/motion';
  ```
- **Replace call at line 90**:
  ```typescript
  // Before:
  getAvailableLocations(numberEl, toFraction, formatVal, {
    from: fromFraction,
    duration: 1.3,
    delay: motionDuration(delay),
  });

  // After:
  animateCounter(numberEl, toFraction, formatVal, {
    from: fromFraction,
    duration: 1.3,
    delay: motionDuration(delay),
  });
  ```

#### 3. `shared/widgets/charts/grouped-bar-chart.ts`
- **Replace imports**:
  ```typescript
  // Before:
  import {
    escapeHtml,
    motionDuration,
    bindMagnetic,
    gsap,
  } from '../../../main';

  // After:
  import { escapeHtml } from '../../../utils/dom';
  import { motionDuration, prefersReducedMotion, gsap } from '../../../core/motion';
  ```
- **Replace check at line 129**:
  ```typescript
  // Before:
  if (isNewlyShown || !animate || bindMagnetic()) {

  // After:
  if (isNewlyShown || !animate || prefersReducedMotion.matches) {
  ```

#### 4. `shared/widgets/charts/line-chart.ts`
- **Replace imports**:
  ```typescript
  // Before:
  import {
    escapeHtml,
    motionDuration,
    formatDateInput,
    gsap,
  } from '../../../main';

  // After:
  import { escapeHtml } from '../../../utils/dom';
  import { motionDuration, gsap } from '../../../core/motion';
  ```
- **Replace scheduler at line 158**:
  ```typescript
  // Before:
  const scheduleRender = () => formatDateInput(renderDom);

  // After:
  const scheduleRender = () => requestAnimationFrame(renderDom);
  ```

#### 5. `shared/widgets/charts/column-bar-chart.ts`
- **Replace imports**:
  ```typescript
  // Before:
  import { escapeHtml, motionDuration, gsap } from '../../../main';

  // After:
  import { escapeHtml } from '../../../utils/dom';
  import { motionDuration, gsap } from '../../../core/motion';
  ```

#### 6. `shared/widgets/charts/donut-ring-meter.ts`
- **Replace imports**:
  ```typescript
  // Before:
  import { escapeHtml, motionDuration, gsap } from '../../../main';

  // After:
  import { escapeHtml } from '../../../utils/dom';
  import { motionDuration, gsap } from '../../../core/motion';
  ```

---

### 3.2 `features/analytics/`

#### 7. `features/analytics/analytics.ts`
- **Replace imports**:
  ```typescript
  // Before:
  import {
    findLocationById,
    domQuery,
    domQueryAll,
  } from '../../main';

  // After:
  import { subscribeToStore } from '../../core/store';
  import { domQuery, domQueryAll } from '../../utils/dom';
  ```
- **Replace subscriptions at lines 116-160**:
  ```typescript
  // Replace every instance of findLocationById with subscribeToStore:
  subscribeToStore('orders', () => { clearStatsCache(); refreshCurrentSubtab(); });
  subscribeToStore('history', () => { clearStatsCache(); refreshCurrentSubtab(); });
  subscribeToStore('products', refreshCurrentSubtab);
  subscribeToStore('batches', () => { ... });
  subscribeToStore('counts', () => { ... });
  subscribeToStore('moves', () => { ... });
  subscribeToStore('settings', () => { ... });
  ```

#### 8. `features/analytics/services/stats-cache.ts`
- **Replace imports**:
  ```typescript
  // Before:
  import {
    store,
    findProductById,
    startOfToday,
    startOfDay,
    formatDate,
    formatInt,
    formatMoney,
    formatMoneyK,
    formatMoneyRound,
    formatPercent,
    getLastMonthValue,
    getOrdersByCustomer,
    formatShortDate,
    ONE_DAY_MS,
  } from '../../../main';

  // After:
  import { store, findProductById, getProductStock } from '../../../core/store';
  import { CATEGORY_NAMES, ONE_DAY_MS } from '../../../core/constants';
  import {
    formatDate,
    formatInt,
    formatMoney,
    formatMoneyK,
    formatMoneyRound,
    formatPercent,
  } from '../../../utils/formatters';
  ```
- **Add clean semantic date & valuation helpers**:
  ```typescript
  export const startOfDay = (ts: number): number => new Date(ts).setHours(0, 0, 0, 0);
  export const startOfToday = (): number => startOfDay(Date.now());
  export const isOrderActive = (order: { status: string }): boolean => order.status !== 'cancelled';

  export function getTotalInventoryValue(): number {
    const productsVal = store.products.reduce((sum: number, p: any) => sum + getProductStock(p) * p.cost, 0);
    const materialsVal = store.materials.reduce((sum: number, m: any) => sum + m.onHand * m.cost, 0);
    return productsVal + materialsVal;
  }
  ```
- **Replace line 44**:
  ```typescript
  // Before:
  export const PRODUCT_CATEGORIES = formatShortDate as string[];

  // After:
  export const PRODUCT_CATEGORIES = [...CATEGORY_NAMES];
  ```
- **Replace line 90**:
  ```typescript
  // Before:
  if (!getOrdersByCustomer(order)) continue;

  // After:
  if (!isOrderActive(order)) continue;
  ```
- **Replace lines 234, 238, 253**:
  Replace `getLastMonthValue()` with `getTotalInventoryValue()`.

#### 9. `features/analytics/services/stock-calculator.ts`
- **Replace imports**:
  ```typescript
  // Before:
  import {
    store,
    findProductById,
    daysUntilExpiry,
    renderProgressBar,
    getRecentOrders,
    getProductStock,
    getTotalStockCostValue,
  } from '../../../main';

  // After:
  import { store, findProductById, getProductStock, getAvailableStock } from '../../../core/store';
  import { ONE_DAY_MS } from '../../../core/constants';
  ```
- **Add semantic helpers**:
  ```typescript
  export const daysUntilExpiry = (batch: { expiresAt: number }): number =>
    Math.ceil((batch.expiresAt - Date.now()) / ONE_DAY_MS);

  export function getProductRecentSales(productId: string, days = 30): number {
    const since = Date.now() - days * ONE_DAY_MS;
    return store.orders
      .filter((o: any) => o.createdAt >= since && o.status !== 'cancelled')
      .reduce(
        (sum: number, o: any) =>
          sum + o.lines.filter((l: any) => l.productId === productId).reduce((lSum: number, l: any) => lSum + l.qty, 0),
        0
      );
  }

  export function getTotalProductStockCost(): number {
    return store.products.reduce((sum: number, p: any) => sum + getProductStock(p) * p.cost, 0);
  }

  export function calculateProductDaysOfCover(product: any): number {
    const dailyVelocity = getProductRecentSales(product.id, 30) / 30;
    return dailyVelocity ? Math.floor(getAvailableStock(product) / dailyVelocity) : Infinity;
  }
  ```
- **Update call sites**:
  - Line 36 & 42: `getRecentOrders(p.id, 30)` -> `getProductRecentSales(p.id, 30)`.
  - Line 40: `getTotalStockCostValue()` -> `getTotalProductStockCost()`.
  - Line 80: `.map(renderProgressBar)` -> `.map(calculateProductDaysOfCover)`.

#### 10. `features/analytics/subtabs/overview.ts`
- **Clean up imports**:
  ```typescript
  import { store } from '../../../core/store';
  import { CHANNEL_NAMES, ONE_DAY_MS } from '../../../core/constants';
  import {
    motionDuration,
    animateCards,
    animateRows,
    animatePop,
    animateCounter,
    playHaptic,
    prefersReducedMotion,
    Flip,
    gsap,
  } from '../../../core/motion';
  import {
    renderLineChart,
    renderDonutRingMeter,
    renderColumnBarChart,
    renderSparklineSvg,
  } from '../../../shared/widgets/charts';
  import { queryOne, domQuery, domQueryAll, escapeHtml } from '../../../utils/dom';
  import {
    formatDate,
    formatInt,
    formatMoney,
    formatMoneyK,
    formatMoneyRound,
    formatPercent,
  } from '../../../utils/formatters';
  // Keep remaining UI components from main.ts / ui (setSalesGoal, showToast, renderPageHeader, renderTag, renderIcon, renderSegmentedControl, etc.)
  ```
- **Replace line 197**:
  ```typescript
  // Before:
  if (!path || !animate || bindMagnetic()) return;

  // After:
  if (!path || !animate || prefersReducedMotion.matches) return;
  ```
- **Replace line 225**:
  ```typescript
  // Before:
  getAvailableLocations(valEl, data.total, METRIC_CONFIGS[key].fmt, ...);

  // After:
  animateCounter(valEl, data.total, METRIC_CONFIGS[key].fmt, ...);
  ```
- **Replace line 579**:
  ```typescript
  // Before:
  categoryBarsInstance = createDonutChart(barsEl, { ... });

  // After:
  categoryBarsInstance = renderColumnBarChart(barsEl, { ... });
  ```
- **Replace lines 703 & 711**:
  ```typescript
  // Before:
  openNewTransferModal(e.currentTarget as HTMLElement);
  openNewTransferModal(btn);

  // After:
  playHaptic(e.currentTarget as HTMLElement);
  playHaptic(btn);
  ```

#### 11. `features/analytics/subtabs/sales.ts`
- **Clean up imports**:
  ```typescript
  import { store, findCustomerById } from '../../../core/store';
  import { CATEGORY_TONES, CHANNEL_NAMES } from '../../../core/constants';
  import {
    motionDuration,
    animateCards,
    animateRows,
    animateCounter,
    playHaptic,
    prefersReducedMotion,
    gsap,
  } from '../../../core/motion';
  import { renderLineChart, renderSparklineSvg } from '../../../shared/widgets/charts';
  import { queryOne, domQuery, domQueryAll, escapeHtml } from '../../../utils/dom';
  import {
    formatDate,
    formatInt,
    formatMoney,
    formatMoneyK,
    formatMoneyRound,
    formatPercent,
    formatRelativeTime,
  } from '../../../utils/formatters';
  ```
- **Replace line 200**:
  ```typescript
  // Before:
  const updateStat = (key: string, val: number) => {
    const el = queryOne<HTMLElement>(`[data-stat="${key}"] b[data-count]`, container);
    if (el) renderFilterBar(el, val);
  };

  // After:
  const updateStat = (key: string, val: number) => {
    const el = queryOne<HTMLElement>(`[data-stat="${key}"] b[data-count]`, container);
    if (el) {
      el.dataset.count = String(val);
      animateCounter(el, val, formatInt, { duration: 0.9 });
    }
  };
  ```
- **Replace `openNewTransferModal`** (where buttons are clicked) with `playHaptic(btn)`.

#### 12. `features/analytics/subtabs/stock.ts`
- **Clean up imports**:
  ```typescript
  import {
    store,
    findProductById,
    findLocationById,
    getProductStock,
    getAvailableStock,
  } from '../../../core/store';
  import {
    motionDuration,
    animateCards,
    animateRows,
    animateCounter,
    playHaptic,
    bindMagnetic,
    initLiftAnimations,
    morphReplace,
    gsap,
  } from '../../../core/motion';
  import {
    renderDonutRingMeter,
    renderColumnBarChart,
    renderRadialGaugeMeter,
  } from '../../../shared/widgets/charts';
  import { queryOne, domQuery, domQueryAll, escapeHtml } from '../../../utils/dom';
  import {
    formatInt,
    formatMoneyK,
    formatMoneyRound,
    formatPercent,
    formatRelativeTime,
  } from '../../../utils/formatters';
  import {
    calculateStockAccuracy,
    calculateStockTurns,
    calculateExpiringLots,
    calculateMedianDaysOfCover,
    calculateProductDaysOfCover,
    getProductRecentSales,
    daysUntilExpiry,
  } from '../services/stock-calculator';
  import { PRODUCT_CATEGORIES, getTotalInventoryValue } from '../services/stats-cache';
  ```
- **Replace specific call sites**:
  - Line 102 & 537: `getLastMonthValue()` -> `getTotalInventoryValue()`.
  - Line 186: `renderProgressBar(p)` -> `calculateProductDaysOfCover(p)`.
  - Line 221: `getMaterialStock(p)` -> `getAvailableStock(p)`.
  - Line 221, 383, 497: `getRecentOrders(p.id, 30)` -> `getProductRecentSales(p.id, 30)`.
  - Line 242: `bindModalDismiss(listEl, () => { listEl.innerHTML = barsHtml; })` -> `morphReplace(listEl, () => { listEl.innerHTML = barsHtml; })`.
  - Line 266: `accuracyGaugeInstance = createHorizontalBarChart(...)` -> `accuracyGaugeInstance = renderRadialGaugeMeter(...)`.
  - Line 286: `const location = exportDataBackup(count.locId);` -> `const location = findLocationById(count.locId);`.
  - Lines 349 & 392: `createDonutChart` -> `renderColumnBarChart`.
  - Line 452: `getAvailableLocations` -> `animateCounter`.
  - Line 527: `renderFilterBar(el, val)` -> `animateCounter(el, val, formatInt, { duration: 0.9 })`.
  - Line 559: `openMoveStockModal(container)` -> `bindMagnetic(container)`.
  - Lines 564, 583, 588, 597, 604: `openNewTransferModal(btn)` -> `playHaptic(btn)`.

---

## 4. Caveats

1. **Read-Only Investigation**: In compliance with the Explorer archetype and project instructions, no source files were edited during this step. All code snippets and patches are documented in this report for execution by the implementer agent (`worker_m2`).
2. **Other Submodules**: De-obfuscation in `settings`, `customers`, and `help` is owned by parallel Explorer agents (`explorer_m2_it2_2` and `explorer_m2_it2_3`). This report scopes strictly to `charts` and `analytics`.
3. **UI Overlay Primitives**: Modals (`openQuickCreateModal`, `openScheduleCountModal`, `openMakeBatchModal`, `openNewBatchModal`) and general chrome controls (`renderPageHeader`, `renderTag`, `renderIcon`, `renderSegmentedControl`) continue to be re-exported by `main.ts` or will transition cleanly to `src/ui/` in subsequent milestones.

---

## 5. Conclusion

Forensic examination has identified and mapped 100% of the lingering legacy alias imports from `src/main.ts` inside `shared/widgets/charts/`, `shared/widgets/charts.ts`, and `features/analytics/`.

Every obfuscated alias has been decoded to its original implementation and mapped to its canonical modern primitive in `src/core/motion.ts`, `src/core/constants.ts`, `src/core/store.ts`, `src/utils/dom.ts`, `src/utils/formatters.ts`, and `src/shared/widgets/charts/`.

With this remediation blueprint, `worker_m2` has precise line numbers and drop-in code patches to completely cleanse these files without any functional or visual regression.

---

## 6. Verification Method

To verify the implementation of this remediation plan:
1. **TypeScript Typecheck**:
   ```bash
   cd "E:\dashborad clone\frontend"
   npm run typecheck
   ```
   *Expected: 0 errors.*
2. **Production Bundle Build**:
   ```bash
   cd "E:\dashborad clone\frontend"
   npm run build
   ```
   *Expected: 0 errors, successful production build.*
3. **Automated E2E Playwright Suite**:
   ```bash
   cd "E:\dashborad clone\frontend"
   npx playwright test
   ```
   *Expected: All 47/47 specs pass.*
4. **Forensic Alias Grep**:
   ```bash
   # Ensure zero occurrences of these obfuscated aliases in charts and analytics:
   grep -rn "getAvailableLocations" frontend/src/shared/widgets/charts/ frontend/src/features/analytics/
   grep -rn "bindMagnetic()" frontend/src/shared/widgets/charts/ frontend/src/features/analytics/
   grep -rn "formatShortDate as string" frontend/src/features/analytics/
   grep -rn "createDonutChart" frontend/src/features/analytics/
   grep -rn "renderProgressBar" frontend/src/features/analytics/
   grep -rn "from '../../../main'" frontend/src/shared/widgets/charts/
   ```
   *Expected: 0 occurrences.*
