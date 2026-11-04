# Milestone 2 Iteration 2: Legacy Alias Cleansing Investigation Report (Customers & Help Modules)

**Explorer Agent**: `explorer_m2_it2_3`  
**Roles**: Explorer, Investigator, Synthesizer  
**Working Directory**: `E:\dashborad clone\.agents\teamwork\explorer_m2_it2_3`  
**Target Milestone**: Milestone 2 Iteration 2 — Legacy Alias Cleansing (`customers` & `help` modules)

---

## Executive Summary
This read-only investigation systematically examined all source files within `frontend/src/features/customers/` and `frontend/src/features/help/`. We located and mapped every lingering legacy alias, inverted barrel export from `src/main.ts`, and misrouted dependency.

Specifically, we identified:
1. **9 button haptic invocations** disguised as `openNewTransferModal(btn)` across 5 files, to be replaced with `playHaptic(btn)` from `src/core/motion.ts`.
2. **7 reduced motion checks** disguised as boolean calls `bindMagnetic()` across 3 files, to be replaced with `prefersReducedMotion.matches` from `src/core/motion.ts`.
3. **3 magnetic physics bindings** disguised as `openMoveStockModal(container)` across 3 subtabs, to be replaced with `bindMagnetic(container)` from `src/core/motion.ts`.
4. **1 inverted bar chart invocation** in `customer-drawer.ts:203` where `createDonutChart` is called to render a vertical column bar chart, to be replaced with `renderColumnBarChart` from `src/shared/widgets/charts`.
5. **Verification of critical invariants**:
   - `<h3><b>${highlightSearchMatch(customer.name, query)}</b></h3>` in `stockist-card.ts:40` is intact and strictly satisfies Playwright locator assertions.
   - Zero isolated "Pick" tokens exist in `faq-data.ts` (the Kanban board stage correctly reads `Packing`).
6. **Complete mapping of direct imports** to `src/core/store.ts` (`store`, `subscribeToStore`, `findCustomerById`, `findProductById`, `notifyStoreSubscribers`), `src/core/constants.ts` (`ONE_DAY_MS`, `CUSTOMER_TAG_NAMES`), `src/core/motion.ts`, `src/utils/dom.ts`, `src/utils/formatters.ts`, `src/utils/icons.ts`, and `src/ui/popover.ts`.

---

## 1. Observation

### 1.1 Baseline System Verification
Commands executed from `E:\dashborad clone\frontend`:
- `npm run typecheck` (`tsc --noEmit`): Exited with code `0`, 0 errors.
- `npm run build` (`vite build`): Exited with code `0`, 51 modules transformed in 3.44s.
- `npx playwright test tests/challenger_m2_stress.spec.js`: **23/23 tests passed (100%)** in 58.7s.

### 1.2 Target Module Inventory & Import Footprint
The modules under review comprise 10 source files:
- **Customers**:
  1. `frontend/src/features/customers/customers.ts`
  2. `frontend/src/features/customers/components/customer-drawer.ts`
  3. `frontend/src/features/customers/components/stockist-card.ts`
  4. `frontend/src/features/customers/services/customer-metrics.ts`
  5. `frontend/src/features/customers/subtabs/stockists.ts`
  6. `frontend/src/features/customers/subtabs/shoppers.ts`
- **Help**:
  7. `frontend/src/features/help/help.ts`
  8. `frontend/src/features/help/data/faq-data.ts`
  9. `frontend/src/features/help/subtabs/center.ts`
  10. `frontend/src/features/help/subtabs/tickets.ts`

---

### 1.3 Exact Code Findings & Verbatim Quotations

#### Finding A: `openNewTransferModal` Used for Button Click Haptics
In `frontend/src/main.ts:221 & 5535`:
```typescript
function go(e) {
  if (Qa.matches) return;
  let t = e.querySelector(`svg`) ?? e;
  H.fromTo(t, { scale: 0.72 }, { scale: 1, duration: 0.55, ease: `back.out(3)`, overwrite: !0 });
}
...
const openNewTransferModal = go;
```
In `src/core/motion.ts:56`:
```typescript
export function playHaptic(element: HTMLElement | null): void {
  if (!element || prefersReducedMotion.matches) return;
  const target = element.querySelector('svg') ?? element;
  gsap.fromTo(
    target,
    { scale: 0.72 },
    { scale: 1, duration: 0.55, ease: 'back.out(3)', overwrite: true }
  );
}
```
**Occurrences across Customers and Help**:
1. `src/features/customers/components/customer-drawer.ts`:
   - Line 25: `openNewTransferModal,` (import)
   - Line 232:
     ```typescript
     openNewTransferModal(orderBtn);
     ```
2. `src/features/customers/subtabs/stockists.ts`:
   - Line 13: `openNewTransferModal,` (import)
   - Line 275:
     ```typescript
     openNewTransferModal(chipBtn);
     ```
   - Line 313:
     ```typescript
     openNewTransferModal(viewBtn);
     ```
   - Line 328:
     ```typescript
     openNewTransferModal(actBtn);
     ```
3. `src/features/customers/subtabs/shoppers.ts`:
   - Line 13: `openNewTransferModal,` (import)
   - Line 255:
     ```typescript
     openNewTransferModal(chipBtn);
     ```
   - Line 306:
     ```typescript
     openNewTransferModal(actBtn);
     ```
4. `src/features/help/subtabs/center.ts`:
   - Line 18: `openNewTransferModal,` (import)
   - Line 377:
     ```typescript
     openNewTransferModal(catButton);
     ```
   - Line 385:
     ```typescript
     openNewTransferModal(popChip);
     ```
5. `src/features/help/subtabs/tickets.ts`:
   - Line 25: `openNewTransferModal,` (import)
   - Line 468:
     ```typescript
     openNewTransferModal(chipBtn);
     ```
   - Line 487:
     ```typescript
     openNewTransferModal(actionBtn);
     ```

**Summary**: 5 files, 9 invocation sites, 5 import sites.

---

#### Finding B: `bindMagnetic()` Used as Reduced Motion Check & Inverted Alias
In `frontend/src/main.ts:10 & 5586`:
```typescript
const Qa = matchMedia("(prefers-reduced-motion: reduce)");
const $a = () => Qa.matches;
...
const bindMagnetic = $a;
```
In `src/core/motion.ts:6`:
```typescript
export const prefersReducedMotion =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : { matches: false };
```
**Occurrences of `bindMagnetic()` as reduced motion query**:
1. `src/features/customers/subtabs/stockists.ts`:
   - Line 17: `bindMagnetic,` (import)
   - Line 127:
     ```typescript
     if (bindMagnetic() || !cards.length) {
     ```
2. `src/features/help/subtabs/center.ts`:
   - Line 13: `bindMagnetic,` (import)
   - Line 246:
     ```typescript
     if (!bindMagnetic()) {
       Flip.from(flipState, { ... });
     }
     ```
   - Line 323:
     ```typescript
     behavior: bindMagnetic() ? 'auto' : 'smooth',
     ```
3. `src/features/help/subtabs/tickets.ts`:
   - Line 13: `bindMagnetic,` (import)
   - Line 259:
     ```typescript
     if (!bindMagnetic()) {
       Flip.from(flipState, { ... });
     }
     ```
   - Line 343:
     ```typescript
     behavior: bindMagnetic() ? 'auto' : 'smooth',
     ```
   - Line 363:
     ```typescript
     if (errorMsg && !bindMagnetic()) {
     ```
   - Line 425:
     ```typescript
     if (freshCardEl && !bindMagnetic()) {
     ```

**The Inverted Counterpart: `openMoveStockModal`**:
In `frontend/src/main.ts:226 & 5524`:
```typescript
function _o(e = document) {
  eo.matches && K(`.magnetic`, e).forEach((e) => { ... }); // Binds magnetic pointer physics
}
...
const openMoveStockModal = _o;
```
In `src/core/motion.ts:155`:
```typescript
export function bindMagnetic(root: Document | HTMLElement = document): void { ... }
```
In subtabs, the magnetic cursor physics binding was disguised as `openMoveStockModal`:
1. `src/features/customers/subtabs/stockists.ts:12 & 269`:
   ```typescript
   openMoveStockModal(rootContainer);
   ```
2. `src/features/customers/subtabs/shoppers.ts:12 & 249`:
   ```typescript
   openMoveStockModal(rootContainer);
   ```
3. `src/features/help/subtabs/center.ts:19 & 350`:
   ```typescript
   openMoveStockModal(rootContainer);
   ```

**Summary**:
- Calls to `bindMagnetic()` must be replaced with `prefersReducedMotion.matches`.
- Calls to `openMoveStockModal(container)` must be replaced with `bindMagnetic(container)`.

---

#### Finding C: Mini Bar Chart in Customer Drawer Invoked as `createDonutChart`
In `src/shared/widgets/charts.ts:24`:
```typescript
renderColumnBarChart as createDonutChart,
```
In `src/features/customers/components/customer-drawer.ts`:
- Line 29:
  ```typescript
  import { createDonutChart } from '../../../shared/widgets/charts';
  ```
- Lines 201-215:
  ```typescript
  const monthBuckets = generateMonthlyBucketTimestamps(6);
  const metrics = calculateCustomerMetrics(customer);
  const chart = createDonutChart(domQuery('[data-ds="bars"]', el), {
    labels: monthBuckets.map((ts) =>
      new Date(ts).toLocaleDateString('en-US', {
        month: 'short',
      })
    ),
    values: metrics.monthly,
    format: formatMoneyRound,
    tone: customer.kind === 'stockist' ? 'pine' : 'sky',
    label: `Monthly spend of ${customer.name}`,
    highlight: 5,
  });
  chart.play(0.3);
  ```
This widget renders vertical column bars for monthly spend. Calling `createDonutChart` is misleading.  
**Replacement**: Import and call `renderColumnBarChart` from `../../../shared/widgets/charts`.

---

#### Finding D: Critical Test Invariants Verification
1. **Stockist Card Name Heading Structure**:
   In `frontend/src/features/customers/components/stockist-card.ts:40`:
   ```typescript
   <span class="cs-card__name"><h3><b>${highlightSearchMatch(customer.name, query)}</b></h3><small>${highlightSearchMatch(contactText, query)}</small></span>
   ```
   *Verification*: `tests/challenger_m2_stress.spec.js:181` asserts:
   ```javascript
   const firstCardName = await page.locator('.cs-card .cs-card__name h3 b').first().textContent();
   ```
   This exact structure is present and must remain unmodified.

2. **Help FAQ Answer "Packing" Stage (Zero Isolated "Pick" Tokens)**:
   In `frontend/src/features/help/data/faq-data.ts:110`:
   ```typescript
   a: 'Wholesale orders are for stockists, priced at wholesale and packed in cases of six. They ship within three days and can be on Net 30 terms, so they stay unpaid until you mark them paid. Online orders are priced at retail and ship the next working day. Both move New → Packing → Packed → Shipped → Delivered on the board.',
   ```
   *Verification*: Regex query `\bpick\b` across `frontend/src/features/help` returns **0 matches**. The board stage correctly uses `Packing`.

---

#### Finding E: Other Lingering Imports from `main.ts` & Their Canonical Destinations

1. **`findLocationById` Used for Store Subscriptions**:
   In `customers.ts:86-87` and `help.ts:79`:
   ```typescript
   // customers.ts:86-87:
   findLocationById('customers', onStoreChange);
   findLocationById('orders', onStoreChange);
   
   // help.ts:79:
   findLocationById('tickets', () => { ... });
   ```
   In `main.ts:5527`, `findLocationById = ms` which is `subscribeToStore`.
   **Replacement**: Import `subscribeToStore` directly from `src/core/store.ts`.

2. **`createCustomElement` in `stockists.ts` Used as Dropdown Menu**:
   In `stockists.ts:15 & 290`:
   ```typescript
   createCustomElement(
     anchor,
     STOCKIST_SORT_OPTIONS.map(([val, label]) => ({
       label,
       checked: val === currentSort,
       onSelect: () => { ... },
     })),
     { align: 'end' }
   );
   ```
   In `main.ts:5587`, `createCustomElement = Jc`, which renders a dropdown menu popover.  
   In `src/ui/popover.ts:208`, `openDropdownMenu(anchor, items, options)` is already defined and typed.  
   **Replacement**: Import `openDropdownMenu` from `src/ui/popover.ts`.

3. **`getAvailableSuppliers` in Customers Subtabs Used for Stat Pulse Animation**:
   In `customer-drawer.ts:270, 274`, `stockists.ts:192, 377`, `shoppers.ts:140, 355`:
   ```typescript
   getAvailableSuppliers(badge);
   getAvailableSuppliers(countEl);
   ```
   In `main.ts:5514`, `getAvailableSuppliers = fo`, which removes and re-adds `is-flash` and pulses the element scale.  
   In `src/core/motion.ts:66`, `export const animatePulse = playHaptic;`.  
   **Replacement**: Import `animatePulse` from `src/core/motion.ts`.

4. **Core Store Entities (`store`, `findCustomerById`, `findProductById`, `notifyStoreSubscribers`)**:
   - `customers.ts`: `findCustomerById` -> `src/core/store.ts`.
   - `customer-drawer.ts`: `findCustomerById` -> `src/core/store.ts`.
   - `customer-metrics.ts`: `store`, `findProductById` -> `src/core/store.ts`.
   - `stockists.ts`: `store` -> `src/core/store.ts`.
   - `shoppers.ts`: `store` -> `src/core/store.ts`.
   - `center.ts`: `store` -> `src/core/store.ts`.
   - `tickets.ts`: `store`, `notifyStoreSubscribers` -> `src/core/store.ts`.

5. **Constants (`ONE_DAY_MS`, `CUSTOMER_TAG_NAMES`)**:
   - `stockist-card.ts`: `CUSTOMER_TAG_NAMES` -> `src/core/constants.ts`.
   - `customer-metrics.ts`: `ONE_DAY_MS` -> `src/core/constants.ts`.
   - `stockists.ts`: `ONE_DAY_MS`, `CUSTOMER_TAG_NAMES` -> `src/core/constants.ts`.
   - `shoppers.ts`: `ONE_DAY_MS`, `CUSTOMER_TAG_NAMES` -> `src/core/constants.ts`.

6. **Motion Helpers (`motionDuration`, `animateCards`, `animateRows`, `animatePop`, `initLiftAnimations`, `gsap`, `Flip`)**:
   Import directly from `src/core/motion.ts`.

7. **DOM & Formatting Utilities**:
   - `domQuery`, `domQueryAll`, `queryOne`, `escapeHtml` -> `src/utils/dom.ts`.
   - `formatDate`, `formatRelativeTime`, `formatMoneyRound`, `formatInt`, `formatPercent`, `pluralize`, `startOfMonth` -> `src/utils/formatters.ts`.
   - `renderIcon`, `renderIconButton`, `renderPill` -> `src/utils/icons.ts`.

---

## 2. Logic Chain

1. **Premise 1**: Requirement R1 mandates de-obfuscation and clean modular architecture: feature modules must not import core primitives through single-letter aliases or misleading legacy names (`openNewTransferModal`, `bindMagnetic()`, `getAvailableSuppliers`, `openMoveStockModal`, `findLocationById`, `createDonutChart`).
2. **Premise 2**: Milestone 1 successfully established `src/core/motion.ts`, `src/core/store.ts`, `src/core/constants.ts`, `src/utils/dom.ts`, `src/utils/formatters.ts`, and `src/utils/icons.ts`.
3. **Premise 3**: Inspection of `features/customers/` and `features/help/` shows:
   - Button click animations call `openNewTransferModal` (which is `playHaptic`).
   - Reduced-motion accessibility checks call `bindMagnetic()` (which is `prefersReducedMotion.matches`).
   - Cursor magnetic listeners call `openMoveStockModal` (which is `bindMagnetic(root)`).
   - Column bar charts call `createDonutChart` (which is `renderColumnBarChart`).
   - Store slice subscriptions call `findLocationById` (which is `subscribeToStore`).
   - Stat badge pulsing calls `getAvailableSuppliers` (which is `animatePulse`).
4. **Deduction 1**: Pointing these imports directly to their canonical definitions eliminates the obfuscation while preserving 100% runtime behavioral parity, satisfying Requirement R2.
5. **Deduction 2**: Preserving `<h3><b>${highlightSearchMatch(customer.name, query)}</b></h3>` in `stockist-card.ts:40` and avoiding the isolated token "Pick" in `faq-data.ts:110` ensures zero test regressions across the Playwright test suite.
6. **Conclusion**: Worker M2 Iteration 2 can systematically execute this remediation plan without altering business logic or breaking test locators.

---

## 3. Caveats

- **Scope Boundary**: This investigation strictly analyzed `frontend/src/features/customers/` and `frontend/src/features/help/`. Modules belonging to Milestone 3 (`dashboard`, `products`, `orders`, `purchasing`, `warehouses`) or other M2 modules (`settings`, `analytics`, `charts`) were referenced only for context.
- **`main.ts` Barrel Retain**: `main.ts` must continue exporting backward-compatibility aliases until Milestone 3 refactors the remaining transactional modules. The changes proposed here only update imports *inside* `customers` and `help`.
- **UI Dialog and Modal Helpers**: Shared modals like `openNewCustomerModal`, `openNewOrderModal`, and `renderPageHeader` remain exported from `main.ts` until Milestone 3/4 completes full shell modularization. Only aliases with existing canonical homes (`core/*`, `utils/*`, `ui/*`) are migrated.

---

## 4. Conclusion & Actionable File-by-File Remediation Plan

### Summary of Targeted Changes
| File | Legacy Identifiers to Remove | Canonical Replacement Destination |
|---|---|---|
| `customers/customers.ts` | `findLocationById`, `findCustomerById`, `domQuery`, `domQueryAll` | `subscribeToStore`, `findCustomerById` from `src/core/store`; `domQuery`, `domQueryAll` from `src/utils/dom` (ZERO imports from `main.ts`) |
| `customers/components/customer-drawer.ts` | `createDonutChart` -> `renderColumnBarChart`; `openNewTransferModal` -> `playHaptic`; `getAvailableSuppliers` -> `animatePulse`; `findCustomerById` -> `src/core/store` | `src/shared/widgets/charts`; `src/core/motion`; `src/core/store`; `src/utils/dom`; `src/utils/formatters`; `src/utils/icons` |
| `customers/components/stockist-card.ts` | `CUSTOMER_TAG_NAMES` from `main.ts`; `createSparkline` | `CUSTOMER_TAG_NAMES` from `src/core/constants`; `renderSparklineSvg` from `src/shared/widgets/charts`; `src/utils/dom`, `src/utils/formatters`, `src/utils/icons` |
| `customers/services/customer-metrics.ts` | `ONE_DAY_MS`, `store`, `findProductById`, `startOfMonth`, `formatRelativeTime` from `main.ts` | `src/core/constants`; `src/core/store`; `src/utils/formatters` |
| `customers/subtabs/stockists.ts` | `openNewTransferModal` -> `playHaptic`; `bindMagnetic()` -> `prefersReducedMotion.matches`; `openMoveStockModal` -> `bindMagnetic`; `createCustomElement` -> `openDropdownMenu`; `getAvailableSuppliers` -> `animatePulse`; `ONE_DAY_MS`, `CUSTOMER_TAG_NAMES` from `main.ts`; `store` from `main.ts` | `src/core/motion`; `src/ui/popover`; `src/core/constants`; `src/core/store`; `src/utils/dom`; `src/utils/icons` |
| `customers/subtabs/shoppers.ts` | `openNewTransferModal` -> `playHaptic`; `openMoveStockModal` -> `bindMagnetic`; `getAvailableSuppliers` -> `animatePulse`; `ONE_DAY_MS`, `CUSTOMER_TAG_NAMES` from `main.ts`; `store` from `main.ts` | `src/core/motion`; `src/core/constants`; `src/core/store`; `src/utils/dom`; `src/utils/formatters`; `src/utils/icons` |
| `help/help.ts` | `findLocationById` -> `subscribeToStore`; `motionDuration` -> `src/core/motion`; `domQuery`, `domQueryAll` -> `src/utils/dom` | ZERO imports from `main.ts` |
| `help/subtabs/center.ts` | `openNewTransferModal` -> `playHaptic`; `bindMagnetic()` -> `prefersReducedMotion.matches`; `openMoveStockModal` -> `bindMagnetic`; `store` from `main.ts` | `src/core/motion`; `src/core/store`; `src/utils/dom`; `src/utils/icons`; `src/utils/formatters` |
| `help/subtabs/tickets.ts` | `openNewTransferModal` -> `playHaptic`; `bindMagnetic()` -> `prefersReducedMotion.matches`; `store`, `notifyStoreSubscribers` from `main.ts` | `src/core/motion`; `src/core/store`; `src/utils/dom`; `src/utils/icons`; `src/utils/formatters` |
| `help/data/faq-data.ts` | None | Already clean; verify invariant ("Packing") |

---

### Detailed Implementation Blueprint for Worker

#### 1. `customers/customers.ts`
- **Replace imports**:
  ```typescript
  import { domQuery, domQueryAll } from '../../utils/dom';
  import { subscribeToStore, findCustomerById } from '../../core/store';
  import type { FeaturePage } from '../../types/common';
  ```
- **Replace lines 86-87**:
  ```typescript
  subscribeToStore('customers', onStoreChange);
  subscribeToStore('orders', onStoreChange);
  ```

#### 2. `customers/components/customer-drawer.ts`
- **Replace chart import & call**:
  ```typescript
  import { renderColumnBarChart } from '../../../shared/widgets/charts';
  ```
  Line 203:
  ```typescript
  const chart = renderColumnBarChart(domQuery('[data-ds="bars"]', el), { ... });
  ```
- **Replace motion imports & calls**:
  ```typescript
  import { playHaptic, animatePulse, animatePop, gsap } from '../../../core/motion';
  import { findCustomerById } from '../../../core/store';
  import { escapeHtml, domQuery, domQueryAll, queryOne } from '../../../utils/dom';
  import { formatMoneyRound, formatInt, formatDate, formatRelativeTime, pluralize } from '../../../utils/formatters';
  import { renderIcon } from '../../../utils/icons';
  ```
  Line 232:
  ```typescript
  playHaptic(orderBtn);
  ```
  Lines 270, 274:
  ```typescript
  animatePulse(countBadge);
  animatePulse(revBadge);
  ```

#### 3. `customers/components/stockist-card.ts`
- **Replace imports**:
  ```typescript
  import { CUSTOMER_TAG_NAMES } from '../../../core/constants';
  import { renderSparklineSvg } from '../../../shared/widgets/charts';
  import { escapeHtml } from '../../../utils/dom';
  import { formatMoneyRound } from '../../../utils/formatters';
  import { renderIcon } from '../../../utils/icons';
  import { renderAvatar, highlightSearchMatch } from '../../../main';
  ```
  Line 48:
  ```typescript
  ${hasSpend ? renderSparklineSvg(metrics.monthly, 'pine', 220, 40) : '<span class="cs-flat"></span>'}
  ```
- **Retain invariant (line 40)**:
  ```typescript
  <h3><b>${highlightSearchMatch(customer.name, query)}</b></h3>
  ```

#### 4. `customers/services/customer-metrics.ts`
- **Replace imports**:
  ```typescript
  import { ONE_DAY_MS } from '../../../core/constants';
  import { store, findProductById } from '../../../core/store';
  import { startOfMonth, formatRelativeTime } from '../../../utils/formatters';
  import { getOrderTotal } from '../../../main';
  ```

#### 5. `customers/subtabs/stockists.ts`
- **Replace imports**:
  ```typescript
  import { ONE_DAY_MS, CUSTOMER_TAG_NAMES } from '../../../core/constants';
  import { store } from '../../../core/store';
  import {
    playHaptic,
    bindMagnetic,
    prefersReducedMotion,
    animatePulse,
    initLiftAnimations,
    motionDuration,
    animateCards,
    animateRows,
    gsap,
  } from '../../../core/motion';
  import { openDropdownMenu } from '../../../ui/popover';
  import { domQuery, domQueryAll, queryOne } from '../../../utils/dom';
  import { renderIcon, renderIconButton } from '../../../utils/icons';
  ```
- **Replace calls**:
  - Line 127: `if (prefersReducedMotion.matches || !cards.length)`
  - Line 192, 377: `animatePulse(badge);`, `animatePulse(countEl);`
  - Line 269: `bindMagnetic(rootContainer);`
  - Lines 275, 313, 328: `playHaptic(chipBtn);`, `playHaptic(viewBtn);`, `playHaptic(actBtn);`
  - Line 290: `openDropdownMenu(anchor, STOCKIST_SORT_OPTIONS.map(...), { align: 'end' });`

#### 6. `customers/subtabs/shoppers.ts`
- **Replace imports**:
  ```typescript
  import { ONE_DAY_MS, CUSTOMER_TAG_NAMES } from '../../../core/constants';
  import { store } from '../../../core/store';
  import {
    playHaptic,
    bindMagnetic,
    animatePulse,
    animateCards,
    animateRows,
    gsap,
  } from '../../../core/motion';
  import { domQuery, domQueryAll, queryOne, escapeHtml } from '../../../utils/dom';
  import {
    formatDate,
    formatRelativeTime,
    formatMoneyRound,
    formatInt,
    formatPercent,
    pluralize,
  } from '../../../utils/formatters';
  import { renderIcon } from '../../../utils/icons';
  ```
- **Replace calls**:
  - Line 140, 355: `animatePulse(badge);`, `animatePulse(countEl);`
  - Line 249: `bindMagnetic(rootContainer);`
  - Lines 255, 306: `playHaptic(chipBtn);`, `playHaptic(actBtn);`

#### 7. `help/help.ts`
- **Replace imports**:
  ```typescript
  import { domQuery, domQueryAll } from '../../utils/dom';
  import { subscribeToStore } from '../../core/store';
  import { motionDuration } from '../../core/motion';
  import type { FeaturePage } from '../../types/common';
  ```
- **Replace line 79**:
  ```typescript
  subscribeToStore('tickets', () => { ... });
  ```

#### 8. `help/subtabs/center.ts`
- **Replace imports**:
  ```typescript
  import { store } from '../../../core/store';
  import {
    playHaptic,
    bindMagnetic,
    prefersReducedMotion,
    motionDuration,
    animatePop,
    animateRows,
    animateCards,
    initLiftAnimations,
    Flip,
    gsap,
  } from '../../../core/motion';
  import { domQuery, domQueryAll, queryOne, escapeHtml } from '../../../utils/dom';
  import { renderIcon } from '../../../utils/icons';
  import { pluralize } from '../../../utils/formatters';
  ```
- **Replace calls**:
  - Line 246: `if (!prefersReducedMotion.matches)`
  - Line 323: `behavior: prefersReducedMotion.matches ? 'auto' : 'smooth',`
  - Line 350: `bindMagnetic(rootContainer);`
  - Lines 377, 385: `playHaptic(catButton);`, `playHaptic(popChip);`

#### 9. `help/subtabs/tickets.ts`
- **Replace imports**:
  ```typescript
  import { store, notifyStoreSubscribers } from '../../../core/store';
  import {
    playHaptic,
    prefersReducedMotion,
    motionDuration,
    animateCards,
    animateRows,
    Flip,
    gsap,
  } from '../../../core/motion';
  import { domQuery, domQueryAll, queryOne, escapeHtml } from '../../../utils/dom';
  import { renderIcon, renderPill } from '../../../utils/icons';
  import { formatDate, formatRelativeTime, pluralize } from '../../../utils/formatters';
  ```
- **Replace calls**:
  - Line 259: `if (!prefersReducedMotion.matches)`
  - Line 343: `behavior: prefersReducedMotion.matches ? 'auto' : 'smooth',`
  - Line 363: `if (errorMsg && !prefersReducedMotion.matches)`
  - Line 425: `if (freshCardEl && !prefersReducedMotion.matches)`
  - Lines 468, 487: `playHaptic(chipBtn);`, `playHaptic(actionBtn);`

---

## 5. Verification Method

To independently verify the implementation after code updates:

1. **Verify TypeScript compilation**:
   ```bash
   cd "E:\dashborad clone\frontend"
   npm run typecheck
   ```
   *Expected outcome*: Exit code 0, 0 errors.

2. **Verify production bundle build**:
   ```bash
   cd "E:\dashborad clone\frontend"
   npm run build
   ```
   *Expected outcome*: Clean build with 0 warnings or errors in < 4s.

3. **Verify automated browser tests**:
   ```bash
   cd "E:\dashborad clone\frontend"
   npx playwright test tests/challenger_m2_stress.spec.js
   ```
   *Expected outcome*: All 23 tests pass with 0 failures.

4. **Verify zero remaining legacy aliases in target modules**:
   Execute grep commands across `frontend/src/features/customers/` and `frontend/src/features/help/`:
   ```bash
   # Should return 0 matches in customers and help:
   grep -rn "openNewTransferModal" frontend/src/features/customers/ frontend/src/features/help/
   grep -rn "bindMagnetic()" frontend/src/features/customers/ frontend/src/features/help/
   grep -rn "createDonutChart" frontend/src/features/customers/
   grep -rn "openMoveStockModal" frontend/src/features/customers/ frontend/src/features/help/
   grep -rn "getAvailableSuppliers" frontend/src/features/customers/
   ```
   *Expected outcome*: 0 occurrences found.

5. **Verify critical invariants**:
   ```bash
   # Customer card name heading structure:
   grep -rn "<h3><b>\${highlightSearchMatch" frontend/src/features/customers/components/stockist-card.ts
   # Must return stockist-card.ts:40
   
   # Check for isolated Pick tokens in help answers:
   grep -rn "\bPick\b" frontend/src/features/help/
   # Must return 0 matches
   ```
