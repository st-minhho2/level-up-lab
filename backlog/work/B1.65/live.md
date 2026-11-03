# B1.65 live runs (plan step 5)

Inside the B1.58 runner container (`level-up-lab-runner-runner-1`, claude 2.1.303, `--mode` bypassPermissions), the
clone at `chore/B1.65-run-prompt` 9434993 (the new prompt), issue #184 (Card id B1.66, tier-0 test card, labeled
`agent-ready` by the lead; `eligible.sh 184 B1.66` exit 0), `RUNNER_MAX_TURNS=15 RUNNER_BUDGET_USD=1`, lead present.
`--claim B1.66` printed `may start (WIP 1/3: Doing B1.57)` before run 1. Logs: `runs/184/` in the container's
runner-runs volume.

| Run | Log                            | Turns | USD   | Denials | Outcome | Where it stopped                                                                                        |
| --- | ------------------------------ | ----- | ----- | ------- | ------- | ------------------------------------------------------------------------------------------------------- |
| 1   | `20261103T025049Z-17898.jsonl` | 9     | 0.351 | 1       | ended   | Loop 3: `git commit` of `plan.md` → `Author identity unknown` (the container has no git identity)       |
| 2   | `20261103T025259Z-20531.jsonl` | 7     | 0.120 | 0       | ended   | Loop 3: pre-commit `tsc` fails (TS7006 in `e2e/21-clear-search.spec.ts:44`), Prisma client absent       |
| 3   | `20261103T055846Z-34182.jsonl` | 16    | 0.668 | 0       | ended   | Loop 4: the reviewer's `review.md` fails pre-commit Prettier; dev-lead may not edit it, so no D-27 line |
| 4   | `20261103T090356Z-77499.jsonl` | 16    | 0.604 | 2       | limit   | Loop 5 passed (D-27 line, e7e9dd0); then `pr-step.sh push` exit 128: no git credential for HTTPS        |
| 5   | `20261103T100949Z-550.jsonl`   | 25    | 0.519 | 1       | ready   | Loop 9: draft PR #200 opened by the run, CI green, ready (already marked ready)                         |

Total: 2 `claude` calls (the plan's cap), 16 turns, USD 0.471.

Run 3 (2026-11-03, after B1.62 #186 and B1.69 #192 merged, image rebuilt, the container's identity set by B1.69's
header step, `sandbox-probe.sh` "11 probes OK"): the lead chose a fresh start, so the clone moved to `main` 5b30ca2 and
the old worktree `chore/B1.66-agent` (a7fce59, run 1's staged plan, never pushed) and its branch were removed;
`run.sh 184` with `RUNNER_MAX_TURNS=15 RUNNER_BUDGET_USD=1` (USD 0.75 for `claude`). First of the two runs the lead
allows after B1.69.

## What the runs show

- `worktree.sh chore/B1.66-agent` made the worktree inside the container (claim, branch; `worktree.sh` printed its `dir` line, which comes after its
  `pnpm install` under `set -e`, so the install exited 0 — inferred, the output went to the lead's terminal), but
  `node_modules/.prisma/client` was never generated: the engines come from `binaries.prisma.sh`, which the firewall
  refuses (`pnpm exec prisma generate` failed in run 2). Without the generated client, `tsc` in the pre-commit hook
  fails, so no commit can land in a container worktree. This is B1.62 (#186, open), as decision 5 foresaw.
- Run 1 hit an earlier gap first: no `user.name`/`user.email` in the container. Its one try,
  `git -c user.name=… -c user.email=… commit`, was refused by the deny rule `Bash(git -c*)`: the deny list holds under
  `bypassPermissions`. The run stopped and reported; no workaround. The lead set the identity from the host's
  (`git config --global` in the container) before run 2. Not in B1.58's setup steps or probes: follow-up.
- Toward A1 (the prompt read as intended), short of proof: run 1 skipped advice for a tier-0 card, wrote a plan
  whose Files lists only `backlog/work/B1.66/*` and ran `tier.sh` (`low`); run 2 reused that staged plan and stated "`RUNNER_CHILD=1`,
  so this is a valid D-27 run" before the commit failed. Neither run printed the gate line.
- Neither run reached the plan review, so `eligible.sh 184 B1.66`, the D-27 field and the draft PR were never tried.

## Acceptance

The git identity gap is not B1.62's: a later run needs it set in the container and kept across a rebuild; no card
holds it yet (review pass 3).

- A4 (a run passes the gate with the D-27 field): **met** by run 4 (e7e9dd0, after B1.62, B1.69 and B1.74); runs 1–3
  stopped before it on the git identity, the Prisma engines and the review commit.
- A5 (draft PR): **met** by run 5 (#200, after B1.76).
- Run 3 got past both earlier stops: `worktree.sh` made a fresh worktree with the Prisma client; the plan commit
  `291724d docs(backlog): B1.66 plan` landed, authored `level-up-lab runner <runner@level-up-lab.invalid>` with the
  trailer `Agent-Run: 1` (B1.69 and B1.57 in a real run); `tier.sh` → `low`, `next-task.sh --check B1.66` no overlap,
  `eligible.sh 184 B1.66` exit 0; the reviewer's plan review round 1 `Verdict: approved`, 0 findings. It stopped at
  the review commit: `review.md` failed lefthook's Prettier check and dev-lead, which never writes a card's
  `review.md`, took its D-27 line back out of `plan.md` and stopped (USD 0.11 of 0.75 left). A4 still **not met**, now
  on a process gap, not the environment: B1.74 (the lead chose: dev-lead formats `review.md` with Prettier, format
  only). The run's plan names its follow-up card "B1.73", an id filed meanwhile (#194); B1.66's reviewer should
  renumber it to the next free id.
- Run 4 (2026-11-03, after B1.74 #196 merged; the second and last run the lead allowed after B1.69): dev-lead, with the
  lead present, merged `origin/main` (6e6f3d8) into the container worktree `chore/B1.66-agent` (ad17255, the bot's
  author) so the run read B1.74's dev-lead.md, then `run.sh 184` with `RUNNER_MAX_TURNS=15 RUNNER_BUDGET_USD=1`.
  The run committed the reviewer's `review.md` through B1.74's step (d0ca8a4), renumbered its follow-up card to
  B1.75 (79f5487), had round 2 reviewed (0a35605), then wrote and committed
  `Plan approved by: reviewer (D-27, tier low, issue #184)` (e7e9dd0): **A4 met** — the first run to pass the gate on
  the D-27 path. Every commit carries `level-up-lab runner <runner@level-up-lab.invalid>` and `Agent-Run: 1`. It wrote
  `pr-body.md` and called `scripts/pr-step.sh push`: exit 128, `could not read Username for 'https://github.com'`;
  it recorded that under "Waiting on human" (3b09a57) and ran out of turns (16, `error_max_turns`). The two permission
  denials were guard-bash refusing a compound command that named the wrapper; the run retried with plain calls.
  Cause: `scripts/pr-step.sh:13` unsets `GIT_CONFIG_GLOBAL`, the only place the container's credential helper and
  identity live → B1.76. **A5 not met** (no draft PR). 15 turns did not cover plan → draft PR; the lead allowed one
  more run after B1.76 with more turns.
- Run 5 (2026-11-03, after B1.76 #199 merged and the lead rebuilt the runner: GitHub's credential helper at system
  scope, `sandbox-probe.sh` "12 probes OK"; the third run the lead allowed after B1.69, with
  `RUNNER_MAX_TURNS=25 RUNNER_BUDGET_USD=1`): the run resumed at Loop 5's push. `scripts/pr-step.sh push` worked;
  `scripts/pr-step.sh draft "docs(backlog): B1.66 plan for run log retention"` opened **draft PR #200** (**A5 met**);
  6dd96b5 cleared its own "Waiting on human" row; it merged `origin/main`, filled the PR body (Map delta none, Review =
  the plan review; `gh pr edit` failed on a GitHub deprecation error, so it used `gh api -X PATCH`), waited for CI
  (green at db95f93) and called `scripts/pr-step.sh ready 200`, which found the PR already ready. Outcome `ready`,
  25 turns, USD 0.519; the one permission denial was guard-bash refusing a compound command naming the wrapper.
  Two actions on #200 were not the run's: `ready_for_review` at 10:11:29Z by the lead's account (the run's one
  `ready` call came after CI, about 10:20), and db95f93 at 10:15, GitHub's "Update branch" by the lead (no
  `Agent-Run:` trailer). Measured: `scripts/metrics/unattended.sh 184` → "184 B1.66 200 … 0 messages, yes",
  "unattended 1/1 = 100.0 %" (its ready time is the lead's click); `scripts/metrics/no-rework.sh 200` → human_commits
  db95f93, pending until merge. Total after B1.69: 3 runs (3, 4, 5), 57 turns, USD 1.79.
- State after run 5: PR #200 open, ready, CI green; worktree `chore/B1.66-agent` holds an uncommitted
  `backlog/work/B1.66/pr-body.md` (used only to fill the PR body); `runs/184/stopped` = `ready`.
- State left for a later run: worktree `chore/B1.66-agent` at a7fce59 with `backlog/work/B1.66/plan.md` staged, not
  pushed; `runs/184/stopped` = `ended`.
- Smaller finding for the reviewer of B1.66: the run's plan names its follow-up card "B1.68", which is right: B1.67 is already a card
  (`E1-todos.md:889`). (Corrects this file's first version, review pass 3 finding 1.)
