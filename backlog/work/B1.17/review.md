# B1.17 review

## Plan review (round 1)

SCOPE: none of lib | actions | ui. The plan touches `.claude/hooks`, `.claude/settings.json`, `.claude/skills`,
`.claude/agents`, `.claude/docs`, `scripts/`, `scripts/ci/` and `.github/workflows/ci.yml`. It has no `src/`, `prisma/`
or `e2e/` path, so no section, map row or Stryker run applies. The checklist is adapted as in B1.12–B1.16.

I reviewed the plan at `64e101f` and the card at `0c26e9f`. All runs were read-only:

- `scripts/hook-smoke.sh` → `hook-smoke: 221 probes OK`. This matches the plan's 221 baseline.
- The plan's stated rule (first-column backticked tokens of `## Files`, bash glob, work folder excepted, three-dot
  diff) applied to the local `pr/N` heads by a scratch script:
  `/private/tmp/claude-502/-Users-minh-ho2-Documents-project-level-up-lab--claude-worktrees-lucid-bhabha-457da6/d2c80f70-0118-4c96-ab7e-42fbcdb4c157/scratchpad/scope-probe.sh`.
- `git diff --name-only origin/main...HEAD` on this branch.

I did not edit the worktree. `agent_type` in a subagent's PreToolUse input is treated as the plan states it: an
external assumption I could not probe.

### Probe: the plan's rule on 14 merged card PRs

```
B1.2 #5  none                 B1.9  #31 00-decisions README E1-todos 09-logging technical-requirements
B1.3 #8  00-decisions README E1-todos 07-clear-completed
B1.4 #11 00-decisions README E1-todos 07-clear-completed 08-mutation-feedback
B1.5 #13 README E1-todos docs/mistake-log.md 08-mutation-feedback technical-requirements
B1.6 #15 00-decisions README E1-todos 09-logging technical-requirements
B1.7 #27 E1-todos             B1.10 #33 README E1-todos
B1.8 #29 00-decisions README E1-todos 09-logging technical-requirements
B1.11 #36 00-decisions README E1-todos 09-logging technical-requirements
B1.12 #39 none · B1.13 #46 none · B1.14 #50 none · B1.15 #52 none
```

**9 of 14 card PRs would have failed `check-plan-scope.sh`.** None of the 9 failures is a `src/`, `prisma/`, `e2e/`
or `scripts/` file. Every one is a spec or backlog file that the pipeline writes on the card branch by design.

### Checklist

| Check                                    | Result                                                                                                                                                                                                                                                                      |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| files belong to the card                 | **fail**: every planned file serves the card's Acceptance or Test. Option A is missing files that it changes: `test-writer.md:37`, `tdd-loop/SKILL.md:14` and `review-loop/SKILL.md` step 3 (reason 4).                                                                     |
| interfaces stated                        | **fail**: the CLIs are pasted, but the CI guard's `BASE` is not named (reason 7). The parser sits outside the protected `scripts/ci/` path (reason 8).                                                                                                                      |
| advice                                   | pass: the spec-analyst/advisor skip is stated (no section, Tier quick).                                                                                                                                                                                                     |
| follows the card or states the deviation | **fail**: the card's literal rule ("every write outside the work folder while unapproved") refuses steps the pipeline runs on the card branch, and the plan does not say so (reason 1). Red-step deviation (reason 9).                                                      |
| criteria measurable                      | pass for S1–S12 and C1–C3 as written, but probes are missing for the costs below (reasons 6 and 7).                                                                                                                                                                         |
| verification exact with numbers          | **fail**: "`check-plan-scope.sh` on this branch: OK" is false today (reason 2). The counts 221 + 48 + 3 are consistent (12 × 4 layouts + 3).                                                                                                                                |
| work breakdown                           | pass: `test(scripts)` → `feat(hooks)` → reviewer diff → PR. No skeleton or map (tooling); B1.16 precedent.                                                                                                                                                                  |
| who edits                                | pass: the orchestrating session edits under this approval, as in B1.12–B1.16, and the plan says so.                                                                                                                                                                         |
| protected path and label                 | pass: `.claude/`, `.github/` and `scripts/ci/` are covered by `PROTECTED` (`scripts/ci/check-config-change.sh:10`), and the label need is stated. `scripts/plan-files.sh` is not covered (reason 8).                                                                        |
| one screen                               | 67 lines against the ≈ 40 guideline (B1.13 was approved at 68). Not blocking.                                                                                                                                                                                               |
| `Lead approves spec` box                 | n/a: no section.                                                                                                                                                                                                                                                            |
| no settled D-n contradicted              | **fail**: D-7 lets the plan gate's "approve" tick the section's box in the same step. `cd5d1c7`, `2c45607`, `bcec946` and `43f0da1` each write `spec/contracts/09-logging.md` beside `plan.md`. The hook refuses that write unless the section file is in Files (reason 1). |
| prettier PostToolUse, `mark-reviewed.sh` | pass: `format-after-edit.sh` rewrites only `$FILE`, which the hook has already allowed. `mark-reviewed.sh` writes `node_modules/.cache/level-up-lab` through Bash, which is untracked and never seen by a PreToolUse hook.                                                  |

### Reasons (changes requested)

1. **The rule refuses the pipeline's own pre-plan and gate writes on a card branch. The plan does not tell the lead
   this.** (confirmed: probe above and commit history)
   - B1.8 (#29) shows the pattern. On `feat/B1.8-…`, before `cd5d1c7 plan approved`, the branch carries `c54edb6
docs(spec): §11 …` (spec-analyst, `spec/contracts/09-logging.md`, `spec/technical-requirements.md`), `f54c203
contract lines` (`backlog/plan/E1-todos.md`) and `2914a8c` D-14 (`backlog/00-decisions.md`, `README.md`).
   - Under S5 ("no plan → 2"), spec-analyst's write to `spec/contracts/09-logging.md` is refused.
   - The D-7 tick in the approve step is refused.
   - dev-lead's "Waiting on human" row in `backlog/README.md` is refused (control-plane rule 3).
   - B1.5's `docs/mistake-log.md` row is refused.
   - The CI guard fails 9 of 14 historic PRs and catches zero code deviations.

   The plan needs a stated decision with its cost. Options:
   - (a) Govern only build paths (`src/`, `prisma/`, `e2e/`, `scripts/`, `.claude/`, `.github/`, root config). Allow
     `spec/contracts/*`, `spec/technical-requirements.md`, `backlog/*` and `docs/mistake-log.md` before and after
     approval. This deviates from the card's "every write outside the work folder", so the lead accepts it.
   - (b) Move spec, D-n and filing work to a `docs/` branch merged before the card branch is cut. This changes
     `dev-lead.md` steps 1 and 5, and D-7's same-step tick then needs its own commit.
   - (c) Keep the card's rule and require dev-lead to list these files before writing them. This is impossible before
     the plan exists, so it fails for spec-analyst.

2. **The plan's own verification line fails on this branch.** (confirmed) `git diff --name-only origin/main...HEAD` →
   `backlog/README.md`, `backlog/plan/E1-todos.md`, `backlog/work/B1.17/plan.md`, `docs/metrics.md`. Three are outside
   the Files table. The causes are `0c26e9f`, which is open PR #59, and `4cc2306`, the pre-squash twin of `601d729`
   (#58). The feat commit puts the guard in CI's `guards` job, so this PR fails its own new step. State the
   precondition ("after #59 merges, `git merge origin/main`; then the diff is the Files rows only") with the expected
   file list, or list these files.

3. **The per-card `docs/metrics.md` row and the `spec/features-map.md` move are pipeline writes that the plan template
   does not list.** (plausible: the role text says so, but history shows the metrics row went in closing commits)
   `code-writer.md:32` fills both in the feat commit, and `dev-lead.md:65` writes the metrics row "now". The B1.8 and
   B1.11 plans list neither. The planned `dev-lead.md` change ("Files cells are backticked repo paths") must also
   require these rows whenever the card writes them, or the hook must allow them. Otherwise code-writer's step 5 is
   refused.

4. **Option A is incomplete, and the test rule breaks a `/review-loop` step.** (confirmed by reading)
   - Under A, `.claude/agents/test-writer.md:37` ("Replace the `it.todo` stubs from the skeleton") and
     `.claude/skills/tdd-loop/SKILL.md:14` (precondition "`it.todo` per criterion") become wrong. Neither is in Files.
   - `/review-loop` step 3 ("failing test first", `test(<pkg>): <card> review -- … (red)`) runs in the orchestrating
     main thread. With no `agent_type` there, S7 refuses that test write.
   - Add both skills and `test-writer.md` to Files, and require `review-loop` to dispatch `test-writer` for review-pass
     tests. Otherwise the lead approves a rule that stops review-pass fixes.

5. **"Migrations only through code-writer" never holds on the creation path. The plan does not say so.**
   (confirmed by reading)
   - `new-feature-slice` step 3 runs `add-migration` in the skeleton step, from the main thread.
   - `add-migration` step 4 creates the folder with `pnpm db:migrate` (Bash, invisible to the hook).
   - S9/S10 test only an Edit/Write that no role's step performs, and the CI net checks no role.

   Either move `add-migration` into code-writer's green step and add `new-feature-slice/SKILL.md` step 3 and
   `add-migration/SKILL.md` step 7 to Files, or state that the rule guards hand edits only.

6. **The guard is opt-in by branch name. The plan does not state that cost or probe it.** (plausible)
   - Any branch outside `^(feat|…|build)/B<e>.<n>-` is unguarded by both hook and CI: `docs/B1.18-x` (C3 skips it),
     `hotfix/B1.18-x`, `feat/B1.18` (no slug dash), `claude/<name>` (the desktop default) and `Feat/B1.18-x`.
   - A `src/` change on such a branch passes both layers. Only the reviewer would catch it.
   - Name this cost, or have the CI guard fail a non-card branch whose diff touches `src/`, `prisma/` or `e2e/`
     (`hotfix` label excepted).
   - Add probes for `feat/B9.1` (no dash) and for a `docs/` branch touching `src/`.

7. **The CI range is not named, and the merge-main case is not probed.** (plausible) `git diff BASE...HEAD` is right
   after a branch merges `origin/main` only when `BASE` is at or after the merged main tip. In that case the merge
   base is the merged tip and main's files drop out. With `resolve_range`, `BASE_SHA` is
   `github.event.pull_request.base.sha`. If that SHA lags the `origin/main` the branch merged, main's files show up as
   "outside the plan".
   - Name the range in the Interfaces block. Prefer `git merge-base "origin/$GITHUB_BASE_REF" "$HEAD_SHA"`
     (`fetch-depth: 0` is already set).
   - Add C4: the branch is cut from a commit that main later squashed (this branch's `4cc2306` vs `601d729`), then
     merges `origin/main` → 0.
   - Do not reuse the existing guards' two-dot `git diff "$BASE_SHA" "$HEAD_SHA"`, which reverse-lists main's newer
     files.

8. **The hook and the guard trust whatever `plan.md` holds now, and the parser is outside the label gate.**
   (plausible)
   - The work folder is always writable, so the main thread can add a Files row after `Plan approved by: lead`
     without re-approval (`planning.md` "Never silently extend the Files list"). Both layers then pass. The card says
     "the approved plan".
   - At least state the cost. Better: have the CI guard read Files at the last commit that wrote the approval line,
     and fail when Files changed after it.
   - `scripts/plan-files.sh` does not match `PROTECTED`, so a card branch can weaken the parser with no
     `config-change-approved`. Put it at `scripts/ci/plan-files.sh`.

9. **The red reason differs from the card's Test line, and the plan does not say so.** (confirmed by reading) The
   card says red because a write to `src/lib/b.ts` "is allowed (exit 0)". The plan's red is "scripts missing"
   (exit 127). B1.16 used a missing script, but its card said so. Either add an allow-all `plan-scope.sh` and
   `plan-files.sh` stub (exit 0) before the test commit, so red matches the card, or state the deviation.

Not probed [unverified]: whether `claude --agent dev-lead` (the headless lane) passes `agent_type: dev-lead` on its
main thread. It is harmless here, because no rule grants dev-lead anything.

Verdict: changes requested

Riskiest unfalsified: whether `pull_request.base.sha` on a `synchronize`/`labeled` event can lag the `origin/main` a
branch just merged. If it can, the three-dot guard reports main's files as outside the plan (reason 7).

## Plan review (round 2)

SCOPE: none of lib | actions | ui (tooling: `.claude/`, `scripts/`, `.github/`); checklist adapted as in round 1.
Reviewed `plan.md` at `24f69a6` on HEAD `21ab69b` (merged `origin/main`, includes #58 and #59). Read-only runs:

- `scripts/hook-smoke.sh` → `hook-smoke: 221 probes OK` (the plan's baseline).
- `git diff --name-only origin/main...HEAD` → `backlog/work/B1.17/plan.md`, `backlog/work/B1.17/review.md` (round-1
  reason 2 cleared).
- The revised rule applied to every merged PR #5–#59 at its head (`gh pr list` heads, all present locally):
  `/private/tmp/claude-502/-Users-minh-ho2-Documents-project-level-up-lab--claude-worktrees-lucid-bhabha-457da6/d2c80f70-0118-4c96-ab7e-42fbcdb4c157/scratchpad/scope-probe2.sh`
  (branch `^[a-z]+/B<e>.<n>(-|$)`; paperwork `backlog/*`, `spec/*`, `docs/metrics.md`, `docs/mistake-log.md`; other
  files against first-column backticked tokens of `## Files` at the latest approval commit; `git diff
$(git merge-base origin/main <head>) <head>`; bash `[[ == ]]` matching). Run twice, once per reading of "approval
  commit".

### Probe: the revised rule on #5–#59

| Reading of "latest approval commit"                                      | 16 card PRs (#5…#57)                                                                                                                                | 16 card-id lane PRs (`docs/B1.n-…`) | 23 other PRs |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ------------ |
| commit subject `<card> plan approved` (B1.16's `lead-time.sh` precedent) | **0 fail**                                                                                                                                          | 0 fail (paperwork only)             | skipped      |
| last commit whose diff touches a line `Plan approved by: lead` (`-G`)    | **2 fail**: #5 B1.2 (line reads `minh.ho2`, renamed later), #52 B1.15 (line wraps after `Plan`) → "unapproved", all `src/`/`scripts/` files refused | 0 fail                              | skipped      |

Round 1: 9 of 14 failed, 0 build files caught. Round 2 (subject reading): 0 of 16, and still 0 build files caught on
history (no merged card wrote outside its plan; the guard's value is prospective). Fixed-string subject also hides a
re-approval: for #13 it picks `ef73bec` "B1.5 plan approved", not `9efec0b` "B1.5 plan round 2 approved" (B1.5's
Files did not change between rounds, so the result held by luck).

### Round-1 reasons

| #   | Round-1 reason                                 | Round 2                                                                                                                                                       |
| --- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | rule refuses pipeline paperwork                | resolved as a lead decision: (a) paperwork allow-list, (b)/(c) costed, (a) recommended; probe 0 of 16                                                         |
| 2   | own verification line false                    | resolved: after the merge the diff is the work folder only; but see new reason 2 for the feat-time diff                                                       |
| 3   | metrics row, features-map move                 | resolved: `docs/metrics.md` and `spec/*` are paperwork                                                                                                        |
| 4   | Option A files, review-loop test step          | resolved: three SKILL.md files and `test-writer.md` in Files; review-pass tests via `test-writer` stated                                                      |
| 5   | migrations through roles never holds           | resolved as a stated deviation: Edit/Write on `prisma/migrations/*` always refused; CI checks the plan only                                                   |
| 6   | opt-in by branch name                          | resolved as a stated gap (`claude/…`, `main`, `hotfix/…` without id skipped); regex widened to any lowercase prefix and `(-                                   | $)`; S11, S12 probe it. `feat/B9.1` (no slug) has no probe (note) |
| 7   | CI range                                       | resolved: `git merge-base origin/<base> HEAD`, C4 squash-then-merge probe; round-1 riskiest (stale `base.sha`) is moot                                        |
| 8   | trusts plan as it is now; parser outside label | resolved in intent (approved-plan snapshot, S6; parser at `scripts/ci/plan-files.sh`, under `PROTECTED`); the snapshot's commit is not defined → new reason 1 |
| 9   | red reason differs from card                   | resolved as a stated deviation (exit 127, not exit 0)                                                                                                         |

### Checklist

| Check                                    | Result                                                                                                                                                                                                                                                                                                               |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| files belong to the card                 | pass: every row serves the Acceptance or a stated deviation                                                                                                                                                                                                                                                          |
| interfaces stated                        | **fail**: `plan-files.sh`'s "latest approval commit" is undefined, and both readings break on this repo's history (reason 1)                                                                                                                                                                                         |
| advice                                   | pass: skip stated (no section, Tier quick)                                                                                                                                                                                                                                                                           |
| follows the card or states the deviation | pass: paperwork allow-list, migration rule, red reason, branch gap all stated as deviations for the lead                                                                                                                                                                                                             |
| criteria measurable                      | pass: S1–S13 × 4 layouts + C1–C5 = 57, counts consistent (221 + 52 + 5)                                                                                                                                                                                                                                              |
| verification exact with numbers          | **fail**: `check-plan-scope.sh` on this branch after the feat commit reports 3 Files rows outside the plan (reason 2)                                                                                                                                                                                                |
| work breakdown                           | pass: `test(scripts)` → `feat(hooks)` → reviewer diff → PR, label stated                                                                                                                                                                                                                                             |
| protected path and label                 | pass: every non-paperwork file matches `PROTECTED`; `config-change-approved` stated                                                                                                                                                                                                                                  |
| one screen / size                        | 69 lines against ≈ 40 (B1.13 approved at 68). 15 files (3 new scripts, 1 refactor, 4 role texts), +57 probes: upper end of M [estimate]. Not blocking; the split seam, if the lead wants one, is the role rule (S7–S9, `agent_type` [unverified], the three SKILL.md files and `test-writer.md`) as a follow-up card |
| `Lead approves spec` box                 | n/a: no section                                                                                                                                                                                                                                                                                                      |
| no settled D-n contradicted              | pass: D-7's same-step tick writes `spec/*`, now paperwork                                                                                                                                                                                                                                                            |

### Reasons (changes requested)

1. **The plan does not define which commit is "the latest `Plan approved by: lead` commit", and both readings fail
   on this repo.** (confirmed: probe above and `git log -G`)
   - Line reading: refuses every build write for B1.2-style and B1.15-style plans (#5, #52 above). It also reports
     B1.17 approved today: `plan.md:12` contains the literal `` `Plan approved by: lead` `` in prose, so
     `git log -G'Plan approved by: lead' -- backlog/work/B1.17/plan.md` → `24f69a6 … plan review round 1, plan
revised`. With the hook live, an unapproved plan that quotes the line would let `src/` writes through (S4 fails).
   - Fixed-string subject reading: misses `dev-lead`'s re-approval subjects (B1.5 `plan round 2 approved`), so a row
     added and re-approved per `planning.md` stays refused.
   - Fix: pin it in Interfaces as B1.16 did: latest commit reachable from `<rev>` whose subject matches
     `^docs\(backlog\): <card> plan( round [0-9]+)? approved$` and which touches `backlog/work/<card>/plan.md`. Add
     probes: S14 unapproved plan quoting the line in prose → 2; S15 row added, then a `plan round 2 approved` commit
     → 0. State the cost: the approval commit is written by the session, so the hook proves an approval commit exists,
     not that the lead replied; the reviewer's plan-vs-diff check stays the human-facing control.
2. **The plan's own Files table fails its own rule.** (confirmed: matcher run on the 15 planned paths) The row
   `` `.claude/skills/{new-feature-slice,tdd-loop,review-loop}/SKILL.md` `` is one token; `[[ $f == $p ]]` does no
   brace expansion, so `new-feature-slice/SKILL.md`, `tdd-loop/SKILL.md` and `review-loop/SKILL.md` are "outside the
   plan". The verification line "`scripts/ci/check-plan-scope.sh` … OK" then fails in CI's `guards` job on this PR.
   Fix: one backticked path per file (and the `dev-lead.md` change states "one repo path or `*` glob per token, no
   braces"), or have `plan-files.sh` expand braces and add a probe for it. The bare `` `review.md` `` token is
   harmless (paperwork) but should be the full path for the same reason.

Notes (not blocking): C3 should run with no `plan.md` at all, the closing-lane case after a squash erases the
`plan approved` commit (13 lanes pass only because paperwork is filtered before the plan lookup; say that order). Add
a `feat/B9.1` (no slug) probe for the `(-|$)` branch.

Verdict: changes requested (round 2, the cap). Both reasons are two-line plan edits; per B1.13/B1.15/B1.16 the lead
may accept them applied without a round 3, otherwise round 3 is "Waiting on human".

Riskiest unfalsified: that Claude Code sends `agent_type` = `test-writer` in a Task subagent's PreToolUse input and
omits it on the main thread ([unverified] until after merge); if it is absent for subagents, S7 never holds live and
every red step is refused.
