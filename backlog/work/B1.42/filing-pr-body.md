Filing lane (`backlog/CLAUDE.md`, "Filing a card"): cards for autonomous delivery (D-27 to D-29, #150), ids B1.42–B1.46 as the lead chose ("id B1.42–B1.46"). Filing decides nothing; each card is planned when picked.

- B1.42 spike: a headless `claude -p --agent dev-lead` run keeps settings hooks (with `agent_type`), path-guard, turn and budget limits, and a full JSON log
- B1.43 agent-task issue template and `scripts/agent/eligible.sh` (label applied by write permission or higher)
- B1.44 runner: `tier.sh` (D-28), `run.sh`, devcontainer with firewall, launchd poll, cap of 3 open agent PRs
- B1.45 Evidence section in the PR template and `scripts/agent/feature-map.sh`
- B1.46 dependency-cruiser layer rules in CI

Order: B1.42 → (B1.43, B1.45, B1.46) → B1.44 → epic E5 (filed later).

Files: `backlog/plan/E1-todos.md`, `backlog/README.md`, `backlog/work/B1.42/filing-pr-body.md`.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
