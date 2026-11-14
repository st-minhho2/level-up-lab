<!-- Title: feat(todos): B7.2 the mark-all-complete button says how many it will mark -->

## Item

B7.2 — The "Mark all complete" button says how many it will mark (spec §36)

- spec: §36 — written before the label under D-37 (c155c3a, with the §14 edits); the label count is not §14's "message showing how many were changed" (§36)
- test: `src/lib/complete-all-label.test.ts::AC-36.1 …`, `src/components/complete-all-button-count.test.tsx::AC-36.2 … AC-36.4`, `e2e/36-complete-all-count.spec.ts::AC-36.5 … AC-36.7` — red before (`scripts/verify-red.sh`; AC-36.3 and AC-36.7 pinned green first), green after
- acceptance: AC-36.1 … AC-36.7

Closes #293

## Plan

### B7.2 plan — The "Mark all complete" button says how many it will mark (§36)

Approach: A from `advice.md` — §32's pattern, the §36 Function contracts as written: a pure `completeAllLabel` in
`src/lib`, an optional `count` prop on `CompleteAllButton`, and `page.tsx` passes `filterCounts(todos).active` from the
one unfiltered, unsearched `listTodos()` result (no second query). B is rejected: it drops the contract's prop and
REQ-36.6. The §14 edits D-37 asks for are on this branch (c155c3a, advice.md), so no `docs(spec)` commit. No
migration, dependency, env key or CI-protected path (no `config-change-approved`). `src/lib/todos.ts`,
`src/lib/filter-counts.ts`, `src/actions/*` and §14's `complete-all-button.test.tsx` stay untouched (D-33).

#### Files

| File                                                | Change                                                                                       | Why (AC-36.n) |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------- |
| `src/lib/complete-all-label.ts`                     | Add: `completeAllLabel` (skeleton throws `NotImplementedError`, green formats the label)     | 36.1          |
| `src/components/complete-all-button.tsx`            | Optional `count` prop (skeleton ignores it); green renders `completeAllLabel(count ?? 0)`    | 36.2–36.4     |
| `src/app/page.tsx`                                  | Green: `count={filterCounts(todos).active}`; header names §36                                | 36.5–36.7     |
| `src/lib/complete-all-label.test.ts`                | Add (red): AC-36.1, the card's Test line title                                               | 36.1          |
| `src/components/complete-all-button-count.test.tsx` | Add: AC-36.3 pinned green; AC-36.2, 36.4 red; §14's `complete-all-button.test.tsx` untouched | 36.2–36.4     |
| `e2e/36-complete-all-count.spec.ts`                 | Add: AC-36.7 pinned green; AC-36.5, 36.6 red; seeded with `PrismaClient` as sibling specs    | 36.5–36.7     |
| `spec/features-map.md`                              | Add the F34 row (§36) in code-writer's `docs(map)` commit                                    | map           |

Paperwork (exempt): §36 index row stays ✗ until the closing PR; `docs/metrics.md` per-card row.

#### Interfaces touched

```ts
// src/lib/complete-all-label.ts (pure: no Prisma, no server-only; imported by a client component)
export function completeAllLabel(open: number): string;
// src/components/complete-all-button.tsx ('use client')
export function CompleteAllButton({
  disabled,
  count,
}: {
  readonly disabled: boolean;
  readonly count?: number;
}): ReactNode;
// No Server Action, Zod schema, Prisma model, query or env key.
```

#### Verification

Baseline: `pnpm test` 280 passed (45 files), e2e 64 tests (28 files, counted). Pin (`test(todos): B7.2 pin AC-36.3,
AC-36.7 …`, no `(red)`): AC-36.3 green on the skeleton (no count / count 0 → "Mark all complete", REQ-36.6 holds
today), 280 → 281; AC-36.7 green on the skeleton (empty list). Red (`test(todos): B7.2 … (red)`):
`scripts/verify-red.sh B7.2` exit 0 (zero new tests green); AC-36.1 fails on `NotImplementedError`, AC-36.2/36.4 on the
exact name "Mark all complete (n)", never an import; `pnpm test:e2e e2e/36-complete-all-count.spec.ts` → AC-36.5, 36.6
fail on the name. Green: `pnpm lint && pnpm typecheck` clean · `pnpm test` 281 → 284 passed, AC-14.n green untouched ·
`pnpm test:e2e` 64 → 67 passed; `e2e/14`, `16`, `22`, `30` green untouched (substring name match) ·
`pnpm test:mutation` ≥ 70 (0/1 boundary, 12 for padding, killed by AC-36.1) · `pnpm build` ok ·
`scripts/ci/check-plan-scope.sh` OK.

#### Work breakdown

| Step | Role / skill                | Produces                                            | Commit                                     |
| ---- | --------------------------- | --------------------------------------------------- | ------------------------------------------ |
| 1    | skeleton: new-feature-slice | `complete-all-label.ts` stub, button's ignored prop | `chore(todos): B7.2 skeleton`              |
| 2    | test-writer                 | AC-36.3 (component), AC-36.7 (e2e), green           | `test(todos): B7.2 pin AC-36.3, AC-36.7 …` |
| 3    | test-writer                 | AC-36.1, 36.2, 36.4, 36.5, 36.6, red                | `test(todos): B7.2 … (red)`                |
| 4    | code-writer                 | label, prop wiring, page count                      | `feat(todos): B7.2 …`                      |
| 5    | code-writer                 | F34 row                                             | `docs(map): F34 … [B7.2]`                  |
| 6    | reviewer (diff)             | `review.md` diff section                            | `docs(backlog): B7.2 review …`             |

Plan review: approved, round 1 · Plan approved by: reviewer (D-27, tier medium, issue #293) · Rounds: 1

## Map delta

F34 · §36 · added ✅ — `completeAllLabel` in `src/lib/complete-all-label.ts`, `count` prop on `CompleteAllButton`, `page.tsx` passes `filterCounts(todos).active`; evidence: `pnpm test` → 284 passed, `pnpm test:e2e` → 67 passed (`docs(map)` 3d35c16). §36 index row stays ✗ until the closing PR.

## Review

`/review-loop`: passes 1/3, verdict ready for PR (`backlog/work/B7.2/review.md` "Diff review (round 1)").

Reviewer's suites: `pnpm test` 284 passed (47 files) · `pnpm test:e2e` 67 passed · mutation 93.08 ≥ 70 (`complete-all-label.ts` 100, 6 killed, 0 survived; `--concurrency 1`, the plain run was killed by host memory pressure from a sibling worktree's Stryker) · `check-plan-scope.sh` OK (D-27 approval) · `check-feat-commits.sh` OK · `verify-red.sh B7.2` red for the right reason.

| Pass | #   | Finding (file:line)                                                                  | Source   | Kind        | Disposition | Justification                                                                                      |
| ---- | --- | ------------------------------------------------------------------------------------ | -------- | ----------- | ----------- | -------------------------------------------------------------------------------------------------- |
| 1    | 1   | `docs/metrics.md:146` Green cell = red commit cbbe08c; mutation 92.84 not reproduced | reviewer | correctness | fix now     | c153cdb: Green = feat c6a9e99, mutation 93.08; the closing PR replaces the sha with the squash sha |

Riskiest unfalsified: the e2e revert probe for `page.tsx` (`count=` dropped or counted from the filtered list) was traced, not run; AC-36.5's `/?filter=completed` and `/?q=zzz` legs are the guard.

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
