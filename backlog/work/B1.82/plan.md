# B1.82 plan — run.sh counts merged agent branches as in flight (tooling, no §)

Approach: `in_flight` returns the counted branches, one per line, instead of a count; `run_issue` counts the lines and
names them in the skip. Counted: every open PR head (unchanged), and a local `<type>/B<e>.<n>-agent` branch unless it
is merged. Merged = (a) its tip is an ancestor of `origin/main` **off its first-parent line**, or (b) `gh pr list
--head <b> --state all` lists a MERGED PR of it (any head), or a CLOSED one whose `headRefOid` is its tip; the state
filter is `run.sh`'s own `--jq`. (b) is the case of 2026-11-06 and the only rule that fires on this repo: `main` is
squash-only (`git rev-list --merges --count origin/main` = 0), so a merged tip is never an ancestor. A MERGED PR needs
no tip match because GitHub can move the head past the run's last push (#200 merged at db95f93, parent 5e23968 = the
run's tip; plan review 2). (a) covers merge-commit merges, which GitHub allows.

Costs, for the lead to accept:

- **(a) is narrower than the card:** a run's branch before its first commit sits on `origin/main`'s first-parent line,
  an ancestor too, so the literal rule would let a 4th parallel run start (E6). Such a branch stays counted until it
  has a merged or closed PR at its tip, or `worktree-prune.sh` removes it.
- **(b) ties the fix to `gh`:** `gh` failing → no head matches → the branch counts: the cap holds, but the
  2026-11-06 skip comes back for that call.
- A run resumed on a closed PR's branch is not counted until its first new commit (tip = closed head); one resumed on
  a merged PR's branch is not counted at all (a merged card gets a new card, not a resumed run).
- No fetch: `origin/main` as last fetched (`worktree.sh` fetches each run).

No advice (tier quick, no section). Risk tier **high** (`scripts/agent/`, D-28) → the lead's `approve`; the PR carries
`config-change-approved` (D-19). Dev-lead writes `scripts/`: interactive session (as B1.86).

## Files

| File                         | Change                                                                                                                                | Why        |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| `scripts/agent/run.sh`       | `in_flight` lists branches by the rule above; line 220 counts them, skip names them                                                   | Acceptance |
| `scripts/agent/run-smoke.sh` | `gh` shim applies gh's own `--state`/`--head` filters; `prs <head>[:STATE[:oid]]` (oid default: the local tip); R18; header names R18 | Test line  |
| `backlog/work/B1.82/*`       | plan, review, pr-body                                                                                                                 | pipeline   |

## Interfaces touched

`in_flight <own branch>` → stdout: counted branches, `LC_ALL=C sort -u`, one per line (was: a count). Skip line:
`[run] skip #<n>: <k> agent branches in flight (cap 3): <b1> <b2> <b3>` (was `skip #<n>: 3 agent branches in
flight`). New call per local agent branch not merged by (a): `gh pr list --head <b> --state all --limit 100 --json
state,headRefOid --jq '<"STATE oid" of MERGED or CLOSED PRs>'`. Exit codes, `CAP=3`, the open-PR call unchanged. R18 (scratch
repo, `origin/main` = `om`, a merge of `m1–m3` into `b0`; issue 7 = B1.44):

| Case | Local branches (tip)               | PRs (head oid = tip unless named)                 | Want: run / skip names                            |
| ---- | ---------------------------------- | ------------------------------------------------- | ------------------------------------------------- |
| 1    | B9.1, B9.2, B9.3 at m1–m3 (merged) | —                                                 | run                                               |
| 2    | three on `om`/`b0` (no commit yet) | —                                                 | skip: all three                                   |
| 3    | three with own tips                | MERGED, CLOSED, MERGED                            | run; gh got `--head chore/B9.2-agent --state all` |
| 4    | B9.1, B9.2, B9.3, B9.5, B9.6 own   | B9.1 CLOSED at m1, B9.2 CLOSED, B9.3 MERGED at m3 | skip: B9.1 B9.5 B9.6 (#200 shape: B9.3 not)       |
| 5    | three with own tips                | —                                                 | skip: all three                                   |
| 6    | B9.1, B9.2 own; B9.3 m3; B9.4 own  | B9.1 CLOSED+OPEN, B9.6 OPEN, B9.4 M               | skip: B9.1 B9.2 B9.6 only                         |
| 7    | two own tips, one at m3            | —                                                 | run                                               |

## Verification

`run-smoke.sh` is in no CI job or hook: R1–R18 run locally on bash 3.2 at each step and again in the diff review.

- Red `test(scripts): B1.82 run-smoke probes merged agent branches` (body "Red because in_flight counts every local
  agent branch"): R1–R17 ok, R18 FAIL (all 7 cases), "1 of 18 probes FAILED".
- Green `chore(scripts): B1.82 run.sh counts only unmerged agent branches`: "18 probes OK" (R1–R17 unchanged).
  Prototype on 7c4300e: both hold. `next-task.sh --check B1.82` no overlap; `check-plan-scope.sh`,
  `check-backlog.sh` OK; `pnpm lint && pnpm typecheck` clean; `pnpm test` 241 passed (39 files), unchanged; CI green.

## Work breakdown

| Step | Role     | Produces        | Commit                                                             |
| ---- | -------- | --------------- | ------------------------------------------------------------------ |
| 1    | dev-lead | red probe R18   | `test(scripts): B1.82 run-smoke probes merged agent branches`      |
| 2    | dev-lead | `in_flight` fix | `chore(scripts): B1.82 run.sh counts only unmerged agent branches` |
| 3    | reviewer | diff review     | `docs(backlog): B1.82 review pass N`                               |
| 4    | dev-lead | draft PR, label | —                                                                  |

Not in scope: `--poll`'s order, the lock, `worktree-prune.sh`, the runner container, a fetch in `run.sh`.

Plan review: pending · Plan approved by: · Rounds: 1
