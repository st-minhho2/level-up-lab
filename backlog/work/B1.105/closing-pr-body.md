Closing lane (`backlog/CLAUDE.md` "Closing a card") for B1.105: `guard-bash.sh` blocks a remote branch delete through
`gh pr` close or merge when flags (and values holding spaces, such as a `$(…)` repo) sit between `pr` and the
subcommand, the first flag possibly behind quotes, `\` or `$`, and quotes surround `gh`, `pr` or the subcommand. The
shared `GH_PR_FLAGS` widens B1.103's merge rule the same way. Feature PR #387 merged as 9087ff3. The checklist is the
plan, so there is no `Plan approved by` line.

Evidence (from #387):

- hook-smoke: red 7d753df 16 FAIL / 797 ok; green d92ea48 813 OK; review pass 1 probes 18f92e0 7 FAIL / 813 ok, fix
  68fae57 820 OK (`/bin/bash` 3.2; bash 5 in CI `test`, green on 654283f). Mutants: each changed part of the rule
  lets 1 to 13 probes through.
- vitest 403, e2e 91; mutation: CI only, no src/lib or src/actions change.
- Rounds: plan review 4, lead 2 (re-approved after diff review pass 1 #1 and plan review r3, option a both times);
  diff review 2 of 3 passes.
- Out of scope, filed as B1.107 (#388, merged 184c126): a delete flag after the close word written behind `$'…'`, `$"…"`, `\` or
  `""` still deletes the branch (B1.24's half of the rule).

Files:

- `backlog/plan/E1-todos.md`: B1.105 `**Status: Done** — 9087ff3 (#387)` with the evidence above; `~~B1.105~~` in
  B1.107's "Depends on".
- `backlog/README.md`: Remaining row 146 removed; `~~B1.105~~` in node 146 and in row 148 (B1.107, filed in #388,
  merged here from `main`, 92f6136). Totals: E1 67/1/37/105, total 109/1/38 of 148.
- `backlog/work/B1.105/closing-pr-body.md`: this body.

No `spec/` row: tooling, no section, no feature. `docs/metrics.md` has no per-card row for tooling (as B1.103).

`check-backlog.sh` OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
