Closing lane (`backlog/CLAUDE.md` "Closing a card") for B9.2: opening the due-date editor puts focus in the date field
(section 45). Feature PR #344 merged as 93e8ed1. The agent runner opened the PR and made it ready on issue #340 (D-27).
The lead asked for this closing lane in the session. The checklist is the plan, so there is no `Plan approved by` line.
One of E9's three closings (B9.1, B9.2, B9.3), opened one after another; each touches only its own lines.

Files:

- `backlog/plan/E9-todos-focus.md`: B9.2 `**Status: Done** — 93e8ed1 (#344)`:
  - 7 AC-45.n criteria green: AC-45.4 pinned green first (0a93ba1), the rest red proven by `verify-red.sh`
    (f42f37d); unit 338 → 346; e2e 82 → 83 (AC-45.7);
  - mutation n/a: no `src/lib` or `src/actions` change, so the run skipped local mutation (B1.100);
  - unattended and no-rework 1/1 (D-29), one runner run.
- `backlog/README.md`: Remaining row 134 removed; `~~B9.2~~` in node 134. No other Remaining row was blocked by
  B9.2. Totals: E9 1/0/2, total 97/1/38 of 136.
- `spec/technical-requirements.md`: §45 index row ✗ → ✅.
- `docs/metrics.md`: B9.2 Mutation cell "CI only" → 92.91 (the CI Stryker run on c9d57d0, `src/lib` and `src/actions`
  unchanged), Green cell "this feat commit" → the merged sha 93e8ed1, as the E8 closings did.
- `backlog/work/B9.2/closing-pr-body.md`: this body (Closing step 6).

`spec/features-map.md` F43 is already ✅ from the card's own `docs(map)` commit (ce17db4); not edited here (B1.91).

D-29 for issue #340:

- `scripts/metrics/unattended.sh 339 340 341` → `unattended 2/3 = 66.7 % (pending 0)`; #340 row `yes`, 0 messages,
  0 stops, no human commit.
- `scripts/metrics/no-rework.sh 346 344 343` → `no-rework 3/3 = 100.0 % (pending 0)`; #344 row `yes`.
- #344 merged second in the batch; the run merged origin/main for D-41 (50f2632), then once after #343 (c9d57d0,
  `Agent-Run: sync`).

Diff review: 1 pass (`work/B9.2/review.md`), verdict ready for PR, 0 findings. Riskiest unfalsified, carried from the
feature PR: REQ-45.5 "the field's text is not selected" has no criterion that measures it; a `select()` added after
`focus()` keeps every due-date unit test green.

`check-ac-coverage.sh` (§45 7/7), `check-backlog.sh`, `check-spec-sections.sh`, `check-features-map.sh` OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
