# scripts — what drives a task, and what CI runs

| Script                                                             | Does                                                                                                                        | Needs                                |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `worktree.sh <branch> [base]`                                      | isolated worktree: port, schema, caches, storage, `.env`, deps                                                              | compose PostgreSQL (optional)        |
| `worktree-prune.sh [--dry-run] [--base main] [--all] [--no-fetch]` | removes merged worktrees of every layout (vs fetched `origin/main`), branches, schemas; lists orphans; `--schemas [--drop]` | docker; `gh` optional (PR check)     |
| `next-task.sh [--list]`                                            | the next eligible card (or the board) from `backlog/`                                                                       | —                                    |
| `card-status.sh <id> <Open\|Partial\|Done> "<evidence>"`           | rewrites a card's status line                                                                                               | —                                    |
| `verify-red.sh <card> [--auto]`                                    | the card's `test(...)` commit fails on behavior at its parent                                                               | node_modules; `--auto` PR only in CI |
| `hook-smoke.sh`                                                    | every hook probe (guards, each role's path-guard per worktree layout, gate)                                                 | —                                    |
| `prune-smoke.sh [<prune-script>]`                                  | `worktree-prune.sh` probes P1–P15 on a throwaway repo and database (every layout, both checkouts)                           | compose PostgreSQL                   |
| `require-hooks.sh`                                                 | exit 1 in a Claude Code session that did not load `.claude/settings.json`                                                   | Lefthook pre-commit, `worktree.sh`   |
| `setup-env.sh`, `port.sh`, `load-env.ts`                           | env bootstrap helpers                                                                                                       | —                                    |
| `ci/check-suppressions.sh`                                         | no new `eslint-disable` / `@ts-*`                                                                                           | git range                            |
| `ci/check-config-change.sh`                                        | protected config needs the label                                                                                            | git range; PR only in CI             |
| `ci/check-feat-commits.sh`                                         | `feat(` commits touch no test                                                                                               | git range; PR only in CI             |
| `ci/check-ac-coverage.sh`                                          | every `AC-§.n` of a ✅/◐ section is a test title                                                                            | —                                    |
| `ci/check-spec-sections.sh`                                        | every `§n` cited in `src/`, the map and cards exists                                                                        | —                                    |
| `ci/check-features-map.sh`                                         | every path and section in the map resolves                                                                                  | —                                    |
| `ci/check-backlog.sh`                                              | README totals equal card status lines; remaining rows are Open/Partial cards                                                | —                                    |
| `ci/check-agent-frontmatter.sh`                                    | agent/skill frontmatter is YAML with `name`, `description` (`--commands`)                                                   | node_modules (js-yaml)               |

All scripts are bash 3.2-safe (macOS) and run unchanged in the dev container and CI. No script is paid or
destructive; none touches a non-local database.
