# §49 Todos: a failed clear is the description of "Clear completed"

Tier: full

- [ ] Lead approves spec

## Intent

When clearing completed todos fails, the page shows a message next to the "Clear completed" button (§10). A person
who uses a screen reader hears the alert once, then meets the button again with nothing that says it just failed. After
this section, for as long as the failure message is shown, a screen reader reads it together with the button, so the
person who comes back to the button learns that the last attempt failed. The button's name, its message, its place and
what a clear does do not change.

## Requirements (EARS)

| ID       | Pattern      | Requirement                                                                                                                                                                                                                                                                                                                                                                                        |
| -------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| REQ-49.1 | State-driven | WHILE the failure message of a clear (§10 REQ-10.4: the `form` error of `clearCompletedTodosAction`) is shown THE SYSTEM SHALL make that message the accessible description of the "Clear completed" button: the button's `aria-describedby` is the `id` of the one element that holds the message, so the description is exactly the message text.                                                |
| REQ-49.2 | State-driven | WHILE no failure message is shown THE SYSTEM SHALL give the button no `aria-describedby` attribute, so its accessible description is empty: on first render, after a clear that succeeded, and while the first clear is pending.                                                                                                                                                                   |
| REQ-49.3 | Event-driven | WHEN the next clear succeeds THE SYSTEM SHALL remove the message (§10 REQ-10.5) and the button's `aria-describedby` together, in the commit that removes the message.                                                                                                                                                                                                                              |
| REQ-49.4 | State-driven | WHILE a retry is pending after a failure THE SYSTEM SHALL keep the message and the description: both change only when a result arrives (a success removes them as REQ-49.3 says; a new failure shows the new result's message and keeps the description).                                                                                                                                          |
| REQ-49.5 | Ubiquitous   | THE SYSTEM SHALL generate the message element's `id` with React's `useId`, so two `ClearCompletedButton`s in one document never share it, and SHALL keep the `id` the same for every message the one instance shows.                                                                                                                                                                               |
| REQ-49.6 | Ubiquitous   | THE SYSTEM SHALL change nothing but that attribute and that `id`: the button's accessible name (§9 "Clear completed", §32 "Clear completed (n)"), its `disabled` state, the single `<p role="alert">` that is the button's next sibling inside the one wrapper (§10 REQ-10.4), the message text, the call of `clearCompletedTodosAction` with no argument, and the elements the component renders. |

This is the pattern of §18 REQ-18.8 (the counter is part of the new-todo box's description). §49 adds no element,
message or live region, so §32 REQ-32.5 ("no element, message or live region is added") holds: the message is the one
§10 already shows, and REQ-32.5 limits elements, not attributes. A result with no `form` message (cannot occur,
`fieldErrors.form?.[0]` is `undefined`) shows no message and so no description, as REQ-49.2.

Edits to other sections that this one makes: one clause in the contract block of §10 (`08-mutation-feedback.md`), "the
message is the button's accessible description while shown (§49)"; no requirement or criterion is lifted or edited.

The "`clear-completed-button.tsx` does not change" note of §43 (`41-complete-all-hidden.md:89`) limits §43's own
change and does not apply to §49, whose component is `src/components/clear-completed-button.tsx`. §32's note that the
count adds no element (REQ-32.5) holds, as above.

## Acceptance criteria

| ID      | Covers                       | Given                                                                                                                                                                                 | When                                                                                                                                                                           | Then (measurable)                                                                                                                                                                                                                                                                                                                                                                         |
| ------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-49.1 | REQ-49.1, REQ-49.2, REQ-49.6 | `<ClearCompletedButton disabled={false} completedCount={2} />`, `clearCompletedTodosAction` mocked to resolve `{ ok: false, fieldErrors: { form: ['Could not save, try again'] } }`   | it renders; then the person clicks the button and the result settles                                                                                                           | after the render the button named "Clear completed (2)" has no `aria-describedby` attribute and the accessible description `''`; after the result the same button (name still "Clear completed (2)", enabled) has `aria-describedby` equal to the `id` of the one element of role `alert`, whose text is `Could not save, try again`, and the accessible description is exactly that text |
| AC-49.2 | REQ-49.3, REQ-49.2           | the action resolves the failure of AC-49.1 on the first call and `{ ok: true, data: { deleted: 2 } }` on the second                                                                   | the person clicks, the failure settles, the person clicks again and the second result settles                                                                                  | after the second result 0 elements of role `alert`, the button has no `aria-describedby` attribute and the accessible description `''`; the name is "Clear completed (2)" before the first click, after the failure and after the success; the action was called twice with 0 arguments                                                                                                   |
| AC-49.3 | REQ-49.4, REQ-49.6           | the first call resolves the failure; the second call returns a promise the test settles by hand                                                                                       | the failure settles; the person clicks again; the test reads the button while the retry is pending; the test then resolves the retry with `{ ok: true, data: { deleted: 1 } }` | while pending the button is disabled, exactly 1 alert reads `Could not save, try again`, `aria-describedby` is still that alert's `id` and the description is exactly the message; after the success 0 alerts, no `aria-describedby`, description `''`                                                                                                                                    |
| AC-49.4 | REQ-49.4, REQ-49.5           | the first call resolves `{ ok: false, fieldErrors: { form: ['Could not save, try again'] } }`, the second `{ ok: false, fieldErrors: { form: ['Could not save, try again'] } }` again | the person clicks, the failure settles, clicks again and the second failure settles                                                                                            | after each failure exactly 1 alert shows and the button's accessible description equals its text; the `aria-describedby` value after the second failure equals the value after the first, and is not the empty string                                                                                                                                                                     |
| AC-49.5 | REQ-49.2, REQ-49.6           | the action resolves `{ ok: true, data: { deleted: 1 } }`; the component rendered with `disabled` false and no `completedCount`                                                        | the person clicks and the result settles                                                                                                                                       | the button is named exactly "Clear completed", has no `aria-describedby` attribute, the description is `''`, 0 alerts and 0 status roles; the action was called once with 0 arguments                                                                                                                                                                                                     |
| AC-49.6 | REQ-49.5                     | two `<ClearCompletedButton>` rendered in one container, with `completedCount` 1 and 2, the action resolving the failure of AC-49.1 on every call                                      | the person clicks the second button and its result settles                                                                                                                     | the second button (named "Clear completed (2)") has a description equal to the message and an `aria-describedby` that is the `id` of the one alert; the first button (named "Clear completed (1)") has no `aria-describedby` and the description `''`; the document has 1 element of role `alert`; all `id` values in the container are distinct                                          |

## Function contracts

```ts
// src/components/clear-completed-button.tsx (§9, §10, §32, extended; already 'use client'; no new component, props unchanged)
export function ClearCompletedButton({
  disabled,
  completedCount,
}: {
  readonly disabled: boolean;
  readonly completedCount?: number;
}): ReactNode; // as before, plus: `const messageId = useId()`; the failure <p role="alert"> gets `id={messageId}` and the <button> gets `aria-describedby={error !== undefined ? messageId : undefined}`, where `error` is the existing state set only from a result (`result.ok ? undefined : result.fieldErrors.form?.[0]`)
```

The only file of `src/` this section changes is `src/components/clear-completed-button.tsx`. No new export, Server
Action, Zod schema, Prisma model, query, environment variable, prop or lib function. `src/app/page.tsx`,
`src/actions/todos.ts`, `src/lib/clear-completed-label.ts` and `src/lib/*` keep their contracts; the message is set
only on the result (`clear-completed-button.tsx`, `setError` inside the transition), which is why REQ-49.4 needs no
new state.

How the criteria observe it: all six are component tests with Testing Library in
`src/components/clear-completed-button-description.test.tsx` (`clearCompletedTodosAction` mocked with `vi.hoisted` at
`@/actions/todos`, as `clear-completed-button.test.tsx` does; a pending retry is a promise the test settles by hand;
the description is read with `toHaveAccessibleDescription`). No e2e criterion: the browser path of a failed clear
needs a database fault that §10's AC-10.5 reaches only for an add, and the attribute is fully observable in jsdom.

## Out of scope

Changing the message text, its role or its place (§10); announcing the failure again; moving focus to the message or
back to the button; a description for a successful clear (§9 shows nothing); the same description on "Mark all done",
the row delete button or the toggle (other sections); a visually hidden description, a tooltip, `aria-errormessage` or
`aria-invalid`; the count in the name (§32); the deleted count (§9).

## Unchanged behavior

| Behavior                                                                      | Proof                                                                                                                                                                                                                                                                                      |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| The failure shows 1 alert right after the button; the next success removes it | `src/components/clear-completed-button.test.tsx` :: "AC-10.3: shows exactly one alert "Could not save, try again" right after the button and leaves it enabled when the action fails, then removes it on the next success"                                                                 |
| The button stays disabled while pending and is enabled again afterwards       | `src/components/clear-completed-button.test.tsx` :: "AC-9.2: stays disabled while the action is pending and is enabled again once it resolves"                                                                                                                                             |
| The click calls the action once                                               | `src/components/clear-completed-button.test.tsx` :: "AC-9.3: calls clearCompletedTodosAction once on click"                                                                                                                                                                                |
| The name carries the count and no element is added                            | `src/components/clear-completed-button-count.test.tsx` :: "AC-32.2: renders 1 button named exactly "Clear completed (3)", enabled, with 0 status and 0 alert roles"                                                                                                                        |
| A success shows no message and keeps the name                                 | `src/components/clear-completed-button-count.test.tsx` :: "AC-32.4: calls clearCompletedTodosAction once with 0 arguments and, once it resolves, the name is still "Clear completed (2)" with 0 status, 0 alert roles and no text containing "deleted""                                    |
| Clearing removes the completed todos and keeps the order after a reload       | `e2e/09-clear-completed.spec.ts` :: "AC-9.3: clicking removes the completed todos and the rest keep their order after a reload"                                                                                                                                                            |
| The label follows the stored list end to end                                  | `e2e/32-clear-completed-count.spec.ts` :: "AC-32.6: "Clear completed (2)" becomes "Clear completed (3)" after checking C, "Clear completed (2)" after unchecking C and after a reload, "Clear completed" disabled after the click, with 0 document navigations during the first two steps" |
