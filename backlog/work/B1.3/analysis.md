# B1.3 analysis

Codebase facts (grep of this worktree, `main` at B1.2 merged): `src/lib/todos.ts` exports `listTodos`, `createTodo`,
`toggleTodo`, `updateTodoTitle`, `TodoNotFoundError`; `src/actions/todos.ts` exports `createTodoAction`,
`toggleTodoAction`, `updateTodoTitleAction`; no `clearCompleted*` symbol exists anywhere in `src/` or `e2e/`.
`prisma/schema.prisma` already has `Todo { completed Boolean }` (no migration needed). `src/app/page.tsx` renders
`<TodoForm />` then "No todos yet" or the `<ul>`; the only client components are `todo-form.tsx` and `todo-item.tsx`.
Section written: §9 in `spec/contracts/07-clear-completed.md`, registered in `spec/technical-requirements.md` (✗).

## Completeness

| Check                                | Result | Note                                                                                                                                                                                            |
| ------------------------------------ | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Intent without solution words        | pass   | Names no button, action, table or component; "removes them all in one step", "after a reload" describe what a person sees.                                                                      |
| Every behavior has a REQ             | pass   | Remove completed (9.1), open rows untouched and ordered (9.2), count reported (9.3), enabled (9.4) and disabled (9.5) button, persistence (9.6), nothing completed (9.7).                       |
| One EARS pattern each                | pass   | 9.1-9.3 event-driven, 9.4-9.5 state-driven, 9.6 ubiquitous, 9.7 unwanted behavior.                                                                                                              |
| ≤ 7 criteria                         | pass   | 3 (the cap for Tier `quick`, `spec/CLAUDE.md`). REQ-9.7 has no criterion (lib test), as §6 does for the not-found case.                                                                         |
| Every Then measurable                | pass   | Exact result object `{ ok: true, data: { deleted: 2 } }`, row lists `[D, A]` / `[C, A]`, row count 2, exact button name "Clear completed", disabled/enabled state, `/` revalidated once.        |
| No banned adjective without a number | pass   | None of fast, quick, slow, friendly, simple, easy, intuitive, robust, scalable, small, large, soon, responsive, clean, reasonable in the section (the Tier word `quick` is the tier name only). |
| Out of scope present                 | pass   | Single delete, confirmation dialog, undo, deleted-count message, two-tab races, other bulk actions.                                                                                             |
| Unchanged behavior with proof titles | pass   | 6 rows, titles copied verbatim from `grep` of `src/**/*.test.ts(x)` and `e2e/*.spec.ts` in this worktree.                                                                                       |
| Dependencies done                    | pass   | `Depends on: ~~B1.1~~` (done, `c7153b2`); B1.2 is also merged and not a dependency.                                                                                                             |
| No settled D-n contradicted          | pass   | D-10 applied (REQ-9.4, REQ-9.5, AC-9.2); D-5 (duplicates allowed) untouched. The §9 text cites no D-n (`spec/CLAUDE.md`).                                                                       |
| Tier consistent with the section     | pass   | `quick` = ≤ 3 criteria, no schema change, advisor optional: 3 criteria, no migration. Adding an eighth/fourth behavior (confirmation, count message) would call for `full`.                     |

Result: 11 pass, 0 fail.

## Open questions

1. Where does the button live and is it a client component? · Proposed (dev-lead decides): new `src/components/clear-completed-button.tsx` (`'use client'`, prop `disabled: boolean`), rendered by `page.tsx` between `<TodoForm />` and the list/empty text with `disabled={!todos.some((todo) => todo.completed)}`; it calls `clearCompletedTodosAction()` inside `useTransition`, like `TodoItem` · a form `action={clearCompletedTodosAction}` does not type-check because the action returns `ActionResult`, not `void`, and §7 puts event handling in client components · otherwise the action's return type changes (a signature the card fixes) or the page grows an untested wrapper.
2. Is the button rendered when the list is empty? · Yes, disabled (REQ-9.5 says "including while no todo exists"; D-10: always rendered) · D-10 allows no hidden branch; AC-5.7 still passes because it asserts "No todos yet", "New todo" and "Add" only, and `getByRole('button', { name: 'Add' })` does not match "Clear completed" · if hidden when empty, D-10 would be contradicted.
3. Does the delete need Zod parsing? · No: `clearCompletedTodosAction()` takes no input, so there is nothing to parse at the boundary; invariant 3 (Zod at the boundary) is met vacuously and the `ok: false` arm is never returned · adding a dummy schema would be code without behavior · if a later card gives the action input (e.g. an id list), it goes through a schema then.
4. Atomicity and the stale-button race: a todo toggled to completed in another tab after the page rendered is also deleted when the button is clicked · Proposed: one `prisma.todo.deleteMany({ where: { completed: true } })` (single statement, count from `{ count }`), two-tab behavior left out of scope · REQ-9.1 says "every completed todo" at the time of the click; a confirmation or an id list would need a new section · if the human wants only the rows shown, the action takes ids and §9 changes (D-n required).
5. Confirmation before deleting? · No; out of scope (the deletion is final and says so in §9) · a dialog is an extra interaction with its own criteria, past the `quick` cap of 3 · if wanted, raise the tier to `full` and add REQs.
6. Show the deleted count to the person? · No; the count is only in the action result (`deleted`), used by tests · no requirement asks for a message and AC-5.1 compares whole-row text · if wanted, a REQ and a criterion (and `full`) are needed.
7. Which tests carry which criterion? · Proposed: AC-9.1 in `src/actions/todos.test.ts` (action) and `src/lib/todos.test.ts` (`deleteMany` called once with `where: { completed: true }`, resolves to the count); AC-9.2 in `src/components/clear-completed-button.test.tsx` plus the e2e step "enabled before the click"; AC-9.3 in `e2e/09-clear-completed.spec.ts`; REQ-9.7 in the lib test without a prefix · the card's `Test:` line names the first red test only · otherwise the e2e file number could clash (e2e files are one per section: §9 → `09-` follows the `05-` (§5) / `06-` (§6) pattern).
8. Housekeeping outside this role's write set, for `dev-lead`: (a) `backlog/README.md` row B1.3 still says "— (section to write)" in the Spec § column; (b) `spec/features-map.md` has no F7 row (add at `docs(map): F7 … [B1.3]` when code lands, files `src/lib/todos.ts`, `src/actions/todos.ts`, `src/components/clear-completed-button.tsx`, `src/app/page.tsx`); (c) `backlog/00-decisions.md` "Open" table still lists "B1.3: hide or disable ..." although D-10 settles it · none changes behavior · a stale "Open" row may make the human think B1.3 is blocked.

## Needs a ruling

None. The one question the card raised (hide or disable) is settled by D-10: "'Clear completed' is a button that is always rendered and **disabled** (not hidden) while no todo is completed; enabled otherwise." §9 REQ-9.4 and REQ-9.5 and AC-9.2 follow it.

## Tier recommendation

`quick`: 3 criteria, no schema change, no new dependency; the advisor is optional (question 1 is the only design choice and has a proposal).
