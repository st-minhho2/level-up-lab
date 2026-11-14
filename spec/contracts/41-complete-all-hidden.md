# §43 Todos: "Mark all complete" is not shown when there is nothing to mark

Tier: full

- [ ] Lead approves spec

## Intent

A person whose list has no open todo, or no todo at all, is not offered a control that has nothing to do. The page
reads as it does today with the control removed: the counts, "All done" and the list stay, and nothing stands in the
control's place. The control comes back as soon as one todo is open again.

## Requirements (EARS)

| ID       | Pattern           | Requirement                                                                                                                                                                                                                                                                                                                                      |
| -------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| REQ-43.1 | State-driven      | WHILE no stored todo is open (none is stored, or every one is completed) THE SYSTEM SHALL show no "Mark all complete" button and nothing in its place: `CompleteAllButton` renders no element, no wrapper, no text and no failure message.                                                                                                       |
| REQ-43.2 | State-driven      | WHILE a mark-all is pending and the stored list still has an open todo THE SYSTEM SHALL keep the button shown and disabled, with its label unchanged, as §14 specifies; a successful result alone does not hide it, the refreshed list (REQ-43.3) does.                                                                                          |
| REQ-43.3 | Event-driven      | WHEN a mark-all succeeds, or a todo is toggled (§5), deleted (§19) or cleared (§9) so that no stored todo is open, THE SYSTEM SHALL remove the button from the same page without a full reload, and a full page reload SHALL show the same.                                                                                                      |
| REQ-43.4 | Event-driven      | WHEN a todo becomes open again (created or toggled, §5) THE SYSTEM SHALL show the button again, labelled as §36 specifies, in the same page without a full reload; a failure message shown before the button was removed SHALL NOT come back with it.                                                                                            |
| REQ-43.5 | Event-driven      | WHEN the button is removed while it holds focus THE SYSTEM SHALL NOT manage focus: it calls `focus()` on nothing, adds no focusable element and sets no `tabindex`; the browser's own rule applies and `document.activeElement` is `document.body`.                                                                                              |
| REQ-43.6 | State-driven      | WHILE no stored todo is open THE SYSTEM SHALL keep every other part of the page as it is: the "Clear completed" button (§9), the filter links (§12), the remaining count (§13) with "All done" (§22) and the list or its empty message (§12, §16) read as they do with an open todo, and no message, placeholder or element replaces the button. |
| REQ-43.7 | Unwanted behavior | IF a filter (§12) or a search (§16) hides some or all of the stored todos THEN THE SYSTEM SHALL still decide whether the button is shown from every stored todo (§36 REQ-36.3), so that neither shows it, hides it, or changes its label.                                                                                                        |

"Open" is §14's "not completed". The decision is the `disabled` prop that `src/app/page.tsx` already passes
(`!todos.some((todo) => !todo.completed)`): `true` means no stored todo is open. The component reads that prop only; it
does not read the `count`, and `count` 0 with `disabled` false does not occur from the page.

The failure message of §14 (REQ-14.8, REQ-14.9) belongs to the button: it is shown only while the button is, so it is
never left on a page without the button, and a button that reappears shows none (REQ-43.4).

### Where focus goes (REQ-43.5)

Focus is not managed. When a successful mark-all leaves no open todo, the button that was just clicked is removed
while focused and the browser moves focus to `document.body`, as it does for any focused element that is removed.

Why this option: it needs no change outside `src/components/complete-all-button.tsx`. A component that renders
nothing has no element of its own to receive focus, so moving focus anywhere would need a target outside it (an
`id` or `ref` on the heading, the search box or a filter link, in `src/app/page.tsx` or another component), and D-39
allows no card to change `page.tsx` and gives each card one component. §24's Out of scope (restoring focus to the
"Edit title" button, `22-escape-edit-title.md:50`) is the same stance. The cost is that a keyboard user's next Tab starts
from the browser's sequential focus starting point, near where the button was, instead of a chosen control.

### Edits to other sections (D-39)

- §14 (`12-complete-all.md`): REQ-14.5, AC-14.4 (a), AC-14.6 and the page contract line of "Function contracts" are
  edited to say the button is not shown at 0 open. Their ids stay.
- §36 (`34-complete-all-count.md`): REQ-36.2, AC-36.3, AC-36.6 and AC-36.7 are edited the same way. "Hiding the button
  at 0" is lifted from its Out of scope. Its unchanged rows that quoted a disabled button are re-pointed.
- The §14 and §36 component-contract comments (`disabled also while pending`; `button text is completeAllLabel(count)`)
  keep their text: they describe a shown button. For `disabled` true they are read with §43 (nothing is rendered).
- §16's page contract (`14-search.md`, "`<CompleteAllButton disabled>` keep deriving from the unfiltered, unsearched
  todos") holds as written: the prop is derived as before and decides visibility instead of the disabled state.
- §30's contract and every §30 line about the filter nav are untouched.

## Acceptance criteria

| ID      | Covers                       | Given                                                                                                                                                                                                          | When                                                                                                                  | Then (measurable)                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-43.1 | REQ-43.1                     | `CompleteAllButton` rendered with `completeAllTodosAction` mocked at `@/actions/complete-all`; (a) `disabled` true and no `count`; (b) `disabled` true and `count` 0                                           | it renders                                                                                                            | in (a) and (b): the render container has 0 child nodes, 0 elements with role `button`, 0 with role `alert`, and its text content is exactly `""`; `completeAllTodosAction` is called 0 times                                                                                                                                                                                                                                        |
| AC-43.2 | REQ-43.2                     | `disabled` false, `count` 2, the action held pending                                                                                                                                                           | the person clicks the button; then the action resolves `{ ok: true, data: { updated: 2 } }` with the props unchanged  | while pending exactly 1 `button` role, named exactly "Mark all complete (2)", disabled; after the resolution the same single button is still in the document, named "Mark all complete (2)", enabled again (the component does not hide itself on a result)                                                                                                                                                                         |
| AC-43.3 | REQ-43.1, REQ-43.4           | `disabled` false, `count` 1; the action resolves `{ ok: false, fieldErrors: { form: ['Could not save, try again'] } }` and the person has clicked, so 1 `alert` "Could not save, try again" follows the button | the component is re-rendered with `disabled` true and `count` 0; then re-rendered with `disabled` false and `count` 1 | before: 1 `alert`; after the first re-render the container has 0 child nodes, 0 `button` and 0 `alert` roles; after the second exactly 1 `button` named exactly "Mark all complete (1)", enabled, and 0 `alert` roles                                                                                                                                                                                                               |
| AC-43.4 | REQ-43.5                     | `disabled` false, `count` 1, the action resolving `{ ok: true, data: { updated: 1 } }`; `HTMLElement.prototype.focus` observed with a spy                                                                      | the person clicks the button (it holds focus), then the component is re-rendered with `disabled` true and `count` 0   | after the re-render 0 `button` roles and `document.activeElement` is `document.body`; the `focus` spy is called 0 times after the click; no element in the document has a `tabindex` attribute                                                                                                                                                                                                                                      |
| AC-43.5 | REQ-43.1, REQ-43.3, REQ-43.5 | stored todos C (open), B (done), A (open), the browser on `/` (client hydrated)                                                                                                                                | the person clicks "Mark all complete (2)"; then reloads                                                               | before: 1 button named "Mark all complete (2)"; after the click and the same after the reload: 0 buttons whose name contains "Mark all complete", exactly one element with the text "0 items left" and one with "All done", the list reads `[C, B, A]` with all 3 checkboxes checked; 0 document navigations between the click and the reload; after the click `document.activeElement.tagName` is `BODY`                           |
| AC-43.6 | REQ-43.3, REQ-43.4           | stored todos B (done), A (open), the browser on `/` (client hydrated)                                                                                                                                          | the person checks A; then unchecks A; then reloads                                                                    | before: 1 button named "Mark all complete (1)"; after the check 0 buttons whose name contains "Mark all complete"; after the uncheck 1 button named exactly "Mark all complete (1)", enabled, and 0 `alert` roles; after the reload the same single button; 0 document navigations during the check and the uncheck                                                                                                                 |
| AC-43.7 | REQ-43.6, REQ-43.7           | (a) no stored todo, on `/`; (b) stored todos B (done), A (done), on `/?filter=active`; (c) stored todos B (open), A (done), on `/?filter=completed` and on `/?q=zzz`                                           | the page renders in each                                                                                              | (a) 0 buttons whose name contains "Mark all complete", exactly one button named "Clear completed" disabled, one element with "0 items left", one with "All done", one with "No todos yet"; (b) 0 such buttons, one "0 items left", one "All done", one "No active todos"; (c) on both addresses 1 button named exactly "Mark all complete (1)", enabled; in (a) to (c) 0 elements with text "Nothing to mark" or "No todos to mark" |

## Function contracts

```ts
// src/components/complete-all-button.tsx ('use client'; §14, §36, extended; no new component, props and export unchanged)
export function CompleteAllButton({
  disabled,
  count,
}: {
  readonly disabled: boolean;
  readonly count?: number;
}): ReactNode; // as §36, except: when `disabled` is true it returns null (no wrapper, no button, no message); when false, the button is disabled only while pending; a failure message set while the button was shown is not shown after the component was last rendered with `disabled` true; no call to focus(), no ref, no tabindex
```

Where `disabled` is `true`, "returns null" holds from the first render, so a server render of the page with no open
todo contains no element of the component. The component keeps no timer, effect or ref for this section; whether the
message is cleared by state or by derivation is the implementation's choice, the observable result is AC-43.3.

The only file of `src/` this section changes is `src/components/complete-all-button.tsx`. No new export, Server Action,
Zod schema, Prisma model, query, environment variable, prop or lib function. `src/app/page.tsx` keeps its call
(`<CompleteAllButton disabled={!todos.some((todo) => !todo.completed)} count={filterCounts(todos).active} />`),
`src/lib/complete-all-label.ts` keeps `completeAllLabel`, and `src/actions/complete-all.ts`,
`src/lib/todo-complete-all.ts` and `src/components/clear-completed-button.tsx` do not change.

### Tests the red step rewrites (titles are final: the unchanged rows of §36 quote them)

| File and line today                                    | Criterion   | New title (verbatim)                                                                                                                                                                                                                                      |
| ------------------------------------------------------ | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/complete-all-button.test.tsx:37`       | AC-14.4 (a) | `AC-14.4: (a) renders nothing, with 0 elements of role button and an empty container, when disabled is true`                                                                                                                                              |
| `src/components/complete-all-button-count.test.tsx:41` | AC-36.3     | `AC-36.3: renders nothing with disabled true and count 0, and exactly 1 enabled button named "Mark all complete" with disabled false and no count`                                                                                                        |
| `e2e/14-complete-all.spec.ts:51`                       | AC-14.6 (a) | `AC-14.6: with no stored todo, / shows 0 buttons named "Mark all complete"`                                                                                                                                                                               |
| `e2e/14-complete-all.spec.ts:59`                       | AC-14.6 (b) | `AC-14.6: C (open), B (done), A (open): the button is enabled, and after the click and after a reload the list reads [C, B, A], all 3 checked, 0 buttons named "Mark all complete"`                                                                       |
| `e2e/36-complete-all-count.spec.ts:64`                 | AC-36.6     | `AC-36.6: "Mark all complete (2)" becomes "Mark all complete (3)" after unchecking C, "Mark all complete (2)" after checking C and after a reload, no "Mark all complete" button after the click, with 0 document navigations during the first two steps` |
| `e2e/36-complete-all-count.spec.ts:94`                 | AC-36.7     | `AC-36.7: with no stored todo 0 buttons are named "Mark all complete", with "No todos yet" shown`                                                                                                                                                         |

New tests for AC-43.1 to AC-43.7 go in `src/components/complete-all-button-hidden.test.tsx` (AC-43.1 to AC-43.4) and
`e2e/43-complete-all-hidden.spec.ts` (AC-43.5 to AC-43.7). The substring name match of the e2e files that find the
button (`16`, `22`, `30`) keeps working: each finds it while an open todo exists.

## Out of scope

Moving focus to another control after the button is removed (it needs a target outside the component, see "Where focus
goes"), a message such as "Nothing to mark" or "Everything is done", a disabled or greyed placeholder, an animation or
transition on removal, hiding "Clear completed" at 0 completed (§9 REQ-9.5 stays), announcing the removal to assistive
technology, removing the `disabled` prop or the `count` prop, a second query, restoring focus when the button
reappears, a change to `completeAllLabel`.

## Unchanged behavior

| Behavior                                                           | Proof                                                                                                                                                                                                                                                            |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| An enabled button with a count still reads "Mark all complete (3)" | `src/components/complete-all-button-count.test.tsx` :: "AC-36.2: renders 1 button named exactly "Mark all complete (3)", enabled, with 0 status and 0 alert roles"                                                                                               |
| The count stays after a click, no status or alert                  | `src/components/complete-all-button-count.test.tsx` :: "AC-36.4: calls completeAllTodosAction once with 0 arguments and, once it resolves, the name is still "Mark all complete (2)" with 0 status, 0 alert roles and no text containing "changed" or "updated"" |
| Enabled, one call, pending, re-enabled                             | `src/components/complete-all-button.test.tsx` :: "AC-14.4: (b) renders exactly 1 enabled button, calls the action once with 0 arguments, is disabled while it is pending and enabled again once it resolves"                                                     |
| A failed mark-all still shows the §10 alert and recovers           | `src/components/complete-all-button.test.tsx` :: "AC-14.5: shows exactly one alert "Could not save, try again" right after the button and leaves it enabled when the action fails, then removes it on the next success"                                          |
| The button is still found on every address with an open todo       | `e2e/36-complete-all-count.spec.ts` :: "AC-36.5: on /, /?filter=active, /?filter=completed and /?q=zzz the button is named exactly "Mark all complete (2)" and is enabled"                                                                                       |
| The button stays enabled under a filter                            | `e2e/14-complete-all.spec.ts` :: "on /?filter=completed with one open and one completed todo stored, exactly 1 button "Mark all complete" is enabled (REQ-14.4)"                                                                                                 |
| Hidden todos still count and enable the button under a search      | `e2e/16-search.spec.ts` :: "AC-16.7: on /?q=milk the hidden todos still count and enable both buttons, a retitled D leaves the list while "2 items left" and the address stay, and "Mark all complete" completes D, C and the hidden B"                          |
| "All done" still shows with no todo and with all completed         | `e2e/22-all-done.spec.ts` :: "AC-22.5: an empty list shows exactly one "0 items left", one "No todos yet" and one "All done", and no listitem"                                                                                                                   |
| "Clear completed" is still shown and disabled on an empty list     | `e2e/09-clear-completed.spec.ts` :: "AC-9.2: the button is disabled on an empty list and on an open-only list"                                                                                                                                                   |
