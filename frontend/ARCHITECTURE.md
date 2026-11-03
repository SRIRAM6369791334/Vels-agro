# 🏛️ Architecture & System Design — Vessa Frontend

## 1. Architectural Philosophy

Vessa Frontend is built on **Pure Vanilla TypeScript with a Feature-First Clean Architecture**, avoiding the overhead of heavy component frameworks while maintaining enterprise-level separation of concerns, strict type contracts, and predictable data flow.

```
+-------------------------------------------------------------+
|                      Browser / DOM                          |
+-------------------------------------------------------------+
                              ▲
                              │
+-----------------------------┴-------------------------------+
|                    Application Shell (main.ts)              |
|  - Micro-Router (Hash based, async dynamic chunk loading)   |
|  - Layout Frame: Topbar, Sidebar Rail, Global Scrim/Layer   |
+-------------------------------------------------------------+
                              ▲
       ┌──────────────────────┼──────────────────────┐
       │                      │                      │
+──────┴────────+     +───────┴───────+     +────────┴────────+
|   Features    |     |   Shared UI   |     |   Core Engine   |
|  (9 Modules)  |     |  (Overlays &  |     |  (Store, Motion,|
|               |     |    Widgets)   |     |     Events)     |
+---------------+     +---------------+     +-----------------+
       ▲                      ▲                      ▲
       └──────────────────────┼──────────────────────┘
                              │
+-----------------------------┴-------------------------------+
|                  Domain Models & Schemas                    |
|             (types/product, order, warehouse...)            |
+-------------------------------------------------------------+
```

---

## 2. Directory Layout & Layer Boundaries

```
src/
├── core/                       # LAYER 1: Core Framework Infrastructure
│   └── motion.ts               # GSAP engine wrapper, Flip orchestrator, reduced-motion
│
├── data/                       # LAYER 2: Domain Constants & Seed Data
│   └── constants.ts            # Immutable enums, tones, stage arrays, timings
│
├── types/                      # LAYER 3: Strict Domain Contracts (Zero runtime overhead)
│   ├── product.ts              # Product, Material, Category, Stock definitions
│   ├── batch.ts                # Batch, QA release status, expiry models
│   ├── order.ts                # SalesOrder, OrderLine, ReturnOrder models
│   ├── purchasing.ts           # PurchaseOrder, Supplier, PoLine models
│   ├── warehouse.ts            # Location, StockMovement, Transfer, CycleCount
│   ├── customer.ts             # Customer, Stockist, Shopper models
│   ├── user.ts                 # TeamMember, Role, Permission models
│   ├── store.ts                # Root AppState, Settings, Notice models
│   └── index.ts                # Barrel export
│
├── shared/widgets/             # LAYER 4: Shared Visual Widgets (Flutter-style)
│   └── charts.ts               # SVG/Canvas charts (Line, Bar, Donut, Fan, Sparkline)
│
├── ui/                         # LAYER 5: Global Interactive Overlays
│   ├── toast.ts                # Notification toast service
│   ├── modal.ts                # HTML5 dialog modal & confirmDialog helper
│   ├── drawer.ts               # Slide-out details drawer
│   └── index.ts                # Barrel export
│
├── utils/                      # LAYER 6: Pure Functional Utilities
│   ├── dom.ts                  # $, $$, qs, escapeHtml, createCustomElement
│   ├── formatters.ts           # Currency, percentage, relative day/time, pluralize
│   ├── icons.ts                # SVG icon catalog & renderers
│   ├── csv.ts                  # CSV serialization & browser file downloads
│   └── index.ts                # Barrel export
│
├── features/                   # LAYER 7: Feature-First Domain Modules (Flutter standard)
│   ├── dashboard/              (dashboard.ts, dashboard.css)
│   ├── products/               (products.ts, products.css)
│   ├── orders/                 (orders.ts, orders.css)
│   ├── purchasing/             (purchasing.ts, purchasing.css)
│   ├── warehouses/             (warehouses.ts, warehouses.css)
│   ├── analytics/              (analytics.ts, analytics.css)
│   ├── customers/              (customers.ts, customers.css)
│   ├── settings/               (settings.ts, settings.css)
│   └── help/                   (help.ts, help.css)
│
├── main.css                    # Design tokens, themes, global layout
└── main.ts                     # App Bootstrapper, Central Reactive Store, Router
```

---

## 3. Micro-Router & Feature Lifecycle Contract

The router operates on URI hash changes (`window.location.hash`) and adheres to an asynchronous chunk-loading contract. Every feature module inside `features/` exports an object conforming to the `PageController` interface:

```typescript
export interface RouteParams {
  name: string;
  params: string[];
  same?: boolean;
}

export interface PageController {
  mount(container: HTMLElement): void | Promise<void>;
  enter(context: { params: string[]; same: boolean }): void | Promise<void>;
  leave?(): void;
}
```

### Lifecycle Progression:
1. **Resolution**: `hashchange` event fires (e.g. `#/orders/board`).
2. **Chunk Loading**: Dynamic import loads the target feature chunk:
   ```typescript
   const loaders = {
     orders: () => import('./features/orders/orders.ts'),
     // ...
   };
   ```
3. **Mount Pass**: If the feature has not been mounted in the current session, its `mount(container)` method initializes DOM scaffolding and event listeners.
4. **Enter Pass**: `enter({ params, same })` handles subtabs, filters, and parameter updates (e.g. `params[0] === 'board'`).
5. **Leave Pass**: If navigating away, `leave()` cleans up timers, ticker callbacks, and active overlays.

---

## 4. Reactive State Management & Persistence

The application employs an **Event-Driven Central Reactive Store**:
- **Store Shape**: `AppState` defined in `src/types/store.ts`.
- **Single Source of Truth**: State lives in `store` within `src/main.ts`.
- **Subscriber Notifications**: Components and views subscribe via store notification keys (`products`, `orders`, `batches`, `settings`, etc.).
- **Debounced LocalStorage Sync**:
  ```typescript
  export function notifyStoreSubscribers(...channels: string[]): void {
    // 1. Debounce state persistence to localStorage
    // 2. Notify all active listeners registered for each channel
    // 3. Dispatch targeted updates to active DOM views
  }
  ```

---

## 5. Motion & Accessibility Design System

- **Motion Engine**: GSAP (GreenSock Animation Platform) and Flip plugin orchestrate all dynamic layout animations.
- **Hardware Acceleration**: Transitions animate solely `transform` and `opacity` properties to prevent DOM layout thrashing.
- **Accessibility Gate**: All animations honor the user's OS-level accessibility setting:
  ```typescript
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  export function motionDuration(duration: number): number {
    return prefersReducedMotion.matches ? 0 : duration;
  }
  ```
- When reduced motion is active, duration collapses to `0`, ensuring instant DOM state changes without visual disorientations.

---

## 6. Dependency Rules & Clean Architecture Constraints

1. **Unidirectional Dependency**: Outer layers (`features/`, `ui/`) may depend on inner layers (`types/`, `data/`, `utils/`, `core/`), but inner layers MUST NEVER import from outer layers.
2. **Framework Freedom**: No React, Vue, or Angular dependencies in core presentation. All components must execute natively in modern evergreen browsers.
3. **Type Safety**: Strictly zero `any` types in `src/types/`. All entity mutations must pass through typed store actions.
