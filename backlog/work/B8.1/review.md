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
