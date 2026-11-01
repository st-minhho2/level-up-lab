# B3.2 plan — Show a character counter while typing a title (§18)

Approach: A from `advice.md` — one `draft` state, `onChange` writes it, a ref on the box plus a no-dependency
`useLayoutEffect` re-reads the box after every commit (React 19 resets the form at the end of the mutation phase, before
layout effects), so the counter follows the reset with no change event (REQ-18.6, 18.7). Fallback B (`onReset` →
`setDraft(kept)`) stays inside the same two files. One phase, one lead approval (D-21): no `src/app/page.tsx`, no
sibling component, no `src/lib/todos.ts`, `src/actions/todos.ts`, `src/lib/logger.ts`, no `src/*/CLAUDE.md`. Analysis
Q1–Q4 as proposed (trimmed count, no-event value out of scope, number only above 200, "used"). Approving ticks §18's
`Lead approves spec` box. No migration, no dependency, no env key, no CI-protected path (no `config-change-approved`).

## Files

| File                                | Change                                                                                                             | Why (AC-18.n) |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------- |
| `src/lib/title-count.ts`            | Add: `titleCharacterCount`, `titleCounterText` (pure, imports `TITLE_MAX_LENGTH`, branch-free)                     | 18.1, 18.2    |
| `src/lib/title-count.test.ts`       | Add (red): AC-18.1 (12 values; `'é'` is `e` + U+0301 → 2), AC-18.2 (5 texts + 4 schema agreements)                 | 18.1, 18.2    |
| `src/components/todo-form.tsx`      | `<p id="new-todo-count">` after the box row; ref + layout effect; `aria-describedby` gains `new-todo-count`        | 18.3–18.7     |
| `src/components/todo-form.test.tsx` | Add (red): AC-18.3 to AC-18.6 with exact literals (`'0 / 200'`, `'8 / 200'`, `'12 / 200'`); no hoisted key removed | 18.3–18.6     |
| `e2e/18-title-counter.spec.ts`      | Add (red): AC-18.7 `0`, `8`, `200` (+ `y` refused), `195`, add → `0`, reload → `0`; `aria-describedby`             | 18.7          |

Paperwork (exempt): `spec/features-map.md` F16 row ✗ in the skeleton, ✅ in `docs(map)`; §18 index row stays ✗ until
the closing PR; `docs/metrics.md` per-card row. Expected trivial conflict on the §17/§19 index rows when siblings merge.

Skeleton stubs: `titleCharacterCount` and `titleCounterText` throw `NotImplementedError`; `todo-form.tsx` unchanged
(the component tests fail on a missing counter element, an assertion, not an import).

## Interfaces touched

```ts
// src/lib/title-count.ts (§18) — pure, no Prisma, no server-only; importable from a client component
export function titleCharacterCount(value: string): number; // value.trim().length, UTF-16 code units, never clamps
export function titleCounterText(value: string): string; // `${titleCharacterCount(value)} / ${TITLE_MAX_LENGTH}`
// src/components/todo-form.tsx: TodoForm(): ReactNode — signature unchanged; renders <p id="new-todo-count"> (no role,
// no aria-live); box aria-describedby = 'new-todo-error new-todo-count' | 'new-todo-count'; maxLength, name, label,
// action, schema and messages unchanged
```

## Verification

Red (`test(todos): B3.2 … (red)`): `scripts/verify-red.sh B3.2` exit 0, about 6 new unit/component tests failing on
an assertion or `NotImplementedError` (`title-count.test.ts` 2, `todo-form.test.tsx` +4);
`pnpm test:e2e e2e/18-title-counter.spec.ts` → 1 failed, recorded in the red commit body. Green: `pnpm lint &&
pnpm typecheck` clean · `pnpm test` 169 → ~175 passed, the 6 existing `todo-form.test.tsx` tests unchanged and green ·
`pnpm test:e2e` 32 → 33 passed (`05`, `10` unchanged) · `pnpm test:mutation` ≥ 70, `title-count.ts` 100 (hot spots
in `advice.md`) · `pnpm build` ok · `scripts/ci/check-plan-scope.sh` OK. Counts are the test-writer's target; a
different count is stated in the red commit.

## Work breakdown

| Step | Role / skill        | Produces                               | Commit                         |
| ---- | ------------------- | -------------------------------------- | ------------------------------ |
| 1    | `new-feature-slice` | `title-count.ts` stubs, F16 ✗          | `chore(todos): B3.2 skeleton`  |
| 2    | test-writer         | 2 unit/component files + `e2e/18`, red | `test(todos): B3.2 … (red)`    |
| 3    | code-writer         | `title-count.ts`, `todo-form.tsx`      | `feat(todos): B3.2 …`          |
| 4    | dev-lead            | F16 ✅                                 | `docs(map): F16 … [B3.2]`      |
| 5    | reviewer (diff)     | `review.md` diff section               | `docs(backlog): B3.2 review …` |

Plan review: pending · Plan approved by: · Rounds: 1
