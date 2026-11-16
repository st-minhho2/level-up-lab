# B10.2 analysis

## Completeness

| Check                                | Result | Note                                                                                                                                                                                                                                                                |
| ------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Intent without solution words        | pass   | the person's need (a screen reader learns the last clear failed) and the result; no attribute names                                                                                                                                                                 |
| Every behavior has a REQ             | pass   | description while shown (49.1), none otherwise (49.2), removed with the message on success (49.3), kept while a retry is pending (49.4), unique id (49.5), nothing else changes (49.6)                                                                              |
| One EARS pattern each                | pass   | 49.1, 49.2, 49.4 state-driven; 49.3 event-driven; 49.5, 49.6 ubiquitous                                                                                                                                                                                             |
| At most 7 criteria                   | pass   | 6 (AC-49.1 to AC-49.6)                                                                                                                                                                                                                                              |
| Every Then measurable                | pass   | exact names, `aria-describedby` presence and value, description text, alert counts, call counts, distinct ids                                                                                                                                                       |
| No banned adjective without a number | pass   | none used                                                                                                                                                                                                                                                           |
| Out of scope                         | pass   | message text, focus, other buttons, aria-errormessage, deleted count                                                                                                                                                                                                |
| Unchanged behavior with proof titles | pass   | 7 rows, titles copied from `clear-completed-button.test.tsx`, `clear-completed-button-count.test.tsx`, `e2e/09`, `e2e/32`                                                                                                                                           |
| Dependencies done                    | pass   | §9, §10, §32, §18 contracts exist; D-45 rules the batch                                                                                                                                                                                                             |
| No settled D-n contradicted          | pass   | D-45 allows the lifts and edits the contract names: one clause in §10's contract block; no card changes `src/app/page.tsx`, `src/lib/`, `src/actions/`                                                                                                              |
| Sibling check: §9                    | pass   | label, enabled state, one call with 0 arguments unchanged (REQ-49.6; AC-9.2, AC-9.3 stay true)                                                                                                                                                                      |
| Sibling check: §10                   | pass   | REQ-10.4 "directly after the button" and AC-10.3 (`button.nextElementSibling` is the alert) stay true: only an `id` is added to the `<p>`; REQ-10.5 is REQ-49.3                                                                                                     |
| Sibling check: §32                   | pass   | REQ-32.5 forbids added elements, messages, live regions, not attributes; AC-32.2 (0 alert, 0 status) and AC-32.4 (name unchanged, 0 alert after success) stay true                                                                                                  |
| Sibling check: §43                   | pass   | `41-complete-all-hidden.md:89` limits §43's own change; it does not apply to §49 (stated in the contract)                                                                                                                                                           |
| Pending and shipped code             | pass   | `error` is set only inside the transition from the result (`clear-completed-button.tsx:23`), so the message and the description persist while a retry is pending (AC-49.3); the button is disabled then, and a disabled element still has an accessible description |

## Open questions

1. **E2E coverage.** Question: is a Playwright criterion wanted? Proposed: no; a failed clear needs a database fault
   that only §10 AC-10.5 reaches (for an add), and the attribute is observable in jsdom. Otherwise: a seventh criterion
   plus a fault hook in `e2e/`, outside this card's single file.
2. **Section number vs file number.** Proposed: §49 lives in `47-clear-completed-description.md` (files are numbered by
   file order, D-45 names both). Otherwise: the register row and the card must be changed.
3. **Optional §10 clause.** Proposed: made (one clause in the contract block, `08-mutation-feedback.md:58-60`), so a
   reader of §10 finds §49. Otherwise: §10's contract line omits the attribute but stays true.

## Needs a ruling

None.
