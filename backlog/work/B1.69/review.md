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

## Plan review (round 2)

SCOPE: all (tooling, no §). Plan at `36587d3` (round 2: `git diff d9445c0 36587d3` touches `plan.md` only, +29 −18).
Re-read: cards B1.69 and B1.72 (`E1-todos.md:900`, `:933`), `advice.md`, runner `docker-compose.yml`, `run.sh`
(`preflight` `:80`, dispatcher `:274`), `run-smoke.sh` (`run()` `:104`, direct calls `:152`, `:262`, `:305`),
`sandbox-probe.sh`, `.github/rulesets/main.json:30`, B1.62's plan (precedent for the drill and the subject).

Probes run (none on the tree; one on a scratch copy of `scripts/` under the session scratchpad):

- `scripts/next-task.sh --check B1.69` → `[next-task] B1.69: no overlap with any Doing or Review card` (exit 0)
- `scripts/agent/tier.sh backlog/work/B1.69/plan.md` → `high`; `scripts/ci/check-plan-scope.sh` → `OK: chore/B1.69-runner-git-identity changes only paperwork`
- the plan's baseline numbers, today on the host: `run-smoke.sh` → `16 probes OK`; `tier-smoke.sh` → `9 probes OK`;
  `hook-smoke.sh` → `hook-smoke: 511 probes OK`; `sandbox-probe.sh` → `9 of 10 probes FAILED`. All four match the plan.
- `gh repo view st-minhho2/level-up-lab` → `PUBLIC`, so the drill's clone with no login works as written.
- Copy probe of the plan's harness change (`identity_problem` first in `preflight` unless `binary`; `run()` exports
  `GIT_CONFIG_GLOBAL=$TMP/gitconfig` holding an identity, `GIT_CONFIG_NOSYSTEM=1`), run once with the host's identity
  and once with `GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1` outside: the FAIL sets differ by exactly
  **R5 and R13** ("TERM left the claude run going", "poll TERM: lock/stopped/calls=0"). The copy has other
  environment-only FAILs (no commits, no `.claude/`) equal in both runs. See note C1.

| Check                                                                | Result                                                                                                                                                                                                                                                                                                                                                                |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file belongs to the card                                       | pass. Four tooling files plus `work/B1.69/*`. The B1.72 rows are gone because decision 2 now defaults to "leave B1.72 as filed" (r1 #1 resolved). The alternative's cost is stated as five places plus Blocked by, two more Files rows                                                                                                                                |
| interfaces follow `ts-style.md`; mutations in actions; Prisma in lib | n/a (no `src/`). The refusal line, the S11 conditions and the two header commands are pasted. `--check-binary` and `--mode` are unchanged, and S4 still calls `--mode`                                                                                                                                                                                                |
| follows `advice.md` or states the deviation                          | pass. Approach A and the named bot. The compose header is now stated as a reading of "README or script", with a new README as the alternative (r1 #3 resolved). Dropping `(red)` is stated (B1.62 #185)                                                                                                                                                               |
| ≤ 7 criteria, measurable Thens                                       | pass. The card's 5 Acceptance clauses map to S11, R17, the header step, the PR statement (decision 1) and the label                                                                                                                                                                                                                                                   |
| verification: exact commands, expected numbers                       | pass (r1 #4 resolved). Red: 1 of 17 / 10 of 11. Green: 17, 9 and 511, each matching today's baseline + 1 / 0 / 0. The container drill under `-p b169-verify` gives each command and its expected line, and R17 is stated as hand-run until B1.60. `-e RUNNER_BUDGET_USD=1` was dropped, which is harmless: the drill stops at "not logged in", before any `claude -p` |
| skeleton → red → green → map → review                                | pass for tooling (B1.58 and B1.62 precedent): red `test(scripts)`, green `chore(scripts)`, reviewer, PR. No skeleton or map row without a §                                                                                                                                                                                                                           |
| `Lead approves spec` box                                             | n/a. No section. `Plan approved by:` is empty; I write neither                                                                                                                                                                                                                                                                                                        |
| no settled D-n contradicted                                          | pass. D-19 label; D-28 tier `high` = `tier.sh`; D-27 keeps the lead's `approve` (high tier); D-29 metrics read the `Agent-Run:` trailer, not the author                                                                                                                                                                                                               |
| `next-task.sh --check B1.69`                                         | pass: "B1.69: no overlap with any Doing or Review card"                                                                                                                                                                                                                                                                                                               |

Round-1 reasons: #1 resolved (default changed, alternative costed), #2 resolved (rebase and squash both stated, the
squash trailer marked `[unverified]`), #3 resolved (stated as a reading, alternative named), #4 resolved (above).

Notes for the lead's gate and the diff review (none blocks; each is checked at diff review):

- **C1 (binding for the build).** The Files row says "`run()` exports `GIT_CONFIG_GLOBAL` …". However, R5 (`run-smoke.sh:152`)
  and R13 (`:262`) start `run.sh` directly, not through `run()`, and both reach `preflight`. As the plan is worded, those
  two calls read the host's own global identity. The lead's host has one, so the planned "17 probes OK" holds there.
  On a host with no global `user.name`, for example B1.60's CI job, R5 and R13 FAIL with no mention of identity
  (confirmed on the copy, above). The same export belongs on both direct calls. `:305` (R14, `--check-binary`) skips
  the check, so it does not need it. This stays inside `run-smoke.sh`, which is already in the Files table. If the
  diff leaves either call without the export, the diff review reports it as a correctness finding.
- **C2 (decision 2's default, one unstated order).** The plan covers B1.72 picked after B1.69. B1.72 is `To do` and
  eligible now (`next-task.sh --list`), so it can also merge first. In that order `scripts/CLAUDE.md` says S1–S10
  once B1.69 lands, because this card keeps `scripts/CLAUDE.md` out of scope. Either way the guide stays one probe
  short until someone edits it. That costs a follow-up line, not a defect in this card.
- **C3.** The footer still reads `Rounds: 1`. Updating it is the dev-lead's job.

Verdict: approved (ready for the lead's gate; high tier, so the lead's `approve` is required before any build commit)

Riskiest unfalsified: S11 step 2 treats the directory of `GIT_CONFIG_GLOBAL` as a mount point listed in mountinfo,
which depends on `/home/node/.level-up-lab` being the exact mount target (`docker-compose.yml:75`). This was not run
here and is first exercised by the container drill.
