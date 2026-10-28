SCOPE: all

# B1.3 review

## Plan review (round 1)

Reviewed: `backlog/work/B1.3/plan.md` at `63686be` (`Plan approved by: minh.ho2 (session reply "approve"), 2026-10-29`)
against §9 (`spec/contracts/07-clear-completed.md`, Tier quick, box `- [x] Lead approves spec (minh.ho2, 2026-10-29,
plan gate of B1.3)` ticked in the same commit per D-7), §5, §7, card B1.3, D-1..D-10, `advice.md`, `analysis.md`,
the tree and, run in this worktree on 2026-10-29: `pnpm test` (9 files, 55 passed), `check-features-map.sh` OK,
`check-spec-sections.sh` OK (1–9), `check-ac-coverage.sh` OK (§9 ✗, 3 criteria, none expected yet).

| Check                                                                             | pass / fail: reason                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: the four `src/` files (`lib/todos.ts`, `actions/todos.ts`, `components/clear-completed-button.tsx`, `app/page.tsx`) are exactly the four paths §9's Function contracts block names and the F7 row advice Q8 prescribes; F7 does not exist yet (`spec/features-map.md` ends at F6), so the plan adds it. `spec/features-map.md`, `spec/technical-requirements.md`, `docs/metrics.md` are the bookkeeping `backlog/CLAUDE.md` and dev-lead step 8 require; the five test files match advice's Test strategy table. |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: the three signatures are §9's contracts character for character (explicit return types, `readonly disabled`, kebab-case new file, `'use client'` only for the event); the one mutation is `clearCompletedTodosAction` in `src/actions` → one lib call → `revalidatePath('/')` → `ActionResult`; the only Prisma call is `deleteMany({ where: { completed: true } })` in `src/lib/todos.ts`, query builder, no raw SQL, no migration; the parse-free action is what §9 states ("no input to parse", advice Q3).   |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: Approach A with all six pinned decisions (one `deleteMany` returning `count`; unconditional revalidate implied by the three-step action line; the button the only new control, named by its text; `disabled` from the fetched `todos`, no second query; result ignored; nothing added to a `<li>`); skeleton with three throwing stubs and `page.tsx` untouched until green (advice Q9). Deviation not stated: test counts (note 1).                                                                             |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: §9 declares AC-9.1..AC-9.3 (3, the `quick` cap); every Then is an exact object, row list, count or enabled/disabled state; `grep -iw` of the banned list over the plan and §9 hits only the tier word `quick`.                                                                                                                                                                                                                                                                                                   |
| verification lists exact commands with expected numbers                           | pass: `verify-red.sh B1.3` → 0 new pass; `pnpm test` → 55 existing (verified: 55 passed) + new; `pnpm test:e2e` → `09-clear-completed.spec.ts` with the four named cases, `05`/`06`/`smoke` (9) unchanged; mutation ≥ 70 with the exact-argument kill named; the three CI guards. The new unit count is a range (`lib 2–3, actions 2, component 2–3`), not a sum; see note 1.                                                                                                                                          |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: `chore(todos): B1.3 skeleton` → `test(todos): B1.3 clear completed todos (red)` (matches `verify-red.sh`'s `^test\([^)]*\): B1\.3 .*\(red\)$`) → `feat(todos): B1.3 clear completed todos` → `reviewer` (diff). The map step is folded into step 3 ("F7 map row" in the green commit), which `spec/CLAUDE.md` ("moves with the code, same commit") allows and B1.2 did; no separate `docs(map): F7 … [B1.3]` subject (note 2).                                                                                   |
| the section's `Lead approves spec` box is ticked by a human (never by you)        | pass: `spec/contracts/07-clear-completed.md:5` reads `- [x] Lead approves spec (minh.ho2, 2026-10-29, plan gate of B1.3)`, written in `63686be` (`docs(backlog): B1.3 plan approved`) on the human's `approve` reply, the step D-7 names. Not ticked by me.                                                                                                                                                                                                                                                            |
| no settled D-n contradicted                                                       | pass: D-2 (one gate, present), D-4 (step 4 is the review gate), D-5 (titles untouched), D-6 (ids B1.3 / §9 / F7 only), D-7 (box ticked by the human's approve, checked here), D-10 (button rendered before the `todos.length === 0` ternary in both states, disabled not hidden).                                                                                                                                                                                                                                      |

Verdict: approved

Notes (none blocking; for the test-writer / code-writer and the diff review):

1. The plan's counts drop two tests advice.md pins. (a) Component: `ClearCompletedButton` is "disabled also while
   pending" (§9 contract) and components are not mutation-tested, so the only proof of `disabled || pending` is
   advice's component test (5) (deferred promise, `toBeDisabled()` while pending, `toBeEnabled()` after). Land it,
   or the clause ships unproven. (b) Action: `{ deleted: 0 }` still revalidates `/` once (advice's `deleted: 0`
   test) is what kills a `deleted > 0` guard mutant; the `db down` rethrow test is low value with no `try/catch`
   in the code but costs one test. Advice's full set is lib 2, actions 3, component 5, e2e 4 = 14 new; the diff
   review will take the red commit as the baseline either way.
2. `scripts/ci/check-features-map.sh` fails on any commit where `src/components/clear-completed-button.tsx` exists
   without an F7 row (skeleton, red); CI runs the guards on the PR head only, so folding the row into the green
   commit is safe. If the lead prefers the `backlog/CLAUDE.md` order, the subject is `docs(map): F7 clear completed
[B1.3]` right after `feat`.
3. The nested `src/lib/CLAUDE.md` (`todos.ts` row), `src/actions/CLAUDE.md` heading and `src/components/CLAUDE.md`
   are not in the Files list; advice names them as same-commit documentation. B1.2 left them untouched (last change
   `dfa5277`), so leaving them is the precedent; touching them without re-approval is a plan-mismatch at diff time.
   The module header comments (`// §5 …, §9 clear completed`) are inside listed files and `src/CLAUDE.md` requires them.
4. AC-9.3's seed order C (open), B (done), A (open) is display order (newest first): the e2e seeds explicit
   `createdAt` as `06-edit-title.spec.ts:21` does; the plan does not restate it. AC-9.1's "stored rows are exactly
   `[D, A]`" is proven only by the e2e `findMany` (three-row shape), as advice says; no fourth e2e is asked for.
5. The skeleton's `it.todo('AC-9.n: …')` stubs must all be replaced in the red commit (`verify-red.sh` reports
   "todo/skip only" as a failure); `ClearCompletedButton`'s stub must throw from render, not render a plain button
   (an AC-9.2 "enabled" test would be green before implementation).
6. `plan.md` is 53 lines against planning.md's "≈ 40"; the overrun is table-row length (one slice, four `src/`
   files), not scope, so it is not a split.
