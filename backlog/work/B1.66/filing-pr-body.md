Filing lane (`backlog/CLAUDE.md`, "Filing a card"): the live test card B1.65's approved plan names (lead decision 3
at B1.65's gate, `backlog/work/B1.65/plan.md`).

- B1.66: `scripts/agent/run.sh` writes one log set per run under `runs/<issue>/` and nothing removes them; this
  tier-0 card asks for a plan (retention rule, the card that would build it), Files only `backlog/work/B1.66/*`, so
  `scripts/agent/tier.sh` rates its plan `low`. B1.65's live headless run carries it past the plan gate under D-27.

No dependency. After merge the lead opens the issue form (Card id B1.66) and labels it `agent-ready`. Filing decides
nothing; the card is planned when picked (by the run).

Files: `backlog/plan/E1-todos.md`, `backlog/README.md`, `backlog/work/B1.66/filing-pr-body.md`.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
