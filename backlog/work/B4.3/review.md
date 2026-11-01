# B4.3 review

## Plan review (round 1)

Plan at `b9b939e` (`backlog/work/B4.3/plan.md`, 58 lines). Baselines run on this branch: `pnpm test` → `Tests  190
passed (190)`; `pnpm exec playwright test --list` → `Total: 35 tests in 13 files`. Both match the plan's "190 →" and
"35 →".

| Check                                                                             | Result                                                                                                                                                                                                                                                                                                |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: `todo-count.ts`, `remaining-count.tsx`, their two test files and `e2e/22-all-done.spec.ts` are F20 / §22 as the card (`_F20 · section 22_`) and the §22 Function contracts name them; the paperwork (`spec/features-map.md`, `docs/metrics.md`) is exempt in `check-plan-scope.sh`              |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | fail: reason 2 (`ALL_DONE_MESSAGE` is a second export where the §22 contract says "§22 adds one export"). Otherwise pass: explicit return types, `readonly` props, no `'use client'`, no action, no Prisma                                                                                            |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: Approach A, strict `count === 0`, bare `<span>`, no page change. Note: advice's "Doc drift" puts the F20 row in the orchestrator's batch-4 docs PR; the plan does it on the card (✗ skeleton, ✅ `docs(map)`), as the card's `_F20_` and B3.x precedent do. Not stated as a deviation; harmless |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: 7 criteria (AC-22.1 to 22.7), each Then is return values, role counts, exact texts or a navigation count of 0; no banned adjective found in `20-all-done.md`                                                                                                                                    |
| verification lists exact commands with expected numbers                           | fail: reason 1 (`scripts/verify-red.sh B4.3` exit 0 cannot hold with AC-22.3 green by design). Other numbers check out: 190 → 193 (+1 lib, +2 component), 35 → 39 (+4 e2e)                                                                                                                            |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: `chore(todos): B4.3 skeleton` → `test(todos): B4.3 … (red)` → `feat(todos): B4.3 …` → `docs(map): F20 … [B4.3]` → `docs(backlog): B4.3 review …`, same as B3.2/B3.3                                                                                                                             |
| the section has a `Lead approves spec` box, ticked only by a human (D-7)          | pass: `spec/contracts/20-all-done.md:5` `- [ ] Lead approves spec (lead, <date>)`, unticked; the plan says the lead's approval ticks it (D-7)                                                                                                                                                         |
| no settled D-n contradicted                                                       | pass: D-24 (UI only in `remaining-count.tsx`, no `page.tsx`, `todo-item.tsx`, `todo-search-form.tsx`, `todo-search.ts`, no package guide), D-22 (one approval), D-7 (approval box)                                                                                                                    |
| `scripts/next-task.sh --check B4.3` on the committed plan says no overlap         | pass: `[next-task] B4.3: no overlap with any Doing or Review card` (exit 0, run at `b9b939e`)                                                                                                                                                                                                         |

Verdict: changes requested

1. **The planned red gate cannot pass: AC-22.3 is green at the base, so `verify-red.sh B4.3` exits 1, not 0.**
   `scripts/verify-red.sh:15` passes only with "zero NEW tests passed"; a test is new when its title is absent from
   the base (parent of the first `(red)` commit, skeleton included). The plan keeps `remaining-count.tsx` unchanged in
   the skeleton and itself says "AC-22.3 and AC-22.7(b) pass by design", yet promises "`scripts/verify-red.sh B4.3`
   exit 0". Trigger: the test-writer adds `it('AC-22.3: …')` rendering counts 1, 2, 11 to
   `remaining-count.test.tsx` as the Files row says. Probe on a copy (skeleton `allDoneMessage` throwing, component
   unchanged, AC-22.2 and AC-22.3 as planned): `× AC-22.2 …`, `Tests  1 failed | 1 passed (2)`, the pass being
   AC-22.3, so verify-red prints `-> GREEN before implementation: AC-22.3: …` and exits 1 (same defect as B2.4 plan
   round 1). AC-22.7(b) is e2e, which verify-red lists and skips, so it is not affected.
   Fix, pick one and state it in the plan's Verification and the test-writer brief:
   (a) recommended, B1.11 precedent: AC-22.3 lands green in its own `test(todos): B4.3 pin AC-22.3 …` commit
   (no `(red)` marker) before the `(red)` commit, so its title is in the base; the red commit then carries AC-22.1,
   AC-22.2 and the 4 e2e; counts unchanged (193 / 39).
   (b) a skeleton stub that is wrong at every count without throwing from render (for example `allDoneMessage`
   returning the message for counts other than 0 and `undefined` at 0, rendered by the skeleton component): AC-22.1,
   22.2, 22.3 all red on an assertion and the AC-13.2 tests stay green; costs a deliberately inverted skeleton on the
   branch until `feat`.
   Throwing from `RemainingCount` in the skeleton is not an option: it turns the 3 AC-13.2 tests and the §13 e2e red
   at the skeleton commit.

2. **`ALL_DONE_MESSAGE` is an export the §22 contract does not have.** `spec/contracts/20-all-done.md` Function
   contracts: "§22 adds one export, countRemaining and remainingLabel are unchanged", and lists only
   `allDoneMessage`. Sections that want a constant exported list it in the block (`OVERDUE_LABEL` in
   `15-overdue.md:48`, `DUE_DATE_INVALID_MESSAGE` in `13-due-date.md:52`); spec-fidelity makes that block exact.
   Trigger: the plan's Interfaces line `export const ALL_DONE_MESSAGE = 'All done';`, implemented as planned, makes
   `todo-count.ts` export three names where the contract allows two plus one, and the diff review must then flag an
   interface outside the section. A second cost: if the AC-22.1 test asserts `toBe(ALL_DONE_MESSAGE)` instead of the
   literal, Stryker's string-literal mutant (`'All done'` → `""`) survives.
   Fix: keep the text a module-private `const` (or the literal) and drop `ALL_DONE_MESSAGE` from Files and
   Interfaces; AC-22.1 asserts the literal `'All done'`. Exporting it instead needs a `docs(spec): §22 …` commit
   before any test, which this card's `Spec: §22 — unchanged` line does not provide for.

Costs the lead accepts with an `approve` (stated so they are not found after):

1. **An empty list reads "0 items left", "No todos yet" and "All done" together** (REQ-22.5, analysis Q2). Silence on
   an empty list needs `src/app/page.tsx`, which D-24 rules out; it would take a new D-n and a card.
2. **The message sits 24px under the count, not beside it**: the span is its own child of the page's
   `flex flex-col gap-6` (advice Approach A cons). Spacing is out of scope in §22; changing it needs `page.tsx` or a
   wrapper (Approach B), both rejected.
3. **No live announcement**: the span has no `role="status"` / `aria-live` (§22 Out of scope), so a screen reader is
   not told when "All done" appears after a toggle.
4. **`src/lib/CLAUDE.md:15` still lists only `countRemaining`, `remainingLabel`** after this card; D-24 leaves the
   guide to the batch's own docs PR, which has not landed on this branch.

Notes (no change required): the plan is 58 lines against `planning.md`'s ≈ 40; the excess is the Verification
paragraph and table widths, the scope is one slice (2 `src/` files), so it is not a split. Verification's
"`allDoneMessage` 100 (`<= 0` mutant equivalent …)" is moot: Stryker's equality operator turns `===` into `!==`
only, it does not generate `<= 0`; 100 % on the function is the expected result either way.

## Plan review (round 2)

Plan at `359efed` (`backlog/work/B4.3/plan.md`, 61 lines). Round 1's two reasons are re-checked below against the
scripts and a probe; the other seven checks are unchanged from round 1 because only the Files, Interfaces,
Verification and Work breakdown text changed (`git show 359efed -- backlog/work/B4.3/plan.md`).

Probe (on a `git archive HEAD` copy in the scratchpad, no commits, the tree untouched): skeleton `allDoneMessage`
throwing `NotImplementedError`, `remaining-count.tsx` unchanged, AC-22.3 (counts 1, 2, 11) and AC-22.2 (count 0) added
to `remaining-count.test.tsx`, AC-22.1 (literal `'All done'`) added to `todo-count.test.ts`:
`Tests  2 failed | 12 passed (14)`. The 2 failures are AC-22.1 (`NotImplementedError: allDoneMessage is not
implemented`) and AC-22.2 (`Unable to find an element with the text: All done`). Neither message matches verify-red's
`IMPORT_ERROR` pattern. The 12 passes are the 8 `todo-count` tests, the 3 AC-13.2 tests and AC-22.3. With the planned
green (`const ALL_DONE = 'All done'` module-private, `count === 0 ? ALL_DONE : undefined`, fragment `<p>` + `<span>`):
`Tests  14 passed (14)`, eslint clean. The 3 AC-13.2 tests stay green unedited, and no e2e uses a whole-container
`toHaveText`/`textContent` that a new span would break (grep over `e2e/`, `src/`).

| Check                                                                             | Result                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: unchanged from round 1 (5 F20 / §22 files; paperwork exempt in `check-plan-scope.sh`)                                                                                                                                                                                                                                                                                                                                                                                     |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: round 1 reason 2 resolved. `ALL_DONE_MESSAGE` is gone from Files and Interfaces; `todo-count.ts` exports `countRemaining`, `remainingLabel` and `allDoneMessage` only, matching "§22 adds one export". The text is a module-private const and AC-22.1 asserts the literal, so Stryker's `'All done'` → `""` mutant is killed. Explicit return types, `readonly` props, no `'use client'`, no action, no Prisma                                                            |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: Approach A unchanged. The pin commit is a test-commit sequencing detail, not an approach deviation                                                                                                                                                                                                                                                                                                                                                                        |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: unchanged (7 criteria, `spec/contracts/20-all-done.md` untouched since round 1)                                                                                                                                                                                                                                                                                                                                                                                           |
| verification lists exact commands with expected numbers                           | pass: round 1 reason 1 resolved. verify-red's base is the parent of the first `(red)` commit (`scripts/verify-red.sh:63-66`), which is now the pin commit. AC-22.3's title is in the base copy of `remaining-count.test.tsx`, so `isNew` drops it (`verify-red.sh:97`); the only new tests are AC-22.1 and AC-22.2, both red on behavior in the probe → exit 0. Counts check out: pin 190 → 191, red +2 (191 → 193 at green), e2e 35 → 39 (+4, verify-red lists and skips them) |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: `chore(todos): B4.3 skeleton` → `test(todos): B4.3 pin AC-22.3 …` (no `(red)`, so `verify-red.sh` does not select it as a red commit) → `test(todos): B4.3 … (red)` → `feat(todos): B4.3 …` → `docs(map): F20 … [B4.3]` → `docs(backlog): B4.3 review …`. Same order as B1.11 (`dc3ba53` pin, then `58fe164` red)                                                                                                                                                         |
| the section has a `Lead approves spec` box, ticked only by a human (D-7)          | pass: `spec/contracts/20-all-done.md:5` `- [ ] Lead approves spec (lead, <date>)`, still unticked                                                                                                                                                                                                                                                                                                                                                                               |
| no settled D-n contradicted                                                       | pass: D-24 (no `page.tsx`, `todo-item.tsx`, `todo-search-form.tsx`, `todo-search.ts`, no package guide), D-22, D-7, as in round 1                                                                                                                                                                                                                                                                                                                                               |
| `scripts/next-task.sh --check B4.3` on the committed plan says no overlap         | pass: `[next-task] B4.3: no overlap with any Doing or Review card` (exit 0, run at `359efed`)                                                                                                                                                                                                                                                                                                                                                                                   |

Verdict: approved (ready for the lead's gate, not approved for build)

Costs the lead accepts with an `approve` (round 1's four, unchanged, plus one from the fix):

1. An empty list reads "0 items left", "No todos yet" and "All done" together (REQ-22.5). Removing the message there
   needs `page.tsx`, which D-24 rules out.
2. The message sits 24px under the count (its own child of the page's `flex flex-col gap-6`), not beside it.
3. No live announcement (no `role="status"` / `aria-live`, §22 Out of scope).
4. `src/lib/CLAUDE.md:15` still lists only `countRemaining` and `remainingLabel` after this card (D-24 leaves the
   guide to the batch's docs PR).
5. **AC-22.3 is never seen red.** It lands green in the pin commit, so no gate proves it can fail. Only the diff
   review's revert probe (render the span at count 1, 2 or 11 and expect AC-22.3 to fail) tests that. Also,
   `test-writer.md` has no "pin" mode (only red and `review pass N`), so the dev-lead's brief for step 2a has to say
   "no `(red)` marker, AC-22.3 only, green expected", as B1.11's brief did.

Notes (no change required): the plan is now 61 lines against `planning.md`'s ≈ 40. The excess is still the
Verification paragraph and table widths over one slice, so it does not need splitting. The skeleton stub needs
`void count;` (B3.1 precedent, `4c7f1c6`): an unused `_count` parameter fails `@typescript-eslint/no-unused-vars`
(probe). The `new-feature-slice` skill handles this, so the plan does not need to name it.
