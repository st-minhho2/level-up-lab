Files cards **B1.84** and **B1.85** through the "Filing a card" lane (`backlog/CLAUDE.md`). The checklist is the plan, so there is no `Plan approved by` line. Both cards come from the two `docs/mistake-log.md` rows that batch 2 of epic E5 logged on 2026-11-06, each marked "Prevented by: none yet". The lead asked for them in the orchestrating session: "file card TMPDIR, features-map".

- **B1.84**: the reviewer's Bash probes are meant to run on a copy under `$TMPDIR`, but nothing checks that `TMPDIR` is set. In the headless run of #225, ten `sed -i` mutations landed on the worktree. They were uncommitted, and dev-lead restored them. B5.5's plan review also wrote a probe file into the worktree.
- **B1.85**: `dev-lead.md` lists the `docs(map)` step in dev-lead's own loop, but dev-lead's path guard refuses `spec/features-map.md`. All three batch-2 runs hit this.

Files:

- `backlog/plan/E1-todos.md`: cards B1.84 and B1.85 (quick, no dependency).
- `backlog/README.md`: totals (E1 51/0/32/83, total 67/0/34/101), nodes S100 and S101, Remaining rows 100 and 101.
- `backlog/work/B1.84/filing-pr-body.md`: this body.

`scripts/ci/check-backlog.sh` → OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
