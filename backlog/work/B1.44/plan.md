# B1.44 plan — Runner: poll agent-ready issues and run dev-lead headless (tooling)

Round 3 (plan review r1: 10 reasons, r2: 4 reasons, all addressed, "r1 #n"/"r2 #n" below; round 3 not re-reviewed:
2-round cap). Two scripts on the lead's host (D-26, D-27) against
B1.44's Acceptance as amended by B1.47 (#162 merges first; Loop 9 merges it in, r1 #10), each with an offline smoke
(shims for `claude` and `gh`, env seams for eligibility, claim and worktree; bash 3.2; macOS's `/usr/bin/jq`, no new
dependency). Advisor skipped (tier quick). Risk tier **high** (`scripts/ci/`) → lead `approve`; label D-19.

**The lead decides at this gate:**

1. **Split (r1 #5):** the devcontainer (firewall: GitHub, npm, Anthropic; Linux build verified there) → **B1.58**; the
   launchd job calling `run.sh --poll` every 15 min → **B1.59**, which depends on B1.58, so nothing runs unattended
   outside the sandbox. This PR moves those two clauses of B1.44's Acceptance to the new cards, so B1.44 closes Done.
   Until B1.59 the lead starts `run.sh` by hand. Filing lane, own PRs, before this PR is ready.
2. **Protect the gate scripts (r1 #2, r2 #2):** add `scripts/agent/.*`, all of `\.claude/.*` (settings.local.json,
   commands) and `\.mcp\.json` to the protected regex, so they change only with `config-change-approved` and rate
   high (B1.55 lets an agent pass its own plan by `tier.sh`); the run loads `--setting-sources project` only.
3. **Model** `claude-opus-5-5` pinned by default; one run's budget USD 10, 150 turns (set by env per run).

Costs (r2 #3): a hand-started `run.sh` is a headless run on the host (up to 150 turns), limited by `dontAsk`, the
allow list below and the repo's hooks, not by a sandbox; the run may not start `run.sh` itself (`--disallowedTools`)
or add packages (only named `pnpm` scripts are allowed). The leak check sees plugins, MCP servers and extra
SessionStart hooks; a user hook on another event stays invisible, so `--setting-sources project` is what keeps it out
(the live run shows plugins `[]`). Commands outside the allow list are denied and counted (`permission_denials` in the
comment). Until B1.55/B1.56 every run stops at the plan gate: in-flight runs are capped by branch, not by PR (r1 #9);
an unpushed gate branch shows tier `unknown` in feature-map; runs share next-task's WIP 3.

## Files

| File                                | Change                                                                      |
| ----------------------------------- | --------------------------------------------------------------------------- |
| `scripts/ci/lib.sh`                 | `CONFIG_PROTECTED` moves here, the one copy; adds the paths of 2.           |
| `scripts/ci/check-config-change.sh` | uses `$CONFIG_PROTECTED`; no other change                                   |
| `scripts/ci/plan-files.sh`          | `--file <plan.md>`: the Files tokens of a plan file (the same awk)          |
| `scripts/agent/tier.sh`             | new: D-28 tier of a plan                                                    |
| `scripts/agent/tier-smoke.sh`       | new: probes T1–T9                                                           |
| `scripts/agent/run.sh`              | new: `<issue>`, `--poll`, `--check-binary`                                  |
| `scripts/agent/run-smoke.sh`        | new: probes R1–R14                                                          |
| `backlog/plan/E1-todos.md`          | B1.44 Acceptance: devcontainer and launchd clauses → "moved to B1.58/B1.59" |
| `backlog/work/B1.44/plan.md`        | this plan                                                                   |
| `backlog/work/B1.44/review.md`      | plan and diff reviews                                                       |
| `backlog/work/B1.44/pr-body.md`     | PR body                                                                     |

## Interfaces touched

```
scripts/agent/tier.sh <plan.md>   stdout high|medium|low · exit 2 usage, unreadable, no Files token; highest row wins
  literal token: high = under prisma/ · package.json · pnpm-lock.yaml · .env.example · src/lib/env.ts · =~ CONFIG_PROTECTED
                 medium = under src/ e2e/ spec/ scripts/ · low = else
  glob token (r1 #1): high unless its text before the first `*` lies under src/ e2e/ spec/ backlog/ docs/; then the
                 highest of every tracked file plan_lists covers and the token itself (`src/lib/*` → env.ts → high)
scripts/agent/run.sh <issue> | --poll | --check-binary      exit 0 done or skipped · 1 refused ("[run] <why>" on stderr)
  env RUNNER_CLAUDE (default: newest macOS app build under ~/Library/Application Support/Claude/claude-code/)
      RUNNER_MODEL RUNNER_MAX_TURNS RUNNER_BUDGET_USD RUNNER_TURN_USD=0.25 RUNNER_RUNS=~/.level-up-lab/runs
      seams RUNNER_ELIGIBLE RUNNER_CLAIM RUNNER_WORKTREE (default: the repo's scripts)
  --check-binary (r1 #3): in a temp detached worktree, `-p --agent dev-lead --max-turns 2 --tools Write` asked to write
      spec/agent-probe.md → needs a PreToolUse hook_response, exit_code 2, stderr "BLOCKED by .claude/hooks/path-guard.sh"
      and no file → appends `--version` to runs/verified-versions; any run refuses a version not listed
  pre  auth status --json loggedIn true → verified version → eligible.sh → < 3 agent branches in flight (local
       `*/B*.*-agent` worktrees ∪ open PRs on them) → lock `mkdir runs/<n>/lock` + pid, a dead pid's lock is
       removed (r1 #7) → card = form field "Card id" → next-task.sh --claim → worktree.sh <chore|feat>/<card>-agent
  run  env -u CLAUDECODE -u CLAUDE_CODE_ENTRYPOINT -u CLAUDE_CODE_SESSION_ID (r1 #6), cwd worktree:
       $RUNNER_CLAUDE -p --agent dev-lead --model … --max-turns … --max-budget-usd <BUDGET−TURN> --setting-sources
       project --strict-mcp-config --permission-mode dontAsk --include-hook-events --output-format stream-json
       --verbose --tools Read,Grep,Glob,Write,Edit,Bash,Agent,Skill --allowedTools <those + Bash(git *) Bash(scripts/*)
       Bash(.claude/hooks/mark-reviewed.sh) Bash(pnpm install --frozen-lockfile) Bash(pnpm lint*) Bash(pnpm typecheck*)
       Bash(pnpm test*) Bash(pnpm build*) Bash(pnpm exec prettier *) Bash(docker compose up -d) Bash(cp *)
       Bash(gh pr edit *) Bash(gh pr checks *) Bash(gh pr view *)> --disallowedTools 'Bash(scripts/agent/run.sh*)' < prompt
       log runs/<n>/<%Y%m%dT%H%M%SZ>-<pid>.jsonl + .err (line 1 `--version`) + .exit
  kill early: init tools ⊄ --tools ∪ {Grep, Glob} → tools-mismatch · init plugins or mcp_servers not empty, or more
       SessionStart hook_started lines than the worktree's .claude/settings.json defines (r1 #4) → user-settings
  outcome (last line): is_error false → gate ("Plan for <card> is ready") | ready ("PR for <card> is ready") | ended;
       is_error true → limit (subtype error_max_turns|error_max_budget_usd) | error (one retry, new log)
  end  gh issue comment: outcome, card, tier.sh word, branch, session id, log name, permission_denials count, and
       the retry step "`scripts/agent/run.sh <n>`" (no agent text); runs/<n>/stopped (--poll skips it; `run.sh <n>`
       by hand replaces it, r1 #7, r2 #3); lock removed on every exit
```

## Verification

- Red `test(scripts): B1.44 runner and tier probes` (no `(red)` marker, as B1.43): both smokes exit 1, all probes FAIL.
- Green, `bash` and `/bin/bash` 3.2: tier-smoke "9 probes OK" — T1 prisma, T2 dependency/env, T3 protected incl.
  scripts/agent, T4 globs (`.claude/*/x`, `*/ci/x`, `package*`, `.env*`, `scripts/*`, `src/lib/*`, `src/*` high
  (r2 #1); `src/components/*` medium; `docs/*` low), T3 also `.claude/settings.local.json`, `.mcp.json` high, T5 medium dirs, T6 low + highest wins, T7 usage/no table, T8 regex sourced from lib.sh,
  T9 called as feature-map calls it (temp file, other cwd) (r1 #8). run-smoke "14 probes OK" — R1 auth, R2 unverified
  version, R3 ineligible, R4 branch cap, R5 lock + stale lock, R6 exact argv/env/stdin/branch, no bypass flag in
  run.sh, `--disallowedTools` present, R7 log names, R8 tools-mismatch, R9 user-settings, R10 error retry once, R11 limits no retry,
  R12 gate comment with tier, R13 --poll order and skips, R14 --check-binary pass/fail.
- `check-config-change.sh` on a branch touching `scripts/agent/x` → fails without the label, passes with it;
  `pnpm lint && pnpm typecheck && pnpm test` 202 green; check-plan-scope, check-backlog OK.
- Live, after approve (≤ 2 runs, 15 turns, USD 1 each): 1 `--check-binary` (2.1.309); 1 `run.sh <n>` on an
  agent-ready test issue the lead labels → outcome, init check, comment, cost in review.md; branch removed after.

| Step     | Role / skill                                                | Produces                                 | Commit                                                           |
| -------- | ----------------------------------------------------------- | ---------------------------------------- | ---------------------------------------------------------------- |
| 0 file   | dev-lead (filing lane)                                      | B1.58, B1.59 cards, own PRs              | `docs(backlog): card B1.58 …`, `… card B1.59 …`                  |
| 1 red    | dev-lead                                                    | both smokes                              | `test(scripts): B1.44 runner and tier probes`                    |
| 2 green  | dev-lead                                                    | lib, plan-files, tier, run               | `chore(scripts): B1.44 agent runner`                             |
| 3 card   | dev-lead (after #162, B1.58/B1.59 merge into main and here) | B1.44 Acceptance moves 2 clauses (r2 #4) | `docs(backlog): B1.44 acceptance moves devcontainer and launchd` |
| 4 review | reviewer (diff)                                             | `review.md`                              | `docs(backlog): B1.44 review`                                    |

Not in scope: B1.51, B1.55–B1.57, B1.58/B1.59 (filed here), `scripts/CLAUDE.md` rows (orchestrator, r1 #10).

Plan review: changes requested, round 2 (4 reasons carried into round 3, not re-reviewed: 2-round cap) · Plan approved by: lead, 2026-11-02 (decisions 1–3 as proposed, 4: no further split) · Rounds: 1
