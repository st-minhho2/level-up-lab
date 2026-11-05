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
