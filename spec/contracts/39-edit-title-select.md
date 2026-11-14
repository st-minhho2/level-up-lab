# §41 Todos: opening the title editor selects the whole title

Tier: full

- [ ] Lead approves spec

## Intent

A person who opens an item's title editor either retypes the whole title or changes a few letters of it. Today the
field opens unfocused, so one click and one select-all gesture come before the first useful key. After this section
the editor opens ready: the cursor is in the field and the current title is highlighted, so typing replaces it and an
arrow key moves into it. Nothing else about editing changes.

## Requirements (EARS)

| ID       | Pattern           | Requirement                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| -------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| REQ-41.1 | Event-driven      | WHEN a person activates the "Edit title" button of a row (§6 REQ-6.1) THE SYSTEM SHALL, with the title field shown, make that field `document.activeElement` and select all of its text: `selectionStart` equal to 0 and `selectionEnd` equal to the field's `value.length`, which is the stored title's `title.length` in UTF-16 code units (§6 REQ-6.1: the field holds the stored title).                                                                 |
| REQ-41.2 | Event-driven      | WHEN a row enters edit mode again after leaving it, by Escape (§24 REQ-24.1) or by a successful save (§6 REQ-6.2), THE SYSTEM SHALL do as REQ-41.1 for the title then stored, so the selection never depends on an earlier edit's draft or caret.                                                                                                                                                                                                            |
| REQ-41.3 | Unwanted behavior | IF a row that is already in edit mode stays in it after a rejected save (§6 REQ-6.4, REQ-6.5, REQ-6.6) or a failed save (§10 REQ-10.3), or re-renders for any other reason (a new `todo` prop, a save pending or settled, a message shown or removed, a key typed, a click in the field), THEN THE SYSTEM SHALL NOT focus a control or change a selection: the field keeps its draft, its focus state, `selectionStart` and `selectionEnd`.                  |
| REQ-41.4 | Ubiquitous        | THE SYSTEM SHALL move focus and set a selection only on the switch from view mode into edit mode (REQ-41.1, REQ-41.2): a row that renders in view mode, a row that leaves edit mode, and a row other than the one whose "Edit title" was activated receive no focus and keep their selection.                                                                                                                                                                |
| REQ-41.5 | Ubiquitous        | THE SYSTEM SHALL change nothing but focus and selection: the field's value, label, `id` and attributes, the order and names of the row's controls, the row's text content (§6, AC-5.1), the Escape, Enter and Tab behavior of §6 and §24, the "/" shortcut's treatment of a title field (§25 REQ-25.3) and the request count (none on activation) are those of §6, §24 and §25; a key typed while all of the text is selected replaces it as in any browser. |

Edits to other sections that this one makes (D-39): none. No requirement or criterion is lifted or edited.

The "`todo-item.tsx` unchanged" notes of the sections below limit each section's own change; they do not apply to
§41, whose component is `todo-item.tsx`:

- `22-escape-edit-title.md:44` (§24), `13-due-date.md:77`, `17-delete.md:58`, `18-created-date.md:56`,
  `15-overdue.md:61-62`, `19-clear-search.md:57`, `20-all-done.md:51`, `21-overdue-count.md:63`,
  `26-escape-due-date.md:48-49`, `33-delete-confirm.md:55`, `35-due-date-today.md:62` and
  `38-due-date-clear.md:69`, all in `spec/contracts/`. The file numbers are not the section numbers (the contract of
  §24 is `22-escape-edit-title.md`), so the notes are named by file and line.
- §24's Out of scope item "restoring focus to the 'Edit title' button" holds, and so does §6's "Cancelling an edit by
  blur": §41 says where focus goes on entering edit mode, never where it goes on leaving it.

## Acceptance criteria

| ID      | Covers                       | Given                                                                                                                                                                                                                                                          | When                                                                                                                                                                                                                    | Then (measurable)                                                                                                                                                                                                                                                                                                                                                       |
| ------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-41.1 | REQ-41.1, REQ-41.4           | `<TodoItem>` for the open todo `Buy mik`, `updateTodoTitleAction` mocked at `@/actions/todos`                                                                                                                                                                  | it renders; then the person clicks "Edit title"                                                                                                                                                                         | after the render `document.activeElement` is `document.body` and 0 elements with role `textbox`; after the click the text box "Edit title" is `document.activeElement`, its `selectionStart` is 0 and its `selectionEnd` is 7; `updateTodoTitleAction` called 0 times                                                                                                   |
| AC-41.2 | REQ-41.1                     | `<TodoItem>` for the todo titled `Café 😀` (`title.length` 7: the emoji is two code units)                                                                                                                                                                     | the person clicks "Edit title"                                                                                                                                                                                          | the text box "Edit title" has value `Café 😀`, is `document.activeElement`, `selectionStart` is 0 and `selectionEnd` is 7                                                                                                                                                                                                                                               |
| AC-41.3 | REQ-41.2                     | `<TodoItem>` for `Buy mik`; edit mode entered, the field's value replaced by the draft `Buy milk`, its selection set to the range 2 to 4; (a) Escape pressed; (b) instead the action resolves `{ ok: true, data: { …, title: 'Buy milk' } }` and Enter pressed | the person clicks "Edit title" again after (a); in (b) the `todo` prop is then re-rendered with the title `Buy milk` and the person clicks "Edit title"                                                                 | (a) the field's value is `Buy mik`, it is `document.activeElement`, `selectionStart` is 0 and `selectionEnd` is 7; (b) the field's value is `Buy milk`, it is `document.activeElement`, `selectionStart` is 0 and `selectionEnd` is 8                                                                                                                                   |
| AC-41.4 | REQ-41.3                     | `<TodoItem>` for `Buy mik` in edit mode, the field's value replaced by `Buy milk` and its selection set to the range 2 to 4; (a) the action resolves `{ ok: false, fieldErrors: { title: ['Title is required'] } }`; (b) it resolves `saveFailed()`            | the person presses Enter and the result settles; the `alert` appears; the `todo` prop is re-rendered with a new object of the same title; the person then focuses another control, "Save", and the result settles again | in (a) and (b) the field's value is still `Buy milk`, exactly 1 `alert` is shown with the action's message, and the field's `selectionStart` is still 2 and `selectionEnd` still 4 after the result; after the focus moved to "Save" `document.activeElement` is that button, not the field (no focus is taken back); `updateTodoTitleAction` was called once per Enter |
| AC-41.5 | REQ-41.3, REQ-41.5           | `<TodoItem>` for `Buy mik` in edit mode, all of the text selected (AC-41.1)                                                                                                                                                                                    | the person types `Z`; then types `a`; then presses ArrowLeft                                                                                                                                                            | after `Z` the value is exactly `Z` and the caret is at 1 (`selectionStart` and `selectionEnd` both 1); after `a` the value is `Za` and the caret at 2; after ArrowLeft the caret is at 1; at no step does the whole text become selected again; the row's text content outside the field is unchanged                                                                   |
| AC-41.6 | REQ-41.1, REQ-41.4, REQ-41.5 | stored todos B (open) titled `Buy mik` and A (open) titled `Walk the dog`, the browser on `/` (client hydrated), B above A                                                                                                                                     | the person clicks the "Edit title" button of B's row; reads in the page `document.activeElement` and the field's selection; presses `Z`; clicks Save; reloads                                                           | after the click the active element is the row's text field, `selectionStart` 0 and `selectionEnd` 7, and 0 requests to `/` with method POST were made; A's row still shows its title and 1 button "Edit title"; after `Z` the field's value is exactly `Z`; after Save B's row reads `Z` and after the reload the list reads `[Z, Walk the dog]`                        |

## Function contracts

```ts
// src/components/todo-item.tsx (§7, §6, §24, §19, §20, §10, extended; no new component, props unchanged)
export function TodoItem({ todo }: { readonly todo: Todo }): ReactNode; // as before, plus: when the row changes from view mode into edit mode (the click of "Edit title", onEdit), after the title <input> is in the document it receives focus and select(), once for that switch; a re-render in edit mode, a rejected or failed save, a changed todo prop, and the exit from edit mode do not call focus() or select() or set a selection range
```

The only file of `src/` this section changes is `src/components/todo-item.tsx`. No new export, Server Action, Zod
schema, Prisma model, query, environment variable, prop or lib function. `src/app/page.tsx`,
`src/actions/todos.ts`, `src/components/todo-due-date.tsx`, `src/components/delete-todo-button.tsx` and `src/lib/*`
keep their contracts.

How the criteria observe it: jsdom supports `focus()`, `document.activeElement`, `selectionStart`, `selectionEnd` and
`setSelectionRange` on a text `input`, so AC-41.1 to AC-41.5 are component tests with Testing Library; AC-41.6 is a
Playwright test that reads `document.activeElement`, `selectionStart` and `selectionEnd` with `page.evaluate`. The
tests that set a selection do so with `setSelectionRange` on the field before the event under test.

## Out of scope

Restoring focus to the "Edit title" button after Escape or a save (§24), moving focus anywhere on leaving edit mode,
selecting the title on a click into the field, focusing the field of a row other than the one activated, selecting
text in the due-date field (§15), the new-todo box (§5) or the search box (§16), scrolling the row into view, a
visible highlight style of our own, entering edit mode by double-click or by a key, `selectionDirection`, undo,
announcing the selection to assistive technology.

## Unchanged behavior

| Behavior                                                | Proof                                                                                                                                                                                                                 |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Activating edit shows the title in a field              | `src/components/todo-item.test.tsx` :: "AC-6.1: shows one text field named "Edit title" with the current title"                                                                                                       |
| A rejected title keeps the draft and message            | `src/components/todo-item.test.tsx` :: "AC-6.4: keeps the draft and shows the error when the action rejects the title"                                                                                                |
| A failed save keeps the draft in edit mode              | `src/components/todo-item.test.tsx` :: "AC-10.2: shows exactly one alert "Could not save, try again" in the row and keeps the draft "Walk the cat" in edit mode when Save fails, then removes it on the next success" |
| Escape leaves edit mode and shows the stored title      | `src/components/todo-item.test.tsx` :: "AC-24.1: 0 textbox roles; the row's label reads "Buy mik"; 1 button named "Edit title"; updateTodoTitleAction called 0 times"                                                 |
| The next edit after Escape shows the stored title       | `src/components/todo-item.test.tsx` :: "AC-24.2: the field's value is "Buy mik" when editing is activated again after the Escape"                                                                                     |
| Enter submits, ArrowLeft only moves within the field    | `src/components/todo-item.test.tsx` :: "AC-24.5: Enter calls updateTodoTitleAction once with ("todo-9", "Buy milk"); ArrowLeft keeps the field present and does not call the action"                                  |
| The idle row text is still the title                    | `src/components/todo-item.test.tsx` :: "AC-5.1: renders the title as the accessible name of an unchecked checkbox when not completed"                                                                                 |
| The delete button is still the row's only other control | `src/components/todo-item.test.tsx` :: "AC-35.3: asks 0 confirmations on render and on "Edit title", holds exactly 1 button "Delete todo" in view mode and in edit mode, and adds no text to the row"                 |
| A saved title survives a reload                         | `e2e/06-edit-title.spec.ts` :: "AC-6.2: a saved title survives a reload"                                                                                                                                              |
| Escape discards the draft and makes no request          | `e2e/24-escape-edit-title.spec.ts` :: "AC-24.6: 0 textbox roles after the Escape; 0 POST requests to / between the Escape and the reload; after the reload the list reads [C, B, A] and B is still checked"           |
