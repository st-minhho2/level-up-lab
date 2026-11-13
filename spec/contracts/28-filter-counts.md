# §30 Todos: show how many todos each filter lists

Tier: full

- [ ] Lead approves spec

## Intent

A person looks at the three filter links and learns, without opening any of them, how many todos each one lists. The
numbers describe the stored list, so they do not move when a filter or a search narrows what is shown.

## Requirements (EARS)

| ID       | Pattern           | Requirement                                                                                                                                                                                                                                     |
| -------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| REQ-30.1 | Ubiquitous        | THE SYSTEM SHALL show on `/`, in every state (empty list included), next to each of the three §12 links one count: the number of stored todos that filter lists, All = every todo, Active = those not completed, Completed = those completed.   |
| REQ-30.2 | Ubiquitous        | THE SYSTEM SHALL write each count as `(n)`, n a whole number of at least 0, in a `<span>` that follows its link inside the "Filter todos" navigation; the link's own text and accessible name stay "All", "Active", "Completed" (§12 REQ-12.1). |
| REQ-30.3 | Unwanted behavior | IF a filter (§12) or a search (§16) hides some or all of the stored todos THEN THE SYSTEM SHALL still count every stored todo, so that neither changes any of the three numbers.                                                                |
| REQ-30.4 | Event-driven      | WHEN a todo is created (§5), toggled (§5), completed in bulk (§14) or cleared (§9) THE SYSTEM SHALL show the three numbers of the new stored list in the same page without a full reload, and a full page reload SHALL show the same.           |
| REQ-30.5 | Ubiquitous        | THE SYSTEM SHALL keep the counts out of the list: no count is a list item, a button or a link, and the §12 links keep their addresses, order and `aria-current` marking.                                                                        |
| REQ-30.6 | Optional feature  | WHERE `TodoFilterNav` is given no counts THE SYSTEM SHALL render the navigation exactly as §12 specifies, with no count element.                                                                                                                |

Counts are computed from the one `listTodos()` result the page already reads (§5); no second query. The three numbers
always satisfy All = Active + Completed.

## Acceptance criteria

| ID      | Covers                       | Given                                                                                                                      | When                                                                               | Then (measurable)                                                                                                                                                                                                                                                                      |
| ------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-30.1 | REQ-30.1                     | todos in order D (open), C (done), B (open), A (done); then `[]`; then one open todo                                       | `filterCounts(todos)` runs on each                                                 | `{ all: 4, active: 2, completed: 2 }`, `{ all: 0, active: 0, completed: 0 }`, `{ all: 1, active: 1, completed: 0 }`; the first input still reads `[D, C, B, A]`                                                                                                                        |
| AC-30.2 | REQ-30.1, REQ-30.2, REQ-30.5 | `TodoFilterNav` rendered with `selected` `'active'` and `counts` `{ all: 4, active: 2, completed: 2 }`                     | the component renders                                                              | 3 links named exactly "All", "Active", "Completed" with `href` `/`, `/?filter=active`, `/?filter=completed`; the 3 `<span>` elements that directly follow them read "(4)", "(2)", "(2)"; only "Active" has `aria-current="page"`; 0 `listitem`, 0 `button` roles, still 3 `link` roles |
| AC-30.3 | REQ-30.2                     | `TodoFilterNav` rendered with `counts` `{ all: 0, active: 0, completed: 0 }`, then `{ all: 12, active: 10, completed: 2 }` | the component renders each time                                                    | the three spans read "(0)", "(0)", "(0)", then "(12)", "(10)", "(2)"                                                                                                                                                                                                                   |
| AC-30.4 | REQ-30.6                     | `TodoFilterNav` rendered with `selected` `'all'` and no `counts`                                                           | the component renders                                                              | 3 links "All", "Active", "Completed"; 0 `<span>` elements inside the navigation; the navigation's text reads "AllActiveCompleted"                                                                                                                                                      |
| AC-30.5 | REQ-30.1, REQ-30.3, REQ-30.5 | stored todos D (open), C (done), B (open), A (done), the browser on `/`                                                    | `/` renders, then `/?filter=active`, `/?filter=completed`, `/?q=zzz` open          | on all four addresses the spans read "(4)", "(2)", "(2)" in link order; "All" and "Active" and "Completed" keep their exact names; 0 `listitem` inside the navigation                                                                                                                  |
| AC-30.6 | REQ-30.4                     | stored todos D (open), C (done), B (open), the browser on `/` (client hydrated)                                            | the person checks D, clicks "Mark all complete", reloads, clicks "Clear completed" | before: "(3)", "(2)", "(1)"; after the check "(3)", "(1)", "(2)"; after "Mark all complete" and after the reload "(3)", "(0)", "(3)"; after "Clear completed" "(0)", "(0)", "(0)"; 0 document navigations during the first two steps                                                   |
| AC-30.7 | REQ-30.1                     | no stored todo, the browser on `/`                                                                                         | `/` renders                                                                        | the three spans read "(0)", "(0)", "(0)" with "No todos yet" shown and 0 `listitem`                                                                                                                                                                                                    |

## Function contracts

```ts
// src/lib/filter-counts.ts (pure: no Prisma, no server-only; importable from a client component)
export interface FilterCounts {
  readonly all: number;
  readonly active: number;
  readonly completed: number;
}
export function filterCounts(todos: readonly { readonly completed: boolean }[]): FilterCounts; // counts every input todo; never mutates
// src/components/todo-filter-nav.tsx (still no 'use client': one optional prop added to §12's component)
export function TodoFilterNav({
  selected,
  counts,
}: {
  readonly selected: TodoFilter;
  readonly counts?: FilterCounts;
}): ReactNode; // with counts: after each <Link> a <span> reading `(n)`, not inside the link; without: as §12
// src/app/page.tsx: renders <TodoFilterNav selected={filter} counts={filterCounts(todos)} /> from the unfiltered, unsearched `todos`; nothing else changes
```

No Server Action, Zod schema, Prisma model or query is added, and `src/lib/todos.ts`, `src/actions/todos.ts` and
`src/lib/todo-filter.ts` do not change.

## Out of scope

A count that follows the search (§16), a count of overdue todos (§23), hiding a zero count, a count inside the link
text, announcing changes to assistive technology (`role="status"`, `aria-live`), a count on any other control ("Clear
completed" count is §32), colour or badge styling beyond the existing nav classes, any filter other than the three of §12.

## Unchanged behavior

| Behavior                                                     | Proof                                                                                                                                                                                                                                   |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The nav renders three links, hrefs and `aria-current` as §12 | `src/components/todo-filter-nav.test.tsx` :: "AC-12.4: one "Filter todos" navigation with links All, Active, Completed to /, /?filter=active, /?filter=completed, no list items, and aria-current="page" only on the selected link"     |
| Filtering lists the same rows and keeps the order            | `src/lib/todo-filter.test.ts` :: "AC-12.1: keeps the todos that match the filter, in input order, and never mutates the input"                                                                                                          |
| The links are found by their exact names                     | `e2e/12-filter.spec.ts` :: "AC-12.5: All, Active and Completed show [D, C, B, A], [D, B], [C, A] through the address, survive a reload, and an unknown filter shows All"                                                                |
| The remaining count still counts stored todos under a search | `e2e/16-search.spec.ts` :: "AC-16.7: on /?q=milk the hidden todos still count and enable both buttons, a retitled D leaves the list while "2 items left" and the address stay, and "Mark all complete" completes D, C and the hidden B" |
