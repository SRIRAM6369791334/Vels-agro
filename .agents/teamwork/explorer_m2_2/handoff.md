# Milestone 2: Auxiliary Modules (Customers & Settings) — Explorer Investigation & Modularization Plan

## 1. Observation

### 1.1 Codebase Inspection & Line Metrics
- **Customers Module**: `frontend/src/features/customers/customers.ts` (906 lines, 30,098 bytes)
  - Manages two primary subtabs: `stockists` and `shoppers`, plus an interactive customer detail profile drawer (`openDrawer`).
  - Contains minified identifiers (`ge`, `N`, `P`, `F`, `I`, `L`, `_e`, `ve`, `R`, `ye`, `z`, `B`, `be`, `xe`, `Se`, `V`, `H`, `U`, `W`, `Ce`, `we`, `Te`, `Ee`, `De`, `G`, `Oe`, `ke`, `K`, `q`, `J`, `Y`, `Ae`, `je`, `Me`, `X`, `Ne`, `Z`, `Pe`, `Q`, `Fe`, `Ie`, `Le`, `Re`, `ze`, `Be`, `Ve`, `$`).
  - Critical test fixture hook directly verified in `adversarial_overlays.spec.js:280`: Stockist card heading must wrap in `<h3><b>${highlightSearchMatch(t.name, r)}</b></h3>`.
  - Grid / List view toggle for stockists is persisted in `localStorage.getItem('Vels:stockist-view')` (`'grid' | 'list'`).
  - RFM metrics calculation (`z(customer)`): aggregates orders, non-cancelled count, lifetime revenue, last order date, average order value, 6-month monthly spend array, and unpaid wholesale balance.
  - Subscribes to store slices `'customers'` and `'orders'` via `findLocationById` (alias for `subscribeToStore`).

- **Settings Module**: `frontend/src/features/settings/settings.ts` (2,233 lines, 77,580 bytes)
  - Manages five subtabs: `account`, `company`, `team`, `billing`, and `notifications`.
  - Subtab router mapping defined in `Lt`:
    ```typescript
    const Lt = {
      account: 'Account',
      company: 'Company',
      team: 'Team & roles',
      billing: 'Billing',
      notifications: 'Notifications',
    };
    ```
  - Critical landmark verified in `state-nav-stress.spec.js:13`: `User Account` landmark located in the eyebrow of the Account page header (`User Account — Your profile and how you sign in`).
  - Subscribes to store slices `'team'`, `'settings'`, `'batches'`, `'products'`, plus modal backdrop triggers.
  - Team subtab (`team`): enforces seat limit validation against `store.settings.billing.seats`, seat allocation meter, invite teammate modal hook (`openInviteTeammateModal`), member status pills (`active`, `away`, `invited`), and role dropdown with permission matrix (`CATEGORY_NAMES`).
  - Billing subtab (`billing`): plans definitions (`Studio` $49/mo cap 5, `Growth` $149/mo cap 15, `Scale` $349/mo cap 50), 20% discount on yearly cycle, payment method credit card preview (`.st-cc`), seats stepper (`renderNumberStepper`), and invoice table with CSV download.
  - Notifications subtab (`notifications`): alert definitions (`lowStock`, `expiry`, `orders`, `poUpdates`, `returns`), email/push destinations, morning digest preview, and test alert trigger (`addNotification('stock', ...)`).
  - Appearance section in Account: theme switcher buttons (`light`, `dark`, `system`) and accent customizer (`renderAccentPickerHtml()` and `bindAccentPicker`).

- **Existing Domain Types Audit**:
  - `frontend/src/types/customer.ts`: Missing runtime fields `contact: string;`, `region: string;`, `since: number;`, and `note?: string;`.
  - `frontend/src/types/settings.ts`: `BillingSettings` previously had dummy plans (`'starter' | 'growth' | 'enterprise'` instead of `'Studio' | 'Growth' | 'Scale'`), missing `card` and `invoices` array. `NotificationSettings` had mismatching keys. `CompanySettings` had mismatching keys (`legal`, `phone`, `timezone`, `fiscalStart`).

---

## 2. Logic Chain

1. **DOM Accessibility & Landmark Invariants**:
   - In `customers.ts:188`, `we()` renders:
     ```html
     <span class="cs-card__name"><h3><b>${highlightSearchMatch(t.name, r)}</b></h3><small>${highlightSearchMatch(t.contact, r)}</small></span>
     ```
     `adversarial_overlays.spec.js:280` asserts: `await expect(page.locator('h3', { hasText: 'Juniper & Moss Apothecary' })).toBeVisible();`. Removing or flattening the `h3` or `b` wrapper causes immediate test failure.
   - In `settings.ts:183`, `We()` renders:
     ```typescript
     renderPageHeader({
       eyebrow: 'User Account — Your profile and how you sign in',
       title: 'Account',
     })
     ```
     `state-nav-stress.spec.js:13` asserts selector: `text=User Account`. Any alteration to this text breaks SN-01.

2. **Router & Subtab Lifecycle Protocol**:
   - `src/core/router.ts` maps `#/customers` -> default subtab `stockists` (`#/customers/stockists`), with subtab `shoppers` (`#/customers/shoppers`).
   - `src/core/router.ts` maps `#/settings` -> default subtab `account` (`#/settings/account`), with subtabs `company`, `team`, `billing`, `notifications`.
   - Title contract: `page.title` must return the plain subtab title (e.g. `'Stockists'`, `'Shoppers'`, `'Account'`, `'Company'`, `'Team & roles'`, `'Billing'`, `'Notifications'`). The router's `syncDocumentTitle` automatically appends ` · Vels` using Unicode middle dot (`\u00B7`, 183).

3. **Charts & Visualization Dependencies**:
   - `customers.ts` imports `{ createDonutChart, createSparkline }` from `../../shared/widgets/charts.ts`.
   - `createSparkline(values, tone, width, height)` generates pure SVG sparklines for stockist cards.
   - `createDonutChart(container, options)` (despite its name) renders vertical column mini-bars (`.bars__col`, `.bars__bar`, `.bars__lab`) for customer monthly spend in the drawer. It returns `{ play(delay), update(newValues) }`.
   - The refactored Customers module must preserve this binding.

4. **State Slices & Store Synchronization**:
   - Customers depends on: `store.customers`, `store.orders`, `store.products`. Subscribes to `'customers'` and `'orders'`.
   - Settings depends on: `store.settings`, `store.team`, `store.locations`, `store.batches`, `store.products`. Subscribes to `'team'`, `'settings'`, `'batches'`, `'products'`.
   - All mutations notify subscribers via `notifyStoreSubscribers(...)` (debounced 250ms persistence to localStorage `Vels:data:v2`).

---

## 3. Symbol-by-Symbol Mapping

### 3.1 Customers Module (`frontend/src/features/customers/customers.ts`)

| Obfuscated Identifier | Semantic TypeScript Identifier | Inferred Type | Semantic Role / Description |
|---|---|---|---|
| `ge` | `CUSTOMER_SUBTABS` | `readonly ['stockists', 'shoppers']` | Valid subtab identifiers for customers feature |
| `N` | `customersRootEl` | `HTMLElement \| null` | Top-level DOM container for customer views |
| `P` | `activeCustomerSubtab` | `'stockists' \| 'shoppers'` | Current active subtab state |
| `F` | `mountedSubtabSet` | `Set<string>` | Set of subtabs that have been rendered into DOM |
| `I(e)` | `getSubtabContainer` | `(subtab: string) => HTMLElement` | Queries container `[data-sub="${subtab}"]` |
| `L(e)` | `querySubtabKey` | `(key: string) => HTMLElement` | Queries element by `[data-k="${key}"]` |
| `_e(e)` | `isCustomerSubtabActive` | `(subtab: string) => boolean` | Checks if container is visible and subtab matches `e` |
| `ve` | `CUSTOMER_TAG_COLOR_VARS` | `Record<string, string>` | Map of tag ID (`vip`, `net30`, `new`, `subscriber`) to CSS color |
| `R(e)` | `renderCustomerTagBadge` | `(tag: string) => string` | HTML string generator for tag badge |
| `ye(e)` | `generateMonthlyBucketTimestamps` | `(monthsCount: number) => number[]` | Generates array of timestamps for monthly spend aggregation |
| `z(e)` | `calculateCustomerMetrics` | `(customer: Customer) => CustomerMetrics` | Computes RFM lifetime value: orders, revenue, avg, monthly, unpaid |
| `B(e)` | `buildCustomerMetricsMap` | `(kind: CustomerKind) => Map<string, CustomerMetrics>` | Builds Map of customer ID -> metrics |
| `be(e)` | `formatLastOrderRelative` | `(timestamp: number) => string` | Formats relative time or "No orders yet" |
| `xe(e, ...)` | `updateHeaderKpiStat` | `(root: HTMLElement, key: string, count: number, badge?: string, tone?: string) => void` | Updates KPI metric card and animates counter |
| `Se` | `STOCKIST_SORT_OPTIONS` | `readonly [string, string][]` | Sort options: `revenue`, `last`, `name`, `since` |
| `V` | `stockistSearchQuery` | `string` | Search filter query for stockists |
| `H` | `selectedStockistTag` | `string` | Selected tag filter for stockists (`'all'` or specific tag) |
| `U` | `stockistSortCriteria` | `string` | Current sort key for stockists (`'revenue' \| 'last' \| 'name' \| 'since'`) |
| `W` | `stockistViewMode` | `'grid' \| 'list'` | Layout mode for stockists (persisted in `Vels:stockist-view`) |
| `Ce()` | `computeStockistKpis` | `() => KpiStat[]` | Calculates summary KPIs for stockists header |
| `we(t, n, r)` | `renderStockistCardHtml` | `(customer: Customer, metrics: CustomerMetrics, query: string) => string` | Generates stockist card HTML with `<h3><b>...</b></h3>` |
| `Te()` | `mountStockistsSubtab` | `() => void` | Mounts stockists subtab DOM, toolbar, and registers listeners |
| `Ee()` | `animateStockistViewSwitch` | `() => void` | GSAP transition between grid and list layout |
| `De(e, t)` | `animateSparklineStrokes` | `(container: HTMLElement, delay?: number) => void` | Animates SVG strokeDashoffset of sparkline paths |
| `G(e)` | `renderStockistsList` | `(animate: boolean) => void` | Filters, sorts, and renders stockist cards / empty state |
| `Oe()` | `animateStockistsSubtabEnter` | `() => void` | Entry animation timeline for stockists subtab |
| `ke` | `shopperSearchQuery` | `string` | Search filter query for shoppers |
| `K` | `selectedShopperTag` | `string` | Selected tag filter for shoppers |
| `q` | `shopperSortField` | `string` | Table sort column (`'name'`, `'city'`, `'orders'`, `'spend'`, `'last'`) |
| `J` | `shopperSortDirection` | `1 \| -1` | Sort direction (`1` = ascending, `-1` = descending) |
| `Y` | `shopperPageLimit` | `number` | Pagination limit (starts at 25, +25 per click) |
| `Ae` | `SHOPPER_TABLE_COLUMNS` | `readonly [string, string, string][]` | Column definitions for shoppers table |
| `je()` | `computeShopperKpis` | `() => KpiStat[]` | Calculates summary KPIs for shoppers header |
| `Me()` | `mountShoppersSubtab` | `() => void` | Mounts shoppers subtab DOM, table, and registers listeners |
| `X(n)` | `renderShoppersTable` | `(animate: boolean) => void` | Filters, sorts, and renders shoppers table rows |
| `Ne()` | `animateShoppersSubtabEnter` | `() => void` | Entry animation timeline for shoppers subtab |
| `Z()` | `getDrawerElement` | `() => HTMLElement` | Returns `#drawer` element |
| `Pe(e)` | `executeWhenDrawerReady` | `(callback: () => void) => void` | Executes callback after drawer closing animation completes |
| `Q` | `activeDrawerCustomerState` | `{ id: string; el: HTMLElement; chart: any } \| null` | Active drawer instance and chart reference |
| `Fe` | `DRAWER_RECENT_ORDERS_LIMIT` | `6` | Maximum recent orders displayed in customer drawer |
| `Ie(t)` | `renderDrawerRecentOrders` | `(metrics: CustomerMetrics) => string` | HTML generator for recent order rows in drawer |
| `Le(e)` | `getCustomerTopProducts` | `(metrics: CustomerMetrics) => TopProductItem[]` | Computes top 4 products ordered by customer |
| `Re(t)` | `renderCustomerDrawerHtml` | `(customer: Customer) => string` | Generates full drawer HTML for customer profile |
| `ze(e)` | `openCustomerProfileDrawer` | `(customerId: string) => void` | Opens drawer, mounts mini-bar chart, and binds order actions |
| `Be()` | `refreshActiveDrawer` | `() => void` | Updates drawer counters, orders, and chart on store change |
| `Ve(e)` | `switchCustomerSubtab` | `(subtab: string) => void` | Switches active subtab, renders content, and triggers enter animation |
| `$()` | `refreshCustomerHeaderStats` | `(subtab: string) => void` | Updates KPI metric numbers for active subtab |

---

### 3.2 Settings Module (`frontend/src/features/settings/settings.ts`)

| Obfuscated Identifier | Semantic TypeScript Identifier | Inferred Type | Semantic Role / Description |
|---|---|---|---|
| `P` | `settingsRootEl` | `HTMLElement \| null` | Top-level DOM container for settings views |
| `Re` | `activeSettingsSubtab` | `SettingsSubtabKey` | Current active settings subtab |
| `ze` | `mountedSettingsSubtabs` | `Set<string>` | Set of mounted settings subtabs |
| `Be` | `SETTINGS_SUBTABS` | `readonly ['account', 'company', 'team', 'billing', 'notifications']` | Supported settings subtabs |
| `F(e)` | `getSettingsSubtabContainer` | `(subtab: string) => HTMLElement` | Queries container `[data-sub="${subtab}"]` |
| `I(e)` | `querySettingsElement` | `(key: string) => HTMLElement` | Queries element by `[data-k="${key}"]` |
| `L(e)` | `isSettingsSubtabActive` | `(subtab: string) => boolean` | Checks if subtab `e` is visible and active |
| `Ve` | `EMAIL_REGEX` | `RegExp` | Standard email validation regex |
| `R(e, t)` | `setFormFieldError` | `(inputEl: HTMLElement, err: string) => void` | Updates `aria-invalid` and shakes `.st-field__err` |
| `z(t)` | `renderInputFieldHtml` | `(config: InputFieldConfig) => string` | Renders standardized input field HTML with label & error |
| `He(t, n, r, i, a)` | `renderSelectFieldHtml` | `(name: string, label: string, val: string, opts: [string, string][], wide?: boolean) => string` | Renders select dropdown field HTML |
| `Ue(e)` | `triggerSavedFeedback` | `(container: HTMLElement) => void` | Animates `.st-saved` badge with bounce and fade out |
| `B` | `SAVED_BADGE_HTML` | `string` | Reusable saved badge HTML string |
| `V` | `MOCK_ACTIVE_SESSIONS` | `ActiveSession[]` | Mock session list (MacBook Pro, iPhone 16, iPad Air) |
| `We()` | `renderAccountSubtabHtml` | `() => string` | Account template with `User Account` landmark |
| `Ge()` | `renderActiveSessionsList` | `() => void` | Renders active sessions rows in Account subtab |
| `Ke()` | `hasUnsavedProfileChanges` | `() => boolean` | Returns true if profile form has modifications |
| `qe()` | `syncProfileDirtyState` | `() => void` | Enables/disables Save & Discard buttons based on dirtiness |
| `Je()` | `resetProfileFormValues` | `() => void` | Resets profile form inputs to current store values |
| `Ye()` | `syncThemeRadioButtons` | `() => void` | Updates `aria-pressed` on light/dark/system theme buttons |
| `Ze()` | `animateAccountSubtabEnter` | `() => void` | Entry animation for Account subtab |
| `Qe` | `MONTH_NAMES` | `readonly string[]` | List of 12 month names |
| `$e` | `TIMEZONE_OPTIONS` | `readonly [string, string][]` | US timezone options (Eastern, Central, Mountain, Pacific) |
| `et()` | `renderCompanySubtabHtml` | `() => string` | Company details, data exports, preferences, locations HTML |
| `tt()` | `hasUnsavedCompanyChanges` | `() => boolean` | Checks if company form has unsaved modifications |
| `nt()` | `syncCompanyDirtyState` | `() => void` | Enables/disables Save button on Company form |
| `rt(t)` | `renderCompanyLocations` | `(animate: boolean) => void` | Renders warehouse locations list with capacity meters |
| `it(e)` | `updateExpiringBatchesCount` | `(silent?: boolean) => void` | Counts expiring lots within current `expiryWarnDays` |
| `ot()` | `animateCompanySubtabEnter` | `() => void` | Entry animation for Company subtab |
| `st` | `ALL_ROLE_KEYS` | `readonly ['owner', 'admin', 'manager', 'staff', 'viewer']` | All system role keys |
| `ct` | `ASSIGNABLE_ROLE_KEYS` | `readonly ['admin', 'manager', 'staff', 'viewer']` | Roles that can be assigned to teammates |
| `lt` | `MEMBER_STATUS_CONFIG` | `Record<string, [string, string]>` | Status badge styling for `active`, `away`, `invited` |
| `ut` | `teamSearchQuery` | `string` | Search filter query for team members |
| `H` | `teamRoleFilter` | `string` | Selected role filter for team |
| `U()` | `countAllocatedSeats` | `() => number` | Number of team members with status !== `'invited'` |
| `dt()` | `renderTeamSubtabHtml` | `() => string` | Team members table, permission matrix, seats card HTML |
| `ft(t, n)` | `renderTeamMemberRowHtml` | `(member: TeamMember, query: string) => string` | Generates single team member table row HTML |
| `W(e)` | `renderTeamMembersTable` | `(animate: boolean) => void` | Filters and renders team member rows |
| `pt(e)` | `updateSeatMeterDisplay` | `(animate: boolean) => void` | Animates active vs invited seat meter bars |
| `mt()` | `updateTeamSummaryKpis` | `() => void` | Updates Members, Active, Invited, Seats left KPI counters |
| `ht(e)` | `animateMatrixCheckmarks` | `(delay?: number) => void` | Animates checkmark SVG path strokes in permissions matrix |
| `gt(e)` | `formatTenureDuration` | `(since: number) => string` | Formats tenure string ("X months on the team", etc.) |
| `_t(t)` | `openTeammateProfileDrawer` | `(memberId: string) => void` | Opens teammate profile drawer with permissions list |
| `yt()` | `animateTeamSubtabEnter` | `() => void` | Entry animation for Team subtab |
| `G` | `SUBSCRIPTION_PLANS` | `readonly PlanDefinition[]` | Plans: Studio ($49, cap 5), Growth ($149, cap 15), Scale ($349, cap 50) |
| `K(e, t)` | `calculatePlanMonthlyRate` | `(plan: PlanDefinition, cycle: 'monthly' \| 'yearly') => number` | Returns monthly rate (with 20% discount if yearly) |
| `q` | `invoiceFilterStatus` | `'all' \| 'paid' \| 'due'` | Filter state for invoices table |
| `bt()` | `renderBillingSubtabHtml` | `() => string` | Billing plans, payment method, seats stepper, invoices HTML |
| `xt(e)` | `detectCreditCardBrand` | `(cardNumber: string) => string` | Detects Visa, Mastercard, Amex, Discover from prefix |
| `St()` | `renderCreditCardPreview` | `() => void` | Renders 3D stylized credit card preview in Payment method |
| `Ct(e)` | `inferPlanFromInvoiceAmount` | `(amount: number) => string` | Matches invoice amount to plan name |
| `J(t)` | `renderInvoicesTable` | `(animate: boolean) => void` | Filters and renders invoices table rows |
| `wt()` | `calculateNextBillingDate` | `() => number` | Returns timestamp for 3rd of upcoming month |
| `Tt(e)` | `updatePlanCardHighlights` | `(animate: boolean) => void` | Updates current plan badge, prices, and button states |
| `Y(e)` | `updateSeatsStepperAndCost` | `(animate: boolean) => void` | Updates seats stepper, price per seat, and holders avatars |
| `Dt(e, t)` | `switchSubscriptionPlan` | `(targetPlan: string, btn: HTMLElement) => void` | Updates `store.settings.billing.plan` and notifies |
| `At(e, t)` | `downloadInvoiceCsv` | `(invoiceId: string, btn: HTMLElement) => void` | Downloads single invoice as CSV file |
| `Ot(e)` | `openUpdateCardModal` | `(anchor: HTMLElement) => void` | Opens modal to edit payment card brand, last4, exp, name |
| `kt(e)` | `openInvoiceDetailDrawer` | `(invoiceId: string) => void` | Opens invoice inspection drawer with breakdown |
| `Et(e)` | `handleSeatStepperChange` | `(newSeats: number) => void` | Validates seat count >= allocated members and updates store |
| `Mt()` | `animateBillingSubtabEnter` | `() => void` | Entry animation for Billing subtab |
| `X` | `NOTIFICATION_ALERT_DEFS` | `readonly NotificationAlertDef[]` | Low stock, expiry, orders, poUpdates, returns alert configs |
| `Z` | `notificationFilterStatus` | `'all' \| 'on' \| 'off'` | Filter state for alerts list |
| `Nt(t, n, r)` | `renderSwitchToggleHtml` | `(key: string, checked: boolean, label: string) => string` | Switch button markup (`role="switch" aria-checked="..."`) |
| `Pt()` | `renderNotificationsSubtabHtml`| `() => string` | Notifications alerts list, channels, morning digest HTML |
| `Q(t)` | `renderNotificationsAlertsList`| `(animate: boolean) => void` | Filters and renders alert rows with toggle switches |
| `$()` | `syncMorningDigestDisplay` | `() => void` | Updates morning digest enable state, time, and live counters |
| `It()` | `animateNotificationsEnter` | `() => void` | Entry animation for Notifications subtab |
| `Lt` | `SETTINGS_SUBTAB_TITLES` | `Record<string, string>` | Route title lookup dictionary |
| `Rt(e)` | `activateSettingsSubtab` | `(subtab: string) => void` | Handles subtab switching and mounts views |
| `zt(e, t)` | `handleSettingsDetailRoute` | `(subtab: string, detailId?: string) => void` | Handles deep-linking into teammate or invoice drawers |

---

## 4. Proposed Modular Architecture

### 4.1 Customers Module Architecture
```
frontend/src/features/customers/
├── customers.ts                # Main facade: FeaturePage contract, router lifecycle, store subscriptions
├── types.ts                    # CustomerMetrics, ViewMode, SortCriteria, TopProductItem
├── subtabs/
│   ├── stockists.ts            # Stockists directory: KPI aggregation, tag chips, layout switcher, sparklines
│   └── shoppers.ts             # Shoppers directory: KPI aggregation, column sorting, pagination, search
└── components/
    ├── stockist-card.ts        # Card markup generator, exact <h3><b>...</b></h3> heading contract
    ├── shopper-table.ts        # Table markup generator, person cell, spend, order count
    └── customer-drawer.ts      # Profile drawer, mini-column spend chart, order history, top bought products
```

### 4.2 Settings Module Architecture
```
frontend/src/features/settings/
├── settings.ts                 # Main facade: FeaturePage contract, router lifecycle, store subscriptions
├── types.ts                    # Extended AppSettings, PlanDefinition, NotificationAlertDef, ActiveSession
├── subtabs/
│   ├── account.ts              # Profile form, password meter, appearance (theme & accent), sessions list
│   ├── company.ts              # Trading & legal details, data exports, demo reset, stock preferences
│   ├── team.ts                 # Members table, role assignments, seat limit validation, permissions matrix
│   ├── billing.ts              # Plan cards, payment method card, seats stepper, invoices table
│   └── notifications.ts        # Alert toggles, email/push destinations, morning digest preview, test alert
└── components/
    ├── form-controls.ts        # renderInputField, renderSelectField, setFormFieldError, triggerSavedFeedback
    ├── credit-card-preview.ts  # Stylized payment card rendering & modal update dialog
    ├── teammate-drawer.ts      # Teammate detail drawer, contact, role permissions
    └── invoice-drawer.ts       # Invoice detail drawer, breakdown, CSV download trigger
```

---

## 5. Strict TypeScript Interface Contracts

### 5.1 Customers Domain Types (`src/types/customer.ts`)
```typescript
export type CustomerKind = 'stockist' | 'shopper';

export interface CustomerRfm {
  recencyDays: number;
  frequency: number;
  monetary: number;
  score?: number;
  segment?: string;
}

export interface Customer {
  id: string;
  name: string;
  kind: CustomerKind;
  contact: string;
  email: string;
  phone: string;
  city: string;
  region: string;
  since: number;
  tags: string[];
  note?: string;
  discountPct?: number;
  ordersCount?: number;
  totalSpent?: number;
  rfm?: CustomerRfm;
}

export interface CustomerMetrics {
  orders: any[];
  n: number;
  revenue: number;
  last: number;
  avg: number;
  monthly: number[];
  unpaid: number;
}

export interface TopProductItem {
  p: any;
  u: number;
}
```

### 5.2 Settings Domain Types (`src/types/settings.ts`)
```typescript
import { TeamMember } from './user';

export interface CompanySettings {
  name: string;
  legal: string;
  address: string;
  phone: string;
  email: string;
  taxId: string;
  currency: 'INR' | 'USD' | 'CAD' | 'EUR' | 'GBP';
  timezone: string;
  fiscalStart: string;
}

export interface CreditCardInfo {
  brand: string;
  last4: string;
  exp: string;
  name: string;
}

export interface BillingInvoice {
  id: string;
  at: number;
  amount: number;
  status: 'paid' | 'due';
}

export interface SubscriptionPlan {
  name: 'Studio' | 'Growth' | 'Scale';
  price: number;
  cap: number;
  blurb: string;
  feats: string[];
}

export interface BillingSettings {
  plan: 'Studio' | 'Growth' | 'Scale';
  seats: number;
  cycle: 'monthly' | 'yearly';
  card: CreditCardInfo;
  invoices: BillingInvoice[];
}

export interface NotificationSettings {
  lowStock: boolean;
  expiry: boolean;
  orders: boolean;
  poUpdates: boolean;
  returns: boolean;
  digest: boolean;
  digestAt?: string;
  email: boolean;
  push: boolean;
}

export interface StockPreferences {
  expiryWarnDays: number;
  lowStockMode: 'fixed' | 'cover';
  defaultLoc: string;
  weekStart: 'mon' | 'sun';
}

export interface AppSettings {
  goal: number;
  me: TeamMember;
  company: CompanySettings;
  billing: BillingSettings;
  notify: NotificationSettings;
  prefs: StockPreferences;
}

export interface ActiveSession {
  id: string;
  device: string;
  app: string;
  where: string;
  at: number;
  ico: string;
  me?: boolean;
}
```

---

## 6. Backward Compatibility Guarantees

1. **Feature Page Contract**:
   Both `customers.ts` and `settings.ts` must maintain default/named export:
   ```typescript
   export const page: FeaturePage = {
     title: (params?: string[]) => string,
     mount: (container: HTMLElement) => void,
     enter: (context: { params: string[]; same?: boolean }) => void,
     leave: () => void,
   };
   ```

2. **Router Deep-Linking Invariants**:
   - `#/customers/stockists` -> loads stockists grid/list, title `Stockists · Vels`.
   - `#/customers/shoppers` -> loads shoppers table, title `Shoppers · Vels`.
   - `#/customers/stockists/:id` & `#/customers/shoppers/:id` -> opens customer profile drawer, title `Stockists · <Name> · Vels` or `Shoppers · <Name> · Vels`.
   - `#/settings/account` -> loads Account settings with `User Account` landmark in eyebrow, title `Account · Vels`.
   - `#/settings/company` -> loads Company settings, title `Company · Vels`.
   - `#/settings/team` -> loads Team & roles, title `Team & roles · Vels`.
   - `#/settings/team/:id` -> opens teammate drawer.
   - `#/settings/billing` -> loads Billing, title `Billing · Vels`.
   - `#/settings/billing/:id` -> opens invoice drawer.
   - `#/settings/notifications` -> loads Notifications, title `Notifications · Vels`.

3. **DOM Selector & Landmark Preservation**:
   - `adversarial_overlays.spec.js:280`: `h3` containing `<b>Juniper & Moss Apothecary</b>` MUST be rendered inside `.cs-card__name`.
   - `state-nav-stress.spec.js:13`: `User Account` text MUST be rendered in the eyebrow of the Account subtab.
   - `state-nav-stress.spec.js:12`: `Stockists` text MUST be rendered in the title/landmark of the Stockists subtab.

4. **Shared Module Bindings**:
   - `../../shared/widgets/charts.ts`: `createDonutChart` and `createSparkline` must remain imported as-is.
   - `../../main.ts`: maintain compatibility bindings (`findLocationById`, `openNewCustomerModal`, `openNewOrderModal`, `openInviteTeammateModal`, `confirmDialog`, `showToast`, `openDrawer`, `closeDrawer`).

---

## 7. Verification Method

To independently verify the health and regression status of the codebase during and after refactoring:

```powershell
cd "e:\dashborad clone\frontend"

# 1. Typecheck: Zero compilation errors
npm run typecheck

# 2. Production Build: Produces dist/ bundle cleanly
npm run build

# 3. Targeted Customer & Settings Specs
npx playwright test tests/vessa.spec.js
npx playwright test tests/state-nav-stress.spec.js

# 4. Full Adversarial Suite
npx playwright test tests/adversarial_overlays.spec.js
npx playwright test tests/adversarial_final_stress.spec.js
```

### Invalidation Conditions
- Any refactoring that alters the `<h3><b>...</b></h3>` structure on stockist cards.
- Any change removing the `User Account` text from the Account page eyebrow.
- Any change altering subtab titles so that `<Subtab> · Vels` fails to match.
- Any discrepancy where `store.settings.notify` is renamed without maintaining store synchronization.
