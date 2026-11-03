# 🧠 Lessons Learned & Engineering Postmortems

This document tracks technical incidents, build quirks, deobfuscation hurdles, and architectural decisions discovered during the engineering lifecycle of Vessa Skincare Inventory.

---

## 1. [Build_Error] Vite Bundled GSAP vs. Standalone npm Package

- **Issue**: The original cloned bundle had 5,500 lines of minified GSAP 3.12.5 inlined directly into `main.js`. This cluttered the context window and made source maintenance impossible.
- **Root Cause**: Vite / Rollup build pipelines default to inlining external dependencies if not explicitly declared in `external` configuration during bundle harvesting.
- **Resolution**:
  - Installed `gsap` as a clean dependency via npm.
  - Sliced out the inlined GSAP bytecode (lines 1 to 5610).
  - Replaced it with standard ES module imports:
    ```typescript
    import { gsap } from 'gsap';
    import { Flip } from 'gsap/Flip';
    gsap.registerPlugin(Flip);
    ```
  - Reduced `main.js` from 334 KB to 179 KB without breaking any animation timelines or visual effects.

---

## 2. [Identifier_Collision] Reserved Names During Deobfuscation

- **Issue**: Rollup's single-letter mangling created identical variable names across different scopes. For example, `$` was both the querySelector alias in some views and the `showToast()` function in `main.js`.
- **Root Cause**: Blind global search-and-replace collisions.
- **Resolution**:
  - Leveraged `@babel/parser` and `@babel/traverse` AST renaming rather than string regex.
  - Explicitly mapped `Kn` to `domQuery` and `$` to `showToast` in `main.ts`, disambiguating DOM lookup from user-facing toasts.

---

## 3. [TypeScript_V7_Configuration] `baseUrl` Removal in TS 7.0+

- **Issue**: `npx tsc --noEmit` threw `error TS5102: Option 'baseUrl' has been removed. Use 'paths': {'*': ['./*']} instead.`
- **Root Cause**: TypeScript 7.0 removes legacy `baseUrl` inheritance in favor of standard Node.js subpath resolution.
- **Resolution**:
  - Cleaned `tsconfig.json` compiler options:
    ```json
    {
      "compilerOptions": {
        "paths": {
          "@/*": ["./src/*"]
        }
      }
    }
    ```
  - Resulted in clean zero-error type checks across all domain models.

---

## 4. [Architecture_Refactor] Flutter-Style Feature-First Reorganization

- **Issue**: Flat layout with 25+ files directly in `src/` made domain discovery difficult as the codebase grew.
- **Root Cause**: Early monolithic extraction.
- **Resolution**:
  - Migrated into 9 discrete feature directories under `src/features/<feature>/` containing both the `.ts` controller and `.css` stylesheet.
  - Updated Vite dynamic page loaders in `main.ts` from `./dashboard.js` to `./features/dashboard/dashboard.ts`.
  - Updated `main.css` `@import` paths accordingly.
  - Verified 100% feature parity with 7/7 passing Playwright tests.

---

## 5. [Accessibility_Gate] GSAP Reduced-Motion Fallback

- **Issue**: Fast micro-animations could cause vestibular discomfort for users who have requested reduced motion in their OS settings.
- **Resolution**:
  - Wrapped all timeline duration calls in a dedicated helper:
    ```typescript
    export function motionDuration(duration: number): number {
      return prefersReducedMotion.matches ? 0 : duration;
    }
    ```
  - When reduced motion is detected, duration collapses to zero, immediately rendering the final visual state.
