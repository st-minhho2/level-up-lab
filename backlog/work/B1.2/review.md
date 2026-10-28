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
