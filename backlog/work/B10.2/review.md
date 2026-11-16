# B10.2 review

## Plan review (round 1)

SCOPE: ui

| Check                                                                                  | Result                                                                                                                                                                                                   |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                         | pass: `clear-completed-button.tsx` is the only `src/` file §49 names; the test file is the one §49 "How the criteria observe it" names; `spec/features-map.md` F47 is the row E10 and D-45 assign to §49 |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib         | pass: signature copied from §49 Function contracts, explicit `ReactNode` return, `readonly` props; no action, schema, Prisma or lib change                                                               |
| plan follows `advice.md`'s recommendation or states the deviation                      | pass: approach A (`useId`), B rejected for REQ-49.5 / AC-49.6                                                                                                                                            |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number              | pass: 6 criteria, each Then states counts, exact text, attribute presence or equality                                                                                                                    |
| verification lists exact commands with expected numbers                                | fail: numbers are exact (`vitest list` 360 confirmed, 88 e2e tests in 40 spec files confirmed) but `scripts/verify-red.sh B10.2` exit 0 cannot hold with the planned red commit (reason 1)               |
| work breakdown has skeleton → red → green → map → review with convention subjects      | fail: no skeleton is justified (no new export); the breakdown lacks the commit that must hold the already-green guard (reason 1)                                                                         |
| the section has a `Lead approves spec` box, ticked only by a human (D-7), never by you | pass: `47-clear-completed-description.md:5` has `- [ ] Lead approves spec`, unticked; under D-27 the `agent-ready` label is the spec approval (same as B9.4 on §47)                                      |
| no settled D-n contradicted                                                            | pass: D-27, D-28 (`scripts/agent/tier.sh` → `medium`), D-44, D-45 (component-only, no `page.tsx`, `src/lib`, `src/actions`, `todo-form.tsx`)                                                             |
| `scripts/next-task.sh --check B10.2` says no overlap                                   | pass: "[next-task] B10.2: no overlap with any Doing or Review card"                                                                                                                                      |

Verdict: changes requested

1. **The red gate the plan promises fails as planned.** `scripts/verify-red.sh` (line 16) passes only if "zero NEW tests
   passed". The plan puts AC-49.5 in the `(red)` commit and says it "may be green". Traced against the current
   `clear-completed-button.tsx`, it is green: with no `completedCount` the name is "Clear completed"; a success sets
   `error` to `undefined`, so there is no `<p role="alert">` and no `aria-describedby` (the attribute does not exist
   yet), the description is `''`, there are 0 alert and 0 status roles, and `onClear` calls the action once with no
   argument. A red commit that includes it ends in "GREEN before implementation: AC-49.5…" and exit 1, which
   contradicts the Verification line. Fix: do what B9.4 did (`work/B9.4/review.md:62`). Land AC-49.5 in its own
   `test(todos): B10.2 … pin` commit (no `(red)` marker) before the red commit, so it already ran at the base and
   counts as old. Add that commit to the Work breakdown and the Files row. Or drop the claim that the red commit
   alone proves red.
2. **AC-49.2's red depends on an assertion its Then does not contain.** Everything in AC-49.2's Then is true of
   today's code. After the second (successful) result there are 0 alerts, no `aria-describedby`, description `''`,
   the name is "Clear completed (2)" at all three points, and the action ran 2 times with 0 arguments. "Fails before
   the success" only holds if the test adds an extra check after the failure (`aria-describedby` equals the alert's
   `id`, or description equals the message). The plan should name that intermediate assertion explicitly, so the
   test-writer adds it and the diff review can check it against REQ-49.1 rather than the Then. If it is not added,
   AC-49.2 belongs in the pin commit with AC-49.5, and the red proof rests on AC-49.1, 49.3, 49.4, 49.6.

Costs the lead takes on approval (once the above are fixed): no e2e covers the attribute (the spec says so, §49
"How the criteria observe it"); the component is outside the mutation gate's `src/lib` + `src/actions` scope, so
the `error !== undefined ? messageId : undefined` mutants are killed only by the AC-49.1/49.2/49.5 absent-attribute
asserts and the AC-49.6 distinct-id assert, and nothing measures that.

## Plan review (round 2)

SCOPE: ui. Plan at 0d6d088 (changes since round 1: Files row, Verification, Work breakdown 2a/2b).

| Check                                                                                  | Result                                                                                                                                                                                                                                                                                                                                                                                 |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                         | pass: unchanged from round 1; `clear-completed-button.tsx` is the only `src/` file §49 names (D-45 lists the same), the test file is the one §49 "How the criteria observe it" names, F47 is the E10 card's feature id                                                                                                                                                                 |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib         | pass: signature copied from §49 Function contracts; no action, schema, Prisma, lib or `page.tsx` change                                                                                                                                                                                                                                                                                |
| plan follows `advice.md`'s recommendation or states the deviation                      | pass: approach A (`useId`); B rejected for REQ-49.5 / AC-49.6                                                                                                                                                                                                                                                                                                                          |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number              | pass: 6 criteria, each Then states counts, exact text, attribute presence or id equality                                                                                                                                                                                                                                                                                               |
| verification lists exact commands with expected numbers                                | pass: 360 → 366 vitest, 88 → 88 e2e, mutation "CI only" (no `src/lib`/`src/actions` change). Round 1 reason 1 resolved: `verify-red.sh` (header steps 3–6) takes the parent of the first `(red)` commit as the base, so with the pin commit before it AC-49.2 and AC-49.5 run at the base and count as old; the new tests are AC-49.1, 49.3, 49.4, 49.6, each red today (traced below) |
| work breakdown has skeleton → red → green → map → review with convention subjects      | pass: skeleton justified as none (no new export); 2a `test(todos): B10.2 pin …` without `(red)`, 2b `… (red)`, then `feat`, `docs(map): F47 … [B10.2]`, review; the same shape as B9.4 (#354: `test(todos): B9.4 pin AC-47.3 …` before its `(red)` commit)                                                                                                                             |
| the section has a `Lead approves spec` box, ticked only by a human (D-7), never by you | pass: `47-clear-completed-description.md:5` `- [ ] Lead approves spec`, unticked; D-27 label stands in, as B9.4                                                                                                                                                                                                                                                                        |
| no settled D-n contradicted                                                            | pass: D-27, D-28 (`scripts/agent/tier.sh backlog/work/B10.2/plan.md` → `medium`), D-44, D-45                                                                                                                                                                                                                                                                                           |
| `scripts/next-task.sh --check B10.2` says no overlap                                   | pass: "[next-task] B10.2: no overlap with any Doing or Review card"                                                                                                                                                                                                                                                                                                                    |

Red traced against `src/components/clear-completed-button.tsx` at HEAD (no `useId`, no `id`, no `aria-describedby`):
AC-49.1 fails on "aria-describedby equals the alert's id" / description equals the message after the failure;
AC-49.3 fails while pending (description `''`, no attribute); AC-49.4 fails after the first failure (description
`''`); AC-49.6 fails on the second button's description. AC-49.2 and AC-49.5 hold today in full, as the plan says.
Round 1 reason 2 resolved by the second option offered (AC-49.2 pinned, red proof on the other four).

Verdict: approved (ready for the lead's gate; medium tier, so under D-27 the reviewed plan of an `agent-ready` card
may proceed)

Costs the lead takes on approval:

1. AC-49.2 as pinned checks only the end state after the success. The "together, in the commit that removes the
   message" half of REQ-49.3 is not observed between renders; AC-49.3's after-success assertions cover the same end
   state. No test reads an intermediate frame.
2. The pin and red commits share one file. If the red commit renames or rewrites an AC-49.2 / AC-49.5 title,
   `verify-red.sh` counts it as new and green and exits 1. The test-writer must leave those two `it`s byte-identical
   in 2b.
3. Carried from round 1: no e2e covers the attribute (§49 says so), and the component is outside the mutation
   gate's scope, so whether the conditional's mutants are killed is checked by review only.
4. Paperwork, non-blocking: the plan's closing line still says `Rounds: 1`, and at 62 lines it runs past the ≈ 40-line
   one-screen guide (B9.4's approved plan was 56).

## Diff review (round 1)

SCOPE: ui. HEAD 1780b7e (pin 3e05a63 → red 4153c19 → feat 1ce8afa → map 1780b7e).

### Command results (last line each)

| Command                             | Last line                                                                                         |
| ----------------------------------- | ------------------------------------------------------------------------------------------------- |
| `pnpm lint`                         | All matched files use Prettier code style!                                                        |
| `pnpm typecheck`                    | `tsc --noEmit`, exit 0, no output                                                                 |
| `pnpm test`                         | Tests 366 passed (366) (plan: 360 → 366)                                                          |
| `pnpm test:e2e`                     | 88 passed (4.7m) (plan: 88 → 88)                                                                  |
| `scripts/mutation-gate.sh`          | mutation: CI only, no src/lib or src/actions change                                               |
| `scripts/ci/check-suppressions.sh`  | [check-suppressions] OK: no new suppressions                                                      |
| `scripts/ci/check-config-change.sh` | [check-config-change] OK: no protected config changed                                             |
| `scripts/ci/check-feat-commits.sh`  | [check-feat-commits] OK: no feat commit touches tests                                             |
| `scripts/ci/check-ac-coverage.sh`   | [check-ac-coverage] OK: every criterion of a shipped section has a test                           |
| `scripts/ci/check-spec-sections.sh` | [check-spec-sections] OK: sections cited: 1 … 53                                                  |
| `scripts/ci/check-features-map.sh`  | [check-features-map] OK                                                                           |
| `scripts/verify-red.sh B10.2`       | 6 ran (4 new), 4 new failed, 0 new passed OK (red on behavior) · RESULT: red for the right reason |
| `git diff --stat main...HEAD`       | 8 files changed, 514 insertions(+), 3 deletions(-)                                                |

### Checklist

| Check                                                                      | Result                                                                                                                                                                                                                                                     |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every AC-49.n has a test whose assertion matches its Then                  | pass: AC-49.1–49.6, one `it` each, titles start with the id; each Then's counts, exact text, attribute absence / id equality and call arguments are asserted (AC-49.6 "all ids distinct" via `Set` size)                                                   |
| no test weakened after the red commit                                      | pass: `git log --first-parent --no-merges 4153c19..HEAD -- '*.test.*' e2e/` empty; no merge commits (remerge-diff empty). Red commit's only deletion in the pinned file is the `vitest` import line (adds `afterEach`); AC-49.2 / AC-49.5 bodies unchanged |
| every changed file is in `plan.md`                                         | pass: component, test file, `features-map.md` F47; `docs/metrics.md` row and `backlog/work/B10.2/*` are the plan's stated paperwork                                                                                                                        |
| interfaces match the section's contracts                                   | pass: signature unchanged; `useId()`, `id={messageId}` on the alert, `aria-describedby={error !== undefined ? messageId : undefined}`, word for word as §49 Function contracts; §10 clause already on main (`08-mutation-feedback.md:60`)                  |
| Zod at every action boundary · Prisma only in lib · no raw SQL · migration | n/a: no action, lib, Prisma or migration change                                                                                                                                                                                                            |
| no secret, no suppression                                                  | pass (check-suppressions OK; diff read)                                                                                                                                                                                                                    |
| features map row moved                                                     | pass: F47 §49 ✅ in `docs(map)` commit 1780b7e                                                                                                                                                                                                             |
| would a test fail if one changed line were reverted?                       | pass for each line: probe on a clone under `$TMPDIR`. `aria-describedby={messageId}` (unconditional) → 5 failed; `id` dropped from the alert → 4 failed; the `useId` line reverted alone does not compile. Two non-revert mutants survive, below           |

### Findings

```
[1] KIND: coverage
    WHERE: src/components/clear-completed-button-description.test.tsx:178 (AC-49.6); src/components/clear-completed-button.tsx:19
    DEFECT: no test distinguishes `useId()` from a fixed id, so REQ-49.5 ("two instances never share it") is unobserved.
    TRIGGER: replace `const messageId = useId();` with `const messageId = 'clear-completed-message';` on the probe copy
    WRONG BEHAVIOUR: 14/14 component tests still pass; two failing instances in one document would share an id and each
             button would be described by the first message. Root cause is the AC: AC-49.6's When clicks only one
             button, so only one element carries an id and "all ids distinct" is vacuous. The test matches its Then.
    CONFIDENCE: confirmed (ran it)

[2] KIND: coverage
    WHERE: src/components/clear-completed-button.tsx:37; no AC reads the first pending
    DEFECT: REQ-49.2's "while the first clear is pending" clause (no `aria-describedby`) is not asserted by any test.
    TRIGGER: change the condition to `pending || error !== undefined ? messageId : undefined` on the probe copy
    WRONG BEHAVIOUR: 14/14 pass; during the first pending the button would carry an `aria-describedby` pointing at
             an element that does not exist. AC-49.2 and AC-49.5 wait for `toBeDisabled()` but their Thens assert only
             after the result, so the tests match the ACs.
    CONFIDENCE: confirmed (ran it)
```

Both are gaps in the approved criteria, not defects in the shipped code: traced, `error` starts `undefined` and is
set only inside the transition from a result, and `messageId` is `useId()`, so the code meets REQ-49.2 and REQ-49.5 as
written. Neither blocks this PR. Closing them needs a §49 criterion change (AC-49.6 clicks both buttons; AC-49.5 reads
the button while pending). That goes to the lead through `/spec-trace`. A test-only patch would assert beyond the Thens.

Verdict: ready for PR

Riskiest unfalsified: the REQ-49.3 "in the same commit" atomicity, meaning the alert and the attribute come off in one
React commit. Both depend on the one `error` state, so no intermediate frame can split them. No test reads a frame
between the two, so that claim comes from reading the code, not from a test.
