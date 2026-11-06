Files card **B1.86** through the "Filing a card" lane (`backlog/CLAUDE.md`). The checklist is the plan, so there is no `Plan approved by` line. The lead chose this card in the B5.6 closing session over closing B5.6 as Partial or reshaping the test.

- **B1.86**: `scripts/ci/check-ac-coverage.sh` reads test titles line by line, so AC-28.6's only test, a multi-line `it.each<…>([ … ])(` whose title sits on the next line (`src/components/todo-due-date.test.tsx:267–272`), is not counted. The feature PR #235 passed because §28 was still ✗; B5.6's closing PR #237 flips §28 to ✅ and its `guards` job fails with `MISSING: AC-28.6`. #237 waits for this card.

The card is numbered B1.86 and row 102 because the filing PR #236 took B1.84, B1.85 and rows 100, 101; this branch merged `origin/main` after #236 and recounted the totals.

Files:

- `backlog/plan/E1-todos.md`: card B1.86 (quick, no dependency).
- `backlog/README.md`: totals (E1 51/0/33/84, total 67/0/35/102), node S102, Remaining row 102.
- `backlog/work/B1.86/filing-pr-body.md`: this body.

`scripts/ci/check-backlog.sh` → OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
