Closing lane (`backlog/CLAUDE.md`, "Closing a card"): B1.57 is merged (fee6a51, #181) and closes `Done`.

- Met: 5 of 5 acceptance clauses: `scripts/metrics/unattended.sh` and `scripts/metrics/no-rework.sh` print D-29's per-item rows and shares; a run's commits carry `Agent-Run: <RUNNER_CHILD>` from lefthook's `prepare-commit-msg` job, probed by githooks-smoke G7–G9; `docs/metrics.md` holds the two D-29 rows with how to re-measure; `config-change-approved` on #181.
- Evidence: metrics-smoke 41 ok (red 920221e: 8 FAIL), githooks-smoke 9 ok (red: 1 FAIL), hook-smoke 511; vitest 202, playwright 43; no `src/` change, mutation 93.40. Live read-only: `unattended.sh` → #166 `no`, #184 `pending`; `no-rework.sh 170 171` → `no`, `yes`.
- Not yet run: the hook inside the runner container (it installs with `pnpm install`); the D-29 shares themselves are measured per E5 batch, not by this card.

README: row 69 removed, node struck, E1 44/2/21/67, Total 55/2/22/79; no feature-map or section status (tooling, no §).

Files: `backlog/plan/E1-todos.md`, `backlog/README.md`, `backlog/work/B1.57/closing-pr-body.md`.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
