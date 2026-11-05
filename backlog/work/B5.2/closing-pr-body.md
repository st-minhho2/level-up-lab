Closing lane (`backlog/CLAUDE.md` "Closing a card") for B5.2 — Escape cancels a title edit (§24), feature PR #211
merged as 6562b3f. The PR was opened and made ready by the agent runner on issue #207 (D-27, tier medium); the lead
asked for this closing lane in the session. The checklist is the plan; no `Plan approved by` line.

Files:

- `backlog/plan/E5-todos-keys.md`: B5.2 `**Status: Done** — 6562b3f (#211)`, 6 AC-24.n tests green (unit 207, e2e
  44), mutation 93.40; unattended and no-rework 1/1 (D-29)
- `backlog/README.md`: Remaining row 89 out; `~~B5.2~~` in node 89; totals updated (E5 1/0/5, total 62/0/33 of 95)
- `spec/technical-requirements.md`: §24 index row ✗ → ✅
- `docs/metrics.md`: B5.2 Green column on the merged sha (6562b3f)
- `backlog/work/B5.2/closing-pr-body.md`: this body (Closing step 6)

`spec/features-map.md` F22 is already ✅ from the feature PR (`docs(map): F22 …`). No other row names B5.2 in Blocked
by; the run-1 "Waiting on human" row is already gone from README.

D-29 for issue #207: `scripts/metrics/unattended.sh 207` → `unattended 1/1 = 100.0 %`; `scripts/metrics/no-rework.sh
211` → `no-rework 1/1 = 100.0 %`. Three runs, USD 5.91 in all (2.19 stopped at the plan review before B1.78, 3.52 to
ready, 0.20 for the BEHIND round trip after #212).

`check-backlog.sh`, `check-features-map.sh`, `check-spec-sections.sh` OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
