# §33 Todos: announce the overdue count to assistive technology

Tier: full

- [ ] Lead approves spec

## Intent

A person who uses a screen reader hears the number of overdue todos (§23) change when it changes, without moving
focus to it. What a sighted person sees is exactly what §23 shows: the same text, hidden when nothing is late.

## Requirements (EARS)

| ID       | Pattern           | Requirement                                                                                                                                                                                                                                                             |
| -------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| REQ-33.1 | Ubiquitous        | THE SYSTEM SHALL give the one element of §23 REQ-23.7 the attribute `role="status"` (a polite live region), and no `aria-label`, no `aria-live` and no `aria-atomic` attribute.                                                                                         |
| REQ-33.2 | State-driven      | WHILE N (§23) is 0, or the day has not been read yet, THE SYSTEM SHALL still render that element, empty: no text and no child node, so a region exists in the document before its first change.                                                                         |
| REQ-33.3 | Ubiquitous        | THE SYSTEM SHALL keep the visible text of §23 unchanged: `N overdue` for N of at least 1 (§23 `overdueLabel`) and no text at 0.                                                                                                                                         |
| REQ-33.4 | Event-driven      | WHEN N changes (§23 REQ-23.4), including from or to 0, THE SYSTEM SHALL change the text of the same element node in place; THE SYSTEM SHALL NOT remove it from the document and insert another.                                                                         |
| REQ-33.5 | Ubiquitous        | THE SYSTEM SHALL render the same markup on the server and in the browser's first render, the empty element of REQ-33.2, and add the text only after hydration (§23 REQ-23.5), so that no hydration mismatch occurs and the server's output does not depend on the date. |
| REQ-33.6 | Unwanted behavior | IF the page is open across the browser's local midnight THEN THE SYSTEM SHALL announce nothing because of the date: no timer or listener is added (§23 REQ-23.6).                                                                                                       |

The element stays a `<span>` outside the list, after the §13 paragraph, not a `<p>`, `<li>`, `<button>`, `<a>` (§23
REQ-23.7). §23 REQ-23.7 and AC-23.3 no longer say "no role": the element's role is REQ-33.1's. The rest of §23 holds, except
that the element renders (empty) while N is 0 or the day is unread (REQ-33.2). A region that is empty at load is not announced then; a later change is.

## Acceptance criteria

| ID      | Covers               | Given                                                                                                                                                                                                         | When                                                                                        | Then (measurable)                                                                                                                                                                                                                                                                                                                      |
| ------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-33.1 | REQ-33.1, REQ-33.3   | system time set to the local `new Date(2026, 10, 1, 12, 0, 0)`; `<OverdueCount todos={…}>` with 2 overdue todos, 1 due today, 1 done and past due, 1 without a date                                           | it renders and the effects have run                                                         | exactly 1 element with role `status`, a `SPAN`, whose text is `2 overdue`, with `role="status"` and no `aria-label`, `aria-live` or `aria-atomic` attribute; 0 `paragraph`, 0 `listitem`, 0 `button`, 0 `link`, 0 `alert` roles; the container's text content is exactly `2 overdue`                                                   |
| AC-33.2 | REQ-33.2, REQ-33.3   | system time as in AC-33.1; `<OverdueCount todos={…}>` rendered with (a) `[]`, (b) one todo due today, (c) one done todo due yesterday, (d) one open todo without a date, (e) one open todo due `'2026-10-31'` | it renders each case and the effects have run                                               | (a) to (d): exactly 1 element with role `status`, text content `""` and 0 child nodes; (e): exactly 1 element with role `status` and text exactly `1 overdue`                                                                                                                                                                          |
| AC-33.3 | REQ-33.2, REQ-33.5   | `<OverdueCount todos={[one open todo due '2026-10-31']}>`; the system time set first to the local `new Date(2026, 10, 1, 12, 0, 0)`, then to `new Date(2030, 0, 1, 12, 0, 0)`                                 | `renderToString` runs under each time; then the first markup is hydrated with `hydrateRoot` | both strings are identical, equal `<span role="status"></span>` and contain no `overdue`; hydration logs 0 errors and 0 warnings on `process.stderr.write`; the element after the effects is the same node (`toBe`) as before them and its text is `1 overdue`                                                                         |
| AC-33.4 | REQ-33.4, REQ-33.6   | system time as in AC-33.1; `<OverdueCount>` rendered with one open todo due `'2026-10-31'`, the status element kept in a variable                                                                             | it re-renders with that todo completed, then with two open todos due `'2026-10-31'`         | text contents in order `1 overdue`, `""`, `2 overdue`; after each step the kept element is the same node (`toBe`) as the one found by role `status`, still in the document, and there is exactly 1 such element; `vi.getTimerCount()` is 0                                                                                             |
| AC-33.5 | REQ-33.1 to REQ-33.4 | stored todos in list order F (open, due 3 days ago), E (open, no date), D (open, due tomorrow), C (open, due today), B (done, due yesterday), A (open, due yesterday), the browser on `/` (client hydrated)   | the page loads; the person ticks A, ticks F, unticks both, reloads                          | the element with role `status` that follows the `N items left` paragraph exists exactly once after load with text `2 overdue`; a handle taken after load stays attached through ticking A (`1 overdue`), ticking F (text `""`, element present, no child node), unticking both (`2 overdue`), with 0 document navigations between them |

## Function contracts

```ts
// src/components/overdue-count.tsx (§23, §33, extended; props and file unchanged)
export function OverdueCount({
  todos,
}: {
  readonly todos: readonly { readonly completed: boolean; readonly dueDate?: string }[];
}): ReactNode; // as §23, except: always one <span role="status"> whose text is overdueLabel(countOverdue(todos, today)) once today (§17) is set, and nothing inside it while today is undefined or the label is undefined
```

`src/lib/overdue-count.ts` (`countOverdue`, `overdueLabel`), `src/app/page.tsx`, `src/components/remaining-count.tsx`
and every action keep their contracts; no new file in `src/`.

## Out of scope

Announcing the remaining count (§13, §22), an assertive region or `role="alert"`, `aria-live` or `aria-atomic`
attributes, a visually hidden second copy of the text, a singular or plural wording, a visible `0 overdue`, a timer
that re-reads the day, a sound or notification, and any change to what is stored.

## Unchanged behavior

| Behavior                                                      | Proof                                                                                                                                                                                                                                                                                                                                |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| The overdue text is empty at 0 and `1 overdue` for one        | `src/components/overdue-count.test.tsx` :: "AC-23.4: (a) [], (b) due today, (c) done and due yesterday, (d) open without a date render text ""; (e) open and due 2026-10-31 renders exactly "1 overdue""                                                                                                                             |
| The overdue count still follows changes and uses no timer     | `src/components/overdue-count.test.tsx` :: "AC-23.6: reads "1 overdue", "", "2 overdue", then "2 overdue" after local midnight with a third todo due 2026-11-01, and leaves 0 timers"                                                                                                                                                |
| The overdue count's page behavior is unchanged                | `e2e/23-overdue-count.spec.ts` :: "AC-23.7: one "2 overdue" after load, after the "N items left" paragraph and in no listitem; "1 overdue" after ticking A, "2 overdue" after unticking with 0 navigations; "1 overdue" after A is due today, on /?filter=completed, on /?q=zzz and after a reload; no "N overdue" once F is ticked" |
| The remaining count is still plural-aware text in a paragraph | `src/components/remaining-count.test.tsx` :: "AC-22.3: renders exactly one paragraph reading "1 item left", "2 items left", "11 items left" and no "All done" for counts 1, 2, 11"                                                                                                                                                   |
