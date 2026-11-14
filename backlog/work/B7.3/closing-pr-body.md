Closing lane (`backlog/CLAUDE.md` "Closing a card") for B7.3: the due-date editor has a "Today" button (section 37).
Feature PR #301 merged as 14defd1. The agent runner opened the PR and made it ready on issue #294 (D-27). The lead asked
for this closing lane in the session. The checklist is the plan, so there is no `Plan approved by` line. First of
E7 batch 1's three closings (B7.3, B7.1, B7.2).

Files:

- `backlog/plan/E7-todos-hints.md`: B7.3 `**Status: Done** — 14defd1 (#301)`:
  - 6 AC-37.n criteria green: unit 280 → 291 (AC-37.1–37.5 run as 11 `it.each` cases, red proven by
    `verify-red.sh`); e2e 64 → 65 (AC-37.6);
  - mutation 93.22 (lib and actions unchanged);
  - unattended and no-rework 1/1 (D-29), one runner run.
- `backlog/README.md`:
  - Remaining row 124 removed; `~~B7.3~~` in node 124.
  - B7.6's "Blocked by" now `~~D-37~~, ~~B7.3~~`.
  - Totals updated: E7 1/0/5, total 85/1/41 of 127.
- `spec/technical-requirements.md`: §37 index row ✗ → ✅.
- `docs/metrics.md`: B7.3 Green column from the feat commit df8e436 to the merged sha 14defd1, as the E5 and E6
  closings did.
- `backlog/work/B7.3/closing-pr-body.md`: this body (Closing step 6).

`spec/features-map.md` F35 is already ✅ from the card's own `docs(map)` commit (672d9f8, right after `feat` df8e436,
B1.85); not edited here (B1.91).

D-29 for issue #294:

- `scripts/metrics/unattended.sh 294` → `unattended 1/1 = 100.0 %` (0 messages).
- `scripts/metrics/no-rework.sh 301` → `no-rework 1/1 = 100.0 %` (0 change requests).

Diff review: 1 round, 0 findings (`work/B7.3/review.md`). Riskiest unfalsified, carried from the feature PR: REQ-37.3
("Today" does not change the row's message) has no criterion; guarding it needs a new AC under a D-n.

`check-backlog.sh`, `check-spec-sections.sh`, `check-features-map.sh`, `check-ac-coverage.sh` (`§37 criteria=6
covered=6`) OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
