Closing lane (`backlog/CLAUDE.md` "Closing a card") for B6.1 — Escape clears the new-todo title (§29), feature PR
#264 merged as 36846c1. The agent runner opened the PR and made it ready on issue #261 (D-27). The lead asked for
this closing lane in the session. The checklist is the plan, so there is no `Plan approved by` line. B6.1 is the first
card of epic E6, batch 1 (D-33).

Files:

- `backlog/plan/E6-todos-cues.md`: B6.1 `**Status: Done** — 36846c1 (#264)`, with 20 AC-29.n tests green:
  - unit 241 → 260: 14 pinned rows for AC-29.3–29.5 landed green first, then 5 red rows for AC-29.1, 29.2 and 29.6,
    proven by `verify-red.sh`;
  - e2e 52 → 53 (AC-29.7);
  - mutation 92.62 (the component is out of mutation scope);
  - unattended and no-rework 1/1 (D-29), one runner run.
- `backlog/README.md`:
  - Remaining row 111 removed; `~~B6.1~~` in node 111.
  - Totals updated: E6 1/0/5, total 75/1/40 of 116.
  - The blank line that split rows 111–116 from the Remaining table (left by the filing PR #259) is removed, so the
    E6 rows render as table rows again (Prettier aligned).
- `spec/technical-requirements.md`: §29 index row ✗ → ✅.
- `docs/metrics.md`: B6.1 Green column moved from the branch sha 6a60e13 to the merged sha 36846c1.
- `backlog/work/B6.1/closing-pr-body.md`: this body (Closing step 6).

`spec/features-map.md` F27 is already ✅ from the feature PR's own `docs(map)` commit. No other Remaining row was
blocked by B6.1.

D-29 for issue #261:

- `scripts/metrics/unattended.sh 261` → `unattended 1/1 = 100.0 %` (0 messages).
- `scripts/metrics/no-rework.sh 264` → `no-rework 1/1 = 100.0 %` (0 change requests).
- One runner run: 61 turns, USD 5.05, result `success`, run marker `ready`, no stop for a ruling.
- Plan review took 2 rounds and went the D-27 path (tier medium, reviewer approval, no lead gate). Diff review took 1
  pass and found 0 findings.
- §29 is a new section (D-33). It lifts nothing from another section's Out of scope and landed in `docs(spec)` fe3d8f9.

B1.85 check: this was the first headless run after #252.

- `code-writer` wrote `feat(todos): B6.1 …` (6a60e13). That commit touches `src/components/todo-form.tsx` and
  `docs/metrics.md`, not the map.
- The very next commit was its own `docs(map): F27 Escape clears the new-todo title [B6.1]` (7775102). That commit
  touches `spec/features-map.md` only and comes before the review.
- `path-guard.sh` never refused a write, and the run added no `docs/mistake-log.md` row.

B1.85's own closing goes in its own PR.

Run notes, not defects of the card:

- The run used the runner clone's stale `scripts/agent/run.sh` (its `main` was 31 commits behind; the lead has since
  fast-forwarded it). Because of that it had no per-run `TMPDIR` (B1.88), and the diff-review `reviewer` wrote "Probe
  not run: TMPDIR unset" twice. Its revert probes were traced, not run. The CI gates ran in full and passed.
- The 3 permission denials were `dev-lead` Bash calls:
  - two `scripts/pr-step.sh` calls chained or piped, where pr-step must be called alone;
  - one `for` loop over `scripts/ci/*.sh`.
- None hit the `guard-bash` secret rule.

`check-backlog.sh` OK.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
