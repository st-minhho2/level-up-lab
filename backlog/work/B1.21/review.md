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
