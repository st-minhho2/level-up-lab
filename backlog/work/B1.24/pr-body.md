## Item

B1.24 — guard-bash blocks every forced-push and branch-delete spelling (tooling, no spec section)

- spec: none — tooling card; the card's Acceptance (`backlog/plan/E1-todos.md` ### B1.24) is the contract
- test: new exit-2 / exit-0 probes in `scripts/hook-smoke.sh` — red before (today's `guard-bash.sh` exits 0 on 41 of them), green after
- acceptance: every listed spelling exits 2 with the force-push message; plain push, `push -u origin feat/x` and `scripts/pr-step.sh push` exit 0; existing force-push probes stay; label `config-change-approved` (D-19)

## Plan

> Copied from `backlog/work/B1.24/plan.md`.

# B1.24 plan — guard-bash blocks every forced-push and branch-delete spelling (tooling)

Round 3 (plan review round 1: 6 reasons applied; round 2: 6 reasons, dispositions below; the 2-round review cap is
reached, so the lead decides). Rule 2 of `guard-bash.sh` moves from one regex over the whole command to a per-segment
check: join `\`-newline continuations, split on `; & |` and newlines (like rule 1). In a segment that names git (quoted,
in `$( )` or backticks, or as a path), the words after its **first** `push`/`send-pack` word block on: `-f`/`-d` in a
short-option cluster, `--force*`, `--mirror`, `--delete`, `--prune` or a prefix git accepts (`--mir`, `--del`), a refspec
starting with `+` or `:`, each optionally behind quotes, `\` or `$` (`'+main'`, `$'+main'`); any `{` (brace lists,
`${X:-+main}`); any `$'…\…'` escape. Git options before push are not parsed, so none hides it (`git -C $(…) push -f`).
Saved config, any case: `git config`, `git remote`, `-c` or a `GIT_CONFIG_*` variable anywhere in the command that sets a
mirror or a `+`/`:` push refspec, unless it only reads or unsets (`--get`, `--unset`, `--list`). `gh` deleting, renaming
or force-updating a ref (`api … git/refs` with DELETE/PATCH/force any case, `deleteRef`, `updateRef`, `…/rename`) and
`gh repo sync --force`. One message: "force pushes and remote branch deletes are not allowed from an agent session."

Out of reach, in the rule's comment and hooks.md: a flag or refspec held in a variable, an alias, a word quoted in pieces,
a command built at run time, a git config file written directly (`>> .git/config`), other HTTP clients (`curl`) on the
GitHub API. Not a force, passes: a real newline (`git push origin⏎+main` is two commands). New false positives (exit 2):
a push word followed by `+`/`:`/`{` for another reason (`git push origin "v$(date +%Y)"`), any command text quoting a
force spelling after `git … push` (`git commit -m "… git push --force"`, already blocked today; `gh pr create --title
"… git push --force"`). Batch 5: B1.26 (`scripts/pr-step.sh`, `scripts/pr-step-smoke.sh`, `.claude/agents/dev-lead.md`)
and B1.27 (`scripts/next-task.sh`, `scripts/next-task-smoke.sh`) need none of these files. Tooling: no spec-analyst,
no advisor; the card's Acceptance is the contract.

## Files

| File                            | Change                                                                    |
| ------------------------------- | ------------------------------------------------------------------------- |
| `.claude/hooks/guard-bash.sh`   | rule 2 per segment, the spellings and routes above, new message           |
| `scripts/hook-smoke.sh`         | `probe_msg` helper; 47 exit-2 probes (+ message), 13 exit-0 probes        |
| `.claude/docs/hooks.md`         | guard-bash row: force pushes, remote branch deletes, what is out of reach |
| `backlog/work/B1.24/plan.md`    | plan                                                                      |
| `backlog/work/B1.24/review.md`  | reviews                                                                   |
| `backlog/work/B1.24/pr-body.md` | PR body                                                                   |

## Interfaces touched

None: `guard-bash.sh` keeps its input (PreToolUse JSON) and exit codes (0 pass, 2 block); only rule 2's coverage and
message change. `scripts/hook-smoke.sh` keeps its call and output shape.

Probes: every spelling, route and regression form named above and in review.md rounds 1–2 (47 exit 2, each asserting
"force pushes" in stderr, including the four forms today's hook blocks and round 2 found the first prototype passing:
`URL=$(git remote get-url origin) git push --force …`, `` git remote show origin `git push origin +main` ``);
13 exit 0: `git push`, `git -C . push -u origin feat/x`, `git push -u origin feat/B1.24-force-push-spellings`,
`--follow-tags`, `--dry-run`, `HEAD:refs/heads/feat/x`, `--set-upstream origin feat/fix-delete`, a `git commit -m`
naming "forced-push", `git remote add origin git@github.com:o/r.git`, `git config user.name "a=:b"`, `git config --get
remote.origin.mirror`, a GET `gh api …/git/refs/heads/feat/x`, `scripts/pr-step.sh push` (cwd = top level). The four
existing force-push probes and `git push -u origin feat/x` (exit 0) stay.

## Verification (in the card worktree, bash 3.2 = /bin/bash on macOS)

```bash
scripts/hook-smoke.sh | tail -1   # test commit: "hook-smoke: FAILURES above"; fix commit: "hook-smoke: 369 probes OK" (baseline 309)
scripts/hook-smoke.sh | grep -c '^FAIL'   # test commit: 41 (today's hook blocks 6 of the 47); fix commit: 0
scripts/ci/check-plan-scope.sh | tail -1; scripts/ci/check-backlog.sh | tail -1   # OK; OK
pnpm lint && pnpm typecheck && pnpm test   # unchanged, green (no src/ change)
```

Steps: `test(scripts): B1.24 …` (probes only; no `(red)` marker: CI's `verify-red.sh --auto` judges only vitest files)
→ `fix(scripts): B1.24 …` → reviewer diff → `scripts/pr-step.sh push` / `draft`, PR title `chore(scripts): B1.24 …`
(a `fix(` squash title would make `change-failure-rate.sh` count it as a repair of B1.17, #60), `config-change-approved`
(D-19: `.claude/hooks/guard-bash.sh`, `.claude/docs/hooks.md`). Commit messages quoting a spelling go through
`git commit -F <file>`; the PR body is `pr-body.md`.

Plan review: changes requested, round 2 (round-3 revision not re-reviewed: cap) · Plan approved by: · Rounds: 1

## Map delta

None: tooling card, no `spec/features-map.md` row.

## Review

pending

## Checklist

- [ ] **Diff matches the approved plan**: no file outside the Files table, no interface outside the list.
- [ ] Probe commit (`test(scripts)`) precedes the fix commit; the fix commit touches no probe.
- [ ] No new `eslint-disable` / `@ts-ignore` / `@ts-expect-error`; protected config change carries `config-change-approved` (`.claude/hooks/guard-bash.sh`, `.claude/docs/hooks.md`).
- [ ] `docs/metrics.md` per-card row filled; mistake-log updated if a known mistake repeated.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
