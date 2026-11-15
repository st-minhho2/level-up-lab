Closing lane (`backlog/CLAUDE.md` "Closing a card") for B7.6: the due-date editor has a "Clear due date" button
(section 40). Feature PR #324 merged as 1ec402e. The agent runner opened the PR and made it ready on issue #310
(D-27). The lead asked for this closing lane in the session. The checklist is the plan, so there is no
`Plan approved by` line. One of E7 batch 2's three closings (B7.4, B7.5, B7.6), opened together; each touches only its
own lines.

Files:

- `backlog/plan/E7-todos-hints.md`: B7.6 `**Status: Done** — 1ec402e (#324)`:
  - 6 AC-40.n criteria green, red proven by `verify-red.sh` (17301e0); AC-37.1 rewritten under D-38, green;
    unit 298 → 313; e2e 70 → 71;
  - mutation 92.91 (CI, `src/lib` and `src/actions` unchanged);
  - unattended and no-rework 1/1 (D-29), one runner run and two `run.sh --sync` merges (below).
- `backlog/README.md`: Remaining row 127 removed; `~~B7.6~~` in node 127. No other Remaining row was blocked by
  B7.6. Totals: E7 4/0/2, total 90/2/40 of 132.
- `spec/technical-requirements.md`: §40 index row ✗ → ✅.
- `docs/metrics.md`: B7.6 Mutation cell "CI only" → 92.91 (the CI Stryker run on ace62e5), Green cell from the feat
  commit ab98c4c to the merged sha 1ec402e.
- `backlog/work/B7.6/closing-pr-body.md`: this body (Closing step 6).

`spec/features-map.md` F38 is already ✅ from the card's own `docs(map)` commit (940c7aa); not edited here (B1.91).

D-29 for issue #310:

- `scripts/metrics/unattended.sh 310` → `unattended 1/1 = 100.0 % (pending 0)`.
- `scripts/metrics/no-rework.sh 324` → `no-rework 1/1 = 100.0 % (pending 0)`; the sync merges carry
  `Agent-Run: sync`, so they count as the runner's (B1.101's stated cost).
- After B7.4 (#322) merged, GitHub showed #324 `DIRTY/CONFLICTING` though a local merge was clean;
  `run.sh --sync 310` merged `origin/main` as c2d0a2a in 7 s, CI green 252 s after the sync started. After B7.5 (#323)
  merged, `run.sh --sync 310` merged it as ace62e5 in 8 s, CI green 272 s after #323's merge. Both
  `git show --remerge-diff` are empty.

Diff review: 1 pass (`work/B7.6/review.md`), verdict ready for PR; its one paperwork finding (the metrics row's Green
cell named no sha) was fixed in 521af57. Riskiest unfalsified, carried from the feature PR: Escape on "Clear due
date" (REQ-40.6) is covered only in jsdom with `fireEvent` keydowns (AC-40.5). Plan review: 2 rounds (changes
requested, then approved).

`check-backlog.sh`, `check-spec-sections.sh`, `check-features-map.sh` OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
