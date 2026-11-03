## Item

Filing lane (`backlog/CLAUDE.md` "Filing a card"): dependency lines only, no new card.

- **B1.59** now depends on **B1.62**. The lead ruled on 2026-11-03: "B1.59 phụ thuộc B1.62". The launchd poll's ticks need the Prisma engines and
  Playwright's browser inside the runner container, or they stop at worktree setup (raised in #174's body).
- **B1.63, B1.64, B1.65:** B1.55 is struck in their Blocked by. B1.55's code merged in #171; the card stays
  Partial only until B1.65 lands (#176), so the unstruck id made B1.65 wait on itself. B1.56 keeps B1.55 open: it
  waits for B1.55's Done.

Files:

- `backlog/plan/E1-todos.md` — Depends on lines of B1.59, B1.63, B1.64, B1.65
- `backlog/README.md` — Blocked by of rows 71, 74, 75, 76 (prettier widened the column)
- `backlog/work/B1.59/filing-pr-body.md` — this body

`scripts/ci/check-backlog.sh` → OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
