# B1.65 advice

Read: the card (`plan/E1-todos.md` "### B1.65"), `analysis.md`, D-19/D-26/D-27/D-28/D-29, `.claude/agents/dev-lead.md`
Loop 5, `.claude/skills/work-next/SKILL.md` "The gate", `backlog/work/B1.55/plan.md`, `scripts/agent/run.sh` (289
lines), `run-smoke.sh` (R1–R15, 15 probes OK on bash 3.2 today), `tier.sh`, `worktree.sh`. Tooling, no §: nothing in
`src/`, `prisma/`, `e2e/`. Authority: the card's Acceptance and D-27 are the contract; dev-lead Loop 5 (merged with
B1.55, d66fccd) already carries the D-27 path, and its two detection signals (prompt opens `Issue #<n> is labeled
agent-ready (D-27)`, `RUNNER_CHILD=1`) both hold today. The only blocker is the sentence at `run.sh:218`.

## Approaches

### A (recommended): sentence-only prompt change, header line, exact-prompt probe R16

- **Change:** in `run.sh`, replace only `At the plan gate print the gate line and stop;` (line 218) with `At the plan
gate follow Loop 5's D-27 path: a plan the reviewer approved at tier low or medium proceeds with no gate line; at
tier high, or when scripts/agent/eligible.sh refuses, print the gate line and stop;` (rest of the prompt byte for
  byte); header line 6 `Until B1.55 every run stops at the plan gate.` becomes `A reviewed low or medium plan of the
issue proceeds (D-27, Loop 5); a high-tier plan or a refusal stops at the gate.` In `run-smoke.sh`: R16 and the
  header legend (`R1–R16`).
- **Pros:** one sentence is the whole defect; `outcome()`, `comment()`, ALLOW/DENY and R1–R15 stay byte for byte, so
  the unchanged-behavior proof is "R1–R15 green"; no new surface that a run could influence; the live run proves the
  rest.
- **Cons:** a run that passes the gate and then stops on a limit is reported as `limit:<subtype>` with no word that the
  plan was approved (the evidence is on the branch and in the log, not in the issue comment); `outcome: gate` now
  means "high tier or a refusal", not "every card", and no probe says so.
- **Fits rules:** yes. Card Test line, D-27, D-28 (tier from `tier.sh`, never the agent's choice), invariant 6 (no new
  bypass; `mode()` untouched, R6 still pins it). `scripts/agent/` is in `CONFIG_PROTECTED` → `config-change-approved`
  (D-19), added by the agent at PR creation.

### B (alternative): A plus a reported approval

- **Change:** A, and `comment()` gains a `- approval:` line read from the worktree's `plan.md` status line (shape
  `reviewer (D-27, tier <t>, issue #<n>)` or `none`), with a probe R17 and R12 extended.
- **Pros:** the lead reading the issue comment sees at once that a stopped run had passed the gate.
- **Cons:** (1) `comment()` says "fixed fields only, never agent text" and `plan.md` is written by the agent: even
  regex-validated, a forged well-formed line would be shown as fact; the honest source is `plan-files.sh --run <card>`
  (exit 0), which needs `gh` and git inside `comment()`, a new coupling and ≈ 6 `gh` calls per comment; (2) the card's
  Acceptance does not ask for it, and `eligible.sh`/`feature-map.sh`/metrics read the same vocabulary in parallel
  cards; (3) R12's fixture plan has no status line, so two probes change; (4) analysis Q3 already proposed leaving it
  to its own card. Dropped by A and not lost: file it as a follow-up card only if the live run shows the missing line
  hurts.
- **Fits rules:** yes, but larger than the card's size (S) and outside its Acceptance.

## Recommendation

Approach A. The prompt is the single causal link; B adds an unverified claim to a channel that is meant to carry only
runner-derived facts. Plan tier: **high** (`scripts/agent/` is protected, D-28), so the lead's `approve` stands and
the PR carries `config-change-approved`.

## Impact

| File                                                                                                                            | Add/Change                                                                                        | Signature                      | ACs (card Acceptance) |
| ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------ | --------------------- |
| `scripts/agent/run.sh`                                                                                                          | Change: prompt sentence (line 218), header line 6                                                 | none (a string and a comment)  | A1, A2                |
| `scripts/agent/run-smoke.sh`                                                                                                    | Change: add R16, header legend `R1–R16`, line 2 `R1–R16`                                          | none                           | A3                    |
| `backlog/work/B1.65/plan.md`, `review.md`                                                                                       | Add: the plan, the plan review, the live-run evidence                                             | none                           | all                   |
| `backlog/work/B1.65/pr-body.md`                                                                                                 | Add: the PR body                                                                                  | none                           | all                   |
| the PR                                                                                                                          | Label `config-change-approved` right after it opens                                               | `gh pr edit <n> --add-label …` | A7                    |
| Not in this PR: card status lines, README                                                                                       | B1.65 and B1.55 move through the closing lane after merge (`card-status.sh`, `backlog/CLAUDE.md`) | none                           | A6                    |
| Not touched: `eligible.sh` + smoke, `.devcontainer/runner/`, `scripts/metrics/`, `outcome()`, `comment()`, ALLOW/DENY, `mode()` | parallel cards B1.62–B1.64 and B1.57; unchanged behavior                                          | none                           | none                  |

No client component is involved (no `src/`), so no server-rendered markup, JavaScript-off or pre-hydration line
applies.

Doc drift: none in this PR. `backlog/plan/E1-todos.md` quotes `run.sh:197` and `run.sh:4` (stale, actual 218 and 6)
and the B1.55 status line says "pending B1.65": the closing lane rewrites both (the card is not edited here).
`backlog/work/B1.44/*` and `B1.55/*` mention the old sentence as history, left alone.

## Risks

- **Migration:** none. No `prisma/`, no dependency, no environment variable (`RUNNER_*` are the runner's own and
  unchanged).
- **Security:** the prompt only loosens what dev-lead is told; every guard that makes a run's approval honest is
  already merged and unchanged: plan-scope hook (`--run` on a `-agent` branch or `RUNNER_CHILD`), CI
  `check-plan-scope.sh`, `eligible.sh <n> <card>`, `tier.sh`. Honor floor from B1.55's accepted costs stays (Bash
  writes skip the hook; closing the issue revokes). The first time a run passes the gate unattended is the live run:
  that is the real test of those guards.
- **Run cost:** after the change every eligible low or medium card runs to a draft PR and beyond (build, review loop):
  the default caps (`RUNNER_MAX_TURNS=150`, `RUNNER_BUDGET_USD=10`) now bound a full delivery, not a gate stop. In
  flight is still capped at 3 branches. Outside this card; the lead should know before `--poll` is run on real issues.
- **Isolation:** none for the smoke (scratch repo, shims; R14's probe folder is removed). The live run touches the
  runner container, a throwaway worktree on `chore|feat/<card>-agent`, and one issue and draft PR on GitHub.
- **Existing tests that could turn red:** R6 (stdin `has` checks only; `#7`, `B1.44`, `SKILL.md`, the worktree path all
  stay in the prompt) stays green; R12's `has 'Reply' "$c"` reads the comment, not the prompt. Nothing else reads the
  prompt. `run-smoke.sh` is not wired into CI or lefthook (no reference in `.github/` or `lefthook.yml`): the
  reviewer and the lead run it by hand, so the PR body must quote its result.
- **verify-red:** `scripts/verify-red.sh` judges vitest test commits and has no smoke handling (grep: no `smoke`);
  the red proof for this card is the smoke itself run at the `test(...)` commit, as B1.55's evidence does (`bash` and
  `/bin/bash` 3.2).
- **Live acceptance run (A4, A5), inside the runner container, ≤ 2 runs, `--max-turns` ≤ 15, ≤ USD 1 each:**
  - Preconditions: the throwaway card is on `origin/main` (filing lane) with `Spec:` and `Test:` lines (else the run
    first dispatches `spec-analyst`, which costs turns the cap cannot spare), a Files table touching only
    `backlog/work/<card>/…` (tier low per `tier.sh`; verify with `scripts/agent/tier.sh` before the run), an
    `agent-ready` issue authored and labeled by the lead, `RUNNER_ELIGIBLE` default so the real `eligible.sh` runs;
    the container's `claude` version is in `verified-versions`; the container clone is on B1.65's pushed branch.
  - Command: `docker compose -f .devcontainer/runner/docker-compose.yml exec -e RUNNER_MAX_TURNS=15 -e
RUNNER_BUDGET_USD=1 runner scripts/agent/run.sh <n>`; the run's budget flag is `BUDGET − TURN_USD` = 0.75.
    `RUNNER_BUDGET_USD=1.25` gives exactly 1.00 if the lead reads "≤ USD 1" as the flag's value; overshoot of a
    turn past the flag is possible [unverified], so the lead's cap is a plan-approval choice.
  - Turn arithmetic: B1.44 run 4c reached the gate in 9 turns and USD 0.496; the approval commit, `pr-body.md`,
    push and draft add about 5 turns and USD 0.3–0.4 [estimate from analysis Q2]: tight against 15 turns / 0.75, so A5
    may need run 2 (`run.sh <n>` resumes from the first missing artifact and replaces the stopped mark). Whether
    subagent turns count toward `--max-turns` is [unverified]; the plan review is a subagent.
  - Evidence for A4, on the run's branch: `docs(backlog): <card> plan approved` with field `reviewer (D-27, tier
low, issue <n>)`; `scripts/ci/plan-files.sh --run <card>` exits 0; no `Plan for <card> is ready` in any run's
    result; both logs under `runs/<n>/` (turns, USD from the result line). A5: `gh pr view <pr> --json isDraft`.
  - Stop rules: a run that errors (`error:*`) retries once inside `run.sh` and that retry is a second claude call;
    count it against the 2 runs (`run.sh` makes up to 2 claude calls per invocation). So the budget is: 1 invocation
    if it errors, 2 only when run 1 ended on a clean limit. This is stricter than analysis Q2 assumed.
  - Cleanup is outside this PR (see Q4).

## Test strategy

| Layer                   | File                                     | ACs                                        | Mocks                                                   |
| ----------------------- | ---------------------------------------- | ------------------------------------------ | ------------------------------------------------------- |
| Probe (bash smoke), red | `scripts/agent/run-smoke.sh` R16 (a)–(d) | A1, A2, A3                                 | the existing `claude`/`gh` shims and fakes; no new shim |
| Probes unchanged        | `run-smoke.sh` R1–R15                    | unchanged behavior (R6, R10–R12, R14, R15) | as today                                                |
| Live run                | the container, evidence in the PR body   | A4, A5                                     | none: real `claude`, `gh`, firewall (lead present)      |

R16, one probe, four checks (`reset; run 7`, stdin in `$FIX/stdin-1`, compared via `$(cat …)` which drops the final
newline `printf '%s\n'` adds):

- **(a) whole prompt:** equals a literal built from `$WT/chore-b1-44-agent`, issue 7, card B1.44: any later edit of
  the prompt is a visible test change.
- **(b) opening:** begins `Issue #7 is labeled agent-ready (D-27): run card B1.44 as dev-lead:`: dev-lead's detection
  signal; without this pin a rewording turns the D-27 path off with no test failing. (a) already implies it; keep it
  as its own `say` line so the failure names the cause.
- **(c) old sentence:** `At the plan gate print the gate line and stop` absent. Do not assert the absence of
  `print the gate line and stop` alone: it stays in the new sentence for the high-tier branch.
- **(d) header:** `run.sh` has no `Until B1.55` and has `Loop 5` on a comment line.
- Optional hardening, one line: `reset; issue 7 B4.4; run 7` gives the same prompt with `feat/B4.4-agent` (the
  literal is parametrised by card and branch), so the `chore`/`feat` split cannot fork the text.

**Red reason:** at the `test(scripts): B1.65 runner prompt (red)` commit, `bash scripts/agent/run-smoke.sh` and
`/bin/bash scripts/agent/run-smoke.sh` print `1 of 16 probes FAILED`, exit 1: R16 fails on assertion (a) and (c) (the
prompt still ends `At the plan gate print the gate line and stop; …`) and on (d) (`Until B1.55` still in line 6);
R1–R15 `ok`. Not an import or syntax failure: `run-smoke.sh` has no imports, and the probe uses only the existing
fixtures. Green commit: `chore(scripts): B1.65 runner prompt follows D-27` (B1.55 and B1.58 used the `chore(scripts)` prefix for
scripts), touching `run.sh` only and no probe.

## Mutation hot spots

`pnpm test:mutation` covers `src/lib` + `src/actions` only: not applicable, no `src/` change. The equivalent for a
prompt string: the three words that carry the behavior, each pinned by R16 (a): `follow Loop 5's D-27 path`, `tier low
or medium proceeds`, `tier high, or when scripts/agent/eligible.sh refuses, print the gate line and stop`. A
mutation that drops `or when scripts/agent/eligible.sh refuses` (a refusal would then proceed) or swaps `high` for
`medium` is the dangerous one; a whole-prompt literal catches both, a `has` check on a fragment would not.

## Questions settled / escalated

```
Question:    Q1 exact prompt and header text, and what R16 asserts
Class:       P2 spec silent (tooling: card and D-27 name the behavior, not the words)
Sources:     backlog/plan/E1-todos.md:862 "red because: the prompt the `claude` shim receives still says "At the plan gate print the gate line and stop""
             .claude/agents/dev-lead.md:62 "In a run of `scripts/agent/run.sh` for an `agent-ready` issue (D-27: its prompt opens"
Conflict:    none
Verdict:     analysis Q1 governs with two corrections: R16 must not forbid "print the gate line and stop" (it stays in
             the high-tier clause), only the old unconditional sentence; the header check is negative plus `Loop 5`,
             not a pinned full line (a comment is not behavior).
Next action: use the sentence in Approach A; write R16 (a)–(d).
Must not:    reword the opening `Issue #<n> is labeled agent-ready (D-27)` or restate more of Loop 5 than the card's
             parenthetical (two sources of truth drift).
Doc drift:   none
Escalate:    none
```

```
Question:    Q2 "reaches a draft PR" against ≤ 2 runs, ≤ 15 turns, ≤ USD 1
Class:       P2 spec silent (the caps are the lead's choice at plan approval, not a D-n)
Sources:     backlog/work/B1.65/analysis.md:52 "B1.44 live run 4c (host, opus-5-5): gate"
             backlog/plan/E1-todos.md:863 "one live run on a low-tier test card passes the gate with the D-27 field (`docs(backlog): <card> plan approved`) and reaches a draft PR"
Conflict:    the card wants a draft PR; the estimate for it (14–16 turns, USD 0.77–0.88) sits at or above the caps
Verdict:     agree with analysis: A4 must hold, A5 is best effort, `[unverified]` if the cap stops it. Corrections: A4
             need not be run 1 (it only needs to hold within the 2 runs); an `error:*` retry inside one invocation is
             a second claude call, so count calls, not invocations; `RUNNER_BUDGET_USD=1.25` is the setting for a
             flag value of exactly 1.00. The lead picks 1 or 1.25 in the plan.
Next action: put the cap choice and the A5 fallback in plan.md "The lead decides at this gate".
Must not:    raise a cap silently, or run a third time to reach the draft.
Doc drift:   none
Escalate:    none
```

```
Question:    Q3 outcome()/comment() for a run that passed the gate and then hit a limit
Class:       P2 spec silent
Sources:     scripts/agent/run.sh:178 "comment() { # comment <issue> <outcome> <card> <branch> <worktree> <base> <detail>: fixed fields only, never agent text"
Conflict:    none
Verdict:     agree with analysis: leave both unchanged (Approach A). Approach B's field would read agent-written text
             into a "fixed fields only" comment.
Next action: none; if the live run shows the gap hurts, file a card.
Must not:    add an `approval:` field in this card.
Doc drift:   none
Escalate:    none
```

```
Question:    Q4 the live test card and its cleanup
Class:       P4 two sections collide (card-lifecycle rules against a throwaway card)
Sources:     backlog/CLAUDE.md:92 "Ids `B<epic>.<n>` are permanent, never reused."
             backlog/work/B1.65/analysis.md:66 "close the issue, close the draft PR unmerged, prune branch and"
Conflict:    analysis proposes "remove or close the card"; backlog/CLAUDE.md names only a filing lane and a closing lane
             (status Open, Partial, Done), `check-backlog.sh` keeps README rows Open/Partial, and an id is never reused.
             There is no lane or status for withdrawing a card.
Verdict:     backlog/CLAUDE.md governs: running the cleanup outside B1.65's PR does not take it outside these rules. Settle
             one of: (1) the test card is a real docs-only card whose draft PR the lead merges and the closing lane
             closes as Done (no new status needed; recommended, cheapest, honest); (2) the lead closes the PR
             unmerged and removes the card in a docs(backlog) PR, which is a file outside both lanes and needs its
             own plan line. Also required either way: the card carries `Spec:` and `Test:` lines, or it is not
             eligible and the run spends turns on `spec-analyst`.
Next action: name the choice in plan.md "The lead decides at this gate"; file the card (filing lane) before the run.
Must not:    leave an Open card and a closed issue with nothing recording why, or hand-edit README totals.
Doc drift:   none (if option 2, a one-line status rule in backlog/CLAUDE.md would need its own D-n; not proposed)
Escalate:    none
```

```
Question:    Q5 container run before B1.62 (Prisma engines, Playwright browser)
Class:       P2 spec silent
Sources:     scripts/worktree.sh:101 "(cd "$DIR" && pnpm install --frozen-lockfile --prefer-offline --silent)"
             scripts/worktree.sh:116 "  dir      $DIR"
Conflict:    none
Verdict:     agree with analysis: do not wait for B1.62. `worktree.sh` creates the worktree and its `.env`
             (lines 53–81) before the install, and prints the `dir` line only at line 116, so an install failure leaves
             a usable worktree and `run.sh` exits 1 ("made no worktree") with no claude call. The second `run.sh <n>`
             finds the worktree via `git worktree list`. What is skipped is only step 5 (deps) and the `db:*` steps
             (6), which a docs-only card never needs. The effect of a missing `node_modules` on the run's hooks
             (`plan-scope.sh` is bash plus git) is [unverified].
Next action: keep as a risk line in plan.md; do not add B1.62 as a dependency.
Must not:    run `pnpm install` by hand in the container to get past it (an egress rule is the point of the firewall).
Doc drift:   none
Escalate:    none
```

```
Question:    Q6 what B1.55 Partial to Done depends on
Class:       P0 no conflict
Sources:     backlog/plan/E1-todos.md:760 "pending B1.65: `scripts/agent/run.sh`'s prompt still says "At the plan gate print the gate line and stop""
Conflict:    none
Verdict:     agree with analysis: A4 alone (B1.55 never required a draft PR); the move is the closing lane after
             B1.65 merges, not this PR.
Next action: after merge, `card-status.sh B1.55 Done "<evidence>"` and `B1.65 Done` in one closing PR.
Must not:    mark B1.55 Done on the strength of the smoke alone: the live gate pass is the missing clause.
Doc drift:   E1-todos.md:760 and :859 (stale line numbers, status) in the closing commit
Escalate:    none
```

```
Question:    Q7 where the live run's code comes from, and the label
Class:       P2 spec silent
Sources:     backlog/work/B1.65/analysis.md:76 "the container clone checks out B1.65's pushed branch (as"
Conflict:    none
Verdict:     agree with analysis, with one more precondition: the card worktree is branched from `origin/main`, so
             dev-lead's Loop 5 is the merged one while `run.sh` (new prompt) is the clone's: that split is intended.
             `config-change-approved` goes on B1.65's PR at once (D-19); the test card's PR is not protected-path and
             carries none.
Next action: record the container clone's HEAD sha in the live evidence.
Must not:    run the live test from the main checkout or with `--dangerously-skip-permissions` (R6 pins both).
Doc drift:   none
Escalate:    none
```
