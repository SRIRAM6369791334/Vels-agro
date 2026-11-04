start and create more subagent to give better solution da. Refactor and modularize the Vels Agro Machinery & Equipment Admin Panel codebase into a clean, human-readable, modular, and maintainable production TypeScript architecture without regressions.

Working directory: E:\dashborad clone\frontend
Integrity mode: development

## Requirements

### R1. De-obfuscation and Modular TypeScript Architecture
Refactor `src/main.ts` and all feature modules (`dashboard.ts`, `products.ts`, `orders.ts`, `purchasing.ts`, `warehouses.ts`, `analytics.ts`, `customers.ts`, `settings.ts`, `help.ts`, `charts.ts`) from minified/obfuscated single-letter identifiers into clean, human-readable, and maintainable TypeScript with clear modular boundaries, meaningful domain names, and explicit type annotations.

### R2. Zero Regressions and Runtime Behavioral Parity
Preserve all existing application behavior, ensuring no regressions in animations, router transitions, reactive store updates, data visualization, or UI interactions.

## Verification Resources
Run all commands from `E:\dashborad clone\frontend`:
- `npm run typecheck` (`tsc --noEmit`)
- `npm run build` (`vite build`)
- `npm run test` (`playwright test`)

## Acceptance Criteria

### Build & Test Verification
- [ ] `npm run typecheck` passes with zero errors.
- [ ] `npm run build` succeeds with zero errors.
- [ ] `npm run test` passes with zero failures.

### Code Quality & Readability
- [ ] Obfuscated and minified 1-to-2 letter identifiers across `src/main.ts` and all feature modules are replaced with clear, semantic names.
- [ ] Code is modularized into human-readable files and components adhering to clean production TypeScript standards.
- [ ] Application remains fully operational with zero visual, animation, router, or reactive state regressions.
