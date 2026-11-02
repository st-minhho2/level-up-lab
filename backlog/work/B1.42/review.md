# B1.42 review

## Plan review (round 1)

The plan under review is `3a86dff docs(backlog): B1.42 plan`. B1.42 is a tooling card with no §. Its contract is the
card's Acceptance, read from `origin/docs/B1.42-card:backlog/plan/E1-todos.md` ### B1.42 (open PR #151), together with
the lead's brief. The Acceptance has four probes, (a) to (d), and one stop rule: "If (a) or (b) fails the card stops
and reports before anything else". The brief adds three limits: no `bypassPermissions` or
`--dangerously-skip-permissions`, `--max-turns` ≤ 15 per run, and at most 6 runs. I re-checked the following against
the binary named in the plan, version `2.1.309 (Claude Code)`, without any API call:

- `--help` lists `--max-budget-usd`, `--include-hook-events`, `--permission-mode` (which accepts `dontAsk`) and
  `--tools <tools...>`.
- `--settings <file-or-json>` takes a single value.
- `--allowedTools <tools...>` is variadic and lets you list tools to allow.
- `--max-turns` does not appear in `--help`.

| Check                                                                             | Result                                                                                                                                                                                                                   |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| every file in the plan belongs to the section's features (map)                    | pass: tooling, so there is no § and no map row. The four files are all under `backlog/work/B1.42/`. The sandbox and the logs are outside the repo                                                                        |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass (n/a): no TypeScript, no action, no Prisma                                                                                                                                                                          |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: there is no `advice.md`. The plan states that the quick tier skips spec-analyst and advisor                                                                                                                        |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | fail: (a) is measured on the extra `--settings` hook, not on `.claude/settings.json` (reason 5). (c) and (d) have no expected value (reason 6)                                                                           |
| verification lists exact commands with expected numbers                           | fail: `jq … R3 R4` and `wc -l R*.jsonl` give no expected result. The sandbox creation and removal commands are missing, and the removal named (`worktree-prune.sh`) would not remove the sandbox (reason 7)              |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: no § means no skeleton, red/green or map. The plan states this. `spike.md` is the card's "Test", and both subjects match `docs(backlog): …`                                                                        |
| `Lead approves spec` box ticked only by a human                                   | pass (n/a): there is no section. `Plan approved by:` is empty                                                                                                                                                            |
| no settled D-n contradicted                                                       | pass: D-26 (on main) and D-27 to D-29 (PR #150) are respected. The runs use the lead's login on the lead's machine and nothing runs on GitHub Actions. D-25 is respected because widening findings go to follow-up cards |
| `scripts/next-task.sh --check B1.42` says no overlap                              | pass: `[next-task] B1.42: no overlap with any Doing or Review card` (exit 0). `scripts/ci/check-backlog.sh` gives `[check-backlog] OK: README matches the cards`                                                         |

### Reasons (numbered)

1. **`--allowedTools` does not narrow the run; `--tools` does.**
   - The project's `.claude/settings.json` allows `Bash(scripts/pr-step.sh *)`, and `--allowedTools` only adds
     allow rules on top of that. `dev-lead` lists `Bash` and `Agent` among its tools, and its prompt includes
     pushing and opening PRs. Under `dontAsk` with `--allowedTools Read Write`, `scripts/pr-step.sh push` is
     therefore still pre-approved (`guard-bash.sh` lets it through as one plain segment). It would push
     `chore/B1.42-sandbox` to origin, which is an external side effect the brief does not allow.
   - Fix: use `--tools Read,Write` (R1, R2) and `--tools Read,Glob` (R3, R4), in comma form or followed by
     another flag. A variadic `<tools...>` placed directly before the positional prompt swallows the prompt.
     State where the prompt goes (stdin or a final positional).
   - Confidence: plausible. I traced `settings.json`, `pr-step.sh:1-10` and `--help`, but did not run it.
2. **R2 can report b2 as failed when path-guard never ran.**
   - If b1 fails, R1 has already created `spec/spike-probe.md` in the sandbox. R2's prompt is "same", so its Write
     targets a file that already exists and that this session has not read. The Write tool rejects that in input
     validation ("File has not been read yet"), before any PreToolUse hook runs. R2 would then show no
     `path-guard.sh` block, and the stop rule would fire on a false (b) failure.
   - Fix: give each run its own paths (`spec/spike-probe-R2.md`), or delete R1's file in the sandbox before R2. Do
     the same for a retry.
   - Confidence: plausible. The tool-validation order is from my knowledge of the tool, not from a run.
3. **R2's second `--settings` probably drops `tee.json`.** `--settings <file-or-json>` takes a single value, so
   passing it a second time most likely replaces the first. R2 would then write no `hook-input.jsonl`. Fix: R2
   uses one merged file containing the tee hook and the path-guard hook. Confidence: plausible (help text).
4. **The plan redefines (b) instead of naming a deviation from the brief and the card.**
   - The card's (b) is about `path-guard.sh` as it is wired today, which is the `dev-lead` frontmatter. If b1 fails,
     (b) as written has failed, and the brief says "stop and report before anything else". R2 runs a changed
     configuration before that report, and the plan counts it as "(b) proven".
   - That may be the right call, but it costs one extra paid run and changes the meaning of a pass. The stop rule
     must say this outright, e.g. "b1 ✗ = (b) fails as worded; R2 runs only because the lead accepted it in this
     approval". Otherwise R2 must not run until the lead replies after the b1 report.
   - Confidence: confirmed (plan text compared with the card and the brief).
5. **(a) is measured on the wrong hook.**
   - The `grep -c '"agent_type":"dev-lead"'` check reads the tee hook, and that hook comes from the extra
     `--settings` file. (a) asks whether `.claude/settings.json` hooks fire. If the project file were not loaded
     (for example, wrong cwd or workspace trust), the tee hook would still pass.
   - Fix: add a check with an expected count for a project hook in R1, e.g. `grep -c 'plan-scope.sh' R1.jsonl`
     ≥ 1 from `--include-hook-events`, or the `src/` block text naming `plan-scope.sh`. Also:
     - `tee -a` adds no newline between records, so `grep -c` can never exceed 1. Use `jq -s length` if you want
       a count.
     - Without a newline the records run together into one line, which `jq` still reads (it parses concatenated
       JSON values).
   - Confidence: confirmed (plan text).
6. **(c) and (d) have no expected values, and the `--max-turns` fallback is missing.**
   - State the expected result of each check:
     - R3: `subtype:"error_max_turns"` with `num_turns` ≤ 3.
     - R4: `subtype:"error_max_budget_usd"`.
     - (d): the last line of every `R<n>.jsonl` has `type:"result"`, and the exit code is recorded.
   - `--max-turns` is not in `--help`, yet R1 already passes `--max-turns ≤ 15`. State what happens if the flag is
     rejected ("unknown option": stop and report, because the brief's cap cannot be met) or silently ignored (R3
     shows `num_turns` > 2: report, and treat `--max-budget-usd 1` as the only cap R1 and R2 had).
   - Confidence: confirmed (`--help`).
7. **The sandbox's lifecycle is not specified, and the cleanup named in the plan does not remove it.**
   - Creation: `scripts/worktree.sh` refuses to run from inside `.worktrees/`, so it must be run from the app
     checkout `.claude/worktrees/eloquent-bhaskara-cbe81d`. Its default base is a freshly fetched `origin/main`,
     and it also runs `pnpm install` and migrations into a `wt_chore_b1_42_sandbox` schema. Name the command and
     the base; `git log origin/main..HEAD` is empty only with that base.
   - Removal: `worktree-prune.sh` keeps a branch that has no commits beyond its base, and its `--all` option asks
     on `/dev/tty`, which an agent does not have, so the answer is "no". The worktree, its schema and the local
     branch `chore/B1.42-sandbox` would all stay.
   - Side effect: `next-task.sh` (`branches_of` / `state_of`) counts that branch as a B1.42 holder with no PR. That
     keeps B1.42 in Doing, using a WIP slot, even after the spike PR is ready.
   - Fix: name an explicit teardown with an expected result (`git worktree list | grep -c b1-42-sandbox` → 0, branch
     gone, schema dropped).
   - Confidence: confirmed (traced `worktree.sh:20-60`, `worktree-prune.sh:15-35`, `next-task.sh:53-70`).
8. **The nested runs do not look like the B1.44 runner.**
   - The dev-lead session's Bash has `CLAUDECODE=1`, `CLAUDE_CODE_ENTRYPOINT=claude-desktop` and
     `CLAUDE_CODE_SESSION_ID` set (I checked this in the same environment). A child `claude -p` inherits all
     three. The launchd runner B1.44 will run with none of them, so a pass or fail here may not carry over.
   - Fix: launch each run under `env -u CLAUDECODE -u CLAUDE_CODE_ENTRYPOINT -u CLAUDE_CODE_SESSION_ID`, or record
     in `spike.md` that the runs were nested.
   - Separately, the Bash tool's default 120 s timeout can kill a 15-turn run. A killed run still counts toward
     the 6 and leaves no `result` line for (d). Set the timeout or run in the background.
   - Confidence: plausible (I confirmed the environment, not how the child behaves).

Verdict: changes requested
