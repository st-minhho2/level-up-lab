# B9.2 analysis

Section: §45 in `spec/contracts/43-due-date-focus.md` (new). Component: `src/components/todo-due-date.tsx` only.

## Completeness

| Check                                | Result | Note                                                                                                                                                         |
| ------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Intent without solution words        | pass   | the editor opens ready with the cursor in the date field; only the function contract names `focus()`, as §41 does                                            |
| Every behavior has a REQ             | pass   | REQ-45.1 to REQ-45.5: entry, re-entry, no refocus, only on the switch, nothing else changes                                                                  |
| One EARS pattern each                | pass   | 45.1 and 45.2 event-driven; 45.3 unwanted behavior; 45.4 and 45.5 ubiquitous                                                                                 |
| At most 7 criteria                   | pass   | 7: AC-45.1 to AC-45.6 component tests, AC-45.7 Playwright                                                                                                    |
| Every Then measurable                | pass   | `document.activeElement`, field value, alert count, focus-spy call count, POST count, list order                                                             |
| No banned adjective without a number | pass   | none used                                                                                                                                                    |
| Out of scope                         | pass   | restoring focus, selecting the date text, date picker, other rows, title field, scrolling, entering edit mode by a key                                       |
| Unchanged behavior with proof titles | pass   | 12 rows, titles copied from grep of `todo-due-date*.test.tsx` and e2e 15 and 28                                                                              |
| Dependencies done                    | pass   | D-40 settled; §15, §28, §37, §40 on main; E8 does not change `todo-due-date.tsx`                                                                             |
| No settled D-n contradicted          | pass   | D-40 allows one clause in §40 and nothing else; §28's and §37's out-of-scope items kept; D-30 and D-32 (Escape does not restore focus) kept                  |
| Existing tests that could break      | pass   | no test in `todo-due-date*.test.tsx` or e2e 15, 28, 37, 40 asserts focus on the body after "Edit due date"; Escape and "Today" tests act on explicit targets |
| Red test                             | pass   | AC-45.1 fails on an assertion today; the test file needs no new export                                                                                       |

## Open questions

| Question                                                                               | Proposed decision                                                           | Why                                                                      | What changes otherwise                                      |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------- |
| Should focus also select the date text, as §41 does for the title?                     | No: REQ-45.5 says the text is not selected                                  | the card asks for focus only; `select()` on a date input is not portable | a `select()` clause and one more criterion                  |
| Is focus in an empty field right when the row has no due date?                         | Yes: REQ-45.1 covers both, AC-45.2 tests the empty case                     | §15 REQ-15.6 opens the field empty when none is stored                   | AC-45.2 goes and the empty case is unspecified              |
| After a successful save or a clear, should focus return to "Edit due date"?            | No: out of scope, as §28, §37 and §40 keep it                               | the card says those items still hold                                     | a new section and a ruling lifting three Out of scope items |
| Is "once per switch" safe if a parent remounts the component while the editor is open? | Yes: a remount starts in view mode (local state), so no switch and no focus | the edit state is local `useState`; `TodoItem` does not key it           | none                                                        |
| Can the editor be entered while a save is pending?                                     | No new rule: "Edit due date" is disabled while pending (§15)                | matches the component                                                    | none                                                        |

## Needs a ruling

None.

Written by the orchestrator from `spec-analyst`'s report: the role's Write was refused for a report file.
