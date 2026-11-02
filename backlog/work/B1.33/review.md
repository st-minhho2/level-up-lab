# B1.33 review

## Plan review (round 1)

SCOPE: tooling (`.github/workflows/ci.yml`, `scripts/CLAUDE.md`; no `src/`, no §).

Plan at `dcc13f5 docs(backlog): B1.33 plan`. The contract is the card's Acceptance (`backlog/plan/E1-todos.md` ### B1.33).

| Check                                                                             | Result                                                                                                                                                                                                                                                   |
| --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: no § and no map row (tooling). The two non-paperwork files are the two the card names. Neither is a sibling's file: B1.31 owns `CLAUDE.md` and `src/CLAUDE.md`, B1.32 owns `hook-smoke.sh`, `plan-scope.sh`, `check-plan-scope.sh` and `hooks.md`. |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass (n/a): no TypeScript. One workflow step is pasted verbatim, and the plan states that `hook-smoke.sh`'s arguments, output and exit codes are unchanged.                                                                                              |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: there is no `advice.md`, and the plan says "spec-analyst and advisor skipped" (tier quick, no `todos.ts` query).                                                                                                                                   |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: 3 Acceptance clauses: a grep match, the row's group names, and a label.                                                                                                                                                                            |
| verification lists exact commands with expected numbers                           | fail: see 1. Every number listed is right on a branch that changes no `src/`/`e2e/`/`prisma/`, which is this card's own PR. No command covers the PRs the step will gate afterwards.                                                                     |
| work breakdown has skeleton → red → green → map → review with convention subjects | fail: see 2 and 3. `ci(scripts): …` passes `lefthook.yml` commit-msg, with `ci(config)` as precedent.                                                                                                                                                    |
| the section has a `Lead approves spec` box, ticked only by a human                | pass (n/a): no section, and nothing is ticked.                                                                                                                                                                                                           |
| no settled D-n contradicted                                                       | pass: the plan follows D-19 (`config-change-approved` for `.github/`) and D-25 (`cps`'s own unset becomes a follow-up candidate, and `hook-smoke.sh` is not touched).                                                                                    |
| `scripts/next-task.sh --check B1.33` on the committed plan says no overlap        | pass: `[next-task] B1.33: no overlap with any Doing or Review card`                                                                                                                                                                                      |

I re-ran the plan's prototype on a scratch clone (`scratchpad/probe-32059`, /bin/bash 3.2). I set guards' env by hand:
`HEAD_SHA`, `BASE_SHA`, `GITHUB_HEAD_REF`, `GITHUB_BASE_REF`, `CI=true`, `GITHUB_ACTIONS=true`. With both SHAs set I
got 18 `check-plan-scope exit 128` FAILs: C1–C4, C6, C7, and L4–L6 in each of the 4 layouts. This matches the plan
exactly, and `env -u HEAD_SHA -u BASE_SHA` clears all 18. Both runs also failed one more probe,
`FAIL require-review.sh spoke on a clean tree`, which leads to reason 1.

Verdict: changes requested

1. **The new step fails `guards` on every PR that changes `src/`, `e2e/` or `prisma/`. The plan states no such cost,
   and this PR's own run cannot show it.**
   - **Where:** `scripts/hook-smoke.sh` "review gate" block (lines 430–439).
   - **Why it fails:** the block decides that a tree is "clean" with `git diff --quiet HEAD` plus untracked files. But
     `require-review.sh` compares against `review_base` = `git merge-base origin/main HEAD`. That is in
     `.claude/hooks/review-lib.sh`.
   - **What CI has:** `guards` checks out with `fetch-depth: 0`, so `origin/main` exists (`check-plan-scope.sh` relies
     on it already). On a PR, `HEAD` is the merge commit.
   - **Trigger:** any feature card's PR, for example one that commits a change to `src/lib/todos.ts`.
   - **What happens:** the working tree is clean, so the probe expects silence. But `git diff <base> -- src` holds the
     PR's own change, and no `reviewed` fingerprint exists in CI. `require-review.sh` therefore prints its block JSON,
     the probe reports `FAIL require-review.sh spoke on a clean tree`, and `hook-smoke` exits 1.
   - **Evidence:** confirmed by trace. In my clone, `origin/main` is stale at `a005b41`, so
     `git diff --stat $(git merge-base origin/main HEAD) -- src e2e prisma` reports 37 files changed while
     `git status --short` is empty. This is the same code path, and it produced that FAIL line in both runs.
   - **Why the plan missed it:** its prototypes ran on `origin/main` itself (`HEAD` = base, empty diff). This card's PR
     touches no `src/`, so its green `guards` proves nothing about feature PRs.
   - **What the plan must state:** which fix lands before this step merges, and in which card. `hook-smoke.sh` is
     B1.32's file, so either B1.32's plan takes the probe precondition, or a follow-up card is filed and sequenced
     ahead of B1.33. It must also add a verification line that runs `hook-smoke.sh` on a branch with a committed
     `src/` change against an `origin/main` that lacks it, expecting "N probes OK".
   - **Cost if nothing changes:** merging B1.33 as planned blocks the required `guards` check on every feature PR
     until that fix lands.
2. **The named role cannot do step 1.** Step 1 names `dev-lead`, but `dev-lead`'s path-guard refuses both files. I
   confirmed it: `.claude/hooks/path-guard.sh 'backlog/*' 'docs/metrics.md' 'docs/mistake-log.md'
'!backlog/00-decisions.md'` exits 2 for `.github/workflows/ci.yml` and for `scripts/CLAUDE.md` with
   `agent_type: dev-lead`. The step works only in the lead's main session (Owner: Lead, no `agent_type`). B1.20
   round 1, reason 1, raised the same point. State which session runs it.
3. **Skeleton and map steps are missing without a reason.** Add one line: there is no skeleton (no § function and no
   `NotImplementedError` analogue) and no map move (tooling has no `features-map.md` row). The plan already explains
   why there is no test commit; the other two missing steps need the same.
4. **A failing hook-smoke run hides three other verdicts.** The step goes before the three PR-only steps
   (`check-config-change.sh`, `check-feat-commits.sh`, `verify-red.sh --auto`). Under the default `success()`
   condition, those steps are skipped whenever `hook-smoke` fails. A PR that breaks a probe therefore reports nothing
   about its label, its feat commits or its red proof until a rerun. State this cost, or name a placement or `if:`
   that avoids it.
5. **The guide row's freshness depends on merge order with B1.32.** The card is titled "names every probe group", and
   the plan's row names S1–S15, C1–C8 and L1–L6. B1.32 changes `hook-smoke.sh` and does not own `scripts/CLAUDE.md`.
   If it adds a probe group or renumbers one and merges after B1.33, the row goes stale again with no card that owns
   it. State the expected order, or say which card updates the row.

Riskiest unfalsified: CI's container specifics, which I could not run. Under Actions, `HOME=/github/home`, the
checkout's global `safe.directory`, and mktemp fixture repos owned by root might change a git verdict. The plan's
`node:24-bookworm` prototype covers most of this but not the Actions-mounted workspace. The 57 s cost is also
`[unverified]` until the PR run.
