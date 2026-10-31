# B1.21 review

## Plan review (round 1)

Plan at 49f8835 (HEAD 709cd96 only merges `origin/main`; `plan.md` is unchanged). The baseline was run here:
`scripts/hook-smoke.sh` gives `hook-smoke: 284 probes OK`, which matches the plan's "284". Probed in a scratch repo:
`git worktree add -b feat/B9.1-x <dir> origin/main` gives the branch the upstream `origin/main`, and `git fetch origin`
against an unreachable remote exits 128. CI `ci.yml`: the last 8 completed runs took 221–269 s.

| Check                                                                             | Result                                                                                                                                                                                                                                                                                            |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: a tooling card with no §. The Files are the ones the card's Spec and Acceptance lines name, plus the hook, its wiring, its doc row and its probes                                                                                                                                           |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass (n/a): nothing under `src/` or `prisma/` changes                                                                                                                                                                                                                                             |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: the plan says advisor was skipped (tier quick, no section), as Loop step 2 allows                                                                                                                                                                                                           |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: the card has 5 acceptance clauses, and probes L1–L7 and K1–K2 each have an observable outcome                                                                                                                                                                                               |
| verification lists exact commands with expected numbers                           | fail: see reason 5. The red claims for L3/L5/L7 rest on a missing script. The K1/K2 fixture is unspecified. stdout and a hanging notifier are not probed                                                                                                                                          |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: this follows the tooling precedent (B1.19: test → fix → reviewer → PR), and there is no map row because there is no §. Reason 5 covers the missing stub                                                                                                                                     |
| the section has a `Lead approves spec` box, ticked only by a human                | pass (n/a): there is no section and nothing is ticked                                                                                                                                                                                                                                             |
| no settled D-n contradicted                                                       | pass: D-19 (label at creation) applies to the Loop 5 draft. D-8/D-9 still hold, because merging `origin/main` into the branch is not merging the PR and there is no rebase or force push. `.claude/docs/git-workflow.md:38` ("`git merge main`") has to be replaced, not left beside the new rule |

Verdict: changes requested

1. **The Loop 9 merge comes after the review gate, so a stop can be blocked and ping twice.** Loop 9 merges `origin/main`
   after Loop 7 ran `mark-reviewed.sh`. `review_fingerprint` is `git diff $(merge-base origin/main HEAD) -- src e2e
prisma`. After the merge its base moves to the new `origin/main`, and when a sibling edited the same `src/` file the
   hunk offsets change. The fingerprint then differs, and `require-review.sh` blocks the stop that prints the PR line.
   Stop hooks run in parallel, so `lead-ping.sh stop` has already logged a wait and notified on a stop that did not
   happen. When the session stops again, it logs a second `wait … pr` and pings a second time. Fix: (a) merge
   `origin/main` before the Loop 6 green gate and the Loop 7 review; or (b) after the Loop 9 merge, re-run the green gate
   and `mark-reviewed.sh` before printing the line. In either case, `lead-ping` adds no line while the session already
   has an open wait for the same card and kind (add probe L8). Also name the conflict path. A conflict under `src/`,
   `e2e/` or `prisma/` cannot be resolved by dev-lead (path-guard), so it goes to `code-writer` or Waiting on human. A
   conflict in `backlog/README.md` (every filing and closing PR edits it) is dev-lead's to resolve.
2. **The PR body loses its Item, Map delta and Review sections.** Today Loop 9 runs `gh pr create` with Item, Plan,
   Map delta and Review. The plan creates the PR at Loop 5 with body = `plan.md`, and its Loop 9 has no `gh pr edit
--body-file`. `review.yml` runs on `ready_for_review` and reads "the spec section named in the PR body and the
   PR body's Plan section". So the body must be complete before `gh pr ready`, or the review bot reads a plan-only body.
   Fix: Loop 9 writes the full template body (Item, Plan with `Plan approved by`, Map delta, Review = `review.md` diff
   section), then waits for the checks, then runs `gh pr ready`.
3. **The CI wait has no stated timeout, failure path or bound.** `gh pr checks <n> --watch` runs in a Bash call whose
   default timeout is 120 s, but CI takes 221–269 s (last 8 runs), so the call is killed. Fix: state the Bash
   `timeout: 600000` (or `run_in_background` plus a wait) and `--fail-fast`. Say what a red check does: back through
   `/review-loop` to `code-writer`, not straight to `gh pr ready`. Bound "BEHIND → merge again". With several sessions in
   parallel it can repeat for as long as siblings keep merging. Suggested: once, then report with the BEHIND state named.
4. **Gate-line matching gives false positives, and the card comes from the wrong place.** (a) A match anywhere in
   `last_assistant_message` also fires on a session that quotes the line with a real id. One trigger: the session that
   implements this card ends with "dev-lead now prints 'PR for B1.21 is ready for the lead: <url>'". That logs a wait
   and notifies. (b) "Card = the session `cwd`'s branch" is often `-`: CLAUDE.md allows opening the session in the repo
   root, and dev-lead works in `.worktrees/<slug>` through absolute paths, so the hook's `cwd` is on `main`. Both lines
   carry the card id. Fix: take the card from the line (`B[0-9]+\.[0-9]+`). Match only a whole line (`^…$`). For the gate,
   match only the last non-empty line. Fix the PR line's place in dev-lead's report (first line, answer-first) so that
   "Waiting on you", which comes last, does not move it. Add probes: the line quoted mid-sentence gives no line; the gate
   line with `cwd` on `main` logs the card from the line.
5. **The probes and red claims need tightening.** (a) stdout must be empty in every mode. UserPromptSubmit stdout on
   exit 0 is added to the model's context, and Stop stdout is parsed as a decision. Assert empty stdout in L1–L7. (b) A
   notifier that hangs (osascript waiting on a permission prompt) delays every stop by up to the hook timeout. Run it in
   the background or time-bound it, and extend L7 to "hangs". (c) At red, L3, L5 and L7 fail only because the script is
   missing (exit 127), not on behavior. Say so, or land a stub `lead-ping.sh` (exit 0) as a skeleton so that L1/L2/L4/L6
   are the red. (d) K1/K2 run `worktree.sh`, which runs `require-hooks.sh`, copies `.env.example`, runs `pnpm install
--frozen-lockfile` and `pnpm db:deploy`. Name the fixture: a bare `origin` ahead of local `main`, plus `package.json`,
   a lockfile and `.env.example`, or a `pnpm` shim on `PATH`. Otherwise K1/K2 fail on setup, not on the base. Add the new
   needs to the `hook-smoke.sh` row in `scripts/CLAUDE.md`. The count then becomes 284 + 9 + the added probes.
6. **`worktree.sh` stops when the fetch fails.** Under `set -euo pipefail`, `git fetch origin` exits 128 whenever origin
   is unreachable (offline, an ssh remote with no agent in the devcontainer) or two sessions fetch at once (ref lock).
   This is confirmed in a scratch repo. The script then exits before it creates the worktree, and "local `main` if no
   origin" does not cover an origin that exists but is unreachable. Fix: `git fetch --quiet origin main || warn`, then
   `origin/main` if that ref exists, else `main`. Add probe K3: unreachable origin → worktree created, warning, exit 0.
   Also, a branch cut from `origin/main` gets the upstream `origin/main` (confirmed). `git status` then reports against
   main, and a bare `git pull` or `git push` targets main. Use `--no-track` (or `-u` at the first push only) and assert the
   upstream in K1.
7. **The plan does not fit on one screen.** It is 62 lines against ≈ 40 (`planning.md`). It holds three changes that
   ship separately: the `worktree.sh` base, the ping hook, and the draft-PR loop. Split it, or state the deviation for
   the lead as B1.19 did. "Step 1d" is not defined anywhere in the repo. Name the card or doc that reads
   `claude-wait.log`, or drop the sentence.
8. **The lead has to see these costs before approving.** (a) The hook is wired to `Stop` only. A dev-lead run as a
   subagent ends with `SubagentStop`, so it never pings and only a parent that repeats the line would. (b) On the
   desktop app, one gate can raise up to 3 notifications: the app's own, the stop ping, and the idle ping about 60 s
   later. (c) A session closed without another prompt leaves its wait open forever. (d) From Loop 5 to Loop 9 the draft
   PR shows only the plan commits, because nothing is pushed in between. Pushing at each step would instead turn CI red
   at the red commit and use about 4 min of CI per push. Say which. (e) When the PR line is printed, `review.yml` has
   only just started (it skips drafts), and the next sibling merge makes the PR BEHIND again. (f) Parallel appends to
   `<git common dir>/claude-wait.log` are safe only if each record is one `printf … >>` of a single line (O_APPEND,
   < PIPE_BUF). State that, and keep `resume`'s read-then-append keyed by session.

## Plan review (round 2)

Plan at 6cef50c. I ran the probes in scratch repos with a bare `origin`, using the unchanged `scripts/worktree.sh`,
`mark-reviewed.sh` and `require-review.sh`:

- P1. `git worktree add --no-track -b X dir origin/main` gives the branch no upstream (`fatal: no upstream configured`).
  The same command without `--no-track` sets the upstream to `origin/main`.
- P2. Under `set -euo pipefail`, `git fetch … || warn` against an unreachable origin prints the warning and the script
  goes on (rc 0).
- P3. The card branch and a sibling on `origin/main` each change a different hunk of the same `src/a.ts`. After the
  merge, `require-review.sh` blocks the stop. After `mark-reviewed.sh` runs again (with a `pnpm` shim), it is silent.
  So a re-mark after the merge is enough for the stop.
- P4. The card's red commit adds a test, and a sibling on `main` adds `src/b.test.ts`. After the merge, Loop 6's
  `git diff --stat <red>..HEAD -- '*.test.*' e2e/` lists `src/b.test.ts`.
- P5. With only a `pnpm` shim on `PATH` and a one-line `.env.example`, today's `worktree.sh` runs to the end (rc 0).
  Without `.env.example` it exits 1 at `cp`, after the branch was already created.
- P6. Wait-time read. `refs/pull/{60,63,67}/head` hold the plan commits. Plan gate (`plan approved` − last
  `plan review`): B1.17 1 min 25 s, B1.18 5 min 46 s, B1.19 1 min 47 s. For B1.19 and B1.17, a plan revision landed
  19 s and 12 s after the last "plan review" commit. `gh pr view --json` has no ready-for-review field (field list
  checked). Before B1.21 no PR was a draft, so `createdAt` stands in: PR 63 is 15 h 39 min to merge.
- P7. CI job durations on PRs 57/60/63/67: the longest is `mutation` at 212–255 s. `claude-review` takes 4–6 s.

Round-1 reasons under (b):

| R   | Status                                                                                                                                                           |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | The double ping is moot. The block after the merge is resolved by the re-mark (P3). The conflict path is named but opens a new gap (reason 3 below).             |
| 2   | Resolved. Loop 5 posts the template with Map delta and Review "pending", and Loop 9 fills them before `gh pr ready`.                                             |
| 3   | Mostly resolved. The 600 s bound covers the 255 s longest job (P7), red goes back through the loop, and BEHIND is bounded. Ready before green is reason 2 below. |
| 4   | Moot under (b).                                                                                                                                                  |
| 5   | The hook parts are moot. The worktree fixture and the red claims are reason 4 below.                                                                             |
| 6   | No abort and `--no-track` are resolved (P1, P2). The fallback is reason 1 below.                                                                                 |
| 7   | The plan is still 62 lines with no stated deviation (reason 5 below). "Step 1d" is now defined by D-18, which arrived with the main merge.                       |
| 8   | (a) (b) (c) are stated. (d) is not stated (reason 6). (e) is handled, because the wait after `ready` includes `claude-review`. (f) is moot.                      |

| Check                                                                             | Result                                                                                                                       |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: tooling with no §. The Files match the card's Spec line plus the smoke script and the review artifacts                 |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass (n/a): no `src/` or `prisma/` change                                                                                    |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: advisor was skipped (quick tier, no section). The plan states that (b) departs from the card                           |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: 5 acceptance clauses, probes K1–K4                                                                                     |
| verification lists exact commands with expected numbers                           | fail: the red claims are wrong for K2 and K4 (reason 4)                                                                      |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: follows the tooling precedent (`test(scripts)` → `fix(scripts)` → reviewer → PR)                                       |
| the section has a `Lead approves spec` box, ticked only by a human                | pass (n/a): no section, nothing ticked                                                                                       |
| no settled D-n contradicted                                                       | pass: D-19 applies at the draft's `gh pr create`. D-18's step-1d card is scoped to `throughput.sh`, and reason 6 covers that |

Verdict: changes requested

1. **When the fetch fails, the plan falls back to the stale ref.** The plan says "failure → warning, local `main`
   used", and K4 asserts it. But local `main` in the main checkout is never pulled (`worktree-prune.sh:10`), so it is
   the stale commit this card exists to avoid: 25fee24 in the card's own evidence. Loop 1 runs `next-task.sh`, which
   fetches, right before `worktree.sh`. So when `worktree.sh`'s own fetch fails (offline, or a ref-lock race with a
   sibling fetching), a fresh `origin/main` is usually already there. P2 shows the branch taking `origin/main`
   ("second") where local `main` is "init". Fix: on failure, warn and use `origin/main` when
   `git rev-parse -q --verify refs/remotes/origin/main` succeeds, else `main`. That is the rule in `next-task.sh:29`
   and `worktree-prune.sh:130`. Use their `GIT_TERMINAL_PROMPT=0 … </dev/null` too, so that an https remote cannot
   prompt. K4 then asserts the last fetched `origin/main`.
2. **`gh pr ready` before CI is green frees a WIP slot for a card that may still be red.** Under `next-task.sh:64`, an
   open, non-draft PR counts as Review, not Doing. With the plan's order (ready, then wait, then red goes back through
   the loop), a red check leaves the card in Review while its session reworks it. Another session can then start a
   4th card past `WIP_LIMIT=3`, and a red PR shows as ready to the lead. Fix: push, fill the body, wait for `ci` green
   (`ci.yml` runs on draft pushes), then `gh pr ready`. Or run `gh pr ready --undo` on red. Also guard against
   `gh pr checks --watch` running right after a push, before the new head has any checks attached [plausible:
   "no checks reported"]. Check that `headRefOid` has checks first.
3. **The conflict path clears the review gate on lines nobody reviewed, and the green gate fails after any merge.**
   Loop 9 says: conflict → code-writer / test-writer → green gate → `mark-reviewed.sh`. A conflict resolution is new
   code in `src/`, `e2e/` or tests. Clearing the gate without `/review-loop` is what invariant 8 and the work-next
   guardrail ("never clear the review gate with findings open") forbid. A clean merge brings only code `main` already
   reviewed, so re-marking it is fine. Also, Loop 6's "`git diff --stat <red>..HEAD -- '*.test.*' e2e/` empty" fails
   after every merge that brings a sibling's tests (P4). Fix: a conflict under `src/`, `prisma/`, `e2e/` or tests goes
   back to Loop 6 → Loop 7 (`/review-loop`), and only a clean merge is re-marked directly. After a merge, the test
   check uses `git log --first-parent --no-merges <red>..HEAD -- '*.test.*' e2e/` (empty in P4) plus the reviewer
   reading the merge's resolution.
4. **The red claims are wrong, and the test-only env var is not needed.** Today's `worktree.sh` never fetches, and it
   cuts from a local ref, which gives no upstream. So at red, K2 passes (no upstream, P5) and K4 does not "abort
   offline". K4 reaches rc 0 with a fixture, and without one it exits 1 at `cp .env.example` (P5). Both are setup
   failures, not behavior. Also, `WORKTREE_ONLY` does not exist at the red commit, so the red smoke runs the whole
   script anyway. A `pnpm` shim on `PATH` plus a one-line `.env.example` lets the unchanged script run to rc 0 (P5).
   That matches `next-task-smoke.sh` and `metrics-smoke.sh` (`gh` shims), adds no test branch to shipped code, and
   exercises the real exit code and summary. Fix: drop `WORKTREE_ONLY` in favour of the shim fixture. Restate the red:
   K1 FAIL (branch at local `main`), and K4 FAIL only under reason 1's fallback. K2 and K3 pass at red as regression
   guards. Then state green as 4 of 4.
5. **The plan does not fit on one screen (round 1, reason 7, still open).** It is 62 lines against ≈ 40. B1.19 stated
   its deviation ("Plan is 60+ lines: the lead accepts or asks to trim"). Add that line, or trim.
6. **The costs of (a) and (b) are not stated evenly.** (a) is charged with "double ping when `require-review.sh`
   blocks" and "matches on a quoted gate line". The first is removed by this plan's own Loop 9 re-mark (P3), and
   round 1 gave a fix for the second (match the last whole line). They are not intrinsic to (a). Costs of (b) that the
   lead should see:
   - Its ping is the desktop app's turn-end notification [unverified]. A CLI session gets none.
   - The PR wait needs a ready-for-review time, which `gh pr view --json` does not expose (P6). It needs `gh api`
     (the timeline or GraphQL), which `git-workflow.md` lists under "Needs a human", or a proxy. For example,
     `claude-review` `startedAt` in `statusCheckRollup` works because `review.yml` runs on `ready_for_review`.
   - The plan-gate formula misses revisions made after the last review commit (19 s for B1.19). It also drops the
     first wait when the lead asks for changes (`Rounds` > 1).
   - D-18 scopes the step-1d card to `throughput.sh`, so adding wait time to it changes that card. Say so when it is
     filed.
   - The card's Acceptance ("a Notification/Stop hook pings") and its Test red line stay unmet. Under (b), the card's
     text in `backlog/plan/E1-todos.md` must be amended, or the card closes Partial. Neither is in the Files.
   - Round 1, reason 8(d): from Loop 5 to Loop 9 the draft shows only the plan commits. The Loop 5 `gh pr create`
     plus the D-19 label also start 2 full `ci` runs on paperwork-only commits (the first is cancelled, and the
     longest job is 212–255 s, P7).

Riskiest unfalsified: whether the desktop app notifies on every dev-lead turn end, including a session the lead
is not viewing. (b)'s whole case rests on it, and I could not run it here.

## Diff review (pass 1)

SCOPE: tooling (no `src/`, `prisma/`, `e2e/` change; no §). Diff `21c36b9..0c0b0f5`: f05525b `test(scripts)`,
0c0b0f5 `fix(scripts)`.

### Commands (run by the reviewer at 0c0b0f5, last line each)

| Command                                                                   | Last line                                                                                                 |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                                                               | `All matched files use Prettier code style!`                                                              |
| `pnpm typecheck`                                                          | rc 0                                                                                                      |
| `pnpm test`                                                               | `Tests  115 passed (115)`                                                                                 |
| `pnpm test:e2e`                                                           | `13 passed (24.3s)`                                                                                       |
| `pnpm test:mutation`                                                      | `Final mutation score of 89.02 is greater than or equal to break threshold 70`                            |
| `scripts/ci/check-suppressions.sh`                                        | `OK: no new suppressions`                                                                                 |
| `scripts/ci/check-config-change.sh`                                       | rc 1 unlabeled; rc 0 with `CONFIG_CHANGE_APPROVED=true` (PR #71 carries the label)                        |
| `scripts/ci/check-feat-commits.sh`                                        | `OK: no feat commit touches tests`                                                                        |
| `scripts/ci/check-ac-coverage.sh`                                         | `OK: every criterion of a shipped section has a test`                                                     |
| `scripts/ci/check-spec-sections.sh`                                       | `OK: sections cited: 1 2 3 4 5 6 7 8 9 10 11`                                                             |
| `scripts/ci/check-features-map.sh`                                        | `OK`                                                                                                      |
| `check-backlog.sh` · `check-agent-frontmatter.sh` · `check-plan-scope.sh` | `OK` · `OK: 13 files` · `OK: … stays inside the approved plan of B1.21`                                   |
| `scripts/verify-red.sh B1.21`                                             | rc 1, no `(red)` commit. Same as the tooling precedent (B1.18, B1.19); `--auto` (CI): "nothing to verify" |
| `scripts/worktree-smoke.sh` (bash 5, `/bin/bash` 3.2)                     | `4 ok, 0 FAIL` both                                                                                       |
| `git diff --stat main...HEAD`                                             | 9 files, +344 −19, all in the plan's Files                                                                |
| `gh pr checks 71` (head 0c0b0f5, draft)                                   | 7 `ci` jobs pass; `claude-review` skipping (draft)                                                        |

Probes on copies under `$TMPDIR` (the smoke, `require-hooks.sh` and one `worktree.sh` variant per run):

- Red: `worktree.sh` from 21c36b9 → `2 ok, 2 FAIL` (K1 and K4 at local `main`). The red commit is red on behavior.
- Revert one line each: drop `--no-track` → K2 FAIL; drop the fetch → K1, K4 FAIL; drop `|| echo warning` → K4 FAIL
  (rc 128, `set -e`); `[[ $# -ge 2 ]]` never true → K3 FAIL; `else BASE=main` → `else BASE=origin/main` → **4 ok**
  (that fallback is unprobed, finding 6).
- Edge runs of `worktree.sh` at HEAD: E1 no `origin` remote → rc 0, base `main`, but the warning says "using the last
  fetched origin/main"; E2 explicit empty base `""` → rc 255 `fatal: not a valid object name: ''` (21c36b9: rc 0, base
  `main`); E3 explicit `main` → no fetch, base local `main` (as documented, `[base]` wins); E4 existing branch, no base
  → fetch runs, warning printed, summary says `(base main)` though no base was used.
- Test check in a scratch repo: red adds `src/card.test.ts`; `main` changes `src/sib.test.ts`, adds `e2e/01.spec.ts`
  and an add/add `src/card.test.ts`. The merge's conflict resolution writes `expect(anything)` over the red
  `expect(1)`. `git log --first-parent --no-merges --stat <red>..HEAD -- '*.test.*' e2e/` → **empty**; the old
  `git diff --stat <red>..HEAD` → 3 files (sibling tests included); `git diff <red> HEAD -- src/card.test.ts` →
  `-expect(1)` / `+expect(anything)`. A later `feat(x)` commit touching the test is listed by the new check.
  `git log --first-parent --merges --remerge-diff <red>..HEAD -- '*.test.*' e2e/` shows exactly the resolution.

### Checklist

| Check                                                            | Result                                                                                        |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| every card criterion has a test whose assertion matches its Then | pass: the rewritten Test line (K1, K4 red) matches the smoke; Acceptance doc clauses are docs |
| no test weakened after the red commit                            | pass: `git diff f05525b..HEAD -- scripts/worktree-smoke.sh '*.test.*' e2e/` empty             |
| every changed file is in `plan.md`                               | pass for the diff; fail for what the diff needs (finding 2: two files outside the plan)       |
| interfaces match the plan                                        | pass: `worktree.sh <branch> [base]`, the PR line verbatim in dev-lead.md and work-next        |
| Zod, Prisma, raw SQL, migration                                  | n/a: no `src/`, `prisma/` change                                                              |
| no secret, no suppression                                        | pass                                                                                          |
| features map row moved                                           | n/a: tooling, no feature                                                                      |
| D-19                                                             | pass: Loop 5 labels at the draft's `gh pr create`; PR #71 is draft and labeled                |
| next-task.sh Review state vs draft-until-green                   | pass: `next-task.sh:64` counts a draft as Doing, so the card holds its WIP slot until `ready` |
| `ci.yml` runs on drafts; `gh pr ready` re-runs nothing in `ci`   | pass: `types` has no `ready_for_review`; `review.yml` runs on it and skips drafts             |
| review gate after a clean merge                                  | pass: re-mark is enough (plan review P3)                                                      |
| would a test fail if one changed line were reverted              | pass for 5 of 6 lines of `worktree.sh`; fail for the `else BASE=main` fallback (finding 6)    |

### Findings

```
[1] KIND: invariant
    WHERE: .claude/agents/dev-lead.md:70 (with :74-75, the conflict route)
    DEFECT: the new green-gate test check skips merge commits, so a card test rewritten while resolving a Loop 9
            conflict passes every gate, and the compensating control (the reviewer reads the merge's resolution,
            plan review round 2 reason 3) is written nowhere.
    TRIGGER: red adds src/card.test.ts with expect(1); a sibling on main touches the same file; Loop 9's merge
             conflicts; the resolution commits expect(anything) inside the merge commit.
    WRONG BEHAVIOUR: `git log --first-parent --no-merges <red>..HEAD -- '*.test.*' e2e/` prints nothing and
            check-feat-commits.sh (`rev-list --no-merges`) passes, so a weakened card test reaches `gh pr ready`
            (invariant 2), where the old `git diff <red>..HEAD` showed it. Suggested: add
            `git log --first-parent --merges --remerge-diff <red>..HEAD -- '*.test.*' e2e/` (git >= 2.36; shows only
            the resolution, probe above), or require a card-test change from a conflict to land as its own
            `test(...)` commit after the merge.
    CONFIDENCE: confirmed (scratch-repo probe)

[2] KIND: plan-mismatch
    WHERE: .claude/skills/tdd-loop/SKILL.md:23, .claude/agents/reviewer.md:58 (neither in plan.md Files)
    DEFECT: the two other places that state the test-unchanged check still use `git diff <red>..HEAD`, which lists
            every test file merged in from main.
    TRIGGER: Loop 9 conflict after a merge that brought any sibling test (src/sib.test.ts, e2e/01.spec.ts in the
             probe) → dev-lead step 6 runs /tdd-loop, whose green gate says `git diff --stat <red>..HEAD … empty`.
    WRONG BEHAVIOUR: the /tdd-loop green gate fails on main's tests, and the reviewer's checklist (step 7) reads the
            same tests as weakened on the card, so the conflict path Loop 9 depends on stalls or sends the card
            back to test-writer for code it does not own. dev-lead.md:70 and tdd-loop step 4 now contradict each
            other. Fixing it needs both files added to the plan and the plan re-approved (planning.md).
    CONFIDENCE: confirmed (same probe: the old check lists 3 files)

[3] KIND: plan-mismatch
    WHERE: .claude/docs/git-workflow.md:11-12 ("Lifecycle of a card", step 5)
    DEFECT: the lifecycle still opens the PR at the end with `gh pr create` after /review-loop; the same file's
            "Bringing main in" (lines 38-43) and dev-lead Loop 5 open a draft at the plan gate.
    TRIGGER: a session that follows git-workflow.md's lifecycle (the CLAUDE.md "How a task is run end to end" row
             points there) after dev-lead Loop 5 already opened the draft.
    WRONG BEHAVIOUR: step 5 tells it to `gh pr create` a second PR for the same branch (gh refuses: one exists), and
            never to merge origin/main, wait for green CI or `gh pr ready`. The file is in the plan's Files.
    CONFIDENCE: confirmed (read)

[4] KIND: correctness
    WHERE: .claude/agents/dev-lead.md:79 ("A sibling's merge makes it BEHIND → merge origin/main again")
    DEFECT: the BEHIND re-merge happens after `gh pr ready`, and nothing says to wait for CI or `gh pr ready --undo`
            on red.
    TRIGGER: PR ready and green; a sibling merges a change to a function the card calls; the re-merge is clean,
             is pushed, and `ci` goes red.
    WRONG BEHAVIOUR: a red PR shows as ready to the lead and next-task.sh counts it as Review, freeing a WIP slot.
            That is the state plan review round 2 reason 2 removed from the first ready.
    CONFIDENCE: plausible (doc trace; not run against GitHub)

[5] KIND: correctness
    WHERE: scripts/worktree.sh:24-29
    DEFECT: the explicit-base test is `$# -ge 2`, not "non-empty", and the warning text is fixed.
    TRIGGER: (a) `scripts/worktree.sh feat/X ""`; (b) a repo with no `origin/main` and a failed fetch;
             (c) an existing branch with no base.
    WRONG BEHAVIOUR: (a) rc 255 `fatal: not a valid object name: ''` (21c36b9: rc 0 from main); (b) the warning says
            "using the last fetched origin/main" while it uses `main`; (c) a fetch and a warning for a base that
            is never used. No caller passes "" today. Not blocking.
    CONFIDENCE: confirmed (E1, E2, E4)

[6] KIND: coverage
    WHERE: scripts/worktree.sh:28 (`else BASE=main`)
    DEFECT: no K probe has a repo without `origin/main`, so the fallback is untested.
    TRIGGER: change `else BASE=main` to `else BASE=origin/main`.
    WRONG BEHAVIOUR: worktree-smoke.sh still prints 4 ok, 0 FAIL. Not blocking (the plan's K1-K4 do not name it).
    CONFIDENCE: confirmed (revert probe)
```

Notes, not findings: `backlog/CLAUDE.md` "Commit order" ends "→ /review-loop → PR" (still true, it does not say
when the PR opens). The card title and README row still say "a ping when waiting" under (b). The plan review's
riskiest unfalsified (the desktop notification) is still unverified; the lead accepted (b) knowing it.

Verdict: back to code-writer. Blocking: 1, 2, 3. 2 (and 1 if fixed in reviewer.md) need `tdd-loop/SKILL.md` and
`reviewer.md` added to plan.md's Files and the plan re-approved by the lead first. 4-6 are for the lead to take or
drop.

Riskiest unfalsified: Loop 9's "wait until a `ci` run exists for the head SHA" has no command. `gh pr checks <n>
--watch` run straight after the push may exit on the old head's checks or on "no checks reported". I could not push
to test it.

### Dispositions (pass 1, dev-lead)

| #   | Finding                                                       | Disposition | Evidence                                                                                                                 |
| --- | ------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------ |
| 1   | merge-resolved test edits pass every gate                     | fix now     | `146a0df`: second command `--first-parent --merges --remerge-diff`; reviewer reads it; on this branch both print 0 lines |
| 2   | tdd-loop and reviewer.md still use `git diff <red>..HEAD`     | fix now     | plan amended (548b2a7), lead round 2 "approve" (d0ac6aa); `146a0df` updates both                                         |
| 3   | git-workflow.md Lifecycle step 5 opens the PR at the end      | fix now     | `146a0df`: draft at the gate, ready at Loop 9                                                                            |
| 4   | BEHIND after `gh pr ready` re-merges without CI               | fix now     | `146a0df`: `gh pr ready --undo`, merge, green, ready again                                                               |
| 5   | empty base rc 255; warning text; fetch for an existing branch | fix now     | K6 red at 0c0b0f5 (b1d5c85), green in `146a0df`; warning names the fallback; existing branch skips the fetch             |
| 6   | `else BASE=main` mutant survives                              | fix now     | K5 (b1d5c85); smoke 6 of 6 on bash 5 and 3.2                                                                             |
