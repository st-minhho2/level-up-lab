# B1.83 plan — unattended.sh ends the window at the wrapper's own ready (tooling, no §)

Approach: `scripts/pr-step.sh ready <n>` creates the label `pr-step-ready` (first use; `--force` after), runs
`gh pr ready`, then adds the label to the PR through REST;
`unattended.sh` ends the window at the latest `ready_for_review` at or before the PR's first `pr-step-ready` label,
and keeps today's rule (first ready, else creation) for a PR without that pairing. Earlier ready events are counted
in a new last column `touches`, never as messages. Label name: `pr-step-ready`, not `runner-ready`, because
interactive card sessions run the same step (dev-lead Loop 9), so their PRs carry it too. No advice (tier quick, no
section). Risk tier **high** (`scripts/pr-step.sh`, which guard-bash rule 5 and `settings.json` trust, D-28) → the
lead's `approve`; the PR carries `config-change-approved` (D-19). Prototype on `origin/main` (7c4300e), bash 3.2.

## Files

| File                            | Change                                                                                                      | Why        |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------- | ---------- |
| `scripts/pr-step.sh`            | `ready` (not `--undo`): `gh label create … --force`, `gh pr ready`, `gh api` POST label; header             | Acceptance |
| `scripts/pr-step-smoke.sh`      | R7 expects label create before and the label add after `pr ready 7`, none for `--undo`; R16; shim `GH_FAIL` | Test line  |
| `scripts/metrics/unattended.sh` | `ready` from the label pairing, else today's rule; `touches` column; header                                 | Acceptance |
| `scripts/metrics-smoke.sh`      | M44–M47 (PRs #619–#622); M30, M31, M33, M39, M41 rows end in `\t0` (touches)                                | Test line  |
| `backlog/work/B1.83/*`          | plan, review, pr-body                                                                                       | pipeline   |

## Interfaces touched

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

## Verification

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

## Work breakdown

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

Plan review: · Plan approved by: · Rounds: 1
