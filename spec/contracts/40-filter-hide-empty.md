# §42 Todos: the filter nav hides a link whose count is 0

Tier: full

- [ ] Lead approves spec

## Intent

A person looks at the filter links to choose a view, and a view that would list nothing is not offered. A link whose
count is 0 is left out, except the one the person is already on, which stays so the page still says where they are.

## Requirements (EARS)

| ID       | Pattern          | Requirement                                                                                                                                                                                                                                                                                           |
| -------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| REQ-42.1 | Optional feature | WHERE `TodoFilterNav` is given `counts` THE SYSTEM SHALL NOT render a filter's link and its count `<span>` (§30 REQ-30.2) when `counts` holds 0 for that filter and that filter is not `selected`; a link not rendered is absent from the document, not hidden by `hidden`, `aria-hidden` or a style. |
| REQ-42.2 | State-driven     | WHILE a filter is `selected` THE SYSTEM SHALL render its link, marked `aria-current="page"` (§12 REQ-12.7), and its count `<span>`, whatever its count, including `(0)`.                                                                                                                              |
| REQ-42.3 | Ubiquitous       | THE SYSTEM SHALL render the links that remain in the relative order All, Active, Completed, each with the `href` of §12 REQ-12.6 and, directly after it, its count `<span>` reading `(n)`; the links stay outside any list (§12 REQ-12.1).                                                            |
| REQ-42.4 | State-driven     | WHILE all three counts are 0 THE SYSTEM SHALL render in the navigation exactly one link, the `selected` filter's, followed by one `<span>` reading `(0)`.                                                                                                                                             |
| REQ-42.5 | Ubiquitous       | THE SYSTEM SHALL render the `nav` landmark named "Filter todos" in every state, including when it holds one link.                                                                                                                                                                                     |
| REQ-42.6 | Optional feature | WHERE `TodoFilterNav` is given no `counts` THE SYSTEM SHALL render it exactly as §12 specifies: the three links, no count element, none left out (§30 REQ-30.6).                                                                                                                                      |
| REQ-42.7 | Event-driven     | WHEN the counts passed to a mounted `TodoFilterNav` change (§30 REQ-30.4) THE SYSTEM SHALL render the links of the new counts by the same rule, so a link appears when its count rises above 0 and disappears when it falls to 0 and its filter is not `selected`.                                    |

The counts are those of §30 (every stored todo, whatever the filter or the search says), so the same numbers decide which
links are rendered and which are written. The "three numbers" of §30 REQ-30.3 and REQ-30.4 and the three spans of §30's
criteria are read as "the number of each link §42 renders".

Edits to other sections that this one makes:

- §12 REQ-12.1 and AC-12.7: the navigation is shown in every state, and its links are those §42 renders.
- §30 REQ-30.1, REQ-30.5, AC-30.3, AC-30.6, AC-30.7: counts are shown next to the links §42 renders; the rewritten
  criteria name which spans remain.
- §30's Out of scope "hiding a zero count" is lifted.
- The sentences "`src/components/todo-filter-nav.tsx` does not change" of §16 (`14-search.md`) and §21
  (`19-clear-search.md`) limit those sections' own change; they do not apply to §42.
- Unchanged: §30 REQ-30.6 and §12 AC-12.4 (the nav without `counts`), §30 REQ-30.2, REQ-30.3 and the filter and search
  rules of §12 and §16.

## Acceptance criteria

| ID      | Covers                       | Given                                                                                                                                                                                | When                                                                                                                            | Then (measurable)                                                                                                                                                                                                                                                                                                                                       |
| ------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-42.1 | REQ-42.1, REQ-42.3           | `TodoFilterNav` rendered with `selected` `'all'` and `counts` `{ all: 4, active: 0, completed: 4 }`                                                                                  | the component renders                                                                                                           | 2 `link` roles in the navigation, named "All" and "Completed" with `href` `/` and `/?filter=completed`, each directly followed by a `<span>` reading "(4)"; 0 links named "Active"; 2 `<span>` elements; the navigation's text reads "All(4)Completed(4)"; 0 elements with `hidden` or `aria-hidden` inside it; only "All" has `aria-current="page"`    |
| AC-42.2 | REQ-42.2, REQ-42.3           | `TodoFilterNav` rendered with `counts` `{ all: 3, active: 0, completed: 3 }` and `selected` `'active'`; then with `{ all: 2, active: 2, completed: 0 }` and `selected` `'completed'` | the component renders each time                                                                                                 | first: 3 links in the order "All", "Active", "Completed", spans "(3)", "(0)", "(3)", only "Active" has `aria-current="page"`; second: 3 links in that order, spans "(2)", "(2)", "(0)", only "Completed" has `aria-current="page"`                                                                                                                      |
| AC-42.3 | REQ-42.4, REQ-42.5           | `TodoFilterNav` rendered with `counts` `{ all: 0, active: 0, completed: 0 }` and `selected` `'all'`, then `'active'`, then `'completed'` (a new render each)                         | the component renders each time                                                                                                 | each time 1 `navigation` named "Filter todos" holding exactly 1 link and 1 `<span>` reading "(0)"; the link is named "All", "Active", "Completed" with `href` `/`, `/?filter=active`, `/?filter=completed` and has `aria-current="page"`; 0 `listitem`, 0 `button`                                                                                      |
| AC-42.4 | REQ-42.3, REQ-42.6, REQ-42.7 | `TodoFilterNav` rendered with `selected` `'completed'` and `counts` `{ all: 5, active: 0, completed: 5 }`                                                                            | it is re-rendered with `{ all: 5, active: 1, completed: 4 }`, then `{ all: 0, active: 0, completed: 0 }`, then with no `counts` | the link names read in turn `["All", "Completed"]`, `["All", "Active", "Completed"]`, `["Completed"]`, `["All", "Active", "Completed"]`; the spans read `["(5)", "(5)"]`, `["(5)", "(1)", "(4)"]`, `["(0)"]`, then none; after the last render the navigation's text reads "AllActiveCompleted"                                                         |
| AC-42.5 | REQ-42.1, REQ-42.7           | only open todos A and B stored (2 open, 0 done), the browser on `/` (client hydrated)                                                                                                | the person clicks "Mark all complete", reloads, then clicks "Clear completed"                                                   | before: links "All", "Active" with spans "(2)", "(2)" and 0 links "Completed"; after "Mark all complete" and after the reload: links "All", "Completed" with spans "(2)", "(2)" and 0 links "Active"; after "Clear completed": exactly 1 link, "All", with 1 span reading "(0)", and "No todos yet" shown; 0 document navigations during the first step |
| AC-42.6 | REQ-42.2, REQ-42.3           | only open todos A and B stored, the browser opens `/?filter=completed`                                                                                                               | `/` renders, then the person clicks "All"                                                                                       | on `/?filter=completed`: links "All", "Active", "Completed" with spans "(2)", "(2)", "(0)", only "Completed" has `aria-current="page"`, "No completed todos" shown; after the click the address is `/`, the links are "All" and "Active" with spans "(2)", "(2)" and 0 links "Completed"                                                                |
| AC-42.7 | REQ-42.4, REQ-42.5           | no stored todo                                                                                                                                                                       | the browser opens `/`, `/?filter=active`, then `/?filter=completed`                                                             | each time 1 navigation named "Filter todos" holding exactly 1 link and 1 span reading "(0)"; the link is "All", "Active", "Completed" in turn and has `aria-current="page"`; "No todos yet" shown; 0 `listitem`                                                                                                                                         |

## Function contracts

```ts
// src/components/todo-filter-nav.tsx (§12, §30, extended; no new export, props unchanged, still no 'use client')
export function TodoFilterNav({
  selected,
  counts,
}: {
  readonly selected: TodoFilter;
  readonly counts?: FilterCounts;
}): ReactNode; // as §30, plus: with counts, a link and its span are not rendered when counts[filter] === 0 and filter !== selected; without counts, as §12
```

The only file of `src/` this section changes is `src/components/todo-filter-nav.tsx`. No new export, Server Action, Zod
schema, Prisma model, query, environment variable, prop or lib function. `src/app/page.tsx` keeps passing
`counts={filterCounts(todos)}` (§30); `src/lib/filter-counts.ts`, `src/lib/todo-filter.ts`, `src/lib/todos.ts` and
`src/actions/todos.ts` keep their contracts.

## Out of scope

Restoring or moving focus when the focused link disappears after a change of counts, announcing a link that appears
or disappears (`role="status"`, `aria-live`), a transition or animation, hiding the nav itself, hiding the current
filter's link, a different order of the links, a count that follows the search (§16), hiding on any other signal than a
count of 0, changing the empty-list texts of §12 REQ-12.8.

## Unchanged behavior

| Behavior                                                           | Proof                                                                                                                                                                                                                                                            |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Without counts the nav shows three links, hrefs and `aria-current` | `src/components/todo-filter-nav.test.tsx` :: "AC-12.4: one "Filter todos" navigation with links All, Active, Completed to /, /?filter=active, /?filter=completed, no list items, and aria-current="page" only on the selected link"                              |
| Without counts there is no span                                    | `src/components/todo-filter-nav-counts.test.tsx` :: "AC-30.4: without counts, 3 links All, Active, Completed, 0 spans inside the navigation, and the navigation reads "AllActiveCompleted""                                                                      |
| With counts all non-zero, 3 links each followed by its span        | `src/components/todo-filter-nav-counts.test.tsx` :: "AC-30.2: 3 links All, Active, Completed to /, /?filter=active, /?filter=completed, each directly followed by a span reading (4), (2), (2), aria-current only on Active, 0 listitem, 0 button, 3 link roles" |
| The counts do not move under a filter or a search                  | `e2e/30-filter-counts.spec.ts` :: "AC-30.5: on /, /?filter=active, /?filter=completed and /?q=zzz the spans read (4), (2), (2) in link order, the links keep their exact names, and the navigation holds 0 list items"                                           |
| Filtering lists the same rows and keeps the order                  | `e2e/12-filter.spec.ts` :: "AC-12.5: All, Active and Completed show [D, C, B, A], [D, B], [C, A] through the address, survive a reload, and an unknown filter shows All"                                                                                         |
