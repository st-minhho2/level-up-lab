# B1.2 advice

Read first: `analysis.md` was written before B1.1 (§5) merged (its "Codebase facts" paragraph says there is no `Todo`
model and no todo test). That is no longer true in this worktree: `src/lib/todos.ts`, `src/lib/todo-schema.ts`,
`src/actions/todos.ts`, `src/components/todo-item.tsx`, the `Todo` model and B1.1 (§5)'s tests all exist. Where the two
disagree, this file and the code it quotes win; the analysis proposals (7 REQ, 7 AC) are used unchanged.

## Approaches

### A. Mirror the toggle path: `(id, title)` action, edit state inside `TodoItem` (recommended)

- `src/lib/todo-schema.ts`: `updateTodoTitleSchema = createTodoSchema.extend(toggleTodoSchema.shape)` (Zod 4: no
  `.merge`). One definition of the 1-200 rule, identical messages to create.
- `src/lib/todos.ts`: `updateTodoTitle(id, title)`: `findUnique` (select `{ id: true }`), throw `TodoNotFoundError` on
  `null`, then `prisma.todo.update({ where: { id }, data: { title }, select: todoFields })`. Same two-step shape as
  `toggleTodo`; `data` holds only `title`, so `completed` and `createdAt` cannot change (REQ-3, REQ-4).
- `src/actions/todos.ts`: `updateTodoTitleAction(id: string, title: string): Promise<ActionResult<Todo>>`: parse, call
  the lib function, `revalidatePath('/')`, map `TodoNotFoundError` to `failure('id', 'Todo not found')`, rethrow others.
- `src/components/todo-item.tsx`: local `editing` / `draft` state; an icon-only edit button (see Risks, "B1.1 (§5) e2e
  guard") swaps the label for one text field plus a Save button; Save calls the action inside `startTransition`
  exactly as `onToggle` does, shows `fieldErrors.title[0]` under the field, leaves edit mode on `ok: true`.
- Pros: same pattern as `toggleTodoAction`/`TodoItem`, so no new component file and no `useActionState`; the action is
  only touched when the user saves, so B1.1 (§5)'s existing `todo-item.test.tsx` mock (which lacks the new export) keeps
  working. Cons: client-side only (no progressive enhancement), but the toggle already is. The action signature is
  not the literal `(input: unknown | FormData)` of the rule, but it is the signature `toggleTodoAction` already
  ships, and the input is Zod-parsed before use.
- Fits rules: yes (server actions for the mutation, Zod at the boundary, Prisma only in `src/lib`, no raw SQL).

### B. FormData action with a hidden `id`, new `todo-edit-form.tsx` using `useActionState`

- `updateTodoTitleAction(_previous, formData)` reading `id` and `title` from `FormData`, a new
  `src/components/todo-edit-form.tsx` rendered by `TodoItem` while editing, mirroring `TodoForm`.
- Pros: closest to the rule's wording and to `createTodoAction`; works without JS for the submit. Cons: one more file
  outside the Slice row, the form must still tell the parent to leave edit mode (a callback or an effect), more
  moving parts for one text field. Fits rules: yes.

### C. Lib variant of A: single `update`, catch Prisma `P2025` instead of `findUnique` first

- One query instead of two and no read-then-write window. Cons: `src/lib` must import and `instanceof`-check
  `Prisma.PrismaClientKnownRequestError`, and unit tests must construct that error by hand; it departs from
  `toggleTodo` for a race (concurrent edits) that §4 puts out of scope. Fits rules: yes. Choose it only if the lead
  prefers one round trip over symmetry with `toggleTodo`.

## Recommendation

Approach A with the `findUnique`-then-`update` lib shape. It keeps every edit rule where the rules put it: the 1-200
trim rule is the existing `createTodoSchema` title (AC-2, AC-4, AC-5, AC-6 get the exact B1.1 (§5) messages, so tests can
assert `{ ok: false, fieldErrors: { title: ['Title is required'] } }` and `['Title must be 200 characters or fewer']`
rather than only "non-empty"); duplicates need no code at all because there is no unique index and no uniqueness check
(AC-7); `update` with `data: { title }` and an unchanged `orderBy: { createdAt: 'desc' }` list query is what makes
AC-3 hold (an edit only moves `updatedAt`). The action stays thin (parse, one lib call, `revalidatePath('/')`,
return). `plan.md` must pin the accessible names the tests will use, because the spec does not: the edit button's
accessible name (suggest `Edit <title>`), the text field's name (suggest `Edit title`) and the submit button (`Save`);
otherwise the test-writer and code-writer will guess differently. No migration, no dependency, no new Prisma query
shape beyond one `update`. One spec-level consequence: `src/lib/todo-schema.ts` is not in spec.md's Slice row, so the
lead should add it when the spec is next edited.

## Impact

| File                                | Add / Change | Interface (signature)                                                                                                | ACs                          |
| ----------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| `src/lib/todo-schema.ts`            | Add export   | `export const updateTodoTitleSchema: z.ZodObject<{ title; id }>` = `createTodoSchema.extend(toggleTodoSchema.shape)` | AC-2, AC-4, AC-5, AC-6, AC-7 |
| `src/lib/todos.ts`                  | Add function | `updateTodoTitle(id: string, title: string): Promise<Todo>` (throws `TodoNotFoundError`)                             | AC-2, AC-3, AC-7             |
| `src/actions/todos.ts`              | Add action   | `updateTodoTitleAction(id: string, title: string): Promise<ActionResult<Todo>>`                                      | AC-2, AC-4, AC-5, AC-6, AC-7 |
| `src/components/todo-item.tsx`      | Change       | `TodoItem({ todo }: { readonly todo: Todo }): ReactNode` unchanged; adds edit mode (state, field, Save)              | AC-1, AC-2, AC-4, AC-5       |
| `prisma/schema.prisma`, `src/app/*` | none         | `title` is already `@db.VarChar(200)`; `page.tsx` already re-renders from `listTodos()`                              | -                            |

Tests are not source files and are listed under Test strategy. Four `src/` files; the Slice row of spec.md names three.

## Risks

- Migration: none. `todos.title` is `VarChar(200)` already; `updatedAt` is `@updatedAt`, so Prisma bumps it on edit
  and the list order (`createdAt desc`, `src/lib/todos.ts:20`) is untouched.
- Security: input is `unknown` at the action boundary and Zod-parsed (trim, 1-200, non-empty `id`) before the lib
  call; Prisma parameterizes `where`/`data`; no raw SQL. The action returns only the `todoFields` select (no
  `updatedAt` leak, no model passed as-is). Server-side validation is authoritative; the input's `maxLength={200}` is
  a convenience and means a padded 201-210 raw-character value cannot be typed in a browser (AC-5/AC-6 are therefore
  action/schema-level tests, not e2e).
- Performance: one `findUnique` by primary key plus one `update` by primary key; no new index needed (no new `where`
  or `orderBy` column).
- Isolation: no new env var, port, storage or cache key. `revalidatePath('/')` is the existing path; e2e uses the
  worktree schema via `PrismaClient` and resets rows in `beforeEach`.
- B1.1 (§5) e2e guard (real, high): `e2e/05-todos.spec.ts` :: "AC-1: lists todos newest first" asserts
  `getByRole('listitem')` `toHaveText(['C', 'B', 'A'])`, which compares each `<li>`'s whole text. A visible "Edit"
  button inside the `<li>` makes that text `C Edit` and turns B1.1 (§5)'s merged test red, and `e2e/**` and B1.1 (§5)'s
  tests cannot be edited in a `feat(...)` commit. The edit control must add no text content to the row: an icon-only
  button (inline `<svg aria-hidden="true">` with `aria-label`/`title`) satisfies it; `sr-only` text does not (it is
  still text content). `plan.md` should state this constraint. The same applies to any inline message in the row in
  the idle state.
- Component test wiring: `src/components/todo-item.test.tsx` builds its action mock with
  `vi.hoisted(() => ({ createTodoAction: vi.fn(), toggleTodoAction: vi.fn() }))`. Vitest throws when a missing export
  is read, so the red commit's new tests must add `updateTodoTitleAction: vi.fn()` to that object (adding a key is not
  weakening an assertion). Under Approach A the existing B1.1 (§5) component tests do not read the new export, so they
  stay green either way; under Approach B `TodoItem` would import the edit form and the extra mock key is mandatory.
- Edit mode exit: with no cancel (Question 5), `TodoItem` must leave edit mode on `ok: true` and stay in it, with the
  error shown and the draft kept, on `ok: false`; a component test for each side keeps the state machine honest.
- Dependencies: none added.

## Test strategy

| Layer     | File                                                        | Covers ACs                                        | Mocks                                                                                                                                            |
| --------- | ----------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| unit      | `src/lib/todo-schema.test.ts` (add `updateTodoTitleSchema`) | AC-2, AC-4, AC-5, AC-6                            | none                                                                                                                                             |
| unit      | `src/lib/todos.test.ts` (add `updateTodoTitle`)             | AC-2, AC-3, AC-7, unknown id (no AC, see Q7)      | `vi.mock('@/lib/prisma', ...)`; extend the hoisted `db` with the existing `findUnique` and `update`                                              |
| unit      | `src/actions/todos.test.ts` (add `updateTodoTitleAction`)   | AC-2, AC-4, AC-5, AC-6, AC-7, unknown id (Q7)     | `@/lib/todos` (keep `importOriginal`), `next/cache`, `@/lib/prisma` (as the file already does)                                                   |
| component | `src/components/todo-item.test.tsx` (add edit-mode tests)   | AC-1, AC-2 (save call), AC-4/AC-5 (error display) | `@/actions/todos` (add the key `updateTodoTitleAction: vi.fn()`)                                                                                 |
| e2e       | `e2e/06-edit-title.spec.ts` (new, one file per spec)        | AC-1, AC-2 (reload), AC-3, AC-7                   | none; real Postgres, seed with `prisma.todo.create({ data: { title, completed, createdAt } })` and reset in `beforeEach` as B1.1 (§5)'s e2e does |

AC-3 ordering note: the list is newest first, so "list order A, B2, C" in AC-3 means A has the latest `createdAt`.
Seed with explicit `createdAt` values (A newest, C oldest), as B1.1 (§5)'s e2e does with `new Date(2026, 0, 1 + index)`.

Proofs for spec §5 "Unchanged behavior" (titles quoted verbatim from the merged tests; `dev-lead` copies them in):

| Behavior                                                  | Proof                                                                                                                                                                                                                        |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Creating a todo still trims and enforces 1-200 characters | `src/lib/todo-schema.test.ts` :: "AC-2: trims the title and keeps 1..200 characters"; `src/actions/todos.test.ts` :: "AC-3: returns fieldErrors.title [\"Title is required\"] for a blank title and stores nothing"          |
| Toggling completion still works                           | `src/lib/todos.test.ts` :: "AC-4: inverts completed and stores it, twice in a row"; `src/components/todo-item.test.tsx` :: "AC-4: renders a checked checkbox when completed and calls toggleTodoAction with the id on click" |
| The list is still newest first                            | `src/lib/todos.test.ts` :: "AC-1: returns todos newest first with id, title and completed"; `e2e/05-todos.spec.ts` :: "AC-1: lists todos newest first"                                                                       |
| A todo row still exposes its title as the checkbox name   | `src/components/todo-item.test.tsx` :: "AC-1: renders the title as the accessible name of an unchecked checkbox when not completed"                                                                                          |

## Mutation hot spots

Stryker mutates `src/lib/**` and `src/actions/**` (not components). Likely survivors and the assertion that kills each:

- `data: { title }` in `updateTodoTitle` mutated to `{}` or extended with another field: assert the whole object,
  `expect(db.update.mock.calls[0]?.[0].data).toEqual({ title: 'Buy milk' })` and `where` equal to `{ id }`. The
  B1.1 (§5) style `toMatchObject` would let an extra `completed`/`createdAt` key survive; use `toEqual` on `data`
  (kills REQ-3/REQ-4 regressions).
- `if (current === null)` flipped or the throw removed: test an unknown id (`findUnique` resolves `null`) expects
  `rejects.toBeInstanceOf(TodoNotFoundError)`, `rejects.toMatchObject({ id: 'missing' })` and `db.update` not called;
  and a known id must not throw.
- `select: { id: true }` / `todoFields` mutated: assert the returned `Todo` has exactly the four fields id, title, completed, createdAt (`toEqual` on the mapped result, not `toMatchObject`) so the field list cannot shrink.
- Schema boundaries 200/201 and 0/1: `updateTodoTitleSchema` tests at 200 chars (ok), 201 (rejected, message
  `Title must be 200 characters or fewer`), whitespace-only and empty string (`Title is required`), and padded
  200 (AC-6: `' '.repeat(5) + 'x'.repeat(200) + ' '.repeat(5)` parses to length 200). These kill `max(200)`→`max(201)`,
  `min(1)`→`min(0)`, and dropping `.trim()`. Also an empty `id` returns `Todo id is required` under `fieldErrors.id`.
- Action: `revalidatePath('/')` mutated away or called on failure: assert called once with `'/'` on success and not
  called on a schema failure or a not-found. Error-message string literals (`'Todo not found'`, field key `'id'`):
  assert `toEqual({ ok: false, fieldErrors: { id: ['Todo not found'] } })`. `typeof`/`parsed.success` branch:
  one test with an invalid title and one with a valid title in the same file so both arms run.
- Action rethrow arm (`throw error` for non-`TodoNotFoundError`): one test where the lib rejects with `new Error('db down')`
  and the action rejects with that error (kills `if (error instanceof TodoNotFoundError)` → `true`).
- Component (not Stryker-mutated, but graded in review): assert the field is initialised with the current title
  (AC-1: value equals `Buy mik`), that exactly one textbox exists in edit mode, and that Save passes `(id, typedValue)`
  to the action with the untrimmed typed text (the action trims; do not trim twice in the component).

## Questions settled / escalated

```
Question:    Should `depends_on` be [B1.1 (§5)]? (analysis.md Q1)
Class:       P0 no conflict
Sources:     spec/contracts/04-edit-title.md:8 "depends_on: [B1.1 (§5)]"
             spec/contracts/03-todos.md:4 "status: done"
             backlog/work/B1.2/analysis.md:22 "`depends_on: []` but the Slice files"
Conflict:    none (the analysis read a stale frontmatter; the spec already declares the dependency and B1.1 (§5) is done)
Verdict:     spec.md governs: the frontmatter already says [B1.1 (§5)] and its interfaces are merged and stable.
Next action: dev-lead plans against the existing files named in this advice; no frontmatter edit is needed.
Must not:    edit `depends_on` again or plan as if the Slice files did not exist.
Doc drift:   none (analysis.md is a role artifact and its pre-merge "Codebase facts" paragraph is superseded by this file)
Escalate:    none
```

```
Question:    Does §7's question (same 1-200 rule as creation) stay open? (analysis.md Q2)
Class:       P0 no conflict
Sources:     spec/contracts/04-edit-title.md:47 "Same 1–200 character rule as creation (B1.1 (§5) REQ-2/REQ-3)?"
             docs/decisions.md:13 "Todo titles: 1–200 characters after trimming, duplicates allowed (B1.1 (§5) §7)."
             spec/contracts/03-todos.md:33 "WHEN a user submits a title that is 1 to 200 characters long after trimming whitespace"
Conflict:    none (the REQ-2/REQ-3 numbers quoted in §7 are correct)
Verdict:     D-5 (authority 2) settles it: same limit, trimmed, duplicates allowed; it also applies to later todo features.
Next action: dev-lead closes §7 in spec.md with "Settled by D-5" when it next edits the spec.
Must not:    re-ask the question, or add a second 1-200 definition instead of reusing `createTodoSchema`.
Doc drift:   spec.md §7 (close the question), in the spec-approval commit
Escalate:    none
```

```
Question:    Which error wording and shape does the edit use? (analysis.md Q3)
Class:       P2 spec silent
Sources:     src/lib/todo-schema.ts:7 "title: z.string().trim().min(1, 'Title is required').max(TITLE_MAX_LENGTH, 'Title must be 200 characters or fewer'),"
             docs/decisions.md:13 "Later todo features reuse the limit unless a new D-n changes it."
             .claude/rules/app-router.md:31 "6. **Actions are thin.** Parse, call one `src/lib` function, `revalidatePath`, return."
Conflict:    none (the spec fixes the limit and the `title` field key but not the strings)
Verdict:     Reuse the create schema's title rule: `updateTodoTitleSchema = createTodoSchema.extend(toggleTodoSchema.shape)`
             in `src/lib/todo-schema.ts` (D-5 reuse; rule 5 keeps schemas in `src/lib/<slice>-schema.ts`). Messages are
             therefore "Title is required" and "Title must be 200 characters or fewer"; the new tests may assert these
             exactly even though the spec ACs only require a non-empty `fieldErrors.title`.
Next action: plan.md lists `src/lib/todo-schema.ts` as a changed file (spec.md's Slice row omits it) and pins the schema.
Must not:    copy the 1-200 literals into the action or the component, or export the schema from the 'use server' file.
Doc drift:   spec.md Slice row: add `src/lib/todo-schema.ts`, in the spec-approval commit
Escalate:    none
```

```
Question:    Is the list ordered by a key that an edit does not change? (analysis.md Q4)
Class:       P0 no conflict
Sources:     spec/contracts/03-todos.md:32 "ordered by creation time, newest first"
             src/lib/todos.ts:20 "return prisma.todo.findMany({ select: todoFields, orderBy: { createdAt: 'desc' } });"
             prisma/schema.prisma:20 "updatedAt DateTime @updatedAt"
Conflict:    none (the spec governs on behavior; the code is evidence that agrees)
Verdict:     Yes: order is `createdAt desc` (B1.1 (§5) REQ-1) and an edit only moves `updatedAt`, so REQ-4 holds with no
             change to `listTodos`. Because the order is newest first, AC-3's "A, B2, C" is the display order: A has the
             latest `createdAt`.
Next action: tests seed explicit `createdAt` values (A newest, C oldest); do not touch `listTodos`.
Must not:    assume oldest first when writing AC-3's e2e, or add an order key.
Doc drift:   none (optionally state "newest first" in AC-3's Then when the spec is approved)
Escalate:    none
```

```
Question:    How does a person leave edit mode without saving? (analysis.md Q5)
Class:       P2 spec silent
Sources:     spec/contracts/04-edit-title.md:22 "A person who mistyped an item wants to correct its text in place"
             spec/contracts/04-edit-title.md:36 "- Editing anything other than the title."
             CLAUDE.md:43 "No spec, no code: a feature starts as `spec/contracts/<§>.md` with the lead-approval box ticked."
Conflict:    none (the intent needs correcting text; it never mentions abandoning an edit)
Verdict:     Out of scope for this spec, as the analysis proposes: with the 7-criterion cap a cancel behavior would need
             its own AC and a split. The lead's tick on the spec is the confirmation; edit mode is left by saving, and
             saving an unchanged title is a no-op success (Q6).
Next action: dev-lead adds "Cancelling an edit in progress (Escape, blur, a cancel control)." to spec.md §4.
Must not:    ship Escape/blur/cancel handling with no REQ or AC behind it.
Doc drift:   spec.md §4, in the spec-approval commit
Escalate:    none (if the lead wants cancel, split into B1.2-a persist/validate and B1.2-b in-place field and cancel)
```

```
Question:    What happens when the submitted title equals the current one? (analysis.md Q6)
Class:       P2 spec silent
Sources:     spec/contracts/03-todos.md:81 "Decision: no, duplicates are allowed; the list is personal."
             docs/decisions.md:13 "duplicates allowed"
Conflict:    none
Verdict:     An ordinary edit: `ok: true`, row unchanged apart from `updatedAt`, no error, no special-case branch. This
             follows from the same reuse as AC-7 (a title equal to another todo's is persisted like any other).
Next action: no extra code; no extra AC (AC-7 already covers the equal-title case against another todo).
Must not:    add an "unchanged" branch or return a different shape for it.
Doc drift:   none
Escalate:    none
```

```
Question:    What does the action return for a todo id that no longer exists? (analysis.md Q7)
Class:       P2 spec silent
Sources:     spec/contracts/03-todos.md:36 "IF a toggle names a todo id that does not exist THEN THE SYSTEM SHALL change nothing and report a field error on `id`."
             .claude/rules/app-router.md:30 "errors, they do not throw them to the client."
             backlog/work/B1.2/analysis.md:17 "Adding cancel or not-found handling means a split."
Conflict:    spec §3 is capped at 7 criteria and the proposed 7 are all used / app-router rule 5 forbids letting an
             action throw the error to the client
Verdict:     Rule 5 (authority 1) outranks the spec's silence: the branch must exist, mirroring B1.1 (§5) REQ-5 exactly:
             `updateTodoTitle` throws `TodoNotFoundError`, the action returns `failure('id', 'Todo not found')`, no
             `revalidatePath`, nothing created or changed. It gets no AC (cap, and §4 excludes concurrent edits), so it is
             covered by unit tests only: `src/lib/todos.test.ts` and `src/actions/todos.test.ts`, with titles that carry
             no AC prefix (the testing rule allows no prefix for tests with no criterion), e.g. "returns
             fieldErrors.id ['Todo not found'] for an unknown id and does not revalidate". The component shows
             `fieldErrors.id[0]` like the toggle does only if the plan includes it; a component test is optional.
Next action: plan.md lists the branch and its two unit tests; dev-lead notes it in spec.md §5 or §4 ("Editing a todo that
             no longer exists behaves as B1.1 (§5) REQ-5; unit-tested only").
Must not:    skip the branch (a raw Prisma P2025 would reach the client as a thrown error) or invent a different error
             shape or field key.
Doc drift:   spec.md §4 or §5 one line, in the spec-approval commit
Escalate:    none (flips to a split with its own REQ/AC if the lead wants it specified as behavior)
```
