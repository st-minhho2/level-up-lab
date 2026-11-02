Closing lane (`backlog/CLAUDE.md`, "Closing a card", step 4): B1.55 is merged (d66fccd, #171) but not yet measured
in a run, so it closes `Partial`.

- Pending B1.65: `scripts/agent/run.sh`'s prompt still says "At the plan gate print the gate line and stop", so no
  headless run takes dev-lead's D-27 path yet. B1.58 held `run.sh` while B1.55 ran; B1.65 rewords the prompt and
  proves one live low-tier run past the gate, then moves B1.55 to Done.
- Met: 4 of 5 acceptance clauses (dev-lead and work-next carry the D-27 path; interactive sessions keep the lead's
  gate; plan-scope, check-plan-scope, plan-files and the metrics accept the D-27 approval and nothing looser, a probe
  each; `config-change-approved` on #171).
- Evidence: hook-smoke 511, eligible-smoke 11, metrics-smoke 27 on bash 3.2 and 5.2 (red bc11ca9: 18 + 2 + 2 FAIL;
  d4b1b00: 1 FAIL); vitest 202, playwright 43; no `src/` change, mutation 93.40.

README: row 67 stays (Partial), E1 39/1/23/63, Total 50/1/24/75; no feature-map or section status (tooling, no §).
Totals: #174 (B1.62) and #175 (B1.65) each add an Open card; whichever merges after this fixes its totals.

Files: `backlog/plan/E1-todos.md`, `backlog/README.md`, `backlog/work/B1.55/closing-pr-body.md`.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
