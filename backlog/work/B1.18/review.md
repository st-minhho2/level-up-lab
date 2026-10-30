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
