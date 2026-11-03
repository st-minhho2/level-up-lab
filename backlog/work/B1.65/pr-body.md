## Item

B1.65 — The runner's prompt lets a run pass a reviewed low or medium plan (D-27) (tooling, no spec section)

- spec: none — tooling (D-27); no `src/` change, no section
- test: probe R16 in `scripts/agent/run-smoke.sh` (the exact prompt and both header lines) — red before (f35f449: `1 of 16 probes FAILED`, R16), green after (5507b90, b72e2cb: `16 probes OK`)
- acceptance: A1–A3 met (R16), A7 met (label); A4 not met, A5 not reached: two live runs (`live.md`) stopped at the plan commit, before the gate (no git identity in the container, then no Prisma client: B1.62); A6 waits on A4. Lead decision: merge as is, B1.65 closes `Partial — pending live run after B1.62 and a git identity in the container`, B1.55 stays Partial
- risk tier: high (D-28, `scripts/agent/` is protected)

## Plan

### B1.65 plan — The runner's prompt lets a run pass a reviewed low or medium plan (D-27) (tooling)

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
after B1.65's PR is ready (Review, kept unmerged until the run), one of B1.57/B1.62/B1.63 has left Doing,
`scripts/next-task.sh --claim B1.66` prints `may start`, and the container clone's branch has merged `origin/main`
with B1.66's filing (else `branch_of` names `feat/B1.66-agent`; review r2 notes 1, 2). (5) Container before
B1.62: `worktree.sh`'s `pnpm install` may fail on Prisma engines → `run.sh` exits 1 before any `claude` call; a
second `run.sh <n>` finds the worktree. If the run's commits fail on missing `node_modules`, stop and wait for B1.62;
never the host. (6) B1.55 moves to Done on A4 alone, in its closing lane after this PR merges.

### Files

| File                         | Change                                                                 | Why        |
| ---------------------------- | ---------------------------------------------------------------------- | ---------- |
| `scripts/agent/run.sh`       | header line 6 and the prompt's gate sentence (line 218)                | A1, A2     |
| `scripts/agent/run-smoke.sh` | R16: the whole prompt as a literal, the header; header comment adds it | A3         |
| `backlog/work/B1.65/*`       | analysis, advice, plan, review, live.md (live run evidence), pr-body   | A4, A5, A7 |

Not here: `eligible.sh` + smoke (B1.63/B1.64), `.devcontainer/runner/` (B1.62), `scripts/metrics/` (B1.57),
`scripts/CLAUDE.md`, B1.55's and B1.65's card text (closing lanes fix the stale `run.sh:197`/`:4` references).

### Interfaces touched

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

### Verification (`/bin/bash` 3.2 on the host; bash 5.2 inside the runner container)

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

### Work breakdown

| Step     | Role            | Produces                                   | Commit                                             |
| -------- | --------------- | ------------------------------------------ | -------------------------------------------------- |
| 0 file   | dev-lead        | B1.66 test card, own PR                    | `docs(backlog): card B1.66 …`                      |
| 1 red    | dev-lead        | R16                                        | `test(scripts): B1.65 exact run prompt probe`      |
| 2 green  | dev-lead        | run.sh header and prompt                   | `chore(scripts): B1.65 runner prompt follows D-27` |
| 3 review | reviewer (diff) | `review.md`                                | `docs(backlog): B1.65 review`                      |
| 4 ready  | dev-lead        | Loop 9: CI green, `pr-step.sh ready`       | —                                                  |
| 5 live   | lead + dev-lead | `live.md` (B1.66 merged, claim may start)  | `docs(backlog): B1.65 live run`                    |
| 6 review | reviewer (diff) | pass on `live.md`: A4, A5 evidence (r1 #5) | `docs(backlog): B1.65 review`                      |

Plan review: approved, round 2 (4 notes, none blocking; notes 1–2 folded into decision 4) · Plan approved by: lead, 2026-11-03 (decisions 1–6 as proposed) · Rounds: 1

## Map delta

none (tooling; no feature row)

## Review

`/review-loop`: passes 3/3 (`backlog/work/B1.65/review.md`, "Diff review (pass 1)" a80a2af, "(pass 2)" 79b583c, "(pass 3)" 74c6d51 on `live.md`):
passes 1–2 ready for PR; pass 3 sent back three text fixes in `live.md` and this body, fixed in the next commit. Reviewer's suites (pass 2): vitest `202 passed`, playwright `43 passed`, stryker
`93.40` (no `src/` change).

| Pass | #   | Finding                                                                               | Disposition                                                                                                                                     |
| ---- | --- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | 1   | pr-body claimed run-smoke "16 OK on both bashes"                                      | fix now: real numbers below; the copied Plan text stays as approved                                                                             |
| 1    | 2   | R16's header check (`Loop 5` anywhere in lines 2–16) let "every plan proceeds …" pass | fix now: b72e2cb pins both header lines whole; that mutant → `1 of 16 probes FAILED`                                                            |
| 1    | 3   | the prompt restates Loop 5's conditions and can drift from dev-lead.md                | no change needed: accepted cost (plan review r2 note 3); today they match (dev-lead.md:62–68)                                                   |
| 1    | 4   | line-wrapped prompt; how the model reads it                                           | judged by the live run (plan step 5)                                                                                                            |
| 1    | 5   | ALLOW already names tier.sh and eligible.sh                                           | no change needed (run.sh:38–39)                                                                                                                 |
| 2    | A   | R16 greps the header pair anywhere in the file; an extra comment line after it passes | no change needed: the header is a comment the run never reads; the run's behavior comes only from the prompt, which R16 pins as a whole literal |

Smokes: host `/bin/bash` 3.2.57: run-smoke `16 probes OK`, tier-smoke `9 probes OK`. Runner container `bash` 5.2.15
(a `git archive` copy, no `.git`): run-smoke R6 and R15 fail, tier-smoke T4 fails, the same three as on `origin/main`
there (the container is the sandbox, so `mode()` gives `bypassPermissions`; T4 needs `.git`); R16 ok. Riskiest
unfalsified: whether a headless dev-lead in the container runs `tier.sh` and `eligible.sh` and writes the D-27 field
within 15 turns — only the live run shows it.

## Evidence

- AC met: 4/7 (A1–A3, A7; A4 not met, A5 not reached in 2 live runs: `live.md`; A6 waits on A4)
- tier: high
- plan deviations: none
- trace: n/a

## Checklist

- [ ] **Diff matches the approved plan**: no file outside the Files table, no interface outside the list.
- [ ] Red commit precedes the green commit; no `feat(` commit touches `*.test.*` or `e2e/**`.
- [ ] No `src/` change: no AC coverage, no mutation.
- [ ] No new `eslint-disable` / `@ts-ignore` / `@ts-expect-error`; protected config change carries `config-change-approved` (D-19, lead approved the plan 2026-11-03).
- [ ] No migration.
- [ ] `docs/metrics.md` per-card row filled.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
