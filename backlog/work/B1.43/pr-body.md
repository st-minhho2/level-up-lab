## Item

B1.43 — Agent-task issue template and an eligibility check on the label (tooling, no spec section)

- spec: none — tooling (D-27, D-28, D-19); no `src/` change, no section
- test: `scripts/agent/eligible-smoke.sh` probes E1–E9 — red before (`scripts/agent/eligible.sh` absent), green after
- acceptance: issue form fields; `eligible.sh <issue>` exit 0 only for a write/maintain/admin labeler (and author); probes for a read-only actor, a removed and re-added label, a missing label; label `config-change-approved` (D-19)
- risk tier: high (D-28, `.github/`)

## Plan

### B1.43 plan — Agent-task issue template and an eligibility check on the label (tooling)

Round 2 (plan review r1: 6 reasons, all addressed). Tooling, tier quick (spec-analyst and advisor skipped); the card's
Acceptance and D-27/D-28 are the contract. Risk tier **high** (D-28: `.github/`) → the lead's `approve` gate holds;
the PR carries `config-change-approved` (D-19). The smoke fakes `gh` with a PATH shim, as `pr-step-smoke.sh` does;
the shim applies the script's own `--jq` filter with `jq` to fixture JSON, so the filters are tested offline.

**Cost the lead accepts by approving (r1 #4):** the repo is public and an issue's author can edit its body after the
label. So `eligible.sh` also requires the issue's **author** to have write access (only the author and write
collaborators can edit a body): an outsider's issue is never eligible; the lead re-files it to use it.

#### Files

| File                                    | Change                                                                         |
| --------------------------------------- | ------------------------------------------------------------------------------ |
| `.github/ISSUE_TEMPLATE/agent-task.yml` | new issue form: card id, spec section or change, acceptance, out of scope      |
| `scripts/agent/eligible.sh`             | new: exit 0 only when the last `agent-ready` labeler and the author have write |
| `scripts/agent/eligible-smoke.sh`       | new: probes E1–E9 with a `gh` shim, no network                                 |
| `backlog/work/B1.43/plan.md`            | this plan                                                                      |
| `backlog/work/B1.43/review.md`          | plan and diff reviews                                                          |
| `backlog/work/B1.43/pr-body.md`         | PR body                                                                        |

#### Interfaces touched

```
scripts/agent/eligible.sh <issue-number>   bash 3.2-safe; cd to its own repo root (so {owner}/{repo} is this repo's
                                            origin wherever it is called from); GH_REPO, GH_HOST unset for every gh call
  exit 0  stdout "eligible: #<n> agent-ready labeled by <login> (<role>), author <login> (<role>)"
  exit 1  stderr "eligible: #<n> <reason>": not labeled agent-ready | label's last event is not `labeled` |
          labeler|author <login> has <permission>, needs write | gh failed: <first stderr line> | usage (no gh call)
  gh api repos/{owner}/{repo}/issues/<n> --jq '.user.login, .labels[].name'
  gh api --paginate repos/{owner}/{repo}/issues/<n>/events
         --jq '.[] | select((.event == "labeled" or .event == "unlabeled") and .label.name == "agent-ready")
               | [.event, (.actor.login // "")] | @tsv'          (chronological; the last line decides)
  gh api repos/{owner}/{repo}/collaborators/<login>/permission --jq '[.permission, .role_name] | @tsv'
         decides on .permission (API values admin|write|read|none; maintain shows as write, triage as read):
         admin|write → ok; role_name is only printed
```

Issue form: top-level `name: Agent task`, `description`, `title: "B<e>.<n> "`, no `labels:` (only the lead adds
`agent-ready`, D-27); body = a markdown note + `card` (input), `spec`, `acceptance`, `out_of_scope` (textareas), each
with `attributes.label` and `validations.required: true`.

#### Verification

- Red, commit `test(scripts): B1.43 eligibility probes` (no `(red)` marker: CI's `verify-red.sh --auto` wants a
  `*.test.ts` file, as B1.29 `1ae8fbb` and B1.32 `084bccb`): smoke → exit 1, E1–E9 FAIL (eligible.sh absent).
- Green: `scripts/agent/eligible-smoke.sh` and `/bin/bash scripts/agent/eligible-smoke.sh` (3.2) → "9 probes OK".
  E1 write labeler and author → 0, the exact gh lines · E2 labeler read/none (role triage, read) → 1, login + permission ·
  E3 re-added: write→unlabeled→read → 1; read→unlabeled→admin → 0 · E4 never labeled → 1; labeled then removed → 1 ·
  E5 role maintain (permission write), admin → 0 · E6 bad argument → 1, no gh call; any gh call failing → 1 "gh failed" ·
  E7 caller's GH_REPO/GH_HOST never reach gh · E8 a later `labeled` of another label keeps the actor ·
  E9 author read with a write labeler → 1; called from another directory → gh runs in the repo root.
- `ruby -ryaml` (no new dependency) on `agent-task.yml`: `name`, `description`, `title` present, no `labels`; 4 fields
  ids card, spec, acceptance, out_of_scope with `type`, `attributes.label`, `validations.required == true`.
- Live, read-only: `scripts/agent/eligible.sh 1` → exit 1 "not labeled agent-ready". Covers only the first call: the
  `agent-ready` label does not exist yet (the lead creates it, see Waiting on you); full live path is B1.44's first run.
- `pnpm lint && pnpm typecheck && pnpm test` → 202 tests green (no `src/` change); `scripts/ci/check-plan-scope.sh`,
  `scripts/ci/check-backlog.sh` OK.

#### Work breakdown

| Step     | Role / skill    | Produces                        | Commit                                                |
| -------- | --------------- | ------------------------------- | ----------------------------------------------------- |
| 1 red    | dev-lead        | `eligible-smoke.sh`             | `test(scripts): B1.43 eligibility probes`             |
| 2 green  | dev-lead        | `eligible.sh`, `agent-task.yml` | `chore(scripts): B1.43 agent-ready eligibility check` |
| 3 review | reviewer (diff) | `review.md`                     | `docs(backlog): B1.43 review`                         |

Not in scope (follow-ups): the smoke in CI (`ci.yml` is B1.46's), `scripts/CLAUDE.md` rows (orchestrator), skipping
pull requests and closed issues (the runner's poll, B1.44), creating the `agent-ready` label (the lead).

Plan review: approved, round 2 · Plan approved by: lead, 2026-11-02 · Rounds: 1

## Verification run

- Red `ba64613`: `scripts/agent/eligible-smoke.sh` → "9 of 9 probes FAILED", exit 1.
- Green `804ce7d` + review pass 1 `6394630`: `scripts/agent/eligible-smoke.sh` → "9 probes OK", exit 0; same with
  `/bin/bash` 3.2.57 first on `PATH`. Pass 1's two surviving mutants (`grep -qF`, the no-actor line removed) now fail E4.
- Issue form, from the worktree root → prints `form OK: 4 required fields, no labels`, exit 0:

```bash
ruby -ryaml -e '
f = YAML.load_file(".github/ISSUE_TEMPLATE/agent-task.yml")
abort "top" unless f["name"] && f["description"] && f["title"] && !f.key?("labels")
fields = f["body"].reject { |b| b["type"] == "markdown" }
abort "ids #{fields.map { |b| b["id"] }}" unless fields.map { |b| b["id"] } == %w[card spec acceptance out_of_scope]
fields.each { |b| abort "field #{b["id"]}" unless %w[input textarea].include?(b["type"]) && b.dig("attributes", "label") && b.dig("validations", "required") == true }
puts "form OK: #{fields.size} required fields, no labels"'
```

- Live, read-only: `scripts/agent/eligible.sh 1` → "eligible: #1 not labeled agent-ready", exit 1. The permission
  filter on the owner → `admin	admin`; the events filter on #155 (label `config-change-approved`) → `labeled	<owner>`.
- `pnpm lint` 0 errors (1 pre-existing warning, `src/components/todo-form.tsx`), `pnpm typecheck` OK, `pnpm test` 202
  passed; `scripts/ci/check-plan-scope.sh`, `scripts/ci/check-backlog.sh` OK.
- Beyond the plan's interface list: one more stderr reason, "label's last event has no actor" (a deleted account), probed in E4.

## Map delta

None: tooling, no feature row.

## Review

pending

## Checklist

- [ ] **Diff matches the approved plan**: no file outside the Files table, no interface outside the list.
- [ ] Red commit precedes the green commit; the green commit touches no probe file.
- [ ] No new `eslint-disable` / `@ts-ignore` / `@ts-expect-error`; protected config (`.github/ISSUE_TEMPLATE/agent-task.yml`) changed with label `config-change-approved` (D-19, approved plan).
- [ ] `docs/metrics.md` per-card row filled (closing PR).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
