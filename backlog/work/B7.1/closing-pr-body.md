Closing lane (`backlog/CLAUDE.md` "Closing a card") for B7.1: deleting a todo asks for confirmation first (section
35). Feature PR #302 merged as 76bdb83. The agent runner opened the PR and made it ready on issue #292 (D-27). The lead
asked for this closing lane in the session. The checklist is the plan, so there is no `Plan approved by` line. Second
of E7 batch 1's three closings (B7.3, B7.1, B7.2).

Files:

- `backlog/plan/E7-todos-hints.md`: B7.1 `**Status: Done** — 76bdb83 (#302)`:
  - 5 AC-35.n criteria green: unit 280 → 283 (AC-35.1–35.3, red proven by `verify-red.sh`); e2e 64 → 66
    (AC-35.4, AC-35.5);
  - mutation 92.74 (lib and actions unchanged);
  - unattended and no-rework 1/1 (D-29), two runner runs (below).
- `backlog/README.md`:
  - Remaining row 122 removed; `~~B7.1~~` in node 122. No other Remaining row was blocked by B7.1.
  - Totals updated: E7 1/0/5, total 85/1/41 of 127.
- `spec/technical-requirements.md`: §35 index row ✗ → ✅.
- `docs/metrics.md`: B7.1 Green column from `pending merge` to the merged sha 76bdb83, as the E5 and E6 closings did.
- `backlog/work/B7.1/closing-pr-body.md`: this body (Closing step 6).

`spec/features-map.md` F33 is already ✅ from the card's own `docs(map)` commit (4ff14e9, right after `feat` 13f1eef,
B1.85); not edited here (B1.91).

D-29 for issue #292:

- `scripts/metrics/unattended.sh 292` → `unattended 1/1 = 100.0 %` (0 messages).
- `scripts/metrics/no-rework.sh 302` → `no-rework 1/1 = 100.0 %` (0 change requests).
- Two runner runs. After B7.3 (#301) merged, GitHub showed #302 conflicting: GitHub ignores the `merge=union` driver
  of `.gitattributes`, so the shared tables conflicted there though a local merge was clean (B1.101). The second run
  merged `origin/main` (7eab1a5, bringing in 14defd1) and pushed; `git show --remerge-diff 7eab1a5` is empty, so the
  merge resolved nothing by hand.

Diff review: 2 passes (`work/B7.1/review.md`). Pass 1 found the AC-35.1 test title differed from the card's `Test:`
line; fixed title-only in a1a72f1 (no assertion changed). Pass 2: 0 findings. Riskiest unfalsified, carried from the
feature PR: e2e AC-35.4/35.5 were never run against a removed guard (traced only).

`check-backlog.sh`, `check-spec-sections.sh`, `check-features-map.sh`, `check-ac-coverage.sh` (`§35 criteria=5
covered=5`) OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
