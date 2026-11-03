# B1.66 plan — A plan for how long the runner keeps its run logs (no §)

Approach: tier 0, no advice (dev-lead Loop 2); this plan is the deliverable, no script changes.

## Files

| File                           | Change | Why (card acceptance)                                      |
| ------------------------------ | ------ | ---------------------------------------------------------- |
| `backlog/work/B1.66/plan.md`   | add    | inventory of `runs/` today, retention rule, follow-up card |
| `backlog/work/B1.66/review.md` | add    | the reviewer's plan review (D-27 approval stands on it)    |

## What `runs/` holds today (`scripts/agent/run.sh`)

- Root `$RUNNER_RUNS` (default `~/.level-up-lab/runs`, line 23); in the container the `runner-runs` volume
  (`.devcontainer/runner/docker-compose.yml:78`), which also holds git's global config (B1.69).
- `runs/<issue>/<UTC>-<pid>.jsonl` (stream), `.err` (line 1 `--version`), `.exit` (lines 16, 127–142), one triple per
  attempt (a retry adds one); `runs/<issue>/stopped` (line 249, last outcome); `runs/<issue>/lock/pid` (line 181).
- `runs/check-binary/<UTC>-<pid>.*` (line 261) and `runs/verified-versions` (append-only, line 279); the probe
  worktree under `.worktrees/check-binary-*` is removed by run.sh itself (lines 207–209, 276).
- Nothing deletes a log: `grep -nE 'prune|retention|-mtime' scripts/agent/run.sh` hits only the probe worktree.

## Retention rule (proposed)

1. **Evidence kept, no age limit:** a log a card's `work/<card>/` cites (e.g. `live.md`, `review.md`), the newest
   triple per issue, `stopped`, `verified-versions`. The issue comment names the log file (line 200), so a cited log is
   found by name.
2. **Everything else:** removed 30 days after the issue closes, or 30 days after its newest run while open; never
   while `lock/` is held by a live pid.
3. `runs/check-binary/`: the newest triple per version in `verified-versions`; older removed after 30 days.
4. **Who:** a `scripts/agent/run.sh --prune [--dry-run]` mode the lead runs by hand (no cron; the runner never
   deletes on its own turn), printing every path it removes; a cited log is listed in `runs/<issue>/keep`.
5. Built by a new card, **B1.75 · run.sh prunes run logs past retention** (tier quick, `config-change-approved`,
   D-19), filed by the closing lane of this card; probes in `run-smoke.sh` (old log removed, kept log and live lock
   survive, `--dry-run` deletes nothing).

## Interfaces touched

```ts
// none — no script, src/, prisma/ or e2e/ change
```

## Verification

`scripts/agent/tier.sh backlog/work/B1.66/plan.md` → `low` · `scripts/ci/plan-files.sh --run B1.66` exit 0 ·
`git diff --stat origin/main..HEAD` lists only `backlog/work/B1.66/*` · no pnpm gate (nothing under src/)

## Work breakdown

| Step | Role / skill    | Produces              | Commit                               |
| ---- | --------------- | --------------------- | ------------------------------------ |
| 1    | dev-lead        | this plan             | `docs(backlog): B1.66 plan`          |
| 2    | reviewer (plan) | `review.md`           | `docs(backlog): B1.66 plan review`   |
| 3    | dev-lead (D-27) | approval line         | `docs(backlog): B1.66 plan approved` |
| 4    | dev-lead        | draft PR, metrics row | —                                    |

Plan review: pending (round 2: follow-up id B1.73 taken on main, now B1.75) · Plan approved by: · Rounds: 1
