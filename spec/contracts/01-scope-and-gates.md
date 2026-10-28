# §1 Scope

A single-person todo list: the person adds items, sees every item newest first, marks items done or not done, and
(§6) corrects an item's text. Items survive a browser reload because they are stored in PostgreSQL.

Not in scope, by decision: accounts, sharing, due dates, ordering other than creation time, offline mode.

Runtime: Next.js App Router with React Server Components for reads, Server Actions for every mutation, Prisma on
PostgreSQL. One process, one database, one schema per worktree in development (§4).

# §2 Acceptance gates

Every change to `src/`, `prisma/` or `e2e/` passes all of these before it is merged, in this order:

| Gate                     | Command                                | Threshold                                                                   |
| ------------------------ | -------------------------------------- | --------------------------------------------------------------------------- |
| Format and lint          | `pnpm lint`                            | 0 errors; no `eslint-disable`, `@ts-ignore`, `@ts-expect-error` added       |
| Types                    | `pnpm typecheck`                       | 0 errors                                                                    |
| Unit and component tests | `pnpm test`                            | all green; every `AC-§.n` of a ✅/◐ section appears as a test title         |
| End-to-end               | `pnpm test:e2e`                        | all green against the compose PostgreSQL                                    |
| Mutation                 | `pnpm test:mutation`                   | ≥ 70 % on `src/lib` and `src/actions`                                       |
| Red first                | `scripts/verify-red.sh <card>`         | the card's `test(...)` commit fails on behavior at its parent commit        |
| Review                   | `/review-loop`                         | every finding dispositioned, ≤ 3 passes, gate cleared by `mark-reviewed.sh` |
| Secrets                  | gitleaks (pre-commit) and Semgrep (CI) | 0 findings                                                                  |

A `feat(...)` commit never touches a test file (`scripts/ci/check-feat-commits.sh`); test changes are their own
`test(...)` commits.
