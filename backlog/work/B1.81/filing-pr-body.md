Files card **B1.81** through the "Filing a card" lane (`backlog/CLAUDE.md`). The checklist is the plan, so there is no `Plan approved by` line.

`.claude/hooks/guard-bash.sh:106-107` skips the secret-read rule for the whole command whenever `.env.example` appears anywhere in it. As a result, `cat .env.example .env` passes the hook (exit 0, replayed on 2026-11-05 with JSON input only, nothing read). B1.79's plan review found it, and the lead asked for the card in the orchestrating session: "file card .env.example".

Files:

- `backlog/plan/E1-todos.md`: card B1.81 (quick, no dependency).
- `backlog/README.md`: totals (E1 50/0/28/78, total 63/0/33/96), node S97, Remaining row 97.
- `backlog/work/B1.81/filing-pr-body.md`: this body.

Numbering: step 96 / B1.80 is taken by the open filing PR #219. Whichever merges second rebases its totals.

`scripts/ci/check-backlog.sh` → OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
