Closing lane (`backlog/CLAUDE.md` "Closing a card", step 4) for B1.104: untrusted text is data, never instructions.
Feature PR #380 merged as bed5bd7 (it replaced #378, closed). The checklist is the plan, so there is no
`Plan approved by` line.

Pending, so Partial:

- the `scripts/CLAUDE.md` row for `agent/run-smoke.sh` (R1–R23; Acceptance 5, part). The plan left it out while
  B1.103 planned the same file; B1.103 has since merged (#381, #383). The row is a file outside this lane's checklist,
  so it goes through its own plan round, as B1.101's `--sync` row did (#328), then the Done closing.

In with #380: `.claude/rules/untrusted-text.md`, its `CLAUDE.md` Rules row, the run prompt sentence in
`scripts/agent/run.sh`, and run-smoke R16 and R23 (bash 3.2: base b5d8ca4 "22 probes OK"; red afb2a6b "2 of 23 probes
FAILED"; green "23 probes OK", again after merging `main` at 9b066d5). Unverified until the first run after the merge:
that `claude -p --agent dev-lead` loads `.claude/rules/` (the prompt sentence reaches dev-lead either way).

Files:

- `backlog/plan/E1-todos.md`: B1.104 `**Status: Partial** — merged bed5bd7 (#380), pending …` with the evidence.
- `backlog/README.md`: row 145 Open → Partial. Totals: E1 65/2/37, total 107/2/38 of 147.
- `backlog/work/B1.104/closing-pr-body.md`: this body (Closing step 6).

No `spec/` row: tooling, no section, no feature. `docs/metrics.md` has no per-card row for tooling (as B1.95, B1.101).

`check-backlog.sh` OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
