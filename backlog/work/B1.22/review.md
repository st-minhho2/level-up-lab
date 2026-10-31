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

## Plan review (round 2)

Plan at b369451 (64 lines). Everything below was re-derived read-only from `refs/remotes/pr/N` (B1.1–B1.21, 20 PRs),
`gh pr view` (mergedAt, createdAt, headRefOid, files), `gh run list --commit <sha> --workflow ci` on every first-parent
commit from the PR head down to the last own commit, `scripts/ci/plan-files.sh <card> refs/remotes/pr/N`, and the PR
timeline of #63. Today `scripts/metrics-smoke.sh` prints `[metrics-smoke] 11 ok, 0 FAIL`.

| Plan claims (revised definitions)                  | Re-derived                                                                                                                                                                                                                                     |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| throughput B1.1–B1.15 ≈ 4.85, target ≥ 6.3         | confirmed: 15 cards / 24.73 h → **4.852** (10-28 1.77 h, start = merge; 10-29 15.11 h, start = approval; 10-30 7.86 h, start = merge). 1.3 × 4.852 = **6.31**. D-18 literal start: 23.49 h → 5.108, target 6.64                                |
| throughput B1.1–B1.21 ≈ 5.23                       | confirmed: 20 cards / 30.61 h → **5.228** (10-30 11.34 h, 10-31 2.39 h, both starting at a merge). Literal: 28.80 h → 5.555                                                                                                                    |
| gate wait summed over rounds, B1.5 → 5, B1.21 → 13 | confirmed: B1.5 = 5 + 0 (`ef73bec`, `9efec0b`), B1.21 = 7 + 6 (`9f87c9a`, `d0ac6aa`). Values 0,0,0,1,1,1,1,1,1,1,2,3,5,5,6,13,16,20,82 → **median 1 min (19)**, B1.1 n/a. Floor per round and floor of the sum give the same values            |
| PR wait anchored on the last own commit            | per card: B1.1 128, B1.2 0, B1.3 13, B1.4 1, B1.5 0, B1.6 0, B1.7 20, B1.8 1, B1.9 1, B1.10 0, B1.11 372, B1.12 14, B1.13 42, B1.14 22, B1.15 2, B1.16 0, B1.17 1, **B1.18 0**, B1.19 0, B1.21 8 → **median 1 min (20)**, 7 zeros (round 1: 9) |
| deviations 0 of 19                                 | confirmed: `uncaught plan deviations 0/19` with `check-plan-scope.sh`'s set (`backlog/* spec/* docs/metrics.md docs/mistake-log.md`) and its glob match; B1.1 n/a (plan-files exit 3)                                                          |

Round 1, reason by reason: 1 partly resolved (merges of `main` no longer reset the anchor: B1.3 0 → 13, B1.7 0 → 20;
the `chore(ci)` case is not, reason 1 below). 2 partly resolved (min start, "any card", round-1 approval; wording and
the D-18 departure, reason 2). 3 resolved. 4 resolved (the "changes reply with no approval commit" limit is no longer
stated; not blocking). 5 partly resolved (reason 3). 6 resolved, with a new cost (reason 4). 7 resolved (11 one-line
groups today + 7 one-line probes = 18). 8 resolved by dropping `lib.sh`. `plan-deviations.sh` must still resolve
`scripts/ci/plan-files.sh` from its own directory before the `cd` (B1.18's pass-1 fix); M19 runs in a fixture repo
that has no `scripts/`, so it would catch this. 9 stated ("the lead accepts or trims"); 64 lines.

| Check                                                                             | Result                                                                                                                         |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| every file in the plan belongs to the section's features (map)                    | pass: tooling card, no §; the Files are the card's Acceptance plus plan/review; `lib.sh` dropped                               |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass (n/a): nothing under `src/` or `prisma/`                                                                                  |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: advisor skipped (no section), stated                                                                                     |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: 5 acceptance clauses; M14–M20 each name an observable outcome                                                            |
| verification lists exact commands with expected numbers                           | fail: `wait-time.sh \| tail -1` has no expected value (reason 5)                                                               |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: B1.16 precedent, `test(scripts)` red (scripts missing) → `feat(scripts)` → reviewer; no § so no map row                  |
| the section has a `Lead approves spec` box, ticked only by a human                | pass (n/a): no section, nothing ticked                                                                                         |
| no settled D-n contradicted                                                       | fail: the span start departs from D-18's text and the plan does not say so (reason 2). D-19 handled (label for `.claude/docs`) |

Verdict: changes requested

1. **B1.18 still reads 0, and "a label re-run does not reset it" is false whenever the own commit's run is not green.**
   The anchor is the first green run on the last own commit or later, so a `chore(ci)` commit is excluded as an own
   commit but its run is still a candidate anchor. B1.18 #63: its last own commit `fd6dc5a` was pushed at
   10-30T11:38Z (PR created 11:38Z). Its only completed run failed, because it ran on the unlabeled payload. The lead
   added `config-change-approved` at 10-31T02:54:44Z (timeline), and the first green run is the one on `d518e69`
   (`chore(ci)`), at 03:17:05Z. Merge was at 03:17:51Z, so the script reads **0**. The real wait is ≥ 916 min to the
   lead's first action and 939 min to merge. The same pattern gives B1.19 0: both runs on `52a0af2` were cancelled
   and the green run is on `chore(ci)` `cc8d244`, while created → merge is 15 min. It gives B1.17 1 min: the run on
   `524143f` failed at 10:01Z and the green labeled run came at 10:21Z. Also, `updatedAt` is the last attempt:
   `fd6dc5a`'s run was created on 10-30 and reads 10-31T03:07Z after a manual Re-run, so a Re-run of a green run moves
   the anchor later. D-19 plus B1.21 (label added on the draft at the gate) make this case rare from now on. But the
   baseline holds three such PRs, and the plan claims the opposite. Fix (lead picks one): (a) state the bias in the
   plan and the metrics row. A PR whose own commit's run is red or cancelled until the lead acts (label) reads only
   the time after that action. Name B1.17, B1.18 and B1.19, and also print created → merge (median 22 min) as the upper
   bound. (b) Anchor on the PR's first `ready_for_review` timeline event, or `createdAt` for a PR that was never a
   draft. This gives B1.18 939 min, but it overstates older PRs that were pushed to after opening (B1.12: 97 vs 14).
2. **Throughput: the formula text and the D-18 departure.** (i) "per calendar day … ÷ span × 8, summed over days" is
   Σ of daily ratios. For B1.1–B1.15 with min start, that is 9.04 + 4.24 + 5.09 = **18.4**, not 4.85. D-18 and the
   plan's own output line are Σ cards ÷ Σ spans × 8. Reword it, or a code-writer can implement the wrong formula and
   M14 written from the same text will agree. (ii) Starting the span at min(first approval, first merge) departs from
   D-18 ("from the first plan-approval commit"). The only departure the plan names is the day-before one, which is
   D-18 literal. Name it as a departure with both baselines: literal 5.11 → target 6.64, min 4.85 → target 6.31. Then
   the lead's approval is the ruling, recorded as a D-18 amendment in `00-decisions.md` (paperwork). (iii) Write the
   target as ≥ 6.31, not 6.3, and name how the UTC+7 day is computed in bash 3.2 (integer `(t + 25200) / 86400`; no
   `strftime`, and `date -r` / `date -d` differ).
3. **Batch review still omits what a batch costs the lead and the board.** The plan's statements are correct against
   the code. A local branch with no PR, or a draft, is Doing (`next-task.sh:6`, `state_of`). An open non-draft PR is
   Review. The ruleset is strict (`.github/rulesets/main.json:36`). The median green PR run is 4.1 min (40 runs:
   3.0–5.1), so "k − 1 cycles ≈ 4 min" holds. Round 1 also asked for what the lead does, and that is still missing.
   After `gh pr ready`, each session stopped (`dev-lead.md:80-82`). So each of the k − 1 BEHIND siblings needs the
   lead to wake its session, one at a time, in merge order. Each `gh pr ready --undo` turns that card back into
   Doing. `--undo` is not WIP-gated, so if the slots the Review PRs freed were taken meanwhile, Doing reaches
   3 + (k − 1) and `next-task.sh` exits 1 for every pick until the batch drains. Add: the merge order (e.g. smallest
   or oldest first), who wakes the sessions, and this WIP overshoot. The lead could also choose GitHub's "Update
   branch" for clean merges. That needs no session, but it skips dev-lead step 9's `mark-reviewed.sh` re-run, so it is
   the lead's call to state, not mine.
4. **After B1.17's guard, the deviation count can only detect bypasses, and the metrics row must say so.**
   `check-plan-scope.sh` runs in the required `guards` job (`ci.yml:140`, ruleset `guards`). The metric uses the same
   rule (round 1 asked for that), so any PR merged after #60 (2026-10-30 17:22 +07) can count only if `guards` was
   skipped (the `hotfix` label, `ci.yml:116`) or the ruleset was bypassed. The D-18 guardrail "= 0" is then true by
   construction for B1.18 onward, and only B1.2–B1.17 (16 PRs) were measured without the guard. State this in the
   plan and the row ("counts hotfix-lane and bypassed merges; pre-#60 PRs are the only independent sample"), or ask
   the lead for a definition the guard cannot already enforce.
5. **The verification gives no expected value for wait time.** Add `median plan-gate wait 1 min (19), median PR wait
1 min (20)` (or the values under the anchor chosen in reason 1), and the B1.18 value the lead should expect.

Not blocking: B1.7 and B1.10 read gate 0 because a decision commit (D-13, D-16) landed 2 s before approval. The plan's
stated bias covers this.

This is round 2, the cap (`dev-lead.md` ≤ 2 rounds), so the plan now goes to the lead as **Waiting on human**, with
these reasons attached. Choices for the lead: reason 1 (a or b), reason 2 (ii) (accept the min start as a D-18
amendment or keep literal), reason 4 (accept as a bypass counter or redefine), and the 64-line length.
