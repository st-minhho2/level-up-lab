# B1.20 review

## Plan review (round 1)

Plan at `2d4bd5f docs(backlog): B1.20 plan`. Contract: card Acceptance (`backlog/plan/E1-todos.md` ### B1.20); tooling,
no §.

| Check                                                                             | Result                                                                                                                                                                                                                                                                                                         |
| --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: no § and no map row (tooling); the four non-paperwork files are the two compare sites the card names, their probe file and the `hooks.md` row the card cites. None is owned by B1.28 (`src/lib/CLAUDE.md`, `src/components/CLAUDE.md`) or B1.29 (`scripts/verify-red.sh`, `scripts/verify-red-smoke.sh`) |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass (n/a): no TypeScript; hook stdin/exit codes and the guard's output/exit codes unchanged, `plan-files.sh` untouched                                                                                                                                                                                        |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: no `advice.md`; the plan states "spec-analyst and advisor skipped" and follows the card's named approach (#63's literal-then-glob, `scripts/next-task.sh:134`; `scripts/metrics/plan-deviations.sh:35` already uses the same form)                                                                       |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: 3 Acceptance clauses, each an exit code or a probe count                                                                                                                                                                                                                                                 |
| verification lists exact commands with expected numbers                           | pass: 8 FAIL at the test commit, 440 OK at the fix. Baseline confirmed: `scripts/hook-smoke.sh` at `2d4bd5f` → "hook-smoke: 416 probes OK"                                                                                                                                                                     |
| work breakdown has skeleton → red → green → map → review with convention subjects | fail: see 1–3. Subjects pass `lefthook.yml` commit-msg. Skeleton and map steps are missing without a stated reason, the role for steps 1–2 cannot write those files as a subagent, and the PR title is not named                                                                                               |
| the section has a `Lead approves spec` box, ticked only by a human                | pass (n/a): no section; nothing ticked                                                                                                                                                                                                                                                                         |
| no settled D-n contradicted                                                       | pass: D-19 (the agent adds `config-change-approved` for `.claude/hooks/`, `.claude/docs/`, `scripts/ci/`, which match `check-config-change.sh` PROTECTED) is followed. The card's "human-only" label wording predates D-19 and is stale: out of scope → follow-up (card text, not this plan)                   |
| `scripts/next-task.sh --check B1.20` on the committed plan says no overlap        | pass: `[next-task] B1.20: no overlap with any Doing or Review card` (exit 0)                                                                                                                                                                                                                                   |

Prototype I re-ran on a scratch copy (`$TMPDIR/probe-b120-1`, /bin/bash 3.2.57): the L1–L6 block as described, x 4
layouts, gave 8 FAIL at HEAD (exactly L1 and L5 per layout), and 24/24 ok with the two planned lines. Every S1–S15 /
C1–C8 probe stayed ok. L3/L4 catch a "literal only" fix, and L1/L5 catch a fix that reverts either site, so each
changed line is pinned.

Verdict: changes requested

1. **Role that cannot do its step.** Steps 1–2 name `dev-lead`, but `dev-lead`'s frontmatter path-guard allows only
   `backlog/*`, `docs/metrics.md`, `docs/mistake-log.md`. I confirmed it:
   `.claude/hooks/path-guard.sh 'backlog/*' 'docs/metrics.md' 'docs/mistake-log.md' '!backlog/00-decisions.md'` on
   `scripts/hook-smoke.sh` → exit 2. `.claude/hooks/plan-scope.sh`, `scripts/ci/check-plan-scope.sh` and
   `.claude/docs/hooks.md` are refused the same way. These steps work only in the lead's main session (no
   `agent_type`, card Owner: Lead), not as a dispatched `dev-lead` subagent or a `claude --agent dev-lead` session.
   State which one runs them.
2. **PR title and its metric cost not named.** `pr-step.sh draft "<title>"` needs a title, and the squash title
   decides `scripts/metrics/change-failure-rate.sh`. Both lines this card fixes came from B1.17's PR #60 (`25fee24`,
   merged 2026-10-30). A `fix(` title therefore counts this PR as a repair of B1.17 within the 14-day window. That
   count is accurate, but it raises the batch CFR above its 6.7 % baseline. A `chore(` title hides a real repair.
   B1.24's plan named its title for the same reason. Name the title, and state which effect the lead is accepting.
3. **Skeleton and map steps missing without a reason.** Add one line: no skeleton (no § function, hook-smoke has no
   `NotImplementedError` analogue) and no map move (tooling has no `features-map.md` row).

Build note (not a reason): stage only `src/app` in the L4–L6 commits. In my first prototype, `git add -A` in the `.` and
`.claude/worktrees/n` worktrees staged the nested worktrees as gitlinks. L4 then failed there regardless of the fix
(10 FAIL instead of 8).

Out of scope → follow-up (D-25): `scripts/CLAUDE.md` hook-smoke row says "S1–S15; check-plan-scope C1–C5" (stale since
C6–C8; the plan already notes it). `hook-smoke.sh` is not run by `.github/workflows/ci.yml`. The "every existing
probe still passes" clause is therefore proven only locally. Input: `grep -l hook-smoke .github/workflows/*` → none.
