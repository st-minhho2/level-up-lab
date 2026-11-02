Filing lane (`backlog/CLAUDE.md`, "Filing a card"): the follow-up B1.55's approved plan names (lead decision 3 at
B1.55's gate; the plan called it B1.62, which #174 took first).

- B1.65: `scripts/agent/run.sh`'s prompt still says "At the plan gate print the gate line and stop", so after B1.55
  a headless run would still stop at every card. B1.58 holds `run.sh`, so B1.55 left it; this card rewords the prompt
  and header, probes it in `run-smoke.sh`, and proves one live low-tier run past the gate. B1.55 closes
  `Partial — pending B1.65` until then.

Depends on B1.55 (#171) and B1.58 (#170). Totals: whichever of this PR and #174 (B1.62) merges second fixes the
README totals. Filing decides nothing; the card is planned when picked.

Files: `backlog/plan/E1-todos.md`, `backlog/README.md`, `backlog/work/B1.65/filing-pr-body.md`.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
