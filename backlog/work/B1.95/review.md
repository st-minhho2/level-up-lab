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
