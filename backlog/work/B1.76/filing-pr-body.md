## Item

Filing lane (`backlog/CLAUDE.md` "Filing a card") for one tooling card, plus one evidence file outside the lane that
the lead approved for this PR on 2026-11-03 ("đồng ý cả 4", the same shape as #195): the record of the live run that
found it. Filing decides nothing; the card lists candidate directions and chooses none.

- **B1.76**: the PR wrapper keeps the runner container's git credential and identity. Run 4 on #184 passed the plan
  gate on the D-27 path (A4, commit e7e9dd0 in the container, the bot's author, `Agent-Run: 1`) and stopped at
  `scripts/pr-step.sh push` (exit 128, no credential): the wrapper unsets `GIT_CONFIG_GLOBAL`, which is where the
  container keeps the credential helper and B1.69's identity.

Files:

- `backlog/plan/E1-todos.md`: the card at the end of E1
- `backlog/README.md`: totals (E1 46/2/26 of 74; total 57/2/27 of 86), node S86, Remaining row 86
- `backlog/work/B1.76/filing-pr-body.md`: this body
- `backlog/work/B1.65/live.md` (outside the lane, lead-approved): run 4's row, setup and findings, state left for run 5

Id B1.75 is skipped: B1.66's run plan (unpushed, in the container) already names it.

`scripts/ci/check-backlog.sh` → OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
