## 2026-11-03T09:12:41Z
You are a Spec Miner agent for Milestone 2: Help Module & Test Invariants.

MANDATORY INPUTS:
- Original User Request: E:\dashborad clone\.agents\teamwork\ORIGINAL_REQUEST.md (READ THIS FIRST)
- Master Project Architecture: E:\dashborad clone\PROJECT.md
- Test Infra & Specs: E:\dashborad clone\TEST_INFRA.md and E:\dashborad clone\TEST_READY.md
- All Test Files: E:\dashborad clone\frontend\tests\ (specifically `vessa.spec.js`, `adversarial_overlays.spec.js`, `state-nav-stress.spec.js`, `adversarial_final_stress.spec.js`)
- Previous Worker Handoff: E:\dashborad clone\.agents\teamwork\worker_m1\handoff.md
- Your Working Directory: E:\dashborad clone\.agents\teamwork\spec_miner_m2

MISSION:
1. Investigate and map the Help module (`frontend/src/features/help/help.ts`):
   - FAQ categories, accordion search, query highlighting, interactive support ticket creation.
   - Note Milestone 1 fix: replaced "pick" synonyms in FAQ answers to prevent collision with order board's `text=Pick` selector.
2. Mine the test suites for EVERY requirement and assertion touching Milestone 2 modules (`charts.ts`, `analytics.ts`, `customers.ts`, `settings.ts`, `help.ts`):
   - Extract exact selector strings, DOM hierarchy expectations, button texts, input placeholders, titles (`\u00B7 Vels`), and navigation paths.
   - Identify critical regression hazards and test invariants that MUST NOT be broken during refactoring.

OUTPUT REQUIREMENTS:
Write your structured findings to E:\dashborad clone\.agents\teamwork\spec_miner_m2\handoff.md containing:
1. Complete list of all Playwright test assertions touching M2 modules.
2. `help.ts` symbol mapping, de-obfuscation plan, and subcomponent breakdown.
3. Precise list of invariants and test contracts (exact IDs, classes, data attributes, headings, landmarks).
4. Concrete guidelines for the Worker to guarantee zero regressions.

Update your progress.md in your working directory and notify the parent orchestrator via send_message when done.
