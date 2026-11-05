# §26 Todos: the browser tab title shows the remaining count

Tier: full

- [ ] Lead approves spec

## Intent

A person who leaves the list open in a background tab reads from the tab's title how many todos are still open,
without switching to it. The number is the one §13 shows on the page, and it is right after a reload and after every
change the person makes in the tab.

## Requirements (EARS)

| ID       | Pattern      | Requirement                                                                                                                                                                                             |
| -------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| REQ-26.1 | State-driven | WHILE at least one stored todo is not completed THE SYSTEM SHALL set the document title of `/` to `(N) Todos`, N being the number of such todos in decimal digits with no separator and no upper limit. |
| REQ-26.2 | State-driven | WHILE no stored todo is open (none stored, or every one completed) THE SYSTEM SHALL set the document title of `/` to `Todos`, with no `(0)`.                                                            |
| REQ-26.3 | Ubiquitous   | THE SYSTEM SHALL take N from `countRemaining` (§13) over every stored todo, so the title equals the number in "N items left" and ignores the filter (§12) and the search (§16) in the address.          |
| REQ-26.4 | Event-driven | WHEN a person creates, toggles, deletes or completes todos (§5, §14, §19) or clears the completed ones (§9) THE SYSTEM SHALL show the new title in the same tab without a full reload.                  |
| REQ-26.5 | Ubiquitous   | THE SYSTEM SHALL derive the title from the stored todos on every request, so that a full page reload shows the title of the todos that are open then.                                                   |
| REQ-26.6 | Ubiquitous   | THE SYSTEM SHALL change no visible text, no markup and no other route: the title of any route other than `/` stays the one of `src/app/layout.tsx`.                                                     |

The word "Todos" is the one in the page heading (§7). The title carries no other text and the count is the only part
that varies.

## Acceptance criteria

| ID      | Covers                       | Given                                                                                      | When                                                              | Then (measurable)                                                                                                                                              |
| ------- | ---------------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-26.1 | REQ-26.1, REQ-26.2           | counts 0, 1, 2, 11, 1000                                                                   | `pageTitle(count)` runs on each                                   | `"Todos"`, `"(1) Todos"`, `"(2) Todos"`, `"(11) Todos"`, `"(1000) Todos"`                                                                                      |
| AC-26.2 | REQ-26.1, REQ-26.3           | `listTodos()` resolves open, done, open, done, open                                        | `generateMetadata()` of `src/app/page.tsx` runs                   | the resolved object's `title` is exactly `"(3) Todos"`                                                                                                         |
| AC-26.3 | REQ-26.2                     | `listTodos()` resolves (a) `[]`, (b) two done todos                                        | `generateMetadata()` runs on each                                 | (a) `title` is exactly `"Todos"`, (b) `title` is exactly `"Todos"`                                                                                             |
| AC-26.4 | REQ-26.3                     | stored todos C (open), B (done), A (open); the browser on `/?filter=completed`             | the page loads                                                    | `document.title` is `"(2) Todos"` and exactly one element reads "2 items left"; on `/?q=zzz` the title is still `"(2) Todos"`                                  |
| AC-26.5 | REQ-26.4                     | an empty list shown in the browser                                                         | the person adds "A", then "B", then checks "A"                    | `document.title` reads `"Todos"` before, `"(1) Todos"` after "A", `"(2) Todos"` after "B", `"(1) Todos"` after the check, with no navigation between the steps |
| AC-26.6 | REQ-26.4, REQ-26.5           | stored todos C (open), B (done), A (open) shown in the browser                             | the person clicks "Clear completed", then reloads                 | `document.title` reads `"(2) Todos"` before the click, after the click and after the reload                                                                    |
| AC-26.7 | REQ-26.2, REQ-26.5, REQ-26.6 | stored todos B (done), A (done); the browser on `/`; separately a request to `/api/health` | the page loads; the person reloads; the health route is requested | `document.title` is `"Todos"` on load and after the reload; the `/api/health` response is unchanged (`src/app/api/health/route.test.ts` still green)           |

## Function contracts

```ts
// src/lib/page-title.ts (no server-only: pure, no Prisma)
export function pageTitle(remaining: number): string; // `(${remaining}) Todos` when remaining >= 1, otherwise `Todos`; does not throw
// src/app/page.tsx: gains
export async function generateMetadata(): Promise<Metadata>; // { title: pageTitle(countRemaining(await listTodos())) }; no other field (the layout's description stays)
```

No Server Action, Zod schema, Prisma model, environment variable or change to `src/lib/todos.ts`,
`src/lib/todo-count.ts` or `src/app/layout.tsx`. The page component and `generateMetadata` each read the list.

## Out of scope

A count in the favicon or an app badge, a title that names the filter or the search, a title for another route, an
overdue count in the title (§23), a notification or sound when the count changes, localisation, a plural form,
counting from two tabs at once, a title that changes before the Server Action resolves, abbreviating large counts.

## Unchanged behavior

| Behavior                                                  | Proof                                                                                                                                               |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| The remaining count text is still derived from every todo | `e2e/13-remaining-count.spec.ts` :: "AC-13.4: C (open), B (done), A (open) show exactly one "2 items left" and 3 listitems, none of them the count" |
| The empty list still shows the count and "No todos yet"   | `e2e/13-remaining-count.spec.ts` :: "AC-13.3: an empty list shows exactly one "0 items left" and one "No todos yet", and no listitem"               |
| `countRemaining` still counts the open todos only         | `src/lib/todo-count.test.ts` :: "AC-13.1: returns 3 for open, done, open, done, open and leaves the input unchanged"                                |
| The home page still renders the heading                   | `e2e/smoke.spec.ts` :: "home page renders the lab title"                                                                                            |
| The empty list still shows "No todos yet"                 | `e2e/05-todos.spec.ts` :: "AC-5.7: an empty list shows "No todos yet" with the New todo box and the Add button"                                     |
