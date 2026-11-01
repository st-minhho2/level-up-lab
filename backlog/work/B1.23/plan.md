# B1.23 plan — Card sessions run their own PR steps: push, open, label, mark ready (tooling)

Round 2. Round 1 (6 reasons) showed a `Bash(...)` allow rule cannot limit arguments: `Bash(git push*)` would auto-approve
force and delete spellings `guard-bash.sh` misses, and `gh pr create|edit` would auto-approve `hotfix`, `-R` and
`--body-file .env`. So no raw `git`/`gh` rule is allowed. Instead one wrapper, `scripts/pr-step.sh`, does exactly the
five PR steps dev-lead owns (B1.21 Loop 5/9, D-19) and checks every argument itself; the only new allow rule is
`Bash(scripts/pr-step.sh *)`. Raw `git push` / `gh pr …` keep today's behavior (asked or refused). Tooling card:
spec-analyst and advisor skipped; the card's Acceptance is updated to this design in the plan commit.

## Files

| File                                                    | Change                                                                                               |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `scripts/pr-step.sh`                                    | new: `push`, `draft <title> <body.md>`, `body <n> <body.md>`, `label <n>`, `ready <n> [--undo]`      |
| `scripts/pr-step-smoke.sh`                              | new: probes R1–R12 on a throwaway repo with `git` remote and `gh` shim                               |
| `scripts/hook-smoke.sh`                                 | probe: `allow` is exactly `["Bash(scripts/pr-step.sh *)"]`; the whole 16-entry `deny` list unchanged |
| `.claude/settings.json`                                 | `permissions.allow`: `Bash(scripts/pr-step.sh *)`                                                    |
| `.claude/agents/dev-lead.md`                            | Loop 5 and Loop 9 call `scripts/pr-step.sh` instead of raw commands                                  |
| `.claude/skills/work-next/SKILL.md`                     | "`gh pr ready`" → "`scripts/pr-step.sh ready`"                                                       |
| `.claude/docs/git-workflow.md`, `.claude/docs/hooks.md` | PR steps via the wrapper; the permissions text matches the file (no `gh api` deny, allow = wrapper)  |
| `scripts/CLAUDE.md`                                     | rows for the two scripts                                                                             |
| `backlog/plan/E1-todos.md`, `backlog/work/B1.23/*`      | Acceptance to this design; plan; reviews                                                             |

## Interfaces touched

```bash
scripts/pr-step.sh push                     # git push -u origin HEAD:refs/heads/<current>; refuses main, detached, a name not <type>/<slug>; takes no other argument
scripts/pr-step.sh draft <title> <body.md>  # gh pr create --draft --base main --head <current> --title --body-file; body.md a regular .md file under backlog/work/ or $TMPDIR, not a symlink
scripts/pr-step.sh body <n> <body.md>       # gh pr edit <n> --body-file <body.md> (same file rule)
scripts/pr-step.sh label <n>                # gh pr edit <n> --add-label config-change-approved; nothing else
scripts/pr-step.sh ready <n> [--undo]       # gh pr ready <n> [--undo]
# <n>: digits only, and PR <n>'s headRefName must equal the current branch (gh pr view <n> --json headRefName)
```

Probes (`pr-step-smoke.sh`, red at the test commit: script missing): R1 push of `feat/B9.1-x` runs the exact git line;
R2 on `main` refused; R3 extra argument to `push` refused; R4 draft with a body under `backlog/work/` runs the exact gh
line; R5 body file `.env`, `~/.ssh/x`, a symlink, a non-`.md` refused; R6 `label 7` exact line; R7 `label` with any extra
word refused; R8 `ready 7` / `ready 7 --undo` exact lines; R9 `<n>` not digits refused; R10 PR whose head is another
branch refused; R11 unknown subcommand refused; R12 no shell metacharacter in a title reaches a second command.

## Verification (in the card worktree)

```bash
scripts/pr-step-smoke.sh   # test commit: 0 ok, 12 FAIL (missing); green: 12 ok, 0 FAIL, bash 5 and /bin/bash 3.2
scripts/hook-smoke.sh      # test commit: 1 FAIL (allow empty); green: 286 probes OK
scripts/ci/check-plan-scope.sh | tail -1 ; scripts/ci/check-backlog.sh | tail -1   # OK, OK
```

Assumption: auto mode keeps a narrow allow rule. Done only when the next card session runs `push`, `draft`, `label`
and `ready` through the wrapper with no refusal (recorded in the closing PR); a refusal leaves the card Partial.
Out of scope (filed after): `guard-bash.sh` misses quoted `+refspec`, `+<sha>`, `--mirror`, branch deletes — unchanged
by this card, since no raw push is auto-approved.

Steps: `test(scripts)` (red) → `chore(scripts)` (green) → `reviewer` diff → draft PR, `config-change-approved` (D-19).
