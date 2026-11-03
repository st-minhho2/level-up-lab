# B1.57 review

## Plan review (round 1)

SCOPE: tooling (no §; `scripts/metrics/`, `scripts/*-smoke.sh`, `lefthook.yml`, docs). Plan reviewed: `5ea45e9
docs(backlog): B1.57 plan`. Contract: D-29, the card's Acceptance (`backlog/plan/E1-todos.md` ### B1.57), D-19,
D-27, D-28. `scripts/agent/tier.sh backlog/work/B1.57/plan.md` → `high`, which matches the plan's own claim (the
lead's `approve`, `config-change-approved`). Baselines run here under `/bin/bash` 3.2: `metrics-smoke.sh` → `27 ok,
0 FAIL`; `githooks-smoke.sh` → `6 ok, 0 FAIL`; `hook-smoke.sh` → `511 probes OK`.

| Check                                                                          | Result                                                                                                                                                                                                                                                                    |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the card                                     | pass: all 7 rows map to an Acceptance clause (two scripts, the mark and its probe, the metrics rows, D-19). `scripts/agent/*` is left untouched (B1.63–B1.65 hold it)                                                                                                     |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib | n/a: bash only, no `src/`                                                                                                                                                                                                                                                 |
| plan follows `advice.md` or states the deviation                               | pass: tier quick, no advisor, stated in line 3                                                                                                                                                                                                                            |
| ≤ 7 criteria, every Then measurable                                            | fail: M34 and M36 make a closed, unmerged agent PR undecidable (reason 3), and the summary the lead approves contradicts the analysis (reason 5). Note: the plan is 66 lines, against planning.md's ≈ 40. B1.55 (81 lines) is the precedent, so this is not a reason here |
| verification lists exact commands with expected numbers                        | fail: reason 7                                                                                                                                                                                                                                                            |
| work breakdown skeleton → red → green → map → review                           | fail: red → green → review, and skeleton and map are n/a for tooling, but the red subject carries `(red)`, which fails CI (reason 1)                                                                                                                                      |
| `Lead approves spec` box                                                       | n/a: no §. Tier high, so the lead's `approve` at the gate is the approval. `Plan approved by:` is empty and the reviewer did not write it                                                                                                                                 |
| no settled D-n contradicted                                                    | fail: D-29 says "no **lead** message" and "no **lead** change request", but Q4 and Q7 count any non-runner poster, including the `review.yml` bot (reason 2). D-19 is stated. D-26 is untouched. D-27 high-tier gate: reason 4                                            |
| `scripts/next-task.sh --check B1.57`                                           | pass: `[next-task] B1.57: no overlap with any Doing or Review card`                                                                                                                                                                                                       |

Verdict: changes requested

1. **The red subject makes CI's red gate fail.** Step 1 commits `test(scripts): B1.57 unattended and no-rework probes
(red)`. CI's `test(...) commits are red for the right reason` step (`ci.yml:180-182`, every PR) runs
   `scripts/verify-red.sh --auto`. That step picks every `test(...): B<e>.<n> … (red)` subject (`verify-red.sh:47`)
   and returns 1 when those commits touch no `*.test.ts(x)` file (`verify-red.sh:79-82`: "::error::test(B1.57)
   commits touch no *.test.ts(x) file"). TRIGGER: the PR with the plan's red commit, which touches only
   `scripts/metrics-smoke.sh` and `scripts/githooks-smoke.sh`. WRONG BEHAVIOUR: the required CI job is red on a correct
   change. Every earlier tooling card used a subject without the marker: `bc11ca9 test(scripts): B1.55 D-27 approval
probes`, `69ce71a test(scripts): B1.58 sandbox probes` (B1.55 review: "follows the B1.43 precedent"). Fix: drop
   `(red)` and keep the "Red because" body. The red evidence is the smoke output before and after. CONFIDENCE:
   confirmed (traced in `verify-red.sh`; a probe commit on a scratch clone was refused by the sandbox).

2. **A bot's comment counts as a lead message, so once the review bot's key is set every agent PR reads `no`.** Q4
   ("whoever posts it") and Q7 ("any PR comment or review after ready not from the runner") exclude only the runner's
   body prefix. `.github/workflows/review.yml` runs on `ready_for_review` for a non-draft PR and always ends with one
   `gh pr comment` ("No blocking issues found." or "Blocking issues: N"), plus inline review comments. TRIGGER: the
   repository secret `ANTHROPIC_API_KEY` is configured (absent today: PRs #150, #160, #165, #171, #177 hold 0
   comments), and an agent PR goes ready. WRONG BEHAVIOUR: `no-rework.sh` lists the bot comment as a change request
   and the PR as `no`. The same bot comment lands after every re-ready of a BEHIND PR. D-29 says "lead". Fix: count
   only `user.type == "User"` (or the lead's login) and probe a `Bot` comment after ready → still `yes`. The lead may
   instead accept the cost, but must do so in "The lead decides". CONFIDENCE: confirmed (traced: the rule as written
   plus the workflow's trigger. The trigger depends on the secret).

3. **A closed, unmerged agent PR is "pending" forever and outside the share.** Q9 says "A PR not merged → `pending`,
   out of the share". The default set takes only merged PRs. `pr view --json mergedAt,isDraft,createdAt` carries no
   `state`/`closed`, so the script cannot tell closed from open. TRIGGER: the lead closes an agent PR without merging
   it (rejected, or rebuilt by hand), then runs `no-rework.sh` with the batch's PR numbers, or with no arguments.
   WRONG BEHAVIOUR: the PR the lead rejected (the strongest form of rework) is either invisible (default) or
   `pending` (explicit). Either way it never lowers the D-29 share. Q6 already treats the matching issue case (closed,
   no ready PR) as counted, so the two scripts disagree. Fix: add `state` to the `pr view` fields, treat closed
   unmerged as `no` (counted) or as a named exclusion with the cost stated, and add the case to M36. CONFIDENCE:
   confirmed (read from the plan's Interfaces and Q9).

4. **Only an exact `approve` is excepted, but the lead's approvals on high-tier plans carry decisions.** Q5 excepts a
   comment whose trimmed body is exactly `approve`. A high-tier plan here always has a "The lead decides at this
   gate" list, this one included (Q1–Q10). The lead's recorded approval of the last high-tier tooling card reads
   `approve; decisions 1–3 as proposed` (B1.55 status line). TRIGGER: on a high-tier `agent-ready` issue, after the
   runner's `**gate**` / `- tier: high` comment, the lead comments `approve; Q1 as proposed`. WRONG BEHAVIOUR: the
   comment counts as a lead message, so the issue is `no`. In practice D-29's "expected high-tier gate stop excepted"
   then never applies. How a run reads the comment is a stated follow-up, but this rule fixes the format in advance.
   Fix: except the first lead comment after a high-tier gate comment that starts with `approve` (word boundary), or
   state the cost in "The lead decides". CONFIDENCE: plausible (no high-tier run has resumed yet. #166 closed at its
   gate).

5. **The decision summary the lead approves contradicts the analysis it points to.** The plan asks the lead to approve
   "analysis Q1–Q10 as proposed". The plan's Q1 summary and Files row say `--if-exists replace`, but `analysis.md` Q1
   says `--if-exists doNothing`. The summary lists Q1–Q9 and leaves out Q10 (the share format and `n/a`). TRIGGER:
   the lead replies `approve`. WRONG BEHAVIOUR: two different trailer behaviours are approved. They differ when the
   message already holds an `Agent-Run:` line, for example a human amend that keeps a run's message, or a run
   re-committing one. G7 probes one of them. Fix: pick one, make plan and analysis say the same, and add Q10 to the
   summary. CONFIDENCE: confirmed (read).

6. **The default sets do not state a `--limit`, and `gh`'s default is 30.** The interfaces read "every issue labeled
   agent-ready (gh issue list --state all)" and "pr list --state all (head ref)", and the gh shim is exact, so the
   plan fixes these argument strings. TRIGGER: more than 30 PRs exist after the newest agent PR (the repo is at #177).
   WRONG BEHAVIOUR: `gh pr list --state all` returns the 30 newest and older `-agent` PRs drop out of the default set
   without a message. The same happens to issues as the agent-ready count grows. `change-failure-rate.sh:27` uses
   `--limit 1000`. Fix: put `--label agent-ready --limit 1000` and `--limit 1000` in the interface strings, plus a
   probe that the shim denies a call without them. CONFIDENCE: plausible (an implementation could add it, but the
   plan's shim strings as written do not).

7. **The verification has gaps in its numbers.** "`hook-smoke.sh` OK unchanged count" names no number. Today the
   count is `hook-smoke: 511 probes OK`. The red bullet leaves out G8, which passes at red (no job adds no
   trailer), so the expected red line is `githooks-smoke: 7 ok, 1 FAIL`. The metrics-smoke red line is
   `27 ok, <k> FAIL`, with k stated. "37 ok" means 10 new ok lines from eight ids, so name which ids print two.
   TRIGGER: the diff review compares the output to the plan. WRONG BEHAVIOUR: no number to compare against. Fix: write
   the three numbers. CONFIDENCE: confirmed (ran the three smokes here).

Riskiest unfalsified: whether `git merge` (clean, `--no-edit`) and a conflicted merge concluded with `git commit`
both reach the lefthook `commit-msg` job inside the runner container's fresh clone (B1.58 volume, hooks installed by
`pnpm install`), so that the BEHIND round trip's merge carries the trailer. G7 probes this on the host only.
