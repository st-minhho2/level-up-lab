# §13 Todos: remaining count

Tier: full

- [ ] Lead approves spec (lead, <date>)

## Intent

A person looking at the list sees at a glance how many todos are still open, without counting rows. The number is
right on an empty list, after adding or ticking a todo, and after a reload.

## Requirements (EARS)

| ID       | Pattern      | Requirement                                                                                                                                                                              |
| -------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| REQ-13.1 | Ubiquitous   | THE SYSTEM SHALL show on `/` the number of stored todos whose completion state is not completed, written "N item left" when N is 1 and "N items left" for every other N (0, 2, 3, …).    |
| REQ-13.2 | State-driven | WHILE no todo exists THE SYSTEM SHALL show "0 items left" together with the "No todos yet" text of §5; the count is never hidden.                                                        |
| REQ-13.3 | Event-driven | WHEN a person creates a todo (§5) or toggles one (§5) THE SYSTEM SHALL show the new count in the same page without a full reload.                                                        |
| REQ-13.4 | Ubiquitous   | THE SYSTEM SHALL derive the count from the stored todos on every render, so that a full page reload, and clearing completed todos (§9), show the count of the todos that are still open. |
| REQ-13.5 | Ubiquitous   | THE SYSTEM SHALL count every stored todo, not only the rows currently listed, and SHALL NOT count a completed todo.                                                                      |

The count is text, not a list row and not a control. Titles, completion and ordering are those of §5.

## Acceptance criteria

| ID      | Covers             | Given                                                                               | When                                              | Then (measurable)                                                                                                                           |
| ------- | ------------------ | ----------------------------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-13.1 | REQ-13.1, REQ-13.5 | todo lists (a) `[]`, (b) three open, (c) open, done, open, done, open, (d) two done | `countRemaining(todos)` runs on each              | (a) `0`, (b) `3`, (c) `3`, (d) `0`; the input array is not modified                                                                         |
| AC-13.2 | REQ-13.1           | counts 0, 1, 2, 11                                                                  | `remainingLabel(count)` runs on each              | `"0 items left"`, `"1 item left"`, `"2 items left"`, `"11 items left"`                                                                      |
| AC-13.3 | REQ-13.2           | no stored todo                                                                      | `/` renders                                       | exactly one element with the text "0 items left" and exactly one with "No todos yet"; 0 `listitem` roles                                    |
| AC-13.4 | REQ-13.1, REQ-13.5 | three stored todos in list order C (open), B (done), A (open)                       | `/` renders                                       | exactly one element with the text "2 items left"; 3 `listitem` roles (the count is none of them)                                            |
| AC-13.5 | REQ-13.3           | an empty list shown in the browser                                                  | the person adds "A", then "B"                     | the text reads "0 items left" before, "1 item left" after "A", "2 items left" after "B", with no navigation between the steps               |
| AC-13.6 | REQ-13.3           | stored todos C (open), B (open) shown in the browser                                | the person checks C, then unchecks C              | the text reads "2 items left" before, "1 item left" after the check, "2 items left" after the uncheck, with no navigation between the steps |
| AC-13.7 | REQ-13.4           | stored todos C (open), B (done), A (open) shown in the browser                      | the person clicks "Clear completed", then reloads | the text reads "2 items left" before the click, after the click and after the reload; the list reads `[C, A]`                               |

## Function contracts

```ts
// src/lib/todo-count.ts (no server-only: pure, importable from a client component; no Prisma)
export function countRemaining(todos: readonly { readonly completed: boolean }[]): number; // the number of entries whose completed is false; 0 for []; does not modify its input
export function remainingLabel(count: number): string; // `${count} item left` when count === 1, otherwise `${count} items left`
// src/components/remaining-count.tsx (no state, no events: a Server Component)
export function RemainingCount({ count }: { readonly count: number }): ReactNode; // renders one <p> whose text is remainingLabel(count)
// src/app/page.tsx: renders <RemainingCount count={countRemaining(todos)} /> outside the <ul>, in both states, from the same listTodos() result (no second query)
```

No Server Action, no Zod schema, no Prisma model and no change to `src/lib/todos.ts` or `src/actions/todos.ts`: the
count is a read, derived from the list the page already holds. `countRemaining` takes the whole stored list (REQ-13.5).

## Out of scope

Counting the completed todos, a count per filter or per search result, a plural form other than "item"/"items",
live announcement to assistive technology (`role="status"`, `aria-live`), a count in the page title, counting from
two tabs at once, a count that updates before the Server Action resolves (optimistic update).

## Unchanged behavior

| Behavior                                                     | Proof                                                                                                                                 |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| The empty list still shows "No todos yet", "New todo", "Add" | `e2e/05-todos.spec.ts` :: "AC-5.7: an empty list shows "No todos yet" with the New todo box and the Add button"                       |
| The list is still newest first                               | `e2e/05-todos.spec.ts` :: "AC-5.1: lists todos newest first"                                                                          |
| Created todos survive a reload                               | `e2e/05-todos.spec.ts` :: "AC-5.6: a created todo survives a reload, and so does its toggled state"                                   |
| Toggling still inverts and stores                            | `src/lib/todos.test.ts` :: "AC-5.4: inverts completed and stores it, twice in a row"                                                  |
| "Clear completed" is still enabled once a todo is completed  | `e2e/09-clear-completed.spec.ts` :: "AC-9.2: the button is enabled once a todo is completed"                                          |
| Clearing still keeps the open todos in order after a reload  | `e2e/09-clear-completed.spec.ts` :: "AC-9.3: clicking removes the completed todos and the rest keep their order after a reload"       |
| A row exposes its title as the checkbox name                 | `src/components/todo-item.test.tsx` :: "AC-5.1: renders the title as the accessible name of an unchecked checkbox when not completed" |
