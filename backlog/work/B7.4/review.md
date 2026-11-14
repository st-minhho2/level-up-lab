# B7.4 review

## Plan review (round 1)

Plan: `backlog/work/B7.4/plan.md` at `74b2fbc`. Spec: `spec/contracts/36-search-count.md` (§38). Scope: ui.

| Check                                                                             | Result                                                                                                                                                                                                                                                                                                                                  |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: `scripts/ci/plan-files.sh --file` gives 5 files; the two `src/` files are the ones §38's Function contracts name (`todo-search-form.tsx`, `page.tsx`); the unit test goes in the file the card's `Test:` line names; `e2e/38-search-count.spec.ts` is one file per section; F36 is the next id after F35 (D-37: F33–F38 in order) |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: one optional `readonly count?: number` prop, explicit `ReactNode` return, copied verbatim from §38's contract; no action, Zod schema, Prisma or `src/lib` change                                                                                                                                                                  |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: approach A; B rejected with the AC-38.3 reason advice gives; the advice's P1 doc drift (`src/components/CLAUDE.md`) is stated as out of this card                                                                                                                                                                                 |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: AC-38.1 to AC-38.7, each Then counts elements or quotes exact text                                                                                                                                                                                                                                                                |
| verification lists exact commands with expected numbers                           | pass: baseline `pnpm test` 298 passed (48 files), confirmed by running it here (`Tests  298 passed (298)`); 298 → 302; e2e +3; `verify-red.sh B7.4` exit 0. Notes 1 and 2 below                                                                                                                                                         |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: `chore(todos): B7.4 skeleton` → `test(todos): B7.4 pin …` → `test(todos): B7.4 … (red)` → `feat(todos)` → `docs(map): F36 … [B7.4]` → review; the green pin commit has precedent (B7.2 plan step 2) and carries no `(red)` marker                                                                                                 |
| the section has a `Lead approves spec` box, ticked only by a human                | pass: `36-search-count.md:5` `- [ ] Lead approves spec`, unticked; the plan leaves it to the lead                                                                                                                                                                                                                                       |
| no settled D-n contradicted                                                       | pass: D-37 names B7.4, section 38, `todo-search-form.tsx` with the count from `page.tsx`, F36; the §16 edits are in `14-search.md:59-66` (landed in `80c8129`); risk tier `scripts/agent/tier.sh` → `medium` (D-28), consistent with D-37                                                                                               |
| `scripts/next-task.sh --check B7.4` says no overlap                               | pass: `[next-task] B7.4: no overlap with any Doing or Review card` (exit 0)                                                                                                                                                                                                                                                             |

Non-blocking notes (for the builder, not reasons to re-plan):

1. Mutation line: `stryker.config` mutates only `src/lib/**/*.ts` and `src/actions/**/*.ts`, so the component mutants
   the plan lists (`=== 1`, `>= 1`, `isInteger`, `isSearchInEffect`, order) are not measured by `pnpm test:mutation`;
   with no `src/lib`/`src/actions` change `scripts/mutation-gate.sh` is expected to print "mutation: CI only, …". The
   diff review will check those mutants by hand on a probe copy.
2. e2e: "+3, all green" has no absolute baseline (B7.2's plan counted one); the diff review will count before/after.
3. Skeleton: destructuring an unused `count` may trip `no-unused-vars` in `pnpm lint`; the skeleton must stay lint-clean
   without rendering anything for `count`.

Costs the lead takes (already in the plan): the count is not announced (REQ-38.4, out of scope by §38), and the stale
`src/components/CLAUDE.md` line about `todo-search-form.tsx` stays stale after this card.

Verdict: approved

## Diff review (round 1)

Range `main...0b1d65b`: skeleton `2ec5b9d`, pin `7488f47`, red `8a8376e`, feat `171c703`, map `0b1d65b`. Scope: ui.

### Command results (run by the reviewer, last line of each)

| Command                             | Last line                                                                                    |
| ----------------------------------- | -------------------------------------------------------------------------------------------- |
| `pnpm lint`                         | `All matched files use Prettier code style!` (exit 0)                                        |
| `pnpm typecheck`                    | `> tsc --noEmit` (exit 0, no error)                                                          |
| `pnpm test`                         | `Tests  302 passed (302)` (48 files; plan: 298 → 302)                                        |
| `pnpm test:e2e`                     | `73 passed (2.9m)` (3 new tests in `e2e/38-search-count.spec.ts`, the only e2e file added)   |
| `scripts/mutation-gate.sh`          | `mutation: CI only, no src/lib or src/actions change` (component mutants probed by hand)     |
| `scripts/ci/check-suppressions.sh`  | `OK: no new suppressions`                                                                    |
| `scripts/ci/check-config-change.sh` | `OK: no protected config changed`                                                            |
| `scripts/ci/check-feat-commits.sh`  | `OK: no feat commit touches tests`                                                           |
| `scripts/ci/check-ac-coverage.sh`   | `OK: every criterion of a shipped section has a test`                                        |
| `scripts/ci/check-spec-sections.sh` | `OK: sections cited: 1 … 38 … 43`                                                            |
| `scripts/ci/check-features-map.sh`  | `OK`                                                                                         |
| `scripts/ci/check-plan-scope.sh`    | `OK: feat/B7.4-agent stays inside the approved plan of B7.4 (D-27 approval)`                 |
| `scripts/verify-red.sh B7.4`        | `RESULT: red for the right reason` (2 new unit tests failed on behavior; e2e skipped there)  |
| `git diff --stat main...HEAD`       | `10 files changed, 684 insertions(+), 5 deletions(-)` (4 are `backlog/work/B7.4/` artifacts) |

### Checklist

| Check                                                                            | Result                                                                                                                                                                                                                                         |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every AC-38.n has a test whose assertion matches its Then                        | pass: AC-38.1–38.4 in `todo-search-form.test.tsx`, AC-38.5–38.7 in `e2e/38-search-count.spec.ts`; each Then's counts, exact texts, last-child position, forbidden attributes and innerHTML equality are asserted as written                    |
| no test weakened after the red commit                                            | pass: `git log --first-parent --no-merges 8a8376e..HEAD -- '*.test.*' e2e/` empty; the `--merges --remerge-diff` form empty (no merges)                                                                                                        |
| pin and red commits touch only tests                                             | pass: `7488f47` and `8a8376e` change only the two test files; the pin's one deleted line is the `within` import widening                                                                                                                       |
| every changed file is in `plan.md`                                               | pass: the 5 planned files; `docs/metrics.md` is the plan's "Paperwork (exempt)" row; `check-plan-scope.sh` OK                                                                                                                                  |
| interfaces match the section's contracts                                         | pass: `count?: number` readonly prop, `ReactNode` return, `<p>{count === 1 ? '1 match' : \`${count} matches\`}</p>`as the form's last child;`page.tsx`passes`count={shown.length}`with`shown = searchTodos(filterTodos(todos, filter), query)` |
| Zod at every action boundary · Prisma only in `src/lib` · no raw SQL · migration | n/a: no action, `src/lib`, `prisma/` or query change                                                                                                                                                                                           |
| Server/Client boundary                                                           | pass: the form was already `'use client'`; the page stays a Server Component and passes a number                                                                                                                                               |
| no secret, no suppression                                                        | pass: `check-suppressions.sh` OK; no key or env value in the diff                                                                                                                                                                              |
| features map row moved                                                           | pass: F36 §38 ✅ added in `0b1d65b`                                                                                                                                                                                                            |
| every AC-16/21/25/27 unit test unchanged                                         | pass: the test-file diff is the `within` import plus an appended `describe` block; no existing line changed                                                                                                                                    |
| would a test fail if one changed line were reverted?                             | pass, probed on `$TMPDIR/probe` (table below)                                                                                                                                                                                                  |

Probe (copy of the worktree, one mutant at a time, original restored with `cp` after each):

| Mutant                                                                  | Result                                                                                                                                      |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| drop `isSearchInEffect(query) &&`                                       | killed by AC-38.3                                                                                                                           |
| drop `Number.isInteger(count) &&`                                       | killed by AC-38.3 (the 1.5 case)                                                                                                            |
| `count >= 1` → `count >= 0`                                             | killed by AC-38.3 (the 0 case)                                                                                                              |
| `count >= 1` → `count > 1`                                              | killed by AC-38.2                                                                                                                           |
| `count === 1` → `false` (always plural)                                 | killed by AC-38.2                                                                                                                           |
| `role="status"` on the `<p>`                                            | killed by AC-38.1                                                                                                                           |
| `aria-live="polite"` on the `<p>`                                       | killed by AC-38.1                                                                                                                           |
| drop `count !== undefined &&`                                           | survives vitest (16 passed) but `tsc` rejects it: `TS18048: 'count' is possibly 'undefined'`; not a shippable mutant, equivalent at runtime |
| `page.tsx` `count={todos.length}`                                       | killed by e2e AC-38.5 (`2 matches` expected 1, received 0) and AC-38.6                                                                      |
| `page.tsx` `count={filterTodos(todos, filter).length}` (search ignored) | killed by e2e AC-38.5 (line 110) and AC-38.6 (line 144)                                                                                     |

The paragraph-before-the-link order is pinned by AC-38.1's `landmark.lastChild` and `compareDocumentPosition` assertions.

On the three doubts the lead raised:

1. `count !== undefined` is a type narrowing; its removal is runtime-equivalent and caught by `pnpm typecheck`, as above.
2. AC-38.7's button names `/^Mark all complete( \(\d+\))?$/` and `/^Clear completed( \(\d+\))?$/`: the Then asks only
   that both are enabled; §32 and §36 append "(n)", so the optional suffix is faithful, and `toHaveCount(1)` on each
   locator rules out the pattern matching a second button. Not a weakening.
3. e2e AC-38.5 kills both wrong wirings of `page.tsx` (stored count and filter-only count), confirmed above.

Non-blocking note: the `docs/metrics.md` row ends in "this feat commit" where earlier rows carry a hash (B7.3:
`14defd1`); the closing PR can write `171c703`.

### Findings

None blocking.

Verdict: ready for PR

Riskiest unfalsified: no e2e asserts that the count paragraph sits inside the page's search landmark (AC-38.5 finds it
by text anywhere on the page); only the unit test AC-38.1 pins its placement, so a page that rendered a second count
outside `TodoSearchForm` would fail AC-38.5's count-of-1 but a page that moved it out would not be caught in e2e.
