Closing lane (`backlog/CLAUDE.md` "Closing a card") for B1.101: a ready runner PR is brought level with `main` by
`scripts/agent/run.sh --sync <issue>`. Feature PR #315 merged as 872fe7b; the Partial closing (#320) left two items
pending, both now in. The checklist is the plan, so there is no `Plan approved by` line.

Pending items, closed:

- (a) the `--sync` mention in `scripts/CLAUDE.md`'s `agent/run.sh` row: #328 merged as df1d495 (plan round 4,
  approved by the lead in the session).
- (b) the time from a sibling's merge to the next runner PR being mergeable, measured in E7 batch 2 (#322–#324,
  issues #308–#310):
  - after each merge, GitHub showed the other ready PRs `DIRTY/CONFLICTING` though `git merge-tree` in this clone was
    clean (GitHub ignores `merge=union`), as #315 measured;
  - `run.sh --sync` merged `origin/main` in 7–9 s each time (8204a1d for #323; c2d0a2a and ace62e5 for #324), rc 0;
    every `git show --remerge-diff` is empty, so nothing was resolved by hand;
  - clean run, after #323 merged: **272 s** from `mergedAt` to #324 `CLEAN` (fast-forward 1 s, sync 8 s, the rest CI
    on the synced head); after #322 merged, sync start to `CLEAN` was 282 s (#323) and 252 s (#324);
  - the first try after #322 refused both (`this checkout is behind origin/main by 1 commit`): B1.95's check runs for
    `--sync` too and the clone lagged by the merge itself. Fast-forwarding the runner clone first fixed it; #328's
    row now says so. That attempt's 2636 s of waiting is operator delay and is not in the number above;
  - `no-rework.sh` read 1/1 for #323 and #324: the `Agent-Run: sync` merges count as the runner's (the plan's cost).

Files:

- `backlog/plan/E1-todos.md`: B1.101 `**Status: Done** — 872fe7b (#315)`, the test evidence, #328, and the batch-2
  measurement.
- `backlog/README.md`: Remaining row 129 removed; `~~B1.101~~` in node 129. No other Remaining row was blocked by
  B1.101. Totals: E1 64/1/34, total 93/1/38 of 132.
- `backlog/work/B1.101/closing-pr-body.md`: this body (Closing step 6), replacing the Partial closing's.

No `spec/` row: tooling, no section, no feature. `docs/metrics.md` has no per-card row for tooling (as B1.95, B1.98).

`check-backlog.sh` OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
