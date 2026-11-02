# B1.42 plan — Spike: a headless dev-lead run keeps the hooks and limits (tooling)

Approach: at most 6 headless runs (4 planned, 2 retries) of the desktop app's macOS `claude` in a throwaway worktree on
`chore/B1.42-sandbox` (cwd = that worktree, so its `.claude/settings.json` loads); evidence and verdicts go to
`spike.md`. Tooling, tier quick: spec-analyst and advisor skipped; no repo file outside `backlog/work/B1.42/` changes.

Pre-plan facts (read-only, no tokens): `claude-code-vm/2.1.309/claude` is a Linux ELF (exec format error); the macOS
binary is `~/Library/Application Support/Claude/claude-code/2.1.309/<hash>/claude.app/Contents/MacOS/claude`, 2.1.309
(newest). `--help` lists `--max-budget-usd`, `--include-hook-events`, `--settings`, `--permission-mode dontAsk`; it
does not list `--max-turns` (R3 shows whether it is still accepted). `path-guard.sh` is declared only in agent
frontmatter; `settings.json`'s `plan-scope.sh` blocks every write outside `backlog/`, `spec/` on a `B1.42` branch
without an approved plan — so a `src/` block alone does not prove path-guard; R1 also writes `spec/` (path-guard only).

## Files

| File                            | Change                                                                      |
| ------------------------------- | --------------------------------------------------------------------------- |
| `backlog/work/B1.42/plan.md`    | plan                                                                        |
| `backlog/work/B1.42/review.md`  | plan and diff reviews                                                       |
| `backlog/work/B1.42/pr-body.md` | PR body                                                                     |
| `backlog/work/B1.42/spike.md`   | per run: command, exit code, log path, excerpt, verdict; what B1.44 changes |

## Interfaces touched

None in the repo. Outside it: `<scratchpad>/tee.json` (extra `--settings`: PreToolUse matcher `*`, command
`tee -a <log>/hook-input.jsonl >/dev/null`), logs in `~/.level-up-lab/runs/B1.42-spike/` (the runner's B1.44 folder).
Every run: `claude -p --agent dev-lead --settings tee.json --output-format stream-json --verbose --include-hook-events
--permission-mode dontAsk --allowedTools <narrow> --max-turns ≤ 15 --max-budget-usd 1 --no-session-persistence > R<n>.jsonl`.
Never `bypassPermissions` or `--dangerously-skip-permissions`; total cap ≈ USD 6.

| Run | Probe        | Extra                                                       | Prompt (a hook test: call Write, do not refuse)    |
| --- | ------------ | ----------------------------------------------------------- | -------------------------------------------------- |
| R1  | a, b1, d     | `--allowedTools Read Write`                                 | write `src/spike-probe.txt`, `spec/spike-probe.md` |
| R2  | b2 (if b1 ✗) | + `--settings` path-guard with dev-lead's frontmatter globs | same                                               |
| R3  | c turns      | `--max-turns 2`, `--allowedTools Read Glob`                 | a 5-step read task                                 |
| R4  | c budget     | `--max-budget-usd 0.01`, `--allowedTools Read Glob`         | same                                               |

Stop rule: (a) fails, or b1 and b2 both fail → stop and report, no R3/R4. (b) is proven when `path-guard.sh` blocks by
either route (frontmatter b1, or settings b2 = a B1.44 requirement); the `src/` block's message names its hook.

## Verification

```bash
grep -c '"agent_type":"dev-lead"' ~/.level-up-lab/runs/B1.42-spike/hook-input.jsonl   # ≥ 1 (a)
grep -o 'path-guard.sh[^"]*' R1.jsonl R2.jsonl; ls <sandbox>/src/spike-probe.txt        # block text; no such file (b)
jq -c 'select(.type=="result") | {subtype,num_turns,total_cost_usd}' R3.jsonl R4.jsonl  # max turns / budget (c)
wc -l R*.jsonl                                                                           # every run logged (d)
scripts/ci/check-backlog.sh | tail -1; git diff --stat origin/main...HEAD               # OK; only backlog/work/B1.42/*
git -C <sandbox> log origin/main..HEAD                                                  # empty; then worktree-prune.sh
```

## Work breakdown

| Step | Role / skill            | Produces                       | Commit                               |
| ---- | ----------------------- | ------------------------------ | ------------------------------------ |
| 1    | dev-lead (this session) | R1–R4 in the sandbox, spike.md | `docs(backlog): B1.42 spike results` |
| 2    | reviewer                | diff review                    | `docs(backlog): B1.42 review`        |

No skeleton, test or map step (no §); no `config-change-approved` (no protected path). Findings that widen the card
(D-25) → follow-up cards in the closing PR.

Plan review: pending · Plan approved by: · Rounds: 1
