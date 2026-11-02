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

## Plan review (round 2)

Plan at `114ac55 docs(backlog): B1.33 plan round 2 (test job, plan review r1)`.

| Check                                                                             | Result                                                                                                                                                                                |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: unchanged from round 1. Still two non-paperwork files, `ci.yml` and `scripts/CLAUDE.md`, and no sibling's file.                                                                 |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass (n/a): the step is pasted verbatim (`if: ${{ !cancelled() && env.HOTFIX != 'true' }}`, `run: scripts/hook-smoke.sh`), and no script changes.                                     |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: there is no `advice.md`, and the skip is stated (tier quick).                                                                                                                   |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: 3 Acceptance clauses. "A CI job runs it on every PR and fails on its exit 1": `test` is required in `.github/rulesets/main.json`, and the hotfix exemption is stated as a cost. |
| verification lists exact commands with expected numbers                           | pass: grep before/after, "440 probes OK", OK/OK. The simulation line is prose, not a command (note a).                                                                                |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: the skeleton, map and test commits now have stated reasons, step 1 runs in the lead's main session, and `ci(scripts): …` passes commit-msg.                                     |
| the section has a `Lead approves spec` box, ticked only by a human                | pass (n/a): no section, and nothing is ticked.                                                                                                                                        |
| no settled D-n contradicted                                                       | pass: D-19 label; D-25 follow-ups for the two `hook-smoke.sh` defects, filed in the closing PR as B1.20's closing PR `a221ea2` filed B1.32/B1.33.                                     |
| `scripts/next-task.sh --check B1.33` on the committed plan says no overlap        | pass: `[next-task] B1.33: no overlap with any Doing or Review card`                                                                                                                   |

**Round-1 reasons:**

1. **Answered.** The step moves to `test`, whose depth-1 checkout has no `origin/main` and no `HEAD_SHA`. I re-ran the
   dev-lead's simulation myself on /bin/bash 3.2 (`scratchpad/r2-check.sh`). It uses the same `sim-pr` commit
   `309cdd6` (a committed `src/lib/todos.ts` change on `a733c7b`), checked out detached as `refs/remotes/pull/1/merge`
   in fresh repos:
   - Depth 1 (`origin/main` absent, `git status` empty): `hook-smoke: 440 probes OK`, rc 0.
   - All heads fetched (`origin/main` present): rc 1, `FAIL require-review.sh spoke on a clean tree`, and nothing else.

   Both of the plan's claims reproduce. For a push to main, checkout's depth-1 fetch lands the pushed SHA as
   `origin/main` = HEAD, so the merge-base diff is empty and the gate stays silent (traced, not run). The two
   `hook-smoke.sh` defects are named for follow-up under D-25, and the step's own comment says why it is not in
   `guards`.

2. **Answered.** The lead's main session runs step 1.
3. **Answered.** The skeleton, map and test omissions each have a reason.
4. **Answered.** `!cancelled()` runs hook-smoke after a unit-test failure. Nothing after it in `test` depends on it
   (the coverage upload is `always()`), so no verdict is hidden.
5. **Answered.** The plan gives the merge order: if B1.32 merges first, the row takes its ids at Loop 9; if B1.32
   merges after, its new ids become a follow-up.

**Costs checked:**

- Run 41371867185 (`gh run view`): `test` took 49 s (01:19:15 → 01:20:04) and `guards` 38 s, as the plan says.
  Adding ≈ 19 s brings `test` to ≈ 68 s, which bills 2 min instead of 1. That is `[unverified]` on x86, and the plan
  marks it so.
- Wall clock is unchanged: `mutation` ran 5 min 3 s.

**Notes (not blocking):**

- (a) The simulation step in Verification names no script. Keep `sim-checkout.sh` with the PR, or name it in
  `pr-body.md`, so the diff reviewer can rerun it. This PR's own `test` run changes no `src/`, so it cannot show the
  probe staying silent on a feature PR.
- (b) `plan.md` is 61 lines against the ≈ 40-line screen in `planning.md`. Tables and the YAML block account for
  most of it. Its scope is still one change.

Verdict: approved. This means the plan is ready for the lead's gate; it is not approved for build. The `Plan approved
by:` line stays the lead's.

Riskiest unfalsified: that `actions/checkout` v4 at depth 1 on a real `pull_request` creates no
`refs/remotes/origin/*`. My simulation reproduces its fetch refspec by hand. The first feature PR after merge is the
first real proof, because this PR changes no `src/`.

## Diff review (pass 1)

Diff `5c8fe3d ci(scripts): B1.33 CI runs hook-smoke` against `origin/main` (merge base `a733c7b`). `origin/main` has
moved on by `ae9dcf6` (B1.31: `CLAUDE.md`, `src/CLAUDE.md`, `backlog/work/B1.31/`), which shares no file with this diff.
Scope: tooling. No `src/`, `prisma/` or `e2e/` change. Spec: none. The card's Acceptance is the contract.

**Commands (run by the reviewer in the card worktree, last line of each):**

| Command                                                  | Last line                                                                                                              |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                                              | `All matched files use Prettier code style!`                                                                           |
| `pnpm typecheck`                                         | `> tsc --noEmit` (exit 0, no diagnostics)                                                                              |
| `pnpm test`                                              | `Tests  202 passed (202)`                                                                                              |
| `pnpm test:e2e`                                          | `43 passed (1.1m)`                                                                                                     |
| `pnpm test:mutation`                                     | `Final mutation score of 93.40 is greater than or equal to break threshold 70`                                         |
| `scripts/ci/check-suppressions.sh`                       | `OK: no new suppressions`                                                                                              |
| `scripts/ci/check-config-change.sh` (label true / false) | rc 0 `allowed by label config-change-approved: .github/workflows/ci.yml` / `::error::… without the label`              |
| `scripts/ci/check-feat-commits.sh`                       | `OK: no feat commit touches tests`                                                                                     |
| `scripts/ci/check-ac-coverage.sh`                        | `OK: every criterion of a shipped section has a test`                                                                  |
| `scripts/ci/check-spec-sections.sh`                      | `OK: sections cited: 1 … 22`                                                                                           |
| `scripts/ci/check-features-map.sh`                       | `OK`                                                                                                                   |
| `scripts/ci/check-backlog.sh`                            | `OK: README matches the cards`                                                                                         |
| `scripts/ci/check-plan-scope.sh`                         | `OK: chore/B1.33-hook-smoke-ci stays inside the approved plan of B1.33`                                                |
| `scripts/verify-red.sh B1.33`                            | `::error::no 'test(<pkg>): B1.33 … (red)' commit`: expected. The plan has no test commit; the card's Test is the grep. |
| `git diff --stat origin/main...HEAD`                     | 5 files: `ci.yml` +4, `scripts/CLAUDE.md` 1/1, and `plan.md`, `pr-body.md`, `review.md`                                |
| `grep -l hook-smoke .github/workflows/*`                 | `.github/workflows/ci.yml` (the card's Test; `origin/main`: no match)                                                  |

**Probes run on copies (scratchpad, not the tree):**

- **CI-shaped checkout.** I built a fresh repo with `fetch --no-tags --depth=1 origin +5c8fe3d:refs/remotes/pull/138/merge`
  and a detached checkout, plus a node_modules symlink, then ran /bin/bash 3.2. Result: rc 0,
  `hook-smoke: 440 probes OK`, 0 FAIL, 83 s, and `git status` was empty afterwards.
- **Negative probe on the same copy.** `chmod -x .claude/hooks/guard-read.sh` gave rc 1,
  `hook-smoke: FAILURES above`, and 6 FAIL lines. The step's exit 1 reaches the runner because `run:` executes the
  script directly (mode `100755`, `#!/usr/bin/env bash`, last line `exit 1` on any fail).
- **PR #138 run 41374485183** (`gh run view`). Job `test` ran 01:49:51 → 01:50:59 (68 s; the plan estimated ≈ 68 s).
  Step "Every hook probe passes under CI's bash (hook-smoke.sh)" ran 01:50:32 → 01:50:56, conclusion success, and its
  log ends `hook-smoke: 440 probes OK`. All 7 ruleset checks are green: lint, typecheck, test, e2e, mutation,
  semgrep, guards.
- **Round-2 riskiest, now confirmed from the real log.** The `test` checkout ran
  `git … fetch --no-tags --prune --no-recurse-submodules --depth=1 origin +aae08d6…:refs/remotes/pull/138/merge`
  followed by `checkout --force refs/remotes/pull/138/merge`. It fetched no `refs/remotes/origin/*`, which is exactly
  the refspec the plan-review simulation reproduced by hand (440 OK with a committed `src/lib/todos.ts` change).
- **Environment leak check.** `cps` runs `check-plan-scope.sh` under `env -u GITHUB_HEAD_REF -u GITHUB_BASE_REF`, so
  the `pull_request` event's `GITHUB_HEAD_REF` cannot reach the C/L fixtures. `test` sets no `HEAD_SHA` or `BASE_SHA`,
  and `CI` is never read as a variable by `hook-smoke.sh` or `check-plan-scope.sh` (it appears only in comments).

**Checklist:**

| Check                                                           | Result                                                                                                                                                                                                                                                                                                 |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Acceptance 1: a CI job runs `hook-smoke.sh` and fails on exit 1 | pass. `test` is a required context in `.github/rulesets/main.json`. The CI run is green, and the negative probe gives rc 1. Hotfix PRs skip the step (`env.HOTFIX != 'true'`), as plan and PR body state and the lead approved. The PR body words it "every non-hotfix PR".                            |
| Acceptance 2: row names C1–C8 and L1–L6                         | pass. The script's ids are exactly S1–S15, C1–C8 and L1–L6 (`grep -oE '\b[SCL][0-9]{1,2} '`). The row reads `S1–S15; check-plan-scope C1–C8; `[ ]` rows L1–L6`. Its Needs column says `node_modules (js-yaml)`, which is true: probe line 221 calls `check-agent-frontmatter.sh`, which loads js-yaml. |
| Acceptance 3: `config-change-approved`                          | pass. PR #138 labels: `["config-change-approved"]`. `check-config-change.sh` rc 0 with it and `::error::` without it.                                                                                                                                                                                  |
| every AC has a test whose assertion matches its Then            | n/a (no §). The card's Test (the grep) matches, and the PR's own `test` run is the behavioral proof.                                                                                                                                                                                                   |
| no test weakened after red                                      | pass. `git log --first-parent --no-merges a733c7b..HEAD -- '*.test.*' e2e/` is empty, and there are no merge commits in the range.                                                                                                                                                                     |
| every changed file in `plan.md`                                 | pass. The five files match the plan's Files table, and the YAML step is byte-identical to the plan's Interfaces block.                                                                                                                                                                                 |
| Zod / Prisma / raw SQL / migration                              | n/a (no `src/`, no `prisma/`).                                                                                                                                                                                                                                                                         |
| no secret, no suppression                                       | pass (`check-suppressions.sh` OK; semgrep green on the PR).                                                                                                                                                                                                                                            |
| features map row moved                                          | n/a (no `features-map.md` row, as the plan states).                                                                                                                                                                                                                                                    |
| revert one changed line, does a check fail?                     | Reverting the `run:` step empties the grep (card Test red). Reverting the `if:` line makes hotfix PRs run the step, and nothing catches that. It is a lane policy, not an Acceptance line, so this is not a finding.                                                                                   |

**Findings:** none blocking.

**Notes (not blocking, no change requested):**

- (a) `pr-body.md` lines 56–57: the plan's `# node:24-bookworm …` and `# PR CI: …` shell comments were demoted to
  `### …` along with the headings. They sit inside the fenced block, so they render as literal `###` text. The
  trailer says `Rounds: 1` while the plan review took 2. Both are paperwork in the PR body; fix them only if the body
  is regenerated.
- (b) Out of scope → follow-up (D-25, already planned): `cps` does not unset `HEAD_SHA`/`BASE_SHA`, and the
  review-gate probe's "clean tree" precondition differs from `review_base`. The proving input is the round-2
  simulation (the `guards` checkout with a committed `src/` change gives `FAIL require-review.sh spoke on a clean tree`).
  This diff avoids both defects by placing the step in `test`, and the step's comment records why.
- (c) B1.32 interplay: whichever of B1.32 and B1.33 merges second makes B1.32's new probes run in the required
  `test` job. A probe that passes on /bin/bash 3.2 but not in CI's container then blocks every PR until it is fixed.
  The plan states this as the purpose.

Verdict: ready for PR

Riskiest unfalsified: the review-gate probe staying silent on a real feature PR that commits a `src/` change. The
refspec is now confirmed from the run log, but this PR changes no `src/`, so the first such PR after merge is the
first real CI run of that path. A push to `main` (depth-1 fetch to `refs/remotes/origin/main` = HEAD) is traced, not
run.
