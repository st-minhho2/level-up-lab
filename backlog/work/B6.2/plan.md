# B6.2 plan — The filter links show how many todos each one lists (§30)

Approach: A from `advice.md` — the page computes `filterCounts(todos)` from the one unfiltered, unsearched
`listTodos()` result and `TodoFilterNav` renders a `<span>(n)</span>` after each link (§30 Function contracts); the
link names stay "All", "Active", "Completed", so §12's tests and four e2e files stay untouched. No migration,
dependency, env key or CI-protected path (no `config-change-approved`). `src/lib/todos.ts`, `src/lib/todo-filter.ts`,
`src/actions/*` untouched; package guides stay out (D-33). The §12 Out of scope lift landed in 361af3c (D-33).

## Files

| File                                             | Change                                                                                           | Why (AC-30.n) |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ------------- |
| `src/lib/filter-counts.ts`                       | Add: `FilterCounts`, `filterCounts` (skeleton throws `NotImplementedError`, green counts)        | 30.1          |
| `src/components/todo-filter-nav.tsx`             | Optional `counts` prop (skeleton ignores it); green renders a `<span>(n)</span>` after each link | 30.2–30.4     |
| `src/app/page.tsx`                               | Green: `<TodoFilterNav selected={filter} counts={filterCounts(todos)} />`; header names §30      | 30.5–30.7     |
| `src/lib/filter-counts.test.ts`                  | Add (red): AC-30.1, the card's Test line title                                                   | 30.1          |
| `src/components/todo-filter-nav-counts.test.tsx` | Add (red): AC-30.2–30.4; AC-12.4's file untouched                                                | 30.2–30.4     |
| `e2e/30-filter-counts.spec.ts`                   | Add (red): AC-30.5–30.7, seeded with `PrismaClient`, `openHydrated` + `watchNavigations`         | 30.5–30.7     |
| `spec/features-map.md`                           | Add the F28 row (§30) in code-writer's `docs(map)` commit                                        | map           |

Paperwork (exempt): §30 index row stays ✗ until the closing PR; `docs/metrics.md` per-card row.

## Interfaces touched

```ts
// src/lib/filter-counts.ts (pure: no Prisma, no server-only)
export interface FilterCounts {
  readonly all: number;
  readonly active: number;
  readonly completed: number;
}
export function filterCounts(todos: readonly { readonly completed: boolean }[]): FilterCounts;
// src/components/todo-filter-nav.tsx (Server Component, no 'use client')
export function TodoFilterNav({
  selected,
  counts,
}: {
  readonly selected: TodoFilter;
  readonly counts?: FilterCounts;
}): ReactNode;
// No Server Action, Zod schema, Prisma model, query or env key.
```

## Verification

Baseline: `pnpm test` 241 passed (39 files), e2e 52 tests (22 files). Red (`test(todos): B6.2 … (red)`):
`scripts/verify-red.sh B6.2` exit 0; AC-30.1 fails on the skeleton's `NotImplementedError`, AC-30.2/30.3 on the span
assertions (no span rendered), never an import; AC-30.4 green on the skeleton (it pins REQ-30.6) and is named as such
in the red commit body; `pnpm test:e2e e2e/30-filter-counts.spec.ts` → AC-30.5–30.7 fail on the span locators. Green:
`pnpm lint && pnpm typecheck` clean · `pnpm test` 241 → 245 passed (1 unit + 3 component; a different count is stated
in the red commit), AC-12.n green · `pnpm test:e2e` 52 → 55 passed, `e2e/12-filter`, `16-search`, `21-clear-search`,
`25-search-shortcut` green untouched · `pnpm test:mutation` ≥ 70 (`filterCounts` predicate, `all`, empty list killed by
AC-30.1) · `pnpm build` ok · `scripts/ci/check-plan-scope.sh` OK.

## Work breakdown

| Step | Role / skill                | Produces                                             | Commit                         |
| ---- | --------------------------- | ---------------------------------------------------- | ------------------------------ |
| 1    | skeleton: new-feature-slice | `filter-counts.ts` stub, nav's ignored `counts` prop | `chore(todos): B6.2 skeleton`  |
| 2    | test-writer                 | the three test files, red                            | `test(todos): B6.2 … (red)`    |
| 3    | code-writer                 | counting, spans, page wiring                         | `feat(todos): B6.2 …`          |
| 4    | code-writer                 | F28 row                                              | `docs(map): F28 … [B6.2]`      |
| 5    | reviewer (diff)             | `review.md` diff section                             | `docs(backlog): B6.2 review …` |

Plan review: pending · Plan approved by: · Rounds: 1
