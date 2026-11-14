# §34 Todos: the remaining count is announced to assistive technology

Tier: full

- [ ] Lead approves spec

## Intent

A person who uses a screen reader hears how many todos are still open when that number changes, and hears "All done"
when nothing is left, without moving focus to the text. A person who does not use one sees exactly the text of §13 and
§22 that they saw before.

## Requirements (EARS)

| ID       | Pattern      | Requirement                                                                                                                                                                                                                              |
| -------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| REQ-34.1 | Ubiquitous   | THE SYSTEM SHALL put the §13 paragraph ("N item left" / "N items left") and, while it is shown, the §22 message ("All done") inside exactly one element with `role="status"`, on `/`, in every state.                                    |
| REQ-34.2 | Ubiquitous   | THE SYSTEM SHALL render that element for every count, 0 included, so that the element exists before a change and a change of its text is what is announced.                                                                              |
| REQ-34.3 | State-driven | WHILE the count changes between renders in the same page THE SYSTEM SHALL keep the same element, changing only its contents, so that the change is announced and the element is not replaced.                                            |
| REQ-34.4 | Ubiquitous   | THE SYSTEM SHALL keep the element polite: no `aria-live` attribute other than the one `role="status"` implies, no `role="alert"`, so that a change does not interrupt the person.                                                        |
| REQ-34.5 | Ubiquitous   | THE SYSTEM SHALL change no visible text and no other behavior of §13 and §22: the paragraph stays the only paragraph reading the count, "All done" stays a non-paragraph with no role of its own, and neither is a list item or control. |

The element's accessible content is the text of §13 and §22 only. No prop is added to `RemainingCount` and no text is
added for assistive technology alone.

## Acceptance criteria

| ID      | Covers                       | Given                                                                     | When                                              | Then (measurable)                                                                                                                                                                                                                                                                           |
| ------- | ---------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-34.1 | REQ-34.1, REQ-34.2, REQ-34.4 | `<RemainingCount count={0} />` rendered                                   | the component renders                             | exactly 1 element of role `status`, containing the paragraph "0 items left" and exactly 1 element with the text "All done"; 0 elements with `aria-live="assertive"`; 0 `alert` roles                                                                                                        |
| AC-34.2 | REQ-34.1, REQ-34.2, REQ-34.5 | `<RemainingCount>` rendered with count 1, then 2, then 11 (three renders) | the component renders each time                   | each render has exactly 1 element of role `status` containing exactly 1 paragraph reading "1 item left", "2 items left", "11 items left" respectively; 0 elements with the text "All done"; 0 `alert` roles                                                                                 |
| AC-34.3 | REQ-34.3                     | `<RemainingCount count={1} />` rendered, its `status` element held        | it is re-rendered with count 0, then with count 2 | after each re-render the `status` element found is the held node (`toBe`); it reads "0 items left" with "All done" after the first, "2 items left" without "All done" after the second                                                                                                      |
| AC-34.4 | REQ-34.1, REQ-34.2, REQ-34.5 | no stored todo, the browser on `/`                                        | `/` renders                                       | exactly 1 element of role `status` whose text contains "0 items left" (the other `status` elements of the page, if any, are not counted); it contains exactly 1 "All done"; 0 `listitem` roles                                                                                              |
| AC-34.5 | REQ-34.3                     | stored todos C (open), B (done), the browser on `/` (client hydrated)     | the person checks C, then unchecks C              | the `status` element whose text contains "items left" or "item left" is the same node before and after (marked with a data attribute from the test); it reads "1 item left" before, "0 items left" with "All done" after the check, "1 item left" after the uncheck; 0 document navigations |
| AC-34.6 | REQ-34.1, REQ-34.5           | stored todos B (done), A (done), the browser on `/?filter=active`         | `/` renders                                       | 0 `listitem` roles; exactly 1 `status` element containing "0 items left" and exactly 1 "All done" (§13 REQ-13.5, §22 REQ-22.7)                                                                                                                                                              |

## Function contracts

```ts
// src/components/remaining-count.tsx (§13 and §22 module; still a Server Component: no state, no events)
export function RemainingCount({ count }: { readonly count: number }): ReactNode; // props unchanged; renders one <div role="status"> that contains the §13 <p> whose text is remainingLabel(count) and, when allDoneMessage(count) is defined, the §22 non-<p> element whose text is that message
```

No Server Action, no Zod schema, no Prisma model, no new query, no new export, and no change to `src/lib/todo-count.ts`,
`src/app/page.tsx`, `src/lib/todos.ts`, `src/actions/todos.ts` or any other component.

## Out of scope

A visible live-region style, an assertive announcement (`role="alert"`, `aria-live="assertive"`), a text that only
assistive technology reads, announcing the overdue count (§23, another section), announcing the filter links' counts
(§30), the character counter (§18 REQ-18.8 keeps it silent), announcing a failed mutation (§10), a count that updates
before the Server Action resolves.

## Unchanged behavior

| Behavior                                                 | Proof                                                                                                                                                                                                                         |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Zero still reads "0 items left" as the only paragraph    | `src/components/remaining-count.test.tsx` :: "AC-13.2: renders one paragraph reading "0 items left" for a count of 0"                                                                                                         |
| One still reads "1 item left" as the only paragraph      | `src/components/remaining-count.test.tsx` :: "AC-13.2: renders one paragraph reading "1 item left" for a count of 1"                                                                                                          |
| "All done" is still a non-paragraph without a role       | `src/components/remaining-count.test.tsx` :: "AC-22.2: renders one paragraph reading "0 items left" and exactly one "All done" that is not a paragraph, list item, button, link or alert for a count of 0"                    |
| No "All done" for a non-zero count                       | `src/components/remaining-count.test.tsx` :: "AC-22.3: renders exactly one paragraph reading "1 item left", "2 items left", "11 items left" and no "All done" for counts 1, 2, 11"                                            |
| The count still updates without navigation               | `e2e/13-remaining-count.spec.ts` :: "AC-13.5: the text reads "0 items left", then "1 item left" after adding A, then "2 items left" after adding B, with no navigation"                                                       |
| An empty list still shows "0 items left" and "All done"  | `e2e/22-all-done.spec.ts` :: "AC-22.5: an empty list shows exactly one "0 items left", one "No todos yet" and one "All done", and no listitem"                                                                                |
| A filter still leaves the count and "All done" unchanged | `e2e/22-all-done.spec.ts` :: "AC-22.7: B, A done on /?filter=active and /?q=zzz show no listitem, one "0 items left" and one "All done"; B open, A done on /?filter=completed read [A], one "1 item left" and no "All done""` |
