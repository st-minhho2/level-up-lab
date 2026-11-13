Closing lane (`backlog/CLAUDE.md` "Closing a card") for B6.3 — an open todo due today says so (§31), feature PR #265
merged as 7606f07. The agent runner opened the PR and made it ready on issue #263 (D-27). The lead asked for this
closing lane in the session. The checklist is the plan, so there is no `Plan approved by` line. Epic E6, batch 1 (D-33).

Files:

- `backlog/plan/E6-todos-cues.md`: B6.3 `**Status: Done** — 7606f07 (#265)`:
  - 6 AC-31.n criteria green: unit 241 → 246 (AC-31.1 in `src/lib/todo-due-today.test.ts`, AC-31.2–31.5 in the
    component), red proven by `verify-red.sh`; e2e 52 → 53 (AC-31.6);
  - mutation 92.57 (`todo-due-today.ts` 90.91);
  - unattended and no-rework 1/1 (D-29), one runner run.
- `backlog/README.md`:
  - Remaining row 113 removed; `~~B6.3~~` in node 113.
  - Totals updated: E6 2/0/4, total 77/0/40 of 117.
- `spec/technical-requirements.md`: §31 index row ✗ → ✅.
- `docs/metrics.md`: B6.3 Green column from the placeholder `feat B6.3` to the merged sha 7606f07.
- `backlog/work/B6.3/closing-pr-body.md`: this body (Closing step 6).

`spec/features-map.md` F29 is already ✅ from the feature PR's own `docs(map)` commit (aebbe63, right after `feat`
8f98c25, B1.85). No other Remaining row was blocked by B6.3.

D-29 for issue #263:

- `scripts/metrics/unattended.sh 263` → `unattended 1/1 = 100.0 %` (0 messages).
- `scripts/metrics/no-rework.sh 265` → `no-rework 1/1 = 100.0 %` (0 change requests).
- One runner run: 63 turns, USD 7.40, result `success`, run marker `ready`.
- Plan review took 2 rounds and went the D-27 path (tier medium). Diff review took 1 pass with 0 findings. Its revert
  probes ran on a copy under the run's own `$TMPDIR` (B1.88), now that the runner clone was current.
- §31 lifted the due-today case of "a due-soon highlight" from §17's Out of scope in its own `docs(spec)` commit
  (D-33).

Known deviation, from the feature PR body: `e2e/17-overdue.spec.ts` (F15) was extended in the red commit, though issue
#263's file list named only the new e2e file. AC-17.7's whole-row check rejects the new `Due today` text, so the row
helpers gained a `dueToday` part. No check was loosened. The plan named the change under "Costs the lead takes", and
the lead merged #265 with it.

Run notes, not defects of the card:

- The 8 permission denials were all `dev-lead` or role Bash or Write calls:
  - `scripts/pr-step.sh` piped;
  - a `for` loop over `scripts/ci/*.sh`;
  - writes and an unzip under `/tmp` instead of `$TMPDIR`.
- None hit the `guard-bash` secret rule.
- In `docs/metrics.md` the B6.3 row sits between B1.76 and B1.78, where the union merge (B1.89) placed it. The order
  is left as it is: no guard reads it.

`check-backlog.sh` OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
