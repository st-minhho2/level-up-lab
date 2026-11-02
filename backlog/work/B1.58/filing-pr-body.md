Filing lane (`backlog/CLAUDE.md`, "Filing a card"): two cards split from B1.44 by the lead's decision 1 at its plan
gate (`backlog/work/B1.44/plan.md`, approved 2026-11-02; PR #163).

- B1.58: the runner's devcontainer — an allow-list firewall (GitHub, npm registry, Anthropic), the pinned Linux `claude`
  build verified there, and the only place `run.sh` may bypass permissions
- B1.59: a launchd job runs `run.sh --poll` every 15 minutes inside B1.58's container, never on the host

Order: B1.44 → B1.58 → B1.59. B1.44's own PR moves the two clauses out of its Acceptance once this merges. Filing
decides nothing; each card is planned when picked.

Files: `backlog/plan/E1-todos.md`, `backlog/README.md`, `backlog/work/B1.58/filing-pr-body.md`.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
