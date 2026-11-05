Closing lane (`backlog/CLAUDE.md` "Closing a card") for B5.3 — the slash key focuses the search box (§25), feature PR
#221 merged as 9bb37ab. The PR was opened and made ready by the agent runner on issue #215 (D-27); the lead asked for
this closing lane in the session. The checklist is the plan; no `Plan approved by` line.

Files:

- `backlog/plan/E5-todos-keys.md`: B5.3 `**Status: Done** — 9bb37ab (#221)`, 6 AC-25.n tests green (unit 218, e2e
  46), mutation 92.18 (`search-shortcut.ts` 82.98); unattended and no-rework 1/1 (D-29), with the D-31 stop noted
- `backlog/README.md`: Remaining row 90 out; `~~B5.3~~` in node 90 and in row 96 (B1.80) Blocked by; totals updated
  (E5 3/0/3, total 65/0/32 of 97, after B1.79's closing #227)
- `spec/technical-requirements.md`: §25 index row ✗ → ✅
- `docs/metrics.md`: B5.3 Green column on the merged sha (9bb37ab)
- `backlog/work/B5.3/closing-pr-body.md`: this body (Closing step 6)

`spec/features-map.md` F23 is already ✅ from the feature PR.

D-29 for issue #215: `scripts/metrics/unattended.sh 215` → `unattended 1/1 = 100.0 %` (0 messages);
`scripts/metrics/no-rework.sh 221` → `no-rework 1/1 = 100.0 %` (0 change requests). The script counts the card as
unattended, but run 1 stopped once for the lead's ruling D-31 (2A) after plan review round 1, so the card was attended
in spirit: one human decision was needed before code. Two runs: run 1, 27 turns, USD 2.01 (stopped for D-31); run 2,
52 turns, USD 4.41. Total 79 turns, USD 6.42. Plan review took 2 rounds; diff review 1 pass, 0 findings.

Known gap: REQ-25.3 names 9 non-text `input` types (checkbox, radio, button, submit, reset, image, file, range,
color), but the tests cover only checkbox and radio. The other seven are untested.

`check-backlog.sh`, `check-features-map.sh`, `check-spec-sections.sh` OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
