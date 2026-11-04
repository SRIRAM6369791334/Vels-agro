# BRIEFING — 2026-11-03T09:26:00Z

## Mission
Probe and document all specification details, test invariants, selectors, and structural contracts for Milestone 2 (Help module, charts, analytics, customers, settings).

## 🔒 My Identity
- Archetype: Specification Miner
- Roles: Teamwork specialist, Spec Miner
- Working directory: E:\dashborad clone\.agents\teamwork\spec_miner_m2
- Original parent: 5216114f-73ca-447a-9b11-73a4a09f9380
- Milestone: Milestone 2: Help Module & Test Invariants

## 🔒 Key Constraints
- Read-only on source code — do NOT implement or modify frontend source code.
- Write only to your own working directory: `E:\dashborad clone\.agents\teamwork\spec_miner_m2`.
- Probe authoritative sources (tests, source files, documentation) with extreme precision.
- Preserve all test contracts, selectors, titles (`\u00B7 Vels`), button texts, placeholders, and DOM landmarks.
- Note Milestone 1 fix: replaced "pick" synonyms in FAQ answers to prevent collision with order board's `text=Pick` selector.

## Current Parent
- Conversation ID: 5216114f-73ca-447a-9b11-73a4a09f9380
- Updated: not yet

## Task Summary
- **What to build**: Specification discovery report and invariant mapping for Milestone 2 modules.
- **Success criteria**: Comprehensive handoff.md containing: Playwright test assertions touching M2 modules, `help.ts` symbol mapping and de-obfuscation plan, precise list of invariants and test contracts, and worker guidelines for zero regressions.
- **Interface contracts**: `E:\dashborad clone\PROJECT.md`, `E:\dashborad clone\TEST_INFRA.md`, `E:\dashborad clone\TEST_READY.md`.
- **Code layout**: `E:\dashborad clone\PROJECT.md § Code Layout`.

## Key Decisions Made
- Complete mapping of `help.ts` (1005 lines), `charts.ts` (850 lines), `customers.ts` (906 lines), `settings.ts` (2233 lines), and `analytics.ts` (2311 lines).
- Enumerated 29 Playwright test assertions touching M2 modules across all 4 test suites.
- Identified critical test invariants:
  - Exact document title template `${pageTitle} \u00B7 Vels` (Unicode charCode 183).
  - Stockist card title accessibility requirement: `<h3><b>${name}</b></h3>`.
  - Strict-mode `text=Pick` locator isolation: FAQ answers must NEVER contain "Pick" or "pick".
  - Landmark text preservation (`Annual Gross Revenue`, `Stockists`, `User Account`, `Help center`).
  - Charts widget dual-export signatures and legacy aliases (`a, i, n, o, r, s, t`).
- Documented findings in `handoff.md` and verified baseline test pass (47/47 passing).

## Artifact Index
- `E:\dashborad clone\.agents\teamwork\spec_miner_m2\DISPATCH.md` — Dispatch message
- `E:\dashborad clone\.agents\teamwork\spec_miner_m2\BRIEFING.md` — Situational awareness
- `E:\dashborad clone\.agents\teamwork\spec_miner_m2\progress.md` — Liveness & progress tracker
- `E:\dashborad clone\.agents\teamwork\spec_miner_m2\handoff.md` — 5-component handoff report

## Loaded Skills
- None explicitly requested in dispatch.
