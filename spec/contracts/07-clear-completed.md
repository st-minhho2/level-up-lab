# §9 Todos: clear completed

Tier: quick

- [ ] Lead approves spec (<human>, <date>)

## Intent

A person who has finished several items removes them all in one step, so the list shows only what is still open.
Open items keep their text, their state and their order, and the list stays the same after a reload.

## Requirements (EARS)

| ID      | Pattern           | Requirement                                                                                                                                                            |
| ------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| REQ-9.1 | Event-driven      | WHEN a person activates "Clear completed" THE SYSTEM SHALL delete every todo whose completion state is completed.                                                      |
| REQ-9.2 | Event-driven      | WHEN completed todos are cleared THE SYSTEM SHALL keep every not-completed todo unchanged (title, completion state) and in the same relative order (newest first, §5). |
| REQ-9.3 | Event-driven      | WHEN completed todos are cleared THE SYSTEM SHALL report how many todos were deleted.                                                                                  |
| REQ-9.4 | State-driven      | WHILE at least one todo is completed THE SYSTEM SHALL show a button named "Clear completed" that is enabled.                                                           |
| REQ-9.5 | State-driven      | WHILE no todo is completed (including while no todo exists) THE SYSTEM SHALL show the button named "Clear completed" disabled; it is never hidden.                     |
| REQ-9.6 | Ubiquitous        | THE SYSTEM SHALL keep the result of a clear in PostgreSQL so that a full page reload shows the same list.                                                              |
| REQ-9.7 | Unwanted behavior | IF no todo is completed when a clear is requested THEN THE SYSTEM SHALL delete nothing and report 0 deleted (no criterion; covered by the lib test, see below).        |

A clear is final: a deleted todo cannot be restored and there is no confirmation step. Titles, duplicates and
completion are those of §5.

## Acceptance criteria

| ID     | Covers                             | Given                                                                             | When                                              | Then (measurable)                                                                                                                                                             |
| ------ | ---------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-9.1 | REQ-9.1, REQ-9.2, REQ-9.3          | four stored todos in list order D (open), C (done), B (done), A (open)            | `clearCompletedTodosAction()` runs                | `{ ok: true, data: { deleted: 2 } }`; stored rows are exactly `[D, A]` with `completed: false` each, in that order; `/` revalidated once                                      |
| AC-9.2 | REQ-9.4, REQ-9.5                   | (a) no todo completed (an empty list, or open todos only); (b) one todo completed | `/` renders                                       | exactly one button named "Clear completed": in (a) it is disabled, in (b) it is enabled                                                                                       |
| AC-9.3 | REQ-9.1, REQ-9.2, REQ-9.5, REQ-9.6 | stored todos in list order C (open), B (done), A (open) shown in the browser      | the person clicks "Clear completed", then reloads | before the click the button is enabled; before the reload and after it the list reads `[C, A]` (2 rows, `B` absent), both unchecked; the button "Clear completed" is disabled |

## Function contracts

```ts
// src/lib/todos.ts
export function clearCompletedTodos(): Promise<number>; // deletes every row with completed = true in one statement; resolves to the deleted count (0 when none)
// src/actions/todos.ts ('use server')
export function clearCompletedTodosAction(): Promise<ActionResult<{ deleted: number }>>; // no input to parse; one lib call, then revalidatePath('/'); the failure arm is never returned
// src/components/clear-completed-button.tsx ('use client')
export function ClearCompletedButton({ disabled }: { readonly disabled: boolean }): ReactNode; // button "Clear completed"; calls the action in a transition; disabled also while pending
// src/app/page.tsx: renders <ClearCompletedButton disabled={!todos.some((todo) => todo.completed)} /> between <TodoForm /> and the list or the "No todos yet" text, in both states
```

Lib test for REQ-9.7 (no criterion): `clearCompletedTodos()` over a store with no completed row resolves to `0` and
the delete is still scoped to `completed: true`.

## Out of scope

Deleting a single todo, a confirmation dialog, undo, a message showing the deleted count, clearing from two tabs at
once, bulk actions other than clearing completed.

## Unchanged behavior

| Behavior                                                     | Proof                                                                                                                                 |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| The empty list still shows "No todos yet", "New todo", "Add" | `e2e/05-todos.spec.ts` :: "AC-5.7: an empty list shows "No todos yet" with the New todo box and the Add button"                       |
| The list is still newest first                               | `e2e/05-todos.spec.ts` :: "AC-5.1: lists todos newest first"                                                                          |
| Toggling still works                                         | `src/lib/todos.test.ts` :: "AC-5.4: inverts completed and stores it, twice in a row"                                                  |
| A row exposes its title as the checkbox name                 | `src/components/todo-item.test.tsx` :: "AC-5.1: renders the title as the accessible name of an unchecked checkbox when not completed" |
| Editing a title still reports an id that no longer exists    | `src/lib/todos.test.ts` :: "throws TodoNotFoundError for an unknown id and updates nothing"                                           |
| Created todos survive a reload                               | `e2e/05-todos.spec.ts` :: "AC-5.6: a created todo survives a reload, and so does its toggled state"                                   |
