Files card **B1.109**, a follow-up of B1.108 (#393, diff review pass 5 finding 1, which the lead chose to name out of
reach there rather than fix in a sixth pass), through the "Filing a card" lane (`backlog/CLAUDE.md`). The checklist is
the plan, so there is no `Plan approved by` line. Filing decides nothing: `dev-lead` plans the card when it is picked.

- **B1.109**: after B1.108, the unquoted copy deletes a `${X[ … ]}` whose token holds no shell metacharacter, and the
  token may hold `$`. Where the shell does not expand the `${` (after `\` or `$$`), a word split by a parameter inside
  it (`-$@d`, `m$@erge`) is deleted whole, main's original-text rules cannot read the pieces, and `bash -c '… $1'`
  hands gh the plain word: six forms exit 0 on B1.108's branch and on main. The reviewer's prototype (add `$` to the
  excluded set) blocks all six. Depends on B1.108: same line of `guard-bash.sh`, next `hook-smoke.sh` section.

Files:

- `backlog/plan/E1-todos.md`: card B1.109 (quick, depends on ~~B1.108~~, merged as 7aa59fb and closed in #395).
- `backlog/README.md`: totals (E1 69/1/37/107, total 111/1/38/150, after merging `origin/main` with #395), node S150
  (after S149), Remaining row 150.
- `backlog/work/B1.109/filing-pr-body.md`: this body.

`scripts/ci/check-backlog.sh` → OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
