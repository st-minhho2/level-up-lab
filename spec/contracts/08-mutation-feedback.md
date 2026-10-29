# §10 Todos: feedback when a mutation fails

Tier: quick

- [x] Lead approves spec (lead, 2026-10-29, plan gate of B1.4)

## Intent

A person whose click could not be saved is told so, right beside the control they used, and the list is exactly what
it was before the click. They can click again without reloading the page.

## Requirements (EARS)

| ID       | Pattern           | Requirement                                                                                                                                                                                                                                              |
| -------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| REQ-10.1 | Unwanted behavior | IF toggling a todo (§5), saving an edited title (§6) or clearing completed todos (§9) fails for any reason other than a missing todo id THEN THE SYSTEM SHALL change nothing, refresh nothing, and report a field error on `form`, never a thrown error. |
| REQ-10.2 | Unwanted behavior | IF a toggle fails as in REQ-10.1 THEN THE SYSTEM SHALL show the message in the same row as the checkbox and leave the checkbox as stored.                                                                                                                |
| REQ-10.3 | Unwanted behavior | IF saving an edited title fails as in REQ-10.1 THEN THE SYSTEM SHALL show the message in the same row, keep the row in edit mode with the typed draft, and leave the stored title as it was.                                                             |
| REQ-10.4 | Unwanted behavior | IF clearing completed todos fails as in REQ-10.1 THEN THE SYSTEM SHALL show the message directly after the "Clear completed" button, keep the button usable, and keep every todo listed with the same title, state and order.                            |
| REQ-10.5 | Event-driven      | WHEN the next attempt on the same control succeeds THE SYSTEM SHALL remove the message.                                                                                                                                                                  |

The message is `Could not save, try again` for all three controls. It is announced as an alert (`role="alert"`).
A missing todo id keeps its §5/§6 field error on `id` (`Todo not found`); invalid input keeps its §5/§6 field
errors. Only an error that is neither of those is a failure in the sense of REQ-10.1.

## Acceptance criteria

| ID      | Covers                       | Given                                                                                                                                                                                       | When                                                                                                                                       | Then (measurable)                                                                                                                                                                                                                                                                                         |
| ------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-10.1 | REQ-10.1                     | the `src/lib` call behind the action rejects with `new Error('db down')`                                                                                                                    | `toggleTodoAction('todo-1')`, `updateTodoTitleAction('todo-1', 'Buy milk')` and `clearCompletedTodosAction()` each run                     | each promise resolves (none rejects) to `{ ok: false, fieldErrors: { form: ['Could not save, try again'] } }`; `revalidatePath` is called 0 times; the lib function was called once; a `TodoNotFoundError` from toggle or edit still resolves to `{ ok: false, fieldErrors: { id: ['Todo not found'] } }` |
| AC-10.2 | REQ-10.2, REQ-10.3, REQ-10.5 | a row for the open todo "Walk the dog" whose action resolves `{ ok: false, fieldErrors: { form: ['Could not save, try again'] } }`; a later attempt resolves `ok: true`                     | (a) the person clicks the checkbox; (b) in edit mode with the draft `Walk the cat` the person clicks "Save"; (c) the next attempt succeeds | (a) and (b): exactly 1 element with role `alert` inside that row's `<li>`, text exactly `Could not save, try again`; in (a) the checkbox is still unchecked; in (b) the text box "Edit title" is still shown with value `Walk the cat`; (c): 0 elements with role `alert` in the row                      |
| AC-10.3 | REQ-10.4, REQ-10.5           | the "Clear completed" button is enabled and `clearCompletedTodosAction` resolves `{ ok: false, fieldErrors: { form: ['Could not save, try again'] } }`; a later attempt resolves `ok: true` | the person clicks "Clear completed", then clicks it again                                                                                  | after the first click: exactly 1 element with role `alert`, text exactly `Could not save, try again`, in the same parent element as the button and after it; the button is enabled again; after the second click: 0 elements with role `alert`                                                            |

## Function contracts

```ts
// src/lib/action-result.ts
export const MUTATION_FAILED_MESSAGE: 'Could not save, try again'; // the one message text of this section
// src/actions/todos.ts ('use server'), signatures unchanged:
export function toggleTodoAction(id: string): Promise<ActionResult<Todo>>;
export function updateTodoTitleAction(id: string, title: string): Promise<ActionResult<Todo>>;
export function clearCompletedTodosAction(): Promise<ActionResult<{ deleted: number }>>;
// Each wraps its lib call and revalidatePath('/') in one try/catch: TodoNotFoundError keeps its §5/§6 arm
// (failure('id', 'Todo not found')); any other thrown value resolves to failure('form', MUTATION_FAILED_MESSAGE)
// and nothing is revalidated. No action in this block rethrows. `ActionResult` is unchanged: `form` is the
// existing key fieldErrorsOf uses for an issue without a path.
// src/components/todo-item.tsx: TodoItem({ todo }) keeps its single role="alert" span in the row; the toggle reads
// fieldErrors.id?.[0] ?? fieldErrors.form?.[0]; Save reads fieldErrors.title?.[0] ?? fieldErrors.id?.[0] ?? fieldErrors.form?.[0];
// the success path clears the message (REQ-10.5). The fallback text 'Could not update the todo' is removed: an
// ok:false result without one of those keys cannot occur.
// src/components/clear-completed-button.tsx: ClearCompletedButton({ disabled }: { readonly disabled: boolean }): ReactNode
// renders the button and, only after a failed result, <p role="alert"> with fieldErrors.form?.[0] as the button's next
// sibling inside one wrapper element; a successful result clears it; the button is enabled again once pending ends.
```

## Out of scope

Creating a todo (`createTodoAction`, `TodoForm`: a database failure there still reaches the error boundary), a failure
of the request itself (network down, the server unreachable: the action promise rejects on the client), retrying
automatically, a different text per control, logging the cause, optimistic UI, an error page (`error.tsx`).

## Unchanged behavior

| Behavior                                                       | Proof                                                                                                                                          |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| An unknown id on toggle still reports "Todo not found"         | `src/actions/todos.test.ts` :: "AC-5.5: returns fieldErrors.id ["Todo not found"] for an unknown id and does not revalidate"                   |
| An unknown id on edit still reports "Todo not found"           | `src/actions/todos.test.ts` :: "returns fieldErrors.id ["Todo not found"] for an unknown id and does not revalidate"                           |
| Toggle and the row still show the id error                     | `src/components/todo-item.test.tsx` :: "AC-5.5: shows "Todo not found" when the action reports the id error"                                   |
| A rejected title keeps the draft and shows its message         | `src/components/todo-item.test.tsx` :: "AC-6.4: keeps the draft and shows the error when the action rejects the title"                         |
| A successful clear still returns the count and revalidates     | `src/actions/todos.test.ts` :: "AC-9.1: deletes every completed todo, returns the count and revalidates / once"                                |
| The button keeps its name and its disabled-while-pending state | `src/components/clear-completed-button.test.tsx` :: "AC-9.2: stays disabled while the action is pending and is enabled again once it resolves" |
| A row exposes its title as the checkbox name                   | `src/components/todo-item.test.tsx` :: "AC-5.1: renders the title as the accessible name of an unchecked checkbox when not completed"          |
| Created todos survive a reload                                 | `e2e/05-todos.spec.ts` :: "AC-5.6: a created todo survives a reload, and so does its toggled state"                                            |
