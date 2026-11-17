Closing lane (`backlog/CLAUDE.md` "Closing a card") for B1.107: `guard-bash.sh` blocks a remote branch delete through
`gh pr` close or merge when the delete flag after the subcommand sits behind quotes, `\` or `$` (`$'…'`, `$"…"`, an
empty quote pair), the class `PUSH_FORCE` and `GH_PR_FLAGS` already use. Feature PR #390 merged as 23315a4. The
checklist is the plan, so there is no `Plan approved by` line.

Evidence (from #390):

- hook-smoke: red b80699a 12 FAIL / 826 ok; green 2bf0ac0 838 OK (820 + 18; `/bin/bash` 3.2; bash 5 in CI `test`,
  green on ae706ac). Mutants 4/4 killed (12, 7, 3, 9 probes).
- vitest 403, e2e 91; mutation: CI only, no src/lib or src/actions change.
- Rounds: plan review 1, lead 1 (approach A, the narrow fix; the general normalization was weighed and measured);
  diff review 1 of 3 passes.
- Out of scope, filed as B1.108 (#391, merged b8cadaa): 11 spellings with `pr`, the subcommand or the flag quoted in
  pieces, four of them a merge, with the general fix's timing.

Files:

- `backlog/plan/E1-todos.md`: B1.107 `**Status: Done** — 23315a4 (#390)` with the evidence above; `~~B1.107~~` in
  B1.108's "Depends on".
- `backlog/README.md`: Remaining row 148 removed; `~~B1.107~~` in node 148 and in row 149 (B1.108, filed in #391,
  merged here from `main`, 8ee3a88). Totals: E1 68/1/37/106, total 110/1/38 of 149.
- `backlog/work/B1.107/closing-pr-body.md`: this body.

No `spec/` row: tooling, no section, no feature. `docs/metrics.md` has no per-card row for tooling (as B1.103, B1.105).

`check-backlog.sh` OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
