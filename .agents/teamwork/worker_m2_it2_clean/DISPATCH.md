## 2026-11-03T11:25:04Z
You are worker_m2_it2_clean, a versatile implementation worker in the Teamwork multi-agent hierarchy.
Your working directory: E:\dashborad clone\.agents\teamwork\worker_m2_it2_clean
Your parent orchestrator is orchestrator_3.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

MANDATORY READING BEFORE WRITING CODE:
1. E:\dashborad clone\.agents\teamwork\ORIGINAL_REQUEST.md
2. E:\dashborad clone\PROJECT.md
3. E:\dashborad clone\TEST_INFRA.md and E:\dashborad clone\TEST_READY.md
4. The 3 Explorer blueprints:
   - E:\dashborad clone\.agents\teamwork\explorer_m2_it2_1\handoff.md (Charts & Analytics)
   - E:\dashborad clone\.agents\teamwork\explorer_m2_it2_2\handoff.md (Settings)
   - E:\dashborad clone\.agents\teamwork\explorer_m2_it2_3\handoff.md (Customers & Help)

YOUR MISSION:
Execute Milestone 2 Iteration 2: Cleanse and eliminate all legacy aliases and inverted re-exports imported from main.ts across the Milestone 2 codebase (Charts, Analytics, Settings, Customers, Help) strictly following the 3 Explorer blueprints.

SCOPE & EXCLUSIVE WRITE OWNERSHIP:
- E:\dashborad clone\frontend\src\core\motion.ts (add export `flashElement` per Settings blueprint)
- E:\dashborad clone\frontend\src\core\constants.ts and src\data\constants.ts (add export `ROLE_PERMISSIONS` per Settings blueprint)
- E:\dashborad clone\frontend\src\main.ts (export `onThemeChange`, `flashElement`, keep backward-compat re-exports for external/unmigrated modules)
- E:\dashborad clone\frontend\src\shared\widgets\charts\ and charts.ts
- E:\dashborad clone\frontend\src\features\analytics\ (all subtabs and services)
- E:\dashborad clone\frontend\src\features\settings\ (all subtabs and components)
- E:\dashborad clone\frontend\src\features\customers\ (all subtabs and components)
- E:\dashborad clone\frontend\src\features\help\ (all subtabs and data)

KEY REQUIREMENTS:
1. Replace all legacy obfuscated aliases with canonical domain primitives:
   - `getAvailableLocations` -> `animateCounter` from `src/core/motion.ts`
   - `openNewTransferModal` (on buttons/chips) -> `playHaptic` from `src/core/motion.ts`
   - `bindMagnetic()` (invoked as boolean reduced-motion check) -> `prefersReducedMotion.matches` from `src/core/motion.ts`
   - `openMoveStockModal(container)` -> `bindMagnetic(container)` from `src/core/motion.ts`
   - `getAvailableSuppliers` -> `flashElement` / `animatePulse` from `src/core/motion.ts`
   - `findLocationById('slice', cb)` -> `subscribeToStore('slice', cb)` from `src/core/store.ts`
   - `exportDataBackup(id)` -> `findLocationById(id)` from `src/core/store.ts`
   - `createDonutChart` (on vertical column bars) -> `renderColumnBarChart` from `src/shared/widgets/charts`
   - `createHorizontalBarChart` (on radial gauges) -> `renderRadialGaugeMeter` from `src/shared/widgets/charts`
   - `TRANSFER_STATUS_TONES` in settings -> direct user id `'m-okafor'`
   - `CATEGORY_NAMES` in team.ts -> `ROLE_PERMISSIONS`
   - `formatShortDate as string[]` in stats-cache.ts -> `CATEGORY_NAMES`
   - `renderProgressBar` (in stock-calculator.ts) -> `calculateProductDaysOfCover`
2. Direct all utility and formatters imports to `src/utils/dom.ts`, `src/utils/formatters.ts`, `src/utils/icons.ts`, and `src/core/store.ts`.
3. Preserve all critical test invariants:
   - `<h3><b>${highlightSearchMatch(customer.name, query)}</b></h3>` in stockist-card.ts line 40
   - No isolated "Pick" tokens in help FAQ data (must remain "Packing")
   - All DOM data attributes (`data-ds`, `data-col`, `data-k`, `data-stat`, etc.)
4. Verification:
   Run build and tests in `E:\dashborad clone\frontend`:
   - `npm run typecheck`
   - `npm run build`
   - `npx playwright test`
   All must pass with 0 errors!
5. Update your progress.md regularly with timestamps.
6. Write a comprehensive, self-contained handoff.md in your working directory and notify parent via send_message.

## 2026-11-03T11:58:49Z
**From**: ae566e79-d63c-438b-bf84-bedabf298ad2
**Context**: Milestone 2 Iteration 2 Legacy Alias Cleansing
**Content**: Checking in on your current stream progress and test status.
**Action**: Please provide a brief status update on which streams (Charts, Analytics, Settings, Customers, Help) have been completed and if you are running the final verification suite.
