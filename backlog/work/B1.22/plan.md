# B1.22 plan — Batch review and the parallel-lane metrics: throughput, lead wait time, uncaught plan deviations (tooling)

Approach: three read-only scripts beside B1.16's, one shared helper, smoke probes on the B1.16 fixture, one doc
section. spec-analyst/advisor skipped (no section). Prototype on `main` 9c663dd (B1.1–B1.21, B1.20 open): throughput
**5.55 cards / 8 h** (20 cards, 28.8 h over 4 days); median plan-gate wait **1 min** (19 cards), median PR wait **1
min** (20); uncaught deviations **0** (B1.13–B1.21; older plans have no parseable Files table → n/a).

- **Shared** (`scripts/metrics/lib.sh`, sourced): `cards` (card → PR from Done status lines) and `approval <card>
<rev>` (epoch + sha, B1.16's rule) — `lead-time.sh` sources it instead of its own copy (no behavior change).
- **Throughput** (D-18): per calendar day in UTC+7, the cards whose feature PR merged that day ÷ that day's active
  span (first approval commit that day among those cards, else the day's first merge, → last merge) × 8, summed over
  days. Limit, stated: a card approved the day before adds no span.
- **Wait time** (B1.21 (b)): plan gate = approval commit − its first parent (minutes); PR = merge − completion of the
  last green `ci` run on the PR head (proxy: `gh` gives no ready-for-review time without `gh api`). Medians.
- **Plan deviations no hook caught**: a merged card PR's non-paperwork file outside `plan-files.sh <card> <head>`;
  plan without approval/Files → `n/a`. Rate = cards with ≥ 1 ÷ measured cards.
- **Batch review** (`git-workflow.md`): the lead reviews plans and ready PRs in batches (e.g. late morning and late
  afternoon); sessions wait at their fixed lines; WIP counts Doing only, so waiting cards do not block new ones.

## Files

| File                                 | Change                                                               |
| ------------------------------------ | -------------------------------------------------------------------- |
| `scripts/metrics/lib.sh`             | new: `cards`, `approval`                                             |
| `scripts/metrics/lead-time.sh`       | sources lib.sh (same output)                                         |
| `scripts/metrics/throughput.sh`      | new                                                                  |
| `scripts/metrics/wait-time.sh`       | new                                                                  |
| `scripts/metrics/plan-deviations.sh` | new                                                                  |
| `scripts/metrics-smoke.sh`           | probes M14–M20, fixture plans gain a Files table, shim gains 3 calls |
| `docs/metrics.md`                    | three top-table rows (Parallel delivery)                             |
| `.claude/docs/git-workflow.md`       | "Batch review" section                                               |
| `scripts/CLAUDE.md`                  | rows for the three scripts                                           |
| `backlog/work/B1.22/plan.md`         | plan                                                                 |
| `backlog/work/B1.22/review.md`       | reviews                                                              |

## Interfaces touched

```bash
scripts/metrics/throughput.sh [<card>…]       # TSV day cards hours; last: "throughput <x> cards per 8 h (<n> cards, <h> h, <d> days)"
scripts/metrics/wait-time.sh [<card>…]        # TSV card pr gate_min pr_min; last: "median plan-gate wait <a> min (<n>), median PR wait <b> min (<m>)"
scripts/metrics/plan-deviations.sh [<card>…]  # TSV card pr outside|n/a; last: "uncaught plan deviations <k>/<n>"
gh pr view N --json headRefOid --jq .headRefOid ; gh pr view N --json files --jq '.files[].path'
gh run list --commit <sha> --workflow ci --json conclusion,updatedAt --jq '[.[] | select(.conclusion == "success") | .updatedAt | fromdateiso8601] | max // empty'
```

Probes (fixture B9.1–B9.5, one day): M14 throughput line exact; M15 a card approved the day before adds no span; M16
B9.1 gate wait = whole minutes to its parent; M17 PR wait to the last green run, a failed later run ignored; M18 no
green run → `n/a`, out of the median; M19 a file outside B9.1's plan → counted, a listed one and paperwork → not; M20
no Files table → `n/a`. M1–M13 unchanged (lead-time through lib.sh).

## Verification (in the card worktree)

```bash
scripts/metrics-smoke.sh   # test commit: M14–M20 FAIL (scripts missing), M1–M13 ok; green 20 of 20
scripts/metrics/throughput.sh | tail -1; scripts/metrics/wait-time.sh | tail -1; scripts/metrics/plan-deviations.sh | tail -1
                           # ≈ the prototype above (± cards merged since)
bash -n scripts/*.sh scripts/metrics/*.sh && scripts/ci/check-plan-scope.sh && scripts/ci/check-backlog.sh
```

Steps: `test(scripts)` → `feat(scripts)` → `reviewer` diff → draft PR at the gate, ready at Loop 9 (B1.21),
`config-change-approved` (D-19: `.claude/docs`).

Plan review: <pending> · Plan approved by: <empty until the lead approves> · Rounds: 1
