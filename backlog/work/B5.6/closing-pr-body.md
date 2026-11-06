Closing lane (`backlog/CLAUDE.md` "Closing a card") for B5.6 — Escape closes the due-date editor without saving (§28),
feature PR #235 merged as 8d61eda. The PR was opened and made ready by the agent runner on issue #225 (D-27); the lead
asked for this closing lane in the session. The checklist is the plan; no `Plan approved by` line. B5.6 is the last
card of epic E5.

Files:

- `backlog/plan/E5-todos-keys.md`: B5.6 `**Status: Done** — 8d61eda (#235)`, 15 AC-28.n tests green (unit 227 → 241:
  10 pinned tests for AC-28.4–28.6 landed green first, 4 red tests for AC-28.1–28.3 proven by `verify-red.sh`; e2e
  51 → 52, AC-28.7), mutation 92.62 (the component is out of mutation scope); unattended and no-rework 1/1 (D-29), one
  runner run
- `backlog/README.md`: Remaining row 93 out; `~~B5.6~~` in node 93; totals updated (E5 6/0/0, total 68/0/31 of 99)
- `spec/technical-requirements.md`: §28 index row ✗ → ✅
- `docs/metrics.md`: B5.6 Green column on the merged sha (8d61eda)
- `backlog/work/B5.6/closing-pr-body.md`: this body (Closing step 6)

`spec/features-map.md` F26 is already ✅ from the feature PR. No other Remaining row was blocked by B5.6.

D-29 for issue #225: `scripts/metrics/unattended.sh 225` → `unattended 1/1 = 100.0 %` (0 messages);
`scripts/metrics/no-rework.sh 235` → `no-rework 1/1 = 100.0 %` (0 change requests). One runner run: 82 turns, USD
5.66, no stop for a ruling, 0 `guard-bash` secret-rule denials. Plan review took 2 rounds and went the D-27 path
(reviewer approval, no lead gate); diff review 1 pass, 0 findings. Lifting Escape from §15's Out of scope was allowed
by D-32 and landed in `docs(spec)` 406927e.

Mistake log: the run added 2 rows to `docs/mistake-log.md` (2026-11-06), both with "none yet" as prevention:

- `dev-lead` was assigned step 4 (`docs(map)`, the F26 flip), but `spec/features-map.md` is outside its paths;
  `path-guard.sh` blocked it and the commit was re-dispatched to `code-writer`.
- The diff-review `reviewer` ran a mutation probe with `TMPDIR` unset, so its edits landed on the worktree's
  `src/components/todo-due-date.tsx` (uncommitted; `dev-lead` restored it).

Cards for both preventions are being filed in a separate backlog PR, not here.

Known deviation, from the feature PR body: step 4's `docs(map)` commit was written by `code-writer`, not `dev-lead`
(same file and content as the plan's Files table).

`check-backlog.sh`, `check-features-map.sh`, `check-spec-sections.sh` OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
