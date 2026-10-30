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

## Diff review (pass 1)

SCOPE: none of lib | actions | ui (tooling: `.claude/`, `scripts/`, `.github/`); checklist adapted as in B1.12–B1.16.
Reviewed `git diff 986f925..393aa38` (17 files, +572 −54). Nothing in the worktree edited; probes ran on clones
under the session scratchpad (`probe1`, `ci2`, `rv/`).

### Command results (last line each)

| Command                                         | Result                                                                                                                                                                          |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint` · `pnpm typecheck`                  | `All matched files use Prettier code style!` · `tsc --noEmit` exit 0                                                                                                            |
| `pnpm test`                                     | `Tests  115 passed (115)`                                                                                                                                                       |
| `pnpm test:e2e`                                 | `13 passed (19.3s)`                                                                                                                                                             |
| `pnpm test:mutation`                            | `Final mutation score of 89.02 is greater than or equal to break threshold 70` (no `src/` change)                                                                               |
| `scripts/hook-smoke.sh` (HEAD)                  | `hook-smoke: 281 probes OK` (222 pre-existing incl. the new `wired plan-scope.sh` row + 54 plan-scope + 5 guard)                                                                |
| `scripts/hook-smoke.sh` at `b7fc272` (copy)     | `hook-smoke: FAILURES above`: 221 ok, 59 FAIL, all 59 with exit 127 (red as the plan states)                                                                                    |
| check-suppressions · feat-commits · ac-coverage | OK · OK · OK                                                                                                                                                                    |
| spec-sections · features-map · backlog          | OK · OK · OK                                                                                                                                                                    |
| `check-agent-frontmatter.sh`                    | `OK: 13 files`                                                                                                                                                                  |
| `check-config-change.sh`                        | exit 1, 13 protected files without `config-change-approved` (expected: human label, stated in the plan)                                                                         |
| `check-plan-scope.sh` (this branch)             | `OK: feat/B1.17-plan-scope-hook stays inside the approved plan of B1.17`                                                                                                        |
| same, CI shape (copy `ci2`)                     | HEAD = synthetic merge ref (parents `986f925`, `393aa38`), `GITHUB_HEAD_REF`, `GITHUB_BASE_REF=main`, `HEAD_SHA=393aa38` → OK; also OK in `node:24-bookworm` (git 2.39.5, mawk) |
| `verify-red.sh B1.17`                           | exit 1 "no `test(<pkg>): B1.17 … (red)` commit" — vitest-only gate, n/a for hook probes (B1.16 precedent); `--auto` → "nothing to verify" (CI passes)                           |
| `bash -n` hooks + `scripts/ci/*.sh`             | OK (bash 3.2.57 here, 5.2.15 in the CI image)                                                                                                                                   |

### Checklist

| Check                                | Result                                                                                                                                                                                                                                           |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| every changed file in `plan.md`      | pass: 17 of 17 (`plan-files.sh B1.17 393aa38` prints the same 17 tokens on macOS and in the CI image)                                                                                                                                            |
| interfaces match the plan            | pass for the hook, `repo_rel`, the guard's range and `HEAD_SHA`; **deviation**: `plan-files.sh` matches the approval pattern on any message line, the plan says "subject" (finding 2)                                                            |
| no test weakened after red           | pass: `git diff b7fc272..HEAD -- scripts/hook-smoke.sh` empty                                                                                                                                                                                    |
| `repo_rel` refactor keeps path-guard | pass: block messages byte-identical; mutants below (9 on `repo_rel`/`path-guard.sh`: 8 killed by the 221 old probes; M4 survives on old code too: drops "worktree top inside the project", only reachable when the project dir is below the top) |
| pipeline writes                      | pass (traced, hook run against this branch with both project dirs): plan.md/review.md/map/metrics are paperwork; prettier/eslint PostToolUse rewrites only the allowed file; `mark-reviewed.sh`, `worktree.sh`, `pnpm db:migrate` write by Bash  |
| CI-only behavior                     | pass with `HEAD_SHA` set (the job sets it). Without it the merge ref's first parent is main → `plan-files` exit 3 → every non-paperwork file reported; worth a comment in the script, not blocking                                               |
| no secret, no suppression            | pass                                                                                                                                                                                                                                             |
| features map / spec                  | n/a (no section)                                                                                                                                                                                                                                 |

### Mutants (copy `probe1`, `scripts/hook-smoke.sh` per mutant)

| Id  | Mutant                                                                       | Result                                     |
| --- | ---------------------------------------------------------------------------- | ------------------------------------------ |
| M1  | `repo_rel`: drop the `..`-through-a-new-dir check                            | killed (8)                                 |
| M2  | `repo_rel`: outside the project returns 0                                    | killed (3)                                 |
| M3  | `repo_rel`: drop "same common dir"                                           | killed (1, nested clone)                   |
| M4  | `repo_rel`: drop "top inside the project"                                    | survived (same on old code; see checklist) |
| M5  | `repo_rel`: drop `.claude/worktrees/*/` strip                                | killed (12)                                |
| M6  | `repo_rel`: REL from ROOT_REAL instead of TOP                                | killed (37)                                |
| M7  | `repo_rel`: no `pwd -P` canonicalization                                     | killed (87)                                |
| M8  | `path-guard.sh`: return 1 → exit 0                                           | killed (8)                                 |
| M9  | `repo_rel`: drop `.worktrees/*/` strip                                       | killed (12)                                |
| P1  | hook: `docs/metrics.md` not paperwork                                        | killed (4)                                 |
| P2  | hook: no test-writer check                                                   | killed (8)                                 |
| P3  | branch regex `(-\|$)` → `-`                                                  | killed (1)                                 |
| P4  | `plan-files`: no `round N` re-approval                                       | killed (1)                                 |
| P5  | `plan-files`: drop `--first-parent`                                          | survived (note)                            |
| P6  | `plan-files`: drop `-1` (all approvals)                                      | killed (1)                                 |
| P7  | guard: `git diff "$base" "$head"` (two-dot from main's tip) instead of `$mb` | **survived** (finding 3)                   |
| P8  | guard: no paperwork filter                                                   | killed (3)                                 |
| P9  | hook: no migration rule                                                      | **survived** (finding 3)                   |
| P10 | hook: no `[[ -n $TOP ]]` exit                                                | survived (note)                            |
| P11 | `plan-files`: every backticked token of the row, not column 1                | survived (note)                            |
| P12 | `plan-files`: any `## ` heading counts as Files                              | killed (4)                                 |
| P13 | guard: branch regex `(-\|$)` → `-)` (broken)                                 | killed (5)                                 |

### Findings

```
[1] KIND: correctness
    WHERE: scripts/ci/check-plan-scope.sh:30 (git diff --name-only "$mb" "$head")
    DEFECT: rename detection (git's default) lists only a renamed file's new path, so the deletion of the old path is
            never checked against the plan or the paperwork list.
    TRIGGER: card branch feat/B9.7-x, no plan at all, `git mv e2e/05-todos.spec.ts backlog/old.spec.ts` committed;
             or feat/B9.1-x whose approved plan lists only src/lib/a.ts, `git mv src/lib/todos.ts src/lib/a.ts`.
    WRONG BEHAVIOUR: guard prints "OK … stays inside the approved plan" and exits 0 (ran both, macOS git and the
            node:24-bookworm image); the plan says the guard checks "files of git diff … by the same rule" and catches
            Bash writes not in the plan, so the deleted e2e/05-todos.spec.ts / src/lib/todos.ts must be reported.
            `git diff --no-renames --name-only` lists both paths. Probe first (C6), then the one-flag fix.
    CONFIDENCE: confirmed (scratch scripts rv/rename.sh, rv/ren-paper.sh)

[2] KIND: plan-mismatch
    WHERE: scripts/ci/plan-files.sh:12-13 (git log -E --grep="^docs\(backlog\): $esc plan (round [0-9]+ )?approved")
    DEFECT: `--grep` with `^` matches any line of the commit message, not only the subject the plan names.
    TRIGGER: commit "docs(backlog): B9.8 plan revised" whose body has a line "docs(backlog): B9.8 plan approved comes
             next" → plan-files.sh B9.8 returns 4 (approval commit found), not 3.
    WRONG BEHAVIOUR: a plan revision whose body quotes the approval subject counts as the approval, so the hook (S4)
            and the guard let unapproved Files rows through. No commit in `git log --all` does this today.
    CONFIDENCE: confirmed (ran on a scratch repo; impact needs a body line that starts with the subject)

[3] KIND: coverage
    WHERE: scripts/hook-smoke.sh C4 and S10 (rules at check-plan-scope.sh:18,30 and plan-scope.sh:24-26)
    DEFECT: two rules the plan relies on are not pinned by any probe: the guard's merge-base range (P7) and the
            migration rule (P9) both survive mutation with 281 probes OK.
    TRIGGER: P7 — replace "$mb" by "$base" in the guard: C4 still exits 0, because after `merge origin/main` the
             two-dot diff equals the merge-base diff. P9 — delete the prisma/migrations/* block: S10 still exits 2,
             because the fixture plan does not list the migration, so the "not in Files" rule refuses it.
    WRONG BEHAVIOUR: a regression to two-dot (round-1 reason 7: main moves after the branch's last merge → main's
            new files reported as outside the plan) or the loss of "never by Edit/Write" for a plan that lists
            `prisma/migrations/*` ships green. Probes needed: C6 main advances with a src/ file after the cut, branch
            does not merge → 0; S10 with the migration path listed in the fixture plan → 2.
    CONFIDENCE: confirmed (mutants run on the probe1 copy)
```

Notes (not blocking):

- Plan Verification says "221 + 60 + 5"; actual 222 + 54 + 5 = 281 (S1–S15 = 11 × 4 layouts + 10; the extra
  pre-existing row is the wiring probe for the new hook). The test commit body states 59 correctly.
- The guard's OK line says "stays inside the approved plan" also when `plan-files` exited 3/4 and only paperwork
  changed (C3); "only paperwork changed" would be accurate.
- `review-loop` step 3 now sends the review-pass test to `test-writer` "with `Mode: red`" and keeps the `(red)` subject;
  `backlog/CLAUDE.md` says hardening commits carry no `(red)` marker, and `test-writer.md` has no review-pass input
  (it asks for one test per AC and `verify-red.sh` exit 0). Pre-existing wording conflict, now routed through a role
  that follows the AC procedure.
- Migrations: CI requires the generated `prisma/migrations/<timestamp>_<name>/migration.sql` in Files, but neither
  `dev-lead.md` nor `add-migration` says to list it as a glob; the first migration card learns it from a CI failure.
- Case-insensitive APFS: `pwd -P` canonicalizes directories, not the file name, so a `src/lib/*` glob plus a write
  to `src/lib/a.TEST.ts` (same file as `a.test.ts`) skips the test-writer rule. Needs a glob row; path-guard has the
  same gap.

- Mutant survivors without a finding: P5 (`--first-parent`) only differs when a merged-in branch has its own
  approval commit for the same card; P10 (no-git fallback) is reachable only in a project dir without git; P11
  (column 1 only) survives because the fixture's column 2 has no backticks.

Verdict: back to test-writer. Red probes first, then the fixes: finding 1, a rename of an unlisted file (and one into
`backlog/`) → 1, fixed by `--no-renames`; finding 2, an approval line in a commit body only → 2, fixed by matching the
subject only (e.g. `git log --format='%H %s'` piped to `grep -E`); finding 3, the two probes named there (they pass
today; they pin the rules).

Riskiest unfalsified: `agent_type` = `test-writer` in a Task subagent's PreToolUse input and absent on the main
thread ([unverified] until after merge; S7–S9 pass on a synthetic payload only).

### Dispositions (pass 1, dev-lead)

| #   | Finding                                          | Disposition   | Evidence                                                                                                  |
| --- | ------------------------------------------------ | ------------- | --------------------------------------------------------------------------------------------------------- |
| 1   | rename hides the deleted path                    | fix now       | C7 red at 393aa38 (exit 0); `487fe2a` `--no-renames`: C7 exit 1                                           |
| 2   | `--grep` matches a body line                     | fix now       | C8 red at 393aa38 (exit 0); `487fe2a` subjects only: exit 3                                               |
| 3   | merge-base range and migration rule unpinned     | fix now       | C6 (main moved on, not merged) and S10 with `prisma/migrations/*` listed, in `9e4b64a`; hook-smoke 284 OK |
| N   | probe count "221 + 60 + 5" in the plan           | PR body       | real: 222 (221 + wiring row) + 54 + 8 = 284 after pass 1                                                  |
| N   | OK line claims a plan when there is none         | fix now       | `487fe2a`: "changes only paperwork (<card> has no approved plan)"                                         |
| N   | review-pass tests: wording and test-writer input | fix now       | `487fe2a`: `test-writer.md` "Mode: review pass N"; commit shape stays `backlog/CLAUDE.md`'s               |
| N   | how to list migrations                           | fix now       | `487fe2a`: dev-lead plan template names `prisma/migrations/*`                                             |
| N   | `a.TEST.ts` on case-insensitive APFS             | out of scope  | same gap in path-guard.sh; follow-up note in the PR body                                                  |
| N   | `claude --agent test-writer` main session        | fix now (doc) | `487fe2a`: known limit in `.claude/docs/hooks.md`                                                         |

## Diff review (pass 2)

SCOPE: none of lib | actions | ui (tooling). Reviewed the delta `393aa38..5bf576a` (`9e4b64a` test, `487fe2a` fix,
`5bf576a` docs) and the whole branch against `origin/main` (`986f925`, 17 files). Nothing in the worktree edited;
probes on clones under the session scratchpad (`p2` at `5bf576a`, `p3` at `9e4b64a`, both with `node_modules`
linked; `rv/mutants2.sh`, `rv/linux2.sh`).

### Command results (last line each)

| Command                                         | Result                                                                                                                         |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm lint` · `pnpm typecheck`                  | `All matched files use Prettier code style!` · `tsc --noEmit` exit 0                                                           |
| `pnpm test`                                     | `Tests  115 passed (115)`                                                                                                      |
| `pnpm test:e2e`                                 | `13 passed (13.4s)`                                                                                                            |
| `pnpm test:mutation`                            | `Final mutation score of 89.02 is greater than or equal to break threshold 70` (no `src/` change)                              |
| `scripts/hook-smoke.sh` (HEAD copy)             | `hook-smoke: 284 probes OK`                                                                                                    |
| `scripts/hook-smoke.sh` at `9e4b64a` (copy)     | exactly 2 FAIL: C7 `check-plan-scope exit 0 (want 1)`, C8 `plan-files exit 0 (want 3)`: red as the dispositions state          |
| check-suppressions · feat-commits · ac-coverage | OK · OK · OK                                                                                                                   |
| spec-sections · features-map · backlog          | OK · OK · OK                                                                                                                   |
| `check-agent-frontmatter.sh`                    | `OK: 13 files`                                                                                                                 |
| `check-config-change.sh`                        | exit 1, protected files without `config-change-approved` (expected: human label)                                               |
| `check-plan-scope.sh` (this branch)             | `OK: feat/B1.17-plan-scope-hook stays inside the approved plan of B1.17`; same in `node:24-bookworm` (bash 5.2.15, git 2.39.5) |
| `plan-files.sh` in `node:24-bookworm`           | B1.17 → 17 tokens, exit 0; body-only approval → exit 3; `plan round 2 approved` subject → exit 0                               |
| `verify-red.sh B1.17` · `--auto`                | exit 1 "no (red) commit" (vitest-only gate, n/a, as pass 1) · "nothing to verify"                                              |
| `bash -n` hooks + `scripts/ci/*.sh`             | OK                                                                                                                             |

### Checklist

| Check                                                      | Result                                                                                                                                                                                          |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file changed since pass 1 in plan                    | pass: `hook-smoke.sh`, `check-plan-scope.sh`, `plan-files.sh`, `dev-lead.md`, `test-writer.md`, `hooks.md`, `review.md`: 7 of 7 in Files                                                        |
| no test weakened                                           | pass: `9e4b64a` adds C6–C8 and adds `prisma/migrations/*` to the S fixture plan (S10 now needs the migration rule); no other probe depends on an unlisted migration; `487fe2a` touches no probe |
| pass-1 rename triggers (`rv/rename.sh`, `rv/ren-paper.sh`) | pass: both now exit 1 and name the deleted path (`src/lib/todos.ts`; `e2e/05-todos.spec.ts` with plan-files exit 3)                                                                             |
| pass-1 findings 1–3                                        | closed: P14 (`--no-renames` dropped) killed by C7; P15 (old `--grep`) killed by C8; P7 killed by C6; P9 killed by S10 (4 layouts)                                                               |
| subject-only loop (`plan-files.sh:12-16`)                  | pass: `break` keeps the newest (P6 killed by S15); `%s` of a multi-line first paragraph is joined, still anchored at `^`; reads 80 first-parent commits in 0.03 s when unapproved               |
| pass-1 dispositions applied                                | **fail** for the review-pass wording (finding 1); the other five pass                                                                                                                           |

### Mutants (copy `p2`, `scripts/hook-smoke.sh` per mutant)

M1–M3, M5–M9, P1–P4, P6 (now: drop `break`, oldest approval wins), P7, P8, P9, P12, P13 killed; P14 (no
`--no-renames`) killed (1, C7); P15 (`--grep` on any line) killed (1, C8); P17 (migration `block` → no-op) killed (4).
Survivors, unchanged from pass 1 and already explained there: M4, P5/P16 (`--first-parent`), P10, P11.

### Findings

```
[1] KIND: correctness
    WHERE: .claude/skills/review-loop/SKILL.md:38-40 (with .claude/agents/test-writer.md:22-23)
    DEFECT: the pass-1 "fix now" for review-pass tests landed only in test-writer.md; review-loop, the one caller,
            still dispatches test-writer with `Mode: red` and names the subject `test(<pkg>): <card> review -- … (red)`.
    TRIGGER: /review-loop on any card with a `fix now` that needs a test (as this card's pass 1): step 3 dispatches
             `Agent(test-writer)` with "Mode: red" and the finding.
    WRONG BEHAVIOUR: test-writer never receives `Mode: review pass N` (grep: no file sends it), so its new clause is
            dead; it follows the red procedure and commits `… (red)`, which backlog/CLAUDE.md:29 forbids for
            hardening commits, and verify-red.sh then judges that test against the parent of the card's FIRST (red)
            commit (the skeleton), not against the bug it was written for. This card's own `9e4b64a` followed
            backlog/CLAUDE.md, not the skill. Fix: SKILL.md:38-39 → `Mode: review pass N`, subject
            `test(<pkg>): <card> review pass N -- …` without `(red)`.
    CONFIDENCE: confirmed (traced: grep for "Mode: review" / "Mode: red" over .claude and backlog/CLAUDE.md;
            verify-red.sh header steps 1-4)
```

Notes (not blocking):

- `plan-files.sh:3-4` still says "as scripts/metrics/lead-time.sh", but `lead-time.sh:31` keeps `--grep`, so the
  metric can date an approval from a body line that plan-files now ignores. Metric only; a follow-up card or drop
  the "as" in the comment.
- The new OK wording (`check-plan-scope.sh:31-32`) has no probe: `cps` checks exit codes only.
- `test-writer.md` "the rest of this file applies unchanged" keeps Procedure step 4 (`(red)` subject) and the
  `RED:` report line in force for a review-pass test that is green by design (a pinning probe like C6); the
  clause overrides the subject only by reference.

Verdict: back to code-writer (finding 1: two lines in `review-loop/SKILL.md`, no probe needed; it is in the plan's
Files).

Riskiest unfalsified: `agent_type` = `test-writer` in a Task subagent's PreToolUse input and absent on the main
thread ([unverified] until after merge; S7–S9 run on a synthetic payload only).

### Dispositions (pass 2, dev-lead)

| #   | Finding                                                   | Disposition  | Evidence                                                                                                       |
| --- | --------------------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------- |
| 1   | review-loop still sends `Mode: red` and a `(red)` subject | fix now      | `f155633`: `Mode: review pass N`, `test(<pkg>): <card> review pass N -- …` without `(red)`; test-writer step 4 |
| N   | `lead-time.sh:31` still `--grep` (any message line)       | out of scope | B1.16's script; no commit today quotes the phrase in a body; follow-up note in the PR body                     |
| N   | OK-line wording has no probe                              | no change    | output text only; exit code pinned by C3                                                                       |
| N   | `plan-files.sh` comment "as lead-time.sh"                 | fix now      | `f155633`: "(subject only)"                                                                                    |
