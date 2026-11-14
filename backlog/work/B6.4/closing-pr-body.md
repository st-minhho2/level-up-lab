Closing lane (`backlog/CLAUDE.md` "Closing a card") for B6.4: the clear-completed button says how many it will clear
(section 32). Feature PR #278 merged as ca2a58d. The agent runner opened the PR and made it ready on issue #275 (D-27).
The lead asked for this closing lane in the session. The checklist is the plan, so there is no `Plan approved by` line.
Epic E6, batch 2 (D-33).

This is the first of three stacked closing PRs (B6.4 → B6.5 → B6.6). Each branch starts from the one before it, so
the README totals add up. The lead deferred all three until #281 merged, so the runner PRs would not go out of date
again.

Files:

- `backlog/plan/E6-todos-cues.md`: B6.4 `**Status: Done** — ca2a58d (#278)`:
  - 7 AC-32.n criteria green: unit 269 → 273 (AC-32.3 and AC-32.7 pinned green first); e2e 57 → 60;
  - mutation 92.74 (`clear-completed-label.ts` 100);
  - unattended and no-rework 1/1 (D-29), two runner runs.
- `backlog/README.md`:
  - Remaining row 114 removed; `~~B6.4~~` in node 114.
  - Totals updated: E6 4/0/2, total 80/0/39 of 119.
- `spec/technical-requirements.md`: §32 index row ✗ → ✅.
- `docs/metrics.md`: B6.4 Green column moved from the branch sha 05361bf to the merged sha ca2a58d.
- `backlog/work/B6.4/closing-pr-body.md`: this body (Closing step 6).

`spec/features-map.md` F30 is already ✅ from the card's own `docs(map)` commit (a881ff6, right after `feat` 05361bf,
B1.85).

D-29 for issue #275:

- `unattended.sh 275` → 1/1, 0 messages.
- `no-rework.sh 278` → 1/1, 0 change requests.
- Two runner runs, 73 turns and USD 4.68 in all. The first took 54 turns and USD 4.33. The second (19 turns, USD 0.35)
  went to Loop 9 only, after #279 and #280 left the PR out of date.
- Plan review took 1 round (D-27, tier medium). Diff review took 1 pass and said ready.

Known cost, found in this batch:

- B6.4's contract name `30-clear-completed-count.md` is wider than the index's File column, so Prettier re-padded the
  whole of `spec/technical-requirements.md` (0495c50, 67 lines) and of `spec/features-map.md` (a881ff6, 63 lines).
- Under `merge=union`, that re-pad made B6.5's and B6.6's Loop 9 merges keep every row twice.
- B6.5's run restored main's copies through git. B6.6's run stopped, and the lead ruled D-36 (repair by the lead's
  session, 1bb65dd).
- Card B1.97 (#280) prevents the re-pad.

The issue's exact-name rule held: `src/components/clear-completed-button.test.tsx` was updated only in the red commit,
and no e2e selector changed.

All `scripts/ci/check-*.sh` OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
