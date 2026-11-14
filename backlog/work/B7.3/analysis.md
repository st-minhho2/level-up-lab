# B7.3 analysis

Section: §37, `spec/contracts/35-due-date-today.md` (D-37, spec first). 6 REQ, 6 AC.

## Completeness

| Check                                | Result | Note                                                                                                                                                                   |
| ------------------------------------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Intent without solution words        | pass   | "picks today's day in one step"; no button, handler or hook named in the Intent                                                                                        |
| Every behavior has a REQ             | pass   | order and name (37.1), fill (37.2), no save (37.3), Escape on the button (37.4), pending and other keys (37.5), view mode (37.6)                                       |
| One EARS pattern each                | pass   | 37.1 state-driven, 37.2 event-driven, 37.3 unwanted, 37.4 event-driven, 37.5 state-driven, 37.6 ubiquitous                                                             |
| At most 7 criteria                   | pass   | 6                                                                                                                                                                      |
| Every Then measurable                | pass   | counts, exact field values, `defaultPrevented`, POST counts, call counts                                                                                               |
| No banned adjective without a number | pass   | none used                                                                                                                                                              |
| Out of scope                         | pass   | Clear button (B7.6) named only as "a later section"; no limits invented                                                                                                |
| Unchanged behavior with proof titles | pass   | 6 rows, titles copied from `grep` of `todo-due-date.test.tsx`, `-overdue.test.tsx`, `-today.test.tsx`                                                                  |
| Dependencies done                    | pass   | D-37 only; `todayOf` exists (`src/lib/todo-overdue.ts:11`)                                                                                                             |
| No settled D-n contradicted          | pass   | D-37 edits only: REQ-15.6, §15 contract line, REQ-28.7, §17 and §31 "a new control", REQ-17.8, REQ-31.7. D-30 (one file in `src/`) kept; D-32 (no cancel by blur) kept |

Existing tests broken by the new button: none found. Every `getAllByRole('button', { name })` in `todo-due-date*.test.tsx`
names "Edit due date" or "Update due date" (exact string match), and the e2e files use the same names. `getByText('Due
today')` is exact, so the "Today" button text does not match it.

Edits in other files (D-37 list only): REQ-15.6 and the §15 contract line now list the buttons in order, "Today" (§37),
"Update due date", so B7.6 adds "Clear due date" to that list. REQ-28.7, the two "a new control" lines, REQ-17.8 and
REQ-31.7 each carry a parenthetical saying they do not apply to §37. Prettier re-aligned the table columns of
`15-overdue.md`, `26-escape-due-date.md` and `29-due-today.md`, so their diffs are wider than the sentences changed.

## Open questions

1. **Does "Today" keep or clear the row's error message?** Proposed: keeps it (REQ-37.3); only the field changes, and
   the next save result or Escape removes it (REQ-15.11, REQ-28.4). Why: "fills the field, does not save" is all the
   card says. Otherwise: add "removes the message" to REQ-37.3 and an assertion to AC-37.2.
2. **Is "Today" disabled while a save is in flight?** Proposed: yes, as "Update due date" is (REQ-37.5). Why: the card
   is silent; a click then would overwrite the draft being saved. Otherwise: drop "disabled" from REQ-37.5 and AC-37.5(a).
3. **Test file name.** Proposed: `src/components/todo-due-date-today-button.test.tsx` (`todo-due-date-today.test.tsx` is
   §31's). Otherwise the card's `Test:` path changes.
4. **Focus after the click.** Proposed: not specified (Out of scope); the browser keeps focus on "Today", which is what
   AC-37.6's Escape step relies on.

## Needs a ruling

none. No conflict outside D-37's list was found.
