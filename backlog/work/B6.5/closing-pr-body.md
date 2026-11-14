Closing lane (`backlog/CLAUDE.md` "Closing a card") for B6.5: the overdue count is announced to assistive technology
(section 33). Feature PR #282 merged as a2b73ea. The agent runner opened the PR and made it ready on issue #276 (D-27).
The lead asked for this closing lane in the session. The checklist is the plan, so there is no `Plan approved by` line.
Epic E6, batch 2 (D-33, D-34).

This branch started from `docs/B6.4-done` (#284), so its totals count both cards. #284 merged as 02042ed, and
`origin/main` was then merged in. The README conflict was resolved by keeping this branch's side, which already held
B6.4's lines. The union merge of `docs/metrics.md` kept the B6.5 row twice, and `check-backlog.sh` named it, as B1.89
designed. The `pending (merge)` copy is removed (52eb746). The diff now holds B6.5's lines only.

Files:

- `backlog/plan/E6-todos-cues.md`: B6.5 `**Status: Done** — a2b73ea (#282)`:
  - 5 AC-33.n criteria green: unit 269 → 273; e2e 57 → 58;
  - mutation 92.63 (lib and actions unchanged);
  - D-34 let the red commit drop only the role assertion of the AC-23.3 test;
  - unattended and no-rework 1/1 (D-29), two runner runs.
- `backlog/README.md`:
  - Remaining row 115 removed; `~~B6.5~~` in node 115.
  - Totals updated: E6 5/0/1, total 81/0/38 of 119.
- `spec/technical-requirements.md`: the section 33 index row is **added**, ✅, after section 32.
  - B6.5's run restored main's copy of the index through git (24f6ffa) to clear the union duplicates, which dropped
    its own row. No role's path guard may write the index (see D-36), so the row comes back here, as the run's commit
    said it would.
  - The row reads the contract's heading: `contracts/31-overdue-announce.md`, "Todos: announce the overdue count to
    assistive technology".
- `docs/metrics.md`: B6.5 Green column from `pending (merge)` to the merged sha a2b73ea.
- `backlog/work/B6.5/closing-pr-body.md`: this body (Closing step 6).

`spec/features-map.md` F31 is already ✅ from the card's branch: code-writer re-added the row after the merge repair.

D-29 for issue #276:

- `unattended.sh 276` → 1/1, 0 messages.
- `no-rework.sh 282` → 1/1, 0 change requests.
- Two runner runs, 104 turns and USD 6.19 in all:
  - the first took 12 turns and USD 0.70, and stopped on the D-34 request (§23's "no role" clause);
  - the second took 92 turns and USD 5.49. It built the card, then met B6.4's re-padded tables at its Loop 9 merge
    (B1.97) and restored main's copies (24f6ffa) before going ready.

All `scripts/ci/check-*.sh` OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
