Closing lane (`backlog/CLAUDE.md` "Closing a card") for B1.98 — unattended.sh counts a run the lead stopped, ruled on
and relaunched as unattended; feature PR #306 merged as 6da952c. The same lane flips B1.95 from Partial to Done: its
pending item, the scripts guide's `agent/run.sh` row naming the behind check, landed in #306 (B1.98's approved plan
carried it, B1.95's closing PR #298). The checklist is the plan; no `Plan approved by` line.

Files:

- `backlog/plan/E1-todos.md`: B1.98 `**Status: Done** — 6da952c (#306)` with metrics-smoke M50–M53 (red e7a9bb8: 35
  ok, 16 FAIL; green e83061b: 51 ok, bash 3.2), the live re-runs (275–277 → 1/3; E5 batch 1 → 1/3 on #207, #215; E5
  batch 2 and E6 batch 1 unchanged 3/3), `no-rework.sh` byte-identical on 15 PRs, hook-smoke 749, vitest 298, e2e 70,
  mutation 92.84, plan review 2 rounds, diff review 1 pass. B1.95 `**Status: Done** — 3643aa3 (#296)`, its row in
  6da952c (#306)
- `backlog/README.md`: Remaining rows 117 (B1.95) and 120 (B1.98) removed, both nodes struck; totals E1 63/0/36 of
  99, total 89/0/40 of 129 (the table re-padded by Prettier after the widest rows left)
- `backlog/work/B1.98/closing-pr-body.md`: this body (Closing step 6)

No `spec/features-map.md` or `spec/technical-requirements.md` change: neither card has a section. No other row names
B1.95 or B1.98 in Blocked by.

Left for the lead (not in this lane): B1.87's card text (Acceptance "M1–M49", row 28 item) no longer matches after
#306; E5 batch 1 now reads 1/3 under the corrected definition.

`check-backlog.sh` OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
