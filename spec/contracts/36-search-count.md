# §38 Todos: the search form says how many todos match

Tier: full

- [ ] Lead approves spec

## Intent

A person who searched the list (§16) learns from one short line in the search form how many todos the page now shows,
without counting the rows. The number is the size of the list on screen under the chosen All / Active / Completed view
and the search. When nothing matches, the existing "No todos match your search" message already says so and nothing is
added. The line is read when the page is read; it is not announced.

## Requirements (EARS)

| ID       | Pattern           | Requirement                                                                                                                                                                                                                                                                                                                                                      |
| -------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| REQ-38.1 | State-driven      | WHILE a search is in effect (§21 `isSearchInEffect`) and `count` is a whole number of at least 1 THE SYSTEM SHALL show inside the search form of §16, after every other child of the form, exactly one paragraph (`<p>`) whose text is `1 match` when `count` is 1 and `n matches` otherwise, n written without padding or separators.                           |
| REQ-38.2 | Ubiquitous        | THE SYSTEM SHALL pass to the form the number of todos the page lists, which is `shown.length` of `src/app/page.tsx` (the stored todos after the filter of §12 and the search of §16), so that the count equals the number of list items shown.                                                                                                                   |
| REQ-38.3 | Unwanted behavior | IF no search is in effect (REQ-16.4, §21 REQ-21.2), or `count` is 0, absent, negative or not a whole number THEN THE SYSTEM SHALL add no paragraph and no text to the form; at 0 the message "No todos match your search" (§16 REQ-16.8) stands alone, and no search in effect leaves the form as §16 and §21 specify.                                           |
| REQ-38.4 | Ubiquitous        | THE SYSTEM SHALL write a text that is never equal to "No todos match your search", "No todos yet", "N items left" (§13), "All done" (§22), "N overdue" (§23) or "n / 200" (§18), and SHALL give the paragraph no `id`, no `role`, no `aria-live`, no `aria-atomic` and no `aria-label`: it is not a live region, and it is not a landmark, a status or an alert. |
| REQ-38.5 | Event-driven      | WHEN a todo is created, toggled, edited, deleted, cleared or marked complete (§5, §6, §9, §14, §19) while a search is in effect THE SYSTEM SHALL show the count of the new list in the same page without a full reload (§16 REQ-16.10 applies the search to the stored todos), and a full page reload SHALL show the same text.                                  |
| REQ-38.6 | Ubiquitous        | THE SYSTEM SHALL NOT, by showing the count, change any stored todo, the order of §5, the remaining count (§13), the enabled state of "Clear completed" (§12) and of "Mark all complete" (§14), or the label, search box, "Search" button, hidden `filter` input and "Clear search" link of §16 and §21.                                                          |
| REQ-38.7 | Optional feature  | WHERE `TodoSearchForm` is given no `count` THE SYSTEM SHALL render exactly the markup of §16, §21, §25 and §27, so that a render without the prop is the render those sections test.                                                                                                                                                                             |

Where the count sits, since the position is part of the contract: it is the last child of the `<form role="search">`,
after the "Search" button and, while a search is in effect, after the "Clear search" link (§21 REQ-21.1 keeps the link
after the button). The paragraph is rendered by `TodoSearchForm`, so it has the form as its ancestor and the landmark
`search` contains it. It is a `<p>` with the visible text only: no wrapper, no icon, no visually hidden part, no
`title`. Its class names are the builder's choice (the Tailwind classes of the neighbouring text, for example); a
class name is not asserted.

"A search is in effect" has one definition, §21's (`isSearchInEffect(query)`: the trimmed `q` is not empty). A query
longer than 200 characters is in effect and matches nothing (REQ-16.5), so `count` is 0 and nothing is added. The count
is not the number of stored todos: unlike the remaining count (§13), the "Mark all complete (n)" label (§36) and the
filter counts (§30), which read the stored todos (REQ-16.9), it follows the filter and the search, because it describes
the list on screen. The page already holds the number: `shown.length`, and no second query, no new `src/lib` function
and no new text helper is added. The two forms of the word are decided inline by `count === 1`.

Exact-text collisions that were checked (the e2e files find these by exact text or by pattern): `1 match` and
`n matches` equal none of `No todos match your search` (e2e §16, §21, §22), `No todos yet`, `0 items left`,
`2 items left` (e2e §13, §16, §21, §26), `All done`, `Overdue`, `Due today`, `N overdue`, nor match the patterns
`/^\d+ items? left$/` (e2e §23, §33) and `/^\d+ \/ 200$/` (e2e §18, §29). The paragraph contains the words "match" and
"matches" only as its own whole text, and none of those tests matches by a substring of them.

## Acceptance criteria

| ID      | Covers                       | Given                                                                                                                                                                                           | When                                                                                  | Then (measurable)                                                                                                                                                                                                                                                                                                                                                                   |
| ------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-38.1 | REQ-38.1, REQ-38.4           | `TodoSearchForm` rendered with filter `all`, query `milk` and `count` 3                                                                                                                         | the component renders                                                                 | the search landmark holds exactly 1 `p` whose text is exactly "3 matches"; it is the form's last child, after the link "Clear search"; it has 0 attributes `id`, `role`, `aria-live`, `aria-atomic` and `aria-label`; the document has 0 elements with role `status`, `alert` or `log`                                                                                              |
| AC-38.2 | REQ-38.1                     | the component rendered with query `milk`, filter `active` and `count` 1; then with `count` 2; then with `count` 11                                                                              | the component renders each time                                                       | the landmark's `p` reads exactly "1 match", "2 matches", "11 matches", 1 `p` each time                                                                                                                                                                                                                                                                                              |
| AC-38.3 | REQ-38.3, REQ-38.7           | the component rendered with (query `milk`, `count` 0), (query `milk`, no `count`), (query `''`, `count` 3), (query `'   '`, `count` 3), (query `milk`, `count` -1), (query `milk`, `count` 1.5) | the component renders each time                                                       | 0 `p` elements in the document each time, and each `container.innerHTML` equals that of the render with the same filter and query and no `count` prop                                                                                                                                                                                                                               |
| AC-38.4 | REQ-38.6                     | the component rendered with filter `completed`, query `milk` and `count` 2                                                                                                                      | the component renders                                                                 | the landmark still holds exactly 1 searchbox "Search todos" with value `milk`, 1 submit button "Search", 1 link "Clear search" with href `/?filter=completed`, 1 hidden input `filter` with value `completed`, 0 list items                                                                                                                                                         |
| AC-38.5 | REQ-38.1, REQ-38.2, REQ-38.3 | stored todos D "Buy milk" (open), C "Milkshake" (done), B "Call mom" (open), A "Walk the dog" (done), the browser on `/`                                                                        | `/?q=milk`, `/?filter=active&q=milk`, `/?q=zzz`, `/`, `/?q=%20%20` are opened in turn | the text "2 matches" (exact) appears once and rows are [D, C]; "1 match" once and rows [D]; on `/?q=zzz` 0 rows, "No todos match your search" once, 0 texts `N match` or `N matches`; on `/` and `/?q=%20%20` 4 rows and 0 such texts; on `/?q=milk` "2 items left" appears once beside "2 matches", and in all five addresses the number in a count text equals the number of rows |
| AC-38.6 | REQ-38.5                     | stored todos as in AC-38.5, the browser on `/?filter=active&q=milk` (client hydrated), rows [D], text "1 match"                                                                                 | the person ticks D, then reloads, then opens `/?q=milk`                               | after the tick: 0 rows, "No todos match your search" once, 0 count texts, 0 document navigations; the same after the reload; on `/?q=milk` rows [D, C] and "2 matches" once                                                                                                                                                                                                         |
| AC-38.7 | REQ-38.6                     | the stored todos of AC-38.5 and a snapshot of their titles and completed flags                                                                                                                  | `/?q=milk` is opened and `/?q=zzz` is opened                                          | the titles and flags equal the snapshot, "Mark all complete" and "Clear completed" are enabled and the "N items left" text is unchanged between the two addresses (REQ-16.9)                                                                                                                                                                                                        |

## Function contracts

```ts
// src/components/todo-search-form.tsx (§16, §21, §25, §27, extended by §38; already 'use client'; one optional prop added)
export function TodoSearchForm({
  filter,
  query,
  count,
}: {
  readonly filter: TodoFilter;
  readonly query: string;
  readonly count?: number;
}): ReactNode; // as §16/§21/§25/§27; when isSearchInEffect(query) and Number.isInteger(count) and count >= 1: as the last child of the <form>, <p>{count === 1 ? '1 match' : `${count} matches`}</p> with no id, role or aria-*; otherwise nothing is added
// src/app/page.tsx: renders <TodoSearchForm filter={filter} query={query} count={shown.length} /> where shown = searchTodos(filterTodos(todos, filter), query); nothing else changes
```

No Server Action, Zod schema, Prisma model, query, `src/lib` function or environment variable is added.
`src/lib/todo-search.ts`, `src/lib/clear-search.ts`, `src/lib/filter-counts.ts`, `src/lib/todos.ts`,
`src/components/remaining-count.tsx` and `src/actions/todos.ts` do not change.

### Edits to other sections (D-37)

- §16 (`14-search.md`): "counts of matches" is lifted from its Out of scope, and its `TodoSearchForm` contract gains the
  optional `count` prop of this section. REQ-16.1 to REQ-16.10 and AC-16.x are unchanged.
- REQ-25.6 (`23-search-shortcut.md`) and its contract line limit the shortcut's own change ("the shortcut adds no
  visible text"). They do not apply to the paragraph of REQ-38.1, which is not added by the shortcut. The shortcut itself
  is unchanged.
- REQ-27.6 (`25-escape-search.md`) and its contract line limit Escape's own change ("no visible text is added"). They
  do not apply to the paragraph of REQ-38.1, which Escape does not add. Escape itself is unchanged.
- §21 (`19-clear-search.md`): its prose line "The text `Clear search` is the only visible text added", its contract line
  for `TodoSearchForm` (signature without `count`) and its Out of scope "a count of the matches cleared" do not apply to
  the paragraph of REQ-38.1. The link, its position after the "Search" button and its address are unchanged.

The "Clear search" link is a link, and the count is a paragraph, so no query by role `link` or `button` meets it. The
count is not the "count of the matches cleared" (a message after following the link): nothing is shown after the click.

## Out of scope

A count while no search is in effect, a count of the stored todos that match regardless of the filter, "1 of n" or
"showing n of m", a message at 0 (the §16 message stands alone), announcing the count to assistive technology
(`role="status"`, `aria-live`, `aria-atomic`), an id or `aria-describedby` linking the box to the count, a count in the
box's placeholder, a `title` or `aria-label`, highlighting, styling beyond the existing classes, a count inside the
filter links (§30), a change to the page title (§26), a change to the remaining count (§13), "Clear completed" or "Mark
all complete" (§12, §14).

## Unchanged behavior

| Behavior                                                                   | Proof                                                                                                                                                                                                                                                                                                              |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Without `count` the form is §16's, with a landmark, box, button, no items  | `src/components/todo-search-form.test.tsx` :: "AC-16.5: with filter all and query \'\' renders one search landmark, a GET form to /, a "Search todos" searchbox (q, maxlength 200, value \'\'), a submit "Search" button, no list items and no hidden filter input"                                                |
| The hidden filter input follows the filter                                 | `src/components/todo-search-form.test.tsx` :: "AC-16.5: with filter active and query \'milk\' renders one search landmark, a GET form to /, a "Search todos" searchbox (q, maxlength 200, value \'milk\'), a submit "Search" button, no list items and one hidden filter input with value active"                  |
| "Clear search" stays after the button and only while a search is in effect | `src/components/todo-search-form.test.tsx` :: "AC-21.4: with (all, \'\'), (active, \'\'), (completed, \' \') each render has 0 links inside or outside the search landmark, 0 elements with the text "Clear search", exactly 1 search landmark, 1 "Search todos" searchbox and exactly 1 submit "Search" button"   |
| Escape with no search in effect only empties the box                       | `src/components/todo-search-form.test.tsx` :: "AC-27.3: on (all, '') and on (completed, ' ') with zzz typed, Escape in the box each time leaves the value '', defaultPrevented true, 0 links in the document and 0 navigations"                                                                                    |
| The empty result shows the one §16 message                                 | `e2e/16-search.spec.ts` :: "AC-16.6: search narrows to [D, C], Active drops the search and shows [D, B] with an empty box, MILK under Active shows [D] and survives a reload, zzz shows exactly one "No todos match your search", and a blank q shows [D, C, B, A]"                                                |
| The hidden todos still count and enable both buttons                       | `e2e/16-search.spec.ts` :: "AC-16.7: on /?q=milk the hidden todos still count and enable both buttons, a retitled D leaves the list while "2 items left" and the address stay, and "Mark all complete" completes D, C and the hidden B"                                                                            |
| Following "Clear search" shows the full list for the filter                | `e2e/21-clear-search.spec.ts` :: "AC-21.5: on /?q=milk one link and [D, C]; the click opens exactly / with [D, C, B, A], an empty box and no link; /?filter=active&q=milk shows [D]; the click opens exactly /?filter=active with [D, B], an empty box, no link and "Active" current, and the same after a reload" |
