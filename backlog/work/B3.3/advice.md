# B3.3 advice

Read first: §19 (`spec/contracts/17-delete.md`) already fixes every path, signature, message and the logger member, and
D-21 (the batch-3 ruling, `backlog/00-decisions.md:47`) fixes the ownership rule (UI only in `todo-item.tsx` plus its
own button, logic in own modules, no `page.tsx`). So this file chooses nothing the spec chose: it settles the click
wiring, the skeleton and red/green split, the existing-test change, the verify-red / check-feat-commits treatment, and
the mutation hot spots. The `Lead approves spec` box under §19 is ticked (`17-delete.md:5`). The reference
implementation is B2.3 (§14, merged): `src/lib/todo-complete-all.ts`, `src/actions/complete-all.ts`,
`src/components/complete-all-button.tsx`. Nothing was run: this advice is read-only on `src/`.

Unlike B2.3 there is **one phase**: nothing mounts in `page.tsx`, so the e2e (AC-19.7) can be written red with the rest.

## Approaches

### Approach A (recommended): own modules as §19 names them, `onClick` + `useTransition`, one phase

- Change: `src/lib/todo-delete.ts` (`deleteTodo`), `src/actions/delete-todo.ts` (`deleteTodoAction`),
  `src/components/delete-todo-button.tsx` (`DeleteTodoButton`), the one-member widening of `MutationActionName` in
  `src/lib/logger.ts` (type only), and one line in `src/components/todo-item.tsx` (`<DeleteTodoButton todoId={todo.id} />`
  plus its import), each with its test; the existing `src/components/todo-item.test.tsx` gains a mock and the AC-19.5 (b)
  tests; `e2e/19-delete.spec.ts` for AC-19.7.
- Pros: the spec's own paths and wiring, so `check-spec-sections.sh`, the features map and `/spec-trace` agree; no
  held file (`page.tsx`, `todos.ts`, `actions/todos.ts`) and none of the sibling-owned files touched, so
  `next-task.sh --check B3.3` finds no overlap with B3.1 (`todo-due-date.tsx`) or B3.2 (`todo-form.tsx`); every AC
  (AC-19.1 to AC-19.7) is red and green in one pass; the shape mirrors the merged B2.3.
- Cons: `todo-item.tsx` is shared with B3.1 only through `TodoDueDate`, which B3.1 edits in its own file, so there is
  no real overlap, but both cards' PRs touch `spec/features-map.md` and `spec/technical-requirements.md` rows (an
  order-only conflict, the orchestrator resolves it, analysis Q6); the button is inert without JavaScript (table
  below).
- Fits rules: yes. Invariant 1 (a module per §19), 3 (the mutation is a Server Action, Zod parse of the id by the
  existing `toggleTodoSchema`, `ActionResult`, nothing thrown), 4 (Prisma only in `src/lib`, through `@/lib/prisma`),
  2 (red commit before any green; the `feat(...)` commit touches no test file), 5 (nothing stateful added).

### Approach B (rejected): `<form action={…}>` wiring, or the state hosted in `TodoItem`

- Change: either `DeleteTodoButton` renders `<form action={deleteTodoAction.bind(null, todoId)}>` with a submit
  button and `useActionState`; or `DeleteTodoButton` is dropped and `TodoItem` holds the delete state and alert
  (analysis Q4, "otherwise").
- Pros: the form variant deletes with JavaScript off and before hydration; the hosted variant has one component.
- Cons: the form variant makes the action receive `(id, FormData)`, which breaks AC-19.5 (a) "the action is called once
  with exactly `('todo-9')`" and the contract line "calls deleteTodoAction(todoId) in a transition", and a form
  action cannot hand its result to the alert without `useActionState`, a different signature than §19 writes; it
  also puts a second `<form>` in a row whose edit mode already has one. The hosted variant removes the component
  AC-19.5 (a) and AC-19.6 render on its own, makes `todo-item.tsx` a larger change (D-21 lets this card edit that one
  file, but §19 says "nothing else changes"), and risks a second `role="alert"` in the row's own state. Spec wins on
  behavior and signatures (`spec-fidelity.md`): not allowed without a D-n.
- Fits rules: breaks no invariant, but it breaks §19's Function contracts.

### Component wiring, markup per approach (the one client component this card adds, and the one it changes)

| Component                | Wiring                                | Server-rendered markup today, then after                                                                                                                                                                                                                   | JavaScript off                                                                         | Submit before hydration                                                        |
| ------------------------ | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `TodoItem` (changed)     | A (one more child)                    | today: `<li>` with checkbox, label, `Edit title` button, due date, no delete. After: the same plus `<div><button type="button" aria-label="Delete todo" title="Delete todo"><svg aria-hidden/></button></div>`, no `<p role="alert">` until a failed click | the new button is inert (no form, no handler), as `Edit title` and `Mark all complete` | the click is lost (no handler yet), as for `Edit title`; no state is corrupted |
| `DeleteTodoButton` (new) | A: `onClick` + `useTransition`        | no such component today; after: the `<div>` above                                                                                                                                                                                                          | inert; nothing deletes                                                                 | click lost                                                                     |
| `DeleteTodoButton` (new) | B: `<form action>` + `useActionState` | after: `<form><button type="submit">…</button></form>` inside the `<li>`                                                                                                                                                                                   | would submit and delete without JavaScript, then show no failure text                  | a submit works once the action reference is posted; no pending/alert wiring    |

- B drops, as listed in its cons: the exact-arguments call of AC-19.5 (a), the "transition" wiring, and the single
  `<li>`-level form structure. A drops nothing that exists today: every existing control keeps its markup, and the
  idle row text stays exactly the title (the button is icon-only, the `<svg>` is `aria-hidden`, so AC-5.1 and the
  e2e `toHaveText(['C', 'B', 'A'])` comparisons hold).

## Recommendation

Approach A. One phase, in the order skeleton, red, green, paperwork.

- **Skeleton** (`chore(todos): B3.3 skeleton`), the B2.3 pattern, nothing mounted:
  - `src/lib/todo-delete.ts`: `export async function deleteTodo(id: string): Promise<void>` returning
    `Promise.reject(new NotImplementedError(\`deleteTodo(${id})\`))`; imports only `NotImplementedError`from`@/lib/errors`(an unused`prisma`or`TodoNotFoundError` import fails lint).
  - `src/actions/delete-todo.ts`: `'use server'`; `export async function deleteTodoAction(id: string):
Promise<ActionResult<{ id: string }>>` returning `Promise.reject(new NotImplementedError(\`deleteTodoAction(${id})\`))`(type-only import of`ActionResult`). Exactly one export (a `'use server'` file exports async functions only).
  - `src/components/delete-todo-button.tsx`: `'use client'`; `DeleteTodoButton({ todoId })` throwing
    `NotImplementedError(\`DeleteTodoButton(${todoId})\`)`.
  - `src/lib/logger.ts`: `MutationActionName` gains `'deleteTodoAction'` (type only) so the red action tests typecheck.
  - `spec/features-map.md`: the F17 row (`✗`, three modules plus `todo-item.tsx` and `logger.ts`) so
    `check-features-map.sh` stays green per push; tests join the row at `docs(map)`. `spec/technical-requirements.md`
    keeps the §19 row `✗` until the closing commit (`check-ac-coverage.sh` expects tests for `✅`/`◐` rows).
  - **`src/components/todo-item.tsx` is not touched in the skeleton.** Mounting the throwing stub would turn every
    existing `TodoItem` test red and the new AC-19.5 (b) tests would then fail on `NotImplementedError` rather than
    on the missing button; both are wrong.
- **Red** (`test(ui): B3.3 delete a todo (red)`, written by `test-writer`, body "Red because …"): the three new test
  files, the edit to `todo-item.test.tsx`, and `e2e/19-delete.spec.ts`.
- **Green** (`feat(todos): B3.3 delete a todo`): bodies of the three stubs plus the one-line mount in
  `todo-item.tsx`; no test file.
- Layout, left to green: place `<DeleteTodoButton>` last in the `<li>`, after `TodoDueDate` and the row's own alert
  (REQ-19.3 only asks for "in every row, in both modes"); the wrapper is a `<div>` (a `<p role="alert">` is invalid
  inside a `<span>`), `flex items-center gap-2`. The row's alert already carries `ml-auto`; give the delete wrapper
  `ml-auto` too only if it looks wrong, a cosmetic choice (REQ-19.10 asks only that the message follows the button).

Bodies, spec-exact, for the green writer:

```ts
// src/lib/todo-delete.ts
export async function deleteTodo(id: string): Promise<void> {
  const { count } = await prisma.todo.deleteMany({ where: { id } });
  if (count === 0) throw new TodoNotFoundError(id);
}
// src/actions/delete-todo.ts: const parsed = toggleTodoSchema.safeParse({ id });
//   if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsOf(parsed.error) };   // outside the try
//   try { await deleteTodo(parsed.data.id); revalidatePath('/'); return { ok: true, data: { id: parsed.data.id } }; }
//   catch (error) { if (error instanceof TodoNotFoundError) return failure('id', 'Todo not found');
//     logMutationFailure('deleteTodoAction', error); return failure('form', MUTATION_FAILED_MESSAGE); }
```

## Impact

| File                                                     | Add/Change   | Signature                                                                                                                                          | ACs                       |
| -------------------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| `src/lib/todo-delete.ts`                                 | Add          | `export async function deleteTodo(id: string): Promise<void>` (`import { prisma } from '@/lib/prisma'`, `TodoNotFoundError` from `@/lib/todos`)    | AC-19.1                   |
| `src/lib/todo-delete.test.ts`                            | Add (red)    | node; `vi.mock('@/lib/prisma')` only (Q8); AC-19.1, plus an unprefixed "rethrows a storage error unchanged" test                                   | AC-19.1                   |
| `src/actions/delete-todo.ts`                             | Add          | `export async function deleteTodoAction(id: string): Promise<ActionResult<{ id: string }>>` (`'use server'`)                                       | AC-19.2, AC-19.3, AC-19.4 |
| `src/actions/delete-todo.test.ts`                        | Add (red)    | node; `vi.mock('@/lib/todo-delete')`, `vi.mock('next/cache')`, `vi.mock('@/lib/logger')`, `vi.mock('@/lib/prisma', () => ({ prisma: {} }))`        | AC-19.2, AC-19.3, AC-19.4 |
| `src/lib/logger.ts`                                      | Change       | `MutationActionName` gains `'deleteTodoAction'` (type only, no runtime change)                                                                     | AC-19.4                   |
| `src/components/delete-todo-button.tsx`                  | Add          | `export function DeleteTodoButton({ todoId }: { readonly todoId: string }): ReactNode` (`'use client'`)                                            | AC-19.5, AC-19.6          |
| `src/components/delete-todo-button.test.tsx`             | Add (red)    | jsdom; `vi.hoisted` object, `vi.mock('@/actions/delete-todo', () => deleteActions)`                                                                | AC-19.5 (a), AC-19.6      |
| `src/components/todo-item.tsx`                           | Change       | one import and `<DeleteTodoButton todoId={todo.id} />` inside the `<li>`, outside the `editing` ternary so both modes show it                      | AC-19.5 (b), AC-19.7      |
| `src/components/todo-item.test.tsx`                      | Change (red) | add `const deleteActions = vi.hoisted(...)` + `vi.mock('@/actions/delete-todo', () => deleteActions)`; new AC-19.5 (b) tests; no assertion changed | AC-19.5 (b)               |
| `e2e/19-delete.spec.ts`                                  | Add (red)    | Playwright; seed through `PrismaClient` as `e2e/14`, `seedInDisplayOrder`, `openHydrated`                                                          | AC-19.7                   |
| `spec/features-map.md`, `spec/technical-requirements.md` | Change       | F17 row (`✗` then `✅`), §19 row `✗` then `✅`                                                                                                     | map, index                |
| `docs/metrics.md`                                        | Change       | per-card row B3.3                                                                                                                                  | metrics                   |

Client component `TodoItem`, per approach: A keeps the server-rendered markup listed in the table above (one extra
inert icon button; JavaScript off and before hydration identical to `Edit title`, nothing dropped); B is the form
variant (rejected, listed cons).

Not touched by this card (D-21): `src/app/page.tsx`, `src/components/todo-due-date.tsx`, `src/components/todo-form.tsx`,
`src/lib/todos.ts`, `src/actions/todos.ts`, and every `src/*/CLAUDE.md`. The orchestrating session adds, in its one
docs PR after the batch (`00-decisions.md:47`): `src/lib/CLAUDE.md` row `todo-delete.ts` §19, the `logger.ts` row
naming §19, `src/actions/CLAUDE.md` naming `delete-todo.ts` (the "any error other than `TodoNotFoundError`" sentence
list gains `deleteTodoAction`), `src/components/CLAUDE.md` one line for `delete-todo-button.tsx` (§19, `'use client'`).

## Risks

- Migration: none. One `deleteMany` on the existing table; no schema change, no index (the delete is by primary key).
  `@updatedAt` is irrelevant to a delete.
- Security: the id crosses the boundary as a string and is parsed by `toggleTodoSchema` before any storage call; Prisma
  parameterizes it (`where: { id }`), so no injection. Unauthenticated like every action here (single-person app, §1).
  The failure result never carries the thrown text (`MUTATION_FAILED_MESSAGE` only); §11's redaction is unchanged. A
  delete is final (REQ-19.5, out of scope: undo), so a stray click loses a todo: accepted by the spec.
- Performance: one statement by primary key.
- Isolation: no env key, port or path (invariant 5).
- **Existing tests that the change could turn red.**
  - `src/components/todo-item.test.tsx`: after the feat, `TodoItem` imports `@/actions/delete-todo`, which imports
    `@/lib/todo-delete` and `@/lib/todos`, whose `@/lib/prisma` pulls `server-only` (throws under Vitest). Without the
    new mock every test in the file fails on import. This is why the red commit adds it (question Q3 below).
  - The same file's whole-row assertions (`toHaveTextContent(/^Buy mik$/)` at line 65; `within(row).getByRole('alert')`
    at lines 142 and 167) still hold: the new button adds no text and no alert until a failed click. No existing test
    calls `getAllByRole('button')` on a `TodoItem` row.
  - e2e `05`, `06`, `10`, `13`, `14`, `15`: rows are compared with `toHaveText([...])` on `textContent`, which an
    icon-only button with `aria-hidden` svg does not change; buttons are located by exact name (`Add`, `Edit title`,
    `Save`, `Clear completed`, `Mark all complete`); `getByLabel('Due date', { exact: true })` in `15` does not match
    "Delete todo". The one thing to re-run is the whole e2e suite once, because every row now has one more button.
  - No test renders `TodoItem` besides `todo-item.test.tsx` (checked with `grep -rln "TodoItem\|todo-item" src e2e`).
- Two controls in one row can be in flight at once: a delete pending while the checkbox is toggled (the checkbox is
  disabled only by its own `pending`). The toggle then reports `Todo not found` or succeeds on a row that is about to
  vanish. REQ-19.6 asks only that the delete button is disabled; out of scope, noted for the reviewer.
- Spec gaps worth knowing, none a spec change: (1) AC-19.3 and AC-19.4 say `TodoNotFoundError` is "the real class of
  `@/lib/todos`" but do not list `vi.mock('@/lib/prisma', () => ({ prisma: {} }))`; `testing.md` requires it whenever
  the real lib loads (`server-only`), as `src/actions/todos.test.ts` does. (2) No criterion covers "the storage call
  rejects inside `deleteTodo`": AC-19.4 (a) mocks `deleteTodo` itself. An unprefixed lib test (rethrows the original
  error unchanged, `testing.md` allows tests without a criterion) keeps a mutant that swallows it from surviving.
  (3) REQ-19.10 "keeps the todo listed" has no unit AC beyond "no revalidate"; AC-19.7 covers it end to end.
- `backlog/00-decisions.md` has two rulings numbered D-21 (line 41, the §16 length rule; line 47, batch 3). Citing by
  line here; the human should renumber one (see Doc drift in the questions below).
- Merge friction: `spec/features-map.md` (F15/F16/F17 rows) and `spec/technical-requirements.md` (§17/§18/§19 rows)
  conflict trivially with B3.1 and B3.2; resolve in the second PR, rows in numeric order.
- Dependencies: none proposed.

## Test strategy

| Layer     | File                                         | ACs                            | Mocks                                                                                                                                                                                                                                                                                                                                                                                     |
| --------- | -------------------------------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| unit      | `src/lib/todo-delete.test.ts`                | AC-19.1; storage error (no AC) | `@/lib/prisma` with `todo: { deleteMany, findMany, findUnique, create, update, delete, updateMany }` all `vi.fn`; `deleteMany` resolves `{ count: 1 }` then `{ count: 0 }`; assert the two exact `calls[n]` arguments, `rejects` with `TodoNotFoundError` whose `id` is `missing`, every other method 0 calls; `deleteMany` rejecting `new Error('db down')` rejects with that same error |
| unit      | `src/actions/delete-todo.test.ts`            | AC-19.2, AC-19.3, AC-19.4      | `@/lib/todo-delete`; `next/cache`; `@/lib/logger` (`vi.fn<(action: MutationActionName, error: unknown) => void>()`); `@/lib/prisma` as `{ prisma: {} }` so the real `TodoNotFoundError` loads; case (b) `revalidatePath` throws `new Error('cache down')`; assert `calls[0]` of the logger with `toBe` on the error object                                                                |
| component | `src/components/delete-todo-button.test.tsx` | AC-19.5 (a), AC-19.6           | `@/actions/delete-todo` through a `vi.hoisted` object; a hand-settled deferred promise for the pending state; three clicks in one test for AC-19.6, `getAllByRole('alert')` length asserted, same parent and order asserted                                                                                                                                                               |
| component | `src/components/todo-item.test.tsx`          | AC-19.5 (b)                    | the existing `vi.hoisted` `actions` for `@/actions/todos` untouched; one new `vi.hoisted` object for `@/actions/delete-todo` (add a key, never remove one); a new todo factory with id `todo-1`, title `Walk the dog`                                                                                                                                                                     |
| e2e       | `e2e/19-delete.spec.ts`                      | AC-19.7                        | none; real server and database, seeded in display order C (open), B (done), A (open); wait for hydration before each click (`openHydrated`)                                                                                                                                                                                                                                               |

Red proof, per file (what `scripts/verify-red.sh B3.3` sees): the skeleton stubs reject or throw
`NotImplementedError` (lib, action, component render), so every new test in the three new files fails on that or on
an assertion; `todo-item.test.tsx` fails on the AC-19.5 (b) assertions (`getByRole('button', { name: 'Delete todo' })`
finds nothing, because `todo-item.tsx` is not yet changed). The failure messages contain "is not implemented" or
"Unable to find an accessible element": none matches the script's import-error pattern (which includes "is not
defined": keep that phrase out of any skeleton message). The e2e is listed and skipped by the script; the red commit
body records `pnpm test:e2e e2e/19-delete.spec.ts` → failed (AC-19.7 fails on "no button named Delete todo").

`pnpm test` count: the existing tests unchanged plus the new ones (AC-19.1 one, plus the storage-error test; AC-19.2,
AC-19.3 two cases in one or two titles, AC-19.4 (a) and (b); AC-19.5 (a) and (b); AC-19.6). Counts fixed by the plan.

## Mutation hot spots

Scope is `src/lib/**` + `src/actions/**` (`stryker.config.mjs`); the component is outside it, so its score rests on
AC-19.5 and AC-19.6 alone. Threshold 70 %.

- `todo-delete.ts`: `count === 0` (conditional-expression `true`/`false` and `!==` mutants are killed by the `{ count: 1 }`
  then `{ count: 0 }` pair; a `<= 0` mutant is equivalent because a count is never negative); the `where: { id }`
  object (killed only by the exact `toEqual` on `mock.calls[n]`); `new TodoNotFoundError(id)` (assert `error.id`
  equals `missing`, so passing a literal fails); a `try/catch` mutant that swallows a storage error (the unprefixed
  rethrow test).
- `delete-todo.ts`: the `safeParse` placed outside the `try` (a mutant moving it inside would log a validation error:
  the `''` case asserts `logMutationFailure` 0 calls and `deleteTodo` 0 calls); `error instanceof TodoNotFoundError`
  (`true` mutant makes the `db down` case report `Todo not found` and skip the log; `false` mutant logs the not-found
  case: both killed by AC-19.3 (0 logs) and AC-19.4 (a) (1 log, `form` key)); the strings `Todo not found` and the
  keys `id` / `form` (exact `toEqual` on the result); `revalidatePath('/')` argument, call count 1 on success, 0 on
  both failures, and its position inside the `try` after the lib call (killed by the `cache down` case (b): the result
  must be the form failure and the log must have one entry); `logMutationFailure` called once, with exactly two
  arguments in that order (`toHaveBeenCalledWith('deleteTodoAction', error)` plus `toHaveBeenCalledTimes(1)`); the
  success value `{ ok: true, data: { id } }` (`parsed.data.id` and the argument are equal, so swapping them is an
  equivalent mutant; mutating the key `id` or the `ok` literal is killed by AC-19.2).
- Component (outside Stryker, still assert): `disabled={pending}` (enabled before, disabled while the deferred
  promise is pending, enabled after); `result.ok ? undefined : (fieldErrors.id?.[0] ?? fieldErrors.form?.[0])` (the
  `id` message `Todo not found` and the `form` message both shown; success clears: step (c)); the alert being the
  button's next sibling in one wrapper (assert same parent and order); exactly one `button` named "Delete todo"
  (icon-only, no visible text).
- Module header strings and the `'use server'` / `'use client'` directives are not mutants.

## Questions settled / escalated

```
Question:    Is adding vi.mock('@/actions/delete-todo') to the existing src/components/todo-item.test.tsx in the red commit a legitimate change, and how do verify-red.sh and check-feat-commits.sh treat it?
Class:       P0 no conflict
Sources:     spec/contracts/17-delete.md:65 "Test note for `src/components/todo-item.test.tsx` (an existing file): `TodoItem` now imports"
             .claude/rules/testing.md:17 "assertion or the skeleton's `NotImplementedError`, never on an import. Never loosen an assertion to go green;"
             scripts/ci/check-feat-commits.sh:2 "Fail when a commit tagged as implementation (subject starts with "feat(" or "feat:") touches a test file"
             scripts/verify-red.sh:16 "#      an import, syntax or transform error. Pre-existing tests in an extended file may pass."
Conflict:    none
Verdict:     Legitimate, and it has to be in the red commit. §19 (level 3) says that file mocks the new action module at
             the boundary; testing.md allows exactly that kind of change (a new mock key, `vi.hoisted`, no assertion
             changed or removed, so nothing is weakened: invariant 2). It cannot wait for the feat commit: after the
             feat, `TodoItem` pulls `server-only` through the action, and `check-feat-commits.sh` rejects any
             `feat(` commit that touches `*.test.tsx`. verify-red.sh: it copies the whole file from the last `(red)`
             commit onto the parent of the first one (the skeleton, where `src/actions/delete-todo.ts` already
             exists, so the mock resolves); the existing tests are "old" titles and may pass; the new AC-19.5 (b)
             tests must exist (else "no new test executed" fails the file) and must fail, which they do because
             `todo-item.tsx` is unchanged in the skeleton. Two traps: (1) a new title that starts with an existing
             title verbatim is classed old by the script (`startsWith`), so use new `AC-19.5: …` titles; (2) the
             edit must be in the `test(...) (red)` commit, not a later hardening commit (the script judges only
             `(red)` commits and the hardening ones are not red by design).
Next action: Plan Files table lists `src/components/todo-item.test.tsx` as "Change (red)"; `test-writer` makes the edit
             (plan-scope.sh refuses a test file from any other writer).
Must not:    Leave the mock to the `feat(` commit, or add it as a "fix" after green, or add a global `server-only` mock to `vitest.setup.ts` (a configuration change that needs `config-change-approved`).
Doc drift:   none
Escalate:    none
```

```
Question:    Which stubs make the red fail on NotImplementedError and never on an import?
Class:       P0 no conflict
Sources:     .claude/rules/testing.md:17 "assertion or the skeleton's `NotImplementedError`, never on an import."
             spec/contracts/17-delete.md:46 "// src/lib/todo-delete.ts (§19); Prisma only through '@/lib/prisma'"
Conflict:    none
Verdict:     Three stubs, each with the exact §19 signature (see Recommendation), plus the type-only logger member, so
             every import in the new tests resolves and typechecks. `todo-item.tsx` is not mounted in the skeleton.
Next action: Skeleton commit `chore(todos): B3.3 skeleton`, `pnpm lint && pnpm typecheck && pnpm test` green first.
Must not:    Import `prisma` or `TodoNotFoundError` in a stub (lint), put a body in a stub, or mount the stub in `TodoItem`.
Doc drift:   none
Escalate:    none
```

```
Question:    Analysis Q1, Q2, Q4, Q5: confirm no confirmation step, "Todo not found" stays in the row, the button owns the alert, delete is available in edit mode.
Class:       P0 no conflict
Sources:     spec/contracts/17-delete.md:20 "THE SYSTEM SHALL delete on a single activation of the button: there is no confirmation step and no undo."
             spec/contracts/17-delete.md:31 "A missing id is not a failure in the sense of §10 (as for toggle and edit): it is not logged, and nothing is refreshed, so the row"
Conflict:    none
Verdict:     The spec decided all four (REQ-19.5, REQ-19.8, the `DeleteTodoButton` contract line, REQ-19.3). Follow them.
Next action: none beyond the plan.
Must not:    Add a confirm control, revalidate on a missing id, lift the alert into `TodoItem`, or disable the button in edit mode.
Doc drift:   none
Escalate:    none
```

```
Question:    Analysis Q8: where does deleteTodo get TodoNotFoundError, given src/lib/todos.ts is off limits?
Class:       P0 no conflict
Sources:     spec/contracts/17-delete.md:46 "count 0 → throws TodoNotFoundError (from '@/lib/todos', §5); no other prisma.todo call"
             backlog/00-decisions.md:47 "logic lives in each card's own modules."
Conflict:    none
Verdict:     Import the existing class from `@/lib/todos` (no edit to that file). The lib test mocks `@/lib/prisma` only and
             the real `todos.ts` loads under it; the action test also mocks `@/lib/prisma` (testing.md, `server-only`).
Next action: Green's `todo-delete.ts` imports `{ TodoNotFoundError } from '@/lib/todos'`.
Must not:    Redefine the class in the new module (`instanceof` in the action would then fail for one of the two).
Doc drift:   none
Escalate:    none
```

```
Question:    Analysis Q6 and Q7: the index jump from §16 to §19, and §9's "Deleting a single todo" Out-of-scope line.
Class:       P0 no conflict
Sources:     spec/contracts/17-delete.md:75 "| Clear completed still deletes exactly the completed rows"
             backlog/00-decisions.md:47 "lifting that exclusion from §5's Out of scope in its own `docs(spec)` commit."
Conflict:    none
Verdict:     D-21 lifts only §5's line, which `6ed4178` already did; §9's line describes §9's own scope and stays. The
             index/map row conflicts with B3.1 and B3.2 are order-only and belong to the orchestrator at merge.
Next action: none for this card.
Must not:    Edit §9 or another section's rows to "tidy" the index.
Doc drift:   none
Escalate:    none
```

```
Question:    Two rulings in 00-decisions.md carry the id D-21; does it matter to this card?
Class:       P3 section contradicts itself
Sources:     backlog/00-decisions.md:41 "| D-21 | §16 `searchTodos` returns no todo for a trimmed query whose `length` exceeds"
             backlog/00-decisions.md:47 "| D-21 | Batch 3 of parallel delivery runs without a second plan approval:"
Conflict:    Line 41 and line 47 both use D-21 (one in an earlier table, one under "Settled 2026-11-01"); a citation by id alone is ambiguous.
Verdict:     No effect on B3.3's behavior: only the batch-3 ruling concerns it, and this file cites it by line. The id
             clash is a bookkeeping defect in a file only the human edits.
Next action: In the plan and PR body write "D-21 (batch 3, `00-decisions.md:47`)".
Must not:    Renumber or edit `00-decisions.md` from this card.
Doc drift:   `backlog/00-decisions.md`: renumber one of the two rows (the human, a `docs(backlog)` commit outside this card).
Escalate:    none
```

```
Question:    §11's Function-contracts block (09-logging.md:49) lists four action names; the code already has six, and B3.3 adds a seventh. Is that drift this card must fix?
Class:       P1 code ≠ spec (accepted pattern)
Sources:     spec/contracts/09-logging.md:49 "export type MutationActionName ="
             spec/contracts/17-delete.md:55 "// src/lib/logger.ts (§11): the union MutationActionName gains one member, 'deleteTodoAction'; no other change to §11"
Conflict:    §11 block names four members / §14, §15 and §19 each say "gains one member" and the code has six.
Verdict:     §19 (level 3, the newer section) governs what this card does: add the one member, type only. §11's block is
             not edited by a card ("no other change to §11"); B2.3 and B3.1 accepted the same lag and `/spec-trace`
             reports it. Not this card's to fix.
Next action: Add the member in the skeleton; mention the lag in the PR body as B2.3 did.
Must not:    Edit §11 or the logger's runtime to "reconcile" the lists.
Doc drift:   `spec/contracts/09-logging.md` §11 union block: the lead or a `spec-analyst` card, outside B3.3, in a `docs(spec): §11 …` commit inside a D-n.
Escalate:    none
```

## Doc drift summary

- `src/lib/CLAUDE.md`, `src/actions/CLAUDE.md`, `src/components/CLAUDE.md`: the orchestrating session, one docs PR after
  the batch (`00-decisions.md:47`), not this card.
- `spec/contracts/09-logging.md` §11 union block and the duplicate D-21 id: the human, outside this card.
- `spec/features-map.md` F17 row and `spec/technical-requirements.md` §19 row: this card (skeleton row `✗`, closing
  commit `✅`, `docs(map): F17 delete a todo [B3.3]`).
