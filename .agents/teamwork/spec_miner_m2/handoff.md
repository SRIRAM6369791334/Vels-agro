# Milestone 2: Help Module & Test Invariants — Specification Mining Report

## 1. Observation

### 1.1 Current Baseline State
- **Typecheck**: `npm run typecheck` (`tsc --noEmit`) passes with **0 errors**.
- **Production Build**: `npm run build` (`vite build`) passes in **1.73s** producing clean bundles.
- **Playwright Test Suite**: `npx playwright test` passes with **47/47 tests GREEN (100%)** across 4 test files (`vessa.spec.js`, `adversarial_overlays.spec.js`, `state-nav-stress.spec.js`, `adversarial_final_stress.spec.js`).

### 1.2 Direct Codebase Observations
1. **`frontend/src/features/help/help.ts` (1005 lines)**:
   - Contains monolithic obfuscated code with single-letter variables (`O`, `k`, `A`, `j`, `M`, `N`, `P`, `F`, `I`, `L`, `R`, `z`, `B`, `V`, `ie`, `H`, `U`, `W`, `ae`, `G`, `oe`, `se`, `K`, `q`, `J`, `Y`, `X`, `ce`, `le`, `Z`, `Q`, `ue`, `de`, `fe`, `pe`, `$`, `page`).
   - Manages 2 distinct subtabs: `center` (`Help center`) and `tickets` (`My tickets`).
   - Line 132 in FAQ item `wholesale`: `"Both move New → Packing → Packed → Shipped → Delivered on the board."` — successfully avoids the word "Pick" to prevent strict-mode locator collision with `#/orders/board`.
   - FAQ search supports real-time substring filtering across questions, answers, category names, and key shortcuts, with `<mark>` query highlighting via `highlightSearchMatch()`.
   - Accordion expanding/collapsing uses GSAP and `Flip.getState()` for smooth layout shifts, rotating chevron icon `.hp-q__chev` by 180deg, updating `aria-expanded` and syncing deep-link URLs (`/help/center/:id`).
   - Interactive support ticket creation validates subject length (>= 6 chars), body length (>= 20 chars), enforces 1200 char limit with live counter `[data-k="tk-count"]`, invokes `createHelpTicket(subject, body, topic)`, and renders a fresh ticket with entry animation and toast notification.
   - Interactive ticket solving (`data-solve="${ticket.id}"` -> status `closed`) and reopening (`data-reopen="${ticket.id}"` -> status `answered` or `open`).
   - Subscribes to store slice `'tickets'` via `findLocationById('tickets', ...)`.

2. **`frontend/src/shared/widgets/charts.ts` (850 lines)**:
   - Contains 7 SVG and DOM visualization components:
     1. `createLineChart` (line 39): Multi-series Catmull-Rom spline curves (`c()`), nice tick scaling (`s()`), area gradient fills, interactive crosshair line, dot markers, and floating hover tooltip.
     2. `createDonutChart` (line 234): Despite the name, renders vertical column bars (`.bars .bars__col .bars__bar`) with stagger growth animations and value labels.
     3. `createRingMeter` (line 295): Pure SVG circular donut ring meter with SVG stroke-dasharray arcs, central numeric display, and subtitle.
     4. `createHorizontalBarChart` (line 348): Despite the name, renders a 240-degree radial needle gauge meter (`.gauge`) with tick marks, rotating needle indicator (`gsap.to(needle, { rotation, svgOrigin: '100 100' })`), color zone thresholding (bad: `rose`, warn: `ochre`, good: `sage`), and center count animation.
     5. `createSparkline` (line 462): Pure inline SVG sparkline path generator (`.spark`).
     6. `createBarChart` (line 468): Grouped vertical bar chart (`.hb`) with interactive category columns, series toggle capability, hot hover states, and repositioned tooltips.
     7. `createFanMeter` (line 753): Radial 180-degree fan-line meter (`.fan`) with 84 tick lines, linear gradient stroke, animated lit indicators, and counter.
   - Current exported symbol map (lines 841-849):
     `export { createHorizontalBarChart as a, createFanMeter as i, createDonutChart as n, createBarChart as o, createRingMeter as r, createSparkline as s, createLineChart as t };`
   - Target specification in `PROJECT.md § Interface Contracts § Charts Widget API` specifies semantic function names: `renderLineChart`, `renderColumnBarChart`, `renderDonutRingMeter`, `renderRadialGaugeMeter`, `renderSparklineSvg`, `renderGroupedBarChart`, `renderFanMeter`.

3. **`frontend/src/features/analytics/analytics.ts` (2311 lines)**:
   - Subtabs: `overview`, `sales`, `stock`.
   - Title contract: `title: (e) => ({ sales: 'Sales', stock: 'Stock health' })[e[0] ?? ''] ?? 'Reports'`.
   - Landmark contract: Line 481 renders `eyebrow: 'Annual Gross Revenue — Build a report from your own numbers'` in `renderPageHeader` on `overview`, satisfying `state-nav-stress.spec.js` assertion `selector: 'text=Annual Gross Revenue'`.
   - Subscribes to store slices: `'orders'`, `'history'`, `'products'`, `'batches'`, `'counts'`, `'moves'`, `'settings'`.

4. **`frontend/src/features/customers/customers.ts` (906 lines)**:
   - Subtabs: `stockists`, `shoppers`.
   - Title contract: `title: (e) => (e[0] === 'shoppers' ? 'Shoppers' : 'Stockists') + (e[1] && findCustomerById(e[1]) ? ' · ' + findCustomerById(e[1]).name : '')`.
   - Landmark contract: Line 199 renders `title: 'Stockists'` in `renderPageHeader`, satisfying `state-nav-stress.spec.js` assertion `selector: 'text=Stockists'`.
   - CRITICAL Test Contract (Line 188): Stockist card renders `<h3><b>${highlightSearchMatch(t.name, r)}</b></h3>`, satisfying `adversarial_overlays.spec.js` line 280: `expect(page.locator('h3', { hasText: 'Juniper & Moss Apothecary' })).toBeVisible()`.
   - View layout persistence: `localStorage.getItem('Vels:stockist-view')` (`'grid'` or `'list'`).
   - Profile drawer: `ze(customerId)` opens customer drawer on deep link `#/customers/stockists/:id`.
   - Subscribes to store slices: `'customers'`, `'orders'`.

5. **`frontend/src/features/settings/settings.ts` (2233 lines)**:
   - Subtabs: `account`, `company`, `team`, `billing`, `notifications`.
   - Title contract: `title: (e) => Lt[e[0] ?? ''] ?? 'Settings'` where `Lt = { account: 'Account', company: 'Company', team: 'Team & roles', billing: 'Billing', notifications: 'Notifications' }`.
   - Landmark contract: Line 183 renders `eyebrow: 'User Account — Your profile and how you sign in'` in `renderPageHeader`, satisfying `state-nav-stress.spec.js` assertion `selector: 'text=User Account'`.
   - CSV export contract: Line 39 (`exportOrdersCsv`), Line 53 (`exportStockCsv`), Line 65 (`exportMovementsCsv`), Line 54 (`exportDataBackup`), matching `adversarial_final_stress.spec.js` line 29 regex `/^Vels-stock-\d{4}-\d{2}-\d{2}\.csv$/`.
   - Subscribes to store slices: `'team'`, `'billing'`, `'account'`, `'company'`, `'notifications'`, `'batches'`, `'products'`.

---

## 2. Logic Chain

1. **Test Assertion Alignment**:
   - The test suites execute against production preview bundles where router navigation, document titles, and DOM elements are evaluated with zero tolerance for variations.
   - Title synchronization in `router.ts` formats every document title as `${pageTitle} \u00B7 Vels`, where `\u00B7` is Unicode char code 183. Every subtab in M2 must return its exact prescribed string:
     - `overview` -> `'Reports'` (giving `'Reports · Vels'`)
     - `sales` -> `'Sales'` (giving `'Sales · Vels'`)
     - `stock` -> `'Stock health'` (giving `'Stock health · Vels'`)
     - `stockists` -> `'Stockists'` (giving `'Stockists · Vels'`)
     - `shoppers` -> `'Shoppers'` (giving `'Shoppers · Vels'`)
     - `account` -> `'Account'` (giving `'Account · Vels'`)
     - `company` -> `'Company'` (giving `'Company · Vels'`)
     - `team` -> `'Team & roles'` (giving `'Team & roles · Vels'`)
     - `billing` -> `'Billing'` (giving `'Billing · Vels'`)
     - `notifications` -> `'Notifications'` (giving `'Notifications · Vels'`)
     - `center` -> `'Help center'` (giving `'Help center · Vels'`)
     - `tickets` -> `'My tickets'` (giving `'My tickets · Vels'`)
   - Any divergence in these title strings directly breaks tests `vessa.spec.js` #2 and `state-nav-stress.spec.js` SN-01 & SN-02.

2. **Landmark Stability & DOM Contracts**:
   - SN-01 checks `expect(page.locator(r.selector).first()).toBeVisible()`.
   - If `Annual Gross Revenue` is moved, renamed, or delayed in `analytics.ts`, SN-01 fails.
   - If `User Account` is altered in `settings.ts`, SN-01 fails.
   - If `Juniper & Moss Apothecary` on a customer card is rendered as `<div>` or `<span>` instead of `<h3><b>...</b></h3>`, `adversarial_overlays.spec.js` Test 4.1 fails.

3. **Strict-Mode Text Collision Hazard**:
   - Test SN-05 navigates to `#/orders/board` and asserts `await expect(page.locator('text=Pick')).toBeVisible()`.
   - In Playwright, `text=Pick` is a substring match against all visible DOM nodes.
   - In Milestone 1, an unrefactored FAQ answer containing "Pick" caused Playwright's strict mode violation error because two elements matched.
   - Milestone 1 resolved this by replacing "Pick" in FAQ answers with "Packing" and enforcing `[hidden] { display: none !important; }`.
   - Refactoring of `help.ts` must maintain this exact copy and ensure hidden subtabs are strictly invisible.

4. **Backward Compatibility of Visualization Engine (`charts.ts`)**:
   - Modules from Milestone 3 (`dashboard.ts`, `products.ts`) currently import single-letter or legacy function names (`createFanMeter`, `createBarChart`, `createSparkline`, `createLineChart`, or aliases `a, i, n, o, r, s, t`).
   - Refactoring `charts.ts` to expose clean semantic names (`renderLineChart`, `renderColumnBarChart`, `renderDonutRingMeter`, `renderRadialGaugeMeter`, `renderSparklineSvg`, `renderGroupedBarChart`, `renderFanMeter`) must also re-export the legacy `create*` names and single-letter aliases until Milestone 3 is complete.

5. **Runtime Ticket Entity Shape vs Static Types**:
   - `frontend/src/types/store.ts` defined a simplified `HelpTicket` interface (`title, sub, createdAt, status: 'open' | 'resolved'`).
   - At runtime, tickets in `main.ts` and `help.ts` have: `{ id, number, subject, body, topic, status: 'open' | 'answered' | 'closed', at, reply? }`.
   - Milestone 2 must formalize a complete, accurate `Ticket` interface in `src/types/help.ts` and update `store.ts` to prevent TypeScript compilation errors.

---

## 3. Caveats

1. **Cross-Module Dependency**: `dashboard.ts` and `products.ts` (scheduled for Milestone 3) directly import from `shared/widgets/charts.ts`. Any changes to `charts.ts` signatures or exported names must preserve backward-compatible aliases to avoid breaking M3 modules.
2. **Hidden Subtab Viewports**: All subtabs use container `div[data-sub]` with the `hidden` attribute. The CSS rule `[hidden] { display: none !important; }` in `main.css` is an indispensable test invariant that prevents off-screen text from leaking into Playwright's text locators.
3. **Store Slice Keys**: Store slice subscriptions must use exact slice names:
   - `help.ts`: `'tickets'`
   - `customers.ts`: `'customers'`, `'orders'`
   - `analytics.ts`: `'orders'`, `'history'`, `'products'`, `'batches'`, `'counts'`, `'moves'`, `'settings'`
   - `settings.ts`: `'team'`, `'billing'`, `'account'`, `'company'`, `'notifications'`, `'batches'`, `'products'`

---

## 4. Conclusion & Complete Mining Findings

### 4.1 Playwright Test Assertions Touching Milestone 2 Modules

| # | Spec File | Test Name | Target Route | M2 Module | Assertions & Selectors | Invariant / Contract |
|---|-----------|-----------|--------------|-----------|------------------------|----------------------|
| 1 | `vessa.spec.js:5` | 1. Shell & Dashboard loads | `#/dashboard/overview` | `charts.ts` | KPI cards, SVG charts | SVG render without error |
| 2 | `vessa.spec.js:53` | 2. Navigation across sections | `#/analytics/overview` | `analytics.ts` | `toHaveTitle(/Reports · Vels/)` | Suffix ` · Vels` |
| 3 | `vessa.spec.js:57` | 2. Navigation across sections | `#/customers/stockists` | `customers.ts` | `toHaveTitle(/Stockists · Vels/)` | Suffix ` · Vels` |
| 4 | `vessa.spec.js:61` | 2. Navigation across sections | `#/settings/account` | `settings.ts` | `toHaveTitle(/Account · Vels/)` | Suffix ` · Vels` |
| 5 | `vessa.spec.js:65` | 2. Navigation across sections | `#/help/center` | `help.ts` | `toHaveTitle(/Help center · Vels/)` | Suffix ` · Vels` |
| 6 | `vessa.spec.js:70` | 3. Theme toggle Light/Dark | `#/dashboard/overview` | `settings.ts` | `html[data-theme]` | `dark` / `light` persistence |
| 7 | `vessa.spec.js:139` | 7. Account Menu & Sidebar | `#/dashboard/overview` | `settings.ts` | `#btn-me`, `Account settings` | Popover text matching |
| 8 | `state-nav-stress.spec.js:37` | SN-01: Deep-linking primary | `#/analytics/overview` | `analytics.ts` | Title `Reports · Vels`, `text=Annual Gross Revenue` | Landmark visible; charCode 183 |
| 9 | `state-nav-stress.spec.js:37` | SN-01: Deep-linking primary | `#/customers/stockists` | `customers.ts` | Title `Stockists · Vels`, `text=Stockists` | Landmark visible; charCode 183 |
| 10 | `state-nav-stress.spec.js:37` | SN-01: Deep-linking primary | `#/settings/account` | `settings.ts` | Title `Account · Vels`, `text=User Account` | Landmark visible; charCode 183 |
| 11 | `state-nav-stress.spec.js:37` | SN-01: Deep-linking primary | `#/help/center` | `help.ts` | Title `Help center · Vels`, `text=Help center` | Landmark visible; charCode 183 |
| 12 | `state-nav-stress.spec.js:53` | SN-02: Deep-linking subtabs | `#/analytics/sales` | `analytics.ts` | Title `Sales · Vels` | Ends with ` · Vels`, charCode 183 |
| 13 | `state-nav-stress.spec.js:53` | SN-02: Deep-linking subtabs | `#/analytics/stock` | `analytics.ts` | Title `Stock health · Vels` | Ends with ` · Vels`, charCode 183 |
| 14 | `state-nav-stress.spec.js:53` | SN-02: Deep-linking subtabs | `#/customers/shoppers` | `customers.ts` | Title `Shoppers · Vels` | Ends with ` · Vels`, charCode 183 |
| 15 | `state-nav-stress.spec.js:53` | SN-02: Deep-linking subtabs | `#/settings/company` | `settings.ts` | Title `Company · Vels` | Ends with ` · Vels`, charCode 183 |
| 16 | `state-nav-stress.spec.js:53` | SN-02: Deep-linking subtabs | `#/settings/team` | `settings.ts` | Title `Team & roles · Vels` | Ends with ` · Vels`, charCode 183 |
| 17 | `state-nav-stress.spec.js:53` | SN-02: Deep-linking subtabs | `#/settings/billing` | `settings.ts` | Title `Billing · Vels` | Ends with ` · Vels`, charCode 183 |
| 18 | `state-nav-stress.spec.js:53` | SN-02: Deep-linking subtabs | `#/settings/notifications` | `settings.ts` | Title `Notifications · Vels` | Ends with ` · Vels`, charCode 183 |
| 19 | `state-nav-stress.spec.js:53` | SN-02: Deep-linking subtabs | `#/help/tickets` | `help.ts` | Title `My tickets · Vels` | Ends with ` · Vels`, charCode 183 |
| 20 | `state-nav-stress.spec.js:63` | SN-03: Section redirect | `#/analytics` -> `/overview` | `analytics.ts` | `waitForURL('**/#/analytics/overview')` | Canonical hash rewrite |
| 21 | `state-nav-stress.spec.js:63` | SN-03: Section redirect | `#/customers` -> `/stockists` | `customers.ts` | `waitForURL('**/#/customers/stockists')` | Canonical hash rewrite |
| 22 | `state-nav-stress.spec.js:63` | SN-03: Section redirect | `#/settings` -> `/account` | `settings.ts` | `waitForURL('**/#/settings/account')` | Canonical hash rewrite |
| 23 | `state-nav-stress.spec.js:63` | SN-03: Section redirect | `#/help` -> `/center` | `help.ts` | `waitForURL('**/#/help/center')` | Canonical hash rewrite |
| 24 | `state-nav-stress.spec.js:84` | SN-04: History Back/Forward | `#/settings/account` | `settings.ts` | Back/Forward history traversal | Title & hash restoration |
| 25 | `state-nav-stress.spec.js:115` | SN-05: 30 Rapid transitions | Multi-route transitions | All M2 modules | Zero uncaught page errors, lands on `#/orders/board` | Strict-mode `text=Pick` collision hazard |
| 26 | `adversarial_overlays.spec.js:271` | 4.1 Stockist in Finder | `#/customers/stockists` | `customers.ts` | `expect(page.locator('h3', { hasText: 'Juniper & Moss Apothecary' })).toBeVisible()` | **Stockist name in `<h3><b>`** |
| 27 | `adversarial_final_stress.spec.js:10` | 1.1 Export stock CSV | `#/dashboard/overview` | `settings.ts` | Download filename matching `/^Vels-stock-\d{4}-\d{2}-\d{2}\.csv$/` | CSV download format |
| 28 | `adversarial_final_stress.spec.js:78` | 1.3 QuickCreate action buttons | `#/customers/stockists` | `customers.ts` | Navigates to `#/customers/stockists` | Button click transitions cleanly |
| 29 | `adversarial_final_stress.spec.js:78` | 1.3 QuickCreate action buttons | `#/settings/team` | `settings.ts` | Navigates to `#/settings/team` | Button click transitions cleanly |

---

### 4.2 `help.ts` Symbol Mapping & De-obfuscation Plan

#### Obfuscated Symbol Mapping Table
| Obfuscated Identifier | Type / Signature | Semantic Replacement | Description / Role |
|-----------------------|------------------|----------------------|--------------------|
| `O` | `HTMLElement` | `pageContainer` | Root DOM container for help page view |
| `k` | `string` | `activeSubtab` | Active subtab identifier (`'center'` or `'tickets'`) |
| `A` | `Set<string>` | `mountedSubtabs` | Set tracking which subtabs have been mounted |
| `j` | `string[]` | `SUBTABS` | Available subtab array: `['center', 'tickets']` |
| `M(sub)` | `(sub: string) => HTMLElement` | `getSubtabElement` | Helper returning `[data-sub="${sub}"]` |
| `N(k)` | `(key: string) => HTMLElement` | `getKElement` | Helper returning `[data-k="${key}"]` |
| `P(sub)` | `(sub: string) => boolean` | `isSubtabVisible` | Checks if page is mounted, visible, and subtab matches |
| `F` | `Record<string, TopicMeta>` | `FAQ_TOPICS` | Topic definitions: `batches`, `stock`, `orders`, `buying`, `team`, `keys` |
| `I` | `FaqArticle[]` | `FAQ_ARTICLES` | 15 Knowledge base FAQ items with questions, answers, links, and keys |
| `L` | `string` | `faqSearchQuery` | Current text query entered into FAQ search input |
| `R` | `string` | `selectedFaqTopic` | Current category filter: `'all'` or specific category key |
| `z` | `Set<string>` | `expandedFaqItemIds` | Set of currently expanded FAQ item IDs in accordion |
| `B` | `string` | `prefilledTicketSubject` | Temporary stash for subject when redirecting from FAQ to ticket form |
| `V()` | `() => string` | `renderHelpCenterHtml` | Generates HTML markup for Help Center hero, search, categories, and FAQ list |
| `ie(article, query)` | `(article, query) => string` | `renderFaqItemHtml` | Generates HTML for a single accordion FAQ item with `<mark>` search highlight |
| `H(animate)` | `(animate: boolean) => void` | `filterAndRenderFaqList` | Filters articles by topic and search query, mounts into DOM, updates counters |
| `U(itemEl, forceOpen)` | `(el, force) => void` | `toggleFaqItem` | Animates FAQ accordion item open/close via GSAP & Flip, updates history URL |
| `W(articleId)` | `(id: string) => void` | `openFaqItemById` | Deep-links to FAQ article, clears filters if needed, scrolls into view |
| `ae()` | `() => void` | `initHelpCenterView` | Attaches event listeners for FAQ search, keyboard escape, topic chips, vote buttons |
| `G()` | `() => void` | `updateOpenTicketsStatus` | Calculates open and answered ticket counts from store, updates sidecard fact label |
| `oe()` | `() => void` | `animateHelpCenterEntry`| GSAP entrance animation for Help Center cards and rows |
| `se` | `string[]` | `TICKET_TOPICS` | Dropdown options: `Batches & QA`, `Stock & counts`, `Orders & returns`, etc. |
| `K` | `Record<string, [string, string]>` | `TICKET_STATUS_CONFIG`| Status styling metadata: `open` (`sky`), `answered` (`sage`), `closed` (`faint`) |
| `q` | `string` | `ticketFilterStatus` | Active filter chip for tickets: `'all'`, `'open'`, `'answered'`, `'closed'` |
| `J` | `string` | `ticketSearchQuery` | Query string for filtering tickets |
| `Y` | `Set<string>` | `expandedTicketIds` | Set of currently expanded ticket IDs in accordion |
| `X` | `string` | `freshTicketId` | Stashes ID of recently submitted ticket to apply highlight animation |
| `ce()` | `() => string` | `renderTicketsViewHtml` | Generates HTML markup for Support Tickets view with page header, form, list |
| `le(ticket, query)` | `(ticket, query) => string` | `renderTicketItemHtml` | Generates HTML for single ticket accordion item |
| `Z(animate)` | `(animate: boolean) => void` | `filterAndRenderTicketsList` | Filters tickets by status and query, renders list or empty states, updates stats |
| `Q(ticketEl, force)` | `(el, force) => void` | `toggleTicketItem` | Animates ticket accordion item open/close via GSAP, updates history URL |
| `ue(ticketId)` | `(id: string) => void` | `openTicketItemById` | Deep-links to ticket item, opens accordion, scrolls into view |
| `de()` | `() => void` | `initTicketsView` | Attaches form submit, input validation, char counter, solve/reopen button listeners |
| `fe()` | `() => void` | `animateTicketsEntry` | GSAP entrance animation for tickets view, pre-fills subject if `B` is populated |
| `pe(subtab)` | `(subtab: string) => void` | `activateSubtab` | Switches active subtab, mounts views lazily, triggers entry animations |
| `$(subtab, itemId)` | `(subtab, id) => void` | `handleDeepLink` | Routes deep-link parameter to either `openFaqItemById` or `openTicketItemById` |
| `page` | `FeaturePage` | `page` | Feature lifecycle contract export (`title`, `mount`, `enter`, `leave`) |

#### Subcomponent Decomposition Plan for `src/features/help/`
```
frontend/src/features/help/
├── help.ts                  # Main page entry point adhering to FeaturePage lifecycle
├── help.css                 # Existing styling
├── types.ts                 # FaqArticle, TopicMeta, TicketTopic, TicketStatus interfaces
├── data/
│   └── faq-data.ts          # Static FAQ_TOPICS, FAQ_ARTICLES, TICKET_TOPICS, TICKET_STATUS_CONFIG
└── subtabs/
    ├── center.ts            # Help Center FAQ search, accordion, category filtering, feedback voting
    └── tickets.ts           # Support Tickets view, interactive form, validation, status filters
```

---

### 4.3 Precise Invariants and Test Contracts

1. **Document Title Formatting**:
   - Template: `${pageTitle} \u00B7 Vels`
   - Middle dot character code **MUST BE 183 (`\u00B7`)**, not hyphen `-` or en-dash `–`.
   - Subtab string mappings:
     - `help/center`: `'Help center'` -> `'Help center · Vels'`
     - `help/tickets`: `'My tickets'` -> `'My tickets · Vels'`
     - `analytics/overview`: `'Reports'` -> `'Reports · Vels'`
     - `analytics/sales`: `'Sales'` -> `'Sales · Vels'`
     - `analytics/stock`: `'Stock health'` -> `'Stock health · Vels'`
     - `customers/stockists`: `'Stockists'` -> `'Stockists · Vels'`
     - `customers/shoppers`: `'Shoppers'` -> `'Shoppers · Vels'`
     - `settings/account`: `'Account'` -> `'Account · Vels'`
     - `settings/company`: `'Company'` -> `'Company · Vels'`
     - `settings/team`: `'Team & roles'` -> `'Team & roles · Vels'`
     - `settings/billing`: `'Billing'` -> `'Billing · Vels'`
     - `settings/notifications`: `'Notifications'` -> `'Notifications · Vels'`

2. **DOM Landmark Contracts**:
   - `#/analytics/overview`: Must contain visible text `'Annual Gross Revenue'`.
   - `#/customers/stockists`: Must contain visible text `'Stockists'`.
   - `#/settings/account`: Must contain visible text `'User Account'`.
   - `#/help/center`: Must contain visible text `'Help center'`.

3. **DOM Accessibility & Tag Contracts**:
   - Customer Stockist Card: Name **MUST BE** rendered inside `<h3><b>${name}</b></h3>` within `.cs-card__name`.
   - Hidden Views: Inactive subtab containers must have the `hidden` attribute, and `[hidden] { display: none !important; }` in CSS must never be removed.
   - Accordion Buttons: FAQ triggers must have `class="hp-q"`, `aria-expanded="true|false"`, and `aria-controls="ans-${id}"`.
   - Accordion Regions: FAQ answers must have `class="hp-a"`, `id="ans-${id}"`, `role="region"`, `aria-labelledby="q-${id}"`, and `hidden` attribute when closed.
   - Ticket Triggers: Ticket accordion buttons must have `class="hp-ticket__head"`, `aria-expanded="true|false"`, and `aria-controls="tk-${id}"`.

4. **Strict-Mode Selector Protection**:
   - **Zero "Pick" tokens**: FAQ answers, questions, categories, and labels in `help.ts` MUST NOT contain the word "Pick" or "pick" as an isolated word. Article `id: 'wholesale'` must retain:
     `"Both move New → Packing → Packed → Shipped → Delivered on the board."`

5. **Charts Widget Export Parity**:
   - `charts.ts` MUST export both target semantic names AND legacy names with single-letter aliases:
     - `renderLineChart` AND `createLineChart` AND alias `t`
     - `renderColumnBarChart` AND `createDonutChart` AND alias `n`
     - `renderDonutRingMeter` AND `createRingMeter` AND alias `r`
     - `renderRadialGaugeMeter` AND `createHorizontalBarChart` AND alias `a`
     - `renderSparklineSvg` AND `createSparkline` AND alias `s`
     - `renderGroupedBarChart` AND `createBarChart` AND alias `o`
     - `renderFanMeter` AND `createFanMeter` AND alias `i`

6. **Form Validation Contracts in `help.ts`**:
   - Subject input: `name="subject"`, `maxlength="90"`, validation error when `trimmed.length < 6`: `'Give it a subject of a few words.'`
   - Body textarea: `name="body"`, `maxlength="1200"`, validation error when `trimmed.length < 20`: `'Tell us a little more — at least a sentence.'`
   - Counter element: `[data-k="tk-count"]` displaying `${body.length} / 1200`.

7. **Storage Keys & Persistence Contracts**:
   - Stockist layout view: `localStorage.getItem('Vels:stockist-view')` (`'grid'` or `'list'`).
   - Theme: `localStorage.getItem('Vels:theme')` (`'"dark"'` or `'"light"'`).
   - Sidebar: `localStorage.getItem('Vels:side')` (`'1'` or `'0'`).
   - Store persistence: Debounced 250ms persistence to `localStorage.getItem('Vels:data:v2')`.

---

### 4.4 Concrete Guidelines for Worker Agent (Zero Regression Guarantee)

1. **Phase 1: Domain Types (`src/types/`)**:
   - Create `src/types/help.ts` defining `FaqArticle`, `TopicMeta`, `Ticket`, `TicketTopic`, and `TicketStatus`.
   - Update `src/types/store.ts` to ensure `AppState.tickets` is typed with the accurate `Ticket` interface (`id, number, subject, body, topic, status, at, reply?`) rather than the outdated mock.
   - Run `npm run typecheck` to verify zero type mismatches.

2. **Phase 2: Help Module Modularization (`src/features/help/`)**:
   - Extract `src/features/help/data/faq-data.ts` containing `FAQ_TOPICS`, `FAQ_ARTICLES`, `TICKET_TOPICS`, and `TICKET_STATUS_CONFIG`.
   - Verify that `FAQ_ARTICLES` contains **zero occurrences of "Pick"** (must use "Packing").
   - Extract `src/features/help/subtabs/center.ts` (Help Center view, FAQ search, accordion, highlighting, topic chips, feedback voting).
   - Extract `src/features/help/subtabs/tickets.ts` (Support Tickets view, interactive form, validation, character counter, status filtering, solve/reopen).
   - Refactor `src/features/help/help.ts` to clean, human-readable TypeScript orchestrating subtab activation, deep-linking, and `FeaturePage` lifecycle.
   - Run `npm run typecheck && npm run build && npx playwright test` to verify zero regressions.

3. **Phase 3: Visualization Engine (`src/shared/widgets/charts.ts`)**:
   - Clean up internal variable names in `charts.ts` (replace single-letter variables with semantic names: `container`, `series`, `labels`, `plotGroup`, `gridGroup`, `tooltip`, `curveGenerator`, etc.).
   - Ensure Catmull-Rom spline calculations `c()` and nice scale tick algorithm `s()` remain purely deterministic.
   - Retain dual function exports (`renderLineChart` / `createLineChart` / `t`, etc.) so consumers across M2 and M3 remain fully functional.
   - Run `npm run typecheck && npm run build && npx playwright test`.

4. **Phase 4: Auxiliary Modules (`customers.ts`, `settings.ts`, `analytics.ts`)**:
   - When modularizing `customers.ts`:
     - KEEP `<h3><b>${highlightSearchMatch(t.name, r)}</b></h3>` on `.cs-card__name`.
     - KEEP `title: 'Stockists'` landmark on `stockists` subtab.
   - When modularizing `settings.ts`:
     - KEEP `eyebrow: 'User Account — Your profile and how you sign in'` landmark on `account` subtab.
     - KEEP exact subtab titles: `Account`, `Company`, `Team & roles`, `Billing`, `Notifications`.
   - When modularizing `analytics.ts`:
     - KEEP `eyebrow: 'Annual Gross Revenue — Build a report from your own numbers'` landmark on `overview` subtab.
     - KEEP exact subtab titles: `Reports`, `Sales`, `Stock health`.
   - In all modules, ensure subtab containers retain `data-sub="${name}"` and `hidden` attribute toggling.

---

## 5. Features Discovered & Edge Cases

### Features Discovered
| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Help Module | Help Center FAQ Accordion | Knowledge base with 15 articles across 6 categories | Category filter, search query, click trigger | Expandable region with smooth GSAP Flip animation, chevron 180deg | Displays empty state if query has no matches | Code inspection (`help.ts:80-362`) |
| 2 | Help Module | Search Query Highlighting | Dynamic `<mark>` highlighting in question and answer text | Search input text query | Highlighted matching substrings | Case-insensitive regex escaping | Code inspection (`help.ts:245-247`) |
| 3 | Help Module | Deep-linking FAQ / Ticket | Direct URL hash navigation to individual article or ticket | `#/help/center/:id` or `#/help/tickets/:id` | Opens corresponding accordion item, scrolls into view | Replaces history state if ID not found | Code inspection (`help.ts:363-392`, `738-767`) |
| 4 | Help Module | Support Ticket Creation | Interactive form to submit customer support tickets | Subject (>=6 chars), Topic, Body (>=20 chars, max 1200) | Prepends ticket to `store.tickets`, displays toast, fresh animation | Inline elastic error animation on invalid fields | Code inspection (`help.ts:771-858`) |
| 5 | Help Module | Ticket Lifecycle Management | Change ticket state between open, answered, and closed | Click "That solved it" or "Reopen" buttons | Updates store ticket status, notifies subscribers, shows toast | Graceful no-op if ticket ID not found | Code inspection (`help.ts:879-896`) |
| 6 | Charts | Multi-Series Catmull-Rom Spline | Smooth spline curve rendering with nice-ticks Y axis | Series values, labels, tone | SVG path with area fill, hover crosshair, dot markers, tooltip | Clamps values to scale boundaries | Code inspection (`charts.ts:39-233`) |
| 7 | Charts | Column Bar Visualization | Vertical bars chart disguised under `createDonutChart` name | Categories, values, tone | Rendered column bars with stagger GSAP scaling | Handles zero values gracefully | Code inspection (`charts.ts:234-294`) |
| 8 | Charts | Pure SVG Donut Ring Meter | Circular percentage/part ring with animated dashoffset | Part values, tones, center text | SVG circles with animated stroke-dasharray | Total defaults to 1 if sum is 0 | Code inspection (`charts.ts:295-347`) |
| 9 | Charts | 240-Deg Radial Needle Gauge | Dial meter with rotating needle and tick marks | Percent value (0-1), threshold zones | Animated needle rotation, zone tone styling (`rose`/`ochre`/`sage`) | Clamps input between 0 and 1 | Code inspection (`charts.ts:348-461`) |
| 10 | Charts | Grouped Bar Chart with Toggles | Horizontal/vertical bar groups with series enable/disable | Grouped categories, multiple series values | Interactive bar groups, hot states, repositioned tooltip | Prevents disabling the last active series | Code inspection (`charts.ts:468-752`) |
| 11 | Charts | 180-Deg Fan Lines Meter | Semi-circular fan composed of 84 radial lines | Fractional value (0-1), format function | Progressively lit stroke lines with elastic GSAP tween | Clamps input between 0 and 1 | Code inspection (`charts.ts:753-840`) |
| 12 | Customers | Stockist Accessible Heading | Heading tag wrapping stockist card name for E2E test | Stockist data object | `<h3><b>${name}</b></h3>` | Fallback if name is empty | Test suite (`adversarial_overlays.spec.js:280`) |
| 13 | Customers | Grid vs List Layout Toggle | Customer view layout mode toggle with persistence | View buttons (`data-view="grid|list"`) | Class `.is-list` on `.cs-grid`, GSAP card reflow | Falls back to `'grid'` if localStorage unavailable | Code inspection (`customers.ts:246-257`) |
| 14 | Analytics | Multi-Subtab Revenue Reports | Overview, sales, and stock health reporting | Date range (30/90/ytd), Granularity (day/week/month) | Catmull-Rom line charts, KPI summary cards, CSV export | Displays empty state if no sales exist | Code inspection (`analytics.ts:480-547`) |
| 15 | Settings | Profile, Security & Team Mgmt | Complete settings interface across 5 subtabs | User input, role selection, theme triggers | Store mutations, toast confirmation, CSV data export | Validates email regex and password rules | Code inspection (`settings.ts:180-250`) |

### Edge Cases
| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | Help FAQ Accordion | FAQ answer text containing "Pick" | Causes Playwright strict mode violation when testing `#/orders/board` column `text=Pick`. M1 replaced "Pick" with "Packing". |
| 2 | Help Ticket Form | Subject with < 6 characters | Form submission halted; inline error `'Give it a subject of a few words.'` with elastic shake. |
| 3 | Help Ticket Form | Body with < 20 characters | Form submission halted; inline error `'Tell us a little more — at least a sentence.'` with elastic shake. |
| 4 | Help FAQ Deep-Link | Invalid/nonexistent FAQ item ID in hash | `W()` detects item does not exist, silently clears search, and resets URL to `/help/center`. |
| 5 | Help Ticket Deep-Link | Invalid/nonexistent ticket ID in hash | `ue()` detects ticket does not exist, resets filters, and resets URL to `/help/tickets`. |
| 6 | Charts Scale Calculation | Single value of 0 or negative numbers | `s()` returns fallback value of 1 to prevent division by zero or NaN viewBox coordinates. |
| 7 | Grouped Bar Chart Series | Toggling off the only remaining visible series | `toggle()` detects `d.filter(Boolean).length === 1 && d[e]`, returns `false` without hiding last series. |
| 8 | Customers Stockist Card | Search query with special regex characters | `highlightSearchMatch()` safely escapes characters to prevent RegExp runtime exceptions. |
| 9 | Subtab Hidden Views | Rapid route switching while animation in-flight | Elements retain `[hidden]` attribute; CSS `[hidden] { display: none !important; }` prevents locator bleeding. |

---

## 6. Verification Method

To independently verify the baseline and validate any worker changes against this specification:

```powershell
cd "E:\dashborad clone\frontend"

# 1. Typecheck: Verify 0 compilation errors across all modules
npm run typecheck

# 2. Production Build: Verify clean Vite build producing dist/ bundle
npm run build

# 3. Full E2E Test Suite: Run all 47 Playwright specifications
npx playwright test
```

### Invalidation Conditions
- Any removal or alteration of `<h3><b>...</b></h3>` wrapping stockist card names in `customers.ts`.
- Any re-introduction of the word "Pick" in FAQ answers or headings in `help.ts`.
- Any modification of subtab title strings away from `${pageTitle} \u00B7 Vels` (Unicode 183).
- Any omission of the landmark strings (`Annual Gross Revenue`, `Stockists`, `User Account`, `Help center`).
- Any removal of legacy export aliases (`a, i, n, o, r, s, t` or `create*`) in `charts.ts`.
- Any removal of `[hidden] { display: none !important; }` in CSS.
