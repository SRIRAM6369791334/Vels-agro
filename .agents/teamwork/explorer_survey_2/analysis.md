# Reverse-Engineering & Architecture Survey Report: Core Business & Transactional Feature Modules

**Author:** `explorer_survey_2`  
**Date:** 2026-11-03  
**Working Directory:** `E:\dashborad clone\frontend`  
**Target Files:**
1. `src/features/dashboard/dashboard.ts` (1,390 lines, 47,924 bytes)
2. `src/features/products/products.ts` (2,000 lines, 64,541 bytes)
3. `src/features/orders/orders.ts` (1,829 lines, 59,415 bytes)
4. `src/features/purchasing/purchasing.ts` (1,474 lines, 55,258 bytes)
5. `src/features/warehouses/warehouses.ts` (1,667 lines, 55,367 bytes)

---

## Executive Summary

The Vels Agro Machinery & Equipment / Skincare Operations Admin Panel is a high-performance, single-page application built with Vanilla TypeScript, Vite, GSAP animation timelines, and custom SVG charting widgets.

A previous refactoring attempt left the codebase in a fractured, semi-deobfuscated state with significant naming anomalies:
1. **Rosetta Stone Inversion**: Minified exports in `src/main.ts` were mechanically renamed to deceptively mismatched identifiers (e.g. `subscribeToStore` was exported as `findLocationById`, `animateCounter` was exported as `getAvailableLocations`, `findLocationById` was exported as `exportDataBackup`, `openPromptDialog` was exported as `openQuickCreateModal`, and `initTooltips` was exported as `openMoveStockModal`).
2. **Local Identifier Obfuscation**: Across the 5 feature modules, internal module-level state, DOM element selectors, helper functions, and event callbacks remain minified into 1-to-2 letter identifiers (e.g. `B`, `V`, `He`, `Je`, `G`, `Ye`, `Xe`, `Ze`, `Qe`, `et`, `Y`, `tt`, `nt`, `rt`, `it`, `X`, `at`, `ot`, `st`, `ct`, `lt`, `ut`, `dt`, `ft`, `pt`, `mt`, `ht`, `Q`, `gt`, `_t`, `vt`, `yt`, `$`, `bt`, `xt`).
3. **Implicit Runtime Domain Contracts**: The domain types in `src/types/` omit critical runtime properties used throughout the feature modules (such as `Product.bom`, `Product.reorderQty`, `Batch.madeAt`, `Batch.chemistId`, `CycleCount.status = 'counting' | 'done'`, `StockMovement.locId` and `kind`).
4. **Architectural Coupling**: All 5 feature modules are tightly coupled to `src/main.ts` for reactive store subscriptions, modal dialog invocations, SVG icons, formatting helpers, and animation primitives.

This report documents the exact symbol mappings, state lifecycles, cross-module dependencies, unified domain type specifications, and an actionable modularization blueprint.

---

## 1. Rosetta Stone: Root Utility Inversion Map

The table below documents the critical inversion where exports from `src/main.ts` were given deceptive names during prior refactoring passes:

| Imported Name from `main.ts` | Actual Semantic Identity & Implementation | Real Purpose & Signature |
|:---|:---|:---|
| `findLocationById` (`bn`) | `subscribeToStore(sliceKey, callback)` | Subscribes to store mutation events; returns unsubscribe function: `(key: string, cb: () => void) => () => void` |
| `exportDataBackup` (`ln`) | `findLocationById(locId)` | Looks up warehouse location object in `store.locations`: `(id: string) => Location \| undefined` |
| `getAvailableLocations` (`Xn`) | `animateCounter(element, targetVal, fmt, opts)` | Animates a numeric text counter using GSAP: `(el: HTMLElement, val: number, fmt: Function, opts?: object) => void` |
| `getAvailableSuppliers` (`Yn`) | `animatePulse(element)` | Triggers visual scale pulse highlight on an element: `(el: HTMLElement) => void` |
| `bindModalDismiss` (`Y`) | `morphReplace(container, updaterCallback)` | Animates DOM content replacement smoothly: `(container: HTMLElement, cb: () => void) => void` |
| `openMoveStockModal` (`ar`) | `initTooltips(container)` | Binds hover tooltips to child elements: `(root: HTMLElement) => void` |
| `openNewTransferModal` (`dr`) | `playHaptic(element)` | Plays subtle interactive button scale click feedback: `(btn: HTMLElement) => void` |
| `openQuickCreateModal` (`et`) | `openPromptDialog(config)` | Opens modal dialog with input fields: `(cfg: PromptDialogConfig) => void` |
| `createCustomElement` (`st`) | `openDropdownMenu(anchor, items, options)` | Spawns floating contextual dropdown menu: `(target: HTMLElement, items: MenuItem[], opts?: object) => void` |
| `openNewBatchModal` (`v`) | `openTransferModal(opts, anchor)` | Opens inter-warehouse transfer modal dialog: `(opts?: object, anchor?: HTMLElement) => void` |
| `getMaterialInventoryValue` (`_n`)| `getCurrentMonthSalesRevenue()` | Returns total sales revenue for current calendar month: `() => number` |
| `formatCurrencyCompact` (`Rn`) | `getSalesRevenueForRange(from, to)` | Sums sales revenue between two Unix timestamps: `(from: number, to: number) => number` |
| `getPendingOrdersCount` (`Wn`) | `getTopSellingProducts(limit)` | Returns top selling products sorted by revenue: `(limit?: number) => TopSeller[]` |
| `getActiveOrdersForLocation` (`Fn`)| `getCommittedUnits(productId, locId?)` | Calculates units promised/allocated to open orders: `(pId: string, loc?: string) => number` |
| `getMaterialStock` (`Zt`) | `getFreeSellableStock(product, locId?)` | Calculates on-hand minus committed units: `(p: Product, loc?: string) => number` |
| `findCustomerByEmail` (`Sn`) | `getMaterialOnOrderUnits(materialId)` | Calculates incoming purchase order units for material: `(mId: string) => number` |
| `formatShortDate` (`jt`) | `PRODUCT_CATEGORIES` | Array of product categories: `['Cleanse', 'Treat', 'Moisturise', 'Protect', 'Body']` |
| `formatFileSize` (`kt`) | `BATCH_STATUS_NAMES` | Record mapping batch status to display name: `Record<BatchStatus, string>` |
| `renderFilterBar` (`gt`) | `setCountBadge(element, value)` | Formats and assigns numeric text to count element: `(el: HTMLElement, val: number) => void` |
| `findBatchByLotNumber` (`Tn`) | `getOrderTotalUnits(order)` | Sums total item quantities in order lines: `(o: SalesOrder) => number` |
| `renderNotificationItem` (`Q`) | `formatDateTimeMedium(timestamp)` | Formats timestamp to readable date/time string: `(ts: number) => string` |
| `getCustomerOrdersCount` (`hn`) | `getSupplierPoCount(supplierId)` | Returns number of purchase orders for supplier: `(sId: string) => number` |

---

## 2. Module-by-Module Reverse Engineering

### 2.1 `src/features/dashboard/dashboard.ts` (1,390 lines)

#### Route & Subtabs
- Primary Route: `/dashboard` (falls back to `/dashboard/overview`)
- Subtabs:
  1. `overview`: Executive KPI cards, sales fan meter, stock history sparklines, monthly inventory statistics bar chart, recent activity list, alerts panel, top-selling products, shipping today tracker, stock by location gauges.
  2. `activity`: Stockroom audit timeline with category filtering, search, 7-day finished goods flow chart, stock ledger table.
  3. `alerts`: Decision inbox grouped by Out of Stock, Running Low, Materials to Reorder, Expiring Batches, Batches in QA, Late to Ship, Waiting to Ship.

#### Obfuscated Symbol Mapping
| Obfuscated | Semantic Replacement | Type / Purpose |
|:---|:---|:---|
| `B` | `dashboardRoot` | `HTMLElement` (root view container) |
| `V` | `currentSubtab` | `'overview' \| 'activity' \| 'alerts'` |
| `He` | `initializedSubtabs` | `Set<string>` (memoizes mounted subtabs) |
| `subtabQuery(e)` | `getSubtabElement(subtab)` | `(sub: string) => HTMLElement \| null` |
| `dataKeyQuery(e)`| `getElementByKey(key)` | `(k: string) => HTMLElement \| null` |
| `isCurrentSubtab(e)`| `isSubtabActive(subtab)` | `(sub: string) => boolean` |
| `getStockHistory(e)`| `calculateStockHistory(days)` | Replays `store.moves` backwards to generate daily on-hand counts |
| `getMonthStartStock()`| `calculateMonthStartStock()` | Net stock at start of current calendar month |
| `getLastMonthInventoryValue()`| `getLastMonthInventoryValue()`| Accesses `store.months[n-2].value` |
| `renderDashboardOverviewTemplate()`| `renderOverviewTemplate()` | HTML string template for overview |
| `renderKpiCard(e)`| `renderKpiCardHtml(kpi)` | Generates KPI card HTML with sparkline |
| `Je` | `kpiValueCache` | `{ units: number; value: number; low: number }` |
| `G(e)` | `renderKpis(isInitial)` | Updates KPI values with smooth counter animations |
| `Ye()` | `updateWelcomeSubtext()` | Formats shipping & QA status line in welcome header |
| `Xe()` | `updateLiveClock()` | Formats live clock display |
| `K` | `inventoryChartInterval` | `'weekly' \| 'monthly' \| 'quarterly'` |
| `q` | `inventoryBarChartInstance` | BarChart component instance |
| `Ze(e)` | `buildInventoryChartData(interval)`| Transforms `store.months` / `store.weeks` into BarChart data |
| `Qe()` | `renderInventoryFooter()` | Net in/out summary below bar chart |
| `J` | `salesGoalPeriod` | `'month' \| 'last'` |
| `$e` | `salesFanMeterInstance` | FanMeter component instance |
| `et()` | `calculateSalesMetrics()` | Revenue, order count, and sales target delta |
| `Y(e)` | `renderSalesOverview(isInitial)` | Updates fan meter and figures |
| `tt` | `ACTIVITY_KIND_STYLES` | `Record<string, [icon: string, tone: string]>` |
| `nt(e)` | `renderActivityRow(item)` | Activity row HTML string |
| `rt(e)` | `renderRecentActivities(isInitial)`| Renders top 4 recent activities |
| `it()` | `gatherDashboardAlerts()` | Computes alert groupings (out, exp, low, pend, qa) |
| `X()` | `renderAlertsOverviewList()` | Renders 4 primary alert summary cards |
| `at()` | `renderTopSellersList()` | Renders top 3 products by revenue |
| `ot()` | `getOrdersShippingToday()` | Filters and sorts orders due today |
| `st` | `NEXT_STATUS_LABELS` | Next stage button text map |
| `ct(e)` | `renderShipsToday(isInitial)` | Progress bar and orders due today list |
| `lt(e)` | `renderStockByLocation(isInitial)` | Site storage capacity bars and counters |
| `ut()` | `mountOverviewSubtab()` | Initializes overview DOM, charts, event listeners |
| `dt()` | `animateOverviewEntrance()` | GSAP entrance timeline for overview |
| `ft` | `activityCategoryFilter` | `'all' \| 'stock' \| 'ship' \| 'batch' \| 'po' \| 'transfer' \| 'team'` |
| `pt` | `activitySearchQuery` | `string` |
| `Z` | `activityPaginationLimit` | `number` (page size = 24) |
| `mt` | `ACTIVITY_FILTER_CONFIG` | Array of filter tuples `[key, label, kinds[]]` |
| `ht()` | `mountActivitySubtab()` | Binds activity log DOM and search |
| `Q(i)` | `renderActivityTimeline(animate)` | Renders grouped timeline list |
| `gt()` | `renderStockLedgerAndFlow()` | Renders 7-day flow meters and recent stock moves |
| `_t()` | `animateActivityEntrance()` | GSAP entrance timeline for activity |
| `vt` | `alertsCategoryFilter` | `'all' \| 'stock' \| 'expiry' \| 'orders'` |
| `yt()` | `mountAlertsSubtab()` | Binds alerts segmented control and action delegation |
| `$(e)` | `renderAlertsList(animate)` | Renders grouped decision cards with action buttons |
| `bt()` | `animateAlertsEntrance()` | GSAP entrance timeline for alerts |
| `xt(sub, anim)`| `switchSubtab(sub, anim)` | Handles subtab routing and transition |

#### Reactive Subscriptions in `dashboard.ts`
- `orders`: Re-renders KPIs, sales overview, ships today, top sellers, alerts.
- `products`: Re-renders KPIs, alerts, stock by location.
- `materials`: Re-renders KPIs, alerts.
- `batches`: Re-renders alerts, welcome subtext.
- `pos`: Re-renders alerts.
- `activity`: Re-renders overview recent activities, activity timeline.
- `moves`: Re-renders stock ledger and 7-day flow.
- `history`: Updates inventory bar chart series.
- `settings`: Re-renders sales goal fan meter.
- `gsap.ticker`: 10-second tick updating live clock.

---

### 2.2 `src/features/products/products.ts` (2,000 lines)

#### Route & Subtabs
- Primary Route: `/products`
- Subtabs:
  1. `catalog` (`/products/catalog`): Finished goods grid and list, category filter chips (`Cleanse`, `Treat`, `Moisturise`, `Protect`, `Body`), low-stock toggle, search input, sort options (`name`, `stock`, `cover`, `price`), inline stock adjusters (+/- 1 at DC), batch creation CTA, move stock modal.
  2. `item` (`/products/item/:id`): Comprehensive product detail view. Hero section (SKU, barcode, photo, retail price, cost, margin), stock breakdown across sites (DC, Lab, Shop), free sellable vs reserved stock, days of cover, 30/90-day interactive sales line chart with 7-day moving average, lots/batches table, open orders list, movement ledger, and Bill of Materials (BOM) with limiting ingredient computation. Supports ArrowLeft/ArrowRight keyboard navigation.
  3. `batches` (`/products/batches`): Batch lot tracking table, status filter (`all`, `quarantine`, `released`, `hold`, `expired`), batch drawer (`/products/batches/:id`) with QA release, hold reason dialog, and stock transfer actions.

#### Obfuscated Symbol Mapping
| Obfuscated | Semantic Replacement | Type / Purpose |
|:---|:---|:---|
| `k` | `productsRoot` | `HTMLElement` (view container) |
| `A` | `currentSubtab` | `'catalog' \| 'item' \| 'batches'` |
| `j` | `initializedSubtabs` | `Set<string>` |
| `M(e)` | `getSubtabElement(subtab)` | Query `:scope > [data-sub="${e}"]` |
| `N(e)` | `getElementByKey(key)` | Query `[data-k="${e}"]` |
| `P(e)` | `isSubtabActive(subtab)` | Checks visibility and active subtab |
| `rt` | `LOCATION_TONE_MAP` | `{ dc: 'pine', lab: 'ocean', shop: 'ochre' }` |
| `it` | `LOCATION_ICON_MAP` | `{ dc: 'warehouse', lab: 'flask', shop: 'store' }` |
| `at` | `STOCK_MOVE_META` | Record of reason to icon and tone tuple |
| `ot(loc)` | `formatLocationShortCode(loc)` | `'DC' \| 'Lab' \| 'Shop'` |
| `st(v)` | `clamp01(value)` | `Math.max(0, Math.min(1, v))` |
| `ct(ref)` | `isBatchLotReference(ref)` | Validates lot pattern `/^[A-Z]{1,4}-?\d/` |
| `lt(p, c)` | `getDaysOfCoverTone(product, cover)` | Color tone (`rose`, `ochre`, `sage`, `slate`) |
| `ut(cover)` | `getCoverMeterFillRatio(cover)` | Ratio of cover to 90 days |
| `dt(cover)` | `formatDaysOfCover(cover)` | Formats `"XX d"` or `"No sales"` |
| `F(p)` | `getProductStockFlagKey(product)` | `'out' \| 'low' \| ''` |
| `ft(p)` | `renderProductStockPill(product)` | HTML pill for stock flag |
| `I(v, t, n)` | `renderMeterFillHtml(v, tone, extra)` | Meter fill span HTML |
| `pt(el, val, tone)`| `animateMeterFill(el, val, tone)` | GSAP scaleX tween |
| `mt(els, delay)` | `animateMeterStagger(els, delay)` | Staggered meter entrance tween |
| `L(el, text)` | `updateTextWithPulse(el, text)` | Assigns text and pulses element |
| `ht(root, stats, anim)`| `updateCatalogStats(root, stats, anim)`| Updates count and badge for stat cards |
| `gt(batchId, fromEl)`| `openHoldBatchModal(id, anchor)` | Modal prompt to place lot on hold with note |
| `_t(batch)` | `renderBatchActionButton(batch)` | QA & release / Release / Hold CTA |
| `R(batch)` | `getEffectiveBatchStatus(batch)` | Checks expiration against current date |
| `vt(batch)` | `getBatchExpiryTone(batch)` | Expiry urgency tone |
| `yt` | `PRODUCT_SORT_OPTIONS` | Array of `[id, label, description]` tuples |
| `z` | `categoryFilter` | `'all' \| ProductCategory` |
| `B` | `catalogViewMode` | `'grid' \| 'list'` |
| `V` | `catalogSortKey` | `'name' \| 'stock' \| 'cover' \| 'price'` |
| `bt` | `productSearchQuery` | `string` |
| `H` | `lowStockOnlyFilter` | `boolean` |
| `xt` | `catalogRenderCounter` | `number` |
| `St` | `viewModeSegmentedControl` | SegmentedControl component instance |
| `U` | `productDetailSalesChart` | LineChart component instance |
| `Ct(product)` | `filterProductPredicate(product)` | Evaluates active search, category, low filters |
| `wt(product)` | `getProductDaysOfCover(product)` | Calculates days of cover |
| `Tt()` | `getFilteredCatalogProducts()` | Filters and sorts product catalog |
| `Et()` | `calculateCatalogHeaderStats()` | SKUs, total units, retail value, low items |
| `Dt(product)` | `renderProductCardHtml(product)` | Generates card markup for grid view |
| `Ot()` | `mountCatalogSubtab()` | Initializes catalog DOM and listeners |
| `Mt(target)` | `handleStockAdjustment(button)` | Mutates product stock at DC (+1 / -1) |
| `Nt(viewMode)` | `setCatalogViewMode(mode)` | Toggles grid/list with GSAP Flip |
| `W(animate)` | `renderProductCatalog(animate)` | Renders product grid / list |
| `$` | `activeDrawerBatchId` | `string \| null` |
| `G` | `activeDetailProductId` | `string` |
| `K` | `productDetailChartRange` | `30 \| 90` |
| `Ft` | `productNavDirection` | `-1 \| 1` (for animated transitions) |
| `Lt` | `productLineChartInstance` | LineChart component instance |
| `$t(productId, anim)`| `loadProductDetail(id, anim)` | Loads and renders product detail subtab |
| `q(sections, init)` | `updateProductDetailSections(sec, init)`| Updates specific sections of item view |
| `bn(batchId)` | `openBatchDrawer(batchId)` | Opens batch drawer |
| `Tn(subtab, anim)` | `switchProductsSubtab(sub, anim)` | Subtab transition handler |

---

### 2.3 `src/features/orders/orders.ts` (1,829 lines)

#### Route & Subtabs
- Primary Route: `/orders`
- Subtabs:
  1. `all` (`/orders/all`): All orders table with filters for status (`all`, `new`, `picking`, `packed`, `shipped`, `delivered`, `cancelled`) and channel (`all`, `wholesale`, `online`, `studio`), search input, column sorting (Date, Order #, Total, Customer), CSV export, inline quick-advance CTA.
  2. `board` (`/orders/board`): Interactive Kanban workflow board across 5 stages (`new`, `picking`, `packed`, `shipped`, `delivered`), column item counts and values, card drag-and-drop or single-click status progression, late delivery visual warnings.
  3. `returns` (`/orders/returns`): Customer RMA return requests with return stage tracking (`requested`, `received`, `restocked`, `refunded`, `rejected`), restock reason details, and refund amount reconciliation.

#### Drawer Management
- Slide-out order detail drawer (`/orders/all/:id` or `/orders/returns/:id`):
  - Step tracker visualization across Kanban lifecycle.
  - Customer contact link and shipping destination.
  - Fulfillment warehouse, ship-by deadline, shipping carrier, and live tracking number with clipboard copy.
  - Line-item breakdown with item unit price, quantity, and line totals.
  - Payment settlement toggle switch (`markOrderPaid`).
  - Immutable audit history log with timestamp, operator, and transition notes.
  - Primary CTA to advance status (`Start picking` -> `Mark packed` -> `Ship order` -> `Mark delivered`) or cancel order.

#### Obfuscated Symbol Mapping
| Obfuscated | Semantic Replacement | Type / Purpose |
|:---|:---|:---|
| `Le` | `ORDER_SUBTABS` | `['all', 'board', 'returns']` |
| `N` | `ordersRoot` | `HTMLElement` (view container) |
| `Re` | `currentSubtab` | `'all' \| 'board' \| 'returns'` |
| `ze` | `initializedSubtabs` | `Set<string>` |
| `P(e)` | `getSubtabElement(subtab)` | Query `[data-sub="${e}"]` |
| `F(e)` | `getElementByKey(key)` | Query `[data-k="${e}"]` |
| `I(e)` | `isSubtabActive(subtab)` | Checks active subtab state |
| `Be` | `CHANNEL_TONE_MAP` | `{ wholesale: 'pine', online: 'sky', studio: 'ochre' }` |
| `Ve` | `CHANNEL_LABEL_MAP` | `{ wholesale: 'Wholesale', online: 'Online', studio: 'Studio' }` |
| `He(channel)` | `renderChannelBadgeHtml(ch)` | Renders channel tag |
| `L(status)` | `getOrderStatusTone(status)` | Resolves status color tone |
| `Ue(order)` | `getCustomerFullName(order)` | Looks up customer name |
| `We(customer)` | `getCustomerDetailUrl(cust)` | URL to `/customers/stockists/:id` or shoppers |
| `R(order)` | `isOrderOverdue(order)` | Boolean: active and `shipBy < Date.now()` |
| `Ge(timestamp)`| `formatDateTimeFull(ts)` | Formats date and time string |
| `Ke(timestamp)`| `formatShipByRelative(ts)` | Formats relative ship-by text |
| `qe(order, max)`| `renderOrderThumbnails(order, n)`| Renders product thumbnails for order line items |
| `Je` | `NEXT_STAGE_ACTION_CONFIG` | Next action label & icon tuple per status |
| `Ye(root, key, val, badge, tone)`| `updateStatBadge(root, k, v, b, t)`| Updates stat count and badge in header |
| `z()` | `getDrawerElement()` | Accesses `#drawer` |
| `Xe(callback)` | `afterDrawerClosed(cb)` | Executes callback after drawer close transition |
| `B` | `activeDrawerState` | `{ kind: 'order' \| 'return', id: string, status?: string } \| null` |
| `Qe(order)` | `getOrderStageIndex(order)` | Calculates step index in `KANBAN_STAGES` |
| `$e(order)` | `renderOrderProgressTrack(order)`| Renders visual multi-step progress bar |
| `et(order)` | `renderOrderStatusPills(order)` | Status, paid, channel, and overdue pills |
| `tt(order)` | `renderShippingFacts(order)` | Warehouse, ship deadline, carrier, tracking number |
| `nt(order)` | `renderPaymentReceivedSwitch(order)`| Renders payment switch input |
| `rt(order)` | `renderOrderAuditHistory(order)` | Renders order transition timeline |
| `it(order)` | `renderDrawerActionButtons(order)` | Advance, copy tracking, cancel order CTAs |
| `at(order)` | `renderOrderDetailDrawer(order)` | Full drawer HTML content |
| `ot(fillEl, fromIdx, toIdx, delay)`| `animateStepProgress(el, from, to, delay)`| GSAP scaleX tween on progress bar |
| `st(orderId)` | `openOrderDrawer(orderId)` | Opens order drawer and binds events |
| `an(returnId)` | `openReturnDrawer(returnId)` | Opens return drawer |
| `vt()` | `mountAllOrdersSubtab()` | Initializes all orders table, filters, sorting |
| `kt()` | `mountKanbanBoardSubtab()` | Initializes Kanban columns and drag handlers |
| `$t()` | `mountReturnsSubtab()` | Initializes returns list and filters |
| `sn(subtab)` | `switchOrdersSubtab(subtab)` | Subtab transition handler |
| `cn(subtab, param)`| `handleOrderDrawerRouting(sub, id)`| URL deep-linking drawer handler |

---

### 2.4 `src/features/purchasing/purchasing.ts` (1,474 lines)

#### Route & Subtabs
- Primary Route: `/purchasing`
- Subtabs:
  1. `orders` (`/purchasing/orders`): Purchase Orders directory with status filters (`all`, `open`, `draft`, `sent`, `partial`, `received`, `cancelled`), stats bar (Open POs, Committed Value, Materials on Order, Overdue POs), drawer with item receiving inputs, send PO, receive PO, cancel PO.
  2. `suppliers` (`/purchasing/suppliers`): Supplier cards directory, lead time tracking, country, contact information, rating, supplied materials catalog, active PO history.
  3. `materials` (`/purchasing/materials`): Raw ingredients and packaging inventory table with on-hand vs allocated stock, reorder thresholds, unit cost, supplier link, direct "Order" CTA.

#### Obfuscated Symbol Mapping
| Obfuscated | Semantic Replacement | Type / Purpose |
|:---|:---|:---|
| `Ae` | `PURCHASING_SUBTABS` | `['orders', 'suppliers', 'materials']` |
| `M` | `purchasingRoot` | `HTMLElement` (view container) |
| `N` | `currentSubtab` | `'orders' \| 'suppliers' \| 'materials'` |
| `je` | `initializedSubtabs` | `Set<string>` |
| `P(e)` | `getSubtabElement(subtab)` | Query `[data-sub="${e}"]` |
| `F(e)` | `getElementByKey(key)` | Query `[data-k="${e}"]` |
| `I(e)` | `isSubtabActive(subtab)` | Checks active subtab |
| `L(supplier, sz)`| `renderSupplierMonogram(sup, sz)`| Renders circular monogram badge |
| `Me(mat, qty)` | `formatMaterialQuantity(mat, qty)`| Formats quantity with unit string (e.g. "25.00 kg", "150 pcs") |
| `Ne(eta)` | `formatRelativeEta(eta)` | Formats `"today"`, `"tomorrow"`, `"in X days"`, `"X days late"` |
| `Pe(root, key)`| `getStatCountElement(root, key)` | Query stat count element |
| `R(root, key, val)`| `updatePurchasingStat(root, k, v)`| Updates stat count with pulse |
| `B` | `activePurchasingDrawer` | `{ kind: 'po' \| 'supplier' \| 'material', id: string } \| null` |
| `Re()` | `refreshAllPurchasingStats()` | Recalculates stats across all 3 subtabs |
| `Le(subtab, id)`| `openPurchasingDrawer(sub, id)` | Opens PO, Supplier, or Material drawer |
| `Mt(subtab)` | `switchPurchasingSubtab(subtab)`| Subtab transition handler |

---

### 2.5 `src/features/warehouses/warehouses.ts` (1,667 lines)

#### Route & Subtabs
- Primary Route: `/warehouses`
- Subtabs:
  1. `locations` (`/warehouses/locations`): Multi-facility operational center (Riverside DC, Skincare Lab, Studio Shop). Shows site capacity fill gauge, operations manager, operating hours, zone storage layout (Ambient, Cool, Quarantine, Dispatch staging), finished goods inventory at this facility, raw materials inventory, and movement ledger.
  2. `transfers` (`/warehouses/transfers`): Inter-warehouse transfer directory (`planned`, `in-transit`, `received`), origin -> destination tracking, ETA countdown, transfer creation modal, one-click `receiveTransfer` action that automatically credits destination stock and debits source stock.
  3. `counts` (`/warehouses/counts`): Cycle count audit manager (`scheduled`, `counting`, `done`, `cancelled`). Line-item expected vs counted quantity entry, variance computation, `completeCount` action that writes adjustments directly to `store.moves` and reconciles inventory.

#### Obfuscated Symbol Mapping
| Obfuscated | Semantic Replacement | Type / Purpose |
|:---|:---|:---|
| `De` | `WAREHOUSES_SUBTABS` | `['locations', 'transfers', 'counts']` |
| `N` | `warehousesRoot` | `HTMLElement` (view container) |
| `P` | `currentSubtab` | `'locations' \| 'transfers' \| 'counts'` |
| `F` | `initializedSubtabs` | `Set<string>` |
| `I(e)` | `getSubtabElement(subtab)` | Query `[data-sub="${e}"]` |
| `L(e)` | `getElementByKey(key)` | Query `[data-k="${e}"]` |
| `R(e)` | `isSubtabActive(subtab)` | Checks active subtab |
| `Oe` | `LOCATION_KIND_STYLES` | `{ dc: ['warehouse', 'pine'], lab: ['flask', 'ocean'], shop: ['store', 'ochre'] }` |
| `ke(loc)` | `getLocationStyleTuple(loc)` | Icon and color tone tuple |
| `Ae(loc, size)` | `renderLocationTagHtml(loc, sz)` | Renders location tag pill |
| `z(root, key, val)`| `updateWarehouseStatCount(root, k, v)`| Updates stat count |
| `je(root, key, suf)`| `updateWarehouseStatSuffix(root, k, s)`| Updates stat suffix string |
| `Me(els, delay)` | `animateCapacityMeters(els, delay)`| GSAP scaleX entrance tween |
| `from` | `selectedLocationId` | `'dc' \| 'lab' \| 'shop'` (active warehouse) |
| `X` | `activeCycleCountDrawerId` | `string \| null` |
| `J` | `activeTweensList` | Array of GSAP tweens for teardown |
| `U` | `activeTimelineInstance` | GSAP Timeline for teardown |
| `qe(locId)` | `selectWarehouseLocation(locId)`| Switches active location view |
| `Ot(subtab)` | `switchWarehousesSubtab(subtab)`| Subtab transition handler |
| `St(countId)` | `openCycleCountDrawer(countId)` | Opens cycle count auditing drawer |

---

## 3. Proposed Semantic Domain Models & TypeScript Architecture

To eliminate runtime bugs and support strict typing, the existing types in `src/types/` must be expanded to accurately reflect the real runtime data structures observed in the codebase:

```typescript
// ==========================================
// 1. PRODUCT & BOM DOMAIN (types/product.ts)
// ==========================================

export type ProductCategory = 'Cleanse' | 'Treat' | 'Moisturise' | 'Protect' | 'Body';

export interface ProductStock {
  dc?: number;
  lab?: number;
  shop?: number;
  [locationId: string]: number | undefined;
}

export interface BillOfMaterialItem {
  materialId: string;
  per: number; // Consumption per 1 finished unit
}

export interface Product {
  id: string;
  name: string;
  size: string;
  category: ProductCategory;
  price: number;
  cost: number;
  stock: ProductStock;
  reorderAt: number;
  reorderQty?: number;
  active: boolean;
  photo?: string;
  sku: string;
  barcode?: string;
  line?: string;
  bom?: BillOfMaterialItem[];
}

export type MaterialKind = 'Ingredient' | 'Packaging';

export interface Material {
  id: string;
  name: string;
  sku: string;
  code?: string;
  unit: string;
  kind?: MaterialKind;
  supplierId: string;
  cost: number;
  onHand: number;
  allocated?: number;
  reorderAt: number;
  leadDays?: number;
}

// ==========================================
// 2. BATCH & QA DOMAIN (types/batch.ts)
// ==========================================

export type BatchStatus = 'quarantine' | 'released' | 'hold' | 'expired';

export interface Batch {
  id: string;
  lot: string;
  productId: string;
  status: BatchStatus;
  initialQty: number;
  qty: number;
  left: number;
  mfgAt: number;
  madeAt?: number;
  releasedAt?: number;
  expiresAt: number;
  chemistId?: string;
  notes?: string;
  note?: string;
}

// ==========================================
// 3. SALES ORDER & FULFILLMENT (types/order.ts)
// ==========================================

export type OrderStatus = 'new' | 'picking' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
export type OrderChannel = 'wholesale' | 'online' | 'studio';

export interface OrderLine {
  productId: string;
  qty: number;
  price: number;
}

export interface OrderHistoryEntry {
  at: number;
  to: OrderStatus;
  by: string;
}

export interface SalesOrder {
  id: string;
  number: string;
  customerId: string;
  channel: OrderChannel;
  status: OrderStatus;
  createdAt: number;
  shipBy: number;
  locId: string;
  lines: OrderLine[];
  carrier: string;
  paid: boolean;
  history: OrderHistoryEntry[];
  tracking?: string;
  trackingNumber?: string;
}

export type ReturnStatus = 'requested' | 'received' | 'restocked' | 'refunded' | 'rejected';

export interface ReturnOrderLine {
  productId: string;
  qty: number;
}

export interface ReturnOrder {
  id: string;
  orderId: string;
  customerId: string;
  status: ReturnStatus;
  createdAt: number;
  reason: string;
  lines: ReturnOrderLine[];
  refundAmount: number;
}

// ==========================================
// 4. PURCHASING & SUPPLIERS (types/purchasing.ts)
// ==========================================

export type PoStatus = 'draft' | 'sent' | 'partial' | 'received' | 'cancelled';

export interface PoLine {
  materialId: string;
  qty: number;
  cost: number;
  received?: number;
}

export interface PurchaseOrder {
  id: string;
  number: string;
  supplierId: string;
  status: PoStatus;
  createdAt: number;
  eta: number;
  lines: PoLine[];
  notes?: string;
  receivedAt?: number;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  country: string;
  leadDays: number;
  rating?: number;
  tone?: string;
  materialsCount?: number;
}

// ==========================================
// 5. WAREHOUSES & AUDIT (types/warehouse.ts)
// ==========================================

export type LocationKind = 'dc' | 'lab' | 'shop';

export interface LocationZone {
  id: string;
  name: string;
  kind: 'ambient' | 'cool' | 'quarantine' | 'dispatch';
  bins: number;
}

export interface Location {
  id: string;
  name: string;
  kind: LocationKind;
  city: string;
  address: string;
  capacity: number;
  managerId: string;
  hours: string;
  zones: LocationZone[];
}

export type StockMovementReason = 'sale' | 'production' | 'transfer' | 'adjust' | 'adjustment' | 'return' | 'count';

export interface StockMovement {
  id: string;
  at: number;
  itemId: string;
  locId: string;
  from?: string;
  to?: string;
  qty: number;
  reason: StockMovementReason;
  kind: StockMovementReason;
  ref?: string;
}

export type TransferStatus = 'planned' | 'in-transit' | 'received';

export interface TransferLine {
  productId: string;
  qty: number;
}

export interface Transfer {
  id: string;
  fromLocId: string;
  toLocId: string;
  status: TransferStatus;
  createdAt: number;
  eta: number;
  lines: TransferLine[];
}

export type CycleCountStatus = 'scheduled' | 'counting' | 'done' | 'cancelled';

export interface CycleCountLine {
  productId: string;
  expected: number;
  counted?: number | null;
}

export interface CycleCount {
  id: string;
  number: string;
  locId: string;
  zone?: string;
  status: CycleCountStatus;
  at: number;
  scheduledAt?: number;
  completedAt?: number;
  byId: string;
  lines: CycleCountLine[];
}
```

---

## 4. Modular Decomposition Plan for Core Modules

Each of the 5 oversized feature modules should be decomposed into cohesive sub-components following standard enterprise frontend patterns while preserving identical bundle contracts:

```
src/features/
├── dashboard/
│   ├── dashboard.ts             # Route export { page: { title, mount, enter, leave } }
│   ├── dashboard.css            # Stylesheet
│   ├── subtabs/
│   │   ├── overview.ts          # KPI cards, sales fan meter, stock charts, quick actions
│   │   ├── activity.ts          # Activity timeline, search, 7-day flow, stock ledger
│   │   └── alerts.ts            # Actionable alert groupings and quick decision CTAs
│   └── components/
│       ├── kpi-card.ts          # KPI card rendering with sparklines
│       └── sales-meter.ts       # FanMeter widget integration
│
├── products/
│   ├── products.ts              # Route export { page }
│   ├── products.css             # Stylesheet
│   ├── subtabs/
│   │   ├── catalog.ts           # Product grid/list, category filter chips, search, +/- stock adjust
│   │   ├── item-detail.ts       # SKU hero, 30/90d sales line chart, open orders, BOM limiting
│   │   └── batches.ts           # Batch lots table, status filter, QA actions
│   └── components/
│       ├── product-card.ts      # Product grid card / list row renderer
│       └── batch-drawer.ts      # Batch lot drawer (release, hold with reason prompt)
│
├── orders/
│   ├── orders.ts                # Route export { page }
│   ├── orders.css               # Stylesheet
│   ├── subtabs/
│   │   ├── all-orders.ts        # Orders table, column sorting, status/channel filters, CSV export
│   │   ├── kanban-board.ts      # 5-stage Kanban board with drag/advance progression
│   │   └── returns.ts           # RMA return requests, refund amount tracking
│   └── components/
│       ├── order-drawer.ts      # Order detail drawer (progress tracker, carrier, payment switch)
│       └── return-drawer.ts     # Customer RMA return drawer
│
├── purchasing/
│   ├── purchasing.ts            # Route export { page }
│   ├── purchasing.css           # Stylesheet
│   ├── subtabs/
│   │   ├── purchase-orders.ts   # Purchase orders table, status filters, receiving input
│   │   ├── suppliers.ts         # Supplier directory cards, lead times, rating
│   │   └── materials.ts         # Raw materials & ingredients inventory, reorder triggers
│   └── components/
│       ├── po-drawer.ts         # Purchase order drawer (item reception, send, cancel)
│       └── supplier-drawer.ts   # Supplier profile and supplied materials
│
└── warehouses/
    ├── warehouses.ts            # Route export { page }
    ├── warehouses.css           # Stylesheet
    ├── subtabs/
    │   ├── locations.ts         # Warehouse facility dashboard, capacity meter, zones, site catalog
    │   ├── transfers.ts         # Inter-warehouse stock transfers, one-click receipt
    │   └── counts.ts            # Physical cycle counts, line variance auditor
    └── components/
        └── count-drawer.ts      # Live cycle count drawer editor & reconciler
```

### Clean Shared Import Strategy
Instead of importing 60-80 aliases directly from `../../main.ts` with confusing inverted names, feature modules should import from clean modular barrel files:
- Reactive Store & State: `import { store, subscribeToStore, notifyStoreSubscribers } from '../../core/store';`
- Domain Types: `import { Product, SalesOrder, Batch, PurchaseOrder, Location } from '../../types';`
- UI Controls & Dialogs: `import { openDrawer, closeDrawer, openDropdownMenu, openPromptDialog } from '../../ui';`
- Formatting & Utilities: `import { formatMoney, formatInt, formatRelativeTime, escapeHtml } from '../../utils';`
- Animation Helpers: `import { animateTitle, animateCards, animateRows, animateCounter } from '../../core/motion';`

---

## 5. Risk Assessment & Verification Checkpoints

1. **Title and Deep-Link Routing**:
   - `page.title(params)` must evaluate exact titles expected by Playwright specs:
     - Dashboard overview: `/Dashboard · Vels/`
     - Products catalog: `/Catalog · Vels/`
     - Products item: `/^.* · Vels$/`
     - Products batches: `/Batches · Vels/`
     - Orders all: `/All orders · Vels/`
     - Orders board: `/Order board · Vels/`
     - Orders returns: `/Returns · Vels/`
     - Purchasing: `/Purchasing · Vels/`
     - Warehouses: `/Locations · Vels/`
2. **GSAP Timeline Teardown**:
   - When switching routes, `leave()` must invoke cleanup on any active animations (`Flip`, `closeCurrentPopover`, killing tweens in `J`) to prevent orphaned tickers or memory leaks.
3. **Drawer Closing Transitions**:
   - `closeDrawer()` sets `dataset.closing = "true"`. Any immediate `openDrawer()` call must await completion via `afterDrawerClosed(callback)` or `gsap.delayedCall` to prevent layout corruption.
4. **Data Persistence**:
   - State mutations must call `notifyStoreSubscribers(...keys)` so that the 250ms debounced persistence to `localStorage['Vels:data:v2']` occurs cleanly.
