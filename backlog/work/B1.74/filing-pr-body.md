## Item

Filing lane (`backlog/CLAUDE.md` "Filing a card") for one tooling card, plus one evidence file outside the lane that
the lead approved for this PR on 2026-11-03 ("Gộp vào PR filing B1.74"): the record of the live run that found it.
Filing decides nothing; the fix direction in the card's Acceptance is the lead's choice A of the same date.

- **B1.74**: dev-lead commits a reviewer's `review.md` that Prettier rejects, formatted and unchanged. The live run on
  #184 after B1.69 committed its plan (bot author, `Agent-Run: 1`), passed `tier.sh` (low), `--check`, `eligible.sh`
  and the plan review, then stopped at the review commit: Prettier rejected `review.md` and dev-lead may not edit it.

Files:

- `backlog/plan/E1-todos.md`: the card at the end of E1
- `backlog/README.md`: totals (E1 45/2/26 of 73; total 56/2/27 of 85), node S85, Remaining row 85
- `backlog/work/B1.74/filing-pr-body.md`: this body
- `backlog/work/B1.65/live.md` (outside the lane, lead-approved): run 3's row, setup and findings, state left for run 4

`scripts/ci/check-backlog.sh` → OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
