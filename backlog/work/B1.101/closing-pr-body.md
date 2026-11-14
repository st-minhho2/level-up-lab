Closing lane (`backlog/CLAUDE.md` "Closing a card", step 4: merged but not measured) for B1.101 — a ready runner PR
is brought level with `main` by `scripts/agent/run.sh --sync <issue>`; feature PR #315 merged as 872fe7b. The
checklist is the plan; no `Plan approved by` line.

Pending, so the card stays Partial and its Remaining row stays:

- the `--sync` mention in `scripts/CLAUDE.md`'s `agent/run.sh` row (not in #315's plan: B1.98 held that file; the
  next card whose approved plan touches it carries the row, plan review r1 #1);
- the time from a sibling's merge to the next runner PR being mergeable on GitHub, which E7 batch 2 measures (the
  first real `--sync` on GitHub).

Files:

- `backlog/plan/E1-todos.md`: B1.101 `**Status: Partial** — merged 872fe7b (#315)` with run-smoke R21–R22 (red
  e21f041: 2 of 22 FAILED; green 803ef8c + review pass 1 1dae919: 22 probes OK, bash 3.2), hook-smoke 749, vitest 298,
  e2e 70, mutation 92.84 (no `src/`), plan review 2 rounds (round 3 approved by the lead), diff review 2 passes, and
  the two pending items
- `backlog/README.md`: Remaining row 129 (B1.101) Open → Partial; totals E1 63/1/35 of 99, total 89/1/42 of 132 (the
  Remaining table re-padded by Prettier after the wider status)
- `backlog/work/B1.101/closing-pr-body.md`: this body (Closing step 6)

No `spec/features-map.md` or `spec/technical-requirements.md` change: no section. No other row names B1.101 in Blocked
by.

`check-backlog.sh` OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
