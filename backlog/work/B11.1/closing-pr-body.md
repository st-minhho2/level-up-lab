Closing lane (`backlog/CLAUDE.md` "Closing a card") for B11.1: Escape in the due-date editor puts focus on "Edit due date" (section 51).
Feature PR #367 merged as d1d9598. The agent runner opened the PR and made it ready on issue #362 (D-27).
The lead asked for these closings through the coordinating session. The checklist is the plan, so there is no
`Plan approved by` line. One of E10's three closings (B10.1, B10.2, B10.3) and E11's three (B11.1, B11.2, B11.3), with B9.4's, opened one
after another; each touches only its own lines.

Files:

- `backlog/plan/E11-todos-access-two.md`: B11.1 `**Status: Done** — d1d9598 (#367)`:
  - 7 AC-51.n criteria green: AC-51.1, AC-51.2, AC-51.6 red proven by `verify-red.sh` (d053c8b, base 218f7b0, 6 new
    failed); the same commit moves AC-45.3, AC-45.5 to §45 as #355 rewrote it; AC-51.7 e2e in that red commit;
    AC-51.3–51.5 pinned green at the base (218f7b0); review pass 1 added two rows (afe12a2);
  - unit 381 → 391; e2e 90 → 91 (AC-51.7);
  - mutation n/a: no `src/lib` or `src/actions` change, so the run skipped local mutation (B1.100);
  - no-rework 1/1, unattended 1/1 (D-29).
- `backlog/README.md`: Remaining row 141 removed; `~~B11.1~~` in node 141. No other Remaining row was blocked by B11.1.
  Totals: E11 1/0/2, total 100/1/42 of 143.
- `spec/technical-requirements.md`: §51 index row ✗ → ✅.
- `docs/metrics.md`: B11.1 Mutation cell "CI only" → 92.91 (the CI Stryker run on 99c8c34, `src/lib` and
  `src/actions` unchanged); Green cell the feat commit 28d7d05 → the merged sha d1d9598, as the E8 and E9
  closings did.
- `backlog/work/B11.1/closing-pr-body.md`: this body (Closing step 6).

`spec/features-map.md` F49 is already ✅ from the card's own `docs(map)` commit (025490c); not edited here (B1.91).

D-29 for issue #362:

- `scripts/metrics/unattended.sh 362 363 364` → `unattended 3/3 = 100.0 % (pending 0)`.
- `scripts/metrics/no-rework.sh 367 365 366` → `no-rework 3/3 = 100.0 % (pending 0)`.
- #362 row `yes`, 0 messages, no stops, no human commit; #367 row `yes`, 0 change requests. #367 merged first in E11, with no sync.

Diff review: 2 passes (`work/B11.1/review.md`), verdict ready for PR at pass 2; pass 1's finding (a save after an
earlier Escape moving focus, untested) fixed in afe12a2. Riskiest unfalsified, carried from the feature PR: AC-51.7
relies on Playwright's Enter on the focused "Edit due date" reaching React's click handler in dev mode; passed in two
full runs, not run with `--repeat-each`.

`check-ac-coverage.sh` (§51 7/7), `check-backlog.sh`, `check-spec-sections.sh`, `check-features-map.sh` OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
