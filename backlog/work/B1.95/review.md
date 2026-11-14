# B1.95 review

## Plan review (round 1)

Plan at ce09521. Tooling card, no section. I ran the prototype (`run.sh`, `run-smoke.sh`) on copies under `$TMPDIR`
with `/bin/bash` 3.2.57.

| Check                                                                             | Result                                                                                                                                                                                                                      |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass, n/a: no section. All three files come from the card (`run.sh`, its smoke, the compose header). `plan-files.sh --any B1.95 HEAD` lists the 3 files plus `backlog/work/B1.95/*`.                                        |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass, n/a: bash only. The one new interface is the refusal: exit 1, `[run] refused #<n>: …`. It adds no flag, variable or exit code.                                                                                        |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: no advice (tier quick, no section), stated                                                                                                                                                                            |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: 6 acceptance items and 5 R20 cases, each with an rc, a call count or exact text                                                                                                                                       |
| verification lists exact commands with expected numbers                           | fail (minor), reason 3. Red is "1 of 20 probes FAILED" and green is "20 probes OK"; I reproduced both. `hook-smoke.sh` "OK" and `pnpm test` "unchanged" give no number.                                                     |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass for tooling. No skeleton is needed: R20 fails on an assertion, not on a missing function. There is no features map row. The steps are red `test(scripts):`, then green `chore(scripts):` (no smoke file), then review. |
| the section has a `Lead approves spec` box, ticked only by a human                | n/a: no section. `Plan approved by:` is empty and was not touched.                                                                                                                                                          |
| no settled D-n contradicted                                                       | pass. D-19: the label is planned. D-28: `scripts/agent/tier.sh` prints `high`. D-33 says the three runs of a batch start together, which justifies the shared-clone retry.                                                  |
| `scripts/next-task.sh --check B1.95` on the committed plan says no overlap        | pass: "[next-task] B1.95: no overlap with any Doing or Review card"                                                                                                                                                         |

What I ran on the prototype:

- Green: "20 probes OK", in 88 s.
- Red (today's `run.sh`, the d106fe9 copy): R1–R19 ok, then `FAIL R20` and "1 of 20 probes FAILED".
- The plan's 8 mutants, all run in parallel (8× load): no fetch, failed fetch ignored, no retry, check after the lock,
  ahead count, return 0, symmetric count, diverged runs. Each gives `FAIL R20` and nothing else ("1 of 20 probes
  FAILED"), so the claim "each fails R20, and only R20" holds.
- The no-retry mutant dies on the ref-lock case: "git fetch origin failed … cannot lock ref". It still died under the
  8× load.

### Reasons (changes requested)

1. **The plan defers an acceptance item to a card that does not hold it.** The plan says "Carried by B1.98: … the
   `agent/run.sh` row of `scripts/CLAUDE.md`". On `origin/main` (8b0358e, #287), B1.98 is "unattended.sh counts a run
   the lead stopped, ruled on and relaunched as unattended". None of its acceptance items mentions `run.sh` or the
   scripts guide. So "Partial — pending B1.98's guide row" would point at nothing, and the guide item would be
   dropped without anyone noticing.

   Name a real carrier, or a real path:
   - (a) B1.97 (#288, Review, plan approved) owns `scripts/CLAUDE.md`. Once it merges, `next-task.sh --check` frees
     the file, and this plan can add the row before build or in a re-approved plan.
   - (b) File a card through the filing lane and name its id.
   - (c) The lead rules that the overlap is accepted. If either row outgrows its column, B1.97's own subject (Prettier
     re-pads the whole table) makes the two branches conflict.

2. **The plan does not list as a cost that it narrows the card's "ahead still runs" example, and the fix it prints
   for that case cannot work.** The card says "A `HEAD` ahead of `origin/main`, such as a card branch running its own
   `run.sh`, still runs." A card branch is ahead only until `main` moves; after that it is diverged, and the plan
   refuses a diverged HEAD. This branch shows it: right now it is 3 ahead and 2 behind `origin/main` (52f1934). So
   `.worktrees/chore-b1-95-run-behind-main/scripts/agent/run.sh <issue>`, the live check of this card's own
   `run.sh`, would refuse until `main` is merged into the branch.

   The refusal it prints for that case says `fix: git -C <ROOT> merge --ff-only origin/main`. On a diverged HEAD
   that command fails ("Not possible to fast-forward"). R20's diverged case asserts that exact fix text, so the
   probe pins a fix that cannot succeed.

   The plan mentions this only in prose ("its `--ff-only` then fails and says so; the lead merges"). Two things are
   needed:
   - Move it into "Costs, for the lead to accept": a branch's own `run.sh` needs `origin/main` merged in before a
     live run.
   - Do one of two things: print a fix that works for a diverged HEAD (for example
     `git merge origin/main` when `HEAD` is not an ancestor) and make R20 assert it, or say in the plan that the
     printed fix is wrong for that case and why that is accepted.

3. **Minor: two verification lines give no number.** Give the exact final line of `scripts/hook-smoke.sh` (its probe
   count) and the `pnpm test` count, so the diff review can compare before and after.

Notes (not blocking):

- In the container the firewall REJECTs (`init-firewall.sh:45`), so a blocked fetch fails fast. On the host, a
  stalled network has no git or HTTP timeout, so the first fetch could block an issue for the OS TCP timeout before
  the retries start. No probe covers a hang.
- How fast the ref-lock case runs depends on timing: the lock is held 1 s while `preflight` runs. If preflight takes
  more than 1 s, the first fetch succeeds and the no-retry mutant survives. The green result does not depend on the
  timing, so this does not make the test flaky.

Verdict: changes requested

## Plan review (round 2)

Plan at a0cb74e. I ran the revised prototype (`run.sh` = `run.sh.green`, `run-smoke.sh`) on copies under `$TMPDIR`
with `/bin/bash` 3.2.

| Check                                                                             | Result                                                                                                                                                                                                                                                                                                                              |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass, n/a: no section. `plan-files.sh --file` lists `scripts/agent/run.sh`, `scripts/agent/run-smoke.sh`, `.devcontainer/runner/docker-compose.yml` and `backlog/work/B1.95/*`. All of them come from the card.                                                                                                                     |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass, n/a: bash only. The one new interface is the refusal: exit 1, `[run] refused #<n>: …`. It adds no flag, variable, outcome or exit code.                                                                                                                                                                                       |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: no advice (tier quick, no section), and the plan says so                                                                                                                                                                                                                                                                      |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: 6 R20 cases, each with an rc, a call count or exact text. The new diverged case asserts `merge origin/main (HEAD also has 2 commits of its own)` and that `ff-only` is absent.                                                                                                                                                |
| verification lists exact commands with expected numbers                           | pass (r1 #3 answered). `pnpm test` → "280 passed (280)": I reproduced it (45 files). `hook-smoke.sh` → "726 probes OK" `[unverified]` here: my clone had no `node_modules`, so 687 ok and 15 environment FAILs. 726 is the count B1.84 and B1.85 recorded. Red "1 of 20 probes FAILED" and green "20 probes OK": I reproduced both. |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass for tooling: red `test(scripts): … (red)` with a "Red because" body, then green `chore(scripts):`, then review. There is no skeleton: R20 fails on an assertion. There is no map row.                                                                                                                                          |
| the section has a `Lead approves spec` box, ticked only by a human                | n/a: no section. `Plan approved by:` is empty and I left it untouched.                                                                                                                                                                                                                                                              |
| no settled D-n contradicted                                                       | pass. D-19: the label is planned. D-28: `tier.sh backlog/work/B1.95/plan.md` → `high`, and the plan asks for the lead's `approve`. D-33: three parallel runs justify the ref-lock retry. The diverged fix matches dev-lead Loop 9 (`git fetch origin && git merge origin/main`, `dev-lead.md:101`).                                 |
| `scripts/next-task.sh --check B1.95` on the committed plan says no overlap        | pass: "[next-task] B1.95: no overlap with any Doing or Review card". `check-plan-scope.sh`: "OK: chore/B1.95-run-behind-main changes only paperwork". `check-backlog.sh`: OK.                                                                                                                                                       |

Round 1 reasons:

1. **Answered.** The guide row no longer rides on B1.98 alone. B1.95's own closing lane sets `Partial — merged <sha>,
pending the agent/run.sh row of scripts/CLAUDE.md`, so the README "Remaining" row stays until the row lands
   (`card-status.sh` accepts `Partial`; `backlog/CLAUDE.md` "Closing a card" step 4). The item cannot drop out of
   sight.
2. **Answered.** "Costs" now says a card branch tests its own `run.sh` live only after merging `origin/main`. A
   diverged HEAD now gets `merge origin/main (HEAD also has N commit(s) of its own)`, and R20 asserts that text and
   that `ff-only` is absent. This branch is 5 ahead and 4 behind `origin/main` (2127070), so the cost is real today.
3. **Answered:** both numbers are given (see the table).

What I ran on the prototype:

- Green: "20 probes OK", rc 0. Red (`run.sh.orig`, identical to this branch's `run.sh`): R1–R19 ok, `FAIL R20`,
  "1 of 20 probes FAILED". R20 fails on 4 lines: diverged, `--poll`, fetch fails and ref lock each run claude.
- Four mutants, run in parallel. Each gave `FAIL R20` and "1 of 20 probes FAILED" and nothing else:
  - `--ff-only always`: the line that sets the merge fix is removed. The diverged case dies on the fix text.
  - diverged runs: `[[ $n -gt 0 && $ahead -eq 0 ]] || return 0`. The diverged case dies with rc 0 and 1 run.
  - failed fetch ignored: `|| break` instead of the refusal. The fetch-fails case dies with rc 0 and 1 run.
  - check after `eligible.sh` (mine, not in the plan): it dies on `none()`.

Notes (not blocking):

- The plan's code block prints `commit(s)`, but its R20 table, and the prototype that passes it, pluralize
  (`1 commit` / `2 commits`). Built as the block reads, it would fail R20 (`has "by 1 commit (HEAD"`). Build from
  the prototype. The diff review compares the refusal text against R20, not against the block.
- Carrier: B1.98's and B1.99's card texts on `origin/main` name neither `scripts/CLAUDE.md` nor `run.sh`. The plan
  admits this for B1.98, but presents B1.99 as a possible carrier without the same caveat. The `Partial` status is
  what actually carries the row. B1.97 (#288) is still open. If it merges before the build, the row can join this
  PR, with a re-approval for the added file.
- `.devcontainer/runner/docker-compose.yml:10` still tells the lead to `git checkout chore/B1.62-runner-image-probes`.
  A runner clone that followed that line is on an old card branch. That branch is diverged, so the refusal would print
  `merge origin/main`, which merges `main` into that branch instead of returning the clone to `main`. The planned
  header line (`git fetch origin && git merge --ff-only origin/main`) assumes the clone is on `main`. Saying so in
  the same header edit costs one line. This PR may do it, since it already edits the header.
- The footer still reads `Rounds: 1`.
- The round 1 note on a host network stall stands. The plan now lists it as a cost and says it was not probed.

Verdict: approved (ready for the lead's `approve`, not approved for build)

## Diff review (round 1)

Range: `origin/main...HEAD` (merge base d106fe9; local `main` is stale, so `main...HEAD` lists 27 files from
other cards). Red cf678d3, change b7e9d83. Six files: the three in the plan, plus `backlog/work/B1.95/*`.

### Command results (last line each, run by the reviewer)

| Command                                           | Result                                                                         |
| ------------------------------------------------- | ------------------------------------------------------------------------------ |
| `pnpm lint`                                       | exit 0 ("All matched files use Prettier code style!")                          |
| `pnpm typecheck`                                  | exit 0                                                                         |
| `pnpm test`                                       | `Tests  280 passed (280)`                                                      |
| `pnpm test:e2e`                                   | `64 passed (2.4m)`                                                             |
| `pnpm test:mutation`                              | `Final mutation score of 92.74 is greater than or equal to break threshold 70` |
| `/bin/bash scripts/agent/run-smoke.sh` at b7e9d83 | `20 probes OK` (1 min 22 s)                                                    |
| same at cf678d3 (clone under `$TMPDIR`)           | `1 of 20 probes FAILED` (R20 only; all six R20 cases ran on)                   |
| `scripts/hook-smoke.sh`                           | `hook-smoke: 726 probes OK`                                                    |
| `check-suppressions.sh` (BASE_SHA = merge base)   | `OK: no new suppressions`                                                      |
| `check-config-change.sh`                          | exit 0; lists `scripts/agent/run.sh`, `run-smoke.sh`; PR #296 has the label    |
| `check-feat-commits.sh`                           | `OK: no feat commit touches tests`                                             |
| `check-ac-coverage.sh`                            | `OK: every criterion of a shipped section has a test`                          |
| `check-spec-sections.sh`                          | `OK: sections cited: 1 … 34`                                                   |
| `check-features-map.sh`                           | `OK`                                                                           |
| `check-backlog.sh`                                | `OK: README matches the cards`                                                 |
| `check-plan-scope.sh`                             | `OK: chore/B1.95-run-behind-main stays inside the approved plan of B1.95`      |
| `next-task.sh --check B1.95`                      | `B1.95: no overlap with any Doing or Review card`                              |
| `scripts/verify-red.sh B1.95`                     | exit 1: `no 'test(<pkg>): B1.95 … (red)' commit` (expected, see checklist)     |
| `git diff --stat origin/main...HEAD`              | `6 files changed, 425 insertions(+), 5 deletions(-)`                           |

### Checklist

| Check                                        | pass / fail: reason                                                                                                                                                                                                                                                                                                                                                                                                                                |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every acceptance item has a probe            | pass: fetch before any claim (R20 `none` on every refusal case), behind → exit 1 with count, both shas, fix (`refused`), ahead runs, fetch failure refuses with git's reason; compose header line present. Scripts-guide row deferred as the approved plan says. Label on #296: present                                                                                                                                                            |
| red is red on behavior                       | pass: at cf678d3 R1–R19 ok, R20 FAIL with rc=0 and a `-p` run in all six cases (run.sh never fetches)                                                                                                                                                                                                                                                                                                                                              |
| no `(red)` marker on cf678d3                 | pass, deviation from the plan's breakdown explained in the commit body. `verify-red.sh --auto` (CI) picks only `(red)` subjects, and `verify_feat` fails a red commit that touches no `*.test.ts(x)` ("touch no *.test.ts(x) file"), so the marker would break CI on a smoke-only red                                                                                                                                                              |
| no test weakened after red                   | pass: `git log --first-parent --no-merges cf678d3..HEAD -- '*.test.*' e2e/ scripts/agent/run-smoke.sh` lists only b7e9d83, which touches neither; no merge commits in range                                                                                                                                                                                                                                                                        |
| R18 edits in the red commit                  | pass: R18 now sets HEAD and origin's main to `om` so the new fetch keeps `origin/main` at `om`; its end restores `origin/main` to b0 instead of deleting it. R4's "local branch not counted" still holds with `origin/main` = b0 (b0 is on the first-parent line, so it counts). R18 ok at red and at green                                                                                                                                        |
| every changed file in `plan.md`              | pass (`check-plan-scope.sh` OK)                                                                                                                                                                                                                                                                                                                                                                                                                    |
| interfaces match the plan                    | pass: `behind_problem` is the plan's block verbatim except plural handling (`commit$([[ $n -eq 1 ]] \|\| echo s)`), which R20 asserts both ways ("1 commit", "2 commits", "2 commits of its own"); called first in `run_issue`, before `eligible.sh`; no new flag, variable or exit code                                                                                                                                                           |
| no secret, no suppression                    | pass                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Zod / Prisma / raw SQL / migration / map row | n/a: no `src/`, `prisma/`; tooling card, no map row                                                                                                                                                                                                                                                                                                                                                                                                |
| merges with current `origin/main`            | pass: `origin/main` moved 5 commits since the merge base (B1.97, E7 filings); none touches the six files                                                                                                                                                                                                                                                                                                                                           |
| would a test fail if one line were reverted  | pass, probed: 11 mutants of `run.sh`, each on its own clone under `$TMPDIR`, all 11 run in parallel (load on the timing race). Killed, each by R20 alone: no fetch, failed fetch ignored, no retry (`-lt 1`), retry without sleep (`sleep 0`), check moved after `card_of` (past `eligible.sh`), `read -r n ahead`, `return 0` on refusal, `--ff-only` always, diverged runs, ahead refuses. Survived: drop `&& [[ -n "$n" ]]` (equivalent, below) |

Questions the caller raised:

- **Ref-lock race (R20 last case).** The lock goes after 1 s; tries run at about t0, t0+2 s, t0+4 s. If the first
  try lands after the removal (slow preflight), the case still passes but no longer proves the retry. It does not
  go red falsely. Under 11 smoke runs in parallel, `noretry` and `nosleep` were still killed and the real code still
  passed, so the margin held under load. Not a finding.
- **`read -r ahead n < <(git rev-list …)` swallowing a git failure.** In bash 3.2, `read -r a b < <(false)` returns
  1, so the `&&` chain already falls to "no HEAD or origin/main to compare". `[[ -n "$n" ]]` would matter only for
  one-field output, which `--left-right --count` never prints. The surviving mutant shows this: the guard is
  redundant, not wrong.
- **Compose header placement.** The line sits after `--check-binary` and before the stop/up/probe restart block,
  with "before each batch" saying when to run it. It reads correctly. The round 2 note on line 10
  (`git checkout chore/B1.62-runner-image-probes`) was not taken up. A clone that followed that line is diverged, so
  it would print `merge origin/main` rather than a `checkout main`. The refusal still holds: it is wrong advice,
  never a stale run. Non-blocking.

Non-blocking notes:

- B1.97 merged on `origin/main` as b35c5d6 (#288). That was the plan's only reason to leave the `agent/run.sh` row of
  `scripts/CLAUDE.md` out of this PR, and it no longer holds. Round 2 said the row could then join this PR with a
  re-approval for the added file. Leaving it to the `Partial` closing is still within the approved plan. The lead
  chooses.
- The PR body's Verification says "Mutants each fail R20 only". That is now confirmed above.

### Findings

None blocking.

Verdict: ready for PR

Riskiest unfalsified: a runner clone whose `remote.origin.fetch` is not the default refspec (for example
`clone --single-branch` of another branch). There, `git fetch origin main` updates only `FETCH_HEAD`, and the check
compares against a stale `refs/remotes/origin/main` without a word. The documented setup does a full clone, and
`worktree-prune.sh` fetches the same way, so this was not probed or filed.
