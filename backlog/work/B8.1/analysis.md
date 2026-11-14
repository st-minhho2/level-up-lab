# B8.1 analysis

Section: §41 in `spec/contracts/39-edit-title-select.md` (written, D-39 spec first).

## Completeness

| Check                                | Result | Note                                                                                                                                                                                  |
| ------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Intent without solution words        | pass   | says what the person sees (cursor in field, title highlighted); names no hook, ref or effect                                                                                          |
| Every behavior has a REQ             | pass   | first entry (41.1), re-entry after Escape or save (41.2), no reselect on rejected or failed save or re-render (41.3), only on the switch (41.4), nothing else changes (41.5)          |
| One EARS pattern each                | pass   | 41.1, 41.2 event-driven; 41.3 unwanted; 41.4, 41.5 ubiquitous                                                                                                                         |
| At most 7 criteria                   | pass   | 6: AC-41.1 to AC-41.6                                                                                                                                                                 |
| Every Then measurable                | pass   | values are `selectionStart`, `selectionEnd`, `activeElement`, field value, alert and POST counts                                                                                      |
| No banned adjective without a number | pass   | none used                                                                                                                                                                             |
| Out of scope stated                  | pass   | §24's "restoring focus to the 'Edit title' button" held; no focus on leaving edit mode                                                                                                |
| Unchanged behavior with proof titles | pass   | 10 rows, each title copied from `grep` of `todo-item.test.tsx` and the e2e files                                                                                                      |
| Dependencies done                    | pass   | D-39 recorded in this worktree; §6, §10, §24, §25 are on main; E7 batch 2 merge gates the label, not the spec                                                                         |
| No settled D-n contradicted          | pass   | D-39: lifts and edits nothing, states the 12 "`todo-item.tsx` unchanged" notes do not apply, keeps §24's focus out of scope; no card change to `page.tsx`, `src/lib/`, `src/actions/` |

Notes on the evidence:

- `grep` confirms every existing `user.type(field, ...)` in `todo-item.test.tsx` starts with a click on the field
  (user-event's `type` clicks first), which sets the caret at the end, so no existing test should change result.
  [unverified: not run; the red commit's `verify-red.sh` and the green `pnpm test` will show it]
- The sibling `todo-item*.test.tsx` files render `<TodoItem>` only in view mode or click "Edit title" and then clear or
  type; none asserts `document.activeElement`.

## Open questions

1. **File names of the proofs.** Question: where do the new tests live? Proposed decision: unit
   `src/components/todo-item-select.test.tsx` (like `todo-item-created.test.tsx`), e2e `e2e/41-edit-title-select.spec.ts`
   (the e2e files are numbered by section: `37-due-date-today.spec.ts`). Why: the existing `todo-item.test.tsx` is a
   file the card must not weaken, and a new file keeps the red commit additive. What changes otherwise: only the paths
   on the card's `Test:` line and the features map row (F39).
2. **Which element is focused when the field is shown.** Question: is `document.activeElement` the title field in
   AC-41.1 for the e2e too? Proposed decision: yes, and the e2e identifies it as the row's `textbox` named "Edit title".
   Why: REQ-41.1 says so. Otherwise: REQ-41.1 would drop the focus half and keep only the selection.
3. **`selectionEnd` unit.** Question: UTF-16 code units or code points for a title with an emoji? Proposed decision:
   code units (`value.length`), pinned by AC-41.2 (`Café 😀`, 7). Why: that is what `selectionEnd` measures in every
   browser, and §5 counts the 200-character limit with `.length`. Otherwise: AC-41.2 changes.
4. **Strict Mode double effects.** Question: does the implementation have to survive React's dev double invocation?
   Proposed decision: left to the code-writer; REQ-41.3 and AC-41.4 already require no second selection after a
   re-render, which a double-run effect would violate only if it ran after typing. Why: a mechanism is not pinned in
   the spec. Otherwise: nothing in the spec.
5. **AC-41.4 focus clause.** Question: "no focus is taken back" is observed by moving focus to "Save" and checking it
   stays there. Is that enough for a re-render with the field unfocused? Proposed decision: yes, it is the case where
   a careless effect (`[error]` or `[todo]` dependency) would steal focus. Otherwise: add a case with focus on
   `document.body`.

## Needs a ruling

none. D-39 names the lines this card touches (none) and the 12 notes; §6 and §24 are silent about focus and
selection, so §41 adds behavior without editing a line. Two things to keep in view, neither a conflict: (1) §25
REQ-25.3 already treats a title field as a text-entry element, so the "/" shortcut does nothing while the new
selection is active (REQ-41.5 states it, no change); (2) `src/components/todo-item.tsx:97-101` renders the "Edit
title" button only in view mode, so the focus lands on a newly mounted field, never on the same element as before.
