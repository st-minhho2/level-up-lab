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

F28 · §30 · new row, ✅ — `filterCounts` in `src/lib/filter-counts.ts`, counts in `src/components/todo-filter-nav.tsx`,
wired in `src/app/page.tsx` (`docs(map)` d7110b8); evidence: `pnpm test` 264 passed, `pnpm test:e2e` 56 passed on the
merge with main. The §30 index row stays ✗ until the closing PR; the union merge put F28 above F27 (closing PR reorders).

## Review

`/review-loop`: passes 3/3 (`backlog/work/B6.2/review.md` "Diff review" rounds 1–3); verdict ready for PR.

| Pass | #   | Finding (file:line)                                                                               | Source   | Kind          | Disposition                                                                    | Justification                                    |
| ---- | --- | ------------------------------------------------------------------------------------------------- | -------- | ------------- | ------------------------------------------------------------------------------ | ------------------------------------------------ |
| 1    | 1   | `src/components/todo-filter-nav.tsx:42` count span adds `text-zinc-500`, outside §30 Out of scope | reviewer | spec-mismatch | fix now (f957cdd)                                                              | class removed; round 2 confirmed closed          |
| 1    | —   | `docs/metrics.md` row in the feat commit; F28 ✅ in `docs(map)`                                   | dev-lead | question      | no change needed                                                               | `code-writer.md` steps 5–7; B5.6, B6.1 precedent |
| 3    | —   | merge b8dc571: conflict in `spec/technical-requirements.md` (§29 / §30 rows)                      | dev-lead | merge         | resolved, both rows kept; card diff unchanged since round 2 (reviewer checked) | `--remerge-diff` on tests empty                  |

Reviewer's last run (b8dc571): `Tests  264 passed (264)` · `56 passed (1.4m)` · `Final mutation score of 92.68 is
greater than or equal to break threshold 70` (`filter-counts.ts` 100) · every `scripts/ci/check-*.sh` OK ·
`scripts/verify-red.sh B6.2` `RESULT: red for the right reason`.

Riskiest unfalsified: REQ-30.4 "created" has no criterion, so a create path that left the counts stale would pass
every §30 test; the `filterCounts(shown)` wiring revert was traced, not run in e2e.

## Evidence

- AC met: 7/7
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
