Files card **B1.83** through the "Filing a card" lane (`backlog/CLAUDE.md`). The checklist is the plan, so there is no `Plan approved by` line.

Problem: `scripts/metrics/unattended.sh` ends the D-29 window at a PR's first `ready_for_review` event. The runner acts under the lead's account, so that event cannot tell the runner's ready from a person's. On 2026-11-06, runner PR #232 was marked ready by hand mid-run and then undone, yet the metric will still use that first timestamp. The lead asked for this card in the orchestrating session: "file card ready-signal".

Files:

- `backlog/plan/E1-todos.md`: card B1.83 (quick, no dependency).
- `backlog/README.md`: totals (E1 51/0/30/81, total 65/0/34/99), node S99, Remaining row 99.
- `backlog/work/B1.83/filing-pr-body.md`: this body.

`scripts/ci/check-backlog.sh` → OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
