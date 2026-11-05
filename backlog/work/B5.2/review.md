# B5.2 review

## Plan review (round 2)

Plan at `6a75941`. Round 1 (headless run, changes requested, not recorded here because of the path-guard bug fixed
by B1.78) asked for: (1) AC-24.4 passes on today's code, so pin it together with AC-24.5 before the red commit;
(2) the unit baseline is 202, not 199. Both are addressed: step 1 is a `test(todos): B5.2 pin AC-24.4 …` commit
(202 → 204), and every count now starts from 202.

| Check                                                                             | Result                                                                                                                                                                                                                                                         |
| --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: `scripts/ci/plan-files.sh --file` prints the 4 files; `src/components/todo-item.tsx` is the one D-30 assigns to §24; the test, the new `e2e/24-escape-edit-title.spec.ts` and the new F22 row (§24, after F20 = §22 and B5.1's F21 = §23) follow from it |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: `TodoItem({ todo }: { readonly todo: Todo }): ReactNode` unchanged; one internal typed handler; no action, schema, model or query                                                                                                                        |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: approach A (handler on the field, `!pending` guard, no `preventDefault`); Q1–Q4 adopted as advised                                                                                                                                                       |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: 6 criteria (AC-24.1–24.6), every Then is a role count, a value or a call count                                                                                                                                                                           |
| verification lists exact commands with expected numbers                           | pass: verified baselines myself: `pnpm test` → `Tests 202 passed (202)`; e2e `test(` count 43. Targets 204 after the pin, 207 after green (2 + 3), e2e 44, 11 existing `todo-item.test.tsx` tests (counted: 11)                                                |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass with stated deviation: no skeleton (no new export, red is behavioral, allowed by `testing.md`); a pin step precedes the red; subjects follow convention; the pin commit has no `(red)` marker, so `verify-red.sh` treats only step 2 as the red           |
| the section has a `Lead approves spec` box, ticked only by a human                | pass: the box exists in `spec/contracts/22-escape-edit-title.md`, unticked; not ticked by me                                                                                                                                                                   |
| no settled D-n contradicted                                                       | pass: D-30 (one component per card, `todo-item.tsx` for B5.2), D-7, D-27/D-28 (`scripts/agent/tier.sh` on the plan → `medium`)                                                                                                                                 |
| `scripts/next-task.sh --check B5.2` says no overlap                               | pass: `[next-task] B5.2: no overlap with any Doing or Review card`                                                                                                                                                                                             |

Costs the lead should know before approving (none blocks):

1. `pending` is shared by the toggle and the save, so Escape is also ignored while a completion toggle is in flight;
   §24 names only a save (REQ-24.5). Every AC stays true; it is a stated superset (advice, P2 spec silent).
2. Escape cancels only from the title field: with focus on Save, the checkbox or Delete while editing, Escape does
   nothing (§24 "title field"; approach B was rejected for this).
3. `setDraft(todo.title)` on Escape is redundant with `onEdit`'s reset, so no test can kill its removal; component code
   is outside the mutation scope (`src/lib` + `src/actions`), so the score is unaffected.
4. The `Lead approves spec` box of §24 is still unticked; the lead's gate (D-7) may tick it with the plan approval.

Verdict: approved
