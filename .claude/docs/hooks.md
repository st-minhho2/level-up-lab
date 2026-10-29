# Hooks — what the agent runtime blocks, and what is on you

Wired in `.claude/settings.json`, which Claude Code reads only from the directory a session is opened in: open
sessions in the repo root or a worktree, never a parent folder (`scripts/require-hooks.sh` stops such a session).
Every script is bash 3.2-safe and parses JSON with node. Probe table:
`scripts/hook-smoke.sh` (run it after touching any hook).

| Hook                    | Event                                              | Blocks / does                                                                                                                                                                                                                    |
| ----------------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `session-mark.sh`       | SessionStart                                       | marks the session as one that loaded these hooks (marker `.git/claude-hooks/<session_id>`, `LEVEL_UP_LAB_HOOKS` via `CLAUDE_ENV_FILE`); `scripts/require-hooks.sh` refuses commits and `worktree.sh` without it                  |
| `guard-bash.sh`         | PreToolUse Bash                                    | `rm -rf` any spelling, force pushes, `prisma migrate reset` / `db push` / `db execute`, Prisma against a non-local `DATABASE_URL`, reads of `.env*`/keys/credentials, printing secret-looking variables or the whole environment |
| `guard-read.sh`         | PreToolUse Read                                    | `.env*` (except `.env.example`), keys, credential stores                                                                                                                                                                         |
| `path-guard.sh <globs>` | PreToolUse Edit/Write, in each agent's frontmatter | a role writing outside its scope (`!` denies); message: report back instead                                                                                                                                                      |
| `format-after-edit.sh`  | PostToolUse Edit/Write                             | prettier, then `eslint --fix`                                                                                                                                                                                                    |
| `require-review.sh`     | Stop, SubagentStop                                 | one block per session while `src/`, `prisma/`, `e2e/` carry an unreviewed fingerprint                                                                                                                                            |
| `mark-reviewed.sh`      | run by you after `/review-loop`                    | re-runs lint, typecheck, tests; records the fingerprint; clears the gate                                                                                                                                                         |

`permissions.deny` also stops `git commit --no-verify`, `-n`, `core.hooksPath`, `LEFTHOOK=0`, `gh pr merge|review`,
`gh api`, environment dumps and `.env` edits. `permissions.allow` pre-approves the routine project commands.

Role write scopes (`path-guard.sh` arguments):

| Role                      | May write                                                                                   |
| ------------------------- | ------------------------------------------------------------------------------------------- |
| `spec-analyst`, `advisor` | `spec/contracts/*`, `backlog/*`, `backlog/work/*` (not `spec/features-map.md`)              |
| `dev-lead`                | `backlog/*`, `backlog/work/*`, `docs/metrics.md`, `docs/mistake-log.md`                     |
| `reviewer`                | `backlog/work/*/review.md`                                                                  |
| `test-writer`             | `*.test.ts`, `*.test.tsx`, `e2e/*`                                                          |
| `code-writer`             | `src/*`, `prisma/*`, `spec/features-map.md`; not tests, not `e2e/`, not `src/lib/prisma.ts` |

Merge policy (D-8, D-9): the ruleset on `main` requires the CI checks `lint typecheck test e2e mutation semgrep guards`,
a pull request (0 approvals while the repo has one account, 1 once a second person joins), forbids direct and force
pushes, has no bypass actors. Applied with
`gh api -X POST repos/<owner>/level-up-lab/rulesets --input .github/rulesets/main.json`.

Git hooks (Lefthook, `< 30 s`): prettier and eslint on staged files, `tsc --noEmit`, gitleaks; commit-msg enforces
Conventional Commits (merge and revert subjects allowed). CI re-runs everything plus Semgrep and the guards in
`scripts/ci/`. Model policy (D-3): orchestrator, reviewer and writers inherit the session model; `spec-analyst` and
`advisor` run on `sonnet`.
