Closing lane (`backlog/CLAUDE.md` "Closing a card") for B11.3: a failed delete's message describes "Delete todo" (section 53).
Feature PR #366 merged as a0b1e00. The agent runner opened the PR and made it ready on issue #364 (D-27).
The lead asked for these closings through the coordinating session. The checklist is the plan, so there is no
`Plan approved by` line. One of E10's three closings (B10.1, B10.2, B10.3) and E11's three (B11.1, B11.2, B11.3), with B9.4's, opened one
after another; each touches only its own lines.

Files:

- `backlog/plan/E11-todos-access-two.md`: B11.3 `**Status: Done** — a0b1e00 (#366)`:
  - 6 AC-53.n criteria green: AC-53.1–53.6 red proven by `verify-red.sh` (b8ad386, base c81df92, 6 new failed);
  - unit 381 → 387; e2e 90 → 90;
  - mutation n/a: no `src/lib` or `src/actions` change, so the run skipped local mutation (B1.100);
  - no-rework 1/1, unattended 1/1 (D-29).
- `backlog/README.md`: Remaining row 143 removed; `~~B11.3~~` in node 143. No other Remaining row was blocked by B11.3.
  Totals: E11 1/0/2, total 100/1/42 of 143.
- `spec/technical-requirements.md`: §53 index row ✗ → ✅.
- `docs/metrics.md`: B11.3 Mutation cell "CI only" → 92.91 (the CI Stryker run on f65437b, `src/lib` and
  `src/actions` unchanged); Green cell "this feat commit" → the merged sha a0b1e00, as the E8 and E9
  closings did.
- `backlog/work/B11.3/closing-pr-body.md`: this body (Closing step 6).

`spec/features-map.md` F51 is already ✅ from the card's own `docs(map)` commit (48bb0ad); not edited here (B1.91).

D-29 for issue #364:

- `scripts/metrics/unattended.sh 362 363 364` → `unattended 3/3 = 100.0 % (pending 0)`.
- `scripts/metrics/no-rework.sh 367 365 366` → `no-rework 3/3 = 100.0 % (pending 0)`.
- #364 row `yes`, 0 messages, no stops, no human commit; #366 row `yes`, 0 change requests. #366 merged third in E11, after one sync with origin/main (f65437b).

Diff review: 1 pass (`work/B11.3/review.md`), verdict ready for PR, 0 findings. Riskiest unfalsified, carried from
the feature PR: REQ-53.2's "independent of the todo's id" is checked only against the four named §10/§15 ids and the
other button's id; the shipped `useId()` meets it, and closing the gap needs a §53 criterion change (§8).

`check-ac-coverage.sh` (§53 6/6), `check-backlog.sh`, `check-spec-sections.sh`, `check-features-map.sh` OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
