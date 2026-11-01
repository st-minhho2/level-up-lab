# B1.26 plan — pr-step opens a card closing PR (tooling)

Round 1. A new wrapper step `open "<title>"` for the two lane branches only, with its own committed body file per lane,
read with `draft`'s three checks; `draft` refuses on a lane branch (today it opens the PR with the feature PR's body).
Body committed in the lane's one commit, so the reviewer sees it in the diff and `check-plan-scope.sh` passes it as
paperwork (`backlog/*`). Lane PRs open ready (#113, #115, #117 were never drafts). No `guard-bash.sh` change: rule 5 and
`allow: Bash(scripts/pr-step.sh *)` take any step. Tooling card: spec-analyst and advisor skipped.
Assumes (B1.23 review, pass 2 [1]): rule 5 blocks the wrapper while the card worktree's `scripts/pr-step.sh` differs
from the session checkout's, so after the `fix` commit this card's `push` and `ready` are blocked (exit 2): reported,
never worked around; the lead pushes / readies or says how. The live check (closing PR via `open`) needs the session
checkout at the merged `origin/main` first.

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
scripts/pr-step.sh open "<title>"   # gh pr create --base main --head <branch> --title <title> --body-file <rel>; prints the PR number
#   branch docs/<card>-done (closing): title exactly "docs(backlog): <card> done"; rel backlog/work/<card>/closing-pr-body.md
#   branch docs/<card>-card (filing):  title ^docs\(backlog\): card <card> [ -~]+$, one line, <= 80; rel backlog/work/<card>/filing-pr-body.md
#   any other branch: refused. Body: regular file, not a symlink, one link, resolved dir = $top/backlog/work/<card>
scripts/pr-step.sh draft "<title>"  # unchanged on feat|fix|chore|test|docs card branches; refused (exit 3) on docs/<card>-done|-card
scripts/pr-step.sh push | ready <n> [--undo]   # unchanged (push and ready already accept lane branches)
```

Probes (throwaway repo, `gh` shim log): R11 `open 'docs(backlog): B9.1 done'` on `docs/B9.1-done` → exit 0, prints 41,
log exactly `pr create --base main --head docs/B9.1-done --title docs(backlog): B9.1 done --body-file
backlog/work/B9.1/closing-pr-body.md` · R12 `open 'docs(backlog): card B9.1 add x'` on `docs/B9.1-card` → same with
`filing-pr-body.md` · R13 refused (exit 3, `pr-step:`, no gh call): `open` on `feat/B9.1-x`; closing title `B9.2 done`
/ `B9.1 done now`; filing title two lines / other card / 81 chars; body missing, symlink, hard link, symlinked dir ·
R14 `draft 'docs(backlog): B9.1 done'` on `docs/B9.1-done` and `docs/B9.1-card` with `pr-body.md` present → refused.

## Verification (in the card worktree)

```bash
scripts/pr-step-smoke.sh   # test commit: "[pr-step-smoke] 11 ok, 3 FAIL" (R11 R12 R14; R13 refused as unknown step)
                           # fix: "[pr-step-smoke] 14 ok, 0 FAIL" (bash 5 and /bin/bash 3.2)
scripts/hook-smoke.sh | tail -1                                         # unchanged, 0 FAIL
scripts/ci/check-plan-scope.sh | tail -1; scripts/ci/check-backlog.sh | tail -1   # OK; OK
```

Live check after the merge: B1.26's closing PR opens with `scripts/pr-step.sh push` then `scripts/pr-step.sh open
"docs(backlog): B1.26 done"`, body in `backlog/work/B1.26/closing-pr-body.md`, no prompt, no refusal.

Steps: `test(scripts): B1.26 …` (no `(red)` marker: tooling) → `fix(scripts): B1.26 …` (+ the doc rows above) →
reviewer diff → `config-change-approved` (D-19: `scripts/pr-step.sh`, `.claude/agents`, `.claude/skills`, `.claude/docs`).

Plan review: pending · Plan approved by: · Rounds: 1
