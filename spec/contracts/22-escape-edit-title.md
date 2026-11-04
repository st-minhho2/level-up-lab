# §24 Todos: Escape cancels a title edit

Tier: full

- [ ] Lead approves spec

## Intent

A person who opened a title edit by mistake, or who changed their mind while typing, leaves the edit with one key and
finds the row exactly as it was: the stored title, no save made, nothing typed carried into the next edit.

## Requirements (EARS)

| ID       | Pattern           | Requirement                                                                                                                                                                                          |
| -------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| REQ-24.1 | Event-driven      | WHEN a person presses Escape in the title field of a todo being edited THE SYSTEM SHALL leave edit mode and show that todo's stored title in the row.                                                |
| REQ-24.2 | Event-driven      | WHEN Escape leaves edit mode THE SYSTEM SHALL make no save: no call to `updateTodoTitleAction`, so the stored title, completion state and position are unchanged (§6 REQ-6.3, REQ-6.4).              |
| REQ-24.3 | Event-driven      | WHEN Escape leaves edit mode THE SYSTEM SHALL discard the draft, so that the next activation of editing shows the stored title (§6 REQ-6.1) and not the discarded text.                              |
| REQ-24.4 | Event-driven      | WHEN Escape leaves edit mode THE SYSTEM SHALL remove the row's message of a rejected or failed save (§6 REQ-6.5, REQ-6.6, §10).                                                                      |
| REQ-24.5 | State-driven      | WHILE a save of that row is in flight THE SYSTEM SHALL ignore Escape, so that the edit ends only through the save's own result.                                                                      |
| REQ-24.6 | Unwanted behavior | IF a key other than Escape is pressed in the title field THEN THE SYSTEM SHALL keep the behavior of §6: Enter submits the draft, any other key edits or moves within the field, and edit mode stays. |

Blur is not Escape: leaving the field by click or Tab keeps the edit open as §6 does today.

## Acceptance criteria

| ID      | Covers             | Given                                                                                           | When                                                   | Then (measurable)                                                                                                                                                            |
| ------- | ------------------ | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-24.1 | REQ-24.1, REQ-24.2 | one todo titled `Buy mik` in edit mode, the field holding the draft `Buy milk`                  | the person presses Escape in the field                 | 0 `textbox` roles; the row's label reads `Buy mik`; 1 button named "Edit title"; `updateTodoTitleAction` called 0 times                                                      |
| AC-24.2 | REQ-24.3           | as AC-24.1, after the Escape                                                                    | the person activates editing again                     | the field's value is `Buy mik`                                                                                                                                               |
| AC-24.3 | REQ-24.4           | edit mode on `Buy mik`, a save of `   ` rejected, the row showing the alert "Title is required" | the person presses Escape                              | 0 `alert` roles in the row; 0 `textbox` roles                                                                                                                                |
| AC-24.4 | REQ-24.5           | edit mode, the save of `Buy milk` started and its action promise not yet resolved               | the person presses Escape, then the save resolves `ok` | after the Escape the field is still present and holds `Buy milk`; after the resolution 0 `textbox` roles; `updateTodoTitleAction` called exactly once                        |
| AC-24.5 | REQ-24.6           | edit mode on `Buy mik`, the field holding `Buy milk`                                            | the person presses Enter; separately presses ArrowLeft | Enter: `updateTodoTitleAction` called once with `('todo-9', 'Buy milk')`; ArrowLeft: the field is still present and the action not called                                    |
| AC-24.6 | REQ-24.1, REQ-24.2 | stored todos C (open), B (done), A (open), the browser on `/` (client hydrated)                 | edit B, type `B2`, press Escape, reload                | 0 `textbox` roles after the Escape; 0 requests to `/` with method POST between the Escape and the reload; after the reload the list reads `[C, B, A]` and B is still checked |

## Function contracts

```ts
// src/components/todo-item.tsx: TodoItem({ todo }) props unchanged; the title text field gains a keydown handler
// for Escape (leaves edit mode, resets the draft to todo.title, clears the row's message; ignored while pending).
// No new export, Server Action, Zod schema, Prisma model, query or prop.
```

The only file of `src/` this section changes is `src/components/todo-item.tsx`; `src/app/page.tsx`,
`src/actions/todos.ts` and `src/lib/*` stay as they are (D-30: one component per card in the batch).

## Out of scope

Cancelling by blur or by clicking elsewhere, a "Cancel" button, a confirmation when the draft differs, restoring
focus to the "Edit title" button, Escape in other fields (due date §15, search §16), Escape while no field is open,
undo, announcing the cancellation to assistive technology.

## Unchanged behavior

| Behavior                                       | Proof                                                                                                                                                                                                                 |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Activating edit shows the title in a field     | `src/components/todo-item.test.tsx` :: "AC-6.1: shows one text field named "Edit title" with the current title"                                                                                                       |
| Saving still submits the draft and leaves edit | `src/components/todo-item.test.tsx` :: "AC-6.2: submits the draft to updateTodoTitleAction and leaves edit mode"                                                                                                      |
| A rejected title keeps the draft and message   | `src/components/todo-item.test.tsx` :: "AC-6.4: keeps the draft and shows the error when the action rejects the title"                                                                                                |
| A failed save keeps the draft in edit mode     | `src/components/todo-item.test.tsx` :: "AC-10.2: shows exactly one alert "Could not save, try again" in the row and keeps the draft "Walk the cat" in edit mode when Save fails, then removes it on the next success" |
| A saved title survives a reload                | `e2e/06-edit-title.spec.ts` :: "AC-6.2: a saved title survives a reload"                                                                                                                                              |
| An edited todo keeps position and completion   | `e2e/06-edit-title.spec.ts` :: "AC-6.3: an edited todo keeps its position and completion state"                                                                                                                       |
| The idle row text is still the title           | `src/components/todo-item.test.tsx` :: "AC-5.1: renders the title as the accessible name of an unchecked checkbox when not completed"                                                                                 |
