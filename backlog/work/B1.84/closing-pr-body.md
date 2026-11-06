Closing lane (`backlog/CLAUDE.md` "Closing a card") for B1.84 — the reviewer's probes edit the worktree when
`TMPDIR` is unset; feature PR #243 merged as a0979ab. The checklist is the plan; no `Plan approved by` line.

Files:

- `backlog/plan/E1-todos.md`: B1.84 `**Status: Done** — a0979ab (#243)` with the probe counts (hook-smoke red 55 FAIL
  of 695, green 695; review passes 1–3 add RW95–RW125, each red first: 11, 11, 2 FAIL; 726 probes OK, the 601
  earlier verdicts unchanged), vitest 241, e2e 52, mutation 92.62 (no `src/`), plan review 2 rounds (round 3 waived
  by the lead), diff review 3 passes (14 findings fixed), and the lead's ruling that a command built to get past a
  text check is out of reach
- `backlog/README.md`: Remaining row 100 out; `~~B1.84~~` in node 100; totals updated (E1 55/0/30, total 72/0/31 of 103)
- `backlog/work/B1.84/closing-pr-body.md`: this body (Closing step 6)

No `spec/features-map.md` or `spec/technical-requirements.md` change: B1.84 has no section. No other row names B1.84
in Blocked by. The follow-up the plan names (the runner exports a `TMPDIR`, so container reviews can probe) is filed
separately in the filing lane.

`check-backlog.sh` OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
