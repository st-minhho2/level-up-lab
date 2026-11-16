Closing lane (`backlog/CLAUDE.md` "Closing a card") for B8.2: the filter nav hides a link whose count is 0, except the current filter (section 42).
Feature PR #330 merged as d14be53. The agent runner opened the PR and made it ready on issue #317 (D-27). The lead
asked for this closing lane in the session. The checklist is the plan, so there is no `Plan approved by` line. One of
E8's three closings (B8.1, B8.2, B8.3), opened one after another; each touches only its own lines.

Files:

- `backlog/plan/E8-todos-polish-two.md`: B8.2 `**Status: Done** — d14be53 (#330)`:
  - 7 AC-42.n criteria green: AC-42.2 pinned green first (0fad3d5), the rest red proven by `verify-red.sh`
    (84979d2); AC-12.7, AC-30.3, AC-30.6, AC-30.7 rewritten under D-39 in the red commit; unit 323 → 327; e2e
    75 → 78 (AC-42.5–42.7);
  - mutation n/a: no `src/lib` or `src/actions` change, so the run skipped local mutation (B1.100);
  - unattended and no-rework 1/1 (D-29), one runner run.
- `backlog/README.md`: Remaining row 131 removed; `~~B8.2~~` in node 131. No other Remaining row was blocked by
  B8.2. Totals: E8 1/0/2, total 94/1/37 of 132.
- `spec/technical-requirements.md`: §42 index row ✗ → ✅.
- `docs/metrics.md`: B8.2 Mutation cell "CI only" → 92.91 (the CI Stryker run on 5479efe, `src/lib` and `src/actions`
  unchanged), Green cell "this feat commit" → the merged sha d14be53, as the E7 closings did.
- `backlog/work/B8.2/closing-pr-body.md`: this body (Closing step 6).

`spec/features-map.md` F40 is already ✅ from the card's own `docs(map)` commit (abd617e); not edited here (B1.91).

D-29 for issue #317:

- `scripts/metrics/unattended.sh 316 317 318` → `unattended 3/3 = 100.0 % (pending 0)`; #317 row `yes`, 0 messages,
  0 stops, no human commit.
- `scripts/metrics/no-rework.sh 333 330 332` → `no-rework 3/3 = 100.0 % (pending 0)`; #330 row `yes`.
- #330 was the batch's first merge, so it needed no origin/main merge.

Diff review: 1 pass (`work/B8.2/review.md`), verdict ready for PR. Riskiest unfalsified, carried from the feature PR:
the e2e red of AC-42.5–42.7, AC-12.7, AC-30.6, AC-30.7 on pre-feat code is claimed in the red commit body only;
`verify-red.sh` skips e2e.

`check-backlog.sh`, `check-spec-sections.sh`, `check-features-map.sh` OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
