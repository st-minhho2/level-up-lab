## Item

Filing lane (`backlog/CLAUDE.md` "Filing a card"): one tooling card, asked for by the lead on 2026-11-04 ("file B1.77").
Filing decides nothing; `dev-lead` plans the card when it is picked.

- **B1.77**: guard-bash lets an agent run commands that ask a credential helper or `gh` for a token and print it
  (`git credential fill`, `git credential-osxkeychain get`, `gh auth token`, `gh auth status --show-token`): each
  exits 0 through the hook today. Found during B1.76's plan review (invariant 7).

Files:

- `backlog/plan/E1-todos.md`: the card at the end of E1
- `backlog/README.md`: totals, node S87, Remaining row 87
- `backlog/work/B1.77/filing-pr-body.md`: this body

`scripts/ci/check-backlog.sh` → OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
