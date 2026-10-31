# §12 Todos: filter the list

Tier: full

- [x] Lead approves spec (lead, 2026-10-31, plan gate of B2.1)

## Intent

A person with a long list looks at only the items still open, or only the finished ones, and goes back to the whole
list in one click. The chosen view is part of the page address, so a reload or a shared link shows the same view.
Filtering changes what is shown, never what is stored or in which order.

## Requirements (EARS)

| ID        | Pattern           | Requirement                                                                                                                                                                                                                   |
| --------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| REQ-12.1  | Ubiquitous        | THE SYSTEM SHALL show on `/`, in every state (empty list included), a navigation named "Filter todos" holding three links in this order: "All", "Active", "Completed"; the links are not list items.                          |
| REQ-12.2  | State-driven      | WHILE the selected filter is Active THE SYSTEM SHALL list only the todos whose completion state is not completed.                                                                                                             |
| REQ-12.3  | State-driven      | WHILE the selected filter is Completed THE SYSTEM SHALL list only the todos whose completion state is completed.                                                                                                              |
| REQ-12.4  | State-driven      | WHILE the selected filter is All THE SYSTEM SHALL list every todo.                                                                                                                                                            |
| REQ-12.5  | Unwanted behavior | IF the `filter` query parameter is absent, or its value is anything other than exactly `active` or `completed` (including a repeated parameter), THEN THE SYSTEM SHALL select All and report no error.                        |
| REQ-12.6  | Ubiquitous        | THE SYSTEM SHALL carry the selected filter in the `filter` query parameter: the "All" link points to `/`, "Active" to `/?filter=active`, "Completed" to `/?filter=completed`, so that a full page reload shows the same view. |
| REQ-12.7  | State-driven      | WHILE a filter is selected THE SYSTEM SHALL mark its link with `aria-current="page"` and mark neither of the other two links.                                                                                                 |
| REQ-12.8  | State-driven      | WHILE the list shown is empty THE SYSTEM SHALL show "No todos yet" when no todo exists, otherwise "No active todos" under Active and "No completed todos" under Completed.                                                    |
| REQ-12.9  | Ubiquitous        | THE SYSTEM SHALL keep the todos shown in the same relative order as §5 (creation time, newest first) under every filter and SHALL NOT change any stored todo by selecting a filter.                                           |
| REQ-12.10 | State-driven      | WHILE a filter is selected THE SYSTEM SHALL enable "Clear completed" (§9) exactly when at least one stored todo is completed, whether or not that todo is shown.                                                              |
| REQ-12.11 | Event-driven      | WHEN a todo is toggled, edited or cleared (§5, §6, §9) while a filter is selected THE SYSTEM SHALL keep that filter selected and apply it to the stored states, so a todo that no longer matches leaves the list.             |

The filter is a view over the list `listTodos()` returns (§5); the list is read once per render and filtered in memory.
Titles, duplicates and completion are those of §5.

## Acceptance criteria

| ID      | Covers                                   | Given                                                                                                                                              | When                                                                                               | Then (measurable)                                                                                                                                                                                                                                                                                              |
| ------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-12.1 | REQ-12.2, REQ-12.3, REQ-12.4, REQ-12.9   | todos in list order D (open), C (done), B (open), A (done)                                                                                         | `filterTodos(todos, 'active')`, `filterTodos(todos, 'completed')`, `filterTodos(todos, 'all')` run | ids `[D, B]`, `[C, A]`, `[D, C, B, A]` respectively; the input array still reads `[D, C, B, A]`                                                                                                                                                                                                                |
| AC-12.2 | REQ-12.4, REQ-12.5                       | a raw `filter` value                                                                                                                               | `parseTodoFilter(value)` runs                                                                      | `'active'` → `'active'`; `'completed'` → `'completed'`; `undefined`, `'all'`, `''`, `'Active'`, `'bogus'`, `['active', 'completed']` → `'all'`; it never throws                                                                                                                                                |
| AC-12.3 | REQ-12.8                                 | a selected filter and the count of stored todos                                                                                                    | `emptyListMessage(filter, totalCount)` runs                                                        | `('all', 0)`, `('active', 0)`, `('completed', 0)` → `'No todos yet'`; `('active', 3)` → `'No active todos'`; `('completed', 3)` → `'No completed todos'`; `('all', 3)` → `'No todos yet'`                                                                                                                      |
| AC-12.4 | REQ-12.1, REQ-12.6, REQ-12.7             | `TodoFilterNav` rendered with `selected` `'active'`, then `'all'`                                                                                  | the component renders                                                                              | one navigation named "Filter todos"; links "All", "Active", "Completed" in that order with `href` `/`, `/?filter=active`, `/?filter=completed`; 0 `listitem` elements; with `'active'` only "Active" has `aria-current="page"` (other two have none), with `'all'` only "All"                                  |
| AC-12.5 | REQ-12.1, REQ-12.2 to REQ-12.7, REQ-12.9 | stored todos in list order D (open), C (done), B (open), A (done), the browser on `/`                                                              | the person clicks "Active", reloads, clicks "Completed", clicks "All", then opens `/?filter=bogus` | listed rows read `[D, C, B, A]` on `/`; after "Active" the address is `/?filter=active` and rows read `[D, B]`, again after the reload; after "Completed" `[C, A]`; after "All" the address is `/` and rows read `[D, C, B, A]`; `/?filter=bogus` reads `[D, C, B, A]` with "All" marked `aria-current="page"` |
| AC-12.6 | REQ-12.10, REQ-12.11                     | stored todos in list order D (open), C (done), B (open), the browser on `/?filter=active`                                                          | the person checks D, then clicks "Clear completed"                                                 | before any click rows read `[D, B]` and "Clear completed" is enabled (C is hidden); after checking D rows read `[B]` and the address is still `/?filter=active`; after the clear rows read `[B]`, "Clear completed" is disabled, and the stored rows are exactly `[B]`                                         |
| AC-12.7 | REQ-12.1, REQ-12.8                       | (a) no stored todo, on `/?filter=completed`; (b) only open todos stored, on `/?filter=completed`; (c) only done todos stored, on `/?filter=active` | `/` renders                                                                                        | the three filter links are visible in all three; 0 `listitem` elements in all three; the text is "No todos yet" in (a), "No completed todos" in (b), "No active todos" in (c)                                                                                                                                  |

## Function contracts

```ts
// src/lib/todo-filter.ts (pure: no Prisma, no server-only; importable from a client component)
export type TodoFilter = 'all' | 'active' | 'completed';
export function parseTodoFilter(value: string | string[] | undefined): TodoFilter; // only exactly 'active' or 'completed' select; everything else 'all'
export function filterTodos<T extends { readonly completed: boolean }>(todos: readonly T[], filter: TodoFilter): T[]; // keeps input order; returns a new array; never mutates
export function emptyListMessage(filter: TodoFilter, totalCount: number): string; // called when the list shown is empty; §12 messages
// src/components/todo-filter-nav.tsx (no 'use client': links only, no state or events)
export function TodoFilterNav({ selected }: { readonly selected: TodoFilter }): ReactNode; // <nav aria-label="Filter todos"> with three <Link>s, no <ul>
// src/app/page.tsx: HomePage({ searchParams }: { searchParams: Promise<{ filter?: string | string[] }> }) reads
// parseTodoFilter((await searchParams).filter), renders <TodoFilterNav selected={filter} /> between <ClearCompletedButton /> and the
// list or the empty text, in both states; <ClearCompletedButton disabled> still derives from the unfiltered todos;
// the list is filterTodos(todos, filter); when it is empty the <p> text is emptyListMessage(filter, todos.length)
```

`src/lib/todos.ts` and `src/actions/todos.ts` do not change: `listTodos()` still returns every todo, and no action
takes a filter.

## Out of scope

Searching by title, a due date, a remaining-items count, remembering the filter outside the address (cookie, local
storage), a filter in the database query, counts on the links, keyboard shortcuts, any ordering other than creation time
newest first (§1), filtering by text.

## Unchanged behavior

| Behavior                                                  | Proof                                                                                                                           |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| The list read is still newest first and takes no argument | `src/lib/todos.test.ts` :: "AC-5.1: returns todos newest first with id, title and completed"                                    |
| An empty list still shows "No todos yet" on `/`           | `e2e/05-todos.spec.ts` :: "AC-5.7: an empty list shows "No todos yet" with the New todo box and the Add button"                 |
| The unfiltered list is still newest first on `/`          | `e2e/05-todos.spec.ts` :: "AC-5.1: lists todos newest first"                                                                    |
| Toggling still inverts and stores                         | `src/lib/todos.test.ts` :: "AC-5.4: inverts completed and stores it, twice in a row"                                            |
| Clearing completed still deletes every completed row      | `src/lib/todos.test.ts` :: "AC-9.1: deletes exactly the completed rows and returns the count"                                   |
| Clear completed still removes them and keeps the order    | `e2e/09-clear-completed.spec.ts` :: "AC-9.3: clicking removes the completed todos and the rest keep their order after a reload" |
