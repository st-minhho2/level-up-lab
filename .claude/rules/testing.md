---
paths:
  - '**/*.test.ts'
  - '**/*.test.tsx'
  - 'e2e/**'
  - 'docs/specs/**'
---

# Testing: placement, naming, criterion ids

**Mistake this prevents:** tests that pass for the wrong reason (snapshot of whatever rendered, mocked unit under
test, assertion loosened until green) and tests nobody can trace back to a requirement.

Derived from `../nodejs-typescript-coding-conventions.md` §8 (behavioral names, Arrange-Act-Assert, mock at
boundaries, no shared state, regression test per bug fix).

## Placement and naming

- Unit tests: `src/**/<name>.test.ts`, next to the file they test, run in node by Vitest project `unit`.
- Component tests: `src/**/<name>.test.tsx`, run in jsdom by project `component` (Testing Library, `vitest.setup.ts`).
- E2E: `e2e/FEAT-xxx-<name>.spec.ts`, exactly one file per spec, Playwright against the compose Postgres.
- `describe` names the unit (`createTodoAction`, `<TodoForm>`); `it` titles start with the criterion id:
  `it('AC-2: rejects an empty title with fieldErrors.title')`. Infrastructure tests with no spec use no prefix.

## Content

- Arrange, Act, Assert, separated by blank lines. One behavior per test.
- Assert on observable output: returned value, rendered text/roles, database row, HTTP status. Never on "function X
  was called with Y" unless the call is the contract (for example `revalidatePath('/')`).
- Mock only at boundaries: `vi.mock('@/lib/prisma')` in lib tests, `vi.mock('@/lib/<slice>')` and
  `vi.mock('next/cache')` in action tests. Never mock the unit under test or a sibling helper in the same file.
- When an action test keeps part of the real lib module (`importOriginal`), also `vi.mock('@/lib/prisma')`: the
  real module imports `server-only`, which throws outside React Server Components (FEAT-001, 2026-10-28).
- No snapshot-only tests. `toMatchSnapshot` / `toMatchInlineSnapshot` may sit next to an explicit assertion, never
  replace one. A test whose only assertion is a snapshot fails review.
- No fixed ids and no state shared between tests. Build inputs with small factory functions inside the test file.
- E2E tests reset the rows they need in `beforeEach` through Prisma using the worktree's own schema; they never
  assume an empty database.
- Red first: a test file is committed alone (`test(FEAT-xxx): ...`) and must fail on the commit before it for an
  assertion reason (`scripts/verify-red.sh`). Never loosen an assertion to go green; change the spec first.
