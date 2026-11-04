# Milestone 2: Visualization Engine & Analytics Module — Investigation & Handoff Report

## 1. Observation

### 1.1 Direct Source Code Observations

#### A. Visualization Engine (`frontend/src/shared/widgets/charts.ts` - 850 lines)
- **Math & Curve Algorithms**:
  - Lines 10–17: `s(e)` implements nice ceiling tick scaling:
    ```typescript
    const s = (e) => {
      if (e <= 0) return 1;
      let t = 10 ** Math.floor(Math.log10(e));
      let n = e / t;
      return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * t;
    };
    ```
  - Lines 18–38: `c(e)` generates smooth Catmull-Rom cubic Bezier spline SVG path `d` strings with tangent factor `0.18` and monotonic clamping to prevent Bezier overshoot between adjacent points:
    ```typescript
    let s = 0.18;
    let c = [i[0] + (a[0] - r[0]) * s, i[1] + (a[1] - r[1]) * s];
    let l = [a[0] - (o[0] - i[0]) * s, a[1] - (o[1] - i[1]) * s];
    let u = Math.min(i[1], a[1]);
    let d = Math.max(i[1], a[1]);
    c[1] = Math.max(u, Math.min(d, c[1]));
    l[1] = Math.max(u, Math.min(d, l[1]));
    t += ` C${c[0]},${c[1]} ${l[0]},${l[1]} ${a[0]},${a[1]}`;
    ```
- **The 7 Chart Widget Implementations**:
  1. `createLineChart(n, a)` (lines 39–233): Responsive multi-series SVG line chart with gradient fill area, crosshair tracking, circle dots, animated clipPath (`rect.chart__clip`), and keyboard navigation (ArrowLeft / ArrowRight).
  2. `createDonutChart(n, r)` (lines 234–294): Despite the legacy name `createDonutChart`, this function creates a **Column Bar Chart** (`.bars`, `.bars__col`, `.bars__track`, `.bars__bar`, `.bars__lab`) with GSAP `scaleY` bar animations.
  3. `createRingMeter(n, r)` (lines 295–347): Pure SVG **Donut / Ring Meter** (`.donut`, `.donut__track`, `.donut__arc`, `.donut__mid`) calculating arc stroke dash lengths from circumference `2 * Math.PI * 52` (~326.73px).
  4. `createHorizontalBarChart(r, a)` (lines 348–461): Despite the legacy name `createHorizontalBarChart`, this function creates a **240-degree Radial Gauge Meter** (`.gauge`, `.gauge__track`, `.gauge__arc`, `.gauge__ticks`, `.gauge__needle`) with angle sweep from -120° to +120°, tick marks, needle rotation, status zones (`rose`/`ochre`/`sage`), and animated counter text.
  5. `createSparkline(e, t, n, r)` (lines 462–466): Returns an inline SVG string (`<svg class="spark" ...><path class="chart__line ..."/></svg>`) using Catmull-Rom splines for micro-visualizations.
  6. `createBarChart(n, r)` (lines 467–752): **Grouped Column Bar Chart** (`.hb`, `.hb__y`, `.hb__plot`, `.hb__grp`, `.hb__bar`, `.hb__tip`) with dynamic Y-axis tick labels, pointer hover tracking, magnetic tooltip, click/keyboard pinning, and series toggle (`toggle(seriesIndex)`).
  7. `createFanMeter(r, a)` (lines 753–840): **Radiant Arc Fan Meter** (`.fan`, `.fan__base`, `.fan__lit`, `.fan__ring`, `.fan__mid`) with 84 radiant rays centered at `(160, 156)`, gradient fill, back-easing ray light-up animation, and counter tween.
- **Legacy Exports** (lines 841–849):
  ```typescript
  export {
    createHorizontalBarChart as a,
    createFanMeter as i,
    createDonutChart as n,
    createBarChart as o,
    createRingMeter as r,
    createSparkline as s,
    createLineChart as t,
  };
  ```

#### B. Analytics Module (`frontend/src/features/analytics/analytics.ts` - 2,311 lines)
- **Data Caching & Velocity Weighting Engine**:
  - `V`: `dailyStatsCache: Map<number, DayStats> | null` (lines 134, 139–162).
  - `H`: `earliestOrderDate: number` (line 163).
  - `Je`: `historicalBaseStats: DayStats` (line 166).
  - `qe`: `DAY_WEIGHTS = [0.5, 2, 2, 2, 2, 2, 1.5]` (line 128: Sun=0.5, Mon-Fri=2.0, Sat=1.5).
  - `Ye`: `velocityWeightMultiplier = 1 / Math.max(1, totalWeights * avgStockOut)` (line 180).
  - `Xe()`: Builds `dailyStatsCache` from `store.orders` where `getOrdersByCustomer(order)` is valid.
  - `Ze()`: Invalidates cache (`V = null`).
  - `Qe(date)`: Queries day stats: if `date >= H`, fetches from cache; if older, extrapolates from `Je` using day weight `qe[day]` and historical `stockOut`.
  - `et(timestamp)`: Calculates historical stock valuation. Walks back `store.moves` within 42 days; uses linear interpolation over `store.weeks` or `store.months` for older dates.
- **Three Core Subtabs**:
  1. `overview` (lines 479–1050):
     - 6 KPI metric buttons (`rev`, `orders`, `units`, `aov`, `stock`, `margin`) with mini sparklines.
     - Main line chart with date range switcher (`30`, `90`, `ytd`), bucket granularity (`day`, `week`, `month`), period comparison toggle (`ov-cmp`), and channel filter (`all`, `wholesale`, `online`, `studio`).
     - Channel donut ring meter (`ov-donut`) and category column bar chart (`ov-bars`).
     - CSV export (`ov-export`) downloading `Vels-<metric>-<range>-by-<granularity>-<date>.csv`.
  2. `sales` (lines 1350–1550):
     - Top sellers ranked table with search filter (`sa-q`), sorting by revenue/units (`sa-sort`), margin, and sparkline.
     - 7x16 day-hour order heatmap (`sa-heat`) with hover tooltips and busiest hour callout.
     - Top 6 wholesale stockists card (`sa-stockists`) with direct links and quick re-order action.
  3. `stock` (lines 1850–2225):
     - Days of stock cover progress bars (`sh-cover`) with filter (`all`, `risk`, `ok`), search, and "Make" batch action.
     - Cycle count accuracy radial gauge (`sh-gauge`) and recent counts list (`sh-counts`).
     - Stock value by warehouse location donut (`sh-donut`).
     - Category stock value column bars (`sh-cat`) and sell-through rate column bars (`sh-st`).
     - Expiry risk tiles (`sh-exp`) and expiring batches list (`sh-lots`).
     - Dead stock list (`sh-dead`).
- **Store Subscriptions & Page Contract** (lines 2260–2310):
  - `title(params)`: maps `sales` -> `'Sales'`, `stock` -> `'Stock health'`, default -> `'Reports'`.
  - Subscribes via `findLocationById` (`subscribeToStore`):
    - `'orders'`, `'history'` -> invalidates stats cache (`Ze()`) and refreshes active view.
    - `'products'`, `'batches'`, `'counts'`, `'moves'`, `'settings'` -> targeted subtab refreshes.

### 1.2 Callers & Consumers Across the Codebase
- `frontend/src/features/customers/customers.ts`: Imports `createDonutChart`, `createSparkline` from `../../shared/widgets/charts.ts`.
- `frontend/src/features/dashboard/dashboard.ts`: Imports `createFanMeter`, `createBarChart`, `createSparkline` from `../../shared/widgets/charts.ts`.
- `frontend/src/features/products/products.ts`: Imports `createLineChart` from `../../shared/widgets/charts.ts`.
- `frontend/src/core/router.ts`: Dynamically loads `page` from `../features/analytics/analytics.ts`.
- `tests/state-nav-stress.spec.js`:
  - SN-01: Validates `#/analytics/overview` landmark visibility.
  - SN-02: Asserts titles `Reports · Vels`, `Sales · Vels`, `Stock health · Vels`.

---

## 2. Logic Chain

1. **Naming Duality and Backward Compatibility**:
   - *Observation*: In `charts.ts`, the function named `createDonutChart` renders `.bars` (a column bar chart), while `createRingMeter` renders `.donut` (a donut chart). `createHorizontalBarChart` renders `.gauge` (a radial gauge meter).
   - *Logic*: Callers in `customers.ts`, `analytics.ts`, and `dashboard.ts` currently use these names (e.g. `createDonutChart` for category bars). Meanwhile, `PROJECT.md` specifies `renderColumnBarChart`, `renderDonutRingMeter`, `renderRadialGaugeMeter`. Therefore, the refactored chart module MUST export BOTH sets of names (semantic modern names and backward-compatible aliases) to prevent breaking existing modules.

2. **Decoupling Mathematical Primitives**:
   - *Observation*: Catmull-Rom spline path generation (`c`) and nice scale ticks (`s`) are shared across `line-chart` and `sparkline`, and nice scale is used across `line-chart`, `column-bar-chart`, and `grouped-bar-chart`.
   - *Logic*: Extracting `calculateNiceScale` and `buildCatmullRomPath` into `shared/widgets/charts/math.ts` eliminates code duplication, enables isolated unit testing, and keeps chart renderers clean.

3. **Analytics Subtab Decomposition**:
   - *Observation*: `analytics.ts` is currently 2,311 lines with three distinct subtabs (`overview`, `sales`, `stock`), each having its own DOM rendering, event handlers, and data transformations.
   - *Logic*: Splitting `analytics.ts` into a lightweight coordinator (`features/analytics/analytics.ts`), three dedicated subtab handlers (`subtabs/overview.ts`, `subtabs/sales.ts`, `subtabs/stock.ts`), and supporting services (`services/stats-cache.ts`, `services/stock-calculator.ts`) provides clean single-responsibility boundaries while keeping runtime behavior 100% identical.

4. **DOM & Test Invariants**:
   - *Observation*: Playwright tests check specific route paths (`#/analytics/overview`, `#/analytics/sales`, `#/analytics/stock`), title templates (`<Subtab> · Vels`), and data landmarks.
   - *Logic*: The `page.title` method must continue returning `'Reports'`, `'Sales'`, or `'Stock health'`, which the router formats with Unicode middle dot `\u00B7` (183). All `data-sub`, `data-k`, and CSS classes (`.an-main`, `.an-metric`, `.an-donut`, `.an-cats`, `.card`) must be strictly preserved.

---

## 3. Caveats

- **No Caveats**: The codebase was thoroughly inspected via direct AST/file viewing.
- **Pre-existing Aliases**: In `main.ts`, `findLocationById` is an alias for `subscribeToStore`, and `getAvailableLocations` is an alias for `animateCounter`. The worker should import directly from `src/core/store.ts` (`subscribeToStore`) and `src/core/motion.ts` (`animateCounter`) or maintain compatibility imports.
- **Single Letter Chart Exports**: Existing code or tests might theoretically access single letter exports (`a`, `i`, `n`, `o`, `r`, `s`, `t`). Retaining them in `charts.ts` guarantees absolute zero regression.

---

## 4. Conclusion & Structured Specifications

### 4.1 Symbol-by-Symbol Mapping

#### `charts.ts` Symbol Mapping
| Obfuscated Identifier | Clean Semantic Identifier | TypeScript Type / Signature | Description |
|---|---|---|---|
| `o` | `SVG_NS` | `string` (`"http://www.w3.org/2000/svg"`) | Standard SVG XML namespace |
| `s(e)` | `calculateNiceScale` | `(maxValue: number) => number` | Calculates nice round ceiling tick values (1, 2, 2.5, 5, 10 powers) |
| `c(e)` | `buildCatmullRomPath` | `(points: [number, number][]) => string` | Monotonic Catmull-Rom cubic Bezier SVG path generator |
| `createLineChart` / `t` | `renderLineChart` / `createLineChart` | `(container: HTMLElement, options: LineChartOptions) => ChartInstance` | Multi-series line chart with area gradient, crosshairs, tooltips |
| `createDonutChart` / `n` | `renderColumnBarChart` / `createDonutChart` | `(container: HTMLElement, options: ColumnBarChartOptions) => ChartInstance` | Column bar chart with animated height scaling |
| `createRingMeter` / `r` | `renderDonutRingMeter` / `createRingMeter` | `(container: HTMLElement, options: DonutRingOptions) => ChartInstance` | Circular donut ring meter with arc dash animations |
| `createHorizontalBarChart` / `a` | `renderRadialGaugeMeter` / `createHorizontalBarChart` | `(container: HTMLElement, options: RadialGaugeOptions) => ChartInstance` | 240° radial gauge with needle, status zones, and counter |
| `createSparkline` / `s` | `renderSparklineSvg` / `createSparkline` | `(values: number[], tone?: string, width?: number, height?: number) => string` | Inline SVG sparkline path generator |
| `createBarChart` / `o` | `renderGroupedBarChart` / `createBarChart` | `(container: HTMLElement, options: GroupedBarChartOptions) => ChartInstance` | Grouped column bar chart with Y-axis ticks, hover/click pinning |
| `createFanMeter` / `i` | `renderFanMeter` / `createFanMeter` | `(container: HTMLElement, options: FanMeterOptions) => ChartInstance` | Radiant ray fan meter with GSAP stagger reveal |

#### `analytics.ts` Symbol Mapping
| Obfuscated Identifier | Clean Semantic Identifier | TypeScript Type / Signature | Description |
|---|---|---|---|
| `P` | `containerElement` | `HTMLElement \| null` | Mounted analytics root container |
| `Ue` | `activeSubtab` | `'overview' \| 'sales' \| 'stock'` | Current active subtab identifier |
| `We` | `initializedSubtabs` | `Set<string>` | Tracks subtabs that have rendered initial DOM |
| `F(subtab)` | `querySubtab` | `(subtab: string) => HTMLElement \| null` | Selector for `[data-sub="${subtab}"]` |
| `I(key)` | `queryDataKey` | `(key: string) => HTMLElement \| null` | Selector for `[data-k="${key}"]` |
| `L(subtab)` | `isSubtabActive` | `(subtab: string) => boolean` | Checks if container is visible and subtab is active |
| `R` | `SALES_CHANNELS` | `readonly ['wholesale', 'online', 'studio']` | List of sales channels |
| `Ge` | `CHANNEL_TONES` | `Record<string, string>` | Accent tone colors for channels (`pine`, `sky`, `ochre`) |
| `z()` | `createZeroStats` | `() => ChannelDayStats` | Generates empty channel/category order statistics data structure |
| `Ke` | `accumulateStats` | `(target: ChannelDayStats, src: ChannelDayStats, factor?: number) => void` | Adds source statistics into target with multiplier factor |
| `qe` | `DAY_WEIGHTS` | `readonly [0.5, 2, 2, 2, 2, 2, 1.5]` | Day-of-week velocity weighting array (Sun-Sat) |
| `B(ts, days)` | `addDays` | `(timestamp: number, days: number) => number` | Date arithmetic helper |
| `V` | `dailyStatsCache` | `Map<number, ChannelDayStats> \| null` | In-memory cache of daily aggregated sales stats |
| `H` | `earliestOrderDate` | `number` | Minimum timestamp among valid tracked orders |
| `Je` | `historicalBaseStats` | `ChannelDayStats` | Base accumulated stats from historical months |
| `Ye` | `velocityMultiplier` | `number` | Normalized velocity weighting factor |
| `Xe()` | `rebuildDailyStatsCache` | `() => void` | Aggregates store orders into daily buckets and computes weights |
| `Ze()` | `invalidateStatsCache` | `() => void` | Clears cache (`V = null`) |
| `Qe(date)` | `getDailyStats` | `(date: number) => ChannelDayStats \| null` | Fetches day stats from cache or extrapolates historical data |
| `U(start, end)` | `aggregateRangeStats` | `(start: number, end: number) => RangeStatsResult` | Sums daily stats over date range with estimate tracking |
| `W(stats, chan)` | `sumChannelTotals` | `(stats: ChannelDayStats, channel: string) => MetricTotals` | Sums `{ rev, orders, units, cogs }` across categories |
| `$e(stats, chan, cat)` | `sumCategoryTotals` | `(stats: ChannelDayStats, channel: string, category: string) => MetricTotals` | Sums metric totals for a specific product category |
| `et(ts)` | `calculateHistoricalStockValue` | `(timestamp: number) => number` | Walks stock moves or interpolates month values |
| `G` | `METRICS_CONFIG` | `Record<string, MetricConfig>` | Configurations for `rev`, `orders`, `units`, `aov`, `stock`, `margin` |
| `K` | `RANGE_PRESETS` | `Record<string, string>` | Labels for `30`, `90`, `ytd` |
| `rt` | `ALLOWED_GRAINS` | `Record<string, string[]>` | Supported granularities per range preset |
| `it` | `DEFAULT_GRAINS` | `Record<string, string>` | Default granularity per range preset |
| `at(preset)` | `getDateRangeBounds` | `(preset: string) => { start: number; end: number; n: number }` | Computes start/end timestamps for preset |
| `ot(preset, grain)` | `generateTimeBuckets` | `(preset: string, grain: string) => TimeBucket[]` | Generates date buckets for charting |
| `st(metric, s, e, chan)` | `calculateBucketMetric` | `(metric: string, start: number, end: number, channel: string) => BucketValue` | Computes metric value for a specific bucket |
| `ct(...)` | `calculateSeriesData` | `(...) => SeriesDataResult` | Computes current vs previous period series for line charts |
| `q` | `selectedMetric` | `MetricKey` | Currently selected KPI metric (`rev` default) |
| `J` | `selectedRange` | `RangePreset` | Currently selected date range (`30` default) |
| `Y` | `selectedGranularity` | `Granularity` | Currently selected time bucket (`day` default) |
| `lt` | `isCompareEnabled` | `boolean` | Comparison series toggle state |
| `X` | `selectedChannel` | `string` | Selected channel filter (`all` default) |
| `yt()` | `renderOverviewTemplate` | `() => string` | HTML template for Overview subtab |
| `Dt()` | `mountOverviewSubtab` | `() => void` | Initializes Overview subtab controls and event listeners |
| `At()` | `enterOverviewSubtab` | `() => void` | Triggers Overview subtab entrance animations |
| `Rt()` | `renderSalesTemplate` | `() => string` | HTML template for Sales subtab |
| `Kt()` | `mountSalesSubtab` | `() => void` | Initializes Sales subtab controls and event listeners |
| `Jt()` | `enterSalesSubtab` | `() => void` | Triggers Sales subtab entrance animations |
| `cn()` | `renderStockTemplate` | `() => string` | HTML template for Stock Health subtab |
| `gn()` | `mountStockSubtab` | `() => void` | Initializes Stock Health subtab controls and event listeners |
| `vn()` | `enterStockSubtab` | `() => void` | Triggers Stock Health subtab entrance animations |
| `page` | `page` | `FeaturePage` | Feature page lifecycle contract (`title`, `mount`, `enter`, `leave`) |

---

### 4.2 Proposed File Layout & Modular Decomposition Plan

#### A. Visualization Engine (`src/shared/widgets/charts/`)
```
frontend/src/shared/widgets/
├── charts.ts                        # Master barrel: re-exports clean APIs + backward-compat aliases
└── charts/
    ├── types.ts                     # Strict TypeScript interfaces for all charts
    ├── math.ts                      # calculateNiceScale, buildCatmullRomPath, polar-cartesian math
    ├── line-chart.ts                # renderLineChart / createLineChart
    ├── column-bar-chart.ts          # renderColumnBarChart / createDonutChart
    ├── donut-ring-meter.ts          # renderDonutRingMeter / createRingMeter
    ├── radial-gauge-meter.ts        # renderRadialGaugeMeter / createHorizontalBarChart
    ├── sparkline.ts                 # renderSparklineSvg / createSparkline
    ├── grouped-bar-chart.ts         # renderGroupedBarChart / createBarChart
    └── fan-meter.ts                 # renderFanMeter / createFanMeter
```

#### B. Analytics Module (`src/features/analytics/`)
```
frontend/src/features/analytics/
├── analytics.ts                     # FeaturePage entry point, subtab switcher, store subscriptions
├── analytics.css                    # Analytics stylesheets
├── types.ts                         # Analytics domain models (ChannelDayStats, MetricTotals, etc.)
├── services/
│   ├── stats-cache.ts               # Order aggregation, daily caching, velocity weighting, extrapolation
│   ├── metrics-service.ts           # Metric definitions, range calculators, bucket generators
│   └── stock-service.ts             # Inventory valuation, stock cover, turns, accuracy, expiry
├── components/
│   ├── order-heatmap.ts             # 7x16 hour/day heatmap grid and tooltip
│   └── stockist-ranking.ts          # Wholesale stockists list card
└── subtabs/
    ├── overview-subtab.ts           # Overview subtab template, metrics cards, line chart, donut, bars
    ├── sales-subtab.ts              # Sales subtab template, top sellers table, heatmap, stockists
    └── stock-subtab.ts              # Stock health subtab template, cover list, gauge, category breakdown
```

---

### 4.3 Strict TypeScript Interface Contracts

#### 1. Charts Contracts (`src/shared/widgets/charts/types.ts`)
```typescript
export interface ChartInstance {
  play: (delay?: number) => void;
  update: (...args: any[]) => void;
  redraw?: () => void;
  set?: (val: number, subText?: string) => void;
  toggle?: (seriesIndex: number) => boolean;
  readonly pinned?: number;
}

export interface LineChartSeries {
  name: string;
  tone: string;
  dashed?: boolean;
  values: number[];
}

export interface LineChartOptions {
  label: string;
  labels: string[];
  series: LineChartSeries[];
  height?: number;
  format: (val: number) => string;
}

export interface ColumnBarChartOptions {
  label: string;
  labels: string[];
  values: number[];
  highlight?: number;
  tone?: string;
  format: (val: number) => string;
}

export interface DonutRingPart {
  label?: string;
  value: number;
  tone: string;
  id?: string;
}

export interface DonutRingOptions {
  label: string;
  center: string;
  sub: string;
  parts: DonutRingPart[];
}

export interface RadialGaugeOptions {
  label: string;
  value: number; // 0.0 to 1.0
  sub: string;
  format: (val: number) => string;
  ticks?: number;
  zones?: { bad: number; warn: number };
  tone?: string;
}

export interface GroupedBarGroup {
  label: string;
  values: number[];
}

export interface GroupedBarSeries {
  name: string;
  tone: string;
}

export interface GroupedBarChartOptions {
  label: string;
  groups: GroupedBarGroup[];
  series: GroupedBarSeries[];
  axis: (val: number) => string;
  format: (val: number) => string;
  pick?: number;
}

export interface FanMeterOptions {
  label: string;
  value: number; // 0.0 to 1.0
  sub: string;
  count?: number;
  format?: (val: number) => string;
}
```

#### 2. Analytics Contracts (`src/types/analytics.ts` & `src/features/analytics/types.ts`)
```typescript
export type AnalyticsSubtab = 'overview' | 'sales' | 'stock';
export type MetricKey = 'rev' | 'orders' | 'units' | 'aov' | 'stock' | 'margin';
export type RangePreset = '30' | '90' | 'ytd';
export type Granularity = 'day' | 'week' | 'month';
export type SalesChannel = 'wholesale' | 'online' | 'studio';

export interface CategoryMetricData {
  rev: number;
  units: number;
  cogs: number;
}

export interface ChannelDayStats {
  o: Record<SalesChannel, number>;
  c: Record<SalesChannel, Record<string, CategoryMetricData>>;
}

export interface MetricTotals {
  rev: number;
  orders: number;
  units: number;
  cogs: number;
}

export interface TimeBucket {
  s: number; // start timestamp
  e: number; // end timestamp
  label: string;
}

export interface SeriesDataResult {
  buckets: TimeBucket[];
  cur: number[];
  prev: number[];
  canCompare: boolean;
  total: number;
  prevTotal: number;
  est: boolean;
  empty: boolean;
}

export interface StockTurnMetrics {
  t: number; // turns per year
  days: number; // days on shelf
}

export interface ExpiryBucket {
  d: number;
  lots: any[];
  units: number;
  value: number;
}

export interface StockAccuracyMetrics {
  acc: number;
  counts: any[];
  lines: number;
}
```

---

### 4.4 Backward Compatibility Guarantees

1. **`charts.ts` Barrel Re-exporting**:
   - `frontend/src/shared/widgets/charts.ts` must export all clean names AND the legacy names:
     ```typescript
     export {
       renderLineChart,
       renderLineChart as createLineChart,
       renderLineChart as t,
       renderColumnBarChart,
       renderColumnBarChart as createDonutChart,
       renderColumnBarChart as n,
       renderDonutRingMeter,
       renderDonutRingMeter as createRingMeter,
       renderDonutRingMeter as r,
       renderRadialGaugeMeter,
       renderRadialGaugeMeter as createHorizontalBarChart,
       renderRadialGaugeMeter as a,
       renderSparklineSvg,
       renderSparklineSvg as createSparkline,
       renderSparklineSvg as s,
       renderGroupedBarChart,
       renderGroupedBarChart as createBarChart,
       renderGroupedBarChart as o,
       renderFanMeter,
       renderFanMeter as createFanMeter,
       renderFanMeter as i,
     };
     ```
   - This ensures zero breakage for `products.ts`, `dashboard.ts`, `customers.ts`, and `analytics.ts`.

2. **`analytics.ts` Router Contract**:
   - `page.title(params)` MUST continue to return `'Reports'`, `'Sales'`, or `'Stock health'` so that the router produces `<Subtab> · Vels` (with `\u00B7`).
   - `page.mount(container)` MUST set up `<div data-sub="overview" hidden></div>`, `<div data-sub="sales" hidden></div>`, and `<div data-sub="stock" hidden></div>`.
   - Store slice subscriptions (`orders`, `history`, `products`, `batches`, `counts`, `moves`, `settings`) must invalidate cache and refresh active views without leaking listeners.

---

## 5. Verification Method

To verify the refactored code after the Worker implements Milestone 2:

```powershell
cd "e:\dashborad clone\frontend"

# 1. Typecheck: Verify 0 compilation errors
npm run typecheck

# 2. Build: Verify successful production bundle creation
npm run build

# 3. Test: Run full Playwright test suite (all 47 tests)
npx playwright test

# 4. Targeted Verification: Run analytics and navigation spec
npx playwright test tests/state-nav-stress.spec.js -g "SN-01|SN-02"
npx playwright test tests/vessa.spec.js -g "Navigation"
```

### Invalidation Conditions
- Any removal of legacy export names (`createDonutChart`, `createHorizontalBarChart`, `createRingMeter`, etc.) from `src/shared/widgets/charts.ts`.
- Altering the document title mappings in `analytics.ts` (`Reports`, `Sales`, `Stock health`).
- Modifying the Catmull-Rom clamping algorithm in `buildCatmullRomPath` which would distort curve rendering.
- Omitting the `\u00B7` middle dot format or modifying `data-sub` / `data-k` attributes expected by DOM queries and tests.
