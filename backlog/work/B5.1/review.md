# B5.1 review

## Plan review (round 1)

Scope: ui + lib (`src/lib/overdue-count.ts`, `src/components/overdue-count.tsx`, `src/app/page.tsx`, `e2e/`).
Baselines checked here: `pnpm test` → `Tests  207 passed (207)`; 44 `test(` calls in `e2e/*.ts`; `scripts/agent/tier.sh backlog/work/B5.1/plan.md` → `medium`.

| Check                                                                                  | Result                                                                                                                                                                   |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| every file in the plan belongs to the section's features (map)                         | pass: the 6 code/test paths are the ones §23 names (two new files + `page.tsx`, D-30); F21 row is new, card names F21                                                    |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib         | pass: signatures copied verbatim from §23's function block; `readonly` props, explicit `ReactNode`; no action, no Prisma; `overdue-count.ts` pure like `todo-overdue.ts` |
| plan follows `advice.md`'s recommendation or states the deviation                      | pass: approach A, same placement (after `<RemainingCount/>`, from `todos`, not `shown`)                                                                                  |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number              | fail: 7 criteria and no banned adjective, but the plan's way of measuring AC-23.5's "hydration logs 0 errors and 0 warnings" cannot fail (reason 1)                      |
| verification lists exact commands with expected numbers                                | pass: 207 → 213 and 44 → 45 match today's baselines; verify-red, mutation ≥ 70, build, check-plan-scope named                                                            |
| work breakdown has skeleton → red → green → map → review with convention subjects      | pass: `chore(todos)` / `test(todos) … (red)` / `feat(todos)` / `docs(map): F21 … [B5.1]` / `docs(backlog): B5.1 review …`                                                |
| the section has a `Lead approves spec` box, ticked only by a human (D-7), never by you | pass: `- [ ] Lead approves spec` present in `spec/contracts/21-overdue-count.md`, unticked                                                                               |
| no settled D-n contradicted                                                            | pass: D-30 (B5.1 is batch 1's one `page.tsx` card, §17 files untouched, package guides out); D-28 tier medium, no `config-change-approved`                               |
| `scripts/next-task.sh --check B5.1` says no overlap                                    | pass: `[next-task] B5.1: no overlap with any Doing or Review card` (exit 0)                                                                                              |

Costs the lead approves with this approach (not reasons, stated so they are not found after approval):

- JS off: the count never appears (REQ-23.5 by design). Before hydration: no count.
- After local midnight with the page open, row markers (§17, per-row day) and the count (own day) can disagree until reload (analysis Q3, REQ-23.6).
- `src/components/` is outside Stryker's `mutate` (`stryker.config.*` line 11), so the component's `previous ?? todayOf(…)` and
  `today === undefined` guards are guarded only by AC-23.5/23.6 assertions, not by the mutation score the plan quotes.
- The plan is 62 lines against `planning.md`'s ≈ 40 (B5.2's 51-line plan was approved); not blocking.

Verdict: changes requested

1. AC-23.5's "0 errors and 0 warnings on `process.stderr.write`" is vacuous in this harness, and the plan's test strategy
   (`process.stderr.write spy`) relies on it alone. Probe on a copy (`/tmp/probe-b51-244385`, `src/components/zz-probe.test.tsx`,
   jsdom project): hydrating `renderToString(<span>server</span>)` with `<span>client</span>` under `vi.spyOn(process.stderr, 'write')`
   gave `{ stderr: 0, rec: 1 }` (`onRecoverableError` called once, stderr spy 0 calls); a direct `console.error('x')` also gave 0
   stderr calls, because Vitest's worker routes console output over RPC, not through the worker's `process.stderr.write`. So a
   component whose first client render differs from the server markup still passes that clause. The §17 precedent
   (`src/components/todo-due-date-overdue.test.tsx` AC-17.5) asserts `onRecoverableError` 0 calls instead. Plan must state how AC-23.5's
   hydration clause is made falsifiable: keep the spec's stderr assertion and add `hydrateRoot(…, { onRecoverableError })` with 0
   calls (a stronger test, not a weaker one), or route the Then's wording to `/advise` for a `docs(spec): §23` change before the red
   commit. Either choice goes in the plan's Verification/Interfaces text so the test-writer does not discover it.

## Plan review (round 2)

Scope: ui + lib (unchanged from round 1). Plan diff since round 1 (`git diff f701f86 0bc8786 -- backlog/work/B5.1/plan.md`): the
Costs line, the test-file row, and the AC-23.5 / Stryker sentences in Verification; Files, Interfaces, Work breakdown unchanged.
Baselines re-checked: `pnpm test` → `Tests  207 passed (207)`; 44 `test(` calls in `e2e/*.ts`; `scripts/agent/tier.sh backlog/work/B5.1/plan.md` →
`medium`; `scripts/ci/plan-files.sh --file backlog/work/B5.1/plan.md` → the 7 Files rows, exit 0 (without `--file`: exit 3, no
approval commit yet, as expected).

| Check                                                                                  | Result                                                                                                                                                                                                                                                                                                                                   |
| -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                         | pass: unchanged since round 1; the two new files + `page.tsx` are the ones §23 names (D-30), F21 row new                                                                                                                                                                                                                                 |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib         | pass: signatures verbatim from §23's function block; no action, no Prisma, `overdue-count.ts` pure                                                                                                                                                                                                                                       |
| plan follows `advice.md`'s recommendation or states the deviation                      | pass: approach A. One stated strengthening over advice's test strategy (advice: "`process.stderr.write` spy"): `onRecoverableError` 0 calls added, stderr assertion kept                                                                                                                                                                 |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number              | pass: 7 criteria; reason 1 of round 1 resolved: AC-23.5's hydration clause is now asserted by `hydrateRoot(…, { onRecoverableError })` called 0 times (as AC-17.5, `todo-due-date-overdue.test.tsx:141,148`), which the round-1 probe showed fires once on a server/client text mismatch, plus the spec's 0 `process.stderr.write` calls |
| verification lists exact commands with expected numbers                                | pass: 207 → 213 (6 new: AC-23.1–23.6), 44 → 45 (AC-23.7), verify-red exit 0, mutation ≥ 70 with `src/lib/overdue-count.ts` in `mutate` (`stryker.config.*:11`), build, check-plan-scope                                                                                                                                                  |
| work breakdown has skeleton → red → green → map → review with convention subjects      | pass: unchanged from round 1                                                                                                                                                                                                                                                                                                             |
| the section has a `Lead approves spec` box, ticked only by a human (D-7), never by you | pass: `- [ ] Lead approves spec` in `spec/contracts/21-overdue-count.md`, still unticked; not touched by this review                                                                                                                                                                                                                     |
| no settled D-n contradicted                                                            | pass: D-30 (one `page.tsx` card, §17 files untouched), D-28 tier medium, D-19 no `config-change-approved` needed                                                                                                                                                                                                                         |
| `scripts/next-task.sh --check B5.1` says no overlap                                    | pass: `[next-task] B5.1: no overlap with any Doing or Review card` (exit 0)                                                                                                                                                                                                                                                              |

Costs the lead approves with this approach (carried from round 1; the plan now states the first two itself):

- JS off: the count never appears (REQ-23.5 by design); before hydration: no count.
- After local midnight with the page open, row markers (§17) and the count can disagree until a reload (REQ-23.6, analysis Q3).
- `src/components/` is outside Stryker's `mutate`: the component's `previous ?? todayOf(…)` and `today === undefined` guards are
  covered only by AC-23.5/23.6 assertions, not by the mutation score (the plan now says so).
- Existing e2e checked for collision with the new `N overdue` text: `e2e/17-overdue.spec.ts` matches `Overdue` only with
  `{ exact: true }` and inside `listitem` (lines 70, 149, 162); no other e2e reads whole-page text. Not a reason.
- The plan is 66 lines against `planning.md`'s ≈ 40; not blocking (precedent B5.2). Status line still reads `Rounds: 1`; the
  dev-lead updates it with the approval line.

Verdict: approved

`approved` means ready for the lead's gate (medium tier: D-27 lets a reviewer-approved plan proceed on the issue's label), not
approved for build by this review; `Plan approved by:` and the spec box are left for the lead / runner.

## Diff review (round 1)

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
