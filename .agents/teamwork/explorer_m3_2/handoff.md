# Architectural Exploration & Modularization Blueprint: Orders & Purchasing Modules (Milestone 3)

## 1. Observation

### 1.1 Existing Codebase & Target File Locations
A forensic scan was performed across `frontend/src/` and `frontend/tests/`:
1. **Target Feature Monoliths**:
   - `frontend/src/features/orders/orders.ts`: 1,829 lines, 59,410 bytes. Contains all sales orders tables, interactive Kanban drag-and-drop board, returns workflow, and order/return inspection drawers in a single monolithic file.
   - `frontend/src/features/orders/orders.css`: 22,250 bytes. Contains complete styling for order badges, cards, Kanban columns (`.ob-col`, `.ob-card`), return lists (`.rt-row`, `.rt-rate`), and drawers.
   - `frontend/src/features/purchasing/purchasing.ts`: 1,474 lines, 55,258 bytes. Contains purchase orders list, supplier catalog, raw materials inventory table, PO receiving workflow, and 3 inspection drawers in a single monolithic file.
   - `frontend/src/features/purchasing/purchasing.css`: 14,099 bytes. Contains complete styling for PO cards (`.pu-po`), supplier cards (`.pu-sup`), rings (`.pu-ring`), materials table (`.pu-mtable`), and drawers.
2. **Dynamic Route Registration**:
   - In `frontend/src/main.ts:4453-4454`:
     ```typescript
     orders: () => import(`./features/orders/orders.ts`),
     purchasing: () => import(`./features/purchasing/purchasing.ts`),
     ```
   - In `frontend/src/core/router.ts:30-45`:
     ```typescript
     orders: {
       label: 'Orders',
       icon: 'orders',
       subs: [
         ['all', 'All orders'],
         ['board', 'Order board'],
         ['returns', 'Returns'],
       ],
     },
     purchasing: {
       label: 'Purchasing',
       icon: 'purchasing',
       subs: [
         ['orders', 'Purchase orders'],
         ['suppliers', 'Suppliers'],
         ['materials', 'Materials'],
       ],
     },
     ```
3. **Test Suite Invariants & Oracles**:
   - `frontend/tests/state-nav-stress.spec.js:8`:
     `{ hash: '#/orders/board', expectedTitle: 'Order board \u00B7 Vels', selector: 'text=Pick' }`
     *Critical Invariant*: The board header must contain the exact string `"Pick"`, sourced from line 807: `<p class="head__eyebrow">Pick, pack and ship — drag a card to move it on</p>`.
   - `frontend/tests/state-nav-stress.spec.js:9`:
     `{ hash: '#/purchasing/orders', expectedTitle: 'Purchase orders \u00B7 Vels', selector: 'text=Purchase orders' }`.
   - `frontend/tests/adversarial_final_stress.spec.js:80-81`: QuickCreate transitions navigate to `#/orders/all` and `#/purchasing/orders`.
   - `frontend/tests/adversarial_overlays.spec.js:306-310`: Command Palette `#finder-q` search for `"Orders"` navigates to `/#/orders`.

---

### 1.2 The PO Mutation Inversion & Obfuscation Trap
Direct inspection of `frontend/src/main.ts:3608-3666` and `main.ts:5573-5608` revealed a deliberate name-swapping permutation:
- `main.ts:3608`: `function ou(e)` sets `t.status = 'sent'`, records `t.sentAt = Date.now()`, and toasts `"${t.number} sent to ${n.contact}"`. This function **sends the purchase order**.
- `main.ts:3624`: `function su(e, t = false)` iterates `n.lines`, increments `e.received`, increments `o.onHand`, logs `moves` of kind `'receipt'`, and toasts `"${n.number} received"`. This function **receives the purchase order**.
- `main.ts:3658`: `function cu(e)` sets `t.status = 'cancelled'`, logs activity, and toasts `"${t.number} cancelled"`. This function **cancels the purchase order**.

However, in `main.ts:5573-5608`:
```typescript
const receivePo = cu; // cu is cancel!
const cancelPo = ou;  // ou is send!
const sendPo = su;    // su is receive!
```
Consequently, in `frontend/src/features/purchasing/purchasing.ts:208-241`:
```typescript
function Ve(act, materialId, n) {
  if (act === `send`) {
    cancelPo(materialId); // calls ou -> sends!
  } else if (act === `recv` || act === `half`) {
    He(materialId, act === `half`, n); // inside He: calls sendPo -> which is su -> receives!
  } else if (act === `cancel`) {
    receivePo(materialId); // calls cu -> cancels!
  }
}
```
**Impact**: If a developer re-wires `sendPo` or `receivePo` without understanding this triple-inversion, order intake will cancel POs and cancel actions will intake inventory!

---

### 1.3 Complete Inventory of Legacy Obfuscated Aliases

#### In `frontend/src/features/orders/orders.ts`
| Obfuscated Alias in `orders.ts` | Underlying Identifier in `main.ts` | Genuine Semantic Operation | Canonical Target Module |
|---|---|---|---|
| `findLocationById(slice, cb)` (lines 1790, 1801, 1808) | `ms(e, t)` (line 2108) | State store slice event subscription | `core/store.ts` (`subscribeToStore`) |
| `exportDataBackup(r.locId)` (line 177) | `bs(id)` (line 2110) | Warehouse location lookup by ID | `core/store.ts` (`findLocationById`) |
| `getAvailableLocations(el, val, fmt, opts)` (lines 880, 884, 1580) | `ho(...)` (line 194) | GSAP animated numeric counter | `core/motion.ts` (`animateCounter`) |
| `getAvailableSuppliers(el)` (lines 134, 687, 889, 1531) | `fo(el)` (line 166) | GSAP amber flash / pulse feedback | `core/motion.ts` (`flashElement` / `animatePulse`) |
| `openNewTransferModal(el)` (lines 325, 573, 643, 844, 1478) | `go(el)` (line 221) | GSAP button micro-haptic click scale | `core/motion.ts` (`playHaptic`) |
| `openMoveStockModal(el)` (lines 564, 836) | `_o(el)` (line 226) | Pointer magnet tracking listener | `core/motion.ts` (`bindMagnetic`) |
| `bindModalDismiss(el, updateDom)` (lines 406, 728, 869, 1568) | `fl(e, t)` (line 2948) | FLIP layout transition on DOM change | `core/motion.ts` (`morphReplace`) |
| `createCustomElement(anchor, items, opts)` (line 586) | `Jc(e, t, n)` (line 2636) | Context dropdown menu popover | `ui/popover.ts` (`openDropdownMenu`) |
| `renderFilterBar(el, val)` (line 133) | `Bc(e, t)` (line 2447) | Updates `dataset.count` and animates counter | `core/motion.ts` (`animateCounter`) |
| `getMaterialInventoryValue()` (line 506) | `Zs()` (line 2191) | Month-to-date sales revenue sum | `features/orders/services/order-metrics.ts` (`getMonthToDateRevenue`) |
| `findBatchByLotNumber(order)` (lines 234, 457, 487, 801) | `Ks(order)` (line 2182) | Sum of all unit quantities in an order | `features/orders/services/order-metrics.ts` (`getOrderTotalUnits`) |
| `renderStockStatusBadge(text, msg)` (line 347) | `ml(text, msg)` (line 2984) | Async clipboard copy with toast | `utils/clipboard.ts` or `utils/dom.ts` (`copyToClipboard`) |
| `bindMagnetic()` zero-arg check (line 359) | `$a()` (line 10) | Media query check `prefers-reduced-motion` | `core/motion.ts` (`prefersReducedMotion.matches`) |
| `getPendingReturnsCount(actorId)` (line 195) | `Ds(id)` (line 2148) | Resolves user or customer display name | `features/orders/services/order-metrics.ts` (`getActorDisplayName`) |

#### In `frontend/src/features/purchasing/purchasing.ts`
| Obfuscated Alias in `purchasing.ts` | Underlying Identifier in `main.ts` | Genuine Semantic Operation | Canonical Target Module |
|---|---|---|---|
| `findLocationById(slice, cb)` (lines 1425, 1437, 1445) | `ms(e, t)` (line 2108) | State store slice event subscription | `core/store.ts` (`subscribeToStore`) |
| `getAvailableLocations(...)` (line 1052) | `ho(...)` (line 194) | GSAP animated numeric counter | `core/motion.ts` (`animateCounter`) |
| `getAvailableSuppliers(...)` (lines 104, 251) | `fo(el)` (line 166) | GSAP amber flash / pulse feedback | `core/motion.ts` (`flashElement` / `animatePulse`) |
| `openNewTransferModal(...)` (8 occurrences) | `go(el)` (line 221) | GSAP button micro-haptic click scale | `core/motion.ts` (`playHaptic`) |
| `openMoveStockModal(...)` (lines 591, 996, 1260) | `_o(el)` (line 226) | Pointer magnet tracking listener | `core/motion.ts` (`bindMagnetic`) |
| `bindModalDismiss(...)` (lines 559, 977, 1250) | `fl(e, t)` (line 2948) | FLIP layout transition on DOM change | `core/motion.ts` (`morphReplace`) |
| `createCustomElement(...)` (line 628) | `Jc(e, t, n)` (line 2636) | Context dropdown menu popover | `ui/popover.ts` (`openDropdownMenu`) |
| `findCustomerByEmail(materialId)` (lines 256, 1096, 1196, 1344) | `zs(materialId)` (line 2167) | Calculates open units on order across sent/partial POs | `features/purchasing/services/purchasing-metrics.ts` (`getMaterialOnOrder`) |
| `getCustomerOrdersCount()` (lines 1144, 1214) | `Hs()` (line 2178) | Calculates total raw materials valuation | `features/purchasing/services/purchasing-metrics.ts` (`getTotalMaterialsValue`) |
| `renderRating(supplierName)` (line 74) | `Dc(name)` (line 2387) | Generates 2-letter uppercase initials monogram | `utils/formatters.ts` (`formatMonogram` / `getInitials`) |
| `animateMagneticElement(el, text)` (line 249) | `po(el, text)` (line 174) | Spawns floating feedback element `.float-up` | `core/motion.ts` (`animateFloatBadge`) |
| `TRANSFER_STATUS_NAMES[po.status]` (lines 412, 492, 495, 1104, 1379) | `Qo[status]` | Color tone lookup for PO status pills | `core/constants.ts` (`PO_STATUS_TONES[status]`) |
| `cancelPo`, `sendPo`, `receivePo` (lines 209-241) | `ou`, `su`, `cu` | Swapped mutations (ou=send, su=receive, cu=cancel) | `features/purchasing/services/po-actions.ts` |

---

## 2. Logic Chain

1. **Alignment with Milestone 1 & 2 Foundations**: Milestone 1 established `core/router.ts`, `core/store.ts`, `core/motion.ts`, `ui/`, and unified domain types in `types/`. Milestone 2 successfully extracted `charts`, `analytics`, `customers`, `settings`, and `help` with 0 legacy aliases and 79/79 passing tests.
2. **Deconstruction of Orders**:
   - `orders.ts` (1,829 lines) contains 3 distinct subtabs (`all`, `board`, `returns`) and 2 inspection drawers (`order`, `return`).
   - Slicing `orders.ts` into subtab modules (`subtabs/all.ts`, `subtabs/board.ts`, `subtabs/returns.ts`), component drawers (`components/order-drawer.ts`, `components/return-drawer.ts`), and metric calculators (`services/order-metrics.ts`) reduces individual file lengths to 150-400 lines, ensuring clean readability and zero context saturation.
3. **Deconstruction of Purchasing**:
   - `purchasing.ts` (1,474 lines) contains 3 distinct subtabs (`orders`, `suppliers`, `materials`) and 3 inspection drawers (`po`, `supplier`, `material`).
   - Slicing `purchasing.ts` into subtab modules (`subtabs/orders.ts`, `subtabs/suppliers.ts`, `subtabs/materials.ts`), component drawers (`components/po-drawer.ts`, `components/supplier-drawer.ts`, `components/material-drawer.ts`), and calculators (`services/purchasing-metrics.ts`) creates a symmetrical, decoupled structure.
4. **Resolution of the Swapped PO Mutation Trap**:
   - Creating canonical functions `sendPurchaseOrder`, `receivePurchaseOrder`, and `cancelPurchaseOrder` in `features/purchasing/services/po-actions.ts` (or cleanly re-exported from `main.ts`) ensures that UI events map 1:1 to their real actions.
   - Preserving backward-compatibility re-exports in `main.ts` ensures that legacy aliases (`receivePo`, `cancelPo`, `sendPo`) and minified identifiers (`o`, `w`, `y`) remain stable if referenced elsewhere.
5. **Addition of `animateFloatBadge`**:
   - `animateMagneticElement` in `purchasing.ts` relied on `po(el, text)` in `main.ts:174`. Adding `animateFloatBadge(element: HTMLElement | null, text: string): void` to `core/motion.ts` brings this primitive into the canonical motion library.

---

## 3. Extraction & Modularization Blueprint

### 3.1 Code Architecture Layout
```
frontend/src/
├── core/
│   └── motion.ts                  # Add animateFloatBadge(element, text)
├── utils/
│   ├── formatters.ts              # Add formatMonogram(name: string): string
│   └── dom.ts                     # Add copyToClipboard(text: string, label?: string): Promise<void>
├── features/
│   ├── orders/
│   │   ├── orders.ts              # Page entry: FeaturePage, lifecycle, subtab routing & subscriptions
│   │   ├── orders.css             # Preserved styling
│   │   ├── components/
│   │   │   ├── order-drawer.ts    # Order inspection drawer, timeline, payment toggle, tracking
│   │   │   └── return-drawer.ts   # Return order inspection drawer, RMA actions, restock/refund
│   │   ├── subtabs/
│   │   │   ├── all.ts             # All orders list, filter toolbar, pagination, animated table
│   │   │   ├── board.ts           # Interactive Kanban board, drag & drop physics, keyboard controls
│   │   │   └── returns.ts         # Returns management list, 90-day return rate meter, reason distribution
│   │   └── services/
│   │       └── order-metrics.ts   # Pure functions: getOrderTotal, getOrderTotalUnits, getMonthToDateRevenue
│   └── purchasing/
│       ├── purchasing.ts          # Page entry: FeaturePage, lifecycle, subtab routing & subscriptions
│       ├── purchasing.css         # Preserved styling
│       ├── components/
│       │   ├── po-drawer.ts       # Purchase order inspection drawer, line intake, supplier card, timeline
│       │   ├── supplier-drawer.ts # Supplier profile drawer, on-time ring, supplied materials, PO history
│       │   └── material-drawer.ts # Raw material drawer, stock meter, BOM formula usage links
│       ├── subtabs/
│       │   ├── orders.ts          # PO list, status chips, progress steps, search, intake triggers
│       │   ├── suppliers.ts       # Supplier catalog grid, on-time SVG rings, lead time, ratings
│       │   └── materials.ts       # Materials inventory table, kind filters, low stock alerts, quick reorder
│       └── services/
│           ├── purchasing-metrics.ts # Pure functions: getMaterialOnOrder, getTotalMaterialsValue
│           └── po-actions.ts      # Canonical PO lifecycle actions: send, receive, cancel
```

---

### 3.2 Orders Module Blueprint Details

#### File 1: `frontend/src/features/orders/services/order-metrics.ts`
- **Dependencies**: `core/store.ts`, `core/constants.ts`, `types/order.ts`.
- **Exports**:
  ```typescript
  export function getOrderTotal(order: SalesOrder): number;
  export function getOrderTotalUnits(order: SalesOrder): number;
  export function isOrderActive(order: SalesOrder): boolean;
  export function isOrderLate(order: SalesOrder): boolean;
  export function formatRelativeShipDay(shipBy: number): string;
  export function getMonthToDateRevenue(): number;
  export function getActorDisplayName(actorId: string): string;
  export function calculateOrderStatsSummary(orders: SalesOrder[]): OrderStatsSummary;
  export function calculateReturnRateSummary(returns: ReturnOrder[], orders: SalesOrder[]): ReturnRateSummary;
  ```

#### File 2: `frontend/src/features/orders/components/order-drawer.ts`
- **Dependencies**: `core/store.ts`, `core/motion.ts`, `core/constants.ts`, `ui/drawer.ts`, `ui/toast.ts`, `utils/`, `./services/order-metrics.ts`.
- **Exports**:
  ```typescript
  export function openOrderDrawer(orderId: string, currentSubtab: string): void;
  export function refreshOrderDrawer(): void;
  export function closeActiveOrderDrawer(): void;
  export function isOrderDrawerOpenFor(id: string): boolean;
  export function renderOrderDrawerHtml(order: SalesOrder): string;
  export function animateOrderStepProgress(drawerEl: HTMLElement, fromIndex: number, toIndex: number, delay?: number): void;
  ```

#### File 3: `frontend/src/features/orders/components/return-drawer.ts`
- **Dependencies**: `core/store.ts`, `core/motion.ts`, `core/constants.ts`, `ui/drawer.ts`, `ui/toast.ts`, `utils/`.
- **Exports**:
  ```typescript
  export function openReturnDrawer(returnId: string): void;
  export function refreshReturnDrawer(): void;
  export function renderReturnDrawerHtml(ret: ReturnOrder): string;
  ```

#### File 4: `frontend/src/features/orders/subtabs/all.ts`
- **Dependencies**: `core/store.ts`, `core/motion.ts`, `core/constants.ts`, `ui/popover.ts`, `utils/`, `../services/order-metrics.ts`, `../components/order-drawer.ts`.
- **Exports**:
  ```typescript
  export function mountAllOrdersSubtab(container: HTMLElement): void;
  export function renderAllOrdersTable(animate?: boolean): void;
  export function animateAllOrdersEnter(): void;
  export function updateAllOrdersKpiStats(): void;
  ```

#### File 5: `frontend/src/features/orders/subtabs/board.ts`
- **Dependencies**: `core/store.ts`, `core/motion.ts`, `core/constants.ts`, `utils/`, `../services/order-metrics.ts`, `../components/order-drawer.ts`.
- **Key Test Oracle Requirements**:
  - Preserve exact header markup: `<p class="head__eyebrow">Pick, pack and ship — drag a card to move it on</p>`.
  - Provide full pointer drag physics with ghost card clones, lane collision hit-testing, and spring settle animations (`back.out(1.5)`).
  - Provide keyboard accessibility: `Enter` opens drawer, `ArrowRight`/`ArrowLeft` triggers `advanceOrderStatus`.
- **Exports**:
  ```typescript
  export function mountBoardSubtab(container: HTMLElement): void;
  export function renderBoardLanes(animate?: boolean): void;
  export function animateBoardEnter(): void;
  export function cleanupBoardDragDrop(): void;
  ```

#### File 6: `frontend/src/features/orders/subtabs/returns.ts`
- **Dependencies**: `core/store.ts`, `core/motion.ts`, `core/constants.ts`, `utils/`, `../services/order-metrics.ts`, `../components/return-drawer.ts`.
- **Exports**:
  ```typescript
  export function mountReturnsSubtab(container: HTMLElement): void;
  export function renderReturnsList(animate?: boolean): void;
  export function animateReturnsEnter(): void;
  export function updateReturnsKpiStats(): void;
  ```

#### File 7: `frontend/src/features/orders/orders.ts` (Entry Point)
- **Signature**:
  ```typescript
  import type { FeaturePage } from '../../types/common';
  export const page: FeaturePage;
  ```
- **Lifecycle Implementation**:
  - `title(params)`: Slices parameter: `board` -> `Order board`, `returns` -> `Returns`, `params[1]` -> `Order ${order.number}`, default -> `All orders`.
  - `mount(container)`: Appends subtab wrappers `<div data-sub="all" hidden></div><div data-sub="board" hidden></div><div data-sub="returns" hidden></div>`. Subscribes to slices `'orders'`, `'returns'`, `'customers'`.
  - `enter({ params, same })`: Activates subtab, mounts on demand, animates enter, opens order or return drawer if `params[1]` is given.
  - `leave()`: Calls `cleanupBoardDragDrop()` and closes drawer if open.

---

### 3.3 Purchasing Module Blueprint Details

#### File 1: `frontend/src/features/purchasing/services/purchasing-metrics.ts`
- **Dependencies**: `core/store.ts`, `core/constants.ts`, `types/purchasing.ts`.
- **Exports**:
  ```typescript
  export function getPoTotalCost(po: PurchaseOrder): number;
  export function getPoTotalUnits(po: PurchaseOrder): number;
  export function getPoReceivedUnits(po: PurchaseOrder): number;
  export function isPoLate(po: PurchaseOrder): boolean;
  export function getMaterialOnOrder(materialId: string): number;
  export function getTotalMaterialsValue(): number;
  export function formatEtaRelative(eta: number): string;
  export function calculateSupplierPerformanceSummary(suppliers: Supplier[]): SupplierPerformanceSummary;
  export function calculateMaterialLevelGauge(material: Material): { fill: number; tick: number };
  ```

#### File 2: `frontend/src/features/purchasing/services/po-actions.ts`
- **Dependencies**: `core/store.ts`, `ui/toast.ts`, `utils/formatters.ts`.
- **Exports**:
  ```typescript
  export function sendPurchaseOrder(poId: string): void;
  export function receivePurchaseOrder(poId: string, isHalf?: boolean, anchorEl?: HTMLElement): void;
  export function cancelPurchaseOrder(poId: string): void;
  export function reorderAllLowMaterials(): string[];
  export function toggleSupplierFavorite(supplierId: string, anchorEl?: HTMLElement): void;
  ```

#### File 3: `frontend/src/features/purchasing/components/po-drawer.ts`
- **Dependencies**: `core/store.ts`, `core/motion.ts`, `core/constants.ts`, `ui/drawer.ts`, `utils/`, `../services/purchasing-metrics.ts`, `../services/po-actions.ts`.
- **Exports**:
  ```typescript
  export function renderPoDrawerHtml(po: PurchaseOrder): string;
  ```

#### File 4: `frontend/src/features/purchasing/components/supplier-drawer.ts`
- **Dependencies**: `core/store.ts`, `core/motion.ts`, `core/constants.ts`, `ui/drawer.ts`, `utils/`, `../services/purchasing-metrics.ts`, `../services/po-actions.ts`.
- **Exports**:
  ```typescript
  export function renderSupplierDrawerHtml(supplier: Supplier): string;
  ```

#### File 5: `frontend/src/features/purchasing/components/material-drawer.ts`
- **Dependencies**: `core/store.ts`, `core/motion.ts`, `core/constants.ts`, `ui/drawer.ts`, `utils/`, `../services/purchasing-metrics.ts`.
- **Exports**:
  ```typescript
  export function renderMaterialDrawerHtml(material: Material): string;
  ```

#### File 6: `frontend/src/features/purchasing/subtabs/orders.ts`
- **Dependencies**: `core/store.ts`, `core/motion.ts`, `core/constants.ts`, `ui/popover.ts`, `utils/`, `../services/purchasing-metrics.ts`, `../services/po-actions.ts`.
- **Exports**:
  ```typescript
  export function mountOrdersSubtab(container: HTMLElement): void;
  export function renderOrdersList(animate?: boolean): void;
  export function animateOrdersEnter(): void;
  export function updateOrdersKpis(): void;
  ```

#### File 7: `frontend/src/features/purchasing/subtabs/suppliers.ts`
- **Dependencies**: `core/store.ts`, `core/motion.ts`, `core/constants.ts`, `utils/`, `../services/purchasing-metrics.ts`, `../services/po-actions.ts`.
- **Exports**:
  ```typescript
  export function mountSuppliersSubtab(container: HTMLElement): void;
  export function renderSuppliersList(animate?: boolean): void;
  export function animateSuppliersEnter(): void;
  export function updateSuppliersKpis(): void;
  ```

#### File 8: `frontend/src/features/purchasing/subtabs/materials.ts`
- **Dependencies**: `core/store.ts`, `core/motion.ts`, `core/constants.ts`, `utils/`, `../services/purchasing-metrics.ts`.
- **Exports**:
  ```typescript
  export function mountMaterialsSubtab(container: HTMLElement): void;
  export function renderMaterialsTable(animate?: boolean): void;
  export function animateMaterialsEnter(): void;
  export function updateMaterialsKpis(): void;
  ```

#### File 9: `frontend/src/features/purchasing/purchasing.ts` (Entry Point)
- **Signature**:
  ```typescript
  import type { FeaturePage } from '../../types/common';
  export const page: FeaturePage;
  ```
- **Lifecycle Implementation**:
  - `title(params)`: Slices parameter: `orders` -> `Purchase orders`, `suppliers` -> `Suppliers`, `materials` -> `Materials`, default -> `Purchasing`.
  - `mount(container)`: Appends subtab wrappers `<div data-sub="orders" hidden></div><div data-sub="suppliers" hidden></div><div data-sub="materials" hidden></div>`. Subscribes to slices `'pos'`, `'materials'`, `'suppliers'`.
  - `enter({ params, same })`: Activates subtab, mounts on demand, animates enter, opens PO, supplier, or material drawer if `params[1]` is given.
  - `leave()`: Closes drawer if open.

---

### 3.4 Shared Core Additions Required
1. **In `frontend/src/core/motion.ts`**:
   Add `animateFloatBadge`:
   ```typescript
   export function animateFloatBadge(element: HTMLElement | null, text: string): void {
     if (!element || prefersReducedMotion.matches) return;
     const rect = element.getBoundingClientRect();
     const badge = Object.assign(document.createElement('span'), {
       className: 'float-up',
       textContent: text,
     });
     badge.setAttribute('aria-hidden', 'true');
     Object.assign(badge.style, {
       left: `${rect.left + rect.width / 2}px`,
       top: `${rect.top}px`,
     });
     document.body.append(badge);
     gsap.fromTo(
       badge,
       { opacity: 0, y: 6, xPercent: -50, scale: 0.9 },
       {
         keyframes: [
           { opacity: 1, y: -12, scale: 1, duration: 0.35, ease: 'back.out(2)' },
           { opacity: 0, y: -40, duration: 0.8, ease: 'power2.in', delay: 0.6 },
         ],
         onComplete: () => badge.remove(),
       }
     );
   }
   ```
2. **In `frontend/src/utils/formatters.ts`**:
   Add `formatMonogram`:
   ```typescript
   export function formatMonogram(name: string): string {
     return name
       .replace(/[&]/g, ' ')
       .split(/\s+/)
       .filter(Boolean)
       .map((word) => word[0])
       .join('')
       .slice(0, 2)
       .toUpperCase();
   }
   ```
3. **In `frontend/src/utils/dom.ts`**:
   Add `copyToClipboard`:
   ```typescript
   export async function copyToClipboard(text: string, successMessage = 'Copied'): Promise<void> {
     try {
       await navigator.clipboard.writeText(text);
       showToast(`${successMessage} to clipboard`, { ico: 'copy' });
     } catch {
       showToast("Couldn't reach the clipboard — select and copy instead", { ico: 'copy' });
     }
   }
   ```

---

## 4. Caveats

1. **Modal Opener Ownership**:
   `openNewOrderModal` and `openNewPoModal` are currently implemented inside `frontend/src/main.ts` (lines 3421 and 3554) and rely on the global quick create dialog `$c` (`openQuickCreateModal`). The extracted subtabs will continue to invoke these dialogs via canonical re-exports from `main.ts` or `ui/modal.ts`, matching the pattern established in Milestone 2 for `openNewCustomerModal`.
2. **Backward-Compatibility Re-exports**:
   `main.ts` must maintain backward-compatible re-exports for any legacy minified aliases (`receivePo`, `cancelPo`, `sendPo`, `findLocationById`, `getAvailableLocations`) so unrefactored Milestone 3 modules (`dashboard.ts`, `products.ts`, `warehouses.ts`) continue to compile and function without regression during the transition.
3. **DOM Selector Sensitivity**:
   `state-nav-stress.spec.js:8` specifically asserts `selector: 'text=Pick'` when navigating to `#/orders/board`. The eyebrow text in `features/orders/subtabs/board.ts` must exactly preserve:
   `<p class="head__eyebrow">Pick, pack and ship — drag a card to move it on</p>`.

---

## 5. Conclusion

The investigation of Orders and Purchasing modules is complete. The exact functional boundaries, state reads/writes, motion helpers, and obfuscated aliases have been mapped. The critical PO mutation inversion trap (`cancelPo`/`sendPo`/`receivePo`) has been thoroughly diagnosed and safe de-obfuscation semantics have been formulated.

Both modules are ready for immediate modular extraction by the implementation worker, following the verified modular architecture established in Milestone 2.

---

## 6. Verification Method

To verify the extraction once implemented by the worker:
```bash
cd "E:\dashborad clone\frontend"

# 1. Typecheck: Must pass with 0 errors
npm run typecheck

# 2. Production Build: Must compile cleanly
npm run build

# 3. Targeted Route & Stress Validation
npx playwright test tests/state-nav-stress.spec.js -g "SN-01"
npx playwright test tests/state-nav-stress.spec.js -g "SN-02"
npx playwright test tests/vessa.spec.js
npx playwright test tests/adversarial_final_stress.spec.js

# 4. Complete Suite Verification: 79/79 passing
npx playwright test
```

### Invalidation Conditions:
- Any TypeScript diagnostic error during `npm run typecheck`.
- Any missing import or export error during `npm run build`.
- Failure of `state-nav-stress.spec.js` on `#/orders/board` (caused by missing `Pick` keyword) or `#/purchasing/orders`.
- Inverted PO action behavior where clicking "Send" cancels the PO or clicking "Cancel" receives it.
- Any lingering obfuscated alias (`findLocationById`, `getAvailableLocations`, `getAvailableSuppliers`, `openNewTransferModal`, `openMoveStockModal`, `getMaterialInventoryValue`, `findCustomerByEmail`, `getCustomerOrdersCount`) remaining in `frontend/src/features/orders/` or `frontend/src/features/purchasing/`.
