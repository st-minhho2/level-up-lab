Filing lane (`backlog/CLAUDE.md` "Filing a card") for B1.97: a row wider than its column makes Prettier re-pad the
whole shared table. The lead asked for the card in the session. The checklist is the plan, so there is no
`Plan approved by` line. Filing decides nothing; `dev-lead` plans the card, and chooses how the table keeps its padding
(out of Prettier or fixed-width columns).

Why now: in E6 batch 2, B6.4 (#278) re-padded two shared tables. `docs(spec)` 0495c50 changed 67 lines of
`spec/technical-requirements.md`, and `docs(map)` a881ff6 changed 63 lines of `spec/features-map.md`.

- The cause: its contract file name is wider than the File column.
- Under `merge=union` (B1.89, B1.96), a re-pad merged against a sibling's appended row keeps every row twice, as
  `table-merge-smoke.sh` T6, T7 and T12 show.
- So B6.5 (#276) and B6.6 (#277), which append rows in parallel, will meet duplicated tables at their Loop 9 merge
  once #278 merges. The lead chose to let those runs meet it.

Files:

- `backlog/plan/E1-todos.md`: card B1.97 appended. It holds the status evidence (the two B6.4 commits, B1.89's
  earlier count), a test line (a smoke probe: a wider row formatted as the hooks do, against an append, merges with
  each row once) and the acceptance (no re-pad of the other rows, the probe, the scripts guide,
  `config-change-approved`).
- `backlog/README.md`:
  - Remaining row 119 and node S119 added, after S118 (B1.96).
  - Totals updated: E1 59/0/36 of 95, total 79/0/40 of 119.
- `backlog/work/B1.97/filing-pr-body.md`: this body.

All `scripts/ci/check-*.sh` OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
