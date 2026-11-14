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
