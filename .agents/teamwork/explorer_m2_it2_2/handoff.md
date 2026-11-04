# Milestone 2 Iteration 2: Legacy Alias Cleansing — Settings Module Investigation Report

- **Agent**: `explorer_m2_it2_2`
- **Role**: Explorer, Synthesizer
- **Working Directory**: `E:\dashborad clone\.agents\teamwork\explorer_m2_it2_2`
- **Target Scope**: `frontend/src/features/settings/` (all subtabs and components)

---

## 1. Observation

A systematic forensic scan of all files in `frontend/src/features/settings/` was conducted to map every lingering legacy alias imported from `src/main.ts`.

### 1.1 Affected Files in Settings Module
1. `frontend/src/features/settings/components/form-controls.ts`
2. `frontend/src/features/settings/settings.ts`
3. `frontend/src/features/settings/subtabs/account.ts`
4. `frontend/src/features/settings/subtabs/company.ts`
5. `frontend/src/features/settings/subtabs/team.ts`
6. `frontend/src/features/settings/subtabs/billing.ts`
7. `frontend/src/features/settings/subtabs/notifications.ts`

---

### 1.2 Direct Observations & Verbatim Quotations

#### 1. `getAvailableLocations` used for Animating Counters
In `frontend/src/main.ts:5511`:
```typescript
const getAvailableLocations = ho;
```
Where `ho` at line 194 is the GSAP numeric counter animator:
```typescript
function ho(e, t, n, { duration: r = 1.2, delay: i = 0, from: a } = {}) { ... }
```
In `src/core/motion.ts:17`:
```typescript
export function animateCounter(
  element: HTMLElement | null,
  target: number,
  formatter: (val: number) => string = (v) => String(Math.round(v)),
  options: { duration?: number; delay?: number; from?: number } = {}
): void
```
- **Occurrences in Settings**:
  - `frontend/src/features/settings/subtabs/team.ts:30` (import) & line 194:
    ```typescript
    getAvailableLocations(usedEl, used, formatInt, {
      from: animate ? 0 : undefined,
      duration: 1,
      delay: animate ? 0.4 : 0,
    });
    ```
  - `frontend/src/features/settings/subtabs/billing.ts:32` (import) & line 262:
    ```typescript
    getAvailableLocations(priceEl, getPlanPrice(plan, billing.cycle), formatMoneyRound, {
      from: animate ? 0 : undefined,
      duration: 1,
      delay: animate ? 0.35 : 0,
    });
    ```

#### 2. `openNewTransferModal` used for Button Haptic Feedback
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
- **Occurrences in Settings** (11 instances across 5 files):
  - `frontend/src/features/settings/subtabs/account.ts:29` (import) & lines 422, 431:
    - line 422: `openNewTransferModal(themeBtn);`
    - line 431: `openNewTransferModal(currentTarget);`
  - `frontend/src/features/settings/subtabs/company.ts:26` (import) & lines 323, 333:
    - line 323: `openNewTransferModal(exportBtn);`
    - line 333: `openNewTransferModal(resetBtn);`
  - `frontend/src/features/settings/subtabs/team.ts:23` (import) & lines 329, 344, 365, 372:
    - line 329: `openNewTransferModal(target);`
    - line 344: `openNewTransferModal(chip);`
    - line 365: `openNewTransferModal(removeBtn);`
    - line 372: `openNewTransferModal(resendBtn);`
  - `frontend/src/features/settings/subtabs/billing.ts:23` (import) & lines 636, 645:
    - line 636: `openNewTransferModal(target);`
    - line 645: `openNewTransferModal(switchBtn);`
  - `frontend/src/features/settings/subtabs/notifications.ts:17` (import) & line 248:
    - line 248: `openNewTransferModal(testBtn);`

#### 3. `bindMagnetic()` used as Reduced Motion Query & Pointer Attraction
In `frontend/src/main.ts:10 & 5586`:
```typescript
const Qa = matchMedia("(prefers-reduced-motion: reduce)");
const $a = () => Qa.matches;
...
const bindMagnetic = $a;
```
In `src/core/motion.ts:6 & 155`:
```typescript
export const prefersReducedMotion =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : { matches: false };
...
export function bindMagnetic(root: Document | HTMLElement = document): void;
```
- **Occurrences of `bindMagnetic()` called as a boolean query**:
  - `frontend/src/features/settings/components/form-controls.ts:1` (import) & lines 47, 61:
    - line 47: `if (errorText && !bindMagnetic()) {`
    - line 61: `if (bindMagnetic()) {`
  - `frontend/src/features/settings/subtabs/team.ts:25` (import) & line 258:
    - line 258: `if (bindMagnetic()) {`
  - `frontend/src/features/settings/subtabs/billing.ts:26` (import) & line 402:
    - line 402: `if (flipState && !bindMagnetic()) {`
  - `frontend/src/features/settings/subtabs/account.ts:27`: imported but never called (dead import).
- **Occurrence of `openMoveStockModal` actually attaching magnetic physics**:
  - In `frontend/src/main.ts:226 & 5524`:
    ```typescript
    function _o(e = document) { ... K(`.magnetic`, e).forEach(...) ... }
    ...
    const openMoveStockModal = _o;
    ```
  - In `frontend/src/features/settings/subtabs/team.ts:22` (import) & line 325:
    - line 325: `openMoveStockModal(container);`
    Attaches magnetic cursor physics to `.magnetic` elements in `container`. Must be replaced with `bindMagnetic(container)` from `src/core/motion.ts`.

#### 4. `TRANSFER_STATUS_TONES` used as User Avatar & Current User ID
In `frontend/src/main.ts:385 & 5494 & 5669`:
```typescript
Qo = `m-okafor`,
...
const TRANSFER_STATUS_TONES = Qo;
```
- **Occurrences in Settings**:
  - `frontend/src/features/settings/subtabs/account.ts:35` (import) & lines 92, 305, 325:
    - line 92: `<span data-k="ac-av">${renderAvatar(TRANSFER_STATUS_TONES, 'xl')}</span>`
    - line 305: `const member = findMemberById(TRANSFER_STATUS_TONES);`
    - line 325: `avEl.innerHTML = renderAvatar(TRANSFER_STATUS_TONES, 'xl');`
  - `frontend/src/features/settings/subtabs/team.ts:33` (import) & lines 127, 292:
    - line 127: `const isMe = member.id === TRANSFER_STATUS_TONES;`
    - line 292: `const isMe = member.id === TRANSFER_STATUS_TONES;`

#### 5. `getAvailableSuppliers` used as Element Flash Animation
In `frontend/src/main.ts:155 & 5514`:
```typescript
function fo(e) {
  e &&
    (e.classList.remove(`is-flash`),
    e.offsetWidth,
    e.classList.add(`is-flash`),
    !Qa.matches &&
      H.fromTo(
        e,
        { y: -4, scale: 1.06 },
        {
          y: 0,
          scale: 1,
          duration: 0.55,
          ease: `back.out(2.4)`,
          overwrite: `auto`,
          clearProps: `transform`,
        },
      ));
}
...
const getAvailableSuppliers = fo;
```
- **Occurrences in Settings**:
  - `frontend/src/features/settings/subtabs/company.ts:27` (import) & line 210:
    ```typescript
    if (numEl) getAvailableSuppliers(numEl);
    ```
  - `frontend/src/features/settings/subtabs/billing.ts:33` (import) & line 414:
    ```typescript
    if (priceEl) getAvailableSuppliers(priceEl);
    ```

#### 6. `CATEGORY_NAMES` used as Role Permissions Matrix in `team.ts`
In `frontend/src/main.ts:350 & 5506`:
```typescript
qo = [
  { key: `view`, label: `View stock, orders and reports`, roles: [`owner`, `admin`, `manager`, `staff`, `viewer`] },
  { key: `pick`, label: `Pick, pack and ship orders`, roles: [`owner`, `admin`, `manager`, `staff`] },
  { key: `adjust`, label: `Adjust stock and run counts`, roles: [`owner`, `admin`, `manager`, `staff`] },
  { key: `batch`, label: `Release batches from QA`, roles: [`owner`, `admin`, `manager`] },
  { key: `po`, label: `Create and send purchase orders`, roles: [`owner`, `admin`, `manager`] },
  { key: `price`, label: `Change prices and costs`, roles: [`owner`, `admin`] },
  { key: `team`, label: `Invite people and change roles`, roles: [`owner`, `admin`] },
  { key: `billing`, label: `Billing and plan`, roles: [`owner`] },
];
...
const CATEGORY_NAMES = qo;
```
- **Occurrence in Settings**:
  - `frontend/src/features/settings/subtabs/team.ts:31` (import) & line 111:
    ```typescript
    <tbody>${CATEGORY_NAMES.map((cat: any) => `<tr><th scope="row">${escapeHtml(cat.label)}</th>${ROLES.map((role) => `<td data-col="${role}">${cat.roles.includes(role) ? `<span class="st-yes" role="img" ...` : ...}`).join('')}</tr>`).join('')}</tbody>
    ```
    `CATEGORY_NAMES` in `team.ts` is actually the `ROLE_PERMISSIONS` matrix, NOT product categories!

#### 7. `findLocationById` and `openModal` in `settings.ts`
- In `frontend/src/features/settings/settings.ts:2` (import) & lines 152, 173, 195, 206:
  ```typescript
  findLocationById('team', () => { ... });
  findLocationById('settings', () => { ... });
  findLocationById('batches', () => { ... });
  findLocationById('products', () => { ... });
  ```
  `findLocationById` here is `subscribeToStore` from `src/core/store.ts`.
- In `frontend/src/features/settings/settings.ts:3` (import) & line 213:
  ```typescript
  openModal(() => {
    const accountContainer = getSubtabContainer('account');
    if (initializedSubtabs.has('account') && accountContainer) {
      updateThemeButtons(accountContainer);
    }
  });
  ```
  In `main.ts:3038 & 5536`: `Cl = new Set(), wl = (e) => Cl.add(e); const openModal = wl;`. When theme changes in `Ul()`, `Cl.forEach(e => e())` fires. So `openModal` was used as `onThemeChange(cb)`!

#### 8. Lingering Core & Utility Imports from `main.ts`
Across all 7 files, the following utilities are currently imported from `main.ts` but are available directly from canonical modules:
- DOM Utilities: `escapeHtml`, `domQuery`, `domQueryAll`, `queryOne` -> `src/utils/dom.ts`
- Formatters: `formatDate`, `formatRelativeTime`, `formatInt`, `formatMoney`, `formatMoneyRound`, `pluralize` -> `src/utils/formatters.ts`
- Icons: `renderIcon`, `renderIconButton`, `renderPill` -> `src/utils/icons.ts`
- Store: `store`, `findMemberById`, `notifyStoreSubscribers`, `subscribeToStore`, `getLowStockProducts`, `getLowStockMaterials`, `addNotification` -> `src/core/store.ts`
- Constants: `ONE_DAY_MS`, `ONE_MIN_MS`, `ROLE_NAMES` -> `src/core/constants.ts`
- Motion: `motionDuration`, `animateCards`, `animateRows`, `animatePop`, `gsap`, `Flip` -> `src/core/motion.ts`

---

## 2. Logic Chain

1. **Premise 1**: Requirement R1 mandates de-obfuscation and clean TypeScript architecture without misleading legacy aliases.
2. **Premise 2**: Milestone 1 established canonical primitives:
   - `src/core/motion.ts` exporting `animateCounter`, `playHaptic`, `prefersReducedMotion`, `bindMagnetic`, `gsap`, `Flip`.
   - `src/core/store.ts` exporting `store`, `subscribeToStore`, `notifyStoreSubscribers`, `findMemberById`.
   - `src/core/constants.ts` exporting `ROLE_NAMES`, `ONE_DAY_MS`, `ONE_MIN_MS`.
   - `src/utils/dom.ts`, `src/utils/formatters.ts`, `src/utils/icons.ts` exporting presentation helpers.
3. **Premise 3**: In `frontend/src/features/settings/`, modules bypass these primitives and import from `src/main.ts` using scrambled names (`getAvailableLocations` for counter animations, `openNewTransferModal` for button haptics, `bindMagnetic` for boolean reduced motion check, `openMoveStockModal` for magnetic physics, `getAvailableSuppliers` for element flashes, `TRANSFER_STATUS_TONES` for `'m-okafor'`, `CATEGORY_NAMES` for role permissions, `findLocationById` for store subscriptions, `openModal` for theme changes).
4. **Deduction**: Every one of these aliased imports has an exact, 1-to-1 canonical counterpart. By updating imports and calls to direct domain primitives, the entire Settings feature module will be fully de-obfuscated with 0 runtime semantic ambiguity.

---

## 3. Caveats

- **Scope Boundary**: This investigation focuses strictly on `frontend/src/features/settings/` (plus referenced additions in `src/core/motion.ts` and `src/types/settings.ts` / `src/data/constants.ts`). Other Milestone 2 modules (`analytics`, `customers`, `help`, `charts`) are audited separately.
- **`flashElement` Primitives**: `main.ts` defined `fo` (flash element with `is-flash` and GSAP scale bounce), but `src/core/motion.ts` did not previously export `flashElement`. Adding `export function flashElement(element: HTMLElement | null): void` to `src/core/motion.ts` solves this cleanly across both `company.ts` and `billing.ts`.
- **`onThemeChange` in `main.ts`**: `main.ts` should export `export const onThemeChange = wl;` so that `settings.ts` does not use `openModal` for theme subscription.

---

## 4. Conclusion & Concrete Remediation Plan

### Remediation Map by Target File

#### 1. `frontend/src/features/settings/components/form-controls.ts`
- **Current import (line 1)**:
  ```typescript
  import { escapeHtml, bindMagnetic, gsap } from '../../../main';
  ```
- **Replacement import**:
  ```typescript
  import { escapeHtml } from '../../../utils/dom';
  import { prefersReducedMotion, gsap } from '../../../core/motion';
  ```
- **Code Changes**:
  - Line 47:
    - *Before*: `if (errorText && !bindMagnetic()) {`
    - *After*: `if (errorText && !prefersReducedMotion.matches) {`
  - Line 61:
    - *Before*: `if (bindMagnetic()) {`
    - *After*: `if (prefersReducedMotion.matches) {`

---

#### 2. `frontend/src/features/settings/settings.ts`
- **Current import (lines 1-9)**:
  ```typescript
  import {
    findLocationById,
    openModal,
    motionDuration,
    domQuery,
    domQueryAll,
    queryOne,
    store,
  } from '../../main';
  ```
- **Replacement imports**:
  ```typescript
  import { store, subscribeToStore } from '../../core/store';
  import { motionDuration } from '../../core/motion';
  import { domQuery, domQueryAll, queryOne } from '../../utils/dom';
  import { onThemeChange } from '../../main';
  ```
- **Code Changes**:
  - Lines 152, 173, 195, 206:
    - *Before*:
      ```typescript
      findLocationById('team', () => { ... });
      findLocationById('settings', () => { ... });
      findLocationById('batches', () => { ... });
      findLocationById('products', () => { ... });
      ```
    - *After*:
      ```typescript
      subscribeToStore('team', () => { ... });
      subscribeToStore('settings', () => { ... });
      subscribeToStore('batches', () => { ... });
      subscribeToStore('products', () => { ... });
      ```
  - Line 213:
    - *Before*:
      ```typescript
      openModal(() => {
      ```
    - *After*:
      ```typescript
      onThemeChange(() => {
      ```

---

#### 3. `frontend/src/features/settings/subtabs/account.ts`
- **Current imports (lines 1-36)**:
  Eliminate `TRANSFER_STATUS_TONES`, `bindMagnetic` (unused), and `openNewTransferModal`.
  Import directly from `core` and `utils`:
- **Replacement imports**:
  ```typescript
  import { store, findMemberById, notifyStoreSubscribers } from '../../../core/store';
  import {
    animateCards,
    animateRows,
    animatePop,
    motionDuration,
    playHaptic,
    gsap,
  } from '../../../core/motion';
  import { ONE_DAY_MS } from '../../../core/constants';
  import { escapeHtml, domQuery, domQueryAll, queryOne } from '../../../utils/dom';
  import { formatDate, formatRelativeTime, pluralize } from '../../../utils/formatters';
  import { renderIcon, renderPill } from '../../../utils/icons';
  import {
    getSavedTheme,
    setSavedTheme,
    bindAccentPicker,
    getCurrentAccentName,
    renderAccentPickerHtml,
    renderAvatar,
    renderPageHeader,
    renderTag,
    showToast,
    confirmDialog,
    animateElementOut,
    animatePageTransition,
    bindModalDismiss,
  } from '../../../main';
  ```
- **Code Changes**:
  - Define or use direct user identifier `'m-okafor'`:
    - Line 92:
      - *Before*: `<span data-k="ac-av">${renderAvatar(TRANSFER_STATUS_TONES, 'xl')}</span>`
      - *After*: `<span data-k="ac-av">${renderAvatar('m-okafor', 'xl')}</span>`
    - Line 305:
      - *Before*: `const member = findMemberById(TRANSFER_STATUS_TONES);`
      - *After*: `const member = findMemberById('m-okafor');`
    - Line 325:
      - *Before*: `avEl.innerHTML = renderAvatar(TRANSFER_STATUS_TONES, 'xl');`
      - *After*: `avEl.innerHTML = renderAvatar('m-okafor', 'xl');`
  - Button haptics (lines 422, 431):
    - Line 422:
      - *Before*: `openNewTransferModal(themeBtn);`
      - *After*: `playHaptic(themeBtn);`
    - Line 431:
      - *Before*: `openNewTransferModal(currentTarget);`
      - *After*: `playHaptic(currentTarget);`

---

#### 4. `frontend/src/features/settings/subtabs/company.ts`
- **Current imports (lines 1-32)**:
  Eliminate `openNewTransferModal` and `getAvailableSuppliers`.
- **Replacement imports**:
  ```typescript
  import { store, findMemberById, notifyStoreSubscribers } from '../../../core/store';
  import {
    animateCards,
    animateRows,
    animatePop,
    motionDuration,
    playHaptic,
    flashElement,
    gsap,
  } from '../../../core/motion';
  import { escapeHtml, domQuery, domQueryAll, queryOne } from '../../../utils/dom';
  import { formatInt, pluralize } from '../../../utils/formatters';
  import { renderIcon } from '../../../utils/icons';
  import {
    renderPageHeader,
    renderTag,
    renderSegmentedControl,
    initSegmentedControl,
    getLocationStockUnits,
    getExpiringBatches,
    exportStockCsv,
    exportOrdersCsv,
    exportMovementsCsv,
    resetDemoData,
    showToast,
    confirmDialog,
    animatePageTransition,
  } from '../../../main';
  ```
- **Code Changes**:
  - Line 210:
    - *Before*: `if (numEl) getAvailableSuppliers(numEl);`
    - *After*: `if (numEl) flashElement(numEl);`
  - Line 323:
    - *Before*: `openNewTransferModal(exportBtn);`
    - *After*: `playHaptic(exportBtn);`
  - Line 333:
    - *Before*: `openNewTransferModal(resetBtn);`
    - *After*: `playHaptic(resetBtn);`

---

#### 5. `frontend/src/features/settings/subtabs/team.ts`
- **Current imports (lines 1-39)**:
  Eliminate `getAvailableLocations`, `openNewTransferModal`, `openMoveStockModal`, `bindMagnetic`, `TRANSFER_STATUS_TONES`, `CATEGORY_NAMES`.
- **Replacement imports**:
  ```typescript
  import { store, findMemberById } from '../../../core/store';
  import {
    animateCounter,
    animateCards,
    animateRows,
    motionDuration,
    playHaptic,
    bindMagnetic,
    prefersReducedMotion,
    gsap,
  } from '../../../core/motion';
  import { ROLE_NAMES, ONE_DAY_MS, ROLE_PERMISSIONS } from '../../../core/constants';
  import { escapeHtml, domQuery, domQueryAll, queryOne } from '../../../utils/dom';
  import { formatDate, formatInt, pluralize } from '../../../utils/formatters';
  import { renderIcon, renderIconButton, renderPill } from '../../../utils/icons';
  import {
    renderPageHeader,
    renderTag,
    renderAvatar,
    renderFilterBar,
    renderEmptyState,
    highlightSearchMatch,
    showToast,
    removeTeammate,
    updateMemberRole,
    openInviteTeammateModal,
    openDrawer,
    bindModalDismiss,
    animatePageTransition,
  } from '../../../main';
  ```
- **Code Changes**:
  - Line 111 (Permission Matrix):
    - *Before*:
      ```typescript
      <tbody>${CATEGORY_NAMES.map((cat: any) => `<tr><th scope="row">${escapeHtml(cat.label)}</th>${ROLES.map((role) => `<td data-col="${role}">${cat.roles.includes(role) ? `<span class="st-yes" ...` : ...}`).join('')}</tr>`).join('')}</tbody>
      ```
    - *After*:
      ```typescript
      <tbody>${ROLE_PERMISSIONS.map((perm) => `<tr><th scope="row">${escapeHtml(perm.label)}</th>${ROLES.map((role) => `<td data-col="${role}">${perm.roles.includes(role) ? `<span class="st-yes" role="img" aria-label="${escapeHtml(ROLE_NAMES[role])} can"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" pathLength="1"/></svg></span>` : `<span class="st-no" role="img" aria-label="${escapeHtml(ROLE_NAMES[role])} cannot"></span>`}</td>`).join('')}</tr>`).join('')}</tbody>
      ```
  - Lines 127 & 292 (Current user check):
    - *Before*: `const isMe = member.id === TRANSFER_STATUS_TONES;`
    - *After*: `const isMe = member.id === 'm-okafor';`
  - Line 194 (Seat counter animation):
    - *Before*:
      ```typescript
      getAvailableLocations(usedEl, used, formatInt, {
        from: animate ? 0 : undefined,
        duration: 1,
        delay: animate ? 0.4 : 0,
      });
      ```
    - *After*:
      ```typescript
      animateCounter(usedEl, used, formatInt, {
        from: animate ? 0 : undefined,
        duration: 1,
        delay: animate ? 0.4 : 0,
      });
      ```
  - Line 258 (Reduced motion check):
    - *Before*: `if (bindMagnetic()) {`
    - *After*: `if (prefersReducedMotion.matches) {`
  - Line 325 (Magnetic physics binding):
    - *Before*: `openMoveStockModal(container);`
    - *After*: `bindMagnetic(container);`
  - Lines 329, 344, 365, 372 (Button haptics):
    - Line 329: `playHaptic(target);`
    - Line 344: `playHaptic(chip);`
    - Line 365: `playHaptic(removeBtn);`
    - Line 372: `playHaptic(resendBtn);`

---

#### 6. `frontend/src/features/settings/subtabs/billing.ts`
- **Current imports (lines 1-42)**:
  Eliminate `getAvailableLocations`, `getAvailableSuppliers`, `openNewTransferModal`, `bindMagnetic`.
- **Replacement imports**:
  ```typescript
  import { store, notifyStoreSubscribers } from '../../../core/store';
  import {
    animateCounter,
    animateCards,
    animateRows,
    motionDuration,
    playHaptic,
    flashElement,
    prefersReducedMotion,
    Flip,
    gsap,
  } from '../../../core/motion';
  import { ONE_MIN_MS, ONE_DAY_MS } from '../../../core/constants';
  import { escapeHtml, domQuery, domQueryAll, queryOne } from '../../../utils/dom';
  import { formatDate, formatMoney, formatMoneyRound, pluralize } from '../../../utils/formatters';
  import { renderIcon, renderIconButton, renderPill } from '../../../utils/icons';
  import {
    renderPageHeader,
    renderTag,
    renderAvatarStack,
    renderSegmentedControl,
    initSegmentedControl,
    renderEmptyState,
    renderFilterBar,
    formatCsvRow,
    downloadFile,
    showToast,
    confirmDialog,
    openQuickCreateModal,
    openDrawer,
    bindModalDismiss,
    bindTabControls,
    animatePageTransition,
  } from '../../../main';
  ```
- **Code Changes**:
  - Line 262 (Plan price counter animation):
    - *Before*:
      ```typescript
      getAvailableLocations(priceEl, getPlanPrice(plan, billing.cycle), formatMoneyRound, {
        from: animate ? 0 : undefined,
        duration: 1,
        delay: animate ? 0.35 : 0,
      });
      ```
    - *After*:
      ```typescript
      animateCounter(priceEl, getPlanPrice(plan, billing.cycle), formatMoneyRound, {
        from: animate ? 0 : undefined,
        duration: 1,
        delay: animate ? 0.35 : 0,
      });
      ```
  - Line 402 (Reduced motion check for Flip):
    - *Before*: `if (flipState && !bindMagnetic()) {`
    - *After*: `if (flipState && !prefersReducedMotion.matches) {`
  - Line 414 (Flash price element on change):
    - *Before*: `if (priceEl) getAvailableSuppliers(priceEl);`
    - *After*: `if (priceEl) flashElement(priceEl);`
  - Lines 636 & 645 (Button haptics):
    - Line 636: `playHaptic(target);`
    - Line 645: `playHaptic(switchBtn);`

---

#### 7. `frontend/src/features/settings/subtabs/notifications.ts`
- **Current imports (lines 1-26)**:
  Eliminate `openNewTransferModal`.
- **Replacement imports**:
  ```typescript
  import {
    store,
    addNotification,
    notifyStoreSubscribers,
    getLowStockProducts,
    getLowStockMaterials,
  } from '../../../core/store';
  import {
    animateCards,
    animateRows,
    playHaptic,
    gsap,
  } from '../../../core/motion';
  import { escapeHtml, domQuery, domQueryAll, queryOne } from '../../../utils/dom';
  import { renderIcon } from '../../../utils/icons';
  import {
    renderPageHeader,
    renderTag,
    renderSegmentedControl,
    initSegmentedControl,
    renderEmptyState,
    showToast,
    getExpiringBatches,
    getActiveOrders,
    bindModalDismiss,
    animatePageTransition,
  } from '../../../main';
  ```
- **Code Changes**:
  - Line 248 (Test notification button haptic):
    - *Before*: `openNewTransferModal(testBtn);`
    - *After*: `playHaptic(testBtn);`

---

### Supporting Primitives to Add in Core

1. **`src/core/motion.ts`**:
   Add and export `flashElement`:
   ```typescript
   export function flashElement(element: HTMLElement | null): void {
     if (!element) return;
     element.classList.remove('is-flash');
     void element.offsetWidth;
     element.classList.add('is-flash');
     if (!prefersReducedMotion.matches) {
       gsap.fromTo(
         element,
         { y: -4, scale: 1.06 },
         {
           y: 0,
           scale: 1,
           duration: 0.55,
           ease: 'back.out(2.4)',
           overwrite: 'auto',
           clearProps: 'transform',
         }
       );
     }
   }
   ```
2. **`src/data/constants.ts` (and re-exported by `src/core/constants.ts`)**:
   Add `ROLE_PERMISSIONS`:
   ```typescript
   export const ROLE_PERMISSIONS = [
     {
       key: 'view',
       label: 'View stock, orders and reports',
       roles: ['owner', 'admin', 'manager', 'staff', 'viewer'],
     },
     {
       key: 'pick',
       label: 'Pick, pack and ship orders',
       roles: ['owner', 'admin', 'manager', 'staff'],
     },
     {
       key: 'adjust',
       label: 'Adjust stock and run counts',
       roles: ['owner', 'admin', 'manager', 'staff'],
     },
     { key: 'batch', label: 'Release batches from QA', roles: ['owner', 'admin', 'manager'] },
     { key: 'po', label: 'Create and send purchase orders', roles: ['owner', 'admin', 'manager'] },
     { key: 'price', label: 'Change prices and costs', roles: ['owner', 'admin'] },
     { key: 'team', label: 'Invite people and change roles', roles: ['owner', 'admin'] },
     { key: 'billing', label: 'Billing and plan', roles: ['owner'] },
   ] as const;
   ```
3. **`src/main.ts`**:
   Export `onThemeChange` and `flashElement`:
   ```typescript
   export const onThemeChange = wl;
   export const flashElement = fo;
   ```

---

## 5. Verification Method

Once the implementer worker updates the code:

1. **Static Analysis & Typecheck**:
   ```bash
   cd "E:\dashborad clone\frontend"
   npm run typecheck
   ```
   *Expected output*: `Exit code: 0`, 0 compiler errors.

2. **Production Bundle Build**:
   ```bash
   cd "E:\dashborad clone\frontend"
   npm run build
   ```
   *Expected output*: `✓ built in < 3s`, 0 build errors.

3. **Grep Absence of Aliases in Settings**:
   Execute the following greps in `frontend/src/features/settings`:
   ```bash
   grep -rn "getAvailableLocations" frontend/src/features/settings/
   grep -rn "openNewTransferModal" frontend/src/features/settings/
   grep -rn "getAvailableSuppliers" frontend/src/features/settings/
   grep -rn "TRANSFER_STATUS_TONES" frontend/src/features/settings/
   grep -rn "openMoveStockModal" frontend/src/features/settings/
   grep -rn "bindMagnetic()" frontend/src/features/settings/
   ```
   *Expected output*: **0 occurrences** across all files.

4. **Automated E2E Suite Execution**:
   ```bash
   cd "E:\dashborad clone\frontend"
   npx playwright test
   ```
   *Expected output*: All 47 tests pass.
