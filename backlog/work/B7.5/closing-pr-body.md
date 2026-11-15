Closing lane (`backlog/CLAUDE.md` "Closing a card") for B7.5: the new-todo counter warns near the limit (section 39).
Feature PR #323 merged as 139c960. The agent runner opened the PR and made it ready on issue #309 (D-27). The lead
asked for this closing lane in the session. The checklist is the plan, so there is no `Plan approved by` line. One of
E7 batch 2's three closings (B7.4, B7.5, B7.6), opened together; each touches only its own lines.

Files:

- `backlog/plan/E7-todos-hints.md`: B7.5 `**Status: Done** — 139c960 (#323)`:
  - 7 AC-39.n criteria green, red proven by `verify-red.sh` (eaa2ae9); unit 298 → 304; e2e 70 → 71 (AC-39.7);
  - mutation 92.91 (CI; `src/lib/title-count.ts` 100);
  - unattended and no-rework 1/1 (D-29), one runner run and one `run.sh --sync` merge (below).
- `backlog/README.md`: Remaining row 126 removed; `~~B7.5~~` in node 126. No other Remaining row was blocked by
  B7.5. Totals: E7 4/0/2, total 90/2/40 of 132.
- `spec/technical-requirements.md`: §39 index row ✗ → ✅.
- `docs/metrics.md`: B7.5 Mutation cell → 92.91 (title-count.ts 100) (the CI Stryker run on 8204a1d), Green cell
  from the feat commit c7ec922 to the merged sha 139c960.
- `backlog/work/B7.5/closing-pr-body.md`: this body (Closing step 6).

`spec/features-map.md` F37 is already ✅ from the card's own `docs(map)` commit (b1ced0e); not edited here (B1.91).

D-29 for issue #309:

- `scripts/metrics/unattended.sh 309` → `unattended 1/1 = 100.0 % (pending 0)`.
- `scripts/metrics/no-rework.sh 323` → `no-rework 1/1 = 100.0 % (pending 0)`; the sync merge carries
  `Agent-Run: sync`, so it counts as the runner's (B1.101's stated cost).
- After B7.4 (#322) merged, GitHub showed #323 `DIRTY/CONFLICTING` though a local `git merge-tree` was clean (GitHub
  ignores `merge=union`). `scripts/agent/run.sh --sync 309` merged `origin/main` as 8204a1d (6abffbf..8204a1d) in 9 s;
  `git show --remerge-diff 8204a1d` is empty. CI on 8204a1d was green 282 s after the sync started.

Diff review: 1 pass (`work/B7.5/review.md`), verdict ready for PR, 1 non-blocking finding left out of scope: REQ-39.3's
"before the §5 error" is pinned by no test (moving the warning below the error keeps every form test green); closing
it is a §39 AC-39.4 wording change for the lead, not code. Riskiest unfalsified: no test reads the server HTML before
hydration (REQ-39.2). Plan review: 2 rounds (changes requested, then approved).

`check-backlog.sh`, `check-spec-sections.sh`, `check-features-map.sh` OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
