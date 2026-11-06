Closing lane (`backlog/CLAUDE.md` "Closing a card") for B5.5 — Escape clears the search box (§27), feature PR #232
merged as 7f72998. The PR was opened and made ready by the agent runner on issue #224 (D-27); the lead asked for this
closing lane in the session. The checklist is the plan; no `Plan approved by` line.

Files:

- `backlog/plan/E5-todos-keys.md`: B5.5 `**Status: Done** — 7f72998 (#232)`, 6 AC-27.n tests green (unit 222 → 227,
  e2e 50 → 51), mutation 92.62 (`escape-search.ts` 100); unattended and no-rework 1/1 (D-29), one runner run
- `backlog/README.md`: Remaining row 92 out; `~~B5.5~~` in node 92; totals updated (E5 5/0/1, total 67/0/32 of 99,
  after B5.4's closing #230 and B1.83's filing #233)
- `spec/technical-requirements.md`: §27 index row ✗ → ✅
- `docs/metrics.md`: B5.5 Green column on the merged sha (7f72998)
- `backlog/work/B5.5/closing-pr-body.md`: this body (Closing step 6)

`spec/features-map.md` F25 is already ✅ from the feature PR. No other Remaining row was blocked by B5.5.

D-29 for issue #224: `scripts/metrics/unattended.sh 224` → `unattended 1/1 = 100.0 %` (0 messages);
`scripts/metrics/no-rework.sh 232` → `no-rework 1/1 = 100.0 %` (0 change requests). One runner run: 66 turns, USD
5.58, no stop for a ruling. The first `run.sh 224` attempt started no run: the in-flight cap skipped it while merged
agent branches remained (B1.82). Plan review took 2 rounds and went the D-27 path (reviewer approval, no lead gate);
diff review 1 pass, 0 findings. Lifting the Out of scope lines of §16 and §21 was allowed by D-32.

Caveat on the ready time: the lead marked #232 ready by hand at 00:34:32Z mid-run and undid it; the runner's own ready
came later. `unattended.sh` reports 00:34:32Z because it takes the first ready event (card B1.83). The verdict is
unaffected: there were 0 messages.

Known deviations, from the feature PR body:

- F25 was ticked inside the `feat(todos)` commit, not in its own `docs(map)` commit.
- `code-writer` added the `docs/metrics.md` row.
- The AC-27.6 e2e test expects 0 requests and could flake on a production prefetch.

`check-backlog.sh`, `check-features-map.sh`, `check-spec-sections.sh` OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
