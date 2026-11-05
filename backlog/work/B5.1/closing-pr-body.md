Closing lane (`backlog/CLAUDE.md` "Closing a card") for B5.1 — show how many open todos are overdue (§23), feature PR
#216 merged as a03a9ea. The PR was opened and made ready by the agent runner on issue #214 (D-27, tier medium); the
lead asked for this closing lane in the session. The checklist is the plan; no `Plan approved by` line.

Files:

- `backlog/plan/E5-todos-keys.md`: B5.1 `**Status: Done** — a03a9ea (#216)`, 7 AC-23.n tests green (unit 213, e2e
  45), mutation 93.52 (`overdue-count.ts` 100); unattended and no-rework 1/1 (D-29)
- `backlog/README.md`: Remaining row 88 out; `~~B5.1~~` in node 88; totals updated (E5 2/0/4, total 63/0/32 of 95)
- `spec/technical-requirements.md`: §23 index row ✗ → ✅
- `docs/metrics.md`: B5.1 Green column on the merged sha (a03a9ea)
- `backlog/work/B5.1/closing-pr-body.md`: this body (Closing step 6)

`spec/features-map.md` F21 is already ✅ from the feature PR. No other row names B5.1 in Blocked by.

D-29 for issue #214: `scripts/metrics/unattended.sh 214` → `unattended 1/1 = 100.0 %` (0 messages);
`scripts/metrics/no-rework.sh 216` → `no-rework 1/1 = 100.0 %` (0 human commits, 0 change requests). One run, 68
turns, USD 5.09. Plan review took 2 rounds; diff review 1 pass, 0 findings.

`check-backlog.sh`, `check-features-map.sh`, `check-spec-sections.sh` OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
