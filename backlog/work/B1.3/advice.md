# B1.3 advice

Read first: `analysis.md` is accurate against this worktree (HEAD `eb29932`, `main` at B1.2 merged). Two of its
housekeeping items (Question 8 a and c) are already done in HEAD; see Question 8. `src/components/todo-item.tsx`,
`src/lib/todos.ts` and the B1.2 tests are the reference shape. `spec/contracts/07-clear-completed.md` (§9) already
fixes four signatures and the page placement, so most of this advice is "follow the contract, here is what bites".

## Approaches

### A. Client button with a `disabled` prop, transition-wrapped action, always rendered by `page.tsx` (recommended; it is the §9 contract)

- `src/lib/todos.ts`: `clearCompletedTodos(): Promise<number>`:
  `const { count } = await prisma.todo.deleteMany({ where: { completed: true } }); return count;`. One statement, no
  `select` (`deleteMany` returns `{ count }`), no read-then-delete.
- `src/actions/todos.ts`: `clearCompletedTodosAction(): Promise<ActionResult<{ deleted: number }>>`: no parse, one lib
  call, `revalidatePath('/')`, `return { ok: true, data: { deleted } }`. No `try/catch`: the failure arm is never
  returned, an unexpected error propagates like the rethrow arm of `toggleTodoAction`.
- `src/components/clear-completed-button.tsx` (`'use client'`): `useTransition`; `onClick` runs
  `startTransition(async () => { await clearCompletedTodosAction(); })`; `<button type="button"
disabled={disabled || pending}>Clear completed</button>`; visible text exactly "Clear completed", no icon-only
  trick needed (it is not inside an `<li>`); add `self-start` so the button is not stretched by `main`'s `flex-col`.
- `src/app/page.tsx`: import the component and render
  `<ClearCompletedButton disabled={!todos.some((todo) => todo.completed)} />` right after `<TodoForm />`, before the
  `todos.length === 0 ? … : …` ternary, so it is outside both branches and outside the `<ul>`.
- Pros: matches §9 literally; same pattern as `TodoItem` (`useTransition` + action); a new file means no existing
  component test or its hoisted mock object changes; the `disabled` prop makes AC-9.2 a pure render test. Cons: no
  progressive enhancement (the toggle already has none).
- Fits rules: yes (mutation in a Server Action, Prisma only in `src/lib`, client component only for the event, no
  raw SQL).

### B. `<form action>` (server-rendered or `useActionState`) instead of `onClick` + transition

- A `<form action={...}>` whose action is `clearCompletedTodosAction`, or an inline `'use server'` closure in
  `page.tsx`.
- Pros: works without JavaScript. Cons: `<form action>` is typed `(formData: FormData) => void | Promise<void>`, the
  action returns `ActionResult`, so it does not type-check without a wrapper; an inline `'use server'` function in
  `page.tsx` puts a mutation outside `src/actions/` (invariant 3, `ts-style.md`); §9 fixes `ClearCompletedButton({
disabled })` and "calls the action in a transition", so B changes a signature the card fixes. Fits rules: only
  with the wrapper, and then it is A with extra markup. Not recommended.

## Recommendation

Approach A, exactly as §9 states it. Specific decisions the plan should pin so the test-writer and code-writer do not
guess differently:

1. `deleteMany({ where: { completed: true } })` once, the lib returns the `count` number (not the payload object).
2. The action revalidates `/` unconditionally, including when `deleted` is `0` (§9: "one lib call, then
   `revalidatePath('/')`"; no `if (deleted > 0)` branch, which would be behavior with no requirement).
3. The button is the only new interactive element; its accessible name is "Clear completed" (the visible text, no
   `aria-label`), and nothing is added to any `<li>`.
4. `page.tsx` computes `disabled` from the already-fetched `todos`; it does not add a second query (no
   `countCompleted`). That keeps `src/lib` at one new function.
5. The action's result is ignored by the component (no message, no error state): §9 puts a deleted-count message out
   of scope and the failure arm is never returned.
6. No migration, no dependency, no schema or env change.

## Impact

| File                                                            | Add / Change | Signature                                                                                          | ACs                                  |
| --------------------------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `src/lib/todos.ts`                                              | Add function | `clearCompletedTodos(): Promise<number>`                                                           | AC-9.1, REQ-9.7 (lib test, no AC id) |
| `src/actions/todos.ts`                                          | Add action   | `clearCompletedTodosAction(): Promise<ActionResult<{ deleted: number }>>`                          | AC-9.1                               |
| `src/components/clear-completed-button.tsx`                     | Add file     | `ClearCompletedButton({ disabled }: { readonly disabled: boolean }): ReactNode`                    | AC-9.2, AC-9.3                       |
| `src/app/page.tsx`                                              | Change       | renders `<ClearCompletedButton disabled={!todos.some((todo) => todo.completed)} />` in both states | AC-9.2, AC-9.3                       |
| `src/lib/todo-schema.ts`, `src/lib/action-result.ts`, `prisma/` | none         | no input to parse (Question 3), `ActionResult` already fits, `completed Boolean` already exists    | -                                    |

Four `src/` files, one of them new. Same-commit documentation (not `src/` behavior): module header comments in
`src/lib/todos.ts` (`// §5 list/create/toggle, §6 edit title.` gains `§9 clear completed`) and
`src/actions/todos.ts`; the "(§5, §6, §7)" / "§3–§6" headings and the `todos.ts` row of `src/lib/CLAUDE.md`,
`src/actions/CLAUDE.md`, `src/components/CLAUDE.md`; `spec/features-map.md` F7 row (Question 8).

## Risks

- Migration: none. `todos.completed` exists (`prisma/schema.prisma:18`). There is no index on `completed`; the
  `deleteMany` is a sequential scan of a single-person table. Adding an index is a schema change and a migration,
  which §9's `quick` tier excludes ("no schema change"); do not add it under this card.
- Security: the action takes no input, so there is nothing to validate or inject; Prisma parameterizes the constant
  `where`. A Server Action is a POST endpoint any caller of the app can invoke, and the clear is final, but the app
  has no accounts (§5 out of scope) and the toggle has the same exposure. Next.js's built-in same-origin check on
  Server Actions applies. Note for the reviewer, not a finding.
- Data loss on a wrong `where` (highest-impact bug of the card): a `deleteMany` with `where` dropped, `{}`, or
  `completed: false` deletes every todo or the open ones. Only an exact-argument assertion catches it (see Mutation
  hot spots); a `toHaveBeenCalled()` assertion would let it through. The e2e AC-9.3 (open rows survive in the real
  database) is the second net.
- Existing tests that the change could turn red:
  - `e2e/05-todos.spec.ts` :: "AC-5.7: an empty list shows "No todos yet" with the New todo box and the Add button":
    the button now renders in the empty state. `getByText('No todos yet')` and `getByRole('button', { name: 'Add' })`
    do not match "Clear completed" (Playwright's name match is a case-insensitive substring; "clear completed"
    contains no "add"). Green as long as the new button's name stays exactly "Clear completed" (an `aria-label` such
    as "Clear completed todos" is still safe, but "Add" must not appear in it; "Delete" and "Remove" are fine).
  - `e2e/05-todos.spec.ts` :: "AC-5.1: lists todos newest first" asserts `getByRole('listitem')` `toHaveText(['C',
'B', 'A'])`, whole-row text. Green only if the button is rendered outside the `<ul>`/`<li>`. Rendering it inside
    the list, or as a `<li>`, turns it red (it would be a fourth listitem). `page.tsx` placement per §9 avoids this.
    The B1.2 trick (icon-only control inside the row) is not needed here and must not be copied: it applies to row
    content, not to a sibling of the list.
  - `e2e/06-edit-title.spec.ts`: every locator is row-scoped or by exact checkbox name/"Edit title"/"Save"; none
    matches "Clear completed". `getByRole('button', { name: 'Edit title' })` at the top level (AC-6.1) stays unique.
  - `src/components/todo-form.test.tsx`, `todo-item.test.tsx`: neither imports `page.tsx` or the new component, so
    their hoisted `vi.mock('@/actions/todos', ...)` objects need no new key. They would only need one if the button
    were put inside `TodoForm`/`TodoItem` (Approach B variants); that is a reason for a new file.
  - `src/actions/todos.test.ts` uses `vi.mock('@/lib/todos', async (importOriginal) => ({ ...original, createTodo:
lib.createTodo, ... }))`: the new test must add `clearCompletedTodos: lib.clearCompletedTodos` to both the hoisted
    object and the factory (adding a key is allowed); if it is forgotten the real `clearCompletedTodos` runs against
    `vi.mock('@/lib/prisma', () => ({ prisma: {} }))` and throws a `TypeError` that is not an assertion failure.
  - `src/lib/todos.test.ts`: its hoisted `db` has no `deleteMany`; the new tests add `deleteMany: vi.fn()` to it
    (`vi.resetAllMocks()` in `beforeEach` already resets it).
- Stale button (two tabs): the tab's `disabled` is a render-time snapshot. A stale enabled button clicked after the
  rows were already cleared elsewhere deletes 0 and reports 0 (REQ-9.7); a stale disabled button cannot clear rows
  completed in another tab until a reload. Two-tab behavior is §9 out of scope; do not add polling or a refetch.
- A row currently open in edit mode (§6) that is completed is deleted with its draft. REQ-9.1 says every completed
  todo; accept, no handling.
- Performance: one `DELETE ... WHERE completed = true`; `listTodos` is unchanged and runs on the re-render
  (`force-dynamic`).
- Isolation: no env var, port, schema or cache key. e2e runs `workers: 1`, `fullyParallel: false`, and each file's
  `beforeEach` does `prisma.todo.deleteMany()` on the worktree schema, so the new spec cannot race the others; it must
  keep that `beforeEach` (the clear deletes every completed row in the schema, not only its seeds).
- Dependencies: none added.
- Process, not code: the §9 approval box (`- [ ] Lead approves spec (<human>, <date>)`) is unticked; per D-7 the plan
  gate's "approve" reply may tick it. No test is written before it is ticked (`spec/CLAUDE.md`).

## Test strategy

| Layer     | File                                                                        | ACs                                      | Mocks                                                                                                                           |
| --------- | --------------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| unit      | `src/lib/todos.test.ts` (add `clearCompletedTodos`)                         | AC-9.1 (statement and count), REQ-9.7    | `vi.mock('@/lib/prisma', ...)`; add `deleteMany: vi.fn()` to the hoisted `db`                                                   |
| unit      | `src/actions/todos.test.ts` (add `clearCompletedTodosAction`)               | AC-9.1 (result, revalidate once), no AC  | `@/lib/todos` (keep `importOriginal`, add the `clearCompletedTodos` key), `next/cache`, `@/lib/prisma` as the file already does |
| component | `src/components/clear-completed-button.test.tsx` (new)                      | AC-9.2, click calls the action, pending  | `@/actions/todos` via `vi.hoisted(() => ({ clearCompletedTodosAction: vi.fn() }))`                                              |
| e2e       | `e2e/09-clear-completed.spec.ts` (new; `09` = §9, not the spec file's `07`) | AC-9.2 (a empty, a open only, b), AC-9.3 | none; real Postgres, `prisma.todo.deleteMany()` in `beforeEach`, seed with explicit `createdAt` as `06-edit-title.spec.ts` does |

Test details the plan should pin (all titles start `AC-9.n:` except the ones marked "no id"):

- Lib: (1) "AC-9.1: deletes with where { completed: true } once and resolves to the deleted count": mock
  `deleteMany` resolves `{ count: 2 }`; `expect(result).toBe(2)`; `expect(db.deleteMany).toHaveBeenCalledTimes(1)`;
  `expect(db.deleteMany).toHaveBeenCalledWith({ where: { completed: true } })`. (2) REQ-9.7, no id: "resolves to 0
  and still scopes the delete to completed rows": mock `{ count: 0 }`, `toBe(0)`, same exact-argument assertion.
- Action: (1) "AC-9.1: returns the deleted count and revalidates / once": lib resolves `2`;
  `toEqual({ ok: true, data: { deleted: 2 } })`; `lib.clearCompletedTodos` called once with no arguments;
  `revalidatePath` once with `'/'`. (2) no id: with lib resolving `0` the result is `{ ok: true, data: { deleted: 0
} }` and `/` is still revalidated once. (3) no id: lib rejects `new Error('db down')` -> `rejects.toThrow('db
down')` and `revalidatePath` not called (no failure arm). Every test needs one positive assertion that fails on the
  skeleton stub, or `verify-red.sh` sees a new test pass.
- Component: (1) "AC-9.2: renders exactly one button named Clear completed, disabled when disabled is true"
  (`getAllByRole('button')` length 1; `toBeDisabled()`); (2) "AC-9.2: enabled when disabled is false"
  (`toBeEnabled()`); (3) "AC-9.3: calls clearCompletedTodosAction once with no arguments on click"
  (`toHaveBeenCalledWith()`; the mock resolves `{ ok: true, data: { deleted: 1 } }`); (4) no id: a disabled button
  does not call the action; (5) no id: while the action promise is pending the button is disabled (deferred
  promise), and enabled again after it resolves when `disabled` is still false.
- e2e (AC-9.2 is only proven end to end here, because `page.tsx`'s `!todos.some(...)` has no unit test and
  Stryker does not mutate `src/app` or components): three states, each `getByRole('button', { name: 'Clear completed'
})` `toHaveCount(1)` then `toBeDisabled()` / `toBeEnabled()`: empty list (the AC-9.2 (a) empty case, the one an
  empty-state branch could silently drop), open todos only, and one completed todo (b). A swapped `some`/`every` or a
  dropped negation is caught only by these. AC-9.3: seed in display order C (open), B (done), A (open); assert the
  button enabled; click; `await expect(page.getByRole('listitem')).toHaveText(['C', 'A'])` (web-first assertion, so it
  waits for the transition); `toBeDisabled()`; both checkboxes `not.toBeChecked()`; `page.reload()`; the same three
  assertions again; and `prisma.todo.findMany({ orderBy: { createdAt: 'desc' }, select: { title: true, completed:
true } })` `toEqual([{ title: 'C', completed: false }, { title: 'A', completed: false }])`.
- AC-9.1 "stored rows are exactly [D, A]" cannot be proven by a mocked unit test. The real-database proof is the e2e
  `findMany` above (three-row variant of the same shape); the lib/action tests prove the statement and the count.
  State this in the plan so the reviewer does not ask for a fourth e2e.

Proofs for §9 "Unchanged behavior" (all six exist verbatim in this worktree; `dev-lead` copies them in): the AC-5.7 and
AC-5.1 e2e titles in `e2e/05-todos.spec.ts`; "AC-5.4: inverts completed and stores it, twice in a row" and "throws
TodoNotFoundError for an unknown id and updates nothing" in `src/lib/todos.test.ts`; "AC-5.1: renders the title as the
accessible name of an unchecked checkbox when not completed" in `src/components/todo-item.test.tsx`; "AC-5.6: a
created todo survives a reload, and so does its toggled state" in `e2e/05-todos.spec.ts`.

`scripts/ci/check-ac-coverage.sh` (once §9's status in `spec/technical-requirements.md` flips to ✅ at close) greps
`(it|test)(...)('AC-9.n:` on one line: keep each AC-9 title starting on the same line as `it(`/`test(`.

## Mutation hot spots

Stryker mutates `src/lib/**` and `src/actions/**` (not components, not `src/app`). The new code is small; these
mutants are the ones that matter:

- `where: { completed: true }` mutated to `where: {}` (ObjectLiteral), `completed: false` (BooleanLiteral), or the
  `where` removed: assert the argument exactly, `toHaveBeenCalledWith({ where: { completed: true } })` (recursive
  equality, so `{}` and `false` fail) plus `toHaveBeenCalledTimes(1)`. Do not use `toMatchObject`, which would let an
  extra key such as `take` or a widened filter survive, and never `toHaveBeenCalled()` alone. Both the AC-9.1 and the
  REQ-9.7 lib tests carry it. This is the data-loss mutant.
- `return count` mutated (returns the payload, `count + 1`-style or `0`): the `{ count: 2 }` test with `toBe(2)` and
  the `{ count: 0 }` test with `toBe(0)` (two different values kill the constant-return mutants).
- Action: `revalidatePath('/')` removed or its argument changed: `toHaveBeenCalledTimes(1)` and `toHaveBeenCalledWith('/')`
  on the success test; the `deleted: 0` test also fixes the unconditional call (a mutant adding or flipping a
  `deleted > 0` guard is killed there).
- Action: result shape: `toEqual({ ok: true, data: { deleted: 2 } })` (not `toMatchObject`) so a renamed key, `ok:
false`, or an extra field survives nowhere; the `0` case distinguishes `deleted` from a hard-coded value.
- Action: a `try/catch` that swallows or converts the lib error: the `db down` test (`rejects.toThrow`, no
  `revalidatePath`).
- Action: the lib call is made once and with no argument: `toHaveBeenCalledTimes(1)`, `toHaveBeenCalledWith()`.
- Not mutated, so only review and e2e guard them: `disabled || pending`, the `.some` negation in `page.tsx`, the
  button's text and name. This is why the e2e covers empty, open-only and one-completed.

## Questions settled / escalated

```
Question:    Where does the button live, and is it a client component or a `<form action>`? (analysis.md Q1)
Class:       P0 no conflict
Sources:     spec/contracts/07-clear-completed.md:43 "export function ClearCompletedButton({ disabled }: { readonly disabled: boolean }): ReactNode; // button "Clear completed"; calls the action in a transition; disabled also while pending"
             spec/contracts/07-clear-completed.md:41 "export function clearCompletedTodosAction(): Promise<ActionResult<{ deleted: number }>>; // no input to parse; one lib call, then revalidatePath('/'); the failure arm is never returned"
             .claude/rules/ts-style.md:12 "mutations only in `src/actions/*.ts` (`'use server'`)"
Conflict:    none (the contract fixes a client component with a `disabled` prop; a `<form action>` would not type-check against an action that returns `ActionResult`)
Verdict:     §9's function contracts govern (authority 3). New `src/components/clear-completed-button.tsx`, `'use client'`, `useTransition`, rendered by `page.tsx`. `analysis.md` proposal confirmed unchanged.
Next action: plan.md lists the new file and pastes the component signature; the skeleton stub throws `NotImplementedError` from render (Question 9).
Must not:    use `<form action={clearCompletedTodosAction}>`, define an inline `'use server'` function in `page.tsx`, or change the action's return type to `void`.
Doc drift:   none
Escalate:    none
```

```
Question:    Is the button rendered when the list is empty? (analysis.md Q2)
Class:       P0 no conflict
Sources:     spec/contracts/07-clear-completed.md:20 "WHILE no todo is completed (including while no todo exists) THE SYSTEM SHALL show the button named "Clear completed" disabled; it is never hidden."
             spec/contracts/07-clear-completed.md:44 "between <TodoForm /> and the list or the "No todos yet" text, in both states"
             backlog/00-decisions.md:20 ""Clear completed" is a button that is always rendered and **disabled** (not hidden) while no todo is completed; enabled otherwise."
Conflict:    none
Verdict:     Yes, disabled. D-10 (authority 2) and REQ-9.5 agree; `page.tsx` renders the button before the `todos.length === 0` ternary, so it is in neither branch. `AC-5.7` and `AC-5.1` stay green (button is outside the `<ul>`; "Add" is not a substring of "Clear completed").
Next action: plan.md names the placement (after `<TodoForm />`, before the ternary) and the e2e empty-list case of AC-9.2 (a).
Must not:    put the button inside the non-empty branch or inside the `<ul>`, or hide it when `todos.length === 0`.
Doc drift:   none
Escalate:    none
```

```
Question:    Does `clearCompletedTodosAction` need a Zod schema? (analysis.md Q3)
Class:       P0 no conflict
Sources:     spec/contracts/07-clear-completed.md:41 "no input to parse; one lib call, then revalidatePath('/'); the failure arm is never returned"
             .claude/rules/invariants.md:10 "input parsed by Zod at the boundary, errors returned as"
             .claude/rules/ts-style.md:12 "Zod parse → one `src/lib`"
Conflict:    none (invariant 3 and `ts-style.md` parse the input an action receives; this action receives none)
Verdict:     No schema. The invariant is met vacuously, the contract (authority 3) states "no input to parse", and a dummy schema is code without behavior. The action still returns `ActionResult` (the contract fixes the type) and never returns `ok: false`.
Next action: implement the action as parse-free: lib call, `revalidatePath('/')`, `return { ok: true, data: { deleted } }`; `src/lib/todo-schema.ts` stays untouched.
Must not:    invent `clearCompletedSchema`, accept an optional `formData`/ids parameter, or add a `try/catch` that fabricates a failure arm.
Doc drift:   none
Escalate:    none
```

```
Question:    How is the delete made atomic, and what about the stale-button race? (analysis.md Q4)
Class:       P0 no conflict
Sources:     spec/contracts/07-clear-completed.md:39 "deletes every row with completed = true in one statement; resolves to the deleted count (0 when none)"
             spec/contracts/07-clear-completed.md:52 "clearing from two tabs at once"
             spec/contracts/07-clear-completed.md:16 "WHEN a person activates "Clear completed" THE SYSTEM SHALL delete every todo whose completion state is completed."
Conflict:    none
Verdict:     One `prisma.todo.deleteMany({ where: { completed: true } })`, returning `count`. "Every completed todo" is evaluated at the time of the click, so a row completed in another tab is also deleted; that and the reverse case are §9 out of scope (authority 3). Not `findMany` ids then `deleteMany({ id: { in } })` (two statements, not what the contract says), not `$transaction`, not `$executeRaw` (invariant 4).
Next action: lib test asserts the exact argument and the count (Mutation hot spots); no id-list parameter.
Must not:    add a transaction, an ids parameter, a refetch or a lock, or "fix" the two-tab case in code.
Doc drift:   none
Escalate:    none
```

```
Question:    Is there a confirmation before deleting? (analysis.md Q5)
Class:       P0 no conflict
Sources:     spec/contracts/07-clear-completed.md:24 "A clear is final: a deleted todo cannot be restored and there is no confirmation step."
             spec/contracts/07-clear-completed.md:52 "Deleting a single todo, a confirmation dialog, undo, a message showing the deleted count"
Conflict:    none
Verdict:     No. §9 states the rule and lists the dialog as out of scope; a confirmation would be new behavior needing REQs and a `full` tier.
Next action: none; the click calls the action directly.
Must not:    add `window.confirm`, a dialog, or an undo affordance.
Doc drift:   none
Escalate:    none
```

```
Question:    Is the deleted count shown to the person? (analysis.md Q6)
Class:       P0 no conflict
Sources:     spec/contracts/07-clear-completed.md:18 "WHEN completed todos are cleared THE SYSTEM SHALL report how many todos were deleted."
             spec/contracts/07-clear-completed.md:52 "a message showing the deleted count"
             src/components/CLAUDE.md:5 "A row (`<li>`) adds no visible text beyond its title (AC-5.1 compares whole-row text)."
Conflict:    none ("report" is the action result `{ deleted }`, proven by AC-9.1; the message is explicitly out of scope)
Verdict:     No UI for the count. The component ignores the result; the count is observable only in the action's return value and its tests.
Next action: component test asserts the action call, not any count text.
Must not:    render "Deleted 2" (a toast, an `aria-live` region or a row text), or store the count in component state.
Doc drift:   none
Escalate:    none
```

```
Question:    Which tests carry which criterion, and what is the e2e file called? (analysis.md Q7)
Class:       P2 spec silent
Sources:     spec/contracts/07-clear-completed.md:47 "Lib test for REQ-9.7 (no criterion): `clearCompletedTodos()` over a store with no completed row resolves to `0` and"
             e2e/CLAUDE.md:3 "One file per spec section (`05-todos.spec.ts`, `06-edit-title.spec.ts`) plus `smoke.spec.ts`."
             .claude/rules/testing.md:7 "Titles start with the criterion: `it('AC-5.2: creates the trimmed title …')`; infrastructure"
Conflict:    none (the section lists criteria and one no-criterion test but not files; `analysis.md`'s proposal is consistent with the conventions)
Verdict:     The Test strategy table above governs: AC-9.1 in `src/actions/todos.test.ts` (the card's `Test:` line) and `src/lib/todos.test.ts`; AC-9.2 in `src/components/clear-completed-button.test.tsx` and e2e; AC-9.3 in `e2e/09-clear-completed.spec.ts`. The e2e prefix follows the section number (`05` = §5, `06` = §6), so §9 is `09-`, not `07-` (the number in `spec/contracts/07-clear-completed.md` is the contract file's index, which §5 also does not follow: `03-todos.md` vs `05-todos.spec.ts`). The REQ-9.7 tests and the action's no-failure-arm test carry no AC prefix.
Next action: plan.md copies the table; the red commit adds all of it.
Must not:    name the e2e file `07-…`, give the REQ-9.7 test an `AC-9.n:` prefix, or fold the empty-list AC-9.2 case into a unit test only.
Doc drift:   `spec/features-map.md` F7 row lists these test files (Question 8), in the `docs(map)` commit
Escalate:    none
```

```
Question:    Housekeeping outside the work-folder write set (analysis.md Q8): which items are still open?
Class:       P0 no conflict
Sources:     backlog/README.md:28 "| 3    | B1.3 | Clear completed todos | §9     | Open   | ~~B1.1~~   | Lead  | S [estimate] |"
             backlog/00-decisions.md:22 "## Open"
             spec/features-map.md:16 "Receipt: verified against `fc812e3` (B1.2 merged)."
Conflict:    none (analysis.md was written before commits `bfbe669` and `eb29932`)
Verdict:     (a) done: the README row already says §9. (c) done: the "Open" table in `00-decisions.md` is empty. (b) open and correct: `spec/features-map.md` has no F7 row; add `F7 | §9 | Clear completed todos | src/lib/todos.ts, src/actions/todos.ts, src/components/clear-completed-button.tsx, src/app/page.tsx | src/lib/todos.test.ts, src/actions/todos.test.ts, src/components/clear-completed-button.test.tsx, e2e/09-clear-completed.spec.ts | ✅` in the `docs(map): F7 … [B1.3]` commit after the feat commit (`scripts/ci/check-features-map.sh` resolves every path, so the files must exist). At close, `spec/technical-requirements.md:16` flips §9 from ✗ and the card gets its Done line. Also open: the §9 approval box is unticked; the plan gate's "approve" may tick it (D-7), before any test is written.
Next action: dev-lead schedules the F7 row after green, and asks for the approval tick at the plan gate.
Must not:    add the F7 row before the files exist, edit `00-decisions.md`, or write a test before the box is ticked.
Doc drift:   spec/features-map.md (F7 row, `docs(map)` commit); spec/technical-requirements.md status and the card Done line (closing commit)
Escalate:    none
```

```
Question:    The card says the test is red "because clearCompletedTodosAction is not exported"; testing.md says red never fails on an import. Which governs? (new)
Class:       P4 two sections collide
Sources:     backlog/plan/E1-todos.md:31 "red because: `clearCompletedTodosAction` is not exported from `src/actions/todos.ts`"
             .claude/rules/testing.md:16 "- Red first: tests are committed alone (`test(<pkg>): B<e>.<n> … (red)`, body "Red because …") and fail on an"
             .claude/rules/invariants.md:7 "`test(...)` commits precede `feat(...)`; `scripts/verify-red.sh`"
Conflict:    card Test line says the red reason is a missing export / testing.md says tests fail on an assertion or the skeleton's `NotImplementedError`, never on an import
Verdict:     Invariant 2, `testing.md` and `verify-red.sh` (authority 1) govern; the card line describes the pre-skeleton state and the same wording passed for B1.2. The skeleton commit (`chore(todos): B1.3 skeleton`) exports the three symbols as stubs that throw `NotImplementedError` (`clearCompletedTodos`, `clearCompletedTodosAction`, and `ClearCompletedButton`, whose render throws; a stub that renders a plain button would let the AC-9.2 "enabled" test pass and fail the gate). `page.tsx` is not changed in the skeleton. The real reason is then "`<stub>` is not implemented" and goes in the red commit body.
Next action: plan.md lists the skeleton commit with the three stubs; the red commit body states the `NotImplementedError` reason.
Must not:    commit tests against missing exports (red on an import), or stub the component with a working button.
Doc drift:   backlog/plan/E1-todos.md B1.3 `Test:` line, one phrase ("red because: `clearCompletedTodosAction` rejects with `NotImplementedError`"), in the closing `docs(backlog)` commit; not blocking
Escalate:    none
```
