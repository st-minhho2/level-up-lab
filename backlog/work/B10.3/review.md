# B10.3 review

## Plan review (round 1)

Scope: ui (`src/components/todo-search-form.tsx`, a component test, one e2e file, the features map).

| Check                                                                             | Result                                                                                                                                                                                              |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: §50 names `todo-search-form.tsx` as the only `src/` file and names the test and e2e files; F48 follows F45 = §47 (F = § − 2)                                                                  |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: signature unchanged, a literal attribute, no action, no Prisma, no new export                                                                                                                 |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: approach A, B rejected with §50:88-90 as the reason                                                                                                                                           |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: 7 (AC-50.1 to AC-50.7), each Then has exact strings, counts or booleans                                                                                                                       |
| verification lists exact commands with expected numbers                           | fail: baselines confirmed (`vitest list` 360, `playwright --list` "Total: 88 tests in 40 files"), but "`scripts/verify-red.sh B10.3` exit 0" cannot hold with AC-50.2 in the red commit (reason 1)  |
| work breakdown has skeleton → red → green → map → review with convention subjects | fail: skeleton skipped with a reason (no new export, as B9.4), but the green-by-design AC-50.2 has no pin step before the red commit (reason 1)                                                     |
| the section has a `Lead approves spec` box, ticked only by a human                | pass: `48-search-hint.md:5` `- [ ] Lead approves spec`, unticked; not touched by me                                                                                                                 |
| no settled D-n contradicted                                                       | pass: D-45 lifts of §25 and §46 Out of scope are already on this branch's base (no "visible hint" left in `23-search-shortcut.md` or `44-search-select.md` Out of scope); the run edits no contract |
| `scripts/next-task.sh --check B10.3` says no overlap                              | pass: "[next-task] B10.3: no overlap with any Doing or Review card" (exit 0)                                                                                                                        |

Probe (clone under `$TMPDIR`, `node_modules` linked, one throwaway test file, current `todo-search-form.tsx`):
`Tests  1 failed | 1 passed (2)`. The AC-50.2 Then, written out in full (both renders: 1 searchbox named "Search
todos", 0 named "Press / to search", 0 elements with that text, `textContent` exactly `Search todosSearch` and
`Search todosSearchClear search1 match`, 0 `[aria-describedby]`/`[title]`), **passed** before the change. The AC-50.4
probe (`renderToStaticMarkup` + `DOMParser` under the jsdom project) loaded and failed on the assertion
(`expected null to be 'Press / to search'`), so the Q2 fallback (a second `node` file) is not needed.

Reasons:

1. AC-50.2 is green before the implementation, so the planned red commit fails its own gate. `scripts/verify-red.sh`
   (header line 16) passes only if "zero NEW tests passed" and reports `GREEN before implementation`; the code-writer's
   step 1 (`.claude/agents/code-writer.md:30`) stops on "one already green". The plan's answer, "may already be green,
   named in the commit body", does not get past either check. Trigger: the test-writer commits AC-50.1 to AC-50.6 in one
   `test(todos): B10.3 … (red)` commit and runs `scripts/verify-red.sh B10.3`, which exits 1. Fix (the B4.3 and B1.11
   way, `backlog/work/B4.3/plan.md:26-27`): land AC-50.2 green in its own `test(todos): B10.3 pin AC-50.2 …` commit
   (no `(red)`) before the red commit. Add that row to the work breakdown and fix the counts: pin 360 → 361; red adds 5
   failing (AC-50.1, 50.3, 50.4, 50.5, 50.6); green 366. Do not add a `placeholder` assertion to AC-50.2 to make it red.
   Its Then does not contain one.

Non-blocking, for the lead:

- `spec/contracts/23-search-shortcut.md:26`, "The hint "press / to search" is not shown.", still contradicts REQ-50.1.
  The plan names it as a lead-owned `docs(spec)` fix. The advice puts that fix "before the test commit", but the plan
  does not say whether the build waits for it. The lead should state whether it lands first or alongside.
- The Q2 fallback in the plan's Costs is moot (probe above). The planned Files list stands.

Verdict: changes requested

## Plan review (round 2)

Scope: ui. Read: `99d1fd8` (plan round 2, `plan.md` only, +19 −15), §50 (`48-search-hint.md`), `scripts/verify-red.sh`
header and `verify_feat`, `backlog/work/B4.3/plan.md:26,41,55` (pin precedent).

| Check                                                                             | Result                                                                                                                                                                                                                                                                                                                                   |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: unchanged from round 1; the four files are those §50:88-99 names, F48 row                                                                                                                                                                                                                                                          |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: signature pasted as §50:77-85, one literal attribute, no export, action or Prisma                                                                                                                                                                                                                                                  |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: approach A; the §25:26 conflict carried as the advice states ("It does not stop the build")                                                                                                                                                                                                                                        |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: 7, exact strings, counts and booleans                                                                                                                                                                                                                                                                                              |
| verification lists exact commands with expected numbers                           | pass: pin 360 → 361 green; red `verify-red.sh B10.3` exit 0 with 5 new failing; green 361 → 366; e2e 88 → 89; mutation "CI only". Traced: `verify-red.sh` takes the parent of the first `(red)` commit as base, which is the pin commit, so AC-50.2 runs at base in the same file and is not counted as new; the 5 new tests are all red |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: skeleton skipped with a reason (no new export, as B9.4); 2a pin `test(todos): B10.3 pin AC-50.2 …` without `(red)` as B4.3:55; 2b red; feat; `docs(map)`; review                                                                                                                                                                   |
| the section has a `Lead approves spec` box, ticked only by a human                | pass: `48-search-hint.md:5` `- [ ] Lead approves spec`, unticked; not touched by me                                                                                                                                                                                                                                                      |
| no settled D-n contradicted                                                       | pass: the run edits no contract (D-45); the `23-search-shortcut.md:26` fix is the lead's, named as a cost                                                                                                                                                                                                                                |
| `scripts/next-task.sh --check B10.3` says no overlap                              | pass: "[next-task] B10.3: no overlap with any Doing or Review card" (exit 0)                                                                                                                                                                                                                                                             |

Round 1 reason 1: resolved (pin step 2a, counts fixed, no `placeholder` assertion added to AC-50.2). Round 1
non-blocking items: the plan now states the build does not wait for the §25:26 fix and keeps it on "Waiting on you";
the Q2 fallback is dropped.

Costs the lead takes on approval (all stated in the plan):

- `spec/contracts/23-search-shortcut.md:26` still reads "The hint "press / to search" is not shown." and contradicts
  REQ-50.1 until the lead lands a `docs(spec)` fix; the card's PR will merge with the two contracts disagreeing unless
  that fix lands first.
- REQ-50.5 (`:placeholder-shown`) is proved only by the e2e AC-50.7, which `verify-red.sh` skips (needs a server); its
  red is not machine-checked before the feat commit.

Non-blocking: the plan's footer still reads `Rounds: 1`; the dev-lead updates it with the verdict.

Verdict: approved (ready for the lead's gate, not approved for build)

## Diff review (round 1)

Scope: ui. Range `main...HEAD`: pin `b258594`, red `71d2d8c`, feat `fefcf2d`, map `11455b8`.

### Command results (last line each, run by me)

| Command                             | Last line                                                                                                         |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                         | "All matched files use Prettier code style!" (exit 0)                                                             |
| `pnpm typecheck`                    | `tsc --noEmit`, no error                                                                                          |
| `pnpm test`                         | "Tests 366 passed (366)" (58 files)                                                                               |
| `pnpm test:e2e`                     | "89 passed (3.3m)"                                                                                                |
| `scripts/mutation-gate.sh`          | "mutation: CI only, no src/lib or src/actions change"                                                             |
| `scripts/ci/check-suppressions.sh`  | "OK: no new suppressions"                                                                                         |
| `scripts/ci/check-config-change.sh` | "OK: no protected config changed"                                                                                 |
| `scripts/ci/check-feat-commits.sh`  | "OK: no feat commit touches tests"                                                                                |
| `scripts/ci/check-ac-coverage.sh`   | "OK: every criterion of a shipped section has a test"                                                             |
| `scripts/ci/check-spec-sections.sh` | "OK: sections cited: 1 … 53"                                                                                      |
| `scripts/ci/check-features-map.sh`  | "OK"                                                                                                              |
| `scripts/verify-red.sh B10.3`       | "6 ran (5 new), 5 new failed, 0 new passed OK (red on behavior)"; "RESULT: red for the right reason"; e2e skipped |
| `git diff --stat main...HEAD`       | "9 files changed, 718 insertions(+), 2 deletions(-)"                                                              |

The AC-39.4/AC-39.5 load-dependent timeouts the dev-lead saw did not recur: 366/366 in one run. That file
(`todo-form-warning.test.tsx`) is outside this card's diff.

### Checklist

| Check                                                 | Result                                                                                                                                                                                                                            |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every AC-50.n has a test whose assertion matches Then | pass: AC-50.1–50.6 in `todo-search-form-hint.test.tsx`, AC-50.7 in `e2e/50-search-hint.spec.ts`. I compared each Then clause by clause, including the exact `textContent` strings, the 4 renders of 50.3 and the 0-to-4 selection |
| no test weakened after the red commit                 | pass: `git log --first-parent --no-merges 71d2d8c..HEAD -- '*.test.*' e2e/` empty; the remerge-diff is empty (no merges)                                                                                                          |
| every changed file is in `plan.md`                    | pass: 4 planned files plus the exempt paperwork (`docs/metrics.md`, `backlog/work/B10.3/*`)                                                                                                                                       |
| interfaces match §50 Function contracts               | pass: signature and props unchanged; one literal `placeholder` attribute; no export, constant, state, effect or handler added                                                                                                     |
| Zod at action boundary · Prisma only in lib · raw SQL | n/a: no action, lib or Prisma change                                                                                                                                                                                              |
| migration                                             | n/a                                                                                                                                                                                                                               |
| no secret, no suppression                             | pass (check-suppressions OK; diff read)                                                                                                                                                                                           |
| features map row moved                                | pass: F48 §50 ✅ added in `docs(map)` `11455b8`                                                                                                                                                                                   |
| would a test fail if a changed line were reverted?    | pass: the only behavioral line is the `placeholder`. verify-red shows that without it 5 tests fail. The header comment is not behavioral                                                                                          |

### Probes (`git clone` under `$TMPDIR`, `node_modules` linked, `todo-search-form-hint.test.tsx` only)

This checks whether the AC-50.5/50.6 steps after the first `placeholder` assertion can fail, which the red commit
could not show:

- M1, `event.preventDefault()` removed from the Escape handler: AC-50.5 fails ("expected false to be true", the
  `defaultPrevented` step). 1 failed | 5 passed.
- M4, `searchBoxRef.current?.select()` removed: AC-50.6 fails ("expected { start: 4, end: 4 } to deeply equal
  { start: 0, end: 4 }"). 1 failed | 5 passed.
- M3, `placeholder` dropped while a search is in effect: AC-50.3, 50.4, 50.5, 50.6 fail. 4 failed | 2 passed.
- M2, the literal removed and the attribute set from the `useEffect` instead (client-only, violates REQ-50.4):
  AC-50.4 fails (`placeholder: null` in the server string). 1 failed | 5 passed.

The later steps of AC-50.5 and AC-50.6 do fail when their behavior breaks. REQ-50.4 is guarded by AC-50.4 in the unit
layer, not only by the e2e.

### Findings

None blocking.

Non-blocking, carried from the plan (the lead's):

- `spec/contracts/23-search-shortcut.md:26` still reads "The hint "press / to search" is not shown." It contradicts
  REQ-50.1 and the shipped code. The lead's `docs(spec)` fix is still open, so it stays on the PR's "Waiting on you"
  list.
- The plan footer still reads `Rounds: 1` after round 2.

Verdict: ready for PR

Riskiest unfalsified: AC-50.7 (the only proof of REQ-50.5 `:placeholder-shown`) has never been observed red.
verify-red skips e2e, and I did not run it against the pre-feat tree (the probe clone has no worktree env file for
the database). By trace, at `71d2d8c` the first assertion (`firstResponse.text()` includes `placeholder="Press / to
search"`) is false, so the test would fail there. Its hydrated steps after that were never run against a broken
implementation.
