Closing lane (`backlog/CLAUDE.md` "Closing a card", step 4: Partial) for B1.95 — run.sh runs its own scripts from a
clone behind origin/main and never says so; feature PR #296 merged as 3643aa3. The checklist is the plan; no
`Plan approved by` line.

Pending: the scripts guide's `agent/run.sh` row in `scripts/CLAUDE.md` (acceptance "the scripts guide and the compose
header name the check"; the compose header does). At approval B1.97 planned `scripts/CLAUDE.md`, so the approved plan
left the row out and named B1.95's own Partial status as its carrier. The next card that plans `scripts/CLAUDE.md`
adds the row and its closing lane flips B1.95 to Done.

Files:

- `backlog/plan/E1-todos.md`: B1.95 `**Status: Partial** — merged 3643aa3 (#296), pending the row`, with the probe
  counts (run-smoke red cf678d3: R20 FAIL, 1 of 20; green b7e9d83: 20 probes OK, bash 3.2), hook-smoke 726, vitest
  280, e2e 64, mutation 92.74 (no `src/`), plan review 2 rounds, diff review 1 pass
- `backlog/README.md`: Remaining row 117 stays, status Partial; totals updated (E1 60/1/36 of 97, total 83/1/43 of 127)
- `backlog/work/B1.95/closing-pr-body.md`: this body (Closing step 6)

No `spec/features-map.md` or `spec/technical-requirements.md` change: B1.95 has no section. No other row names B1.95
in Blocked by.

`check-backlog.sh` OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
