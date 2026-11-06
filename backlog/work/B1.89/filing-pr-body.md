Files card **B1.89** through the "Filing a card" lane (`backlog/CLAUDE.md`). The checklist is the plan, so there is no `Plan approved by` line. The lead asked for it in the orchestrating session: "chạy B1.88, file B1.89".

Every card PR appends a row to the same tables: `spec/features-map.md`, `docs/metrics.md`, and the section index in `spec/technical-requirements.md`. Two PRs merged one after the other conflict on these adjacent lines, as #230/#232 and #226/#227 did. Epic E6 will run three `run.sh` runs in parallel, so the second and third runner PRs would conflict at dev-lead's step-9 merge of `origin/main`. Each would cost a code-writer turn and a review pass. The card proposes `merge=union` for the append-only tables, with guard probes for the duplicate-row risk.

Files:

- `backlog/plan/E1-todos.md`: card B1.89 (quick, no dependency).
- `backlog/README.md`: totals (E1 55/0/32/87, total 72/0/33/105), node S105, Remaining row 105.
- `backlog/work/B1.89/filing-pr-body.md`: this body.

`scripts/ci/check-backlog.sh` → OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
