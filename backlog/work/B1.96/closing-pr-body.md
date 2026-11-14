Closing lane (`backlog/CLAUDE.md` "Closing a card") for B1.96: parallel card PRs conflicted on the section index,
which B1.89 had left on git's default merge. Feature PR #273 merged as 6395eac. The lead asked for this closing lane in
the session. The checklist is the plan, so there is no `Plan approved by` line.

Files:

- `backlog/plan/E1-todos.md`: B1.96 `**Status: Done** — 6395eac (#273)`. The status lists:
  - `table-merge-smoke` T1–T12: red 1b82a46 "4 of 12 FAILED", green 073668a "12 probes OK" (bash 3.2);
  - hook-smoke 726, tier-smoke 9, vitest 269, e2e 57, mutation 92.63 (no `src/` change);
  - B1.92's card amendment (6948df1);
  - GitHub mergeability `[unverified]`;
  - plan review 3 rounds, diff review 1 pass.

  The status line's old evidence paragraph is replaced. The batch 1 bullets under it stay as the card's history.

- `backlog/README.md`:
  - Remaining row 118 removed; `~~B1.96~~` in node 118. No other row was blocked by B1.96.
  - Totals updated: E1 59/0/35 of 94, total 79/0/39 of 118.
- `backlog/work/B1.96/closing-pr-body.md`: this body (Closing step 6).

There is no `spec/` change: B1.96 is tooling, with no section and no map row. There is no `docs/metrics.md` per-card
row either, as for B1.82, B1.88 and B1.89.

Still to measure: E6 batch 2 (B6.4–B6.6) is the first run where three cards append index rows in parallel under
`merge=union`. It will show:

- whether each Loop 9 merge of the index is clean;
- whether GitHub shows a BEHIND runner PR as conflicting, which is still `[unverified]`.

A duplicate row from an edit against an append still surfaces only in CI until B1.92 lands.

All `scripts/ci/check-*.sh` OK, except `check-config-change.sh`, which needs the PR label and does not apply here: no
protected path changes.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
