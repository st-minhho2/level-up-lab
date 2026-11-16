# B9.3 analysis

## Completeness

| Check                                | Result | Note                                                                                                                                     |
| ------------------------------------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Intent without solution words        | pass   | states the person's need (new query or edit) and the result; no API names                                                                |
| Every behavior has a REQ             | pass   | select on `/` (46.1), what text (46.2), no selection when focus does not move (46.3), nothing else changes (46.4), once / unmount (46.5) |
| One EARS pattern each                | pass   | 46.1, 46.2 event-driven; 46.3 unwanted behavior; 46.4, 46.5 ubiquitous                                                                   |
| At most 7 criteria                   | pass   | 6 (AC-46.1 to AC-46.6)                                                                                                                   |
| Every Then measurable                | pass   | exact `selectionStart`, `selectionEnd`, values, call counts, addresses, rows                                                             |
| No banned adjective without a number | pass   | none used                                                                                                                                |
| Out of scope                         | pass   | click or Tab selection, caret memory, other fields, hint, other keys, §27                                                                |
| Unchanged behavior with proof titles | pass   | 7 rows, titles copied from `todo-search-form.test.tsx` and `e2e/25-search-shortcut.spec.ts`                                              |
| Dependencies done                    | pass   | D-40 ruled; §25, §27, §38 contracts exist; E8 merge is a labeling condition (D-40), not a spec one                                       |
| No settled D-n contradicted          | pass   | D-40 allows exactly the three §25 edits made; no other contract line changed                                                             |
| §25 edits (D-40)                     | pass   | REQ-25.5 reworded; Out of scope item lifted; contract line now "`.focus()` then `.select()` (§46)"                                       |
| Existing tests still true            | pass   | AC-25.2, 25.3, 25.5 assert focus, value, `defaultPrevented` only; AC-25.6 and AC-27.6 `/` presses are on an empty box                    |

## Open questions

1. **Does `select()` change what `/` then Escape does?** Proposed: no. Escape (§27) empties the box regardless of
   selection; out of scope in §46. Otherwise: a REQ would be needed in §27, which D-40 does not allow.
2. **Is the selection also wanted when the box already has focus?** Proposed: no (REQ-46.3, §25 REQ-25.3 types `/`).
   Otherwise: a person could not type a `/` into a query.
3. **A `type="search"` input in a real browser: does `select()` after `focus()` highlight?** Proposed: yes in
   Chromium, Firefox and WebKit; AC-46.6 covers it in Playwright. If a browser differs, the e2e fails and the section
   is revisited with the lead.
4. **Test file name.** Proposed: new `src/components/todo-search-form-select.test.tsx`, so the existing file's tests
   stay untouched (testing.md); the e2e AC-46.6 goes in a new `e2e/44-search-select.spec.ts` (name left to `test-writer`).

## Needs a ruling

None. D-40 settles the three §25 edits; the open questions above have proposed answers inside the settled scope.
