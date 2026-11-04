## 2026-11-03T10:51:09Z
You are the Worker agent for Milestone 2 Iteration 2: Legacy Alias Cleansing & Architectural Refinement.

MANDATORY INPUTS (READ BEFORE STARTING):
- Original User Request: E:\dashborad clone\.agents\teamwork\ORIGINAL_REQUEST.md
- Master Project Architecture: E:\dashborad clone\PROJECT.md
- Reviewer REQUEST_CHANGES Report: E:\dashborad clone\.agents\teamwork\reviewer_m2_1\handoff.md
- Explorer Handoff 1 (Charts & Analytics): E:\dashborad clone\.agents\teamwork\explorer_m2_it2_1\handoff.md
- Explorer Handoff 2 (Settings): E:\dashborad clone\.agents\teamwork\explorer_m2_it2_2\handoff.md
- Explorer Handoff 3 (Customers & Help): E:\dashborad clone\.agents\teamwork\explorer_m2_it2_3\handoff.md
- Your Working Directory: E:\dashborad clone\.agents\teamwork\worker_m2_it2

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

EXCLUSIVE WRITE OWNERSHIP:
You exclusively own and may edit files in:
- frontend/src/shared/widgets/charts/ and frontend/src/shared/widgets/charts.ts
- frontend/src/features/analytics/
- frontend/src/features/customers/
- frontend/src/features/settings/
- frontend/src/features/help/
- frontend/src/types/

MISSION:
Execute the exact remediation blueprints established in the 3 explorer handoffs to cleanse all lingering legacy aliases from `src/main.ts` and replace them with canonical imports from `src/core/motion.ts`, `src/core/constants.ts`, `src/core/store.ts`, and `src/shared/widgets/charts/`:

1. Visualization Engine & Charts (`shared/widgets/charts/`):
   - In `radial-gauge-meter.ts` and `fan-meter.ts`: replace `getAvailableLocations` with `animateCounter` from `src/core/motion.ts`.
   - In `grouped-bar-chart.ts`: replace boolean `bindMagnetic()` with `prefersReducedMotion.matches` from `src/core/motion.ts`.
   - In `line-chart.ts`: replace `formatDateInput(cb)` with `requestAnimationFrame(cb)`.

2. Analytics Module (`features/analytics/`):
   - In `overview.ts`: replace `getAvailableLocations` with `animateCounter`, `bindMagnetic()` with `prefersReducedMotion.matches`, `createDonutChart` with `renderColumnBarChart`, `openNewTransferModal` with `playHaptic`.
   - In `stock.ts`: replace `getAvailableLocations` with `animateCounter`, `openMoveStockModal` with `bindMagnetic`, `renderProgressBar` with `calculateProductDaysOfCover`, `exportDataBackup` with `findLocationById`, `getMaterialStock` with `getAvailableStock`, `openNewTransferModal` with `playHaptic`, `bindModalDismiss` with `morphReplace`.
   - In `sales.ts`: replace `renderFilterBar` with `animateCounter`.
   - In `services/stats-cache.ts`: replace `formatShortDate as string[]` with `CATEGORY_NAMES` from `src/core/constants.ts`, `getLastMonthValue()` with `getTotalInventoryValue()`.
   - In `analytics.ts`: replace `findLocationById` with `subscribeToStore` from `src/core/store.ts`.

3. Settings Module (`features/settings/`):
   - Across all subtabs: replace `openNewTransferModal` with `playHaptic`, `getAvailableLocations` with `animateCounter`, `bindMagnetic()` with `prefersReducedMotion.matches`.
   - In `team.ts`: replace `openMoveStockModal` with `bindMagnetic`, `CATEGORY_NAMES` with `ROLE_PERMISSIONS`.
   - In `account.ts`: replace `TRANSFER_STATUS_TONES` with avatar ID `'m-okafor'` (or `me.id`).
   - In `company.ts` & `billing.ts`: replace `getAvailableSuppliers` with `flashElement`.
   - In `settings.ts`: replace `findLocationById` with `subscribeToStore`.

4. Customers Module (`features/customers/`):
   - Across all subtabs & drawer: replace `openNewTransferModal` with `playHaptic`, `bindMagnetic()` with `prefersReducedMotion.matches`, `openMoveStockModal` with `bindMagnetic`.
   - In `customer-drawer.ts`: replace `createDonutChart` with `renderColumnBarChart`.
   - Strictly PRESERVE invariant: `<h3><b>${highlightSearchMatch(name, query)}</b></h3>` in `stockist-card.ts:40`.

5. Help Module (`features/help/`):
   - Across all subtabs: replace `openNewTransferModal` with `playHaptic`, `bindMagnetic()` with `prefersReducedMotion.matches`.
   - Strictly PRESERVE invariant: Zero isolated "Pick" tokens in `faq-data.ts`.

VERIFICATION:
Run all commands from `E:\dashborad clone\frontend`:
1. `npm run typecheck` (`tsc --noEmit`) -> Must exit with code 0.
2. `npm run build` (`vite build`) -> Must exit with code 0.
3. `npx playwright test` -> All 47 tests across all 4 suites must pass (100% green).

OUTPUT REQUIREMENTS:
Write your structured handoff to `E:\dashborad clone\.agents\teamwork\worker_m2_it2\handoff.md`.
Update `progress.md` and notify parent orchestrator via `send_message` when done.
