# B1.65 plan — The runner's prompt lets a run pass a reviewed low or medium plan (D-27) (tooling)

Round 2 (plan review r1: 5 reasons, "r1 #n"). Approach: A from advice.md — replace the one unconditional sentence and
the header line; R16 pins the whole prompt. Risk tier **high** (`scripts/agent/` is CONFIG_PROTECTED) → the lead's
`approve`; the PR carries `config-change-approved` (D-19). ALLOW/DENY, `outcome()`, `comment()` unchanged.

**Accepted costs** (r1 #4): `--poll` and `run.sh <n>` now carry a low/medium card past the gate to build, review and
PR under the defaults (150 turns, USD 10), not a gate stop; a limit hit after the approval is reported as `limit`
with no word of the approval (it is on the branch: the approval commit, `plan-files.sh --run`); `outcome: gate` now
means "high tier or a refusal". An `approval:` comment field (advice approach B) is a follow-up card at most.

**The lead decides at this gate:** (1) the prompt sentence below; it differs from advice Q1's wording on purpose
(r1 #3): it names Loop 5's three conditions (Verdict approved, `tier.sh`, `eligible.sh <n> <card>`) so the run checks
them before it writes the field, not the guards after. (2) Live budget: `RUNNER_MAX_TURNS=15 RUNNER_BUDGET_USD=1`
(flag 0.75; the last turn may overshoot, ≈ USD 0.25), at most 2 `claude` calls in all, a retry and a
`--check-binary` (only if `run.sh` refuses the version; 2.1.303 is verified) each count. A4 (the D-27 approval commit)
must hold within them; A5 (draft PR) is best effort, `[unverified]` on the card if the cap stops it. (3) Test card
(r1 #1): dev-lead files **B1.66** in the filing lane (own PR), Tier **0** (the plan is the deliverable): "A plan for
how long the runner keeps its run logs", `_tooling · no §_`, `Depends on:` —, `Spec:` none — tooling, `Test:`
`scripts/agent/tier.sh backlog/work/B1.66/plan.md` prints `low` — red because: no plan; Acceptance: the plan states
what `runs/<n>/` holds today and proposes a retention rule and the card to build it, its Files lists only
`backlog/work/B1.66/*`, no script change. Branch `chore/B1.66-agent`. The lead merges the filing PR, opens the issue
form (Card id B1.66), labels it `agent-ready`. If the cap stops the run before the draft, an interactive dev-lead
session finishes B1.66 from its branch (pr-body, draft); the lead merges it like any tier-0 card; B1.66 closes in
its own lane. (4) Precondition (r1 #2): WIP is 4 Doing today (B1.57, B1.62, B1.63, B1.65); the live run starts only
after B1.65's PR is ready (Review) and `scripts/next-task.sh --claim B1.66` prints `may start`. (5) Container before
B1.62: `worktree.sh`'s `pnpm install` may fail on Prisma engines → `run.sh` exits 1 before any `claude` call; a
second `run.sh <n>` finds the worktree. If the run's commits fail on missing `node_modules`, stop and wait for B1.62;
never the host. (6) B1.55 moves to Done on A4 alone, in its closing lane after this PR merges.

## Files

| File                         | Change                                                                 | Why        |
| ---------------------------- | ---------------------------------------------------------------------- | ---------- |
| `scripts/agent/run.sh`       | header line 6 and the prompt's gate sentence (line 218)                | A1, A2     |
| `scripts/agent/run-smoke.sh` | R16: the whole prompt as a literal, the header; header comment adds it | A3         |
| `backlog/work/B1.65/*`       | analysis, advice, plan, review, live.md (live run evidence), pr-body   | A4, A5, A7 |

Not here: `eligible.sh` + smoke (B1.63/B1.64), `.devcontainer/runner/` (B1.62), `scripts/metrics/` (B1.57),
`scripts/CLAUDE.md`, B1.55's and B1.65's card text (closing lanes fix the stale `run.sh:197`/`:4` references).

## Interfaces touched

```
run.sh header line 6:  # A reviewed low or medium plan of the issue proceeds (D-27, dev-lead Loop 5); a high-tier plan
                       # or a refusal stops at the gate.
prompt, from "At the plan gate" (was "At the plan gate print the gate line and stop; a question …"):
  At the plan gate take dev-lead Loop 5's D-27 path: once the plan review says Verdict: approved, a plan that
  scripts/agent/tier.sh rates low or medium, with scripts/agent/eligible.sh $n $card exiting 0, gets the reviewer's
  D-27 approval line and the run goes on; at tier high or on a refusal print the gate line and stop; a question only
  the lead can answer goes to backlog/README.md "Waiting on human", then stop.
argv, ALLOW, DENY, env, outcome(), comment(): unchanged
```

## Verification (`/bin/bash` 3.2 on the host; bash 5.2 inside the runner container)

- Red `test(scripts): B1.65 exact run prompt probe` (body "Red because …"): run-smoke `1 of 16 probes FAILED` (R16:
  stdin ≠ literal, old sentence present, header says "Until B1.55"); R1–R15 ok.
- Green: run-smoke `16 probes OK` on both bashes; tier-smoke 9 OK; `scripts/ci/check-plan-scope.sh` OK;
  `pnpm lint && pnpm typecheck && pnpm test` green (no `src/` change; mutation n/a).
- R16: stdin-1 equals the prompt built from issue 7, B1.44, `$WT/chore-b1-44-agent`, `chore/B1.44-agent`; it opens
  `Issue #7 is labeled agent-ready (D-27): run card`; no "print the gate line and stop; a question"; `run.sh` holds
  no "Until B1.55" and its header names `Loop 5`.
- Live (lead present, container clone on `chore/B1.65-run-prompt`): `docker compose -f
.devcontainer/runner/docker-compose.yml exec -e RUNNER_MAX_TURNS=15 -e RUNNER_BUDGET_USD=1 runner
scripts/agent/run.sh <n>` → on `chore/B1.66-agent`: `docs(backlog): B1.66 plan approved` with
  `Plan approved by: reviewer (D-27, tier low, issue #<n>)`, `scripts/ci/plan-files.sh --run B1.66` exit 0, no gate
  line in the result; draft PR if reached; turns, USD, denials, outcome into `live.md`.

## Work breakdown

| Step     | Role            | Produces                                   | Commit                                             |
| -------- | --------------- | ------------------------------------------ | -------------------------------------------------- |
| 0 file   | dev-lead        | B1.66 test card, own PR                    | `docs(backlog): card B1.66 …`                      |
| 1 red    | dev-lead        | R16                                        | `test(scripts): B1.65 exact run prompt probe`      |
| 2 green  | dev-lead        | run.sh header and prompt                   | `chore(scripts): B1.65 runner prompt follows D-27` |
| 3 review | reviewer (diff) | `review.md`                                | `docs(backlog): B1.65 review`                      |
| 4 ready  | dev-lead        | Loop 9: CI green, `pr-step.sh ready`       | —                                                  |
| 5 live   | lead + dev-lead | `live.md` (B1.66 merged, claim may start)  | `docs(backlog): B1.65 live run`                    |
| 6 review | reviewer (diff) | pass on `live.md`: A4, A5 evidence (r1 #5) | `docs(backlog): B1.65 review`                      |

Plan review: pending · Plan approved by: · Rounds: 1
