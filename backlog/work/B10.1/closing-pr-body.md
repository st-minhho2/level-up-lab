Closing lane (`backlog/CLAUDE.md` "Closing a card") for B10.1: Escape in the title editor puts focus on "Edit title" (section 48).
Feature PR #360 merged as 746ce48. The agent runner opened the PR and made it ready on issue #356 (D-27).
The lead asked for these closings through the coordinating session. The checklist is the plan, so there is no
`Plan approved by` line. One of E10's three closings (B10.1, B10.2, B10.3) and E11's three (B11.1, B11.2, B11.3), with B9.4's, opened one
after another; each touches only its own lines.

Files:

- `backlog/plan/E10-todos-access.md`: B10.1 `**Status: Done** — 746ce48 (#360)`:
  - 7 AC-48.n criteria green: AC-48.1, AC-48.2, AC-48.6 red proven by `verify-red.sh` (958c6cd, base e1b0d51, 3 new
    failed); AC-48.7 e2e in the same red commit; AC-48.3–48.5 pinned green at the base (e1b0d51);
  - unit 360 → 369; e2e 88 → 89 (AC-48.7);
  - mutation n/a: no `src/lib` or `src/actions` change, so the run skipped local mutation (B1.100);
  - no-rework 1/1, unattended 1/1 (D-29).
- `backlog/README.md`: Remaining row 138 removed; `~~B10.1~~` in node 138. `~~B10.1~~` in the Blocked by of rows 141–143 (B11.1, B11.2, B11.3).
  Totals: E10 1/0/2, total 101/1/41 of 143.
- `spec/technical-requirements.md`: §48 index row ✗ → ✅.
- `docs/metrics.md`: B10.1 Mutation cell already 92.91 (CI Stryker on 4114f8b); Green cell "this feat commit" → the merged sha 746ce48, as the E8 and E9
  closings did.
- `backlog/work/B10.1/closing-pr-body.md`: this body (Closing step 6).

`spec/features-map.md` F46 is already ✅ from the card's own `docs(map)` commit (f007d3e); not edited here (B1.91).

D-29 for issue #356:

- `scripts/metrics/unattended.sh 356 357 358` → `unattended 3/3 = 100.0 % (pending 0)`.
- `scripts/metrics/no-rework.sh 360 359 361` → `no-rework 3/3 = 100.0 % (pending 0)`.
- #356 row `yes`, 0 messages, no stops, no human commit; #360 row `yes`, 0 change requests. #360 merged second in E10, after one sync with origin/main (4114f8b).

Diff review: 1 pass (`work/B10.1/review.md`), verdict ready for PR, 0 findings. Riskiest unfalsified, carried from
the feature PR: two probes (the Escape marker never cleared, or set while a save is pending) survive only because "Edit
title" is still `disabled` at a successful save's exit commit; a focus spy in AC-48.3(a) and AC-48.6 would kill both.

`check-ac-coverage.sh` (§48 7/7), `check-backlog.sh`, `check-spec-sections.sh`, `check-features-map.sh` OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
