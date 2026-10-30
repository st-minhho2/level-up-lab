# B1.16 plan — Baseline for parallel delivery: lead time and change failure rate per card (tooling, Tier quick)

Approach: two read-only scripts over `git` + `gh` (no new dependency), proven by a smoke on a throwaway repo with a
`gh` shim; spec-analyst/advisor skipped (no section, Tier quick). Prototype run on `main` b27a880 [prototype, re-run
at green]: approval → merge median **35.5 min** over 14 cards (B1.2–B1.15; B1.1 n/a, approved in session with no
commit); change failure rate **1/15 = 6.7 %** (#50 B1.14 shares `scripts/worktree-prune.sh` with #46 B1.13, 0 days).

- **Card → feature PR:** the `(#N)` on the card's `**Status: Done**` line in `backlog/plan/E*.md`.
- **Approval time:** on `refs/pull/N/head` (fetched), author date of the first commit whose subject starts
  `docs(backlog): <card> plan approved`, and of the first commit adding a `Lead approves spec (… <card>)` line;
  the later of the two. Neither → `n/a`, excluded from the median, listed by id.
- **Merge time:** `gh pr view N --json mergedAt`. Minutes = merge − approval, whole minutes.
- **Change failure:** a merged PR titled `fix`/`revert` (`^(fix|revert)(\(|:|!)` or `^Revert "`), not a card's own
  feature PR, merged ≤ 14 days [estimate] after card C's feature PR, sharing a changed file with it outside `*.md`,
  `backlog/`, `docs/`, `spec/`. Rate = cards with ≥ 1 such PR ÷ cards. Mechanical upper bound; a false positive is
  noted in the metrics row, never edited out of the script output.

## Files

| File                                      | Change                                                               | Why          |
| ----------------------------------------- | -------------------------------------------------------------------- | ------------ |
| `scripts/metrics/lead-time.sh`            | new                                                                  | Acceptance 1 |
| `scripts/metrics/change-failure-rate.sh`  | new                                                                  | Acceptance 2 |
| `scripts/metrics-smoke.sh`                | new: throwaway repo + bare origin with `refs/pull/N/head`, `gh` shim | Test         |
| `scripts/CLAUDE.md`                       | rows for the three scripts                                           | contract     |
| `docs/metrics.md`                         | two top-table rows (Parallel delivery: lead time, change failure)    | Acceptance 3 |
| `backlog/work/B1.16/plan.md`, `review.md` | plan, plan review, diff review                                       | —            |

## Interfaces touched

```bash
scripts/metrics/lead-time.sh [<card>…]            # default: every Done card with a (#N); TSV: card pr approved_at sha merged_at minutes
                                                  # last line: "median <m> min over <n> cards; n/a: <ids>"
scripts/metrics/change-failure-rate.sh [--days 14] [<card>…]   # TSV: card pr merged_at repaired_by
                                                  # last line: "change failure rate <k>/<n> = <p> %"
scripts/metrics-smoke.sh                          # M1–M8, exit 1 on any FAIL; no network, no gh auth
```

Smoke probes (fixture times fixed): M1 plan-approved only → minutes exact; M2 tick later than plan-approved → tick
wins; M3 no approval → `n/a`, excluded; M4 median of an even count; M5 fix PR sharing a script within 14 days →
counted; M6 same after 15 days → not; M7 fix PR sharing only `*.md`/`backlog/` → not; M8 `feat` PR sharing a file →
not. The shim answers only the exact `gh pr view|list` calls the scripts make; any other call exits 99 and FAILs.

## Verification (in the card worktree)

```bash
scripts/metrics-smoke.sh            # at the test commit: exit 1, "lead-time.sh: not found" (red on a missing script, as B1.15 (b))
scripts/metrics-smoke.sh            # at green: 8 of 8 ok, exit 0
scripts/metrics/lead-time.sh        # 15 rows, "median 35.5 min over 14 cards; n/a: B1.1" (± the prototype)
scripts/metrics/change-failure-rate.sh   # "change failure rate 1/15 = 6.7 %"
bash -n scripts/*.sh scripts/metrics/*.sh && scripts/hook-smoke.sh && scripts/ci/check-backlog.sh
```

Steps: 1 `test(scripts): B1.16 metrics smoke` → 2 `feat(scripts): B1.16 lead time and change failure rate` →
3 `docs(metrics): B1.16 parallel delivery baseline` → 4 `reviewer` diff → 5 PR. Deviation as B1.12–B1.15: the
orchestrating session edits `scripts/` under this approval; no `(red)` marker (verify-red judges vitest only).

Risk for the lead: the goal's −30 % target on this metric is ≤ 24.8 min. Today's 35.5 min is one interactive card at a
time with merges minutes after approval; batched lead review adds queue time per card, so per-card approval → merge
may rise while throughput rises. The later "session wait time for the lead" row will show it; the target is the lead's call.

Plan review: <pending> · Plan approved by: <empty until the lead approves> · Rounds: 1
