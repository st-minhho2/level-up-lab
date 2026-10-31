# B1.22 review

## Plan review (round 1)

Plan at 2c8c032. Everything below was re-derived read-only. I fetched the PR heads of B1.1–B1.21 (`refs/remotes/pr/N`),
then ran `gh pr view` (mergedAt, headRefOid, createdAt, files) and `gh run list --commit <head> --workflow ci` on each,
and ran `scripts/ci/plan-files.sh <card> refs/remotes/pr/N`. Today `scripts/metrics-smoke.sh` prints
`[metrics-smoke] 11 ok, 0 FAIL`.

Prototype numbers, re-derived:

| Plan claims                                                  | Re-derived                                                                                                                                                         |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| throughput 5.55 / 8 h (20 cards, 28.8 h, 4 days), B1.1–B1.21 | confirmed 20 / 28.80 h → 5.55. Day spans (UTC+7): 10-28 0.97 h, 10-29 15.11 h, 10-30 10.89 h, 10-31 1.83 h                                                         |
| median plan-gate wait 1 min (19)                             | confirmed: values 0,0,0,0,1,1,1,1,1,1,1,2,3,5,6,6,16,20,82; B1.1 n/a                                                                                               |
| median PR wait 1 min (20)                                    | confirmed as computed, but 9 of the 20 values are 0 for an artefact (reason 1). Median created → merge over the same 20 PRs is 22 min                              |
| 0 deviations B1.13–B1.21, older n/a                          | the count is right (0) but the window is wrong: `plan-files.sh` exits 0 for B1.2–B1.12 too, so the script as specified prints `0/19` with only B1.1 n/a (reason 6) |

| Check                                                                             | Result                                                                                                                                                                              |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: a tooling card with no §. The Files are the ones the card's Acceptance names. `lib.sh` is an addition the plan explains (reason 8 covers its scope)                           |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass (n/a): nothing under `src/` or `prisma/` changes                                                                                                                               |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: the plan says the advisor was skipped (no section)                                                                                                                            |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: the card has 5 acceptance clauses, and probes M14–M20 each have an observable outcome                                                                                         |
| verification lists exact commands with expected numbers                           | fail: the smoke counts cannot happen (reason 7), and the deviation prototype does not match what the script prints (reason 6)                                                       |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: the tooling precedent is B1.16 (smoke red because the scripts are missing, 0 of 10 ok) → feat → reviewer. No § means no map row                                               |
| the section has a `Lead approves spec` box, ticked only by a human                | pass (n/a): there is no section and nothing is ticked                                                                                                                               |
| no settled D-n contradicted                                                       | fail: D-18 fixes the baseline window at B1.1–B1.15 and the span start at "the first plan-approval commit" of the day (reasons 2, 3). D-19 is handled (the label for `.claude/docs`) |

Verdict: changes requested

1. **The PR-wait proxy hides the wait whenever the head moves after the session reports ready, and batch review makes
   that the normal case.** The proxy is merge − completion of the last green `ci` run on the merged head. In 9 of the 20
   cards that head was not the head the session reported ready on. It was a merge of `main` (B1.2, B1.3, B1.7, B1.9,
   B1.10, B1.16, and B1.1's "merge main") or a `chore(ci): … rerun CI with the config-change-approved label` commit
   (B1.18, B1.19). For example, B1.18 #63 was opened 2026-10-30T11:38Z and merged 2026-10-31T03:17:51Z (939 min, overnight).
   Its last green run is the rerun at 03:17:05Z, so the proxy reads **0 min**. The ruleset is strict
   (`.github/rulesets/main.json:36`, "`strict_required_status_checks_policy": true`). So in a batch, every PR after the first
   one merged goes BEHIND, and dev-lead then runs `gh pr ready --undo`, merges `origin/main` and waits for a new green
   run (`dev-lead.md:81`). The new green run resets the anchor, so the wait the batch added is not counted. That wait is the one
   the step means to observe. The B1.21 draft flow does not change this, because the anchor is still the last head. Fix
   (lead picks one): (a) anchor on the earliest green `ci` run on the PR's branch whose head has the merged head's latest
   first-parent non-merge, non-`chore(ci)` commit as its newest own commit. This uses
   `gh run list --branch <headRefName> --workflow ci --json headSha,conclusion,updatedAt`, so merges of `main` and reruns
   do not move the anchor. Add one probe per case. (b) Keep the proxy, but state the bias in the metrics row, and also print
   created → merge as the upper bound (22 min median today).
2. **The throughput span starts after merges it counts on 3 of 4 days, and batch review will widen that gap.** "First
   approval commit that day among those cards → last merge" leaves out merges that happen before the day's first
   approval: B1.1 at 10-28 19:20 (span starts 20:08), B1.11 at 10-30 06:02 (starts 06:29), and B1.18 at 10-31 10:17
   (starts 10:51). With start = min(first approval, first merge) the baseline is 30.61 h → **5.23**, not 5.55. A morning
   batch that merges yesterday's PRs before approving any plan shortens every span, so the change this card introduces
   makes throughput look better than it is. Two more departures from D-18 ("from the first plan-approval commit … of that
   calendar day") are unstated: the rule restricts to cards merged that day, and through `approval` it uses B1.16's
   _latest_ approval, not the first. Neither changes B1.1–B1.21 (I checked), but both diverge under parallel lanes.
   "Summed over days" reads as Σ of daily ratios, but the 5.55 is Σ cards ÷ Σ spans × 8, so reword it. Fix: either keep
   D-18 literally and write the merge-before-start cost into the plan and the metrics row, or use min(…) as a named
   deviation for the lead to rule on. Also name how the UTC+7 day is computed. macOS awk has no `strftime`, and `date -r`
   and `date -d` differ.
3. **The baseline window contradicts D-18.** D-18: "target ≥ 1.3 × the B1.1–B1.15 baseline". The plan reports only
   B1.1–B1.21, which is what the card says. Re-derived for B1.1–B1.15: 15 cards / 23.49 h = **5.11** (target 6.64), or
   4.85 with the min start (target 6.31). The metrics row needs the D-18 window as the baseline the target is measured
   against. B1.1–B1.21 can be an extra column.
4. **The gate wait keeps only the last approval round.** `approval` (B1.16's later-of rule) returns one commit per card.
   B1.5's first gate (`ef73bec` − `fe3f6b4`, 5 min) is dropped and the card reads 0. B1.21's first gate (`9f87c9a` −
   `fde48ec`, 7 min) is dropped and the card reads 6, although B1.21's round 2 was a second real wait on the lead. Fix:
   measure every `<card> plan [round N ]approved` commit − its first parent and sum them per card (median stays 1;
   B1.5 → 5, B1.21 → 13). This also means `lib.sh` should export the list of approval commits, not B1.16's winner.
   Keep B1.21's known limit stated: a "changes" reply with no approval commit is not measured.
5. **The batch-review section claims "waiting cards do not block new ones", which is false at the plan gate and
   incomplete at the PR gate.** `next-task.sh:6` counts a branch with no PR or with a draft PR as Doing. B1.21 opens the draft
   only after `approve`, so a card waiting at the plan gate is Doing. Three plans waiting for the next batch fill WIP 3,
   and nothing new can start until the batch. At the PR gate, merging one ready PR makes every sibling BEHIND
   (strict ruleset). Each sibling's ended session must then be woken to run `--undo`, merge and wait ≈ 4 min for CI before
   the lead can merge it, so a batch of k PRs takes k − 1 serial CI cycles. The section must state both costs and what
   the lead does in a batch (merge order, waking sessions).
6. **The deviation prototype is wrong about the older plans.** `plan-files.sh` exits 0 with the Files for all of
   B1.2–B1.12. For example, B1.8 gives `src/lib/logger.ts`, `src/lib/logger.test.ts`, and its PR's non-paperwork files are
   exactly those. Only B1.1 exits 3. The script as specified therefore prints `uncaught plan deviations 0/19`. Fix the
   line, or state an intended window. Also define "paperwork" as `check-plan-scope.sh`'s set (`backlog/*`, `spec/*`,
   `docs/metrics.md`, `docs/mistake-log.md`), preferably the same code, so that the metric and the CI guard cannot diverge.
7. **The smoke expectations cannot happen.** The smoke prints one line per group (`M7 M10`, `M8 M12`, `M13 rate`), so
   M1–M13 is **11** ok lines today, not 13. "Green 20 of 20" is impossible with seven new probes. State the exact red and
   green summary lines, e.g. red `[metrics-smoke] 11 ok, 7 FAIL` and green `[metrics-smoke] 18 ok, 0 FAIL`, adjusted
   to the grouping chosen.
8. **The `lib.sh` refactor is half done, and its sourcing has a trap.** `change-failure-rate.sh:17-23` keeps its own copy
   of `cards`/`want` ("as lead-time.sh"). After this card there is still a second definition. Either move cfr onto
   `lib.sh` too (M6–M13 cover it) or skip `lib.sh` and copy, as B1.16 did. Whichever is chosen, `lib.sh` and
   `scripts/ci/plan-files.sh` must be found from the script's own directory before
   `cd "$(git rev-parse --show-toplevel)"`: in the smoke, the toplevel is the fixture repo, which has no `scripts/`.
   The refactor is worth doing only if it exports what reasons 2 and 4 need (all approval commits), not just B1.16's
   winner.
9. **The plan is 63 lines against ≈ 40** (`planning.md`: split). The lead can accept the length (the B1.21
   precedent), trim it, or split the card into batch review + throughput and wait time + deviations.

Not blocking: the ignored later failed run (M17), runs with no green result (M18) and B1.1's missing approval (n/a) are
covered. D-19 labelling is stated. `gh pr view --json files` returns at most 100 files, which is enough for cards of this
size.

Waiting on the lead after the dev-lead revision: the choices in reasons 1 (a or b), 2 (literal D-18 or min, as a
deviation) and 9.
