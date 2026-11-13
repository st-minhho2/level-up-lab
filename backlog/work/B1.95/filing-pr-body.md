Filing lane (`backlog/CLAUDE.md` "Filing a card") for B1.95: `scripts/agent/run.sh` runs its own scripts from a
clone that can be behind `origin/main`, and nothing says so. The lead asked for the card in the session. The checklist
is the plan, so there is no `Plan approved by` line. Filing decides nothing; `dev-lead` plans the card when it is
picked.

Found on 2026-11-13, during E6 batch 1:

- The runner container's clone was at bd99f86, 31 commits behind `origin/main` (278ee80).
- Its `run.sh` predated B1.82. `run.sh 262` and `run.sh 263` skipped with "[run] skip #262: 3 agent branches in
  flight", counting the merged `feat/B5.5-agent` and `feat/B5.6-agent`.
- It also predated B1.88. Run 261 (B6.1, #264) had no per-run `TMPDIR`, and its diff-review `reviewer` wrote "Probe
  not run: TMPDIR unset".
- The card's worktree was cut from the fresh `origin/main`, so the role prompts were current and only the runner's own
  logic was stale. That is why nothing looked wrong.
- The lead's `git merge --ff-only origin/main` in the container fixed it by hand.

B1.73 (the compose header names a deleted branch) is a different gap in the same setup steps; this card does not
overlap it.

Files:

- `backlog/plan/E1-todos.md`: card B1.95 appended, with the status evidence, a test line (a `run-smoke.sh` probe with
  a fixture clone one commit behind) and the acceptance. The proposed acceptance: refuse when behind, never
  self-update, still run when ahead, refuse when the fetch fails, document the check, and add
  `config-change-approved`.
- `backlog/README.md`:
  - Remaining row 117 and node S117 added.
  - Totals updated: E1 58/0/35 of 93, total 76/0/41 of 117.
- `backlog/work/B1.95/filing-pr-body.md`: this body.

`check-backlog.sh` OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
