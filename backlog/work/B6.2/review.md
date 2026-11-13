# B6.2 review

## Plan review (round 1)

SCOPE: all (lib `src/lib/filter-counts.ts`; ui `src/components/todo-filter-nav.tsx`, `src/app/page.tsx`, `e2e/`)

Reviewed `plan.md` at 78db082 against `spec/contracts/28-filter-counts.md` (§30), `advice.md`, `analysis.md`, D-33,
`.claude/rules/*.md`, `scripts/verify-red.sh`.

| Check                                                                             | Result                                                                                                                                                                                                                                                                                                             |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| every file in the plan belongs to the section's features (map)                    | pass: the 7 files are the §30 Function contracts files, their three test files and the F28 map row D-33 assigns to B6.2; `src/lib/todos.ts`, `todo-filter.ts`, `src/actions/*` untouched as §30 requires                                                                                                           |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: signatures copy §30 verbatim (interface, `readonly`, explicit return types, optional `counts` as `undefined`); no action, no Prisma in `src/` (the e2e seeds with `PrismaClient` as `e2e/12`, `26` do); `filter-counts.ts` is pure, no `server-only`                                                         |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: approach A, stated in the first line                                                                                                                                                                                                                                                                         |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: 7 criteria (AC-30.1–30.7), every Then an exact string, count or role tally                                                                                                                                                                                                                                   |
| verification lists exact commands with expected numbers                           | **fail**: numbers are right (I ran `pnpm test`: 39 files, 241 passed; e2e: 22 files, 52 `test(` calls), but the plan expects `scripts/verify-red.sh B6.2` exit 0 while landing AC-30.4 green in the same `(red)` commit, which that script rejects (reason 1)                                                      |
| work breakdown has skeleton → red → green → map → review with convention subjects | **fail**: the five steps and subjects are there, but the breakdown has no step for the green-by-design AC-30.4 pin that reason 1 needs                                                                                                                                                                             |
| the section has a `Lead approves spec` box, ticked only by a human                | pass: `- [ ] Lead approves spec` present in `28-filter-counts.md`, unticked                                                                                                                                                                                                                                        |
| no settled D-n contradicted                                                       | pass: D-33 honoured (section 30, file `28-filter-counts.md`, component `todo-filter-nav.tsx`, counts from `page.tsx`, F28, the §12 lift in its own `docs(spec)` commit 361af3c before the §30 file d64a861, package guides out); `scripts/agent/tier.sh` → `medium`, so D-27 lets a reviewer-approved plan proceed |
| `scripts/next-task.sh --check B6.2` says no overlap                               | pass: `[next-task] B6.2: no overlap with any Doing or Review card`                                                                                                                                                                                                                                                 |

### Reasons (changes requested)

1. **The red gate cannot pass as planned.** Verification says "`scripts/verify-red.sh B6.2` exit 0 … AC-30.4 green
   on the skeleton (it pins REQ-30.6) and is named as such in the red commit body". `scripts/verify-red.sh` step 6:
   "PASS only if … zero NEW tests passed", and line 147 reports `GREEN before implementation: …` as a problem (exit 1).
   AC-30.4 renders `TodoFilterNav` without `counts`, which the skeleton (counts ignored) already satisfies, so a
   `(red)` commit containing it exits 1 whatever the commit body says. Fix in the plan: land AC-30.4 alone in a
   test-only commit **before** the red commit, subject without `(red)`, e.g. `test(todos): B6.2 pin AC-30.4 nav
without counts renders as §12`, body "Green by design: … Landed before the red commit so verify-red judges only
   the tests that need the code" (precedent: B4.3's `test(todos): B4.3 pin AC-22.3 …`). The red commit then adds
   AC-30.1–30.3 (and the e2e file); add the step to the Work breakdown and restate the counts (pin: 241 → 242;
   green: 242 → 245).

### Costs the lead should see before approving (not blocking)

- **Count sits outside the link, against the card's wording.** The card says "each filter link reads its name and the
  number"; §30 REQ-30.2 puts `(n)` in a sibling `<span>` and lists "a count inside the link text" as Out of scope.
  The plan follows §30 (correct per spec fidelity), so screen readers hear "link, All" then "(4)" as separate items
  and clicking the number does not follow the link. `analysis.md` asks the lead to confirm this; the plan does not
  repeat it.
- **Spacing.** The nav is `flex gap-3`; a Fragment makes each `(n)` its own flex item 12 px from both neighbours
  (`All  (4)  Active  (2)  Completed  (2)`), so a count is visually as close to the next link as to its own. §30
  forbids styling beyond the existing classes; changing that needs a spec edit (`advice.md` Layout note).
- **REQ-30.4 "created" has no criterion.** AC-30.6 exercises toggle, bulk complete, reload and clear, not create; a
  regression only in the create path would pass every §30 test. It is a spec gap, not a plan defect.
- **Card `Test:` line is stale.** It says red because "`filterCounts` is not exported yet (`src/lib/filter-counts.ts`
  does not exist)", an import failure that `testing.md` and verify-red reject. The plan's skeleton (throws
  `NotImplementedError`) is right; the red commit body must give that reason, not the card's.

Verdict: changes requested

## Plan review (round 2)

SCOPE: all (lib `src/lib/filter-counts.ts`; ui `src/components/todo-filter-nav.tsx`, `src/app/page.tsx`, `e2e/`)

Reviewed `plan.md` at ad3e423 (diff vs 78db082: Verification and Work breakdown only; Files and Interfaces unchanged)
and the card's `Test:` line, also changed in ad3e423.

| Check                                                                             | Result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: unchanged from round 1; `scripts/ci/plan-files.sh --any B6.2 HEAD` lists the same 7 paths                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: unchanged from round 1, still a copy of the §30 Function contracts                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: approach A                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: 7 criteria, unchanged                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| verification lists exact commands with expected numbers                           | pass: reason 1 fixed. Traced `scripts/verify-red.sh`: the base is the parent of the first `(red)` commit, i.e. the pin commit, so the base run of `todo-filter-nav-counts.test.tsx` already ran AC-30.4 (passed), the old-name count is 1, and AC-30.4 is not new in the red run (lines 112-123). AC-30.1's failure reads "filterCounts is not implemented" (`src/lib/errors.ts:4`), which does not match `IMPORT_ERROR`. Counts restated: 241 → 242 (pin) → 245 (1 unit + 2 component); e2e 52 → 55. Today's nav renders no `<span>` (`todo-filter-nav.tsx:20-33`), so AC-30.4 is green on the skeleton as claimed |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: `chore(todos): B6.2 skeleton` → `test(todos): B6.2 pin AC-30.4 …` (no `(red)`, so not selected by verify-red's `--grep`) → `test(todos): B6.2 … (red)` → `feat(todos): B6.2 …` → `docs(map): F28 … [B6.2]` → `docs(backlog): B6.2 review …`; same order as B4.3 and B1.11                                                                                                                                                                                                                                                                                                                                     |
| the section has a `Lead approves spec` box, ticked only by a human                | pass: `- [ ] Lead approves spec` in `28-filter-counts.md`, unticked                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| no settled D-n contradicted                                                       | pass: D-33 as in round 1; `scripts/agent/tier.sh backlog/work/B6.2/plan.md` → `medium`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `scripts/next-task.sh --check B6.2` says no overlap                               | pass: `[next-task] B6.2: no overlap with any Doing or Review card`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

Round 1's fourth cost is gone: the card's `Test:` line now reads "red because: the skeleton's `filterCounts` throws
`NotImplementedError`". The plan footer still says `Rounds: 1`; paperwork, not blocking.

### Costs the lead should see before approving (carried from round 1, not blocking)

- **Count sits outside the link, against the card's wording** ("each filter link reads its name and the number"):
  §30 REQ-30.2 puts `(n)` in a sibling `<span>`; screen readers hear "link, All" then "(4)" separately, and clicking
  the number does not follow the link. `analysis.md` asks the lead to confirm.
- **Spacing.** `flex gap-3` makes each `(n)` its own flex item 12 px from both neighbours, so a count is as close to
  the next link as to its own; §30 forbids styling beyond the existing classes.
- **REQ-30.4 "created" has no criterion**: AC-30.6 covers toggle, bulk complete, reload and clear, not create; a
  regression only in the create path passes every §30 test (spec gap).
- **verify-red does not run e2e**: AC-30.5–30.7's red rests on the manual `pnpm test:e2e e2e/30-filter-counts.spec.ts`
  run the plan lists; the red commit body should quote its result.

Verdict: approved (ready for the lead's gate; tier medium)
