# B1.101 plan — a ready runner PR comes back in line after a sibling's merge (tooling, no §)

Approach: a light `scripts/agent/run.sh --sync <issue>` (the card's first option): merge `origin/main` into the run's
branch in its own worktree with this clone's attributes, run the three table guards, push, comment; no `claude` run.
Not the second option (union tables left to the closing lane): the `main` ruleset requires an up-to-date branch
(`.claude/docs/git-workflow.md` "Bringing `main` in"), so after every merge each other ready PR is BEHIND even with no
shared line, and only a commit on the branch clears that; it would also move code-writer's `docs(map)` step and the
§ index row out of the feature PR (D-37 spec first, B1.100's files).

Measured (replaces B1.89's `[unverified]`): GitHub's merge ignores `.gitattributes`. A bare clone (no work tree, like
GitHub's) merging the parents of the runs' own merges 7eab1a5 (B7.1) and a0da40a (B7.2), `git merge-tree
--write-tree`, git 2.39.5: exit 1, conflicted `docs/metrics.md` and `spec/features-map.md`; this clone, same parents:
exit 0, both merges' `--remerge-diff` empty; GitHub read #300 and #302 `CONFLICTING` (card text).

`sync_issue <n>` in order, each refusal `[run] refused #<n>: <why>`, exit 1, the branch as it was:
identity (B1.69) → `behind_problem` (B1.95) → card id → `branch_of` → the worktree holding the branch (never created)
→ exactly one open PR of the branch, not a draft → the issue's lock (shared with a full run) → worktree on the branch,
no tracked change → fetch `origin/<branch>`, HEAD equal to it → `origin/main` already in HEAD: "nothing to do", exit 0
→ `git merge --no-ff -m "Merge remote-tracking branch 'origin/main' into <branch>" -m "Agent-Run: sync"`
(`RUNNER_CHILD=sync`, so lefthook's prepare-commit-msg writes the same trailer); conflict: `merge --abort`, names the
files and `scripts/agent/run.sh <n>` → `scripts/ci/check-spec-sections.sh`, `check-features-map.sh`,
`check-backlog.sh` in the worktree; one fails: `reset --keep <pre>`, names it and `run.sh <n>` (Loop 9 repairs) →
`scripts/pr-step.sh push` (fails: `reset --keep <pre>`) → issue comment (run.sh's fixed prefix, `**synced**`, branch,
shas, PR) → `[run] #<n> <card>: synced …; PR #<pr> is mergeable once CI on <sha> is green`. A TERM or INT after the
merge: `on_signal` (bash runs it once the running command returns) resets to `<pre>` unless the push landed, i.e.
`refs/remotes/origin/<branch>` (moved by `git push` only on success) equals HEAD; a landed merge stays, without the
issue comment (review r1 #3, r2 #1). Either way local and origin's branch agree, so the next `--sync` runs.
Git in the worktree runs with `GIT_DIR`, `GIT_WORK_TREE`, `GIT_INDEX_FILE` unset. No `claude` binary, login or version
is needed. No `eligible.sh`: `--sync` acts only on a worktree and an open PR that an eligible run already made.

Costs, for the lead to accept:

- The merge commit carries `Agent-Run: sync`, so no-rework (D-29) counts it as the runner's, although the lead types
  the command and no model runs. The card names exactly this; the trailer value `sync` keeps it apart from a run's `1`.
- The PR stays ready while CI runs on the new head (no `ready --undo`, no second `ready_for_review`); the ruleset's
  required checks hold the merge until green. No local lint, typecheck or tests (Loop 9 runs `mark-reviewed.sh`): a
  semantic clash between siblings shows only as red CI, then the lead runs `run.sh <n>`.
- One command per other ready PR after each merge; nothing runs it by itself. Comments: one per sync on the issue.
- `scripts/CLAUDE.md`'s `agent/run.sh` row does not name `--sync`: B1.98 (Doing) plans that file, and its approved
  plan adds only B1.95's behind check to that row (review r1 #1). The run.sh header, the compose header and
  git-workflow.md name it. The carrier is B1.101 itself, as B1.95 did: its closing lane is `-partial`, pending (a) the
  `--sync` mention in that row, added by the next card that plans `scripts/CLAUDE.md`, and (b) "the time from a
  sibling's merge to the next PR being mergeable", which exists only after E7 batch 2 (sibling `mergedAt` → green CI
  on the synced head, from the issue comment and `gh pr checks`). Done when both are in.
- git-workflow.md then names two paths for a ready PR left BEHIND: a waiting session's Loop 9 round trip
  (`dev-lead.md` Loop 9, unchanged) and, for a runner PR whose run has ended, `run.sh --sync <issue>`.

No advice (tier quick, no section). Risk tier **high** (`scripts/agent/`, `.claude/`, `.devcontainer/`, D-28) → the
lead's `approve`; the PR carries `config-change-approved` (D-19). Dev-lead writes `scripts/` (interactive, as B1.95).

## Files

| File                                      | Change                                                                                                        | Why             |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------- | --------------- |
| `scripts/agent/run.sh`                    | `sync_issue`, `wgit`, `--sync <issue>` in case, `USAGE`; no claude lookup for it; `on_signal` reset; header   | Acceptance 1    |
| `scripts/agent/run-smoke.sh`              | R21 (clean union sync, then level), R22 (refusals leave the branch as it was); header R1–R22                  | Test line       |
| `.devcontainer/runner/docker-compose.yml` | header: after each merge in a batch, `exec runner scripts/agent/run.sh --sync <issue>` per other ready PR     | Acceptance 1    |
| `.claude/docs/git-workflow.md`            | "Batch review": a ready runner PR is brought in line by `run.sh --sync <issue>`, GitHub ignores `merge=union` | Acceptance 1, 2 |
| `backlog/plan/E1-todos.md`                | B1.89 and B1.96 status lines: "GitHub mergeability [unverified]" → the measured behaviour (B1.101)            | Acceptance 2    |
| `backlog/work/B1.101/*`                   | plan, review, pr-body                                                                                         | pipeline        |

## Interfaces touched

`scripts/agent/run.sh --sync <issue>`: exit 0 synced or already level, 1 refused; no new variable or file under
`$RUNNER_RUNS` (the lock only). R21, R22 on a real worktree of the scratch repository, pushed to its bare origin:

| Case                                                                   | Want                                                                                                                                                                       |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R21 card and main each append a row to a `merge=union` table, PR ready | rc 0; merge commit, parents (tip, main), subject as above, trailer `sync`; origin's branch = it; 3 rows once; 3 guards in the worktree; 1 comment `**synced**`, `#12`, sha |
|                                                                        | no `CLAUDE` call (not even `--version`), no eligible/claim/worktree seam, no `pr ready`, no `stopped`, lock gone                                                           |
| R21 again, now level                                                   | rc 0, "already contains origin/main"; no guard, push or comment                                                                                                            |
| R22 conflict (plain file) · guard fails (union keeps F1 twice)         | rc 1, branch, origin's branch, index as before, no MERGE_HEAD, no comment; names `plain.txt` / `check-`, and `scripts/agent/run.sh 7`                                      |
| R22 no PR · draft · unpushed tip · tracked change · no worktree        | rc 1, nothing merged or pushed; `no open ready PR` (+ `run.sh 7`) · `origin/<branch>` · `uncommitted` (file kept) · `no worktree`                                          |
| R22 live lock · no identity · checkout behind · argv `""`, `7 8`, `x`  | rc 1, nothing changed; `locked` (lock kept) · `no git identity` · `behind origin/main by 1 commit` · usage naming `--sync <issue>`                                         |
| R22 TERM while a guard runs (after the merge, before the push)         | rc 143; branch, origin's branch, index as before, no MERGE_HEAD; lock gone; no comment                                                                                     |
| R22 TERM while the push runs, after origin took it (post-receive naps) | rc 143; HEAD the merge (parents tip, main) and origin's branch = HEAD; lock gone                                                                                           |

## Verification

`run-smoke.sh` is in no CI job: run locally with `/bin/bash` (3.2) at each step and in the diff review.

- Red `test(scripts): B1.101 run-smoke probes run.sh --sync (red)` (body "Red because run.sh has no --sync"):
  R1–R20 ok, R21, R22 FAIL, "2 of 22 probes FAILED" (prototype on 4c7d9e4: holds).
- Green `chore(scripts): B1.101 run.sh --sync brings a ready runner PR level with origin/main`: "22 probes OK"
  (prototype: holds). Mutants (prototype): no trailer, no guards, no reset after a guard, no merge abort, draft
  accepted, no level check, no HEAD = origin check, no dirty check, no lock, `GIT_DIR` kept, no identity, no behind
  check, no reset on TERM, reset on TERM even after a landed push — 14 of 14 fail R21 or R22 only (prototypes r1–r3).
- `hook-smoke.sh` "749 probes OK" before and after; `pnpm test` "Test Files 48 passed (48)", "Tests 298 passed (298)"
  before and after; `pnpm lint && pnpm typecheck` exit 0;
  `next-task.sh --check B1.101` no overlap; `check-plan-scope.sh`, `check-backlog.sh` OK; CI green.

## Work breakdown

| Step | Role     | Produces            | Commit                                                                                 |
| ---- | -------- | ------------------- | -------------------------------------------------------------------------------------- |
| 1    | dev-lead | red probes R21, R22 | `test(scripts): B1.101 run-smoke probes run.sh --sync (red)`                           |
| 2    | dev-lead | `--sync`, docs      | `chore(scripts): B1.101 run.sh --sync brings a ready runner PR level with origin/main` |
| 3    | reviewer | diff review         | `docs(backlog): B1.101 review pass N`                                                  |
| 4    | dev-lead | draft PR, label     | —                                                                                      |

Plan review: changes requested, round 2 (1 reason, fixed in round 3, not re-reviewed: cap 2) · Plan approved by: · Rounds: 1
