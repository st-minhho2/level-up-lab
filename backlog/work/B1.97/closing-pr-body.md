Closing lane (`backlog/CLAUDE.md` "Closing a card") for B1.97: a row wider than its column made Prettier re-pad the
whole shared table, and union then kept every row twice. Feature PR #288 merged as b35c5d6. The lead asked for this
closing lane in the session. The checklist is the plan, so there is no `Plan approved by` line.

Files:

- `backlog/plan/E1-todos.md`: B1.97 `**Status: Done** — b35c5d6 (#288)`. The status lists:
  - `table-merge-smoke` T1–T15: red 729ae12 "3 of 15 FAILED", green f93572b "15 probes OK" (bash 3.2);
  - hook-smoke 726, tier-smoke 9, vitest 280, e2e 64, mutation 92.74 (no `src/` change);
  - plan review 1 round, diff review 1 pass, 0 findings;
  - the rule: the three union-merged tables are in `.prettierignore`, rows appended unaligned.

  The status line's old evidence paragraph is replaced. A one-line lead-in keeps the B6.4 (#278) bullets under it as
  the card's history.

- `backlog/README.md`:
  - Remaining row 119 removed; `~~B1.97~~` in node 119. No other row was blocked by B1.97.
  - Totals updated: E1 60/0/37 of 97, total 83/0/44 of 127.
- `backlog/work/B1.97/closing-pr-body.md`: this body (Closing step 6).

There is no `spec/` change: B1.97 is tooling, with no section and no map row. There is no `docs/metrics.md` per-card
row either, as for B1.89 and B1.96.

Still to measure: E7's first batch is the first run where cards append rows to the three tables unaligned. It will
show whether any Loop 9 merge of them still brings a row back twice. A session whose project path goes through a
symlink still re-pads on edit (the plan's stated cost); T6, T7, T12's guards catch that only in CI after the push.

All `scripts/ci/check-*.sh` OK, except `check-config-change.sh`, which needs the PR label and does not apply here: no
protected path changes.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
