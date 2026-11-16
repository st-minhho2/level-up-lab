Closing lane (`backlog/CLAUDE.md` "Closing a card") for B10.2: a failed clear's message describes "Clear completed" (section 49).
Feature PR #359 merged as 40710a4. The agent runner opened the PR and made it ready on issue #357 (D-27).
The lead asked for these closings through the coordinating session. The checklist is the plan, so there is no
`Plan approved by` line. One of E10's three closings (B10.1, B10.2, B10.3) and E11's three (B11.1, B11.2, B11.3), with B9.4's, opened one
after another; each touches only its own lines.

Files:

- `backlog/plan/E10-todos-access.md`: B10.2 `**Status: Done** — 40710a4 (#359)`:
  - 6 AC-49.n criteria green: AC-49.1, AC-49.3, AC-49.4, AC-49.6 red proven by `verify-red.sh` (4153c19, base 3e05a63,
    4 new failed); AC-49.2, AC-49.5 pinned green at the base (3e05a63);
  - unit 360 → 366; e2e 88 → 88;
  - mutation n/a: no `src/lib` or `src/actions` change, so the run skipped local mutation (B1.100);
  - no-rework 1/1, unattended 1/1 (D-29).
- `backlog/README.md`: Remaining row 139 removed; `~~B10.2~~` in node 139. No other Remaining row was blocked by B10.2.
  Totals: E10 2/0/1, total 102/1/40 of 143.
- `spec/technical-requirements.md`: §49 index row ✗ → ✅.
- `docs/metrics.md`: B10.2 Mutation cell "CI only" → 92.91 (the CI Stryker run on fc6e955, `src/lib` and
  `src/actions` unchanged); Green cell "this feat commit" → the merged sha 40710a4, as the E8 and E9
  closings did.
- `backlog/work/B10.2/closing-pr-body.md`: this body (Closing step 6).

`spec/features-map.md` F47 is already ✅ from the card's own `docs(map)` commit (1780b7e); not edited here (B1.91).

D-29 for issue #357:

- `scripts/metrics/unattended.sh 356 357 358` → `unattended 3/3 = 100.0 % (pending 0)`.
- `scripts/metrics/no-rework.sh 360 359 361` → `no-rework 3/3 = 100.0 % (pending 0)`.
- #357 row `yes`, 0 messages, no stops, no human commit; #359 row `yes`, 0 change requests. #359 merged first in E10, with no sync.

Diff review: 1 pass (`work/B10.2/review.md`), verdict ready for PR, 2 findings (coverage gaps in the §49 criteria, not
code defects). Riskiest unfalsified, carried from the feature PR: REQ-49.3's "same commit" removal of the alert and the
attribute; both derive from the one `error` state, but no test reads a frame between them.

`check-ac-coverage.sh` (§49 6/6), `check-backlog.sh`, `check-spec-sections.sh`, `check-features-map.sh` OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
