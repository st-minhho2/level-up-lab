# B1.18 plan — WIP limit: at most three cards in Doing, none sharing a planned file (tooling, Tier quick)

Approach: derive each card's board state from one shared source and enforce the limit on every start. spec-analyst/
advisor skipped (no section). Round 1 (9 reasons) addressed below.

- **Source:** "Remaining" of `origin/main:backlog/README.md` after `git fetch` (every checkout sees the same board),
  card status lines from `origin/main:backlog/plan/E*.md`, branches local + `origin/`, PRs from **one** call
  `gh pr list --state all --limit 300 --json headRefName,state,isDraft` (no timeout on bash 3.2: a hung `gh` hangs
  the pick, accepted). `gh` fails → stderr warning, every branch counts as Doing; `git fetch` fails → stderr warning,
  last-fetched `origin/main` used (never aborts under `set -e`).
- **State** of a Remaining card with status Open: branch `<prefix>/<card>(-…)$`, prefix ≠ `docs` (B9.1 ≠ B9.10), whose
  latest PR is not MERGED or CLOSED → **Doing**; that PR open and not draft → **Review**; CLOSED unmerged → **To do**
  (abandoned); no branch → **To do**. A Partial card ("merged,
  pending") or a card whose feature PR is MERGED is **Closing** (not Doing).
- **WIP = Doing only** (Review waits on the lead, its session is free). `WIP_LIMIT=3`.
- **Every start enforces it:** `next-task.sh` (pick: skips Doing/Review/Closing, refuses at 3) and `next-task.sh
--claim <card>` (start by id, tooling cards too: refuses at 3, and refuses when another checkout already holds a
  branch for `<card>`, so two sessions cannot start one card). dev-lead Loop 1 and `/work-next` Entry run pick or
  claim, then `scripts/worktree.sh` at once (the branch is the claim), then spec-analyst.
- **Overlap:** `next-task.sh --check <card>`: paperwork exempt as `check-plan-scope.sh`; two tokens collide when equal
  or either glob-matches the other; compared with the plan at the branch tip of every Doing/Review card. dev-lead runs
  it before the plan review and at every re-approval; the reviewer's plan review quotes its output. Advisory: no CI
  net (a missed check surfaces as a merge conflict). Costs: §5 cards collide (10 of 21 past pairs on
  `src/actions/todos.ts`) and tooling cards almost always do (13 of 21 on `scripts/CLAUDE.md` alone): both serialize.

**Decision for the lead ((b) recommended):** (a) a `Board` column in README "Remaining", moved by dev-lead in small
PRs: per card 2 extra PRs and 2 extra lead merges, and parallel sessions edit one table (README conflicts, #58/#59).
(b) derived as above — a stated deviation from the card's "the board shows … (`backlog/README.md`)": README keeps one
line saying the board is `next-task.sh --list` (BOARD column, mirrored on the lead's live board page); offline the
list is conservative.

## Files

| File                                | Change                                                     |
| ----------------------------------- | ---------------------------------------------------------- |
| `scripts/next-task.sh`              | source, state, WIP on pick and `--claim`, `--check`, BOARD |
| `scripts/ci/plan-files.sh`          | `--any`: Files at `<rev>` whether approved or not          |
| `scripts/ci/check-backlog.sh`       | the README board line is present                           |
| `scripts/next-task-smoke.sh`        | new: W1–W16, throwaway repo + bare origin + `gh` shim      |
| `backlog/README.md`                 | board line under "Remaining"                               |
| `backlog/CLAUDE.md`                 | WIP rule under "Eligible"                                  |
| `.claude/agents/dev-lead.md`        | Loop 1 claim + worktree first; Loop 3/5 `--check`          |
| `.claude/agents/reviewer.md`        | plan review quotes `--check`                               |
| `.claude/skills/work-next/SKILL.md` | Entry: pick or `--claim <card>`, then `worktree.sh`        |
| `scripts/CLAUDE.md`                 | rows for the flags and the smoke                           |
| `backlog/work/B1.18/plan.md`        | plan                                                       |
| `backlog/work/B1.18/review.md`      | reviews                                                    |

## Interfaces touched

```bash
scripts/next-task.sh                  # "B2.1 backlog/plan/E2-x.md" | exit 1 "WIP 3/3: Doing B2.1 B2.2 B2.3"
scripts/next-task.sh --claim <card>   # exit 0 | 1 "WIP 3/3 …"
scripts/next-task.sh --check <card>   # exit 0 "no overlap" | 1 "<token> also planned by <card'> (Doing)"
scripts/next-task.sh --list           # + BOARD column (To do | Doing | Review | Closing)
scripts/ci/plan-files.sh --any <card> [<rev>]   # exit 4 no plan
```

Probes: W1 none → B9.1; W2 B9.1–B9.3 branches → pick exit 1; W3 `docs/B9.1-done` only → To do; W4 B9.3 PR ready →
Review, B9.4 picked; W5 draft → Doing; W6 B9.3 PR MERGED → Closing, B9.4 picked; W7 B9.2 Partial → Closing; W8
`feat/B9.10-x` does not make B9.1 Doing; W9 local README lists a card origin/main does not → ignored; W10 `--claim
B9.5` at 3 → 1, `--claim B9.1` already Doing → 0; W11 `--check`, same file → 1; W12 glob vs file either way → 1;
W13 only paperwork shared → 0 printing "no overlap"; W14 `gh` fails → warning, conservative, exit as W2; W15 `--claim
B9.4` while another checkout holds `feat/B9.4-y` → 1; W16 B9.3's only PR CLOSED unmerged → To do.

## Verification (in the card worktree)

```bash
scripts/next-task-smoke.sh   # test commit: every probe needing state, --claim or --check FAILs (exact list in its body); green 16/16
scripts/hook-smoke.sh && scripts/ci/check-backlog.sh && scripts/ci/check-plan-scope.sh && bash -n scripts/*.sh scripts/ci/*.sh
```

Steps: `test(scripts)` probes → `feat(scripts)` → `reviewer` diff → PR (`config-change-approved`: `scripts/next-task.sh`,
`scripts/ci/`, `.claude/agents/`). Orchestrating session edits `scripts/`, as B1.12–B1.17.

Plan review: changes requested, round 2 (cap); round-1 and round-2 reasons applied above, not re-reviewed; size
M [estimate] (card says S) · Plan approved by: lead (session reply "approve (b), không tách"), 2026-10-30 ·
Rounds: 1
