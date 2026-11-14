## Item

B1.95 — run.sh runs its own scripts from a clone behind origin/main and never says so (tooling, no spec section)

- spec: none — tooling (`scripts/agent/run.sh`, its smoke, the compose header); no `src/` change, no section
- test: `scripts/agent/run-smoke.sh` R20 (new). Red: pending. Green: pending.
- acceptance: pending. The scripts-guide row (`scripts/CLAUDE.md`) is not in this PR (B1.97 plans that file); B1.95
  closes Partial pending it (plan, review r1 #1)
- risk tier: high (`scripts/agent/`, `.devcontainer/`); label `config-change-approved` (D-19)

## Plan

Copied from `backlog/work/B1.95/plan.md` (approved 00baa38).

### B1.95 plan — run.sh refuses a clone behind origin/main (tooling, no §)

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
a card branch running its own `run.sh`, is diverged as soon as `main` moves) lacks main's commits as much as a stale
clone does, so it refuses too; its fix is `merge origin/main` (dev-lead Loop 9's own step), since `--ff-only` cannot
move it. It never updates itself. `in_flight` then reads a fresh `origin/main` (comment updated). `--check-binary` and
`--mode` claim nothing: unchanged.

Costs, accepted by the lead:

- A card branch tests its own `run.sh` live only after merging `origin/main`.
- Each issue does one `git fetch origin main` (network, GitHub over HTTPS, the image's credential helper) before
  anything; `[unverified]` live.
- A fetch that fails 3 times (2 s apart) refuses the issue. On the host a stalled network has no git timeout: the issue
  waits for the OS's TCP timeout before a retry. Not probed.
- `--poll` on a stale clone prints one refusal per issue and still exits 0.

Not in this PR: the scripts guide's `agent/run.sh` row (`scripts/CLAUDE.md`, planned by B1.97). B1.95's closing lane
sets **Partial — merged <sha>, pending the `agent/run.sh` row of `scripts/CLAUDE.md`**; the next card that plans that
file adds it and flips B1.95 to Done.

#### Files

| File                                      | Change                                                                                                                        | Why        |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------- |
| `scripts/agent/run.sh`                    | `behind_problem` as above, called first in `run_issue`; header "Each run" chain names it; `in_flight` comment (fresh fetch)   | Acceptance |
| `scripts/agent/run-smoke.sh`              | bare `origin` borrowing the scratch repo's objects, `at <head> <main>`; R18 moves both; R20; header R1–R20                    | Test line  |
| `.devcontainer/runner/docker-compose.yml` | header: before each batch `exec runner sh -c 'git fetch origin && git merge --ff-only origin/main'`; run.sh refuses otherwise | Acceptance |
| `backlog/work/B1.95/*`                    | plan, review, pr-body                                                                                                         | pipeline   |

#### Interfaces touched

`run.sh <issue>`: new refusal, exit 1, stderr `[run] refused #<n>: …` (behind, fetch failed, nothing to compare). No
new flag, variable, outcome or exit code.

| Case                                                     | Want                                                                                                    |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| HEAD b0, origin c1 / c2 (1, 2 behind)                    | rc 1; no claude, eligible, claim, worktree, gh call; count, both shas, `merge --ff-only origin/main`    |
| HEAD c2, origin d1 (2 ahead, 1 behind)                   | rc 1, no call; count, both shas, `merge origin/main (HEAD also has 2 commits of its own)`, no `ff-only` |
| HEAD c1, origin b0 (ahead)                               | rc 0, 1 `-p` run, no "behind"                                                                           |
| `--poll`, issues 7, 8, 1 behind                          | 0 `-p`, 2 refusals, no seam but `gh issue list`                                                         |
| origin URL missing, last fetched origin/main = HEAD      | rc 1, "git fetch origin failed" + git's reason (the path), no "behind"                                  |
| `refs/remotes/origin/main.lock` held 1 s, origin 1 ahead | the retry gets through: the behind refusal, not "fetch failed"                                          |

#### Verification

`run-smoke.sh` is in no CI job: run locally with `/bin/bash` (3.2). Red: R1–R19 ok, R20 FAIL, "1 of 20 probes
FAILED". Green: "20 probes OK". Mutants each fail R20 only. `hook-smoke.sh` "726 probes OK" and `pnpm test`
"280 passed (280)" before and after; `check-plan-scope.sh`, `check-backlog.sh` OK; lint, typecheck exit 0; CI green.

Plan review: approved, round 2 · Plan approved by: lead, 2026-11-14 · Rounds: 1

## Map delta

None: tooling card, no `spec/features-map.md` row.

## Review

Pending: `/review-loop` (diff review).

## Evidence

- AC met: pending
- tier: high
- plan deviations: none
- trace: n/a

## Checklist

- [ ] **Diff matches the approved plan**: no file outside the Files table, no interface outside the list.
- [ ] Red commit precedes the change commit; no `feat(` commit touches `*.test.*` or `e2e/**`.
- [ ] Every `AC-§.n` of the section is a test title; mutation on `src/lib` + `src/actions` ≥ 70 %. (n/a: no section)
- [ ] No new `eslint-disable` / `@ts-ignore` / `@ts-expect-error`; protected config changed with label `config-change-approved`.
- [ ] Migrations reviewed as SQL; `prisma/seed.ts` updated if a table changed. (n/a)
- [ ] `spec/features-map.md` row moved (n/a); `docs/metrics.md` per-card row filled; mistake-log updated if a known mistake repeated.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
