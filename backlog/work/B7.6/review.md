# B7.6 review

## Plan review (round 1)

Scope: ui (only `src/components/todo-due-date.tsx`, a component test, an e2e file, the features map).
Baseline re-run by the reviewer: `pnpm test` → `Test Files 48 passed (48)`, `Tests 298 passed (298)` (matches the plan).

| Check                                                                                           | Result                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                                  | pass: the component is the one §40's contract names ("The only file of `src/` this section changes"); the test, e2e and the F38 row are §40's; the AC-37.1 rewrite is authorized by D-38                                                                                                                                                                                                                                   |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib                  | pass: `TodoDueDate` signature unchanged (copied from §40 Function contracts); internal `save(value: string): void` / `onClear(): void` with return types; the mutation stays `setTodoDueDateAction`; no lib, action, schema or Prisma change (REQ-40.7)                                                                                                                                                                    |
| plan follows `advice.md`'s recommendation or states the deviation                               | pass, with a note: approach A is followed. The advice's Impact section asks for a `chore(todos): B7.6 skeleton` stub; the plan drops it ("No new export, so no skeleton (as B7.3)") with a reason and the B7.3 precedent. Red still fails on an assertion (no button named "Clear due date"), not an import, so `verify-red.sh` step 6 can pass. Not flagged as a deviation from the advice in words; acceptable as stated |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number                       | pass: 6 AC (AC-40.1–40.6), each Then is counts, exact texts, call args, `defaultPrevented`, disabled state                                                                                                                                                                                                                                                                                                                 |
| verification lists exact commands with expected numbers                                         | **fail**: green is "`pnpm test` 298 → 298 + N new passed (49 files)" and "`pnpm test:e2e` +1" with no e2e baseline; N is not a number (reason 1)                                                                                                                                                                                                                                                                           |
| work breakdown has skeleton → red → green → map → review with convention subjects               | pass: skeleton step present as "none" with a reason; `test(todos): B7.6 … (red)`, `feat(todos): B7.6 …`, `docs(map): F38 … [B7.6]`, `docs(backlog): B7.6 review …` match B7.3's subjects on main (`14defd1 feat(todos): B7.3 …`)                                                                                                                                                                                           |
| the section has a `Lead approves spec` box, ticked only by a human (D-7), never by the reviewer | pass: `- [ ] Lead approves spec` present in `spec/contracts/38-due-date-clear.md`, unticked; not touched                                                                                                                                                                                                                                                                                                                   |
| no settled D-n contradicted                                                                     | pass: D-37 (component only, no server change) and D-38 (AC-37.1 rewritten to 5 children in the red commit, not the feat commit) are followed; §37's AC-37.1 on this branch already reads "exactly 5"                                                                                                                                                                                                                       |
| `scripts/next-task.sh --check B7.6` says no overlap                                             | pass: `[next-task] B7.6: no overlap with any Doing or Review card`                                                                                                                                                                                                                                                                                                                                                         |

Other things checked, no finding:

- No existing test besides AC-37.1 (`todo-due-date-today-button.test.tsx:84`, `toHaveLength(4)`) counts the form's children or
  the buttons in the due-date editor; `getAllByRole('button')` length checks are only in other components' tests; every
  `name: 'Clear …'` query is `Clear completed…`, exact-string, so a "Clear due date" button collides with none.
- AC-37.1's rewritten title differs from the current one, so `verify-red.sh` treats it as new and requires it red: it
  is (the current form has 4 children).
- Costs the lead takes are stated: the button shows and sends `''` when no date is stored (REQ-40.1, Out of scope
  forbids hiding it), and B7.3's AC-37.1 test changes under D-38. No dropped behavior; no role is blocked.

Verdict: changes requested

1. Verification has no expected number for the green unit run or the e2e run. Replace "298 + N new passed (49
   files)" with the count the strategy produces (AC-40.1 a/b, AC-40.2 a/b, AC-40.3 a/b, AC-40.4 a/b, AC-40.5 a, b and
   one row per Ctrl/Meta/Alt/Shift/ArrowLeft as `advice.md` plans = 15, AC-37.1 replaced not added → 313 passed, 49
   files, if that is the layout the test-writer will use; state whichever count is intended), and give the e2e
   baseline and target ("`pnpm test:e2e` X → X + 1 passed"). Without them the diff review cannot tell a dropped or
   merged `it.each` row from the plan.
