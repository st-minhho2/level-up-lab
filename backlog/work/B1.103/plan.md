# B1.103 plan — an agent can still merge a pull request through `gh api` (tooling, no §)

Approach: a merge rule in `guard-bash.sh` section 2, next to the `gh` ref rules, plus five `settings.json` deny entries
as a second layer. The hook is the tested layer (hook-smoke); a deny entry still holds when the hook cannot read its
input (`CMD` empty → exit 0). Any case, message `agents never merge a pull request (…): merging is the lead's (D-9).`:

- per segment: `gh … pr merge` (gh behind a path, `\`, a `VAR=` prefix or quotes; global flags such as `-R o/r` first;
  flags and their values between `pr` and `merge`, `gh pr -R o/r merge`, review r1 #1, which also closes the same gap
  for `GH_BRANCH_DELETE`'s `gh pr -R o/r merge 7 -d`);
- over the whole command, once it names `gh … api` anywhere (so a path or query in a variable or a heredoc of the same
  command counts): `pulls/<n>/merge` in any method, `/merges`, and the GraphQL mutations `mergePullRequest`,
  `enablePullRequestAutoMerge`, `mergeBranch`, `enqueuePullRequest`.

Costs, for the lead to accept (review r1 #2; stated in the hook header and `hooks.md` with the workarounds):

- The text is matched, not run, so naming a form is enough to be blocked: a GET of `pulls/<n>/merge` (use
  `gh pr view --json merged`); a command holding the words `gh … pr merge` anywhere in one segment, such as
  `grep -rn "gh pr merge"`, `git log --grep`, a `git commit -m`, a `scripts/pr-step.sh draft` title or
  `scripts/card-status.sh` evidence quoting it; a command naming `gh … api` and a merge mutation or `/merges`
  (`grep -n "gh api" f | grep -i mergepullrequest`). Workarounds: `git commit -F <file>`, a search pattern split by a
  class (`grep -rn "pr[ ]merge"`), evidence and titles that describe the rule ("the merge forms") instead of quoting it.
  This card's own commits, PR title and closing evidence follow them.
- Out of reach of a text check: a script file the agent wrote and then runs (`bash "$TMPDIR/m.sh"`), a GraphQL query
  read from a file an earlier command wrote (`-F query=@q.graphql`), a word quoted in pieces, an alias, a command
  built at run time (`$(which gh) pr merge 7`), `curl` with a token. The ruleset's approval count (D-9) and the runner's `gh` token scope would
  close these outside the hook; both stay the lead's ruling (card).
- The deny entries' wildcard matching is `[unverified]` live (Claude Code reads `settings.json` at launch, so this
  session cannot try them); hook-smoke pins their text only.
- Review r2 notes, unchanged by this card: `gh pr merge 7 --disable-auto` is blocked too (turning auto-merge off is
  safe; the lead does it); `gh pr -R o/r close 7 --delete-branch` still passes `GH_BRANCH_DELETE` (B1.24's `close`
  half has the same flag gap), a follow-up card for the lead to file.

No advice (tier quick, no section). Risk tier **high** (`.claude/`, hooks) → the lead's `approve`; the PR carries
`config-change-approved` (D-19). Dev-lead writes the hook and `scripts/` (interactive, as B1.24 and B1.101).

## Files

| File                           | Change                                                                                                                  | Why          |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------- | ------------ |
| `.claude/hooks/guard-bash.sh`  | `GH_ANY_API`, `GH_MERGE_API`, `GH_PR_MERGE`, `MERGE_MSG`; whole-command and segment checks                              | Acceptance 1 |
| `.claude/settings.json`        | deny `gh * pr merge*`, `gh *pulls/*/merge*`, `gh */merges*`, `gh *mergePullRequest*`, `gh *enablePullRequestAutoMerge*` | Acceptance 3 |
| `scripts/hook-smoke.sh`        | section "merging a pull request (B1.103)": 25 blocked, 14 allowed; settings probe 21 entries, its message               | Test line    |
| `.claude/docs/hooks.md`        | guard-bash row: the merge rule, false positives with workarounds, out of reach; deny line                               | Acceptance 5 |
| `.claude/docs/git-workflow.md` | "Needs a human": merging through `gh api` next to `gh pr merge`                                                         | Acceptance 5 |
| `scripts/CLAUDE.md`            | `hook-smoke.sh` row names the merge probes                                                                              | Acceptance 5 |
| `backlog/work/B1.103/*`        | plan, review, pr-body                                                                                                   | pipeline     |

## Interfaces touched

`guard-bash.sh` (PreToolUse Bash): exit 2 + `MERGE_MSG` on a merge form; exit 0 otherwise as today.
`.claude/settings.json` `permissions.deny`: 16 → 21 entries, `allow` unchanged.

| Probe set (hook-smoke, `pr_cmd` JSON)                                                                                                                                                                                                                                                                                                                      | Want                         |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| REST PUT `pulls/7/merge`: `-X PUT`, `--method PUT`, `-XPUT`, `--method=put`, method last, upper case, `-R` first, path in `$P`                                                                                                                                                                                                                             | exit 2, `agents never merge` |
| `repos/o/r/merges`; GraphQL `mergePullRequest`, `enablePullRequestAutoMerge`, `mergeBranch`, `enqueuePullRequest`; query in `$Q`; query in a heredoc                                                                                                                                                                                                       | exit 2, `agents never merge` |
| `gh -R o/r pr merge`, `--repo`, `GH_REPO=… gh pr merge`, `--auto`, `/opt/homebrew/bin/gh`, `"gh" pr "merge"`, after `&&`; `gh pr -R o/r merge`, `gh pr --repo=o/r merge`, `gh pr --repo o/r merge`                                                                                                                                                         | exit 2, `agents never merge` |
| reads: `gh api …/pulls/7`, `… --jq .mergeable`, `…/files`, `…/reviews`, GraphQL query of `mergeable`, `gh pr view --json merge…`, `gh pr -R o/r view --json mergeable`, `gh pr checks`, `gh pr list --state merged`, `gh pr edit --add-label`, `git merge origin/main`, `git merge --no-ff -m "Merge …"`, `git log --merges`, `scripts/pr-step.sh ready 7` | exit 0                       |

## Verification

- Red `test(hooks): B1.103 hook-smoke probes gh merge calls (red)` (body "Red because guard-bash lets every gh merge
  call through and settings.json denies only the plain merge subcommand"): 26 FAIL (25 merge probes + the settings
  probe), every other probe ok, "hook-smoke: FAILURES above" (prototype r2 on 36d0e2e: 25 merge FAIL, 14 reads ok).
  Commit messages go through `git commit -F` (a `-m` naming `pr merge` would trip the new rule).
- Green `chore(hooks): B1.103 guard-bash blocks merging a pull request through gh`: "hook-smoke: 788 probes OK"
  (749 + 39), `/bin/bash` 3.2 and bash 5. Mutants (prototype): no whole-command check, first segment only,
  case-sensitive, no `pr merge` check, no quotes after `gh`, no flags between `pr` and `merge`, `pulls/<n>/merge`,
  `/merges` or each of the four mutation names dropped — 12 of 12 fail a merge probe (review r2: 12 of 12).
- `pnpm lint && pnpm typecheck` exit 0; `pnpm test` 298 before and after (no `src/`); mutation: CI only, no
  src/lib or src/actions change; `next-task.sh --check B1.103` no overlap; `check-plan-scope.sh`, `check-backlog.sh`
  OK; CI green.

## Work breakdown

| Step | Role     | Produces                      | Commit                                                                     |
| ---- | -------- | ----------------------------- | -------------------------------------------------------------------------- |
| 1    | dev-lead | red probes, settings expected | `test(hooks): B1.103 hook-smoke probes gh merge calls (red)`               |
| 2    | dev-lead | rule, deny entries, docs      | `chore(hooks): B1.103 guard-bash blocks merging a pull request through gh` |
| 3    | reviewer | diff review                   | `docs(backlog): B1.103 review pass N`                                      |
| 4    | dev-lead | draft PR, label               | —                                                                          |

Plan review: approved, round 2 · Plan approved by: · Rounds: 1
