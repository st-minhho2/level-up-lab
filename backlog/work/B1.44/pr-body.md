## Item

B1.44 — Runner: poll agent-ready issues and run dev-lead headless (tooling, no spec section)

- spec: none — tooling (D-19, D-26, D-27, D-28, D-29); no `src/` change, no section
- test: `scripts/agent/tier-smoke.sh` T1–T9 and `scripts/agent/run-smoke.sh` R1–R14, offline with shims — red before
  (`b1b20db`: 9/9 and 14/14 FAIL), green after; each later fix landed its probe red first
- acceptance: B1.44's Acceptance as amended by B1.47 (#162), minus the devcontainer, its firewall and the Linux-build
  check (B1.58) and the launchd poll (B1.59), moved by the lead's decision 1 (`102cabb`, #165)
- risk tier: high (`scripts/agent/tier.sh backlog/work/B1.44/plan.md` → `high`; `scripts/ci/`); label
  `config-change-approved` (D-19)

## Plan

Approved by the lead 2026-11-02 (round 1), re-approved in round 2 after diff reviews 1–2 and the live runs.

### B1.44 plan — Runner: poll agent-ready issues and run dev-lead headless (tooling)

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

**Lead round 2 (after diff reviews 1–2 and live runs 1–4):** the changes below the line "Changed after approval"
need the lead's `approve` again (planning.md); the Files table is unchanged.

Costs (r2 #3, restated by diff review pass 2): a hand-started `run.sh` is a headless run **on the host, with no
sandbox**: `dontAsk`, the allow list and the repo's hooks narrow what it does by accident, not what it can do. A run
can still execute any command: through `Bash(git *)` (`git rebase -x`, `git difftool --extcmd`), through a test it
writes and runs with `pnpm test`, or through a script under `scripts/ci/` it writes. So it can add a package or start
another run, guards and `RUNNER_CHILD` notwithstanding; such a change still shows in its diff (a dependency or
`scripts/` change rates high and needs the label). The sandbox is B1.58; until then the lead starts runs by hand and
reads each one's diff. The leak check sees plugins, MCP servers and extra
SessionStart hooks; a user hook on another event stays invisible, so `--setting-sources project` is what keeps it out
(the live run shows plugins `[]`). Commands outside the allow list are denied and counted (`permission_denials` in the
comment). Until B1.55/B1.56 every run stops at the plan gate: in-flight runs are capped by branch, not by PR (r1 #9);
an unpushed gate branch shows tier `unknown` in feature-map; runs share next-task's WIP 3.

**Changed after approval** (diff reviews 1–2, live runs 1–4; each landed red probe first):

- allow list: named scripts instead of `scripts/*`, no `cp *`; deny `git -c`, `git * -c *`, `git config`; the run's
  env carries `RUNNER_CHILD=1` and `run.sh` refuses inside a run (review 1 #1, a speed bump, not a boundary: above)
- init check: `Task` counts as `Agent` (2.1.309's init name, live run 4b); `--tools …,Skill` gives no `Skill`, so the
  prompt names `.claude/agents/dev-lead.md` and `.claude/skills/work-next/SKILL.md`; plugins with path `builtin` do
  not count as user settings (live run 1); `--check-binary` judges `Write` + Grep, Glob only (review 1 #3)
- `--check-binary`'s prompt asks dev-lead for the Write call (live run 2); it refuses on any init problem
- worktree.sh runs from the checkout that holds `.worktrees/` and its message is shown (live run 4a); TERM/INT stop
  the claude run, in `<issue>` and in `--poll` (review 1 #2, review 2 #3)

#### Files

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

#### Interfaces touched

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
       --verbose --tools Read,Grep,Glob,Write,Edit,Bash,Agent,Skill --allowedTools <those + Bash(git *)
       Bash(scripts/next-task.sh *) Bash(scripts/worktree.sh *) Bash(scripts/verify-red.sh *) Bash(scripts/card-status.sh *)
       Bash(scripts/ci/*) Bash(scripts/agent/tier.sh *) Bash(scripts/agent/eligible.sh *) Bash(.claude/hooks/mark-reviewed.sh)
       Bash(pnpm install --frozen-lockfile) Bash(pnpm lint*) Bash(pnpm typecheck*) Bash(pnpm test*) Bash(pnpm build*)
       Bash(pnpm exec prettier *) Bash(docker compose up -d) Bash(gh pr edit *) Bash(gh pr checks *) Bash(gh pr view *)>
       --disallowedTools 'Bash(scripts/agent/run.sh*)' 'Bash(git -c*)' 'Bash(git * -c *)' 'Bash(git config*)' < prompt
       env RUNNER_CHILD=1 (run.sh exits 1 when it is set)
       log runs/<n>/<%Y%m%dT%H%M%SZ>-<pid>.jsonl + .err (line 1 `--version`) + .exit
  kill early: init tools (Task read as Agent) ⊄ --tools ∪ {Grep, Glob} → tools-mismatch · init plugins whose path is not
       `builtin`, or mcp_servers, not empty, or more
       SessionStart hook_started lines than the worktree's .claude/settings.json defines (r1 #4) → user-settings
  outcome (last line): is_error false → gate ("Plan for <card> is ready") | ready ("PR for <card> is ready") | ended;
       is_error true → limit (subtype error_max_turns|error_max_budget_usd) | error (one retry, new log)
  end  gh issue comment: outcome, card, tier.sh word, branch, session id, log name, permission_denials count, and
       the retry step "`scripts/agent/run.sh <n>`" (no agent text); runs/<n>/stopped (--poll skips it; `run.sh <n>`
       by hand replaces it, r1 #7, r2 #3); lock removed on every exit
```

#### Verification

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

Plan review: changes requested, round 2 (4 reasons carried into round 3, not re-reviewed: 2-round cap) · Plan approved by: lead, 2026-11-02 (decisions 1–3 as proposed, 4: no further split); round 2: lead, 2026-11-02 (restated cost and the changes after approval) · Rounds: 2

## Map delta

None (tooling; no feature row).

## Review

`/review-loop`: 3 of 3 passes; pass 3 **ready for PR**. Full text: `backlog/work/B1.44/review.md`.

| Pass | Findings                                                                                                                                           | Disposition                                                                                                                                                   |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | 3: allow list escapes (`cp` + `scripts/*`, `git -c` alias, `scripts/../`); 4 surviving mutants; `--check-binary` judged the 8-tool set             | fix now: red `896c8c1` → `0a9b54d`, hardening `7f28d96` (named scripts, deny `git -c`/`git config`, `RUNNER_CHILD`, `EXPECT`; every mutant now fails a probe) |
| 2    | 3: cost misstated (a run can still execute any command); 4 interfaces changed after approval; TERM in `--poll` left the claude run going           | text: plan restated, lead round 2 `9e9869e`; fix now: red `c575661` → `b801c11`                                                                               |
| 3    | 1, not blocking: effects outside the worktree (a push of a new branch, a write to `~/.level-up-lab/runs/verified-versions`) never show in the diff | stated here (below); keeping a run away from them is B1.58's sandbox, no new card (D-25)                                                                      |

Live runs (2.1.309 macOS app build, the lead's own login; logs in `~/.level-up-lab/runs/` on the lead's machine):

| #   | Run              | Turns | USD   | Outcome                                                                                                        |
| --- | ---------------- | ----- | ----- | -------------------------------------------------------------------------------------------------------------- |
| 1   | `--check-binary` | 0     | 0     | killed at init: `cc-plugin-*@builtin` counted as user settings → builtin plugins pass (`bf8e612` → `a1bc002`)  |
| 2   | `--check-binary` | 1     | 0.073 | dev-lead declined the spec/ write before any tool call → the prompt asks for the call (`b25c8ac` → `88d8552`)  |
| 3   | `--check-binary` | 2     | 0.080 | **verified**: path-guard blocked `spec/agent-probe.md` (exit 2), no file                                       |
| 4a  | `run.sh 166`     | 0     | 0     | worktree.sh refused under `.worktrees/`, message hidden, trap unbound (`896c8c1` → `0a9b54d`)                  |
| 4b  | `run.sh 166`     | 0     | 0     | killed at init: 2.1.309 names Agent `Task`, lists no Skill (`25b824e` → `f351eeb`)                             |
| 4c  | `run.sh 166`     | 9     | 0.496 | **gate** on card B1.41: reviewer-approved plan, tier high, 0 permission denials, comment on #166, lock removed |

Residual risk the lead approved (round 2): the run is on the host with no sandbox; `dontAsk`, the allow list and the
hooks narrow accidents, not intent. A run can execute any command (`git rebase -x`, a test it writes, a script under
`scripts/ci/`). Effects inside the worktree show in the PR diff; effects outside it do not: a push of another branch,
or a line appended to `~/.level-up-lab/runs/verified-versions` that would mark an unproven claude version as verified.
B1.58 (devcontainer, firewall) is the boundary; until B1.59 the lead starts each run by hand.

Corrections: commits `e0da50e`, `a1bc002`, `0a9b54d` and `b801c11` say "bash 5 and 3.2"; this host has only
`/bin/bash` 3.2, so every smoke ran under 3.2 only and bash 5 is [unverified]. "plugins `[]`" in the plan means no
plugin other than the binary's `@builtin` ones.

Follow-ups for the closing PR (D-25): the card title still says "in a sandbox" (B1.58 holds the sandbox);
`Bash(git * -c *)` also denies a commit message containing `-c`; B1.59's wrapper stops the job with TERM and never
starts `run.sh` with `&` from a script (SIGINT would arrive ignored); whether TERM also ends the process trees a
run's tools start (`pnpm test`, `pnpm build`) is [unverified]; CI does not run the runner and tier smokes;
`scripts/CLAUDE.md` rows for `tier.sh` and `run.sh` (orchestrator).

## Evidence

- AC met: 16/16 of B1.44's clauses in this card (tier, worktree, limits and retry, logs, gate comment, cap, label; the eight B1.47 findings with the Linux build moved to B1.58; devcontainer and launchd moved to B1.58/B1.59)
- tier: high
- plan deviations: none
- trace: n/a

## Checklist

- [x] **Diff matches the approved plan**: no file outside the Files table, no interface outside the list (round 2 lists the changes after approval).
- [x] Red commit precedes the change commit; no `feat(` commit touches `*.test.*` or `e2e/**`.
- [x] Every `AC-§.n` of the section is a test title; mutation on `src/lib` + `src/actions` ≥ 70 % (n/a: no section; mutation 93.40 unchanged).
- [x] No new `eslint-disable` / `@ts-ignore` / `@ts-expect-error`; protected config change carries `config-change-approved`.
- [x] Migrations reviewed as SQL; `prisma/seed.ts` updated if a table changed (n/a).
- [ ] `spec/features-map.md` row moved (n/a); `docs/metrics.md` per-card row filled at closing.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
