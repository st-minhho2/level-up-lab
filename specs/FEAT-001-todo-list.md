# FEAT-001: Todo list

| Field  | Value                                                                                                                 |
| ------ | --------------------------------------------------------------------------------------------------------------------- |
| Tier   | `full`                                                                                                                |
| Status | `implemented`                                                                                                         |
| Owner  | minh.ho2                                                                                                              |
| Slice  | `src/lib/todos.ts`, `src/lib/todo-schema.ts`, `src/actions/todos.ts`, `src/app/page.tsx`, `src/components/todo-*.tsx` |
| PR     | <link once open>                                                                                                      |

- [x] **Lead approves spec** (minh.ho2, 2026-10-28)

## 1. Intent

A single person wants to keep a list of things to do that survives closing the browser: they can add an item,
see every item they added with the newest first, and mark an item done or not done again. We know it worked when
an item added or toggled on one visit is still there, in the same state, on the next visit.

## 2. Requirements (EARS)

| ID    | Pattern           | Requirement                                                                                                                                                      |
| ----- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| REQ-1 | Ubiquitous        | THE SYSTEM SHALL show every todo on `/` ordered by creation time, newest first, each with its title and its completion state.                                    |
| REQ-2 | Event-driven      | WHEN a user submits a title that is 1 to 200 characters long after trimming whitespace THE SYSTEM SHALL store it as a not-completed todo with the trimmed title. |
| REQ-3 | Unwanted behavior | IF the submitted title is empty after trimming, or longer than 200 characters THEN THE SYSTEM SHALL store nothing and report a field error on `title`.           |
| REQ-4 | Event-driven      | WHEN a user toggles a todo THE SYSTEM SHALL invert its completion state and store it.                                                                            |
| REQ-5 | Unwanted behavior | IF a toggle names a todo id that does not exist THEN THE SYSTEM SHALL change nothing and report a field error on `id`.                                           |
| REQ-6 | Ubiquitous        | THE SYSTEM SHALL keep todos in PostgreSQL so that a full page reload shows the same list and states.                                                             |
| REQ-7 | State-driven      | WHILE no todo exists THE SYSTEM SHALL show the text "No todos yet".                                                                                              |

## 3. Acceptance criteria (max 7)

| ID   | Covers                                                                                                                                                   | Given            | When    | Then (measurable) |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------- | ----------------- |
| AC-1 | `src/lib/todos.test.ts` :: AC-1; `src/components/todo-item.test.tsx` :: AC-1; `e2e/FEAT-001-todo-list.spec.ts` :: AC-1                                   | 61cb3f4, 7af9887 | this PR |
| AC-2 | `src/lib/todo-schema.test.ts` :: AC-2; `src/lib/todos.test.ts` :: AC-2; `src/actions/todos.test.ts` :: AC-2; `src/components/todo-form.test.tsx` :: AC-2 | 61cb3f4, 7af9887 | this PR |
| AC-3 | `src/lib/todo-schema.test.ts` :: AC-3 (×2); `src/actions/todos.test.ts` :: AC-3 (×2); `src/components/todo-form.test.tsx` :: AC-3                        | 61cb3f4, 7af9887 | this PR |
| AC-4 | `src/lib/todos.test.ts` :: AC-4; `src/actions/todos.test.ts` :: AC-4; `src/components/todo-item.test.tsx` :: AC-4                                        | 61cb3f4, 7af9887 | this PR |
| AC-5 | `src/lib/todos.test.ts` :: AC-5; `src/actions/todos.test.ts` :: AC-5; `src/components/todo-item.test.tsx` :: AC-5                                        | 61cb3f4, 7af9887 | this PR |
| AC-6 | `e2e/FEAT-001-todo-list.spec.ts` :: AC-6                                                                                                                 | 61cb3f4, 7af9887 | this PR |
| AC-7 | `src/components/todo-form.test.tsx` :: AC-7; `e2e/FEAT-001-todo-list.spec.ts` :: AC-7                                                                    | 61cb3f4, 7af9887 | this PR |

## 4. Out of scope

- Editing or deleting a todo.
- More than one user, accounts, sharing.
- Due dates, ordering by anything but creation time, filtering done items.
- Optimistic UI; the list re-renders after the action completes.

## 5. Unchanged behavior

| Behavior                                                           | Proof                                                                |
| ------------------------------------------------------------------ | -------------------------------------------------------------------- |
| Home heading becomes "Todos" (smoke e2e updated in the red commit) | `e2e/smoke.spec.ts` :: "home page renders the lab title"             |
| `GET /api/health` still answers 200 `{ status: 'ok' }`             | `src/app/api/health/route.test.ts` :: "returns 200 with a JSON body" |
| Env validation unchanged                                           | `src/lib/env.test.ts` (8 tests)                                      |

## 6. Traceability (filled as work lands)

| AC   | Test (file :: title)                                                                                                                                     | Red commit       | Green commit |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------ |
| AC-1 | `src/lib/todos.test.ts` :: AC-1; `src/components/todo-item.test.tsx` :: AC-1; `e2e/FEAT-001-todo-list.spec.ts` :: AC-1                                   | 61cb3f4, 7af9887 | this PR      |
| AC-2 | `src/lib/todo-schema.test.ts` :: AC-2; `src/lib/todos.test.ts` :: AC-2; `src/actions/todos.test.ts` :: AC-2; `src/components/todo-form.test.tsx` :: AC-2 | 61cb3f4, 7af9887 | this PR      |
| AC-3 | `src/lib/todo-schema.test.ts` :: AC-3 (×2); `src/actions/todos.test.ts` :: AC-3 (×2); `src/components/todo-form.test.tsx` :: AC-3                        | 61cb3f4, 7af9887 | this PR      |
| AC-4 | `src/lib/todos.test.ts` :: AC-4; `src/actions/todos.test.ts` :: AC-4; `src/components/todo-item.test.tsx` :: AC-4                                        | 61cb3f4, 7af9887 | this PR      |
| AC-5 | `src/lib/todos.test.ts` :: AC-5; `src/actions/todos.test.ts` :: AC-5; `src/components/todo-item.test.tsx` :: AC-5                                        | 61cb3f4, 7af9887 | this PR      |
| AC-6 | `e2e/FEAT-001-todo-list.spec.ts` :: AC-6                                                                                                                 | 61cb3f4, 7af9887 | this PR      |
| AC-7 | `src/components/todo-form.test.tsx` :: AC-7; `e2e/FEAT-001-todo-list.spec.ts` :: AC-7                                                                    | 61cb3f4, 7af9887 | this PR      |

## 7. Open questions

- Should a duplicate title be rejected? Decision: no, duplicates are allowed; the list is personal. minh.ho2, 2026-10-28.
- Where does the toggle error surface in the UI? Decision: inline text under the item; e2e does not test it (AC-5 is unit-level). minh.ho2, 2026-10-28.
