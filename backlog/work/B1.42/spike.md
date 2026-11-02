# B1.42 spike — a headless dev-lead run keeps the hooks and limits

Result: (a) proven · (b) proven, by the agent's own frontmatter `path-guard.sh` (the card's premise that frontmatter
hooks are skipped in `-p` does not hold for `--agent` in 2.1.309) · (c) proven, the budget overshoots by one turn ·
(d) proven, but one log was corrupted by two runs writing the same file. 5 of 6 runs used; spend USD 0.53 measured
(+ one R1 run started from the lead's terminal whose result line was overwritten, ≈ 0.15 [unverified]).

## Setup

- Binary: `~/Library/Application Support/Claude/claude-code/2.1.309/<hash>/claude.app/Contents/MacOS/claude`,
  `2.1.309 (Claude Code)`. The brief's `claude-code-vm/2.1.309/claude` is a Linux aarch64 ELF: `exec format error`.
- Sandbox: `scripts/worktree.sh chore/B1.42-sandbox` (base origin/main, no B1.42 plan on it), cwd of every run.
  Removed afterwards: 0 commits on it, clean tree, `git worktree remove --force`, `git branch -D`, schema
  `wt_chore_b1_42_sandbox` dropped by `scripts/worktree-prune.sh --schemas --drop` (it was the only orphan).
- Run settings outside the repo: `tee.json` = PreToolUse matcher `*` → `{ cat; echo; } >> <logs>/hook-input.jsonl`
  and `permissions.allow` `Edit(src/spike-r*.txt)`, `Edit(spec/spike-r*.md)` (so `dontAsk` could not deny a probe
  write; only a hook could). `tee-guard.json` (R2) was not needed.
- Logs: `~/.level-up-lab/runs/B1.42-spike/` (`R<n>.jsonl` stream, `R<n>.err`, `R<n>.exit`, `hook-input.jsonl`).
- Every run (prompt on stdin; the three variables unset because the runs were started from a desktop session):

```bash
printf '%s' "$PROMPT" | env -u CLAUDECODE -u CLAUDE_CODE_ENTRYPOINT -u CLAUDE_CODE_SESSION_ID "$CLAUDE" -p \
  --agent dev-lead --settings tee.json --tools "$TOOLS" --permission-mode dontAsk --output-format stream-json \
  --verbose --include-hook-events --max-turns "$TURNS" --max-budget-usd "$BUDGET" --no-session-persistence \
  > "$L/$R.jsonl" 2> "$L/$R.err"; echo $? > "$L/$R.exit"
```

## Runs

| #   | Run                | Tools / turns / USD  | Exit | Turns | Cost    | Outcome                                                                      |
| --- | ------------------ | -------------------- | ---- | ----- | ------- | ---------------------------------------------------------------------------- |
| 1   | R1                 | Read,Write / 8 / 1   | 1    | 0     | 0       | `api_error`: "Not logged in · Please run /login" (`attempt1-not-logged-in/`) |
| 2   | R1 (lead terminal) | Read,Write / 8 / 1   | ?    | ?     | ≈ 0.15? | both writes blocked (hook-input session `66bbcfde`); stream overwritten      |
| 3   | R1                 | Read,Write / 8 / 1   | 0    | 3     | 0.149   | both writes blocked (session `de71d8d8`)                                     |
| 4   | R3                 | Read,Glob / 2 / 1    | 1    | 3     | 0.340   | `error_max_turns`, "Reached maximum number of turns (2)", 2 Reads            |
| 5   | R4                 | Read,Glob / 8 / 0.01 | 1    | 1     | 0.043   | `error_max_budget_usd`, "Reached maximum budget ($0.01)", 1 Read             |

Run 1: `auth status --json` gave `loggedIn false, authMethod none` from this session and from the lead's terminal
panel; the desktop session's login does not reach a child `claude`. The lead ran `claude auth login` with this binary;
`loggedIn true, authMethod claude.ai` afterwards. Runs 2 and 3 overlapped: both wrote `R1.jsonl` with `>`, so lines 7
and 9 do not parse (`{"type{"type":...`); kept as `R1-interleaved.jsonl`, 33 of its 35 lines parse. R2 skipped
(b1 passed). `init`: model `claude-fable-5-1` (the login's default, `dev-lead` is `model: inherit`), `permissionMode
dontAsk`, tools exactly the `--tools` list in R3/R4.

## Probes

**(a) settings.json hooks fire with `agent_type` — proven.** `hook-input.jsonl` holds 7 PreToolUse inputs, every one
`"agent_type":"dev-lead"` (4 Write from runs 2–3, 2 Read from R3, 1 Read from R4), `permission_mode: dontAsk`.
Project hooks ran from `.claude/settings.json`: `plan-scope.sh` blocked `src/` (below), `guard-read.sh` ran on every
Read (R3: 4 `PreToolUse:Read` hook_started for 2 Reads, each `exit_code 0, outcome success`), two SessionStart
hooks (a user plugin and a silent one, `session-mark.sh` [unverified]) and a Stop hook (R1 line 33) appear as events.

**(b) path-guard.sh blocks an out-of-scope write — proven (frontmatter route, b1).** Each Write started 3 PreToolUse
hooks (tee, `plan-scope.sh`, `dev-lead.md`'s `path-guard.sh`). Tool results (run 3, `result` line):

```
src/spike-r1.txt: BLOCKED by .claude/hooks/plan-scope.sh: backlog/work/B1.42/plan.md is not approved on
  chore/B1.42-sandbox (no 'docs(backlog): B1.42 plan approved' commit): nothing outside backlog/ and spec/ changes …
  (and BLOCKED by .claude/hooks/path-guard.sh: 'src/spike-r1.txt' is outside this role's paths …)
spec/spike-r1.md: BLOCKED by .claude/hooks/path-guard.sh: 'spec/spike-r1.md' is outside this role's paths
  (backlog/* docs/metrics.md docs/mistake-log.md !backlog/00-decisions.md). Report back to the orchestrator …
```

`spec/` is allowed by `plan-scope.sh` and by the run's allow rule, so only the frontmatter hook can have blocked it.
`permission_denials` lists both Writes; `ls` of both files after the run: No such file or directory.

**(c) turn and budget limits stop the run — proven.** `--max-turns` is hidden from `--help` but works: R3 stopped
with `subtype error_max_turns`, `num_turns 3` (the limit + the final turn), `terminal_reason max_turns`, exit 1.
`--max-budget-usd 0.01`: R4 stopped with `error_max_budget_usd`, `terminal_reason budget_exhausted`, exit 1 — after
spending USD 0.043: the budget is checked after a turn, never before one, so a run overshoots by up to one turn.

**(d) the full JSON log is captured — proven.** `--output-format stream-json --verbose --include-hook-events` writes
one JSON event per line (system init, hook_started/hook_response with `exit_code` and `outcome`, assistant, user
tool_result, result with cost, turns, `permission_denials`). R3 (28 lines) and R4 (12 lines) parse whole; the last
line of every run is `"type":"result"`. Runs 2 and 3 show the failure mode of a shared file name.

## What the runner (B1.44) must do differently

1. Use the macOS binary under `claude-code/<version>/…/MacOS/claude` (or a pinned standalone install), never
   `claude-code-vm`; record `--version` in each run's log.
2. Own login: check `claude auth status --json` → `loggedIn true` before a run and stop with a clear message
   otherwise; the desktop app's session never lends its login.
3. One log per run, never shared: `~/.level-up-lab/runs/<issue>/<UTC timestamp>-<pid>.jsonl` (+ `.err`, `.exit`),
   and one runner at a time (a lock), so two runs cannot interleave a stream again.
4. Budget = what one run may spend minus one turn (R3: two turns of this repo's context cost USD 0.34); read the
   outcome from the last line (`subtype`: `success`, `error_max_turns`, `error_max_budget_usd`), not only the exit code
   (1 for both limits).
5. Pin `--model`: `model: inherit` resolved to the login's default here.
6. User-level settings and plugins load in `-p` (a user plugin's SessionStart and UserPromptSubmit hooks ran in every
   run); run under a dedicated config or with `--setting-sources project,local` [unverified].
7. Keep `--tools` + `--permission-mode dontAsk` + narrow allow rules: `--allowedTools` only adds to `settings.json`'s
   allow list (`Bash(scripts/pr-step.sh *)` stays live), `--tools` removes the rest. Prompt on stdin.
8. Frontmatter hooks do fire for `--agent <role>` in 2.1.309 `-p`; still assert it per version (a smoke run like R1)
   before trusting an upgrade, since the card's premise came from an older report.
