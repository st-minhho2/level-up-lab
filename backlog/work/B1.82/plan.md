# B1.82 plan — run.sh counts merged agent branches as in flight (tooling, no §)

Approach: `in_flight` returns the counted branches, one per line, instead of a count; `run_issue` counts the lines and
names them in the skip. Counted: every open PR head (unchanged), and a local `<type>/B<e>.<n>-agent` branch unless it
is merged. Merged = (a) its tip is an ancestor of `origin/main` **off its first-parent line**, or (b) `gh pr list
--head <b> --state all` lists a merged or closed PR and no open one. (b) is the case of 2026-11-06: `main` is
squash-only (no merge commit on `origin/main`; #216 merged `feat/B5.1-agent` as a03a9ea, whose tip is no ancestor).
Narrowing of the card's (a), for the lead to accept: a run's branch before its first commit has its tip on
`origin/main`'s first-parent line, an ancestor too, so the literal rule would let a 4th parallel run start (E6);
such a branch stays counted until it has a merged or closed PR, or `worktree-prune.sh` removes it. No fetch:
`origin/main` as last fetched (`worktree.sh` fetches each run). `gh` failing on `--head` → the branch counts (cap
holds). No advice (tier quick, no section). Risk tier **high** (`scripts/agent/`, D-28) → the lead's `approve`;
the PR carries `config-change-approved` (D-19). Dev-lead writes `scripts/`: interactive session (as B1.86).

## Files

| File                         | Change                                                                                      | Why        |
| ---------------------------- | ------------------------------------------------------------------------------------------- | ---------- |
| `scripts/agent/run.sh`       | `in_flight` lists branches by the rule above; line 220 counts them, skip names them         | Acceptance |
| `scripts/agent/run-smoke.sh` | `gh` shim honors `pr list --state/--head`; `prs <head>[:STATE]`; probe R18; header names it | Test line  |
| `backlog/work/B1.82/*`       | plan, review, pr-body                                                                       | pipeline   |

## Interfaces touched

`in_flight <own branch>` → stdout: counted branches, `LC_ALL=C sort -u`, one per line (was: a count). Skip line:
`[run] skip #<n>: <k> agent branches in flight (cap 3): <b1> <b2> <b3>` (was `skip #<n>: 3 agent branches in
flight`). New `gh` call per unmerged local agent branch: `gh pr list --head <b> --state all --limit 100 --json state`.
Exit codes, `CAP=3`, the open-PR call, other output unchanged. R18 (scratch repo, `origin/main` = merge of `m1–m3`
into `b0`, issue 7 = B1.44):

| Case | Local branches (tip)               | PRs                                 | Want: run / skip names    |
| ---- | ---------------------------------- | ----------------------------------- | ------------------------- |
| 1    | B9.1, B9.2, B9.3 at m1–m3 (merged) | —                                   | run                       |
| 2    | three on `om`/`b0` (no commit yet) | —                                   | skip: all three           |
| 3    | three with own tips                | MERGED, CLOSED, MERGED              | run                       |
| 4    | three with own tips                | —                                   | skip: all three           |
| 5    | B9.1, B9.2 own; B9.3 m3; B9.4 own  | B9.1 CLOSED+OPEN, B9.6 OPEN, B9.4 M | skip: B9.1 B9.2 B9.6 only |
| 6    | two own tips, one at m3            | —                                   | run                       |

## Verification

- Red `test(scripts): B1.82 run-smoke probes merged agent branches` (body "Red because in_flight counts every local
  agent branch"): `scripts/agent/run-smoke.sh` → R1–R17 ok, R18 FAIL (all 6 cases), "1 of 18 probes FAILED".
- Green `chore(scripts): B1.82 run.sh counts only unmerged agent branches`: "18 probes OK" (R1–R17 verdicts
  unchanged). Prototype on 7c4300e: both hold on bash 3.2. `scripts/next-task.sh --check B1.82` no overlap;
  `check-plan-scope.sh`, `check-backlog.sh` OK; `pnpm lint && pnpm typecheck` clean, `pnpm test` unchanged; CI green.

## Work breakdown

| Step | Role     | Produces        | Commit                                                             |
| ---- | -------- | --------------- | ------------------------------------------------------------------ |
| 1    | dev-lead | red probe R18   | `test(scripts): B1.82 run-smoke probes merged agent branches`      |
| 2    | dev-lead | `in_flight` fix | `chore(scripts): B1.82 run.sh counts only unmerged agent branches` |
| 3    | reviewer | diff review     | `docs(backlog): B1.82 review pass N`                               |
| 4    | dev-lead | draft PR, label | —                                                                  |

Not in scope: `--poll`'s order, the lock, `worktree-prune.sh`, the runner container, a fetch in `run.sh`.

Plan review: pending · Plan approved by: · Rounds: 1
