# B1.43 plan — Agent-task issue template and an eligibility check on the label (tooling)

Approach: tooling, tier quick (spec-analyst and advisor skipped); the card's Acceptance and D-27/D-28 are the contract.
Risk tier **high** (D-28: `.github/` is protected) → the lead's `approve` gate holds; the PR carries
`config-change-approved` (D-19). The smoke fakes `gh` with a PATH shim, as `pr-step-smoke.sh` and `next-task-smoke.sh`
do; the shim applies the script's own `--jq` filter with `jq` to fixture JSON, so the filters are tested, offline.

## Files

| File                                    | Change                                                                                      |
| --------------------------------------- | ------------------------------------------------------------------------------------------- |
| `.github/ISSUE_TEMPLATE/agent-task.yml` | new issue form: card id, spec section or change, acceptance, out of scope; applies no label |
| `scripts/agent/eligible.sh`             | new: exit 0 only when the latest `agent-ready` `labeled` actor has write/maintain/admin     |
| `scripts/agent/eligible-smoke.sh`       | new: probes E1–E8 with a `gh` shim, no network                                              |
| `backlog/work/B1.43/plan.md`            | this plan                                                                                   |
| `backlog/work/B1.43/review.md`          | plan and diff reviews                                                                       |
| `backlog/work/B1.43/pr-body.md`         | PR body                                                                                     |

## Interfaces touched

```
scripts/agent/eligible.sh <issue-number>          bash 3.2-safe; GH_REPO and GH_HOST unset before every gh call
  exit 0  stdout "eligible: #<n> agent-ready labeled by <login> (<permission>)"
  exit 1  stderr "eligible: #<n> <reason>" — not labeled agent-ready | label present but its last event is not
          `labeled` | <login> has <permission>, needs write, maintain or admin | gh failed: <first stderr line>
          | usage (no argument, not digits, extra argument; no gh call)
  gh api repos/{owner}/{repo}/issues/<n> --jq '.labels[].name'
  gh api --paginate repos/{owner}/{repo}/issues/<n>/events
         --jq '.[] | select((.event == "labeled" or .event == "unlabeled") and .label.name == "agent-ready")
               | [.event, (.actor.login // "")] | @tsv'          (chronological; the last line decides)
  gh api repos/{owner}/{repo}/collaborators/<login>/permission --jq .permission   (admin|maintain|write → 0)
```

Issue form `agent-task.yml`: `name: Agent task`, `title: "B<e>.<n> "`, no `labels:` (only the lead adds
`agent-ready`, D-27); body = markdown note + `card` (input), `spec`, `acceptance`, `out_of_scope` (textareas), all
`required: true`.

## Verification

- Red (`test(scripts)` commit, smoke only): `scripts/agent/eligible-smoke.sh` → exit 1, E1–E8 FAIL (eligible.sh absent).
- Green: `scripts/agent/eligible-smoke.sh` and `/bin/bash scripts/agent/eligible-smoke.sh` (3.2) → "8 probes OK", exit 0.
  E1 write actor → 0 and the exact three gh lines · E2 read, triage, none → 1 with login and permission ·
  E3 removed and re-added: write→unlabeled→read → 1; read→unlabeled→admin → 0 · E4 never labeled → 1; labeled then
  removed → 1 · E5 maintain, admin → 0 · E6 bad argument → 1, no gh call; gh error on any call → 1 "gh failed" ·
  E7 a caller's GH_REPO/GH_HOST never reach gh · E8 a later `labeled` event of another label does not change the actor.
- `node -e` with `js-yaml` loads `agent-task.yml`: 4 required fields with ids card, spec, acceptance, out_of_scope; no `labels`.
- Live, read-only: `scripts/agent/eligible.sh 1` → exit 1 "not labeled agent-ready" (real API, placeholders resolve).
- `pnpm lint && pnpm typecheck && pnpm test` green (no `src/` change); `scripts/ci/check-plan-scope.sh`,
  `scripts/ci/check-backlog.sh` OK; `scripts/hook-smoke.sh` unchanged OK.

## Work breakdown

| Step     | Role / skill    | Produces                        | Commit                                                |
| -------- | --------------- | ------------------------------- | ----------------------------------------------------- |
| 1 red    | dev-lead        | `eligible-smoke.sh`             | `test(scripts): B1.43 eligibility smoke (red)`        |
| 2 green  | dev-lead        | `eligible.sh`, `agent-task.yml` | `chore(scripts): B1.43 agent-ready eligibility check` |
| 3 review | reviewer (diff) | `review.md`                     | `docs(backlog): B1.43 review`                         |

Not in scope (follow-ups after the batch): running the smoke in CI (`ci.yml` is B1.46's), the `scripts/CLAUDE.md`
rows (orchestrator), skipping pull requests and closed issues (the runner's poll, B1.44).

Plan review: pending · Plan approved by: · Rounds: 1
