## Item

Filing lane (`backlog/CLAUDE.md` "Filing a card"): card **B1.62** — The runner's image carries the Prisma engines
and Playwright's browser for a full run inside (tooling, no spec section).

Found by B1.58's plan review round 2 (`backlog/work/B1.58/review.md`, reason 4) and approved by the lead as B1.58's
decision 5: the runner container's allow list holds only GitHub, the npm registry and Anthropic, so
`scripts/worktree.sh`'s `pnpm install` (Prisma engines from `binaries.prisma.sh`) and `pnpm test:e2e` (Playwright's
browser) cannot run inside it. Depends on B1.58 (#170), which adds `.devcontainer/runner/`.

Id B1.62 was left for this follow-up by #172 (B1.63). Filing decides nothing; `dev-lead` plans the card when it is
picked.

Files:

- `backlog/plan/E1-todos.md` — the card at the end of E1
- `backlog/README.md` — totals (E1 40/1/24 of 65; total 51/1/25 of 77), node S77, Remaining row 77 (after B1.64, B1.65 merged; B1.58 done, struck in Blocked by)
- `backlog/work/B1.62/filing-pr-body.md` — this body

For the lead: B1.59 (launchd poll) should also wait for B1.62, or its ticks stop at worktree setup inside the
container. This lane does not touch B1.59's line; the dependency is the lead's call (or B1.59's plan).

`scripts/ci/check-backlog.sh` → OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
