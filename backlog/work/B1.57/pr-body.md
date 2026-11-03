## Item

B1.57 — Scripts measure unattended runs and PRs merged with no rework (tooling, no spec section)

- spec: none — tooling (D-27, D-28, D-29); no `src/` change, no section
- test: new probes in `scripts/metrics-smoke.sh` (M30–M43) and `scripts/githooks-smoke.sh` (G7–G9) — red before (920221e: 8 + 1 FAIL), green after (41 ok, 9 ok)
- acceptance: 5/5 clauses (see Evidence)
- risk tier: high (D-28, `lefthook.yml`)

## Plan

### B1.57 plan — scripts measure unattended runs and PRs merged with no rework (tooling, D-29)

Round 3 (plan review r1: 7 reasons, r2: 4 reasons, all addressed, "r1 #n"/"r2 #n"; round 3 not re-reviewed: 2-round
cap). Tooling, tier quick (no advisor); the contract is D-29 and the card's Acceptance; gaps and facts in `analysis.md`
(Q1–Q10, F1–F8). Risk tier **high** (`lefthook.yml`) → the lead's `approve`; the PR carries `config-change-approved`.
`scripts/agent/*` untouched (B1.63–B1.65 hold it). Read-only scripts, bash 3.2, `gh` only (`--jq`, no `jq`).

**The lead decides at this gate:** analysis Q1–Q10 as proposed, in short: (Q1) the mark is a `prepare-commit-msg` job
(r2 #2: `commit-msg` never runs for `git revert --no-edit` or `git cherry-pick`) adding `Agent-Run: $RUNNER_CHILD` when
that variable is set, after first ending the message with a newline (r2 #1: a clean merge's `MERGE_MSG` has none, and
the trailer would join the subject); (Q2) ready = first `ready_for_review`; (Q3) label = latest
`agent-ready` at or before ready; (Q4) a message = any issue/PR comment or review by a user account (bots out, r1 #2)
but the runner's own; (Q5) excepted: a comment starting with the word `approve` after a runner `**gate**` comment with
`- tier: high` (r1 #4); (Q6) open, not ready = pending, closed, not ready = not unattended; (Q7) a change request =
any user's non-runner PR comment or review after ready; (Q8) a human commit = no trailer, committed after ready, an
"Update branch" merge included; (Q9) default PR set = every `<x>/<card>-agent` PR: open = pending, merged or closed =
counted, closed unmerged = no (r1 #3); (Q10) shares `k/n = x.y %`, `n/a` when n = 0. Accepted costs (r2 #4): the
default issue set is the issues that carry `agent-ready` now; an issue unlabeled after a stopped run drops out, so a
batch is measured with its issue ids given (as the other metric scripts take a batch's cards); unverified: the job
firing inside the runner container (Linux lefthook, B1.58 image) — G7 runs on the host.

#### Files

| File                            | Change                                                                                                      |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `scripts/metrics/unattended.sh` | new: per `agent-ready` issue label time, ready time, messages, verdict; the share                           |
| `scripts/metrics/no-rework.sh`  | new: per agent PR ready, merge, human commits after ready, change requests; the share                       |
| `scripts/metrics-smoke.sh`      | M30–M37 on a fixture issue/PR timeline served by the `gh` shim                                              |
| `lefthook.yml`                  | `prepare-commit-msg` job `agent-run`: newline, then `git interpret-trailers --in-place --if-exists replace` |
| `scripts/githooks-smoke.sh`     | G7 `RUNNER_CHILD=7`: commit, clean and conflicted merge, revert, cherry-pick; G8 none without               |
| `scripts/CLAUDE.md`             | rows for the two scripts; probe ids M1–M37, G1–G8                                                           |
| `docs/metrics.md`               | two "Autonomous delivery" rows (D-29 targets, how to re-measure), values n/a until E5                       |

#### Interfaces touched

```
scripts/metrics/unattended.sh [<issue>…]   default: every issue labeled agent-ready (--state all --limit 1000)
  TSV "issue card pr labeled ready messages unattended" (UTC ISO times; yes | no | pending), then
  "unattended <k>/<n> = <x.y> % (pending <m>)"                            n = 0 → "unattended n/a (pending <m>)"
scripts/metrics/no-rework.sh [<pr>…]       default: every PR whose head is <x>/<card>-agent (--limit 1000)
  TSV "pr card ready merged human_commits change_requests no_rework" (short shas, comma-separated, - none;
  count; yes | no | pending), then "no-rework <k>/<n> = <x.y> % (pending <m>)"
gh calls (shim-exact): issue list, issue view --json body (Card id), pr list --state all (head ref),
  api --paginate repos/{owner}/{repo}/issues/<n>/timeline --jq … (labeled, commented, reviewed, ready_for_review,
  committed with message + committer date; user.type), pr view --json state,mergedAt,isDraft,createdAt
lefthook prepare-commit-msg: RUNNER_CHILD set → message gains "Agent-Run: <RUNNER_CHILD>" (one, replaced if present)
```

#### Verification (`/bin/bash` 3.2)

- Red `test(scripts): B1.57 unattended and no-rework probes` (no `(red)` marker: `verify-red.sh --auto` judges only
  test files, r1 #1, as B1.55/B1.58): metrics-smoke `27 ok, 8 FAIL` (M30–M37); githooks-smoke `7 ok, 1 FAIL` (G7;
  G8 passes at red); hook-smoke `511 probes OK`.
- Green, one ok line per new id: metrics-smoke `35 ok, 0 FAIL`: M30 runner comments only, and a bot comment → yes ·
  M31 a user comment between label and ready → no, 1 · M32 `approve; decisions …` after a high-tier gate → yes; after
  a medium one → no · M33 relabel: the latest label starts the window; a comment after ready is out · M34 open, not
  ready → pending; closed → no; share line · M35 run commits only, a trailer-less commit before ready, a Bot comment after ready (r2 #3) → yes · M36 a
  trailer-less commit after ready (sha listed), a PR comment after ready, a closed unmerged PR → no; open → pending;
  share line · M37 default sets: only `-agent` heads, `--limit 1000`, the first of two `ready_for_review` events.
  Fixtures use the API's field names (`reviewed` → `submitted_at`, `user.type`). githooks-smoke `8 ok, 0 FAIL`: G7
  `%(trailers:key=Agent-Run,valueonly)` = `7` and `%s` unchanged in all five cases; hook-smoke `511 probes OK`; denied.log empty (no `gh` call outside the shim).
- Live, read-only: `scripts/metrics/unattended.sh` (only #166: closed at its gate, no PR → `no`, 0/1) and
  `scripts/metrics/no-rework.sh 170 171` (interactive PRs, format only), output pasted into the PR body.

#### Work breakdown

| Step     | Role            | Produces                        | Commit                                                   |
| -------- | --------------- | ------------------------------- | -------------------------------------------------------- |
| 1 red    | dev-lead        | M30–M37, G7–G8                  | `test(scripts): B1.57 unattended and no-rework probes`   |
| 2 green  | dev-lead        | two scripts, lefthook job, docs | `chore(scripts): B1.57 unattended and no-rework metrics` |
| 3 review | reviewer (diff) | `review.md`                     | `docs(backlog): B1.57 review`                            |

Follow-ups (not here): `run.sh` sets `RUNNER_CHILD=<issue>` so the trailer names the issue; how a headless run reads
the lead's `approve` comment on a high-tier gate (Q5).

Plan review: changes requested, round 2 (cap; round 3 not re-reviewed) · Plan approved by: lead (session reply "approve"; Q1–Q10 as proposed), 2026-11-03 · Rounds: 1

## Map delta

none (tooling, no feature row)

## Review

`/review-loop`: 3 passes of 3 (cap). Pass 3's one finding was fixed with a probe only (99a637c, no script change) and not re-reviewed: **the lead accepts or asks for a fourth pass**. Full text: `backlog/work/B1.57/review.md`.

| Pass | #   | Finding                                                                                          | Source              | Disposition | Evidence                                                                                   |
| ---- | --- | ------------------------------------------------------------------------------------------------ | ------------------- | ----------- | ------------------------------------------------------------------------------------------ |
| 1    | 1   | no-rework's window (before ready, after merge) unprobed                                          | reviewer + dev-lead | fix now     | 6747d8f M38; both window mutants fail it                                                   |
| 1    | 2   | Q2's never-drafted fallback (`createdAt`) unprobed in both scripts                               | reviewer            | fix now     | 6747d8f M39                                                                                |
| 1    | 3   | Q5 "one approve per gate" unprobed                                                               | reviewer            | fix now     | 6747d8f M40                                                                                |
| 1    | 4   | Q3 (relabel after ready) and the highest-numbered agent PR unprobed                              | reviewer + dev-lead | fix now     | 6747d8f M41; both mutants fail it                                                          |
| 1    | 5   | `--if-exists replace` unprobed                                                                   | reviewer            | fix now     | 6747d8f G9                                                                                 |
| 1    | 6   | live output in this body stale (#184 appeared)                                                   | reviewer            | fix now     | refreshed below                                                                            |
| 2    | 1   | a later runner comment closing the gate unprobed                                                 | reviewer            | fix now     | eb98c58 M42 (the code's reading of Q5, see Evidence); header and metrics row state it      |
| 2    | 2   | a human amend, cherry-pick or rebase of a run's commit keeps `Agent-Run:` and reads as the run's | reviewer            | fix now     | stated cost in `docs/metrics.md` (acc5af9); no mechanism tells them apart without `run.sh` |
| 3    | 1   | `approve`'s start anchor and word end unprobed                                                   | reviewer            | fix now     | 99a637c M43; dropping either part fails it                                                 |

Riskiest spot, not falsified: the `prepare-commit-msg` job inside the runner container (Linux lefthook, B1.58 image). Traced: `worktree.sh`'s `pnpm install` runs `install-hooks.sh`, which installs it; never run there.

## Evidence

- AC met: 5/5 clauses (unattended.sh, no-rework.sh, the run's mark with a probe, `docs/metrics.md` rows, `config-change-approved`)
- tier: high
- plan deviations: none in Files. Interface refinements: `issue view --json state,body` (plan: `body`); metrics-smoke needs `jq` (its shim applies the scripts' own `--jq`, run-smoke's way); probe ids grew M30–M37 → M30–M43, G7–G8 → G7–G9 (review passes); red commit f1b29d0 fixed two probe bugs found at green (G7 read a trailing newline, M37 read the wrong column), still red, no assertion loosened.
- Q5 reading (lead to see): an `approve` answers a high-tier gate only while that gate is the run's latest runner comment; it can only lower the share. A batch is measured with its issue ids (an issue unlabeled after a stopped run leaves the default list).
- trace: n/a

Verification at the head (macOS /bin/bash 3.2): metrics-smoke 41 ok, 0 FAIL · githooks-smoke 9 ok, 0 FAIL · hook-smoke 511 probes OK · eligible-smoke 14 OK (reviewer) · vitest 202 passed · playwright 43 passed · stryker 93.40 (no src/ change) · check-backlog OK. Mutants: 7 + 1 + 2 targeted single-line mutants each fail their probe.

Live, read-only (2026-11-03, gh 2.103.2's gojq):

```
$ scripts/metrics/unattended.sh
issue	card	pr	labeled	ready	messages	unattended
166	B1.41	-	2026-11-02T09:28:01Z	-	0	no
184	B1.66	-	2026-11-03T01:56:12Z	-	0	pending
unattended 0/1 = 0.0 % (pending 1)
$ scripts/metrics/no-rework.sh
pr	card	ready	merged	human_commits	change_requests	no_rework
no-rework n/a (pending 0)
$ scripts/metrics/no-rework.sh 170 171      # interactive PRs, format only
170	B1.58	2026-11-02T22:06:34Z	2026-11-02T23:22:08Z	cccca86,…,42fa040 (15 commits after ready)	0	no
171	B1.55	2026-11-02T18:03:51Z	2026-11-02T22:05:57Z	-	0	yes
no-rework 1/2 = 50.0 % (pending 0)
```

## Checklist

- [x] **Diff matches the approved plan**: no file outside the Files table; interface refinements above.
- [x] Red commit precedes the change commit.
- [x] No new `eslint-disable` / `@ts-ignore` / `@ts-expect-error`; protected config change (`lefthook.yml`) carries `config-change-approved`.
- [x] `docs/metrics.md` rows filled (two D-29 rows, the per-card row); mistake-log: no known mistake repeated.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
