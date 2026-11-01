# B1.20 review

## Plan review (round 1)

Plan at `2d4bd5f docs(backlog): B1.20 plan`. Contract: card Acceptance (`backlog/plan/E1-todos.md` ### B1.20); tooling,
no §.

| Check                                                                             | Result                                                                                                                                                                                                                                                                                                         |
| --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: no § and no map row (tooling); the four non-paperwork files are the two compare sites the card names, their probe file and the `hooks.md` row the card cites. None is owned by B1.28 (`src/lib/CLAUDE.md`, `src/components/CLAUDE.md`) or B1.29 (`scripts/verify-red.sh`, `scripts/verify-red-smoke.sh`) |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass (n/a): no TypeScript; hook stdin/exit codes and the guard's output/exit codes unchanged, `plan-files.sh` untouched                                                                                                                                                                                        |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: no `advice.md`; the plan states "spec-analyst and advisor skipped" and follows the card's named approach (#63's literal-then-glob, `scripts/next-task.sh:134`; `scripts/metrics/plan-deviations.sh:35` already uses the same form)                                                                       |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: 3 Acceptance clauses, each an exit code or a probe count                                                                                                                                                                                                                                                 |
| verification lists exact commands with expected numbers                           | pass: 8 FAIL at the test commit, 440 OK at the fix. Baseline confirmed: `scripts/hook-smoke.sh` at `2d4bd5f` → "hook-smoke: 416 probes OK"                                                                                                                                                                     |
| work breakdown has skeleton → red → green → map → review with convention subjects | fail: see 1–3. Subjects pass `lefthook.yml` commit-msg. Skeleton and map steps are missing without a stated reason, the role for steps 1–2 cannot write those files as a subagent, and the PR title is not named                                                                                               |
| the section has a `Lead approves spec` box, ticked only by a human                | pass (n/a): no section; nothing ticked                                                                                                                                                                                                                                                                         |
| no settled D-n contradicted                                                       | pass: D-19 (the agent adds `config-change-approved` for `.claude/hooks/`, `.claude/docs/`, `scripts/ci/`, which match `check-config-change.sh` PROTECTED) is followed. The card's "human-only" label wording predates D-19 and is stale: out of scope → follow-up (card text, not this plan)                   |
| `scripts/next-task.sh --check B1.20` on the committed plan says no overlap        | pass: `[next-task] B1.20: no overlap with any Doing or Review card` (exit 0)                                                                                                                                                                                                                                   |

Prototype I re-ran on a scratch copy (`$TMPDIR/probe-b120-1`, /bin/bash 3.2.57): the L1–L6 block as described, x 4
layouts, gave 8 FAIL at HEAD (exactly L1 and L5 per layout), and 24/24 ok with the two planned lines. Every S1–S15 /
C1–C8 probe stayed ok. L3/L4 catch a "literal only" fix, and L1/L5 catch a fix that reverts either site, so each
changed line is pinned.

Verdict: changes requested

1. **Role that cannot do its step.** Steps 1–2 name `dev-lead`, but `dev-lead`'s frontmatter path-guard allows only
   `backlog/*`, `docs/metrics.md`, `docs/mistake-log.md`. I confirmed it:
   `.claude/hooks/path-guard.sh 'backlog/*' 'docs/metrics.md' 'docs/mistake-log.md' '!backlog/00-decisions.md'` on
   `scripts/hook-smoke.sh` → exit 2. `.claude/hooks/plan-scope.sh`, `scripts/ci/check-plan-scope.sh` and
   `.claude/docs/hooks.md` are refused the same way. These steps work only in the lead's main session (no
   `agent_type`, card Owner: Lead), not as a dispatched `dev-lead` subagent or a `claude --agent dev-lead` session.
   State which one runs them.
2. **PR title and its metric cost not named.** `pr-step.sh draft "<title>"` needs a title, and the squash title
   decides `scripts/metrics/change-failure-rate.sh`. Both lines this card fixes came from B1.17's PR #60 (`25fee24`,
   merged 2026-10-30). A `fix(` title therefore counts this PR as a repair of B1.17 within the 14-day window. That
   count is accurate, but it raises the batch CFR above its 6.7 % baseline. A `chore(` title hides a real repair.
   B1.24's plan named its title for the same reason. Name the title, and state which effect the lead is accepting.
3. **Skeleton and map steps missing without a reason.** Add one line: no skeleton (no § function, hook-smoke has no
   `NotImplementedError` analogue) and no map move (tooling has no `features-map.md` row).

Build note (not a reason): stage only `src/app` in the L4–L6 commits. In my first prototype, `git add -A` in the `.` and
`.claude/worktrees/n` worktrees staged the nested worktrees as gitlinks. L4 then failed there regardless of the fix
(10 FAIL instead of 8).

Out of scope → follow-up (D-25): `scripts/CLAUDE.md` hook-smoke row says "S1–S15; check-plan-scope C1–C5" (stale since
C6–C8; the plan already notes it). `hook-smoke.sh` is not run by `.github/workflows/ci.yml`. The "every existing
probe still passes" clause is therefore proven only locally. Input: `grep -l hook-smoke .github/workflows/*` → none.

## Plan review (round 2)

Plan at `f76a926 docs(backlog): B1.20 plan round 2 (review r1: role, PR title, no skeleton/map)`. Round 2 changed only
the staging note in the probe block and the work-breakdown section (`git diff 2d4bd5f f76a926 -- backlog/work/B1.20/plan.md`).
The Files table, the interfaces and the verification commands are as round 1 reviewed them.

Round-1 reasons:

1. Resolved. Steps 1–2 now name "main session": the lead's session acting as dev-lead via `/work-next`, with no
   `agent_type`. The plan states that the `dev-lead` subagent's path-guard refuses these files. Round 1 confirmed that
   refusal (exit 2). The plan's "as B1.24 and B1.27 did" is not recorded in those cards' artifacts, and B1.27's plan
   table says `dev-lead`. The claim is not load-bearing, so it is not a reason.
2. Resolved. The PR title is `chore(hooks): B1.20 plan-scope matches bracketed paths` (54 characters). It matches
   `pr-step.sh draft`'s `^(feat|fix|chore|test|docs)\([a-z]+\): B1\.20 [ -~]+$` and is ≤ 80. The stated cost is
   accurate. `scripts/metrics/change-failure-rate.sh` counts only titles matching `^((fix|revert)(\(|:|!)|Revert ")`.
   B1.17 is `Done — 25fee24 (#60)`, merged 2026-10-30, and #60 added both `.claude/hooks/plan-scope.sh` and
   `scripts/ci/check-plan-scope.sh` (code paths, outside `*.md`). A `fix(` title merged by 2026-11-13 would therefore
   count as one repair, and `chore(` leaves it uncounted. The lead accepts that at the gate. Batch-5 precedent is
   the same: B1.24 (#124) and B1.27 (#121) also merged as `chore(scripts): …` repairs.
3. Resolved. The plan now has one line for each omission: no skeleton (no § function, no `NotImplementedError`
   analogue) and no map step (no `features-map.md` row).

| Check                                                                             | Result                                                                                                                                                                                                                                                                                                                                                        |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: no § and no map row (tooling); Files unchanged since r1. No sibling overlap: B1.29's plan (`origin/chore/B1.29-verify-red-base`) lists `scripts/verify-red.sh`, `scripts/verify-red-smoke.sh`, `scripts/CLAUDE.md`; B1.28's lists `src/lib/CLAUDE.md`, `src/components/CLAUDE.md`; B1.20 lists none of them (it keeps `scripts/CLAUDE.md` out of scope) |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass (n/a): no TypeScript; stdin JSON, exit codes and guard output unchanged; `plan-files.sh` untouched                                                                                                                                                                                                                                                       |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: no `advice.md`; the plan states that spec-analyst and advisor were skipped and follows #63's literal-then-glob (`scripts/next-task.sh:133-134`, re-read at HEAD)                                                                                                                                                                                        |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: 3 Acceptance clauses, each an exit code or a probe count                                                                                                                                                                                                                                                                                                |
| verification lists exact commands with expected numbers                           | pass: 8 FAIL (L1, L5 × 4 layouts) at the test commit, 440 OK at the fix. Baseline re-run at `f76a926` with `/bin/bash scripts/hook-smoke.sh` → "hook-smoke: 416 probes OK"                                                                                                                                                                                    |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: red → fix → review. The skeleton and map omissions are now explained. The subjects match `lefthook.yml` commit-msg; `check-feat-commits.sh` judges only `feat(` subjects, and the fix commit touches no `*.test.*`/`e2e/` file                                                                                                                          |
| the section has a `Lead approves spec` box, ticked only by a human                | pass (n/a): no section; nothing ticked                                                                                                                                                                                                                                                                                                                        |
| no settled D-n contradicted                                                       | pass: D-19 is followed (the agent adds `config-change-approved` for `.claude/`, `scripts/ci/`). D-25 is followed (out-of-scope items below are not reasons). D-7 n/a                                                                                                                                                                                          |
| `scripts/next-task.sh --check B1.20` on the committed plan says no overlap        | pass: `[next-task] B1.20: no overlap with any Doing or Review card` (exit 0)                                                                                                                                                                                                                                                                                  |

Verdict: approved (ready for the lead's gate, not approved for build)

Notes (not reasons):

- The plan is 63 lines against `planning.md`'s "≈ 40". Round 1 accepted the same shape. Recent approved plans run
  the same length: B1.24 64 lines, B1.26 67, B3.1 69.
- The `.claude/docs/hooks.md` row has no step. It belongs in step 2's `fix(hooks)` commit (a doc file, so no
  test-file rule applies).
- The branch is one commit behind `origin/main`: `73c6da2` (#129) touches only `backlog/00-decisions.md` (D-25), none
  of the plan's files.

Out of scope → follow-up (D-25), unchanged from r1: the stale `scripts/CLAUDE.md` hook-smoke row ("C1–C5"); CI does not
run `hook-smoke.sh` (`grep -l hook-smoke .github/workflows/*` → none); the card's "human-only" label wording predates
D-19.

## Diff review (pass 1)

SCOPE: tooling (no §; the card's Acceptance in `backlog/plan/E1-todos.md` ### B1.20 is the contract). The range is
`origin/main...HEAD` (merge-base `33e7f7d`). The local `main` ref is stale, so `main...HEAD` lists 119 files. The card
itself changes 7: the 4 plan files plus `plan.md`, `review.md` and `pr-body.md`.

### Commands (last line of each, run at `fb75fc0`)

| Command                                        | Result                                                                                                                                                                                                                                                                    |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                                    | exit 0. 1 warning, already on main: `src/components/todo-form.tsx:23` react-hooks/exhaustive-deps (not a card file). "All matched files use Prettier code style!"                                                                                                         |
| `pnpm typecheck`                               | exit 0                                                                                                                                                                                                                                                                    |
| `pnpm test`                                    | `Tests 202 passed (202)` (33 files)                                                                                                                                                                                                                                       |
| `pnpm test:e2e`                                | `43 passed (1.2m)`                                                                                                                                                                                                                                                        |
| `pnpm test:mutation`                           | `Final mutation score of 93.40 is greater than or equal to break threshold 70`                                                                                                                                                                                            |
| `scripts/ci/check-suppressions.sh`             | `OK: no new suppressions`                                                                                                                                                                                                                                                 |
| `scripts/ci/check-config-change.sh`            | exit 1 locally, as expected. It lists `.claude/docs/hooks.md`, `.claude/hooks/plan-scope.sh` and `scripts/ci/check-plan-scope.sh`. Draft PR #132 already carries `config-change-approved` (D-19)                                                                          |
| `scripts/ci/check-feat-commits.sh`             | `OK: no feat commit touches tests`                                                                                                                                                                                                                                        |
| `scripts/ci/check-ac-coverage.sh`              | `OK: every criterion of a shipped section has a test`                                                                                                                                                                                                                     |
| `scripts/ci/check-spec-sections.sh`            | `OK: sections cited: 1 … 22`                                                                                                                                                                                                                                              |
| `scripts/ci/check-features-map.sh`             | `OK`                                                                                                                                                                                                                                                                      |
| `scripts/ci/check-plan-scope.sh`               | `OK: chore/B1.20-plan-scope-literal stays inside the approved plan of B1.20`                                                                                                                                                                                              |
| `scripts/ci/check-backlog.sh`                  | `OK: README matches the cards`                                                                                                                                                                                                                                            |
| `scripts/verify-red.sh B1.20`                  | exit 1 (`no 'test(<pkg>): B1.20 … (red)' commit`), as the plan says. verify-red judges only vitest files, and the probe commit carries no `(red)` marker                                                                                                                  |
| `/bin/bash scripts/hook-smoke.sh` at `fb75fc0` | `hook-smoke: 440 probes OK` (in the card worktree)                                                                                                                                                                                                                        |
| `/bin/bash scripts/hook-smoke.sh` at `f83e5da` | 8 FAIL, exactly L1 and L5 × 4 layouts (scratch clone). A 9th FAIL there, `require-review.sh spoke on a clean tree`, comes from the clone: its `origin/main` is the stale local `main`. That probe also fails at `fb75fc0` in the same clone, and it is ok in the worktree |
| `bash -n` on the 3 scripts                     | silent                                                                                                                                                                                                                                                                    |

### Checklist

- Every Acceptance clause is tested:
  - "both compare literally before as a glob, in every layout": L1 (hook) and L5 (guard) × 4 layouts.
  - "every existing probe still passes": 416 + 24 = 440 ok.
  - The label is on PR #132.
- No test was weakened after the red commit. `git log --first-parent --no-merges f83e5da..HEAD -- scripts/hook-smoke.sh '*.test.*' e2e/` is empty, and there are no merges.
- The diff matches the plan. `git diff 5c656bc..HEAD` touches exactly the 4 code and doc files in the Files table. The interfaces (stdin JSON, exit codes 0/2 and 0/1, guard output) are unchanged, and `plan-files.sh` is untouched.
- Not applicable: Zod, Prisma, SQL, migrations and the features map (tooling, no `src/`). No secret and no suppression.
- Reverting a changed line makes a probe fail. Mutants were run on a scratch clone:
  - Restore only `plan-scope.sh:36` → L1 FAILs × 4.
  - Make both scripts literal-only (drop the glob) → L3, L4 and L5 FAIL × 4.
  - Revert both lines (= `f83e5da`) → L1 and L5 FAIL × 4.
  - The `hooks.md` row has no probe (it is documentation).
- The `hooks.md` row has 4 `|` both before and after the change (3 cells). `prettier --check` passes.

### Caller's questions

1. **Can the literal comparison widen the allowed set beyond the token itself?** No. `"$REL" == "$p"` is string
   equality, so it adds at most one path: the token's own text. Probed under `/bin/bash` 3.2:
   - `src/x?.ts` matches `src/x?.ts`, and `src/a\b.ts` matches `src/a\b.ts`, through the literal comparison.
   - `src/xy.ts` and `src/ab.ts` match too, but through the glob comparison, which is unchanged since #60.
   - `*` already matches everything as a glob.

   Under bash 5 (CI) `[[ == ]]` treats the right side as extglob, but that affects only the glob comparison, not
   string equality.

2. **Does L4–L6 in `.` and `.claude/worktrees/n` prove the right thing?** Yes:
   - In `.`, the nested worktrees sit untracked inside `$LC`. Each step stages only `src/app/...` explicitly, so
     `git diff merge-base..HEAD` holds only the card's files. If a gitlink had been committed, L4 would be exit 1,
     not 0. So L4 = 0 also proves that no stray gitlink was committed.
   - The worktrees were cut from `feat/B9.10-main` before the loop, so `.`'s commits never reach them.
   - In `n` and `n/.worktrees/b`, `check-plan-scope.sh` takes `--show-toplevel` of its own worktree.
   - For L1/L3, a wrongly resolved TOP (the root instead of `n`) would give REL `.claude/worktrees/n/src/…`, which
     is not listed. L1 and L3 would then fail, so they discriminate the layout.
   - L2 = 2 and L6 = 1 are the not-listed refusals. In the same layout, the only difference from the passing L1 and
     L5 is the path.
3. **Does the `hooks.md` row still render as 3 cells?** Yes: 4 pipes, prettier clean (above).

### Findings

None blocking.

Out of scope → follow-up (D-25), not reasons. All were on main before this card, and this card does not widen them:

- The glob comparison still over-matches Next.js route segments. Probed with `/bin/bash` 3.2:
  - The token `src/app/[...slug]/page.tsx` also allows `src/app/./page.tsx` and `src/app/s/page.tsx`.
  - The token `src/app/[id]/page.tsx` also allows `src/app/i/page.tsx` (the plan's stated cost).
  - A `*` in a token matches across `/`.

  The `hooks.md` row says "then as a glob" but does not name this cost.

- CI runs neither `hook-smoke.sh` nor any bash 5 run of the L probes. This is the same as the r1/r2 note.

Verdict: ready for PR

Riskiest unfalsified: the glob half of the comparison under CI's bash 5 extglob semantics for a token holding
`@(`/`!(`/`+(` (no bash 5 here, and CI does not run hook-smoke). The change does not touch it, and the literal half
does not depend on it. Also, PR #132's head is still `5c656bc`: the test and fix commits are not pushed yet, so the CI
run of `check-plan-scope.sh` on them has not happened.
