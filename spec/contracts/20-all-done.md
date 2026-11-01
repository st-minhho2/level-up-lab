# §22 Todos: say "all done"

Tier: full

- [x] Lead approves spec (lead, 2026-11-01, plan gate of B4.3)

## Intent

A person who has nothing left to do sees it said in words, next to the count, instead of having to read "0 items
left" and work it out. The words go away as soon as one todo is open again.

## Requirements (EARS)

| ID       | Pattern           | Requirement                                                                                                                                                                                                                                                                |
| -------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| REQ-22.1 | State-driven      | WHILE the remaining count of §13 is 0 THE SYSTEM SHALL show on `/` the text "All done", outside the list.                                                                                                                                                                  |
| REQ-22.2 | State-driven      | WHILE the remaining count of §13 is anything other than 0 THE SYSTEM SHALL NOT show the text "All done".                                                                                                                                                                   |
| REQ-22.3 | Ubiquitous        | THE SYSTEM SHALL keep the §13 text ("N item left" / "N items left") shown, unchanged and as exactly one paragraph, in every state: "All done" accompanies it and never replaces it, and is not itself a paragraph.                                                         |
| REQ-22.4 | Ubiquitous        | THE SYSTEM SHALL show "All done" as plain text: it is not a list item, a button, a link, nor an alert.                                                                                                                                                                     |
| REQ-22.5 | State-driven      | WHILE no todo exists THE SYSTEM SHALL show "All done" together with "0 items left" and "No todos yet" (§13 REQ-13.2): the message depends on the count alone, and an empty list has a count of 0.                                                                          |
| REQ-22.6 | Event-driven      | WHEN a todo is created (§5), toggled (§5), completed in bulk (§14) or cleared (§9) THE SYSTEM SHALL show or remove "All done" to match the new count in the same page without a full reload, and a full page reload SHALL show the same.                                   |
| REQ-22.7 | Unwanted behavior | IF a filter (§12) or a search (§16) hides some or all of the stored todos THEN THE SYSTEM SHALL still decide "All done" from the count of every stored todo (§13 REQ-13.5, §16 REQ-16.9), so that neither a filter nor a search shows it, removes it, or changes its text. |

The message is one constant: `All done` (two words, capital A, no final punctuation). A count that is not 0, such as a
negative or fractional number, does not occur (`countRemaining` returns a whole number of at least 0) and is not
specified.

## Acceptance criteria

| ID      | Covers                       | Given                                                                                                                                    | When                                                                                                | Then (measurable)                                                                                                                                                                                                                                                                                                                                                                                         |
| ------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-22.1 | REQ-22.1, REQ-22.2           | counts 0, 1, 2, 11                                                                                                                       | `allDoneMessage(count)` runs on each                                                                | `"All done"`, `undefined`, `undefined`, `undefined`                                                                                                                                                                                                                                                                                                                                                       |
| AC-22.2 | REQ-22.1, REQ-22.3, REQ-22.4 | `<RemainingCount count={0} />` rendered                                                                                                  | the component renders                                                                               | exactly 1 `paragraph` role, reading "0 items left"; exactly 1 element with the text "All done", whose tag name is not `P`; 0 `listitem`, 0 `button`, 0 `link`, 0 `alert` roles                                                                                                                                                                                                                            |
| AC-22.3 | REQ-22.2, REQ-22.3           | `<RemainingCount>` rendered with count 1, then 2, then 11 (three renders)                                                                | the component renders each time                                                                     | each render has exactly 1 `paragraph` role, reading "1 item left", "2 items left", "11 items left" respectively; 0 elements with the text "All done"                                                                                                                                                                                                                                                      |
| AC-22.4 | REQ-22.1, REQ-22.3, REQ-22.4 | stored todos B (done), A (done), the browser on `/`                                                                                      | `/` renders                                                                                         | exactly one element with the text "0 items left" and exactly one with "All done"; 2 `listitem` roles, none containing the text "All done"                                                                                                                                                                                                                                                                 |
| AC-22.5 | REQ-22.5                     | no stored todo, the browser on `/`                                                                                                       | `/` renders                                                                                         | exactly one element with the text "0 items left", exactly one with "No todos yet" and exactly one with "All done"; 0 `listitem` roles                                                                                                                                                                                                                                                                     |
| AC-22.6 | REQ-22.2, REQ-22.6           | stored todos C (open), B (done), the browser on `/` (client hydrated)                                                                    | the person checks C, unchecks C, clicks "Mark all complete", reloads, then clicks "Clear completed" | "1 item left" and 0 "All done" before; after the check "0 items left" and exactly one "All done"; after the uncheck "1 item left" and 0 "All done"; after "Mark all complete" and after the reload "0 items left" and exactly one "All done"; after "Clear completed" exactly one "0 items left", one "All done" and one "No todos yet", 0 `listitem`; 0 document navigations during the first four steps |
| AC-22.7 | REQ-22.2, REQ-22.7           | (a) stored todos B (done), A (done), on `/?filter=active` and on `/?q=zzz`; (b) stored todos B (open), A (done), on `/?filter=completed` | `/` renders in each                                                                                 | (a) on both addresses 0 `listitem`, exactly one "0 items left" and exactly one "All done" (with "No active todos" and "No todos match your search" respectively); (b) rows read `[A]`, exactly one "1 item left" and 0 "All done"                                                                                                                                                                         |

## Function contracts

```ts
// src/lib/todo-count.ts (§13 module, no server-only: pure, importable from a client component; §22 adds one export, countRemaining and remainingLabel are unchanged)
export function allDoneMessage(count: number): string | undefined; // 'All done' when count === 0, otherwise undefined
// src/components/remaining-count.tsx (no state, no events: a Server Component; the only file of the UI that §22 changes)
export function RemainingCount({ count }: { readonly count: number }): ReactNode; // props unchanged; renders the §13 <p> whose text is remainingLabel(count), and, when allDoneMessage(count) is defined, one sibling element that is not a <p>, <li>, <button>, <a> and has no role, whose text is that message
// src/app/page.tsx: unchanged; still renders <RemainingCount count={countRemaining(todos)} /> outside the <ul>, in both states, from the same listTodos() result (no second query)
```

No Server Action, no Zod schema, no Prisma model, no new query, no prop added to `RemainingCount` and no change to
`src/app/page.tsx`, `src/lib/todos.ts`, `src/actions/todos.ts`, `src/components/todo-item.tsx`,
`src/components/todo-search-form.tsx`, `src/lib/todo-search.ts` or any package guide. The component receives the
count only, so it cannot tell an empty list from a fully completed one (REQ-22.5 names that consequence): "All done"
is vacuously true when nothing is stored.

## Out of scope

Hiding the message on an empty list (needs the stored total in the component, hence a change to `src/app/page.tsx`
that D-24 rules out for this batch), a different text for a filtered or searched view, a celebration, icon, colour or
animation, replacing "0 items left", live announcement to assistive technology (`role="status"`, `aria-live`, as in
§13), a "mark all active again" control, a message in the page title, any count that is negative or fractional.

## Unchanged behavior

| Behavior                                                        | Proof                                                                                                                                                                                                                                   |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Zero still reads "0 items left" as the only paragraph           | `src/components/remaining-count.test.tsx` :: "AC-13.2: renders one paragraph reading "0 items left" for a count of 0"                                                                                                                   |
| One and two still read "1 item left" and "2 items left"         | `src/components/remaining-count.test.tsx` :: "AC-13.2: renders one paragraph reading "1 item left" for a count of 1"                                                                                                                    |
| The label for 11 is still plural                                | `src/lib/todo-count.test.ts` :: "AC-13.2: returns "11 items left" for 11"                                                                                                                                                               |
| The count still skips completed todos and leaves its input      | `src/lib/todo-count.test.ts` :: "AC-13.1: returns 3 for open, done, open, done, open and leaves the input unchanged"                                                                                                                    |
| An empty list still shows exactly one "0 items left"            | `e2e/13-remaining-count.spec.ts` :: "AC-13.3: an empty list shows exactly one "0 items left" and one "No todos yet", and no listitem"                                                                                                   |
| The count still updates without navigation                      | `e2e/13-remaining-count.spec.ts` :: "AC-13.5: the text reads "0 items left", then "1 item left" after adding A, then "2 items left" after adding B, with no navigation"                                                                 |
| "Clear completed" still leaves the count right after a reload   | `e2e/13-remaining-count.spec.ts` :: "AC-13.7: the text reads "2 items left" before "Clear completed", after it and after a reload, and the list reads [C, A]"                                                                           |
| A hidden todo still counts under a search                       | `e2e/16-search.spec.ts` :: "AC-16.7: on /?q=milk the hidden todos still count and enable both buttons, a retitled D leaves the list while "2 items left" and the address stay, and "Mark all complete" completes D, C and the hidden B" |
| The empty list still shows "No todos yet" with the form         | `e2e/05-todos.spec.ts` :: "AC-5.7: an empty list shows "No todos yet" with the New todo box and the Add button"                                                                                                                         |
| An empty view still reads its own message under each filter     | `e2e/12-filter.spec.ts` :: "AC-12.7: an empty view keeps the three filter links, shows no list items and reads "No todos yet", "No completed todos" or "No active todos""                                                               |
| "Mark all complete" still completes the open todos after reload | `e2e/14-complete-all.spec.ts` :: "AC-14.6: C (open), B (done), A (open): the button is enabled, and after the click and after a reload the list reads [C, B, A], all 3 checked, the button disabled"                                    |
