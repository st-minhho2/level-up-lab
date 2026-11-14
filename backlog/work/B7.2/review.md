# B7.2 review

## Plan review (round 1)

Scope: ui (`src/components`, `src/app`, `e2e`), plus one pure `src/lib` module. Risk tier: `scripts/agent/tier.sh backlog/work/B7.2/plan.md` → `medium` (D-28), so a reviewer approval proceeds under D-27.

| Check                                                                             | Result                                                                                                                                                                                                                                                                                                                                                                                                            |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: the 3 source files and 3 test files are the ones §36's Function contracts and the advice Impact table name. F34 is D-37's id for B7.2, and it is not yet in `spec/features-map.md` (F30 is the §32 precedent). `filter-counts.ts`, `todo-complete-all.ts` and `actions/complete-all.ts` stay out, as §36 requires.                                                                                          |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: the signatures are copied verbatim from §36. The inline props type matches the contract and §14's existing component. The label module is pure, with no `server-only` and no Prisma. No action, schema or query is added.                                                                                                                                                                                   |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: approach A, and B is rejected for the reason the advice gives. One undeclared detail: the advice puts the skeleton stub in the `test(...)` commit, but the plan gives it its own `chore(todos): B7.2 skeleton` commit. That follows `.claude/docs/git-workflow.md:8` and the B6.4 precedent, and `verify-red.sh` uses the red commit's parent as its base, so the stub is present either way. Not blocking. |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: 7 criteria (AC-36.1 to 36.7). Each Then gives exact names, role counts, call counts or navigation counts.                                                                                                                                                                                                                                                                                                   |
| verification lists exact commands with expected numbers                           | pass: I confirmed the baseline myself. `pnpm test` gives "Tests 280 passed (280)" in 45 files, and `playwright test --list` gives "Total: 64 tests in 28 files". The expected counts are 280 → 281 (pin) → 284 for unit tests and 64 → 67 for e2e. They are consistent if each criterion is one test. The mutation floor is 70. `verify-red.sh B7.2` should exit 0.                                               |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: `chore(todos): B7.2 skeleton` → `test(todos): B7.2 pin …` (green, no `(red)`, before the red base, as in B6.4) → `test(todos): B7.2 … (red)` → `feat(todos): B7.2 …` → `docs(map): F34 … [B7.2]` → `docs(backlog): B7.2 review …`.                                                                                                                                                                          |
| the section has a `Lead approves spec` box, ticked only by a human, never by you  | pass: `spec/contracts/34-complete-all-count.md:5` has `- [ ] Lead approves spec`, unticked. The reviewer did not touch it.                                                                                                                                                                                                                                                                                        |
| no settled D-n contradicted                                                       | pass: D-37 names the §14 edits for B7.2 (REQ-14.4, contracts, a statement that the "message how many were changed" does not apply). They landed in c155c3a, which is an ancestor of HEAD. The plan adds no `docs(spec)` commit and leaves §14's test file untouched. D-28 gives tier medium. D-33/D-37 allow one `page.tsx` card per batch, and B7.2 is that card for batch 1.                                    |
| `scripts/next-task.sh --check B7.2` reports no overlap                            | pass: `[next-task] B7.2: no overlap with any Doing or Review card` (exit 0)                                                                                                                                                                                                                                                                                                                                       |

Checks I ran:

- **Existing tests stay green.** The only exact-name matches are in `src/components/complete-all-button.test.tsx`. Those tests render without `count`, so REQ-36.6 keeps the name "Mark all complete". The e2e matches in files 14, 16, 22 and 30 use Playwright's default substring match, and none passes `exact: true`.
- **Pin and red commits.** AC-36.3 and AC-36.7 already pass on the skeleton, so they go in the pin commit. AC-36.2 and AC-36.4 fail because the skeleton ignores `count`, so the name lacks "(n)". AC-36.1 fails on `NotImplementedError`. Neither fails on an import.

Costs the lead should know: none. No behavior is dropped. A user without JavaScript, or one clicking before hydration, gets the same as today (advice.md, Impact).

Verdict: approved

Approved means the plan is ready for the gate. Because the tier is medium and the issue is `agent-ready`, the reviewer's approval stands in for the lead's under D-27.

## Diff review (round 1)

Scope: all (`src/lib`, `src/components`, `src/app`, `e2e`). HEAD 3d35c16, range `main...HEAD`.

### Command results (run by the reviewer; the last line of each)

| Command                              | Last line                                                                                                                                        |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm lint`                          | `All matched files use Prettier code style!`                                                                                                     |
| `pnpm typecheck`                     | `> tsc --noEmit` (no error)                                                                                                                      |
| `pnpm test`                          | `Tests  284 passed (284)` (47 files)                                                                                                             |
| `pnpm test:e2e`                      | `67 passed (3.3m)`                                                                                                                               |
| `pnpm test:mutation --concurrency 1` | `Final mutation score of 93.08 is greater than or equal to break threshold 70` (`complete-all-label.ts` 100.00, 6 killed, 0 survived)            |
| `scripts/ci/check-suppressions.sh`   | `OK: no new suppressions`                                                                                                                        |
| `scripts/ci/check-config-change.sh`  | `OK: no protected config changed`                                                                                                                |
| `scripts/ci/check-feat-commits.sh`   | `OK: no feat commit touches tests`                                                                                                               |
| `scripts/ci/check-ac-coverage.sh`    | `§37: ✗, no tests expected yet (6 criteria)`; §36 line: `§36: ✗, no tests expected yet (7 criteria)` (index row stays ✗ until closing, per plan) |
| `scripts/ci/check-spec-sections.sh`  | `OK: sections cited: 1 … 36 37`                                                                                                                  |
| `scripts/ci/check-features-map.sh`   | `OK`                                                                                                                                             |
| `scripts/ci/check-plan-scope.sh`     | `OK: feat/B7.2-agent stays inside the approved plan of B7.2 (D-27 approval)`                                                                     |
| `scripts/ci/check-backlog.sh`        | `OK: README matches the cards`                                                                                                                   |
| `scripts/verify-red.sh B7.2`         | `RESULT: red for the right reason` (label 1 new failed; component 3 ran, 2 new failed, AC-36.3 counted old)                                      |
| `git diff --stat main...HEAD`        | `12 files changed, 495 insertions(+), 5 deletions(-)`                                                                                            |

How the mutation score was obtained. The plain `pnpm test:mutation` failed three times on this host, every time for
an environmental reason, never a code one. The first run overlapped my own e2e run, which rewrote `.next/types`
(TS6053 in the checker's dry run). The second had checker workers SIGKILLed for memory: a sibling worktree,
`feat-b7-3-agent`, was running Stryker at the same time (`pgrep`, 7.9 GB host, 0.5 GB free). The third failed in the
dry run on `AC-7.2` with "Hook timed out in 10000ms". The same config at `--concurrency 1` finished with 93.08
(383 killed, 7 timeouts, 26 survived, 3 no coverage). Code-writer's 92.84 is one detected mutant lower. I put the
gap down to timeouts that flap under load. Either way the 70 floor holds, and the new module is 100 both times.

The first `verify-red.sh` run also failed, reporting "GREEN before implementation: AC-36.3" (3 new). It ran while
Stryker was loading the host, and the base vitest run in its scratch worktree produced no report, so every test
counted as new (verify-red.sh:118). On a clone at bfcf41d the base run lists AC-36.3, and a rerun of `verify-red.sh`
passed. The red is proven.

### Checklist

| Check                                                                 | Result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every AC-36.n has a test whose assertion matches its Then             | pass. 36.1: `toEqual` on the 3 exact labels. 36.2: 1 button, exact name, enabled, 0 status, 0 alert. 36.3: both renders, disabled then enabled. 36.4: 1 call, `[]` args, same node named "(2)" after resolve, 0 status/alert, no "changed/updated". 36.5: 4 addresses, `exact: true`. 36.6: every step plus navigations = 0. 36.7: plain, disabled, "No todos yet".                                                                                                                                                                             |
| no test weakened after the red commit                                 | pass: `git log --first-parent --no-merges cbbe08c..HEAD -- '*.test.*' e2e/` is empty, and the `--merges --remerge-diff` query is empty. The pin commit bfcf41d only adds tests. §14's `complete-all-button.test.tsx` and `e2e/14-complete-all.spec.ts` are unchanged.                                                                                                                                                                                                                                                                           |
| every changed file is in `plan.md`                                    | pass: the 7 Files rows, plus `docs/metrics.md` (paperwork, which the plan declares exempt). `check-plan-scope.sh` OK.                                                                                                                                                                                                                                                                                                                                                                                                                           |
| interfaces match §36 Function contracts                               | pass: `completeAllLabel(open: number): string` and `CompleteAllButton({ disabled, count }: { readonly disabled: boolean; readonly count?: number }): ReactNode` match verbatim. `page.tsx` passes `count={filterCounts(todos).active}` from the unfiltered `todos` (page.tsx:55).                                                                                                                                                                                                                                                               |
| Zod at every action boundary / Prisma only in `src/lib` / no raw SQL  | n/a: no action, schema or query was added. `complete-all-label.ts` is pure (no Prisma, no `server-only`), so the client import is safe.                                                                                                                                                                                                                                                                                                                                                                                                         |
| migration reversible and indexed                                      | n/a: no `prisma/` change.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| no secret, no suppression                                             | pass: `check-suppressions.sh` OK, and there is no env or key in the diff.                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| features map row moved                                                | pass: the F34 row was added in its own `docs(map)` commit and appended unaligned (B1.97). `check-features-map.sh` OK.                                                                                                                                                                                                                                                                                                                                                                                                                           |
| would a test fail if one changed line were reverted (probe on a copy) | pass. On a clone in `$TMPDIR` at c6a9e99, I replaced `{completeAllLabel(count ?? 0)}` with the static text. AC-36.2 and AC-36.4 failed, and the 3 §14 tests plus AC-36.3 stayed green ("2 failed, 4 passed"). Each `completeAllLabel` boundary mutant (`>= 1`→`> 1`, `>= 0`) is killed by AC-36.1, so Stryker reports 100 with 0 survivors. Reverting `count=` in `page.tsx`, or passing it from `shown`, fails AC-36.5 on `/?filter=completed` and `/?q=zzz` (traced, not run: the active count there would be 0, which gives the plain name). |

### The dev-lead's three questions

1. **The metrics row is in the feat commit.** This is not a deviation. `.claude/agents/code-writer.md` steps 5–6 tell
   code-writer to fill the row and commit "implementation + metrics" as the `feat(...)` commit.
   `check-feat-commits.sh` rejects only test files, and `check-plan-scope.sh` treats `docs/metrics.md` as paperwork.
   The row's content is wrong, though: see finding [1].
2. **The mutation score's provenance.** I re-measured it myself: 93.08 overall and 100 for `complete-all-label.ts`
   at `--concurrency 1`. Plain `pnpm test:mutation` does not finish on this host while another worktree runs
   Stryker (see above). That is environmental, not a property of this diff.
3. **Whether AC-36.6's after-click step depends on the revalidated count.** It does. Before revalidation the button
   is still named "Mark all complete (2)", and the locator uses `exact: true`, so
   `completeAllButton(page, 'Mark all complete')` matches nothing until the page re-renders with
   `count={filterCounts(todos).active}` = 0. A pending-only disabled state cannot satisfy it. A component that kept
   the count in local state would also fail it, because the name would stay "(2)". `toBeDisabled()` then checks the
   same re-rendered node. React commits the revalidated tree and the end of the transition together, so by then
   `disabled` comes from the §14 prop (`!todos.some(…)` = true), not from `pending`.

### Findings

```
[1] KIND: correctness
    WHERE: docs/metrics.md:146
    DEFECT: The B7.2 row's Green cell is cbbe08c, the red test commit. Every other card row records the merged feat commit (B6.4 → ca2a58d "feat(todos): B6.4 … (#278)"), and the 92.84 in the row is not what the gate reproduces.
    TRIGGER: read the row after this branch merges: `| B7.2 | §36 | … | cbbe08c (pin bfcf41d) | cbbe08c |`
    WRONG BEHAVIOUR: the Red and Green columns name the same commit, so the per-card table says this card went green at its red commit. Anyone reading lead time or red→green from the table gets a wrong anchor.
    CONFIDENCE: confirmed (git log -1 on cbbe08c, ca2a58d, f2a571e, 36846c1, 7f72998)
```

This finding does not block the PR. It is paperwork outside `src/`, and dev-lead may write `docs/metrics.md`. Fix it
in this branch's paperwork, or in the closing commit once the squash sha exists: put the feat or merge sha in the
Green cell, and either 93.08 (reviewer, `--concurrency 1`) or a range in the Mutation cell.

No blocking finding in `src/`, `e2e/` or the map.

Verdict: ready for PR

Riskiest unfalsified: I traced, but did not run, the e2e revert probe for `page.tsx` (`count=` dropped, or computed
from `shown`). AC-36.5's `/?filter=completed` and `/?q=zzz` legs are the only guard against a count that follows
the filter or search, and I inferred their failure from the seeded data (B open, D open, C done → 0 visible open)
rather than observing it.
