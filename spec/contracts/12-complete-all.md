# §14 Todos: mark all complete

Tier: full

- [x] Lead approves spec (lead, 2026-10-31, plan gate of B2.3)

## Intent

A person who has done everything on the list marks every open item complete in one step, instead of ticking each
one. Items that were already complete stay as they are, the list keeps its order, and the list stays the same after a
reload. If the step cannot be saved, the person is told right beside the control and nothing changed.

## Requirements (EARS)

| ID        | Pattern           | Requirement                                                                                                                                                                                                                                                      |
| --------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| REQ-14.1  | Event-driven      | WHEN a person activates "Mark all complete" THE SYSTEM SHALL set the completion state of every todo that is not completed to completed.                                                                                                                          |
| REQ-14.2  | Event-driven      | WHEN all todos are marked complete THE SYSTEM SHALL keep every todo's title, keep every todo that was already completed as it was, and keep the same relative order (newest first, §5).                                                                          |
| REQ-14.3  | Event-driven      | WHEN all todos are marked complete THE SYSTEM SHALL report how many todos were changed from not completed to completed.                                                                                                                                          |
| REQ-14.4  | State-driven      | WHILE at least one todo is not completed THE SYSTEM SHALL show a button named "Mark all complete" that is enabled.                                                                                                                                               |
| REQ-14.5  | State-driven      | WHILE every todo is completed (including while no todo exists) THE SYSTEM SHALL show the button named "Mark all complete" disabled; it is never hidden.                                                                                                          |
| REQ-14.6  | Ubiquitous        | THE SYSTEM SHALL keep the result of marking all complete in PostgreSQL, refresh the page's list after it, so that the list and a full page reload show the same state.                                                                                           |
| REQ-14.7  | Unwanted behavior | IF no todo is open when marking all complete is requested THEN THE SYSTEM SHALL change nothing and report 0 changed (no criterion; covered by the lib test, see below).                                                                                          |
| REQ-14.8  | Unwanted behavior | IF marking all complete fails for any reason THEN THE SYSTEM SHALL change nothing, refresh nothing, report a field error on `form` with the §10 message, never a thrown error, and write exactly one log entry as §11 specifies, named `completeAllTodosAction`. |
| REQ-14.9  | Unwanted behavior | IF marking all complete fails as in REQ-14.8 THEN THE SYSTEM SHALL show the message directly after the "Mark all complete" button, keep the button usable, and keep every todo listed with the same title, state and order.                                      |
| REQ-14.10 | Event-driven      | WHEN the next attempt on the same button succeeds THE SYSTEM SHALL remove the message.                                                                                                                                                                           |

A mark-all is final in one step: there is no confirmation and no undo. Titles, completion and order are those of §5.
The failure message is the §10 text `Could not save, try again`, announced as an alert (`role="alert"`); the log entry,
its fields and its redaction are those of §11. No input exists, so there is no Zod step.

## Acceptance criteria

| ID      | Covers                                           | Given                                                                                                                                                                                            | When                                                                     | Then (measurable)                                                                                                                                                                                                                                                                                                 |
| ------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-14.1 | REQ-14.1, REQ-14.2, REQ-14.3                     | `prisma.todo.updateMany` (mocked at `@/lib/prisma`) resolves `{ count: 2 }`                                                                                                                      | `completeAllTodos()` runs                                                | resolves `2`; `updateMany` is called exactly once, with exactly `{ where: { completed: false }, data: { completed: true } }`; no other `prisma.todo` method is called                                                                                                                                             |
| AC-14.2 | REQ-14.3, REQ-14.6                               | `completeAllTodos` (mocked at `@/lib/todo-complete-all`) resolves `2`                                                                                                                            | `completeAllTodosAction()` runs                                          | resolves `{ ok: true, data: { updated: 2 } }`; `completeAllTodos` is called once with 0 arguments; `revalidatePath` is called once, with `'/'`                                                                                                                                                                    |
| AC-14.3 | REQ-14.8                                         | `completeAllTodos` rejects with `new Error('db down')`; `logMutationFailure` is observed at the module boundary (`@/lib/logger`)                                                                 | `completeAllTodosAction()` runs                                          | the promise resolves (does not reject) to exactly `{ ok: false, fieldErrors: { form: ['Could not save, try again'] } }`; `revalidatePath` is called 0 times; `completeAllTodos` is called once; `logMutationFailure` is called once, with `('completeAllTodosAction', <that Error>)`, before the promise resolves |
| AC-14.4 | REQ-14.4, REQ-14.5, REQ-14.1                     | `<CompleteAllButton disabled={…}>` rendered with `completeAllTodosAction` mocked at `@/actions/complete-all`; (a) `disabled` is `true`; (b) `disabled` is `false` and the action is held pending | (a) it renders; (b) it renders and the person clicks the button          | (a) exactly 1 element with role `button` named "Mark all complete", disabled; (b) exactly 1 such button, enabled before the click; the action is called once with 0 arguments; the button is disabled while the action is pending and enabled again once it resolves `{ ok: true, data: { updated: 1 } }`         |
| AC-14.5 | REQ-14.9, REQ-14.10                              | the button is enabled and `completeAllTodosAction` resolves `{ ok: false, fieldErrors: { form: ['Could not save, try again'] } }`; a later attempt resolves `{ ok: true, data: … }`              | the person clicks "Mark all complete", then clicks it again              | after the first click: exactly 1 element with role `alert`, text exactly `Could not save, try again`, in the same parent element as the button and after it; the button is enabled again; after the second click: 0 elements with role `alert`                                                                    |
| AC-14.6 | REQ-14.4, REQ-14.5, REQ-14.1, REQ-14.2, REQ-14.6 | (a) no stored todo; (b) stored todos in list order C (open), B (done), A (open), shown in the browser                                                                                            | (a) `/` renders; (b) the person clicks "Mark all complete", then reloads | (a) exactly 1 button named "Mark all complete", disabled; (b) before the click the button is enabled; before the reload and after it the list reads `[C, B, A]` (3 rows, same order), all 3 checkboxes checked, and the button is disabled                                                                        |

## Function contracts

```ts
// src/lib/todo-complete-all.ts (§14); Prisma only through '@/lib/prisma'
export function completeAllTodos(): Promise<number>; // one updateMany({ where: { completed: false }, data: { completed: true } }); resolves to its count (0 when none)
// src/actions/complete-all.ts ('use server')
export function completeAllTodosAction(): Promise<ActionResult<{ updated: number }>>; // no input to parse; one lib call, then revalidatePath('/'); any thrown value (lib or revalidatePath) resolves to failure('form', MUTATION_FAILED_MESSAGE) after logMutationFailure('completeAllTodosAction', error), nothing rethrown
// src/lib/logger.ts (§11): the union MutationActionName gains one member, 'completeAllTodosAction'; no other change to §11
// src/components/complete-all-button.tsx ('use client')
export function CompleteAllButton({ disabled }: { readonly disabled: boolean }): ReactNode; // button "Mark all complete"; calls completeAllTodosAction in a transition; disabled also while pending; after a failed result <p role="alert"> with fieldErrors.form?.[0] as the button's next sibling inside one wrapper element; a successful result clears it
// src/app/page.tsx: renders <CompleteAllButton disabled={!todos.some((todo) => !todo.completed)} /> outside the list (never a listitem), in both the empty and the non-empty state; where it sits among the other controls is the mounting card's choice
```

Lib test for REQ-14.7 (no criterion): `completeAllTodos()` with `updateMany` resolving `{ count: 0 }` resolves to `0`
and the update is still scoped to `completed: false`.

## Out of scope

Marking all incomplete (a toggle of the whole list), a confirmation dialog, undo, a message showing how many were
changed, marking only the todos in a filtered or searched view, two tabs acting at once, ordering by completion,
a Zod schema (there is no input).

## Unchanged behavior

| Behavior                                                   | Proof                                                                                                                                                                                                                      |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Toggling one todo still inverts and stores it              | `src/lib/todos.test.ts` :: "AC-5.4: inverts completed and stores it, twice in a row"                                                                                                                                       |
| A successful clear still returns the count and revalidates | `src/actions/todos.test.ts` :: "AC-9.1: deletes every completed todo, returns the count and revalidates / once"                                                                                                            |
| A failed clear still logs once with its own action name    | `src/actions/todos.test.ts` :: "AC-11.5: clearCompletedTodosAction resolves the form failure and logs ("clearCompletedTodosAction", the thrown error) exactly once"                                                        |
| The clear button keeps its disabled-while-pending state    | `src/components/clear-completed-button.test.tsx` :: "AC-9.2: stays disabled while the action is pending and is enabled again once it resolves"                                                                             |
| The clear button keeps its failure message and recovery    | `src/components/clear-completed-button.test.tsx` :: "AC-10.3: shows exactly one alert "Could not save, try again" right after the button and leaves it enabled when the action fails, then removes it on the next success" |
| The list is still newest first                             | `e2e/05-todos.spec.ts` :: "AC-5.1: lists todos newest first"                                                                                                                                                               |
| A toggled state still survives a reload                    | `e2e/05-todos.spec.ts` :: "AC-5.6: a created todo survives a reload, and so does its toggled state"                                                                                                                        |
