Closing lane (`backlog/CLAUDE.md` "Closing a card") for B8.1: opening the title editor selects the whole title (section 41).
Feature PR #333 merged as 47608b3. The agent runner opened the PR and made it ready on issue #316 (D-27). The lead
asked for this closing lane in the session. The checklist is the plan, so there is no `Plan approved by` line. One of
E8's three closings (B8.1, B8.2, B8.3), opened one after another; each touches only its own lines.

Files:

- `backlog/plan/E8-todos-polish-two.md`: B8.1 `**Status: Done** — 47608b3 (#333)`:
  - 6 AC-41.n criteria green: AC-41.4 pinned green first (2dad5fd), the rest red proven by `verify-red.sh`
    (87f33ae); unit 323 → 330; e2e 75 → 76 (AC-41.6);
  - mutation n/a: no `src/lib` or `src/actions` change, so the run skipped local mutation (B1.100);
  - unattended and no-rework 1/1 (D-29), one runner run.
- `backlog/README.md`: Remaining row 130 removed; `~~B8.1~~` in node 130. No other Remaining row was blocked by
  B8.1. Totals: E8 1/0/2, total 94/1/40 of 135 (after E9 filing, #331).
- `spec/technical-requirements.md`: §41 index row ✗ → ✅.
- `docs/metrics.md`: B8.1 Mutation cell "CI only" → 92.91 (the CI Stryker run on f592c28, `src/lib` and `src/actions`
  unchanged), Green cell from the feat commit d57a711 → the merged sha 47608b3, as the E7 closings did.
- `backlog/work/B8.1/closing-pr-body.md`: this body (Closing step 6).

`spec/features-map.md` F39 is already ✅ from the card's own `docs(map)` commit (3c479bd); not edited here (B1.91).

D-29 for issue #316:

- `scripts/metrics/unattended.sh 316 317 318` → `unattended 3/3 = 100.0 % (pending 0)`; #316 row `yes`, 0 messages,
  0 stops, no human commit.
- `scripts/metrics/no-rework.sh 333 330 332` → `no-rework 3/3 = 100.0 % (pending 0)`; #333 row `yes`.
- #333 merged second in the batch; the run merged origin/main once (f592c28, `Agent-Run:` trailer) after #330.

Diff review: 1 pass (`work/B8.1/review.md`), verdict ready for PR. Riskiest unfalsified, carried from the feature PR:
e2e AC-41.6 reads focus and selection once right after `toBeVisible()`, chromium only; Firefox and WebKit `select()`
are not exercised.

`check-backlog.sh`, `check-spec-sections.sh`, `check-features-map.sh` OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
