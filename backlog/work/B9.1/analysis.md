# B9.1 analysis

Section: §44 in `spec/contracts/42-new-todo-focus.md` (new). Component: `src/components/todo-form.tsx` only.

## Completeness

| Check                                | Result | Note                                                                                                                          |
| ------------------------------------ | ------ | ----------------------------------------------------------------------------------------------------------------------------- |
| Intent without solution words        | pass   | says what the person sees (cursor in the empty box); no refs, effects or hooks                                                |
| Every behavior has a REQ             | pass   | success 44.1, load/re-render 44.2, failure 44.3, once per result 44.4, nothing else changes 44.5                              |
| One EARS pattern each                | pass   | event-driven, unwanted x2, ubiquitous x2                                                                                      |
| ≤ 7 criteria                         | pass   | 7 (5 component, 2 e2e)                                                                                                        |
| Every Then measurable                | pass   | activeElement, value, call counts, alert counts, row lists                                                                    |
| No banned adjective without a number | pass   | none used                                                                                                                     |
| Out of scope                         | pass   | failed save, load, Escape, other mutations, restoring focus to "Add", scroll, announcements                                   |
| Unchanged behavior with proof titles | pass   | 8 titles copied verbatim from grep                                                                                            |
| Dependencies done                    | pass   | D-40 ruled; §5, §7, §10, §18, §29, §39 on main; E8 must merge before the label (D-40), not before the spec                    |
| No settled D-n contradicted          | pass   | no lift or edit of another contract; the 3 "unchanged" notes named and stated not to apply; a failed save does not move focus |
| Function contract exact              | pass   | signature unchanged; only `todo-form.tsx`; no `src/lib` or `src/actions` file, so mutation testing is skipped (B1.100)        |
| Existing tests broken                | none   | by reading: no test in `todo-form*.test.tsx` or `e2e/` asserts focus after an add; `29-escape-new-todo.spec.ts` reloads       |

## Open questions

1. **Focus after a failed save.** Proposed: no move (REQ-44.3, AC-44.3, AC-44.7). The alert is the feedback; D-40
   settled it. Otherwise REQ-44.3 and two criteria flip, and §10's draft-keeping would need a caret rule.
2. **Section vs file numbering.** §44 is in `42-new-todo-focus.md`; e2e is `e2e/44-new-todo-focus.spec.ts` (e2e files
   follow the section number, like `39-title-counter-warning.spec.ts`). Proposed: as written.
3. **Mechanism, left to code-writer.** The contract says "once per new successful result, after the form reset".
   Proposed: an effect keyed on `state`, not the layout effect that runs after every commit (`todo-form.tsx:33`).
   Otherwise a refocus on every commit breaks AC-44.4 (focus moved to "Add" would be taken back).
4. **jsdom and a disabled focused button.** jsdom keeps a disabled focused button focused, so AC-44.3 asserts a
   `focus` spy and "not the box", not "activeElement is body". Proposed: as written.
5. **Index and map.** `spec/technical-requirements.md` gets the §44 row (✗) from the orchestrator (B1.99);
   `spec/features-map.md` gains F42 with the feature's `docs(map)` commit.

## Needs a ruling

None. D-40 settles the rule; question 1 is the card's open question, answered inside D-40.

Written by the orchestrator from `spec-analyst`'s report: the role's Write was refused for a report file.
