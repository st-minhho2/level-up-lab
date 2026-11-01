# B1.24 plan — guard-bash blocks every forced-push and branch-delete spelling (tooling)

Approach: rule 2 of `guard-bash.sh` moves from one regex over the whole command to a per-segment check (split on
`; & |` and newlines, like rule 1): find `git [options] push` (options such as `-C <dir>`, `-c <k=v>`, `--no-pager`
may come first; a quoted `-C "a b"` counts), then block when a word after `push` is `-f`/`-d` in a short-option
cluster, `--force*`, `--mirror`, `--delete`, `--prune` or a prefix git accepts for one (`--mir`, `--del`), or a
refspec starting with `+` or `:`; any of these may be wrapped in quotes, `\`, `{` or `$` (`'+main'`, `$'+main'`). A
`-c` value holding `mirror` or `=+`/`=:` counts too. Message: "force pushes and remote branch deletes are not allowed
from an agent session." Out of reach (stated in the rule's comment): a flag or refspec in a variable (`git push origin
"$REF"`), an alias, a word quoted in pieces, a command built at run time. Tooling card: spec-analyst and advisor
skipped; the card's Acceptance is the contract. Batch 5: B1.26 (`scripts/pr-step.sh`, `scripts/pr-step-smoke.sh`,
`.claude/agents/dev-lead.md`) and B1.27 (`scripts/next-task.sh`, `scripts/next-task-smoke.sh`) need none of these files.

## Files

| File                            | Change                                                               |
| ------------------------------- | -------------------------------------------------------------------- |
| `.claude/hooks/guard-bash.sh`   | rule 2 per segment, the spellings above, new message                 |
| `scripts/hook-smoke.sh`         | `probe_msg` helper; 26 exit-2 probes (+ message), 9 exit-0 probes    |
| `.claude/docs/hooks.md`         | guard-bash row: force pushes and remote branch deletes, any spelling |
| `backlog/work/B1.24/plan.md`    | plan                                                                 |
| `backlog/work/B1.24/review.md`  | reviews                                                              |
| `backlog/work/B1.24/pr-body.md` | PR body                                                              |

## Interfaces touched

None: `guard-bash.sh` keeps its input (PreToolUse JSON) and exit codes (0 pass, 2 block); only rule 2's coverage and
message change. `scripts/hook-smoke.sh` keeps its call and output shape.

Exit-2 probes (each also asserts "force pushes" in stderr): `'+main'`, `"+feat/x"`, `+@:feat/x`,
`+0a1b2c3:refs/heads/feat/x`, `+$BR`, `\+main`, `$'+main'`, `--mirror`, `--mir`, `--delete feat/x`, `--del feat/x`,
`-d`, `:feat/x`, `"":feat/x`, `--prune`, `'--force'`, `git -C . push --force`, `git -C . push -f`,
`git -C "a b" push -f`, `git --no-pager push -f`, `git "push" -f`, `-c remote.origin.mirror=true`,
`-c remote.origin.push=+refs/heads/*:refs/heads/*`, `git status && git push -f`, `git push -u … ; git push -uf …`,
`(git push -f)`. Exit-0 probes: `git push`, `git -C . push -u origin feat/x`, `git push -u origin
feat/B1.24-force-push-spellings`, `--follow-tags`, `--dry-run`, `HEAD:refs/heads/feat/x`, `--set-upstream origin
feat/fix-delete`, a `git commit -m` naming "forced-push", `scripts/pr-step.sh push` (cwd = top level). The four
existing force-push probes and `git push -u origin feat/x` (exit 0) stay as they are.

## Verification (in the card worktree, bash 3.2 = /bin/bash on macOS)

```bash
scripts/hook-smoke.sh | tail -1   # test commit: "hook-smoke: FAILURES above" with 23 FAIL lines (344 probes);
                                  # fix commit: "hook-smoke: 344 probes OK" (baseline 309)
scripts/hook-smoke.sh | grep -c '^FAIL'   # test commit: 23; fix commit: 0
scripts/ci/check-plan-scope.sh | tail -1; scripts/ci/check-backlog.sh | tail -1   # OK; OK
pnpm lint && pnpm typecheck && pnpm test   # unchanged, green (no src/ change)
```

Steps: `test(scripts): B1.24 …` (probes only; no `(red)` marker: CI's `verify-red.sh --auto` judges only vitest files)
→ `fix(scripts): B1.24 …` (guard-bash.sh, hooks.md) → reviewer diff → `scripts/pr-step.sh push` / `draft`,
`config-change-approved` (D-19: `.claude/hooks/guard-bash.sh`, `.claude/docs/hooks.md`).

Plan review: · Plan approved by: · Rounds: 1
