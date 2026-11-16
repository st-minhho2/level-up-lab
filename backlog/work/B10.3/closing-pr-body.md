Closing lane (`backlog/CLAUDE.md` "Closing a card") for B10.3: the search box shows "Press / to search" (section 50).
Feature PR #361 merged as 1011c58. The agent runner opened the PR and made it ready on issue #358 (D-27).
The lead asked for these closings through the coordinating session. The checklist is the plan, so there is no
`Plan approved by` line. One of E10's three closings (B10.1, B10.2, B10.3) and E11's three (B11.1, B11.2, B11.3), with B9.4's, opened one
after another; each touches only its own lines.

Files:

- `backlog/plan/E10-todos-access.md`: B10.3 `**Status: Done** — 1011c58 (#361)`:
  - 7 AC-50.n criteria green: AC-50.1, AC-50.3–50.6 red proven by `verify-red.sh` (71d2d8c, base b258594, 5 new
    failed); AC-50.7 e2e in the same red commit; AC-50.2 pinned green at the base (b258594);
  - unit 360 → 366; e2e 88 → 89 (AC-50.7);
  - mutation n/a: no `src/lib` or `src/actions` change, so the run skipped local mutation (B1.100);
  - no-rework 1/1, unattended 1/1 (D-29).
- `backlog/README.md`: Remaining row 140 removed; `~~B10.3~~` in node 140. No other Remaining row was blocked by B10.3.
  Totals: E10 1/0/2, total 100/1/42 of 143.
- `spec/technical-requirements.md`: §50 index row ✗ → ✅.
- `docs/metrics.md`: B10.3 Mutation cell "CI only" → 92.91 (the CI Stryker run on 6358d02, `src/lib` and
  `src/actions` unchanged); Green cell "this feat commit" → the merged sha 1011c58, as the E8 and E9
  closings did.
- `backlog/work/B10.3/closing-pr-body.md`: this body (Closing step 6).

`spec/features-map.md` F48 is already ✅ from the card's own `docs(map)` commit (11455b8); not edited here (B1.91).

D-29 for issue #358:

- `scripts/metrics/unattended.sh 356 357 358` → `unattended 3/3 = 100.0 % (pending 0)`.
- `scripts/metrics/no-rework.sh 360 359 361` → `no-rework 3/3 = 100.0 % (pending 0)`.
- #358 row `yes`, 0 messages, no stops, no human commit; #361 row `yes`, 0 change requests. #361 merged third in E10, after two syncs with origin/main (84bf535, 6358d02).

Diff review: 1 pass (`work/B10.3/review.md`), verdict ready for PR, 0 findings. Riskiest unfalsified, carried from the
feature PR: AC-50.7 (e2e) was never observed red against the pre-feat tree beyond its first assertion. Still open for
the lead, carried from the feature PR: `spec/contracts/23-search-shortcut.md:26` says the `/` hint is not shown, which
contradicts REQ-50.1; the advisor ruled §50 governs, and the fix is a lead `docs(spec)` change.

`check-ac-coverage.sh` (§50 7/7), `check-backlog.sh`, `check-spec-sections.sh`, `check-features-map.sh` OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
