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

## Diff review (pass 1)

SCOPE: all (tooling, no §: `scripts/agent/`, `scripts/hook-smoke.sh`, `backlog/work/B1.63/`). Diff `main...90281f7`,
red `27f01a0`, green `90281f7`. The cards' Acceptance (B1.63, B1.64 in `plan/E1-todos.md`) is the contract.

### Command results (run by the reviewer; last line of each)

| Command                             | Result                                                                                                                                                                                                                          |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                         | exit 0, `All matched files use Prettier code style!`                                                                                                                                                                            |
| `pnpm typecheck`                    | exit 0, `> tsc --noEmit`                                                                                                                                                                                                        |
| `pnpm test`                         | exit 0, `Tests  202 passed (202)`                                                                                                                                                                                               |
| `pnpm test:e2e`                     | exit 0, `43 passed (1.2m)`                                                                                                                                                                                                      |
| `pnpm test:mutation`                | exit 0, `Final mutation score of 93.40 is greater than or equal to break threshold 70`                                                                                                                                          |
| `scripts/ci/check-suppressions.sh`  | `[check-suppressions] OK: no new suppressions`                                                                                                                                                                                  |
| `scripts/ci/check-config-change.sh` | exit 1 locally, `Protected configuration changed without the 'config-change-approved' label` (eligible.sh, eligible-smoke.sh): no PR context offline; PR #179 carries `config-change-approved` (`gh pr view 179 --json labels`) |
| `scripts/ci/check-feat-commits.sh`  | `[check-feat-commits] OK: no feat commit touches tests`                                                                                                                                                                         |
| `scripts/ci/check-ac-coverage.sh`   | `[check-ac-coverage] OK: every criterion of a shipped section has a test`                                                                                                                                                       |
| `scripts/ci/check-spec-sections.sh` | `[check-spec-sections] OK: sections cited: 1 … 22`                                                                                                                                                                              |
| `scripts/ci/check-features-map.sh`  | `[check-features-map] OK`                                                                                                                                                                                                       |
| `scripts/ci/check-plan-scope.sh`    | `[check-plan-scope] OK: chore/B1.63-label-node-id stays inside the approved plan of B1.63`                                                                                                                                      |
| `scripts/ci/check-backlog.sh`       | `[check-backlog] OK: README matches the cards`                                                                                                                                                                                  |
| `scripts/verify-red.sh B1.63`       | exit 1, `no 'test(<pkg>): B1.63 … (red)' commit`: expected, vitest-only tool, the plan states no `(red)` marker (B1.43); red proven below                                                                                       |
| `scripts/agent/eligible-smoke.sh`   | `14 probes OK` (bash 5); `/bin/bash` 3.2.57 → `14 probes OK`                                                                                                                                                                    |
| `scripts/hook-smoke.sh`             | `hook-smoke: 511 probes OK`                                                                                                                                                                                                     |
| `git diff --stat main...HEAD`       | 6 files, 393 insertions, 41 deletions                                                                                                                                                                                           |

Red, on a copy with `scripts/` at `27f01a0`: eligible-smoke `7 of 14 probes FAILED` (E1 E6 E10 E11 E12 E13 E14); E12
"renamed onto a triage label" → `rc=0 … labeled by lead (write)` (the card's fail-open), E13 "old node labeled only"
→ rc=0, E11 "closed, not labeled" → `not labeled agent-ready`. hook-smoke at red: S16 low, S16 medium, C9, S28 FAIL,
as the plan says (two more FAILs on the copy, js-yaml and the path-guard roles count, also appear on the same copy with
the green scripts: copy artifacts, unrelated to `eligible.sh`).

Live, read-only (gh 2.103.2): `scripts/agent/eligible.sh 169` → exit 1 `eligible: #169 is closed`;
`gh api repos/{owner}/{repo}/labels/agent-ready --jq .node_id` → `LA_kwDOVaUkoc8AAAADAmzjTQ`; `gh label list --json
name,id` for `agent-ready` → `LA_kwDOVaUkoc8AAAADAmzjTQ` (equal); the script's own `Q` (extracted from
`eligible.sh`) with the script's args on #169, `first: 100` and `first: 1` → exit 0 both, 6 rows each, `cmp`
identical; 4 rows carry `LA_kwDOVaUkoc8AAAADAmzjTQ`, 2 carry `LA_kwDOVaUkoc8AAAADAqP2eA`. #169 REST: `closed`, no
`agent-ready` node id. The accepted path through the whole script is not run live [no open labeled issue; B1.65].

Process note: the first probe copy carried the worktree's `.git` file (a pointer to the shared gitdir), so a `git
checkout 27f01a0 -- scripts/` there staged the red `eligible.sh` in this worktree's index. I ran `git restore --staged
scripts/agent/eligible.sh`; `git status --short` is empty, the working file was never changed. Later probes ran with
the `.git` pointer removed from the copies.

### Mutants (on the copy, `eligible.sh` only; the smoke unchanged)

Killed: no `after: $endCursor` (E1 E10 E14) · no `$endCursor` variable (E1 E10 E14) · no `pageInfo` (E1 E10 E14) · no
`--paginate` (E1 E10 E14) · no node-id filter in awk (E8 E13) · state check removed (E11) · node check before state
(E11) · `tail -1` → `head -1` (E3 E4 E14) · `##` → `#` for the labeler (13 probes) · `.labels[0].node_id` (E1 E4 E10
E11 E12) · `== LabeledEvent` → `!= UnlabeledEvent` (E4 E13) · node check removed (E4 E12) · old message `, needs open`
(E11) · `first: 1` (E1 E10, exact log) · `itemTypes: [LABELED_EVENT]` (E1 E10) · actor check removed (E4) · body call
keeps `.state` (E10).

Cursor contract on its own (the same change made to `eligible.sh` and to the smoke's `Q` and expected lines, so E1
and E10's exact-log pin agrees and only the shim's paging can see it): no `after:` → E14 · no `$endCursor` variable →
E14 · no `pageInfo` → E14 · `pageInfo { hasNextPage }` → E14 · `before: $endCursor` → E14 · no `--paginate` → E14. So
the cursorless query is killed by E14 alone, not only by the exact-log pin.

Survivors, all equivalent: `== open` → `!= closed` (REST `state` is `open|closed`; an empty state still refuses with
`is `) · awk `$1 == id || $2 == id` (`$1` is `__typename`, never a node id). With the smoke's `Q` changed in lock-step
(not a mutant of the shipped script, E1/E10 pin the text): `first: 1`, `last: 100`, `itemTypes: [LABELED_EVENT]`,
UnlabeledEvent without `label { id }` all pass. The last two are equivalent on any consistent history: a label on the
issue now has a labeled event as its node's newest event.

### Checklist

| Check                                                                       | Result                                                                                                                                                                                                                                                                                             |
| --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every Acceptance clause has a probe whose assertion matches it              | pass: B1.63 node-id rule and rename → 1 (E12, triage labeler message exact), delete/re-create needs a new labeled event (E13), pages keep order (E14, with the cursor contract); B1.64 closed → exit 1 `eligible: #7 is closed` with and without `<card>`, one gh call (E11, exact stderr and log) |
| no test weakened after the red commit                                       | pass: `git log --first-parent --no-merges 27f01a0..HEAD -- '*.test.*' e2e/ scripts/agent/eligible-smoke.sh scripts/hook-smoke.sh` empty; no merge commits in the range; the green commit touches only `scripts/agent/eligible.sh`                                                                  |
| every changed file is in `plan.md`                                          | pass: 6 files, all in Files                                                                                                                                                                                                                                                                        |
| interfaces match the plan                                                   | pass: the REST jq, the body call, the GraphQL call and `Q` equal the plan's Interfaces text; arguments, exits, stdout unchanged; bash 3.2 run                                                                                                                                                      |
| Zod at the action boundary, Prisma only in `src/lib`, no raw SQL, migration | n/a: no `src/`, no `prisma/`                                                                                                                                                                                                                                                                       |
| no secret, no suppression                                                   | pass, one note: E11 adds `# shellcheck disable=SC2086` for the intended split of `$args`, the same line E6 already has; `check-suppressions.sh` scans only JS/TS                                                                                                                                   |
| features map row moved                                                      | n/a: no § (tooling)                                                                                                                                                                                                                                                                                |
| would a test fail if one changed line were reverted?                        | yes for every changed line of `eligible.sh` (mutants above), except the two equivalent ones                                                                                                                                                                                                        |

### Reviewer's questions, answered

- `awk -v` escape handling of the node id: only a backslash would change it, and an altered id matches no row →
  `label's last event is not labeled`, exit 1 (fail-closed, never a false accept). Live ids are `[A-Za-z0-9_]`.
- `is $state` for a state other than closed: unreachable in REST (`open|closed`); an empty state refuses (`is `).
- hook-smoke's shim answering a `graphql` call without `n=` with a 404: fail-closed in the shim, and eligible-smoke's
  E1/E10 pin `-F n=7` exactly, so a script that drops it fails there.

### Findings

No blocking finding.

Non-blocking for the lead (already accepted costs, unchanged): the CI token proof at `ci.yml:155` still reads REST
events and CI's gh 2.23 running this GraphQL call is [unverified] (cost 3); `scripts/CLAUDE.md` rows stay "E1–E9"
(cost 4). PR #179's head is still `bbfaf27`: the red and green commits are not pushed yet.

Verdict: ready for PR

Riskiest unfalsified: the accepted path end to end on a live open `agent-ready` issue, and under CI's job token with
gh 2.23. Only the query was run live, by hand with the script's arguments; the script's own live run stops at
`is closed`.
