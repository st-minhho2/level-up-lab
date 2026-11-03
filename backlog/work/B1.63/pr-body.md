## Item

B1.63 + B1.64 (one plan, one PR, the lead's choice) — the eligibility check matches the `agent-ready` label by its node id, not its name; it refuses a closed issue, with or without a card id (tooling, no spec section)

- spec: none — tooling (D-27); no `src/` change, no section
- test: probes in `scripts/agent/eligible-smoke.sh` (E1, E3, E4, E6, E10 refit; E11 rewritten; E12–E14 new) and `scripts/hook-smoke.sh` (its gh shim) — red before (27f01a0: eligible-smoke 7 of 14 FAIL, E1 E6 E10–E14; hook-smoke S16 low, S16 medium, C9, S28 FAIL), green after (90281f7: 14 probes OK on bash 5 and 3.2, hook-smoke 511 OK)
- acceptance: B1.63 all clauses (node id match E12 rename sequence exits 1, E13 delete and re-create needs a new labeled event, E14 order across pages; PR carries `config-change-approved`); B1.64 all clauses (E11: `eligible: #<n> is closed` with and without `<card>`; live `eligible.sh 169` → exit 1 `is closed`)
- risk tier: high (D-28, `scripts/agent/`)

## Plan

### B1.63 + B1.64 plan — eligibility by label node id; a closed issue is refused (tooling)

Round 2 (plan review r1: 3 reasons, all addressed). One plan, one PR for both cards (the lead's choice in session); tier quick, no `src/` (advisor skipped).
Risk tier **high** (D-28: `scripts/agent/` is CONFIG_PROTECTED) → the lead's gate holds; `config-change-approved` (D-19).
Approach: REST events keep a label's name at event time (B1.49 live step 6), so read the GraphQL timeline, whose
`label.id` is the node id through rename and delete (steps 6–7; REST `node_id` = GraphQL `id`, checked live).

**Costs the lead accepts by approving:** (1) B1.64 rides on B1.63's branch: next-task shows it To do until the closing
lane (WIP is 4/3, it cannot be claimed alone). (2) A pull-request number now fails (`issue(number:)` does not resolve
it). (3) CI's token proof step (`ci.yml:155`) still reads REST events, and CI's apt gh 2.23 running this query is
[unverified]; a failure there refuses (fail-closed) → follow-up card, not this PR. (4) The `scripts/CLAUDE.md` rows for `eligible*.sh` (already "E1–E9") stay stale: B1.57 holds that file (`next-task.sh --check`) → a row fix after it merges.

## Files

| File                              | Change                                                                           |
| --------------------------------- | -------------------------------------------------------------------------------- |
| `scripts/agent/eligible.sh`       | state first (B1.64); events from GraphQL, matched by the label's node id (B1.63) |
| `scripts/agent/eligible-smoke.sh` | shim answers GraphQL in pages; E1, E3–E4, E6, E10 refit; E11 rewritten; E12–E14  |
| `scripts/hook-smoke.sh`           | its jq-free gh shim and `gh_issue` answer the new calls (S16–S19 unchanged)      |
| `backlog/work/B1.63/plan.md`      | this plan                                                                        |
| `backlog/work/B1.63/review.md`    | plan and diff reviews                                                            |
| `backlog/work/B1.63/pr-body.md`   | PR body                                                                          |

## Interfaces touched

```
scripts/agent/eligible.sh <issue-number> [<card>]   arguments, exit codes, stdout unchanged; bash 3.2-safe
  gh api repos/{owner}/{repo}/issues/<n> --jq '.user.login, .state, (.labels[] | select(.name == "agent-ready") | .node_id)'
     state != open → exit 1 "eligible: #<n> is closed" (any mode; was ", needs open", <card> only); no node_id → not labeled
  gh api repos/{owner}/{repo}/issues/<n> --jq '.body // ""'        (only with <card>; was '.state, (.body // "")')
  gh api graphql --paginate -F owner='{owner}' -F repo='{repo}' -F n=<n> -f query="$Q" \
     --jq '.data.repository.issue.timelineItems.nodes[] | [.__typename, (.label.id // ""), (.actor.login // "")] | @tsv'
  Q='query($owner: String!, $repo: String!, $n: Int!, $endCursor: String) { repository(owner: $owner, name: $repo) {
     issue(number: $n) { timelineItems(first: 100, after: $endCursor, itemTypes: [LABELED_EVENT, UNLABELED_EVENT]) {
     pageInfo { hasNextPage endCursor } nodes { __typename ... on LabeledEvent { actor { login } label { id } }
     ... on UnlabeledEvent { actor { login } label { id } } } } } } }'          (one line in the script)
  the last row whose id equals that node_id decides: LabeledEvent → labeler; else "label's last event is not labeled"
  REST /events call removed; the permission calls are unchanged.
```

## Verification

- Red `test(scripts): B1.63 B1.64 eligibility probes` (no `(red)` marker, as B1.43): eligible-smoke exit 1 with E1 E6
  E10–E14 FAIL; E12 is the card's red: the rename sequence exits 0 (old name filter). hook-smoke S16 low, S16
  medium, C9, S28 FAIL too (its shim answers only the new calls; S17 stops at tier high before eligible.sh). Fixtures
  keep REST events with names at event time, so old code runs on them.
- The shim pages GraphQL only when the call has `--paginate` and the query holds `$endCursor`, `after: $endCursor`
  and `pageInfo { hasNextPage endCursor }`; otherwise it answers page 1 alone. E14 also asserts the log holds one
  `api graphql --paginate` call, so E14 is red on old code (no GraphQL call) and on a query that drops the cursor.
- Green: `scripts/agent/eligible-smoke.sh` and `/bin/bash` 3.2 → "14 probes OK"; `scripts/hook-smoke.sh` → 511 OK.
  E11 closed, with and without `<card>`, not labeled too → exit 1 `eligible: #7 is closed`, one gh call ·
  E12 lead labels L1 `agent-ready`, L1 renamed `x`, triage labels L2 `y`, L2 renamed `agent-ready` → exit 1 labeler
  triage; L2 by a write user → 0; only `x` left → not labeled · E13 deleted and re-created: old node's events only →
  last event not labeled; new node by read → 1, by write → 0 · E14 one-event pages: E3's sequences, same verdicts.
- Live, read-only: `scripts/agent/eligible.sh 169` → exit 1 `eligible: #169 is closed`; the script's query on #169
  with `first: 1` and `first: 100` → equal rows (6); `gh api repos/{owner}/{repo}/labels/agent-ready --jq .node_id`
  and `gh label list --json name,id --jq '.[] | select(.name == "agent-ready") | .id'` → the same id (recorded in
  `review.md`'s diff section). The accepted path live is B1.65's run [no open labeled issue].
- `pnpm lint && pnpm typecheck && pnpm test` → 202 green; `check-plan-scope.sh`, `check-backlog.sh` OK.

## Work breakdown

| Step     | Role / skill    | Produces      | Commit                                                            |
| -------- | --------------- | ------------- | ----------------------------------------------------------------- |
| 1 red    | dev-lead        | both smokes   | `test(scripts): B1.63 B1.64 eligibility probes`                   |
| 2 green  | dev-lead        | `eligible.sh` | `chore(scripts): B1.63 B1.64 label node id, closed issue refused` |
| 3 review | reviewer (diff) | `review.md`   | `docs(backlog): B1.63 review`                                     |

Plan review: approved, round 2 · Plan approved by: lead, 2026-11-03 · Rounds: 1

## Map delta

none (tooling, no features-map row)

## Review

`/review-loop`: passes 1/3, 0 findings (no disposition rows). Riskiest unfalsified: the accepted path end to end on a live open `agent-ready` issue and under CI's job token with Debian gh 2.23 (follow-up).

### Diff review (pass 1)

SCOPE: all (tooling, no §: `scripts/agent/`, `scripts/hook-smoke.sh`, `backlog/work/B1.63/`). Diff `main...90281f7`,
red `27f01a0`, green `90281f7`. The cards' Acceptance (B1.63, B1.64 in `plan/E1-todos.md`) is the contract.

#### Command results (run by the reviewer; last line of each)

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

#### Mutants (on the copy, `eligible.sh` only; the smoke unchanged)

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

#### Checklist

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

#### Reviewer's questions, answered

- `awk -v` escape handling of the node id: only a backslash would change it, and an altered id matches no row →
  `label's last event is not labeled`, exit 1 (fail-closed, never a false accept). Live ids are `[A-Za-z0-9_]`.
- `is $state` for a state other than closed: unreachable in REST (`open|closed`); an empty state refuses (`is `).
- hook-smoke's shim answering a `graphql` call without `n=` with a 404: fail-closed in the shim, and eligible-smoke's
  E1/E10 pin `-F n=7` exactly, so a script that drops it fails there.

#### Findings

No blocking finding.

Non-blocking for the lead (already accepted costs, unchanged): the CI token proof at `ci.yml:155` still reads REST
events and CI's gh 2.23 running this GraphQL call is [unverified] (cost 3); `scripts/CLAUDE.md` rows stay "E1–E9"
(cost 4). PR #179's head is still `bbfaf27`: the red and green commits are not pushed yet.

Verdict: ready for PR

Riskiest unfalsified: the accepted path end to end on a live open `agent-ready` issue, and under CI's job token with
gh 2.23. Only the query was run live, by hand with the script's arguments; the script's own live run stops at
`is closed`.

## Evidence

- AC met: 5/5 (B1.63 4 clauses, B1.64 1 clause; live accepted path pending B1.65)
- tier: high
- plan deviations: none
- trace: n/a

## Checklist

- [ ] **Diff matches the approved plan**: no file outside the Files table, no interface outside the list.
- [ ] Red commit precedes the green commit; no `feat(` commit touches `*.test.*` or `e2e/**`.
- [ ] No new `eslint-disable` / `@ts-ignore` / `@ts-expect-error`; protected config change carries `config-change-approved` (D-19, `scripts/agent/`).
- [ ] `docs/metrics.md` per-card row filled.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
