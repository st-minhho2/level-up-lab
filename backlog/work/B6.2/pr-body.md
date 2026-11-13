<!-- Title: feat(todos): B6.2 the filter links show how many todos each one lists -->

## Item

B6.2 — The filter links show how many todos each one lists (spec §30)

- spec: §30 — written in this branch (D-33); "counts on the links" lifted from §12's Out of scope (D-33)
- test: `src/lib/filter-counts.test.ts::AC-30.1 …`, `src/components/todo-filter-nav-counts.test.tsx::AC-30.2 … AC-30.4`, `e2e/30-filter-counts.spec.ts::AC-30.5 … AC-30.7` — red before (`scripts/verify-red.sh`; AC-30.4 pinned green first), green after
- acceptance: AC-30.1 … AC-30.7

Closes #262

## Plan

### B6.2 plan — The filter links show how many todos each one lists (§30)

Approach: A from `advice.md` — the page computes `filterCounts(todos)` from the one unfiltered, unsearched
`listTodos()` result and `TodoFilterNav` renders a `<span>(n)</span>` after each link (§30 Function contracts); the
link names stay "All", "Active", "Completed", so §12's tests and four e2e files stay untouched. No migration,
dependency, env key or CI-protected path (no `config-change-approved`). `src/lib/todos.ts`, `src/lib/todo-filter.ts`,
`src/actions/*` untouched; package guides stay out (D-33). The §12 Out of scope lift landed in 361af3c (D-33).

#### Files

| File                                             | Change                                                                                           | Why (AC-30.n) |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ------------- |
| `src/lib/filter-counts.ts`                       | Add: `FilterCounts`, `filterCounts` (skeleton throws `NotImplementedError`, green counts)        | 30.1          |
| `src/components/todo-filter-nav.tsx`             | Optional `counts` prop (skeleton ignores it); green renders a `<span>(n)</span>` after each link | 30.2–30.4     |
| `src/app/page.tsx`                               | Green: `<TodoFilterNav selected={filter} counts={filterCounts(todos)} />`; header names §30      | 30.5–30.7     |
| `src/lib/filter-counts.test.ts`                  | Add (red): AC-30.1, the card's Test line title                                                   | 30.1          |
| `src/components/todo-filter-nav-counts.test.tsx` | Add (red): AC-30.2–30.4; AC-12.4's file untouched                                                | 30.2–30.4     |
| `e2e/30-filter-counts.spec.ts`                   | Add (red): AC-30.5–30.7, seeded with `PrismaClient`, `openHydrated` + `watchNavigations`         | 30.5–30.7     |
| `spec/features-map.md`                           | Add the F28 row (§30) in code-writer's `docs(map)` commit                                        | map           |

#### Interfaces touched

```ts
export interface FilterCounts {
  readonly all: number;
  readonly active: number;
  readonly completed: number;
}
export function filterCounts(todos: readonly { readonly completed: boolean }[]): FilterCounts;
export function TodoFilterNav({
  selected,
  counts,
}: {
  readonly selected: TodoFilter;
  readonly counts?: FilterCounts;
}): ReactNode;
```

#### Verification

`pnpm test` 241 → 242 (pin AC-30.4) → 245 · `scripts/verify-red.sh B6.2` exit 0 · `pnpm test:e2e` 52 → 55 ·
`pnpm test:mutation` ≥ 70 · `pnpm build` ok. Full text: `backlog/work/B6.2/plan.md`.

Plan review: approved, round 2 · Plan approved by: reviewer (D-27, tier medium, issue #262) · Rounds: 1

## Map delta

pending

## Review

pending

## Evidence

- AC met: pending/7
- tier: medium
- plan deviations: none
- trace: n/a

## Checklist

- [ ] **Diff matches the approved plan**: no file outside the Files table, no interface outside the list.
- [ ] Red commit precedes the feat commit; no `feat(` commit touches `*.test.*` or `e2e/**`.
- [ ] Every `AC-§.n` of the section is a test title; mutation on `src/lib` + `src/actions` ≥ 70 %.
- [ ] No new `eslint-disable` / `@ts-ignore` / `@ts-expect-error`; no protected config change (or label `config-change-approved` with the reason).
- [ ] Migrations reviewed as SQL; `prisma/seed.ts` updated if a table changed.
- [ ] `spec/features-map.md` row moved; `docs/metrics.md` per-card row filled; mistake-log updated if a known mistake repeated.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
