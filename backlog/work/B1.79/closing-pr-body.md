Closing lane (`backlog/CLAUDE.md` "Closing a card") for B1.79 — build roles write files with Write/Edit, not Bash
text, so guard-bash's secret rule stops refusing their code edits; feature PR #222 merged as 768a882. The checklist is
the plan; no `Plan approved by` line.

Files:

- `backlog/plan/E1-todos.md`: B1.79 `**Status: Done** — 768a882 (#222)` with the probe counts (hook-smoke red 6 FAIL,
  green 587, review pass 1 RP7–RP10, 591 probes OK), vitest 207, e2e 44, mutation 93.40 (no `src/`); guard-bash
  unchanged; the measure (guard-bash secret-rule denials per runner log, 4 before) waits for the next E5 runs
- `backlog/README.md`: Remaining row 95 out; `~~B1.79~~` in node 95; totals updated (E1 51/0/28, total 64/0/33 of 97)
- `backlog/work/B1.79/closing-pr-body.md`: this body (Closing step 6)

No `spec/features-map.md` or `spec/technical-requirements.md` change: B1.79 has no section. No other row names B1.79
in Blocked by.

`check-backlog.sh` OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
