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
