# §10 Todos: feedback when a mutation fails

Tier: full

- [x] Lead approves spec (lead, 2026-10-29, plan gate of B1.4)
- [ ] Lead approves spec (lead, <date>)

## Intent

A person whose click or submit could not be saved is told so, right beside the control they used, and the list is
exactly what it was before. What they typed is still in the box. They can try again without reloading the page.

## Requirements (EARS)

| ID       | Pattern           | Requirement                                                                                                                                                                                                                                                                    |
| -------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| REQ-10.1 | Unwanted behavior | IF creating a todo (§5), toggling a todo (§5), saving an edited title (§6) or clearing completed todos (§9) fails for any reason other than a missing todo id THEN THE SYSTEM SHALL change nothing, refresh nothing, and report a field error on `form`, never a thrown error. |
| REQ-10.2 | Unwanted behavior | IF a toggle fails as in REQ-10.1 THEN THE SYSTEM SHALL show the message in the same row as the checkbox and leave the checkbox as stored.                                                                                                                                      |
| REQ-10.3 | Unwanted behavior | IF saving an edited title fails as in REQ-10.1 THEN THE SYSTEM SHALL show the message in the same row, keep the row in edit mode with the typed draft, and leave the stored title as it was.                                                                                   |
| REQ-10.4 | Unwanted behavior | IF clearing completed todos fails as in REQ-10.1 THEN THE SYSTEM SHALL show the message directly after the "Clear completed" button, keep the button usable, and keep every todo listed with the same title, state and order.                                                  |
| REQ-10.5 | Event-driven      | WHEN the next attempt on the same control succeeds THE SYSTEM SHALL remove the message.                                                                                                                                                                                        |
| REQ-10.6 | Unwanted behavior | IF creating a todo fails as in REQ-10.1 THEN THE SYSTEM SHALL show the message under the "New todo" text box, keep the typed title in the box, keep the "Add" button usable, and list no new todo.                                                                             |

The message is `Could not save, try again` for all four controls. It is announced as an alert (`role="alert"`).
A missing todo id keeps its §5/§6 field error on `id` (`Todo not found`); invalid input keeps its §5/§6 field
errors. Only an error that is neither of those is a failure in the sense of REQ-10.1.

## Acceptance criteria

| ID      | Covers                       | Given                                                                                                                                                                                       | When                                                                                                                                       | Then (measurable)                                                                                                                                                                                                                                                                                                                        |
| ------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-10.1 | REQ-10.1                     | the `src/lib` call behind the action rejects with `new Error('db down')`                                                                                                                    | `toggleTodoAction('todo-1')`, `updateTodoTitleAction('todo-1', 'Buy milk')` and `clearCompletedTodosAction()` each run                     | each promise resolves (none rejects) to `{ ok: false, fieldErrors: { form: ['Could not save, try again'] } }`; `revalidatePath` is called 0 times; the lib function was called once; a `TodoNotFoundError` from toggle or edit still resolves to `{ ok: false, fieldErrors: { id: ['Todo not found'] } }`                                |
| AC-10.2 | REQ-10.2, REQ-10.3, REQ-10.5 | a row for the open todo "Walk the dog" whose action resolves `{ ok: false, fieldErrors: { form: ['Could not save, try again'] } }`; a later attempt resolves `ok: true`                     | (a) the person clicks the checkbox; (b) in edit mode with the draft `Walk the cat` the person clicks "Save"; (c) the next attempt succeeds | (a) and (b): exactly 1 element with role `alert` inside that row's `<li>`, text exactly `Could not save, try again`; in (a) the checkbox is still unchecked; in (b) the text box "Edit title" is still shown with value `Walk the cat`; (c): 0 elements with role `alert` in the row                                                     |
| AC-10.3 | REQ-10.4, REQ-10.5           | the "Clear completed" button is enabled and `clearCompletedTodosAction` resolves `{ ok: false, fieldErrors: { form: ['Could not save, try again'] } }`; a later attempt resolves `ok: true` | the person clicks "Clear completed", then clicks it again                                                                                  | after the first click: exactly 1 element with role `alert`, text exactly `Could not save, try again`, in the same parent element as the button and after it; the button is enabled again; after the second click: 0 elements with role `alert`                                                                                           |
| AC-10.4 | REQ-10.1                     | `createTodo` rejects with `new Error('db down')`                                                                                                                                            | `createTodoAction(null, formData)` runs with the title `Buy milk`, then with the title `   `                                               | the first promise resolves (does not reject) to `{ ok: false, fieldErrors: { form: ['Could not save, try again'] } }`, `revalidatePath` is called 0 times and `createTodo` was called once with `Buy milk`; the second resolves to `{ ok: false, fieldErrors: { title: ['Title is required'] } }` and `createTodo` was still called once |
| AC-10.5 | REQ-10.5, REQ-10.6           | `<TodoForm>` whose `createTodoAction` resolves `{ ok: false, fieldErrors: { form: ['Could not save, try again'] } }` on the first submit and `{ ok: true, data: <a todo> }` on the next     | the person types `Buy milk` in the text box "New todo" and clicks "Add", then clicks "Add" again                                           | after the first click: exactly 1 element with role `alert` inside the `<form>`, text exactly `Could not save, try again`; the text box "New todo" has value `Buy milk`; the button "Add" is enabled; after the second click: 0 elements with role `alert` and the text box has an empty value (`''`)                                     |

## Function contracts

```ts
// src/lib/action-result.ts
export const MUTATION_FAILED_MESSAGE: 'Could not save, try again'; // the one message text of this section
// src/actions/todos.ts ('use server'), signatures unchanged:
export function createTodoAction(previous: ActionResult<Todo> | null, formData: FormData): Promise<ActionResult<Todo>>;
export function toggleTodoAction(id: string): Promise<ActionResult<Todo>>;
export function updateTodoTitleAction(id: string, title: string): Promise<ActionResult<Todo>>;
export function clearCompletedTodosAction(): Promise<ActionResult<{ deleted: number }>>;
// Each wraps its lib call and revalidatePath('/') in one try/catch: TodoNotFoundError keeps its §5/§6 arm
// (failure('id', 'Todo not found')); any other thrown value resolves to failure('form', MUTATION_FAILED_MESSAGE)
// and nothing is revalidated. createTodoAction parses with Zod first, outside the try (a title error keeps its
// §5 `title` key and never reaches the lib), and has no TodoNotFoundError arm: any value thrown by createTodo or
// revalidatePath resolves to the `form` failure. No action in this block rethrows. `ActionResult` is unchanged: `form` is the
// existing key fieldErrorsOf uses for an issue without a path.
// src/components/todo-item.tsx: TodoItem({ todo }) keeps its single role="alert" span in the row; the toggle reads
// fieldErrors.id?.[0] ?? fieldErrors.form?.[0]; Save reads fieldErrors.title?.[0] ?? fieldErrors.id?.[0] ?? fieldErrors.form?.[0];
// the success path clears the message (REQ-10.5). The fallback text 'Could not update the todo' is removed: an
// ok:false result without one of those keys cannot occur.
// src/components/clear-completed-button.tsx: ClearCompletedButton({ disabled }: { readonly disabled: boolean }): ReactNode
// renders the button and, only after a failed result, <p role="alert"> with fieldErrors.form?.[0] as the button's next
// sibling inside one wrapper element; a successful result clears it; the button is enabled again once pending ends.
// src/components/todo-form.tsx: TodoForm(): ReactNode keeps its single <p id="new-todo-error" role="alert"> under the
// text box and reads fieldErrors.title?.[0] ?? fieldErrors.form?.[0] (an ok:false result carries one of the two);
// after a result with a `form` error the text box keeps the title the person typed, after ok:true it is empty, and the
// "Add" button is enabled again once pending ends. The next result replaces the message, so at most 1 alert shows.
```

## Out of scope

The content of the text box after a `title` error (§5), a failure of the request itself (network down, the server unreachable: the action promise rejects on the client), retrying
automatically, a different text per control, logging the cause, optimistic UI, an error page (`error.tsx`).

## Unchanged behavior

| Behavior                                                              | Proof                                                                                                                                          |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| An unknown id on toggle still reports "Todo not found"                | `src/actions/todos.test.ts` :: "AC-5.5: returns fieldErrors.id ["Todo not found"] for an unknown id and does not revalidate"                   |
| An unknown id on edit still reports "Todo not found"                  | `src/actions/todos.test.ts` :: "returns fieldErrors.id ["Todo not found"] for an unknown id and does not revalidate"                           |
| Toggle and the row still show the id error                            | `src/components/todo-item.test.tsx` :: "AC-5.5: shows "Todo not found" when the action reports the id error"                                   |
| A rejected title keeps the draft and shows its message                | `src/components/todo-item.test.tsx` :: "AC-6.4: keeps the draft and shows the error when the action rejects the title"                         |
| A successful clear still returns the count and revalidates            | `src/actions/todos.test.ts` :: "AC-9.1: deletes every completed todo, returns the count and revalidates / once"                                |
| The button keeps its name and its disabled-while-pending state        | `src/components/clear-completed-button.test.tsx` :: "AC-9.2: stays disabled while the action is pending and is enabled again once it resolves" |
| A row exposes its title as the checkbox name                          | `src/components/todo-item.test.tsx` :: "AC-5.1: renders the title as the accessible name of an unchecked checkbox when not completed"          |
| Created todos survive a reload                                        | `e2e/05-todos.spec.ts` :: "AC-5.6: a created todo survives a reload, and so does its toggled state"                                            |
| A valid title still creates the todo and revalidates                  | `src/actions/todos.test.ts` :: "AC-5.2: creates the trimmed title as a not-completed todo and revalidates / once"                              |
| A blank title still reports "Title is required"                       | `src/actions/todos.test.ts` :: "AC-5.3: returns fieldErrors.title ["Title is required"] for a blank title and stores nothing"                  |
| A 201-character title still reports its length message                | `src/actions/todos.test.ts` :: "AC-5.3: returns fieldErrors.title ["Title must be 200 characters or fewer"] for 201 characters"                |
| The form still shows the `title` error beside the box                 | `src/components/todo-form.test.tsx` :: "AC-5.3: shows the title field error returned by the action"                                            |
| The form still submits the typed title and empties the box on success | `src/components/todo-form.test.tsx` :: "AC-5.2: submits the typed title and clears the box on success"                                         |
| The form keeps its text box "New todo" and button "Add"               | `src/components/todo-form.test.tsx` :: "AC-5.7: renders a text box labelled "New todo" and a button "Add""                                     |
