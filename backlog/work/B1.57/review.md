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

## Plan review (round 2)

SCOPE: tooling (no §). Plan reviewed: `fedb423 docs(backlog): B1.57 plan round 2 after plan review` (69 lines; the
B1.55 precedent from round 1 still applies). `scripts/agent/tier.sh backlog/work/B1.57/plan.md` → `high`, matching
the plan. Baselines re-run here under `/bin/bash` 3.2: `metrics-smoke: 27 ok, 0 FAIL`, `githooks-smoke: 6 ok, 0
FAIL`, `hook-smoke: 511 probes OK`. These match the plan's red lines (27 ok + 8 FAIL, 7 ok + 1 FAIL, 511).

Round 1 reasons: 1 (`(red)` dropped), 3 (`state` added, closed unmerged → `no`, M36), 5 (analysis Q1 now says
`replace`, Q10 is in the summary), 6 (`--limit 1000` in both default sets, M37) and 7 (all three numbers stated) are
resolved. Reason 4 is resolved (`^approve([^A-Za-z]|$)`, M32). Reason 2 is resolved in the rule but not in the
probes (reason 3 below).

| Check                                                                          | Result                                                                                                                                                        |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the card                                     | pass: the same 7 rows, each tied to an Acceptance clause; `scripts/agent/*` untouched                                                                         |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib | n/a: bash only, no `src/`                                                                                                                                     |
| plan follows `advice.md` or states the deviation                               | pass: tier quick, no advisor, stated                                                                                                                          |
| ≤ 7 criteria, every Then measurable                                            | fail: the clean-merge Then of G7 is met by a commit git does not read as a trailer (reason 1); the bot rule of no-rework has no Then (reason 3)               |
| verification lists exact commands with expected numbers                        | pass: red `27 ok, 8 FAIL` / `7 ok, 1 FAIL` / `511`, green `35 ok, 0 FAIL` / `8 ok, 0 FAIL` / `511`, denied.log empty; consistent with the baselines run here  |
| work breakdown skeleton → red → green → map → review                           | pass: red → green → review; skeleton and map n/a for tooling; the red subject carries no `(red)`                                                              |
| `Lead approves spec` box                                                       | n/a: no §. Tier high, so the lead's `approve` is the approval. `Plan approved by:` is empty; the reviewer did not write it                                    |
| no settled D-n contradicted                                                    | pass with costs: D-29 "lead" now means a `User` account; D-19 stated; the costs in reasons 2 and 4 bear on D-29's share and are not yet in "The lead decides" |
| `scripts/next-task.sh --check B1.57`                                           | pass: `[next-task] B1.57: no overlap with any Doing or Review card`                                                                                           |

Verdict: changes requested

1. **The planned `commit-msg` command does not make a git trailer on a clean merge, the exact commit a run makes on
   a BEHIND PR.** At `commit-msg` time, `git merge` (with `--no-edit`, or headless without a TTY as in dev-lead Loop
   9's `git merge origin/main`) leaves `.git/MERGE_MSG` without a final newline. `git interpret-trailers --in-place
--if-exists replace --trailer "Agent-Run: 7"` then appends the line straight under the subject, with no blank line.
   TRIGGER: in a scratch repo (git 2.39.5, the host's), a `commit-msg` hook running exactly that command with
   `RUNNER_CHILD=7`, then `git merge --no-edit side` on diverged branches. WRONG BEHAVIOUR: the commit bytes are
   `Merge branch 't3'\nAgent-Run: 7\n`. `git log --format=%s` prints `Merge branch 't3' Agent-Run: 7`, and
   `%(trailers:key=Agent-Run)` prints nothing. A plain commit (`-m`) and a conflicted merge concluded by `git commit`
   do get a real trailer. G7 passes or fails depending on how it reads the commit (a grep passes, git's trailer
   parser fails). `--if-exists replace` also never finds this line again. Fix: the job adds a final newline when the
   file lacks one before `interpret-trailers`, and G7 asserts with `git log -1 --format='%(trailers:key=Agent-Run,valueonly)'` = `7`
   and `%s` unchanged for all three cases. CONFIDENCE: confirmed (ran it: scratchpad `hookprobe4`).

2. **`git revert` and `git cherry-pick` never run `commit-msg`, so a run's revert after ready counts as a human
   commit.** The sequencer skips `commit-msg` unless the message is edited. TRIGGER: the same scratch hook with
   `RUNNER_CHILD=7`, then `git revert --no-edit HEAD` or `git cherry-pick side`. WRONG BEHAVIOUR: the hook log stays
   empty and the commit has no `Agent-Run` line. A run that reverts its own commit after ready (a review fix) makes
   `no-rework.sh` list that commit as human and mark the PR `no`. `prepare-commit-msg` does run for both (probed:
   `pcm ran: .git/COMMIT_EDITMSG message`) and for merges. Fix: move the job to `prepare-commit-msg` (the same newline
   care), with a G7 case for `git revert --no-edit`. Or keep `commit-msg` and add this cost to "The lead decides".
   CONFIDENCE: confirmed for the hook not running; plausible that a run reverts after ready.

3. **The bot exclusion is probed only where the bot never comments.** `.github/workflows/review.yml` runs on
   `ready_for_review`, so its `github-actions[bot]` comment always lands after ready. That is no-rework's window, not
   unattended's. M30 probes "a bot comment → yes" for `unattended.sh` only. M36 has no bot case. TRIGGER: in the
   green diff, drop the `user.type == "User"` filter from `no-rework.sh` only. WRONG BEHAVIOUR: every planned probe
   stays green, yet once `ANTHROPIC_API_KEY` is set every agent PR reads `no` (round 1 reason 2's exact trigger).
   Fix: add to M36 "a `Bot` comment after ready → still `yes`". CONFIDENCE: confirmed (read from the plan's M30 and M36
   lists).

4. **The default unattended set counts only issues that still carry the label, so a run the lead stopped by
   unlabeling drops out of the denominator.** `gh issue list --label agent-ready --state all` filters on current
   labels. `eligible.sh` treats a removed label as "not eligible", so unlabeling is a natural way to keep `--poll`
   off an issue. TRIGGER: an issue's run stops (gate, error or limit), the lead removes `agent-ready` and closes the
   issue, then runs `unattended.sh` with no arguments. WRONG BEHAVIOUR: the issue is not listed at all, where Q6 says
   a closed issue with no ready PR counts as `no`. Each such failure raises the D-29 share. Fix: build the default
   set from every issue (`--state all --limit 1000`) whose timeline holds a `labeled agent-ready` event, since no
   `gh` filter reads label history, with a probe. Or state the exclusion in "The lead decides". CONFIDENCE: plausible (the filter semantics are GitHub's documented behaviour; whether the
   lead unlabels is not known).

Note (not a reason): the timeline's `reviewed` event carries `submitted_at`, not `created_at` (live #171/#166 hold
no review, so not checked here). The shim fixtures should copy that field shape, or M31/M36's review cases pass on
a field the API never sends.

Riskiest unfalsified: whether the lefthook `commit-msg` (or `prepare-commit-msg`) job fires inside the runner
container's clone (B1.58 image, hooks installed by `pnpm install` with the Linux lefthook binary). G7 runs on the
host only, and so far no run has committed in the container.

## Diff review (round 1)

SCOPE: tooling (no §; `scripts/metrics/`, `scripts/*-smoke.sh`, `lefthook.yml`, docs). Range `main...a6174ff`: red
`920221e`, probe fix `f1b29d0`, green `a6174ff`. Contract: D-29, the card's Acceptance, the analysis rulings Q1–Q10
(approved by the lead with the plan). Host: `/bin/bash` 3.2.57, git 2.39.5, jq 1.7.1, gh 2.103.2, lefthook 2.2.2.

### Commands (last line of each, run here)

| Command                              | Result                                                                                                                      |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                          | `All matched files use Prettier code style!` (rc 0)                                                                         |
| `pnpm typecheck`                     | `tsc --noEmit` (rc 0)                                                                                                       |
| `pnpm test`                          | `Tests  202 passed (202)`                                                                                                   |
| `pnpm test:e2e`                      | `43 passed (1.1m)`                                                                                                          |
| `pnpm test:mutation`                 | `Final mutation score of 93.40 is greater than or equal to break threshold 70`                                              |
| `scripts/ci/check-suppressions.sh`   | `OK: no new suppressions`                                                                                                   |
| `scripts/ci/check-config-change.sh`  | `::error::… without the 'config-change-approved' label: lefthook.yml` (expected locally; the PR must carry the label, D-19) |
| `scripts/ci/check-feat-commits.sh`   | `OK: no feat commit touches tests`                                                                                          |
| `scripts/ci/check-ac-coverage.sh`    | `OK: every criterion of a shipped section has a test`                                                                       |
| `scripts/ci/check-spec-sections.sh`  | `OK: sections cited: 1 … 22`                                                                                                |
| `scripts/ci/check-features-map.sh`   | `OK`                                                                                                                        |
| `scripts/verify-red.sh B1.57`        | `::error::no 'test(<pkg>): B1.57 … (red)' commit` (the plan's stated tooling precedent; `--auto`: `nothing to verify`)      |
| `scripts/metrics-smoke.sh`           | `35 ok, 0 FAIL` (red `920221e` and `f1b29d0`, run from `git archive`: `27 ok, 8 FAIL`, M30–M37)                             |
| `scripts/githooks-smoke.sh`          | `8 ok, 0 FAIL` (red, both test commits: `7 ok, 1 FAIL`, G7)                                                                 |
| `scripts/hook-smoke.sh`              | `511 probes OK`                                                                                                             |
| `scripts/next-task.sh --check B1.57` | `no overlap with any Doing or Review card`                                                                                  |
| live `unattended.sh`                 | #166 `no`, #184 (B1.66, new since the plan) `pending`; `unattended 0/1 = 0.0 % (pending 1)`                                 |
| live `no-rework.sh 170 171`          | #170 `no` (15 shas), #171 `yes`; `no-rework 1/2 = 50.0 % (pending 0)`                                                       |
| `git diff --stat main...HEAD`        | 11 files, 695 insertions, 23 deletions                                                                                      |

### Checklist

| Check                                                | Result                                                                                                                                                                                                                                                                                                                                                                                                   |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every Acceptance clause has a probe matching it      | pass: two scripts (M30–M37), the mark (G7–G8), the metrics rows, D-19 label (stated in the PR body)                                                                                                                                                                                                                                                                                                      |
| no test weakened after red                           | pass: one test commit after red, `f1b29d0`, explained. G7's `%(trailers:…,valueonly)` ends the value with a newline, so the red probe could never equal `7\|<subject>`; `separator=%x2C` still prints `7,7` for a duplicate. M37 moved from no-rework's column 5 (human_commits) to its column 3 (ready) and added unattended's #505 ready: stronger. No merge in range                                  |
| every changed file in `plan.md`                      | pass: the 7 Files rows plus `backlog/work/B1.57/*` paperwork                                                                                                                                                                                                                                                                                                                                             |
| interfaces match the plan                            | pass: argument strings, TSV headers, share lines and the shim's pinned `gh` calls as in "Interfaces touched"                                                                                                                                                                                                                                                                                             |
| `src/`, Zod, Prisma, SQL, migration                  | n/a: no `src/` or `prisma/` change                                                                                                                                                                                                                                                                                                                                                                       |
| no secret, no suppression                            | pass                                                                                                                                                                                                                                                                                                                                                                                                     |
| features map                                         | n/a: tooling, no feature row                                                                                                                                                                                                                                                                                                                                                                             |
| gh `--jq` (gojq) = jq (smoke)                        | pass: the TL filter through `gh api --paginate --jq` and through `jq` on the slurped raw timeline give byte-identical output for #166, #170, #171; 14 edge strings (`\A`, `\z`, `\s`, CRLF, `approved`, `Approve`, `approve\n`) give the same three booleans in both engines                                                                                                                             |
| timeline covers every PR commit                      | pass for merges of main: #171's timeline holds 17 `committed` events = `gh pr view --json commits` 17, and its merge of `origin/main` appears once, not the commits it brought in                                                                                                                                                                                                                        |
| prepare-commit-msg reaches checkouts                 | traced: shared `.git/hooks` has no `prepare-commit-msg` today (`no_auto_install: true`); `worktree.sh:101` runs `pnpm install` → `install-hooks.sh` for every run worktree, and a later `lefthook install` from an older config does not delete it (probed on a scratch repo)                                                                                                                            |
| would a test fail if one changed line were reverted? | **fail**: on a copy, 12 of 22 single-line mutants keep `metrics-smoke 35 ok` / `githooks-smoke 8 ok` (findings 1–5, plus the dead runner exclusion and unattended's `<=` vs `<` label boundary, not findings). 10 killed: User/Bot filters (both), trailer test, ready lower bound of human commits, closed-unmerged, first-ready (unattended), both window bounds of unattended, gate set, newline line |

### Findings

```
[1] KIND: coverage
    WHERE: scripts/metrics/no-rework.sh:43-46
    DEFECT: the change-request window (after ready, before the merge) and the human-commit merge bound are not
            pinned by any probe.
    TRIGGER: on the copy, delete `&& $2 > r` from the asks line, or replace `(m == "-" || $2 < m)` /
             `(m == "-" || $2 <= m)` by `1`; then a merged agent PR with a lead comment on the draft before ready
             (the lead watching a run) or a lead "thanks" comment after the merge.
    WRONG BEHAVIOUR: each mutant prints that PR `no` (D-29: a request counts only after ready; Q7 "after ready"),
                     yet metrics-smoke stays `35 ok, 0 FAIL`: no PR fixture holds a user comment before ready or after
                     the merge. The shipped code is correct on both inputs (traced).
    CONFIDENCE: confirmed (ran the three mutants)

[2] KIND: coverage
    WHERE: scripts/metrics/unattended.sh:50-51, scripts/metrics/no-rework.sh:38,42
    DEFECT: Q2's fallback (a PR never drafted: ready = createdAt) is unprobed in both scripts.
    TRIGGER: on the copy, make the fallback always `-` (unattended: `--jq '"-"'`; no-rework: `ready="${ready:--}"`);
             input: a merged, non-draft agent PR with no `ready_for_review` event.
    WRONG BEHAVIOUR: unattended reads the issue `no` (closed) or `pending`; no-rework prints ready `-` and drops
                     every human commit (`r != "-"` guard), so a reworked PR reads `yes`. Suite stays 35 ok: the only
                     non-draft PR without a ready event (#609) is OPEN and only its verdict column is asserted.
    CONFIDENCE: confirmed (ran both mutants)

[3] KIND: coverage
    WHERE: scripts/metrics/unattended.sh:58-61
    DEFECT: Q5's "one approve per gate comment" is unprobed.
    TRIGGER: on the copy, change `$6 == "approve" && gate { gate = 0; next }` to `{ next }`, or
             `$6 == "runner" { gate = 0; next }` to `{ next }`; input: a high-tier gate comment followed by two lead
             comments `approve` and `approve, but also add X`.
    WRONG BEHAVIOUR: the mutants except both comments, messages 0, `yes`; Q5 excepts one, so 1, `no`. Suite stays
                     35 ok (#503 has one approve).
    CONFIDENCE: confirmed (ran both mutants)

[4] KIND: coverage
    WHERE: scripts/metrics/unattended.sh:44, :53
    DEFECT: Q3's "latest label at or before ready" bound and the "highest-numbered agent PR" pick are unprobed.
    TRIGGER: on the copy, replace `(r == "-" || $2 <= r)` by `1`, or `sort -n | tail -1` by `head -1`; input: an
             issue relabeled `agent-ready` after its PR went ready (a re-run), or two `chore/<card>-agent` PRs.
    WRONG BEHAVIOUR: the first mutant opens the window after ready, so every message between the first label and
                     ready drops and a `no` reads `yes`; the second measures the stale PR. Suite stays 35 ok (#505's
                     labels all precede ready; one agent PR per card, #611's head does not match).
    CONFIDENCE: confirmed (ran both mutants)

[5] KIND: coverage
    WHERE: lefthook.yml:56
    DEFECT: Q1's "one trailer, a stale one replaced" (`--if-exists replace`) is unprobed.
    TRIGGER: on the copy, `--if-exists add`; input: `RUNNER_CHILD=7 git commit --amend --no-edit` on a commit that
             already carries `Agent-Run: 7`.
    WRONG BEHAVIOUR: the message carries two `Agent-Run:` lines (`mark` would print `7,7`); githooks-smoke stays
                     `8 ok, 0 FAIL` because none of G7's five cases starts from a message with the trailer.
    CONFIDENCE: confirmed (ran the mutant)
```

Not findings: `no-rework.sh:46` excludes runner comments on a PR, which cannot occur today (`run.sh` comments only on
the issue; a run's tools allow `gh pr edit|checks|view`, not `gh pr comment`); dead but harmless. `IFS=<tab> read`
collapses empty fields, but every field of that line is non-empty (`-` placeholders), so no shift. ISO comparisons
hold: REST, GraphQL and `committer.date` all return `…Z` UTC (live #171).

Verdict: back to test-writer (probes only: add the inputs of findings 1–5 to M33/M35/M36/G7 or new ids; the shipped
code gives the ruled answer on each, traced, so no `chore(scripts)` change is expected).

Riskiest unfalsified: the `prepare-commit-msg` job inside the runner container (Linux lefthook, B1.58 image): traced
to be installed by `worktree.sh`'s `pnpm install` for each run, never executed there. Second: Q8 reads the
committer date, so a human commit made on the draft and pushed after ready is not counted (D-29 literal, accepted).

## Diff review (round 2)

SCOPE: tooling (no §; `scripts/metrics/`, `scripts/*-smoke.sh`, `lefthook.yml`, docs). Range `main...10989e0`. New since
round 1: `6747d8f test(scripts): B1.57 review pass 1 -- M38-M41, G9` (38 insertions, 0 deletions, only the two smoke
files); no script, `lefthook.yml` or doc change. Same host as round 1.

### Commands (last line of each, run here)

| Command                              | Result                                                                                                                    |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                          | `All matched files use Prettier code style!` (rc 0; 1 eslint warning in `src/components/todo-form.tsx`, not in this diff) |
| `pnpm typecheck`                     | `tsc --noEmit` (rc 0)                                                                                                     |
| `pnpm test`                          | `Tests  202 passed (202)`                                                                                                 |
| `pnpm test:e2e`                      | `43 passed (1.5m)`                                                                                                        |
| `pnpm test:mutation`                 | `Final mutation score of 93.40 is greater than or equal to break threshold 70`                                            |
| `scripts/ci/check-suppressions.sh`   | `OK: no new suppressions`                                                                                                 |
| `scripts/ci/check-config-change.sh`  | rc 1, `lefthook.yml` (expected locally; the PR carries `config-change-approved`, D-19)                                    |
| `scripts/ci/check-feat-commits.sh`   | `OK: no feat commit touches tests`                                                                                        |
| `scripts/ci/check-ac-coverage.sh`    | `OK: every criterion of a shipped section has a test`                                                                     |
| `scripts/ci/check-spec-sections.sh`  | `OK: sections cited: 1 … 22`                                                                                              |
| `scripts/ci/check-features-map.sh`   | `OK`                                                                                                                      |
| `scripts/verify-red.sh B1.57`        | `::error::no 'test(<pkg>): B1.57 … (red)' commit` (tooling precedent, plan r1 #1); `--auto`: `nothing to verify`, rc 0    |
| `scripts/metrics-smoke.sh`           | `39 ok, 0 FAIL`                                                                                                           |
| `scripts/githooks-smoke.sh`          | `9 ok, 0 FAIL`                                                                                                            |
| `scripts/hook-smoke.sh`              | `511 probes OK`                                                                                                           |
| `scripts/next-task.sh --check B1.57` | `no overlap with any Doing or Review card`                                                                                |
| `git diff --stat main...HEAD`        | 11 files, 846 insertions, 23 deletions                                                                                    |

### Checklist

| Check                                                | Result                                                                                                                                                                                                                                                                                                                                                                           |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| no test weakened after red                           | pass: after `920221e`, `f1b29d0` (explained in round 1) and `6747d8f` (additions only). No merge in range                                                                                                                                                                                                                                                                        |
| every changed file in `plan.md`                      | pass: unchanged since round 1                                                                                                                                                                                                                                                                                                                                                    |
| M34/M36/M37 after the prs.json append                | pass: the append (line 384) comes after `u-default` (358), `n-default` (369) and every read of them (M34–M37, 360–381). No default-set run happens after it, so those three probes assert exactly what they asserted in round 1, and all three still pass. Cost: no default-set run sees #612–#616, which no ruling needs                                                        |
| G9 setup amending G8's commit                        | pass: G8 is asserted at line 102, before the amend at 103, so G8's verdict does not change. The setup line counts a FAIL if it misses but no ok, and checks "an amend under a run adds the trailer". Harmless                                                                                                                                                                    |
| would a test fail if one changed line were reverted? | **fail for 1 of 10**: on a copy, I re-ran all ten mutants named in round 1's findings 1–5 plus `--if-exists doNothing`. 10 of 11 are killed: M38 ×3 (it also kills the asks merge bound), M39 ×2, M40, M41 ×2, G9 ×2. `unattended.sh:59` `$6 == "runner" { gate = 0; next }` → `{ next }` still gives `39 ok, 0 FAIL` (finding 1). The fix commit's "7 of 7 checked" left it out |
| docs                                                 | note: `scripts/CLAUDE.md:29,34` still say M1–M37 and G1–G8, but the smokes now hold M41 and G9. `pr-body.md` says `35 ok`/`8 ok` (the dev-lead refreshes it). On main the range already lagged (M1–M25 with M26–M29 present), so this is not a reason                                                                                                                            |

### Findings

```
[1] KIND: coverage
    WHERE: scripts/metrics/unattended.sh:59
    DEFECT: the rule that a later runner comment closes a high-tier gate (so a following `approve` counts) is pinned
            by no probe, and Q5 does not rule it either way.
    TRIGGER: on the copy, `$6 == "runner" { gate = 0; next }` → `$6 == "runner" { next }`; input: label 01:00, runner
             `**gate**` + `- tier: high` 01:20, runner `**error**` comment 01:30 (a re-run after the gate that errored;
             run.sh posts one comment per run), lead `approve` 01:40, PR ready 03:00.
    WRONG BEHAVIOUR: shipped code: messages 1, `no`. Mutant: 0, `yes`. metrics-smoke stays `39 ok, 0 FAIL` for both,
                     so this line can be reverted unseen. Round 1 finding 3 named this mutant, and M40 kills only its
                     sibling. Q5 says "excepted only when a runner comment with **gate** and tier high precedes it ... one
                     per gate comment". The mutant's reading satisfies that wording too, and arguably fits D-29's
                     "expected gate stop excepted" better.
    CONFIDENCE: confirmed (ran the mutant)

[2] KIND: correctness
    WHERE: lefthook.yml:54 (`[ -n "${RUNNER_CHILD:-}" ] || exit 0`), scripts/metrics/no-rework.sh:43-44
    DEFECT: a human amend (or cherry-pick or rebase) of a run's commit keeps `Agent-Run:`, so no-rework reads the
            human's rework as the run's.
    TRIGGER: after ready, the lead edits a file, runs `git commit --amend --no-edit` on the run's last commit (no
             RUNNER_CHILD) and force-pushes. Scratch repo with the job's exact body: the amended commit has new
             content, committer date 2030-01-01, and `%(trailers:key=Agent-Run,valueonly)` = `7`.
    WRONG BEHAVIOUR: the new sha's `committed` event is after ready but classed `agent-run`, so human_commits `-`
                     and the PR reads `yes`. D-29 counts a human-authored commit after ready as rework. Neither the
                     analysis nor the plan states this cost. No code change is expected unless the lead rules
                     otherwise. State it in `docs/metrics.md` and in the PR body's "The lead decides".
    CONFIDENCE: confirmed mechanism (ran it); plausible occurrence (the lead amending a run's commit is not
                observed yet)
```

Verdict: back to test-writer (finding 1: one fixture that pins the answer the dev-lead picks for `gate`, then
runner, then `approve`. If the pick is the mutant's reading, it is a `chore(scripts)` change with the lead's word,
because Q5 is silent on it). Finding 2 goes to the dev-lead as a stated cost, with no probe.

Riskiest unfalsified: the `prepare-commit-msg` job inside the runner container (Linux lefthook, B1.58 image), still
traced only, never run there. Second, as in round 1: Q8 reads the committer date, so a human commit made on the draft
and pushed after ready is not counted.
