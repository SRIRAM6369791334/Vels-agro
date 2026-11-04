## 2026-11-03T09:28:48Z

You are the Worker agent for Milestone 2: Visualization Engine & Auxiliary Modules.

MANDATORY INPUTS (READ THESE BEFORE STARTING):
- Original User Request: E:\dashborad clone\.agents\teamwork\ORIGINAL_REQUEST.md
- Master Project Architecture: E:\dashborad clone\PROJECT.md
- Test Infra & Specs: E:\dashborad clone\TEST_INFRA.md and E:\dashborad clone\TEST_READY.md
- Explorer Handoff (Charts & Analytics): E:\dashborad clone\.agents\teamwork\explorer_m2_1\handoff.md
- Explorer Handoff (Customers & Settings): E:\dashborad clone\.agents\teamwork\explorer_m2_2\handoff.md
- Spec Miner Handoff (Help & Invariants): E:\dashborad clone\.agents\teamwork\spec_miner_m2\handoff.md
- Previous Worker Handoff: E:\dashborad clone\.agents\teamwork\worker_m1\handoff.md
- Your Working Directory: E:\dashborad clone\.agents\teamwork\worker_m2

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

EXCLUSIVE WRITE OWNERSHIP:
You exclusively own and may modify or create files in:
- frontend/src/shared/widgets/charts.ts and frontend/src/shared/widgets/charts/
- frontend/src/features/analytics/
- frontend/src/features/customers/
- frontend/src/features/settings/
- frontend/src/features/help/
- frontend/src/types/customer.ts, frontend/src/types/settings.ts, frontend/src/types/analytics.ts, frontend/src/types/help.ts, and frontend/src/types/index.ts

TASK & ARCHITECTURAL OBJECTIVES:
1. De-obfuscate and modularize the Visualization Engine:
   - Separate math algorithms (Catmull-Rom cubic Bezier path generation and nice scale ticks).
   - Implement semantic function names (`renderLineChart`, `renderColumnBarChart`, `renderDonutRingMeter`, `renderRadialGaugeMeter`, `renderSparklineSvg`, `renderGroupedBarChart`, `renderFanMeter`).
   - Retain full backward-compatibility exports (`createLineChart`, `createDonutChart`, `createRingMeter`, `createHorizontalBarChart`, `createSparkline`, `createBarChart`, `createFanMeter`, and single-letter aliases `a, i, n, o, r, s, t`) so unrefactored modules from Milestone 3 continue to function seamlessly.
2. De-obfuscate and modularize the Analytics Module (`features/analytics/`):
   - Modularize subtabs (`overview`, `sales`, `stock`) and services (`stats-cache`, `stock-calculator`).
   - Preserve title mappings: `overview` -> `'Reports'`, `sales` -> `'Sales'`, `stock` -> `'Stock health'`.
   - Preserve `Annual Gross Revenue` landmark in overview.
3. De-obfuscate and modularize the Customers Module (`features/customers/`):
   - Modularize subtabs (`stockists`, `shoppers`), customer profile drawer, and RFM calculations.
   - CRITICAL INVARIANT: Customer stockist card name MUST be rendered as `<h3><b>${highlightSearchMatch(name, query)}</b></h3>` in `.cs-card__name`.
   - Preserve grid/list layout persistence and drawer chart.
4. De-obfuscate and modularize the Settings Module (`features/settings/`):
   - Modularize 5 subtabs (`account`, `company`, `team`, `billing`, `notifications`).
   - CRITICAL INVARIANT: Preserve `User Account` landmark in Account eyebrow.
   - Enforce seat limit validation against billing seats, plan definitions (`Studio`, `Growth`, `Scale`), CSV export filenames (`/^Vels-stock-\d{4}-\d{2}-\d{2}\.csv$/`).
5. De-obfuscate and modularize the Help Module (`features/help/`):
   - Modularize subtabs (`center`, `tickets`).
   - CRITICAL INVARIANT: Strictly ZERO isolated "Pick" tokens in FAQ answers (keep `"Both move New → Packing → Packed → Shipped → Delivered on the board."`) to prevent strict-mode locator collision with `#/orders/board`.
   - Preserve ticket form validation, counter, solve/reopen actions.
6. Enrich Domain Types in `src/types/`:
   - Fill in actual runtime models for Customer, Settings, Analytics, and Help.

VERIFICATION PROTOCOL:
You MUST run all verification commands from `E:\dashborad clone\frontend`:
1. `npm run typecheck` (`tsc --noEmit`) -> Must exit with code 0 (zero errors).
2. `npm run build` (`vite build`) -> Must exit with code 0.
3. `npx playwright test` -> All 47 tests across all 4 suites must pass (100% GREEN).

OUTPUT REQUIREMENTS:
Write your structured completion report to `E:\dashborad clone\.agents\teamwork\worker_m2\handoff.md` following the Handoff Protocol (Observation, Logic Chain, Caveats, Conclusion, Verification Method).
Update your `progress.md` in your working directory and notify the parent orchestrator via `send_message` when done.
