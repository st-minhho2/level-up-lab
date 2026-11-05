<!-- Title: feat(todos): B5.1 show how many open todos are overdue -->

## Item

B5.1 — Show how many open todos are overdue (spec §23)

- spec: §23 — unchanged (written in this branch from `work/B5.1/analysis.md`, D-30)
- test: `src/lib/overdue-count.test.ts::AC-23.1, AC-23.2`, `src/components/overdue-count.test.tsx::AC-23.3 … AC-23.6`, `e2e/23-overdue-count.spec.ts::AC-23.7` — red before (`scripts/verify-red.sh`), green after
- acceptance: AC-23.1 … AC-23.7

Closes #214

## Plan

### B5.1 plan — Show how many open todos are overdue (§23)

Approach: A from `advice.md` — a pure `src/lib/overdue-count.ts` on §17's `isOverdue` plus a `'use client'`
`OverdueCount` that reads the day once after mount (`setToday((previous) => previous ?? todayOf(new Date()))`, no
timer), rendered by `page.tsx` from the unfiltered `todos` right after `<RemainingCount/>`. It matches §23's function
block, keeps §17's files untouched (D-30), and REQ-23.4 needs no new code (every action already revalidates `/`).
Analysis Q1–Q6 as proposed. No migration, dependency, env key or CI-protected path (no `config-change-approved`).
Costs: no count with JS off; after local midnight with the page open, rows and count may disagree until a reload.

#### Files

| File                                    | Change                                                                     | Why (AC-23.n) |
| --------------------------------------- | -------------------------------------------------------------------------- | ------------- |
| `src/lib/overdue-count.ts`              | Add `countOverdue`, `overdueLabel` (skeleton stubs, then green)            | 23.1, 23.2    |
| `src/components/overdue-count.tsx`      | Add `OverdueCount` client component (skeleton renders nothing, then green) | 23.3–23.6     |
| `src/app/page.tsx`                      | Render `<OverdueCount …/>` after `<RemainingCount/>`; header names §23     | 23.7          |
| `src/lib/overdue-count.test.ts`         | Add (red): AC-23.1, AC-23.2                                                | 23.1, 23.2    |
| `src/components/overdue-count.test.tsx` | Add (red): AC-23.3–23.6, fake system time; AC-23.5 hydration (below)       | 23.3–23.6     |
| `e2e/23-overdue-count.spec.ts`          | Add (red): AC-23.7, days relative to the browser's local day               | 23.7          |
| `spec/features-map.md`                  | Add the F21 row (§23): skeleton ✗, ✅ in `docs(map)`                       | map           |

Paperwork (exempt): §23 index row stays ✗ until the closing PR; `docs/metrics.md` per-card row.

#### Interfaces touched

```ts
// src/lib/overdue-count.ts (§23): pure, no Prisma, no server-only
export function countOverdue(
  todos: readonly { readonly completed: boolean; readonly dueDate?: string }[],
  today: string,
): number;
export function overdueLabel(count: number): string | undefined; // undefined at 0, else `${count} overdue`
// src/components/overdue-count.tsx (§23): 'use client'; one <span>, no role, no aria-label
export function OverdueCount({
  todos,
}: {
  readonly todos: readonly { readonly completed: boolean; readonly dueDate?: string }[];
}): ReactNode;
// src/app/page.tsx: <OverdueCount todos={todos.map(({ completed, dueDate }) => ({ completed, dueDate }))} />
// No Server Action, Zod schema, Prisma model, query or env key; §17's todayOf/isOverdue imported, unchanged.
```

#### Verification

Red (`test(todos): B5.1 … (red)`): `scripts/verify-red.sh B5.1` exit 0; AC-23.1/23.2 fail on the skeleton's
`NotImplementedError`, AC-23.3/23.4/23.6 and the post-hydration step of AC-23.5 on assertions (nothing rendered);
`pnpm test:e2e e2e/23-overdue-count.spec.ts` → AC-23.7 failed, recorded in the body. AC-23.5 (review round 1):
`hydrateRoot(…, { onRecoverableError })` called 0 times, as AC-17.5 in `todo-due-date-overdue.test.tsx`, besides
the spec's 0 `process.stderr.write` calls (the spy alone cannot see a mismatch). `src/components/` is outside
Stryker's `mutate`: the component's day guards rest on AC-23.5/23.6. Green:
`pnpm lint && pnpm typecheck` clean · `pnpm test` 207 → 213 passed (6 new AC-23.n) · `pnpm test:e2e` 44 → 45 passed,
`e2e/17-overdue.spec.ts` and `e2e/22-all-done.spec.ts` unchanged and green · `pnpm test:mutation` ≥ 70 with
`src/lib/overdue-count.ts` in scope · `pnpm build` ok · `scripts/ci/check-plan-scope.sh` OK. Counts are the
test-writer's target; a different count is stated in the red commit.

#### Work breakdown

| Step | Role / skill        | Produces                                              | Commit                         |
| ---- | ------------------- | ----------------------------------------------------- | ------------------------------ |
| 1    | `new-feature-slice` | 2 stubs (`NotImplementedError` / empty render), F21 ✗ | `chore(todos): B5.1 skeleton`  |
| 2    | test-writer         | 2 test files + `e2e/23-overdue-count.spec.ts`, red    | `test(todos): B5.1 … (red)`    |
| 3    | code-writer         | both modules, `page.tsx`                              | `feat(todos): B5.1 …`          |
| 4    | dev-lead            | F21 ✅                                                | `docs(map): F21 … [B5.1]`      |
| 5    | reviewer (diff)     | `review.md` diff section                              | `docs(backlog): B5.1 review …` |

Plan review: approved, round 2 (round 1: 1 reason, AC-23.5 hydration check, applied 0bc8786) · Plan approved by: reviewer (D-27, tier medium, issue #214) · Rounds: 1

## Map delta

| F21 | §23 | Show the overdue count | `src/lib/overdue-count.ts`, `src/components/overdue-count.tsx`, `src/app/page.tsx` | `src/lib/overdue-count.test.ts`, `src/components/overdue-count.test.tsx`, `e2e/23-overdue-count.spec.ts` | ✗ → ✅ (ee58e25) |

## Review

### Diff review (round 1)

SCOPE: all (lib `src/lib/overdue-count.ts`; ui `src/components/overdue-count.tsx`, `src/app/page.tsx`, `e2e/23-overdue-count.spec.ts`).
Commits: skeleton 267b71f, red e4f9548, feat 39f6913.

### Commands (last line of each, run by the reviewer)

| Command                             | Result                                                                                                               |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                         | `All matched files use Prettier code style!`                                                                         |
| `pnpm typecheck`                    | `tsc --noEmit` clean                                                                                                 |
| `pnpm test`                         | `Tests  213 passed (213)` (plan target 207 → 213)                                                                    |
| `pnpm test:e2e`                     | `45 passed (1.1m)` (plan target 44 → 45)                                                                             |
| `pnpm test:mutation`                | `Final mutation score of 93.52 is greater than or equal to break threshold 70`; `overdue-count.ts` 100.00 (6 killed) |
| `scripts/ci/check-suppressions.sh`  | `OK: no new suppressions`                                                                                            |
| `scripts/ci/check-config-change.sh` | `OK: no protected config changed`                                                                                    |
| `scripts/ci/check-feat-commits.sh`  | `OK: no feat commit touches tests`                                                                                   |
| `scripts/ci/check-ac-coverage.sh`   | `OK …`; §23 line: `✗, no tests expected yet (7 criteria)`; grep finds AC-23.1 … AC-23.7 each in a test title         |
| `scripts/ci/check-spec-sections.sh` | `OK: sections cited: 1 … 24`                                                                                         |
| `scripts/ci/check-features-map.sh`  | `OK`                                                                                                                 |
| `scripts/ci/check-plan-scope.sh`    | `OK: feat/B5.1-agent stays inside the approved plan of B5.1 (D-27 approval)`                                         |
| `scripts/verify-red.sh B5.1`        | `RESULT: red for the right reason` (2 + 4 new unit tests red on behavior)                                            |
| `git diff --stat main...HEAD`       | `16 files changed, 860 insertions(+), 1 deletion(-)`                                                                 |

### Checklist

| Check                                                                 | Result                                                                                                                                                                                                                                                                                                                                               |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every AC-§.n has a test whose assertion matches its Then              | pass: AC-23.1–23.6 unit/component assertions copy the Thens (counts, labels, tag/role/aria, `""` cases, identical SSR strings, 0 stderr + 0 `onRecoverableError`, the 4-step sequence + `getTimerCount() 0`); AC-23.7 e2e covers placement, no listitem, tick/untick with 0 navigations, due-date edit, filter, search, reload, F ticked → 0 matches |
| no test weakened after the red commit                                 | pass: `git log --first-parent --no-merges e4f9548..HEAD -- '*.test.*' e2e/` empty; `--merges --remerge-diff` empty                                                                                                                                                                                                                                   |
| every changed file is in `plan.md`                                    | pass: 6 code/test files + `spec/features-map.md` in Files; `docs/metrics.md` is the plan's stated paperwork (and `check-plan-scope.sh` paperwork list)                                                                                                                                                                                               |
| interfaces match §23's function contracts                             | pass: both lib signatures and the `OverdueCount` prop type verbatim; `page.tsx` maps `({ completed, dueDate })` from `todos` (not `shown`), after `<RemainingCount/>`, outside the `<ul>` conditional                                                                                                                                                |
| Zod at every action boundary / Prisma only in lib / no raw SQL        | n/a: no action, no Prisma, no SQL in `src/`; `check-layers` clean                                                                                                                                                                                                                                                                                    |
| migration reversible and indexed                                      | n/a: none                                                                                                                                                                                                                                                                                                                                            |
| no secret, no suppression                                             | pass                                                                                                                                                                                                                                                                                                                                                 |
| features map row moved                                                | pending: F21 is ✗; the plan assigns ✅ to step 4 (`docs(map)` by dev-lead), not the feat commit. Must land before the PR.                                                                                                                                                                                                                            |
| would a test fail if one changed line were reverted (probe on a copy) | see below                                                                                                                                                                                                                                                                                                                                            |

Probes on a copy (`src/components/overdue-count.test.tsx` only; `src/components/` is outside Stryker's `mutate`):

| Mutant (line)                                        | Result                                                                                                            |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `useState(todayOf(new Date()))` (13)                 | killed by AC-23.5                                                                                                 |
| `<span>` → `<p>` (21)                                | killed by AC-23.3                                                                                                 |
| drop `previous ??` (17)                              | survives: equivalent with `[]` deps (effect runs once per mount; StrictMode's re-run happens at the same instant) |
| drop `[]` deps (18)                                  | survives: `previous ??` keeps the first day                                                                       |
| drop both `??` and `[]` (17–18)                      | killed by AC-23.6 (`3 overdue` after midnight)                                                                    |
| drop `today === undefined` guard (20, `today ?? ''`) | survives: equivalent, `isOverdue(d, '', …)` is false for every d, so nothing renders                              |
| `page.tsx` passes `shown` instead of `todos`         | traced, not run: on `/?q=zzz` `shown` is `[]`, AC-23.7's `expectOneCount(page, '1 overdue')` fails                |

On the two questions raised: `previous ??` alone is not killable and is equivalent today; it is a redundant second guard
with `[]` that makes REQ-23.6 survive a future deps change, and the pair is killed by AC-23.6. Not a finding. The
`docs/metrics.md` row in the feat commit follows `code-writer.md` step 5–6 and the B5.2 precedent (6562b3f); its figures
(213/7 ACs/93.52/`overdue-count.ts` 100) match what this review ran. Not a finding.

### Findings

None blocking.

Verdict: ready for PR (after the plan's step 4 `docs(map): F21 … [B5.1]` lands)

Riskiest unfalsified: real-browser midnight rollover with the page open (REQ-23.6) is only proven under jsdom fake
`Date`; a Server Action re-render after midnight keeps the mount's day because state survives the RSC refresh, which
AC-23.6's `rerender` models but no e2e exercises.

## Evidence

- AC met: 7/7 (unit 207 → 213, e2e 44 → 45, mutation 93.52, `overdue-count.ts` 100)
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
