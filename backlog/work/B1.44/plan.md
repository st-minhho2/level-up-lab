# B1.44 plan — Runner: poll agent-ready issues and run dev-lead headless (tooling)

Approach: two scripts on the lead's host (D-26, D-27) against B1.44's Acceptance as amended by B1.47 (#162), each with
an offline smoke (shims for `claude` and `gh`, env seams for eligibility, claim and worktree; bash 3.2; macOS's
system `/usr/bin/jq`, no new dependency). Tier quick, advisor skipped. Risk tier **high** (D-28: `scripts/ci/`) → the
lead's `approve`; the PR carries `config-change-approved` (D-19).

**Split, the lead decides at this gate:** the devcontainer whose firewall allows only GitHub, npm and Anthropic, with
the Linux build verified there → **B1.58**; the launchd job calling `run.sh --poll` every 15 min → **B1.59** (filing
lane, own PRs, before this PR is ready). So this card never runs outside the host and never bypasses permissions.
dev-lead's own low/medium pass is B1.55 and the resume on an issue `approve` is B1.56: until then every gate stops.

## Files

| File                                | Change                                                             |
| ----------------------------------- | ------------------------------------------------------------------ |
| `scripts/ci/lib.sh`                 | `CONFIG_PROTECTED` regex moves here, the one copy                  |
| `scripts/ci/check-config-change.sh` | uses `$CONFIG_PROTECTED`; no other change                          |
| `scripts/ci/plan-files.sh`          | `--file <plan.md>`: the Files tokens of a plan file (the same awk) |
| `scripts/agent/tier.sh`             | new: D-28 tier of a plan                                           |
| `scripts/agent/tier-smoke.sh`       | new: probes T1–T8                                                  |
| `scripts/agent/run.sh`              | new: one issue, or `--poll`                                        |
| `scripts/agent/run-smoke.sh`        | new: probes R1–R12                                                 |
| `backlog/work/B1.44/plan.md`        | this plan                                                          |
| `backlog/work/B1.44/review.md`      | plan and diff reviews                                              |
| `backlog/work/B1.44/pr-body.md`     | PR body                                                            |

## Interfaces touched

```
scripts/agent/tier.sh <plan.md>   stdout high|medium|low, exit 0 · exit 2 usage, unreadable, no Files token
  per token (plan-files.sh --file), highest wins: high = under prisma/ · package.json · pnpm-lock.yaml · .env.example ·
  src/lib/env.ts · =~ CONFIG_PROTECTED (the token with `*` read as `x`, and every tracked file plan_lists covers, so
  `scripts/*` is high) · medium = under src/ e2e/ spec/ scripts/ · low = anything else
scripts/agent/run.sh <issue> | --poll        exit 0 ran, stopped at a known end, or skipped · 1 refused (stderr "[run] …")
  env  RUNNER_CLAUDE (default: newest macOS app build under ~/Library/Application Support/Claude/claude-code/)
       RUNNER_MODEL=claude-opus-5-5 RUNNER_MAX_TURNS=150 RUNNER_BUDGET_USD=10 RUNNER_TURN_USD=0.25
       RUNNER_RUNS=~/.level-up-lab/runs   seams: RUNNER_ELIGIBLE RUNNER_CLAIM RUNNER_WORKTREE (default: the repo scripts)
  pre  `auth status --json` loggedIn true (else exit 1) → eligible.sh → < 3 open PRs on `*/B*.*-agent` → lock
       `mkdir runs/<n>/lock` → card = the issue form's "Card id" → next-task.sh --claim → worktree.sh
       <chore if the card is `_tooling`, else feat>/<card>-agent
  run  (cwd worktree) $RUNNER_CLAUDE -p --agent dev-lead --model … --max-turns … --max-budget-usd <BUDGET−TURN>
       --setting-sources project,local --strict-mcp-config --permission-mode dontAsk --include-hook-events
       --tools Read,Grep,Glob,Write,Edit,Bash,Agent,Skill --allowedTools <those + Bash(git *) Bash(pnpm *)
       Bash(scripts/*) Bash(.claude/hooks/mark-reviewed.sh) Bash(gh pr edit *) Bash(gh pr checks *)>
       --output-format stream-json --verbose < prompt (issue, card, worktree; "headless: stop at the gate")
       log runs/<n>/<%Y%m%dT%H%M%SZ>-<pid>.jsonl + .err (line 1 `--version`) + .exit
  stop early (kill): init `tools` ⊄ --tools ∪ {Grep, Glob} → tools-mismatch · init `plugins` or `mcp_servers` not
       empty, or a hook_event the worktree's .claude/settings.json does not define → user-settings
  outcome (last line) is_error false: result has "Plan for <card> is ready" → gate · "PR for <card> is ready" → ready ·
       else ended; is_error true: subtype error_max_turns|error_max_budget_usd → limit, else error (one retry)
  end  gh issue comment <n>: outcome, card, tier.sh word (gate), branch, session id, log name (no agent text);
       touch runs/<n>/stopped (--poll skips it); lock removed on every exit
```

## Verification

- Red `test(scripts): B1.44 runner and tier probes` (no `(red)` marker, as B1.43): both smokes exit 1, all probes FAIL.
- Green, `bash` and `/bin/bash` 3.2: tier-smoke "8 probes OK" (T1 prisma, T2 dependency/env files, T3 protected paths,
  T4 globs, T5 medium dirs, T6 low + highest wins, T7 usage/no table, T8 regex read from lib.sh, not copied);
  run-smoke "12 probes OK" (R1 auth, R2 ineligible, R3 PR cap, R4 lock, R5 exact argv + stdin + branch + no bypass
  flag in run.sh, R6 log names, R7 tools-mismatch, R8 user-settings, R9 error retry once, R10 limits no retry,
  R11 gate comment with tier, R12 --poll order and skips).
- `check-config-change.sh` same verdicts on a protected and an unprotected change; feature-map-smoke OK with the real
  tier.sh; `pnpm lint && pnpm typecheck && pnpm test` 202 green; check-plan-scope, check-backlog OK.
- Live, only after approve: ≤ 2 runs, `RUNNER_MAX_TURNS=15 RUNNER_BUDGET_USD=1`, on an `agent-ready` test issue the
  lead labels (a low-tier card) → log, init check, outcome, issue comment; cost in review.md; branch cleaned after.

## Work breakdown

| Step     | Role / skill    | Produces                   | Commit                                        |
| -------- | --------------- | -------------------------- | --------------------------------------------- |
| 1 red    | dev-lead        | both smokes                | `test(scripts): B1.44 runner and tier probes` |
| 2 green  | dev-lead        | lib, plan-files, tier, run | `chore(scripts): B1.44 agent runner`          |
| 3 review | reviewer (diff) | `review.md`                | `docs(backlog): B1.44 review`                 |

Not in scope: B1.58 (devcontainer), B1.59 (launchd), B1.55–B1.57, the tier line in PR Evidence (B1.51), guides.

Plan review: pending · Plan approved by: · Rounds: 1
