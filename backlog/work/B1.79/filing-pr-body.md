## Item

Filing lane (`backlog/CLAUDE.md` "Filing a card"): one tooling card, asked for by the lead on 2026-11-05. Filing
decides nothing; `dev-lead` plans the card when it is picked.

- **B1.79**: guard-bash's secret-read rule (`.claude/hooks/guard-bash.sh:104-107`) refuses a command whose text only
  mentions `.key` or `.env` next to any reader word. The runner's rerun of #207 (B5.2) lost 4 of its 7 permission
  denials to it (`event.key !== 'Escape'` in three edit commands, a comment naming the dotenv file in one); none read
  a secret. Epic E5 puts `event.key` in most of its diffs.

Files:

- `backlog/plan/E1-todos.md`: the card at the end of E1
- `backlog/README.md`: totals, node S95, Remaining row 95
- `backlog/work/B1.79/filing-pr-body.md`: this body

`scripts/ci/check-backlog.sh` → OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
