# B1.22 plan — Batch review and the parallel-lane metrics: throughput, lead wait time, uncaught plan deviations (tooling)

Approach: three read-only scripts beside B1.16's, smoke probes on its fixture, one doc section; no shared-lib refactor
(round 1: not worth it unless it exports every approval round; each new script carries its own 3-line `cards`).
spec-analyst/advisor skipped (no section). Round 1 (9 reasons) applied below.

- **Throughput** (D-18): per calendar day UTC+7, cards whose feature PR merged that day ÷ span × 8, summed over days;
  span = from the earlier of the day's first plan-approval commit (any card, round 1) and the day's first merge, to the
  day's last merge. **Baseline = D-18's window B1.1–B1.15: ≈ 4.85 cards / 8 h → target ≥ 6.3**; B1.1–B1.21 printed
  for context (≈ 5.23). Departure stated: a card approved the day before adds no span to the day it merges.
- **Wait time** (B1.21 (b)): plan gate = Σ over the card's approval rounds of (approval commit − its first parent);
  PR = merge − first green `ci` run completed on the card's last own commit or later (own = first-parent, not a merge,
  not `chore(ci)`), so a BEHIND merge or a label re-run does not reset it. Medians. Stated bias: a commit the session
  makes while waiting shortens the gate wait.
- **Plan deviations no hook caught**: a merged card PR's file outside `check-plan-scope.sh`'s paperwork set and not
  in `plan-files.sh <card> <head>`; no approval → `n/a`. Prototype: 0 of 19 measured (B1.2–B1.21), B1.1 `n/a`.
- **Batch review** (`git-workflow.md`): the lead takes plans and ready PRs in batches (e.g. late morning, late
  afternoon). Costs stated there: a card waiting at the plan gate is Doing, so 3 plans waiting fill WIP 3; a card
  waiting as a ready PR is Review and frees its slot; a batch of k ready PRs costs k − 1 serial CI cycles (≈ 4 min each)
  because the ruleset requires up-to-date branches. Plan > 40 lines: the lead accepts or trims.

## Files

| File                                 | Change                                                       |
| ------------------------------------ | ------------------------------------------------------------ |
| `scripts/metrics/throughput.sh`      | new                                                          |
| `scripts/metrics/wait-time.sh`       | new                                                          |
| `scripts/metrics/plan-deviations.sh` | new                                                          |
| `scripts/metrics-smoke.sh`           | probes M14–M20; fixture plans gain Files; shim gains 3 calls |
| `docs/metrics.md`                    | three top-table rows (Parallel delivery)                     |
| `.claude/docs/git-workflow.md`       | "Batch review" section                                       |
| `scripts/CLAUDE.md`                  | rows for the three scripts                                   |
| `backlog/work/B1.22/plan.md`         | plan                                                         |
| `backlog/work/B1.22/review.md`       | reviews                                                      |

## Interfaces touched

```bash
scripts/metrics/throughput.sh [<card>…]       # TSV day cards hours; last: "throughput <x> cards per 8 h (<n> cards, <h> h, <d> days)"
scripts/metrics/wait-time.sh [<card>…]        # TSV card pr gate_min pr_min; last: "median plan-gate wait <a> min (<n>), median PR wait <b> min (<m>)"
scripts/metrics/plan-deviations.sh [<card>…]  # TSV card pr outside|n/a; last: "uncaught plan deviations <k>/<n>"
gh pr view N --json headRefOid --jq .headRefOid ; gh pr view N --json files --jq '.files[].path'
gh run list --commit <sha> --workflow ci --json conclusion,updatedAt --jq '[.[] | select(.conclusion == "success") | .updatedAt | fromdateiso8601] | min // empty'
```

Probes (fixture B9.1–B9.5): M14 throughput line exact for a two-day fixture; M15 span starts at the day's first merge
when it precedes every approval; M16 gate wait sums two approval rounds; M17 PR wait anchors on the last own commit's
first green run, a later merge-of-main and `chore(ci)` commit ignored; M18 no green run → `n/a`, out of the median;
M19 a file outside B9.1's plan → counted, a listed file and paperwork → not; M20 no approval → `n/a`.

## Verification (in the card worktree)

```bash
scripts/metrics-smoke.sh   # test commit: 11 ok, 7 FAIL (M14–M20, scripts missing); green: 18 ok, 0 FAIL
scripts/metrics/throughput.sh B1.1 … B1.15 | tail -1   # ≈ 4.85;  all cards ≈ 5.23
scripts/metrics/wait-time.sh | tail -1; scripts/metrics/plan-deviations.sh | tail -1   # 0/19
bash -n scripts/*.sh scripts/metrics/*.sh && scripts/ci/check-plan-scope.sh && scripts/ci/check-backlog.sh
```

Steps: `test(scripts)` → `feat(scripts)` → `reviewer` diff → draft PR at the gate, ready at Loop 9 (B1.21),
`config-change-approved` (D-19: `.claude/docs`).

Plan review: changes requested, round 1 (9 reasons, applied) · Plan approved by: <empty until the lead approves> ·
Rounds: 1
