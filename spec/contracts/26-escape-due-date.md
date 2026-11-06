# §28 Todos: Escape closes the due-date editor without saving

Tier: full

- [ ] Lead approves spec

## Intent

A person who opened a due-date edit by mistake, or who changed their mind while picking a day, leaves the edit with
one key and finds the row exactly as it was: the stored due date, no save made, nothing picked carried into the next
edit.

## Requirements (EARS)

| ID       | Pattern           | Requirement                                                                                                                                                                                                                                                                                               |
| -------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| REQ-28.1 | Event-driven      | WHEN Escape (`KeyboardEvent.key` equal to `'Escape'`, no Ctrl, Meta, Alt or Shift held) is pressed in the "Due date" field (§15 REQ-15.6) THE SYSTEM SHALL leave edit mode, show the todo's stored due date as §15 shows it, and cancel the key's default action (`preventDefault`).                      |
| REQ-28.2 | Event-driven      | WHEN Escape leaves edit mode THE SYSTEM SHALL make no save: no call to `setTodoDueDateAction`, so the stored due date, title, completion state and position are unchanged (§15 REQ-15.4).                                                                                                                 |
| REQ-28.3 | Event-driven      | WHEN Escape leaves edit mode THE SYSTEM SHALL discard the draft, so that the next activation of "Edit due date" shows the stored due date (§15 REQ-15.6; empty when none) and not the discarded value.                                                                                                    |
| REQ-28.4 | Event-driven      | WHEN Escape leaves edit mode THE SYSTEM SHALL remove the row's message of a rejected or failed save (§15 REQ-15.7, REQ-15.10, §10).                                                                                                                                                                       |
| REQ-28.5 | State-driven      | WHILE a save of that todo's due date is in flight THE SYSTEM SHALL ignore Escape (no `preventDefault`), so that the edit ends only through the save's own result.                                                                                                                                         |
| REQ-28.6 | Unwanted behavior | IF a key other than Escape is pressed in the field, or Escape with Ctrl, Meta, Alt or Shift, THEN THE SYSTEM SHALL keep the behavior of §15: Enter submits the draft, any other key edits or moves within the field, edit mode stays, no `preventDefault`.                                                |
| REQ-28.7 | Ubiquitous        | THE SYSTEM SHALL react to Escape only when it is pressed in the "Due date" field: Escape on `document.body`, on the "Update due date" button, in a title field (§6, §24) or in any other box does nothing here, and the markup, labels and names of §15 and §17 do not change (no visible text is added). |

Blur is not Escape: leaving the field by click or Tab keeps the edit open as §15 does today.

## Acceptance criteria

| ID      | Covers                         | Given                                                                                                                            | When                                                                                                  | Then (measurable)                                                                                                                                                                                                         |
| ------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-28.1 | REQ-28.1, REQ-28.2             | `<TodoDueDate todoId="todo-9" dueDate="2026-11-05">` in edit mode, the field set to `2026-12-01`                                 | the person presses Escape (a cancelable keydown) in the field                                         | 0 elements labelled "Due date"; the text `Due 2026-11-05` is in the document exactly once; 1 button named "Edit due date"; the event's `defaultPrevented` is `true`; `setTodoDueDateAction` called 0 times                |
| AC-28.2 | REQ-28.3                       | as AC-28.1 after the Escape, then with `dueDate={undefined}` edited, a value typed and Escape pressed                            | the person activates "Edit due date" again                                                            | with `2026-11-05` the field's value is `2026-11-05`; with no due date it is `''`                                                                                                                                          |
| AC-28.3 | REQ-28.4                       | edit mode, a save of `2026-12-01` rejected with `{ dueDate: ['Due date must be a valid date'] }`, the wrapper showing that alert | the person presses Escape in the field                                                                | 0 elements with role `alert`; 0 elements labelled "Due date"; `setTodoDueDateAction` called exactly once (the rejected save)                                                                                              |
| AC-28.4 | REQ-28.5                       | edit mode, the save of `2026-12-01` started and its action promise not yet resolved                                              | the person presses Escape, then the save resolves `ok`                                                | after the Escape the field is still present and holds `2026-12-01` and `defaultPrevented` is `false`; after the resolution 0 elements labelled "Due date"; `setTodoDueDateAction` called exactly once                     |
| AC-28.5 | REQ-28.6                       | edit mode on `2026-11-05`, the field holding `2026-12-01`                                                                        | the person presses Enter; separately ArrowLeft, Ctrl+Escape, Meta+Escape, Alt+Escape and Shift+Escape | Enter: `setTodoDueDateAction` called once with `('todo-9', '2026-12-01')`; each other key: the field is still present with value `2026-12-01`, `defaultPrevented` is `false` and the action is not called                 |
| AC-28.6 | REQ-28.7                       | edit mode, the field holding `2026-12-01`, next to a text box named "New todo"                                                   | the person presses Escape on `document.body`, on the button "Update due date" and in "New todo"       | each time the field is still present with value `2026-12-01`, `defaultPrevented` is `false` and the action is not called                                                                                                  |
| AC-28.7 | REQ-28.1 to REQ-28.4, REQ-28.7 | stored todos C (open), B (done, due `2026-11-05`), A (open), the browser on `/` (client hydrated)                                | edit B's due date, set `2026-12-01`, press Escape, reload                                             | 0 "Due date" fields after the Escape; B's row reads `Due 2026-11-05` before and after the reload; 0 requests to `/` with method POST between the Escape and the reload; the list reads `[C, B, A]` and B is still checked |

## Function contracts

```ts
// src/components/todo-due-date.tsx: TodoDueDate({ todoId, dueDate }) props unchanged; the "Due date" input gains an
// onKeyDown: when key === 'Escape' with no ctrlKey, metaKey, altKey or shiftKey and no save in flight (§15's pending
// state) → event.preventDefault(), leave edit mode, reset the draft to dueDate ?? '', clear the message.
// No new export, Server Action, Zod schema, Prisma model, query, environment variable or prop.
```

The only file of `src/` this section changes is `src/components/todo-due-date.tsx`; `src/app/page.tsx`,
`src/actions/todos.ts`, `src/components/todo-item.tsx` and `src/lib/*` stay as they are (D-30).

## Out of scope

Cancelling by blur or by clicking elsewhere (the half of §15's line that stays, D-32), a "Cancel" button, a
confirmation when the draft differs, restoring focus to the "Edit due date" button, Escape in other fields (title §24,
search §27), Escape while no field is open, closing the browser's own date picker pop-up, undo, announcing the
cancellation to assistive technology.

## Unchanged behavior

| Behavior                                                     | Proof                                                                                                                                                                                                                     |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The editor opens on the stored date                          | `src/components/todo-due-date.test.tsx` :: "AC-15.6: edits to 2026-12-01, shows exactly 1 alert "Could not save, try again" in the wrapper with the field kept, then on the next success removes it and leaves edit mode" |
| An empty field still sends `''`, a rejection keeps the field | `src/components/todo-due-date.test.tsx` :: "AC-15.6: an empty field calls the action with (todo-9, ""), and the dueDate error shows exactly "Due date must be a valid date" with the field kept"                          |
| A row without a date shows no text and one edit button       | `src/components/todo-due-date.test.tsx` :: "AC-15.5: (b) with no dueDate the text content is exactly "", with 1 button "Edit due date", no alert and no "Due date" field"                                                 |
| The overdue marker still follows the date and the checkbox   | `src/components/todo-due-date-overdue.test.tsx` :: "AC-17.4: inside an li with a checked box shows 0 "Overdue", unchecked exactly 1, checked again 0; outside any li it is shown"                                         |
| A saved date still survives a reload                         | `e2e/15-due-date.spec.ts` :: "AC-15.7: B's due date 2026-11-05 shows in B's row before and after a reload with [C, B, A] and B checked; cleared, it shows no Due text before and after a reload"                          |
