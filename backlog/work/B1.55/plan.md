# B1.55 plan — dev-lead carries an agent-ready card past a reviewed low or medium plan (tooling)

Round 3 (plan review r1: 7 reasons, r2: 5 reasons, all addressed, "r1 #n"/"r2 #n"; round 3 not re-reviewed: 2-round
cap). Tooling, tier quick (no analyst, no advisor); the card's Acceptance and D-27/D-28 are the contract. Risk tier
**high** (`.claude/`, `scripts/ci/`, `.github/`) → the lead's `approve`; the PR carries `config-change-approved`.
Today `plan-files.sh` reads only the approval commit's subject: any `Plan approved by:` text passes.

**Approval field** (r1 #2): the text after `Plan approved by:` up to `·` or the line end, on the plan's last line
starting `Plan review:` (the status line); prose quoting it is never read. **Runner path** (r1 #1, r2 #1): the hook
when the branch is `<prefix>/<card>-agent` or its env has `RUNNER_CHILD` (set by `run.sh`, out of the run's reach);
CI when the branch is `-agent` or an open `agent-ready` issue's "Card id" names the card. There the field must read
exactly `reviewer (D-27, tier <low|medium>, issue #<n>)` and pass: `tier.sh` == t · review.md's last
`## Plan review (round N)` has `Verdict: approved` · plan.md unchanged, status line excepted, since the last commit
touching review.md (r1 #3) · `eligible.sh <n> <card>` (open issue, r2 #3). Anything else (a lead field, none,
malformed, high) → exit 5. Off the runner path a field starting `reviewer` → exit 5; any other keeps today's lead path.

**The lead decides at this gate:** (1) CI `guards`: `apt-get update && apt-get install -y gh` (Debian 2.23, no pin),
`issues: read`, `GH_TOKEN` on the plan-scope step, and a step calling the three endpoints `eligible.sh` uses
(`issues/<pr>`, `issues/<pr>/events`, `collaborators/<actor>/permission`) with the job token on this PR (r2 #5).
(2) Accepted costs: a high-tier agent card stays stopped until B1.56, or the lead removes the label and runs it in a
session; a D-27 hook call costs ≈ 6 `gh` calls per Edit/Write (offline = blocked; a hung `gh` lets the write through
on the hook's timeout, CI still checks); the lead field off the runner path stays unchecked, as today; Bash writes
skip the hook, and under `backlog/` CI does not catch them: a run could forge review.md's verdict or edit plan.md
in the review.md commit (r2 #2), the same honor floor as today's lead line; closing the issue revokes the approval.
(3) r1 #6, r2 #4: only `run.sh`'s prompt line "At the plan gate print the gate line and stop" still stops a run (bare
`Bash` already allows `pr-step.sh`); B1.58 holds `run.sh`: file **B1.62** (next free id; filing lane, own PR) for it;
B1.55 closes `Partial — pending B1.62`.

## Files

| File                                 | Change                                                                                     |
| ------------------------------------ | ------------------------------------------------------------------------------------------ |
| `scripts/ci/plan-files.sh`           | `[--run] [--offline]`: the field and the runner check, exit 5; `--any`, `--file` unchanged |
| `.claude/hooks/plan-scope.sh`        | `--run` on a `-agent` branch or with `RUNNER_CHILD`; exit 5 → block with the reason        |
| `scripts/ci/check-plan-scope.sh`     | `--run` on a `-agent` branch or a card named by an open `agent-ready` issue                |
| `scripts/agent/eligible.sh`          | optional `<card>`: the issue is open and its "Card id" equals it                           |
| `scripts/agent/eligible-smoke.sh`    | E10 card id equal / different / missing, E11 closed issue with `<card>`                    |
| `scripts/metrics/plan-deviations.sh` | `--offline`, `--run` from the PR's head ref: a merged verdict never flips (r1 #4)          |
| `scripts/metrics/wait-time.sh`       | an approval commit whose field starts `reviewer (D-27` is no lead wait: left out (r1 #4)   |
| `scripts/hook-smoke.sh`              | S16–S26, C9–C11 with a `gh` shim (no jq)                                                   |
| `scripts/metrics-smoke.sh`           | M26–M29                                                                                    |
| `.github/workflows/ci.yml`           | decision (1)                                                                               |
| `.claude/agents/dev-lead.md`         | Loop 5 D-27 path; path-guard `'!backlog/work/*/review.md'` (r1 #3)                         |
| `.claude/skills/work-next/SKILL.md`  | "The gate": the D-27 exception; high tier and interactive sessions keep it                 |
| `.claude/docs/hooks.md`              | plan-scope row: the runner path                                                            |

## Interfaces touched

```
plan-files.sh [--run] [--offline] <card> [<rev>]   exit 0 · 3 · 4 · 5 "plan-files: <card> approval at <sha7>: <why>" · 1
eligible.sh <issue> [<card>]   + .state, .body; closed or "### Card id" ≠ <card> → exit 1 (only with <card>)
dev-lead in a run (prompt "Issue #<n> is labeled agent-ready (D-27)", RUNNER_CHILD=1), plan review approved:
  tier.sh low|medium and eligible.sh <n> <card> exit 0 → field `reviewer (D-27, tier <t>, issue #<n>)`, commit
  `docs(backlog): <card> plan approved`, continue as after `approve` · high or a refusal → today's gate line, stop
```

## Verification (`bash` and `/bin/bash` 3.2)

- Red `test(scripts): B1.55 D-27 approval probes`: S17–S26, C9–C11, E10, E11, M27, M29 FAIL; S16, M26, M28 pass.
- Green: hook-smoke ≥ 490 OK (476 + S16 low and medium accepted · S17 tier high · S18 field low, tier.sh high · S19
  not labeled · S20 labeler read-only · S21 card id differs · S22 review not approved · S23 plan edited after review ·
  S24 lead / no / malformed field on `-agent` · S25 D-27 field off the runner path, and quoted in prose only · S26 lead
  field with `RUNNER_CHILD=1` on a plain card branch; C9 high on `-agent`, C10 lead field on `-agent`, C11 lead field
  on a plain branch whose card an open `agent-ready` issue names); eligible-smoke 11 OK; metrics-smoke 27 ok (M26
  lead-time, M28 throughput take a D-27 approval; M27 wait-time leaves it out; M29 plan-deviations: a runner PR with a
  lead field → every non-paperwork file outside, a valid D-27 one → listed, no `gh` issue call).
- `grep -c agent-ready` → dev-lead.md ≥ 2, SKILL.md ≥ 1 (red 0). Live, read-only: `eligible.sh 166 B1.41` exit 1
  (closed), `eligible.sh 166` exit 0. CI: the token step green on this PR. No headless run.

## Work breakdown

| Step     | Role            | Produces                          | Commit                                       |
| -------- | --------------- | --------------------------------- | -------------------------------------------- |
| 1 red    | dev-lead        | four smokes                       | `test(scripts): B1.55 D-27 approval probes`  |
| 2 green  | dev-lead        | scripts, hook, ci.yml, role texts | `chore(agents): B1.55 agent-ready plan gate` |
| 3 review | reviewer (diff) | `review.md`                       | `docs(backlog): B1.55 review`                |

Follow-ups after B1.58 (it holds `scripts/CLAUDE.md`, `scripts/agent/run.sh`): B1.62 above; `scripts/CLAUDE.md` rows
for plan-files `--run`/`--offline`/exit 5, eligible.sh `[<card>]`, probe ids.

Plan review: changes requested, round 2 (cap; round 3 not re-reviewed) · Plan approved by: lead (session reply "approve"; decisions 1–3 as proposed), 2026-11-02 · Rounds: 1
