# e2e — Playwright against the compose PostgreSQL (§2)

One file per spec section (`05-todos.spec.ts`, `06-edit-title.spec.ts`) plus `smoke.spec.ts`. Titles start with the
criterion id (`AC-5.6: …`). `beforeEach` resets the rows the file uses through `PrismaClient` in the worktree's own
schema (`DATABASE_URL` from `.env`, loaded by `playwright.config.ts`); never assume an empty database. Seed rows with
explicit `createdAt` when order matters. Never `test.skip`/`fixme` a failing test; never weaken an assertion. The
server is started by Playwright (`pnpm dev` locally, `build && start` in CI) on the worktree's `PORT`.
