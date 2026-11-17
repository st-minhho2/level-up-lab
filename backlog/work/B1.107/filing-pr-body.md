Files card **B1.107**, a follow-up of B1.105 (#387, diff review pass 2 finding 2, out of that card's scope), through the "Filing a card" lane (`backlog/CLAUDE.md`). The checklist is the plan, so there is no `Plan approved by` line. Filing decides nothing: `dev-lead` plans the card when it is picked.

- **B1.107**: `guard-bash.sh:55` (`GH_BRANCH_DELETE`) sees the delete flag after `close`/`merge` only bare or behind one quote character (`[\"']?(-[a-z]*d|--delete-branch)`). On `7163825` and on B1.105's branch, a `-d` or `--delete-branch` written behind `$'…'`, `$"…"`, `\` or `""` exits 0 (five spellings tried; the bare and `"-d"` forms exit 2). The shell strips those characters, so gh deletes the remote branch. `PUSH_FORCE` (B1.24) and B1.105's `GH_PR_FLAGS` already take `["'\\$]*` for the same spellings. Depends on B1.105: same line of `guard-bash.sh`, same `hook-smoke.sh` section.

Files:

- `backlog/plan/E1-todos.md`: card B1.107 (quick, depends on B1.105).
- `backlog/README.md`: totals (E1 66/1/38/105, total 108/1/39/148), node S148 (after S146), Remaining row 148.
- `backlog/work/B1.107/filing-pr-body.md`: this body.

`scripts/ci/check-backlog.sh` → OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
