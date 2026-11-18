Closing lane (`backlog/CLAUDE.md` "Closing a card") for B1.109: `guard-bash.sh`'s gh pr rules also read a second
unquoted copy, `UNQUOTE_KEEP` (main's `UNQUOTE` with `$` excluded from the braced subscript token), so a word split
by a parameter inside an unexpanded `${X[ … ]}` and passed on as `$1` shows; main's copy and the `*_RAW` rules are
unchanged and read first, so the second copy only adds blocks. Feature PR #396 merged as 6d0eff7. The checklist is
the plan, so there is no `Plan approved by` line.

Evidence (from #396):

- hook-smoke: 938 → 965 probes OK (`/bin/bash` 3.2; bash 5 in CI `test`, green on 35ee718d). Red at `2651553`: 12
  FAIL, 953 ok.
- vitest 403 before and after, e2e 91; mutation: CI only, no src/lib or src/actions change.
- Timing against `179971b`, side by side: 300 segments 2.02 / 2.14 s and 1.96 / 2.03 s; one 139 KB segment 365.11 /
  365.26 s.
- Rounds: plan review 2 (round 1 changes requested: replacing main's class in place lost 8 forms main blocks), lead
  1; diff review 1 pass, 0 findings.
- Out of reach, main too, named in the hook header and `hooks.md`: a subscript holding a braced, subscripted or
  arithmetic expansion (`${X[${i}]}merge`, `${X[$Y[1]]}merge`, `${X[$((1))]}merge`).
- Found by diff review pass 1, outside this card, main too, not yet named anywhere: `gh pr m$!erge 7` (bash) and
  `gh pr m$~@erge 7` (zsh) exit 0; a follow-up card waits on the lead's choice.

Files:

- `backlog/plan/E1-todos.md`: B1.109 `**Status: Done** — 6d0eff7 (#396)` with the evidence above.
- `backlog/README.md`: Remaining row 150 removed; `~~B1.109~~` in node 150; totals E1 70/1/36/107, total
  112/1/37/150.
- `backlog/work/B1.109/closing-pr-body.md`: this body.

`spec/features-map.md` and `spec/technical-requirements.md` unchanged (tooling, no section). `scripts/ci/check-backlog.sh`
→ OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
