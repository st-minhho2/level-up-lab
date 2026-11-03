Closing lane (`backlog/CLAUDE.md` "Closing a card") for B1.55 — dev-lead carries an agent-ready card past a reviewed low
or medium plan, feature PR #171 merged as d66fccd, Partial pending a live run that takes the D-27 path. The checklist is
the plan; no `Plan approved by` line.

Evidence (`backlog/work/B1.65/live.md`, run 4): inside the runner container, on agent-ready issue #184 (card B1.66),
dev-lead took the reviewer's approval, `scripts/agent/tier.sh` gave `low`, `scripts/agent/eligible.sh 184 B1.66`
exited 0, and the run committed `Plan approved by: reviewer (D-27, tier low, issue #184)` itself (e7e9dd0), then went
on; run 5 carried the same branch to PR #200, whose CI (`guards`: check-plan-scope) accepted the D-27 field.

Files:

- `backlog/plan/E1-todos.md`: B1.55 `**Status: Done**`, 5 of 5
- `backlog/README.md`: Remaining row 67 out; `~~B1.55~~` in node 67 and in B1.56's Blocked by; totals
- `backlog/work/B1.55/closing-pr-body.md`: this body

No `spec/` change: B1.55 has no section. B1.56 is now unblocked.

`check-backlog.sh` OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
