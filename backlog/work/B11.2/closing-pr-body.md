Closing lane (`backlog/CLAUDE.md` "Closing a card") for B11.2: a failed mark-all's message describes "Mark all complete" (section 52).
Feature PR #365 merged as a230acc. The agent runner opened the PR and made it ready on issue #363 (D-27).
The lead asked for these closings through the coordinating session. The checklist is the plan, so there is no
`Plan approved by` line. One of E10's three closings (B10.1, B10.2, B10.3) and E11's three (B11.1, B11.2, B11.3), with B9.4's, opened one
after another; each touches only its own lines.

Files:

- `backlog/plan/E11-todos-access-two.md`: B11.2 `**Status: Done** — a230acc (#365)`:
  - 6 AC-52.n criteria green: AC-52.1, AC-52.3, AC-52.4 red proven by `verify-red.sh` (10fc315, base bb238ba, 3 new
    failed); AC-52.2, AC-52.5, AC-52.6 pinned green at the base (bb238ba);
  - unit 381 → 387; e2e 90 → 90;
  - mutation n/a: no `src/lib` or `src/actions` change, so the run skipped local mutation (B1.100);
  - no-rework 1/1, unattended 1/1 (D-29).
- `backlog/README.md`: Remaining row 142 removed; `~~B11.2~~` in node 142. No other Remaining row was blocked by B11.2.
  Totals: E11 1/0/2, total 100/1/42 of 143.
- `spec/technical-requirements.md`: §52 index row ✗ → ✅.
- `docs/metrics.md`: B11.2 Mutation cell "CI only" → 92.91 (the CI Stryker run on 76218ab, `src/lib` and
  `src/actions` unchanged); Green cell "this feat commit" → the merged sha a230acc, as the E8 and E9
  closings did.
- `backlog/work/B11.2/closing-pr-body.md`: this body (Closing step 6).

`spec/features-map.md` F50 is already ✅ from the card's own `docs(map)` commit (278a159); not edited here (B1.91).

D-29 for issue #363:

- `scripts/metrics/unattended.sh 362 363 364` → `unattended 3/3 = 100.0 % (pending 0)`.
- `scripts/metrics/no-rework.sh 367 365 366` → `no-rework 3/3 = 100.0 % (pending 0)`.
- #363 row `yes`, 0 messages, no stops, no human commit; #365 row `yes`, 0 change requests. #365 merged second in E11, after one sync with origin/main (76218ab).

Diff review: 1 pass (`work/B11.2/review.md`), verdict ready for PR, 0 findings. Riskiest unfalsified, carried from
the feature PR: REQ-52.1's "generated with React's `useId` (no hard-coded id)" has no test that tells the two apart; it
holds today by reading the component.

`check-ac-coverage.sh` (§52 6/6), `check-backlog.sh`, `check-spec-sections.sh`, `check-features-map.sh` OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
