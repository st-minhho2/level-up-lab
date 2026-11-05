# B5.2 analysis

## Completeness

| Check                                | Result | Note                                                                                                                   |
| ------------------------------------ | ------ | ---------------------------------------------------------------------------------------------------------------------- |
| Intent without solution words        | pass   | names the outcome (row as it was), not a key handler                                                                   |
| Every behavior has a REQ             | pass   | cancel, no save, discard draft, clear message, in-flight, other keys: REQ-24.1 to 24.6                                 |
| One EARS pattern each                | pass   | 4 event-driven, 1 state-driven, 1 unwanted behavior                                                                    |
| At most 7 criteria                   | pass   | 6 (AC-24.1 to 24.6); AC-24.6 is the e2e, file `e2e/24-escape-edit-title.spec.ts` (name by section, as 22-all-done)     |
| Every Then measurable                | pass   | role counts, values, call counts, POST count, list order                                                               |
| No banned adjective without a number | pass   | none used                                                                                                              |
| Out of scope                         | pass   | blur, Cancel button, confirmation, focus restore, other fields' Escape, a11y announcement                              |
| Unchanged behavior with proof titles | pass   | titles copied verbatim from grep of `todo-item.test.tsx` and `e2e/06-edit-title.spec.ts`                               |
| Dependencies done                    | pass   | D-30 settled; §6 and §10 exist                                                                                         |
| No settled D-n contradicted          | pass   | D-30: one component (`todo-item.tsx`), no `page.tsx`, §6 Out of scope lifted for Escape only (edited in 04, blur kept) |

Test line is red on behavior, not on a missing export: the section adds no export (handler inside `TodoItem`), so the
red is "the field stays after Escape". Registered in the index with status ✗.

## Open questions

1. Escape while a save is in flight. Proposed: ignored (REQ-24.5), the edit ends through the save's result. Why: cancelling
   would show the old title while the save may still persist the new one. Otherwise: Escape closes the field at once and
   the row may flip to the new title after the save lands.
2. Focus after cancel. Proposed: out of scope (focus is lost to the page when the field unmounts). Otherwise: a REQ and
   an AC that focus returns to the "Edit title" button (accessibility gain, one more criterion).
3. Escape on the row's checkbox or Delete button while editing. Proposed: not specified; only the title field cancels.
   Otherwise: handler moves to the `<li>`.
4. Blur stays out of scope (§6's line now reads "by blur"); a later card would need its own ruling on losing a draft.

## Needs a ruling

None.
