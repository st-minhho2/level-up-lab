Files card **B1.102** through the "Filing a card" lane (`backlog/CLAUDE.md`). The checklist is the plan, so there is no `Plan approved by` line. Filing decides nothing: `dev-lead` plans the card when it is picked.

The gap: `scripts/ci/check-ac-coverage.sh` checks `AC-§.n:` test titles only for sections whose index row is ✅ or ◐. A feature PR runs while its section is still ✗ (the closing PR flips it), so a wrong title format passes the feature PR and its reviewer and fails only in the closing PR.

Evidence (E8):

- B8.1's feature PR #333 shipped `AC-41.3 (a):`, `AC-41.3 (b):` and `AC-41.4 $name:` in `src/components/todo-item-select.test.tsx`; its guards passed.
- Closing PR #335's guards job failed: `§41 criteria=6 covered=4 MISSING: AC-41.3 AC-41.4`.
- Fixed by the title-only PR #338 (merged).

The card leaves the way open with a proposed answer: (a) also check a ✗ section that already has an `AC-§.n` test, plus (d) flag any title that starts with `AC-n.m` without the colon; alternatives are a card-branch rule (b) or a `--section` mode the reviewer and dev-lead run (c). #338 has merged, so the card's PR will not trip on §41.

Files:

- `backlog/plan/E1-todos.md`: card B1.102 (quick, no dependency).
- `backlog/README.md`: totals (E1 64/1/35/100, total 96/1/39/136), node S136, Remaining row 136.
- `backlog/work/B1.102/filing-pr-body.md`: this body.

`scripts/ci/check-backlog.sh` → OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
