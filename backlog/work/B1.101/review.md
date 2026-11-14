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
