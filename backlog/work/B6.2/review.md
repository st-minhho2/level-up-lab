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

## Diff review (round 1)

SCOPE: all (lib `src/lib/filter-counts.ts`; ui `src/components/todo-filter-nav.tsx`, `src/app/page.tsx`, `e2e/`)

Reviewed `c10a1b9..d7110b8` (skeleton, pin, red, feat, map) against §30 (`spec/contracts/28-filter-counts.md`),
`plan.md` (D-27, tier medium), `.claude/rules/*.md`, `.claude/agents/code-writer.md`.

### Command results (last line each, run by the reviewer)

| Command                             | Result                                                                                                    |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                         | `All matched files use Prettier code style!`                                                              |
| `pnpm typecheck`                    | `tsc --noEmit` clean                                                                                      |
| `pnpm test`                         | `Tests  245 passed (245)` (41 files; plan: 245)                                                           |
| `pnpm test:e2e`                     | `55 passed (2.2m)` (plan: 55)                                                                             |
| `pnpm test:mutation`                | `Final mutation score of 92.68 is greater than or equal to break threshold 70`; `filter-counts.ts` 100.00 |
| `scripts/ci/check-suppressions.sh`  | `OK: no new suppressions`                                                                                 |
| `scripts/ci/check-config-change.sh` | `OK: no protected config changed`                                                                         |
| `scripts/ci/check-feat-commits.sh`  | `OK: no feat commit touches tests`                                                                        |
| `scripts/ci/check-ac-coverage.sh`   | `OK: every criterion of a shipped section has a test` (§30 ✗, 7 criteria)                                 |
| `scripts/ci/check-spec-sections.sh` | `OK: sections cited: 1 … 28 30`                                                                           |
| `scripts/ci/check-features-map.sh`  | `OK`                                                                                                      |
| `scripts/ci/check-plan-scope.sh`    | `OK: feat/B6.2-agent stays inside the approved plan of B6.2 (D-27 approval)`                              |
| `scripts/verify-red.sh B6.2`        | `RESULT: red for the right reason` (base 3700b77 pin; 1 + 2 new failed, 0 new passed)                     |
| `git diff --stat main...HEAD`       | `17 files changed, 760 insertions(+), 13 deletions(-)`                                                    |

### Checklist

| Check                                               | Result                                                                                                                                                                                                                              |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every AC-§.n has a test whose assertion matches     | pass: AC-30.1 (3 inputs + input unchanged), AC-30.2 (names, hrefs, `aria-current`, `nextElementSibling` SPAN text, 0 listitem/button, 3 links), AC-30.3, AC-30.4 (0 spans, text "AllActiveCompleted"), AC-30.5–30.7 in e2e          |
| no test weakened after the red commit               | pass: `git log --first-parent --no-merges dc761e0..HEAD -- '*.test.*' e2e/` empty; the `--merges --remerge-diff` form empty (no merges)                                                                                             |
| every changed file in `plan.md`                     | pass: 7 plan files + `docs/metrics.md` (plan's exempt paperwork; `code-writer.md` step 5-6 puts the row in the feat commit, as B5.6 7e16b8f and B6.1 6a60e13 did)                                                                   |
| interfaces match §30 Function contracts             | pass: `FilterCounts`, `filterCounts(todos: readonly { readonly completed: boolean }[]): FilterCounts`, `TodoFilterNav({ selected, counts? })` verbatim; page passes `filterCounts(todos)` from the unfiltered `todos` (page.tsx:52) |
| Zod at every action boundary / Prisma only in lib   | n/a: no action, no query; `filter-counts.ts` imports nothing                                                                                                                                                                        |
| no raw SQL; migration                               | n/a: none                                                                                                                                                                                                                           |
| no secret, no suppression                           | pass (`check-suppressions` OK; diff read)                                                                                                                                                                                           |
| features map row moved                              | pass: F28 ✅ in `docs(map)` d7110b8 alone, per `code-writer.md` step 7 ("✗ → ✅"); the §30 index row in `technical-requirements.md` stays ✗ until closing, as the plan says                                                         |
| would a test fail if one changed line were reverted | pass for behavior (probes below); fail for the span's class (finding 1)                                                                                                                                                             |

Probes (on `git clone` copy `$TMPDIR/probe`, vitest only): span rendered without `counts` → AC-30.4 fails; count put
inside the link text → AC-30.2 fails; every span reading `counts.all` → AC-30.2 and AC-30.3 fail. Page wiring
`filterCounts(shown)` instead of `filterCounts(todos)`: traced, not run (needs the e2e server): on `/?filter=active`
`shown` is `[D, B]`, spans would read "(2)", "(2)", "(0)", AC-30.5 expects "(4)", "(2)", "(2)".

### Findings

```
[1] KIND: spec-mismatch
    WHERE: src/components/todo-filter-nav.tsx:42
    DEFECT: the count span adds a colour (`text-zinc-500`) that none of the existing nav classes carry, which §30 Out of scope excludes ("colour or badge styling beyond the existing nav classes").
    TRIGGER: render `<TodoFilterNav selected="all" counts={{ all: 4, active: 2, completed: 2 }} />` in light mode.
    WRONG BEHAVIOUR: each "(n)" is painted zinc-500, a fourth colour next to the links' zinc-600 / zinc-900 (the nav's existing classes are `flex gap-3 text-sm` on the nav and `text-zinc-600 … dark:text-zinc-400 …` on the links); §30 specifies a plain `<span>` reading `(n)` and puts any new colour out of scope. No test pins the class, so removing or changing it is invisible to the suite.
    CONFIDENCE: confirmed (read the line; `grep -n text-zinc-500 src/components/todo-filter-nav.tsx` → only line 42 in that file)
```

Fix for code-writer (one line, no test change): drop the `className`, or reuse only existing nav classes (e.g. the
links' `text-zinc-600 dark:text-zinc-400`). If the lead wants the muted colour, that is a §30 edit (§8), not code.

Not findings (raised by dev-lead, checked): the `docs/metrics.md` row inside the feat commit is code-writer's step 5-6
and precedent (B5.6, B6.1); its green-sha cell reads `feat B6.2` where B5.6 used `this PR` (paperwork, fixed at
closing). The F28 ✅ in `docs(map)` follows `code-writer.md` step 7; the plan's "stays ✗" names the §30 index row,
which is still ✗.

Verdict: back to code-writer

Riskiest unfalsified: REQ-30.4 "created" has no criterion (spec gap carried from the plan review), so a create path
that skipped revalidation of the nav would pass every §30 test; and the page-wiring revert was traced, not run in e2e.

## Diff review (round 2)

SCOPE: ui. Reviewed `d7110b8..HEAD` (bd02abb review paperwork, f957cdd fix) against round 1's finding 1 and §30.

`git diff --stat d7110b8..HEAD`: `backlog/work/B6.2/review.md | 69`, `src/components/todo-filter-nav.tsx | 4 +--`;
nothing else under `src/`, `e2e/` or any test file changed since d7110b8.

### Command results (last line each, run by the reviewer)

| Command                             | Result                                                                         |
| ----------------------------------- | ------------------------------------------------------------------------------ |
| `pnpm lint`                         | `All matched files use Prettier code style!`                                   |
| `pnpm typecheck`                    | `tsc --noEmit` clean                                                           |
| `pnpm test`                         | `Tests  245 passed (245)` (41 files)                                           |
| `pnpm test:e2e`                     | `55 passed (1.6m)`                                                             |
| `pnpm test:mutation`                | `Final mutation score of 92.68 is greater than or equal to break threshold 70` |
| `scripts/ci/check-suppressions.sh`  | `OK: no new suppressions`                                                      |
| `scripts/ci/check-config-change.sh` | `OK: no protected config changed`                                              |
| `scripts/ci/check-feat-commits.sh`  | `OK: no feat commit touches tests`                                             |
| `scripts/ci/check-ac-coverage.sh`   | `OK: every criterion of a shipped section has a test`                          |
| `scripts/ci/check-spec-sections.sh` | `OK: sections cited: 1 … 28 30`                                                |
| `scripts/ci/check-features-map.sh`  | `OK`                                                                           |
| `scripts/ci/check-plan-scope.sh`    | `OK: feat/B6.2-agent stays inside the approved plan of B6.2 (D-27 approval)`   |
| `scripts/verify-red.sh B6.2`        | `RESULT: red for the right reason`                                             |
| `git diff --stat main...HEAD`       | `17 files changed, 827 insertions(+), 13 deletions(-)` (+67 = review.md, fix)  |

### Checklist

| Check                                      | Result                                                                                                                       |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| finding 1 closed                           | pass: line 41 is now `<span>{`(${counts[link.filter]})`}</span>`; `grep className` in the file → only nav (31) and link (37) |
| no test weakened after the red commit      | pass: `git log --first-parent --no-merges dc761e0..HEAD -- '*.test.*' e2e/` empty; no merges                                 |
| every changed file in `plan.md`            | pass: `todo-filter-nav.tsx` is a plan file; `check-plan-scope` OK                                                            |
| behaviour unchanged by the fix             | pass: the fix removes only the `className`; element, text and position are those AC-30.2–30.4 assert, all green              |
| would a test fail if the fix were reverted | no, and none is needed: a class is not a §30 criterion (round 1 said "no test change"); not a finding                        |

### Findings

None. Round 1 finding 1 is closed by f957cdd.

Verdict: ready for PR

Riskiest unfalsified: REQ-30.4 "created" still has no criterion (spec gap from the plan review), so a create path
that left the counts stale would pass every §30 test; the page-wiring revert (`filterCounts(shown)`) remains traced,
not run in e2e.
