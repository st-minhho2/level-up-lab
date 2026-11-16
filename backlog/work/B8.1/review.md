# B8.1 review

## Plan review (round 1)

Scope: ui (`src/components/todo-item.tsx`, a component test, an e2e file). Reviewed `plan.md` at 14637df against
`advice.md`, `spec/contracts/39-edit-title-select.md` (§41), D-7, D-27, D-28, D-39 and `scripts/verify-red.sh`.

| Check                                                                                  | Result                                                                                                                                                                                                                        |
| -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                         | pass: `todo-item.tsx` is the only `src/` file §41 names (contract line "The only file of `src/` this section changes"); the test, e2e (`41-…`, by section number as B7.6's `40-…`) and the new F39 row (D-39 assigns F39) fit |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib         | pass: signature unchanged, internal `useRef<HTMLInputElement>(null)` + `useEffect([editing])`; no action, schema, Prisma, env                                                                                                 |
| plan follows `advice.md`'s recommendation or states the deviation                      | pass: approach A verbatim                                                                                                                                                                                                     |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number              | pass: 6 criteria (AC-41.1–41.6), each Then is values, counts or `activeElement` identity                                                                                                                                      |
| verification lists exact commands with expected numbers                                | fail: reason 2 (unit total is "323 + N"; the red expectations contradict `verify-red.sh`, reason 1)                                                                                                                           |
| work breakdown has skeleton → red → green → map → review with convention subjects      | fail: reason 1 (no pin commit for the criteria that are green on today's code); the rest matches `backlog/CLAUDE.md` commit order, skeleton skipped with a stated reason                                                      |
| the section has a `Lead approves spec` box, ticked only by a human (never by reviewer) | pass: `39-edit-title-select.md:5` `- [ ] Lead approves spec`, unticked; the plan relies on D-27 (the `agent-ready` label is the spec approval), as §38–§40 did. Not ticked by me                                              |
| no settled D-n contradicted                                                            | pass: D-39 (B8.1 lifts and edits nothing, F39, no `page.tsx`/`src/lib`/`src/actions`); D-28 tier: `scripts/agent/tier.sh backlog/work/B8.1/plan.md` → `medium`, so D-27 lets a reviewer-approved plan proceed                 |
| `scripts/next-task.sh --check B8.1` says no overlap                                    | pass: `[next-task] B8.1: no overlap with any Doing or Review card`                                                                                                                                                            |

Measured on this branch: `pnpm test` → `Tests  323 passed (323)`, `Test Files  50 passed (50)` (matches the plan's
baseline); `e2e/` holds 33 spec files (matches); `scripts/ci/check-plan-scope.sh` → OK.

Probe (clone at `$TMPDIR/c`, `node_modules` linked): a test written to AC-41.4's Given/When/Then, (a) and (b) as
`it.each`, and an AC-41.5 variant whose Given is reached by `field.focus(); field.setSelectionRange(0, 7)`, all
**pass on today's `todo-item.tsx`** (3 passed). With approach A applied on the clone, `vitest run src/components` →
`Tests  164 passed (164)`, 20 files: approach A breaks no existing component test (the advice's `[unverified]`
user-event risk is falsified for the unit layer).

Verdict: changes requested

1. **The red commit as planned fails `scripts/verify-red.sh B8.1`.** The script passes only when "zero NEW tests
   passed" (`scripts/verify-red.sh:16`), and the plan expects exit 0 while putting AC-41.1–41.5 in the `(red)` commit.
   Trigger: AC-41.4's Then (value kept, 1 alert, selection 2..4 kept, `activeElement` is "Save" after the person
   focuses it, 1 call per Enter) already holds today, because today's component never moves focus or selection; I ran
   it on the clone: (a) and (b) pass. The plan's "AC-41.1–41.4 each red" is wrong for AC-41.4, and its own "AC-41.5
   may pass before green, recorded in the body" is also a gate failure, not a note. Fix as B5.6 and B6.1 did: a
   `test(todos): B8.1 pin AC-41.4 …` commit before the red one (green on today's code, each case asserting its own
   Then), and AC-41.5 either in that pin commit or written so its Given comes from the click on "Edit title" alone (no
   test-set focus or selection), which makes it red today (typing `Z` then yields `Buy mikZ` or nothing, not `Z`).
   State which in the plan and add the pin row to the work breakdown. Cost of not fixing: the run stops at the red
   gate, or a test-writer weakens AC-41.4 to make it fail.
2. **Verification has no exact unit totals.** "323 → 323 + N passed (51 files; N = the red commit's new cases)" does
   not say what N is. Trigger: AC-41.3 and AC-41.4 each have (a)/(b) cases, so the count depends on `it` vs `it.each`
   and is not checkable. State the rows each AC adds, then the totals after the pin commit, after the red commit
   (which fail, on which assertion) and after green (323 → … → …, 51 files), and `pnpm test:e2e` 33 → 34 files with
   AC-41.6 failing red on which assertion.

Not a finding (recorded for the lead): `src/components` is outside mutation scope, so the `[editing]` list and the
`if (editing)` guard are guarded only by AC-41.3–41.5 (stated in the plan's costs). The AC-41.4 pin is what catches a
widened dependency list, so reason 1's fix must keep it, not drop it.

## Plan review (round 2)

Scope: ui. Reviewed `plan.md` at 1bf47cf (the only file it changes since be5aa89) against round 1's two reasons,
`scripts/verify-red.sh` and §41 (`spec/contracts/39-edit-title-select.md`).

| Check                                                                                  | Result                                                                                                                                                                          |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                         | pass: unchanged from round 1 (`todo-item.tsx`, `todo-item-select.test.tsx`, `e2e/41-edit-title-select.spec.ts`, F39 row)                                                        |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib         | pass: signature unchanged; internal ref + `useEffect([editing])`; no action, schema, Prisma, env                                                                                |
| plan follows `advice.md`'s recommendation or states the deviation                      | pass: approach A                                                                                                                                                                |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number              | pass: 6 criteria, each Then is values, counts or `activeElement` identity                                                                                                       |
| verification lists exact commands with expected numbers                                | pass (reason 2 fixed): rows per AC (1+1+2+2+1 = 7); 323 → 325 (pin) → 325 passed / 5 failed (red) → 330 (green), 51 files; e2e 33 → 34 files, AC-41.6 red on the active element |
| work breakdown has skeleton → red → green → map → review with convention subjects      | pass (reason 1 fixed): skeleton skipped with reason; 2a `test(todos): B8.1 pin AC-41.4 …` (no `(red)`), 2b `… (red)`, feat, `docs(map)`, review                                 |
| the section has a `Lead approves spec` box, ticked only by a human (never by reviewer) | pass: `39-edit-title-select.md:5` `- [ ] Lead approves spec`, unticked; D-27 (`agent-ready` label) stated. Not ticked by me                                                     |
| no settled D-n contradicted                                                            | pass: D-39 (nothing lifted, F39); `scripts/agent/tier.sh backlog/work/B8.1/plan.md` → `medium` (D-28), so D-27 applies                                                          |
| `scripts/next-task.sh --check B8.1` says no overlap                                    | pass: `[next-task] B8.1: no overlap with any Doing or Review card`                                                                                                              |

`scripts/ci/check-plan-scope.sh` → `OK: feat/B8.1-agent changes only paperwork`.

Gate mechanics traced: `verify-red.sh` takes as base the parent of the first `(red)` commit, which is the pin commit,
so AC-41.4 (a), (b) ran at the base and count as old; only the 5 rows added by the red commit are judged new. The
plan's red exit 0 holds if those 5 fail.

Probe (clone at `$TMPDIR/p2`, `node_modules` linked; the 7 rows written to the plan's Given/When/Then, AC-41.5 reaching
its Given by the click alone, AC-41.4 focusing "Save" and pressing Enter a second time):

- today's `todo-item.tsx`: `Tests  5 failed | 2 passed (7)`; AC-41.1, 41.2, 41.3 (a), (b) fail on
  `expected <body> to be <input>`, AC-41.5 on `expected 'Buy mik' to be 'Z'`; both AC-41.4 rows pass. Matches the plan.
- approach A applied: `vitest run src/components` → `Tests  168 passed (168)`, 20 files; full `vitest run` →
  `Tests  330 passed (330)`, `Test Files  51 passed (51)`. Matches the plan's green totals; AC-41.5 green confirms
  user-event types over a programmatic `select()`.
- dependency list widened to `[editing, todo, error]`: AC-41.4 (a), (b) fail (2 failed, 5 passed). The pin catches it.

Not run: the e2e red/green for AC-41.6 (needs the server; the plan records its red assertion).

Verdict: approved (ready for the lead's gate, not approved for build)

Costs the lead takes (from the plan, confirmed): one frame with the field unfocused (post-paint effect); `if (editing)`
guard removal is not caught by any test (with `editing` false the ref is null, so behavior is identical); mutation
does not cover `src/components`.

## Diff review (round 1)

Scope: ui. Reviewed `main...1fad778` (feat d57a711, red 87f33ae, pin 2dad5fd, map 3c479bd, metrics 1fad778).

### Command results (last line of each, run by the reviewer)

| Command                                   | Last line                                                                                   |
| ----------------------------------------- | ------------------------------------------------------------------------------------------- |
| `pnpm lint`                               | `All matched files use Prettier code style!` (exit 0)                                       |
| `pnpm typecheck`                          | `tsc --noEmit` clean                                                                        |
| `pnpm test`                               | `Tests  330 passed (330)`, `Test Files  51 passed (51)` (matches plan 325 → 330)            |
| `pnpm test:e2e`                           | `76 passed (3.3m)`                                                                          |
| `scripts/mutation-gate.sh`                | `mutation: CI only, no src/lib or src/actions change`                                       |
| `scripts/ci/check-suppressions.sh`        | `OK: no new suppressions`                                                                   |
| `scripts/ci/check-config-change.sh`       | `OK: no protected config changed`                                                           |
| `scripts/ci/check-feat-commits.sh`        | `OK: no feat commit touches tests`                                                          |
| `scripts/ci/check-ac-coverage.sh`         | `OK: every criterion of a shipped section has a test`                                       |
| `scripts/ci/check-spec-sections.sh`       | `OK: sections cited: 1 … 43`                                                                |
| `scripts/ci/check-features-map.sh`        | `OK`                                                                                        |
| `scripts/ci/check-plan-scope.sh`          | `OK: feat/B8.1-agent stays inside the approved plan of B8.1 (D-27 approval)`                |
| `scripts/verify-red.sh B8.1`              | `RESULT: red for the right reason` (7 ran, 5 new failed; e2e skipped, needs a server)       |
| `git diff --stat main...HEAD`             | 9 files, 660 insertions, 2 deletions; `src/` only `src/components/todo-item.tsx` (+13 / -2) |
| `pnpm test:e2e e2e/41-… --repeat-each=40` | `40 passed (2.6m)`                                                                          |

### Checklist

| Check                                                 | Result                                                                                                                                                                                                                                                                                   |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every AC-41.n has a test whose assertion matches Then | pass: AC-41.1–41.5 in `todo-item-select.test.tsx` (7 rows), AC-41.6 in `e2e/41-edit-title-select.spec.ts`; each Then's numbers (0/7, 0/7 on `Café 😀`, 0/7 and 0/8, 2/4 kept + focus on Save + 1 call, Z/1, Za/2, ArrowLeft 1, row text, 0 POSTs, `[Z, Walk the dog]`) asserted verbatim |
| no test weakened after the red commit                 | pass: `git log --first-parent --no-merges 87f33ae..HEAD -- '*.test.*' e2e/` empty; `--merges --remerge-diff` empty (no merges)                                                                                                                                                           |
| every changed file in `plan.md`                       | pass: the four planned files; `docs/metrics.md` and `backlog/work/B8.1/*` are paperwork named in the plan; `check-plan-scope.sh` OK                                                                                                                                                      |
| interfaces match §41 Function contracts               | pass: `TodoItem({ todo }: { readonly todo: Todo }): ReactNode` unchanged; no new export, prop, action, schema, model                                                                                                                                                                     |
| Zod at action boundary / Prisma only in lib / raw SQL | n/a: no action, lib or Prisma change                                                                                                                                                                                                                                                     |
| migration                                             | n/a: none                                                                                                                                                                                                                                                                                |
| no secret, no suppression                             | pass: `check-suppressions.sh` OK; diff read, nothing secret                                                                                                                                                                                                                              |
| Server/Client boundary, accessible names, row text    | pass: file already `'use client'`; label "Edit title", `id`, attributes unchanged (only `ref` added); AC-41.5 and AC-41.6 pin row text                                                                                                                                                   |
| features map row moved                                | pass: F39 §41 ✅ added in 3c479bd; `check-features-map.sh` OK                                                                                                                                                                                                                            |
| would a test fail if one changed line were reverted?  | pass except an equivalent mutant, see probe                                                                                                                                                                                                                                              |

Probe (`$TMPDIR/probe`, a `cp -r` copy; `vitest run todo-item-select.test.tsx todo-item.test.tsx`, 24 tests):

| Mutant of `todo-item.tsx:30-37`, `:86`                             | Result                                                                                    |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| deps `[]`                                                          | 5 failed                                                                                  |
| no dependency list                                                 | 8 failed                                                                                  |
| deps `[editing, draft]`                                            | 8 failed                                                                                  |
| deps `[editing, todo]` / `[editing, error]` / `[editing, pending]` | 2 failed each (AC-41.4)                                                                   |
| `focus()` removed / `select()` removed / `ref={fieldRef}` removed  | 5 failed each                                                                             |
| `if (!editing)`                                                    | 5 failed                                                                                  |
| `if (true)`                                                        | 24 passed: equivalent (ref is null whenever `editing` is false; the field is not mounted) |

### Findings

None blocking.

Observation outside this card (not a finding against its diff): `src/components/todo-form-warning.test.tsx` AC-39.4
timed out at 5061 ms in 1 of 4 full `pnpm test` runs on this branch (the dev-lead saw 2 of 4). On the probe with
main's `todo-item.tsx` and without `todo-item-select.test.tsx`, 6 of 6 full runs passed (323). AC-39.4's own duration
is 2381–3324 ms on both trees, so it sits close to the 5000 ms default and fails on load spikes; this card's diff does
not touch `todo-form.tsx` or its test and `todo-form` does not import `todo-item`. The added file plausibly adds
contention; it does not change AC-39.4's behavior. Fix belongs in a filed card (that test's typing cost or timeout),
not here; CI may need a rerun if it trips.

Verdict: ready for PR

Riskiest unfalsified: AC-41.6 reads focus and selection once right after `toBeVisible()`; it would race only if the
`useEffect` ran after that read. React 19.1 flushes passive effects of a discrete (click) update synchronously at the
end of the commit, and the test passed 40/40 repeated plus 1/1 in the full run, chromium only; Firefox and WebKit
`select()` behavior is not exercised.

## Diff review — AC titles follow-up (rounds 1–2)

Scope: ui (`src/components/todo-item-select.test.tsx`, titles only). Branch `test/B8.1-ac-titles` on origin/main
d922d82. Why: closing PR #335 flips §41 ✗ → ✅ and `check-ac-coverage.sh` then reports AC-41.3 and AC-41.4 uncovered,
because three titles did not start with "AC-41.n:".

### Round 1 (commit a8c5f09, test commit alone on d922d82)

Recorded after the fact: the path guard blocked writing it to a separate `review-ac-titles.md`, so the round-1
report went to the dev-lead only. Suites: `pnpm test` 338 passed, `pnpm test:e2e` 82 passed. Diff: 3 title strings
in one file, no assertion, setup or table row changed.

```
[1] KIND: plan-mismatch
    WHERE: backlog/work/B8.1/plan.md (no row for the branch's change at its approval commit)
    DEFECT: the branch changed a non-paperwork file with no approval commit for it on the branch.
    TRIGGER: scripts/ci/check-plan-scope.sh on test/B8.1-ac-titles at a8c5f09
    WRONG BEHAVIOUR: check-plan-scope exit 1 (plan-files exit 3, no "docs(backlog): B8.1 plan … approved" commit
    on the branch's first parent), so the guards job would fail the PR.
    CONFIDENCE: confirmed
```

Verdict (round 1): back to code-writer (plan paperwork, not code).

### Round 2 (fbdcb61 plan round 3 approved, then 646cd64 = the re-applied test commit)

Commands, last line each:

| Command                                                           | Result                                                                    |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `pnpm lint`                                                       | All matched files use Prettier code style! (exit 0)                       |
| `pnpm typecheck`                                                  | `tsc --noEmit`, exit 0                                                    |
| `pnpm test`                                                       | Tests 338 passed (338), 53 files                                          |
| `pnpm vitest run src/components/todo-item-select.test.tsx`        | Tests 7 passed (7)                                                        |
| `pnpm test:e2e`                                                   | not re-run: no `src/` or `e2e/` byte differs from round 1 (82 passed)     |
| `scripts/mutation-gate.sh`                                        | mutation: CI only, no src/lib or src/actions change                       |
| `scripts/ci/plan-files.sh B8.1`                                   | exit 0; lists `src/components/todo-item-select.test.tsx` (twice: 2 Files) |
| `scripts/ci/check-plan-scope.sh`                                  | OK: test/B8.1-ac-titles stays inside the approved plan of B8.1            |
| `check-suppressions`, `check-config-change`, `check-feat-commits` | OK each                                                                   |
| `check-ac-coverage`, `check-spec-sections`, `check-features-map`  | OK each (§41 still ✗ on this branch, so skipped)                          |
| `check-backlog`, `check-layers`                                   | OK, exit 0                                                                |
| `scripts/verify-red.sh B8.1`                                      | not applicable: no `(red)` commit on this branch; titles only             |
| `git diff --stat origin/main...HEAD`                              | plan.md +20 −1, todo-item-select.test.tsx +3 −3                           |

Checklist:

- 646cd64 vs a8c5f09: `diff <(git show --format= a8c5f09) <(git show --format= 646cd64)` empty; the tree diff
  `git diff a8c5f09 646cd64` touches only `backlog/work/B8.1/plan.md`. Nothing else changed.
- Plan accuracy: round 3's Files row names the one file and the three exact title rewrites; the diff is exactly
  those three lines. Interfaces: none. Its verification numbers reproduce (7, 338, coverage 6/6, scope OK).
- Approval commit: `docs(backlog): B8.1 plan round 3 approved` matches plan-files' subject regex; its field is
  `lead, 2026-11-16 (round 3; rounds 1–2: reviewer, D-27, tier medium, issue #316)`. Non-runner path holds in CI too:
  issue #316 is CLOSED, so check-plan-scope finds no open agent-ready issue naming B8.1 and does not pass `--run`
  (which would refuse a non-reviewer field); the branch is not `…/B8.1-agent`.
- Other readers of the field / Files: `scripts/metrics/wait-time.sh` (d27 test: the field no longer starts
  `reviewer (D-27,`, so fbdcb61 counts as a lead wait, which is true; it reads only a Done PR's first-parent head),
  `scripts/metrics/plan-deviations.sh` (runs plan-files on a Done PR's head; non-runner branch → lead field
  accepted), `scripts/agent/tier.sh` (union of both Files tables → medium, same as before), `feature-map.sh` (tier
  only), `next-task.sh --check` (`--any`, Files only), `.claude/hooks/plan-scope.sh` (same plan-files call). None
  breaks on the rewritten line.
- Tests not weakened: only title strings change; `AC-41.3:` / `AC-41.4:` now prefix all three.
- Probe (git clones under `$TMPDIR`, §41 flipped to ✅ in `spec/technical-requirements.md`): at 646cd64
  "§41 criteria=6 covered=6", OK; at d922d82 "§41 criteria=6 covered=4 MISSING: AC-41.3 AC-41.4", exit 1. The change
  is what makes #335's guards pass.

Findings: none blocking. Round-1 [1] closed (plan-files exit 0, check-plan-scope OK).

Observation (not a finding): `plan.md` is now 81 lines, beyond the ≈40-line one-screen rule; round 3 itself is 19
lines and stands as its own section, so the one-screen limit is met for what the lead approved.

Verdict: ready for PR

Riskiest unfalsified: CI's check-plan-scope decides the runner path from open agent-ready issues at run time; if
issue #316 were reopened with its label before the PR's guards run, `--run` would refuse the `lead, …` field (exit 5).
Today #316 is CLOSED and the local run took the lead path.
