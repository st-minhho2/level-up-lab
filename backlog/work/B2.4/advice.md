# B2.4 advice

Read first: §15 (`spec/contracts/13-due-date.md`) already fixes every path, signature, message and the logger member,
and D-20 fixes the ownership rule for the shared mount points. So this file chooses nothing the spec chose. It settles
the module placement against the shared files, the skeleton and red/green split, the test boundary and the mutation
hot spots, and gives a recommendation on each analysis question that changes Files or tests. The `Lead approves spec`
box under §15 is unticked (`spec/contracts/13-due-date.md:5`); the plan gate's "approve" reply may tick it (D-7).
Nothing was run: this advice is read-only on `src/`; the sibling B2.5 was read from its branch `feat/B2.5-search`
(`git show`), not changed.

## Approaches

### Approach A (recommended): the spec's shape, with `page.tsx` released

- Change: a new pure module `src/lib/todo-due-date.ts` (`DUE_DATE_INVALID_MESSAGE`, `setTodoDueDateSchema`,
  `dueDateToDate`, `dueDateOf`); `src/lib/todos.ts` gains `dueDate?` on `Todo`, `dueDate: true` in `todoFields`, one
  private row-to-`Todo` mapper used by the four existing functions, and `setTodoDueDate`; `src/actions/todos.ts` gains
  `setTodoDueDateAction`; `src/lib/logger.ts` widens `MutationActionName` by one member; a new client component
  `src/components/todo-due-date.tsx`; one import and one JSX line in `src/components/todo-item.tsx`;
  `prisma/schema.prisma` plus a migration. `src/app/page.tsx`, `src/lib/todo-schema.ts`, `todo-form.tsx`,
  `createTodoAction` and `prisma/seed.ts` do not change.
- Pros: matches §15's function contracts one to one; the action stays in `todos.ts`, so every existing component test
  that mocks `@/actions/todos` keeps loading; B2.5 gets `page.tsx` at once (B2.5's analysis says `page.tsx` "is B2.4's"
  and waits for it, so B2.4 not planning it removes B2.5's only blocking dependency).
- Cons: `todos.ts` and `actions/todos.ts` stay held by B2.4 for the whole card (B2.5 avoids both, so no cost);
  `todos.ts` mapper touches all four existing functions, so one mistake in the mapper breaks the §5 and §6 lib tests
  (see Risks).
- Fits rules: invariant 3 (mutation only through the action, Zod outside the `try`), invariant 4 (Prisma only in
  `src/lib/todos.ts`; `todo-due-date.ts` has no Prisma and no `server-only`, so the client may import it), ts-style
  (`undefined` in app types, `null` only in the Prisma row).

### Approach B (alternative): fold the due-date UI into `TodoItem` and the schema into `todo-schema.ts`

- Change: no new component and no new lib module; `TodoItem` gets a second `editing` flag and a second error state;
  the schema joins `createTodoSchema` in `todo-schema.ts`.
- Pros: fewer files (about 3 fewer); no new row in the features map for a component.
- Cons: contradicts §15's function contracts (`TodoDueDate` is a named export of `src/components/todo-due-date.tsx`,
  `setTodoDueDateSchema` is in `src/lib/todo-due-date.ts`), so it breaks invariant 1 unless the spec changes first;
  `TodoItem` has one `error` state, and AC-15.6 asserts the alert inside the due-date wrapper while the toggle's alert
  stays independent (analysis Q7), so one shared state would show one message for two controls; it edits
  `todo-schema.ts`, a file the analysis keeps free; it widens `todo-item.test.tsx`, which the card must leave
  untouched. Drops: the independent wrapper-scoped alert.
- Fits rules: no, see invariant 1. Compliant alternative is Approach A.

## Recommendation

Approach A. Plan the files below and list `src/app/page.tsx` as "not touched" so `scripts/next-task.sh --check`
reports no overlap on it. Commit order on the branch (`backlog/CLAUDE.md`): `chore(todos): B2.4 skeleton` →
`test(todos): B2.4 … (red)` → `feat(todos): B2.4 …` → `docs(map): F13 … [B2.4]`.

- Skeleton: `prisma/schema.prisma` + the migration (one commit, `/add-migration`); `src/lib/todo-due-date.ts` with a
  permissive `setTodoDueDateSchema` stub (so the red fails on an assertion, not an import) and `dueDateToDate` /
  `dueDateOf` throwing `NotImplementedError`; `Todo.dueDate?` and a `setTodoDueDate` stub throwing
  `NotImplementedError` in `todos.ts`, with `todoFields` and the four mappings left alone; `setTodoDueDateAction` stub in
  `actions/todos.ts`; the one logger union member (type only; the red action test's `vi.fn<(action: MutationActionName,
…)>` needs it for `pnpm typecheck`); `TodoDueDate` stub returning `null`; the F13 row with status `✗` in
  `spec/features-map.md` (see Question 7). Do not wire `TodoDueDate` into `TodoItem` in the skeleton: a throwing stub in
  the row would turn the existing `todo-item.test.tsx` red.
- Green: mapper, `setTodoDueDate`, action, component, the `TodoItem` line, in one `feat(todos)` commit that touches no
  test file.

Order of work inside the green commit, smallest blast radius first: `todo-due-date.ts` (pure), mapper in `todos.ts`,
`setTodoDueDate`, action, component, `TodoItem` line.

## Impact

| File                                                                                   | Add/Change | Signature                                                                                                                                                                                                                                          | ACs                |
| -------------------------------------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| `prisma/schema.prisma`                                                                 | Change     | `model Todo` gains `dueDate DateTime? @db.Date`                                                                                                                                                                                                    | REQ-15.1, REQ-15.9 |
| `prisma/migrations/<timestamp>_add_todo_due_date/migration.sql`                        | Add        | generated by `pnpm db:migrate --name add-todo-due-date`: one nullable `DATE` column on `"todos"`, no index, no backfill                                                                                                                            | REQ-15.9           |
| `src/lib/todo-due-date.ts`                                                             | Add        | `DUE_DATE_INVALID_MESSAGE`, `setTodoDueDateSchema`, `dueDateToDate(dueDate: string): Date`, `dueDateOf(stored: Date \| null): string \| undefined` (as §15)                                                                                        | AC-15.1, AC-15.2   |
| `src/lib/todo-due-date.test.ts`                                                        | Add        | node; pure, no mocks                                                                                                                                                                                                                               | AC-15.1            |
| `src/lib/todos.ts`                                                                     | Change     | `Todo.dueDate?: string`; `todoFields` + `dueDate: true`; private `toTodo(row)` used by `listTodos`, `createTodo`, `toggleTodo`, `updateTodoTitle`; `export async function setTodoDueDate(id: string, dueDate: string \| undefined): Promise<Todo>` | AC-15.2, REQ-15.8  |
| `src/lib/todo-due-date-store.test.ts`                                                  | Add        | node; `vi.mock('@/lib/prisma')`; imports `listTodos`, `setTodoDueDate`, `TodoNotFoundError` from `./todos`                                                                                                                                         | AC-15.2            |
| `src/lib/logger.ts`                                                                    | Change     | `MutationActionName` gains `'setTodoDueDateAction'` (type only)                                                                                                                                                                                    | AC-15.4            |
| `src/actions/todos.ts`                                                                 | Change     | `export async function setTodoDueDateAction(id: string, dueDate: string): Promise<ActionResult<Todo>>`                                                                                                                                             | AC-15.3, AC-15.4   |
| `src/actions/todos.test.ts`                                                            | Change     | add a `describe('setTodoDueDateAction')`; add key `setTodoDueDate: vi.fn()` to the hoisted `lib` object and to the `vi.mock('@/lib/todos')` factory (add, never remove)                                                                            | AC-15.3, AC-15.4   |
| `src/components/todo-due-date.tsx`                                                     | Add        | `export function TodoDueDate({ todoId, dueDate }: { readonly todoId: string; readonly dueDate: string \| undefined }): ReactNode` (`'use client'`)                                                                                                 | AC-15.5, AC-15.6   |
| `src/components/todo-due-date.test.tsx`                                                | Add        | jsdom; `vi.hoisted` object with `setTodoDueDateAction`, `vi.mock('@/actions/todos', () => actions)`                                                                                                                                                | AC-15.5, AC-15.6   |
| `src/components/todo-item.tsx`                                                         | Change     | import `TodoDueDate`; `<TodoDueDate todoId={todo.id} dueDate={todo.dueDate} />` inside the `<li>`, after the title/edit block and before the toggle's error `<span>`                                                                               | AC-15.5, AC-15.7   |
| `e2e/15-due-date.spec.ts`                                                              | Add        | Playwright; seed through `PrismaClient` as `e2e/14-complete-all.spec.ts` (`seedInDisplayOrder`), `openHydrated`                                                                                                                                    | AC-15.7            |
| `spec/features-map.md`                                                                 | Change     | F13 row: `✗` in the skeleton, files and tests and `✅` in `docs(map)`                                                                                                                                                                              | map                |
| `src/lib/CLAUDE.md`, `src/actions/CLAUDE.md`, `src/components/CLAUDE.md`               | Change     | one row or sentence each (module table row; the "four actions" sentence gains the sixth; one line for `todo-due-date.tsx`, `'use client'`)                                                                                                         | docs               |
| `docs/metrics.md`                                                                      | Change     | per-card row B2.4 (closing lane)                                                                                                                                                                                                                   | metrics            |
| `spec/technical-requirements.md`, `backlog/plan/E2-todos-plus.md`, `backlog/README.md` | Change     | §15 row `✗` to `✅`, card Done, totals: the closing lane only, a separate PR as B2.3 (#83)                                                                                                                                                         | index              |

`src/app/page.tsx` is not in the list. Evidence: it calls `listTodos()` and passes whole `Todo` objects to
`<TodoItem todo={todo} />`; `filterTodos` and `countRemaining` take and return the same objects, so `dueDate` travels
with them to `TodoItem`, which renders `TodoDueDate`. §15 names no change to the page (REQ and function contracts).

Client components the card changes (server-rendered markup; both are `'use client'`, so they render once on the server):

- `TodoItem` (changed by one line). Server-rendered markup: today the `<li>` holds the checkbox, the title `<label>`,
  and the icon-only "Edit title" `<button type="button">`; after, the same plus a wrapper from `TodoDueDate` holding
  `Due <date>` text (only when set) and one icon-only `<button type="button" aria-label="Edit due date">`.
  Submit with JavaScript off: today there is no form on the page row (edit mode needs state), so nothing can be
  submitted; after, the same: the date form exists only in edit mode, which needs a click handler. Submit before
  hydration: today the checkbox `onChange` and "Edit title" click do nothing until hydration; after, the same, and the
  "Edit due date" button is inert alike. Behavior either approach drops: none for A.
- `TodoDueDate` (new). Server-rendered markup: the wrapper with the optional `Due <date>` text and the one button; the
  `<form>` with the `<input type="date">` appears only after a click. With JS off or before hydration a click on
  "Edit due date" does nothing (same as "Edit title" today), and a date can only be saved after hydration; the e2e
  waits for `networkidle` as `e2e/14-complete-all.spec.ts` does. A native-form fallback (always-rendered field and
  `<form action>`) would contradict REQ-15.5 and AC-15.5 ("the Due date field is not shown"), so it is not offered.

## Risks

- **Migration:** additive, nullable, no default, no backfill, no index (`02-schema-and-env.md` §3). Read the generated
  SQL: it must be exactly one `ALTER TABLE "todos" ADD COLUMN "dueDate" DATE;`. It is immutable once on `main`; run
  `pnpm db:migrate` on the compose database only (the hook checks the host). B2.5 has no migration, so no timestamp
  ordering conflict. After B2.4 merges, a worktree that rebases onto `main` needs `pnpm db:generate` (stale Prisma
  client lacks `dueDate`, so `pnpm typecheck` fails until then) and `pnpm db:migrate` for its own schema (e2e).
- **Existing tests that the change could turn red (the real one):** `src/lib/todos.test.ts` builds rows with
  `makeRow()`, which has no `dueDate` key, and the feat commit may not touch test files. If the mapper calls
  `dueDateOf(row.dueDate)` and `dueDateOf` is written `stored === null ? undefined : …`, then `undefined` reaches
  `stored.toISOString()` and every `listTodos` / `createTodo` / `toggleTodo` / `updateTodoTitle` test throws a
  `TypeError`. Write `dueDateOf` as `stored?.toISOString().slice(0, 10)` (the parameter type stays `Date | null`, so
  the contract holds, null → `undefined` holds, and a row without the key also gives `undefined`). The AC-15.2 null row
  kills the mutant that drops the `?.`. Run `pnpm test` after the skeleton and after the feat to prove the 172-line file
  is untouched and green. Also `todo-item.test.tsx` mocks `@/actions/todos` with a hoisted object that lacks
  `setTodoDueDateAction`; the binding is read at click time only, so the old tests stay green, but this is the second
  thing to confirm at the first green run (do not edit that file to add the key unless a run proves it is needed;
  adding a key is allowed, removing is not).
- **Date handling (security-adjacent, correctness):** V8 rolls day overflow over (`new Date('2026-02-30T00:00:00.000Z')`
  is 2026-03-02, `'1900-02-29'` is 03-01, `'2026-04-31'` is 05-01) and accepts year `0000`. So validate with the
  regex, then `new Date(`${value}T00:00:00.000Z`)`, `Number.isNaN(getTime())`, and the round trip
  `toISOString().slice(0, 10) === value`, plus an explicit year >= 1 check. Do not use `Date.UTC(year, …)`: it maps
  years 0 to 99 to 1900 to 1999. Never use `new Date()` without the `Z` suffix or `toLocaleDateString` (REQ-15.1, the
  text is `YYYY-MM-DD` "in every browser and locale"). Verified with `node` on the nine strings above.
- **Zod boundary:** the action argument is typed `string` only at compile time; a Server Action receives network input.
  Give the schema `z.string({ error: DUE_DATE_INVALID_MESSAGE })` so a missing or non-string `dueDate` reports REQ-15.7's
  message and not Zod's default text (Zod `^4.6.7`). Error text for `id` stays `Todo id is required`.
- **Performance:** one extra `DATE` column per row in the list `select`; no index; `setTodoDueDate` costs one
  `findUnique` plus one `update` (same as `updateTodoTitle`).
- **Isolation:** each worktree has its own schema (invariant 5); `pnpm db:migrate` applies the column to this
  worktree's schema only, so the e2e run here and B2.5's run there do not share rows.
- **e2e text assertions:** `toHaveText` compares `textContent` with whitespace normalised, and the title `<label>` and
  the `Due …` text are separate elements with no space node between them, so a row reads `BDue 2026-11-05` there, not
  `B Due 2026-11-05`. AC-15.7 says "`B` followed by `Due 2026-11-05`": the e2e test asserts the title and the due text
  as two checks (`row.getByText('Due 2026-11-05')` and the checkbox name `B`), or a `toHaveText` regex, not one
  whole-row string with a space. Every other e2e file seeds no due date, so its whole-row `toHaveText(['C','B','A'])`
  stays true (the idle row adds no text, REQ-15.5).
- **Name collisions in existing e2e:** `getByRole('button', { name: 'Edit title' })` and `{ name: 'Save' }`
  (`e2e/06-edit-title.spec.ts:29-31,39`) do not substring-match "Edit due date" / "Update due date"; checked by grep. A
  date `<input>` has no `textbox` role, so `getByRole('textbox', { name: 'Edit title' })` is unaffected.
- **Merge with B2.5:** see Question 6.
- **No new dependency.**

## Test strategy

| Layer             | File                                       | ACs               | Mocks                                                                                                                          |
| ----------------- | ------------------------------------------ | ----------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| unit (node)       | `src/lib/todo-due-date.test.ts`            | AC-15.1           | none (pure)                                                                                                                    |
| unit (node)       | `src/lib/todo-due-date-store.test.ts`      | AC-15.2, REQ-15.8 | `vi.mock('@/lib/prisma', () => ({ prisma: { todo: db } }))`, `db` = `vi.hoisted({ findMany, findUnique, update })`             |
| unit (node)       | `src/actions/todos.test.ts` (add describe) | AC-15.3, AC-15.4  | existing: `@/lib/todos` (importOriginal + `setTodoDueDate` key), `next/cache`, `@/lib/logger`, `@/lib/prisma` `{ prisma: {} }` |
| component (jsdom) | `src/components/todo-due-date.test.tsx`    | AC-15.5, AC-15.6  | `vi.mock('@/actions/todos', () => actions)`, `actions = vi.hoisted({ setTodoDueDateAction: vi.fn() })`                         |
| e2e               | `e2e/15-due-date.spec.ts`                  | AC-15.7           | none; `PrismaClient` seeds and resets in `beforeEach`; real server and database                                                |

Notes for the test-writer (all inside the section's text, none adds behavior):

- Each AC is split into several `it` with the same `AC-15.n:` prefix (AC-15.1 into accepted / rejected / id / empty;
  AC-15.2 into list / set / clear / missing; AC-15.6 into open / failed then succeeded / empty submit / dueDate-key
  message). `check-ac-coverage.sh` needs one title per id when the §15 index row turns `✅`.
- AC-15.2 lib tests go in the new `src/lib/todo-due-date-store.test.ts`, not `todos.test.ts` (the file B2.5's
  `listTodos` neighbours might touch, and the file whose untouched `makeRow` proves the tolerant mapper).
- AC-15.3 and AC-15.4 go in the existing `src/actions/todos.test.ts`: it already holds the mock harness (F8, F9 rows
  list it) and B2.5 does not touch `actions/todos.ts`.
- `<input type="date">` in jsdom: set the value with `fireEvent.change(field, { target: { value: '2026-12-01' } })` if
  `user.type` does not accept it; query the field by `getByLabelText('Due date')`, not by role.
- AC-15.7 e2e: use `openHydrated` (`page.goto` then `networkidle`) before the first click, scope alerts by the row.

## Mutation hot spots

Stryker mutates `src/lib/**` and `src/actions/**` only (`stryker.config.mjs`), not components; the 70 % break is on
the whole set, and B2.3 landed at 90.67.

| Where                                                                                                                            | Survivor if untested                                                                    | Test that kills it (extra `it`, same AC prefix)                                                                                                       |
| -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `todo-due-date.ts` regex `^` anchor                                                                                              | leading text accepted                                                                   | `' 2026-11-05'` (in AC-15.1)                                                                                                                          |
| regex `$` anchor                                                                                                                 | trailing text accepted (`'2026-11-05x'`, `'2026-11-05 '`): not in AC-15.1's list        | add `'2026-11-05 '` and `'2026-11-055'` to the rejected set (REQ-15.7: "no trimming")                                                                 |
| year bounds `>= 1` and `<= 9999` (boundary mutants)                                                                              | `0001-01-01` / `9999-12-31` rejected without notice                                     | add both as accepted values; `'0000-01-01'` is already in AC-15.1                                                                                     |
| `Number.isNaN(getTime())` guard                                                                                                  | `'2026-13-01'` reaches the round trip                                                   | `'2026-13-01'` (in AC-15.1) kills it; the round trip alone catches `02-30` (in AC-15.1)                                                               |
| round-trip equality                                                                                                              | `'2026-02-30'` rolls to 03-02 and is accepted                                           | `'2026-02-30'` and `'2026-02-29'` (in AC-15.1); add `'1900-02-29'` to guard against a hand-rolled leap rule                                           |
| `'' → undefined` transform and the `v === ''` check                                                                              | `''` rejected, or kept as `''`                                                          | the `''` case with `data` exactly `{ id, dueDate: undefined }` (AC-15.1)                                                                              |
| `z.string({ error })` custom message                                                                                             | non-string input reports Zod's default                                                  | `safeParse({ id: 'todo-1' })` (missing `dueDate`) fails with exactly `{ dueDate: ['Due date must be a valid date'] }`                                 |
| `dueDateOf`: the null branch, `slice(0, 10)`                                                                                     | `null` throws or yields `'null'`; wrong slice                                           | the AC-15.2 `findMany` rows: `Date('2026-11-05T00:00:00.000Z')` gives `'2026-11-05'`, `null` gives `undefined` (`toBeUndefined`)                      |
| `dueDateToDate` template literal (`T00:00:00.000Z`)                                                                              | day shifts by zone                                                                      | `update` data `toEqual({ dueDate: new Date('2026-11-05T00:00:00.000Z') })` (AC-15.2)                                                                  |
| `setTodoDueDate` `undefined → null`                                                                                              | clearing stores a date or `undefined` (Prisma skips `undefined`, so nothing is cleared) | `update` data exactly `{ dueDate: null }` on the clear call (AC-15.2)                                                                                 |
| `setTodoDueDate` `findUnique === null` guard                                                                                     | missing id reaches `update` (Prisma `P2025`) instead of `TodoNotFoundError`             | third call rejects with `TodoNotFoundError`, `update` called 2 times in total (AC-15.2)                                                               |
| `data: { dueDate }` only                                                                                                         | title or `completed` touched (REQ-15.4)                                                 | `data` compared with `toEqual` (exact), not `toMatchObject`                                                                                           |
| mapper `select` includes `dueDate`                                                                                               | `listTodos` never reads the column                                                      | `expect(db.findMany.mock.calls[0]?.[0])` `select` contains `dueDate: true` (AC-15.2)                                                                  |
| action: `error instanceof TodoNotFoundError` arm                                                                                 | not-found reported as `form`, or every error reported as not found                      | rejection with `TodoNotFoundError` → `id: ['Todo not found']`, `revalidatePath` 0 (AC-15.3); `new Error('db down')` → `form` (AC-15.4)                |
| action: `logMutationFailure('setTodoDueDateAction', …)`                                                                          | log call removed, wrong name literal, or logged for not-found                           | AC-15.4 `toHaveBeenCalledTimes(1)` with `('setTodoDueDateAction', error)`; AC-15.3 asserts it is not called for the `TodoNotFoundError`               |
| action: Zod parse outside the `try`                                                                                              | validation failure logged and reported as `form`                                        | `'2026-02-30'` → exactly `{ dueDate: [...] }`, `setTodoDueDate` and `logMutationFailure` not called (AC-15.3)                                         |
| action: `revalidatePath('/')` placement                                                                                          | revalidated on failure, or before the lib call                                          | `toHaveBeenCalledTimes(2)` for the two successes, `'/'` each; 0 on both failures                                                                      |
| action: `parsed.data.dueDate` (not the raw argument)                                                                             | `''` reaches the lib instead of `undefined`                                             | `setTodoDueDate` called with `('todo-1', undefined)` for `''` (AC-15.3)                                                                               |
| component alert chain `dueDate?.[0] ?? id?.[0] ?? form?.[0]` and `?? ''` draft (not mutated by Stryker, but a reviewer will ask) | `id` arm and the empty draft untested                                                   | extra AC-15.6 `it`: `{ id: ['Todo not found'] }` shows that text; clicking "Edit due date" with `dueDate={undefined}` shows the field with value `''` |

## Questions settled / escalated

```
Question:    Q1: is setting a due date at creation part of B2.4 (does TodoForm / createTodoAction change)?
Class:       P0 no conflict
Sources:     spec/contracts/13-due-date.md:86 "Setting a due date while creating a todo (§5's form is unchanged)"
             spec/contracts/13-due-date.md:18 "a todo created as in §5 has none"
Conflict:    none
Verdict:     Out of scope. §15's Out of scope names it and REQ-15.1 says a created todo has none, so `createTodo` stores
             none and `TodoForm`, `createTodoAction` and `createTodoSchema` are not in Files. A later card needs a new
             or extended section first (an eighth criterion is a second section, `spec/CLAUDE.md`).
Next action: keep `src/components/todo-form.tsx`, `src/lib/todo-schema.ts` and `createTodoAction` out of the plan.
Must not:    add a "Due date" field to `TodoForm` or widen `createTodo` "while we are here".
Doc drift:   none
Escalate:    none
```

```
Question:    Q2: which dates are valid (range, past, future)?
Class:       P0 no conflict
Sources:     spec/contracts/13-due-date.md:24 "a real calendar date written `YYYY-MM-DD` with a year from 0001 to 9999"
             spec/contracts/13-due-date.md:89 "(past dates are accepted)"
Conflict:    none
Verdict:     As written: any real calendar day, year 0001 to 9999, past and future accepted, no comparison with today and
             therefore no clock in the schema. The lower bound needs its own check (V8 accepts `0000-01-01`, PostgreSQL
             `DATE` has no year 0); see Risks, "Date handling". Extra boundary `it` (`0001-01-01`, `9999-12-31`) are in
             the mutation table.
Next action: implement regex, `Date` round trip and `year >= 1`; add the two boundary accepts to AC-15.1's tests.
Must not:    reject past dates, add a "today or later" rule, or call `new Date()` in the schema.
Doc drift:   none
Escalate:    none
```

```
Question:    Q5: is the stale §5 `Todo` interface block (and its `listTodos` comment) edited in this card, and does that
             need a ruling or does D-20 cover it?
Class:       P4 two sections collide (mild: additive, and §15 says so itself)
Sources:     spec/contracts/13-due-date.md:56 "// src/lib/todos.ts (§5 Todo, extended)"
             spec/contracts/13-due-date.md:65 "listTodos, createTodo, toggleTodo, updateTodoTitle keep their signatures and now select and return dueDate through dueDateOf"
             spec/contracts/03-todos.md:54 "export function listTodos(): Promise<Todo[]>; // orderBy createdAt desc, select id,title,completed,createdAt"
             backlog/00-decisions.md:40 "exclusions are lifted by the sections that specify them"
             .claude/rules/spec-fidelity.md:10 "Changing a section is a `docs(spec): §n …` commit inside an approved D-n (§8), before any test or code."
Conflict:    §5's block lists `Todo` with four fields and `listTodos` selecting four columns / §15 says the same
             function now selects and returns a fifth, `dueDate`.
Verdict:     No §5 edit in this card, no ruling. §15 is the later, more specific section for the one field it adds, and
             it states the override in its own contract block; §5 stays the contract for everything else. Precedent: §6
             and §9 added `updateTodoTitle` and `clearCompletedTodos` to `src/lib/todos.ts` without touching §5's block
             (it still lists three functions). D-20 lifts exclusions only; it does not authorize editing §5's exact
             signatures, so a one-line `docs(spec): §5` edit WOULD need a D-n (§8), which this card does not need. The
             spec-analyst already lifted §5's out-of-scope line (`03-todos.md:66`) in the §15 `docs(spec)` commit.
Next action: leave `spec/contracts/03-todos.md` alone; after the feat lands, `/spec-trace` may report the divergence
             as informational, and the lead may order the edit under a new D-n if the stale block bothers a reader.
Must not:    edit §5's `Todo` block or comment "to match the code", or make `dueDate` required to match §5's shape.
Doc drift:   none (optional: `docs(spec): §5` under a D-n the lead records, its own commit before any later card)
Escalate:    none
```

```
Question:    Q4 and the existing tests: how is `Todo.dueDate` shaped so the existing lib, action and component tests stay
             green without edits?
Class:       P2 spec silent (the spec fixes the type, not the mapper's tolerance of a row without the key)
Sources:     spec/contracts/13-due-date.md:62 "readonly dueDate?: string; // §15: 'YYYY-MM-DD'; absent when the todo has none"
             spec/contracts/13-due-date.md:55 "export function dueDateOf(stored: Date | null): string | undefined; // stored.toISOString().slice(0, 10); null → undefined"
             .claude/rules/invariants.md:8 "`scripts/ci/check-feat-commits.sh` rejects a `feat(` commit touching tests"
Conflict:    none (the type and the null case are exact; a row without the key is simply not mentioned)
Verdict:     The spec governs: optional field, null → undefined. Tests are evidence only (authority 5), but the card's
             commit rules (`feat(...)` touches no test file; no weakened assertion) make the existing rows without a
             `dueDate` key a real constraint, so the compliant implementation is `stored?.toISOString().slice(0, 10)`,
             which equals the spec's expression for every `Date | null` and returns `undefined` for a missing key. Not a
             behavior change; a spec-silent detail inside one function. If the lead prefers the strict form, the cost is
             adding `dueDate: null` to `makeRow` in `src/lib/todos.test.ts` inside the `test(...)` commit (a test edit
             that loosens nothing, and an overlap on that file).
Next action: put the `?.` form in the plan's interface list.
Must not:    write `stored === null ? undefined : stored.toISOString()…` and then edit `todos.test.ts` in the feat commit.
Doc drift:   none
Escalate:    none
```

```
Question:    Q6a: does B2.4 touch `src/app/page.tsx`, and what keeps the merge with B2.5 trivial?
Class:       P0 no conflict
Sources:     spec/contracts/13-due-date.md:77 "src/components/todo-item.tsx: TodoItem({ todo }) renders <TodoDueDate todoId={todo.id} dueDate={todo.dueDate} /> inside its <li>; nothing else changes"
             backlog/00-decisions.md:40 "the shared mount points `src/app/page.tsx`, `src/lib/todos.ts`, `src/actions/todos.ts` are held by one Doing card at a time (`next-task.sh --check`)"
             feat/B2.5-search:backlog/work/B2.5/analysis.md:58 "`src/app/page.tsx` is B2.4's"
Conflict:    none
Verdict:     `page.tsx` needs no change (it already passes whole `Todo` objects to `TodoItem`). The plan lists it as not
             touched, which frees it for B2.5's mount; B2.5's own section says it does not change `todos.ts`,
             `todo-schema.ts` or `actions/todos.ts`, so those three stay B2.4's without contention. Likely textual
             overlaps and how to make each trivial (all adjacent-line, resolved by keeping both sides):
             `spec/features-map.md` (F13 and F14 rows appended after F12, plus the Receipt line): land the F13 `✗` row
             in the skeleton, the row's files in `docs(map)`; `src/lib/CLAUDE.md`, `src/components/CLAUDE.md`,
             `src/actions/CLAUDE.md`: one row or sentence appended at the end of the table or paragraph, in the last
             docs commit; `docs/metrics.md`: one row in the closing lane; `spec/technical-requirements.md`,
             `backlog/README.md`, `backlog/plan/E2-todos-plus.md`: closing lane only, separate PR (B2.3 did the same,
             #80 then #83), recompute the totals with `scripts/ci/check-backlog.sh` on the second to merge;
             `src/lib/logger.ts`: B2.5 has no mutation, so no overlap (the union member goes last, as B2.3's did);
             `src/lib/todos.test.ts`: untouched by B2.4 (AC-15.2 goes in a new file). No file outside these is shared.
Next action: plan Files without `src/app/page.tsx`; the lead tells the B2.5 session `page.tsx` is free.
Must not:    add a comment or an import to `page.tsx` to "document" the due date, which would re-take the hold.
Doc drift:   none
Escalate:    none
```

```
Question:    Q6b (analysis Q6): `MutationActionName` and the sixth action, §10 and §11 text untouched?
Class:       P0 no conflict
Sources:     spec/contracts/13-due-date.md:68 "the union MutationActionName gains one member, 'setTodoDueDateAction'; no other change to §11"
             spec/contracts/13-due-date.md:27 "write exactly one log entry as §11 specifies, named `setTodoDueDateAction`"
Conflict:    none
Verdict:     As written; same precedent as B2.3's fifth member. Type-only change in `src/lib/logger.ts`; no runtime or
             `logger.test.ts` change (it does not enumerate the union). It lands in the skeleton so the red tests
             typecheck.
Next action: add the member in the skeleton commit.
Must not:    edit §10 or §11 prose, or add a `console` call.
Doc drift:   none
Escalate:    none
```

```
Question:    Q9: when does the F13 row land, and does `prisma/seed.ts` need a due date?
Class:       P2 spec silent (map timing), P0 (seed)
Sources:     scripts/ci/check-features-map.sh:16 "::error::$m is in no features-map row"
             spec/contracts/02-schema-and-env.md:23 "upserts three sample todos."
             spec/CLAUDE.md:22 "any `src/` change that adds, moves or removes a feature"
Conflict:    analysis Q9 says the lead adds F13 in the `docs(map)` commit with the feat / the check script fails any new
             `src/lib` or `src/components` module that is in no row.
Verdict:     Both hold if the row lands twice: a `✗` row in the skeleton (the script lets a `✗` row name missing paths), the
             files, tests and `✅` in `docs(map)`. B2.3 did this for F12. The seed stays unchanged: §3 says the seed
             "upserts three sample todos" and states no dated sample, the skill's step 5 only requires that `pnpm db:seed`
             still runs, and a new column with a default of null does not break it; a dated sample row is a guess.
Next action: skeleton includes the F13 `✗` row; no `prisma/seed.ts` change; the migration commit carries schema and
             migration only.
Must not:    leave the F13 row to the feat commit (CI red on the skeleton push), or add a due date to the seed.
Doc drift:   spec/features-map.md F13 row, in the skeleton and in `docs(map)`; `spec/technical-requirements.md` §15 row in
             the closing lane
Escalate:    none
```

```
Question:    Q3, Q7, Q8, Q10 (analysis): time zone and format, two alerts in a row, button names, clearing?
Class:       P0 no conflict
Sources:     spec/contracts/13-due-date.md:32 "The date is shown as written,"
             spec/contracts/13-due-date.md:23 "one button named "Update due date""
             spec/contracts/13-due-date.md:20 "WHEN a person submits an empty value for a listed todo"
Conflict:    none
Verdict:     All as written; none changes Files. Q3: UTC midnight in, `toISOString().slice(0, 10)` out, no locale call.
             Q7: AC-15.6 scopes the alert to the component's wrapper, and the e2e scopes alerts by row too, so a row with
             the toggle's alert and the due date's alert (two `role="alert"`) is fine. Q8: "Update due date" does not
             contain "Save", so `e2e/06-edit-title.spec.ts:31` stays unambiguous. Q10: no "Clear" button; an empty field
             submitted is the clear, covered by the `''` call in AC-15.6 and the clear half of AC-15.7.
Next action: none beyond the tests listed above.
Must not:    add a "Clear due date" button or a locale-formatted date.
Doc drift:   none
Escalate:    none
```
