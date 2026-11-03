# B1.63 + B1.64 plan — eligibility by label node id; a closed issue is refused (tooling)

Round 1. One plan, one PR for both cards (the lead's choice in session); tier quick, no `src/` (advisor skipped).
Risk tier **high** (D-28: `scripts/agent/` is CONFIG_PROTECTED) → the lead's gate holds; `config-change-approved` (D-19).
Approach: REST events keep a label's name at event time (B1.49 live step 6), so read the GraphQL timeline, whose
`label.id` is the node id through rename and delete (steps 6–7; REST `node_id` = GraphQL `id`, checked live).

**Costs the lead accepts by approving:** (1) B1.64 rides on B1.63's branch: next-task shows it To do until the closing
lane (WIP is 4/3, it cannot be claimed alone). (2) A pull-request number now fails (`issue(number:)` does not resolve
it). (3) CI's token proof step (`ci.yml:155`) still reads REST events, and CI's apt gh 2.23 running this query is
[unverified]; a failure there refuses (fail-closed) → follow-up card, not this PR.

## Files

| File                              | Change                                                                           |
| --------------------------------- | -------------------------------------------------------------------------------- |
| `scripts/agent/eligible.sh`       | state first (B1.64); events from GraphQL, matched by the label's node id (B1.63) |
| `scripts/agent/eligible-smoke.sh` | shim answers GraphQL in pages; E1, E3–E4, E6, E10 refit; E11 rewritten; E12–E14  |
| `scripts/hook-smoke.sh`           | its jq-free gh shim and `gh_issue` answer the new calls (S16–S19 unchanged)      |
| `scripts/CLAUDE.md`               | `eligible*.sh` rows: closed refused, node id, probes E1–E14                      |
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
  E10–E14 FAIL; E12 is the card's red: the rename sequence exits 0 (old name filter). hook-smoke S16 S17 FAIL too
  (its shim answers only the new calls). Fixtures keep REST events with names at event time, so old code runs on them.
- Green: `scripts/agent/eligible-smoke.sh` and `/bin/bash` 3.2 → "14 probes OK"; `scripts/hook-smoke.sh` → 511 OK.
  E11 closed, with and without `<card>`, not labeled too → exit 1 `eligible: #7 is closed`, one gh call ·
  E12 lead labels L1 `agent-ready`, L1 renamed `x`, triage labels L2 `y`, L2 renamed `agent-ready` → exit 1 labeler
  triage; L2 by a write user → 0; only `x` left → not labeled · E13 deleted and re-created: old node's events only →
  last event not labeled; new node by read → 1, by write → 0 · E14 one-event pages: E3's sequences, same verdicts.
- Live, read-only: `scripts/agent/eligible.sh 169` → exit 1 `eligible: #169 is closed`; the script's query on #169
  with `first: 1` and `first: 100` → equal rows (6). The accepted path live is B1.65's run [no open labeled issue].
- `pnpm lint && pnpm typecheck && pnpm test` → 202 green; `check-plan-scope.sh`, `check-backlog.sh` OK.

## Work breakdown

| Step     | Role / skill    | Produces                   | Commit                                                            |
| -------- | --------------- | -------------------------- | ----------------------------------------------------------------- |
| 1 red    | dev-lead        | both smokes                | `test(scripts): B1.63 B1.64 eligibility probes`                   |
| 2 green  | dev-lead        | `eligible.sh`, `CLAUDE.md` | `chore(scripts): B1.63 B1.64 label node id, closed issue refused` |
| 3 review | reviewer (diff) | `review.md`                | `docs(backlog): B1.63 review`                                     |

Plan review: pending · Plan approved by: · Rounds: 1
