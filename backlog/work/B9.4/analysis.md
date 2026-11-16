# B9.4 analysis

Section: §47 in `spec/contracts/45-new-todo-focus-pending.md` (new). Component: `src/components/todo-form.tsx` only.
Origin: defect D1 of the first D-43 sweep (2026-11-16); ruling D-44.

## Completeness

| Check                                | Result | Note                                                                                                                                                                                                                 |
| ------------------------------------ | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Intent without solution words        | pass   | the person's need (keep focus put during a pending save) and the result; no API names                                                                                                                                |
| Every behavior has a REQ             | pass   | focus when none/box/"Add" (47.1), kept elsewhere (47.2), read at settle time and once per result (47.3), nothing else changes (47.4)                                                                                 |
| One EARS pattern each                | pass   | 47.1 event-driven; 47.2 unwanted behavior; 47.3, 47.4 ubiquitous                                                                                                                                                     |
| At most 7 criteria                   | pass   | 6 (AC-47.1 to AC-47.6): 4 component, 2 e2e                                                                                                                                                                           |
| Every Then measurable                | pass   | exact activeElement, values, focus call counts, createTodoAction call counts, rows, POST count                                                                                                                       |
| No banned adjective without a number | pass   | none used; the hold-back is 2000 ms                                                                                                                                                                                  |
| Out of scope                         | pass   | refocusing, other controls, failures, background tab, iframe/shadow, blocking typing, announcements                                                                                                                  |
| Unchanged behavior with proof titles | pass   | 11 rows; titles copied from grep of `todo-form-focus.test.tsx`, `e2e/44-new-todo-focus.spec.ts`, `todo-form.test.tsx`, `e2e/25-search-shortcut.spec.ts`, `e2e/29-escape-new-todo.spec.ts`                            |
| Dependencies done                    | pass   | §44 shipped (B9.1 Done); §25 shipped; D-44 ruled                                                                                                                                                                     |
| No settled D-n contradicted          | pass   | D-44 asks for a new §47 and a pointer in §44, not an eighth criterion; D-41 and D-42 untouched                                                                                                                       |
| No criterion contradicts a sibling   | pass   | AC-44.1..44.7 have no move during the save; §25 REQ-25.3 not hit (`/` pressed with "Add" or body focused); §29 Escape guard `pending`, no AC presses Escape; §18 REQ-18.6/18.7: no AC types in the box while pending |
| §44 edits minimal                    | pass   | 3 lines of `42-new-todo-focus.md`: REQ-44.1, REQ-44.4, contract line                                                                                                                                                 |

## Open questions

1. **What counts as "moved elsewhere"; focus on `document.body` after a click on a blank area?** Proposed: body and
   null count as none, so the box is focused (REQ-47.1). Body is also what a browser reports when the disabled "Add"
   loses focus; treating it as a move would leave focus nowhere after an ordinary click on "Add" and break AC-44.6.
2. **`document.documentElement` as active element?** Proposed: not listed (browsers report body or null). If a browser
   reports `<html>`, add it to REQ-47.1 before the feature starts.
3. **A focused element the save removes?** Proposed: counts as none (body); the box is focused.
4. **"Add" reached by Tab during the save?** Proposed: not "elsewhere"; REQ-44.1 lists it, the box is focused.
5. **Moved away and back to the box before the result?** Proposed: judged at settle time (REQ-47.3, AC-47.4): the box
   is focused.
6. **AC-47.6 fragility (the new row is inserted above the edited row).** Proposed: keep it; React does not move the
   existing node. If the browser blurs the editor on that re-render, it is a defect in `todo-item.tsx`, not in §47:
   stop and report, do not widen §47.
7. **Holding back the Server Action in e2e.** Proposed: `page.route` for the POST carrying the `next-action` header,
   `route.continue()` after 2000 ms, keystrokes with no wait in between.
8. **Index and map.** The §47 row in `spec/technical-requirements.md` (✗) comes from the orchestrator (B1.99); F45 in
   `spec/features-map.md` from the feature's `docs(map)` commit.

## Needs a ruling

None. D-44 settled the section.

Written by the orchestrator from `spec-analyst`'s report: the role's Write was refused for a report file.
