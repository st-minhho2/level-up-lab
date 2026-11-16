Closing lane (`backlog/CLAUDE.md` "Closing a card") for B9.4: a focus move during a pending add is kept (section 47).
Feature PR #354 merged as 40cd956. The agent runner opened the PR and made it ready on issue #353 (D-27).
The lead asked for these closings through the coordinating session. The checklist is the plan, so there is no
`Plan approved by` line. Repairs B9.1: defect D1 of the first D-43 sweep, counted in E9's change failure rate (D-44). Not part of a D-29 batch;
opened alongside the E10 and E11 closings, one after another; each touches only its own lines.

Files:

- `backlog/plan/E9-todos-focus.md`: B9.4 `**Status: Done** — 40cd956 (#354)`:
  - 6 AC-47.n criteria green: AC-47.1, AC-47.2, AC-47.4 red proven by `verify-red.sh` (5c7dade, base 5a9123b, 3 new
    failed); AC-47.5, AC-47.6 e2e in the same red commit; AC-47.3 pinned green at the base (5a9123b);
  - unit 356 → 360; e2e 86 → 88 (AC-47.5, AC-47.6);
  - mutation n/a: no `src/lib` or `src/actions` change, so the run skipped local mutation (B1.100);
  - no-rework 1/1, unattended 1/1 (D-29).
- `backlog/README.md`: Remaining row 137 removed; `~~B9.4~~` in node 137. No other Remaining row was blocked by B9.4.
  Totals: E9 4/0/0, total 100/1/42 of 143.
- `spec/technical-requirements.md`: §47 index row ✗ → ✅.
- `docs/metrics.md`: B9.4 Mutation cell already 92.91 (CI Stryker on 93f0c89); Green cell "this feat commit" → the merged sha 40cd956, as the E8 and E9
  closings did.
- `backlog/work/B9.4/closing-pr-body.md`: this body (Closing step 6).

`spec/features-map.md` F45 is already ✅ from the card's own `docs(map)` commit (9c2f403); not edited here (B1.91).

D-29 for issue #353:

- `scripts/metrics/unattended.sh 353` → `unattended 1/1 = 100.0 % (pending 0)`.
- `scripts/metrics/no-rework.sh 354` → `no-rework 1/1 = 100.0 % (pending 0)`.
- #353 row `yes`, 0 messages, no stops, no human commit; #354 row `yes`, 0 change requests. #354 merged once origin/main (101b323) before the lead merged it.

Diff review: 1 pass (`work/B9.4/review.md`), verdict ready for PR, 0 findings. Riskiest unfalsified, carried from the
feature PR: AC-47.3(c) reaches `document.body` in jsdom only through a `document.activeElement` getter spy; in a real
browser the body branch is covered indirectly by AC-44.6 and AC-47.5.

`check-ac-coverage.sh` (§47 6/6), `check-backlog.sh`, `check-spec-sections.sh`, `check-features-map.sh` OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
