Filing lane (`backlog/CLAUDE.md`, "Filing a card"): a fix card (D-25) from B1.49's live check of the eligibility rule
(`backlog/work/B1.49/live.md`, PR #168).

- B1.63: `scripts/agent/eligible.sh` matches the `agent-ready` events by label name, but GitHub's REST issue events
  keep the name a label had when the event happened. A label renamed to `agent-ready` therefore lets an older event of
  the real label decide, and the script exits 0 for a label a non-writer applied (needs a write user's two renames).
  The fix matches by the label's node id (GraphQL `LabeledEvent.label.id`, stable through rename and delete, live.md
  steps 6–7).

Depends on B1.55, which also changes `eligible.sh`. Id B1.62 is left to B1.58's follow-up. Filing decides nothing; the
card is planned when picked.

Files: `backlog/plan/E1-todos.md`, `backlog/README.md`, `backlog/work/B1.63/filing-pr-body.md`.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
