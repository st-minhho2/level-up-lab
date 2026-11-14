# §32 Todos: the clear-completed button says how many it will clear

Tier: full

- [ ] Lead approves spec

## Intent

A person looking at the "Clear completed" button learns, before pressing it, how many todos pressing it will delete.
The number describes the stored list, so it does not move when a filter or a search narrows what is shown. It is a
label on the button, not a message about a clear that already happened.

## Requirements (EARS)

| ID       | Pattern           | Requirement                                                                                                                                                                                                                   |
| -------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| REQ-32.1 | State-driven      | WHILE n stored todos are completed, n at least 1, THE SYSTEM SHALL write the label of the §9 button as `Clear completed (n)`, n a whole number without padding, so that the button's accessible name is that text.            |
| REQ-32.2 | State-driven      | WHILE no stored todo is completed THE SYSTEM SHALL write the label as `Clear completed`, with no count, and the button stays disabled as §9 specifies.                                                                        |
| REQ-32.3 | Unwanted behavior | IF a filter (§12) or a search (§16) hides some or all of the stored todos THEN THE SYSTEM SHALL still count every stored completed todo, so that neither changes the label.                                                   |
| REQ-32.4 | Event-driven      | WHEN a todo is created (§5), toggled (§5), completed in bulk (§14) or cleared (§9) THE SYSTEM SHALL show the label of the new stored list in the same page without a full reload, and a full page reload SHALL show the same. |
| REQ-32.5 | Ubiquitous        | THE SYSTEM SHALL keep the count inside the one button: no element, message or live region is added, and the number is the count of todos a clear would delete, not the number a clear reported (§9 REQ-9.3).                  |
| REQ-32.6 | Optional feature  | WHERE `ClearCompletedButton` is given no count THE SYSTEM SHALL render the label `Clear completed` exactly as §9 specifies.                                                                                                   |

The count is the `completed` figure of the one `filterCounts(todos)` result (§30) the page already reads from the
single `listTodos()` call (§5); no second query. The clear itself (which rows go, the order of the rest, the §10
error) is unchanged. This label count is not §9's "message showing the deleted count": nothing is shown after a clear.

## Acceptance criteria

| ID      | Covers                       | Given                                                                                                                  | When                                                                      | Then (measurable)                                                                                                                                                                                                                  |
| ------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-32.1 | REQ-32.1, REQ-32.2           | counts 0, 1, 12                                                                                                        | `clearCompletedLabel(n)` runs on each                                     | `"Clear completed"`, `"Clear completed (1)"`, `"Clear completed (12)"`                                                                                                                                                             |
| AC-32.2 | REQ-32.1, REQ-32.5           | `ClearCompletedButton` rendered with `disabled` false and `completedCount` 3                                           | the component renders                                                     | 1 `button` role named exactly "Clear completed (3)", enabled; 0 `status` and 0 `alert` roles                                                                                                                                       |
| AC-32.3 | REQ-32.2, REQ-32.6           | the component rendered with `disabled` true and `completedCount` 0; then with `disabled` false and no `completedCount` | the component renders each time                                           | 1 `button` role named exactly "Clear completed" each time: disabled the first time, enabled the second                                                                                                                             |
| AC-32.4 | REQ-32.5                     | the component rendered with `completedCount` 2 and an action resolving `{ ok: true, data: { deleted: 2 } }`            | the person clicks the button                                              | `clearCompletedTodosAction` called once with 0 arguments; once it resolves the name is still "Clear completed (2)" (the prop did not change), 0 `status` and 0 `alert` roles, no text containing "deleted"                         |
| AC-32.5 | REQ-32.1, REQ-32.3           | stored todos D (open), C (done), B (done), the browser on `/`                                                          | `/` renders, then `/?filter=active`, `/?filter=completed`, `/?q=zzz` open | on all four addresses the button is named exactly "Clear completed (2)" and is enabled                                                                                                                                             |
| AC-32.6 | REQ-32.1, REQ-32.2, REQ-32.4 | stored todos C (open), B (done), A (done), the browser on `/` (client hydrated)                                        | the person checks C, unchecks C, reloads, clicks the button               | before: "Clear completed (2)"; after the check "Clear completed (3)"; after the uncheck and after the reload "Clear completed (2)"; after the click "Clear completed", disabled; 0 document navigations during the first two steps |
| AC-32.7 | REQ-32.2                     | no stored todo, the browser on `/`                                                                                     | `/` renders                                                               | 1 button named exactly "Clear completed", disabled, with "No todos yet" shown                                                                                                                                                      |

## Function contracts

```ts
// src/lib/clear-completed-label.ts (pure: no Prisma, no server-only; importable from a client component)
export function clearCompletedLabel(completed: number): string; // `Clear completed (n)` for n >= 1, `Clear completed` for 0
// src/components/clear-completed-button.tsx ('use client'; one optional prop added to §9's component)
export function ClearCompletedButton({
  disabled,
  completedCount,
}: {
  readonly disabled: boolean;
  readonly completedCount?: number;
}): ReactNode; // button text is clearCompletedLabel(completedCount); without completedCount: "Clear completed" as §9
// src/app/page.tsx: renders <ClearCompletedButton disabled={…} completedCount={filterCounts(todos).completed} /> from the unfiltered, unsearched `todos`; nothing else changes
```

No Server Action, Zod schema, Prisma model or query is added, and `src/lib/todos.ts`, `src/actions/todos.ts` and
`src/lib/filter-counts.ts` do not change.

## Out of scope

A message showing the deleted count after a clear (§9), a count that follows the search or the filter, a confirmation
dialog, hiding the button at 0, announcing changes to assistive technology (`role="status"`, `aria-live`), a count in
the button's `title` or `aria-label`, styling beyond the existing button classes.

## Unchanged behavior

| Behavior                                              | Proof                                                                                                                                                                                                                            |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Without a count the button is named "Clear completed" | `src/components/clear-completed-button.test.tsx` :: "AC-9.2: renders an enabled button named "Clear completed" when enabled"                                                                                                     |
| Disabled without a count                              | `src/components/clear-completed-button.test.tsx` :: "AC-9.2: renders a disabled button named "Clear completed" when disabled"                                                                                                    |
| Pending keeps the button disabled                     | `src/components/clear-completed-button.test.tsx` :: "AC-9.2: stays disabled while the action is pending and is enabled again once it resolves"                                                                                   |
| A click calls the action once                         | `src/components/clear-completed-button.test.tsx` :: "AC-9.3: calls clearCompletedTodosAction once on click"                                                                                                                      |
| A failed clear still shows the §10 alert              | `src/components/clear-completed-button.test.tsx` :: "AC-10.3: shows exactly one alert "Could not save, try again" right after the button and leaves it enabled when the action fails, then removes it on the next success"       |
| The clear removes completed todos and keeps the rest  | `e2e/09-clear-completed.spec.ts` :: "AC-9.3: clicking removes the completed todos and the rest keep their order after a reload" (finds the button by the substring name "Clear completed", which "Clear completed (n)" contains) |
