Closing lane (`backlog/CLAUDE.md` "Closing a card") for B1.31 — root and src guides cite the sections their packages
implement, feature PR #137 merged as ae9dcf6. The checklist is the plan; no `Plan approved by` line. Per D-25 this PR
also files the diff review's two out-of-scope follow-ups (filing lane, `backlog/CLAUDE.md` "Filing a card").

Files:

- `backlog/plan/E1-todos.md`: B1.31 `**Status: Done** — ae9dcf6 (#137)`, card Test no match (red at a733c7b: 2
  matches); Work line with plan and review rounds; new cards
  - B1.34: package guide headings (`src/lib/CLAUDE.md:1` `(§3–§22)`, `src/components/CLAUDE.md:1`, `src/app/CLAUDE.md:1`),
    the `page.tsx` header (§9 only at line 36) and the Map row `src/components/` ("client components") disagree with
    the modules; Test grep → 4 matches today
  - B1.35: no gate catches a stale Spec § cell on the `app/`, `actions/`, `components/` rows (probe: `CLAUDE.md`
    `src/components/` set to `§7` passes every check); Test `scripts/ci/check-guide-sections.sh` → no such script
- `backlog/README.md`: Remaining row 42 out, rows 45 B1.34 and 46 B1.35 in; B1.31 struck and nodes 45, 46 added in
  Execution order; totals E1 29 / 1 / 5 of 35, total 40 / 1 / 5 of 46
- `backlog/work/B1.31/closing-pr-body.md`: this body (Closing step 6)

No `spec/features-map.md` or `spec/technical-requirements.md` change: B1.31 has no section. Opened with
`scripts/pr-step.sh push` and `scripts/pr-step.sh open "docs(backlog): B1.31 done"`.

`check-backlog.sh` OK; `check-spec-sections.sh` OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
