Closing lane (`backlog/CLAUDE.md` "Closing a card") for B1.20 — plan rows with `[ ]` match their own path in the
plan-scope hook and guard, feature PR #132 merged as 07c62cc. The checklist is the plan; no `Plan approved by` line.

Files:

- `backlog/plan/E1-todos.md`: `**Status: Done** — 07c62cc (#132)`, hook-smoke 440 probes OK on /bin/bash 3.2
  (f83e5da: 432 ok, 8 FAIL); Work line with plan and review rounds; follow-up cards B1.32 and B1.33 appended
- `backlog/README.md`: Remaining row 20 out, B1.20 struck in Execution order, rows and nodes 43 (B1.32) and 44
  (B1.33) in; totals E1 28 / 1 / 4 of 33, total 39 / 1 / 4 of 44
- `backlog/work/B1.20/closing-pr-body.md`: this body (Closing step 6)

Follow-up cards (D-25), each an "out of scope → follow-up" finding of the B1.20 reviews (`backlog/work/B1.20/review.md`):

- B1.32 — the glob half of both comparisons over-matches (unchanged since #60): `src/app/[id]/page.tsx` allows
  `src/app/i/page.tsx`, `src/app/*/layout.tsx` allows `src/app/a/b/layout.tsx` (proved on /bin/bash 3.2).
- B1.33 — no workflow runs `scripts/hook-smoke.sh` (`grep -l hook-smoke .github/workflows/*` → none), and the
  `scripts/CLAUDE.md` hook-smoke row still names C1–C5 only.

Not filed: the B1.20 card's own "human-only" wording for `config-change-approved` predates D-19; the card is now Done
and D-19 governs.

This PR was opened with `scripts/pr-step.sh push` and `scripts/pr-step.sh open "docs(backlog): B1.20 done"`.

`check-backlog.sh` OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
