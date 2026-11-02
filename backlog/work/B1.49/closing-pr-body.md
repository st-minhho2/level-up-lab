Closing lane (`backlog/CLAUDE.md` "Closing a card") for B1.49 — Live check of the eligibility rule on a labeled issue,
feature PR #168 merged as 9b16008. The checklist is the plan; no `Plan approved by` line. Per D-25 this PR also files
one follow-up from the live check (filing lane, `backlog/CLAUDE.md` "Filing a card"); the other one, B1.63 (rename
fails open), was filed during the card (#172).

Files:

- `backlog/plan/E1-todos.md`: B1.49 `**Status: Done** — 9b16008 (#168)` with the live results; Work line with rounds and
  follow-ups; new card
  - B1.64 (quick): `eligible.sh` refuses a closed issue with or without `<card>` (live step 9a: a closed issue still
    labeled exits 0; `run.sh <issue>` would run it; B1.55's plan checks the state only with `<card>`)
- `backlog/README.md`: Remaining row 61 out, row 75 in; node 61 struck through, node 75; totals E1 39 / 0 / 24 of 63,
  total 50 / 0 / 25 of 75
- `backlog/work/B1.49/closing-pr-body.md`: this body (Closing step 6)

No `spec/features-map.md` or `spec/technical-requirements.md` change: B1.49 has no section. Id B1.62 stays with
B1.58's follow-up.

`check-backlog.sh` OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
