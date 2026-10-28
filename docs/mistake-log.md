# Mistake log

Repeated agent mistakes and the rule, skill or hook that now prevents each one. The log is the backlog for
`.claude/`: a mistake seen twice becomes a rule or skill; anything touching secrets, data loss or a non-local
database becomes a hook the same day. Prune every sprint: rows whose prevention has held for two sprints move to
the "Retired" table so the active list stays short enough to read before a task.

## Active

| Date       | Mistake                                                                           | Seen | Prevented by                                                            |
| ---------- | --------------------------------------------------------------------------------- | ---- | ----------------------------------------------------------------------- |
| 2026-10-28 | Generated ESLint config let `any` and floating promises through (not type-aware)  | 1    | `eslint.config.mjs` type-checked block; L1 watch-out                    |
| 2026-10-28 | pnpm 10 skipped Prisma/esbuild/sharp postinstall builds, failing only at runtime  | 1    | `pnpm.onlyBuiltDependencies` in `package.json`                          |
| 2026-10-28 | Picked `prisma@latest`, which is an 8.0 release candidate                         | 1    | Exact pin `6.19.3`; `.claude/rules/prisma.md`                           |
| 2026-10-28 | Compose Postgres on 5432 collided with another local project                      | 1    | `POSTGRES_PORT` default 5433 in `docker-compose.yml` and `.env.example` |
| 2026-10-28 | Vitest config as `.ts` in a CommonJS package printed loader warnings on every run | 1    | `vitest.config.mts`                                                     |

## Retired

| Date retired | Mistake | Prevention that held |
| ------------ | ------- | -------------------- |

## How to add a row

1. Date, one line describing the mistake as the agent made it (not the symptom), the count of times seen.
2. Fill "Prevented by" only with something that exists in the repo (`.claude/rules/x.md`, a skill, a hook, a CI
   guard). "Told the agent" is not a prevention.
3. Reference the row in the PR that adds the prevention.
