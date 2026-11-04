## 2026-11-03T13:18:23Z
You are worker_m3, a versatile implementation worker in the Teamwork multi-agent hierarchy.
Your working directory: E:\dashborad clone\.agents\teamwork\worker_m3
Your parent orchestrator is orchestrator_3.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

MANDATORY READING BEFORE WRITING CODE:
1. E:\dashborad clone\.agents\teamwork\ORIGINAL_REQUEST.md
2. E:\dashborad clone\PROJECT.md
3. E:\dashborad clone\TEST_INFRA.md and E:\dashborad clone\TEST_READY.md
4. The 3 Explorer blueprints:
   - E:\dashborad clone\.agents\teamwork\explorer_m3_1\handoff.md (Dashboard & Products)
   - E:\dashborad clone\.agents\teamwork\explorer_m3_2\handoff.md (Orders & Purchasing)
   - E:\dashborad clone\.agents\teamwork\explorer_m3_3\handoff.md (Warehouses & Shell Decoupling)

YOUR MISSION:
Execute Milestone 3: Modularize, de-obfuscate, and cleanly architect the Core Transactional & Inventory Modules:
1. **Shared Primitives Additions**:
   - `src/core/motion.ts`: add `animateFloatBadge` and `animateFloatIndicator`.
   - `src/utils/formatters.ts`: add `formatMonogram`.
   - `src/utils/dom.ts`: add `copyToClipboard`.
   - `src/ui/prompt-dialog.ts`: extract generic form dialog runner `$c` (`openPromptDialog`).
2. **Dashboard Module (`src/features/dashboard/`)**:
   - Deconstruct into `dashboard.ts` (FeaturePage coordinator), `services/dashboard-metrics.ts`, `components/card-expand.ts`, and subtabs (`overview.ts`, `activity.ts`, `alerts.ts`).
   - Cleanse all 21 obfuscated aliases per Explorer 1 blueprint.
3. **Products Module (`src/features/products/`)**:
   - Deconstruct into `products.ts` (FeaturePage coordinator), `services/product-service.ts`, `services/batch-service.ts`, `components/batch-drawer.ts`, and subtabs (`catalog.ts`, `item.ts`, `batches.ts`).
   - Cleanse all obfuscated aliases and preserve all test text landmarks.
4. **Orders Module (`src/features/orders/`)**:
   - Deconstruct into `orders.ts` (FeaturePage coordinator), `services/order-metrics.ts`, `components/order-drawer.ts`, `components/return-drawer.ts`, and subtabs (`all.ts`, `board.ts`, `returns.ts`).
   - Preserve critical test invariant in Kanban board: "Pick, pack and ship" text in board header/legend for `state-nav-stress.spec.js:8`.
   - Cleanse all 13 obfuscated aliases per Explorer 2 blueprint.
5. **Purchasing Module (`src/features/purchasing/`)**:
   - Deconstruct into `purchasing.ts` (FeaturePage coordinator), `services/purchasing-metrics.ts`, `services/po-actions.ts`, `components/po-drawer.ts`, `components/supplier-drawer.ts`, `components/material-drawer.ts`, and subtabs (`orders.ts`, `suppliers.ts`, `materials.ts`).
   - Fix the critical PO mutation swapping trap (establish canonical `sendPurchaseOrder`, `receivePurchaseOrder`, `cancelPurchaseOrder`).
   - Cleanse all 12 obfuscated aliases per Explorer 2 blueprint.
6. **Warehouses Module (`src/features/warehouses/`) & Shell Modals**:
   - Deconstruct into `warehouses.ts` (FeaturePage coordinator), `services/bin-allocator.ts`, `services/warehouse-metrics.ts`, `services/transfer-service.ts`, `components/facility-card.ts`, `components/bin-map.ts`, `components/bin-tooltip.ts`, `components/transfer-card.ts`, `components/count-sheet-drawer.ts`, and subtabs (`locations.ts`, `transfers.ts`, `counts.ts`).
   - Colocate domain modals in `modals/move-stock-modal.ts` and `modals/schedule-count-modal.ts`.
   - Cleanse all 11 obfuscated aliases per Explorer 3 blueprint.
7. **Main Shell Backward-Compatibility**:
   - Maintain clean backward-compatibility re-exports in `main.ts` so all external consumers, topbar Quick Create, and test suites continue to resolve with zero breaks.

VERIFICATION COMMANDS:
Run build and tests in `E:\dashborad clone\frontend`:
- `npm run typecheck`
- `npm run build`
- `npx playwright test`
All 85+ tests must pass with 0 errors!

Document full execution and verification results in `E:\dashborad clone\.agents\teamwork\worker_m3\handoff.md` and notify parent orchestrator via send_message.
