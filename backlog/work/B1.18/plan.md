# B1.18 plan — WIP limit: at most three cards in Doing, none sharing a planned file (tooling, Tier quick)

Approach: the board state of a Remaining card is derived, not typed; `next-task.sh` enforces the limit at pick time
and checks plan overlap at the plan gate. spec-analyst/advisor skipped (no section).

- **Board state** of a Remaining card: **Doing** = a local or `origin/` branch `<prefix>/<card>(-…)` exists, prefix not
  `docs` (every session on this machine shares one git repo, so a card's worktree branch is visible to all);
  **Review** = such a branch has an open, non-draft PR (`gh`; offline or no auth → Doing); **To do** = neither.
  Merged cards leave Remaining in the closing lane, so a pruned branch never lingers as Doing.
- **WIP:** `next-task.sh` (pick) refuses when 3 cards are Doing (Review does not count: its session is free, it waits
  on the lead) and prints them. `next-task.sh --check <card>` (dev-lead, before the plan gate) refuses when a planned
  Files token of `<card>` equals or glob-matches a token of another Doing/Review card's plan at its branch tip.

**Decision for the lead ((b) recommended):** (a) a `Board` column in `backlog/README.md` that dev-lead edits through
small PRs at each move (To do → Doing → Review): two extra PRs per card, and three parallel sessions editing one table
is the README conflict already seen (#58/#59); (b) derived as above: README rows stay as filed, `next-task.sh --list`
prints the live `BOARD` column, `check-backlog.sh` checks the README note that says so, the board artifact shows it.

## Files

| File                                      | Change                                                                    |
| ----------------------------------------- | ------------------------------------------------------------------------- |
| `scripts/next-task.sh`                    | derived board state; WIP refusal; `--check <card>`; `--list` BOARD column |
| `scripts/ci/plan-files.sh`                | `--any`: Files at `<rev>` whether approved or not (for `--check`)         |
| `scripts/ci/check-backlog.sh`             | README "Remaining" names where the board state lives                      |
| `scripts/next-task-smoke.sh`              | new: probes W1–W8 on a throwaway repo with a `gh` shim                    |
| `backlog/README.md`, `backlog/CLAUDE.md`  | board note under "Remaining"; WIP rule in "Eligible"                      |
| `.claude/agents/dev-lead.md`              | Loop 1 "Pick" and 5 "Gate": run `--check <card>` before asking the lead   |
| `scripts/CLAUDE.md`                       | rows for `next-task.sh` flags and the smoke                               |
| `backlog/work/B1.18/plan.md`, `review.md` | plan, reviews                                                             |

## Interfaces touched

```bash
scripts/next-task.sh                  # "B2.1 backlog/plan/E2-x.md" | exit 1 "WIP 3/3: Doing B2.1 B2.2 B2.3" or near-misses
scripts/next-task.sh --list           # adds BOARD (To do|Doing|Review) per row
scripts/next-task.sh --check <card>   # exit 0 "no overlap" | exit 1 "<file> also planned by <card'> (Doing)"
scripts/ci/plan-files.sh --any <card> [<rev>]   # Files tokens at <rev>; exit 4 no plan
WIP_LIMIT=3                           # constant in next-task.sh (D-n to change)
```

Probes (cards B9.1–B9.5 eligible): W1 none in progress → B9.1; W2 branches for B9.1–B9.3 → exit 1 "WIP 3/3";
W3 `docs/B9.1-done` only → not Doing; W4 B9.3's branch has a ready PR (shim) → Review, B9.4 picked; W5 a draft PR →
still Doing; W6 `--check B9.4`, plan shares `src/lib/a.ts` with B9.1 → 1; W7 shares a glob `src/lib/*` → 1; W8 no
shared token → 0; W9 `gh` fails → every branch Doing, no crash.

## Verification (in the card worktree)

```bash
scripts/next-task-smoke.sh            # test commit: W2, W4–W9 FAIL (no WIP logic); green: 9 of 9 ok
scripts/next-task.sh --list           # this repo: B1.18 Doing (its own branch exists)
scripts/hook-smoke.sh && scripts/ci/check-backlog.sh && scripts/ci/check-plan-scope.sh && bash -n scripts/*.sh scripts/ci/*.sh
```

Steps: `test(scripts): B1.18 next-task WIP probes` → `feat(scripts): B1.18 WIP limit and plan overlap` →
`reviewer` diff → PR (`config-change-approved`: `scripts/next-task.sh`, `scripts/ci/`, `.claude/agents/`). As
B1.12–B1.17 the orchestrating session edits `scripts/`; this card is the first under `plan-scope.sh` only in a session
started after 25fee24 (this one predates it: its writes are not checked live; `check-plan-scope.sh` runs in CI).

Plan review: <pending> · Plan approved by: <empty until the lead approves> · Rounds: 1
