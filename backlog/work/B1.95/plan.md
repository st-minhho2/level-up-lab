# B1.95 plan — run.sh refuses a clone behind origin/main (tooling, no §)

Approach: one function, `behind_problem`, called first in `run_issue` (so per issue, also each `--poll` issue), before
`eligible.sh`, `gh`, the claim, the worktree or any `claude -p`. Non-empty → `[run] refused #<n>: <why>`, `return 1`
(`run.sh <issue>` exits 1; `--poll` prints "#n refused" and goes on, as for any per-issue refusal today):

```bash
local err try=1 ahead n head main fix
until err="$(GIT_TERMINAL_PROMPT=0 git fetch -q origin main 2>&1 </dev/null)"; do
  [[ $try -lt 3 ]] || { echo "git fetch origin failed, so origin/main is not known: $(grep -m1 . <<< "$err")"; return; }
  try=$((try + 1)); sleep 2   # three parallel runs share the clone: one may meet another's ref lock
done
head="$(git rev-parse --short HEAD)" && main="$(git rev-parse --short origin/main)" \
  && read -r ahead n < <(git rev-list --left-right --count HEAD...origin/main) && [[ -n "$n" ]] \
  || { echo "no HEAD or origin/main to compare after git fetch"; return; }
[[ $n -gt 0 ]] || return 0
fix="merge --ff-only origin/main"
[[ $ahead -eq 0 ]] || fix="merge origin/main (HEAD also has $ahead commit(s) of its own)"
echo "this checkout is behind origin/main by $n commit(s) (HEAD $head, origin/main $main)," \
  "so the run.sh running is stale; fix: git -C $ROOT $fix, then rerun"
```

Behind = `HEAD..origin/main` non-empty. A HEAD only ahead runs. A diverged HEAD (review r1 #2: the card's own example,
a card branch running its own `run.sh`, is diverged as soon as `main` moves; this branch is 3 ahead, 2 behind) lacks
main's commits as much as a stale clone does, so it refuses too; its fix is `merge origin/main` (dev-lead Loop 9's own
step), since `--ff-only` cannot move it. It never updates itself. `in_flight` then reads a fresh `origin/main` (comment
updated). `--check-binary` and `--mode` claim nothing: unchanged.

Costs, for the lead to accept:

- A card branch tests its own `run.sh` live only after merging `origin/main` (the card text's "ahead still runs" holds
  only while `main` has not moved).
- Each issue does one `git fetch origin main` (network, GitHub over HTTPS, the image's credential helper) before
  anything; in the container that path is the lead's own manual fix of 2026-11-13, so `[unverified]` only as `run.sh`.
- A fetch that fails 3 times (2 s apart) refuses the issue: no network means no run, never a stale compare. On the
  host a stalled network has no git timeout: the issue waits for the OS's TCP timeout before a retry (the container's
  firewall rejects, so it fails fast there). Not probed (review r1).
- `--poll` on a stale clone prints one refusal per issue and still exits 0 (per-issue contract, card text).

No advice (tier quick, no section). Risk tier **high** (`scripts/agent/`, `.devcontainer/`, D-28) → the lead's
`approve`; the PR carries `config-change-approved` (D-19). Dev-lead writes `scripts/` and `.devcontainer/` (interactive,
as B1.82, B1.88). Not touched: `.prettierignore`, `scripts/table-merge-smoke.sh` (B1.97); B1.73's stale branch line.

Not in this PR: the acceptance item "the scripts guide names the check" (the `agent/run.sh` row of `scripts/CLAUDE.md`).
`next-task.sh --check` found that file planned by B1.97 (Doing, #288); re-planned around it, not approved over it. The
carrier is B1.95 itself (review r1 #1): its closing lane sets **Partial — merged <sha>, pending the `agent/run.sh` row
of `scripts/CLAUDE.md`**, so the card keeps its README "Remaining" row until that row lands. The
next card that plans `scripts/CLAUDE.md` adds it: B1.98 (its brief carries it; its card text does not) or B1.99, and
that card's closing lane flips B1.95 to Done. The lead may rule another carrier.

## Files

| File                                      | Change                                                                                                                        | Why        |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------- |
| `scripts/agent/run.sh`                    | `behind_problem` as above, called first in `run_issue`; header "Each run" chain names it; `in_flight` comment (fresh fetch)   | Acceptance |
| `scripts/agent/run-smoke.sh`              | bare `origin` borrowing the scratch repo's objects, `at <head> <main>`; R18 moves both; R20; header R1–R20                    | Test line  |
| `.devcontainer/runner/docker-compose.yml` | header: before each batch `exec runner sh -c 'git fetch origin && git merge --ff-only origin/main'`; run.sh refuses otherwise | Acceptance |
| `backlog/work/B1.95/*`                    | plan, review, pr-body                                                                                                         | pipeline   |

## Interfaces touched

`run.sh <issue>`: new refusal, exit 1, stderr `[run] refused #<n>: …` (behind, fetch failed, nothing to compare). No
new flag, variable, outcome or exit code. R20 (scratch repo's `origin/main` left stale unless run.sh fetches):

| Case                                                     | Want                                                                                                    |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| HEAD b0, origin c1 / c2 (1, 2 behind)                    | rc 1; no claude, eligible, claim, worktree, gh call; count, both shas, `merge --ff-only origin/main`    |
| HEAD c2, origin d1 (2 ahead, 1 behind)                   | rc 1, no call; count, both shas, `merge origin/main (HEAD also has 2 commits of its own)`, no `ff-only` |
| HEAD c1, origin b0 (ahead)                               | rc 0, 1 `-p` run, no "behind"                                                                           |
| `--poll`, issues 7, 8, 1 behind                          | 0 `-p`, 2 refusals, no seam but `gh issue list`                                                         |
| origin URL missing, last fetched origin/main = HEAD      | rc 1, "git fetch origin failed" + git's reason (the path), no "behind"                                  |
| `refs/remotes/origin/main.lock` held 1 s, origin 1 ahead | the retry gets through: the behind refusal, not "fetch failed"                                          |

## Verification

`run-smoke.sh` is in no CI job: run locally with `/bin/bash` (3.2) at each step and in the diff review.

- Red `test(scripts): B1.95 run-smoke probes a clone behind origin/main (red)` (body "Red because run.sh never
  fetches"): R1–R19 ok, R20 FAIL, "1 of 20 probes FAILED" (prototype on d106fe9: holds).
- Green `chore(scripts): B1.95 run.sh refuses a clone behind origin/main`: "20 probes OK" (prototype: holds).
  Mutants (prototype): no fetch, failed fetch ignored, no retry, check after the lock, sides swapped, return 0,
  `--ff-only` always, diverged runs, ahead refuses — each must fail R20, and only R20 (setup fetches once, so
  `origin/main` exists without run.sh's fetch).
- `hook-smoke.sh` "726 probes OK" before and after (it does not read `run.sh`); `pnpm test` "280 passed (280)"
  before and after; `next-task.sh --check B1.95` no overlap; `check-plan-scope.sh`, `check-backlog.sh` OK;
  `pnpm lint && pnpm typecheck` exit 0; CI green.

## Work breakdown

| Step | Role     | Produces        | Commit                                                                   |
| ---- | -------- | --------------- | ------------------------------------------------------------------------ |
| 1    | dev-lead | red probe R20   | `test(scripts): B1.95 run-smoke probes a clone behind origin/main (red)` |
| 2    | dev-lead | check, docs     | `chore(scripts): B1.95 run.sh refuses a clone behind origin/main`        |
| 3    | reviewer | diff review     | `docs(backlog): B1.95 review pass N`                                     |
| 4    | dev-lead | draft PR, label | —                                                                        |

Plan review: approved, round 2 · Plan approved by: lead, 2026-11-14 · Rounds: 1
