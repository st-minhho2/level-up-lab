Closing lane (`backlog/CLAUDE.md` "Closing a card") for B1.43 — Agent-task issue template and an eligibility check on
the label, feature PR #155 merged as c2bb060. The checklist is the plan; no `Plan approved by` line. Per D-25 this PR
also files two out-of-scope follow-ups from B1.43's plan and diff reviews (filing lane, `backlog/CLAUDE.md` "Filing a
card"): B1.48, B1.49.

Files:

- `backlog/plan/E1-todos.md`: B1.43 `**Status: Done** — c2bb060 (#155)` with the probe, mutant and live results; Work
  line with review rounds and the follow-ups; `~~B1.43~~` in B1.44 "Depends on"; new cards
  - B1.48 (quick): a CI `test`-job step runs `scripts/agent/eligible-smoke.sh` (left out of #155: `ci.yml` was B1.46's)
  - B1.49 (quick): live check of `eligible.sh` on issues the lead labels, unlabels and re-labels; label rename and
    delete events, deleted actor (diff review pass 2, riskiest unfalsified)
- `backlog/README.md`: Remaining row 55 out, rows 60 and 61 in; `~~B1.43~~` in row 56 and node 55, nodes 60 and 61
  added; totals E1 34 / 0 / 15 of 49, total 45 / 0 / 16 of 61
- `backlog/work/B1.43/closing-pr-body.md`: this body (Closing step 6)

No `spec/features-map.md` or `spec/technical-requirements.md` change: B1.43 has no section. The `scripts/CLAUDE.md`
rows for `scripts/agent/` are the orchestrator's after the batch; creating the `agent-ready` label is the lead's.

`check-backlog.sh` OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
