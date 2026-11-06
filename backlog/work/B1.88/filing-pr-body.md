Files card **B1.88** through the "Filing a card" lane (`backlog/CLAUDE.md`). The checklist is the plan, so there is no `Plan approved by` line. The lead asked for this card at B1.84's close (it is the follow-up B1.84's plan names in its Costs).

- **B1.88**: B1.84 (#243) made guard-bash rule 6 refuse a `reviewer` Bash write unless its target lies under a set `TMPDIR` outside the worktree. `scripts/agent/run.sh` and the runner image set no `TMPDIR`, and #225 showed it empty in the container, so a headless reviewer's probes are now refused and reported "not run". The card asks for a private `TMPDIR` per run, outside the worktree and the project.

Files:

- `backlog/plan/E1-todos.md`: card B1.88 (quick, no dependency).
- `backlog/README.md`: totals (E1 55/0/31/86, total 72/0/32/104, recounted after B1.84's closing #247), node S104 (after S100), Remaining row 104.
- `backlog/work/B1.88/filing-pr-body.md`: this body.

B1.84's closing PR #247 edited the same README totals lines and merged first (4b3c1a4); this branch merged `origin/main` after it and recounted.

`scripts/ci/check-backlog.sh` → OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
