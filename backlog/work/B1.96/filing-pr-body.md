Filing lane (`backlog/CLAUDE.md` "Filing a card") for B1.96: parallel card PRs conflict on the section index in
`spec/technical-requirements.md`, which B1.89 left on git's default merge. The lead asked for the card in the session.
The checklist is the plan, so there is no `Plan approved by` line. Filing decides nothing; `dev-lead` plans the card
when it is picked.

Why now: E6 batch 1 (2026-11-13) hit the conflict.

- #265 (B6.3) merged first. #266 (B6.2) then conflicted on the index alone: both PRs had appended a row after §29.
  The runner's merge 9337123 shows the index as the only conflicting file, while `spec/features-map.md` and
  `docs/metrics.md` merged by union (B1.89).
- The fix cost a second runner run (`run.sh 262`, USD 1.00), and the two closing PRs had to be stacked (#270, #271).
- Batch 2 (B6.4–B6.6) will append three more rows after §31 in parallel.

B1.89 left the index out on purpose: a closing flip (✗ → ✅) merged by union against a row appended below it would
bring the row back twice. So the card pairs `merge=union` with a guard that names a § holding more than one index
row, the same pattern B1.89 used for the map and the metrics. It relates to B1.92 (guards run after a clean Loop 9
merge): whichever lands second adds the other's check.

Files:

- `backlog/plan/E1-todos.md`: card B1.96 appended. It holds the status evidence (`.gitattributes`, smoke T9, B1.89's
  reason, the batch 1 numbers), the test line (two new `table-merge-smoke.sh` probes and T9 updated) and the
  acceptance (union, a duplicate-§ guard, the scripts guide, `config-change-approved`).
- `backlog/README.md`:
  - Remaining row 118 and node S118 added, after S105 (B1.89).
  - Totals updated: E1 58/0/36 of 94, total 78/0/40 of 118.
- `backlog/work/B1.96/filing-pr-body.md`: this body.

`check-backlog.sh` OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
