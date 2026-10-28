# scripts — what drives a task, and what CI runs

| Script                                   | Does                                                                         | Needs                         |
| ---------------------------------------- | ---------------------------------------------------------------------------- | ----------------------------- |
| `worktree.sh <branch> [base]`            | isolated worktree: port, schema, caches, storage, `.env`, deps               | compose PostgreSQL (optional) |
| `worktree-prune.sh [--dry-run]`          | removes merged worktrees, their branches and schemas                         | docker                        |
| `next-task.sh [--list]`                  | the next eligible card (or the board) from `backlog/`                        | —                             |
| `card-status.sh <id> <Open               | Partial                                                                      | Done> "<evidence>"`           | rewrites a card's status line | —   |
| `verify-red.sh <card> [--auto]`          | the card's `test(...)` commit fails on behavior at its parent                | node_modules                  |
| `hook-smoke.sh`                          | every hook probe (guards, role write scopes, review gate)                    | —                             |
| `setup-env.sh`, `port.sh`, `load-env.ts` | env bootstrap helpers                                                        | —                             |
| `ci/check-suppressions.sh`               | no new `eslint-disable` / `@ts-*`                                            | git range                     |
| `ci/check-config-change.sh`              | protected config needs the label                                             | git range                     |
| `ci/check-feat-commits.sh`               | `feat(` commits touch no test                                                | git range                     |
| `ci/check-ac-coverage.sh`                | every `AC-§.n` of a ✅/◐ section is a test title                             | —                             |
| `ci/check-spec-sections.sh`              | every `§n` cited in `src/`, the map and cards exists                         | —                             |
| `ci/check-features-map.sh`               | every path and section in the map resolves                                   | —                             |
| `ci/check-backlog.sh`                    | README totals equal card status lines; remaining rows are Open/Partial cards | —                             |

All scripts are bash 3.2-safe (macOS) and run unchanged in the dev container and CI. No script is paid or
destructive; none touches a non-local database.
