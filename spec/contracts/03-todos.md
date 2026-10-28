# §5 Todos: list, create, toggle

## Intent

A single person keeps a list of things to do that survives closing the browser: add an item, see every item newest
first, mark an item done or not done again.

## Requirements (EARS)

| ID      | Pattern           | Requirement                                                                                                                                                        |
| ------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| REQ-5.1 | Ubiquitous        | THE SYSTEM SHALL show every todo on `/` ordered by creation time, newest first, each with its title and completion state.                                          |
| REQ-5.2 | Event-driven      | WHEN a person submits a title that is 1 to 200 characters long after trimming whitespace THE SYSTEM SHALL store it as a not-completed todo with the trimmed title. |
| REQ-5.3 | Unwanted behavior | IF the submitted title is empty after trimming, or longer than 200 characters THEN THE SYSTEM SHALL store nothing and report a field error on `title`.             |
| REQ-5.4 | Event-driven      | WHEN a person toggles a todo THE SYSTEM SHALL invert its completion state and store it.                                                                            |
| REQ-5.5 | Unwanted behavior | IF a toggle names a todo id that does not exist THEN THE SYSTEM SHALL change nothing and report a field error on `id`.                                             |
| REQ-5.6 | Ubiquitous        | THE SYSTEM SHALL keep todos in PostgreSQL so that a full page reload shows the same list and states.                                                               |
| REQ-5.7 | State-driven      | WHILE no todo exists THE SYSTEM SHALL show the text "No todos yet".                                                                                                |

Duplicate titles are allowed (D-5).

## Acceptance criteria

| ID     | Covers           | Given                                  | When                                       | Then (measurable)                                                                                                            |
| ------ | ---------------- | -------------------------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| AC-5.1 | REQ-5.1          | three todos created in order A, B, C   | the list is read                           | exactly `[C, B, A]`, each with `id`, `title`, `completed`                                                                    |
| AC-5.2 | REQ-5.2          | form title `"  Buy milk  "`            | `createTodoAction` runs                    | `{ ok: true, data: { title: 'Buy milk', completed: false } }` and `/` revalidated once                                       |
| AC-5.3 | REQ-5.3          | title `"   "`; title of 201 characters | `createTodoAction` runs                    | `{ ok: false, fieldErrors: { title: ['Title is required'] } }` / `['Title must be 200 characters or fewer']`; nothing stored |
| AC-5.4 | REQ-5.4          | a todo with `completed: false`         | `toggleTodoAction` runs twice              | first `completed: true`, second `completed: false`; each stored                                                              |
| AC-5.5 | REQ-5.5          | no todo with id `missing`              | `toggleTodoAction('missing')`              | `{ ok: false, fieldErrors: { id: ['Todo not found'] } }`; no row changed                                                     |
| AC-5.6 | REQ-5.6, REQ-5.1 | empty list in the browser              | add "Walk the dog", reload, toggle, reload | after reload 1 the item is listed unchecked; after reload 2 it is checked                                                    |
| AC-5.7 | REQ-5.7          | no todos                               | `/` renders                                | "No todos yet" visible, a text box labelled "New todo", a button "Add"                                                       |

## Function contracts

```ts
// src/lib/todo-schema.ts
export const createTodoSchema: z.ZodObject<{ title: z.ZodString }>; // trim, min 1 'Title is required', max 200 'Title must be 200 characters or fewer'
export const toggleTodoSchema: z.ZodObject<{ id: z.ZodString }>;
// src/lib/todos.ts
export interface Todo {
  readonly id: string;
  readonly title: string;
  readonly completed: boolean;
  readonly createdAt: Date;
}
export class TodoNotFoundError extends Error {
  readonly id: string;
}
export function listTodos(): Promise<Todo[]>; // orderBy createdAt desc, select id,title,completed,createdAt
export function createTodo(title: string): Promise<Todo>;
export function toggleTodo(id: string): Promise<Todo>; // throws TodoNotFoundError
// src/actions/todos.ts ('use server')
export function createTodoAction(previous: ActionResult<Todo> | null, formData: FormData): Promise<ActionResult<Todo>>;
export function toggleTodoAction(id: string): Promise<ActionResult<Todo>>;
// src/lib/action-result.ts
export type ActionResult<T> = { ok: true; data: T } | { ok: false; fieldErrors: Record<string, string[]> };
```

## Out of scope

Editing (§6) and deleting a todo; accounts; due dates; filtering; optimistic UI.

## Unchanged behavior

| Behavior                                         | Proof                                                   |
| ------------------------------------------------ | ------------------------------------------------------- |
| `GET /api/health` answers 200 `{ status: 'ok' }` | `src/app/api/health/route.test.ts`, `e2e/smoke.spec.ts` |
| Environment validation (§4)                      | `src/lib/env.test.ts`                                   |
