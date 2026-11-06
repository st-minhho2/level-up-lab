# B1.83 review

## Plan review (round 1)

Plan at 2b5825c (`backlog/work/B1.83/plan.md`, 74 lines, unapproved). Scope: all (scripts + backlog, tooling, no §).
I read the card (`backlog/plan/E1-todos.md` B1.83), `scripts/pr-step.sh`, `scripts/metrics/unattended.sh`,
`.claude/hooks/guard-bash.sh` rule 5, `.claude/agents/dev-lead.md` Loop 9, `scripts/agent/run.sh` `outcome()`,
`.github/workflows/ci.yml` / `review.yml` triggers, `.devcontainer/runner/Dockerfile`, the B1.82 and B1.84 plans on
their branches, and dev-lead's prototype (`git -C <proto> diff`).

Runs (host `/bin/bash` 3.2, gh 2.103.2):

- `scripts/next-task.sh --check B1.83` → `[next-task] B1.83: no overlap with any Doing or Review card`
- `scripts/agent/tier.sh backlog/work/B1.83/plan.md` → `high` (`scripts/pr-step.sh` is in `CONFIG_PROTECTED`)
- `scripts/ci/plan-files.sh --any B1.83 HEAD` → the 5 Files rows, rc 0
- today's tree: `metrics-smoke.sh` → `41 ok, 0 FAIL`; `pr-step-smoke.sh` → `15 ok, 0 FAIL` (so +4 → 45 and +1 → 16, as planned)
- prototype: `metrics-smoke.sh` → `45 ok, 0 FAIL`; `pr-step-smoke.sh` → `16 ok, 0 FAIL`
- live, read-only: `unattended.sh` today vs the prototype's copy run from the card worktree → columns 1–7 identical,
  `unattended 7/8 = 87.5 % (pending 0)`, touches 0 on all 8; `no-rework.sh 211 216 221 229 232 235` →
  `no-rework 6/6 = 100.0 % (pending 0)`

| Check                                                                             | Result                                                                                                                                                               |
| --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: no §; the Files are the 4 scripts and backlog paperwork the lead listed; none in B1.82's (`scripts/agent/run.sh`, `run-smoke.sh`) or B1.84's lists             |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass (n/a): bash only, no `src/`                                                                                                                                     |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: "No advice (tier quick, no section)" stated                                                                                                                    |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: one Acceptance; 6 probes, each with an exact Want (times, counts, log lines)                                                                                   |
| verification lists exact commands with expected numbers                           | pass: red 14/2 and 36/9, green 16/45, live 7/8 and 6/6 (I reproduced 45, 16, 7/8 and 6/6 above)                                                                      |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass with note: no skeleton needed (existing scripts); the map step (`scripts/CLAUDE.md` R/M ranges) is deferred and stated, because B1.84 holds `scripts/CLAUDE.md` |
| the section has a `Lead approves spec` box, ticked only by a human                | pass (n/a): no section; the high tier routes the plan to the lead's `approve`                                                                                        |
| no settled D-n contradicted                                                       | pass: D-19 (label on the PR) and D-28 (high) followed; D-29's "reaches a ready PR" is refined, not contradicted                                                      |
| `scripts/next-task.sh --check B1.83` says no overlap                              | pass: `[next-task] B1.83: no overlap with any Doing or Review card`                                                                                                  |

Verdict: changes requested

1. **The guard-bash rule 5 cost is stated as unlikely, and in this session it is certain.** `guard-bash.sh:140-142`
   compares the card worktree's `scripts/pr-step.sh` with the copy under the directory the hooks load from
   (`$CLAUDE_PROJECT_DIR`). This session was launched in `.claude/worktrees/jovial-rubin-58f9f6` (branch
   `claude/jovial-rubin-58f9f6`, whose wrapper equals origin/main's), not in the card worktree. B1.26's precedent
   holds only because that session was opened in its card worktree (B1.26 pr-body: "rule 5 compared the wrapper with
   the card worktree's own copy"). So once step 2 commits the new wrapper, every later `scripts/pr-step.sh push`,
   `draft` and `ready` from `.worktrees/chore-b1-83-runner-ready-label` is blocked ("differs from the hooks' own
   copy"). Step 4 (draft PR) and pushing the green and review commits cannot run through the wrapper. Dev-lead reports
   a refusal and never works around it, so the card stops at step 3 until the lead acts. The plan should state this as
   certain and name the lead's choice at the gate: (a) push the red commit before step 2, then run steps 2–4 from a
   session opened in the card worktree; or (b) the lead pushes and opens the draft by hand.
   (Confidence: traced from lines 140–142 and B1.26's note. I could not print `$CLAUDE_PROJECT_DIR`, which my shell
   does not export, and my attempt to build a copy with a committed wrapper was refused, so the block itself was not
   run.)
2. **The new `gh` calls are only proven against a shim and the host's gh 2.103.2, but the runner (the client this card
   exists for) runs Debian's gh.** `.devcontainer/runner/Dockerfile:19` installs `gh` from bookworm apt, which is gh
   2.23.0, the same version recorded for CI (B1.55 pr-body, B1.63). That old `gh pr edit` loads the PR's classic
   project cards before it edits, and GitHub now answers that field with a "Projects (classic) is being deprecated"
   GraphQL error. The `--add-label` step can therefore fail on every runner `ready` after `gh pr ready` has already
   succeeded. The plan should either add the label with the REST call
   `gh api --method POST "repos/{owner}/{repo}/issues/$n/labels" -f 'labels[]=pr-step-ready'`, which needs no project
   query, or list a run of the chosen command under gh 2.23 in Verification and state which gh the runner uses.
   (Confidence: plausible. I could not run gh 2.23 against the live API without making a write.)
3. **The plan does not state what happens to a run when the label step fails after the PR is already ready.** Plan:
   "after `gh pr ready <n>` succeeds, each failure failing the step". Trigger: `gh label create` or `gh pr edit` exits
   non-zero (an API error, or reason 2). Result: the PR is ready with no `pr-step-ready` label, and the step's rc is not 0. Dev-lead then does not print "PR for <card> is ready", so `run.sh outcome()` records `ended`, not `ready`.
   `unattended.sh` falls back to the first ready, which is the exact rule this card replaces. If a BEHIND round trip
   follows and the label lands then, the wrapper's own failed ready is counted in `touches` as a person's. Ask: run
   `gh label create … --force` before `gh pr ready`, so the only step that can fail after the PR is ready is the label
   add. State the recovery: re-run `scripts/pr-step.sh ready <n>`. The ready is then a no-op, the label lands, and the
   window anchors at the existing ready with touches 0. Add a `GH_FAIL='pr edit'` case to R16.

Notes (not blocking):

- The plan says `docs/metrics.md` stays out "to keep B1.83 disjoint from B1.82 and B1.84", but neither plan lists that
  file; the reason is the lead's Files list. Row 28 ("→ the PR's first `ready_for_review`") becomes wrong at merge, and
  no follow-up card id is named for it or for `scripts/CLAUDE.md` (R1–R15, M1–M43).
- Costs that are stated correctly and that I confirmed: `ci.yml` runs on `labeled` (line 7) and not on
  `ready_for_review`, so each wrapper `ready` adds one CI run on the same SHA. Re-adding a label already present adds
  no event, so the BEHIND round trip adds none. The default-set history is unchanged (7/8, touches 0).

## Plan review (round 2)

Plan at f70c124 (round 1 committed as b1d2ba1); round-2 prototype in the same scratch repo.

Runs:

- `scripts/next-task.sh --check B1.83` → `[next-task] B1.83: no overlap with any Doing or Review card`
- `scripts/agent/tier.sh backlog/work/B1.83/plan.md` → `high`
- prototype, `/bin/bash` 3.2: `[pr-step-smoke] 16 ok, 0 FAIL` (R16 covers refused 8 and 9, plus each of `label
create`, `pr ready` and `api --method` failing, with the failing call last in the log); `[metrics-smoke] 45 ok, 0 FAIL`
- runner image, offline: `docker run --rm --network none --entrypoint /usr/bin/gh level-up-lab-runner-runner:latest
--version` → `gh version 2.23.0 (2023-02-27 Debian 2.23.0+dfsg1-1)`. With `GH_DEBUG=api` and a dummy token,
  `gh api --method POST repos/o/r/issues/1/labels -f 'labels[]=pr-step-ready'` sends
  `POST /repos/o/r/issues/1/labels` with a JSON body starting `{"labels": [`. That matches the plan's Verification.
  I did not run `{owner}/{repo}` expansion in the image (I used literal `o/r`).

| Check                                                                             | Result                                                                                   |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: Files unchanged from round 1 (4 scripts and paperwork), the lead's list            |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass (n/a): bash only                                                                    |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: no advice, stated                                                                  |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: 6 probes with exact Wants                                                          |
| verification lists exact commands with expected numbers                           | pass: 14/2 and 36/9 red; 16/45 green; live 7/8 and 6/6; the gh 2.23 request bodies       |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass with round-1 note: map rows deferred to a named follow-up (filing lane after merge) |
| the section has a `Lead approves spec` box, ticked only by a human                | pass (n/a): no section; high tier → the lead's `approve`                                 |
| no settled D-n contradicted                                                       | pass: D-19, D-28 followed                                                                |
| `scripts/next-task.sh --check B1.83` says no overlap                              | pass: `[next-task] B1.83: no overlap with any Doing or Review card`                      |

Round-1 reasons:

1. Resolved. The Costs now name the refusal and the lead's choice: open a session in the card worktree for steps 2–4,
   or push and open the draft by hand. The plan cites B1.26's layout (session in a Claude worktree, card worktree under
   its `.worktrees/`, every later wrapper call ran). I could not check that against B1.26's session record, because my
   read was refused. The repo's own record (B1.26 pr-body: "rule 5 compared the wrapper with the card worktree's own
   copy") agrees. Either way the lead approves knowing both outcomes.
2. Resolved. The label add is now REST `gh api --method POST "repos/{owner}/{repo}/issues/<n>/labels"`. I confirmed
   offline that the runner image's gh 2.23.0 sends that request.
3. Resolved. The order is now create → `gh pr ready` → add. Only the add can fail after the PR turns ready. That cost
   (`ended` run, old rule until the label lands) and the recovery (rerun `ready <n>`) are stated, and R16 probes each
   failing call.

Verdict: approved (ready for the lead's gate; high tier, so the lead's `approve` is required before step 1)

## Diff review (pass 1)

SCOPE: all (scripts + backlog paperwork; tooling, no §, no `src/`). Range `origin/main` 7c4300e..5deb3d1. Red commit
4539715 `test(scripts): …`, green 5deb3d1 `chore(scripts): …`. Not pushed, so CI has not run. Everything below ran
locally on the host (`/bin/bash` 3.2.57, gh 2.103). Probes ran on a clone under `$TMPDIR/b183-probe.oBIu/`.

Command results (last line of each):

| Command                                                                     | Result                                                                                                                                                      |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/bin/bash scripts/pr-step-smoke.sh`                                        | `[pr-step-smoke] 16 ok, 0 FAIL`                                                                                                                             |
| `/bin/bash scripts/metrics-smoke.sh`                                        | `[metrics-smoke] 45 ok, 0 FAIL`                                                                                                                             |
| `scripts/hook-smoke.sh`                                                     | `hook-smoke: 601 probes OK`                                                                                                                                 |
| `pnpm lint && pnpm typecheck && pnpm test`                                  | `All matched files use Prettier code style!` · `tsc --noEmit` clean · `Tests  241 passed (241)`                                                             |
| `pnpm test:e2e`, `pnpm test:mutation`                                       | not run: no `src/`, `prisma/` or `e2e/` change; the caller's gate list for a tooling card leaves them out                                                   |
| `scripts/ci/check-plan-scope.sh`                                            | `OK: chore/B1.83-runner-ready-label stays inside the approved plan of B1.83`                                                                                |
| `scripts/ci/check-backlog.sh`                                               | `OK: README matches the cards`                                                                                                                              |
| `scripts/ci/check-suppressions.sh` · `check-feat-commits.sh`                | `OK: no new suppressions` · `OK: no feat commit touches tests`                                                                                              |
| `scripts/ci/check-config-change.sh`                                         | rc 1, `Protected configuration changed without the 'config-change-approved' label: scripts/pr-step.sh`. Expected: the label goes on the PR at step 4 (D-19) |
| `check-ac-coverage.sh` · `check-spec-sections.sh` · `check-features-map.sh` | `OK: every criterion of a shipped section has a test` · `OK: sections cited: 1 … 28` · `OK`                                                                 |
| `scripts/verify-red.sh B1.83`                                               | `no 'test(<pkg>): B1.83 … (red)' commit`. Expected: the plan has no `(red)` marker for smoke-only red, as B1.79 and B1.86 did. Red proven by hand below     |
| red at 4539715 (clone, `/bin/bash`)                                         | `[pr-step-smoke] 14 ok, 2 FAIL` (R7, R16) · `[metrics-smoke] 36 ok, 9 FAIL` (M30, M31, M33, M39, M41, M44–M47). Matches the plan exactly                    |
| live `unattended.sh` (default set) vs origin/main's copy                    | columns 1–7 identical on 8 rows; `unattended 7/8 = 87.5 % (pending 0)`; touches 0 on all 8                                                                  |
| live `no-rework.sh 211 216 221 229 232 235`                                 | `no-rework 6/6 = 100.0 % (pending 0)`; `no-rework.sh` untouched                                                                                             |
| runner image gh 2.23, offline: `gh label create --help`                     | `-f, --force  Update the label color and description if label already exists`; `-c/--color` and `-d/--description` present                                  |
| `git diff --stat origin/main...HEAD`                                        | `7 files changed, 419 insertions(+), 19 deletions(-)`                                                                                                       |

Checklist:

| Check                                                                                     | Result                                                                                                                                                                               |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| every acceptance clause has a probe whose assertion matches it                            | partial: label added in the same step (R7, R16), fallback (M47, M30–M41), touches (M44, M46), not a message (M44/M45). "Paired with **that** label" is not pinned: finding 1         |
| no test weakened after red (`git log 4539715..HEAD -- 'scripts/*smoke*' '*.test.*' e2e/`) | pass: empty. No merge commits in range. The red commit's M30/M31/M33/M39/M41 edits only add `\t0`, so they are stricter                                                              |
| every changed file in `plan.md`                                                           | pass: 4 scripts and `backlog/work/B1.83/*`; `check-plan-scope.sh` OK                                                                                                                 |
| interfaces match the plan                                                                 | pass: call order create → `pr ready` → REST add, exact arguments (R7 log); `--undo` makes no label call; refusals still exit 3 with no gh label call (R16); TSV header has 8 columns |
| Zod / Prisma / raw SQL / migration                                                        | n/a: bash only                                                                                                                                                                       |
| no secret, no suppression                                                                 | pass                                                                                                                                                                                 |
| `$n` reaches the API path only after `^[0-9]+$` and the own-branch check                  | pass (traced: `pr-step.sh:58-60` comes before line 66)                                                                                                                               |
| features map row moved                                                                    | n/a: no §. `scripts/CLAUDE.md` (R1–R15, M1–M43) and `docs/metrics.md` row 28 go stale. Deferred to a filing-lane card by the approved plan                                           |
| would a test fail if a changed line were reverted? (10 mutants on the clone)              | 8 killed: `<= t`→`< t`, ready `tail`→`head`, touches `<`→`<=`, touches forced to 0, fallback removed, create removed, add removed, add `\|\| true`. 2 survive: findings 1 and 2      |

Findings:

```
[1] KIND: coverage
    WHERE: scripts/metrics/unattended.sh:54 (`$1 == "labeled" && $4 == "pr-step-ready"`); scripts/metrics-smoke.sh M44–M47
    DEFECT: no probe pins the label name. Every fixture PR timeline holds either no label or only `pr-step-ready`, so
            dropping `&& $4 == "pr-step-ready"` (any label counts as the wrapper's) leaves metrics-smoke at 45 ok, 0 FAIL.
    TRIGGER: an agent PR labeled `config-change-approved` at 00:40 (D-19: the agent adds it at PR creation), a click at
             01:10 undone at 01:20, then the wrapper's ready + `pr-step-ready` at 03:00. Probe M48 on the clone.
    WRONG BEHAVIOUR: HEAD gives the right row (ready 03:00, touches 1; M48 ok). Under the surviving mutant the row reads
             ready 01:10, touches 0: the click ends the window, which is the exact bug this card fixes, and the suite
             stays green. The acceptance's "paired with that label" is the card's one discriminator and has no probe.
    CONFIDENCE: confirmed (mutant run on the clone: base 45/0; with M48 added, HEAD 47 ok, mutant `FAIL M48 … 01:10 … 0`)
    ASK: add the M48 fixture (a non-wrapper label earlier on the PR) in a `test(scripts): B1.83 review pass 1 -- …`
         commit. `scripts/metrics-smoke.sh` is already in the Files list.

[2] KIND: coverage (not blocking on its own)
    WHERE: scripts/metrics/unattended.sh:54 (`| sort | head -1` on the tag)
    DEFECT: "the PR's first `pr-step-ready` label" is not pinned. `head -1`→`tail -1` survives (45 ok, 0 FAIL), because
            no fixture has two `labeled pr-step-ready` events.
    TRIGGER: wrapper ready + label 03:00, the label removed by hand, BEHIND undo 04:00, wrapper ready 04:30 that re-adds
             the label (a new `labeled` event, since the label was absent). Probe M49 on the clone.
    WRONG BEHAVIOUR: HEAD gives ready 03:00, touches 0 (M49 ok). The mutant gives ready 04:30, touches 1, so the wrapper's
             own first ready is counted as a person's touch.
    CONFIDENCE: confirmed (mutant `FAIL M49 … 04:30 … 1`). Rare in practice: it needs someone to remove the label.
             Worth adding with [1] in the same commit.
```

No correctness finding against HEAD. Every plan Want reproduces, red and green both.

Verdict: back to test-writer. Add M48 (and M49) as a `test(scripts): B1.83 review pass 1 -- …` commit; expect
`[metrics-smoke] 47 ok, 0 FAIL` on HEAD's `unattended.sh`. No code change is asked for.

Riskiest unfalsified: the plan's recovery ("rerun `ready <n>`: gh skips the ready of a ready PR") and the
click-left-in-place cost both assume `gh pr ready` on an already-ready PR exits 0, under gh 2.23 (runner) and 2.103
(host). If it exits non-zero, `set -e` stops before the label add and the PR never gets the label. I did not run it:
checking needs a live write.
