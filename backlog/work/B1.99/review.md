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
