## Item

Filing lane (`backlog/CLAUDE.md` "Filing a card"): four tooling cards found by batch B. The lead said "action cả 3 việc" on 2026-11-03, which covers filing all four. Filing decides nothing; `dev-lead` plans each card when it is picked.

- **B1.69**: the runner container keeps a git identity, and a probe proves it. B1.65's live run 1 (`work/B1.65/live.md`) stopped with `Author identity unknown`. This card blocks the next live run on #184 and every E5 run (D-29 unattended).
- **B1.70**: `init-firewall.sh` reads `api.github.com/meta` anonymously. It hit the 60/hour limit during B1.62's checks, and fail-closed, the runner never started.
- **B1.71**: `worktree.sh` exits 0 even when the Prisma client was never generated (B1.65 live run 2).
- **B1.72**: `scripts/CLAUDE.md` says sandbox probes S1–S7. B1.62 added S8–S10.

Id B1.68 is skipped: the B1.66 plan staged in the runner container (worktree `chore/B1.66-agent`, from #184's runs) already names it.

Files:

- `backlog/plan/E1-todos.md`: the four cards at the end of E1
- `backlog/README.md`: totals (E1 44/2/25 of 71; total 55/2/26 of 83), nodes S80–S83, Remaining rows 80–83
- `backlog/work/B1.69/filing-pr-body.md`: this body

`scripts/ci/check-backlog.sh` → OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
