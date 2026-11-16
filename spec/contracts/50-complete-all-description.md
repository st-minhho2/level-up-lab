# §52 Todos: a failed mark-all is the button's description

Tier: full

- [ ] Lead approves spec

## Intent

A person who uses a screen reader and presses "Mark all complete" hears the button's name again when it fails to save,
but the reason sits in a separate paragraph after it, and nothing ties the two together. After this section the
failure message is part of what the button announces about itself for as long as the message is shown, and it is gone
from the button when the message is gone. What the button is called, what it does and what the message says do not
change.

## Requirements (EARS)

| ID       | Pattern      | Requirement                                                                                                                                                                                                                                                                                                                                                                                      |
| -------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| REQ-52.1 | State-driven | WHILE the failure message of §14 (REQ-14.9, the §10 text in `<p role="alert">`) is shown THE SYSTEM SHALL make that message the accessible description of the "Mark all complete" button: the button's `aria-describedby` is exactly the `id` of that `<p>`, one id, generated with React's `useId` (no hard-coded id), so the description reads exactly the message text.                       |
| REQ-52.2 | State-driven | WHILE the failure message is not shown (before any attempt, after a successful attempt, after the button was removed and came back, or when a failed result carries no `form` message) THE SYSTEM SHALL give the button no `aria-describedby` attribute, so no reference to a missing element exists and the description is empty.                                                               |
| REQ-52.3 | Event-driven | WHEN a later attempt on the same button succeeds (REQ-14.10) THE SYSTEM SHALL remove the message and the button's `aria-describedby` together, so that no result of this component shows one without the other.                                                                                                                                                                                  |
| REQ-52.4 | State-driven | WHILE a retry is pending after a failure THE SYSTEM SHALL keep the message and the description as they were (the message is removed by the next success, REQ-14.10, not by the start of the next attempt); a retry that fails again leaves the same message and the same description.                                                                                                            |
| REQ-52.5 | Event-driven | WHEN the button is removed because no todo is open (§43) THE SYSTEM SHALL remove the message with it (§43 REQ-43.4), so that a button that comes back has no description until a new failure.                                                                                                                                                                                                    |
| REQ-52.6 | Ubiquitous   | THE SYSTEM SHALL leave unchanged the button's accessible name (`Mark all complete (n)`, or `Mark all complete` without a count, §36), its enabled and disabled-while-pending states, the message's text, its `role="alert"` (one alert, the button's next sibling in one wrapper, §14), the log entry of §11, and SHALL add no element, no live region, no focus call, no ref and no `tabindex`. |

The message was already announced when it appeared, as an alert (§10 REQ-10.4, §14). The description adds a second
route to the same text for a person who moves to the button later; it does not add a second announcement and the
alert role stays. The pattern is §18 REQ-18.8 (the counter is the new-todo box's description), here for one message
and one button.

### Relation to the sibling sections

- §43 forbids focus calls, refs and `tabindex` in this component (the function contract of `41-complete-all-hidden.md`
  and REQ-43.5). `useId` and `aria-describedby` are none of those, so §43 holds as written. The note of
  `41-complete-all-hidden.md` that lists the only file of `src/` that §43 changes and the files it leaves alone states
  the scope of §43's own change; it does not bind §52, which changes the same one file and no other, and it adds no
  prop, export, Server Action or lib function either.
- §36 REQ-36.5 ("no element, message or live region is added") holds: the description points to the message that
  already exists and adds nothing to the page.
- The state clears by the same means as before (§43: by state or by derivation, the implementation's choice); this
  section adds one derived value, the id of the message, set only while the message exists.

## Acceptance criteria

| ID      | Covers                       | Given                                                                                                                                                                                                                                             | When                                                                                                                       | Then (measurable)                                                                                                                                                                                                                                                                                                                                                                                            |
| ------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| AC-52.1 | REQ-52.1, REQ-52.6           | `<CompleteAllButton disabled={false} count={1} />` with `completeAllTodosAction` resolving `{ ok: false, fieldErrors: { form: ['Could not save, try again'] } }`                                                                                  | the person clicks "Mark all complete (1)" and the result is shown                                                          | exactly 1 `alert` role, text exactly `Could not save, try again`; the button named exactly `Mark all complete (1)` has `aria-describedby` equal to that alert's non-empty `id` and `toHaveAccessibleDescription('Could not save, try again')` holds; the button is enabled; the alert is the button's next sibling; the action was called once with 0 arguments                                              |
| AC-52.2 | REQ-52.2, REQ-52.6           | `<CompleteAllButton disabled={false} count={2} />` with the action not yet called                                                                                                                                                                 | it renders                                                                                                                 | the button named exactly `Mark all complete (2)` has no `aria-describedby` attribute (`hasAttribute` is `false`) and `toHaveAccessibleDescription('')` holds; 0 `alert` roles; the container holds no element with an `id` attribute                                                                                                                                                                         |
| AC-52.3 | REQ-52.3, REQ-52.1           | the action resolves the failure of AC-52.1 on the first click and `{ ok: true, data: { updated: 1 } }` on the second                                                                                                                              | the person clicks the button, then clicks it again, and the second result is shown                                         | after the first click the button has `aria-describedby` equal to the alert's id; after the second result 0 `alert` roles, the button has no `aria-describedby` attribute and `toHaveAccessibleDescription('')` holds; the button is still named exactly `Mark all complete (1)` and enabled; the action was called twice                                                                                     |
| AC-52.4 | REQ-52.4, REQ-52.1, REQ-52.6 | the action resolves the failure of AC-52.1 on the first click and returns a promise held by the test on the second; the held promise is then settled with the same failure in one render and with `{ ok: true, data: { updated: 1 } }` in another | the person clicks, waits for the alert, clicks again, and reads the button before the held promise is settled and after it | while the second attempt is pending: the button is disabled, exactly 1 `alert` role with the same text and the same `id` as before, `aria-describedby` equal to that id, and `toHaveAccessibleDescription('Could not save, try again')` holds; settled with the failure: the same one alert, same id and same description; settled with success: 0 alerts, no `aria-describedby` attribute, description `''` |
| AC-52.5 | REQ-52.5, REQ-52.2           | after the failure of AC-52.1 is shown                                                                                                                                                                                                             | the component is re-rendered with `disabled` true and `count` 0, then with `disabled` false and `count` 1                  | after the first re-render the container has 0 child nodes and 0 `alert` roles; after the second exactly 1 button named `Mark all complete (1)`, enabled, with no `aria-describedby` attribute, `toHaveAccessibleDescription('')` holds and 0 `alert` roles; the action was called once in total                                                                                                              |
| AC-52.6 | REQ-52.2, REQ-52.6           | `completeAllTodosAction` resolving `{ ok: false, fieldErrors: {} }`                                                                                                                                                                               | the person clicks "Mark all complete (1)" and the result is shown                                                          | 0 `alert` roles and no element with an `id` attribute in the container; the button has no `aria-describedby` attribute, `toHaveAccessibleDescription('')` holds, the button is named exactly `Mark all complete (1)` and enabled                                                                                                                                                                             |

## Function contracts

```ts
// src/components/complete-all-button.tsx ('use client'; §14, §36, §43, extended; no new component, props and export unchanged)
export function CompleteAllButton({
  disabled,
  count,
}: {
  readonly disabled: boolean;
  readonly count?: number;
}): ReactNode; // as §43, plus: a failure message that is shown is `<p id={useId()} role="alert">` and the button carries `aria-describedby` with that same id only while the message is shown (no attribute otherwise); the message is cleared only by a successful result or by the unmount of §43; no focus(), no ref, no tabindex
```

The only file of `src/` this section changes is `src/components/complete-all-button.tsx`. No new export, Server Action,
Zod schema, Prisma model, query, environment variable, prop or lib function; `src/app/page.tsx`,
`src/lib/complete-all-label.ts`, `src/actions/complete-all.ts` and `src/lib/todo-complete-all.ts` do not change. The
id comes from `useId`; the component keeps no timer, effect or ref.

## Out of scope

A second message or live region, making the message polite instead of an alert, describing the button by anything but
the failure message (a count or a hint), the same description for "Clear completed" (§9) or another control, moving
or restoring focus, clearing the message when a retry starts, an e2e test of a failing mark-all (the browser cannot
make the action fail without a fault injected into the server), a change to the §10 text or to the log entry (§11), a
change to `completeAllLabel`.

## Unchanged behavior

| Behavior                                                                            | Proof                                                                                                                                                                                                                                                                             |
| ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The button is called once, disabled while pending and enabled again after a success | `src/components/complete-all-button.test.tsx` :: "AC-14.4: (b) renders exactly 1 enabled button, calls the action once with 0 arguments, is disabled while it is pending and enabled again once it resolves"                                                                      |
| The failure is one alert right after the button, removed by the next success        | `src/components/complete-all-button.test.tsx` :: "AC-14.5: shows exactly one alert "Could not save, try again" right after the button and leaves it enabled when the action fails, then removes it on the next success"                                                           |
| The count in the name does not change after a mark-all and adds no status or alert  | `src/components/complete-all-button-count.test.tsx` :: "AC-36.4: calls completeAllTodosAction once with 0 arguments and, once it resolves, the name is still "Mark all complete (2)" with 0 status, 0 alert roles and no text containing "changed" or "updated""                  |
| The name carries only the label, with no status or alert                            | `src/components/complete-all-button-count.test.tsx` :: "AC-36.2: renders 1 button named exactly "Mark all complete (3)", enabled, with 0 status and 0 alert roles"                                                                                                                |
| Nothing is rendered while no todo is open                                           | `src/components/complete-all-button.test.tsx` :: "AC-14.4: (a) renders nothing, with 0 elements of role button and an empty container, when disabled is true"                                                                                                                     |
| A failure alert goes with the removed button and does not come back with it         | `src/components/complete-all-button-hidden.test.tsx` :: "AC-43.3: a failure alert is gone once rendered with disabled true (0 child nodes, 0 button, 0 alert roles) and does not come back with the button: exactly 1 enabled "Mark all complete (1)" and 0 alert roles"          |
| The button stays shown and disabled while pending, with the name unchanged          | `src/components/complete-all-button-hidden.test.tsx` :: "AC-43.2: while pending exactly 1 button named "Mark all complete (2)", disabled; after a successful result with the props unchanged the same single button is still there, named "Mark all complete (2)", enabled again" |
| Focus is not managed and no element gets a `tabindex`                               | `src/components/complete-all-button-hidden.test.tsx` :: "AC-43.4: after the focused button is removed there are 0 button roles, document.activeElement is document.body, focus() is called 0 times after the click and no element has a tabindex attribute"                       |
| End to end the list still marks all complete and survives a reload                  | `e2e/14-complete-all.spec.ts` :: "AC-14.6: C (open), B (done), A (open): the button is enabled, and after the click and after a reload the list reads [C, B, A], all 3 checked, 0 buttons named "Mark all complete""                                                              |
