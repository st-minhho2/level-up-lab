# B1.63 + B1.64 review

## Plan review (round 1)

Plan at `d0ad029` (`backlog/work/B1.63/plan.md`). Scope: tooling (no `src/`, no §; the cards' Acceptance is the
contract, D-27). Risk tier: `scripts/agent/tier.sh backlog/work/B1.63/plan.md` → `high`.

Checks I ran (all read-only):

- `scripts/next-task.sh --check B1.63` → `[next-task] B1.63: no overlap with any Doing or Review card` (exit 0);
  `scripts/next-task.sh --check B1.64` → `[next-task] B1.64 has no plan at HEAD` (exit 1; covered by B1.63's plan, cost 1).
- Baselines: `scripts/agent/eligible-smoke.sh` → `11 probes OK` (also under `/bin/bash` 3.2);
  `scripts/hook-smoke.sh` → `hook-smoke: 511 probes OK`.
- The plan's GraphQL query, verbatim, on #169 with `first: 1` and `first: 100` (`--paginate`) → exit 0 both, 6 rows
  each, identical (`cmp`); order matches live.md steps 2–9b.
- REST vs GraphQL id of the label: `gh api repos/{owner}/{repo}/labels/agent-ready --jq .node_id` and
  `repository.label(name: "agent-ready") { id }` → both `LA_kwDOVaUkoc8AAAADAmzjTQ`, the id live.md step 6 shows on
  the `agent-ready` events.
- PR number (cost 2): `issue(number: 178)` → `gh: Could not resolve to an Issue with the number of 178.`, gh exit
  non-zero → `ghq` refuses with that line (fail-closed).
- `gh api repos/{owner}/{repo}/issues/169 --jq '.state, (.labels[] | select(.name == "agent-ready") | .node_id)'` →
  `closed`, no id: the plan's live step `eligible.sh 169` → `is closed` is reachable.
- Probe on a copy: `eligible.sh` replaced by `exit 1` → hook-smoke FAILs exactly S16 (low), S16 (medium), C9 (low
  approval), S28 (round 2 approved); S17 stays ok (plan-files refuses tier high before calling `eligible.sh`).

| Check                                                                          | Result                                                                                                                                                                                                                     |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                 | pass: no § (tooling); the three scripts are the eligibility check, its smoke and the only other smoke whose shim answers `eligible.sh`'s calls (`run-smoke` uses a fake, `metrics-smoke` denies all `gh api`)              |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib | pass (n/a): no TypeScript; arguments, exits, stdout unchanged, bash 3.2-safe stated; new message equals B1.64's Acceptance `eligible: #<n> is closed`                                                                      |
| plan follows `advice.md`'s recommendation or states the deviation              | pass: quick tier, no `advice.md`, "advisor skipped" stated                                                                                                                                                                 |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number      | pass: B1.63 (node id rule, rename → 1, delete/re-create, pages) and B1.64 (closed → 1, both modes) each map to E11–E14 with exit codes and messages                                                                        |
| verification lists exact commands with expected numbers                        | **fail**: the hook-smoke red set is wrong (reason 1); E14's red and its cursor proof are not derivable from the stated design (reason 2); "REST `node_id` = GraphQL `id`, checked live" has no recorded command (reason 3) |
| work breakdown skeleton → red → green → map → review with convention subjects  | pass: B1.43 precedent (script exists, no skeleton; no § so no map step); `test(scripts)` without `(red)`, green `chore(scripts)` touching only `eligible.sh`                                                               |
| `Lead approves spec` box, ticked only by a human                               | pass (n/a): no section; `Plan approved by:` empty                                                                                                                                                                          |
| no settled D-n contradicted                                                    | pass: D-19 label stated, D-27/D-28 high tier keeps the lead's gate, D-25 follow-ups (ci.yml step, `scripts/CLAUDE.md` rows)                                                                                                |
| `scripts/next-task.sh --check <card>` says no overlap                          | pass: `[next-task] B1.63: no overlap with any Doing or Review card`                                                                                                                                                        |

Reasons (changes requested):

1. Verification, red line: "hook-smoke S16 S17 FAIL too". Confirmed wrong on a copy: with `eligible.sh` refusing,
   the failing probes are S16 low, S16 medium, C9 (check-plan-scope, low approval) and S28 (round 2 approved), 4
   FAIL; S17 passes because `plan-files.sh` refuses `tier high` (line 74) before it calls `eligible.sh` (line 90).
   State "hook-smoke exit 1, 4 FAIL: S16 ×2, C9, S28" so the diff review can hold the red to the plan.
2. Verification, E14 ("one-event pages: E3's sequences, same verdicts") is listed as red, but the plan's own
   fixtures keep REST events so the old code runs on them: the old code reads E3's sequences from REST in one piece
   and returns E3's verdicts, so E14 passes at red unless it asserts something else. And offline, a shim that simply
   concatenates pages also passes a script whose query drops `after: $endCursor` or `pageInfo { hasNextPage
endCursor }` (real gh then refetches page 1 forever or stops after it). Name E14's mechanism: the shim emits
   pages 2..k only when the call has `--paginate` and the query carries `$endCursor`, `after: $endCursor` and
   `pageInfo { hasNextPage endCursor }`, else page 1 only; and either say E14 is red because of that, or move it out
   of the red list as a guard that passes at red.
3. Approach and Live: "REST `node_id` = GraphQL `id`, checked live" is the premise of the whole fix (a mismatch
   refuses every labeled issue, fail-closed), yet no command or output records it and the planned live run stops at
   `is closed` before the GraphQL call. Add the read-only pair to Live: `gh api repos/{owner}/{repo}/labels/agent-ready
--jq .node_id` and `gh api graphql … label(name: "agent-ready") { id }` → equal (both `LA_kwDOVaUkoc8AAAADAmzjTQ`
   today), plus the script's query on #169 matching that id on 4 of 6 rows.

Costs the lead also accepts (already stated or follow from the stated ones; no change needed):

- Board: 4 cards Doing against a WIP limit of 3 (`next-task.sh --list`: B1.57, B1.62, B1.63, B1.65), and B1.64 stays
  "To do" with no `work/B1.64/` until the closing lane.
- CI: the token proof at `ci.yml:155` keeps proving REST events, which `eligible.sh` no longer reads; the first
  runner-path PR (a card an open `agent-ready` issue names) is the first CI run of the GraphQL call under the job
  token, and a failure there refuses that PR. No open `agent-ready` issue exists today, so no current PR is affected.
- A closed issue that is also unlabeled now reports `is closed` instead of `not labeled agent-ready` (run.sh's skip
  line and plan-files' refusal text change; no probe matches the old text except E11, which the plan rewrites).

Verdict: changes requested

## Plan review (round 2)

Plan at `0538a19` (diff from round 1: `git diff d0ad029 0538a19 -- backlog/work/B1.63/plan.md`, Verification and the
header only; Files, Interfaces, Costs, Work breakdown unchanged). `scripts/next-task.sh --check B1.63` →
`[next-task] B1.63: no overlap with any Doing or Review card`. Round 1's text above is unchanged (committed in `243e589`).

| Round 1 reason          | Round 2                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 hook-smoke red set    | resolved: "S16 low, S16 medium, C9, S28 FAIL … S17 stops at tier high before eligible.sh" equals the set my probe on a copy produced (4 FAIL)                                                                                                                                                                                                                                                                                                                                          |
| 2 E14 mechanism and red | resolved: the shim pages only with `--paginate` plus `$endCursor`, `after: $endCursor`, `pageInfo { hasNextPage endCursor }`, else page 1 alone; E14 asserts one `api graphql --paginate` call. Traced on E3's sequences with one-event pages: a dropped cursor leaves page 1 (the first event) deciding, so "write, removed, read" accepts lead and "read, removed, write" refuses bob, both opposite to E3, so E14 fails; old code makes no GraphQL call, so the log assertion fails |
| 3 node id evidence      | resolved: Live adds `gh api repos/{owner}/{repo}/labels/agent-ready --jq .node_id` against `gh label list --json name,id` (GraphQL-backed) → the same id, recorded at diff time; round 1 already saw both as `LA_kwDOVaUkoc8AAAADAmzjTQ`                                                                                                                                                                                                                                               |

| Check                                                                          | Result                                                                                      |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                 | pass (as round 1)                                                                           |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib | pass (n/a, as round 1)                                                                      |
| plan follows `advice.md` or states the deviation                               | pass (as round 1)                                                                           |
| ≤ 7 criteria, every Then measurable                                            | pass (as round 1)                                                                           |
| verification lists exact commands with expected numbers                        | pass: red sets for both smokes, green "14 probes OK" and 511, live rows (6) and the id pair |
| work breakdown with convention subjects                                        | pass (as round 1, B1.43 precedent)                                                          |
| `Lead approves spec` box ticked only by a human                                | pass (n/a); `Plan approved by:` empty                                                       |
| no settled D-n contradicted                                                    | pass (as round 1)                                                                           |
| `next-task.sh --check` no overlap                                              | pass: quoted above                                                                          |

The costs listed in round 1 (WIP 4/3, the CI token proof and gh 2.23 [unverified], the changed refusal text on a closed
unlabeled issue) still stand for the lead's gate. Tier high: this approval is for the lead's gate, not for build.

Verdict: approved
