## Item

B1.101 round 4 — `scripts/CLAUDE.md`'s `agent/run.sh` row names `--sync <issue>` (tooling, no spec section). Pending
item (a) of B1.101's Partial closing (#320); the feature itself merged in #315 (872fe7b), whose body stays in that PR
and in `git show 872fe7b:backlog/work/B1.101/pr-body.md`.

- spec: none — tooling docs; no `src/`, script or behaviour change
- test: none needed (one table row); `hook-smoke.sh` "749 probes OK" before and after
- acceptance: the guide row names `--sync <issue>` (Acceptance 1's last pending mention)

## Plan

Copied from `backlog/work/B1.101/plan.md` "Round 4" (approved 44a04e9, lead, 2026-11-15; not re-reviewed: plan review
cap 2, as round 3).

No card plans `scripts/CLAUDE.md` now (B1.98 merged in #306), so B1.101 carries the row itself, one `docs(scripts)`
commit. The `agent/run.sh` row's first cell gains `\| --sync <issue>`; its Does cell gains "`--sync <issue>`: merges
`origin/main` into the issue's ready PR branch in its worktree with this clone's attributes, runs the three table
guards, pushes with `Agent-Run: sync`, no `claude`", and, from E7 batch 2, "after a merge, fast-forward this clone to
`origin/main` first or it refuses as behind". No other file but the plan and this body.

| File                    | Change                                                 | Why         |
| ----------------------- | ------------------------------------------------------ | ----------- |
| `scripts/CLAUDE.md`     | round 4: the `agent/run.sh` row names `--sync <issue>` | closing (a) |
| `backlog/work/B1.101/*` | plan round 4 and its approval, this PR body            | pipeline    |

## Map delta

None (no `src/`, no section).

## Review

Not re-reviewed (plan review cap 2; a one-row doc change). Prettier re-pads the whole table because the first cell
widened: `git diff -w --word-diff` of 4926ba3 shows only the `agent/run.sh` row's text changing.

Why the fast-forward sentence: in E7 batch 2, right after #322 merged, `run.sh --sync 309` and `--sync 310` both
refused (`this checkout is behind origin/main by 1 commit`, the merge itself: B1.95's check runs for `--sync` too).
After `git -C <clone> merge --ff-only origin/main` both synced (rc 0, 7–9 s). The time from a sibling's merge to the
next PR mergeable, measured cleanly after #323 merged: 272 s (sync 8 s, the rest CI on the synced head). That number
goes to B1.101's Done closing, not here.

## Evidence

- `scripts/ci/check-plan-scope.sh` → "stays inside the approved plan of B1.101"
- `scripts/ci/check-backlog.sh` OK; `prettier --check scripts/CLAUDE.md` OK; `hook-smoke.sh` "749 probes OK"
- tier: low (`scripts/CLAUDE.md` is not in `CONFIG_PROTECTED`; no `config-change-approved` label)
- plan deviations: none

## Checklist

- [x] **Diff matches the approved plan**: no file outside the Files table, no interface outside the list.
- [x] Red commit precedes the change commit (n/a: docs only, no test).
- [x] Every `AC-§.n` of the section is a test title (n/a: no section); mutation (n/a: no `src/`).
- [x] No new `eslint-disable` / `@ts-ignore` / `@ts-expect-error`; no protected config change.
- [x] Migrations reviewed as SQL (n/a).
- [x] `spec/features-map.md` (n/a); `docs/metrics.md` (n/a: tooling); mistake-log: no repeat.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
