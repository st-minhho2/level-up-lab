Files card **B1.104** through the "Filing a card" lane (`backlog/CLAUDE.md`). The checklist is the plan, so there is no `Plan approved by` line. Filing decides nothing: `dev-lead` plans the card when it is picked.

The gap: runs read text other people can write (issue bodies, issue and PR comments, PR review text, CI logs, fetched web or dependency docs, tool output), and nothing in `.claude/` (rules, agents, skills), the run prompt in `scripts/agent/run.sh` or `docs/` tells a role that this text is data, never instructions, nor what a run does when it tries to steer the run.

Evidence (main `fd039fd`):

- `grep -rniE "injection|untrusted|as data|not instructions" .claude/ scripts/agent/run.sh docs/` finds only two `TMPDIR` "as data" lines, none about prompt text.
- The run prompt (`scripts/agent/run.sh:301`) sends `dev-lead` to the issue and the card with no such clause.
- What exists: `scripts/agent/eligible.sh` requires write access for the labeler and the issue author; the runner firewall limits egress. Neither covers comments, review text, logs or fetched docs.

The card leaves the place of the rule to the plan (a `.claude/rules/*.md` file, the run prompt, `dev-lead.md`, or a combination) and asks for a red-first smoke probe that the run prompt and the rule carry the clause.

Files:

- `backlog/plan/E1-todos.md`: card B1.104 (quick, no dependency).
- `backlog/README.md`: totals (E1 64/1/36/101, total 106/1/37/144), node S145, Remaining row 145 (step 144 left to B1.103, filed in parallel).
- `backlog/work/B1.104/filing-pr-body.md`: this body.

`scripts/ci/check-backlog.sh` → OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
