# B1.26 plan — pr-step opens a card closing PR (tooling)

Round 2 (plan review round 1: 2 reasons — 1 → `-partial` branches added; 2 → exact verification lines). A new wrapper
step `open "<title>"` for the lane branches only (`docs/<card>-done`, `-partial` as #105, `-card`), body from a committed
per-lane file read with `draft`'s three checks; `draft` refuses on those branches (today it opens with the feature PR's
body). The body lands in the lane's one commit: the reviewer sees it, `check-plan-scope.sh` passes it as paperwork
(`backlog/*`). Lane PRs open ready (#105, #113, #115, #117 were never drafts). No `guard-bash.sh` change: rule 5 and
`allow: Bash(scripts/pr-step.sh *)` take any step. Tooling card: spec-analyst and advisor skipped.
Assumes (B1.23 review, pass 2 [1]): rule 5 blocks the wrapper while the card worktree's `scripts/pr-step.sh` differs from
the session checkout's, so after the `fix` commit this card's `push` and `ready` are blocked (exit 2): reported, never
worked around; the lead pushes / readies or says how. The live check needs the session checkout at the merged main.

## Files

| File                                | Change                                                                              |
| ----------------------------------- | ----------------------------------------------------------------------------------- |
| `scripts/pr-step.sh`                | `open` step; lane branches refuse `draft`; body checks shared by `draft` and `open` |
| `scripts/pr-step-smoke.sh`          | probes R11–R14; header; R1–R10 unchanged                                            |
| `.claude/agents/dev-lead.md`        | Loop 9 (after the merge): closing PR via `pr-step.sh push` + `open`                 |
| `.claude/skills/work-next/SKILL.md` | Exit: the closing PR via `open`                                                     |
| `.claude/docs/git-workflow.md`      | lifecycle step 6 and "Runs without asking" name `open`                              |
| `backlog/CLAUDE.md`                 | Filing step 5 / Closing step 6: the lane's body file, `push`, `open`                |
| `scripts/CLAUDE.md`                 | `pr-step.sh` row (`open`), smoke row R1–R14                                         |
| `backlog/work/B1.26/plan.md`        | plan                                                                                |
| `backlog/work/B1.26/review.md`      | reviews                                                                             |
| `backlog/work/B1.26/pr-body.md`     | feature PR body                                                                     |

## Interfaces touched

```bash
scripts/pr-step.sh open "<title>"  # gh pr create --base main --head <branch> --title <title> --body-file <rel>; prints the PR number
#  docs/<card>-done    title exactly "docs(backlog): <card> done"                 rel backlog/work/<card>/closing-pr-body.md
#  docs/<card>-partial title ^docs\(backlog\): <card> partial -- [ -~]+$          rel backlog/work/<card>/closing-pr-body.md
#  docs/<card>-card    title ^docs\(backlog\): card <card> [ -~]+$                 rel backlog/work/<card>/filing-pr-body.md
#  titles one line, <= 80; other branches refused; body regular, not a symlink, one link, resolved dir = $top/backlog/work/<card>
scripts/pr-step.sh draft "<title>"  # unchanged on card branches; refused (exit 3) on docs/<card>-done|-partial|-card
scripts/pr-step.sh push | ready <n> [--undo]   # unchanged (both already accept lane branches)
```

Probes (throwaway repo, `gh` shim log): R11 `open 'docs(backlog): B9.1 done'` on `docs/B9.1-done` and `open
'docs(backlog): B9.1 partial -- merged, x pending'` on `docs/B9.1-partial` → exit 0, prints 41, log exactly `pr create
--base main --head <branch> --title <title> --body-file backlog/work/B9.1/closing-pr-body.md` · R12 `open
'docs(backlog): card B9.1 add x'` on `docs/B9.1-card` → same with `filing-pr-body.md` · R13 refused (exit 3, `pr-step:`,
no gh call): `open` on `feat/B9.1-x`; titles `B9.2 done`, `B9.1 done now`, `B9.1 partial` (no `--`), filing two
lines / other card / 81 chars; body missing, symlink, hard link, symlinked dir · R14 `draft` on each lane branch with
`pr-body.md` present → refused.

## Verification (in the card worktree)

```bash
scripts/pr-step-smoke.sh                                 # test commit: "[pr-step-smoke] 11 ok, 3 FAIL" (R11 R12 R14; R13 refused as unknown step)
scripts/pr-step-smoke.sh                                 # fix: "[pr-step-smoke] 14 ok, 0 FAIL" (bash 5)
PATH="/bin:$PATH" /bin/bash scripts/pr-step-smoke.sh     # fix: "[pr-step-smoke] 14 ok, 0 FAIL" (wrapper and probes on bash 3.2)
scripts/hook-smoke.sh | tail -1                          # "hook-smoke: 309 probes OK" (count as on origin/main)
scripts/ci/check-plan-scope.sh | tail -1; scripts/ci/check-backlog.sh | tail -1   # OK; OK
```

Live check after the merge: `scripts/pr-step.sh push`, then `scripts/pr-step.sh open "docs(backlog): B1.26 done"` (or
`partial -- …`) on `docs/B1.26-done`, body `backlog/work/B1.26/closing-pr-body.md`: no prompt, no refusal.

Steps: `test(scripts): B1.26 …` (no `(red)` marker: tooling) → `fix(scripts): B1.26 …` (+ the doc rows above) →
reviewer diff → `config-change-approved` (D-19: `scripts/pr-step.sh`, `.claude/agents`, `.claude/skills`, `.claude/docs`).

Plan review: pending · Plan approved by: · Rounds: 1
