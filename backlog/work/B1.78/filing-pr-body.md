## Item

Filing lane (`backlog/CLAUDE.md` "Filing a card"): card **B1.78**. The lead asked for it in the orchestrating session on 2026-11-04: "file B1.78 và chạy".

The runner's first E5 run (issue #207, B5.2) stopped at the plan review. dev-lead's frontmatter write guard (`.claude/agents/dev-lead.md:11`, its `review.md` negation added by B1.74, #196) also runs for the subagents of a headless `--agent dev-lead` session. It denied the reviewer's `review.md` twice. The same guard allows only `backlog/*`, so test-writer and code-writer would be refused at red and green [unverified]. Every E5 card waits on this fix.

Filing decides nothing; `dev-lead` plans the card when it is picked (interactive session: the runner itself is the broken path).

Files:

- `backlog/plan/E1-todos.md`: the card at the end of E1
- `backlog/README.md`: totals, node S94, Remaining row 94
- `backlog/work/B1.78/filing-pr-body.md`: this body

`scripts/ci/check-backlog.sh` → OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
