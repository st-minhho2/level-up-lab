Files cards **B1.90** and **B1.91** through the "Filing a card" lane (`backlog/CLAUDE.md`). The checklist is the plan, so there is no `Plan approved by` line. Both are follow-ups of B1.85 (#252, closed Partial in #254); the lead asked for them in the B1.85 session ("create the two follow-up cards").

- **B1.90**: B1.85's test was a hand-run `git grep`, so nothing in CI stops the role prompts from handing the `docs(map)` step back to dev-lead. A `hook-smoke.sh` probe section, with its range in `scripts/CLAUDE.md` (free again now that B1.89 merged).
- **B1.91**: `backlog/CLAUDE.md` "Closing a card" step 3 still tells the closing commit to flip the feature's map row, which the card's own `docs(map)` commit moved before the review; no closing commit since B5.1 touched the map. Found in B1.85's diff review, pass 1.

Files:

- `backlog/plan/E1-todos.md`: cards B1.90 and B1.91 (quick, no dependency).
- `backlog/README.md`: totals (E1 56/1/32/89, total 73/1/33/107), nodes S106 and S107 (both after S101), Remaining rows 106 and 107.
- `backlog/work/B1.90/filing-pr-body.md`: this body.

`scripts/ci/check-backlog.sh` → OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
