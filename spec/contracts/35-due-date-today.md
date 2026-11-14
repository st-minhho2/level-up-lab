# §37 Todos: a "Today" button fills the due-date field

Tier: full

- [ ] Lead approves spec

## Intent

A person who wants an item done today opens its due-date editor and picks today's day in one step, instead of
finding it in the browser's date picker. The step only fills the field: the person still reads the day and saves it,
or leaves the editor, exactly as with a typed date.

## Requirements (EARS)

| ID       | Pattern           | Requirement                                                                                                                                                                                                                                                                                                                                      |
| -------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| REQ-37.1 | State-driven      | WHILE a row is in due-date edit mode (§15 REQ-15.6) THE SYSTEM SHALL show in the edit form, in this order, the label "Due date", the date field, one button named exactly "Today" with `type="button"`, and the button "Update due date"; the button's visible text is `Today`.                                                                  |
| REQ-37.2 | Event-driven      | WHEN a person activates "Today" THE SYSTEM SHALL set the date field to `todayOf(new Date())` (§17 REQ-17.1: the browser's local calendar day written `YYYY-MM-DD`, four-digit year), replacing whatever the field held, with `new Date()` read at that activation and not taken from the day read at mount (§17 REQ-17.7).                       |
| REQ-37.3 | Unwanted behavior | IF "Today" is activated THEN THE SYSTEM SHALL NOT submit the form, call `setTodoDueDateAction`, change the stored due date, leave edit mode or change the row's message; the date is saved only when the person activates "Update due date" or presses Enter in the field, as in §15 (REQ-15.2).                                                 |
| REQ-37.4 | Event-driven      | WHEN Escape (as defined in §28 REQ-28.1) is pressed while "Today" has focus THE SYSTEM SHALL do what §28 REQ-28.1 to REQ-28.4 specify for Escape in the field: leave edit mode, show the stored due date, cancel the key's default action, make no save, discard the draft and remove the row's message.                                         |
| REQ-37.5 | State-driven      | WHILE a save of that todo's due date is in flight THE SYSTEM SHALL disable "Today", as it disables "Update due date" (§15), and ignore Escape on it (§28 REQ-28.5); a key other than Escape on "Today", or Escape with Ctrl, Meta, Alt or Shift, keeps the browser's behavior for a button (§28 REQ-28.6): no `preventDefault`, edit mode stays. |
| REQ-37.6 | Ubiquitous        | THE SYSTEM SHALL show no "Today" button outside edit mode, so the row's markup in view mode is the one of §15, §17 and §31, and the `Due today` marker of §31 stays plain text in its own element with no role and no control.                                                                                                                   |

Edits to other sections that this one makes (D-37):

- §15 REQ-15.6 and the §15 contract list the "Today" button among the edit form's children (written as an ordered
  list of the form's buttons, so a later section extends it by adding to the list).
- §28 REQ-28.7 limits §28's own change (Escape in the field); it does not apply to §37. The Escape reactions of
  §28 stay as they are: none on `document.body`, on "Update due date", in a title field or in any other box. §37 adds
  one: on "Today" (REQ-37.4).
- The "a new control" lines of §17's and §31's Out of scope limit those sections' own markers; they do not apply to
  §37's button.
- REQ-17.8 and REQ-31.7 describe the marker in view mode, where the row holds exactly one button named "Edit due
  date"; they do not apply to edit mode, where "Edit due date" is replaced by the form and its two buttons.

## Acceptance criteria

| ID      | Covers                       | Given                                                                                                                                                                                                                                                                 | When                                                                                                                                                                                           | Then (measurable)                                                                                                                                                                                                                                                                                                                                                                  |
| ------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-37.1 | REQ-37.1, REQ-37.6           | `<TodoDueDate todoId="todo-9" dueDate="2026-11-05">` with `setTodoDueDateAction` mocked at `@/actions/todos`                                                                                                                                                          | it renders, then the person clicks "Edit due date"                                                                                                                                             | before the click 0 elements with role `button` named "Today"; after it the `form`'s element children are exactly 4, in order: the `label` "Due date", the `input` of `type` `date`, a `button` named "Today" with `type` `button` and text content exactly `Today`, a `button` named "Update due date" with `type` `submit`                                                        |
| AC-37.2 | REQ-37.2, REQ-37.3           | system time set to the local `new Date(2026, 10, 1, 12, 0, 0)`; `<TodoDueDate todoId="todo-9" dueDate={…}>` with `dueDate` (a) `'2026-10-20'`, (b) `undefined`, in edit mode, the field typed to `2026-12-01`, action mocked resolving `{ ok: true, data: <a todo> }` | the person clicks "Today"; then clicks "Update due date"                                                                                                                                       | after "Today", in (a) and (b): the field's value is exactly `2026-11-01`, 1 field labelled "Due date" is still shown, 0 elements with role `alert`, `setTodoDueDateAction` called 0 times; after "Update due date" the action is called once with `('todo-9', '2026-11-01')` and the field is gone                                                                                 |
| AC-37.3 | REQ-37.2                     | system time as in AC-37.2 at `new Date(2026, 10, 1, 23, 59, 58)`; `<TodoDueDate todoId="todo-9" dueDate="2026-10-20">` rendered, "Edit due date" clicked                                                                                                              | the system time is moved to the local `new Date(2026, 10, 2, 0, 0, 1)` and the person clicks "Today"; the time is moved to `new Date(2026, 0, 5, 9, 0, 0)` and the person clicks "Today" again | after the first click the field's value is exactly `2026-11-02` (the day read at the click, not `2026-11-01` read at mount); after the second exactly `2026-01-05` (month and day zero-padded)                                                                                                                                                                                     |
| AC-37.4 | REQ-37.4                     | `<TodoDueDate todoId="todo-9" dueDate="2026-11-05">` in edit mode, the field set to `2026-12-01`, a save earlier rejected with `{ dueDate: ['Due date must be a valid date'] }` so the wrapper shows that alert, "Today" focused                                      | the person presses Escape (a cancelable keydown) on "Today"; then clicks "Edit due date"                                                                                                       | after the Escape 0 elements labelled "Due date", 0 elements with role `alert`, the text `Due 2026-11-05` in the document exactly once, 1 button named "Edit due date", the event's `defaultPrevented` is `true`; `setTodoDueDateAction` called exactly once (the rejected save); after "Edit due date" the field's value is `2026-11-05`                                           |
| AC-37.5 | REQ-37.5                     | edit mode on `2026-11-05`, the field holding `2026-12-01`; (a) the save of `2026-12-01` started and its action promise not yet resolved; (b) no save in flight                                                                                                        | (a) the person presses Escape on "Today", then the save resolves `ok`; (b) the person presses Ctrl+Escape, Meta+Escape, Alt+Escape, Shift+Escape and ArrowLeft on "Today"                      | (a) while pending the button named "Today" is disabled, the field is still present and holds `2026-12-01`, `defaultPrevented` is `false`; after the resolution 0 elements labelled "Due date"; the action is called once; (b) each time the field is still present with value `2026-12-01`, `defaultPrevented` is `false` and the action is not called                             |
| AC-37.6 | REQ-37.1, REQ-37.2, REQ-37.3 | a todo B (open, due `2026-11-05`), the browser on `/` (client hydrated), its local day `<today>` read from the browser's own `new Date()` local fields as in AC-17.7                                                                                                  | the person edits B's due date and clicks "Today"; then focuses "Today" and presses Escape; then edits again, clicks "Today" and clicks "Update due date"; then reloads                         | after the first "Today" the field reads `<today>` and 0 requests to `/` with method POST were made; after the Escape 0 "Due date" fields and B's row reads `Due 2026-11-05` with 0 POST requests; after "Update due date" B's row reads `Due <today>` and, B being open, exactly 1 element with the text `Due today` in it; the same after the reload; the list order is unchanged |

## Function contracts

```ts
// src/components/todo-due-date.tsx (§15, §17, §28, §31, extended; no new component, props unchanged)
export function TodoDueDate({
  todoId,
  dueDate,
}: {
  readonly todoId: string;
  readonly dueDate: string | undefined;
}): ReactNode; // as §31, plus: in edit mode the <form> holds, in order, the visually hidden <label> "Due date", the <input type="date">, <button type="button" onClick> with the text `Today` (disabled while pending), and the submit button "Update due date"; the click sets the draft to todayOf(new Date()) (§17, imported from '@/lib/todo-overdue'), read inside the handler, and does nothing else; its onKeyDown is the §28 handler of the field (Escape, no Ctrl/Meta/Alt/Shift, not pending → preventDefault, leave edit mode, draft ← dueDate ?? '', clear the message)
```

The only file of `src/` this section changes is `src/components/todo-due-date.tsx`. No new export, Server Action,
Zod schema, Prisma model, query, environment variable, prop or lib function; `todayOf` is used as it is.
`src/app/page.tsx`, `src/actions/todos.ts`, `src/components/todo-item.tsx` and `src/lib/*` keep their contracts.

## Out of scope

A button that clears the date (a later section), buttons for tomorrow or next week, a calendar pop-up of our own,
saving on the click, moving focus after the click, restoring focus to "Edit due date" after Escape (§28), a keyboard
shortcut for "Today", announcing the filled day to assistive technology, a "Today" control outside edit mode, a
timer that re-reads the day while the editor stays open, the server's or a stored time zone, undo.

## Unchanged behavior

| Behavior                                                     | Proof                                                                                                                                                                                                                                 |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The editor opens on the stored date, one "Update due date"   | `src/components/todo-due-date.test.tsx` :: "AC-15.6: edits to 2026-12-01, shows exactly 1 alert "Could not save, try again" in the wrapper with the field kept, then on the next success removes it and leaves edit mode"             |
| A row without a date shows no text and one edit button       | `src/components/todo-due-date.test.tsx` :: "AC-15.5: (b) with no dueDate the text content is exactly "", with 1 button "Edit due date", no alert and no "Due date" field"                                                             |
| Escape in the field still closes the editor without saving   | `src/components/todo-due-date.test.tsx` :: "AC-28.1: Escape in the field holding 2026-12-01 leaves 0 "Due date" fields, "Due 2026-11-05" exactly once, 1 button "Edit due date", defaultPrevented true and the action called 0 times" |
| Escape on the other button or on the body still does nothing | `src/components/todo-due-date.test.tsx` :: "AC-28.6: Escape on $name keeps the field with value 2026-12-01, defaultPrevented false and the action not called"                                                                         |
| The overdue marker still follows the date and the checkbox   | `src/components/todo-due-date-overdue.test.tsx` :: "AC-17.4: inside an li with a checked box shows 0 "Overdue", unchecked exactly 1, checked again 0; outside any li it is shown"                                                     |
| The due-today marker still follows the checkbox              | `src/components/todo-due-date-today.test.tsx` :: "AC-31.3: inside an li with a checked box shows 0 "Due today" and "Due 2026-11-01" once, unchecked exactly 1, checked again 0"                                                       |
