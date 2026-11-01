# B3.3 analysis

Section: §19 Todos: delete a todo, `spec/contracts/17-delete.md` (new, D-22). 11 REQ, 7 AC.

## Completeness

| Check                                | Result | Note                                                                                                                                                                                                   |
| ------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Intent without solution words        | pass   | one person-level paragraph; no module, library or function named                                                                                                                                       |
| Every behavior has a REQ             | pass   | delete one row, others kept, the button in view and edit mode, persistence and "No todos yet", no confirmation, pending state, empty id, missing id, other failure, message placement, message removal |
| One EARS pattern each                | pass   | event-driven 19.1, 19.2, 19.11; ubiquitous 19.3, 19.4, 19.5; state-driven 19.6; unwanted 19.7 to 19.10 (19.4 carries a WHILE clause for the empty list, as REQ-9.5 does)                               |
| At most 7 criteria                   | pass   | 7: 1 lib, 3 action, 2 component, 1 e2e                                                                                                                                                                 |
| Every Then measurable                | pass   | exact return values, exact `deleteMany` arguments, call counts, exact message texts, counts of role `button` and `alert`, row lists                                                                    |
| No banned adjective without a number | pass   | none used                                                                                                                                                                                              |
| Out of scope stated                  | pass   | confirmation, undo, soft delete, bulk selection, count message, optimistic UI, stale-row removal after "Todo not found", two tabs, layout outside the row                                              |
| Unchanged behavior with proof titles | pass   | 12 rows, titles copied from `grep` on `src/` and `e2e/`                                                                                                                                                |
| Dependencies done                    | pass   | none; §5, §6, §9, §10, §11, §14, §15 are on this branch                                                                                                                                                |
| No settled D-n contradicted          | pass   | D-22 followed (placement, own modules, §5 sentence lifted in the same commit)                                                                                                                          |

Limits and texts come from existing sections: `Todo id is required` and `Todo not found` (§5), `Could not save, try
again` (§10), log shape (§11), order `createdAt desc` (§5). New text pinned here, not invented limits: button name
"Delete todo", action name `deleteTodoAction`, data `{ id }`.

## Open questions

1. **No confirmation step.** Proposed: none, one click (REQ-19.5), as §9 and §14. Why: one person's list, undo is out
   of scope everywhere, and a prompt adds markup, keyboard and test surface for a cheap item. Otherwise: a
   confirm-control REQ, another AC, a larger component, and the 7-criteria cap is hit.
2. **A missing id leaves the row on screen with "Todo not found".** Proposed: REQ-19.8 follows toggle and edit (§5,
   §6, §10): field error on `id`, no revalidate, no log. Why: one rule for all row actions and REQ-11.5. Otherwise:
   revalidate on a missing id so the stale row vanishes, one more behavior and one more AC-19.3 case, and the action
   differs from toggle.
3. **The existing `src/components/todo-item.test.tsx` must mock the new action module.** `TodoItem` will import
   `@/actions/delete-todo`, which pulls `@/lib/prisma` (`server-only`); unmocked, every existing test in that file
   fails on import. Proposed: the test-writer adds a `vi.hoisted` object and `vi.mock('@/actions/delete-todo', …)` in
   the red commit (a new mock, no assertion changed); §19 states this. Otherwise the `feat(...)` commit would touch a
   test, which CI rejects.
4. **The error message is rendered by `DeleteTodoButton`, not `TodoItem`.** Proposed: the button owns its state and
   alert inside the `<li>` (REQ-19.10), so `todo-item.tsx` changes by one line and keeps its single §10 alert.
   Consequence: a row shows two alerts only if a toggle and a delete both fail. Otherwise: `TodoItem` hosts the state
   or takes an `onError` callback, a bigger change to the one file D-22 lets this card edit.
5. **Delete is available while a row is in edit mode** (REQ-19.3); the draft is lost with the row. Why: one rule, no
   coupling to `TodoItem` state. Otherwise: hide or disable it while editing, one more REQ and AC case.
6. **The index jumps from §16 to §19** until B3.1 and B3.2 add their rows. All three PRs add one row after §16, so the
   conflict is a one-line, order-only resolution. Proposed: the orchestrator resolves it at merge.
7. **§9's Out of scope still says "Deleting a single todo".** It describes §9's own scope and D-22 lifts only §5's
   line. Proposed: leave §9 as is.
8. **The lib module imports `TodoNotFoundError` from `@/lib/todos`** (reuses the §5 class without editing that file),
   so the lib test mocks `@/lib/prisma` only. If the class moves later, one import line changes.

## Needs a ruling

none
