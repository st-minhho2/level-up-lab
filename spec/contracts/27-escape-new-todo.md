# §29 Todos: Escape clears the new-todo title

Tier: full

- [ ] Lead approves spec

## Intent

A person who started typing a title in the "New todo" box (§5) and changed their mind gets back to an empty box, and a
counter (§18) that agrees with it, with one key, without the mouse and without selecting the text. A key pressed
anywhere else does nothing new. Nothing is saved and nothing stored changes.

## Requirements (EARS)

| ID       | Pattern           | Requirement                                                                                                                                                                                                                                                                                                                      |
| -------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| REQ-29.1 | Event-driven      | WHEN Escape (`KeyboardEvent.key` equal to `'Escape'`, no Ctrl, Meta, Alt or Shift held: §27's `isSearchEscape`) is pressed while the "New todo" box (§5) has focus and no save is pending THE SYSTEM SHALL empty the box and cancel the key's default action (`preventDefault`).                                                 |
| REQ-29.2 | Event-driven      | WHEN REQ-29.1 applies THE SYSTEM SHALL show the counter of §18 as `0 / 200` by the time that key event has been handled, whatever the box held before (typed text, a value set without a change event, more than 200 code units), and keep the counter equal to the box's value afterwards (§18 REQ-18.6).                       |
| REQ-29.3 | Ubiquitous        | THE SYSTEM SHALL change nothing stored by Escape: no Server Action is called, no request is made, and no todo, order (§5), count (§13, §23), filter (§12) or search (§16) changes; the address stays as it is.                                                                                                                   |
| REQ-29.4 | State-driven      | WHILE a save of the form is pending (§10, the "Add" button disabled) THE SYSTEM SHALL ignore Escape in the box (no `preventDefault`, the box keeps its text), so that the box is emptied or refilled only by the save's own result (§18 REQ-18.7).                                                                               |
| REQ-29.5 | Unwanted behavior | IF a key other than Escape is pressed in the box, or Escape with Ctrl, Meta, Alt or Shift, THEN THE SYSTEM SHALL keep the behavior of §5 and §18: Enter submits, any other key edits or moves within the box, no `preventDefault`, the text and the counter unchanged by the key itself.                                         |
| REQ-29.6 | Ubiquitous        | THE SYSTEM SHALL react to Escape only when the key is pressed in the "New todo" box: Escape on `document.body`, on the "Add" button, in the "Search todos" box (§27), in a title field (§6, §24) or in a due-date field (§28) does nothing here.                                                                                 |
| REQ-29.7 | Ubiquitous        | THE SYSTEM SHALL leave unchanged the box's markup, accessible name "New todo", field name `title`, `maxlength` 200, description (§18 REQ-18.8), the data a later submit sends (the value the box then holds), and the single `role="alert"` message of §5 and §10: Escape neither adds nor removes it, and adds no visible text. |

"The box's value" is the one §18 counts. Blur is not Escape. After Escape the box is an ordinary empty box: pressing
"Add" on it gets §5's `Title is required` as it does today.

## Acceptance criteria

| ID      | Covers                         | Given                                                                                                                                                                                       | When                                                                                                                 | Then (measurable)                                                                                                                                                                                                                                                                       |
| ------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-29.1 | REQ-29.1, REQ-29.2, REQ-29.3   | `<TodoForm>` rendered, `createTodoAction` mocked, "New todo" focused and `Buy milk` typed (counter `8 / 200`)                                                                               | the person presses Escape (a cancelable keydown) in the box                                                          | the box's value is `''`, the event's `defaultPrevented` is `true`, the counter reads exactly `0 / 200`, `createTodoAction` has 0 calls and the box's accessible name is still "New todo"                                                                                                |
| AC-29.2 | REQ-29.1, REQ-29.2             | `<TodoForm>` rendered; case (a) the box empty; case (b) the value `x` ×201 set by a script with no input event; case (c) `  hi  ` typed                                                     | the person presses Escape in the box, each case on its own render                                                    | in each case the value is `''`, `defaultPrevented` is `true`, the counter reads exactly `0 / 200` and `createTodoAction` has 0 calls                                                                                                                                                    |
| AC-29.3 | REQ-29.5                       | `<TodoForm>` with `Buy milk` in the box, `createTodoAction` mocked                                                                                                                          | the person presses `a`, ArrowLeft, `Esc`, `escape`, Ctrl+Escape, Meta+Escape, Alt+Escape and Shift+Escape in the box | for each key `defaultPrevented` is `false`, the value is still `Buy milk` (the test types no character), the counter reads `8 / 200` and `createTodoAction` has 0 calls; Enter calls `createTodoAction` exactly once with the form data `title` equal to `Buy milk`                     |
| AC-29.4 | REQ-29.6                       | `<TodoForm>` rendered next to a text box named "Search todos" and a button named "Other"; `Buy milk` in "New todo"                                                                          | the person presses Escape on `document.body`, on the button "Add", on "Other" and in "Search todos"                  | each time `defaultPrevented` is `false`, the "New todo" value is still `Buy milk`, the counter reads `8 / 200` and `createTodoAction` has 0 calls                                                                                                                                       |
| AC-29.5 | REQ-29.4, REQ-29.3             | `<TodoForm>` whose `createTodoAction` returns a promise that stays pending; `Buy milk` typed and "Add" clicked                                                                              | the person presses Escape in the box, then the save resolves `{ ok: true, data: <a todo> }`                          | after the Escape `defaultPrevented` is `false`, the box holds `Buy milk`, the counter reads `8 / 200`, "Add" is disabled; after the resolution the box is `''` and the counter `0 / 200`; `createTodoAction` was called exactly once                                                    |
| AC-29.6 | REQ-29.2, REQ-29.3, REQ-29.7   | `<TodoForm>` whose `createTodoAction` resolves `{ ok: false, fieldErrors: { form: ['Could not save, try again'] } }` once, then `{ ok: true, data: <a todo> }`; `Buy milk` saved and failed | the person presses Escape in the box, types `Walk the dog` and clicks "Add"                                          | after the Escape the box is `''`, the counter `0 / 200` and exactly 1 alert "Could not save, try again" remains; `createTodoAction` has been called twice, the second time with `title` equal to `Walk the dog`; after that success the box is `''`, the counter `0 / 200` and 0 alerts |
| AC-29.7 | REQ-29.1 to REQ-29.3, REQ-29.6 | stored todos B "Walk the dog" and A "Buy milk" (newest first `[B, A]`); the browser on `/` (client hydrated)                                                                                | the person clicks "New todo", types `Buy eggs`, presses Escape; then types `Call mom`, presses Enter                 | after the Escape the box is empty, the counter reads `0 / 200`, rows read `[B, A]`, the address is `/` and 0 POST requests were made; after Enter rows read `[Call mom, B, A]` with `Call mom` the only new row, and the same after a reload                                            |

## Function contracts

```ts
// src/components/todo-form.tsx (§5, §10, §18, extended by §29; already 'use client')
// TodoForm(): ReactNode — signature and markup unchanged; the "New todo" input gains an onKeyDown: when
// isSearchEscape(event) (§27, imported from '@/lib/escape-search') and no save is pending (`pending` from
// useActionState) → event.preventDefault(), set the box's value to '' through the existing `box` ref and setDraft('').
// No new export, prop, Server Action, Zod schema, Prisma model, query, environment variable or `src/lib` file.
```

The only file of `src/` this section changes is `src/components/todo-form.tsx`; `src/app/page.tsx`,
`src/actions/todos.ts`, `src/lib/*` (including `escape-search.ts`, `title-count.ts`) and every other component do not
change (D-33).

## Out of scope

Any key other than Escape in the box, Escape outside the box, removing a shown message of §5 or §10 with the key, a
visible hint for the key, a confirmation when the box holds text, remembering or undoing the cleared text, restoring
focus, IME composition handling, Escape while a dialog is shown, a new `src/lib` predicate for this key (§27's is
reused, not changed).

## Unchanged behavior

| Behavior                                                   | Proof                                                                                                                                                                                                                                                                                                              |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A submit still sends the title and clears the box          | `src/components/todo-form.test.tsx` :: "AC-5.2: submits the typed title and clears the box on success"                                                                                                                                                                                                             |
| A failed save still keeps the title and shows one alert    | `src/components/todo-form.test.tsx` :: "AC-10.5: shows 1 alert "Could not save, try again" in the form, keeps "Buy milk" in the box and "Add" enabled after a failed save, then shows 0 alerts and an empty box after the next save succeeds"                                                                      |
| The counter still follows typing and the box's description | `src/components/todo-form.test.tsx` :: "AC-18.3: shows exactly 1 counter "0 / 200" (id new-todo-count, no alert, status or aria-live) as the box description, then "8 / 200" after typing Buy milk, "2 / 200" for " hi " and for a pasted 😀, keeps maxlength 200 and the name "New todo", and submits only title" |
| The counter still follows the box while a save is pending  | `src/components/todo-form.test.tsx` :: "AC-18.6: while a save is pending shows Buy milk now and "12 / 200", keeps both after the failure, and shows an empty box and "0 / 200" after a success"                                                                                                                    |
| The counter still reads 0 after an add and a reload        | `e2e/18-title-counter.spec.ts` :: "AC-18.7: the counter reads 0, 8, 200 (still 200 after a refused y), 195, then 0 after adding Walk the dog and 0 after a reload, with aria-describedby new-todo-count throughout"                                                                                                |
| Escape still clears the search box, not the new-todo box   | `e2e/27-escape-search.spec.ts` :: "AC-27.6: on /?filter=active&q=milk ([D]) Escape in "Search todos" opens exactly /?filter=active with an empty box, rows [D, B], no "Clear search" link and 0 POSTs; then /, zzz and Escape with no search in effect leave the address unchanged, the box empty and 0 requests"  |
