# §6 Todos: edit a title

Tier: full

- [x] Lead approves spec (lead, 2026-10-28, plan gate of B1.2)

## Intent

A person who mistyped an item corrects its text in place instead of adding a new item and leaving the wrong one
behind. The corrected text is what the list shows after a reload, with the same completion state and position.

## Requirements (EARS)

| ID      | Pattern           | Requirement                                                                                                                                                        |
| ------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| REQ-6.1 | Event-driven      | WHEN a person activates editing on a listed todo THE SYSTEM SHALL show that todo's current title in an editable text field.                                        |
| REQ-6.2 | Event-driven      | WHEN a person submits a changed title THE SYSTEM SHALL persist it with leading and trailing whitespace removed.                                                    |
| REQ-6.3 | Event-driven      | WHEN a title is edited THE SYSTEM SHALL keep the todo's completion state unchanged.                                                                                |
| REQ-6.4 | Event-driven      | WHEN a title is edited THE SYSTEM SHALL keep the todo's position in the list unchanged.                                                                            |
| REQ-6.5 | Unwanted behavior | IF the submitted title is empty after trimming THEN THE SYSTEM SHALL reject the edit with a field error on `title` and keep the stored title.                      |
| REQ-6.6 | Unwanted behavior | IF the submitted title is longer than 200 characters after trimming THEN THE SYSTEM SHALL reject the edit with a field error on `title` and keep the stored title. |
| REQ-6.7 | Event-driven      | WHEN a person submits a title equal to another todo's title THE SYSTEM SHALL persist it as for any other title (D-5).                                              |

Title limits and messages are those of §5 (`createTodoSchema`). An edit of an id that no longer exists returns
`fieldErrors.id: ['Todo not found']` as in §5 (no criterion; covered by the lib test).

## Acceptance criteria

| ID     | Covers           | Given                                                   | When                                                  | Then (measurable)                                                                                                                             |
| ------ | ---------------- | ------------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-6.1 | REQ-6.1          | the list shows one todo titled `Buy mik`                | the person activates editing on it                    | exactly one text field, value `Buy mik`, labelled "Edit title"                                                                                |
| AC-6.2 | REQ-6.2          | one stored todo titled `Buy mik`                        | `updateTodoTitleAction(id, '  Buy milk  ')`           | `{ ok: true, data: { title: 'Buy milk' } }`, stored title `Buy milk`, `/` revalidated once                                                    |
| AC-6.3 | REQ-6.3, REQ-6.4 | stored todos in list order A (open), B (done), C (open) | B is retitled `B2` and the page reloads               | list reads `[A, B2, C]`; B2 is still checked                                                                                                  |
| AC-6.4 | REQ-6.5          | one stored todo titled `Buy mik`                        | the person submits `   `                              | `{ ok: false, fieldErrors: { title: ['Title is required'] } }`; stored title still `Buy mik`; the field keeps the draft and shows the message |
| AC-6.5 | REQ-6.6          | one stored todo titled `Buy mik`                        | the person submits 201 non-space characters           | `{ ok: false, fieldErrors: { title: ['Title must be 200 characters or fewer'] } }`; stored title unchanged                                    |
| AC-6.6 | REQ-6.2, REQ-6.6 | one stored todo titled `Buy mik`                        | 200 non-space characters padded by 5 spaces each side | `ok: true`, stored title is the 200 characters                                                                                                |
| AC-6.7 | REQ-6.7          | two stored todos titled `A` and `B`                     | `B` is retitled `A`                                   | `ok: true`; two todos titled `A` exist                                                                                                        |

## Function contracts

```ts
// src/lib/todo-schema.ts
export const updateTodoTitleSchema: z.ZodObject<{ id: z.ZodString; title: z.ZodString }>; // = createTodoSchema.extend(toggleTodoSchema.shape)
// src/lib/todos.ts
export function updateTodoTitle(id: string, title: string): Promise<Todo>; // throws TodoNotFoundError; data: { title } only
// src/actions/todos.ts ('use server')
export function updateTodoTitleAction(id: string, title: string): Promise<ActionResult<Todo>>;
// src/components/todo-item.tsx: TodoItem({ todo }) gains an edit mode (icon-only "Edit title" button, text field, Save);
// the row adds no text content in its idle state (AC-5.1 compares each <li>'s whole text).
```

## Out of scope

Cancelling an edit (Escape/blur), editing anything but the title, concurrent edits from two tabs, undo.

## Unchanged behavior

| Behavior                                     | Proof                                                                                                                                 |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Creating still trims and enforces 1–200      | `src/lib/todo-schema.test.ts` :: "AC-5.2: trims the title and keeps 1..200 characters"                                                |
| Toggling still works                         | `src/lib/todos.test.ts` :: "AC-5.4: inverts completed and stores it, twice in a row"                                                  |
| The list is still newest first               | `e2e/05-todos.spec.ts` :: "AC-5.1: lists todos newest first"                                                                          |
| A row exposes its title as the checkbox name | `src/components/todo-item.test.tsx` :: "AC-5.1: renders the title as the accessible name of an unchecked checkbox when not completed" |
