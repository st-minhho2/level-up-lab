Closing lane (`backlog/CLAUDE.md` "Closing a card", step 4: merged but not measured) for B1.85 — card plans gave the
`docs(map)` step to dev-lead, whose hook refuses `spec/features-map.md`; feature PR #252 merged as 0781145. The
checklist is the plan; no `Plan approved by` line.

Pending: the next headless card run (first E6 batch) shows no path-guard refusal on `spec/features-map.md` and a
`docs(map)` commit authored by code-writer, its own commit after `feat`. It cannot be checked before E6, so the card
stays Partial and its row stays.

Files:

- `backlog/plan/E1-todos.md`: B1.85 `**Status: Partial** — merged 0781145 (#252), pending …` with the evidence
  (`git grep` T1–T6: base 2f1ff88 red, T1 2 lines without code-writer, T2 0, T3 0, T4 4; after, T1 4/4 and T2 2/2
  name code-writer, T3 4, T4 0, T5 0, T6 0), hook-smoke 726, vitest 241, e2e 52, mutation 92.62 (no `src/`), plan
  review 2 rounds, diff review 2 passes
- `backlog/README.md`: row 101 status Open → Partial (the row stays); totals E1 56/1/30, total 73/1/31 of 105
- `backlog/work/B1.85/closing-pr-body.md`: this body (Closing step 6)

No `spec/features-map.md` or `spec/technical-requirements.md` change: B1.85 has no section. No other row names B1.85
in Blocked by. The mistake-log "Prevented by" for the 2026-11-06 row landed in #252.

`check-backlog.sh` OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
