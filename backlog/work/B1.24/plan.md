# B1.24 plan — guard-bash blocks every forced-push and branch-delete spelling (tooling)

Round 2 (plan review round 1: 6 reasons, all applied). Rule 2 of `guard-bash.sh` moves from one regex over the whole
command to a per-segment check: join `\`-newline continuations, split on `; & |` and newlines (like rule 1), find
`git [options] push|send-pack` (options such as `-C <dir>`, `-C "a b"`, `-C a\ b`, `-c <k=v>`, `--no-pager` may come
first) and block when a word after it is `-f`/`-d` in a short-option cluster, `--force*`, `--mirror`, `--delete`,
`--prune` or a prefix git accepts for one (`--mir`, `--del`), or a refspec starting with `+` or `:`; a word may be
wrapped in quotes, `\`, `{` or `$`, or sit in a brace list (`'+main'`, `{x,--force}`); any `$'…\…'` escape after push
blocks too. Saved-config routes count: a `-c` value, `git config` or `git remote` that sets a mirror or a `+`/`:` push
refspec (`remote.origin.mirror`, `remote add --mirror=push`), and `gh api` that deletes or force-updates a ref
(`git/refs` with DELETE/PATCH/force, `deleteRef`, `updateRef`). One message: "force pushes and remote branch deletes
are not allowed from an agent session." Out of reach, stated in the rule's comment and in hooks.md: a flag or refspec
held in a variable (`git push origin "$REF"`), an alias, a word quoted in pieces, a command built at run time. Not a
force, left passing: a real newline (`git push origin⏎+main` is two commands). Still blocked as before this card: a
quoted command text such as `git commit -m "… git push --force"`. Tooling card: spec-analyst and advisor skipped; the
card's Acceptance is the contract. Batch 5: B1.26 (`scripts/pr-step.sh`, `scripts/pr-step-smoke.sh`,
`.claude/agents/dev-lead.md`) and B1.27 (`scripts/next-task.sh`, `scripts/next-task-smoke.sh`) need none of these files.

## Files

| File                            | Change                                                                           |
| ------------------------------- | -------------------------------------------------------------------------------- |
| `.claude/hooks/guard-bash.sh`   | rule 2 per segment, the spellings and routes above, new message                  |
| `scripts/hook-smoke.sh`         | `probe_msg` helper; 38 exit-2 probes (+ message), 12 exit-0 probes               |
| `.claude/docs/hooks.md`         | guard-bash row: force pushes and remote branch deletes, and what is out of reach |
| `backlog/work/B1.24/plan.md`    | plan                                                                             |
| `backlog/work/B1.24/review.md`  | reviews                                                                          |
| `backlog/work/B1.24/pr-body.md` | PR body                                                                          |

## Interfaces touched

None: `guard-bash.sh` keeps its input (PreToolUse JSON) and exit codes (0 pass, 2 block); only rule 2's coverage and
message change. `scripts/hook-smoke.sh` keeps its call and output shape.

Exit-2 probes (each also asserts "force pushes" in stderr): `'+main'`, `"+feat/x"`, `+@:feat/x`,
`+0a1b2c3:refs/heads/feat/x`, `+$BR`, `\+main`, `$'+main'`, `$'\x2bmain'`, `{main,--force}`, `{x,:feat/y}`,
`--mirror`, `--mir`, `--delete feat/x`, `--del feat/x`, `-d`, `:feat/x`, `"":feat/x`, `--prune`, `'--force'`,
`git -C . push --force`, `git -C . push -f`, `git -C "a b" push -f`, `git -C a\ b push -f`, `git --no-pager push -f`,
`git "push" -f`, `git push origin \⏎+main`, `git \⏎push -f`, `-c remote.origin.mirror=true`,
`-c remote.origin.push=+refs/heads/*:refs/heads/*`, `git config remote.origin.mirror true`, `git config
remote.origin.push +refs/heads/*:refs/heads/*`, `git remote add --mirror=push m url`, `git send-pack --force`,
`gh api -X DELETE repos/o/r/git/refs/heads/feat/x`, `git status && git push -f`, `git push -u … ; git push -uf …`,
`(git push -f)`, `git push --all --prune`. Exit-0 probes: `git push`, `git -C . push -u origin feat/x`,
`git push -u origin feat/B1.24-force-push-spellings`, `--follow-tags`, `--dry-run`, `HEAD:refs/heads/feat/x`,
`--set-upstream origin feat/fix-delete`, a `git commit -m` naming "forced-push", `git remote add origin
git@github.com:o/r.git`, `git config user.name x`, `gh api repos/o/r/git/refs/heads/feat/x` (GET),
`scripts/pr-step.sh push` (cwd = top level). The four existing force-push probes and `git push -u origin feat/x`
(exit 0) stay as they are.

## Verification (in the card worktree, bash 3.2 = /bin/bash on macOS)

```bash
scripts/hook-smoke.sh | tail -1   # test commit: "hook-smoke: FAILURES above" (359 probes);
                                  # fix commit: "hook-smoke: 359 probes OK" (baseline 309)
scripts/hook-smoke.sh | grep -c '^FAIL'   # test commit: 34 (HEAD already blocks 4 of the 38); fix commit: 0
scripts/ci/check-plan-scope.sh | tail -1; scripts/ci/check-backlog.sh | tail -1   # OK; OK
pnpm lint && pnpm typecheck && pnpm test   # unchanged, green (no src/ change)
```

Steps: `test(scripts): B1.24 …` (probes only; no `(red)` marker: CI's `verify-red.sh --auto` judges only vitest files)
→ `fix(scripts): B1.24 …` (guard-bash.sh, hooks.md) → reviewer diff → `scripts/pr-step.sh push` / `draft`, PR title
`chore(scripts): B1.24 …` (the squash title; `fix(` would make `change-failure-rate.sh` count it as a repair of B1.17,
#60, which also touched `scripts/hook-smoke.sh`), `config-change-approved` (D-19: `.claude/hooks/guard-bash.sh`,
`.claude/docs/hooks.md`). Commit messages that quote a spelling go through `git commit -F <file>` (the guard reads
`-m` text); the PR body is `pr-body.md`.

Plan review: · Plan approved by: · Rounds: 1
