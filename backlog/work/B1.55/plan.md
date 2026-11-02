# B1.55 plan — dev-lead carries an agent-ready card past a reviewed low or medium plan (tooling)

Round 1. Tooling, tier quick (spec-analyst and advisor skipped); the card's Acceptance and D-27/D-28 are the contract.
Risk tier **high** (`.claude/`, `scripts/ci/`, `.github/`) → the lead's `approve`; the PR carries `config-change-approved`.
Today `plan-files.sh` reads only the approval commit's subject, so any `Plan approved by:` text passes. After this, a
`Plan approved by: reviewer (D-27, …)` line at the approval commit is checked; a plan without one keeps today's lead path.

**The lead decides at this gate:** (1) CI's `guards` job installs Debian's `gh` (apt, no pin) and gets `issues: read`
plus `GH_TOKEN` on the plan-scope step, so CI re-checks the issue (a new tool in CI). (2) Accepted costs: a D-27 card's
hook calls `gh` 4–5 times per Edit/Write (≈ 2 s; offline = blocked); the lead's own line stays unverifiable, as today
(B1.56 can make it so); removing the label later fails the PR's guards (revocation).

## Files

| File                                | Change                                                                                     |
| ----------------------------------- | ------------------------------------------------------------------------------------------ |
| `scripts/ci/plan-files.sh`          | a reviewer line at the approval commit must pass D-27 (below), else exit 5 with the reason |
| `.claude/hooks/plan-scope.sh`       | exit 5 → block with plan-files' reason                                                     |
| `scripts/agent/eligible.sh`         | optional `<card>`: the issue's "Card id" field must equal it                               |
| `scripts/agent/eligible-smoke.sh`   | E10 card id matches / differs / missing                                                    |
| `scripts/hook-smoke.sh`             | S16–S23, C9 with a `gh` shim (no jq): accepted and each refusal                            |
| `scripts/metrics-smoke.sh`          | M26 lead-time takes a D-27 approval; M27 plan-deviations: invalid D-27 → outside           |
| `.github/workflows/ci.yml`          | guards: `issues: read`, `apt-get install gh`, `GH_TOKEN` on the plan-scope step            |
| `.claude/agents/dev-lead.md`        | Loop 5: the D-27 path in a runner's run; a run never writes the lead's line                |
| `.claude/skills/work-next/SKILL.md` | "The gate": D-27 exception, high tier and interactive sessions keep it                     |
| `.claude/docs/hooks.md`             | plan-scope row: the D-27 check                                                             |

## Interfaces touched

```
plan-files.sh <card> [<rev>]  exit 0 · 3 · 4 · 5 "plan-files: <card> D-27 approval at <sha7>: <why>" (stderr) · 1
  the approval commit's plan.md has a "Plan approved by: reviewer" text → it must read exactly
  `Plan approved by: reviewer (D-27, tier <low|medium>, issue #<n>)`, once, and at that commit:
  tier.sh <its plan.md> == <t> · review.md's last "## Plan review (round N)" has a "Verdict: approved" line ·
  scripts/agent/eligible.sh <n> <card> exit 0. --any and --file: unchanged (no check)
eligible.sh <issue> [<card>]  + 1 gh call (.body); "### Card id" field ≠ <card> → exit 1 "card id <x>, not <card>"
dev-lead (run.sh prompt "Issue #<n> is labeled agent-ready (D-27)" and RUNNER_CHILD=1), after plan review approved:
  tier.sh low|medium and eligible.sh <n> <card> exit 0 → write the line, commit `docs(backlog): <card> plan approved`,
  continue as after `approve` (no gate line) · high or a refusal → today's gate line and stop
```

## Verification

- Red `test(scripts): B1.55 D-27 approval probes`: hook-smoke S17–S23 and C9 FAIL (exit 0, want 2/1), eligible-smoke
  E10 FAIL (usage), metrics-smoke M27 FAIL; S16 (valid low), M26 pass already. `grep -c agent-ready` dev-lead.md 0.
- Green, `bash` and `/bin/bash`: S16 low/medium accepted; S17 tier high; S18 line says low, tier.sh says high; S19 no
  issue / not labeled; S20 labeler read-only; S21 card id differs; S22 review not approved; S23 malformed / two lines;
  C9 check-plan-scope fails S17; E10; M26, M27. Full hook-smoke, eligible-smoke 10, metrics-smoke 27 OK.
- Live, read-only: `scripts/agent/eligible.sh 166 B1.41` exit 0, `… 166 B1.55` exit 1. No headless run.

## Work breakdown

| Step     | Role            | Produces                          | Commit                                       |
| -------- | --------------- | --------------------------------- | -------------------------------------------- |
| 1 red    | dev-lead        | three smokes                      | `test(scripts): B1.55 D-27 approval probes`  |
| 2 green  | dev-lead        | scripts, hook, ci.yml, role texts | `chore(agents): B1.55 agent-ready plan gate` |
| 3 review | reviewer (diff) | `review.md`                       | `docs(backlog): B1.55 review`                |

Not in scope (follow-ups after B1.58, which holds `scripts/agent/run.sh` and `scripts/CLAUDE.md`): the `scripts/CLAUDE.md` rows
(plan-files exit 5, eligible.sh `[<card>]`, probe ids); its prompt says "At the plan gate … stop" and its header
"Until B1.55 every run stops"; its allow list lacks `scripts/pr-step.sh`, so a headless run cannot push or draft.

Plan review: pending · Plan approved by: · Rounds: 1
