## Item

B1.83 — unattended.sh takes the first ready_for_review, whoever made it (tooling, no spec section)

- spec: none — tooling (D-29 metrics, runner); no `src/` change, no section
- test: `scripts/pr-step-smoke.sh` R7 (changed), R16 (new); `scripts/metrics-smoke.sh` M44–M47 (new), M30, M31, M33, M39, M41 rows pin `touches` 0; review pass 1 adds M48, M49. Red `4539715`: pr-step-smoke 14 ok, 2 FAIL (R7, R16); metrics-smoke 36 ok, 9 FAIL (M44, M45 read ready 01:10). Green `5deb3d1`: 16 ok, 45 ok; after `dfd3602` metrics-smoke 47 ok. hook-smoke 601 OK; vitest 241 (unchanged); e2e and mutation not run (no `src/`). Live: `unattended.sh` columns 1–7 identical to origin/main's (7/8 = 87.5 %), touches 0 on all 8; `no-rework.sh 211 216 221 229 232 235` unchanged (6/6 yes).
- acceptance: 6 of 7 met — label added by the wrapper's ready step, created on first use (R7, R16); window ends at the ready paired with that label, fallback for older PRs (M44, M46–M49, M30–M41); undone ready in `touches`, not a message (M44, M45); `no-rework.sh` verdicts kept; label `config-change-approved` on the PR. Pending: the first live `ready` (this PR's own Loop 9 step) shows `pr-step-ready` on GitHub.
- risk tier: high (`scripts/pr-step.sh`, D-28); label `config-change-approved` (D-19)

## Plan

### B1.83 plan — unattended.sh ends the window at the wrapper's own ready (tooling, no §)

Approach: `scripts/pr-step.sh ready <n>` creates the label `pr-step-ready` (first use; `--force` after), runs
`gh pr ready`, then adds the label to the PR through REST;
`unattended.sh` ends the window at the latest `ready_for_review` at or before the PR's first `pr-step-ready` label,
and keeps today's rule (first ready, else creation) for a PR without that pairing. Earlier ready events are counted
in a new last column `touches`, never as messages. Label name: `pr-step-ready`, not `runner-ready`, because
interactive card sessions run the same step (dev-lead Loop 9), so their PRs carry it too. No advice (tier quick, no
section). Risk tier **high** (`scripts/pr-step.sh`, which guard-bash rule 5 and `settings.json` trust, D-28) → the
lead's `approve`; the PR carries `config-change-approved` (D-19). Prototype on `origin/main` (7c4300e), bash 3.2.

#### Files

| File                            | Change                                                                                                      | Why        |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------- | ---------- |
| `scripts/pr-step.sh`            | `ready` (not `--undo`): `gh label create … --force`, `gh pr ready`, `gh api` POST label; header             | Acceptance |
| `scripts/pr-step-smoke.sh`      | R7 expects label create before and the label add after `pr ready 7`, none for `--undo`; R16; shim `GH_FAIL` | Test line  |
| `scripts/metrics/unattended.sh` | `ready` from the label pairing, else today's rule; `touches` column; header                                 | Acceptance |
| `scripts/metrics-smoke.sh`      | M44–M47 (PRs #619–#622); M30, M31, M33, M39, M41 rows end in `\t0` (touches)                                | Test line  |
| `backlog/work/B1.83/*`          | plan, review, pr-body                                                                                       | pipeline   |

#### Interfaces touched

`scripts/pr-step.sh ready <n> [--undo]`: arguments, refusals and exit 3 unchanged. New GitHub side effects of `ready`
(lead's `gh` login), in this order, each failure failing the step and skipping what follows:
`gh label create pr-step-ready --force --color 0E8A16 --description "Made ready by scripts/pr-step.sh (B1.83)"`
(creates the repo label, or rewrites its color and description), `gh pr ready <n>`, then
`gh api --method POST "repos/{owner}/{repo}/issues/<n>/labels" -f 'labels[]=pr-step-ready'` (REST, not
`gh pr edit`: the runner image's gh 2.23 also queries Projects (classic) there, which GitHub retired).
`unattended.sh` TSV: `issue card pr labeled ready messages unattended touches` (was 7 columns; share line unchanged).

| Probe | Fixture                                                              | Want                                       | Today             |
| ----- | -------------------------------------------------------------------- | ------------------------------------------ | ----------------- |
| R7    | `ready 7`, then `ready 7 --undo`                                     | view, create, ready, add; view, undo       | no label lines    |
| R16   | ready refused (8, 9); label create, `pr ready`, label add each fails | no label call; rc≠0, the failing call last | create, add: rc 0 |
| M44   | click 01:10, undo 01:20, labeled ready 03:00                         | ready 03:00, 0 yes, touches 1              | ready 01:10       |
| M45   | M44 + lead comment 02:00                                             | ready 03:00, 1 no, touches 1               | 0 yes             |
| M46   | labeled ready 03:00, undo 04:00, ready 04:30 (BEHIND round trip)     | ready 03:00, touches 0                     | no column         |
| M47   | click, undo, ready 03:00, no label (a PR before B1.83)               | ready 01:10, touches 0                     | no column         |

#### Verification

- Red `test(scripts): B1.83 probes for the ready label and unattended touches` (no `(red)` marker: smoke scripts
  only, as B1.79/B1.86; body "Red because …"): `pr-step-smoke.sh` → 14 ok, 2 FAIL (R7, R16); `metrics-smoke.sh` →
  36 ok, 9 FAIL (M44, M45 on the ready time; M30, M31, M33, M39, M41, M46, M47 on the missing column).
- Green `chore(scripts): B1.83 unattended ends at the wrapper's labeled ready`: 16 ok / 45 ok, 0 FAIL (prototype:
  both, `/bin/bash` 3.2). Live: `unattended.sh` (default set, 8 issues) columns 1–7 identical to today (7/8 = 87.5 %),
  touches 0 on all (no PR has the label yet); `no-rework.sh 211 216 221 229 232 235` identical (6/6 yes, file
  untouched). `check-plan-scope.sh`, `check-backlog.sh`, `hook-smoke.sh` OK; `pnpm lint && pnpm typecheck` clean,
  `pnpm test` 241 passed (unchanged). CI runs neither smoke (only hook-smoke): both are run locally and in review.
- gh 2.23 (runner image `level-up-lab-runner-runner`, `--network none`, `GH_DEBUG=api`): `label create … --force`
  sends `POST /repos/o/r/labels` with name, color, description; the `gh api` call sends
  `POST /repos/o/r/issues/1/labels` with `{"labels": ["pr-step-ready"]}` (both seen before the network refusal).
  Live, host gh 2.103: this card's own Loop 9 `ready` is the first real use; then
  `gh pr view <n> --json labels` lists `pr-step-ready` and `unattended.sh`'s PR timeline holds the `labeled` row.

#### Work breakdown

| Step | Role     | Produces                | Commit                               |
| ---- | -------- | ----------------------- | ------------------------------------ |
| 1    | dev-lead | red R7, R16, M44–M47    | `test(scripts): B1.83 …` (above)     |
| 2    | dev-lead | wrapper + unattended.sh | `chore(scripts): B1.83 …` (above)    |
| 3    | reviewer | diff review             | `docs(backlog): B1.83 review pass N` |
| 4    | dev-lead | draft PR, label (D-19)  | —                                    |

Costs:

- Each wrapper `ready` adds a `labeled` event, and `ci.yml` runs on `labeled`: one extra CI run on the same SHA
  (last 8 runs 4–5.5 min); the required checks go pending again, so the lead's merge waits that long after ready.
  Removing it needs a `ci.yml` change (skip a `labeled` event for this label): a follow-up config card, not here.
- History unchanged: every PR so far lacks the label, so #232 still reads ready 00:34:32Z (the click) under the
  fallback; touches is 0 under the old rule, which cannot tell a click from the run's own BEHIND round trip.
- A click left in place (never undone) makes the wrapper's `gh pr ready` a no-op with no event: the window ends at
  the click, as today, touches 0.
- A failed label add leaves the PR ready without the label and the step non-zero: dev-lead prints no "PR … is
  ready", so a runner run records `ended`, and until the label lands `unattended.sh` reads the PR by the old rule.
  Recovery: rerun `scripts/pr-step.sh ready <n>` (gh skips the ready of a ready PR, so only create and add repeat).
  A failed create or `gh pr ready` leaves the PR as it was.
- `no-rework.sh` keeps the first ready (out of scope): on a labeled PR with a click its window starts earlier, which
  can only add rework. `docs/metrics.md` row 28 (method: "the PR's first `ready_for_review`") and `scripts/CLAUDE.md`
  (R1–R15, M1–M43) go stale at merge: outside the lead's Files list for this card; dev-lead files a follow-up card
  (filing lane) after the merge.
- guard-bash rule 5 (`.claude/hooks/guard-bash.sh:140-142`) wants the card worktree's wrapper byte-identical to the
  copy beside the hooks that run. This session opened in a Claude worktree with the card worktree under its
  `.worktrees/`, the layout B1.26 had (its session in `.claude/worktrees/peaceful-gauss-291fcd`, card worktree under
  its `.worktrees/`): it changed the wrapper and every later push and `open` ran, because the hooks resolved in the
  card worktree. If step 2's first push is refused here, dev-lead stops and the lead picks: open a session in the card
  worktree to finish steps 2–4, or push and open the draft by hand. Never worked around.

Plan review: approved, round 2 · Plan approved by: lead, 2026-11-06 · Rounds: 1

## Map delta

None: tooling, no `spec/features-map.md` row.

## Review

Plan review: 2 rounds (round 1: guard-bash rule 5, gh 2.23's `gh pr edit`, failure order; all fixed in round 2).
Diff review: 2 of 3 passes, full text in `backlog/work/B1.83/review.md`.

| Pass | Finding                                                                                | Disposition                                |
| ---- | -------------------------------------------------------------------------------------- | ------------------------------------------ |
| 1    | [1] coverage: no probe pins the label name (dropping `$4 == "pr-step-ready"` survived) | fix now: M48 (`dfd3602`), kills the mutant |
| 1    | [2] coverage: "the first label" not pinned (`head -1` → `tail -1` survived)            | fix now: M49 (`dfd3602`), kills the mutant |
| 2    | none; 10 of 10 one-line mutants killed                                                 | ready for PR                               |

Riskiest unfalsified: `gh pr ready` on an already-ready PR must exit 0 for the rerun recovery and the "click left
in place" cost. Both gh 2.23 (runner image) and 2.103 (host) carry the `Pull request #%d is already "ready for
review"` branch (binary strings, not a run); the live `ready` on this PR is the first real check.

Process note: the first push after the green commit was refused by guard-bash rule 5 (the hooks compare the card
worktree's wrapper with the main checkout's copy), against the plan's B1.26-based expectation; the lead pushes and runs the
ready step from the card worktree. Once main carries the new wrapper, a card worktree with the old one is refused the
same way until it merges `origin/main`.

## Evidence

- AC met: 6/7
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
