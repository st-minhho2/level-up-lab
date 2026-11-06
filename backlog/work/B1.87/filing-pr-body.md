Files card **B1.87** through the "Filing a card" lane (`backlog/CLAUDE.md`). The checklist is the plan, so there is no `Plan approved by` line. The lead asked for this card at B1.83's close.

- **B1.87**: B1.83 (#241) changed `scripts/pr-step.sh ready` (label `pr-step-ready`) and `scripts/metrics/unattended.sh` (window ends at the labeled ready; new `touches` column), with its Files kept to the scripts and smokes. `docs/metrics.md:28` and `scripts/CLAUDE.md:29,31` still describe the old behaviour and probe ranges (M1–M43, R1–R15). The card also records, in `docs/mistake-log.md`, that B1.83's plan assumed guard-bash rule 5 compares the wrapper with the session's checkout, when it compares with the main checkout's copy.

Files:

- `backlog/plan/E1-todos.md`: card B1.87 (quick, no dependency).
- `backlog/README.md`: totals (E1 54/0/31/85, total 71/0/32/103, recounted after B1.83's closing #245), node S103 (after S99), Remaining row 103.
- `backlog/work/B1.87/filing-pr-body.md`: this body.

B1.83's closing PR (`docs/B1.83-done`) edits the same README totals line; whichever merges second merges `origin/main` and recounts.

`scripts/ci/check-backlog.sh` → OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
