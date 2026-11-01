## Item

B1.20 — Plan rows with `[ ]` match their own path in the plan-scope hook and guard (tooling, no spec section)

- spec: none — tooling (`.claude/docs/hooks.md` plan-scope row)
- test: `scripts/hook-smoke.sh` L1–L6 x 4 layouts — red before (8 FAIL: L1, L5 per layout), green after (`hook-smoke: 440 probes OK`)
- acceptance: `plan-scope.sh` and `check-plan-scope.sh` compare a Files token literally before as a glob, in every worktree layout; every existing probe still passes; label `config-change-approved` (D-19: `.claude/`, `scripts/ci/`)

## Plan

Approach: in both comparisons test the token literally first, then as a glob — the `next-task.sh --check` fix of #63
(`scripts/next-task.sh:133-134`): `[[ -n "$p" && ( "$REL" == "$p" || "$REL" == $p ) ]]` in `.claude/hooks/plan-scope.sh:36`,
the same with `$f` in `scripts/ci/check-plan-scope.sh:25`. Today a row `src/app/[id]/page.tsx` is only a glob whose
`[id]` is a one-character bracket expression, so the file it names is refused (hook exit 2, guard exit 1). Tooling
card: spec-analyst and advisor skipped; the card's Acceptance is the contract. Prototype (scratch copy): HEAD 8 FAIL
of the 24 new probes, fixed 0 FAIL, every S1–S15 / C1–C8 probe still ok.
Known cost (unchanged by design, as in #63): the glob reading stays, so `src/app/i/page.tsx` also matches that row.
Out of scope: `scripts/CLAUDE.md` still names "S1–S15; check-plan-scope C1–C5" for hook-smoke (stale since C6–C8).

## Files

| File                             | Change                                                                  |
| -------------------------------- | ----------------------------------------------------------------------- |
| `.claude/hooks/plan-scope.sh`    | line 36: literal comparison before the glob one                         |
| `scripts/ci/check-plan-scope.sh` | line 25: literal comparison before the glob one                         |
| `scripts/hook-smoke.sh`          | own block L1–L6 after the check-plan-scope block (24 probes, 4 layouts) |
| `.claude/docs/hooks.md`          | plan-scope row: "each token compared literally, then as a glob"         |
| `backlog/work/B1.20/plan.md`     | plan                                                                    |
| `backlog/work/B1.20/review.md`   | reviews                                                                 |
| `backlog/work/B1.20/pr-body.md`  | PR body                                                                 |

## Interfaces touched

None: the hook's stdin JSON and exit codes (0 allow, 2 block) and `check-plan-scope.sh`'s output and exit codes (0, 1)
are unchanged; `plan-files.sh` is untouched.

Probe block (own `echo "== plan rows with [ ] (B1.20) …"` header, its own fixture `$LS`, B1.30's guard-bash probes stay
apart): a clone of a bare origin on `feat/B9.10-main` whose approved plan lists `src/app/[id]/page.tsx` and
`src/app/*/layout.tsx`, a worktree per `$LAYOUTS` entry. Per layout (`.`, `.worktrees/s`, `.claude/worktrees/n`,
`.claude/worktrees/n/.worktrees/b`): L1 write `src/app/[id]/page.tsx` → plan-scope 0 · L2 `src/app/[slug]/page.tsx` → 2
· L3 `src/app/x/layout.tsx` → 0 · then commits in that worktree (staging only `src/app`: `add -A` would stage nested worktrees as gitlinks): L4 layout only → check-plan-scope 0 · L5 + `[id]` page
→ 0 · L6 + `[slug]` page → 1. Red at HEAD: L1 and L5 in each layout (8).

## Verification (in the card worktree, /bin/bash 3.2)

```bash
scripts/hook-smoke.sh | grep -c '^FAIL'; scripts/hook-smoke.sh | tail -1   # test commit: 8; "hook-smoke: FAILURES above"
scripts/hook-smoke.sh | grep '^FAIL'          # test commit: exactly "L1 <layout> listed path with [ ]" and "L5 <layout> listed path with [ ] in the diff" x4
scripts/hook-smoke.sh | tail -1               # fix: "hook-smoke: 440 probes OK" (416 + 24)
bash -n .claude/hooks/plan-scope.sh scripts/ci/check-plan-scope.sh scripts/hook-smoke.sh   # silent
scripts/ci/check-plan-scope.sh | tail -1; scripts/ci/check-backlog.sh | tail -1   # "OK: … inside the approved plan of B1.20"; OK
```

## Work breakdown

| Step | Role / skill | Produces                                           | Commit                                                           |
| ---- | ------------ | -------------------------------------------------- | ---------------------------------------------------------------- |
| 1    | main session | L1–L6 probes, 8 FAIL                               | `test(hooks): B1.20 plan-scope probes for bracketed plan rows`   |
| 2    | main session | literal-then-glob in both + `hooks.md` row, 440 ok | `fix(hooks): B1.20 plan-scope matches bracketed paths literally` |
| 3    | reviewer     | diff review in `review.md`                         | `docs(backlog): B1.20 review`                                    |

Steps 1–2 run in the lead's main session acting as dev-lead via `/work-next` (no `agent_type`; the `dev-lead`
subagent's path-guard refuses these files), as B1.24 and B1.27 did. No skeleton step (no § function; hook-smoke has no
`NotImplementedError` analogue) and no map step (tooling has no `features-map.md` row). No `(red)` marker on step 1:
CI's `verify-red.sh --auto` judges only vitest files. PR via `scripts/pr-step.sh`, label `config-change-approved`
(D-19: `.claude/`, `scripts/ci/`). PR (squash) title, from the lead's batch brief:
`chore(hooks): B1.20 plan-scope matches bracketed paths`. Cost the lead accepts with it: both lines come from B1.17's
#60 (merged 2026-10-30), and `change-failure-rate.sh` counts only `fix(`/revert titles, so this repair of B1.17 stays
out of the CFR (one repair uncounted); a `fix(hooks): …` title instead would count it within the 14-day window.

Plan review: approved, round 2 (r1: 3 changes requested, resolved; r2: 0 findings, 3 out of scope → follow-up) · Plan approved by: · Rounds: 1

## Map delta

None: tooling card, no feature row.

## Review

Pending: `/review-loop` after the fix commit.

## Checklist

- [ ] **Diff matches the approved plan**: no file outside the Files table, no interface outside the list.
- [ ] Red commit precedes the fix commit; the fix touches no test.
- [x] Every `AC-§.n` of the section is a test title — n/a, tooling.
- [ ] No new `eslint-disable` / `@ts-ignore` / `@ts-expect-error`; protected paths `.claude/`, `scripts/ci/` → label `config-change-approved`.
- [x] Migrations — n/a.
- [ ] `docs/metrics.md` per-card row filled at closing.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
