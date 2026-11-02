# B1.55 plan — dev-lead carries an agent-ready card past a reviewed low or medium plan (tooling)

Round 2 (plan review r1: 7 reasons, all addressed, "r1 #n"). Tooling, tier quick (no analyst, no advisor); the card's
Acceptance and D-27/D-28 are the contract. Risk tier **high** (`.claude/`, `scripts/ci/`, `.github/`) → the lead's
`approve`; the PR carries `config-change-approved`. Today `plan-files.sh` reads only the approval commit's subject.

**Approval field** (r1 #2): the text after `Plan approved by:` up to `·` or the line end, on the plan's last line
starting `Plan review:` (the status line); prose that quotes it is never read. **Rule** (r1 #1, option a): on a
runner's branch (`<prefix>/<card>-agent`, as `run.sh` names it) the field must read exactly
`reviewer (D-27, tier <low|medium>, issue #<n>)` and pass: `tier.sh` == t · review.md's last `## Plan review (round N)`
has `Verdict: approved` · plan.md unchanged, status line excepted, since the last commit touching review.md (r1 #3) ·
`eligible.sh <n> <card>`. Anything else there (a lead field, none, malformed, high) → exit 5. Off a runner branch a
field starting `reviewer` → exit 5; any other field keeps today's lead path.

**The lead decides at this gate:** (1) CI's `guards` job: `apt-get update && apt-get install -y gh` (Debian, 2.23, no
pin), `issues: read`, `GH_TOKEN` on the plan-scope step, plus a step proving the token reads
`collaborators/<actor>/permission` and `issues/<pr>` on this PR (r1 #5). (2) Accepted costs: a high-tier agent card
stops and stays stopped until B1.56 (a lead field on a runner branch is refused); a D-27 card's hook calls `gh` ≈ 5
times per Edit/Write (offline = blocked); the lead field off runner branches stays unchecked, as today; Bash writes
skip the hook (CI catches them). (3) r1 #6: `run.sh`'s prompt ("At the plan gate … stop") and allow list (no
`scripts/pr-step.sh`) still stop a run, and B1.58 holds `run.sh`: file **B1.61** (filing lane, own PR) for both;
B1.55 closes `Partial — pending B1.61`.

## Files

| File                                 | Change                                                                                     |
| ------------------------------------ | ------------------------------------------------------------------------------------------ |
| `scripts/ci/plan-files.sh`           | `[--run] [--offline]`; the Rule above, exit 5 with the reason; `--any`, `--file` unchanged |
| `.claude/hooks/plan-scope.sh`        | `--run` on a `-agent` branch; exit 5 → block with the reason                               |
| `scripts/ci/check-plan-scope.sh`     | `--run` on a `-agent` branch                                                               |
| `scripts/agent/eligible.sh`          | optional `<card>`: the issue's "Card id" field must equal it                               |
| `scripts/agent/eligible-smoke.sh`    | E10 card id equal / different / missing                                                    |
| `scripts/metrics/plan-deviations.sh` | `--offline`, `--run` from the PR's head ref: a merged PR's verdict never flips (r1 #4)     |
| `scripts/metrics/wait-time.sh`       | a D-27 approval commit is no lead wait: left out of the plan-gate wait (r1 #4)             |
| `scripts/hook-smoke.sh`              | S16–S25, C9–C10 with a `gh` shim (no jq)                                                   |
| `scripts/metrics-smoke.sh`           | M26–M29                                                                                    |
| `.github/workflows/ci.yml`           | decision (1)                                                                               |
| `.claude/agents/dev-lead.md`         | Loop 5 D-27 path; path-guard `'!backlog/work/*/review.md'` (r1 #3)                         |
| `.claude/skills/work-next/SKILL.md`  | "The gate": the D-27 exception; high tier and interactive sessions keep it                 |
| `.claude/docs/hooks.md`              | plan-scope row: the Rule                                                                   |

## Interfaces touched

```
plan-files.sh [--run] [--offline] <card> [<rev>]   exit 0 · 3 · 4 · 5 "plan-files: <card> approval at <sha7>: <why>" · 1
eligible.sh <issue> [<card>]          + gh api issues/<n> --jq .body; "### Card id" ≠ <card> → exit 1
dev-lead in a run (prompt "Issue #<n> is labeled agent-ready (D-27)", RUNNER_CHILD=1), plan review approved:
  tier.sh low|medium and eligible.sh <n> <card> exit 0 → field `reviewer (D-27, tier <t>, issue #<n>)`, commit
  `docs(backlog): <card> plan approved`, continue as after `approve` · high or a refusal → today's gate line, stop
```

## Verification (`bash` and `/bin/bash` 3.2)

- Red `test(scripts): B1.55 D-27 approval probes`: S17–S25, C9, C10, E10, M27, M29 FAIL; S16, M26, M28 pass already.
- Green: hook-smoke 488 OK (476 + S16 low and medium accepted · S17 tier high · S18 field low, tier.sh high · S19 not
  labeled · S20 labeler read-only · S21 card id differs · S22 review not approved · S23 plan edited after review ·
  S24 lead field / no field / malformed on a runner branch · S25 D-27 field off a runner branch, and quoted in prose
  only; C9 high, C10 lead field, both on a runner branch); eligible-smoke 10 OK; metrics-smoke 27 ok (M26 lead-time,
  M28 throughput take a D-27 approval; M27 wait-time leaves it out; M29 plan-deviations: a runner PR with a lead field
  → every non-paperwork file outside, a valid D-27 one → listed with no `gh` issue call).
- `grep -c agent-ready` → dev-lead.md ≥ 2, SKILL.md ≥ 1 (red 0). Live, read-only: `eligible.sh 166 B1.41` exit 0,
  `eligible.sh 166 B1.55` exit 1. CI: the token step green on this PR. No headless run.

## Work breakdown

| Step     | Role            | Produces                          | Commit                                       |
| -------- | --------------- | --------------------------------- | -------------------------------------------- |
| 1 red    | dev-lead        | four smokes                       | `test(scripts): B1.55 D-27 approval probes`  |
| 2 green  | dev-lead        | scripts, hook, ci.yml, role texts | `chore(agents): B1.55 agent-ready plan gate` |
| 3 review | reviewer (diff) | `review.md`                       | `docs(backlog): B1.55 review`                |

Follow-ups after B1.58 (it holds `scripts/CLAUDE.md`): rows for plan-files `--run`/`--offline`/exit 5, eligible.sh
`[<card>]`, probe ids.

Plan review: pending · Plan approved by: · Rounds: 1
