# B1.57 plan — scripts measure unattended runs and PRs merged with no rework (tooling, D-29)

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

## Files

| File                            | Change                                                                                                      |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `scripts/metrics/unattended.sh` | new: per `agent-ready` issue label time, ready time, messages, verdict; the share                           |
| `scripts/metrics/no-rework.sh`  | new: per agent PR ready, merge, human commits after ready, change requests; the share                       |
| `scripts/metrics-smoke.sh`      | M30–M37 on a fixture issue/PR timeline served by the `gh` shim                                              |
| `lefthook.yml`                  | `prepare-commit-msg` job `agent-run`: newline, then `git interpret-trailers --in-place --if-exists replace` |
| `scripts/githooks-smoke.sh`     | G7 `RUNNER_CHILD=7`: commit, clean and conflicted merge, revert, cherry-pick; G8 none without               |
| `scripts/CLAUDE.md`             | rows for the two scripts; probe ids M1–M37, G1–G8                                                           |
| `docs/metrics.md`               | two "Autonomous delivery" rows (D-29 targets, how to re-measure), values n/a until E5                       |

## Interfaces touched

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

## Verification (`/bin/bash` 3.2)

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

## Work breakdown

| Step     | Role            | Produces                        | Commit                                                   |
| -------- | --------------- | ------------------------------- | -------------------------------------------------------- |
| 1 red    | dev-lead        | M30–M37, G7–G8                  | `test(scripts): B1.57 unattended and no-rework probes`   |
| 2 green  | dev-lead        | two scripts, lefthook job, docs | `chore(scripts): B1.57 unattended and no-rework metrics` |
| 3 review | reviewer (diff) | `review.md`                     | `docs(backlog): B1.57 review`                            |

Follow-ups (not here): `run.sh` sets `RUNNER_CHILD=<issue>` so the trailer names the issue; how a headless run reads
the lead's `approve` comment on a high-tier gate (Q5).

Plan review: changes requested, round 2 (cap; round 3 not re-reviewed) · Plan approved by: lead (session reply "approve"; Q1–Q10 as proposed), 2026-11-03 · Rounds: 1
