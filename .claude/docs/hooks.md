# Hooks — what the agent runtime blocks, and what is on you

Wired in `.claude/settings.json`, which Claude Code reads only from the directory a session is opened in: open
sessions in the repo root or a worktree, never a parent folder (`scripts/require-hooks.sh` stops such a session).
Every script is bash 3.2-safe and parses JSON with node. Probe table:
`scripts/hook-smoke.sh` (run it after touching any hook).

| Hook                    | Event                                              | Blocks / does                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ----------------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `session-mark.sh`       | SessionStart                                       | marks the session as one that loaded these hooks (marker `.git/claude-hooks/<session_id>`, `LEVEL_UP_LAB_HOOKS` via `CLAUDE_ENV_FILE`); `scripts/require-hooks.sh` refuses commits and `worktree.sh` without it                                                                                                                                                                                                                                                                                                                                                                        |
| `guard-bash.sh`         | PreToolUse Bash                                    | `rm -rf` any spelling, force pushes, `prisma migrate reset` / `db push` / `db execute`, Prisma against a non-local `DATABASE_URL`, reads of `.env*`/keys/credentials, printing secret-looking variables or the whole environment                                                                                                                                                                                                                                                                                                                                                       |
| `guard-read.sh`         | PreToolUse Read                                    | `.env*` (except `.env.example`), keys, credential stores                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `path-guard.sh <globs>` | PreToolUse Edit/Write, in each agent's frontmatter | a role writing outside its scope (`!` denies); message: report back instead                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `plan-scope.sh`         | PreToolUse Edit/Write (settings.json)              | in a card worktree (branch `<prefix>/B<e>.<n>[-…]`): a path outside `backlog/*`, `spec/*`, `docs/metrics.md`, `docs/mistake-log.md` that is not in the card's `## Files` as of its `docs(backlog): <card> plan [round N ]approved` commit (`scripts/ci/plan-files.sh`); a test file from anyone but `test-writer` (`agent_type`); any Edit/Write under `prisma/migrations/`. `scripts/ci/check-plan-scope.sh` applies the same rule to the PR diff in CI (Bash writes, migrations); known limit: a main session started as `claude --agent test-writer` also carries that `agent_type` |
| `format-after-edit.sh`  | PostToolUse Edit/Write                             | prettier, then `eslint --fix`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `require-review.sh`     | Stop, SubagentStop                                 | one block per session while `src/`, `prisma/`, `e2e/` carry an unreviewed fingerprint                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `mark-reviewed.sh`      | run by you after `/review-loop`                    | re-runs lint, typecheck, tests; records the fingerprint; clears the gate                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |

`permissions.deny` also stops `git commit --no-verify`, `-n`, `core.hooksPath`, `LEFTHOOK=0`, `gh pr merge|review`,
`gh api`, environment dumps and `.env` edits. `permissions.allow` pre-approves the routine project commands.

`path-guard.sh` matches the path relative to the worktree that holds the file, not to `CLAUDE_PROJECT_DIR` (the main
checkout when a session writes into `.worktrees/<slug>/` or the desktop app's `.claude/worktrees/<name>/`): it asks
`git rev-parse --show-toplevel` from the file's nearest existing directory, accepts the answer only inside the project
and with the same git common dir, and otherwise strips `.worktrees/*/` and `.claude/worktrees/*/` prefixes at any
nesting. `..` is resolved first; a `..` through a directory that does not exist yet is refused. `hook-smoke.sh` probes
every role in each layout, with and without git.

Role write scopes (`path-guard.sh` arguments, as each agent's frontmatter passes them; `hook-smoke.sh` pins them):

| Role           | May write                                                                                                      |
| -------------- | -------------------------------------------------------------------------------------------------------------- |
| `spec-analyst` | `spec/contracts/*`, `backlog/*`; not `spec/features-map.md`, not `backlog/00-decisions.md`                     |
| `advisor`      | `backlog/work/*`                                                                                               |
| `dev-lead`     | `backlog/*`, `docs/metrics.md`, `docs/mistake-log.md`; not `backlog/00-decisions.md`                           |
| `reviewer`     | `backlog/work/*/review.md`                                                                                     |
| `test-writer`  | `*.test.ts`, `*.test.tsx`, `e2e/*`                                                                             |
| `code-writer`  | `src/*`, `prisma/*`, `spec/features-map.md`, `docs/metrics.md`; not tests, not `e2e/`, not `src/lib/prisma.ts` |

Claude Code skips an agent whose frontmatter is not valid YAML, and with it the agent's `path-guard.sh` hook.
`scripts/ci/check-agent-frontmatter.sh` (CI `guards`, `hook-smoke.sh`) parses every agent and skill frontmatter;
write a hook command as one quoted scalar (prettier makes it single-quoted, inner `'` doubled).

Merge policy (D-8, D-9): the ruleset on `main` requires the CI checks `lint typecheck test e2e mutation semgrep guards`,
a pull request (0 approvals while the repo has one account, 1 once a second person joins), forbids direct and force
pushes, has no bypass actors. Applied with
`gh api -X POST repos/<owner>/level-up-lab/rulesets --input .github/rulesets/main.json`.

Git hooks (Lefthook, `< 30 s`): prettier and eslint on staged files, `tsc --noEmit`, gitleaks; commit-msg enforces
Conventional Commits (merge and revert subjects allowed). CI re-runs everything plus Semgrep and the guards in
`scripts/ci/`. Model policy (D-3): orchestrator, reviewer and writers inherit the session model; `spec-analyst` and
`advisor` run on `sonnet`.

Where the hooks come from (B1.19): every worktree shares `.git/hooks`, and `lefthook install` embeds the absolute path
of the binary that ran it. `prepare` is `scripts/install-hooks.sh`, which runs the **main checkout's** binary with the
current checkout's `lefthook.yml`, so the path survives every prune; with no runnable binary there it falls back to
the current checkout's and warns. `assert_lefthook_installed: true` makes a commit that cannot reach Lefthook stop
("Can't find lefthook in PATH", exit 1) instead of passing unchecked; `no_auto_install: true` keeps a commit from
re-installing the hooks with whatever `lefthook` is first on `PATH`. The first job, `node-modules`, refuses a checkout
without `node_modules` with "run pnpm install --frozen-lockfile". Gaps: an open branch whose `lefthook.yml` predates
these keys re-installs without them on its own `pnpm install`, and only another `pnpm install` repairs that (commits do
not); a hook type added later installs on the next `pnpm install`; every checkout runs the main checkout's binary with
its own config. They close as branches merge `origin/main` and the main checkout runs `pnpm install` after a merge.
