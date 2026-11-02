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

## Plan review (round 2)

The plan under review is `f24f3cd docs(backlog): B1.42 plan round 2`, measured against the same contract as round 1
(card ### B1.42 Acceptance (a) to (d) and its stop rule, plus the lead's brief). Re-checked without any API call:

- `--max-turns <turns>` exists in 2.1.309 as a hidden option. The binary's strings hold
  `.addOption(new ss("--max-turns <turns>","Maximum number of agentic turns in non-interactive mode …")…)`, which is
  why `--help` omits it. The "rejected" fallback branch should not occur.
- `--no-session-persistence`, `--include-hook-events`, `--tools <tools...>` and `--settings <file-or-json>` (one
  value) are all listed. `--permission-mode` accepts `dontAsk`.
- The binary sets each hook's `CLAUDE_PROJECT_DIR` to the child's own project (`{…, CLAUDE_PROJECT_DIR: projectDir}`),
  and this session's Bash does not export it. So the sandbox hooks resolve `repo_rel` against the sandbox.
- In the sandbox (branch `chore/B1.42-sandbox`, base origin/main), `plan-scope.sh` matches card B1.42, and
  `plan-files.sh B1.42` exits 3 because there is no approval commit. That blocks `src/` with
  `BLOCKED by .claude/hooks/plan-scope.sh: … is not approved …`. `spec/*` passes plan-scope, and dev-lead's
  frontmatter globs (`backlog/*`, `docs/metrics.md`, `docs/mistake-log.md`) leave `spec/` to path-guard alone, so the
  b1 discriminator holds.
- `guard-bash.sh` lets the run line through: the `| env -u …` segment matches neither the environment-dump rule nor
  the secret-variable rule. It also passes the teardown: `git worktree remove --force` and `git branch -D` match
  neither the push rule nor the rm rule.

### Round 1 reasons

| #   | Round 1 reason                         | Round 2                                                                                                                                                                    |
| --- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `--allowedTools` does not narrow       | resolved: `--tools Read,Write` / `Read,Glob` in comma form, prompt on stdin; no Bash or Agent, so `Bash(scripts/pr-step.sh *)` cannot fire                                 |
| 2   | R2 rewrites R1's file                  | resolved: each run has its own paths (`spike-r1`, `spike-r2`)                                                                                                              |
| 3   | second `--settings` drops tee          | resolved: one merged `tee-guard.json` for R2                                                                                                                               |
| 4   | (b) redefined instead of a deviation   | resolved: the "Deviation the lead accepts by approving" paragraph says b1 ✗ means (b) as worded is not proven, R2 is the extra run, and the spike stops before R3/R4       |
| 5   | (a) measured on the extra hook         | resolved: `grep -c 'plan-scope.sh' R1.jsonl ≥ 1` checks the project hook, and `{ cat; echo; }` puts one record on each line                                                |
| 6   | (c)/(d) expected values; `--max-turns` | resolved: R3 expects `error_max_turns` with `num_turns ≤ 3`, R4 `error_max_budget_usd`, (d) a last `result` line. The fallback is moot (hidden option)                     |
| 7   | sandbox lifecycle                      | resolved: `scripts/worktree.sh` from the app checkout on origin/main; removed with `worktree remove --force`, `branch -D` and a schema prune; next-task expectation stated |
| 8   | nested env, 120 s timeout              | resolved: `env -u` clears the three variables, runs go to the background, and `spike.md` records the desktop origin                                                        |

### Checklist

| Check                                                                             | Result                                                                                                                                                           |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: tooling, so there is no § and no map row. All four files are under `backlog/work/B1.42/`, and the sandbox and logs are outside the repo                    |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass (n/a): no TypeScript, action or Prisma                                                                                                                      |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: there is no `advice.md` (quick tier, stated). The deviation from the brief's stop rule is stated for the lead                                              |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | fail: the (b) verdict cannot tell a hook block from a `dontAsk` denial (reason 1)                                                                                |
| verification lists exact commands with expected numbers                           | fail: the (d) command errors instead of printing `result` (reason 3), and the `ls` (b) check passes without any hook (reason 1)                                  |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: no § means no skeleton, red, green or map (stated). Both subjects are `docs(backlog): …`                                                                   |
| `Lead approves spec` box ticked only by a human                                   | pass (n/a): there is no section. `Plan approved by:` is empty                                                                                                    |
| no settled D-n contradicted                                                       | pass: D-25 (follow-ups), D-26 (the lead's machine and login) and D-27 to D-29 (PR #150) are respected. No `bypassPermissions`, no push, nothing on Actions       |
| `scripts/next-task.sh --check B1.42` says no overlap                              | pass: `[next-task] B1.42: no overlap with any Doing or Review card` (exit 0). `scripts/ci/check-backlog.sh` gives `[check-backlog] OK: README matches the cards` |

Not blocking: the plan is 75 lines against the ≈ 40 in `planning.md`. Recent plans on main run 59 to 69 lines, so
this follows practice.

### Reasons (numbered)

1. **Under `--permission-mode dontAsk`, a write that no hook stops is still not written, so (b) has no clean
   negative.**
   - WHERE: plan.md "Interfaces touched" (the run line) and "Verification" (the `grep -o … (b)` line and the
     `ls … No such file (b)` line).
   - DEFECT: `dontAsk` denies any tool use that no allow rule covers. The project `settings.json` allows only
     `Bash(scripts/pr-step.sh *)`, and neither `tee.json` nor `tee-guard.json` adds an allow rule for Write.
   - TRIGGER: R1 where the frontmatter `path-guard.sh` is skipped, which is the outcome the card expects.
   - WRONG BEHAVIOUR:
     - `spec/spike-r1.md` comes back "permission denied", not "written". The plan names only two outcomes,
       "path-guard.sh or written", so the dev-lead has to guess at the branch that decides whether R2, a paid run,
       is spent.
     - `ls <sandbox>/src/spike-r*.txt → No such file` passes even if no hook ran.
     - If the user-level settings already allow Write, the result also depends on whose machine runs it, which
       B1.44 will not reproduce.
   - FIX, either of these:
     - Add `"permissions":{"allow":["Edit(src/spike-r*.txt)","Edit(spec/spike-r*.md)"]}` (Write obeys Edit rules)
       to `tee.json` and `tee-guard.json`. A hook is then the only thing that can stop the write: written means no
       hook blocked it, absent means a hook did.
     - State that b1 ✓ only if the `spec/` tool_result contains `BLOCKED by .claude/hooks/path-guard.sh`, that any
       other refusal is b1 ✗, and drop the `ls` line from (b).
   - CONFIDENCE: confirmed for the confound (`settings.json` permissions plus the `dontAsk` contract). Plausible for
     how it shows in R1 (not run).
2. **`$L` in the hook command is empty unless it is exported or expanded into the JSON.**
   - WHERE: plan.md "`tee.json` = PreToolUse `*` → `{ cat; echo; } >> $L/hook-input.jsonl`".
   - DEFECT: the hook shell inherits the child's environment, but `L=~/…` is a plain assignment that is not
     exported, and Bash-tool calls do not keep shell variables from one call to the next.
   - TRIGGER: `tee.json` is written with a literal `$L` and the run line does not export `L`.
   - WRONG BEHAVIOUR: the hook appends to `/hook-input.jsonl`, which fails without blocking. Then
     `grep -c '"agent_type":"dev-lead"'` returns 0, which reads as (a) ✗, and the card stops after R1 on a false
     failure.
   - FIX: write the absolute path of `hook-input.jsonl` under `~/.level-up-lab/runs/B1.42-spike/` into both JSON
     files, already expanded.
   - CONFIDENCE: plausible (it depends on how the file is written, which the plan does not say).
3. **The (d) command fails on more than one file.**
   - WHERE: plan.md Verification, `tail -1 $L/R*.jsonl | jq -r .type`.
   - DEFECT: with two or more files, `tail` prints `==> file <==` headers.
   - TRIGGER: any spike that has at least R1 and R3.
   - WRONG BEHAVIOUR: `jq: parse error: Invalid numeric literal at line 1, column 4`, and no type is printed. I
     reproduced this in the scratchpad with two files.
   - FIX: `for f in $L/R*.jsonl; do printf '%s ' "$f"; tail -n1 "$f" | jq -r .type; done` → `result` for each run.
   - CONFIDENCE: confirmed.

Verdict: changes requested

Riskiest unfalsified: hook order under `dontAsk`. If the permission denial is decided before PreToolUse hooks run,
neither `plan-scope.sh` nor `path-guard.sh` fires on Write, and R1 reports a false (a) ✗. The allow-rule fix in
reason 1 also removes this risk. The next round is the third; if it still requests changes, it goes to "Waiting on
human".
