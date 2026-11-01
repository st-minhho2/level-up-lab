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
