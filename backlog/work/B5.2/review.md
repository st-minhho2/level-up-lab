# B5.2 review

## Plan review (round 2)

Plan at `6a75941`. Round 1 (headless run, changes requested, not recorded here because of the path-guard bug fixed
by B1.78) asked for: (1) AC-24.4 passes on today's code, so pin it together with AC-24.5 before the red commit;
(2) the unit baseline is 202, not 199. Both are addressed: step 1 is a `test(todos): B5.2 pin AC-24.4 …` commit
(202 → 204), and every count now starts from 202.

| Check                                                                             | Result                                                                                                                                                                                                                                                                   |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| every file in the plan belongs to the section's features (map)                    | pass: `scripts/ci/plan-files.sh --file` prints the 4 files; `src/components/todo-item.tsx` is the one D-30 assigns to §24; the test, the new `e2e/24-escape-edit-title.spec.ts` and the new F22 row (§24, after F20 = §22 and the F21 that B5.1 reserves) follow from it |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: `TodoItem({ todo }: { readonly todo: Todo }): ReactNode` unchanged; one internal typed handler; no action, schema, model or query                                                                                                                                  |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: approach A (handler on the field, `!pending` guard, no `preventDefault`); Q1–Q4 adopted as advised                                                                                                                                                                 |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: 6 criteria (AC-24.1–24.6), every Then is a role count, a value or a call count                                                                                                                                                                                     |
| verification lists exact commands with expected numbers                           | pass: verified baselines myself: `pnpm test` → `Tests 202 passed (202)`; e2e `test(` count 43. Targets 204 after the pin, 207 after green (2 + 3), e2e 44, 11 existing `todo-item.test.tsx` tests (counted: 11)                                                          |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass with stated deviation: no skeleton (no new export, red is behavioral, allowed by `testing.md`); a pin step precedes the red; subjects follow convention; the pin commit has no `(red)` marker, so `verify-red.sh` treats only step 2 as the red                     |
| the section has a `Lead approves spec` box, ticked only by a human                | pass: the box exists in `spec/contracts/22-escape-edit-title.md`, unticked; not ticked by me                                                                                                                                                                             |
| no settled D-n contradicted                                                       | pass: D-30 (one component per card, `todo-item.tsx` for B5.2), D-7, D-27/D-28 (`scripts/agent/tier.sh` on the plan → `medium`)                                                                                                                                           |
| `scripts/next-task.sh --check B5.2` says no overlap                               | pass: `[next-task] B5.2: no overlap with any Doing or Review card`                                                                                                                                                                                                       |

Costs the lead should know before approving (none blocks):

1. `pending` is shared by the toggle and the save, so Escape is also ignored while a completion toggle is in flight;
   §24 names only a save (REQ-24.5). Every AC stays true; it is a stated superset (advice, P2 spec silent).
2. Escape cancels only from the title field: with focus on Save, the checkbox or Delete while editing, Escape does
   nothing (§24 "title field"; approach B was rejected for this).
3. `setDraft(todo.title)` on Escape is redundant with `onEdit`'s reset, so no test can kill its removal; component code
   is outside the mutation scope (`src/lib` + `src/actions`), so the score is unaffected.
4. The `Lead approves spec` box of §24 is still unticked; the lead's gate (D-7) may tick it with the plan approval.

Verdict: approved

## Diff review (round 1)

Range `main...HEAD` at `4bd6c6a` (pin `b918076`, red `e21c12a`, feat `4bd6c6a`). Probes ran on a copy (`cp -r`).

Housekeeping in this file: round 2's first table row cited B5.1's section by number, a section that has no heading on
this branch, so `check-spec-sections.sh` failed on this file alone. Reworded to "the F21 that B5.1 reserves"; the
meaning and verdict of round 2 are unchanged. Prettier re-padded that table.

| Command                       | Last line                                                                                  |
| ----------------------------- | ------------------------------------------------------------------------------------------ |
| `pnpm lint`                   | `✖ 1 problem (0 errors, 1 warning)`: the pre-existing `todo-form.tsx:23`, not in this diff |
| `pnpm typecheck`              | `tsc --noEmit`, exit 0                                                                     |
| `pnpm test`                   | `Tests 207 passed (207)`                                                                   |
| `pnpm test:e2e`               | `44 passed (1.2m)`                                                                         |
| `pnpm test:mutation`          | `Final mutation score of 93.40 is greater than or equal to break threshold 70`             |
| `check-suppressions.sh`       | `OK: no new suppressions`                                                                  |
| `check-config-change.sh`      | `OK: no protected config changed`                                                          |
| `check-feat-commits.sh`       | `OK: no feat commit touches tests`                                                         |
| `check-ac-coverage.sh`        | `OK` (§24 still ✗: `no tests expected yet (6 criteria)`)                                   |
| `check-spec-sections.sh`      | before the reword: `::error::` on this file; after: `OK: sections cited: 1 … 22 24`        |
| `check-features-map.sh`       | `OK`                                                                                       |
| `verify-red.sh B5.2`          | `RESULT: red for the right reason` (3 new unit tests failed; e2e skipped, no server)       |
| `git diff --stat main...HEAD` | `15 files changed, 558 insertions(+), 4 deletions(-)`                                      |

| Check                                                     | Result                                                                                                                                                                                                                                                                                                                                                                         |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| every AC-24.n has a test whose assertion matches its Then | pass: AC-24.1–24.5 in `todo-item.test.tsx` assert the counts, values and call counts of each Then; AC-24.6 in `e2e/24-escape-edit-title.spec.ts`. AC-24.6's "0 `textbox` roles" cannot hold page-wide (the page always renders "New todo" and the search box); counting fields named "Edit title" page-wide is the strongest satisfiable reading. Spec wording gap, see note 1 |
| no test weakened after the red                            | pass: `git log --first-parent --no-merges e21c12a..HEAD -- '*.test.*' e2e/` empty; the merge `--remerge-diff` query on the same range is empty (no merge after the red)                                                                                                                                                                                                        |
| every changed file in `plan.md`                           | pass: `e21c12a..HEAD` touches `todo-item.tsx`, `spec/features-map.md`, `docs/metrics.md` (paperwork, plan line "Paperwork (exempt)"); the pin and red touch the two planned test files                                                                                                                                                                                         |
| interfaces match §24's contract                           | pass: `TodoItem({ todo })` props unchanged, no new export; internal `onTitleKeyDown(event: KeyboardEvent<HTMLInputElement>): void`, as planned                                                                                                                                                                                                                                 |
| Zod at action boundary, Prisma only in lib, no raw SQL    | n/a: no action, lib, schema or query touched                                                                                                                                                                                                                                                                                                                                   |
| migration reversible and indexed                          | n/a: no migration                                                                                                                                                                                                                                                                                                                                                              |
| no secret, no suppression                                 | pass: `check-suppressions.sh` OK; diff read, nothing secret                                                                                                                                                                                                                                                                                                                    |
| features map row moved                                    | partial: F22 row added ✗ in the feat as planned; plan step 4 (`docs(map): F22 … [B5.2]`, ✅) has not landed yet and must precede the PR                                                                                                                                                                                                                                        |
| would a test fail if one changed line were reverted       | probed on the copy, `todo-item.test.tsx`: drop `\|\| pending` → AC-24.4 fails; drop `setEditing(false)` → AC-24.1, 24.2, 24.3 fail; drop `setError(undefined)` → AC-24.3 fails; any key cancels → AC-6.2, 6.4, 10.2, 24.3, 24.4, 24.5 fail; drop `setDraft(todo.title)` → 16 passed (survives, note 2)                                                                         |

Notes (none blocking):

1. AC-24.6 "0 `textbox` roles" (and the same words in AC-24.1/24.3, which hold in the unit tests because they render
   one row) is unsatisfiable on the full page. The e2e reading is sound; the Then should say "0 `textbox` roles named
   'Edit title'". A `/spec-trace` report for the lead, not a test defect: no input makes the e2e pass on a wrong
   implementation that the literal Then would catch.
2. `setDraft(todo.title)` in `onTitleKeyDown` is an equivalent mutant: the draft is rendered only in edit mode, and
   the only way back into edit mode is `onEdit`, which resets it first. Stated as cost 3 in round 2; component code is
   outside the mutation scope. It stays because §24's contract names the reset.
3. Escape is also ignored while a toggle is in flight (shared `pending`), cost 1 of round 2; unchanged.

Findings: none.

Verdict: ready for PR (after plan step 4, the `docs(map)` F22 ✅ commit)

Riskiest unfalsified: Escape pressed during an IME composition also cancels the edit (the handler does not check
`isComposing`); §24 is silent on composition and no test covers it.
