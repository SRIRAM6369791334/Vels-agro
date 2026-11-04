# E2E Testing Infrastructure (`TEST_INFRA.md`)

## 1. Overview & Test Architecture

The Vels Agro Machinery & Equipment Admin Panel test infrastructure utilizes **Playwright** (`@playwright/test` v1.49.0) with an automated **Vite Preview** web server to run end-to-end browser automation against production-built artifacts.

### Architecture Pyramid
```
            ▲
           / \
          / E2E \         Playwright Test Suites (4 spec files, 47 tests)
         /-------\
        / Static  \       TypeScript Compiler (tsc --noEmit)
       /           \
      / Architecture\     Vite 6 Production Build (vite build)
     +---------------+
```

---

## 2. Environment Configuration

### Playwright Configuration (`frontend/playwright.config.js`)
- **Test Directory**: `./tests`
- **Timeout**: `30,000 ms` per test case
- **Retries**: `0` (enforces strict determinism; no masked flakiness)
- **Viewport**: `1280 x 800` (default desktop viewport)
- **Base URL**: `http://localhost:5173`
- **Headless**: `true`
- **Web Server Configuration**:
  ```javascript
  webServer: {
    command: 'npx vite preview --port 5173',
    port: 5173,
    reuseExistingServer: true,
  }
  ```
  *Note*: The web server serves the production bundle compiled into `dist/`. Therefore, any code changes must be compiled via `npm run build` prior to running the test suite, or the test runner will execute against the previously built artifact.

---

## 3. Test Invocations & Commands

All commands are executed from the frontend directory: `E:\dashborad clone\frontend`.

### Primary Commands
| Command | Action | Tools | Expected Output |
|---------|--------|-------|-----------------|
| `npm run typecheck` | Validates static types across all TypeScript files | `tsc --noEmit` | Exit code `0`, 0 errors |
| `npm run build` | Compiles production assets into `dist/` | `vite build` | Exit code `0`, chunks built in `< 5s` |
| `npm run test` | Executes the complete 47-test Playwright suite | `playwright test` | Exit code `0`, 47/47 passing |

### Advanced & Targeted Test Invocations
```bash
# Run tests with 4 parallel workers (default)
npx playwright test

# Run a single test spec file
npx playwright test tests/vessa.spec.js
npx playwright test tests/state-nav-stress.spec.js
npx playwright test tests/adversarial_overlays.spec.js
npx playwright test tests/adversarial_final_stress.spec.js

# Run tests matching a specific pattern or title
npx playwright test -g "SN-01"
npx playwright test -g "Command Palette"

# Run tests in headed browser mode (visual observation)
npx playwright test --headed

# Run tests in debug mode (Playwright Inspector)
npx playwright test --debug

# Generate HTML test report and view results
npx playwright show-report
```

---

## 4. Test Suite Inventory (4 Files, 47 Test Cases)

### 4.1 `tests/vessa.spec.js` (7 Tests)
Focuses on baseline shell loading, core navigation across primary sections, theme toggling, and topbar popovers.
1. `1. Shell & Dashboard loads with KPI metrics` (line 5): Validates brand text, executive KPI summary cards (`Units on hand`, `Total stock value`, `Low stock items`), and dashboard regions.
2. `2. Navigation across all main sections & subtabs` (line 27): Validates router transitions across catalog, batches, orders (all/board), purchasing, warehouses, analytics, stockists, account, and help.
3. `3. Theme toggle between Light and Dark mode` (line 70): Validates `html[data-theme]` attribute toggling between light and dark.
4. `4. Command Palette (Search ⌘K) opens and filters` (line 86): Validates opening `#finder`, auto-focusing `#finder-q`, filtering for "Balm", and closing on `Escape`.
5. `5. Notifications panel opens with alerts` (line 107): Validates `#btn-bell` popover opening, text content, and `Escape` dismissal.
6. `6. Create New Menu opens all quick actions` (line 122): Validates `#btn-new` popover listing quick actions (Sales order, Purchase order, Make a batch, Move stock).
7. `7. Account Menu & Sidebar collapse toggle` (line 139): Validates `#btn-me` popover menu items and `#btn-side` toggle of `html.side-open`.

### 4.2 `tests/state-nav-stress.spec.js` (10 Tests)
Focuses on deep-linking, routing precision, middle dot title formatting, browser history traversal, rapid hash switching, and state persistence resilience.
1. `SN-01: Deep-linking direct load on all 9 primary routes` (line 37): Direct URL loads for all 9 primary views, exact middle dot `\u00B7` character code (183) verification, and landmark visibility.
2. `SN-02: Deep-linking to all 17 secondary subtabs and title synchronization` (line 53): Title synchronization for all 17 subtabs matching `<Subtab> · Vels`.
3. `SN-03: Section redirect behavior for bare section URLs` (line 63): Canonical redirection from bare section roots (e.g., `#/products` → `#/products/catalog`, `#/orders` → `#/orders/all`).
4. `SN-04: Browser History traversal (Back & Forward) across routes` (line 84): Five-step sequential navigation, backward stepping via `page.goBack()`, and forward stepping via `page.goForward()`.
5. `SN-05: Rapid hash-navigation stress testing (30 rapid transitions)` (line 115): 30 consecutive rapid hash mutations ensuring zero unhandled page errors and clean landing.
6. `SN-06: Theme toggle, DOM data-theme attribute, and localStorage persistence` (line 147): Validates localStorage `Vels:theme` JSON stringification and persistence across full page reloads.
7. `SN-07: Cold boot with pre-set localStorage theme` (line 177): Fresh browser context initialized with `Vels:theme` dark before scripts load, verifying flash-free theme hydration.
8. `SN-08: Corrupted localStorage resilience` (line 193): Seeds invalid JSON and invalid types into localStorage keys, verifying graceful fallback without unhandled exceptions.
9. `SN-09: Sidebar state collapse toggle & localStorage persistence` (line 217): Toggles `#btn-side`, asserts `Vels:side` stored as `'1'` / `'0'`, and verifies persistence across reload.
10. `SN-10: Adversarial unknown route inspection redirects to dashboard overview` (line 242): Navigates to `#/unknown-route-404`, asserting fallback to `#/dashboard/overview`.

### 4.3 `tests/adversarial_overlays.spec.js` (20 Tests)
Focuses on overlay lifecycle, accessibility attributes, viewport constraints, backdrop dismissal, hit-testing boundaries, and regression edge cases.
- **Group 1: Command Palette (`#finder`)**:
  1. `1.1 Auto-focus on #finder-q when opened via #btn-find` (line 7)
  2. `1.2 Keyboard shortcut (Control+k or Meta+k) toggles palette` (line 18)
  3. `1.3 Search filtering: matches, case insensitivity, trimming, empty state` (line 36)
  4. `1.4 Dismissal: Escape key dismisses palette` (line 64)
  5. `1.5 [REMEDIATED] Command palette vertical position is anchored in viewport (y < 300px)` (line 73)
  6. `1.6 [REMEDIATED] Scrim backdrop has computed visibility: visible` (line 85)
- **Group 2: Floating Popovers (`.pop-layer`)**:
  7. `2.1 Bell Notifications opens, has aria-expanded, and dismisses on Escape` (line 101)
  8. `2.2 Quick Create opens, has aria-expanded, and dismisses on Escape` (line 116)
  9. `2.3 Account Menu opens, has aria-expanded, and dismisses on Escape` (line 131)
  10. `2.4 Mutual exclusivity and toggle behavior` (line 146)
  11. `2.5 Dismissal on outside backdrop click` (line 165)
  12. `2.6 [REMEDIATED] Clicking inside popover fires action without premature pointerdown unmount` (line 175)
  13. `2.7 [REMEDIATED] Passive click inside popover header does not dismiss popover` (line 190)
- **Group 3: Sidebar Collapse & State Sync**:
  14. `3.1 #btn-side toggles side-open on <html> and updates aria attributes` (line 207)
  15. `3.2 Sidebar open state persists across page reloads` (line 234)
  16. `3.3 Rapid toggle stress test (10 rapid clicks)` (line 256)
- **Group 4: Remediation Parity & Regression Suite**:
  17. `4.1 Stockist link in Command Palette navigates to #/customers/stockists` (line 271)
  18. `4.2 Wildcard route fallback redirects unknown paths to /dashboard/overview` (line 283)
  19. `4.3 Bell badge conditionally rendered and hides when count is 0` (line 289)
  20. `4.4 Command Palette ArrowDown and Enter keyboard navigation` (line 303)

### 4.4 `tests/adversarial_final_stress.spec.js` (10 Tests)
Focuses on state mutations, CSV download streaming, debounced persistence, keyboard oracle navigation, and high-frequency interleaving.
- **Suite 1: Popover Actions & State Mutation Verification**:
  1. `1.1 AccountMenu: "Export stock (CSV)" triggers file download with valid CSV content` (line 10): Intercepts file download stream, validates filename pattern `Vels-stock-YYYY-MM-DD.csv`.
  2. `1.2 Notifications: "Mark all read" mutates data state and unmounts bell badge` (line 35): Marks notifications as read, verifies `#bell-badge` count 0, button disabled state, and 250ms debounced localStorage persistence.
  3. `1.3 QuickCreate: All action buttons navigate to respective routes without dropped clicks` (line 78): Iterates through 7 quick-create actions, ensuring target route transitions without dropped click events.
  4. `1.4 AccountMenu: Theme buttons mutate theme and persist correctly` (line 105): Verifies theme mutation via dropdown buttons.
- **Suite 2: Command Palette Viewport, Scrim & Keyboard Oracle**:
  5. `2.1 Viewport coordinates check across multiple responsive window dimensions` (line 132): Tests responsive positioning across 1280x720, 1920x1080, and 1024x768 viewports.
  6. `2.2 Scrim backdrop visibility and dismissal on backdrop click` (line 165): Asserts computed opacity > 0.8 and computed visibility: visible.
  7. `2.3 Full Keyboard Navigation Oracle (ArrowDown, ArrowUp wrap-around, Enter selection)` (line 183): Verifies 2-way wrap-around keyboard selection and Enter execution.
- **Suite 3: Rapid Toggle & Dismissal Stress Harness**:
  8. `3.1 30-Cycle Rapid Popover Interleaving Stress Test` (line 233): Interleaved rapid toggling across Bell, QuickCreate, and Account menus, enforcing invariant `popCount <= 1`.
  9. `3.2 Comprehensive Click-Outside Boundaries (Rail, Main, Topbar Brand, Esc)` (line 258): Tests dismissal hit boundaries across the navigation rail, main container, topbar brand, and keyboard.
  10. `3.3 Simultaneous / Interleaved Command Palette and Popover transitions` (line 286): Validates LIFO stack dismissal order when palette is opened on top of an active popover.

---

## 5. Test Infrastructure Integrity Principles

1. **Non-Trivial Assertion Standards**: All tests assert concrete DOM state, URL structure, and computed style attributes. No no-op assertions or tautological checks exist.
2. **Defect Oracle Alignment**: The test suite acts as an authoritative specification oracle. Known legacy defects in unrefactored code are actively asserted against the target specification, directly guiding Milestone 1 through Milestone 4 implementations.
3. **Hermetic Test Isolation**: Tests instantiate fresh browser contexts or initialize state explicitly, ensuring zero inter-test dependency or order-of-execution sensitivity.
