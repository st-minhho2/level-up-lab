Filing lane (`backlog/CLAUDE.md` "Filing a card") for three follow-ups of B1.89 (#253): B1.92, B1.93, B1.94. The
checklist is the plan; no `Plan approved by` line. Filing decides nothing; `dev-lead` plans each card when it is
picked.

- **B1.92** · A union merge's duplicate row reaches CI before any guard reads it — Loop 9's clean merge runs
  `mark-reviewed.sh` (lint, typecheck, test) only, so the duplicate a `merge=union` merge leaves is named first by CI
  (B1.89 plan, first cost). Depends on ~~B1.89~~.
- **B1.93** · Eight smokes remove the caller's directory when `mktemp -d` fails — `TMP="$(cd "$(mktemp -d)" && pwd -P)"`
  plus an `rm -rf "$TMP"` exit trap in `run-smoke.sh`, `feature-map-smoke.sh`, `compose-smoke.sh`, `githooks-smoke.sh`,
  `metrics-smoke.sh`, `next-task-smoke.sh`, `prune-smoke.sh`, `worktree-smoke.sh` (B1.89 diff review pass 1).
- **B1.94** · CI never runs table-merge-smoke, whose verdict follows the host's own git attributes — CI runs only
  `hook-smoke.sh`; a per-user `git/attributes` turns T9 red (measured on f1bc7fb; B1.89 diff review pass 2 note).
  Depends on ~~B1.89~~.

Files:

- `backlog/plan/E1-todos.md`: the three cards at the end, `**Status: Open**` with grep/line evidence
- `backlog/README.md`: totals (E1 57/1/32 of 90, total 74/1/33 of 108); Remaining rows 108–110; nodes S108–S110
- `backlog/work/B1.92/filing-pr-body.md`: this body

Open alongside #256 (B1.90, B1.91, steps 106–107): the second of the two to merge recounts the README totals and keeps
both sets of rows and nodes. Not filed: `.gitattributes` in CODEOWNERS (a `.github/` change, the lead's call).

`check-backlog.sh` OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
