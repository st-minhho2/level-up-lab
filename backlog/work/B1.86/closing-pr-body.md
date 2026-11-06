Closing lane (`backlog/CLAUDE.md` "Closing a card") for B1.86 — check-ac-coverage misses a test title written on the
line after `it.each(…)(`; feature PR #239 merged as 34787f8. The checklist is the plan; no `Plan approved by` line.

Files:

- `backlog/plan/E1-todos.md`: B1.86 `**Status: Done** — 34787f8 (#239)` with the probe counts (hook-smoke red 3
  FAIL A1/A3/A4, green 599, review pass 1 adds A9/A10, 601 probes OK), old vs new guard identical on `main` and §28
  `covered=7` on B5.6's closing branch, vitest 241, e2e 52, mutation 92.62 (no `src/`), plan review 2 rounds, diff
  review 2 passes
- `backlog/README.md`: Remaining row 102 out; `~~B1.86~~` in node 102; totals updated (E1 52/0/32, total 69/0/33 of 102, after B5.6's closing #237)
- `backlog/work/B1.86/closing-pr-body.md`: this body (Closing step 6)

No `spec/features-map.md` or `spec/technical-requirements.md` change: B1.86 has no section. No other row names B1.86
in Blocked by. B5.6's closing PR #237 merged `origin/main` after #239, passed `check-ac-coverage`
(`§28  criteria=7 covered=7`) and merged as c22e41a; this branch merged `origin/main` after it and recounted.

`check-backlog.sh` OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
