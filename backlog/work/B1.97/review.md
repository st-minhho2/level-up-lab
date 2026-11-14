# B1.97 review

## Plan review (round 1)

Plan at 38c9a44 (`docs(backlog): B1.97 plan`); `git diff --stat origin/main...HEAD` → only `backlog/work/B1.97/plan.md`
(origin/main d106fe9). `scripts/agent/tier.sh backlog/work/B1.97/plan.md` → `high`.

| Check                                                                     | Result                                                                                                                                                                                                             |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| every file in the plan belongs to the section's features (map)            | pass: tooling, no section; the Files match the card's Spec line (`.prettierignore`, the smoke, the scripts guide) plus `work/B1.97/*`                                                                              |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma in lib | pass: no `src/` change; no flag, variable, exit code or error line added; `fmt` and `wide_once` are smoke-internal helpers                                                                                         |
| plan follows `advice.md`'s recommendation or states the deviation         | pass: no advice (tier quick, no section); the plan names the card's first way and why not the second (a guard plus a rewrite of every row, itself a re-pad against open branches)                                  |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number | pass: the card's 4 acceptance items; T13–T15 each end in four checkable facts (merge rc 0, both rows once, the file's guard rc 0, side a's numstat `1 0`); 180-char cells stated                                   |
| verification lists exact commands with expected numbers                   | pass: `/bin/bash scripts/table-merge-smoke.sh` → red "3 of 15 probes FAILED" (T13–T15), green "15 probes OK"; lint, typecheck, `check-*.sh`, `hook-smoke.sh`, `tier-smoke.sh`, `check-plan-scope.sh`. Note 4 below |
| work breakdown skeleton → red → green → map → review, convention subjects | pass: red → green → review with Conventional subjects, as B1.96; no skeleton (nothing to stub in a shell probe) and no map step (no section, no features-map row). Note 5 below                                    |
| the section has a `Lead approves spec` box, ticked only by a human        | n/a: tooling card, no section; not ticked by me                                                                                                                                                                    |
| no settled D-n contradicted                                               | pass: D-19 (label stated), D-28 (tier high stated, lead's `approve` needed), D-36 names B1.97 as the fix for the index re-pad; no ruling on formatting or table alignment in `00-decisions.md`                     |
| `scripts/next-task.sh --check B1.97` says no overlap                      | pass: `[next-task] B1.97: no overlap with any Doing or Review card` (rc 0)                                                                                                                                         |

### What I ran (probe on `git clone` under `$TMPDIR`, prettier 3.9.10)

- A 180-char Feature cell appended to the map, `prettier --write spec/features-map.md` from the top level, current
  `.prettierignore` → `35 34` (every row re-padded): the red the plan expects holds.
- Same, with the three paths appended to `.prettierignore` → `1 0`; `prettier --check spec/features-map.md` → rc 0
  ("All matched files use Prettier code style!"); `prettier --check spec/features-map.md docs/metrics.md README.md`
  (Lefthook's form, ignored files mixed with others) → rc 0; `prettier --check .` (`pnpm lint`'s form) → rc 0. So
  the hook, Lefthook and `pnpm lint` all leave the files as written, as the plan says.
- On this branch, `/bin/bash scripts/table-merge-smoke.sh` → `12 probes OK` (T1–T12 green before the red commit).

### Costs for the lead to weigh (approved with these; none blocks)

1. **The ignore misses when the session's project directory path contains a symlink** (confirmed). Prettier matches
   `.prettierignore` against the path relative to Node's physical cwd; `format-after-edit.sh` does `cd "$ROOT"` and
   passes the absolute `tool_input.file_path`. Running the real hook on the probe clone with the three entries
   ignored: `CLAUDE_PROJECT_DIR=/var/folders/…/b197p1` (macOS `/var` → `/private/var`) → `35 34`, the table
   re-padded; `CLAUDE_PROJECT_DIR=/private/var/folders/…/b197p1` → `1 0`. Worktrees here live under `/Users/…`
   (physical), so today's sessions are not hit; a session opened through `/tmp`, `/var` or a symlinked home would
   be. T13–T15 cannot catch it: the smoke's `$R` is `pwd -P`. Lefthook's `prettier --check` would then pass (the
   staged path is relative), so the re-pad would reach the branch unflagged, and T6/T7/T12's guards remain the net.
   Worth one sentence in the plan's Costs; no change to the approach.
2. **Whole files leave Prettier, not only their tables** (stated in the plan): the prose and every other table in
   `docs/metrics.md` and `spec/technical-requirements.md` are no longer formatted or checked.
3. **The smoke needs `node_modules`** (stated): exit 2 without `node_modules/.bin/prettier`; B1.94's CI step must
   run after `pnpm install`.
4. **`scripts/verify-red.sh B1.97` will report no red commit**: the red subject carries no ` (red)` marker, the
   smoke-only precedent of B1.82, B1.88, B1.89, B1.96. The Verification list could name that expected outcome so the
   diff review does not have to infer it.
5. **No "draft PR, label" step** in the Work breakdown (B1.96 had one); the `config-change-approved` label is an
   acceptance item and is stated in prose, so the diff review will check the PR for it.

Verdict: approved

(Approved means ready for the lead's gate: the tier is high, so the lead's `approve` is still needed before any
commit after the plan.)
