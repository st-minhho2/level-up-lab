Closing lane (`backlog/CLAUDE.md` "Closing a card") for B7.4: the search form says how many todos match (section 38).
Feature PR #322 merged as 4e5a72d. The agent runner opened the PR and made it ready on issue #308 (D-27). The lead
asked for this closing lane in the session. The checklist is the plan, so there is no `Plan approved by` line. One of
E7 batch 2's three closings (B7.4, B7.5, B7.6), opened together; each touches only its own lines.

Files:

- `backlog/plan/E7-todos-hints.md`: B7.4 `**Status: Done** — 4e5a72d (#322)`:
  - 7 AC-38.n criteria green: AC-38.3, AC-38.4, AC-38.7 pinned green first (7488f47), the rest red proven by
    `verify-red.sh` (8a8376e); unit 298 → 302; e2e 70 → 73 (AC-38.5–38.7);
  - mutation 92.84 (CI, `src/lib` and `src/actions` unchanged);
  - unattended and no-rework 1/1 (D-29), one runner run.
- `backlog/README.md`: Remaining row 125 removed; `~~B7.4~~` in node 125. No other Remaining row was blocked by
  B7.4. Totals: E7 4/0/2, total 90/2/40 of 132.
- `spec/technical-requirements.md`: §38 index row ✗ → ✅.
- `docs/metrics.md`: B7.4 Mutation cell "CI only" → 92.84 (the CI Stryker run on d717beb), Green cell from the feat
  commit 171c703 to the merged sha 4e5a72d, as the batch 1 closings did.
- `backlog/work/B7.4/closing-pr-body.md`: this body (Closing step 6).

`spec/features-map.md` F36 is already ✅ from the card's own `docs(map)` commit (0b1d65b); not edited here (B1.91).

D-29 for issue #308:

- `scripts/metrics/unattended.sh 308` → `unattended 1/1 = 100.0 % (pending 0)`.
- `scripts/metrics/no-rework.sh 322` → `no-rework 1/1 = 100.0 % (pending 0)`.
- #322 was the batch's first merge, so it needed no `run.sh --sync`.

Diff review: 1 pass (`work/B7.4/review.md`), verdict ready for PR, 0 findings. Riskiest unfalsified, carried from the
feature PR: e2e AC-38.5 finds the count text anywhere on the page; only unit AC-38.1 pins it as the search form's last
child.

`check-backlog.sh`, `check-spec-sections.sh`, `check-features-map.sh` OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
