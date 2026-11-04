# Project: Vels Agro Machinery & Equipment Admin Panel Refactoring

## Architecture
- **Framework**: Vanilla TypeScript SPA bundled with Vite and animated with GSAP.
- **Routing**: Client-side hash routing (`#/module/subtab`) with subtab history and document title formatting `<Subtab> · Vels`.
- **State Management**: Reactive centralized store (`store` / `subscribeToStore`) with slice-level subscription listeners and debounced 250ms localStorage persistence.
- **Visuals & Charts**: Pure SVG and HTML custom data visualization widgets (`charts.ts`) with mathematical curve generation (Catmull-Rom splines, nice scale ticks) and GSAP tweens.
- **Component Lifecycle**: Standardized feature page lifecycle (`FeaturePage`: `{ title(params), mount(container), enter({ params, same }), leave() }`).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Hash Router & Navigation | Client-side hash routing (`#/`), deep-linking, browser history (back/forward), title formatting `<Subtab> · Vels` | M1 | Survey (explorer 1 & 3) |
| 2 | Reactive Store & Persistence | Central state store with slice event subscriptions (`subscribeToStore`) and 250ms debounced persistence | M1 | Survey (explorer 1 & 2) |
| 3 | Core Motion & Overlay UI | GSAP tween helpers, tooltips, dropdown menus, modals, command palette `#finder`, `.scrim` backdrop, unmounting `#bell-badge` | M1 | Survey (explorer 1) |
| 4 | Semantic Domain Types | Complete TypeScript interfaces in `src/types/` (`Product`, `Batch`, `Order`, `Material`, `Warehouse`, `Customer`, etc.) with missing runtime fields restored | M1 | Survey (explorer 1, 2, 3) |
| 5 | Visualization Engine (`charts.ts`) | 7 decoupled pure SVG widgets (`renderLineChart`, `renderDonutRingMeter`, `renderColumnBarChart`, `renderRadialGaugeMeter`, `renderSparklineSvg`, `renderGroupedBarChart`, `renderFanMeter`) | M2 | Survey (explorer 3) |
| 6 | Analytics Module (`analytics.ts`) | Multi-subtab analytics (`overview`, `sales`, `stock`), daily statistics caching engine, velocity weighting, multi-chart rendering | M2 | Survey (explorer 3) |
| 7 | Customers Module (`customers.ts`) | Customer directory (`stockists`, `shoppers`), RFM lifetime value metrics, grid/list view toggles, customer profile drawer | M2 | Survey (explorer 3) |
| 8 | Settings Module (`settings.ts`) | Account, company, team management with seat limit validation, billing, notification toggles, theme/accent customizer | M2 | Survey (explorer 3) |
| 9 | Help Module (`help.ts`) | FAQ categories, searchable knowledge base articles with query highlighting, interactive support ticket creation | M2 | Survey (explorer 3) |
| 10 | Dashboard Module (`dashboard.ts`) | Executive KPI summary cards, animated counters, sales vs targets, low stock alerts, quick dispatch modals | M3 | Survey (explorer 2) |
| 11 | Products Module (`products.ts`) | Product catalog, batch tracking, formulation BOMs, inventory health, batch drawer, product creation/editing modal | M3 | Survey (explorer 2) |
| 12 | Orders Module (`orders.ts`) | Sales orders list, interactive kanban board, returns management, order detail inspection drawer, stage transitions | M3 | Survey (explorer 2) |
| 13 | Purchasing Module (`purchasing.ts`) | Purchase orders, vendor/supplier catalog, raw materials inventory, PO receiving workflow, supplier metrics | M3 | Survey (explorer 2) |
| 14 | Warehouses Module (`warehouses.ts`) | Warehouse locations, inter-facility stock transfers, cycle counts, capacity gauges, stock movement history | M3 | Survey (explorer 2) |
| 15 | Zero-Regression E2E Suite & Audit | 100% passing tests (47/47 Playwright specs), zero typecheck errors, clean Vite build, and clean forensic integrity audit | M4 | ORIGINAL_REQUEST |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Core Architecture, Router & Shared Shell | Refactor `main.ts`, extract `core/router.ts`, `core/store.ts`, `core/motion.ts`, `ui/popover.ts`, `ui/finder.ts`, unify domain types in `types/`, fix hash router, middle dot title, bell badge unmount, and scrim overlay | none | DONE |
| M2 | Visualization Engine & Auxiliary Modules | De-obfuscate and modularize `charts.ts`, `analytics.ts`, `customers.ts`, `settings.ts`, and `help.ts` into clean TypeScript modules with dedicated types | M1 | DONE |
| M3 | Core Transactional & Inventory Modules | De-obfuscate and modularize `dashboard.ts`, `products.ts`, `orders.ts`, `purchasing.ts`, and `warehouses.ts` into clean TypeScript modules with subtabs and components | M1, M2 | IN_PROGRESS |
| M4 | Final System Verification & Hardening | Full Playwright E2E suite verification (47/47 passing), typecheck verification across all files, bundle build, and forensic integrity audit | M1, M2, M3 | PLANNED |

## Code Layout
```
frontend/src/
├── core/
│   ├── router.ts          # Hash router, navigation, route lifecycles, title handling
│   ├── store.ts           # Central state store, slice subscriptions, persistence
│   ├── motion.ts          # GSAP animation primitives, counters, pulses
│   └── constants.ts       # Global categories, status mappings, seed constants
├── data/
│   ├── seed.ts            # Deterministic mock data generation (PRNG)
│   └── index.ts
├── types/
│   ├── product.ts         # Product, Batch, Formulation, BOM
│   ├── order.ts           # SalesOrder, OrderLine, OrderStage
│   ├── purchasing.ts      # PurchaseOrder, Supplier, Material
│   ├── warehouse.ts       # Location, Transfer, CycleCount, StockMovement
│   ├── customer.ts        # Customer, CustomerType, RFM
│   ├── settings.ts        # AppSettings, Company, Team, Billing
│   ├── analytics.ts       # DailyStats, MetricSummary, ChartRange
│   ├── common.ts          # Notification, SearchResult, FeaturePage
│   └── index.ts
├── ui/
│   ├── popover.ts         # Context menus, dropdowns, tooltip engine
│   ├── modal.ts           # Dialogs, prompt modals, transfer modals
│   ├── finder.ts          # Command palette search, scrim backdrop
│   ├── toast.ts           # Notification toasts, badge management
│   └── icons.ts           # SVG icon library
├── shared/
│   └── widgets/
│       ├── charts.ts      # Pure SVG visualization components
│       └── formatting.ts  # Currency, date, compact numbers, escaping
├── features/
│   ├── dashboard/
│   │   ├── dashboard.ts
│   │   ├── components/
│   │   └── subtabs/
│   ├── products/
│   │   ├── products.ts
│   │   ├── components/
│   │   └── subtabs/
│   ├── orders/
│   │   ├── orders.ts
│   │   ├── components/
│   │   └── subtabs/
│   ├── purchasing/
│   │   ├── purchasing.ts
│   │   ├── components/
│   │   └── subtabs/
│   ├── warehouses/
│   │   ├── warehouses.ts
│   │   ├── components/
│   │   └── subtabs/
│   ├── analytics/
│   │   ├── analytics.ts
│   │   └── subtabs/
│   ├── customers/
│   │   ├── customers.ts
│   │   └── subtabs/
│   ├── settings/
│   │   ├── settings.ts
│   │   └── subtabs/
│   └── help/
│       ├── help.ts
│       └── subtabs/
└── main.ts                # Application bootstrapper and clean backward-compatible barrel exports
```

## Interface Contracts
### Shell ↔ Feature Modules
Every feature module exports:
```typescript
export interface FeaturePage {
  title: (params?: string[]) => string;
  mount: (container: HTMLElement) => void;
  enter: (context: { params: string[]; same?: boolean }) => void;
  leave: () => void;
}
export const page: FeaturePage;
```

### Store ↔ Feature Modules
```typescript
export function subscribeToStore(sliceKey: string, callback: () => void): () => void;
export function getStore(): StoreState;
export function setStore(mutator: (state: StoreState) => void): void;
```
*Note*: `main.ts` maintains backward compatibility alias `findLocationById` mapping to `subscribeToStore` until all modules are updated.

### Motion & UI Primitives
```typescript
export function animateCounter(element: HTMLElement, target: number, formatter?: (val: number) => string): void;
export function animatePulse(element: HTMLElement): void;
export function morphReplace(container: HTMLElement, updateDom: () => void): void;
export function initTooltips(root: HTMLElement): void;
export function playHaptic(button: HTMLElement): void;
export function openPromptDialog(config: PromptDialogConfig): void;
export function openDropdownMenu(anchor: HTMLElement, items: MenuItem[]): void;
```

### Charts Widget API
```typescript
export function renderLineChart(container: HTMLElement, data: LineChartSeries[], options?: ChartOptions): ChartInstance;
export function renderDonutRingMeter(container: HTMLElement, value: number, total: number, options?: DonutOptions): ChartInstance;
export function renderColumnBarChart(container: HTMLElement, categories: string[], values: number[]): ChartInstance;
export function renderRadialGaugeMeter(container: HTMLElement, percent: number): ChartInstance;
export function renderSparklineSvg(values: number[], width?: number, height?: number): SVGElement;
export function renderGroupedBarChart(container: HTMLElement, data: GroupedBarData): ChartInstance;
export function renderFanMeter(container: HTMLElement, value: number, max: number): ChartInstance;
```
