Closing lane (`backlog/CLAUDE.md` "Closing a card") for B7.2: the "Mark all complete" button says how many it will
mark (section 36). Feature PR #300 merged as be888ff. The agent runner opened the PR and made it ready on issue #293
(D-27). The lead asked for this closing lane in the session. The checklist is the plan, so there is no
`Plan approved by` line. Last of E7 batch 1's three closings (B7.3, B7.1, B7.2).

Files:

- `backlog/plan/E7-todos-hints.md`: B7.2 `**Status: Done** — be888ff (#300)`:
  - 7 AC-36.n criteria green: AC-36.3 and AC-36.7 pinned green first (bfcf41d), the rest red proven by
    `verify-red.sh` (cbbe08c); unit 280 → 284; e2e 64 → 67 (AC-36.5–36.7);
  - mutation 93.08 (`complete-all-label.ts` 100);
  - unattended and no-rework 1/1 (D-29), two runner runs (below).
- `backlog/README.md`:
  - Remaining row 123 removed; `~~B7.2~~` in node 123. No other Remaining row was blocked by B7.2.
  - Totals updated: E7 1/0/5, total 85/1/41 of 127.
- `spec/technical-requirements.md`: §36 index row ✗ → ✅.
- `docs/metrics.md`: B7.2 Green column from the feat commit c6a9e99 to the merged sha be888ff, as the E5 and E6
  closings did (the feature PR's review finding 1 said the closing PR would do this).
- `backlog/work/B7.2/closing-pr-body.md`: this body (Closing step 6).

`spec/features-map.md` F34 is already ✅ from the card's own `docs(map)` commit (3d35c16, right after `feat` c6a9e99,
B1.85); not edited here (B1.91).

D-29 for issue #293:

- `scripts/metrics/unattended.sh 293` → `unattended 1/1 = 100.0 %` (0 messages).
- `scripts/metrics/no-rework.sh 300` → `no-rework 1/1 = 100.0 %` (0 change requests).
- Two runner runs. After B7.1 (#302) merged, GitHub showed #300 conflicting: GitHub ignores the `merge=union` driver
  of `.gitattributes`, so the shared tables conflicted there though a local merge was clean (B1.101). The second run
  merged `origin/main` (a0da40a, bringing in 76bdb83) and pushed; `git show --remerge-diff a0da40a` is empty, so the
  merge resolved nothing by hand.

Diff review: 1 pass (`work/B7.2/review.md`), verdict ready for PR. Its one finding (the metrics row's Green cell named
the red commit and a mutation score not reproduced) was fixed in c153cdb. Riskiest unfalsified, carried from the
feature PR: the e2e revert probe for `src/app/page.tsx` was traced, not run; AC-36.5's `/?filter=completed` and
`/?q=zzz` legs are the guard.

`check-backlog.sh`, `check-spec-sections.sh`, `check-features-map.sh`, `check-ac-coverage.sh` (`§36 criteria=7
covered=7`) OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
