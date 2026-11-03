# B1.69 review

## Plan review (round 1)

SCOPE: all (tooling, no §: `.devcontainer/runner/`, `scripts/agent/`, `backlog/`). Plan at `de44f10`. Read: card B1.69
and B1.72 (`backlog/plan/E1-todos.md:900`, `:933`), `advice.md`, `backlog/work/B1.65/live.md`, runner `docker-compose.yml`
and `Dockerfile`, `run.sh`, `run-smoke.sh`, `sandbox-probe.sh`, `.github/rulesets/main.json`, B1.62's plan review
(precedent for tooling rows), D-19, D-27 to D-29.

Probes run (none on the tree, none on the lead's `level-up-lab-runner` project or volumes):

- `scripts/next-task.sh --check B1.69` → `[next-task] B1.69: no overlap with any Doing or Review card` (exit 0)
- `scripts/agent/tier.sh backlog/work/B1.69/plan.md` → `high`; `plan-files.sh --any B1.69 HEAD` → 7 tokens, all in the table
- `scripts/ci/check-plan-scope.sh` → `OK: chore/B1.69-runner-git-identity changes only paperwork`
- `scripts/agent/run-smoke.sh` (host, today) → `16 probes OK`; `scripts/agent/sandbox-probe.sh` (host) → `9 of 10 probes FAILED`
- `run()` in `run-smoke.sh` already sets `GIT_DIR="$REPO/.git"` (a scratch repo committed with `-c`, no local identity),
  so with `GIT_CONFIG_GLOBAL` + `GIT_CONFIG_NOSYSTEM=1` the plan's R17 cannot read any host identity. Confirmed on git
  2.39.5 in a scratch repo: `GIT_CONFIG_GLOBAL=/dev/null` → `git config --get user.name` rc 1, and `XDG_CONFIG_HOME`'s
  `git/config` is ignored too; `user.name = "  "` → three bytes (the blank check is needed); `git var GIT_AUTHOR_IDENT`
  with no config → `Minh Ho V. [2] <minh.ho2@MBPM0030.local>` rc 0 (auto-detected: S11 step 4 is required, step 5 alone
  is not); a `.git/config` `user.name` or `GIT_AUTHOR_NAME` env → `git var` shows the override (S11 step 5 catches both)
- `git grep "10 probes"` → only `docker-compose.yml:15,19`; `git grep "S1–S10"` → `E1-todos.md:933,940`, `README.md:116,153`

| Check                                                                | Result                                                                                                                                                                                        |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file belongs to the card                                       | pass for the four tooling files. The two `backlog/` rows are decision 2 and are incomplete (reason 1)                                                                                         |
| interfaces follow `ts-style.md`; mutations in actions; Prisma in lib | n/a (no `src/`). `run.sh` refusal line, S11 conditions and the two header commands are pasted                                                                                                 |
| follows `advice.md` or states the deviation                          | pass on approach A and the named bot. One unstated reading of the card's "`.devcontainer/runner/` README or script" (reason 3). Dropping `(red)` from the test subject is stated (B1.62 #185) |
| ≤ 7 criteria, measurable Thens                                       | pass. The card's 5 Acceptance clauses map to S11, R17, the header step, the PR statement, the label. No banned adjective                                                                      |
| verification: exact commands, expected numbers                       | fail, minor (reason 4). Run-smoke numbers are exact (1 of 17 / 17 OK); the host sandbox-probe count, smoke counts and the drill commands are not                                              |
| skeleton → red → green → map → review                                | pass for tooling, as B1.58 and B1.62: red `test(scripts)`, green `chore(scripts)`, reviewer, PR. No skeleton or map row without a §                                                           |
| `Lead approves spec` box                                             | n/a. No spec section. `Plan approved by:` empty; I write neither                                                                                                                              |
| no settled D-n contradicted                                          | pass. D-19 label named; D-28 tier `high` matches `tier.sh`; D-27 lead's `approve` kept; D-29 metrics read the `Agent-Run:` trailer, not the author                                            |
| `next-task.sh --check B1.69`                                         | pass: "B1.69: no overlap with any Doing or Review card"                                                                                                                                       |

Not a reason: the plan is 59 lines against `planning.md`'s ≈ 40; B1.58 (113) and B1.62 (70) were not blocked on length.

Reasons:

1. **Decision 2 leaves B1.72 contradicting itself.** The plan edits B1.72's Acceptance to S1–S11 and its Depends on /
   Blocked by, but the card title (`E1-todos.md:933` "lists sandbox probes S1–S10"), its Status evidence (`:936`), the
   README "Remaining" row title (`README.md:153`) and the Execution-order node (`README.md:116`) keep "S1–S10". After this
   PR, B1.72 would say S1–S10 in three places and S1–S11 in one. State the full edit in decision 2 and the Files rows
   (title, row title, node; evidence line `grep -c '^#   S11'`), or offer only the alternative (leave B1.72 as filed, a
   one-line follow-up after it merges). The lead needs the whole cost of option 2 at the gate.
2. **Decision 1 states the squash case only.** `.github/rulesets/main.json:30` allows `["squash", "rebase"]`. A rebase
   merge puts `level-up-lab runner <runner@level-up-lab.invalid>` as author on `main`; a squash merge on GitHub may add a
   `Co-authored-by:` trailer for each commit author other than the PR author [plausible, not run], so the bot can reach
   `main` either way. Neither breaks anything (no rule keys on author), but "the bot stays on the branch" is the claim the
   lead approves; state both merge methods.
3. **The setup step lives in a compose header comment, not a "README or script".** The card's Acceptance says
   "`.devcontainer/runner/` README or script"; the advice calls approach A a literal match. The header is the runner's only
   setup document today, so the reading is reasonable, but the plan must say it is a reading (the header is the README
   equivalent) so the lead accepts it at the gate rather than at diff review.
4. **Verification numbers.** (a) Host `sandbox-probe.sh` at red: today `9 of 10 probes FAILED`, so the expected line is
   `10 of 11 probes FAILED` with S11's FAIL naming the step; say so. (b) Green: give the counts for `tier-smoke.sh` and
   `hook-smoke.sh` (or the line each prints). (c) Container drill: paste the commands (`-p b169-verify up -d --build
--wait`, the clone of the pushed branch, the probe, `exec -e RUNNER_BUDGET_USD=1 runner scripts/agent/run.sh 184`, the
   two header lines, `up -d --build --force-recreate`, `down -v`) with the expected line of each. (d) State that R17 is
   hand-run only: `run-smoke.sh` is not in CI until B1.60.

Verdict: changes requested

Riskiest unfalsified: S11 step 2 (dirname of `GIT_CONFIG_GLOBAL` is a mountinfo `$5` entry) relies on `/home/node/.level-up-lab`
being the exact mount point in the container; true by `docker-compose.yml:75`, not run here.
