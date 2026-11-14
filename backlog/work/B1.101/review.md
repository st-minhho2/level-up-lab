# B1.101 review

## Plan review (round 1)

Plan at 97e66c9. Tooling card, no section. I ran the prototype (`run.sh`, `run-smoke.sh` from the session scratchpad)
on copies under `$TMPDIR` with `/bin/bash` 3.2, and checked the plan's measurement on a clone under `$TMPDIR`.

| Check                                                                             | Result                                                                                                                                                                                                                                                                                                                                                                                  |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass, n/a: no section. `plan-files.sh --any B1.101 HEAD` lists the 5 files plus `backlog/work/B1.101/*`. All 5 trace to the card: `run.sh` and its smoke (Test line), the compose header and git-workflow.md (Acceptance 1), and the two Done status lines that cite `[unverified]` (Acceptance 2). `git grep` finds no other live citation outside `backlog/work/`.                    |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass, n/a: bash only. The one new interface is `run.sh --sync <issue>` (exit 0 synced or level, 1 refused), with the usage string and the refusal shape `[run] refused #<n>: …` pasted.                                                                                                                                                                                                 |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: no advice (tier quick, no section), stated. It picks the card's first option and gives the reason against the second: the ruleset's `strict_required_status_checks_policy: true` (`.github/rulesets/main.json`) makes every other ready PR BEHIND after a merge, even with no shared line.                                                                                        |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: 4 acceptance items and 6 R21/R22 rows, each with an rc, a call count or exact text                                                                                                                                                                                                                                                                                                |
| verification lists exact commands with expected numbers                           | fail (minor), reason 2. Red is "2 of 22 probes FAILED", green is "22 probes OK" and hook-smoke is "749 probes OK"; I reproduced all three. `pnpm test` "unchanged" has no number.                                                                                                                                                                                                       |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass for tooling, same shape as B1.95. No skeleton is needed: R21 and R22 fail on an assertion (usage text), not on a missing function. There is no map row. The steps are red `test(scripts):`, green `chore(scripts):` (no smoke file), then review.                                                                                                                                  |
| the section has a `Lead approves spec` box, ticked only by a human                | n/a: no section. `Plan approved by:` is empty and I did not touch it.                                                                                                                                                                                                                                                                                                                   |
| no settled D-n contradicted                                                       | pass. D-19: the label is planned. D-28: `scripts/agent/tier.sh backlog/work/B1.101/plan.md` prints `high`. D-29: `no-rework.sh` counts any `Agent-Run: ` value as `agent-run` and leaves out comments that start "Runner (`scripts/agent/run.sh`". The sync comment keeps that prefix, so it is not a lead message. B1.99's Loop 9 repair is the full run that the guard refusal names. |
| `scripts/next-task.sh --check B1.101` on the committed plan says no overlap       | pass: "[next-task] B1.101: no overlap with any Doing or Review card"                                                                                                                                                                                                                                                                                                                    |

What I ran:

- **The measurement.** On a `git clone .` under `$TMPDIR`, `info/attributes` = `* !merge` (no union, as on GitHub):
  - `343349a` merging `14defd1` conflicts in `docs/metrics.md` and `spec/features-map.md`.
  - With the attributes restored, the merge is clean and its tree equals 7eab1a5's (empty `diff --stat`). The same holds
    for `f2cecbd` + `76bdb83` against a0da40a.
  - My route differs from the plan's bare `merge-tree`, which the reviewer's Bash guard refuses. The verdict is the same.
- **Green.** The prototype: "22 probes OK".
- **Red.** The prototype smoke run against today's `run.sh` (cmp-equal to `orig/run.sh`): R1–R20 ok, then `FAIL R21`,
  `FAIL R22`, and "2 of 22 probes FAILED".
- **Mutants.** I ran 4 of the plan's 12, in parallel:
  - no trailer: FAIL R21;
  - no guards: FAIL R21, R22;
  - no reset after a guard fails: FAIL R22;
  - `GIT_DIR` kept in `wgit`: FAIL R21, R22.
- **Other suites.** `scripts/hook-smoke.sh` on this branch: "749 probes OK". `pnpm test`: 48 files, 298 tests passed.

### Reasons (changes requested)

1. **The `scripts/CLAUDE.md` row for `--sync` has no carrier and is not tracked.** The card's Spec line names
   `scripts/CLAUDE.md`. B1.98 (Doing) holds the file, and its approved Files row adds only "`agent/run.sh` behind check
   (B1.95)" (`git show e83061b5:backlog/work/B1.98/plan.md`, line 60). So "the next card that plans
   `scripts/CLAUDE.md` adds it (as for B1.95)" names no card. B1.95 named B1.98 explicitly, after its round-1 reason 1.
   - Trigger: B1.98 merges. Its row reads `agent/run.sh <issue> | --poll | --check-binary | --mode` plus the behind
     check. No Open card's text mentions `--sync`. This card closes `-partial` on the time metric alone, so the guide
     row is dropped and nobody notices.
   - Fix: add "scripts guide row (`--sync`)" to the `-partial` pending list in the plan's cost line, or name a card
     (file one, or the lead rules that B1.98 takes it, which re-opens B1.98's plan).
2. **`pnpm test` "unchanged" gives no number.** Write the count: on 97e66c9 it is "48 files, 298 tests passed". This
   is the same minor reason as B1.95's round-1 reason 3.
3. **A signal between the merge and the push leaves an unpushed merge, and the plan does not list it as a cost.**
   - Trace (prototype): `trap 'on_signal 143' TERM` and `trap 'on_signal 130' INT` stay set at top level for `--sync`.
     `on_signal` kills no child, does not reset `$pre`, and exits. Only the EXIT trap runs, and it removes the lock.
   - Trigger: TERM or INT (Ctrl-C on `docker compose exec`) after `git merge` commits, while the guards or
     `pr-step.sh push` run.
   - Result: the worktree's HEAD is a local merge that is not on `origin/<branch>`. The next `--sync` refuses with "HEAD
     … is not origin/<branch> …: run scripts/agent/run.sh <n>". That sends a one-command fix (`reset --keep`) to a full
     run of 6–9 minutes (card text).
   - Ctrl-C during a conflicted `git merge` can also leave `MERGE_HEAD`. The next `--sync` then says "commit them",
     which a conflicted index cannot do.
   - The plan's "each refusal … the branch as it was" covers refusals only.
   - Fix: either reset to `$pre` in `--sync`'s signal path (and abort a merge in progress), with an R22 case, or move
     it into "Costs, for the lead to accept".

### Notes (not blocking)

- `--sync` does not call `eligible.sh`. A sync still pushes an issue whose `agent-ready` label was removed after its
  run. The lead types the command, so this is intent, not a bypass. One line in the costs would make it explicit.
- `dev-lead.md:114` still says a ready PR that turns BEHIND goes `ready --undo` → merge → `ready`. The plan leaves
  that file alone, which is right for interactive card sessions. After this card, git-workflow.md "Batch review"
  (runner PRs: `--sync`) and dev-lead.md describe two paths. The planned git-workflow wording should say which PRs
  each one covers.
- The guards run from the card worktree's own `scripts/ci/` copy, after the merge. That is the version CI runs on the
  PR, so a card that changes a guard is judged by its own copy, as in CI.
- The plan is 90 lines against planning.md's ≈ 40. B1.95's 97-line plan passed, so I do not raise it as a reason.

Verdict: changes requested

Riskiest unfalsified: GitHub's "mergeable" once the branch contains `origin/main`. With the measured union merge in
the branch, the squash diff is the card's own change, so GitHub should not see a conflict. That holds by
construction, but nothing outside the next real batch can show it.

## Plan review (round 2)

Plan at b314f95. I ran prototype r2 (scratchpad `proto`) on copies under `$TMPDIR` with `/bin/bash` 3.2.

| Check                                                                             | Result                                                                                                                                 |
| --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass, n/a: no section. Same 5 files plus `backlog/work/B1.101/*`. The `run.sh` row now also names the `on_signal` reset.               |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass, n/a: bash only. The new interface is TERM/INT → rc 143 (or 130) with the branch reset; it is pasted in the R22 row.              |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: no advice, stated                                                                                                                |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: 4 acceptance items and 7 R21/R22 rows                                                                                            |
| verification lists exact commands with expected numbers                           | pass: r1 #2 is resolved. `pnpm test` now reads "48 passed (48)", "298 passed (298)", and red, green and hook-smoke keep their numbers. |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass for tooling (unchanged from round 1)                                                                                              |
| the section has a `Lead approves spec` box, ticked only by a human                | n/a: no section. `Plan approved by:` is empty and I did not touch it.                                                                  |
| no settled D-n contradicted                                                       | pass (unchanged). `tier.sh` prints `high`.                                                                                             |
| `scripts/next-task.sh --check B1.101` on the committed plan says no overlap       | pass: "[next-task] B1.101: no overlap with any Doing or Review card"                                                                   |

What round 1's reasons became:

- **#1 (guide row): resolved.** The plan now makes B1.101 its own carrier: the closing lane is `-partial`, pending (a)
  the `--sync` mention in `scripts/CLAUDE.md` and (b) the time metric, "Done when both are in". The card stays in
  README "Remaining", so the item is tracked.
- **#2 (`pnpm test` number): resolved.**
- **#3 (signal): only partly resolved.** See reason 1 below.
- **Notes.** Both are taken up: the `eligible.sh` choice is stated, and the plan says which paths git-workflow.md
  describes.

What I ran:

- **Green.** Prototype r2: "22 probes OK".
- **Red.** Today's `run.sh` (`orig/run.sh`) under the r2 smoke: `FAIL R21`, `FAIL R22`, "2 of 22 probes FAILED". The
  TERM case also fails there, on the usage line.
- **Probe: TERM during the push.** On a copy (`$TMPDIR/b1101-r2push`) with two changes:
  - the guard stubs no longer nap (`SMOKE_NAP` renamed in `run-smoke.sh:605`);
  - `pr-step.sh push` naps 3 s after its `git push` returns.

  The smoke's existing R22 TERM case then lands its TERM while `pr-step.sh push` is still running, after the remote
  has taken the merge. Result: `PROBE HEAD=f7a918e ORIGIN=945a82a K1=f7a918e RC=143`, `FAIL R22`, "1 of 22 probes
  FAILED".

### Reasons (changes requested)

1. **The r2 signal reset rolls back a push that has already landed.**

   ```
   [1] KIND: correctness
       WHERE: prototype r2 scripts/agent/run.sh:355-370 (SYNC_PRE set before `git merge`, cleared only after
              `pr-step.sh push` returns) and on_signal:269
       DEFECT: SYNC_PRE stays set while `pr-step.sh push` runs, so a signal that bash handles after the push has
               updated origin resets the worktree to <pre> below the pushed head.
       TRIGGER: TERM to run.sh (`kill`, `docker compose stop`) or Ctrl-C while `pr-step.sh push` runs. Bash runs the
                trap only when the foreground child returns, so a push that has reached the remote still completes,
                and then the trap runs `reset --keep <pre>`.
       WRONG BEHAVIOUR: origin/<branch> = the merge (945a82a) and the worktree's HEAD = <pre> (f7a918e), with no issue
                comment. The next `--sync` fetches, finds HEAD ≠ origin/<branch> and refuses with "run
                scripts/agent/run.sh <n>": the full run that r1 #3 set out to avoid, now with the PR's real head
                ahead of the worktree. The missing comment also loses the data point that pending item (b) reads
                ("from the issue comment").
       CONFIDENCE: confirmed (probe above, bash 3.2)
   ```

   - Not wrong: the plan's R22 row only states "TERM while a guard runs", and that holds.
   - Wrong: "resets to `<pre>` … so the next `--sync` starts from the PR's head" does not hold for the push step,
     which is the slowest of the three steps after the merge (network).
   - Fix (the plan picks one):
     - (a) Before resetting, `on_signal` checks whether the push landed (for example, the remote-tracking ref that
       `push -u` updates, or `ls-remote`, against the merge) and keeps the merge if it did. Add an R22 case: TERM
       during the push, then HEAD = origin's branch.
     - (b) Clear `SYNC_PRE` just before the push and state the push window as a cost: after a signal during the
       push, the next `--sync` may say "nothing to do" or refuse.
   - Either way, the 13-mutant list gains the case.

### Notes (not blocking)

- The plan is 98 lines. It is still within the B1.95 precedent, and the extra lines answer round 1.

Verdict: changes requested

Riskiest unfalsified: GitHub's "mergeable" once the branch contains `origin/main`. It holds by construction, but only
the next real batch shows it. INT (Ctrl-C reaches `git push` itself) is also unprobed: its outcome depends on how far
the push got.

## Diff review (round 1)

Diff at 803ef8c, red e21f041, against `origin/main` 1fe8f00 (the branch's merge base). The plan's round 3 was not
re-reviewed, so this pass also checks the r2 #1 fix in the code. Probes ran on `git clone .` copies under `$TMPDIR`,
with `/bin/bash` 3.2.

### Command results (last line of each)

| Command                                        | Result                                                                                                                                                                     |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                                    | "All matched files use Prettier code style!" (eslint clean)                                                                                                                |
| `pnpm typecheck`                               | `tsc --noEmit`, exit 0                                                                                                                                                     |
| `pnpm test`                                    | "Test Files 48 passed (48)", "Tests 298 passed (298)"                                                                                                                      |
| `pnpm test:e2e`                                | "70 passed (1.7m)"                                                                                                                                                         |
| `pnpm test:mutation`                           | "Final mutation score of 92.84 is greater than or equal to break threshold 70" (no `src/` change)                                                                          |
| `/bin/bash scripts/agent/run-smoke.sh` (green) | "22 probes OK"                                                                                                                                                             |
| the same at e21f041 (red)                      | `FAIL R21`, `FAIL R22`, "2 of 22 probes FAILED"                                                                                                                            |
| `scripts/hook-smoke.sh`                        | "hook-smoke: 749 probes OK"                                                                                                                                                |
| `scripts/ci/check-suppressions.sh`             | "OK: no new suppressions"                                                                                                                                                  |
| `scripts/ci/check-config-change.sh`            | `::error::` locally (it reads the label only in CI); PR #315 carries `config-change-approved`                                                                              |
| `scripts/ci/check-feat-commits.sh`             | "OK: no feat commit touches tests"                                                                                                                                         |
| `scripts/ci/check-ac-coverage.sh`              | "OK: every criterion of a shipped section has a test"                                                                                                                      |
| `scripts/ci/check-spec-sections.sh`            | "OK: sections cited: 1 … 40"                                                                                                                                               |
| `scripts/ci/check-features-map.sh`             | "OK"                                                                                                                                                                       |
| `scripts/ci/check-backlog.sh`                  | "OK: README matches the cards"                                                                                                                                             |
| `scripts/ci/check-plan-scope.sh`               | "OK: chore/B1.101-sync-ready-pr stays inside the approved plan of B1.101"                                                                                                  |
| `scripts/verify-red.sh B1.101`                 | `::error::no 'test(<pkg>): B1.101 … (red)' commit`: expected, the red commit drops the marker (smoke only, as B1.82, B1.88, B1.95; its body says so); I ran the red myself |
| `scripts/next-task.sh --check B1.101`          | "[next-task] B1.101: no overlap with any Doing or Review card"                                                                                                             |
| `git diff --stat origin/main...HEAD`           | 8 files, 554 insertions, 7 deletions (run.sh 86, run-smoke.sh 128, the rest docs and `work/B1.101/`)                                                                       |

### Checklist

- AC: no section. The card's acceptance 1 (`--sync`) is R21 and R22; acceptance 2 (`[unverified]` replaced) is the
  two status lines in `E1-todos.md`; acceptance 3 (the time metric) is the planned `-partial` pending item; acceptance 4
  (label) is on PR #315.
- No test weakened: `git log --first-parent --no-merges e21f041..HEAD -- '*.test.*' e2e/ 'scripts/*smoke*'` is empty,
  and the remerge-diff of merges in that range touching tests is empty. The green commit touches no smoke file.
- Every changed file is in the plan's Files table (`check-plan-scope.sh` agrees). Interfaces match the plan: usage
  string, exit 0 or 1, refusal shape, comment prefix (no-rework.sh and unattended.sh read it as a runner comment; its
  outcome `synced` falls after `ready`, outside unattended.sh's stop window).
- n/a: Zod, Prisma, SQL, migration (bash only). No secret, no suppression. No features-map row (tooling).
- Revert probes (one changed line at a time, on copies):
  - the push-failure `wgit reset -q --keep "$pre"` removed: "22 probes OK" (finding 1);
  - `wgit merge --abort` removed from `on_signal`: "22 probes OK" (note 2);
  - `SYNC_PRE=""` after the push removed: "22 probes OK" (equivalent: the HEAD = `origin/<branch>` check in
    `on_signal` already keeps a landed merge, so no test can see it).
- Behaviour probe: a bare origin whose `pre-receive` exits 1. Result: rc 1, HEAD back at the tip, origin's branch
  unchanged, no MERGE_HEAD, lock gone, no comment, "scripts/pr-step.sh push failed: error: failed to push some refs …;
  the branch is back at 103bf7b". The next `--sync` (hook removed) synced, rc 0. So the code is right; only the test
  is missing.

### Findings

```
[1] KIND: coverage
    WHERE: scripts/agent/run.sh:374 (push failure: `wgit reset -q --keep "$pre"`), scripts/agent/run-smoke.sh R22
    DEFECT: no probe makes `pr-step.sh push` fail, so the reset that keeps the plan's "each refusal … the branch as it
            was" on the push step can be deleted with every probe still green.
    TRIGGER: on a copy, delete `wgit reset -q --keep "$pre";` from the push-failure branch and run
             `/bin/bash scripts/agent/run-smoke.sh`.
    WRONG BEHAVIOUR: "22 probes OK". With that mutant, a rejected or failed push (network, a GitHub branch rule) leaves
             the worktree on an unpushed merge; the next `--sync` refuses with "HEAD … is not origin/<branch> …: run
             scripts/agent/run.sh <n>", which is the 6–9 minute full run that plan review r1 #3 set out to avoid. R22's
             header says "every --sync refusal", but the push step is not one of its cases.
    CONFIDENCE: confirmed (mutant ran: 22 probes OK; the push-reject probe on the unmutated code passes)
```

Fix: an R22 case. A bare-origin `pre-receive` that exits 1, then `refuse push "$k1" 'pr-step.sh push failed'`; my
probe above is that case. It lands as `test(scripts): B1.101 review pass 1 -- …`, and the plan's mutant list gains
"no reset after a failed push".

### Notes (not blocking)

1. Dev-lead's question (1), a push that lands and still exits non-zero. `pr-step.sh push` is only `git push -u`
   under `set -e`, so this needs a connection lost after the remote updated its ref. The reset then leaves HEAD below
   origin's branch. The next `--sync` refuses, naming `run.sh <n>`, which is visible, not silent. The
   `refs/remotes/origin/<branch>` check from `on_signal` would not help here: git does not move that ref when the
   report is lost. Only `ls-remote` would. I would leave it.
2. `on_signal`'s `merge --abort` has no probe. It matters when TERM arrives while a conflicting `git merge` runs: bash
   runs the trap after the merge returns, with MERGE_HEAD set, and `git reset --keep` refuses in the middle of a merge.
   The timing is hard to hit from the smoke. The line is correct by reading; the plan did not list it as a case.
3. Dev-lead's question (2). "PR #n is mergeable once CI on <sha> is green", in stderr and in the issue comment, claims
   GitHub's call. It is false if another sibling merges first (BEHIND again) or if a review thread is unresolved (the
   ruleset sets `required_review_thread_resolution`). Pending item (b) reads that comment. Wording such as "contains
   origin/main <sha>; required checks run on <sha>" states only what run.sh knows. Not a defect in behaviour.
4. Dev-lead's question (3). `wgit` reads the global `SYNC_WT`, which `sync_issue` sets before its first `wgit` call.
   `on_signal` calls `wgit` only while `SYNC_PRE` is set, which is after that point. Unset, `cd ""` would act on the
   clone itself, but no path reaches it.
5. Dev-lead's question (4). The guards run from the merged worktree's `scripts/ci/`, the copy CI runs on the PR.
   Inside the runner container this is no new exposure. Run on the host, `--sync` executes a branch's scripts as the
   lead with no permission hook. A full run on the host already runs `pnpm test` on agent-written code, so this is
   the same kind of exposure, without the `dontAsk` layer. The compose header documents only `exec runner`.
6. The branch is 2 commits behind `origin/main` (#312, #314, docs only); PR #315 reads `BEHIND`. The PR head on GitHub
   is 1234757, without the red and green commits. Push before the PR leaves draft.

Verdict: back to test-writer

Riskiest unfalsified: GitHub's mergeability of a synced PR (holds by construction: once the branch contains
`origin/main`, GitHub's merge base is main's tip), and INT reaching `git push` itself mid-transfer, which only a real
batch shows.

## Diff review (round 2)

HEAD 3357890. Since round 1: cf071f4 (this file), 1dae919 `test(scripts): B1.101 review pass 1 -- probe a push origin
rejects` (run-smoke.sh only, +10 lines), and 3357890, a merge of `origin/main` (#312, #314, docs only). `git diff
803ef8c HEAD -- scripts/ .claude .devcontainer` is the 10 smoke lines; `run.sh` is unchanged.

### Command results (last line of each)

| Command                                             | Result                                                                                                                                            |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint` · `pnpm typecheck`                      | "All matched files use Prettier code style!" · exit 0                                                                                             |
| `pnpm test`                                         | "Test Files 48 passed (48)", "Tests 298 passed (298)"                                                                                             |
| `pnpm test:e2e`                                     | "70 passed (1.4m)"                                                                                                                                |
| `pnpm test:mutation`                                | "Final mutation score of 92.84 is greater than or equal to break threshold 70" (no `src/` change)                                                 |
| `/bin/bash scripts/agent/run-smoke.sh`              | "22 probes OK"                                                                                                                                    |
| the same, push-failure reset removed (copy)         | `push: rc=1 … the branch is back at 5a30eb1`, `after the rejected push: rc=1 … HEAD 839245c is not origin/…`, `FAIL R22`, "1 of 22 probes FAILED" |
| `scripts/hook-smoke.sh`                             | "hook-smoke: 749 probes OK"                                                                                                                       |
| suppressions · feat-commits · ac-coverage           | OK · OK · OK                                                                                                                                      |
| spec-sections · features-map · backlog · plan-scope | OK · OK · "OK: README matches the cards" · "OK: … stays inside the approved plan of B1.101"                                                       |
| `scripts/next-task.sh --check B1.101`               | "no overlap with any Doing or Review card"                                                                                                        |
| `git rev-list --count HEAD..origin/main`            | 0 (level with `origin/main`)                                                                                                                      |
| `git diff --stat origin/main...HEAD`                | 8 files, 665 insertions, 7 deletions                                                                                                              |

`verify-red.sh` and `check-config-change.sh` are as in round 1 (no `(red)` marker, explained; the label is read in CI).

### Checklist

- Round 1 #1 is resolved. The new R22 case refuses a rejected push with the branch, origin's branch, index and comments
  as before, then a second `--sync` syncs. The mutant that deletes the reset now fails R22. I confirmed this on a copy
  of HEAD, as shown in the table above.
- No test was weakened. The only test-side change after the red commit is 1dae919, a `test(...)` hardening commit
  without `(red)`, which adds a case and loosens nothing. The merge 3357890 touches no test, smoke or script
  (`--remerge-diff` over those paths is empty).
- Every changed file is still in the plan (`check-plan-scope.sh`). The extra mutant goes in the PR body's evidence, not
  in `plan.md`, which is right: the approved plan stays as approved.
- Round 1 note 3 (wording). I accept leaving it. The comment's last line, "after the next merge: `run.sh --sync <n>`",
  covers the BEHIND case. The unresolved-thread case is rare on a runner PR, and it is visible on GitHub.

### Findings

None.

Verdict: ready for PR

Riskiest unfalsified: GitHub's mergeability of a synced PR. It holds by construction: once the branch contains
`origin/main`, GitHub's merge base is main's tip. Only the next real batch shows it, and that batch also yields pending
item (b). INT reaching `git push` itself mid-transfer is still unprobed (round 1 note 1).
