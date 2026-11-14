# B1.99 review

SCOPE: tooling (no §; `.claude/agents/`, `.claude/docs/`, `scripts/hook-smoke.sh`)

## Plan review (round 1)

Plan at 4a9a889 (`docs(backlog): B1.99 plan`). Card `backlog/plan/E1-todos.md` "### B1.99", D-36 in
`backlog/00-decisions.md`, the D-36 request `backlog/work/B6.6/decision-request-merge.md`, the repair 1bb65dd.

Probe (on a clone under `$TMPDIR`, not the worktree): I applied the planned probes to `scripts/hook-smoke.sh`, then
the planned guard change and the two `states` strings to the two prompts. Results:

- base (this worktree, 4a9a889): `hook-smoke: 726 probes OK` (matches the plan's "Before").
- red: exactly the 5 FAIL lines the plan names (spec-analyst `passes`, frontmatter `0 spec/technical-requirements.md`,
  the `hg` probe, the two `states`). The 16 layout probes pass at red, because they feed `role_patterns` and not the
  frontmatter. The plan's FAIL list already leaves them out, so it is correct.
- green: 746 `ok`, 21 new. Total 747, which matches 726 + 21. The `2 spec/CLAUDE.md` probes pass at red and at green,
  so `spec/*` stays refused.
- One extra FAIL, `require-review.sh spoke on a clean tree`, came from my probe setup (an uncommitted tree with
  node_modules linked in). It is not from the plan.

| Check                                                                             | Result                                                                                                                                                                                                                                                                                                                                    |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: there is no section (tooling). `scripts/ci/plan-files.sh --any B1.99 HEAD` lists the 5 Files rows. All of them are in the card's Spec line or are its paperwork, plus `.claude/docs/hooks.md:78`, which is the write-scope row that has to move with the guard                                                                      |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass (n/a): no `src/`, `prisma/` or `e2e/` change                                                                                                                                                                                                                                                                                         |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: there is no advice (tier quick, no section), and the plan says so. It follows the option B that D-36 named for the next batch                                                                                                                                                                                                       |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: the card has 4 acceptance bullets, each checkable: a guard verdict, a prompt sentence, a D-36 statement, a label                                                                                                                                                                                                                    |
| verification lists exact commands with expected numbers                           | pass, with a note (reason 3): 726 → red with 5 named FAILs → 747. I measured all three                                                                                                                                                                                                                                                    |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: a tooling card has no skeleton and no map. Red `test(hooks)`, green `chore(agents)` and review follow the B1.88, B1.89 and B1.96 precedent                                                                                                                                                                                          |
| the section has a `Lead approves spec` box, ticked only by a human                | n/a: no section. `Plan approved by:` is empty and stays empty here. The tier is high (`scripts/agent/tier.sh` → `high`), so the lead's `approve` is required                                                                                                                                                                              |
| no settled D-n contradicted                                                       | fail (reason 1): D-36's ruled recipe ends with "`git diff origin/main -- spec/technical-requirements.md` shows only that row" (`work/B6.6/decision-request-merge.md:30-31`). The plan's recipe drops that check. D-36's standing rule is superseded in Loop 9 without rewriting `00-decisions.md`, which the card allows. D-19 label: yes |
| `scripts/next-task.sh --check B1.99` says no overlap                              | pass: `[next-task] B1.99: no overlap with any Doing or Review card` (exit 0)                                                                                                                                                                                                                                                              |

Verdict: changes requested

1. **The repair loses the content check that D-36's recipe carried, and the plan's cost line overstates what the guard
   proves.** The plan says "origin/main's copy keeps every sibling's row, and the guard proves each § once".
   `check-spec-sections.sh` checks that § numbers exist and are unique. It never compares a row's cells with
   origin/main. `check-ac-coverage.sh:15-21` reads each row's Status, and it enforces tests only for ✅ and ◐.
   Concrete case: in Merge repair mode `spec-analyst` (model sonnet) writes the 46-line index through Write. If one
   sibling row comes back with `✗` where main has `✅`, or with a wrong file name, both guards pass and nobody reviews
   the commit. For a status cell, §n's criteria then leave coverage enforcement without any error. This has happened
   before: B6.5's git-only restore 24f6ffa dropped its own §33 row (D-36 notes). Fix: the Loop 9 sentence (and the
   Merge repair mode) ends with D-36's check before the commit: `git diff origin/main -- spec/technical-requirements.md`
   shows only the card's own row lines (none for a tooling card). Say what happens when it shows more. One case is
   B1.97's re-pad: Prettier re-aligns every row when the card's row is wider than its column. Then either stop for the
   lead, or compare with whitespace ignored, and name which. Add the check to Costs in place of "the guard proves each
   § once".
2. **The Merge repair mode has no brief value and no report line, and Interfaces says nothing changes.** The Role brief
   template in `dev-lead.md` (`Mode: <analysis | advice | plan review | red | green | diff review>`) has no repair
   mode. `spec-analyst`'s Report (`SPEC: §<n> written|extended …`, `CARD: …`) cannot describe a repair. Its
   description, "Use when dev-lead picks a card whose Spec: or Test: line is missing", does not cover it either (the
   plan does update the description). Under `claude -p` the brief and the report line are the whole contract between
   the two roles. Fix: paste the brief's `Mode: merge repair` line and the repair's report line into Interfaces. For
   example: `REPAIR: spec/technical-requirements.md = origin/main <sha> + §<n> row | no own row; diff vs origin/main:
<k> lines`. Name whether the template's Mode list in `dev-lead.md` changes.
3. **Minor (wording):** "every pre-existing probe line unchanged" is not literally true. The line
   `ok spec-analyst passes: …` changes text, because `role_patterns` gains the path. In my measured baseline-to-green
   diff, it is the only pre-existing line that changes. Name it as the one expected exception, so the diff review can
   compare literally.

Not blocking. These are costs the lead should see:

- The `states spec-analyst 'Merge repair'` probe only proves that a heading exists, not the recipe. Reason 1's check
  would be a stronger string to state.
- The format hook runs after spec-analyst's Write, so B1.97 (Open) can re-pad the whole table in the repair commit
  itself. That leaves the card's PR diff touching every row, and the next sibling's union merge may duplicate again.
  This is the same under D-36 (A). It is not a new cost of B, but the repair does not end it.
- No reviewer pass on the repair commit (a stated cost). With reason 1's diff check in place, the lead's PR diff is the
  backstop, not the only check.

Riskiest unfalsified: whether a headless `spec-analyst` reproduces origin/main's index cell for cell. I could not run
an agent here. Reason 1's diff check is what would make it falsifiable.

## Plan review (round 2)

Plan at 5c3f687 (`docs(backlog): B1.99 plan round 2`). Only `plan.md` changed since round 1
(`git show --stat 5c3f687`). The hook-smoke probe list is the same text as in round 1, so round 1's measurements
still apply: 726 at base, red with exactly the 5 named FAILs, 747 at green. I did not re-run them this round. A
`git clone` under `$TMPDIR` has no `node_modules`, so hook-smoke fails there on js-yaml, which is my setup and not the
plan.

Round 1 reasons:

- [1] addressed. D-36's check is back as a normalized `diff` with a "Waiting on human" stop, and Costs now say what
  the guards do not prove. See reason 1 below for the normalization.
- [2] addressed. Interfaces now give the brief's `Mode: … merge repair …` and the `REPAIR:` report line.
- [3] addressed. The `ok spec-analyst passes: …` line is named as the one pre-existing line that changes.

Measured this round:

- The plan's two diff claims reproduce. With `tr -d ' -'`, ca2a58d against 1bb65dd prints `39a40` and one §34 `>`
  line. 1bb65dd against 1bb65dd^ prints 34 `>` lines.
- `guard-bash.sh` lets the planned commands through (exit 0): the `diff <(…) <(…)` command for `agent_type` dev-lead
  and spec-analyst, and `git show origin/main:spec/technical-requirements.md` for spec-analyst.
- `path-guard.sh:10-12,39-42`: `--role` reads the dispatched agent's list from its frontmatter, so the plan's
  headless claim (B1.78) holds.
- `scripts/ci/check-spec-sections.sh` checks § headings and duplicate § rows. It does not check link targets.

| Check                                                                             | Result                                                                                                                                                                                                                                                                             |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: no section (tooling). `scripts/ci/plan-files.sh --any B1.99 HEAD` lists the 5 Files rows: the card's Spec line, `.claude/docs/hooks.md:78` (the write-scope row), and the card's paperwork                                                                                   |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass (n/a): no `src/`, `prisma/` or `e2e/` change                                                                                                                                                                                                                                  |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: there is no advice (tier quick), and the plan says so. It follows D-36's option B                                                                                                                                                                                            |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: the card has 4 acceptance bullets, each one checkable                                                                                                                                                                                                                        |
| verification lists exact commands with expected numbers                           | pass: 726 → red with 5 named FAILs → 747, plus the one baseline line that changes                                                                                                                                                                                                  |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: a tooling card has no skeleton and no map. The steps are red `test(hooks)`, green `chore(agents)`, then review                                                                                                                                                               |
| the section has a `Lead approves spec` box, ticked only by a human                | n/a: no section. `Plan approved by:` is empty. The tier is high (`.claude/`), so the lead's `approve` is needed. (`scripts/agent/tier.sh B1.99` printed "cannot read B1.99" here, so the high tier comes from the plan's Files table, as D-28 derives it, and not from the script) |
| no settled D-n contradicted                                                       | fail (reason 1): D-36's recipe says the diff "shows only that row". The plan's normalization cannot show a dash dropped from a row. D-36's standing rule is superseded in Loop 9 without rewriting `00-decisions.md`, which the card allows. D-19 label: yes                       |
| `scripts/next-task.sh --check B1.99` says no overlap                              | pass: `[next-task] B1.99: no overlap with any Doing or Review card` (exit 0)                                                                                                                                                                                                       |

Verdict: changes requested

1. **The repair's only gate cannot see a dash, and every row's link target has dashes.** At `plan.md:11` the check
   normalizes with `tr -d ' -'`, which deletes every hyphen. All 34 index rows link a kebab-case file
   (`contracts/30-clear-completed-count.md`). No guard checks those targets: `check-spec-sections.sh` reads only §
   numbers, and `check-ac-coverage.sh` reads only Status. The Costs bullet says "Only the normalized diff above
   catches it", but it does not catch this.
   - TRIGGER (confirmed): I took ca2a58d's index and rewrote §32's link to `contracts/30-clearcompleted-count.md`. The
     planned `diff <(… | tr -d ' -') <(… | tr -d ' -')` exits 0, so the repair would commit with a broken link.
   - Fix: squeeze runs instead of deleting them, with `tr -s ' -'`. This is still layout-proof on the real data. On
     1bb65dd^ (B6.4's re-padded rows against the old layout), `tr -s ' -'` pairs 32 duplicate rows, the same 32 as
     `tr -d ' -'`. The raw text pairs 0. On ca2a58d against 1bb65dd it prints the same `39a40` with one §34 line.
     Against the edited link it exits 1. Replace the command and its "spaces and dashes dropped" explanation.
     Re-measure the two claims with the new command.

Not blocking. These are costs for the lead to see:

- **The own-row diff (`git diff origin/main...HEAD^1`) assumes HEAD is the merge that made the duplicates.** Suppose
  the repair fires only after CI (the plan's normal path until B1.92), and dev-lead re-enters Loop 9 first and runs
  `git fetch origin && git merge origin/main`. If a sibling merged in between, this makes a second merge, and HEAD^1
  becomes the first merge, which still holds the 34 duplicate rows. The "own row" then includes them, the diff check
  prints more than one row, and the run stops at "Waiting on human". That stop is safe, but it is the lead's session
  again, which is the outcome this card exists to avoid. Two ways out: Loop 9 could say to repair before any re-merge,
  or the plan could take the main side from `HEAD^2` once it confirms HEAD is a merge. Nothing in Loop 9 fetches
  without merging (`scripts/pr-step.sh` only runs `rev-parse` on origin/main, line 89), so a stale `origin/main` is
  not reachable today.
- Round 1's notes still apply. `states spec-analyst 'Merge repair'` proves a heading exists, not the recipe. The
  format hook may re-pad the table in the repair commit until B1.97 lands. A run's diff check is prose that hook-smoke
  does not probe (the plan now states this itself).
- `plan.md` is 82 lines, against `planning.md`'s ≈ 40-line screen. Round 1 did not raise it, and I do not block on it
  now.

Riskiest unfalsified: whether a headless `spec-analyst` retypes the 46-line index exactly. With `tr -s` the diff check
would catch any difference except a change in how many spaces or dashes sit in a row. I could not run an agent here.

## Diff review (round 1)

Range: origin/main merge-base 8b0358e..f7de3de. Red d6b8f1e (`scripts/hook-smoke.sh` only), green f7de3de
(`.claude/agents/spec-analyst.md`, `.claude/agents/dev-lead.md`, `.claude/docs/hooks.md`). origin/main is now
b35c5d6, 4 commits ahead (B1.97, the §35–§37 sections). No file changed on both sides since 8b0358e, so the merge in
Loop 9 has no overlapping files. I did not run the merge itself: the guard refuses `git -c … merge` and
`git merge-tree`.

### Commands (last line of each, run by me in the worktree unless a clone is named)

| Command                                              | Result                                                                                                                                                                                                 |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm lint`                                          | `All matched files use Prettier code style!`                                                                                                                                                           |
| `pnpm typecheck`                                     | `> tsc --noEmit` (exit 0)                                                                                                                                                                              |
| `pnpm test`                                          | `Tests  280 passed (280)`                                                                                                                                                                              |
| `pnpm test:e2e`                                      | `64 passed (1.5m)`                                                                                                                                                                                     |
| `pnpm test:mutation`                                 | `Final mutation score of 92.74 is greater than or equal to break threshold 70` (no `src/` change)                                                                                                      |
| `scripts/hook-smoke.sh` (green, worktree)            | `hook-smoke: 747 probes OK`                                                                                                                                                                            |
| `scripts/hook-smoke.sh` (red d6b8f1e, clone)         | `hook-smoke: FAILURES above`: 741 ok + the 5 planned FAILs + `require-review.sh spoke on a clean tree`. The last one comes from my clone setup: it also fails on origin/main in the same kind of clone |
| `scripts/hook-smoke.sh` (origin/main b35c5d6, clone) | 725 ok + that same setup FAIL. Normalized diff against green: only `ok spec-analyst passes: …` changes, and the 21 new `ok` lines are added (2 frontmatter, 16 layout, 1 `hg`, 2 `states`)             |
| `check-suppressions.sh`                              | `[check-suppressions] OK: no new suppressions`                                                                                                                                                         |
| `check-config-change.sh`                             | exit 1 locally (the label is not visible to it there). PR #295 carries `config-change-approved` (`gh pr view 295 --json labels`)                                                                       |
| `check-feat-commits.sh`                              | `[check-feat-commits] OK: no feat commit touches tests`                                                                                                                                                |
| `check-ac-coverage.sh`                               | `[check-ac-coverage] OK: every criterion of a shipped section has a test`                                                                                                                              |
| `check-spec-sections.sh`                             | `[check-spec-sections] OK: sections cited: 1 … 34`                                                                                                                                                     |
| `check-features-map.sh`                              | `[check-features-map] OK`                                                                                                                                                                              |
| `check-agent-frontmatter.sh`                         | `[check-agent-frontmatter] OK: 13 files`                                                                                                                                                               |
| `check-plan-scope.sh`                                | `[check-plan-scope] OK: chore/B1.99-index-guard stays inside the approved plan of B1.99`                                                                                                               |
| `scripts/verify-red.sh B1.99`                        | exit 1, `no 'test(<pkg>): B1.99 … (red)' commit`. `--auto` (CI's form) prints `nothing to verify` and exits 0                                                                                          |
| `scripts/next-task.sh --check B1.99`                 | `[next-task] B1.99: no overlap with any Doing or Review card`                                                                                                                                          |
| `git diff --stat origin/main...HEAD`                 | 7 files: 3 under `.claude/`, `scripts/hook-smoke.sh`, 3 under `backlog/work/B1.99/`                                                                                                                    |

### Checklist

| Check                                               | Result                                                                                                                                                                                                                                                                                                                                    |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every acceptance bullet has a check that matches it | guard allows the index: frontmatter, `hg` and 16 layout probes, all `ok`. Every other verdict is unchanged, and the count is stated (726 → 747). Loop 9 names the dispatch and the exact commit title (`states` probe). D-36 is superseded in Loop 9's sentence. The label is on #295                                                     |
| no test weakened after red                          | `git log --first-parent --no-merges d6b8f1e..HEAD -- '*.test.*' e2e/ scripts/hook-smoke.sh` is empty. No merges in the range                                                                                                                                                                                                              |
| every changed file is in `plan.md`                  | yes, all 5 Files rows                                                                                                                                                                                                                                                                                                                     |
| interfaces match the plan                           | the guard list matches it in order. `Mode: … merge repair …` and the `REPAIR:` line match Interfaces verbatim. The `tr -s` command matches `plan.md:11`                                                                                                                                                                                   |
| red commit subject                                  | it deviates from the plan. Work breakdown names `… index write (red)`, and the commit has no `(red)`. The body explains why (smoke only, as B1.89, whose plan named no marker). With the marker, `verify-red.sh --auto` would look for vitest files of B1.99 and find none. Not blocking. The red was proven by my run of d6b8f1e instead |
| Zod / Prisma / raw SQL / migration                  | n/a: no `src/`, `prisma/` or `e2e/` change                                                                                                                                                                                                                                                                                                |
| no secret, no suppression                           | none                                                                                                                                                                                                                                                                                                                                      |
| features map                                        | n/a: tooling, no feature                                                                                                                                                                                                                                                                                                                  |
| guard-bash lets the recipe run                      | exit 0 for spec-analyst and for dev-lead on `git diff origin/main...HEAD^1 -- …`, `git show origin/main:…`, and the `diff <(…tr -s…) <(…)` command                                                                                                                                                                                        |
| would a revert fail a probe?                        | the guard path, `section index rows once` and `Merge repair` would. On a clone I changed `tr -s` → `tr -d`, `HEAD^1` → `HEAD`, and removed `merge repair` from the brief's Mode list. hook-smoke then showed no new FAIL. That is the plan's stated cost ("prose, not probed"), so I do not count it as a finding                         |
| Prettier re-pad of `hooks.md`'s table               | formatting only. `pnpm lint` (prettier --check) needs it, and every row's cells other than spec-analyst's are unchanged                                                                                                                                                                                                                   |

### Findings

```
[1] KIND: correctness
    WHERE: .claude/agents/spec-analyst.md:49 (Merge repair: "git diff origin/main...HEAD^1")
    DEFECT: the own-row derivation assumes HEAD is the merge that duplicated the row; after any later commit, HEAD^1
            is that merge, so the derivation returns every stale duplicate as the card's "own" row.
    TRIGGER: Loop 9 merges, pushes, and CI goes red on both check-spec-sections and another job. The dev-lead takes
            "back through the loop", and a fix commit (or a review commit) lands before the repair is dispatched.
            Reproduced on a toy repo under $TMPDIR (merge=union; the card appends §3; trunk flips §2 ✗→✅ and appends §4).
            With HEAD = the merge, `git diff trunk...HEAD^1` gives `+| §3 …`. After one more commit it gives
            `+| §2 | … | ✗ |` and `+| §3 …`.
    WRONG BEHAVIOUR: the card says to restore "origin/main's copy plus the card's own row". Here spec-analyst is told
            that the sibling's pre-flip §2 ✗ row is the branch's change. dev-lead's diff check then prints a §2 `<`/`>` pair:
            it stops ("Waiting on human"), which is the lead's session that this card exists to remove. Or it accepts
            the pair as "a row the branch changed" (the wording allows it for a card with no new row), which undoes
            the sibling's ✅. The plan's normal trigger until B1.92 is "in CI after the push", so this state is reachable.
    CONFIDENCE: confirmed for the derivation (I ran it); plausible for the acceptance branch (no agent run)
```

The fix is one phrase, inside the approved Files and Interfaces. Take `^1` of the merge that left the row twice, not
HEAD's. For example, `m=$(git log --first-parent --merges -1 --format=%H); git diff origin/main...$m^1 -- …`, or
`git log --first-parent --no-merges -p origin/main..HEAD -- spec/technical-requirements.md`. On the toy repo after the
extra commit, both print only `+| §3 …`. It changes the plan's approach text (`plan.md:9`), so the lead should see
the new line. Round 2 of the plan review raised a sibling of this (a second merge) as a cost. This trigger is a
plain commit, which the CI-red path produces.

Verdict: back to code-writer (for this tooling card, the dev-lead writes `.claude/agents/spec-analyst.md`). Fix [1]
in spec-analyst.md's Merge repair. Optionally, in Loop 9, say that the `<`/`>` pair is allowed only for the card's
own §.

Riskiest unfalsified: whether a headless sonnet `spec-analyst` reproduces origin/main's index cell for cell through
Write. Since B1.97 (on main now), Prettier no longer re-pads the file, so `tr -s` hides only changes in run length.
No agent was run, and no probe executes the Loop 9 diff check.

## Diff review (round 2)

Range since round 1: 717c46e (review pass 1), red 771ca24 (`scripts/hook-smoke.sh` only, one new `states` probe),
fix 3b0b797 (`.claude/agents/spec-analyst.md`, `.claude/agents/dev-lead.md`). origin/main is now 012d479 (B1.97 and
its closing). No file changed on both sides since the merge base 8b0358e (`git diff --name-only` of both sides share
no path).

### Commands (last line of each, run by me in the worktree unless the copy is named)

| Command                                               | Result                                                                                                                                                                                                                                                                 |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                                           | `All matched files use Prettier code style!`                                                                                                                                                                                                                           |
| `pnpm typecheck`                                      | exit 0                                                                                                                                                                                                                                                                 |
| `pnpm test`                                           | `Tests  280 passed (280)`                                                                                                                                                                                                                                              |
| `pnpm test:e2e`                                       | `64 passed (1.3m)`                                                                                                                                                                                                                                                     |
| `pnpm test:mutation`                                  | `Final mutation score of 92.74 is greater than or equal to break threshold 70` (no `src/` change)                                                                                                                                                                      |
| `scripts/hook-smoke.sh`                               | `hook-smoke: 748 probes OK`                                                                                                                                                                                                                                            |
| `check-suppressions.sh`                               | `[check-suppressions] OK: no new suppressions`                                                                                                                                                                                                                         |
| `check-config-change.sh`                              | prints `.claude/docs/hooks.md` and exits 1 locally, where the label is not visible. PR #295 carries `config-change-approved` (`gh pr view 295`)                                                                                                                        |
| `check-feat-commits.sh`                               | `[check-feat-commits] OK: no feat commit touches tests`                                                                                                                                                                                                                |
| `check-ac-coverage.sh`                                | `[check-ac-coverage] OK: every criterion of a shipped section has a test`                                                                                                                                                                                              |
| `check-spec-sections.sh`                              | exit 1 on the branch as it is: two sections cited without a heading. The only citing file is this `review.md` (round 1's line about origin/main's new sections). Those headings are on origin/main, so the check passes after the merge (next row). See the note below |
| `check-spec-sections.sh` (copy merged with 012d479)   | `[check-spec-sections] OK: sections cited: 1 … 37`                                                                                                                                                                                                                     |
| `check-features-map.sh`                               | `[check-features-map] OK`                                                                                                                                                                                                                                              |
| `check-agent-frontmatter.sh`                          | `[check-agent-frontmatter] OK: 13 files`                                                                                                                                                                                                                               |
| `check-plan-scope.sh`                                 | `[check-plan-scope] OK: chore/B1.99-index-guard stays inside the approved plan of B1.99`                                                                                                                                                                               |
| `scripts/verify-red.sh B1.99`                         | exit 1, `no 'test(<pkg>): B1.99 … (red)' commit`, as in round 1. `--auto` prints `nothing to verify`. The hardening red 771ca24 was proven by the revert probe below                                                                                                   |
| copy `git clone` + `git merge` of origin/main 012d479 | clean merge. `hook-smoke`: 747 `ok` plus the clone-setup FAIL `require-review.sh spoke on a clean tree` that round 1 also saw (748 probes). `table-merge-smoke.sh`: `15 probes OK`. `prettier --check` on `hooks.md` and the agents: clean                             |
| `git diff --stat origin/main...HEAD`                  | 7 files: the same 5 plan rows as round 1                                                                                                                                                                                                                               |
| CI on the pushed head 6282910 (`gh pr checks 295`)    | all 7 jobs pass. 3b0b797 is not pushed yet                                                                                                                                                                                                                             |

### Checklist

| Check                                     | Result                                                                                                                                                                                                                                                                                                                                                                       |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| round 1 finding [1] fixed                 | yes. On a scratch repo (merge=union, a merge followed by more commits), the new command prints only the card's own commits. The old `HEAD^1` form printed the sibling rows. The Loop 9 sentence now accepts a `<`/`>` pair only for the card's own §                                                                                                                         |
| no test weakened after red                | `git log --first-parent --no-merges 771ca24..HEAD -- '*.test.*' e2e/ scripts/hook-smoke.sh` is empty. No merges in `d6b8f1e..HEAD`                                                                                                                                                                                                                                           |
| red then fix, convention subjects         | `test(hooks): B1.99 review pass 1 -- …` without `(red)`, as `backlog/CLAUDE.md` says for hardening tests. Then `fix(agents): …`. The fix touches no test file                                                                                                                                                                                                                |
| would a revert fail a probe?              | copy: putting back 771ca24's `spec-analyst.md` gives exactly one new FAIL, `does not state "git log --first-parent --no-merges -p origin/main..HEAD -- …"`. Putting back 771ca24's `dev-lead.md` (the "only for the card's own §" wording) gives no new FAIL. That is prose, which the plan's cost already names                                                             |
| every changed file in `plan.md`           | yes. The approach text at `plan.md:9` still names `HEAD^1`, and so does `pr-body.md:21`. dev-lead says the PR body will state the change. It is not done yet (pr-body.md is still at 6282910)                                                                                                                                                                                |
| no secret, no suppression; Zod/Prisma/SQL | none; n/a (no `src/`, `prisma/`, `e2e/`)                                                                                                                                                                                                                                                                                                                                     |
| origin/main's B1.97 vs the recipe         | B1.97 puts the index in `.prettierignore` and adds the rule "append a row unaligned; never re-pad the others". The recipe writes origin/main's file plus the card's row as committed, which matches that rule. With no re-pad, duplicates now come only from rows edited on both sides of a conflict hunk. The recipe and `tr -s` still cover that case. No change is needed |

Answers to the two questions in the brief:

- **Own-row change inside a merge resolution.** The index is `merge=union`, so a merge never stops on it, and no
  sanctioned step edits it inside a merge. The repair is a separate `docs(spec)` commit, and code-writer and
  test-writer cannot write the file. Any own-row text in the branch therefore starts in a non-merge first-parent
  commit, and `--no-merges` sees it. If a lead hand-edited the row during a merge, the log would miss it. The Loop 9
  diff check would then show the row as more than the card's own row, and the run would stop, which is safe. A later
  repair commit is itself a non-merge commit, so it shows in the log. On the scratch repo its patch printed one
  sibling `-` line and the card's own `+` line, and no sibling `+` line.
- **origin/main at b35c5d6/012d479.** See the last checklist row. The merge is clean, and every guard passes on the
  merged copy.

Note, not a finding: `check-spec-sections.sh` fails on the unmerged branch. The cause is round 1's own `review.md`
text, which cites two sections that exist only on origin/main. CI runs on `refs/pull/295/merge` and Loop 9 merges
origin/main before the push, so neither is red. A run that calls the guard before that merge sees a failure that is
not a duplicate row. The Loop 9 trigger is worded "a section row twice", and the guard's message is different, so a
repair should not be dispatched for it.

### Findings

```
[1] KIND: correctness
    WHERE: .claude/agents/spec-analyst.md:49-51 (Merge repair: "the row the card's own commits add or change, as
           git log --first-parent --no-merges -p … prints them")
    DEFECT: the log prints every version of the card's own row, newest first, and the prompt does not say which
            one to keep. The old net diff printed one version.
    TRIGGER: the card's own commits edit its row twice. Scratch repo: `docs(spec): §3 add` writes `| §3 | … | ✗ |`,
            then a later commit makes it `◐`. The log prints `-✗`, `+◐`, `+✗`, and the old `git diff main...HEAD`
            printed only `+◐`.
    WRONG BEHAVIOUR: if spec-analyst keeps the older `+✗` line, the Loop 9 check prints one `>` line for the card's
            own §. That is the accepted shape, so the stale row is committed with no stop. Only the PR diff would show
            it to the lead.
    CONFIDENCE: confirmed for the derivation (I ran it); plausible for the pick (no agent was run)
```

Not blocking. A card editing its own index row twice before Loop 9 is rare, and the result shows in the card's own
row in the PR diff. Fixing it takes one phrase in the same paragraph, for example "if it prints the row more than
once, keep the first `+` line (the newest)". dev-lead may fold that in or file it.

Verdict: ready for PR. Before the push: update `pr-body.md:21` to the new command, as the brief says, and run Loop 9's
merge (it is clean on the copy).

Riskiest unfalsified: whether a headless sonnet `spec-analyst` picks the newest own-row version out of a multi-commit
log and retypes origin/main's index exactly. No agent was run, and no probe executes the Loop 9 diff check.
