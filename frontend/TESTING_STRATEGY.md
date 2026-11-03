# 🧪 Testing Strategy & Verification Protocol

## 1. Quality Assurance Philosophy

In Vels Frontend, **objective verification supersedes self-assessment**. No pull request, architectural refactoring, or feature addition is considered complete without passing automated browser tests and static type-checking.

```
       ▲
      / \
     / E2E \         Playwright Test Suites (7 Full E2E specs)
    /-------\
   / Static  \       TypeScript Compiler (tsc --noEmit)
  /           \
 / Architecture\     Babel AST validations & Bundler checks (Vite)
+---------------+
```

---

## 2. Test Pyramid & Execution Tiers

### Tier 1: Static Type Checking
- **Tool**: TypeScript Compiler (`tsc --noEmit`)
- **Coverage**: All files in `src/types/`, `src/core/`, `src/data/`, `src/ui/`, `src/utils/`, and `src/features/`.
- **Command**:
  ```bash
  npm run typecheck
  ```
- **Passing Condition**: Exit code 0, 0 compiler errors.

### Tier 2: Production Build Verification
- **Tool**: Vite 6.x / Rollup
- **Coverage**: Complete bundle optimization, tree-shaking, CSS import resolution, and dynamic chunk packaging.
- **Command**:
  ```bash
  npm run build
  ```
- **Passing Condition**: Clean output in `< 10s`, zero unresolved import warnings.

### Tier 3: End-to-End Browser Automation
- **Tool**: `@playwright/test`
- **Browsers**: Chromium, Firefox, WebKit (Headless & Headed)
- **Configuration**: `playwright.config.js`
- **Command**:
  ```bash
  npm test
  ```

---

## 3. Playwright E2E Master Test Suites (`tests/Vels.spec.js`)

| Test Case | Scope & User Journey | Critical Assertions |
| :--- | :--- | :--- |
| **1. Shell & Dashboard** | Initial boot, layout render, Welcome KPI section | - Title matches `/Vels/<br>- Brand reads `Vels · Marlow & Fern`<br>- KPIs visible: Units on hand, Total stock value, Low stock items<br>- Sections: Inventory statistics, Sales overview, Top sellers |
| **2. Navigation** | Deep-linking and section switching across all 9 primary features | - Catalog (`#/products/catalog`): 12 SKUs<br>- Batches (`#/products/batches`)<br>- Orders All & Board (`#/orders/all`, `#/orders/board`)<br>- Purchasing, Warehouses, Analytics, Customers, Settings, Help |
| **3. Theme Switcher** | Immediate color scheme toggling (Light ⇄ Dark) | - Clicking `button[data-theme-to="dark"]` sets `html[data-theme="dark"]`<br>- Clicking `button[data-theme-to="light"]` resets attribute<br>- Zero layout shifts or page reloads |
| **4. Command Palette** | ⌘K / Ctrl+K search filter & modal lifecycle | - Clicking `#btn-find` opens `#finder` dialog<br>- Auto-focuses on `#finder-q`<br>- Typing `'Balm'` renders `'Calendula Rescue Balm'`<br>- Pressing `Escape` closes palette |
| **5. Notifications** | Topbar bell icon, notifications drawer, badge state | - Clicking `#btn-bell` displays `.pop-layer`<br>- Contains `'Notifications'` & `'See every alert'`<br>- Dismisses on `Escape` |
| **6. Quick Actions** | Topbar `+ New` button | - Popover opens with actions: Sales order, Purchase order, Make a batch, Move stock |
| **7. Account & Sidebar** | User avatar menu and sidebar collapse state | - Avatar click displays Account settings, Shortcuts, Export stock (CSV)<br>- Clicking `#btn-side` toggles `html.side-open` class |

---

## 4. Test Authoring Guidelines for New Features

When creating a new feature in `src/features/<feature>/`:
1. **Semantic Selectors**: Never bind tests to volatile class names like `.flex` or `.p-4`. Use accessible roles (`role="dialog"`, `role="combobox"`) or persistent data attributes (`[data-act="order"]`, `[data-k="kpi-units"]`).
2. **Deterministic Time**: Use the simulated time baseline from `data/constants.ts` rather than native non-deterministic `Date.now()`.
3. **Modal Cleanup**: Always verify that pressing `Escape` or clicking `[data-close]` removes the modal scrim from the DOM.
