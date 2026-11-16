Closing lane (`backlog/CLAUDE.md` "Closing a card") for B8.3: "Mark all complete" is hidden when there is nothing to mark (section 43).
Feature PR #332 merged as 50d2458. The agent runner opened the PR and made it ready on issue #318 (D-27). The lead
asked for this closing lane in the session. The checklist is the plan, so there is no `Plan approved by` line. One of
E8's three closings (B8.1, B8.2, B8.3), opened one after another; each touches only its own lines.

Files:

- `backlog/plan/E8-todos-polish-two.md`: B8.3 `**Status: Done** — 50d2458 (#332)`:
  - 7 AC-43.n criteria green: red proven by `verify-red.sh` (be1e940), AC-43.2 pinned green at the base
    (b06a5be); AC-14.4 (a), AC-14.6, AC-36.3, AC-36.6, AC-36.7 rewritten under D-39; unit 323 → 327; e2e 75 → 78
    (AC-43.5–43.7);
  - mutation n/a: no `src/lib` or `src/actions` change, so the run skipped local mutation (B1.100);
  - unattended and no-rework 1/1 (D-29), one runner run.
- `backlog/README.md`: Remaining row 132 removed; `~~B8.3~~` in node 132. No other Remaining row was blocked by
  B8.3. Totals: E8 3/0/0, total 96/1/38 of 135 (after E9 filing #331 and the B8.1, B8.2 closings #335, #336).
- `spec/technical-requirements.md`: §43 index row ✗ → ✅.
- `docs/metrics.md`: B8.3 Mutation cell "CI only" → 92.91 (the CI Stryker run on 082e030, `src/lib` and `src/actions`
  unchanged), Green cell "feat(todos) B8.3" → the merged sha 50d2458, as the E7 closings did.
- `backlog/work/B8.3/closing-pr-body.md`: this body (Closing step 6).

`spec/features-map.md` F41 is already ✅ from the card's own `docs(map)` commit (ddcf943); not edited here (B1.91).

D-29 for issue #318:

- `scripts/metrics/unattended.sh 316 317 318` → `unattended 3/3 = 100.0 % (pending 0)`; #318 row `yes`, 0 messages,
  0 stops, no human commit.
- `scripts/metrics/no-rework.sh 333 330 332` → `no-rework 3/3 = 100.0 % (pending 0)`; #332 row `yes`.
- #332 merged third in the batch; the run merged origin/main twice (8e28758, 082e030, `Agent-Run:` trailer)
  after #330 and #333.

Diff review: 2 passes (`work/B8.3/review.md`), verdict ready for PR; finding 1 (AC-43.4's focus-spy window) closed
by 91140c7. Riskiest unfalsified, carried from the feature PR: the AC-43.6 alert scope
`body > :not(next-route-announcer)` has never counted a real §10 failure message in the browser.

`check-backlog.sh`, `check-spec-sections.sh`, `check-features-map.sh` OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
