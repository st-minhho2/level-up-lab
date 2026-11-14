# B7.6 analysis

Section: §40, `spec/contracts/38-due-date-clear.md` (written, 7 REQ, 6 AC). Edits under D-37: REQ-15.6 and the §15
contract (`13-due-date.md`) now list "Clear due date" between "Today" and "Update due date".

## Completeness

| Check                                | Result | Note                                                                                                                                                 |
| ------------------------------------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Intent without solution words        | pass   | one person-level outcome: remove the day in one press                                                                                                |
| Every behavior has a REQ             | pass   | order and name (40.1), call (40.2), success (40.3), failure (40.4), pending (40.5), Escape (40.6), view mode and no server change (40.7)             |
| One EARS pattern each                | pass   | state, event, unwanted, state, event, ubiquitous                                                                                                     |
| At most 7 criteria                   | pass   | 6                                                                                                                                                    |
| Every Then measurable                | pass   | counts, exact texts, call arguments, `defaultPrevented`, disabled state                                                                              |
| No banned adjective without a number | pass   |                                                                                                                                                      |
| Out of scope                         | pass   |                                                                                                                                                      |
| Unchanged behavior with proof titles | pass   | 8 titles copied verbatim from grep of `todo-due-date*.test.tsx` and `e2e/15-due-date.spec.ts`                                                        |
| Dependencies done                    | note   | B7.3 §37 is on main as text; its code is in PR #301. §40 is written against §37's text. B7.6 must start after #301 merges (the card already says so) |
| No settled D-n contradicted          | pass   | follows D-37; no server, action or `src/lib` change                                                                                                  |
| No limit invented                    | pass   | the only message is §10's `Could not save, try again`; no number added                                                                               |

Existing tests that mention due-date controls use exact names (`getByLabel('Due date', { exact: true })`,
`getByRole('button', { name: 'Update due date' })`), so a visible-text button "Clear due date" breaks none of them. The
button has no `aria-label`, so `getByLabelText('Due date')` still matches one element.

## Open questions

1. **Shown when the todo has no due date?** Proposed: yes, always in edit mode (REQ-40.1). Why: showing it by state
   would depend on the stored date and the draft; clicking it with no date sends `''`, which §15 REQ-15.3 already
   accepts. Otherwise: a hide rule, a REQ and one more AC.
2. **Escape on "Clear due date".** Proposed: closes the editor without saving, as §37 does for "Today" (REQ-40.6). Why:
   the same sibling-button rule; "Update due date" keeps Escape doing nothing (AC-28.6). Otherwise: Escape would do
   nothing on it and AC-40.5 goes.
3. **Does Clear send the typed draft?** Proposed: no, always `''` (REQ-40.2); on failure the draft is kept as typed
   (REQ-40.4).
4. **Order.** Proposed: Today, Clear due date, Update due date, so the submit stays last. Otherwise: swap, and AC-40.1
   and the contracts change.

## Needs a ruling

**Settled (D-38, option A).** The lead ruled: B7.6's `docs(spec)` also edits §37 (REQ-37.1, AC-37.1 "exactly 4" to "exactly 5", REQ-37.3) and nothing else there. The edits are made; B7.3's AC-37.1 test is rewritten in B7.6's red commit. The text below is the original request, kept for the record.

Conflict D-37 does not name: **§37 pins the form's exact children, and a fifth child breaks it.**

- `35-due-date-today.md` REQ-37.1 says the form shows "in this order, the label, the date field, one button named
  exactly "Today" … and the button "Update due date"".
- AC-37.1 says the form's element children are "exactly 4". B7.3's red test and code (PR #301) assert 4; after §40
  the form has 5, so that assertion fails.
- REQ-37.3 says the date is saved "only when the person activates "Update due date" or presses Enter"; "Clear due date"
  also saves.

Per the instruction, I did not state these "extended, not contradicted", and I did not edit §37 (not in D-37's list for
B7.6). REQ-15.6 and the §15 contract already name "Clear due date", so §15 and §37 now disagree until this is ruled.

- **Proposed decision:** extend D-37 for B7.6 to edit §37 in the same `docs(spec)` PR as §40, after #301 merges: REQ-37.1
  adds "Clear due date" to the order; AC-37.1 "exactly 4" becomes "exactly 5" with the Clear button in its place;
  REQ-37.3 reads "only when … activates "Update due date", presses Enter, or activates "Clear due date" (§40)".
- **Why:** the test for AC-37.1 must then change in B7.6's red commit (tests are rewritten from the edited section,
  as D-37 allows for B7.1).
- **What changes otherwise:** if AC-37.1 stays at 4, "Clear due date" cannot sit in the form, and B7.6 needs a
  different placement (outside the `<form>`, which breaks the "Today"/"Update" grouping), or the card is dropped.
- Decision request shape: options A (edit §37 as above, recommended), B (place the button outside the form), C (drop
  B7.6). Human rules.
