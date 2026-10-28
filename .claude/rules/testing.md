# Testing

`pnpm lint && pnpm typecheck && pnpm test && pnpm test:e2e`, green, is the definition of done; mutation ≥ 70 % on
`src/lib` + `src/actions` is the definition of meaningful.

- Unit `src/**/<name>.test.ts` (node), component `src/**/<name>.test.tsx` (jsdom, Testing Library), one e2e file per
  section in `e2e/`. Titles start with the criterion: `it('AC-5.2: creates the trimmed title …')`; infrastructure
  tests without a criterion carry no prefix.
- Arrange / Act / Assert with blank lines; one behavior per test; assert values (`toEqual`, exact messages, counts),
  never only truthiness; no snapshot-only tests; small factories in the file; no fixed ids; no shared state.
- Mock only at boundaries: `vi.mock('@/lib/prisma')` in lib tests (also whenever `importOriginal` loads the real
  lib, because of `server-only`), `vi.mock('@/lib/<slice>')` + `vi.mock('next/cache')` in action tests, the actions
  module in component tests (`vi.hoisted` objects; add a key, never remove one). Never mock the unit under test.
- `expect.objectContaining` is typed `any` here; assert on the result with `toMatchObject` or on
  `mock.calls[0]?.[0]` instead.
- Red first: tests are committed alone (`test(<pkg>): B<e>.<n> … (red)`, body "Red because …") and fail on an
  assertion or the skeleton's `NotImplementedError`, never on an import. Never loosen an assertion to go green;
  change the spec first. A bug found without a test is not fixed.
