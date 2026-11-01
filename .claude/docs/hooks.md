# Hooks — what the agent runtime blocks, and what is on you

Wired in `.claude/settings.json`, which Claude Code reads only from the directory a session is opened in: open
sessions in the repo root or a worktree, never a parent folder (`scripts/require-hooks.sh` stops such a session).
Every script is bash 3.2-safe and parses JSON with node. Probe table:
`scripts/hook-smoke.sh` (run it after touching any hook).

| Hook                    | Event                                              | Blocks / does                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ----------------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `session-mark.sh`       | SessionStart                                       | marks the session as one that loaded these hooks (marker `.git/claude-hooks/<session_id>`, `LEVEL_UP_LAB_HOOKS` via `CLAUDE_ENV_FILE`); `scripts/require-hooks.sh` refuses commits and `worktree.sh` without it                                                                                                                                                                                                                                                                                                                                                                        |
| `guard-bash.sh`         | PreToolUse Bash                                    | `rm -rf` any spelling, force pushes and remote branch deletes (B1.24: segments split on `;` `&` `                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | `only, newlines count as spaces; after a push or send-pack word in a command naming git,`-f`/`-d`, `--force*`, `--mirror`, `--delete`, `--prune`or their prefixes, a`+`/`:`refspec, quoted or escaped, any`{`or`$'…\…'`; a config, remote, clone, `-c`, `--config-env`or`GIT_CONFIG__`that sets a mirror or a`+`/`:`push refspec (a plain`git config --get`passes);`gh`deleting, renaming or force-updating a ref,`gh pr close`/`merge`with`-d`or`--delete-branch`; blocked too (false positives): any `{` after push (`"${BRANCH}"`, `HEAD@{u}`), a `+`/`:`/`-d` word after any push word once the command names git (`git push origin "v$(date +%Y)"`, `git status && docker push -d img`, `git stash push -- ':(exclude)x'`, `echo "push -f"`), quoted command text after `git … push`, a remote named `mirror`, `git config get/unset …`(new subcommand form), a config read holding`$`, a backtick or `(` (`--get-regexp '^remote\.._\.mirror$'`), a `gh pr close`comment holding` -d`, `--delete-branch=false`; out of reach: a flag in a variable, words joined by `${IFS}`, an alias, a word quoted in pieces, a command built at run time, a `;`/`&`/` | ` inside a quoted argument (`-o "a;b" -f`, `--jq '.a | .b' -X DELETE`), `.git/config`written directly,`curl`on the GitHub API),`prisma migrate reset`/`db push`/`db execute`, Prisma against a non-local `DATABASE_URL`, reads of `.env*`/keys/credentials, printing secret-looking variables or the whole environment; a `scripts/pr-step.sh` call that is not one segment of plain-word or quoted arguments, from the top level, with a committed, unmodified wrapper byte-identical to the hooks' own copy (B1.23) |
| `guard-read.sh`         | PreToolUse Read                                    | `.env*` (except `.env.example`), keys, credential stores                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `path-guard.sh <globs>` | PreToolUse Edit/Write, in each agent's frontmatter | a role writing outside its scope (`!` denies); message: report back instead                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `plan-scope.sh`         | PreToolUse Edit/Write (settings.json)              | in a card worktree (branch `<prefix>/B<e>.<n>[-…]`): a path outside `backlog/*`, `spec/*`, `docs/metrics.md`, `docs/mistake-log.md` that is not in the card's `## Files` as of its `docs(backlog): <card> plan [round N ]approved` commit (`scripts/ci/plan-files.sh`); a test file from anyone but `test-writer` (`agent_type`); any Edit/Write under `prisma/migrations/`. `scripts/ci/check-plan-scope.sh` applies the same rule to the PR diff in CI (Bash writes, migrations); known limit: a main session started as `claude --agent test-writer` also carries that `agent_type` |
| `format-after-edit.sh`  | PostToolUse Edit/Write                             | prettier, then `eslint --fix`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `require-review.sh`     | Stop, SubagentStop                                 | one block per session while `src/`, `prisma/`, `e2e/` carry an unreviewed fingerprint                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `mark-reviewed.sh`      | run by you after `/review-loop`                    | re-runs lint, typecheck, tests; records the fingerprint; clears the gate                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |

`permissions.deny` also stops `git commit --no-verify`, `-n`, `core.hooksPath`, `LEFTHOOK=0`, `gh pr merge|review`,
`.env` reads and edits and `~/.ssh`, `~/.aws`, `~/.kube` reads. `permissions.allow` holds one rule,
`Bash(scripts/pr-step.sh *)` (B1.23): a `Bash(...)` rule cannot limit arguments, so the wrapper checks them and
`guard-bash.sh` rule 5 keeps the shell from changing the call; every other command follows the session's mode.
Rule 5 sees a wrapper call wherever a segment starts with it, so a commit message that quotes one is blocked too:
write such messages to a file (`git commit -F`) or reword them. The wrapper a session calls must match the one in the
checkout its hooks load from: after `scripts/pr-step.sh` changes on `main`, restart card sessions from an updated
checkout. A session opened in the card worktree itself compares the file with itself (no protection there).

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
not); a hook type added later installs on the next `pnpm install`; every checkout runs the main checkout's binary (or a
`lefthook` found first on `PATH`, which the template tries before it) with its own config. They close as branches merge `origin/main` and the main checkout runs `pnpm install` after a merge.
