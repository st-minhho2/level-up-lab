Closing lane (`backlog/CLAUDE.md` "Closing a card") for B1.103: `guard-bash.sh` blocks merging a pull request through
`gh` (the CLI subcommand with flags anywhere before it, REST on a pull's merge path or `/merges`, and the GraphQL
merge mutations), with five matching `settings.json` deny entries as a second layer. Feature PR #381 merged as
109ee07. The checklist is the plan, so there is no `Plan approved by` line.

Evidence (from #381):

- hook-smoke: red 082f517 26 FAIL (25 merge probes and the settings probe), 762 ok; green e21416f 788 OK; review pass 1
  probes ad6a542, 790 OK (`/bin/bash` 3.2; bash 5 in CI `test`); 12 of 12 prototype mutants fail a merge probe.
- `settings.json` deny 16 → 21; vitest 403, e2e 91; mutation: CI only, no src/lib or src/actions change.
- Rounds: plan review 2, lead 1; diff review 2 of 3 passes.
- #379 was closed unmerged and re-cut as #381 after a `(red)` marker on a probe-only commit failed CI `guards`
  (mistake-log Seen 2); follow-ups filed in #382: B1.105 (a flag between `pr` and `close` still deletes a branch) and
  B1.106 (a local check for that marker).

Files:

- `backlog/plan/E1-todos.md`: B1.103 `**Status: Done** — 109ee07 (#381)` with the evidence above.
- `backlog/README.md`: Remaining row 144 removed; `~~B1.103~~` in node 144. No Remaining row on `main` is blocked by
  B1.103 (B1.105's row arrives with #382). Totals: E1 65/1/36, total 107/1/37 of 145.
- `backlog/work/B1.103/closing-pr-body.md`: this body.

No `spec/` row: tooling, no section, no feature. `docs/metrics.md` has no per-card row for tooling (as B1.95, B1.98).

`check-backlog.sh` OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
