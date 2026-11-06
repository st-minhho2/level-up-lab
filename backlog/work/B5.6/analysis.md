# B5.6 analysis

## Completeness

| Check                                | Result | Note                                                                                                                                   |
| ------------------------------------ | ------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| Intent without solution words        | pass   | one key, row as it was, nothing carried to the next edit; no function or file named                                                    |
| Every behavior has a REQ             | pass   | close, no save, discard draft, remove message, ignore while pending, other keys, only in the field                                     |
| One EARS pattern each                | pass   | REQ-28.1 to 28.4 event-driven, 28.5 state-driven, 28.6 unwanted behavior, 28.7 ubiquitous                                              |
| ≤ 7 criteria                         | pass   | AC-28.1 to AC-28.7                                                                                                                     |
| Every Then measurable                | pass   | counts, exact texts and values, `defaultPrevented`, POST count                                                                         |
| No banned adjective without a number | pass   | none used                                                                                                                              |
| Out of scope stated                  | pass   | blur, Cancel button, confirmation, focus restore, other fields, native picker pop-up, undo, announcement                               |
| Unchanged behavior with proof titles | pass   | titles quoted from grep of `todo-due-date.test.tsx`, `todo-due-date-overdue.test.tsx`, `e2e/15-due-date.spec.ts`                       |
| Dependencies done                    | pass   | D-30 (section number, file, component), D-32 (Escape half of §15's "cancelling an edit (Escape/blur)" lifted; blur stays out of scope) |
| No settled D-n contradicted          | pass   | only `todo-due-date.tsx` changes (D-30); §15's Out of scope line edited as D-32 names, nothing else in §15 changed                     |

Test for the card: `src/components/todo-due-date.test.tsx::AC-28.1 …`. It is red on an assertion, not on a missing export:
D-30 confines the section to the component, so no new lib function exists to import (the `TodoDueDate` export exists).
AC-28.2 to 28.6 extend the same file; AC-28.7 is `e2e/28-escape-due-date.spec.ts` (e2e numbering follows the section,
as `27-escape-search.spec.ts`). The features-map row (F26) is the lead's to add. The `docs(spec)` commit must carry the
one-line edit in `spec/contracts/13-due-date.md` (Out of scope) with the new section, before any test.

## Open questions

1. Modifier handling. Proposed decision: Escape alone only (Ctrl, Meta, Alt, Shift each ignored), as §27. Why: one rule
   across the Escape cards. Otherwise: drop the modifier clause from REQ-28.1 and 28.6.
2. Reuse of `isSearchEscape`. Proposed decision: no; the check is written inline in the component (no new export).
   Why: that helper is named for §27 and D-30 allows one component; importing it couples two sections. Otherwise: a
   shared lib helper needs a ruling since D-30 lists one file for this card.
3. `preventDefault` on Escape. Proposed decision: yes when it closes the editor, no when ignored (pending). Why: matches
   §27 and gives a measurable Then. Otherwise: assert only the closing; the native date picker's own Escape is out of scope.
4. The overdue marker (§17) reappears after Escape as in any view mode. Proposed decision: no extra rule. Why: view mode
   is §15/§17's already.
5. Escape while pending leaves the field enabled (only the button is disabled today). Proposed decision: ignore the key as
   §24 REQ-24.5. Otherwise: close and let the in-flight save finish unseen.
6. Focus after the editor closes is not specified. Proposed decision: out of scope, as §24.

## Needs a ruling

none
