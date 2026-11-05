# B5.4 review

## Plan review (round 1)

SCOPE: all (`src/lib`, `src/app`, `e2e`)

| Check                                                                          | Result                                                                                                                                                                                                                                                           |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                 | pass: `src/lib/page-title.ts`, `src/app/page.tsx` are exactly §26's Function contracts and D-30's one `page.tsx` card; tests and `e2e/26-page-title.spec.ts` follow the section number; F24 row added. `scripts/ci/plan-files.sh --any B5.4` lists the 6 files   |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib | pass: explicit return types, no mutation, no Prisma outside `src/lib`; `page-title.ts` pure                                                                                                                                                                      |
| plan follows `advice.md`'s recommendation or states the deviation              | pass: approach A, two reads, no `cache()`, e2e named `26-`. Deviation not stated but harmless: advice puts the skeleton in the `test(...)` commit, the plan in a separate `chore(todos): B5.4 skeleton`                                                          |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number      | pass: AC-26.1 to AC-26.7, exact strings and counts                                                                                                                                                                                                               |
| verification lists exact commands with expected numbers                        | pass: `pnpm test` 218 → 221 (baseline confirmed: `Tests 218 passed (218)`), `pnpm test:e2e` 46 → 50 (baseline confirmed: `Total: 46 tests in 19 files`), mutation ≥ 70, `verify-red.sh B5.4` exit 0                                                              |
| work breakdown skeleton → red → green → map → review with convention subjects  | pass: `chore(todos)`, `test(todos) … (red)`, `feat(todos)`, `docs(map): F24 … [B5.4]`, `docs(backlog)`                                                                                                                                                           |
| section has a `Lead approves spec` box, ticked only by a human (D-7)           | pass: `- [ ] Lead approves spec` present in `spec/contracts/24-page-title.md`, unticked; not touched by this review                                                                                                                                              |
| no settled D-n contradicted                                                    | pass: D-30 (`generateMetadata` in `page.tsx`, no other component), D-32 (§13 lift), D-28 medium tier (no `prisma/`, dependency, env, CI, `.claude/`). §13's "no second query" concerns the `RemainingCount` prop inside the page component, which the plan keeps |
| `scripts/next-task.sh --check B5.4` says no overlap                            | pass: `[next-task] B5.4: no overlap with any Doing or Review card`                                                                                                                                                                                               |
| test plan can go red on behavior (probe)                                       | fail: see reason 1                                                                                                                                                                                                                                               |

Verdict: changes requested

1. The Files row for `src/app/page.test.ts` says "mocks `@/lib/todos` only". That mock is not enough to import
   `@/app/page` under Vitest. `page.tsx` imports client components. Those import `src/actions/delete-todo.ts` and
   `src/actions/complete-all.ts`, which import `src/lib/todo-delete.ts` and `src/lib/todo-complete-all.ts`. Both of
   those import `@/lib/prisma`, and that file imports `server-only`. Probed on a copy (`/tmp/probe-b54-gY4A`) with a
   working `generateMetadata` and only `vi.mock('@/lib/todos')`: the suite fails to load with `Error: This module
cannot be imported from a Client Component module` (0 tests ran). `vi.mock('@/lib/prisma')` without a factory fails
   the same way, because automocking loads the original. With `vi.mock('@/lib/prisma', () => ({ prisma: {} }))` added,
   the AC-26.2 probe passes (1 passed). As written, the red commit would fail `scripts/verify-red.sh B5.4` (a "did not
   load" suite) for the wrong reason, and the green commit would stay red. Fix: in that row, name both boundary mocks,
   `@/lib/todos` and `@/lib/prisma` with a factory (`testing.md`: "also whenever … the real lib … because of
   `server-only`"). This is a plan-text change only. No file or interface changes.

Costs the lead approves with this plan (not reasons to block):

- After the skeleton and red commits, `generateMetadata` throws `NotImplementedError`, so every request to `/` fails.
  All 46 existing e2e tests that load `/` stay red until the `feat` commit, not just AC-26.4 to AC-26.7. The plan says
  "the page erroring" only for the new ones. Neither CI nor lefthook runs e2e per commit, so nothing gates on it.
- Every `/` request runs two `findMany` calls (page and `generateMetadata`). §26 accepts this, and `cache()` is ruled
  out by "no change to `src/lib/todos.ts`".
- REQ-26.4 (the title refreshes after a Server Action without a reload) is unproven until AC-26.5 runs in the
  browser. If it is red after green code, the card stops for a D-n.

## Plan review (round 2)

SCOPE: all (`src/lib`, `src/app`, `e2e`)

Reviewed `e0de8d4` (plan revised after round 1; `git diff 5968ca9 e0de8d4` touches only `plan.md`).

| Check                                                                          | Result                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                 | pass: same 6 files as round 1; `page-title.ts` and `page.tsx` are §26's Function contracts, tests and `e2e/26-page-title.spec.ts` follow §26, F24 map row                                                                                                                                                                  |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib | pass: signatures copied from §26, explicit return types, no mutation, no Prisma outside `src/lib`; `page.test.ts` mocks `@/lib/todos` and `@/lib/prisma` (factory) at the boundary as `testing.md` requires                                                                                                                |
| plan follows `advice.md`'s recommendation or states the deviation              | pass: approach A, two reads, no `cache()`, e2e named `26-`. Separate `chore` skeleton commit now stated as a deviation. The `{}` skeleton for `generateMetadata` differs from advice.md l.94–95 ("throws likewise"); the Files row states it and why ("so `/` still renders"), though not labelled a deviation             |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number      | pass: AC-26.1 to AC-26.7, exact strings                                                                                                                                                                                                                                                                                    |
| verification lists exact commands with expected numbers                        | pass: `verify-red.sh B5.4` exit 0, `pnpm test` 218 → 221, `pnpm test:e2e` 46 → 50, mutation ≥ 70. Red reasons now match the skeleton: AC-26.1 on `NotImplementedError`, AC-26.2/26.3 on `title` undefined, AC-26.4–26.7 on the layout's `level-up-lab` (no existing test asserts the title: `grep toHaveTitle e2e/` empty) |
| work breakdown skeleton → red → green → map → review with convention subjects  | pass: `chore(todos): B5.4 skeleton`, `test(todos): B5.4 … (red)`, `feat(todos)`, `docs(map): F24 … [B5.4]`, `docs(backlog)`, matching `backlog/CLAUDE.md` commit order                                                                                                                                                     |
| section has a `Lead approves spec` box, ticked only by a human (D-7)           | pass: `- [ ] Lead approves spec` in `spec/contracts/24-page-title.md`, unticked; not touched by this review                                                                                                                                                                                                                |
| no settled D-n contradicted                                                    | pass: D-30, D-32, D-28 (medium tier: no `prisma/`, dependency, env, CI, `.claude/`), as in round 1                                                                                                                                                                                                                         |
| `scripts/next-task.sh --check B5.4` says no overlap                            | pass: `[next-task] B5.4: no overlap with any Doing or Review card`                                                                                                                                                                                                                                                         |
| round 1 reason 1 resolved                                                      | pass: the `page.test.ts` row names `@/lib/prisma` with a factory (`{ prisma: {} }`), the mock round 1's probe showed loads the suite                                                                                                                                                                                       |

Verdict: approved (ready for the lead's gate, not approved for build)

Notes for the build, not reasons to block:

- The `{}` skeleton cannot be written as `export async function generateMetadata(): Promise<Metadata> { return {}; }`.
  Probed (that body linted via `eslint --stdin --stdin-filename src/app/page.tsx` with the worktree config):
  `21:8 error Async function 'generateMetadata' has no 'await' expression @typescript-eslint/require-await`, so the
  lefthook `eslint` job refuses the `chore(todos): B5.4 skeleton` commit. Two bodies pass lint (exit 0): a non-async
  `export function generateMetadata(): Promise<Metadata> { return Promise.resolve({}); }`, or `async` with an
  `await`. Write the green body with `async`, matching §26's contract. The throwing skeleton in advice.md has the same
  lint error.
- `plan.md` is 55 lines. The extra lines are wide table rows; the content fits one screen, and round 1 accepted the
  same shape.
- Round 1's first cost goes away with this revision: with the `{}` skeleton `/` keeps rendering, so the 46 existing e2e
  stay green between commits. The other two costs remain: two `findMany` per `/` request, and REQ-26.4 is unproven
  until AC-26.5 runs (red after green → stop for a D-n).
