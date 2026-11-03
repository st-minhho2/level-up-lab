# B1.65 review

## Plan review (round 1)

SCOPE: tooling (no §; `scripts/agent/`, `backlog/work/B1.65/`). Plan reviewed: `2239e8e docs(backlog): B1.65 plan`.
Contract: the card's Acceptance (`backlog/plan/E1-todos.md` ### B1.65), D-19, D-26, D-27, D-28, D-29, dev-lead Loop 5.
Read: `analysis.md`, `advice.md`, `scripts/agent/run.sh`, `run-smoke.sh`, `eligible.sh`, `tier.sh`,
`scripts/ci/plan-files.sh`, `scripts/next-task.sh`, `.claude/hooks/path-guard.sh`, every role's frontmatter.

Run at `2239e8e`:

- `scripts/agent/tier.sh backlog/work/B1.65/plan.md` → `high` (matches the plan: the lead's `approve`, D-19 label).
- `scripts/ci/plan-files.sh --any B1.65 HEAD` → `scripts/agent/run.sh`, `scripts/agent/run-smoke.sh`,
  `backlog/work/B1.65/*`.
- On a scratch copy (`git archive HEAD`): `/bin/bash scripts/agent/run-smoke.sh` → `15 probes OK`;
  `/bin/bash scripts/agent/tier-smoke.sh` → `9 probes OK` (the plan's baseline holds).
- `scripts/next-task.sh --list` → Doing: B1.57, B1.63, B1.65, B1.62 (4 against `WIP_LIMIT=3`).

| Check                                                                          | Result                                                                                                                                                                                                                      |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the card                                     | pass: three rows, each tied to A1–A7; parallel cards (B1.57, B1.62–B1.64) and `scripts/CLAUDE.md` named as out                                                                                                              |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib | n/a: bash only, no `src/`                                                                                                                                                                                                   |
| plan follows `advice.md` or states the deviation                               | fail: Approach A is named, but the prompt sentence and the test card differ from advice's Q1 and Q4 verdicts with no deviation stated (reasons 1, 3), and Approach A's stated cons are not carried into the plan (reason 4) |
| ≤ 7 criteria, every Then measurable                                            | pass: A1–A7; R16 (a)–(d) pin A1–A3; A4 by `plan-files.sh --run B1.66` exit 0; A5 best effort, stated                                                                                                                        |
| verification lists exact commands with expected numbers                        | pass: red `1 of 16 probes FAILED`, green `16 probes OK` on both bashes, tier-smoke `9 probes OK`, the live command in full. `pnpm test` carries no count; acceptable, nothing it runs changes                               |
| work breakdown skeleton → red → green → map → review                           | fail on order (reason 5). Skeleton and map n/a for tooling; the `test(scripts): …` subject without `(red)` follows B1.43/B1.55 (verify-red.sh has no smoke handling)                                                        |
| `Lead approves spec` box                                                       | n/a: no §. Tier high, so the lead's `approve` is the approval. `Plan approved by:` is empty; the reviewer did not write it                                                                                                  |
| no settled D-n contradicted                                                    | pass: D-27 (only run.sh's prompt changes; interactive sessions keep the gate), D-28 (tier from `tier.sh`), D-19 (label stated), D-26 (runner local)                                                                         |
| `scripts/next-task.sh --check B1.65`                                           | pass: `[next-task] B1.65: no overlap with any Doing or Review card`                                                                                                                                                         |

Verdict: changes requested

1. **No role can deliver B1.66 as the plan specifies it, so the "lead merges the run's draft" ending does not exist.**
   Decision (3) makes B1.66 a docs-only card whose Acceptance names one new file under `docs/`. Every role's
   path-guard (`.claude/agents/*.md` frontmatter) refuses that path: dev-lead `backlog/*`, `docs/metrics.md`,
   `docs/mistake-log.md`; code-writer `src/*`, `prisma/*`, `spec/features-map.md`, `docs/metrics.md`; advisor
   `backlog/work/*`; spec-analyst `spec/contracts/*`, `backlog/*`; test-writer tests and `e2e/*`; reviewer `review.md`.
   A docs-only card also has no red test to put on its `Test:` line. TRIGGER: the live run passes the gate, opens the
   draft and reaches Build (or stops on the 15-turn cap first, the likely case). WRONG BEHAVIOUR: the draft holds
   only plan, review, approval and `pr-body.md`. Merging it does not meet B1.66's Acceptance, and a later run's
   Write to `docs/<x>.md` is blocked. B1.66 then stays Open behind a closed draft, which is advice Q4's "Must not". The
   only remaining path is a Bash write that skips the hook, an honor-floor bypass. advice Q4 named a file under
   `backlog/work/<card>/`, and the plan changes this to `docs/` without saying why. Fix, either: (a) B1.66 is a Tier 0
   card (`backlog/CLAUDE.md`: "Tier 0 cards close with `work/<card>/plan.md` and no code"; dev-lead Loop 2: "the
   plan is the deliverable"), so the capped run's draft is merge-ready as it stands; or (b) its Acceptance names a
   file under `backlog/work/B1.66/` that dev-lead may write. Either way, state who finishes B1.66 if the cap stops
   the run before its deliverable (no third call for B1.65's evidence; a later run at default caps or the lead).
   Also pin B1.66's layout: `_tooling · no §_` as its second line, or `branch_of` names `feat/B1.66-agent` and the
   plan's expected `chore/B1.66-agent` is wrong; and `Depends on:` empty, not B1.65.

2. **The live run will not start under today's WIP, and the plan names no precondition for it.** `run.sh` calls
   `next-task.sh --claim B1.66` before any `claude` call, and `--claim` exits 1 when `n_doing ≥ 3`. Today 4 cards are
   Doing. B1.65 is one of them: its own branch has no PR, and a draft PR still counts as Doing. TRIGGER: the lead runs
   the live command as written after B1.66 merges, with B1.65's PR still a draft and two of B1.57/B1.62/B1.63 still
   in flight. WRONG BEHAVIOUR: `[run] skip #<n>: next-task.sh --claim B1.66 refused`, exit 0, no evidence. No call is
   spent, but step 4 stalls with no stated rule for what to do. Fix: name the precondition (B1.65's PR ready, so it
   counts as Review; `next-task.sh --claim B1.66` prints `may start` in the container clone before the run). Also say
   whether a `run.sh --check-binary` counts against "at most 2 `claude` calls in all". It is needed when the
   container's `claude` is not in `verified-versions`, for example after B1.62 rebuilds the image.

3. **The prompt sentence is not advice's, the deviation is unstated, and the changed wording drops a condition.**
   advice Q1's verdict says "a plan the reviewer approved at tier low or medium proceeds…". It forbids restating more of
   Loop 5 than the card's parenthetical, and it keeps the rest of the prompt byte for byte. The plan's sentence instead
   (a) says "a reviewed plan", (b) lists `tier.sh` and `eligible.sh $n $card` as the conditions, and (c) rewrites
   `; a question` to `. A question`. Loop 5 requires `Verdict: approved` on top of the tier and the eligibility check.
   A prompt that spells out two of the three conditions reads as the complete list. TRIGGER: the reviewer's plan
   review returns `changes requested`, and the run, told only that a "reviewed" plan at tier low with `eligible.sh`
   exit 0 goes on, writes the D-27 line. WRONG BEHAVIOUR: the approval commit and the draft PR land, and the first
   later non-paperwork edit (plan-scope.sh) or CI (`plan-files.sh --run`: "last plan review is not 'Verdict:
   approved'") refuses. The guard holds, but the run spends its turns and opens a draft resting on an invalid
   approval. This is plausible: I could not run a model to falsify it. Fix: adopt advice's sentence, or keep the
   plan's and add the third condition ("whose plan review says `Verdict: approved`"), and state the deviation in
   "Approach".

4. **Approach A's costs are in advice.md, not in the plan the lead approves.** advice "Cons" and "Risks/Run cost"
   list three costs, and the plan's "The lead decides at this gate" names none of them. (i) After this card, every
   eligible low or medium issue under `run.sh --poll` runs past the gate, bounded only by the defaults
   (`RUNNER_MAX_TURNS=150`, `RUNNER_BUDGET_USD=10`, i.e. a 9.75 flag) per issue, up to 3 agent branches. Today it
   stops at the gate. (ii) A run that passes the gate and then hits a limit is commented `limit:<subtype>` with no word
   that the plan was approved. (iii) `outcome: gate` now means "high tier or a refusal", and no probe says so.
   TRIGGER: the lead approves and later runs `--poll` on real issues. WRONG BEHAVIOUR: the lead finds the cost of
   (i) after approval, which the plan-review rule exists to prevent. Fix: one line each under "The lead decides", or a
   stated acceptance.

5. **The diff review comes before the evidence it should judge.** The work breakdown runs step 3 (reviewer, diff)
   before step 4 (live run, `live.md`). TRIGGER: the order as written. WRONG BEHAVIOUR: the reviewer's
   `ready for PR` is issued while A4 and A5, the card's only live acceptance, are absent, and `live.md` lands after
   the last review with nobody checking it against the plan's evidence list (approval commit, `plan-files.sh --run`
   exit 0, no gate line, turns/USD/denials). Fix: add a step 5, a diff review round on `live.md` before the lead
   merges. Step 3 must still come first, because the PR has to be ready (Review) for WIP (reason 2).

Riskiest unfalsified: whether 15 turns and a USD 0.75 flag reach the D-27 approval commit at all. The plan review is a
subagent, whether subagent turns count toward `--max-turns` is [unverified], and a B1.66 run also needs
`next-task --check`, `tier.sh` and `eligible.sh` calls that B1.44 run 4c (9 turns to the gate) never made.

## Plan review (round 2)

SCOPE: tooling (no §; `scripts/agent/`, `backlog/work/B1.65/`). Plan reviewed: `b46f2f0 docs(backlog): B1.65 plan round 2`.
Read: the round-2 plan against round 1's five reasons, `scripts/agent/run.sh`, `run-smoke.sh`, `eligible.sh`, `tier.sh`,
`scripts/ci/plan-files.sh`, `check-plan-scope.sh`, `scripts/next-task.sh`, dev-lead Loop 1–9, `backlog/CLAUDE.md`
(Tier 0), the B1.56, B1.57, B1.63, B1.64 cards on `origin/main` (9781b14).

Run at `b46f2f0`:

- `scripts/agent/tier.sh backlog/work/B1.65/plan.md` → `high`; `scripts/ci/plan-files.sh --any B1.65 HEAD` →
  `scripts/agent/run.sh`, `scripts/agent/run-smoke.sh`, `backlog/work/B1.65/*`.
- `scripts/next-task.sh --list` → Doing: B1.57, B1.63, B1.65, B1.62 (4 against `WIP_LIMIT=3`).
- A scratch plan whose Files table holds only `` `backlog/work/B1.66/*` `` → `tier.sh` prints `low` (B1.66's Test line
  holds).
- `branch_of`'s awk on this checkout for B1.66 → no `_tooling` line (B1.66 is not filed yet and this branch is behind
  `origin/main`), so `run.sh` would pick `feat/B1.66-agent` (note 1).

Round 1's reasons: #1 fixed (B1.66 is Tier 0, Files `backlog/work/B1.66/*` only, `_tooling · no §_`, `Depends on:` —,
an interactive dev-lead finishes a capped run; dev-lead may write every path B1.66 needs). #2 fixed (precondition
named; `--check-binary` and a retry count against the 2 calls). #3 fixed (the sentence names `Verdict: approved`,
`tier.sh`, `eligible.sh $n $card`; `; a question` is kept; the deviation from advice Q1 is stated). #4 fixed
("Accepted costs" carries all three). #5 fixed (step 6, a diff review on `live.md`, after step 5).

| Check                                                                          | Result                                                                                                                                                                                                               |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the card                                     | pass: three rows tied to A1–A7; B1.66's filing is its own lane PR (step 0), not in this Files table; parallel cards and `scripts/CLAUDE.md` named as out                                                             |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib | n/a: bash only, no `src/`                                                                                                                                                                                            |
| plan follows `advice.md` or states the deviation                               | pass: Approach A; the sentence's deviation from advice Q1 and its reason are stated (decision 1); the Tier 0 test card replaces Q4's docs-only card with the reason (r1 #1); Approach B named as a follow-up at most |
| ≤ 7 criteria, every Then measurable                                            | pass: A1–A7; R16 pins A1–A3 as a whole literal plus the opening, the old sentence and the header; A4 by the approval commit and `plan-files.sh --run B1.66` exit 0; A5 best effort, `[unverified]` if capped         |
| verification lists exact commands with expected numbers                        | pass: red `1 of 16 probes FAILED` (matches `run-smoke.sh`'s summary format), green `16 probes OK` on bash 3.2 and 5.2, tier-smoke 9 OK, the live command in full with caps                                           |
| work breakdown skeleton → red → green → map → review                           | pass: skeleton and map n/a for tooling; red `test(scripts): …`, green `chore(scripts): …` (B1.55/B1.58 precedent), diff review, ready, live, review on `live.md`                                                     |
| `Lead approves spec` box                                                       | n/a: no §. Tier high, so the lead's `approve` is the approval; `Plan approved by:` is empty and the reviewer did not write it                                                                                        |
| no settled D-n contradicted                                                    | pass: D-27 (only the runner's prompt changes; interactive sessions keep the gate), D-28 (tier from `tier.sh`), D-19 (label), D-26 (local runner), D-29 untouched                                                     |
| `scripts/next-task.sh --check B1.65`                                           | pass: `[next-task] B1.65: no overlap with any Doing or Review card`                                                                                                                                                  |

Verdict: approved

Costs and preconditions the lead takes on with this plan (none breaks A4 or leaves a role unable to do its step; each
is a line the lead may add at the gate):

1. **Which branch B1.66 runs on depends on the container clone's files, not `origin/main`.** `branch_of`
   (`run.sh:153`) reads `backlog/plan/*.md` in the clone's checkout (`cd "$ROOT"`, line 18). TRIGGER: the filing PR
   for B1.66 merges after B1.65's branch last merged `origin/main` (Loop 9, step 4), and the clone sits on that
   branch. Result: the run claims and works on `feat/B1.66-agent`, not the plan's `chore/B1.66-agent`. A4 still
   holds: `plan-files.sh --run` and `check-plan-scope.sh` accept any `<prefix>/B1.66-agent`. But the evidence lands
   on a branch the plan does not name, and step 6 would have to read that as a plan mismatch. Confirmed: B1.66 is
   absent from this checkout and `HEAD` is behind `origin/main`. Fix: a precondition, "the clone's branch contains
   the B1.66 filing merge", or accept either prefix in the live evidence.
2. **B1.65 reaching Review does not free a WIP slot by itself.** With B1.65 in Review, Doing is still B1.57, B1.62,
   B1.63 (3 ≥ 3). So `--claim B1.66` waits until one of them reaches Review or merges. Until then B1.65's PR is
   ready but must stay unmerged: A4 and A5 are unproven, and step 6 has not run. The plan's conjunction ("ready
   and `may start`") is correct, but the wait is open-ended, and nothing in the PR body is planned to say "hold the
   merge".
3. **The prompt now restates Loop 5's conditions (advice Q1's "two sources of truth").** R16 pins `run.sh`'s text
   only. A later change to Loop 5's conditions in `.claude/agents/dev-lead.md` fails no probe and leaves the run with
   two lists. B1.56 (resume on an issue `approve`) is the first card likely to touch both. The guards still refuse a
   wrong approval (`plan-files.sh --run`), so the cost is turns, not an invalid merge. The plan states the deviation
   and why. This is named so the lead accepts the drift too.
4. The plan is 82 lines against `planning.md`'s ≈ 40. Precedent: B1.55 had 81 lines and B1.58 had 113, both approved.
   Not blocking.

Riskiest unfalsified: whether 15 turns and a USD 0.75 flag reach B1.66's D-27 approval commit inside the container.
No `run.sh <issue>` has yet made a worktree there (B1.58 proved only `--check-binary`), the effect of a missing
`node_modules` on the run's commit hooks is [unverified], and whether the plan-review subagent's turns count toward
`--max-turns` is [unverified].
