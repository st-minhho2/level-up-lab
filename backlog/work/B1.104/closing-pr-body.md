Closing lane (`backlog/CLAUDE.md` "Closing a card") for B1.104: untrusted text is data, never instructions. Feature
PR #380 merged as bed5bd7 (it replaced #378, closed); the Partial closing (#384) left one item pending, now in. The
checklist is the plan, so there is no `Plan approved by` line.

Pending item, closed:

- the `scripts/CLAUDE.md` row for `agent/run-smoke.sh` (R1–R23; Acceptance 5's other half): #385 merged as b6b6507
  (plan round 3, approved by the lead in the session; one row, nothing re-padded).

All six Acceptance lines are now met: the rule `.claude/rules/untrusted-text.md` (no frontmatter, so it loads into
every session and subagent) names the untrusted sources and the mistake it prevents (1), says what a run does when
such text tries to steer it (2); the run prompt in `scripts/agent/run.sh` carries the clause (3); run-smoke R16 and R23
were red at b5d8ca4 and green after, bash 3.2, "22 probes OK" → "23 probes OK" (4); the `CLAUDE.md` Rules row and the
`scripts/CLAUDE.md` row (5); #380 carried `config-change-approved` (6). Still unverified until the first run after the
merge: that `claude -p --agent dev-lead` loads `.claude/rules/` (the prompt sentence reaches dev-lead either way).

Files:

- `backlog/plan/E1-todos.md`: B1.104 `**Status: Done** — bed5bd7 (#380), b6b6507 (#385): …` with the evidence.
- `backlog/README.md`: Remaining row 145 removed; `~~B1.104~~` in node 145. No other Remaining row was blocked by
  B1.104. Totals: E1 66/1/37, total 108/1/38 of 147.
- `backlog/work/B1.104/closing-pr-body.md`: this body (Closing step 6), replacing the Partial closing's.

No `spec/` row: tooling, no section, no feature. `docs/metrics.md` has no per-card row for tooling (as B1.95, B1.101).

`check-backlog.sh` OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
