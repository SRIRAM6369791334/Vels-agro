# Extraction & Modularization Blueprint: Dashboard & Products Modules (Milestone 3)

## 1. Observation

### 1.1 Current Codebase State
- **Dashboard Module** (`frontend/src/features/dashboard/dashboard.ts`):
  - Total Lines: 1,390 lines in a single monolithic file.
  - Subtabs implemented internally: `overview`, `activity`, `alerts`.
  - Export: `export const page: FeaturePage = { title, mount, enter, leave };` (lines 1299–1389).
  - Routes configured in `src/core/router.ts:13-21`:
    - `dashboard`: `overview` ("Overview"), `activity` ("Activity"), `alerts` ("Alerts").
  - Dynamically loaded in `src/main.ts:4451`: `dashboard: () => import('./features/dashboard/dashboard.ts')`.
- **Products Module** (`frontend/src/features/products/products.ts`):
  - Total Lines: 2,000 lines in a single monolithic file.
  - Subtabs/Views implemented internally: `catalog` (grid/list), `item` (product detail with SKU navigation), `batches` (table with drawer deep-link).
  - Export: `export const page: FeaturePage = { title, mount, enter, leave };` (lines 1895–1999).
  - Routes configured in `src/core/router.ts:22-29`:
    - `products`: `catalog` ("Catalog"), `batches` ("Batches"), plus deep-linking `item` route (`#/products/item/<id>`).
  - Dynamically loaded in `src/main.ts:4452`: `products: () => import('./features/products/products.ts')`.

### 1.2 Unmasked Obfuscated Aliases & Legacy Re-exports Inventory
During forensic code inspection of `dashboard.ts`, `products.ts`, and `main.ts` (lines 5440–5613), 21 inverted and obfuscated function names were identified:

| Obfuscated Import Name in Features | Actual Implementation in `main.ts` | True Semantic Domain Name | Canonical Source / Home |
| :--- | :--- | :--- | :--- |
| `getAvailableLocations` | `ho` (lines 194–220) | `animateCounter` | `core/motion.ts` |
| `getAvailableSuppliers` | `fo` (lines 155–173) | `flashElement` / `animatePulse` | `core/motion.ts` |
| `openNewTransferModal` | `go` (lines 221–225) | `playHaptic` | `core/motion.ts` |
| `bindModalDismiss` | `fl` (lines 2948–2980) | `morphReplace` | `core/motion.ts` |
| `openMoveStockModal` | `_o` (lines 226–242) | `bindMagnetic` | `core/motion.ts` |
| `openNewBatchModal` | `yu` (lines 3843–3914) | `openMoveStockModal` (Stock transfer modal) | `main.ts` (shell modal) |
| `findLocationById(slice, cb)` | `ms` (line 2108) | `subscribeToStore(slice, callback)` | `core/store.ts` |
| `exportDataBackup(locId)` | `bs` (line 2140) | `findLocationById(locId)` (lookup warehouse location) | `core/store.ts` |
| `createCustomElement(anchor, items)` | `Jc` (lines 2636–2652) | `openDropdownMenu` / `openMenuPopover` | `ui/popover.ts` |
| `createFanMeter` | `shared/widgets/charts.ts:29` | `renderFanMeter` | `shared/widgets/charts.ts` |
| `createBarChart` | `shared/widgets/charts.ts:28` | `renderGroupedBarChart` | `shared/widgets/charts.ts` |
| `createSparkline` | `shared/widgets/charts.ts:27` | `renderSparklineSvg` | `shared/widgets/charts.ts` |
| `createLineChart` | `shared/widgets/charts.ts:23` | `renderLineChart` | `shared/widgets/charts.ts` |
| `getMaterialInventoryValue()` | `Zs` (line 2191: month-to-date order revenue) | `getCurrentMonthRevenue()` | `features/dashboard/services/dashboard-metrics.ts` |
| `getLastMonthValue()` | `Us` (line 2179: total stock + material cost) | `getTotalInventoryValue()` | `core/store.ts` |
| `formatCurrencyCompact(start, end)` | `Xs` (line 2189: order revenue in range) | `getOrdersRevenueByDateRange(start, end)` | `features/dashboard/services/dashboard-metrics.ts` |
| `findCustomerByEmail(materialId)` | `zs` (line 2167: pending PO quantity on order) | `getMaterialOnOrderQty(materialId)` | `core/store.ts` |
| `getPendingOrdersCount(limit, days)` | `ac` (lines 2227–2235: top products by revenue) | `getTopSellingProducts(limit, days)` | `features/dashboard/services/dashboard-metrics.ts` |
| `getAlertItems()` | `Is` (line 2164: array of out-of-stock products) | `getOutOfStockProducts()` | `core/store.ts` |
| `renderProgressBar(product)` | `rc` (lines 2210–2213: days of cover calculation) | `calculateProductDaysOfCover(product)` | `features/analytics/services/stock-calculator.ts` |
| `formatShortDate` | `Uo` (line 331: array of 5 category names) | `CATEGORY_NAMES` | `core/constants.ts` |
| `formatFileSize` | `Po` (line 310: batch status labels map) | `BATCH_STATUS_NAMES` | `core/constants.ts` |
| `bindQuickActions(e)` | `dl` (lines 2939–2947: card expand on [data-expand]) | `bindCardExpand(container)` | `features/dashboard/components/card-expand.ts` |
| `animateMagneticElement(el, text)` | `po` (lines 174–192: floating +/- indicator) | `animateFloatIndicator(el, text)` | `core/motion.ts` |
| `renderFilterBar(el, val)` | `Bc` (lines 2447–2450: update count on stat header) | `updateStatCount(el, val)` | `features/products/subtabs/catalog.ts` |

### 1.3 State Reads & Writes (`core/store.ts`)
- **Dashboard State Touchpoints**:
  - `store.settings.me`: Reads user name for welcome banner (`store.settings.me.name.split(' ')[0]`).
  - `store.settings.goal`: Reads and writes monthly revenue goal via `setSalesGoal(goal)`.
  - `store.settings.prefs.expiryWarnDays`: Reads batch expiry warning window threshold (90 days).
  - `store.products`: Reads product catalog for SKU counts and low stock evaluations.
  - `store.locations`: Reads warehouse locations for capacity bar gauges and stock metrics.
  - `store.orders`: Reads sales orders for kanban shipping list, revenue totals, top sellers, and delivery status updates via `advanceOrderStatus(orderId)`.
  - `store.materials`: Reads raw materials for reorder warnings.
  - `store.batches`: Reads QA quarantine batches and expiry countdowns; writes status via `releaseBatch(id)` and `updateBatchStatus(id, note)`.
  - `store.moves`: Reads stock movement ledger for last 7-day flow meters and recent 9 moves.
  - `store.activity`: Reads activity log stream (top 4 on overview, full searchable timeline on activity subtab).
  - `store.months` / `store.weeks`: Reads inventory history metrics for grouped bar chart and sparklines.
  - Slice Subscriptions: `orders`, `products`, `materials`, `batches`, `pos`, `activity`, `moves`, `history`, `settings`.

- **Products State Touchpoints**:
  - `store.products`: Reads catalog for grid/list rendering, filtering by category, search queries, low stock filtering; writes stock via `adjustStock(productId, locId, delta, reason)`.
  - `store.locations`: Reads location stock distributions (`stock.dc`, `stock.lab`, `stock.shop`) and zone bin data.
  - `store.batches`: Reads production lots per product; writes lot QA signoff via `releaseBatch(id)` and hold status via `updateBatchStatus(id, note)`.
  - `store.orders`: Reads active reserved orders holding product units.
  - `store.moves`: Reads product-specific stock ledger history.
  - `store.materials`: Reads BOM raw materials to determine batch production bottlenecks.
  - Slice Subscriptions: `products`, `orders`, `batches`, `moves`, `materials`.

### 1.4 Test Suite Invariants
- `tests/vessa.spec.js`:
  - `1. Shell & Dashboard loads with KPI metrics`: Exact text landmarks required:
    - `"Units on hand"`
    - `"Total stock value"`
    - `"Low stock items"`
    - `"Inventory statistics"`
    - `"Sales overview"`
    - `"Recent activities"`
    - `"Top sellers"`
  - `2. Navigation across all main sections & subtabs`:
    - `#/products/catalog`: Document title matching `/Catalog · Vels/`, text `"Showing 12 of 12 products"`.
    - `#/products/batches`: Document title matching `/Batches · Vels/`.
- `tests/state-nav-stress.spec.js`:
  - `SN-01` & `SN-02`: Deep link synchronization:
    - `#/dashboard/overview` -> title `Dashboard · Vels`, landmark `"Units on hand"`.
    - `#/dashboard/activity` -> title `Activity · Vels`.
    - `#/dashboard/alerts` -> title `Alerts · Vels`.
    - `#/products/catalog` -> title `Catalog · Vels`, landmark `"Showing 12 of 12 products"`.
    - `#/products/batches` -> title `Batches · Vels`.
  - `SN-03`: Redirect `#/products` -> `#/products/catalog`.
- `tests/adversarial_final_stress.spec.js`:
  - `1.1 AccountMenu: "Export stock (CSV)"`: Validates CSV download pattern `Vels-stock-YYYY-MM-DD.csv` (matching `exportStockCsv()` called in catalog).
  - `2.3 Command Palette Keyboard Oracle`: ArrowDown + Enter on search results for "Balm" navigates directly to `/#/products/item/<id>`.

---

## 2. Logic Chain

1. **Monolithic Maintenance Bottleneck**: Currently `dashboard.ts` (1,390 lines) and `products.ts` (2,000 lines) are giant monolithic files that mix HTML template strings, business metric calculations, event handling, animations, and store mutations in a single scope.
2. **Obfuscated Re-export Entanglement**: Both files heavily consume aliases imported from `../../main.ts` rather than the canonical modules established in Milestone 1 and Milestone 2 (`core/motion.ts`, `core/store.ts`, `core/constants.ts`, `utils/formatters.ts`, `shared/widgets/charts.ts`).
3. **Established Architectural Precedent**: Milestone 2 established a clean, validated modular pattern in `features/analytics/`, `features/customers/`, `features/settings/`, and `features/help/`:
   - An orchestrator feature file (`<feature>.ts`) exposing `export const page: FeaturePage = { title, mount, enter, leave };` with slice subscriptions and subtab activation.
   - Dedicated `subtabs/` files handling DOM generation, event binding, and GSAP entry animations.
   - Dedicated `services/` files handling domain calculations, metrics, and filtering.
   - Dedicated `components/` files handling distinct visual widgets (drawers, cards, modals).
4. **Zero-Regression Strategy for Dashboard**:
   - Extract `features/dashboard/services/dashboard-metrics.ts` for time-series stock history, revenue comparisons, top seller ranking, shipping queue today, and alert categorization.
   - Extract `features/dashboard/components/card-expand.ts` for the card expand/focus GSAP Flip interaction.
   - Extract `features/dashboard/subtabs/overview.ts` containing KPI cards, inventory statistics grouped bar chart, sales fan meter, top sellers, ships today queue, and location breakdown.
   - Extract `features/dashboard/subtabs/activity.ts` containing the activity timeline with chip filters, search input, last 7 days flow meters, and stock ledger.
   - Extract `features/dashboard/subtabs/alerts.ts` containing the segmented category alerts (stock, expiry, orders) and actionable resolution buttons.
   - Re-wire `features/dashboard/dashboard.ts` as a concise orchestrator (~120 lines) coordinating the subtabs.
5. **Zero-Regression Strategy for Products**:
   - Extract `features/products/services/product-service.ts` for category filtering, sorting, Days of Cover calculations, SKU stat metrics, and CSV export.
   - Extract `features/products/services/batch-service.ts` for batch status calculation, expiry tone classification, and QA checklist rules.
   - Extract `features/products/components/batch-drawer.ts` for the batch detail drawer slideout with interactive QA checklist sign-off and ink stamp bounce animation.
   - Extract `features/products/subtabs/catalog.ts` containing SKU stat header, category chips, low stock toggle, search input, sort menu, grid/list view Flip transition, product card grid, and quick DC stock adjustments.
   - Extract `features/products/subtabs/item.ts` containing the product detail view with sales line chart, batch history, open orders, stock movement ledger, and bill of materials bottleneck analysis.
   - Extract `features/products/subtabs/batches.ts` containing the production lots table, status segmented control, lot search, and drawer trigger.
   - Re-wire `features/products/products.ts` as a concise orchestrator (~130 lines) coordinating the subtabs and drawer lifecycle.
6. **Integrity & Parity**:
   - Every DOM `data-*` attribute (`[data-sub]`, `[data-k]`, `[data-key]`, `[data-do]`, `[data-adj]`, `[data-dir]`, `[data-open]`, `[data-qa]`, `[data-f]`) must remain byte-identical so CSS styles and tests continue to match without regression.
   - All string literals checked by Playwright tests (`"Showing 12 of 12 products"`, `"Units on hand"`, `"Total stock value"`, `"Low stock items"`, etc.) are strictly preserved.

---

## 3. Caveats

- **Unmigrated Milestone 3 Modules**: `orders.ts`, `purchasing.ts`, and `warehouses.ts` remain monolithic until their extraction steps. Any re-exports on `main.ts` that they depend on must remain in place for backward compatibility.
- **Shell-Housed Modals**: Complex modals that mutate multiple slices across orders and purchasing (`openNewOrderModal`, `openMakeBatchModal`, `openNewPoModal`, `openStockAdjustModal`, `openQuickCreateModal`) currently reside in `main.ts`. In this milestone, they will be cleanly imported from `../../main.ts` into the feature components, preserving exact runtime modal interactions until all feature modules are modularized.
- **Motion Durations & Headless Testing**: In `core/motion.ts`, `prefersReducedMotion` and `motionDuration` are respected. When running in headless Playwright, tweens complete instantaneously or cleanly without timing race conditions.

---

## 4. Conclusion & Step-by-Step Blueprint

### 4.1 Proposed Target File Layout
```
frontend/src/features/dashboard/
├── dashboard.ts                    # Root orchestrator & FeaturePage lifecycle export
├── dashboard.css                   # Existing styles (preserved)
├── services/
│   └── dashboard-metrics.ts        # Pure calculation engine (history, revenue, flow, alerts)
├── components/
│   └── card-expand.ts              # Flip zoom/expand handler for dashboard cards
└── subtabs/
    ├── overview.ts                 # Welcome, KPI cards, Inv stats, Sales fan, Ships today, Locations
    ├── activity.ts                 # Timeline, chip filters, 7-day flow meters, stock ledger
    └── alerts.ts                   # Grouped alerts, reorder drafting, batch release/hold

frontend/src/features/products/
├── products.ts                     # Root orchestrator & FeaturePage lifecycle export
├── products.css                    # Existing styles (preserved)
├── services/
│   ├── product-service.ts          # Catalog filtering, sorting, stats, BOM limits, CSV export
│   └── batch-service.ts            # Batch status, expiry tones, QA checklists
├── components/
│   └── batch-drawer.ts             # Slideout drawer, QA checklist interaction, stamp animation
└── subtabs/
    ├── catalog.ts                  # Stats header, category chips, grid/list Flip view, DC quick adjustments
    ├── item.ts                     # Product detail, sales line chart, BOM bottleneck, lot & order lists
    └── batches.ts                  # Lots table, status segmented control, QA release & hold actions
```

---

### 4.2 Dashboard Module Detailed Blueprint

#### 1. `features/dashboard/services/dashboard-metrics.ts`
- **Purpose**: Pure computational domain services for dashboard aggregation and calculations.
- **Imports**:
  - `store`, `findProductById`, `getTotalStockUnits`, `getLowStockProducts`, `getLowStockMaterials`, `getOutOfStockProducts`, `getActiveOrders`, `getExpiringBatches`, `findMemberById`, `findLocationById` from `../../../core/store`.
  - `ONE_DAY_MS`, `KANBAN_STAGES` from `../../../core/constants`.
  - `startOfToday`, `startOfMonth`, `pluralize` from `../../../utils/formatters`.
- **Functions to Export**:
  - `getStockHistory(days: number): number[]`: Computes 14-day stock unit balance from `store.moves`.
  - `getMonthStartStock(): number`: Computes stock unit balance at start of current month.
  - `getTotalInventoryValue(): number`: Computes total stock cost + material cost.
  - `getLastMonthInventoryValue(): number`: Reads previous month value from `store.months` or fallback.
  - `getInventoryStatsGroups(range: 'weekly' | 'monthly' | 'quarterly')`: Aggregates stock in, out, and value.
  - `getCurrentMonthSalesStats(mode: 'month' | 'last')`: Returns `{ rev, n, label }`.
  - `getShippingOrdersToday()`: Returns orders due today or shipped today sorted by Kanban stage.
  - `getDashboardAlertsSummary()`: Computes `{ key, tone, ico, title, text, href, n }[]` for overview cards.
  - `getTopSellingProducts(limit = 3, days = 30)`: Returns top products by revenue.
  - `getSevenDayStockFlow()`: Aggregates movement units across production, sales, transfers, returns, adjustments.
  - `getMaterialOnOrder(materialId: string)`: Computes pending units on sent/partial purchase orders.
  - `draftReordersForLowStock()`: Triggers low stock reorder drafting.

#### 2. `features/dashboard/components/card-expand.ts`
- **Purpose**: Encapsulates card expand/focus and collapse using GSAP Flip and scrim.
- **Imports**: `gsap`, `Flip`, `motionDuration`, `playHaptic` from `../../../core/motion`, `domQuery`, `queryOne` from `../../../utils/dom`.
- **Functions to Export**:
  - `bindCardExpand(container: HTMLElement): void`: Listens for clicks on `[data-expand]` to expand the `.card`.
  - `collapseExpandedCard(): void`: Collapses active card and fades out `.scrim`.

#### 3. `features/dashboard/subtabs/overview.ts`
- **Purpose**: Overview subtab rendering, event binding, and updates.
- **Imports**:
  - `store`, `subscribeToStore`, `findProductById`, `findCustomerById`, `findLocationById`, `getLocationStockUnits` from `../../../core/store`.
  - `gsap`, `motionDuration`, `animateCounter`, `animatePulse`, `animateTitle`, `animateCards`, `animateRows`, `animatePop`, `playHaptic`, `bindMagnetic`, `initLiftAnimations`, `morphReplace` from `../../../core/motion`.
  - `renderFanMeter`, `renderGroupedBarChart`, `renderSparklineSvg` from `../../../shared/widgets/charts`.
  - `domQuery`, `queryOne`, `domQueryAll`, `escapeHtml` from `../../../utils/dom`.
  - `formatInt`, `formatMoney`, `formatMoneyRound`, `formatMoneyK`, `formatTime`, `formatRelativeTime`, `formatRelativeDay`, `pluralize` from `../../../utils/formatters`.
  - `renderIcon`, `renderIconButton` from `../../../utils/icons`.
  - `openDropdownMenu` from `../../../ui/popover`.
  - Metrics & helpers from `../services/dashboard-metrics`.
  - `bindCardExpand` from `../components/card-expand`.
  - Modals & notifications from `../../../main.ts`: `openNewOrderModal`, `openMakeBatchModal`, `openMoveStockModal`, `openQuickCreateModal`, `setSalesGoal`, `showToast`, `advanceOrderStatus`, `renderTag`, `renderAvatar`, `renderProductThumb`, `renderOrderStatusBadge`, `renderTrendBadge`, `renderEmptyState`.
- **Functions to Export**:
  - `renderDashboardOverviewTemplate(): string`: Generates complete HTML template for overview.
  - `initDashboardOverview(container: HTMLElement): void`: Binds buttons, menus, range selectors, and quick actions.
  - `animateDashboardOverview(container: HTMLElement): void`: Executes GSAP entry timeline.
  - `updateKpiCards(container: HTMLElement, isMount: boolean): void`: Updates Units, Stock Value, Low Stock cards.
  - `updateSalesOverview(container: HTMLElement, isMount: boolean): void`: Updates Fan meter and sales figures.
  - `updateShipsToday(container: HTMLElement, isMount: boolean): void`: Updates Ships today queue and meter.
  - `updateLocations(container: HTMLElement, isMount: boolean): void`: Updates stock-by-location meters.
  - `updateRecentActivities(container: HTMLElement, isMount: boolean): void`: Updates recent activities list.
  - `updateAlertsList(container: HTMLElement): void`: Updates top 4 alerts.
  - `updateTopSellers(container: HTMLElement): void`: Updates top seller list.

#### 4. `features/dashboard/subtabs/activity.ts`
- **Purpose**: Activity log subtab rendering, search/filters, movement flow meters, stock ledger.
- **Imports**:
  - `store`, `findMemberById`, `findProductById`, `findLocationById` from `../../../core/store`.
  - `gsap`, `motionDuration`, `animateTitle`, `animateCards`, `animateRows`, `playHaptic`, `morphReplace` from `../../../core/motion`.
  - `domQuery`, `queryOne`, `domQueryAll`, `escapeHtml` from `../../../utils/dom`.
  - `formatInt`, `formatTime`, `formatRelativeTime`, `formatRelativeDay` from `../../../utils/formatters`.
  - `renderIcon` from `../../../utils/icons`.
  - `renderTag`, `renderAvatar`, `renderProductThumb`, `renderEmptyState` from `../../../main.ts`.
  - `STOCK_MOVE_REASON_NAMES` from `../../../core/constants`.
  - Flow calculations from `../services/dashboard-metrics`.
- **Functions to Export**:
  - `renderActivitySubtab(): string`: Renders activity HTML structure.
  - `initActivitySubtab(container: HTMLElement): void`: Binds filter chips, search input, show more.
  - `animateActivitySubtab(container: HTMLElement): void`: Executes activity GSAP entrance.
  - `updateActivityList(container: HTMLElement, isAnimate: boolean): void`: Renders timeline entries grouped by day.
  - `updateStockLedger(container: HTMLElement): void`: Renders latest 9 movements and 7-day flow meters.

#### 5. `features/dashboard/subtabs/alerts.ts`
- **Purpose**: Alerts subtab rendering, categorized alert cards, resolution action handlers.
- **Imports**:
  - `store`, `findProductById`, `findCustomerById`, `findMemberById`, `getLowStockMaterials`, `getOutOfStockProducts`, `getLowStockProducts`, `getExpiringBatches`, `getActiveOrders`, `getActiveOrdersForLocation`, `getAvailableStock`, `releaseBatch`, `updateBatchStatus` from `../../../core/store`.
  - `gsap`, `animateTitle`, `animateCards`, `animateRows`, `playHaptic`, `morphReplace` from `../../../core/motion`.
  - `domQuery`, `queryOne`, `domQueryAll`, `escapeHtml` from `../../../utils/dom`.
  - `formatInt`, `formatDate`, `formatRelativeTime`, `formatRelativeDay`, `pluralize`, `daysUntilExpiry` from `../../../utils/formatters`.
  - `renderIcon`, `renderTag`, `renderPill`, `renderAvatar`, `renderProductThumb`, `renderOrderStatusBadge`, `renderEmptyState`, `renderSegmentedControl`, `initSegmentedControl`, `openMakeBatchModal`, `openMoveStockModal`, `openNewPoModal`, `openQuickCreateModal`, `showToast` from `../../../main.ts`.
  - `ORDER_STATUS_META` from `../../../core/constants`.
  - `getMaterialOnOrder`, `draftReordersForLowStock` from `../services/dashboard-metrics`.
- **Functions to Export**:
  - `renderAlertsSubtab(): string`: Renders alerts HTML with segmented control.
  - `initAlertsSubtab(container: HTMLElement): void`: Binds segmented control and resolution buttons.
  - `animateAlertsSubtab(container: HTMLElement): void`: Executes alerts GSAP entrance.
  - `updateAlertsGroups(container: HTMLElement, isMount: boolean): void`: Generates categorized alert cards.

#### 6. `features/dashboard/dashboard.ts` (Orchestrator)
- **Purpose**: Coordinates subtabs, handles routing lifecycles, sets up store subscriptions, and tickers.
- **Exports**: `export const page: FeaturePage = { title, mount, enter, leave };`
- **Implementation Structure**:
  ```typescript
  import { subscribeToStore } from '../../core/store';
  import { domQuery, domQueryAll } from '../../utils/dom';
  import { gsap } from '../../core/motion';
  import { formatTime } from '../../utils/formatters';
  import {
    renderDashboardOverviewTemplate,
    initDashboardOverview,
    animateDashboardOverview,
    updateKpiCards,
    updateSalesOverview,
    updateShipsToday,
    updateLocations,
    updateRecentActivities,
    updateAlertsList,
    updateTopSellers,
  } from './subtabs/overview';
  import {
    renderActivitySubtab,
    initActivitySubtab,
    animateActivitySubtab,
    updateActivityList,
    updateStockLedger,
  } from './subtabs/activity';
  import {
    renderAlertsSubtab,
    initAlertsSubtab,
    animateAlertsSubtab,
    updateAlertsGroups,
  } from './subtabs/alerts';

  let rootContainer: HTMLElement | null = null;
  let currentSubtab = 'overview';
  const initializedSubtabs = new Set<string>();

  export const page = {
    title: (params: string[]) =>
      ({
        activity: 'Activity',
        alerts: 'Alerts',
      })[params[0] ?? ''] ?? 'Dashboard',

    mount(container: HTMLElement) {
      rootContainer = container;
      rootContainer.innerHTML = `
        <div data-sub="overview" hidden></div>
        <div data-sub="activity" hidden></div>
        <div data-sub="alerts" hidden></div>
      `;

      subscribeToStore('orders', () => { ... });
      subscribeToStore('products', () => { ... });
      subscribeToStore('materials', () => { ... });
      subscribeToStore('batches', () => { ... });
      subscribeToStore('pos', () => { ... });
      subscribeToStore('activity', () => { ... });
      subscribeToStore('moves', () => { ... });
      subscribeToStore('history', () => { ... });
      subscribeToStore('settings', () => { ... });

      let lastClockUpdate = 0;
      gsap.ticker.add(() => {
        const now = Date.now();
        if (now - lastClockUpdate > 10000 && isSubtabActive('overview')) {
          lastClockUpdate = now;
          updateClock();
        }
      });
    },

    enter({ params, same }) {
      const targetSub = ['overview', 'activity', 'alerts'].includes(params[0] ?? '') ? params[0] : 'overview';
      activateSubtab(targetSub, same);
    },

    leave() {},
  };
  ```

---

### 4.3 Products Module Detailed Blueprint

#### 1. `features/products/services/product-service.ts`
- **Purpose**: Product filtering, sorting, Cover calculations, SKU statistics, BOM bottleneck calculations, and CSV export.
- **Imports**:
  - `store`, `findProductById`, `findMaterialById`, `getProductStock`, `getAvailableStock`, `getActiveAllocatedStock`, `isProductLowStock`, `isProductOutOfStock`, `getTotalStockUnits` from `../../../core/store`.
  - `CATEGORY_NAMES`, `ONE_DAY_MS` from `../../../core/constants`.
  - `formatCsvRow`, `downloadFile`, `formatInt`, `formatNumber`, `formatDate`, `startOfToday` from `../../../utils/formatters`.
  - `showToast` from `../../../main.ts`.
- **Functions to Export**:
  - `filterProducts(products: Product[], category: string, lowOnly: boolean, query: string): Product[]`
  - `sortProducts(products: Product[], sortBy: 'name' | 'stock' | 'cover' | 'price'): Product[]`
  - `calculateProductDaysOfCover(product: Product): number`
  - `calculateCoverProportion(days: number): number`
  - `getCoverTone(product: Product, days: number): 'rose' | 'ochre' | 'sage' | 'slate'`
  - `getCatalogHeaderStats(): CatalogStat[]`
  - `getProductSalesSeries(productId: string, days: number): { labels: string[]; series: ChartSeries[] }`
  - `calculateProductSalesAggregate(productId: string, days: number): { units: number; rev: number }`
  - `calculateBomBottleneck(product: Product): number`
  - `exportStockCsv(): void`

#### 2. `features/products/services/batch-service.ts`
- **Purpose**: Batch status resolution, expiry tone classification, and QA checklist specifications.
- **Imports**:
  - `store`, `findProductById`, `findBatchById`, `getExpiringBatches` from `../../../core/store`.
  - `BATCH_STATUS_NAMES`, `BATCH_STATUS_TONES`, `ONE_DAY_MS` from `../../../core/constants`.
  - `daysUntilExpiry`, `pluralize` from `../../../utils/formatters`.
- **Functions to Export**:
  - `getBatchEffectiveStatus(batch: Batch): 'quarantine' | 'released' | 'hold' | 'expired'`
  - `getBatchExpiryTone(batch: Batch): 'rose' | 'ochre' | 'sage'`
  - `getBatchesHeaderStats(): BatchesStat[]`
  - `getBatchQaChecklist(product: Product): [key: string, label: string, detail: string][]`
  - `getBatchChecklistState(batchId: string): Set<string>`

#### 3. `features/products/components/batch-drawer.ts`
- **Purpose**: Slideout drawer for batch QA inspection, interactive checklist sign-off, and ink stamp animation.
- **Imports**:
  - `store`, `findBatchById`, `findProductById`, `findMemberById`, `findLocationById`, `releaseBatch`, `updateBatchStatus` from `../../../core/store`.
  - `gsap`, `motionDuration`, `animateRows`, `animatePop`, `playHaptic` from `../../../core/motion`.
  - `openDrawer`, `closeDrawer` from `../../../ui/drawer`.
  - `domQueryAll`, `queryOne`, `escapeHtml` from `../../../utils/dom`.
  - `formatInt`, `formatNumber`, `formatPercent`, `formatDate`, `formatRelativeTime`, `pluralize`, `daysUntilExpiry` from `../../../utils/formatters`.
  - `renderIcon`, `renderTag`, `renderPill`, `renderAvatar`, `renderProductThumb`, `showToast`, `openQuickCreateModal` from `../../../main.ts`.
  - `BATCH_STATUS_NAMES`, `BATCH_STATUS_TONES`, `STOCK_MOVE_REASON_NAMES` from `../../../core/constants`.
  - Batch domain rules from `../services/batch-service`.
- **Functions to Export**:
  - `openBatchDetailDrawer(batchId: string): void`
  - `closeBatchDetailDrawer(): void`
  - `isBatchDrawerOpen(): boolean`
  - `updateBatchDrawerContent(): void`
  - `animateBatchStamp(drawerInner: HTMLElement): void`

#### 4. `features/products/subtabs/catalog.ts`
- **Purpose**: Product catalog subtab rendering, category filter chips, search query highlighting, grid/list Flip transitions, and quick stock adjustment controls.
- **Imports**:
  - `store`, `findProductById`, `getProductStock`, `getAvailableStock`, `getActiveAllocatedStock`, `isProductLowStock`, `isProductOutOfStock`, `adjustStock` from `../../../core/store`.
  - `gsap`, `Flip`, `motionDuration`, `animateCards`, `animateRows`, `animatePop`, `playHaptic`, `bindMagnetic` from `../../../core/motion`.
  - `domQuery`, `queryOne`, `domQueryAll`, `escapeHtml` from `../../../utils/dom`.
  - `formatInt`, `pluralize` from `../../../utils/formatters`.
  - `renderIcon`, `renderIconButton` from `../../../utils/icons`.
  - `openDropdownMenu` from `../../../ui/popover`.
  - `renderPageHeader`, `renderProductThumb`, `renderTag`, `renderPill`, `renderEmptyState`, `highlightSearchMatch`, `renderSegmentedControl`, `initSegmentedControl`, `showToast`, `openMoveStockModal`, `openMakeBatchModal` from `../../../main.ts`.
  - `CATEGORY_NAMES`, `CATEGORY_TONES` from `../../../core/constants`.
  - Services from `../services/product-service`.
- **Functions to Export**:
  - `renderCatalogSubtab(): string`
  - `initCatalogSubtab(container: HTMLElement): void`
  - `animateCatalogSubtab(container: HTMLElement): void`
  - `updateCatalogGrid(container: HTMLElement, isAnimate: boolean): void`
  - `refreshCatalogCards(container: HTMLElement): void`

#### 5. `features/products/subtabs/item.ts`
- **Purpose**: Product detail view (`#/products/item/<id>`), interactive sales line chart, bill of materials bottleneck analysis, lot & order lists, and keyboard navigation.
- **Imports**:
  - `store`, `findProductById`, `findMaterialById`, `findCustomerById`, `findBatchById`, `findMemberById`, `findLocationById`, `getProductStock`, `getAvailableStock`, `getActiveAllocatedStock`, `releaseBatch` from `../../../core/store`.
  - `gsap`, `motionDuration`, `animateCards`, `animateRows`, `animatePop`, `playHaptic`, `bindMagnetic` from `../../../core/motion`.
  - `renderLineChart` from `../../../shared/widgets/charts`.
  - `domQuery`, `queryOne`, `domQueryAll`, `escapeHtml` from `../../../utils/dom`.
  - `formatInt`, `formatNumber`, `formatPercent`, `formatMoney`, `formatMoneyRound`, `formatDate`, `formatRelativeTime`, `formatRelativeDay`, `pluralize`, `daysUntilExpiry` from `../../../utils/formatters`.
  - `renderIcon`, `renderIconButton` from `../../../utils/icons`.
  - `renderPageHeader`, `renderProductThumb`, `renderTag`, `renderPill`, `renderAvatar`, `renderOrderStatusBadge`, `renderEmptyState`, `renderSegmentedControl`, `initSegmentedControl`, `openStockAdjustModal`, `openNewOrderModal`, `openMoveStockModal`, `openMakeBatchModal`, `openQuickCreateModal`, `updateBatchStatus` from `../../../main.ts`.
  - `CATEGORY_TONES`, `BATCH_STATUS_NAMES`, `BATCH_STATUS_TONES`, `STOCK_MOVE_REASON_NAMES` from `../../../core/constants`.
  - Services from `../services/product-service` and `../services/batch-service`.
- **Functions to Export**:
  - `renderProductItemView(productId: string): string`
  - `initProductItemView(container: HTMLElement, productId: string): void`
  - `animateProductItemView(container: HTMLElement, isNavigating: boolean): void`
  - `updateProductItemSections(container: HTMLElement, sections?: string[]): void`

#### 6. `features/products/subtabs/batches.ts`
- **Purpose**: Batches list subtab, status segmented control filtering, search, lot table rendering, and drawer integration.
- **Imports**:
  - `store`, `findProductById`, `findMemberById`, `findLocationById`, `releaseBatch` from `../../../core/store`.
  - `gsap`, `motionDuration`, `animateCards`, `animateRows`, `animatePop`, `playHaptic`, `bindMagnetic`, `morphReplace` from `../../../core/motion`.
  - `domQuery`, `queryOne`, `domQueryAll`, `escapeHtml` from `../../../utils/dom`.
  - `formatInt`, `formatDate`, `pluralize`, `daysUntilExpiry` from `../../../utils/formatters`.
  - `renderIcon`, `renderPageHeader`, `renderProductThumb`, `renderTag`, `renderPill`, `renderAvatar`, `renderEmptyState`, `highlightSearchMatch`, `initSegmentedControl`, `openMakeBatchModal`, `openQuickCreateModal`, `updateBatchStatus` from `../../../main.ts`.
  - `BATCH_STATUS_NAMES`, `BATCH_STATUS_TONES`, `ONE_DAY_MS` from `../../../core/constants`.
  - Services from `../services/batch-service`.
- **Functions to Export**:
  - `renderBatchesSubtab(): string`
  - `initBatchesSubtab(container: HTMLElement): void`
  - `animateBatchesSubtab(container: HTMLElement): void`
  - `updateBatchesTable(container: HTMLElement, isAnimate: boolean): void`

#### 7. `features/products/products.ts` (Orchestrator)
- **Purpose**: Subtab switcher, product detail deep linking, keyboard arrow navigation, batch drawer state lifecycle, and store subscriptions.
- **Exports**: `export const page: FeaturePage = { title, mount, enter, leave };`
- **Implementation Structure**:
  ```typescript
  import { subscribeToStore, findProductById, findBatchById } from '../../core/store';
  import { formatProductFullName } from '../../main.ts';
  import { domQuery, queryOne, domQueryAll } from '../../utils/dom';
  import { playHaptic } from '../../core/motion';
  import {
    renderCatalogSubtab,
    initCatalogSubtab,
    animateCatalogSubtab,
    refreshCatalogCards,
    updateCatalogGrid,
  } from './subtabs/catalog';
  import {
    renderProductItemView,
    initProductItemView,
    animateProductItemView,
    updateProductItemSections,
  } from './subtabs/item';
  import {
    renderBatchesSubtab,
    initBatchesSubtab,
    animateBatchesSubtab,
    updateBatchesTable,
  } from './subtabs/batches';
  import {
    openBatchDetailDrawer,
    closeBatchDetailDrawer,
    isBatchDrawerOpen,
    updateBatchDrawerContent,
  } from './components/batch-drawer';

  let rootContainer: HTMLElement | null = null;
  let currentSubtab = 'catalog';
  let activeProductId = '';
  const initializedSubtabs = new Set<string>();

  export const page = {
    title: (params: string[]) => {
      if (params[0] === 'item') {
        const p = findProductById(params[1] ?? '');
        return p ? formatProductFullName(p) : 'Product';
      }
      if (params[0] === 'batches') {
        const b = findBatchById(params[1] ?? '');
        return b ? `Lot ${b.lot}` : 'Batches';
      }
      return 'Catalog';
    },

    mount(container: HTMLElement) {
      rootContainer = container;
      rootContainer.innerHTML = `
        <div data-sub="catalog" hidden></div>
        <div data-sub="item" hidden></div>
        <div data-sub="batches" hidden></div>
      `;

      subscribeToStore('products', () => { ... });
      subscribeToStore('orders', () => { ... });
      subscribeToStore('batches', () => { ... });
      subscribeToStore('moves', () => { ... });
      subscribeToStore('materials', () => { ... });

      document.addEventListener('keydown', handleKeyNavigation);
    },

    enter({ params, same }) {
      const mode = params[0] === 'item' ? 'item' : params[0] === 'batches' ? 'batches' : 'catalog';
      ...
    },

    leave() {
      if (isBatchDrawerOpen()) {
        closeBatchDetailDrawer();
      }
    },
  };
  ```

---

### 4.4 Backward Compatibility Re-exports on `main.ts`
To ensure unmigrated modules (`orders.ts`, `purchasing.ts`, `warehouses.ts`) and global test fixtures remain 100% operational during and after Milestone 3 implementation, `main.ts` will continue to export:
```typescript
// Backward compatibility re-exports for unmigrated modules
export {
  openNewOrderModal,
  openMakeBatchModal,
  openNewPoModal,
  openStockAdjustModal,
  openQuickCreateModal,
  exportStockCsv,
  showToast,
  advanceOrderStatus,
  releaseBatch,
  updateBatchStatus,
  adjustStock,
  setSalesGoal,
  animatePageTransition,
  renderPageHeader,
  renderAvatar,
  renderTag,
  renderPill,
  renderOrderStatusBadge,
  renderProductThumb,
  renderEmptyState,
  renderIconButton,
  renderSegmentedControl,
  initSegmentedControl,
  highlightSearchMatch,
};
```
And in `core/motion.ts`:
Add canonical export for `animateFloatIndicator(element: HTMLElement | null, text: string): void` so neither feature relies on the obfuscated `animateMagneticElement = po` alias.

---

## 5. Verification Method

To independently verify the implementation against this blueprint:
```bash
cd "E:\dashborad clone\frontend"

# 1. Typecheck: Verify 0 diagnostic errors across all new files
npm run typecheck

# 2. Production build: Verify clean Vite build
npm run build

# 3. Targeted Dashboard E2E test verification
npx playwright test tests/vessa.spec.js -g "Shell & Dashboard"

# 4. Targeted Navigation and Deep-linking stress verification
npx playwright test tests/state-nav-stress.spec.js

# 5. Targeted Command Palette & Overlay verification
npx playwright test tests/adversarial_final_stress.spec.js -g "Keyboard Navigation Oracle"

# 6. Full regression test suite: 79/79 passing
npx playwright test
```

### Invalidation Conditions
- Any TypeScript diagnostic error from `npm run typecheck`.
- Any missing CSS selector or broken data attribute (`[data-sub]`, `[data-k]`, `[data-key]`, `[data-do]`, `[data-adj]`, `[data-open]`, `[data-qa]`).
- Any occurrence of legacy obfuscated aliases (`getAvailableLocations`, `getAvailableSuppliers`, `openNewTransferModal`, `openMoveStockModal`, `findCustomerByEmail`, `formatCurrencyCompact`, `formatShortDate`, `formatFileSize`, `exportDataBackup`) inside `frontend/src/features/dashboard/` or `frontend/src/features/products/`.
- Any failure in `npx playwright test`.
