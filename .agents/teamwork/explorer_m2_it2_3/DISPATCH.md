## 2026-11-03T10:36:04Z
You are an Explorer agent for Milestone 2 Iteration 2: Legacy Alias Cleansing (Customers & Help Modules).

MANDATORY INPUTS:
- Original User Request: E:\dashborad clone\.agents\teamwork\ORIGINAL_REQUEST.md
- Master Project Architecture: E:\dashborad clone\PROJECT.md
- Reviewer Handoff (REQUEST_CHANGES Evidence): E:\dashborad clone\.agents\teamwork\reviewer_m2_1\handoff.md (READ THIS CAREFULLY)
- Working Directory: E:\dashborad clone\.agents\teamwork\explorer_m2_it2_3

MISSION:
Investigate and locate every lingering legacy alias import from `src/main.ts` inside:
- `frontend/src/features/customers/` (all subtabs, components, services)
- `frontend/src/features/help/` (all subtabs, data)

Specifically locate and map:
1. `openNewTransferModal` used for button click haptics in stockists, shoppers, center, etc. -> replace with `playHaptic` from `src/core/motion.ts`.
2. `bindMagnetic()` used as reduced motion check -> replace with `prefersReducedMotion` from `src/core/motion.ts`.
3. Mini bar chart in customer drawer invoked as `createDonutChart` -> replace with `renderColumnBarChart` or semantic call.
4. Verify that critical invariants remain untouched:
   - `<h3><b>${highlightSearchMatch(name, query)}</b></h3>` in customer card heading.
   - Zero isolated "Pick" tokens in help FAQ answers.
5. Identify all other imports from `main.ts` that can be imported directly from `src/core/motion.ts`, `src/core/constants.ts`, or `src/core/store.ts`.

OUTPUT REQUIREMENTS:
Write your remediation plan and exact file/line findings to `E:\dashborad clone\.agents\teamwork\explorer_m2_it2_3\handoff.md`.
Update `progress.md` and notify parent orchestrator via send_message when done.
