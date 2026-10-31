# B1.22 plan — Batch review and the parallel-lane metrics: throughput, lead wait time, uncaught plan deviations (tooling)

Approach: three read-only scripts beside B1.16's, smoke probes on its fixture, one doc section; no shared-lib refactor
(round 1: not worth it unless it exports every approval round; each new script carries its own 3-line `cards`).
spec-analyst/advisor skipped (no section). Round 1 (9 reasons) applied below.

- **Throughput** (D-18): Σ cards whose feature PR merged ÷ Σ daily spans × 8 (one ratio, not a sum of daily ratios);
  day = UTC+7 calendar day, `(epoch + 25200) / 86400` in bash; span = the day's first plan-approval commit (any card)
  → the day's last feature-PR merge. **Lead's call (X)**: literal D-18 (baseline B1.1–B1.15 **5.11 → target ≥ 6.64**)
  or start the span at the earlier of that and the day's first merge (**4.85 → ≥ 6.31**, recorded as a D-18 amendment).
  Recommended: literal (no ruling to change). B1.1–B1.21 printed for context (5.56 / 5.23).
- **Wait time** (B1.21 (b)): plan gate = Σ over approval rounds of (approval commit − its first parent); median 1 min
  (19 cards, B1.1 n/a). PR wait, **lead's call (Y)**: (a) first green `ci` run at or after the last own commit → merge,
  printed with created → merge as the upper bound (median 1 / 22 min; B1.18 reads 0 because its own commit's run was red
  for want of the label and the first green run is on `d518e69`); (b) `ready_for_review` → merge, which needs the
  events API (`gh api`, a human-only command here). Recommended: (a), bias stated in the row.
- **Plan deviations no hook caught**: a merged card PR's file outside `check-plan-scope.sh`'s paperwork set and not in
  `plan-files.sh <card> <head>`; no approval → `n/a`; 0 of 19 (B1.2–B1.21). **Lead's call (Z)**: since #60 the same
  rule runs in the required `guards` job, so from B1.18 on it is 0 by construction and counts only bypasses (`hotfix`
  label skips `guards`, or a ruleset bypass). Recommended: keep it as that bypass counter, stated in the row.
- **Batch review** (`git-workflow.md`): the lead takes plans and ready PRs in batches (e.g. late morning, late
  afternoon). Costs stated there: a card waiting at the plan gate is Doing, so 3 waiting plans fill WIP 3 and
  `next-task.sh` refuses new picks until the batch drains; a ready PR is Review and frees its slot; merging k ready PRs
  costs k − 1 serial CI cycles (≈ 4 min each, strict up-to-date ruleset); after each merge every other ready PR goes
  BEHIND: its session (stopped, waiting) is woken by the orchestrating session or the lead, runs `gh pr ready --undo`
  (back to Doing, above the WIP cap until it is ready again), merges `origin/main`, waits for green, readies. The lead
  merges in any order. Plan > 40 lines: the lead accepts or trims.

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
scripts/metrics/throughput.sh B1.1 … B1.15 | tail -1   # (X) literal 5.11, min-start 4.85
scripts/metrics/wait-time.sh | tail -1   # gate median 1 min (19); PR median 1 min (20), upper bound 22 min
scripts/metrics/plan-deviations.sh | tail -1   # uncaught plan deviations 0/19
bash -n scripts/*.sh scripts/metrics/*.sh && scripts/ci/check-plan-scope.sh && scripts/ci/check-backlog.sh
```

Steps: `test(scripts)` → `feat(scripts)` → `reviewer` diff → draft PR at the gate, ready at Loop 9 (B1.21),
`config-change-approved` (D-19: `.claude/docs`).

Plan review: changes requested, round 2 (cap); round-1 and round-2 reasons applied above, not re-reviewed · Plan approved by: <empty until the lead approves> ·
Rounds: 1
