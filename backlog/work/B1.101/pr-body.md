## Item

B1.101 — GitHub reports parallel runner PRs as conflicting on the union tables, and each needs a re-run (tooling, no
spec section)

- spec: none — tooling (`scripts/agent/run.sh`, its smoke, the compose header, git-workflow.md); no `src/` change
- test: `scripts/agent/run-smoke.sh` R21, R22 (new). Red: pending. Green: pending.
- acceptance: pending
- risk tier: high (`scripts/agent/`, `.claude/`, `.devcontainer/`); label `config-change-approved` (D-19)

## Plan

Copied from `backlog/work/B1.101/plan.md` (approved 2b2bc81, lead, 2026-11-14; plan review 2 rounds, round 3 not
re-reviewed).

Approach: a light `scripts/agent/run.sh --sync <issue>`: merge `origin/main` into the run's branch in its own worktree
with this clone's attributes, run the three table guards, push, comment; no `claude` run. Not "union tables left to
the closing lane": the `main` ruleset requires an up-to-date branch, so after every merge each other ready PR is
BEHIND even with no shared line, and only a commit on the branch clears that.

Measured (replaces B1.89's `[unverified]`): GitHub's merge ignores `.gitattributes`. A bare clone merging the parents
of 7eab1a5 (B7.1) and a0da40a (B7.2) with `git merge-tree --write-tree` (git 2.39.5): exit 1, conflicted
`docs/metrics.md` and `spec/features-map.md`; this clone, same parents: exit 0, both `--remerge-diff` empty; GitHub
read #300 and #302 `CONFLICTING`.

Order: identity → behind check → card id → branch → its worktree → one open ready PR → lock → on the branch, no
tracked change → HEAD = `origin/<branch>` → already level: exit 0 → `git merge --no-ff` with `Agent-Run: sync`
(conflict: abort, name `run.sh <n>`) → `check-spec-sections.sh`, `check-features-map.sh`, `check-backlog.sh` (fail:
`reset --keep`, name `run.sh <n>`) → `pr-step.sh push` (fail: reset) → issue comment `**synced**`. TERM/INT after the
merge resets to the PR's head unless the push landed.

Costs, accepted by the lead: the merge counts as the runner's in no-rework (`Agent-Run: sync`) though the lead types
the command; the PR stays ready during CI (the ruleset holds the merge); no local tests; one command per other ready PR
after each merge; `scripts/CLAUDE.md` does not name `--sync` and the time-to-mergeable exists only after E7 batch 2, so
the closing lane is `-partial` pending both.

| File                                      | Change                                                                                                        |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `scripts/agent/run.sh`                    | `sync_issue`, `wgit`, `--sync <issue>` in case, `USAGE`; no claude lookup for it; `on_signal` reset; header   |
| `scripts/agent/run-smoke.sh`              | R21 (clean union sync, then level), R22 (refusals and signals leave local and origin's branch agreeing)       |
| `.devcontainer/runner/docker-compose.yml` | header: after each merge in a batch, `exec runner scripts/agent/run.sh --sync <issue>` per other ready PR     |
| `.claude/docs/git-workflow.md`            | "Batch review": a ready runner PR is brought in line by `run.sh --sync <issue>`, GitHub ignores `merge=union` |
| `backlog/plan/E1-todos.md`                | B1.89 and B1.96 status lines: "GitHub mergeability [unverified]" → the measured behaviour                     |
| `backlog/work/B1.101/*`                   | plan, review, pr-body                                                                                         |

## Map delta

None: tooling card, no `spec/features-map.md` row.

## Review

pending

## Evidence

- AC met: pending
- tier: high
- plan deviations: pending
- trace: n/a

## Checklist

- [ ] **Diff matches the approved plan**: no file outside the Files table, no interface outside the list.
- [ ] Red commit precedes the change commit; no `feat(` commit touches `*.test.*` or `e2e/**`.
- [ ] Every `AC-§.n` of the section is a test title; mutation on `src/lib` + `src/actions` ≥ 70 %.
- [ ] No new `eslint-disable` / `@ts-ignore` / `@ts-expect-error`; protected config changed with label `config-change-approved`.
- [ ] Migrations reviewed as SQL; `prisma/seed.ts` updated if a table changed.
- [ ] `spec/features-map.md` row moved; `docs/metrics.md` per-card row filled; mistake-log updated if a known mistake repeated.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
