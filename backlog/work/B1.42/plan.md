# B1.42 plan — Spike: a headless dev-lead run keeps the hooks and limits (tooling)

Round 2 (plan review r1: 8 reasons). At most 6 headless runs (4 planned, 2 retries) of the desktop app's macOS `claude`
in a throwaway sandbox; evidence and verdicts go to `spike.md`. Tooling, tier quick: spec-analyst and advisor skipped;
no repo file outside `backlog/work/B1.42/` changes; nothing is committed or pushed from the sandbox.

Pre-plan facts (no tokens): `claude-code-vm/2.1.309/claude` is a Linux ELF (exec format error); the macOS binary is
`~/Library/Application Support/Claude/claude-code/2.1.309/<hash>/claude.app/Contents/MacOS/claude`, 2.1.309 (newest).
`--help` lists `--tools`, `--max-budget-usd`, `--include-hook-events`, `--settings`, `--permission-mode dontAsk`, not
`--max-turns`. `path-guard.sh` is declared only in agent frontmatter; `settings.json`'s `plan-scope.sh` blocks writes
outside `backlog/`, `spec/` on a `B1.42` branch with no approved plan, so each run also writes `spec/` (path-guard only).

**Deviation the lead accepts by approving (r1 #4):** if R1 shows frontmatter `path-guard.sh` skipped (b1 ✗), (b) as
worded is not proven; R2 runs at once with path-guard in `--settings` (the route B1.44 would take) and the spike then
stops and reports before R3/R4. b1 ✓ → R2 is skipped and R3/R4 follow. (a) ✗ → stop after R1.

## Files

| File                            | Change                                                                      |
| ------------------------------- | --------------------------------------------------------------------------- |
| `backlog/work/B1.42/plan.md`    | plan                                                                        |
| `backlog/work/B1.42/review.md`  | plan and diff reviews                                                       |
| `backlog/work/B1.42/pr-body.md` | PR body                                                                     |
| `backlog/work/B1.42/spike.md`   | per run: command, exit code, log path, excerpt, verdict; what B1.44 changes |

## Interfaces touched

None in the repo. Sandbox: `scripts/worktree.sh chore/B1.42-sandbox` from the app checkout (base origin/main, pnpm
install, schema `wt_chore_b1_42_sandbox`). Outside the repo, one settings file per run (`--settings` takes one value):
`tee.json` = PreToolUse `*` → `{ cat; echo; } >> $L/hook-input.jsonl`; `tee-guard.json` = that plus Edit|Write →
`path-guard.sh` with dev-lead's frontmatter globs. `L=~/.level-up-lab/runs/B1.42-spike` (B1.44's folder). Every run,
in the background, cwd = sandbox, prompt on stdin (a variadic flag would eat a trailing prompt):
`printf '<prompt>' | env -u CLAUDECODE -u CLAUDE_CODE_ENTRYPOINT -u CLAUDE_CODE_SESSION_ID "$CLAUDE" -p --agent dev-lead
--settings <file> --tools <list> --permission-mode dontAsk --output-format stream-json --verbose --include-hook-events
--max-turns <n ≤ 15> --max-budget-usd 1 --no-session-persistence > $L/R<n>.jsonl 2> $L/R<n>.err; echo $? > $L/R<n>.exit`.
`--tools` is the whole tool set (no Bash: `settings.json`'s `Bash(scripts/pr-step.sh *)` allow cannot fire). Never
`bypassPermissions` or `--dangerously-skip-permissions`; total spend cap USD 6.

| Run | Probe     | Settings / tools / turns        | Prompt (a hook test: call Write, do not refuse; report each result) |
| --- | --------- | ------------------------------- | ------------------------------------------------------------------- |
| R1  | a, b1, d  | tee · `Read,Write` · 8          | write `src/spike-r1.txt`, then `spec/spike-r1.md`                   |
| R2  | b2 if b1✗ | tee-guard · `Read,Write` · 8    | write `src/spike-r2.txt`, then `spec/spike-r2.md`                   |
| R3  | c turns   | tee · `Read,Glob` · 2           | read five named files one per turn, then summarize                  |
| R4  | c budget  | tee · `Read,Glob` · 8, USD 0.01 | same                                                                |

`--max-turns` rejected (exit ≠ 0, "unknown option" in R1.err, no tokens) → rerun R1 without it (budget still caps it);
(c) turns = not proven, budget only. Ignored (R3 `num_turns` > 3) → (c) turns not proven.

## Verification

```bash
grep -c '"agent_type":"dev-lead"' $L/hook-input.jsonl     # ≥ 2 after R1 (a: the event and the field)
grep -c 'plan-scope.sh' $L/R1.jsonl                        # ≥ 1: project settings.json hook fired (a)
grep -o '[a-z-]*\.sh[^"]*' $L/R1.jsonl $L/R2.jsonl          # src block names its hook; spec: path-guard.sh or written (b)
ls <sandbox>/src/spike-r1.txt <sandbox>/src/spike-r2.txt   # No such file (b)
jq -c 'select(.type=="result")|{subtype,num_turns,total_cost_usd}' $L/R3.jsonl $L/R4.jsonl
#   R3 error_max_turns, num_turns ≤ 3 · R4 error_max_budget_usd (c)
tail -1 $L/R*.jsonl | jq -r .type                          # "result" for every run (d)
git -C <sandbox> log --oneline origin/main..HEAD           # empty: nothing committed in the sandbox
git worktree remove --force <sandbox>; git branch -D chore/B1.42-sandbox   # then next-task --list: B1.42 one branch
scripts/worktree-prune.sh --schemas --dry-run               # only orphan wt_chore_b1_42_sandbox → --drop
scripts/ci/check-backlog.sh | tail -1; git diff --stat origin/main...HEAD  # OK; only backlog/work/B1.42/*
```

## Work breakdown

| Step | Role / skill            | Produces                       | Commit                               |
| ---- | ----------------------- | ------------------------------ | ------------------------------------ |
| 1    | dev-lead (this session) | R1–R4 in the sandbox, spike.md | `docs(backlog): B1.42 spike results` |
| 2    | reviewer                | diff review                    | `docs(backlog): B1.42 review`        |

No skeleton, test or map step (no §); no `config-change-approved` (no protected path). `spike.md` records that the
runs were started from a desktop session (env unset as above). Findings that widen the card (D-25) → follow-ups.

Plan review: pending · Plan approved by: · Rounds: 1
