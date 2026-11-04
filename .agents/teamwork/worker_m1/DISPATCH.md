# Dispatch — worker_m1

## Objective
Implement Milestone 1: **Core Architecture, Router & Shared Shell**.
Refactor `src/main.ts` and extract modular TypeScript components with full backward compatibility aliases, fix the router and title bugs, ensure badge unmounting, and pass baseline Playwright tests.

## Mandatory Reading & Authoritative Inputs
- Read `E:\dashborad clone\.agents\teamwork\ORIGINAL_REQUEST.md` first.
- Read `E:\dashborad clone\PROJECT.md`.
- Read the findings and symbol mapping in:
  - `E:\dashborad clone\.agents\teamwork\explorer_survey_1\handoff.md` and `analysis.md`
  - `E:\dashborad clone\.agents\teamwork\explorer_survey_2\handoff.md` and `analysis.md`
  - `E:\dashborad clone\.agents\teamwork\explorer_survey_3\handoff.md` and `analysis.md`

## Exclusive File Ownership
You exclusively own and may modify or create:
- `frontend/src/main.ts`
- `frontend/src/core/*` (`router.ts`, `store.ts`, `motion.ts`, `constants.ts`)
- `frontend/src/ui/*` (`popover.ts`, `modal.ts`, `finder.ts`, `toast.ts`)
- `frontend/src/types/*` (all domain types: `product.ts`, `order.ts`, `purchasing.ts`, `warehouse.ts`, `customer.ts`, `settings.ts`, `analytics.ts`, `common.ts`, `index.ts`)
- `frontend/index.html` (only if necessary for bell badge or scrim)
- `frontend/tsconfig.json`

## Detailed Implementation Tasks
1. **Domain Types (`src/types/`)**:
   - Provide clean, comprehensive TypeScript definitions for all domain entities.
   - Include runtime fields discovered during survey (`Product.bom`, `Product.reorderQty`, `Batch.madeAt`, `Batch.chemistId`, `SalesOrder.tracking`, `Material.kind`, `Material.code`, `CycleCount.status = 'counting' | 'done'`, etc.).
2. **Core Router (`src/core/router.ts`)**:
   - Fix hash routing: Keep hash routing (`#/path`), do not strip `#` with `history.replaceState`.
   - Ensure browser back/forward history traversal works seamlessly.
   - Fix document title: Use middle dot ` · Vels` (unicode character 183 `\u00B7`), e.g., `${subtabTitle} · Vels`, matching test expectations.
3. **Core Store (`src/core/store.ts`)**:
   - Central reactive store `store`, slice subscription engine `subscribeToStore`, and 250ms debounced localStorage persistence.
4. **Motion & UI Helpers (`src/core/motion.ts`, `src/ui/*`)**:
   - GSAP animation helpers (`animateCounter`, `animatePulse`, `morphReplace`, `playHaptic`).
   - Context menus, tooltips (`initTooltips`), modals (`openPromptDialog`), command palette `#finder` with proper `.scrim` backdrop.
   - Notification toast & bell badge: When unread notifications count is 0, completely unmount `#bell-badge` or remove it from the DOM (so `expect(locator).toHaveCount(0)` passes).
5. **Main Bootstrap & Backward Compatibility (`src/main.ts`)**:
   - Wire up the application bootstrap.
   - Export both canonical clean names AND backward compatibility aliases (`findLocationById`, `getAvailableLocations`, `exportDataBackup`, `bindModalDismiss`, `openMoveStockModal`, `openQuickCreateModal`, `createCustomElement`, `openNewBatchModal`, etc.) so that existing modules `dashboard.ts`, `products.ts`, etc. continue to work seamlessly without breaking.
6. **Verification Requirements**:
   - Run from `frontend`:
     - `npm run typecheck`
     - `npm run build`
     - `npm run test` (or `npx playwright test`)
   - Document commands, exit codes, and test results in `handoff.md`.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Deliverables
- Write progress to `E:\dashborad clone\.agents\teamwork\worker_m1\progress.md`.
- Write your complete handoff report to `E:\dashborad clone\.agents\teamwork\worker_m1\handoff.md`.
- Send a completion message to the orchestrator.


## 2026-11-03T07:26:48Z
You are worker_m1.
Your working directory is: E:\dashborad clone\.agents\teamwork\worker_m1
Original request file: E:\dashborad clone\.agents\teamwork\ORIGINAL_REQUEST.md
Dispatch instructions: E:\dashborad clone\.agents\teamwork\worker_m1\DISPATCH.md
Project specification: E:\dashborad clone\PROJECT.md

Read ORIGINAL_REQUEST.md, PROJECT.md, and DISPATCH.md carefully before starting work.
Review the explorer survey reports in:
- E:\dashborad clone\.agents\teamwork\explorer_survey_1\handoff.md and analysis.md
- E:\dashborad clone\.agents\teamwork\explorer_survey_2\handoff.md and analysis.md
- E:\dashborad clone\.agents\teamwork\explorer_survey_3\handoff.md and analysis.md

Implement Milestone 1: Core Architecture, Router & Shared Shell in E:\dashborad clone\frontend.
Extract src/core/router.ts, src/core/store.ts, src/core/motion.ts, src/ui/*, src/types/*.
Fix hash routing, document title (middle dot · Vels), notification badge unmounting, and scrim.
Ensure main.ts provides full backward compatibility exports for existing modules.
Run verification commands: npm run typecheck, npm run build, npm run test.
Write progress to E:\dashborad clone\.agents\teamwork\worker_m1\progress.md and handoff report to E:\dashborad clone\.agents\teamwork\worker_m1\handoff.md.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

When finished, send a message to the orchestrator with your results.

## 2026-11-03T08:09:06Z
**Context**: Milestone 1 Execution Status Query
**Content**: Checking on your verification progress. How are the Playwright test suites progressing (`vessa.spec.js`, `state-nav-stress.spec.js`, `adversarial_overlays.spec.js`, `adversarial_final_stress.spec.js`)?
**Action**: Please provide a brief status update on your test results or finalize your handoff.md if testing is complete.
