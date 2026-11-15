# B7.6 advice

Card: B7.6, section §40 (`spec/contracts/38-due-date-clear.md`). Reference implementation: B7.3 / §37 ("Today"),
already in `src/components/todo-due-date.tsx` (the `onDueDateKeyDown` handler, shared with "Today").
Spec state read: §15 REQ-15.6, §15 contract, and §37 REQ-37.1 / REQ-37.3 already carry "Clear due date" (D-37, D-38).
AC-37.1 in `35-due-date-today.md` (rows 40-45) was edited too, so the old test below is now wrong against the spec.

## Approaches

**A (recommended): one `save(value)` helper shared by `onSave` and a new `onClear`.**

- Change: in `todo-due-date.tsx`, extract the body of `onSave` after `preventDefault()` into
  `function save(value: string): void { startTransition(async () => { … setTodoDueDateAction(todoId, value) … }) }`.
  `onSave` becomes `event.preventDefault(); save(draft);`. `onClear` is `save('')`. Add one
  `<button type="button" onClick={onClear} onKeyDown={onDueDateKeyDown} disabled={pending}>Clear due date</button>`
  between "Today" and "Update due date". Update the header comment (`§40 adds a "Clear due date" button`).
- Pros: one result-handling path, so REQ-40.3 and REQ-40.4 ("same result handling as onSave") hold by construction; the
  error expression `dueDate ?? id ?? form` exists once; the draft is untouched on failure (REQ-40.4) because `save`
  never writes it; `pending` and the Escape guard are the existing ones (REQ-40.5, REQ-40.6).
- Cons: touches `onSave`, so a mutation in the helper hits AC-15.x and AC-40.x tests both.
- Fits rules: yes. Client component only, no new export, no `src/lib` / action / schema change (REQ-40.7), no new
  dependency. Mutation only through the existing Server Action.

**B (alternative): a separate `onClear` that duplicates the transition body.**

- Change: copy the `startTransition` block with a literal `''`.
- Pros: `onSave` is not edited.
- Cons: two copies of the failure expression that can drift (REQ-40.4 says "as Update due date does"); more code for
  the mutation run to cover; reviewer will ask for the extraction.
- Fits rules: yes, but weaker on the "same result handling" contract line.

Rejected, not offered: `form.requestSubmit()` after `setDraft('')`. REQ-40.2 says the call is made once with `''`
whatever the field holds and the form is not submitted a second time; it would also race the state update.

## Recommendation

A. 1 source file changed; no migration.

## Impact

| File                                                 | Add/Change                               | Signature                                                                                                                                                                                                                | ACs                         |
| ---------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------- |
| `src/components/todo-due-date.tsx`                   | Change                                   | `export function TodoDueDate({ todoId, dueDate }: { readonly todoId: string; readonly dueDate: string \| undefined }): ReactNode` (unchanged); internal `function save(value: string): void`, `function onClear(): void` | AC-40.1 to AC-40.5, AC-40.6 |
| `src/components/todo-due-date-clear.test.tsx`        | Add (test commit)                        | none                                                                                                                                                                                                                     | AC-40.1 to AC-40.5          |
| `src/components/todo-due-date-today-button.test.tsx` | Change (test commit, line 73-97)         | AC-37.1 rewritten to "exactly 5" children: label, input, "Today", "Clear due date", "Update due date"; the title must match the edited AC-37.1 text verbatim                                                             | AC-37.1                     |
| `e2e/40-due-date-clear.spec.ts`                      | Add (test commit)                        | none                                                                                                                                                                                                                     | AC-40.6                     |
| `spec/features-map.md`                               | Change (`docs(map)` commit after `feat`) | F38 row                                                                                                                                                                                                                  | n/a                         |

The component file is the only `src/` file (spec "Function contracts"). `chore(todos): B7.6 skeleton` is a stub
`onClear` that throws `NotImplementedError` or renders the button with no handler, so the red tests fail on assertions,
not on imports. Do not add the button in the skeleton with a working handler.

Client component `todo-due-date.tsx`, markup per approach (edit mode is client state, so the server HTML is view mode only):

| Case                       | Today                                                                                   | After A                                                              | After B |
| -------------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------- |
| Server-rendered markup     | view mode: `Due <date>` text, icon button "Edit due date"; no form                      | same, no form (REQ-40.7)                                             | same    |
| Submit with JavaScript off | not reachable: "Edit due date" is `type="button"` with an `onClick`, so no form appears | same                                                                 | same    |
| Submit before hydration    | same: the edit button does nothing until hydrated, no form exists                       | same                                                                 | same    |
| After hydration, edit mode | form of 4 children                                                                      | form of 5 children, "Clear due date" calls the action once with `''` | same    |

Dropped behavior: none in either approach. The one semantic change is B7.3's 4-children assertion (AC-37.1), authorized
by D-38 and rewritten in B7.6's red commit.

## Risks

- Migration: none. No `prisma/` change.
- Security: none new. The button sends `''`, which the Zod schema already accepts (§15 REQ-15.3); the action still
  validates at the boundary.
- Performance: none.
- Isolation: none; e2e seeds through its own `PrismaClient` and `beforeEach` `deleteMany` as in `e2e/37-*.spec.ts`.
- Existing tests that could turn red: `todo-due-date-today-button.test.tsx` AC-37.1 (counts 4 children; red until
  rewritten, so the rewrite must be in the `test(...)` commit, not the `feat(...)` one, or CI's
  `check-feat-commits.sh` rejects it). Other due-date tests use exact names (`getByLabel('Due date', { exact: true })`,
  `getByRole('button', { name: 'Update due date' })`) and the button has no `aria-label`, so they stay green
  (analysis.md). AC-28.6 (Escape on "Update due date" does nothing) is unaffected because "Update due date" gets no
  handler.
- Ordering: B7.3 (#301) must be merged first; `card` Depends on it. The AC-37.1 test file only exists after that.
- Hand-off pitfalls: "Clear due date" must not share `onChange`/`draft` writes; `getAllByRole('button', { name: 'Clear' })`
  has length 0 only because name matching is exact string by default in Testing Library, so give the button exactly
  the visible text and no `aria-label`/`title`.
- No new dependency.

## Test strategy

| Layer     | File                                                 | ACs                                                                                                                                                                                                                                     | Mocks                                                                                                                    |
| --------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| component | `src/components/todo-due-date-clear.test.tsx`        | AC-40.1 (`it.each` a/b), AC-40.2 (a/b), AC-40.3 (a/b, click twice), AC-40.4 (a pending from Clear; b pending from Update, `deferred()`), AC-40.5 (a/b/c, `createEvent.keyDown` cancelable, `it.each` for Ctrl/Meta/Alt/Shift/ArrowLeft) | `vi.mock('@/actions/todos', () => actions)` with `vi.hoisted`; copy the helpers of `todo-due-date-today-button.test.tsx` |
| component | `src/components/todo-due-date-today-button.test.tsx` | AC-37.1 (rewritten, 5 children)                                                                                                                                                                                                         | unchanged                                                                                                                |
| e2e       | `e2e/40-due-date-clear.spec.ts`                      | AC-40.6 (seed [C, B due 2026-11-05, A]; hydrate, edit B, click, reload; assert no `Due` / `Overdue` / `Due today`, `Edit due date` count 1, order `[C, B, A]`, B unchecked, A/C unchanged)                                              | none; `openHydrated` waits for `networkidle` so the click is a Server Action POST                                        |

Title of the card's named test: `AC-40.2: after typing 2026-12-01, clicking "Clear due date" calls
setTodoDueDateAction once with (todo-9, "") for dueDate 2026-11-05 and for no dueDate, then shows 0 "Due date" fields,
0 alerts and 1 button "Edit due date"`. Its "red because": no button named "Clear due date".
Assert call args via `mock.calls[0]?.[0]`/`toEqual`, not `objectContaining`. Verify with `scripts/verify-red.sh B7.6`.

## Mutation hot spots

- `save('')` literal vs `save(draft)`: AC-40.2 types `2026-12-01` first, so a mutant that sends the draft dies.
- `disabled={pending}` on the new button: AC-40.4 (a) and (b).
- The `pending` guard in `onDueDateKeyDown` now also covers the new button: AC-40.5 (b).
- The modifier clause `ctrl || meta || alt || shift` and `key !== 'Escape'`: AC-40.5 (c), one `it.each` row per modifier.
- The failure expression `dueDate ?? id ?? form` and `setError(undefined)` on success: AC-40.3 (a)/(b) and AC-15.6.
- `setEditing(false)` on `ok` and absence of any draft reset on failure: AC-40.2, AC-40.3.
- Only `src/components` changes, so the `src/lib` + `src/actions` mutation gate (≥ 70 %) is unchanged; the local run is
  skipped by B1.100 for a component-only change.

## Questions settled / escalated

```
Question:    Does the "Clear due date" button need a server, action, schema or lib change?
Class:       P0 no conflict
Sources:     spec/contracts/38-due-date-clear.md:23 "SHALL change no server, Server Action, Zod schema, Prisma model, query or `src/lib` function"
Conflict:    none
Verdict:     No. §15 REQ-15.3 already accepts ''. Only `todo-due-date.tsx` changes (spec/contracts/38-due-date-clear.md:67).
Next action: Implement as approach A in the component only.
Must not:    Add an action `clearTodoDueDateAction` or touch `src/lib/todo-schema.ts`.
Doc drift:   none
Escalate:    none
```

```
Question:    The existing AC-37.1 test asserts 4 children; may B7.6 change it?
Class:       P1 code ≠ spec (test of B7.3 vs edited §37)
Sources:     spec/contracts/38-due-date-clear.md:36 "AC-37.1 reads "exactly 5" children in that order"
             src/components/todo-due-date-today-button.test.tsx:84 "expect(children).toHaveLength(4);"
Conflict:    spec (edited under D-38) says 5 / test says 4
Verdict:     The spec governs (authority 3 over 5); tests are evidence only. D-38 option A authorizes rewriting the test.
Next action: Rewrite AC-37.1 to 5 children in B7.6's `test(todos): B7.6 … (red)` commit, with the title from the edited AC-37.1.
Must not:    Edit the test in the `feat(...)` commit, or leave it at 4 and call the red test unrelated.
Doc drift:   none (spec already edited)
Escalate:    none
```

```
Question:    Show "Clear due date" when no date is stored?
Class:       P0 no conflict
Sources:     spec/contracts/38-due-date-clear.md:17 "with or without a stored due date"
Conflict:    none
Verdict:     Always shown in edit mode; hiding it is listed in Out of scope (line 73).
Next action: Render unconditionally inside the edit form.
Must not:    Hide it when `dueDate` is `undefined`.
Doc drift:   none
Escalate:    none
```

```
Question:    Should Escape on "Clear due date" reuse the field's handler?
Class:       P0 no conflict
Sources:     spec/contracts/38-due-date-clear.md:22 "do what §37 REQ-37.4 specifies for "Today""
Conflict:    none
Verdict:     Yes: `onKeyDown={onDueDateKeyDown}`, as "Today" has. §28 REQ-28.7 does not apply (line 29).
Next action: Attach the existing handler to the new button.
Must not:    Add a second handler, or attach it to "Update due date" (AC-28.6 keeps it doing nothing).
Doc drift:   none
Escalate:    none
```
