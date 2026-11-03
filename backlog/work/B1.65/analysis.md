# B1.65 analysis

Written by dev-lead from the spec-analyst's report (the analyst's Write was refused by the harness: subagents return
text). Facts from `scripts/agent/run.sh` (289 lines) and `run-smoke.sh` (R1–R15) at `25293d1`. The card's line
numbers are stale: "At the plan gate print the gate line and stop" is at `run.sh:218` (card: 197), "Until B1.55 every
run stops at the plan gate." at `run.sh:6` (card: 4). The card is left as it is.

## Completeness

A tooling card has no Intent/REQ/AC shape, so the first table checks the card's Acceptance clauses.

| #   | Clause                                                                               | Measurable?                            | How proven                                                                                                                                        |
| --- | ------------------------------------------------------------------------------------ | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1  | The prompt tells dev-lead to follow Loop 5's D-27 path; high tier or a refusal stops | Yes, once the exact text is fixed (Q1) | New probe R16 in `run-smoke.sh`: the `claude` shim's stdin equals the expected prompt; the old sentence is absent                                 |
| A2  | The header says the same                                                             | Partly ("the same" is prose)           | R16 greps `run.sh` for the removed "Until B1.55" and a fixed phrase (Q1); the reviewer reads the rest                                             |
| A3  | run-smoke asserts the exact prompt                                                   | Yes                                    | R16; R6's loose `has` checks stay                                                                                                                 |
| A4  | One live run on a low-tier test card passes the gate with the D-27 field             | Yes                                    | On the run's branch: `docs(backlog): <card> plan approved`, `plan-files.sh --run <card>` exit 0, no "Plan for <card> is ready" in the result (Q4) |
| A5  | …and reaches a draft PR                                                              | Yes, may not fit the lead's cap (Q2)   | `gh pr view <n> --json isDraft` true; turns and USD from the log's result line                                                                    |
| A6  | B1.55 moves from Partial to Done                                                     | Yes                                    | Closing lane after merge, `card-status.sh B1.55 Done "<evidence>"`, never in this PR (Q6)                                                         |
| A7  | The PR carries `config-change-approved` (D-19)                                       | Yes                                    | `gh pr view --json labels` on B1.65's PR (`scripts/agent/` protected); the test card's PR is not labeled (Q7)                                     |

| Check                         | Result  | Note                                                                                                                                           |
| ----------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| ≤ 7 criteria                  | pass    | 7                                                                                                                                              |
| Every Then measurable         | partial | A2 and A5 under the cap (Q1, Q2)                                                                                                               |
| Out of scope stated           | gap     | Not named on the card: `eligible.sh` + smoke (B1.63/64), `.devcontainer/runner/` (B1.62), `scripts/metrics/` (B1.57), `outcome()`'s vocabulary |
| Unchanged behavior with proof | gap     | None named; proof is R1–R15 green, above all R6 (argv, env, bypass only in `mode()`), R10–R12 (retry, limits, gate comment), R14, R15          |
| Dependencies done             | pass    | B1.55 merged d66fccd (#171, Partial); B1.58 Done (#170); B1.62 not needed if the worktree exists (Q5)                                          |
| Settled D-n contradicted      | pass    | D-27, D-28, D-19, D-26 followed                                                                                                                |
| Test red for the right reason | pass    | The old sentence is in the prompt today: R16 fails on the assertion                                                                            |

Findings that bind the plan:

- dev-lead detects a D-27 run by two signals (Loop 5): the prompt opens `Issue #<n> is labeled agent-ready (D-27)`
  and `RUNNER_CHILD` is `1`. Both hold today; the only blocker is the sentence at `run.sh:218`. R16 must pin the
  opening too, or a rewording would turn the D-27 path off with no test failing.
- `outcome()` reads only the result text (`Plan for $2 is ready` → gate, `PR for $2 is ready` → ready). After this
  card `gate` means "high tier or a refusal", not "every card".
- ALLOW/DENY need no change: bare `Bash` is allowed, and `tier.sh`, `eligible.sh`, `scripts/ci/*`, `git *`,
  `gh pr edit *` are named. [read, not run]

## Open questions

1. **Exact prompt and header text.** Proposed: replace only the `run.sh:218` sentence, rest byte for byte, with "At
   the plan gate follow Loop 5's D-27 path: a plan the reviewer approved at tier low or medium proceeds with no gate
   line; at tier high, or when scripts/agent/eligible.sh refuses, print the gate line and stop." Header line 6: "A
   reviewed low or medium plan of the issue proceeds (D-27, Loop 5); a high-tier plan or a refusal stops at the
   gate." R16: the whole prompt equals a literal built from the fixture's issue, card, worktree and branch; the
   opening `Issue #<n> is labeled agent-ready (D-27): run card` is present; the old sentence is absent; the header
   no longer says "Until B1.55". Why: one sentence is the whole defect; a full-prompt literal makes any later edit a
   visible test change.
2. **"Reaches a draft PR" vs ≤ 2 runs, `--max-turns` 15, ≤ USD 1 each.** B1.44 live run 4c (host, opus-5-5): gate
   in 9 turns, USD 0.496 (≈ USD 0.055/turn). After the gate: approval edit + commit 2, `pr-body.md` 1, push 1,
   draft 1, slack ≥ 1 → 14–16 turns, USD 0.77–0.88 [estimate]. `run.sh` passes `--max-budget-usd BUDGET − TURN_USD`,
   so `RUNNER_BUDGET_USD=1` gives 0.75. Whether subagent turns count toward `--max-turns` is [unverified].
   Proposed: A4 must hold in run 1; A5 may take run 2 (`run.sh <n>` resumes from the first missing artifact); if
   neither run opens the draft, the lead chooses: accept A4 with A5 `[unverified]`, or raise the cap once.
3. **`outcome()` for a run that passed the gate then hit a limit.** Today: `limit:error_max_*`, the comment says
   **limit** with tier, branch, session, denials, retry; nothing says the plan was approved. Proposed: leave
   `outcome()`, `comment()` and R10–R12 unchanged; the approval is on the branch; A4's evidence reads the log and git.
   An `approval:` comment field is its own card.
4. **The live test card and issue.** Needs an Open tooling card whose plan is tier low (Files only docs/backlog)
   merged on `origin/main` (worktree.sh branches from it), and an `agent-ready` issue naming it, authored and labeled
   by the lead. Proposed: the lead files a throwaway docs-only card (filing lane) whose Acceptance names one file
   under `backlog/work/<card>/`; after the run: close the issue, close the draft PR unmerged, prune branch and
   worktree, remove or close the card, all outside B1.65's PR. If the plan lands medium, it still proceeds under
   D-27; the lead rules whether medium counts for A4.
5. **Container run vs `worktree.sh` before B1.62.** `worktree.sh` (`set -euo pipefail`) runs `pnpm install
--frozen-lockfile --prefer-offline --silent` (line 101) after `git worktree add`; the firewall refuses
   `binaries.prisma.sh`. Whether the install fails is [unverified]. Proposed: do not wait for B1.62. If it fails,
   `run.sh` exits 1 ("made no worktree") before any `claude` call (costs none of the 2 runs); a second `run.sh <n>`
   finds the worktree via `git worktree list` and skips claim and worktree.sh. The draft PR comes before any
   `pnpm test`/`test:e2e`. The effect of a half-installed `node_modules` on the run's hooks is [unverified].
6. **What B1.55 Partial → Done depends on.** Proposed: A4 alone (B1.55 never required a draft PR); the move is the
   closing lane after B1.65 merges, citing the log paths and the approval commit.
7. **Where the live run's code comes from.** Proposed: the container clone checks out B1.65's pushed branch (as
   B1.58 did), so `run.sh` carries the new prompt; the card worktree branches from `origin/main` (B1.55's dev-lead).
   `docker compose -f .devcontainer/runner/docker-compose.yml exec -e RUNNER_MAX_TURNS=15 -e RUNNER_BUDGET_USD=1
runner scripts/agent/run.sh <n>`, lead present; `runs/<n>/` logs are the evidence. `config-change-approved` on
   B1.65's PR right after it opens.

## Needs a ruling

None. No settled D-n changes. Q2, Q4, Q5 are the lead's decisions at plan approval.
