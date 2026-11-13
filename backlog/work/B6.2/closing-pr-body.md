Closing lane (`backlog/CLAUDE.md` "Closing a card") for B6.2: the filter links show how many todos each one lists
(§30). Feature PR #266 merged as f2a571e. The agent runner opened the PR and made it ready on issue #262 (D-27). The
lead asked for this closing lane in the session. The checklist is the plan, so there is no `Plan approved by` line.
Epic E6, batch 1 (D-33).

Both closings change the same README totals line, so this branch started from `docs/B6.3-done` (#270). #270 merged
as cd3896e, and `origin/main` was then merged in (41167af), keeping this branch's side, which already held B6.3's
lines. The diff now holds B6.2's lines only.

Files:

- `backlog/plan/E6-todos-cues.md`: B6.2 `**Status: Done** — f2a571e (#266)`:
  - 7 AC-30.n criteria green: unit 241 → 245 (AC-30.4 pinned green first; AC-30.1 in the lib, AC-30.2–30.3 in the
    component, red proven by `verify-red.sh`); e2e 52 → 55 (AC-30.5–30.7);
  - mutation 92.68 (`filter-counts.ts` 100);
  - unattended and no-rework 1/1 (D-29), two runner runs.
- `backlog/README.md`:
  - Remaining row 112 removed; `~~B6.2~~` in node 112.
  - Totals updated: E6 3/0/3, total 78/0/39 of 117.
- `spec/technical-requirements.md`: §30 index row ✗ → ✅.
- `docs/metrics.md`: B6.2 Green column moved from the branch sha 3acc3b5 to the merged sha f2a571e.
- `backlog/work/B6.2/closing-pr-body.md`: this body (Closing step 6).

`spec/features-map.md` F28 is already ✅ from the feature PR's own `docs(map)` commit (d7110b8, right after `feat`
3acc3b5, B1.85). No other Remaining row was blocked by B6.2.

D-29 for issue #262:

- `scripts/metrics/unattended.sh 262` → `unattended 1/1 = 100.0 %` (0 messages).
- `scripts/metrics/no-rework.sh 266` → `no-rework 1/1 = 100.0 %` (0 change requests, no human commit).
- Two runner runs, USD 7.89 in all:
  - The first took 71 turns and USD 6.89, and ended `ready`.
  - #265 (B6.3) then merged first, and #266 conflicted on the `spec/technical-requirements.md` index (§30 and §31 were
    both added after §29).
  - The lead chose a rerun over editing the runner's branch. `run.sh 262` took 32 turns and USD 1.00. It went to
    Loop 9: merged `origin/main` (9337123), resolved the index, ran review pass 4 ("ready for PR"), and waited for CI
    before `ready`.
- Plan review took 2 rounds and went the D-27 path (tier medium). Diff review found 1 issue in pass 1: the count span
  took no colour class. It was fixed in f957cdd, and pass 2 said ready.
- §30 lifted "counts on the links" from §12's Out of scope in its own `docs(spec)` commit (D-33).

Run notes, not defects of the card:

- The 6 permission denials (4 + 2) were `dev-lead` or role Bash calls:
  - `scripts/pr-step.sh` piped;
  - a `for` loop over `scripts/ci/*.sh`;
  - one probe step.
- None hit the `guard-bash` secret rule.
- The `spec/technical-requirements.md` conflict comes from that index being outside B1.89's union merge. This is
  noted for a possible follow-up card, not filed here.

`check-backlog.sh` OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
