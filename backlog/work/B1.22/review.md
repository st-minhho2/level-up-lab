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

## Diff review (pass 1)

HEAD 67215eb (test 9a33e93, feat 67215eb). Scope: tooling (`scripts/`, `.claude/docs`, `docs/metrics.md`); no `src/`.

### Commands (last line each, run by the reviewer)

| Command                                                              | Result                                                                                                                                                                       |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                                                          | `All matched files use Prettier code style!`                                                                                                                                 |
| `pnpm typecheck`                                                     | `tsc --noEmit` exit 0                                                                                                                                                        |
| `pnpm test`                                                          | `Tests 115 passed (115)`                                                                                                                                                     |
| `pnpm test:e2e`                                                      | `13 passed (18.8s)`                                                                                                                                                          |
| `pnpm test:mutation`                                                 | `Final mutation score of 89.02 is greater than or equal to break threshold 70`                                                                                               |
| `scripts/metrics-smoke.sh` (bash 5 and `/bin/bash` 3.2.57)           | `[metrics-smoke] 18 ok, 0 FAIL` both                                                                                                                                         |
| test commit's smoke on a copy of the 9a33e93 tree                    | `[metrics-smoke] 11 ok, 7 FAIL` (M14–M20, `not found`): red on behavior                                                                                                      |
| `check-suppressions` / `check-feat-commits`                          | OK / OK (feat touches no test)                                                                                                                                               |
| `check-config-change`                                                | local `::error::` on `.claude/docs/git-workflow.md`: the label is on PR #74 (`config-change-approved`, D-19); CI `guards` SUCCESS at 67215eb                                 |
| `check-ac-coverage` / `check-spec-sections` / `check-features-map`   | OK / OK / OK                                                                                                                                                                 |
| `check-plan-scope` / `check-backlog`                                 | OK (inside the approved plan) / OK                                                                                                                                           |
| `scripts/verify-red.sh B1.22`                                        | exit 1, no `(red)` commit. Precedent: B1.16, B1.17, B1.18, B1.21 titled tooling red commits without `(red)` (verify-red runs vitest only); red proven by the smoke run above |
| `git diff 9a33e93..HEAD -- scripts/metrics-smoke.sh '*.test.*' e2e/` | empty                                                                                                                                                                        |

### Checklist

- Criteria (card Acceptance): batch review doc, three scripts, three rows: present; each script has probes (M14–M20).
- Tests not weakened: M1–M13 assertion lines unchanged in 9a33e93. Fixture changes: B9.2 now ends in a merge of main
  and a `chore(ci)` commit, so M2/M11 also pass with a merged-in tick (stronger). B9.5 merges a day later, so M5 still
  reads n/a and #204/#206 keep their offsets. B9.1's plan gains a Files table, and its approval subject is unchanged.
  Not weakened.
- Every changed file in `plan.md` Files: yes (9/9).
- Interfaces: `wait-time.sh` adds a `upper_min` column, ", PR upper bound <c> min (<k>)" and a `gh pr view --json
createdAt` call. It drops `--json headRefOid` (the head is `refs/pull/N/head`, the same commit). The approved
  approach (Y (a), "printed with created → merge as the upper bound") needs these, so this is not blocking. Copy them
  into the PR body's Plan section.
- No `src/`, Prisma, SQL, migration, secret or suppression. Features map: no row (tooling).
- Revert probes (copy under `$TMPDIR`, one mutant at a time, smoke re-run): paperwork set removed → M19 FAIL; no-approval
  counted → M20 FAIL; `chore(ci)` skip removed → M17 FAIL; UTC+7 offset in the day name → M15. Survivors: [2], [3].
- Day bucketing: integer `(t + 25200) / 86400` in awk (portable). `day_name` tries GNU `date -d @N`. On macOS that is
  `illegal option -- d` (stderr hidden), then BSD `date -r N`. Both print the UTC date of the day start, which is the
  UTC+7 calendar day. Verified on macOS. GNU is by reading.
- `set -euo pipefail` paths: an empty selection prints `throughput n/a (0 cards, 0.0 h, 0 days)`, `median … n/a … (0)`
  or `0/0`. A failing `gh` or `git fetch` aborts the run before the summary line, as `lead-time.sh` does. A missing
  `refs/pull/N` is the same abort, and no Done card lacks one. Not blocking.

### Findings

```
[1] KIND: plan-mismatch
    WHERE: scripts/metrics/throughput.sh:26-27,35-36; docs/metrics.md (Throughput row, "How collected")
    DEFECT: the span starts at the earliest round-1 approval among the cards that merged that day, if it falls on
            that day. The approved plan says "the day's first plan-approval commit (any card)", and the row calls the
            narrower rule "D-18 as written".
    TRIGGER: card A plan approved day d 09:00 and merged d+1. Card B approved d 10:00 and merged d 11:00. (Also: card
            C round 1 approved d−1, round 2 approved d 09:00, merged d 12:00.)
    WRONG BEHAVIOUR: day d span = 1 h (plan: 2 h). For C the round-2 approval is ignored, so the day starts at the
            first merge. Throughput is overstated exactly when batch review spreads approval and merge over two days.
            On today's data the gap is 0: the plan's variant also prints 5.1 for B1.1–B1.15, counting approvals of
            unselected cards too, and 5.6 for all cards.
    CONFIDENCE: confirmed (traced the awk; ran the any-card variant from a copy on the real repo)

[2] KIND: coverage
    WHERE: scripts/metrics-smoke.sh M14/M15 (fixture: every approval at T0, same day as its merge)
    DEFECT: nothing pins the lead's choice X or the approval-day rule. Three mutants keep the smoke at 18 ok, 0 FAIL:
            (A) min-start, `s = (d in fa && fa[d] < fm[d]) ? fa[d] : fm[d]`; (B) dropping the same-day test on the
            approval; (C) latest approval round instead of round 1.
    TRIGGER: any of the three one-line edits in throughput.sh's span awk
    WRONG BEHAVIOUR: the baseline the D-18 target is built on can move from 5.11 to 4.85 (min-start, the plan's own
            numbers) and the smoke stays green.
    CONFIDENCE: confirmed (each mutant run on a copy)

[3] KIND: coverage
    WHERE: scripts/metrics-smoke.sh:112-113 (M17); scripts/metrics/wait-time.sh:44
    DEFECT: M17 says "a later merge of main … does not reset" the anchor. B9.2's last own commit (the tick) has no
            run, so the walk never has to pass the merge. Mutant (E) stops at the merge (drops `"$parents" -gt 2 ||`)
            and the smoke stays 18 ok.
    TRIGGER: own commit green at t, merge of main green at t + 30 min, merge at t + 40 min
    WRONG BEHAVIOUR (under the mutant, undetected): the PR wait is 10 min instead of 40 min.
    CONFIDENCE: confirmed (mutant run on a copy)

[4] KIND: spec-mismatch (card Acceptance; the plan's "no approval → n/a" carries it)
    WHERE: scripts/metrics/plan-deviations.sh:25; docs/metrics.md (Plan deviations row: "`check-plan-scope.sh`'s rule")
    DEFECT: a merged card PR with no approval commit is n/a and leaves the denominator. `check-plan-scope.sh` fails
            the same PR: with rc ≠ 0 every non-paperwork file is outside.
    TRIGGER: a card PR merged with the `hotfix` label (guards skipped) that has no `plan approved` commit and changes
            `src/x.ts`, the M20 fixture B9.5 with `src/e.ts`
    WRONG BEHAVIOUR: the metric prints `n/a` and `0/n`, so the bypass counter the lead chose (Z) misses the most
            obvious bypass. The row says it applies check-plan-scope's rule, and it does not. B1.1 (approved in the
            session, before commits) is the only historical n/a, so one possible fix is to count n/a from B1.17 on.
            The lead rules, since the plan stated n/a.
    CONFIDENCE: confirmed (M20 asserts n/a for B9.5 with src/e.ts; check-plan-scope.sh:22-27 traced)

[5] KIND: plan-mismatch
    WHERE: .claude/docs/git-workflow.md, Batch review, first bullet
    DEFECT: "new picks are refused until the batch is approved" is wrong. An approved card stays Doing (draft PR)
            through build until `gh pr ready`. The plan says "until the batch drains".
    TRIGGER: three cards with draft PRs at the plan gate. The lead approves all three, and `scripts/next-task.sh` runs.
    WRONG BEHAVIOUR: `state_of` returns Doing for a draft and `n_doing` = 3 ≥ WIP_LIMIT, so it exits 1 ("finish or hand
            one to Review first"). Approving does not free a slot. Only the first `gh pr ready` does.
    CONFIDENCE: confirmed (next-task.sh:6-9, state_of, pick branch traced)
```

Not findings. The batch costs are accurate: Review frees a slot, the ruleset is strict, `--undo` puts the card above
WIP, and k − 1 serial cycles at ≈ 4 min each match seven sampled green runs (115–247 s). The PR-wait zeros (8 of 20) are
real: on #5, #13, #15, #33, #57, #63 and #67 the merge comes 5–46 s after the green run completes, never before it.

Verdict: back to test-writer. The lead first rules on [1] (implement "any card" plus all rounds, or re-approve the
narrower rule and fix the row's "as written") and on [4] (count no-approval PRs from B1.17 on, or keep n/a and fix the
row's wording). Then test-writer adds probes for [1]/[2]/[3] (a review-pass commit, which must fail on today's code
where [1] changes). Then code-writer fixes [1], [4] as ruled and [5].

Riskiest unfalsified: `plan-deviations.sh` reads the file list from `gh pr view --json files`. I believe it is
capped near 100 files and not paginated, but I have not checked that [unverified]. If so, a larger card PR would
under-count without any error. The largest card PR so far is far below 100, so I could not trigger it.

### Dispositions (dev-lead)

| #   | Disposition                                                                                                                                                     | Evidence                                                                                                       |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| 1   | fix now: the approved plan governs ("the day's first plan-approval commit (any card)"); all rounds count, an approval after the day's last merge starts nothing | probe M21 (21c9dc7) red at 67215eb (13.3 vs 6.7), green at 680d8c0; real repo 5.1 / 5.6 unchanged              |
| 2   | fix now: M21's day 2 merges at 06:00 before its first approval (07:00), day 3's only approval follows its last merge                                            | mutant (A) min-start → M21 5.7; no `<= last` guard → M21 8.0; (B)/(C) have no analogue once every round counts |
| 3   | fix now: probe M22, B9.4's own commit green at T0+400 under its merge of main                                                                                   | M22 33 min; M18 median 31                                                                                      |
| 4   | fix now, lead's ruling (a): from #60 on a PR with no approved plan counts every non-paperwork file; before #60 n/a                                              | probes M20 (2/5) and M23 (2112c9a) red at 680d8c0, green after; real repo 0/19 unchanged                       |
| 5   | fix now: "refused until the batch drains: an approved card stays Doing, a draft PR, until its PR is ready"                                                      | `.claude/docs/git-workflow.md` at 680d8c0                                                                      |

## Diff review (pass 2)

HEAD e2facfa. Delta since pass 1 (67215eb): 21c9dc7 `test` (M21, M22), 680d8c0 `fix` (throughput span, batch doc,
`scripts/CLAUDE.md`), ddc267d (dispositions), 2112c9a `test` (M20 changed, M23), c7e5b62 `fix` (ruling (a)), e2facfa
(disposition 4). Branch diff `origin/main...HEAD`: 9 files, all in `plan.md` Files.

### Commands (last line each, run by the reviewer at e2facfa)

| Command                                                           | Result                                                                                                                       |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint` / `pnpm typecheck` / `pnpm test`                      | `All matched files use Prettier code style!` / `tsc --noEmit` rc 0 / `Tests 115 passed (115)`                                |
| `pnpm test:e2e` / `pnpm test:mutation`                            | `13 passed (14.3s)` / `Final mutation score of 89.02 is greater than or equal to break threshold 70`                         |
| `scripts/metrics-smoke.sh`, `/bin/bash` 3.2.57 (BSD awk, date)    | `[metrics-smoke] 21 ok, 0 FAIL`                                                                                              |
| same, bash 5.2.15 in `node:24-bookworm` (mawk, GNU `date -d`)     | `[metrics-smoke] 21 ok, 0 FAIL` (this host has no bash 5; the container also covers the GNU `date` path pass 1 only read)    |
| smoke at 21c9dc7 (67215eb code + new smoke)                       | `19 ok, 1 FAIL`: `M21 throughput 13.3 … (5 cards, 3.0 h, 2 days)`. M22 passes there: it pins mutant (E), not a bug           |
| smoke at 2112c9a (680d8c0 code + new smoke)                       | `19 ok, 2 FAIL`: `M20 B9.5 105 n/a … 1/4`, `M23 B8.4 304 n/a … 0/0`                                                          |
| fix commits touching `scripts/metrics-smoke.sh`                   | none (680d8c0: 4 files, c7e5b62: 3 files; the smoke changes only in 21c9dc7 and 2112c9a)                                     |
| `check-suppressions` / `check-feat-commits` / `check-ac-coverage` | OK / OK / OK                                                                                                                 |
| `check-spec-sections` / `check-features-map` / `check-backlog`    | OK / OK / OK                                                                                                                 |
| `check-plan-scope`                                                | `OK: feat/B1.22-lane-metrics stays inside the approved plan of B1.22`                                                        |
| `check-config-change`                                             | local `::error::` on `.claude/docs/git-workflow.md`; PR #74 carries `config-change-approved`; CI `guards` SUCCESS at e2facfa |
| `scripts/verify-red.sh B1.22`                                     | exit 1, no `(red)` commit (tooling precedent, pass 1); red proven by the two smoke runs above                                |
| `bash -n scripts/*.sh scripts/metrics/*.sh`                       | rc 0                                                                                                                         |
| `throughput.sh B1.1 … B1.15` / `throughput.sh`                    | `throughput 5.1 … (15 cards, 23.5 h, 3 days)` / `throughput 5.6 … (20 cards, 28.8 h, 4 days)`: match the row                 |
| `wait-time.sh`                                                    | `median plan-gate wait 1 min (19), median PR wait 1 min (20), PR upper bound 22 min (20)`; B1.18 0 / 939: match the row      |
| `plan-deviations.sh`                                              | `uncaught plan deviations 0/19` (B1.1 n/a): matches the row                                                                  |

### Checklist

- Dispositions: [3] closed (mutant (E) now fails M18 and M22). [4] closed as ruled: M20 and M23 fail on the
  pre-fix code, and GUARDED_FROM 0/59/1000 and "always n/a" are killed. The PR-number proxy for "merged after #60"
  holds on real data (#57 merged 08:32Z and #59 08:45Z, both before #60 at 10:22Z; every later card PR is > 60).
  [5] closed: the doc now says "until the batch drains", matching `state_of`. [1] and [2] are only partly closed,
  see findings 1 and 2.
- M20's changed expectation (n/a, 1/4 → `src/e.ts`, 2/5) is the lead's ruling (a), not a weakening. B9.5 is #105, at
  or after #60. The pre-#60 n/a branch moved to M23 (B8.6, #59). M18's median 24 → 31 comes from the M22 fixture
  run (B9.4's own commit is green at T0+400). M18's assertion is still exact. M21 naming its five cards keeps B8.6
  out, and its expected line is unchanged from 21c9dc7.
- Mutants on a scratch clone (one at a time, smoke re-run). Killed: (A) min-start → M21 5.7; no `a[i] <= last[d]`
  guard → M21 8.0; latest approval per day → M14, M21; (E) → M18, M22; no `chore(ci)` skip → M17; GUARDED_FROM 59 →
  M23; no pre-#60 n/a → M23; always n/a → M20, M23; paperwork set removed → M19, M20, M23. Equivalent: `<=` → `<`
  (an approval in the same second as the last merge), dropping `(d in last)` (only days in `n` are printed),
  dropping `pats=""` on rc ≠ 0 (plan-files.sh exits 3/4 before it prints anything). Survivors: findings 2 and 3.
- Every changed file in `plan.md` Files: yes (9/9). Interfaces unchanged since pass 1.

### Findings

```
[1] KIND: plan-mismatch (pass 1 [1] not closed for a card selection; D-18)
    WHERE: scripts/metrics/throughput.sh:19-25 (approvals collected only for cards passing `want`), header line 4
           "any selected card"; docs/metrics.md Throughput row ("of any card, any round"; "Re-measure after each
           batch with the batch's cards")
    DEFECT: a day's span depends on which cards are selected. The plan ("the day's first plan-approval commit (any
            card)"), D-18 ("a daily active span … of that calendar day") and the row describe the span as a property
            of the day.
    TRIGGER: the documented batch re-measure, `scripts/metrics/throughput.sh B1.16 B1.17 B1.18 B1.19 B1.21`, on the
            real repo
    WRONG BEHAVIOUR: 2026-10-30 reads 2.32 h (B1.16's approval → B1.17's merge), but 10.89 h when every card is
            selected. The batch prints `throughput 9.6 … (5 cards, 4.1 h, 2 days)`, above the 6.64 target. The
            same two days with every card merged on them give 10 cards ÷ 12.72 h × 8 = 6.3, below the target. The
            plan's literal reading (any card's approval, selected cards' merges, run as a scratch variant) prints 3.1.
            So D-18's primary verdict for a batch depends on an unstated choice. Splitting history into B1.1–B1.15 and
            B1.16–B1.21 loses 1.15 h of 10-30 (7.42 + 2.32 vs 10.89). Over B1.1–B1.15 and over all cards all three
            readings agree (5.1, 5.6), which is why pass 1 saw no gap.
    CONFIDENCE: confirmed (ran the script and the any-card variant on the real repo)
    Needs the lead: (a) a selection picks days, and each picked day counts every Done card merged on it and its
    span from any card's approval (D-18 as a window; 6.3 for B1.16–B1.21; recommended); (b) keep the selected-only
    span, reword the row and plan, and record a D-18 amendment (9.6); (c) the plan's literal rule (3.1).

[2] KIND: coverage (pass 1 [2] (C) not closed)
    WHERE: scripts/metrics/throughput.sh:24 `(round [0-9]+ )?`; scripts/metrics-smoke.sh M21 (its comment claims
           "any round")
    DEFECT: nothing pins that a later approval round starts a span. Mutant "round-1 approvals only" (regex without
            `(round [0-9]+ )?`) keeps the smoke at 21 ok, 0 FAIL. In M21, B8.2's round 2 (09:00) comes after B8.5's
            round 1 (07:00) on day 2, and B8.5's round 2 (day 3 11:00) is after the last merge. Disposition 2 says (C)
            "has no analogue once every round counts", and this mutant is that analogue.
    TRIGGER: card X: round 1 approved day d−1 (no merge that day), round 2 approved d 08:00, merged d 12:00. Card Y
            merged d 10:00.
    WRONG BEHAVIOUR (under the mutant, undetected): day d span 2 h (from Y's merge) instead of 4 h. Pass 1's own
            trigger C, which the fix was meant to close.
    CONFIDENCE: confirmed (mutant run on a scratch clone; span traced in the awk)

[3] KIND: coverage
    WHERE: scripts/metrics/plan-deviations.sh:13,26 (`GUARDED_FROM=60`, `$pr -lt $GUARDED_FROM`)
    DEFECT: the ruling's boundary "from #60 on" is not pinned. GUARDED_FROM=61 and `-le` both keep the smoke at 21 ok.
            The fixture brackets it only with #59 and #304.
    TRIGGER: a Done card whose PR is #60, with no approval commit and a `src/` file
    WRONG BEHAVIOUR (under either mutant, undetected): prints `n/a` and leaves the denominator. The ruling counts the
            file. Real #60 (B1.17) has an approval, so today's 0/19 is unaffected.
    CONFIDENCE: confirmed (both mutants run)
```

Verdict: back to test-writer. The lead rules on [1] first. Then test-writer adds probes for [1] as ruled (a fixture
day where an unselected card's approval or merge falls inside a selected card's day), [2] (the round-2 trigger
above) and [3] (B8.x on #60). These are `test(scripts): B1.22 review pass 2 -- …` commits, red where [1] changes the
code. Then code-writer fixes [1] and updates the row, the header and the plan wording.

Riskiest unfalsified: `plan-deviations.sh` reads `gh pr view --json files`, which I believe returns at most 100 files
without paginating [unverified, carried from pass 1]. A card PR above 100 files would under-count silently. No card
PR comes near that size, so I could not trigger it.

### Dispositions, pass 2 (dev-lead)

| #   | Disposition                                                                                                                                                                                                                                          | Evidence                                                                                                              |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| 1   | fix now, lead's ruling (a): the cards given pick days; a picked day counts every Done card merged on it, span from any Done card's approval. Baseline follows: the days of B1.1–B1.15 read 5.04 (17 cards, 27.0 h), D-18 target ≥ 6.56 (row updated) | probe M24 (a6ab22c) red at 48c0529 (2.7), green at 8ecfece (4.9); `throughput.sh B1.16 B1.17 B1.18 B1.19 B1.21` → 6.3 |
| 2   | fix now: M21's day 2 opens at B8.2's round-2 approval (06:30), after the first merge (06:00)                                                                                                                                                         | 48c0529: round-1-only mutant → M21 6.7, min-start → 7.0 h                                                             |
| 3   | fix now: M23 adds B8.7 = PR #60, no approval, `src/x.ts` counted (2/2)                                                                                                                                                                               | 48c0529: `GUARDED_FROM=61` and `-le` → M23 FAIL                                                                       |

## Diff review (pass 3)

HEAD b251ac1, the last pass allowed. Delta since pass 2 (e2facfa): 48c0529 `test` (M21 round-2 span start, M23 PR
#60), 4aa8f03 (pass-2 text), a6ab22c `test` (M24), 8ecfece `fix` (throughput.sh, the docs/metrics.md row), b251ac1
(pass-2 dispositions). Branch diff `origin/main...HEAD`: 9 files, all in `plan.md` Files.

### Commands (last line each, run by the reviewer at b251ac1)

| Command                                                           | Result                                                                                                                                     |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm lint` / `pnpm typecheck` / `pnpm test`                      | `All matched files use Prettier code style!` (rc 0) / `tsc --noEmit` rc 0 / `Tests 115 passed (115)`                                       |
| `pnpm test:e2e` / `pnpm test:mutation`                            | `13 passed (13.5s)` / `Final mutation score of 89.02 is greater than or equal to break threshold 70`                                       |
| `scripts/metrics-smoke.sh`, `/bin/bash` 3.2.57 (BSD awk, date)    | `[metrics-smoke] 22 ok, 0 FAIL`                                                                                                            |
| same, bash 5.2.15 in `node:24-bookworm` (mawk, GNU `date -d`)     | `[metrics-smoke] 22 ok, 0 FAIL`                                                                                                            |
| smoke on the a6ab22c tree (48c0529 code + M24)                    | `21 ok, 1 FAIL`: `M24 rc=0 throughput 2.7 cards per 8 h (1 cards, 3.0 h, 1 days)`: red on behavior                                         |
| smoke on the 8ecfece tree                                         | `22 ok, 0 FAIL`                                                                                                                            |
| files of 8ecfece                                                  | `docs/metrics.md`, `scripts/metrics/throughput.sh`: no smoke or test file                                                                  |
| `check-suppressions` / `check-feat-commits` / `check-ac-coverage` | OK / OK / OK                                                                                                                               |
| `check-spec-sections` / `check-features-map` / `check-backlog`    | OK / OK / OK                                                                                                                               |
| `check-plan-scope`                                                | `OK: feat/B1.22-lane-metrics stays inside the approved plan of B1.22`                                                                      |
| `check-config-change`                                             | local `::error::` on `.claude/docs/git-workflow.md`. PR #74 carries `config-change-approved`. CI at b251ac1: all 7 checks SUCCESS          |
| `scripts/verify-red.sh B1.22`                                     | exit 1, no `(red)` commit (tooling precedent, pass 1). Red proven by the a6ab22c run above                                                 |
| `bash -n scripts/metrics/*.sh scripts/metrics-smoke.sh`           | rc 0                                                                                                                                       |
| `throughput.sh B1.1 … B1.15`                                      | 10-28 2 / 0.97 h, 10-29 8 / 15.11 h, 10-30 7 / 10.89 h; `throughput 5.0 … (17 cards, 27.0 h, 3 days)`. 17 ÷ 26.97 × 8 = 5.04, × 1.3 = 6.56 |
| `throughput.sh` / `throughput.sh B1.16 B1.17 B1.18 B1.19 B1.21`   | `5.6 … (20 cards, 28.8 h, 4 days)` / `6.3 … (10 cards, 12.7 h, 2 days)`. Both match the row                                                |
| `wait-time.sh` / `wait-time.sh B1.18`                             | `median plan-gate wait 1 min (19), median PR wait 1 min (20), PR upper bound 22 min (20)` / `B1.18 63 5 0 939`. Both match the row         |
| `plan-deviations.sh`                                              | `uncaught plan deviations 0/19`: matches the row                                                                                           |

### Checklist

- Pass-2 [1], ruling (a): closed in code. Every Done card is read, and its approvals open spans whether or not it is
  picked. Merges carry `picked`, and only days holding a picked merge print. M24 (`throughput.sh B8.3` → day 2 whole,
  4 cards over 6.5 h) is red at 48c0529 and green at 8ecfece.
- Pass-2 [2]: closed. Round-1-only and min-start fail M21 (48c0529 body; not re-run).
- Pass-2 [3]: closed. M23's B8.7 = #60 is counted (2/2).
- a6ab22c adds merge times for #59 and #60 on day 1. Every Done card is now queried, so the shim needs them. M21's
  expected line is unchanged and day 1 is not picked. Not a weakening.
- Pick mutants on scratch copies, one at a time, smoke re-run. Killed:
  - every day picked: M21, M24 (`7 cards, 9.5 h, 3 days`)
  - count only picked cards: M24 (`1 cards, 6.5 h`)
  - approvals of picked cards only: M24 (`4 cards, 3.0 h`)
  - pick by approval day instead of merge day: M14, M15, M21
  - pick by approval day or merge day: M21

  Survivors: the day's last merge, or its first merge, taken from picked cards only. See finding 1.

- Every changed file in `plan.md` Files: yes (9/9). `git diff 9a33e93..HEAD -- '*.test.*' e2e/`: empty. The smoke
  changes only in `test(...)` commits (21c9dc7, 2112c9a, 48c0529, a6ab22c).
- Honesty of the baseline change. The row states the target (≥ 6.56, 1.3 × 5.04), its basis (the 3 days B1.1–B1.15
  merged on, 17 cards, 27.0 h) and the ruling. Disposition 1 and the 8ecfece body state the move from 6.64. Two gaps
  remain, see finding 2.
- Nit, not blocking: `scripts/CLAUDE.md` still reads "probes M1–M23", and the smoke now has M24.

### Findings

```
[1] KIND: coverage
    WHERE: scripts/metrics/throughput.sh:38 (`last[d]`, `fm[d]` over every merge); scripts/metrics-smoke.sh M24
    DEFECT: the ruling's "up to the day's last merge, else from its first merge" is pinned only for a selection
            whose picked card is itself the day's last merge (M24 picks B8.3, merged 13:00, the last on day 2).
            Two mutants keep the smoke at 22 ok, 0 FAIL:
            (L) `if ($3 && (!(d in last) || $2 > last[d])) last[d] = $2`
            (F) the same `$3 &&` guard on `fm[d]`.
    TRIGGER: (L) M24's fixture with `throughput.sh B8.1` (merged 12:00) or `throughput.sh B8.4` (06:00).
            (F) a picked day with no approval at or before its last merge, two merges X 09:00 and Y 11:00, and
            `throughput.sh Y`.
    WRONG BEHAVIOUR (under the mutant, undetected): (L) B8.1 → `5.8 (4 cards, 5.5 h)` and B8.4 → `n/a (4 cards,
            0.0 h)`. The shipped code gives `4.9 (4 cards, 6.5 h)` for both. (F) span 0 h instead of 2 h.
            The shipped code is correct on both triggers. This is a test gap only.
    CONFIDENCE: confirmed for (L): extra probe lines run on a scratch copy of 8ecfece and on the mutant. For (F) the
            smoke survival is confirmed and the trigger is traced in the awk (the fixture has no day without an
            approval that a selection can split).

[2] KIND: plan-mismatch (paperwork: plan.md and the PR body; docs/metrics.md row)
    WHERE: backlog/work/B1.22/plan.md:9,62. PR #74 body, Plan section (lines 21, 74). docs/metrics.md Throughput
           row, "Current".
    DEFECT: the approved plan and the PR body still state baseline 5.11 → target ≥ 6.64. Their verification line
            still expects `throughput.sh B1.1 … B1.15` → 5.11, and the PR body does not name ruling (a). The row
            does not say that the 17 baseline cards include B1.16 (#57) and B1.17 (#60), merged on 10-30. It also
            does not say that its context figure "B1.16–B1.21 days 6.3" shares the whole of 10-30 with the
            baseline.
    TRIGGER: the lead reads PR #74 and runs the plan's verification command. Or the lead compares "B1.16–B1.21
            days 6.3" with the 6.56 target.
    WRONG BEHAVIOUR: the command prints 5.0 (17 cards), and the PR body promises 5.11 (15 cards) and 6.64.
            Of the 6.3 figure's 10 cards and 12.72 h, 7 cards and 10.89 h are 10-30, a baseline day (B1.11–B1.17).
            10-31 alone reads 3 cards ÷ 1.83 h × 8 = 13.1. So 6.3 < 6.56 reads as "the lane missed the target",
            although it mostly measures the baseline. Under ruling (a) this overlap is intended for a batch that
            starts on a day an earlier card merged. It should be stated, not hidden.
    CONFIDENCE: confirmed (ran the commands; merge times from `gh pr view`, day split traced; plan.md last
            changed at 878e130; PR body grepped)
```

Verdict: ready for PR. Neither finding blocks.

- [2] is paperwork for dev-lead before `gh pr ready`. The PR body's Plan section gets a "Deviations (lead rulings)"
  note covering: X → ruling (a) on pass-2 [1], baseline 5.04 / target 6.56, verification 5.0 (17 cards); Z →
  ruling (a) on pass-1 [4]; the `wait-time.sh` interface additions from pass 1. The row gains "(B1.1–B1.17; 10-30
  is in both)". `plan.md` stays as approved, because the rulings are recorded in this file.
- [1] can be carried in either of two ways. File a card, or add a green hardening commit
  `test(scripts): B1.22 review pass 3 -- …` with `throughput.sh B8.1` → `4.9 cards per 8 h (4 cards, 6.5 h, 1 days)`
  plus a no-approval day for (F). Show that (L) and (F) fail it. No code change is needed.

Riskiest unfalsified: `plan-deviations.sh` reads `gh pr view --json files`, which I believe returns at most 100 files
without paginating [unverified, carried from passes 1 and 2]. A card PR above 100 files would under-count silently.
No card PR comes near that size, so I could not trigger it.

### Dispositions, pass 3 (dev-lead)

| #    | Disposition                                                                                                                                                                                                  | Evidence                                            |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------- |
| 1    | fix now (hardening): probe M25, `throughput.sh B8.1` and a day-4 pick with no approval                                                                                                                       | 289310f; mutant (L) → M25 5.8, mutant (F) → M25 n/a |
| 2    | fix now: row names the baseline cards (B1.1–B1.17) and the shared day 10-30 (10-31 alone 13.1); the PR body's Plan section lists the lead's rulings and the interface additions; `plan.md` stays as approved | `docs/metrics.md`, PR #74 body                      |
| note | `scripts/CLAUDE.md` probes M1–M25                                                                                                                                                                            | —                                                   |
