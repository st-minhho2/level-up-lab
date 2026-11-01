Closing lane (`backlog/CLAUDE.md` "Closing a card") for B1.29 — verify-red tells new tests from old ones by running the
base, feature PR #131 merged as 263b09a. The checklist is the plan; no `Plan approved by` line.

Files:

- `backlog/plan/E1-todos.md`: `**Status: Done** — 263b09a (#131)`, verify-red-smoke 14 of 14 on bash 5 and /bin/bash
  3.2 (1ae8fbb: 8 ok, 6 FAIL), the 22 historical red commits unchanged; Work line with plan and review rounds
- `backlog/README.md`: Remaining row 40 out, B1.29 struck in Execution order, totals E1 27 / 1 / 3, total 38 / 1 / 3
  of 42
- `backlog/work/B1.29/closing-pr-body.md`: this body (Closing step 6)

Follow-up cards (D-25): none. The one diff-review finding (the header comment of step 6) was the card's own text and
was fixed in #131; the reviewer's costs (a renamed `describe` in a red commit, a base file that no longer loads with
today's `node_modules`) fail closed and are stated in `backlog/work/B1.29/plan.md` and `review.md`.

This PR was opened with `scripts/pr-step.sh push` and `scripts/pr-step.sh open "docs(backlog): B1.29 done"`.

`check-backlog.sh` OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
