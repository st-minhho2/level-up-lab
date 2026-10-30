# B1.16 plan — Baseline for parallel delivery: lead time and change failure rate per card (tooling, Tier quick)

Approach: two read-only scripts over `git` + `gh` (no new dependency), proven by a smoke on a throwaway repo with a
`gh` shim; spec-analyst/advisor skipped (no section, Tier quick). Prototype of the rules below on `main` 58cee7c:
median **35 min** over 14 cards (B1.1 n/a); change failure rate **1/15 = 6.7 %** (#50 repairs B1.13).

- **Card → feature PR:** the `(#N)` on the card's `**Status: Done**` line in `backlog/plan/E*.md`.
- **Approval** (on `refs/pull/N/head`, fetched; `git log --first-parent --no-merges`, author date `%at`): the
  latest commit whose subject matches `^docs\(backlog\): <card> plan (round [0-9]+ )?approved`, and the oldest
  commit adding a `Lead approves spec (… <card>)` line; the later of the two. Neither → `n/a`, out of the median.
- **Merge:** `gh pr view N --json mergedAt --jq '.mergedAt | fromdateiso8601'` (epoch, no `date` flavour).
  Minutes = ⌊(merge − approval) / 60⌋; hours = minutes / 60, one decimal; even-count median = ⌊mean of the two
  middle minute values⌋.
- **Repair PR:** from `gh pr list --state merged --limit 1000 --json number,title,mergedAt,files --jq '.[] |
[.number, (.mergedAt | fromdateiso8601), .title, ([.files[].path] | join(" "))] | @tsv'`, a PR titled
  `^(fix|revert)(\(|:|!)` or `^Revert "`, other than card C's own feature PR (another card's feature PR may count),
  merged in (C's merge, C's merge + 14 days] [estimate], sharing a changed file with C's PR outside `*.md`,
  `backlog/`, `docs/`, `spec/`. Rate = distinct repair PRs ÷ cards (card's wording). Upper bound; a false positive
  is noted in the metrics row, never edited out of the output.

Deviations from the card's Acceptance (stated): approval by commit subject, not the `Plan approved by` line (B1.3's
line was renamed later, B1.15's wraps); the latest plan-approved commit (B1.5 round 2: 45 min, not 54); spec ticks
merged in from `main` ignored (B1.2 stays 58 min; counting #4's squash `6cb96a3` would give 7 and a median of 34).

## Files

| File                                      | Change                                                                 | Why          |
| ----------------------------------------- | ---------------------------------------------------------------------- | ------------ |
| `scripts/metrics/lead-time.sh`            | new                                                                    | Acceptance 1 |
| `scripts/metrics/change-failure-rate.sh`  | new                                                                    | Acceptance 2 |
| `scripts/metrics-smoke.sh`                | new: throwaway repo, bare origin with `refs/pull/N/head`, `gh` shim    | Test         |
| `scripts/CLAUDE.md`                       | rows for the three scripts                                             | contract     |
| `docs/metrics.md`                         | two top-table rows (Parallel delivery: lead time, change failure rate) | Acceptance 3 |
| `backlog/work/B1.16/plan.md`, `review.md` | plan, plan review, diff review                                         | —            |

## Interfaces touched

```bash
scripts/metrics/lead-time.sh [<card>…]   # TSV: card pr approval_sha minutes hours; last: "median <m> min (<h> h) over <n> cards; n/a: <ids>"
scripts/metrics/change-failure-rate.sh [--days 14] [<card>…]   # TSV: card pr repaired_by; last: "change failure rate <k>/<n> = <p> %"
scripts/metrics-smoke.sh                 # M1–M10, exit 1 on any FAIL; no network, no gh auth
```

Probes: M1 plan-approved only → exact minutes; M2 tick later → tick wins; M3 two plan-approved rounds → latest wins;
M4 a tick merged in from main → ignored; M5 none → `n/a`, out of an even-count median; M6 fix PR sharing a script
in 14 days → counted; M7 after 15 days → not; M8 sharing only `*.md`/`backlog/` → not; M9 a card's own `fix` PR →
not its own repair; M10 fix merged before the card → not. The shim answers only the exact calls above; any other
exits 99 and FAILs (a dropped `--limit 1000` fails M6).

## Verification (in the card worktree)

```bash
scripts/metrics-smoke.sh                 # test commit: exit 1, "lead-time.sh: not found" (red on a missing script, as B1.15 (b))
scripts/metrics-smoke.sh                 # green: 10 of 10 ok, exit 0
scripts/metrics/lead-time.sh             # 15 rows; "median 35 min (0.6 h) over 14 cards; n/a: B1.1"
scripts/metrics/change-failure-rate.sh   # B1.13 repaired_by #50; "change failure rate 1/15 = 6.7 %"
bash -n scripts/*.sh scripts/metrics/*.sh && scripts/hook-smoke.sh && scripts/ci/check-backlog.sh
```

Steps: `test(scripts): B1.16 metrics smoke` → `feat(scripts): B1.16 lead time and change failure rate` →
`docs(metrics): B1.16 parallel delivery baseline` → `reviewer` diff → PR. As B1.12–B1.15, the orchestrating
session edits `scripts/` under this approval; no `(red)` marker (verify-red judges vitest only).

Risk for the lead: −30 % of 35 min is ≤ 24.5 min. Today one card runs at a time and merges minutes after approval;
batched review adds queue time per card, so this metric may rise while throughput rises. The target is the lead's call.

Plan review: changes requested, round 2 (cap); round-2 reasons 1–2 and the median rounding applied above, not
re-reviewed · Plan approved by: <empty until the lead approves> · Rounds: 1
