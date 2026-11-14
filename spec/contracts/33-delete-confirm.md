# §35 Todos: deleting a todo asks for confirmation first

Tier: full

- [ ] Lead approves spec

## Intent

A person who clicks the trash button by mistake does not lose a todo. The browser asks once whether to delete it; only
a yes removes it, and a no leaves the row, the list and the page exactly as they were. The row looks the same as before.

## Requirements (EARS)

| ID       | Pattern           | Requirement                                                                                                                                                                                                                                            |
| -------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| REQ-35.1 | Event-driven      | WHEN a person activates a row's "Delete todo" button THE SYSTEM SHALL call `window.confirm` exactly once, with the message `Delete this todo? This cannot be undone.`, before it calls any Server Action.                                              |
| REQ-35.2 | Event-driven      | WHEN `window.confirm` returns `true` THE SYSTEM SHALL call `deleteTodoAction` once with that row's todo id, and the delete then behaves as §19 specifies.                                                                                              |
| REQ-35.3 | Unwanted behavior | IF `window.confirm` returns `false` THEN THE SYSTEM SHALL call no Server Action, refresh nothing, write no log entry (§11), disable nothing, and leave the row, including any message of an earlier failed attempt (§19 REQ-19.10), exactly as it was. |
| REQ-35.4 | Ubiquitous        | THE SYSTEM SHALL ask the confirmation only on the activation of "Delete todo": not on render, not on any other control of the row, and not once per row at page load.                                                                                  |
| REQ-35.5 | Ubiquitous        | THE SYSTEM SHALL add no element, no text, no `role` and no `aria-*` attribute to the page for the confirmation, so that REQ-19.3 (one icon-only button named "Delete todo", no text added to the row) and REQ-20.7 hold unchanged.                     |

The message is a fixed string: it does not name the todo, so `DeleteTodoButton` needs no new prop. The confirmation is
the browser's `window.confirm`: a custom dialog is not built. It is asked inside the click handler, before the
transition starts, so the button is not disabled (§19 REQ-19.6) while the dialog is open and is disabled only from the
confirmation on. A cancel is not a failure in the sense of §10: nothing is reported and nothing is logged.

How tests drive the dialog:

- Unit and component tests (jsdom has no working `window.confirm`: an unstubbed call reports "not implemented" and
  returns a falsy value, which reads as a cancel) stub it in each test that clicks the button, with
  `vi.spyOn(window, 'confirm').mockReturnValue(true)` or `.mockReturnValue(false)`; `vi.restoreAllMocks()` in
  `afterEach` removes the stub. A test that clicks "Delete todo" without a stub is wrong.
- End-to-end tests register the dialog handler before the click, `page.once('dialog', ...)`: Playwright dismisses every
  dialog when no handler exists, which is a cancel. The handler records `dialog.type()` and `dialog.message()` and calls
  `dialog.accept()` or `dialog.dismiss()`. A test that deletes without a handler is wrong.

## Acceptance criteria

| ID      | Covers             | Given                                                                                                                                                                                                                                                        | When                                                                                                                                                 | Then (measurable)                                                                                                                                                                                                                                                                                                                                         |
| ------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-35.1 | REQ-35.1, REQ-35.2 | `<DeleteTodoButton todoId="todo-9">` with `window.confirm` stubbed to return `true` and `deleteTodoAction` mocked at `@/actions/delete-todo` resolving `{ ok: true, data: { id: 'todo-9' } }`                                                                | the person clicks "Delete todo"                                                                                                                      | `window.confirm` is called once with exactly `Delete this todo? This cannot be undone.`; `deleteTodoAction` is called once with exactly `('todo-9')`; the confirm call precedes the action call (`mock.invocationCallOrder`)                                                                                                                              |
| AC-35.2 | REQ-35.3           | `<DeleteTodoButton todoId="todo-9">` with `deleteTodoAction` mocked at `@/actions/delete-todo` resolving `{ ok: false, fieldErrors: { form: ['Could not save, try again'] } }`; `window.confirm` stubbed to return `false`, except in the second step of (b) | (a) the person clicks the button on a fresh render; (b) on another fresh render the stub returns `true` for a first click, then `false` for a second | (a) `window.confirm` is called once, the action 0 times, the button is enabled and there are 0 elements with role `alert`; (b) after the first click exactly 1 alert `Could not save, try again`; after the second click `window.confirm` has been called twice, the action is still called once, the same single alert remains and the button is enabled |
| AC-35.3 | REQ-35.4, REQ-35.5 | `<TodoItem>` of the open todo "Walk the dog" (id `todo-1`), the actions of §5, §6, §15 and §19 mocked as in its own tests, `window.confirm` stubbed to return `true`                                                                                         | it renders in view mode, the person clicks "Edit title", then clicks "Delete todo"                                                                   | `window.confirm` is called 0 times after render and 0 times after "Edit title"; inside the `<li>` there is exactly 1 button named "Delete todo" in view mode and exactly 1 in edit mode, the idle row text is still `Walk the dog`, 0 elements with role `dialog` exist; the click on "Delete todo" calls `window.confirm` once                           |
| AC-35.4 | REQ-35.1, REQ-35.2 | stored todos in list order C (open), B (done), A (open), shown in the browser, a dialog handler registered before each click that records `dialog.type()` and `dialog.message()` and accepts                                                                 | the person clicks "Delete todo" in B's row, reloads; then clicks it in C's row and in A's row, reloads                                               | each click shows exactly 1 dialog, of type `confirm`, with message exactly `Delete this todo? This cannot be undone.`; after B's click, before and after the reload, the list reads `[C, A]` (2 rows); after both remaining clicks, before and after the reload, 0 rows and the text "No todos yet" is visible                                            |
| AC-35.5 | REQ-35.1, REQ-35.3 | stored todos in list order C (open), B (done), A (open), shown in the browser, a dialog handler registered before the click that dismisses                                                                                                                   | the person clicks "Delete todo" in B's row, then reloads                                                                                             | exactly 1 dialog appears; before and after the reload the list reads `[C, B, A]` (3 rows) with B's checkbox checked and C's and A's unchecked; the row of B holds exactly 1 button named "Delete todo" and 0 elements with role `alert`                                                                                                                   |

## Function contracts

```ts
// src/components/delete-todo-button.tsx ('use client'); signature unchanged (§19)
export function DeleteTodoButton({ todoId }: { readonly todoId: string }): ReactNode; // onClick: if (!window.confirm('Delete this todo? This cannot be undone.')) return; then startTransition(deleteTodoAction(todoId)) as §19; the message is a module-level constant, not exported; no prop, state, element or attribute is added
```

No Server Action, Zod schema, Prisma model, route, `src/lib` module or other component changes: `deleteTodoAction`
(`src/actions/delete-todo.ts`), `deleteTodo` (`src/lib/todo-delete.ts`), `TodoItem` and `src/app/page.tsx` are
unchanged, and the existing e2e and unit tests that click "Delete todo" are rewritten from §19 (its AC-19.5 to
AC-19.7, edited by D-37) to stub or accept the dialog.

Test titles that other sections quote (fixed here so the red step uses them verbatim):

- `src/components/todo-item.test.tsx` :: "AC-35.3: asks 0 confirmations on render and on "Edit title", holds exactly 1 button "Delete todo" in view mode and in edit mode, and adds no text to the row"
- `e2e/19-delete.spec.ts` :: "AC-35.4: accepting the dialog "Delete this todo? This cannot be undone." on B leaves [C, A] before and after a reload; accepting it on C and on A leaves 0 rows and "No todos yet" before and after a reload"

## Out of scope

A custom modal, a message that names the todo, a "Don't ask again" option, a typed confirmation, undo or restore (§19),
confirming "Clear completed" (§9) or "Mark all complete" (§14), a keyboard shortcut, an animation, any visible change
to the row (REQ-19.3, REQ-20.7), any change to the failure messages of §19, any text added for assistive technology.

## Unchanged behavior

| Behavior                                                      | Proof                                                                                                                                                                                                                       |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A confirmed delete still removes exactly one row in the store | `src/lib/todo-delete.test.ts` :: "AC-19.1: resolves undefined for a deleted id, rejects TodoNotFoundError with id "missing" when nothing was deleted, calls deleteMany exactly twice by id and no other prisma.todo method" |
| A confirmed delete still revalidates once                     | `src/actions/delete-todo.test.ts` :: "AC-19.2: resolves { ok: true, data: { id: "todo-1" } }, calls deleteTodo once with exactly ("todo-1") and revalidates / once"                                                         |
| Clear completed still deletes exactly the completed rows      | `src/lib/todos.test.ts` :: "AC-9.1: deletes exactly the completed rows and returns the count"                                                                                                                               |
| A row still exposes its title as the checkbox name            | `src/components/todo-item.test.tsx` :: "AC-5.1: renders the title as the accessible name of an unchecked checkbox when not completed"                                                                                       |
| A row still shows exactly one alert for a failed toggle       | `src/components/todo-item.test.tsx` :: "AC-10.2: shows exactly one alert "Could not save, try again" in the row and leaves the checkbox unchecked when the toggle fails, then removes it on the next success"               |
| The clear button keeps its disabled-while-pending state       | `src/components/clear-completed-button.test.tsx` :: "AC-9.2: stays disabled while the action is pending and is enabled again once it resolves"                                                                              |
| The list is still newest first                                | `e2e/05-todos.spec.ts` :: "AC-5.1: lists todos newest first"                                                                                                                                                                |
| The empty list still shows "No todos yet" with the form       | `e2e/05-todos.spec.ts` :: "AC-5.7: an empty list shows "No todos yet" with the New todo box and the Add button"                                                                                                             |
