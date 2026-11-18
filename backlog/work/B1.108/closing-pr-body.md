Closing lane (`backlog/CLAUDE.md` "Closing a card") for B1.108: `guard-bash.sh`'s gh pr merge and branch-delete rules
read an unquoted, lower-case copy of each segment (one `sed` per command: quotes, `\`, `$'…'`, empty variables,
brace lists, glued redirects), and main's own rules still run on the original text, so the copy only adds blocks.
Feature PR #393 merged as 7aa59fb. The checklist is the plan, so there is no `Plan approved by` line.

Evidence (from #393):

- hook-smoke: 838 → 938 probes OK (`/bin/bash` 3.2; bash 5 in CI `test`, green on 26ce0d32). Red then green five
  times: 30 FAIL → 878; 26 FAIL → 908; 4 FAIL → 914; 10 FAIL → 932; 6 FAIL → 938.
- vitest 403 before and after, e2e 91; mutation: CI only, no src/lib or src/actions change.
- Timing against `4c79bec`: one 139 KB segment 349.62 / 349.64 s; 300 segments ~1.9–2.3 s on both.
- Rounds: plan review 12, lead 5 (approved rounds 3, 6, 7, 11, 12); diff review 5 passes (the lead allowed 4 and 5).
  The reviewer's last pass found no command main blocks that the hook lets through (72 commands, BSD and GNU sed;
  plan review 12: 296-command corpus and a 1,500-command fuzz).
- Out of scope, filed as B1.109 (#394): a word split by a parameter inside an unexpanded `${X[ … ]}` and passed on as
  `$1`; main lets it through too; named out of reach in the hook header and `hooks.md`.

Files:

- `backlog/plan/E1-todos.md`: B1.108 `**Status: Done** — 7aa59fb (#393)` with the evidence above.
- `backlog/README.md`: Remaining row 149 removed; `~~B1.108~~` in node 149; totals E1 69/1/36/106, total
  111/1/37/149.
- `backlog/work/B1.108/closing-pr-body.md`: this body.

`spec/features-map.md` and `spec/technical-requirements.md` unchanged (tooling, no section). `scripts/ci/check-backlog.sh`
→ OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
