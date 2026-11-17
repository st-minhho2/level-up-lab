Files cards **B1.105** and **B1.106**, two follow-ups of B1.103 (#381), through the "Filing a card" lane (`backlog/CLAUDE.md`). The checklist is the plan, so there is no `Plan approved by` line. Filing decides nothing: `dev-lead` plans each card when it is picked.

- **B1.105**: `guard-bash.sh:55` (`GH_BRANCH_DELETE`) needs `pr` directly before `close`, so `gh pr -R o/r close 7 --delete-branch`, `… -d` and `gh pr --repo o/r close 7 --delete-branch` exit 0 today (tried on `b5d8ca4` and on B1.103's branch) and delete the remote branch. B1.103 closed the same flag gap for the `merge` half only. Depends on B1.103: same lines of `guard-bash.sh` and `hook-smoke.sh`, reuses its `GH_PR_FLAGS`.
- **B1.106**: a `(red)` marker on a probe-only commit (no `*.test.ts(x)`) fails only in CI `guards` (`verify-red.sh:73-75`), after the push; seen twice (B1.62 #185, B1.103 #379), each costing a re-cut branch and PR. The mistake-log row says a written rule or a pre-push check is owed; the card asks for both, the local check applying `verify-red.sh`'s own rule.

Files:

- `backlog/plan/E1-todos.md`: cards B1.105 (quick, depends on B1.103) and B1.106 (quick, no dependency).
- `backlog/README.md`: totals (E1 64/1/39/104, total 106/1/40/147), nodes S146 (after S144) and S147, Remaining rows 146 and 147.
- `backlog/work/B1.105/filing-pr-body.md`: this body.

`scripts/ci/check-backlog.sh` → OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
