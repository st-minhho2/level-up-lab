<!-- Title: chore(scripts): B1.97 the shared tables leave Prettier -->

## Item

B1.97 — A row wider than its column makes Prettier re-pad the whole shared table (tooling, no spec section)

- spec: none — tooling (`.prettierignore`, the smoke, the scripts guide); no `src/` change, no section
- test: `scripts/table-merge-smoke.sh` T13–T15 new (no `(red)` marker: smoke only, as B1.89/B1.96).
  - Red `729ae12`: "3 of 15 probes FAILED" (T13–T15: merge clean, guard names every row kept twice); T1–T12 ok.
  - Green `f93572b`: "15 probes OK" (bash 3.2.57; run locally, the smoke is in no CI job, B1.94).
  - `hook-smoke.sh` 726 OK, `tier-smoke.sh` 9 OK.
  - `pnpm test` 280, e2e 64, mutation 92.74 (no `src/` change; reviewer).
- acceptance: 4 of 4.
  - A wider row no longer rewrites the other rows: the three files are in `.prettierignore` (T13–T15: side a's diff
    `1 0`).
  - The new probes and T1–T12 pass, bash 3.2-safe; T6, T7, T12 still catch a re-pad.
  - The scripts guide names the rule (`scripts/CLAUDE.md`, the smoke's row and a line under the table).
  - The PR carries `config-change-approved`.

## Plan

Copied from `backlog/work/B1.97/plan.md`.

Approach: the card's first way. `.prettierignore` names the three union-merged files, so `format-after-edit.sh`,
Lefthook's `prettier --check` and `pnpm lint` leave them as written; a new row is appended unaligned and no other row
moves. The second way (fixed wide columns + a width guard) needs a new `scripts/ci/` guard and a one-time rewrite of
every row of three tables, itself a re-pad against every open branch. Measured on a scratch copy of `origin/main`
d106fe9 (prettier 3, git 2.39): a wide row formatted as the hook does → union keeps rows twice (map F1…, metrics
B5.6 …, index §5 …); with the three paths ignored → clean merge, each row once, guards OK.

Costs, for the lead to accept:

- **No formatter on these three files.** The existing rows stay aligned (no rewrite now, so no re-pad lands on open
  branches); new rows are unaligned in the raw Markdown, and render the same. A hand re-pad is still possible and
  still caught by T6, T7, T12 (in CI only after the push, B1.92's gap).
- **The smoke now needs `node_modules`** (it runs `node_modules/.bin/prettier` as the hook does). B1.94's CI step
  must run after `pnpm install`; every CI job already does.
- **A project path through a symlink skips the ignore** (review r1, measured): Prettier matches `.prettierignore`
  against Node's physical cwd, so `format-after-edit.sh` with `CLAUDE_PROJECT_DIR=/var/…` (macOS link to
  `/private/var`) still re-pads (`35 34`). Worktrees here live under `/Users`, so no session today; T6, T7, T12 stay
  the net.

No advice (tier quick, no section). Risk tier **high** (`.prettierignore` is CONFIG_PROTECTED), so the lead's
`approve` is needed and the PR carries `config-change-approved` (D-19). `dev-lead` writes `scripts/` (as B1.89, B1.96).

### Files

| File                           | Change                                                                                   | Why        |
| ------------------------------ | ---------------------------------------------------------------------------------------- | ---------- |
| `.prettierignore`              | the three union-merged paths, with a comment naming B1.97 and the append-only rule       | Acceptance |
| `scripts/table-merge-smoke.sh` | T13–T15 below; header lists them                                                         | Test line  |
| `scripts/CLAUDE.md`            | the smoke's row says T1–T15 and needs `node_modules`; one line under the table: the rule | Acceptance |
| `backlog/work/B1.97/*`         | plan, review, pr-body                                                                    | pipeline   |

### Interfaces touched

No flag, variable, exit code or error line. Smoke: `fmt <file>` runs `$ROOT/node_modules/.bin/prettier --write` from
the scratch repo's top level (exit 2 if the binary is missing); `wide_once <file> <key-a> <key-b>` = `kept_once` and
side a's own commit (`a^1`) changes exactly `1 0` lines of the file (`git diff --numstat main a^1`).

- **T13** map: side a appends `F905` with a 180-char Feature cell, then `fmt`; side b appends `f_row F906`.
- **T14** metrics: side a appends `B9.905` with a 180-char § cell, then `fmt`; side b appends `c_row B9.906`.
- **T15** index: side a adds contract 905 with a 180-char Contents cell, then `fmt`; side b `add_section 906`.

Each: clean merge, both rows once, the file's guard OK, side a's diff one added line.

### Verification

All with `/bin/bash` (3.2).

- **Red** `test(scripts): B1.97 table-merge-smoke probes a row wider than its column` — "Red because Prettier
  re-pads the table, so union keeps every row twice": expected "3 of 15 probes FAILED" (T13–T15), T1–T12 ok. No
  `(red)` marker: `verify-red.sh` judges vitest commits, so it reports none here (as B1.89, B1.96).
- **Green** `chore(scripts): B1.97 the shared tables leave Prettier` → "15 probes OK".
- `pnpm lint && pnpm typecheck` clean; every `scripts/ci/check-*.sh` OK; `hook-smoke.sh`, `tier-smoke.sh` OK;
  `check-plan-scope.sh` OK; CI green.

### Work breakdown

| Step | Role     | Produces                                 | Commit                                                                      |
| ---- | -------- | ---------------------------------------- | --------------------------------------------------------------------------- |
| 1    | dev-lead | red probes T13–T15                       | `test(scripts): B1.97 table-merge-smoke probes a row wider than its column` |
| 2    | dev-lead | ignore entries, doc                      | `chore(scripts): B1.97 the shared tables leave Prettier`                    |
| 3    | reviewer | diff review                              | `docs(backlog): B1.97 review pass N`                                        |
| 4    | dev-lead | draft PR, label `config-change-approved` | —                                                                           |

Not in scope: B1.95's files (`scripts/agent/run*.sh`, `.devcontainer/runner/`), `.claude/`, a CI job for the smoke
(B1.94), Loop 9's post-merge guards (B1.92), re-aligning or un-aligning existing rows.

Plan review: approved, round 1 (0b447c7; its 3 notes folded in) · Plan approved by: lead, 2026-11-14 · Rounds: 1

## Map delta

None: tooling card, no `spec/features-map.md` row.

## Review

`/review-loop`: 1 pass of 3 (`backlog/work/B1.97/review.md`). Verdict: ready for PR, 0 findings.

| Pass | Finding | Disposition |
| ---- | ------- | ----------- |
| 1    | none    | —           |

Revert probes, run on a clone under `$TMPDIR`: dropping only one of the three `.prettierignore` lines fails only its
probe (map → T13, metrics → T14, index → T15), `1 of 15`. The real `format-after-edit.sh` on a 180-char map row
(physical path) changed `1 0` lines; Lefthook's `prettier --check` with ignored and formatted files mixed → rc 0.

Plan review: 1 round, approved, 0 blocking; 3 notes folded into the plan (symlink cost, no `(red)` marker, PR/label
step).

Riskiest unfalsified: a session whose `CLAUDE_PROJECT_DIR` reaches the checkout through a symlink still re-pads on
edit (Prettier matches the ignore against the physical cwd), and Lefthook would pass it; only T6, T7, T12's guards in
CI catch the doubled rows, after the push. Plan cost, measured in plan review r1. `verify-red.sh B1.97` prints "no
(red) commit", expected for a smoke-only red. No `docs/metrics.md` per-card row (as B1.89, B1.96).

## Evidence

- AC met: 4/4
- tier: high
- plan deviations: none
- trace: n/a

## Checklist

- [ ] **Diff matches the approved plan**: no file outside the Files table, no interface outside the list.
- [ ] Red commit precedes the feat commit; no `feat(` commit touches `*.test.*` or `e2e/**`.
- [ ] Every `AC-§.n` of the section is a test title; mutation on `src/lib` + `src/actions` ≥ 70 %.
- [ ] No new `eslint-disable` / `@ts-ignore` / `@ts-expect-error`; no protected config change (or label `config-change-approved` with the reason).
- [ ] Migrations reviewed as SQL; `prisma/seed.ts` updated if a table changed.
- [ ] `spec/features-map.md` row moved; `docs/metrics.md` per-card row filled; mistake-log updated if a known mistake repeated.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
