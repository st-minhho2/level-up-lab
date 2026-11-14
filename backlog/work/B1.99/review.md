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
