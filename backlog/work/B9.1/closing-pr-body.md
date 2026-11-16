Closing lane (`backlog/CLAUDE.md` "Closing a card") for B9.1: after a successful add, focus is in the "New todo" box
(section 44). Feature PR #346 merged as 5d8ef18. The agent runner opened the PR and made it ready on issue #339 (D-27).
The lead asked for this closing lane in the session. The checklist is the plan, so there is no `Plan approved by` line.
One of E9's three closings (B9.1, B9.2, B9.3), opened one after another; each touches only its own lines.

Files:

- `backlog/plan/E9-todos-focus.md`: B9.1 `**Status: Done** — 5d8ef18 (#346)`:
  - 7 AC-44.n criteria green: AC-44.1, AC-44.4–44.6 red proven by `verify-red.sh` (947055c); AC-44.7 red in 62a54cd,
    its Then corrected by D-42 (#347) in 8b79096; AC-44.2, AC-44.3 no-focus guards green at the base (9e20190);
    AC-44.4 rewritten on main by D-41 (#345); unit 338 → 343; e2e 82 → 84 (AC-44.6, AC-44.7);
  - mutation n/a: no `src/lib` or `src/actions` change, so the run skipped local mutation (B1.100);
  - no-rework 1/1, unattended 0/1 (D-29): the run stopped twice for the rulings D-41 and D-42.
- `backlog/README.md`: Remaining row 133 removed; `~~B9.1~~` in node 133. No other Remaining row was blocked by
  B9.1. Totals: E9 1/0/2, total 97/1/38 of 136.
- `spec/technical-requirements.md`: §44 index row ✗ → ✅.
- `docs/metrics.md`: B9.1 Mutation cell "CI only" → 92.91 (the CI Stryker run on 1309733, `src/lib` and `src/actions`
  unchanged), Green cell from the feat commit 274a71a → the merged sha 5d8ef18, as the E8 closings did.
- `backlog/work/B9.1/closing-pr-body.md`: this body (Closing step 6).

`spec/features-map.md` F42 is already ✅ from the card's own `docs(map)` commit (b177e55); not edited here (B1.91).

D-29 for issue #339:

- `scripts/metrics/unattended.sh 339 340 341` → `unattended 2/3 = 66.7 % (pending 0)`; #339 row `no`, 0 messages,
  stops `ended,ended`, no human commit.
- `scripts/metrics/no-rework.sh 346 344 343` → `no-rework 3/3 = 100.0 % (pending 0)`; #346 row `yes`.
- #346 merged third in the batch; the run merged origin/main for D-41 (7b42809) and D-42 (697e7e2), then once after
  #344 (1309733, `Agent-Run:` trailer).

Diff review: 2 passes (`work/B9.1/review.md`), verdict ready for PR at round 2; pass 1's finding (REQ-44.4's second
`focus()` untested) fixed in 68929a4. Riskiest unfalsified, carried from the feature PR: e2e AC-44.6's second add in
Chromium does not tell a missing second `focus()` apart, since the box already holds focus before Enter; the unit spy
covers the call.

`check-ac-coverage.sh` (§44 7/7), `check-backlog.sh`, `check-spec-sections.sh`, `check-features-map.sh` OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
