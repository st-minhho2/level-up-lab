Files card **B1.108**, a follow-up of B1.107 (PR #390: its plan weighed a general fix and the lead kept the card narrow; diff review pass 1 finding 1 asked for this card before #390 leaves draft), through the "Filing a card" lane (`backlog/CLAUDE.md`). The checklist is the plan, so there is no `Plan approved by` line. Filing decides nothing: `dev-lead` plans the card when it is picked.

- **B1.108**: `guard-bash.sh` `GH_PR_MERGE` (`:74`) and `GH_BRANCH_DELETE` (`:60`) allow at most one quote character around `gh`, `pr` and `close`/`merge`, and none inside a word. On `4e5b42a` and on B1.107's branch, 11 spellings exit 0, among them four that **merge** a pull request (`$'merge'`, `$"pr"`, `\merge`, `m''erge`; B1.103's rule, D-9) and seven that delete the remote branch (a quoted subcommand, a flag quoted in pieces, brace expansion, an unset variable before the flag). The card carries B1.107's timing of the general fix (bash 3.2, 138 KB: base 295 s, `${//}` 929 s, `sed` 315 s). Depends on B1.107: same lines of `guard-bash.sh`.

Files:

- `backlog/plan/E1-todos.md`: card B1.108 (quick, depends on B1.107).
- `backlog/README.md`: totals (E1 67/1/38/106, total 109/1/39/149), node S149 (after S148), Remaining row 149.
- `backlog/work/B1.108/filing-pr-body.md`: this body.

`scripts/ci/check-backlog.sh` → OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
