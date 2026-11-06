Files card **B1.82** through the "Filing a card" lane (`backlog/CLAUDE.md`). The checklist is the plan, so there is no `Plan approved by` line.

Problem: `scripts/agent/run.sh` `in_flight` counts merged local agent branches. On 2026-11-06, three merged worktrees were left in the runner container (B5.1, B5.3, B5.4). With them, `run.sh 224` printed `skip #224: 3 agent branches in flight` and started nothing, although #224 was eligible. It ran only after the lead pruned by hand. The lead asked for this card in the orchestrating session: "file card in_flight".

Files:

- `backlog/plan/E1-todos.md`: card B1.82 (quick, no dependency).
- `backlog/README.md`: totals (E1 51/0/29/80, total 65/0/33/98), node S98, Remaining row 98.
- `backlog/work/B1.82/filing-pr-body.md`: this body.

`scripts/ci/check-backlog.sh` → OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
