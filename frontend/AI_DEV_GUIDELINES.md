# 🤖 AI Agent & Human Engineering Protocol

This guideline governs code generation, refactoring, and automated workflows performed by AI coding agents (and human engineers) inside `E:\dashborad clone\frontend`.

---

## 1. Core Engineering Tenets

1. **Feature-First Clean Architecture**:
   - Keep feature code co-located under `src/features/<feature_name>/`.
   - Never add ad-hoc global CSS classes or root scripts without architectural review.
2. **Type Safety Over Speculation**:
   - Strictly zero `any` types in `src/types/`.
   - Define exact interfaces for function inputs, returns, and DOM elements.
3. **Closed-Loop Verification**:
   - Never consider a task finished without running:
     1. `npm run typecheck` (`tsc --noEmit`)
     2. `npm run build`
     3. `npm test` (`playwright test`)
4. **Preserve Documentation & Comments**:
   - Maintain documentation integrity. Do not strip existing JSDoc comments or architectural headers unless explicitly instructed.

---

## 2. Directory Allocation Rules

| If you are creating... | Place it in... | Example |
| :--- | :--- | :--- |
| A new Domain Model | `src/types/` | `src/types/audit.ts` |
| Business Constants or Enums | `src/data/` | `src/data/constants.ts` |
| Low-level DOM/Formatting helper | `src/utils/` | `src/utils/math.ts` |
| Modal, Drawer or Notification Toast | `src/ui/` | `src/ui/confirm.ts` |
| Reusable Chart or Visualization | `src/shared/widgets/` | `src/shared/widgets/charts.ts` |
| A new Page or View Feature | `src/features/<feature>/` | `src/features/billing/billing.ts` |

---

## 3. Code Quality Standards

### 3.1 DOM & Event Handling
- Always clean up event listeners or use event delegation on parent containers:
  ```typescript
  // ✅ Good: Event delegation on table body
  tableEl.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-action]');
    if (!target) return;
    const action = target.dataset.action;
    // handle action
  });
  ```
- Always sanitize interpolated HTML using `escapeHtml()`.

### 3.2 Animation Timelines
- All GSAP animations must use `motionDuration(seconds)` to honor reduced motion.
- Use `clearProps: 'transform,opacity'` on completion to avoid CSS specificity conflicts.

### 3.3 State Mutations
- Never mutate state directly in views without notifying subscribers:
  ```typescript
  // ❌ Bad: Silent mutation
  store.orders.unshift(newOrder);

  // ✅ Good: Mutate and notify channel
  store.orders.unshift(newOrder);
  notifyStoreSubscribers('orders', 'activity');
  ```

---

## 4. Git Commit & PR Conventions

Follow Conventional Commits:
- `feat(orders): add barcode scanner modal to pick-pack-ship board`
- `fix(types): correct product stock location mapping`
- `perf(charts): optimize SVG rendering on monthly revenue tab`
- `test(e2e): add test for customer return workflow`
- `docs(api): document purchase order partial receipt payload`
