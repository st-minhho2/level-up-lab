# B1.23 plan — Card sessions run their own PR steps: push, open, mark ready (tooling)

Round 3, the lead's choice (B) after plan review round 2 (cap): a wrapper with three steps and nothing that takes a file
or a label. `label` and `body` stay as today (the session asks; D-19 labels are rare). Round-2 blocking reasons: 1 → the
guard-bash rule below; 2 and 3 → gone (no body-file argument, no `label`); 4 → every refusal probe checks the wrapper's
own exit 3, its message and an empty shim log. Forced-push spellings `guard-bash.sh` misses today go to B1.24.

## Files

| File                                                                         | Change                                                                                                                                                                                             |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scripts/pr-step.sh`                                                         | new: `push`, `draft "<title>"`, `ready <n> [--undo]`; clears `GH_REPO`, `GH_HOST`, `GIT_DIR`, `GIT_WORK_TREE`, `GIT_CONFIG_*`                                                                      |
| `scripts/pr-step-smoke.sh`                                                   | new: probes R1–R10, throwaway repo, `git` remote and `gh` shim with a call log                                                                                                                     |
| `.claude/hooks/guard-bash.sh`                                                | a command naming `pr-step.sh` must be one segment starting `scripts/pr-step.sh`, with no `$` `` ` `` `<` `>` `;` `&` `\|` `\` or newline, `cwd` = git top level, the script tracked and unmodified |
| `scripts/hook-smoke.sh`                                                      | G1–G6: the guard-bash rule; S1: `allow` is exactly `["Bash(scripts/pr-step.sh *)"]` and the 16 `deny` entries unchanged                                                                            |
| `.claude/settings.json`                                                      | `permissions.allow`: `Bash(scripts/pr-step.sh *)`                                                                                                                                                  |
| `scripts/ci/check-config-change.sh`                                          | `PROTECTED` gains `scripts/pr-step\.sh` (the wrapper is now a permission boundary)                                                                                                                 |
| `.claude/agents/dev-lead.md`, `.claude/skills/work-next/SKILL.md`            | Loop 5/9 call the wrapper for push, draft, ready, undo                                                                                                                                             |
| `.claude/docs/git-workflow.md`, `.claude/docs/hooks.md`, `scripts/CLAUDE.md` | the wrapper; permission text matches the file (no `gh api` deny today)                                                                                                                             |
| `backlog/plan/E1-todos.md`, `backlog/work/B1.23/*`                           | Acceptance to (B); plan; reviews                                                                                                                                                                   |

## Interfaces touched

```bash
scripts/pr-step.sh push              # git push -u origin HEAD:refs/heads/<branch>; no argument; branch ^(feat|fix|chore|test|docs)/B<e>.<n>(-slug)?$
scripts/pr-step.sh draft "<title>"   # gh pr create --draft --base main --head <branch> --title <title> --body-file backlog/work/<card>/pr-body.md; prints the PR number
                                     #   title: one line, ^(feat|fix|chore|test|docs)\([a-z]+\): <card> [ -~]{1,80}$; body file regular, not a symlink, one link, its resolved dir = resolved backlog/work/<card>
scripts/pr-step.sh ready <n> [--undo] # gh pr ready <n> [--undo]; <n> digits; PR <n> headRefName = <branch>, isCrossRepository = false
```

Probes, red at the test commit (script missing, guard rule absent): R1 push exact line; R2 `main`/detached refused; R3 any
argument to push refused; R4 draft exact line and number printed; R5 body file missing, symlink, hard link, symlinked dir
refused; R6 bad title (two lines, no card id, 81+ chars) refused; R7 ready / ready --undo exact lines; R8 `<n>` not
digits, other head, cross-repo refused; R9 unknown subcommand refused; R10 `GH_REPO` set by caller is ignored. G1 `>` file,
G2 `$(< .env)` title, G3 `GH_REPO=x` prefix, G4 `cd /tmp && …`, G5 a modified or untracked `scripts/pr-step.sh`, G6
`a && scripts/pr-step.sh push` → exit 2; `scripts/pr-step.sh ready 7` → exit 0.

## Verification (in the card worktree)

```bash
scripts/pr-step-smoke.sh   # test commit: 0 ok, 10 FAIL; green: 10 ok, 0 FAIL (bash 5 and /bin/bash 3.2)
scripts/hook-smoke.sh      # test commit: 7 FAIL (G1–G6, S1); green: 291 probes OK
scripts/ci/check-plan-scope.sh | tail -1; scripts/ci/check-backlog.sh | tail -1   # OK; OK
```

Assumes auto mode keeps a narrow allow rule. Done when the next card session runs `push`, `draft`, `ready` with no
refusal (recorded in the closing PR); a refusal leaves the card Partial. Steps: `test(scripts)` → `chore(scripts)` →
reviewer diff → draft PR, `config-change-approved` (D-19).

Plan review: changes requested, round 2 (cap); lead chose (B) at the gate · Plan approved by: · Rounds: 1
