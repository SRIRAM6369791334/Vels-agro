# Reverse-Engineering and Architectural Survey: Analytics, Visualization, Customers, Settings, and Help

**Author**: `explorer_survey_3`  
**Date**: 2026-11-03  
**Working Directory**: `E:\dashborad clone\frontend`  
**Target Modules**:  
- Visualization: `src/shared/widgets/charts.ts`
- Analytics: `src/features/analytics/analytics.ts`
- Customers: `src/features/customers/customers.ts`
- Settings: `src/features/settings/settings.ts`
- Help: `src/features/help/help.ts`
- Supporting Shell & Router: `src/main.ts`
- Test Suite: `tests/*.spec.js`

---

## 1. Executive Summary & System Overview

The Vels Admin Panel is a high-performance, single-page inventory, wholesale, and production management application built with vanilla TypeScript and GSAP motion. The application was originally developed under the project name "Vessa" and later rebranded to "Vels" / "Vels Agro".

### 1.1 Architecture & Module Layout
The source code layout consists of:
- `src/main.ts` (5,908 lines): Core state store (`X`), pub/sub event bus (`ms` / `Z`), UI overlay managers (Command Palette `#finder`, Popovers `.pop-layer`, Drawers `#drawer`, Modals `#modal`, Toasts `.toast`), router (`sd` / `navigateTo`), and dynamic feature loaders (`Wu`).
- `src/shared/widgets/charts.ts` (850 lines): 7 standalone SVG/HTML visualization components powered by custom math (Catmull-Rom splines, polar transforms, nice tick scale generation) and GSAP tweens.
- `src/features/analytics/analytics.ts` (2,311 lines): High-density reporting dashboard with 3 subtabs (`overview`, `sales`, `stock`), historical rollup caching, weighting curves, and chart integrations.
- `src/features/customers/customers.ts` (906 lines): B2B stockists and B2C shoppers management, RFM metrics, layout switching (`grid` vs `list`), customer drawer, and purchase histories.
- `src/features/settings/settings.ts` (2,233 lines): Multi-tab administrative configuration (`account`, `company`, `team`, `billing`, `notifications`), theme & accent customizers, CSV backup/export, and team seat management.
- `src/features/help/help.ts` (1,005 lines): In-app knowledge base (`center`), interactive FAQs, keyword search highlighting, and ticket management (`tickets`).

### 1.2 Module Lifecycle Contract
Every feature module (`analytics`, `customers`, `settings`, `help`, etc.) adheres to a uniform lifecycle interface dynamically invoked by `main.ts`:
```typescript
export interface FeaturePage {
  title: string | ((params: string[]) => string);
  mount: (container: HTMLElement) => void;
  enter: (context: { params: string[]; first: boolean; same: boolean }) => void;
  leave?: () => void;
}
```

---

## 2. Playwright Test Suite Deep Dive & Non-Regression Invariants

The repository includes 4 comprehensive Playwright test suites containing 47 test cases:
1. `tests/vessa.spec.js` (7 test cases): Full E2E smoke tests covering shell, dashboard KPIs, subtabs, light/dark theme, command palette, notifications, and sidebar toggle.
2. `tests/state-nav-stress.spec.js` (10 test cases): Stress testing deep-linking, direct loads, bare redirects, browser history (`goBack`/`goForward`), 30 rapid hash transitions, localStorage corruption resilience, and wildcard route fallbacks.
3. `tests/adversarial_overlays.spec.js` (16 test cases): Command palette focus, keyboard shortcuts (`Control+k` / `Meta+k`), case-insensitive search, modal dismissal, popover mutual exclusivity, backdrop click-outside, and sidebar state persistence.
4. `tests/adversarial_final_stress.spec.js` (14 test cases): CSV file downloads, notification read mutation, quick create action routing, keyboard navigation (ArrowDown/ArrowUp wrap-around, Enter), 30 rapid popover interleavings, and multi-viewport coordinate constraints.

### 2.1 Critical Test Invariants (What Must Never Break)

| Category | Invariant Rule | Exact Specification / Assertion |
| :--- | :--- | :--- |
| **Routing** | Hash-based routing (`#/path/sub`) | The test suite explicitly tests hash URLs (e.g. `await page.goto('/#/dashboard/overview')`, `expect(page.url()).toContain('#/orders/all')`). URL must retain hash `#/...`. |
| **Document Title** | Exact title ending ` · Vels` | `expect(title.endsWith(' · Vels')).toBeTruthy()`. Must contain middle dot `\u00B7` (char code 183). Prefix matches subtab label. |
| **Command Palette** | `#finder` anchored in upper viewport | Bounding rect `top >= 50` and `top < 300`. Centered horizontally (`Math.abs(center - vp.width / 2) < 5`). |
| **Backdrop / Scrim** | `.scrim` visibility | Computed `visibility: visible` and `opacity > 0.8` when Command Palette is open. Dismisses on backdrop click. |
| **Keyboard Nav** | ArrowUp/ArrowDown wrap-around | ArrowDown advances `aria-selected="true"`. ArrowUp at index 0 wraps to `count - 1`. Enter navigates. |
| **Floating Popovers** | `.pop-layer .pop` mutual exclusivity | Only ONE popover active at a time. Triggers `#btn-bell`, `#btn-new`, `#btn-me` update `aria-expanded`. |
| **Local Storage** | `Vels:theme` format | Must be JSON stringified: `"light"`, `"dark"`, or `"system"`. |
| **Local Storage** | `Vels:side` format | String `'1'` when collapsed/expanded, `'0'` when closed. |
| **CSV Exports** | Stock export filename | Must match regex `/^Vels-stock-\d{4}-\d{2}-\d{2}\.csv$/`. |

### 2.2 Root Cause Analysis of Baseline Test Failures
During baseline verification (`npm run test`), 20 out of 47 tests failed. Our deep code trace identified two regressions introduced in commit `6bf9e70d8af5fe78e6b54eee3eab691e23c46566`:
1. **Hash-to-Path Routing Conflict**: `main.ts` (lines 4568-4571 and 4675-4690) converted incoming `location.hash` (`#/products/catalog`) into HTML5 History path `/products/catalog`. The Playwright test suite asserted `expect(page.url()).toContain(sequence[i].hash)`, which failed because the hash was stripped. Furthermore, `window.location.hash = ...` inside rapid tests did not trigger route rendering due to `history.replaceState`.
2. **Title Template Drift**: `main.ts` line 4673 was set to `document.title = `${n} · Vels Agro`;`. However, tests in `vessa.spec.js` and `state-nav-stress.spec.js` assert `expect(title.endsWith(' · Vels')).toBeTruthy()` and `/Catalog · Vels/`. The extra word `Agro` caused immediate assertion failures.

**Resolution Requirement**: The router must support full bidirectional synchronization with hash routes (`#/`), preserving the `#` prefix in URL assertions, and setting `document.title = `${title} · Vels``.

---

## 3. Visualization Architecture (`src/shared/widgets/charts.ts`)

The chart visualization engine is completely self-contained, lightweight, and requires no external charting library (no Chart.js, ApexCharts, or D3 dependencies). It utilizes raw SVG elements and HTML DOM with GSAP animations.

### 3.1 Mathematical Utilities

1. **Nice Axis Scale Generator (`s(maxVal)`)**:
   - Calculates dynamic y-axis ticks based on the logarithm: $t = 10^{\lfloor \log_{10}(e) \rfloor}$, normalizing $n = e / t$.
   - Quantizes multipliers to $[1, 2, 2.5, 5, 10] \times t$.
2. **Catmull-Rom Smooth Spline Path Generator (`c(points)`)**:
   - Computes cubic Bezier control points for smooth lines through coordinates:
     $$c_1 = [x_i + (x_{i+1} - x_{i-1}) \cdot 0.18, \quad y_i + (y_{i+1} - y_{i-1}) \cdot 0.18]$$
     $$c_2 = [x_{i+1} - (x_{i+2} - x_i) \cdot 0.18, \quad y_{i+1} - (y_{i+2} - y_i) \cdot 0.18]$$
   - Monotonically clamps control points $y$ within $[\min(y_i, y_{i+1}), \max(y_i, y_{i+1})]$ to eliminate spline overshoot.

### 3.2 Catalog of the 7 Visualization Components

| Exported Function | DOM Class | Visual Technique | Features & Lifecycle |
| :--- | :--- | :--- | :--- |
| `createLineChart(container, options)` | `.chart` | SVG `<path class="chart__line">`, gradient `<defs>`, `<clipPath>` | Interpolated dataset morphing via GSAP; crosshair tracking line `.chart__cross`; interactive hover dots; ARIA live status tooltip; `ResizeObserver` responsive auto-redraw; methods `{ update(series, labels), redraw() }`. |
| `createDonutChart(container, options)` | `.bars` | HTML `div.bars__track` & `span.bars__bar` | Despite the misleading name, this renders vertical bar columns. Staggered `gsap.fromTo` scaleY animations; dynamic height scaling; methods `{ play(delay), update(values) }`. |
| `createRingMeter(container, options)` | `.donut` | SVG `<circle>` with `stroke-dasharray` and `stroke-dashoffset` | Multi-segment donut ring. Circumference: $2 \pi \times 52 \approx 326.72$. Staggered stroke-dasharray tweening; center metric text; methods `{ play(delay), update(parts, centerText) }`. |
| `createHorizontalBarChart(container, options)` | `.gauge` | SVG radial `<path class="gauge__arc">` & tick marks | Radial semicircular dial gauge (-120° to +120°). Polar-to-Cartesian trigonometry; animated needle line; ticks; methods `{ play(), update(val) }`. |
| `createSparkline(values, tone, width, height)` | `svg.spark` | Pure SVG string `<path class="chart__line">` | Fast inline SVG string generator. Returns complete HTML string without event listeners for zero-overhead table embedding. |
| `createBarChart(container, options)` | `.hb` | HTML `.hb__y` axis + `.hb__plot` bars + `.hb__tip` | Multi-series horizontal grouped bar chart. Interactive hovering, pinned bar selection, keyboard arrow navigation (`ArrowLeft`/`ArrowRight`), ARIA live region tooltip. |
| `createFanMeter(container, options)` | `.fan` | SVG 84 radiating radial lines (`<line class="fan__l">`) | Semicircular tachometer fan meter. Angle math $\theta = \pi - \frac{i}{N-1}\pi$. Staggered opacity and scale GSAP transitions from origin (160, 156). |

### 3.3 Lifecycle & Resize Handling
- Charts that depend on container width (`createLineChart`, `createBarChart`) initialize a `ResizeObserver`:
  ```typescript
  const observer = new ResizeObserver(() => redraw());
  observer.observe(container);
  ```
- Animations respect `prefers-reduced-motion` via `motionDuration(seconds)`.

---

## 4. Analytics Module (`src/features/analytics/analytics.ts`)

### 4.1 Subtabs & Functional Scope
1. **`overview`**:
   - Top KPI metric cards: Annual Gross Revenue, Net Revenue, Total Orders, Average Order Value (AOV).
   - Interactive revenue line chart (`ov-chart`).
   - Channel breakdown donut (`ov-donut`: Wholesale, Online, Studio).
   - Monthly sales breakdown bars (`ov-bars`).
   - Top-selling products ranking.
2. **`sales`**:
   - Filter bar: Period presets (`30`, `90`, `ytd`), Granularity (`day`, `week`, `month`), Category filter, Channel filter.
   - Comparative sales trend line chart (`sa-chart`).
   - Full product performance matrix with unit volumes, gross revenue, ASP, and embedded sparklines (`createSparkline`).
   - CSV export via `exportOrdersCsv`.
3. **`stock` (Stock Health)**:
   - Composite inventory health score dial gauge (`sh-gauge`).
   - Stock valuation distribution donut (`sh-donut`: Riverside DC, Weaverville Lab, Studio Shop).
   - Category inventory distribution bars (`sh-cat`).
   - Availability status distribution (`sh-st`: In Stock, Low Stock, Out of Stock).
   - Fast vs slow turnover inventory tables and reorder alerts.

### 4.2 Data Rollup & Weighted Statistical Engine
- **Day of Week Weight Vector (`qe`)**: `[0.5, 2.0, 2.0, 2.0, 2.0, 2.0, 1.5]` representing retail and shipping velocity differences between weekends and weekdays.
- **Rollup Aggregation Cache (`V = Map<timestamp, DailyStats>`)**: Daily rollup caches order lines grouped by channel and category.
- **Cache Invalidation**: Subscribes to store events (`orders`, `history`, `products`, `moves`) to invalidate `V = null` when transactions occur.

### 4.3 Obfuscated Identifier Mapping Table (Analytics)

| Obfuscated Identifier | Semantic De-obfuscated Name | Type / Signature | Description |
| :--- | :--- | :--- | :--- |
| `P` | `analyticsRoot` | `HTMLElement` | Root DOM container for the analytics module |
| `Ue` | `activeSubtab` | `'overview' \| 'sales' \| 'stock'` | Currently active subtab |
| `We` | `mountedSubtabs` | `Set<string>` | Tracks subtabs that have been rendered |
| `F` | `getSubtabContainer` | `(sub: string) => HTMLElement` | Query element by `[data-sub="..."]` |
| `I` | `getAnalyticsElement` | `(key: string) => HTMLElement` | Query element by `[data-k="..."]` |
| `L` | `isSubtabVisible` | `(sub: string) => boolean` | Checks if module is visible and subtab is active |
| `R` | `SALES_CHANNELS` | `['wholesale', 'online', 'studio']` | Sales channel identifiers |
| `Ge` | `CHANNEL_TONES` | `Record<string, string>` | Visual theme tones per channel |
| `z()` | `createEmptyDailyStats` | `() => DailyStats` | Factory for blank daily channel/category aggregates |
| `Ke` | `mergeDailyStats` | `(target, source, weight) => void` | Scales and accumulates daily stat rollups |
| `qe` | `DAY_WEIGHTS` | `number[]` | Day-of-week weight multipliers (Sun-Sat) |
| `B` | `addDays` | `(date: number, days: number) => number` | Timestamp date addition utility |
| `V` | `dailyStatsCache` | `Map<number, DailyStats> \| null` | Memoized cache of daily sales aggregates |
| `H` | `earliestOrderTimestamp`| `number` | Earliest recorded order timestamp |
| `Je` | `totalHistoricalStats` | `DailyStats` | Aggregate stats across active historical range |
| `Ye` | `weightNormalizationFactor`| `number` | Inverse scaling factor for synthetic projections |
| `Xe` | `buildDailyStatsCache` | `() => void` | Scans `store.orders` to populate `dailyStatsCache` |
| `Ze` | `clearDailyStatsCache` | `() => void` | Invalidates the daily stats cache |
| `Qe` | `getDailyStatsForDate` | `(date: number) => DailyStats \| null` | Retrieves or projects stats for date |
| `U` | `aggregateDateRange` | `(start, end) => DateRangeStats` | Accumulates stats over date interval |
| `W` | `calculateChannelMetrics`| `(stats, channel) => MetricSummary` | Sums revenue, orders, units, cogs for channel |
| `$e` | `calculateCategoryMetrics`| `(stats, channel, cat) => MetricSummary` | Sums metrics for specific channel & category |
| `et` | `interpolateStockValue`| `(timestamp: number) => number` | Historical stock valuation interpolation |
| `G` | `METRICS_CONFIG` | `Record<string, MetricConfig>` | Configurations for revenue, orders, AOV, stock |
| `ut` | `overviewLineChart` | `LineChartInstance` | Overview revenue line chart instance |
| `mt` | `overviewDonutChart` | `DonutChartInstance` | Overview channel distribution ring instance |
| `gt` | `overviewBarChart` | `BarChartInstance` | Overview monthly revenue bar chart instance |
| `Nt` | `salesLineChart` | `LineChartInstance` | Sales trend line chart instance |
| `Xt` | `stockGaugeChart` | `GaugeChartInstance` | Stock health gauge instance |
| `Zt` | `stockValueDonutChart`| `DonutChartInstance` | Stock valuation location donut instance |
| `Qt` | `stockCategoryChart` | `BarChartInstance` | Stock category distribution bar chart instance |
| `$t` | `stockStatusChart` | `BarChartInstance` | Stock availability status bar chart instance |
| `yn` | `ANALYTICS_SUBTABS` | `['overview', 'sales', 'stock']` | Subtab enum |
| `bn` | `switchSubtab` | `(subtab: string) => void` | Transitions active subtab and mounts components |
| `xn` | `refreshActiveSubtab` | `() => void` | Event listener handler refreshing visible subtab |

---

## 5. Customers Module (`src/features/customers/customers.ts`)

### 5.1 Customer Domain & RFM Metrics
The module divides customer accounts into two primary segments:
1. `stockists`: Wholesale retail partners with physical store addresses, contact buyers, and Net-30 credit terms.
2. `shoppers`: Direct-to-consumer online or studio boutique retail shoppers.

For each customer, the calculation helper `z(customer)` derives live metrics:
- Non-cancelled order count (`n`)
- Lifetime spent (`revenue`)
- Timestamp of last order (`last`)
- Average order value (`avg`)
- Trailing 6-month spend array (`monthly`) for sparkline rendering
- Unpaid outstanding credit balance (`unpaid`)

### 5.2 UI Layout, Filtering, and Drawer
- **View Toggle (`grid` vs `list`)**: Switches stockist display layout, stored in `localStorage['Vels:stockist-view']`.
- **Tag Filtering**: Quick chips for `all`, `vip`, `net30`, `new`, `subscriber`.
- **Search & Sort**: Debounced search by name, contact, city; sort by `revenue`, `last`, `name`, `since`.
- **Customer Drawer (`#drawer`)**: Sliding slide-over drawer displaying customer profile details, payment terms, and interactive order history.

### 5.3 Obfuscated Identifier Mapping Table (Customers)

| Obfuscated Identifier | Semantic De-obfuscated Name | Type / Signature | Description |
| :--- | :--- | :--- | :--- |
| `N` | `customersRoot` | `HTMLElement` | Root container for customer views |
| `P` | `activeCustomerTab` | `'stockists' \| 'shoppers'` | Active segment subtab |
| `F` | `mountedSubtabs` | `Set<string>` | Set of initialized subtabs |
| `ge` | `CUSTOMER_SUBTABS` | `['stockists', 'shoppers']`| Segment list |
| `I` | `getSubtabEl` | `(sub: string) => HTMLElement`| Subtab DOM query helper |
| `L` | `getCustomerEl` | `(k: string) => HTMLElement` | Keyed element query helper |
| `_e` | `isCustomerTabVisible`| `(sub: string) => boolean` | Checks tab visibility |
| `ve` | `CUSTOMER_TAG_COLORS` | `Record<string, string>` | Mapping of customer tag to CSS color variable |
| `R` | `renderCustomerTagBadge`| `(tag: string) => string` | HTML renderer for customer tag badges |
| `ye` | `generatePastMonthBuckets`| `(count: number) => number[]` | Generates start-of-month timestamps for 6 mo |
| `z` | `calculateCustomerMetrics`| `(customer: Customer) => Metrics` | Calculates lifetime revenue, AOV, monthly spend |
| `B` | `buildCustomerMetricsMap` | `(kind: string) => Map<id, Metrics>`| Computes metrics map for all customers of kind |
| `be` | `formatLastOrderRelative` | `(timestamp: number) => string`| Formats last order time or "No orders yet" |
| `xe` | `updateSummaryCard` | `(container, key, val, badge)`| Updates stat card counters and badges |
| `Se` | `STOCKIST_SORT_OPTIONS` | `[string, string][]` | Sort field tuples (key, label) |
| `V` | `searchQuery` | `string` | Current search filter text |
| `H` | `activeTagFilter` | `string` | Selected tag filter |
| `U` | `activeSortKey` | `string` | Selected sort key |
| `W` | `viewLayoutMode` | `'grid' \| 'list'` | Customer card layout mode |
| `Ce` | `calculateStockistKpis` | `() => StatCard[]` | KPI header data for wholesale stockists |
| `we` | `renderStockistCard` | `(customer, metrics, q) => string`| HTML card component with embedded sparkline |
| `Te` | `mountStockistsTab` | `() => void` | Initializes stockists subtab DOM & listeners |
| `Ve` | `switchCustomerTab` | `(tab: string) => void` | Activates stockists or shoppers subtab |
| `ze` | `openCustomerDrawer` | `(customerId: string) => void` | Loads customer profile into sliding drawer |

---

## 6. Settings Module (`src/features/settings/settings.ts`)

### 6.1 Subtabs & Administrative Scope
1. **`account`**: User profile (name, work email, title, phone, avatar), password change validator, theme switcher (Light, Dark, System), accent color palette (Pine, Cobalt, Ocean, Graphite, custom hex), and active login sessions.
2. **`company`**: Organization details (legal entity, physical address, business phone/email, federal tax ID, currency selection, timezone, fiscal year start) and stock threshold preferences (`expiryWarnDays`, `lowStockMode`, label printing sizes).
3. **`team`**: Teammate directory, role assignments (Owner, Admin, Lab, Fulfillment, Customer Care), invite teammate flow with seat utilization enforcement against billing subscription.
4. **`billing`**: Subscription plan tier ("Growth"), seat allocation, annual/monthly billing toggle, payment method card details, and historical invoice ledger.
5. **`notifications`**: Granular notification channel toggles (Email, Push, Slack) across business events (low stock, lot expiry, wholesale orders, purchase order receipts, batch releases).

### 6.2 Obfuscated Identifier Mapping Table (Settings)

| Obfuscated Identifier | Semantic De-obfuscated Name | Type / Signature | Description |
| :--- | :--- | :--- | :--- |
| `P` | `settingsRoot` | `HTMLElement` | Root DOM container for settings |
| `Re` | `activeSettingsSubtab`| `'account' \| 'company' \| ...` | Current settings tab |
| `ze` | `mountedSubtabs` | `Set<string>` | Set of initialized subtabs |
| `Be` | `SETTINGS_SUBTABS` | `['account', 'company', ...]` | Array of 5 settings subtabs |
| `F` | `getSubtabEl` | `(sub: string) => HTMLElement`| Query subtab container |
| `I` | `getSettingsEl` | `(k: string) => HTMLElement` | Query element by `[data-k="..."]` |
| `L` | `isSettingsSubtabActive`| `(sub: string) => boolean` | Checks if subtab is active |
| `Ve` | `EMAIL_REGEX` | `RegExp` | Email format validation regex |
| `R` | `setFieldError` | `(input, errorMsg) => void` | Sets `aria-invalid` and displays field error |
| `Lt` | `SETTINGS_TITLES` | `Record<string, string>` | Document title prefix map for settings tabs |
| `Rt` | `switchSettingsTab` | `(subtab: string) => void` | Unhides subtab and renders section |
| `zt` | `handleDeepLinkedParam`| `(tab, param) => void` | Triggers subtab actions (e.g. highlight team) |
| `Je` | `mountAccountTab` | `() => void` | Renders user profile and theme settings |
| `ot` | `mountCompanyTab` | `() => void` | Renders company details and stock preferences |
| `mt` | `mountTeamTab` | `() => void` | Renders team directory and invite actions |
| `Tt` | `mountBillingTab` | `() => void` | Renders plan, invoices, and payment method |
| `$` | `mountNotificationsTab`| `() => void` | Renders notification preference checkboxes |

---

## 7. Help Module (`src/features/help/help.ts`)

### 7.1 Knowledge Base & Support Ticketing
1. **`center`**:
   - 6 Help Topics: `batches` (Batches & QA), `stock` (Stock & counts), `orders` (Orders & returns), `buying` (Purchasing), `team` (Team & data), `keys` (Shortcuts).
   - Searchable Q&A accordion database with keyword query highlighting (`highlightSearchMatch`).
   - Deep links directly into operational modules (e.g. "Open batches" -> `#/products/batches`).
2. **`tickets`**:
   - Customer support tickets ledger (`store.tickets`).
   - Ticket submission modal: Subject, Topic category, Body details.
   - Live status tracking (`open`, `answered`, `closed`).

### 7.2 Obfuscated Identifier Mapping Table (Help)

| Obfuscated Identifier | Semantic De-obfuscated Name | Type / Signature | Description |
| :--- | :--- | :--- | :--- |
| `O` | `helpRoot` | `HTMLElement` | Root container for help module |
| `k` | `activeHelpSubtab` | `'center' \| 'tickets'` | Active subtab |
| `A` | `mountedSubtabs` | `Set<string>` | Initialized subtabs set |
| `j` | `HELP_SUBTABS` | `['center', 'tickets']` | Subtabs list |
| `M` | `getSubtabEl` | `(sub: string) => HTMLElement`| Query subtab container |
| `N` | `getHelpEl` | `(k: string) => HTMLElement` | Query element by data-k |
| `P` | `isHelpSubtabActive` | `(sub: string) => boolean` | Visibility check |
| `F` | `HELP_TOPICS` | `Record<string, TopicMeta>` | Meta catalog of 6 FAQ categories |
| `I` | `HELP_ARTICLES` | `HelpArticle[]` | Array of FAQ articles with queries and answers |
| `ae` | `mountCenterTab` | `() => void` | Renders FAQ search, topics, and accordions |
| `de` | `mountTicketsTab` | `() => void` | Renders support ticket history and create form |
| `pe` | `switchHelpTab` | `(tab: string) => void` | Transitions subtab views |

---

## 8. Shared Semantic Domain Types Formulation

To eliminate single-letter obfuscation and replace loose implicit types across the codebase, the following production-grade TypeScript definitions must be formalized:

```typescript
// ==========================================
// 1. VISUALIZATION & CHARTS TYPES
// ==========================================
export type ChartTone = 'pine' | 'ocean' | 'sky' | 'ochre' | 'sage' | 'teal' | 'slate';

export interface LineChartSeries {
  label: string;
  tone: ChartTone;
  values: number[];
  dashed?: boolean;
}

export interface LineChartOptions {
  label: string;
  series: LineChartSeries[];
  labels: string[];
  height?: number;
  format?: (value: number) => string;
}

export interface LineChartInstance {
  update: (series: LineChartSeries[], labels?: string[]) => void;
  redraw: () => void;
}

export interface DonutPart {
  label: string;
  tone: ChartTone;
  value: number;
}

export interface RingMeterOptions {
  label: string;
  parts: DonutPart[];
  center: string;
  sub: string;
}

export interface RingMeterInstance {
  play: (delay?: number) => void;
  update: (parts: DonutPart[], center?: string) => void;
}

export interface RadialGaugeOptions {
  label: string;
  value: number;
  min?: number;
  max?: number;
  ticks?: number;
  format?: (value: number) => string;
}

export interface RadialGaugeInstance {
  play: () => void;
  update: (value: number) => void;
}

// ==========================================
// 2. CUSTOMER DOMAIN TYPES
// ==========================================
export type CustomerKind = 'stockist' | 'shopper';
export type CustomerTag = 'vip' | 'net30' | 'new' | 'subscriber';

export interface Customer {
  id: string; // e.g. "c-juniper-moss"
  name: string;
  kind: CustomerKind;
  contact: string;
  email: string;
  phone: string;
  city: string;
  region: string;
  since: number; // Unix timestamp
  tags: CustomerTag[];
  note?: string;
}

export interface CustomerMetrics {
  orders: any[];
  orderCount: number;
  revenue: number;
  lastOrderAt: number;
  averageOrderValue: number;
  monthlyRevenue: number[]; // 6-month trailing bucket
  unpaidBalance: number;
}

// ==========================================
// 3. SETTINGS & ORGANIZATION DOMAIN TYPES
// ==========================================
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  title: string;
  phone: string;
}

export interface CompanySettings {
  name: string;
  legal: string;
  address: string;
  phone: string;
  email: string;
  taxId: string;
  currency: string;
  timezone: string;
  fiscalStart: string;
}

export interface BillingInvoice {
  id: string;
  at: number;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
}

export interface BillingSettings {
  plan: string;
  seats: number;
  cycle: 'monthly' | 'yearly';
  card: {
    brand: string;
    last4: string;
    exp: string;
    name: string;
  };
  invoices: BillingInvoice[];
}

export interface NotificationPreferences {
  lowStock: boolean;
  expiry: boolean;
  orders: boolean;
  poUpdates: boolean;
  returns: boolean;
  digest: boolean;
  email: boolean;
  push: boolean;
}

export interface InventoryPreferences {
  expiryWarnDays: number;
  lowStockMode: 'fixed' | 'dynamic';
  defaultLoc: string;
  weekStart: 'mon' | 'sun';
}

export interface AppSettings {
  me: UserProfile;
  company: CompanySettings;
  billing: BillingSettings;
  notify: NotificationPreferences;
  prefs: InventoryPreferences;
  goal: number;
}

// ==========================================
// 4. HELP & TICKETING DOMAIN TYPES
// ==========================================
export interface HelpArticle {
  id: string;
  category: 'batches' | 'stock' | 'orders' | 'buying' | 'team' | 'keys';
  question: string;
  answer: string;
  link?: [string, string]; // [href, label]
}

export interface HelpTicket {
  id: string;
  number: string;
  subject: string;
  body: string;
  topic: string;
  status: 'open' | 'answered' | 'closed';
  at: number;
  reply?: string;
}

// ==========================================
// 5. ANALYTICS & STATISTICAL ROLLUP TYPES
// ==========================================
export interface CategoryMetrics {
  rev: number;
  units: number;
  cogs: number;
}

export interface DailyStats {
  ordersByChannel: Record<'wholesale' | 'online' | 'studio', number>;
  categoriesByChannel: Record<
    'wholesale' | 'online' | 'studio',
    Record<string, CategoryMetrics>
  >;
}
```

---

## 6. Modular Decomposition & Zero-Regression Migration Plan

To refactor the codebase without breaking the 47 Playwright test invariants or runtime parity, the refactoring should follow a phased decoupling strategy:

### Phase 1: Shared Domain Layer & Foundation Fixes
1. **Type Definitions**: Install the domain interfaces in `src/types/` (`chart.ts`, `customer.ts`, `settings.ts`, `help.ts`, `analytics.ts`). Update `src/tsconfig.json` `include` array to ensure strict type checking across all modules.
2. **Router & Title Parity Remediation in `main.ts`**:
   - Ensure the router supports hash routing without removing `#` from the browser address bar.
   - Synchronize document titles to `${pageTitle} · Vels` with Unicode dot `\u00B7` (char code 183).
   - Ensure `.scrim` receives computed `visibility: visible` when Command Palette opens.
   - Run `npm run test` to verify 47/47 passing baseline.

### Phase 2: Decouple Shared Visualization Widgets (`src/shared/widgets/charts.ts`)
1. Refactor `charts.ts` to replace single-letter identifiers (`o`, `s`, `c`, `l`, `u`, `d`, `f`, `p`, etc.) with semantic names (`SVG_NS`, `computeNiceAxisTicks`, `generateSmoothSplinePath`, etc.).
2. Clean up function naming with backwards-compatible aliases so calling modules do not break:
   - Provide semantic names (`renderLineChart`, `renderColumnBarChart`, `renderDonutRingMeter`, `renderRadialGaugeMeter`, `renderSparklineSvg`, `renderGroupedBarChart`, `renderFanMeter`).
   - Retain existing exported aliases (`createLineChart`, `createDonutChart`, `createRingMeter`, etc.) during transition.

### Phase 3: Modularize Target Feature Modules
1. **`features/help/help.ts`**: Replace single-letter variables (`O`, `k`, `A`, `j`, `M`, `N`, `P`, `F`, `I`, `ae`, `de`, `pe`) with semantic identifiers (`helpContainer`, `activeHelpTab`, `HELP_TOPICS`, `HELP_ARTICLES`, `mountFaqCenter`, `mountTicketsLedger`).
2. **`features/customers/customers.ts`**: Replace obfuscated variables (`N`, `P`, `F`, `ge`, `I`, `L`, `ve`, `ye`, `z`, `B`, `we`, `Te`, `Ve`, `ze`) with semantic identifiers (`customersContainer`, `activeCustomerSegment`, `calculateCustomerKpis`, `mountStockistsTab`, `openCustomerDrawer`).
3. **`features/settings/settings.ts`**: Replace obfuscated variables (`P`, `Re`, `ze`, `Be`, `Lt`, `Rt`, `Je`, `ot`, `mt`, `Tt`, `$`) with semantic identifiers (`settingsContainer`, `activeSettingsTab`, `SETTINGS_SUBTABS`, `mountAccountSettings`, `mountCompanySettings`, `mountTeamSettings`, `mountBillingSettings`).
4. **`features/analytics/analytics.ts`**: Replace obfuscated variables (`P`, `Ue`, `We`, `Ge`, `z`, `Ke`, `qe`, `Xe`, `Qe`, `ut`, `mt`, `gt`, `Nt`, `Xt`, `Zt`) with semantic identifiers (`analyticsContainer`, `activeAnalyticsTab`, `dailyRollupCache`, `computeDailyStats`, `overviewLineChart`, etc.).
5. **Decouple Store Subscriptions**: Replace misnamed helper `findLocationById` with `subscribeStoreSlice(slice, callback)`.

### Phase 4: Verification Pipeline
Execute the full test and verification suite after each module de-obfuscation:
- `npm run typecheck` (`tsc --noEmit`): Verify 0 type errors.
- `npm run build` (`vite build`): Verify successful bundle generation and chunk sizes.
- `npm run test` (`npx playwright test`): Verify 47/47 tests passing without dropped clicks, missing overlays, or title/URL mismatches.
