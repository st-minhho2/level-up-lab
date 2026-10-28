SCOPE: all

# B1.2 review

## Plan review (round 1)

Reviewed: `backlog/work/B1.2/plan.md` at `4810825` (`Plan approved by: minh.ho2 (session reply "approve"), 2026-10-28`)
against §6 (`spec/contracts/04-edit-title.md`), §5, card B1.2, D-1..D-6, `advice.md`, `analysis.md`, the tree and
`pnpm test` (run in this worktree: 9 files, 34 passed). Under D-2 the spec approval is delegated to this review; the
section's own approval box is on a pending docs branch (D-7 pending), so the plan approval line stands in for it.

| Check                                                                             | pass / fail: reason                                                                                                                                                                                                                                                                                                                                                                                       |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: the four `src/` files (`todo-schema.ts`, `todos.ts`, `actions/todos.ts`, `todo-item.tsx`) are exactly F6's Files column; `spec/features-map.md`, `spec/technical-requirements.md`, `docs/metrics.md` are the closing bookkeeping `backlog/CLAUDE.md` requires. Note 1: F6's Tests column omits `src/lib/todo-schema.test.ts`, which the plan extends.                                               |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: explicit return types, `readonly` props, kebab-case files; `updateTodoTitleAction` is parse → one lib call → `revalidatePath('/')` → `ActionResult`; `updateTodoTitle` lives in `src/lib/todos.ts` as `findUnique` → `update({ data: { title } })`, mirroring `toggleTodo`; no raw SQL, no migration. Signatures match §6's Function contracts character for character.                             |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: Approach A, `findUnique`-then-`update`, schema `createTodoSchema.extend(toggleTodoSchema.shape)` (Zod 4.6.7), accessible names pinned, row-text constraint stated, hoisted mock key named, not-found branch and its two no-AC unit tests counted (`lib 3+1`, `actions 5+1`). The only departure, button name `Edit title` instead of the advice's `Edit <title>`, is what §6's contract prescribes. |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: §6 declares AC-6.1..AC-6.7 (7); every Then is an exact object, string, count or length; `grep -iw` for the banned adjective list over the plan and §6 returns nothing.                                                                                                                                                                                                                              |
| verification lists exact commands with expected numbers                           | pass: `verify-red.sh B1.2` → 0 pass; `pnpm test` → 34 existing (verified: 34 passed) + 18 new (4+4+6+4) = 52; `pnpm test:e2e` → 4 tests in `e2e/06-edit-title.spec.ts`, `05-todos` and `smoke` unchanged; mutation ≥ 70 with the `toEqual` kill named; the three CI guards listed.                                                                                                                        |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: `chore(todos): B1.2 skeleton` → `test(todos): B1.2 edit a todo title (red)` → `feat(todos): B1.2 edit a todo title` → `docs(map): F6 edit title [B1.2]` → `/review-loop`; subjects match `backlog/CLAUDE.md` and the `verify-red.sh` grep `^test\([^)]*\): B1\.2(                                                                                                                                   | $)`. |
| no settled D-n contradicted                                                       | pass: D-2 (one gate, present), D-4 (step 5 is the review gate), D-5 (the 1–200 rule is reused through `createTodoSchema`, duplicates untouched), D-6 (ids B1.2 / §6 / F6 only).                                                                                                                                                                                                                           |

Spec check (delegated by D-2): §6 has 7 REQ, one EARS pattern each; 7 AC, all measurable; Out of scope present; the
four "Unchanged behavior" proof titles exist verbatim in `src/lib/todo-schema.test.ts:9`, `src/lib/todos.test.ts:62`,
`e2e/05-todos.spec.ts:24`, `src/components/todo-item.test.tsx:18`; index and map both show §6/F6 as ✗ (B1.2).

Verdict: approved

Notes (none blocking; for the test-writer / code-writer and the `docs(map)` step):

1. `docs(map)` should add `src/lib/todo-schema.test.ts` to F6's Tests column; `check-features-map.sh` only checks
   that cited paths exist, so nothing will catch the omission.
2. The edit button (`aria-label="Edit title"`) and the text field (labelled "Edit title") share an accessible name.
   If the button is still rendered in edit mode, `getByLabelText('Edit title')` / Playwright `getByLabel` resolve two
   elements and AC-6.1's "exactly one text field" test becomes ambiguous. Either the button is not rendered while
   editing (the advice's "swaps"), or every test queries by role: `getByRole('textbox', { name: 'Edit title' })`.
3. The skeleton's `it.todo('AC-6.n: …')` stubs must all be replaced in the red commit: `verify-red.sh` reports
   "nothing executed (todo/skip only)" as a failure and invariant 2 forbids a leftover `todo`.
4. AC-6.3's "list order A, B2, C" is display order (newest first), so the e2e seeds explicit `createdAt` with A newest,
   as advice Q4 says; the plan does not restate it.
5. `plan.md` is 53 lines against planning.md's "≈ 40"; the overrun is table-row length, not scope (one slice, four
   `src/` files), so it is not a split.

## Diff review (round 1)

Reviewed: `dfa5277` (= `main`) → `78f73f4` (`feat(todos): B1.2 edit a todo title`), commits `c162673` skeleton →
`fa7a3dd` red → `78f73f4` green, against §6 (`spec/contracts/04-edit-title.md`), §5, `plan.md` (approved
2026-10-28), `advice.md`, the rules. Every gate below was run by me in this worktree on 2026-10-28; probes ran on a
copy under `$TMPDIR` (the tree is unchanged: `git status --short` empty).

### Commands (last line of each)

| Command                                                                                       | Last line                                                                                                                                                                                |
| --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                                                                                   | `All matched files use Prettier code style!` (eslint silent), exit 0                                                                                                                     |
| `pnpm typecheck`                                                                              | `tsc --noEmit`, no output, exit 0                                                                                                                                                        |
| `pnpm test`                                                                                   | `Test Files 9 passed (9)` · `Tests 52 passed (52)` (plan: 34 + 18)                                                                                                                       |
| `pnpm test:e2e`                                                                               | `9 passed (10.1s)`: `06-edit-title` AC-6.1, 6.2, 6.3, 6.7; `05-todos` 3 and `smoke` 2 unchanged                                                                                          |
| `pnpm test:mutation`                                                                          | `Final mutation score of 79.07 is greater than or equal to break threshold 70`; `src/actions` 76.19, `src/lib` 80.00 (`todos.ts` 71.43, `todo-schema.ts` 85.71); 15 survived, 3 no-cover |
| `scripts/ci/check-suppressions.sh`                                                            | `OK: no new suppressions`                                                                                                                                                                |
| `scripts/ci/check-config-change.sh`                                                           | `OK: no protected config changed`                                                                                                                                                        |
| `scripts/ci/check-feat-commits.sh`                                                            | `OK: no feat commit touches tests`                                                                                                                                                       |
| `scripts/ci/check-ac-coverage.sh`                                                             | `§6 criteria=7 covered=7` · `OK: every criterion of a shipped section has a test`                                                                                                        |
| `scripts/ci/check-spec-sections.sh`                                                           | `OK: sections cited: 1 2 3 4 5 6 7 8`                                                                                                                                                    |
| `scripts/ci/check-features-map.sh`                                                            | `OK`                                                                                                                                                                                     |
| `verify-red.sh B1.2 --range dfa5277..HEAD` (the `chore-l6-gaps` copy, run from this worktree) | `RESULT: red for the right reason` — actions 6 new / 6 failed / 0 passed, schema 4/4/0, lib 4/4/0, component 4/4/0; `e2e/06-edit-title.spec.ts` listed, skipped (needs a server)         |
| `git diff --stat main...HEAD`                                                                 | `14 files changed, 544 insertions(+), 27 deletions(-)` (`main` = `dfa5277`)                                                                                                              |

The mutation numbers equal the `docs/metrics.md` row (79.07 / 76.2 / 80.0). The e2e ran against the compose
PostgreSQL already up on 5433 (`pnpm db:deploy`: "No pending migrations to apply"); the extra container, volume
and network my `docker compose up` created for this worktree's project name were removed (never started, empty).

### Checklist

| Check                                                      | Result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every AC-6.n has a test whose assertion matches its Then   | pass. 6.1: `todo-item.test.tsx:56` (one textbox, name `Edit title`, value `Buy mik`, idle row text `/^Buy mik$/`), `e2e:35` (count 1, value). 6.2: `actions:84` (`toEqual` ok + data, lib called with `'Buy milk'`, revalidate once with `/`), `e2e:46` (DB `[{ title: 'Buy milk' }]` after reload). 6.3: `lib:120` (`data` keys exactly `['title']`, `completed: true` kept), `e2e:58` (`[A, B2, C]` after reload, B2 checked). 6.4: `actions:96` exact `fieldErrors`, lib not called; `todo-item:84` draft `'   '` kept, message shown. 6.5: `actions:104` exact message, lib not called; `todo-item:100` message + draft. 6.6: `schema:64`, `actions:112` (lib called with the 200). 6.7: `lib:130`, `actions:123`, `e2e:71` (`count({ title: 'A' })` = 2). |
| no test weakened after the red commit                      | pass: `git diff fa7a3dd..HEAD -- '*.test.*' e2e/` is empty; no `todo`/`skip`/`only`/`fixme` left in `src/**/*.test.*` or `e2e/`; the skeleton's `it.todo`/`test.fixme` stubs were all replaced in `fa7a3dd`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| every changed file is in `plan.md`                         | pass: the 14 files are the plan's 4 `src/`, 5 test files, `spec/features-map.md`, `spec/technical-requirements.md`, `docs/metrics.md`, plus the role artifacts `plan.md`/`review.md`. The map row moved in the green commit, which the plan's step 4 allows ("in step 3 or own commit"); F6's Tests column now also cites `src/lib/todo-schema.test.ts` (plan-review note 1 done).                                                                                                                                                                                                                                                                                                                                                                             |
| interfaces match §6's Function contracts                   | pass: `updateTodoTitleSchema = createTodoSchema.extend(toggleTodoSchema.shape)` (`todo-schema.ts:19`), `updateTodoTitle(id: string, title: string): Promise<Todo>` throws `TodoNotFoundError` with `data: { title }` only (`todos.ts:37-43`), `updateTodoTitleAction(id: string, title: string): Promise<ActionResult<Todo>>` (`actions/todos.ts:42`), `TodoItem({ todo })` props unchanged; not-found maps to `failure('id', 'Todo not found')`, no revalidate on failure.                                                                                                                                                                                                                                                                                    |
| Zod at every action boundary                               | pass: `updateTodoTitleSchema.safeParse({ id, title })` before the lib call; the lib receives `parsed.data` (trimmed).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Prisma only in `src/lib`; no raw SQL                       | pass: the only new Prisma calls are `todos.ts:38,42` (`findUnique` with `select`, `update` with `select: todoFields`); no `$queryRaw`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| migration reversible and indexed                           | n/a: no schema change, no migration (`prisma/` untouched; `db:deploy` reports nothing pending).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| no secret, no suppression                                  | pass: `check-suppressions` OK; the diff contains no env value, key or token; `.env` was never read.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| features map row moved                                     | pass: F6 `✗ (B1.2)` → `✅`, §6 index `✗` → `✅`, `check-features-map` and `check-ac-coverage` resolve them.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| would a test fail if one changed line were reverted (copy) | 9 of 14 probes killed: `setEditing(false)` → AC-6.2 component; visible `Edit` text on the button → AC-6.1; swallowing the title error → AC-6.4, 6.5; `revalidatePath` dropped → AC-6.2, 6.6, 6.7 (actions); `data: { title, completed: false }` → AC-6.2, 6.3, 6.7 (lib); `update` without `select` → same three; schema without trim/messages → AC-6.2, 6.4, 6.5, 6.6. 5 survive the full suite: see findings [1] [2] and notes 1–3.                                                                                                                                                                                                                                                                                                                          |

Author's uncertainties, checked on the copy with a scratch component test (not committed): (1) idle row:
checkbox named `Buy mik` by its `<label>`, no `aria-label` attribute, `<li>.textContent === 'Buy mik'`; editing:
checkbox still named `Buy mik` and still checked, the `Edit title` button is gone, exactly one textbox, row text
`Edit titleSave` — the contract holds in both states, and the name survives only because of `todo-item.tsx:52`
(remove it and the edit-mode checkbox has no accessible name). (2) and (3): see note 3, findings [1] and note 1.

### Findings

```
[1] KIND: coverage
    WHERE: src/actions/todos.ts:52 (and the pre-existing twin at :34)
    DEFECT: the `error instanceof TodoNotFoundError` arm has no test that pins the rethrow of any other error.
    TRIGGER: on the copy, replace the condition with `if (true)`: `pnpm test` stays 52/52 (Stryker: Survived,
             ConditionalExpression 52:9). Runtime input that reaches the arm: `updateTodoTitle` rejects with
             anything but TodoNotFoundError (a Prisma P2025 from the findUnique→update window, a connection error).
    WRONG BEHAVIOUR: a regression that maps every lib error to `{ ok: false, fieldErrors: { id: ['Todo not found'] } }`
             would ship green, contradicting advice.md's "rethrow others" and masking real failures as a bad id. The
             shipped code is correct; what is missing is the test advice.md listed under "Action rethrow arm".
    CONFIDENCE: confirmed (I ran it)
```

```
[2] KIND: coverage
    WHERE: src/components/todo-item.tsx:52
    DEFECT: `aria-label={editing ? todo.title : undefined}` is load-bearing and no committed test exercises it.
    TRIGGER: on the copy, delete the attribute: `pnpm test` stays 52/52; a scratch test `getByRole('checkbox',
             { name: 'Buy mik' })` after clicking `Edit title` then fails with "Unable to find an accessible element
             with the role "checkbox" and name "Buy mik"".
    WRONG BEHAVIOUR: in edit mode the checkbox would lose its accessible name (§6 "Unchanged behavior": a row
             exposes its title as the checkbox name; the committed proof covers the idle state only).
    CONFIDENCE: confirmed (I ran it)
```

Both are non-blocking: neither is an AC of §6, the ≥ 70 gate holds (79.07), and the shipped behaviour is right.
Disposition is the lead's: a follow-up `test(todos)` commit (one rejected `new Error('db down')` in
`actions/todos.test.ts`; one edit-mode `getByRole('checkbox', { name })` in `todo-item.test.tsx`) or an accepted gap.

### Notes (non-blocking)

1. Other survivors in this card's lines: `todo-schema.ts:12` `'Todo id is required'` → `""` (no empty-id test for
   `updateTodoTitleSchema`/`updateTodoTitleAction`; advice.md asked for one); `todos.ts:38` `select: { id: true }`
   → `{}` (the mock ignores `select`; in production Prisma rejects an empty select, so it is a loud failure, not a
   silent one). `todos.ts:13-14` (`TodoNotFoundError` name/message) are B1.1 residue.
2. `todo-item.tsx:25` `setDraft(todo.title)` in `onEdit` survives too: without it a second edit after a successful
   save would open with the untrimmed draft (`'  Buy milk  '`) instead of the stored title. The line is correct; no
   test opens edit mode twice.
3. `updateTodoTitle` keeps the `findUnique` → `update` window of `toggleTodo` (plan: Approach A, approved). A row
   deleted between the two calls raises Prisma P2025, which `updateTodoTitleAction` rethrows to the client. No
   delete path exists in this app and §6 puts concurrent edits out of scope, so no finding; it is the riskiest
   unfalsified spot.
4. `error` state is shared by toggle and edit (`todo-item.tsx:10`): a toggle failure left on screen would show,
   with `aria-invalid`, inside a later edit. Reaching it needs a toggle to fail on an existing row (unreachable
   without a delete path). Pre-existing shape from B1.1.
5. `spec/features-map.md`'s receipt line still reads `c7153b2 (B1.1 merged)`; the closing commit should move it
   to the B1.2 merge sha, as `backlog/CLAUDE.md` step 3 implies.

Verdict: ready for PR

Riskiest unfalsified: `updateTodoTitle`'s findUnique→update window (note 3) — a row removed between the two
queries surfaces as a thrown Prisma P2025 in the client, not as `fieldErrors.id`; I could not produce it without a
delete path, and §6 excludes concurrency.

## Dispositions (dev-lead, pass 1 of 3)

| Pass | #   | Finding (file:line)                                                   | Source                          | Kind        | Disposition      | Justification                                                                                                                        |
| ---- | --- | --------------------------------------------------------------------- | ------------------------------- | ----------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 1    | 1   | `src/actions/todos.ts:52` instanceof arm untested (and `:34` twin)    | reviewer                        | coverage    | fix now          | hardening tests "rethrows a non-TodoNotFoundError from the lib" for both actions (`8ac5f37`); mutant killed, actions 76.19 → 85.71 % |
| 1    | 2   | `src/components/todo-item.tsx:52` `aria-label` while editing untested | reviewer                        | coverage    | fix now          | "AC-6.1: keeps the checkbox named by the title while editing" (`8ac5f37`)                                                            |
| 1    | —   | findUnique→update race surfaces P2025                                 | reviewer (riskiest unfalsified) | correctness | out of scope     | §6 excludes concurrency; same shape as merged `toggleTodo`; follow-up card if a delete path lands                                    |
| 1    | —   | `'Todo id is required'` message survivor                              | code-writer                     | coverage    | no change needed | no caller can submit an empty id (the row's id comes from the server); mutant is a string literal with no observable path            |

Re-verify after fixes: `pnpm test` 55 passed · `pnpm test:mutation` 81.40 % (actions 85.71, lib 80.00) · lint, typecheck green.
Passes used: 1/3. Gate cleared with `mark-reviewed.sh`.
