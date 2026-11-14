# §36 Todos: the mark-all-complete button says how many it will mark

Tier: full

- [ ] Lead approves spec

## Intent

A person looking at the "Mark all complete" button learns, before pressing it, how many todos pressing it will mark
complete. The number describes the stored list, so it does not move when a filter or a search narrows what is shown.
It is a label on the button, not a message about a mark-all that already happened.

## Requirements (EARS)

| ID       | Pattern           | Requirement                                                                                                                                                                                                                    |
| -------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| REQ-36.1 | State-driven      | WHILE n stored todos are not completed, n at least 1, THE SYSTEM SHALL write the label of the §14 button as `Mark all complete (n)`, n a whole number without padding, so that the button's accessible name is that text.      |
| REQ-36.2 | State-driven      | WHILE no stored todo is open THE SYSTEM SHALL show no button, so no label is written (§14 REQ-14.5, §43); `completeAllLabel(0)` still writes `Mark all complete`, the label of a button given no count (REQ-36.6).             |
| REQ-36.3 | Unwanted behavior | IF a filter (§12) or a search (§16) hides some or all of the stored todos THEN THE SYSTEM SHALL still count every stored open todo, so that neither changes the label.                                                         |
| REQ-36.4 | Event-driven      | WHEN a todo is created (§5), toggled (§5), deleted (§19) or completed in bulk (§14) THE SYSTEM SHALL show the label of the new stored list in the same page without a full reload, and a full page reload SHALL show the same. |
| REQ-36.5 | Ubiquitous        | THE SYSTEM SHALL keep the count inside the one button: no element, message or live region is added, and the number is the count of todos a mark-all would change, not the number a mark-all reported (§14 REQ-14.3).           |
| REQ-36.6 | Optional feature  | WHERE `CompleteAllButton` is given no count THE SYSTEM SHALL render the label `Mark all complete` exactly as §14 specifies.                                                                                                    |

The count is the `active` figure of the one `filterCounts(todos)` result (§30) the page already reads from the single
`listTodos()` call (§5); no second query. Whether the button is enabled stays the `disabled` prop of §14; the count
only writes the label. The mark-all itself (which rows change, the order, the §10 error and its message after the
button) is unchanged. This label count is not §14's "message showing how many were changed": nothing is shown after a
mark-all.

## Acceptance criteria

| ID      | Covers                       | Given                                                                                                             | When                                                                  | Then (measurable)                                                                                                                                                                                                                                              |
| ------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-36.1 | REQ-36.1, REQ-36.2           | counts 0, 1, 12                                                                                                   | `completeAllLabel(n)` runs on each                                    | `"Mark all complete"`, `"Mark all complete (1)"`, `"Mark all complete (12)"`                                                                                                                                                                                   |
| AC-36.2 | REQ-36.1, REQ-36.5           | `CompleteAllButton` rendered with `disabled` false and `count` 3                                                  | the component renders                                                 | 1 `button` role named exactly "Mark all complete (3)", enabled; 0 `status` and 0 `alert` roles                                                                                                                                                                 |
| AC-36.3 | REQ-36.2, REQ-36.6           | the component rendered with `disabled` true and `count` 0; then with `disabled` false and no `count`              | the component renders each time                                       | the first time 0 `button` roles and a container with 0 child nodes; the second time 1 `button` role named exactly "Mark all complete", enabled                                                                                                                 |
| AC-36.4 | REQ-36.5                     | the component rendered with `count` 2 and `completeAllTodosAction` resolving `{ ok: true, data: { updated: 2 } }` | the person clicks the button                                          | `completeAllTodosAction` called once with 0 arguments; once it resolves the name is still "Mark all complete (2)" (the prop did not change), 0 `status` and 0 `alert` roles, no text containing "changed" or "updated"                                         |
| AC-36.5 | REQ-36.1, REQ-36.3           | stored todos D (open), C (done), B (open), the browser on `/`                                                     | `/`, `/?filter=active`, `/?filter=completed` and `/?q=zzz` are opened | on all four addresses the button is named exactly "Mark all complete (2)" and is enabled                                                                                                                                                                       |
| AC-36.6 | REQ-36.1, REQ-36.2, REQ-36.4 | stored todos C (done), B (open), A (open), the browser on `/` (client hydrated)                                   | the person unchecks C, checks C, reloads, clicks the button           | before: "Mark all complete (2)"; after the uncheck "Mark all complete (3)"; after the check and after the reload "Mark all complete (2)"; after the click 0 buttons whose name contains "Mark all complete"; 0 document navigations during the first two steps |
| AC-36.7 | REQ-36.2                     | no stored todo, the browser on `/`                                                                                | `/` renders                                                           | 0 buttons whose name contains "Mark all complete", with "No todos yet" shown                                                                                                                                                                                   |

## Function contracts

```ts
// src/lib/complete-all-label.ts (pure: no Prisma, no server-only; importable from a client component)
export function completeAllLabel(open: number): string; // `Mark all complete (n)` for n >= 1, `Mark all complete` for 0
// src/components/complete-all-button.tsx ('use client'; one optional prop added to §14's component)
export function CompleteAllButton({
  disabled,
  count,
}: {
  readonly disabled: boolean;
  readonly count?: number;
}): ReactNode; // button text is completeAllLabel(count); without count: "Mark all complete" as §14; everything else as §14
// src/app/page.tsx: renders <CompleteAllButton disabled={…} count={filterCounts(todos).active} /> from the unfiltered, unsearched `todos`; nothing else changes
```

No Server Action, Zod schema, Prisma model or query is added, and `src/lib/todo-complete-all.ts`,
`src/actions/complete-all.ts` and `src/lib/filter-counts.ts` do not change.

## Out of scope

A message showing how many were changed after a mark-all (§14), a count that follows the search or the filter, a
confirmation dialog, announcing changes to assistive technology (`role="status"`,
`aria-live`), a count in the button's `title` or `aria-label`, styling beyond the existing button classes.

## Unchanged behavior

| Behavior                                                 | Proof                                                                                                                                                                                                                                                         |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Without a count the button is named "Mark all complete"  | `src/components/complete-all-button.test.tsx` :: "AC-14.4: (b) renders exactly 1 enabled button, calls the action once with 0 arguments, is disabled while it is pending and enabled again once it resolves"                                                  |
| Enabled, one call, pending, re-enabled                   | `src/components/complete-all-button.test.tsx` :: "AC-14.4: (b) renders exactly 1 enabled button, calls the action once with 0 arguments, is disabled while it is pending and enabled again once it resolves"                                                  |
| A failed mark-all still shows the §10 alert and recovers | `src/components/complete-all-button.test.tsx` :: "AC-14.5: shows exactly one alert "Could not save, try again" right after the button and leaves it enabled when the action fails, then removes it on the next success"                                       |
| With nothing stored no button is shown (§43)             | `e2e/14-complete-all.spec.ts` :: "AC-14.6: with no stored todo, / shows 0 buttons named "Mark all complete""                                                                                                                                                  |
| Marking all keeps order and survives a reload            | `e2e/14-complete-all.spec.ts` :: "AC-14.6: C (open), B (done), A (open): the button is enabled, and after the click and after a reload the list reads [C, B, A], all 3 checked, 0 buttons named "Mark all complete"" (finds the button by the substring name) |
| The button stays enabled under a filter                  | `e2e/14-complete-all.spec.ts` :: "on /?filter=completed with one open and one completed todo stored, exactly 1 button "Mark all complete" is enabled (REQ-14.4)" (finds the button by the substring name)                                                     |
