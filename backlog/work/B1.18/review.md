# B1.18 review

## Plan review (round 1)

SCOPE: none of lib | actions | ui. The plan touches `scripts/`, `scripts/ci/`, `.claude/agents/` and `backlog/`.
It has no `src/`, `prisma/` or `e2e/` path, so there is no section, no map row and no Stryker run. I adapted the
checklist the same way as for B1.12–B1.17.

I reviewed the plan at `ffc2c08` and the card at `d1a886c`. All runs were read-only and made no edits:

- `scripts/next-task.sh --list` printed B1.18 with "Spec: line missing or says change; Test: line missing".
  `scripts/next-task.sh` exited 1 with the same near-miss.
- `scripts/hook-smoke.sh` printed `hook-smoke: 284 probes OK`. `scripts/ci/check-backlog.sh` passed (OK).
  `scripts/ci/check-plan-scope.sh` passed (OK, paperwork only).
- `git branch -a`, `git worktree list`, and `git show 25fee24:backlog/README.md` and
  `git show origin/main:backlog/README.md` (the "Remaining" sections).
- `gh pr list --state all --limit 8` returned #62 `docs/B1.18-file-card` OPEN, #61 MERGED, #60
  `feat/B1.17-plan-scope-hook` MERGED, and #57 `feat/B1.16-metrics-baseline` MERGED.
- An overlap probe applied the plan's `--check` rule (equal, or bash glob in either direction) to the `## Files`
  entries of the B1.2–B1.6, B1.10 and B1.11 plans. It ran as an inline `bash -s` from the worktree.
- `command -v timeout gtimeout` returned nothing. `bash` is `/bin/bash` 3.2.57.

### Checklist

| Check                                                                | Result                                                                                                                                                                                                                                                                     |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file belongs to the section's features (map)                   | pass: no section. Every file traces to the card's Acceptance (README board, `next-task.sh`, `check-backlog.sh`) or to the docs and agent prose that run it. The `plan-files.sh --any` flag is additive. `hook-smoke.sh` is in Verification and guards the existing caller. |
| interfaces follow `ts-style.md`; mutations in actions; Prisma in lib | pass: n/a (bash only). The interfaces block gives every flag with its output and exit code.                                                                                                                                                                                |
| follows `advice.md` or states the deviation                          | pass: the advisor was skipped (Tier quick, no section), and the plan says so.                                                                                                                                                                                              |
| ≤ 7 criteria, every Then measurable                                  | fail: 9 probes, but the Files row says "W1–W8". The `--check` rule does not say whether paperwork entries count, and that decides most outcomes ([5]). Pick-time exclusion of Doing/Review cards is only implied by W4 ([4]).                                              |
| verification lists exact commands with expected numbers              | fail: the red claim "W2, W4–W9 FAIL" is wrong for W8 ([9]). bash 3.2 is in the card's Acceptance and is met only because `/bin/bash` is first on this PATH.                                                                                                                |
| work breakdown skeleton → red → green → map → review                 | pass, with a note: skeleton and map are n/a for a script card, as in B1.17. The test subject has no `(red)` marker. That copies B1.17 (`b7fc272`), and `verify-red.sh` does not judge script smokes.                                                                       |
| `Lead approves spec` box                                             | pass: n/a, no section.                                                                                                                                                                                                                                                     |
| no settled D-n contradicted                                          | pass: D-18's first fix ("drop to 2 sessions") means editing `WIP_LIMIT`, a protected file that needs the label. That is consistent with "(D-n to change)".                                                                                                                 |
| the board is derived correctly in every real situation               | fail: [1] [2] [3] [4]                                                                                                                                                                                                                                                      |
| (a) vs (b) costed fairly                                             | fail: [8]                                                                                                                                                                                                                                                                  |

### Findings

```
[1] KIND: correctness
    WHERE: plan.md "Board state" bullet (which backlog/README.md "Remaining" is read)
    DEFECT: next-task.sh reads "Remaining" from the checkout it runs in. Parallel sessions' checkouts are at
            different commits, so the derived board differs per session and can be wrong in each.
    TRIGGER: the app session `.claude/worktrees/mystifying-elion-42e204` is at 25fee24. That commit's Remaining
             still lists B1.17, `origin/feat/B1.17-plan-scope-hook` exists (PR #60 MERGED), and B1.18 is absent
             there because its filing PR #62 is still OPEN. origin/main's Remaining is empty.
    WRONG BEHAVIOUR: that session counts B1.17 as Doing, which is false. It does not see B1.18, which is the one
            card actually in progress. From origin/main no card is Doing at all. The plan needs one source for
            the card set and must say what it is. For example, derive Doing from card-id branches themselves
            (filtered by PR state and the card's status on origin/main), not from the local README.
    CONFIDENCE: confirmed (traced with git show of both READMEs, git branch -a, gh pr list)

[2] KIND: correctness
    WHERE: plan.md "Board state": "Review = open, non-draft PR … Merged cards leave Remaining in the closing lane"
    DEFECT: a branch whose PR is merged falls through to Doing. Also, merged cards do not always leave Remaining.
    TRIGGER: (i) the window between the feat PR merge and the closing PR merge (#60, then #61 for B1.17). In that
             window the card is still in Remaining and its branch's PR state is MERGED, which is not "open", so
             the card counts as Doing. (ii) A card closed as `Partial — merged <sha>, pending …`
             (backlog/CLAUDE.md "Closing" step 4, dev-lead Loop 8). "The row stays", and origin feat branches are
             never deleted (`origin/feat/B1.16-metrics-baseline` still exists two cards later), so the card is
             Doing indefinitely. (iii) A Partial card re-opened for more work has the old merged branch plus a
             new one.
    WRONG BEHAVIOUR: finished work holds a WIP slot. The plan needs a state for merged/closed PRs (not Doing). It
            also needs an offline rule that does not turn every merged branch into Doing.
    CONFIDENCE: confirmed (rule traced against the PR states and refs listed above)

[3] KIND: spec-mismatch
    WHERE: plan.md "WIP" bullet; .claude/agents/dev-lead.md Loop 1 "Pick. scripts/next-task.sh (or the id given)"
    DEFECT: the 3-card refusal runs only on the no-argument pick. A card started by id never meets it, and
            `--check <card>` tests only overlap.
    TRIGGER: `/work-next B1.19` while B9.1–B9.3 are Doing. Every tooling card (`Spec: none`) is never eligible
             to next-task.sh (this repo: "B1.18: Spec: line missing …", exit 1), so B1.12–B1.18 were all started
             by id.
    WRONG BEHAVIOUR: a fourth card starts. The card says "next-task.sh refuses a fourth Doing card". Enforce the
            count for an id too: `--check <card>` (or `next-task.sh <card>`) counts the other cards, and Pick
            runs it for an id that was given. Add a probe for it.
    CONFIDENCE: confirmed (ran next-task.sh; read dev-lead Loop 1)

[4] KIND: correctness
    WHERE: plan.md "Board state" (Doing begins at branch creation); dev-lead.md Loop 1 order
    DEFECT: a picked card stays "To do" until worktree.sh creates its branch. Loop 1 dispatches spec-analyst
            before worktree.sh, so that window can last a whole analyst run. The plan also never says that a pick
            skips Doing/Review cards; W4 only implies it.
    TRIGGER: two sessions run `/work-next` within that window. Both are given the same lowest step, B9.1.
    WRONG BEHAVIOUR: two sessions work one card, and the WIP count is 1 lower than reality. Make three changes:
            state "Doing/Review cards are not eligible"; move `worktree.sh` to directly after the pick (the branch
            is the claim); and re-run the check after the branch exists. If the race is accepted instead, state
            it as a cost.
    CONFIDENCE: confirmed (read dev-lead Loop 1; the plan has no claim step)

[5] KIND: plan-mismatch
    WHERE: plan.md "WIP" bullet, `--check` rule
    DEFECT: the plan does not say whether paperwork entries count as overlap, or which match direction is used.
            The real cost of the rule is not stated.
    TRIGGER: the rule applied to the past plans B1.2–B1.6, B1.10 and B1.11 (21 pairs). All entries counted:
             16/21 pairs overlap. B1.10 against each of B1.2–B1.6 overlaps only on `spec/features-map.md` and
             `docs/metrics.md`. Paperwork excluded the same way as check-plan-scope.sh (`backlog/*`, `spec/*`,
             `docs/metrics.md`, `docs/mistake-log.md`): 11/21 overlap, 10 of them on `src/actions/todos.ts`.
    WRONG BEHAVIOUR: counting paperwork makes the effective WIP 1 for feature cards. Even with paperwork excluded,
            this backlog's single slice serialises 10 of the 10 pairs among B1.2–B1.6. The plan must name the
            exemption (consistent with check-plan-scope.sh), match in both directions (`x == $y || y == $x`), and
            tell the lead that most §5 cards will not run in parallel.
    CONFIDENCE: confirmed (ran the probe)

[6] KIND: plan-mismatch
    WHERE: plan.md Files row `.claude/agents/dev-lead.md` ("5 Gate: run --check before asking the lead")
    DEFECT: the overlap refusal is prose for dev-lead only. Nothing stops the `plan approved` commit, and it is
            checked once, after the reviewer has already run.
    TRIGGER: (i) the reviewer is dispatched in Loop 4 on a plan that `--check` would refuse in Loop 5. (ii) The
             lead's change round adds a Files row (Rounds +1, or a planning.md re-approval) and the check is not
             run again. (iii) The other card has no committed plan yet, so the check passes vacuously.
    WRONG BEHAVIOUR: a review round is wasted, or an overlap is approved. The card says "next-task.sh refuses";
            checking at the gate is the only possible moment (there is no plan at pick), but the plan should say
            so as a stated reinterpretation. Run `--check` at Loop 3 end (before the reviewer), at the gate, and at
            every re-approval, and state that it is advisory, with no CI net (CI cannot see other branches).
    CONFIDENCE: plausible (could not falsify; this is about prose, not code)

[7] KIND: correctness
    WHERE: plan.md "Review = … (gh; offline or no auth → Doing)"
    DEFECT: the plan does not say whether gh is called once or per branch. It has no bound on gh, and the
            fallback is silent.
    TRIGGER: the network is slow or captive, so gh blocks instead of failing. macOS bash 3.2 has no `timeout`
             (`command -v timeout gtimeout` is empty here). Separately, gh fails and a Review card turns into
             Doing.
    WRONG BEHAVIOUR: next-task.sh hangs, or it prints "WIP 3/3" with no sign that the count is a fallback. Use one
            `gh pr list --state all --json headRefName,state,isDraft` call (it also serves [2]). Print a
            "[next-task] gh unavailable: Review counted as Doing" line. W9 should assert that line, not only "no
            crash".
    CONFIDENCE: plausible (did not hang gh)

[8] KIND: plan-mismatch
    WHERE: plan.md "Decision for the lead"
    DEFECT: (a) and (b) are not costed fairly. The plan lists (a)'s costs, but (b)'s costs are not listed.
    TRIGGER: the card's Acceptance says "the board shows each remaining card as To do, Doing or Review
             (`backlog/README.md`, checked by `scripts/ci/check-backlog.sh`)".
    WRONG BEHAVIOUR: under (b) the README never shows the column, so (b) deviates from the card's Acceptance.
            check-backlog.sh can only grep for a note, because CI sees no local branches. The state is per machine
            and per checkout ([1]), it depends on gh ([7]), and "the board artifact" is undefined. (a)'s heaviest
            cost is also missing: 2 extra lead merges per card, against dev-lead's "one decision per card". (b) may
            still be right, but the lead must choose knowing it changes the Acceptance.
    CONFIDENCE: confirmed (card text and plan text compared)

[9] KIND: coverage
    WHERE: plan.md Probes and Verification
    DEFECT: the probe list has four gaps.
    TRIGGER: (i) W8 at red: today's next-task.sh ignores `--check` (only `--list` is parsed, line 7), so it prints
             a pick and exits 0. W8 therefore passes at red unless it asserts the "no overlap" text. (ii) The
             Files row says W1–W8, but there are 9 probes. (iii) No probe covers the card-id boundary: a `B9.1`
             card against a `feat/B9.10-x` branch. (iv) None covers [2], [3] or [4].
    WRONG BEHAVIOUR: the red claim "W2, W4–W9 FAIL" is wrong, and the riskiest rules have no probe. The plan is 60
            lines against the one-screen limit of about 40, so trim the prose when adding the probes.
    CONFIDENCE: confirmed (read next-task.sh line 7)
```

Verdict: changes requested

1. Pick one source for the card set that is the same in every checkout, and state it ([1]).
2. Give merged and closed PR branches a state that is not Doing, online and offline, and cover Partial rows ([2]).
3. Enforce the WIP count for a card started by id ([3]).
4. State that Doing/Review cards are not eligible, and make branch creation the claim ([4]).
5. Define the overlap rule (paperwork exemption, both directions), and give the lead the measured serialisation
   cost ([5]).
6. Run `--check` before the reviewer, at the gate, and at each re-approval. State that it is advisory, and state
   the reinterpretation of the card's wording ([6]).
7. Make one bounded gh call with a printed fallback ([7]).
8. Restate (b) with its costs and its deviation from the Acceptance, and (a) with its lead-merge cost ([8]).
9. Fix the probe list and the red claim, add probes for 1–4, and bring the plan back toward one screen ([9]).

This verdict is a plan review. It does not approve the plan for the lead's gate or for build.

## Plan review (round 2)

SCOPE: none of lib | actions | ui (tooling: `scripts/`, `scripts/ci/`, `.claude/agents/`, `backlog/`), as in round 1.

I reviewed the plan at `b83a5e8` (72 lines, 60 non-blank). The branch includes `c2501b8` (merge of origin/main with
the filing PR #62). All runs were read-only:

- Every past plan's `## Files` column 1 was extracted with `plan-files.sh`'s awk. The plan's `--check` rule was
  applied to each pair: paperwork exempt (`backlog/*`, `spec/*`, `docs/metrics.md`, `docs/mistake-log.md`), and a
  collision is `[[ $x == $y || $y == $x ]]`. This was an inline `bash -s`.
- `gh pr list --state all --limit 300` returned 62 PRs, all MERGED, none CLOSED. No card has two non-`docs` PR
  branches.
- `git branch -a` and `scripts/worktree.sh` lines 45–47 (the branch is created by `git worktree add -b`).
  `.claude/skills/work-next/SKILL.md` was read in full. `type -a bash` gives only `/bin/bash` 3.2.57.

### Round-1 reasons

| R1  | State                                                                                                                                                                                                                                                                                                                              |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | resolved: the card set is `origin/main` "Remaining" after a fetch. Residual (stated by W9): a card whose filing PR is unmerged is invisible. This card was planned in exactly that state (`ffc2c08` before #62), but the filing lane says "filed alone, before anyone works on it", so the rule is consistent. Fetch failure: [4]. |
| 2   | resolved: MERGED PR or Partial row → Closing. Offline counts every branch as Doing, stated as conservative. A CLOSED PR is still Doing: [6].                                                                                                                                                                                       |
| 3   | resolved in `dev-lead.md` only. The `/work-next` entry block, which is the one a human starts, still has no claim: [1].                                                                                                                                                                                                            |
| 4   | partly: "skips Doing/Review/Closing" is stated, and worktree comes right after the pick. The residual race is neither closed nor stated as a cost: [3].                                                                                                                                                                            |
| 5   | resolved for §5 cards. My re-tally agrees: 11/21 pairs, 10 of them on `src/actions/todos.ts`. The cost for tooling cards is missing: [2].                                                                                                                                                                                          |
| 6   | partly: `--check` runs before the plan review and at every re-approval, and the reviewer quotes it. "Advisory, no CI net" and the reinterpretation of the card's wording are not stated: [5].                                                                                                                                      |
| 7   | partly: one `gh` call, with a stderr warning on failure. The call has no bound, and no accepted hang is stated: [5].                                                                                                                                                                                                               |
| 8   | partly: (b) is labelled a deviation, and (a) carries its 2 PRs and 2 merges. "The live board artifact" is still undefined (it appears only in plan.md line 26): [5].                                                                                                                                                               |
| 9   | resolved: W1–W14 agree with the Files row, W8 covers B9.1 vs B9.10, and R1 [2]–[4] have probes (W6, W7, W9, W10, W4). The red list is deferred to a commit body: [7].                                                                                                                                                              |

### Overlap re-tally (plan's rule)

| Set                       | Pairs overlapping | On what                                                                                                                                                                                    |
| ------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| B1.2–B1.6, B1.10, B1.11   | 11/21             | 10 on `src/actions/todos.ts` (+ `.test.ts`, `src/actions/CLAUDE.md`), 1 on `src/lib/logger.ts` (B1.6×B1.11)                                                                                |
| B1.2–B1.11 (all feature)  | 21/45             | —                                                                                                                                                                                          |
| B1.12–B1.18 (all tooling) | 15/21             | 13 only on `scripts/CLAUDE.md`. B1.16×B1.17 also on a bare `review.md` token. B1.13×B1.14 on the prune scripts. B1.17×B1.18 on `scripts/ci/plan-files.sh` and `.claude/agents/dev-lead.md` |

### Checklist

| Check                                                                | Result                                                                                                                                                                                                                                                                                                                            |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file belongs to the section's features (map)                   | fail: no section. Every listed file traces to the Acceptance or to the prose that runs it. One needed file is missing: `.claude/skills/work-next/SKILL.md` ([1]).                                                                                                                                                                 |
| interfaces follow `ts-style.md`; mutations in actions; Prisma in lib | pass: n/a (bash only). All five CLI forms are pasted with their output and exit code.                                                                                                                                                                                                                                             |
| follows `advice.md` or states the deviation                          | pass: the advisor was skipped (Tier quick, no section), as stated. The deviation (b) from the card's Acceptance is stated for the lead.                                                                                                                                                                                           |
| ≤ 7 criteria, every Then measurable                                  | pass: the card's Acceptance has 6 clauses. The 14 probes each name an input and an exit or state.                                                                                                                                                                                                                                 |
| verification lists exact commands with expected numbers              | pass, with a note: green is 14/14, plus hook-smoke, check-backlog, check-plan-scope and `bash -n`. The red set is deferred to the commit body ([7]).                                                                                                                                                                              |
| work breakdown skeleton → red → green → map → review                 | pass: `test(scripts)` → `feat(scripts)` → reviewer → PR. Skeleton and map are n/a, as in B1.17.                                                                                                                                                                                                                                   |
| `Lead approves spec` box                                             | pass: n/a, no section.                                                                                                                                                                                                                                                                                                            |
| no settled D-n contradicted                                          | pass: none found. `WIP_LIMIT=3` sits in a protected file, so changing it needs the label (D-18, "D-n to change").                                                                                                                                                                                                                 |
| one screen / size                                                    | 72 lines (60 non-blank) against ≈ 40. This is in line with the approved B1.13 (68), B1.15 (76) and B1.17 (73), so it is one card and not blocking. Size S is low: 11 files (12 with [1]), a new smoke harness with a bare origin and a `gh` shim, and 14 probes make it M [estimate]. Seam, if the lead wants a split: see below. |

**Split seam (lead's call, not required).** Card A covers the WIP count: source, state, BOARD, refusal on pick and
`--claim`, the README line, `check-backlog.sh`, `backlog/CLAUDE.md`, dev-lead Loop 1, `work-next/SKILL.md`, and
W1–W10 plus W14. Card B covers overlap: `--check`, `plan-files.sh --any`, dev-lead Loop 3/5, `reviewer.md`, and
W11–W13. B depends on A's Doing/Review set. The split has a cost: a filing PR for B, and this card's Acceptance
loses its overlap clause, which needs the lead's ruling. It does not shrink A much, because the state rules are the
bulk of the plan.

### Findings

```
[1] KIND: plan-mismatch
    WHERE: plan.md "Every start enforces it" and the Files table; .claude/skills/work-next/SKILL.md "Entry" (line 14)
    DEFECT: the WIP check on a card started by id is added to dev-lead.md Loop 1 only. The /work-next entry block
            still says `scripts/next-task.sh  # or the card id the human gave`, then worktree.sh, with no --claim.
            The SKILL.md is not in Files.
    TRIGGER: the lead types `/work-next B1.19` while three cards are Doing. SKILL.md says "This file only fixes
             entry and exit", so its entry block runs: no next-task.sh call is made for a given id, and worktree.sh
             creates the fourth branch.
    WRONG BEHAVIOUR: the card's "refuses a fourth Doing card" fails on the most common entry, because every tooling
            card is started by id (R1 [3]). Adding the file mid-build is refused by plan-scope.sh (B1.17) until a
            re-approval. Add the row: `.claude/skills/` is protected, and the label is already planned.
    CONFIDENCE: confirmed (read SKILL.md and dev-lead.md Loop 1; the Files table has no such row)

[2] KIND: plan-mismatch
    WHERE: plan.md "Overlap" bullet, "Cost: history says most §5 cards collide"
    DEFECT: the cost given to the lead covers §5 cards only. Under the plan's rule, tooling cards collide even more,
            nearly always on one index file.
    TRIGGER: the re-tally above. 15 of 21 pairs among B1.12–B1.18 collide, and 13 of them share only
             `scripts/CLAUDE.md`, which every tooling card since B1.13 lists for its row. Separately, a plan that
             writes "`backlog/work/B1.16/plan.md`, `review.md`" in one cell yields a bare `review.md` token. That
             token is not under `backlog/*`, so it collides with any other plan doing the same (B1.16×B1.17).
    WRONG BEHAVIOUR: the effective WIP is 1 for tooling cards, which are the cards being started now, and the lead
            does not see this before approving. Either state it, with the number, as an accepted cost, or exempt
            index tables (for example `scripts/CLAUDE.md`, whose rows are appended, not shared), and count only
            path-shaped tokens (containing `/` or `.`) consistently with plan-files.sh. Also, "most" is wrong:
            10 of 21 is less than half.
    CONFIDENCE: confirmed (ran the tally)

[3] KIND: correctness
    WHERE: plan.md "Every start enforces it" (pick, then worktree.sh "at once"); W10 "`--claim B9.1` already Doing → 0"
    DEFECT: the pick-to-branch window is shorter but still open, and no tool can detect a duplicate afterwards.
            R1 [4] asked for the race to be closed or stated as a cost. It is neither.
    TRIGGER: sessions S1 and S2 both run `next-task.sh` before either runs worktree.sh, and both get B9.1. S1
             creates `feat/B9.1-a`, S2 creates `feat/B9.1-b` (worktree.sh line 47, `git worktree add -b`, succeeds
             because the names differ). A later `--claim B9.1` from either session exits 0 by W10. Also, a branch
             that exists only in another clone is invisible until it is pushed at Loop 9, so "every checkout sees
             the same board" holds for the worktrees of one clone only.
    WRONG BEHAVIOUR: two sessions build one card, the WIP count is 1 (one card) where 2 sessions run, and both
            plans are identical, so `--check` refuses the second only if it runs after the first's plan commit.
            Either refuse a second card-id branch (claim/worktree: "B9.1 already has feat/B9.1-a"), or state both
            the race and the one-clone scope as costs.
    CONFIDENCE: confirmed (traced the plan's rules and worktree.sh)

[4] KIND: correctness
    WHERE: plan.md "Source" bullet ("after `git fetch`"); scripts/next-task.sh line 6 (`set -euo pipefail`)
    DEFECT: the plan does not say what happens when the fetch fails, and the script aborts on any error.
    TRIGGER: the session is offline, or origin is unreachable or needs credentials, and `git fetch` exits 128.
    WRONG BEHAVIOUR: if it is implemented literally, next-task.sh exits non-zero with git's message before printing
            a pick. The `/work-next` entry reads "exit 1 = nothing eligible", so the session stops for the wrong
            reason. W14 covers `gh` failure only. State the rule (for example "fetch fails → warning, use the last
            fetched origin/main"), and add it to W14 or a new probe.
    CONFIDENCE: plausible (the behaviour is unspecified; traced from line 6)

[5] KIND: plan-mismatch
    WHERE: plan.md "Overlap", "Source" and "Decision for the lead" paragraphs
    DEFECT: three costs R1 asked to be stated are still absent.
    TRIGGER: (i) R1 [6]: nothing enforces `--check`. It is dev-lead prose plus a quote in the reviewer's table, CI
             cannot see other branches, and the card's "next-task.sh refuses a card whose plan Files overlap" is met
             at plan time, not pick time. Neither point is written. (ii) R1 [7]: `gh pr list` has no bound
             (`timeout` is absent on macOS bash 3.2). A hung call hangs the pick, and the plan neither bounds it nor
             accepts the hang. (iii) R1 [8]: "the live board artifact" is undefined. The README line would point
             at something that does not exist.
    WRONG BEHAVIOUR: the lead approves (b) without seeing that the overlap rule is advisory and that the pick can
            hang, and the README gets a dangling reference. Three short clauses fix it: "advisory: no CI net", "gh
            hang accepted (no timeout on bash 3.2)" or a bound, and delete "and the live board artifact" or name it.
    CONFIDENCE: confirmed (plan text compared with R1 [6]–[8]; grep finds "live board" only in plan.md:26)

[6] KIND: correctness
    WHERE: plan.md "State" bullet ("whose PR is not MERGED → Doing"; "A Partial card … is Closing")
    DEFECT: two branch states fall into the wrong bucket.
    TRIGGER: (i) a PR closed without merge, for example an abandoned approach. Origin branches are never deleted
             here (`origin/feat/B1.16-metrics-baseline` still exists), and the card stays Open in Remaining.
             (ii) A Partial card reopened for its pending part on a new branch.
    WRONG BEHAVIOUR: (i) the card is Doing forever. It holds one of 3 slots and blocks every overlapping card
            until someone deletes the branch. (ii) The active work is Closing, so it counts 0 toward WIP and is
            invisible to `--check`. Today 62/62 PRs are MERGED, so (i) is latent. State CLOSED → To do (or
            accept it), and state (ii) as a cost or make a Partial card with an unmerged branch Doing.
    CONFIDENCE: plausible (latent: no CLOSED PR exists yet; traced the rule)

[7] KIND: coverage
    WHERE: plan.md Verification, "every probe needing state, --claim or --check FAILs (exact list in its body)"
    DEFECT: the red set can be computed now but is deferred, and one probe can pass at red for the wrong reason.
    TRIGGER: today's next-task.sh parses only `--list` (line 7), so `--check B9.x` and `--claim B9.x` run a plain
             pick (exit 0). W1 and W8 (pick B9.1) pass at red, as do W3 and W13 if they assert only the pick or
             exit 0. W13 ("only paperwork shared → 0") passes at red unless it asserts the `no overlap` line, the
             same trap as R1 [9](i).
    WRONG BEHAVIOUR: the lead approves without knowing which probes are regression guards and which prove the
            change. W13 could stay green against a `--check` that does nothing. Name the set now (red: W2, W4–W7,
            W9–W12, W14, and W3/W13 if they assert their text; passing: W1, W8), and require W13 to match
            `no overlap`.
    CONFIDENCE: confirmed (read next-task.sh line 7 and the probe list)
```

Verdict: changes requested

1. Add `.claude/skills/work-next/SKILL.md` to Files and make its Entry run pick or `--claim` ([1]).
2. Give the lead the tooling cost (15/21, 13 only on `scripts/CLAUDE.md`). Either accept it, or exempt index
   tables and non-path tokens ([2]).
3. Close the duplicate-branch race, or state it and the one-clone scope as costs ([3]).
4. State the `git fetch` failure rule and probe it ([4]).
5. Write "advisory, no CI net", the `gh` bound or the accepted hang, and drop or define "live board artifact" ([5]).
6. State CLOSED PRs and reopened Partial cards ([6]).
7. Name the red set now, and make W13 assert `no overlap` ([7]).

This is round 2, the cap (dev-lead Loop 4: ≤ 2 review rounds, then Waiting on human). The lead decides whether
these seven are revised before the gate or accepted as stated costs, as with B1.17's round 2. Items 1, 2 and 4
change what gets built. Items 3, 5, 6 and 7 can be one clause or one probe each. One card, not a split (seam above).
This verdict is a plan review. It does not approve the plan for the lead's gate or for build.

## Diff review (pass 1)

Range `513859e..06212fd` (test `1e16ba4`, feat `06212fd`). Scope: tooling (scripts, agents, backlog docs); no `src/`,
`prisma/`, `e2e/` change.

### Commands (run by the reviewer at HEAD; last line of each)

| Command                                                                                                          | Result                                                                                         |
| ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `pnpm lint` / `pnpm typecheck`                                                                                   | `All matched files use Prettier code style!` / `tsc --noEmit` clean                            |
| `pnpm test`                                                                                                      | `Tests  115 passed (115)`                                                                      |
| `pnpm test:e2e`                                                                                                  | `13 passed (19.9s)`                                                                            |
| `pnpm test:mutation`                                                                                             | `Final mutation score of 89.02 is greater than or equal to break threshold 70`                 |
| `scripts/next-task-smoke.sh` (bash 5 and `/bin/bash` 3.2)                                                        | `[next-task-smoke] 16 ok, 0 FAIL` both                                                         |
| red, reproduced on a copy of `1e16ba4`                                                                           | `[next-task-smoke] 1 ok, 15 FAIL` (matches the commit body)                                    |
| `scripts/hook-smoke.sh`                                                                                          | `hook-smoke: 284 probes OK`                                                                    |
| `check-suppressions` · `check-feat-commits` · `check-ac-coverage` · `check-spec-sections` · `check-features-map` | OK ×5                                                                                          |
| `check-backlog` · `check-plan-scope` · `check-agent-frontmatter`                                                 | OK · `stays inside the approved plan of B1.18` · `OK: 13 files`                                |
| `check-config-change.sh`                                                                                         | exit 1: 6 protected files, label `config-change-approved` missing (expected; the lead's label) |
| `scripts/verify-red.sh B1.18`                                                                                    | n/a: no `(red)` marker; tooling red proven by the smoke instead (row above)                    |
| `bash -n scripts/*.sh scripts/ci/*.sh`                                                                           | clean                                                                                          |
| `git diff 1e16ba4..HEAD -- scripts/next-task-smoke.sh`                                                           | empty (no test touched after red)                                                              |

### Checklist

| Check                                               | Result                                                                                                                                                                                                                                                                                                |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every acceptance item has a probe asserting it      | pass, except the gaps in [3]                                                                                                                                                                                                                                                                          |
| no test weakened after the red commit               | pass: smoke unchanged since `1e16ba4`                                                                                                                                                                                                                                                                 |
| every changed file in `plan.md` Files               | pass: 12/12                                                                                                                                                                                                                                                                                           |
| interfaces match the plan                           | pass: pick, `--claim`, `--check`, `--list` BOARD, `plan-files.sh --any` exit 4                                                                                                                                                                                                                        |
| eligibility rules kept from the old script          | pass (probed: blocked, owner Human, no `Spec:` line skipped; lowest step among eligible picked). Changes: read from `origin/main` not the working tree; `--list` STATUS is the card status, not the README column; equal steps now tie-break on the whole line, not README order (steps unique today) |
| `set -euo pipefail` abort paths                     | pass (probed): no origin remote, `gh` absent from PATH, `gh` failing, empty Remaining, detached HEAD `--claim`; the `for … [[ ]] && …` in claim does not abort (W15 asserts the message)                                                                                                              |
| Partial no longer pickable                          | accepted: matches backlog/CLAUDE.md "Closing" step 4 (Partial = merged); the old script would re-pick a merged card. 0 Partial cards in history. Cost stated in the plan: a Partial card's new branch is Closing, so it is not counted toward WIP, `--claim` returns 0 and `--check` skips it         |
| `gh` order assumption (`pr_of` takes the first row) | pass: `gh pr list --state all` returns newest first (#62, #61, #60 …); 62 PRs, under `--limit 300`                                                                                                                                                                                                    |
| no secret, no suppression, no `src/`                | pass                                                                                                                                                                                                                                                                                                  |
| one-line revert probes (22 mutants on a copy)       | 15 killed; 7 survive, see [3]                                                                                                                                                                                                                                                                         |

### Findings

```
[1] KIND: correctness
    WHERE: scripts/next-task.sh:130
    DEFECT: `--check` compares tokens only as glob patterns, so two identical paths that contain glob metacharacters
            never collide.
    TRIGGER: B9.5 (Doing) and B9.4 both plan `src/app/[id]/page.tsx`; `scripts/next-task.sh --check B9.4` from
             B9.4's worktree.
    WRONG BEHAVIOUR: exit 0 "B9.4: no overlap with any Doing or Review card". The plan says "two tokens collide when
            equal". `[id]` is a bracket expression matching one character, so neither `"$a" == $t` nor `"$t" == $a`
            matches the literal. No bracketed path exists in history today. A dynamic App Router segment is the
            usual way to add a per-todo route, so the first one passes silently. Fix: test `"$a" == "$t"` first.
    CONFIDENCE: confirmed (ran on a throwaway repo: rc=0, "no overlap")

[2] KIND: plan-mismatch
    WHERE: .claude/skills/work-next/SKILL.md:15-19, .claude/agents/dev-lead.md:30-32
    DEFECT: a resumed card cannot pass the Entry, because `--claim` run from the session checkout treats the card's
            own worktree branch as "another checkout".
    TRIGGER: on this repo, from the session checkout `.claude/worktrees/lucid-bhabha-457da6` (branch
             `docs/B1.18-file-card`), run `.worktrees/feat-b1-18-wip-limit/scripts/next-task.sh --claim B1.18`.
             This is what `/work-next B1.18` does when resuming. The E2 sessions run from `claude/<name>` checkouts
             in the same way.
    WRONG BEHAVIOUR: exit 1 "B1.18 is already held by feat/B1.18-wip-limit; work there or ask the lead". Loop 1 then
            says "report and stop", which contradicts work-next's "Resuming … continue at the first Loop step whose
            artifact is missing". Only a claim run from inside the card worktree returns 0 (W10). Fix (docs): a
            resume skips pick/claim and works in the existing worktree. Alternatively, Loop 1 treats "held by
            `feat/<card>-…`" as a resume when `backlog/work/<card>/` exists on that branch.
    CONFIDENCE: confirmed (ran it: rc=1)

[3] KIND: coverage
    WHERE: scripts/next-task-smoke.sh (probe set W1-W16) against scripts/next-task.sh:103, :121, :66, :124
    DEFECT: several behaviours the plan names have no probe. A one-line revert of each leaves the smoke at 16 ok.
    TRIGGER: on a copy, each mutant applied alone, then `scripts/next-task-smoke.sh`:
             M19 drop `$8 == "eligible" &&` from pick (line 103): 16 ok. Every fixture card is eligible, so the pick
                 never skips a blocked, Human-owned or contract-less card (the old script's core rule).
             M14 `--check` considers Doing only, not Review (line 121): 16 ok (plan: "every Doing/Review card").
             M23 drop the `sort -k1,1n` (line 103): 16 ok (fixture rows are already in step order).
             M20 Review before Doing when a card has two branches (line 66): 16 ok.
             M17 drop the `origin/$b` fallback in `--check` (line 124): 16 ok (no probe with a remote-only branch).
             M6 drop `paper "$t"` (equivalent while `paper "$a"` is kept) and M21 (`GH_OK=0`, equivalent) are
             not counted.
    WRONG BEHAVIOUR: a later edit can make the pick choose an ineligible card, or make `--check` ignore Review cards,
            and the smoke stays green. Add probes: an ineligible lower-step card is skipped (M19, M23 with rows out
            of step order); `--check` hits a Review card's plan (M14); `--check` reads a branch that exists only on
            origin (M17); add W17 for [1] before the fix.
    CONFIDENCE: confirmed (mutation runner on a copy: 15/22 killed, the 5 above survive)
```

Non-blocking notes:

- `git fetch` has no `GIT_TERMINAL_PROMPT=0`. The remote is HTTPS, so a human terminal with expired credentials gets a
  prompt; an agent session has no tty, fails fast and warns.
- Two sessions picking within seconds of each other both get the same card. The plan accepts this: "the branch is
  the claim".
- `--check` against a Doing card with no committed plan yet prints "no overlap". The second card to plan sees the
  first one's plan, so the advisory rule still holds.
- A card started before its row reaches `origin/main` Remaining is not counted toward WIP and is invisible to
  `--check`.
- Calling the script by a relative path from a subdirectory (e.g. `cd scripts && ./next-task.sh --check B1.18`):
  `HERE` resolves after the `cd` to the top level, so `plan-files.sh` is not found and the script reports "has no
  plan at HEAD" [traced, not run].

Verdict: back to test-writer (probes for [1] and [3] first, then code-writer for [1] and the docs fix [2])

Riskiest unfalsified: the race in which two parallel E2 sessions pick or claim the same card before either
`worktree.sh` creates its branch. The design accepts this, and no probe can show the window is small.

### Dispositions (pass 1, dev-lead)

| #   | Finding                                       | Disposition | Evidence                                                                                                       |
| --- | --------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------- |
| 1   | identical bracketed paths never collide       | fix now     | W17 red at 06212fd (rc 0, "no overlap"); fix commit: literal compare first; smoke 21/21                        |
| 2   | resume contradicts "claim, report and stop"   | fix now     | fix commit: dev-lead Loop 1 and work-next "Resuming": no pick or claim, existing worktree                      |
| 3   | 5 surviving mutants (M14, M17, M19, M20, M23) | fix now     | W18–W21 in `bbc2d44` (fixture rows out of order, B9.6 Human, Review plan, origin-only plan)                    |
| N   | fetch without `GIT_TERMINAL_PROMPT=0`         | fix now     | fix commit                                                                                                     |
| N   | relative `HERE`                               | fix now     | `bb7133d`: `HERE` resolves before the `cd` to the top level; `(cd scripts/ci && ../next-task.sh --list)` works |
