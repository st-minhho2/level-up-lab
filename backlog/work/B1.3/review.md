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

## Diff review (round 1)

Reviewed: `da27244` (main, B1.2 done) → `0020322` skeleton → `74c5a3d` red → `db784ad` green (HEAD), against §9
(`spec/contracts/07-clear-completed.md`), §5 (`03-todos.md`), `plan.md` (approved 2026-10-29), `advice.md`, D-10,
`src/**/CLAUDE.md`. Stance: assumed wrong, probed on a copy under the scratchpad; the tree was not edited.

### Commands (run in this worktree, 2026-10-29; last line of each)

| Command                             | Last line                                                                                                                                                  |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                         | `All matched files use Prettier code style!` (eslint clean)                                                                                                |
| `pnpm typecheck`                    | exit 0, no output                                                                                                                                          |
| `pnpm test`                         | `Test Files  10 passed (10)` · `Tests  63 passed (63)`                                                                                                     |
| `pnpm test:e2e`                     | `12 passed (12.4s)` — 05 (3), 06 (4), 09 (3: AC-9.2 ×2, AC-9.3), smoke (2)                                                                                 |
| `pnpm test:mutation`                | `All files 82.22` (actions/todos.ts 86.36, lib 80.88; 13 survived, 3 no-coverage, all 16 on pre-existing §4/§5/§6/§7 lines; 0 in the §9 lines, see probes) |
| `scripts/ci/check-suppressions.sh`  | `OK: no new suppressions`                                                                                                                                  |
| `scripts/ci/check-config-change.sh` | `OK: no protected config changed`                                                                                                                          |
| `scripts/ci/check-feat-commits.sh`  | `OK: no feat commit touches tests`                                                                                                                         |
| `scripts/ci/check-ac-coverage.sh`   | `§9 criteria=3 covered=3` · `OK: every criterion of a shipped section has a test`                                                                          |
| `scripts/ci/check-spec-sections.sh` | `OK: sections cited: 1 2 3 4 5 6 7 8 9`                                                                                                                    |
| `scripts/ci/check-features-map.sh`  | `OK`                                                                                                                                                       |
| `scripts/verify-red.sh B1.3`        | `RESULT: red for the right reason` (actions 2 new failed / 0 passed; lib 2/0; component 4/0; e2e listed, skipped)                                          |
| `git diff --stat main...HEAD`       | `19 files changed, 835 insertions(+), 38 deletions(-)` (`main` = `da27244`)                                                                                |

Environment note, not a finding: my first `pnpm test:mutation` ran concurrently with `pnpm test:e2e`; Stryker's
TypeScript checker aborted with `TS6053 .next/types/app/page.ts not found` because `next dev` rewrote `.next/types`
(matched by `tsconfig.json`'s `.next/types/**/*.ts` include) while the sandbox was being copied. Re-run alone: exit
0, 82.22 % as above. Pre-existing configuration; nothing in this diff.

### Checklist

| Check                                                                    | Result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| every AC-9.n has a test whose assertion matches its Then                 | pass. AC-9.1: `src/actions/todos.test.ts:166` `toEqual({ ok: true, data: { deleted: 2 } })`, lib called once with `()`, `revalidatePath` once with `'/'`; the statement `src/lib/todos.test.ts:152` `toHaveBeenCalledWith({ where: { completed: true } })` + `toHaveBeenCalledTimes(1)`; "stored rows exactly [D, A]" is the e2e `findMany` at `e2e/09-clear-completed.spec.ts:77` (3-row shape, as the plan review note 4 accepted). AC-9.2: exactly one button (`getAllByRole('button')` length 1 at component lines 38/45; e2e `toHaveCount(1)` ×3), (a) disabled on empty and on open-only (e2e:32), (b) enabled with one completed (e2e:47). AC-9.3: e2e:56 asserts enabled before the click, `['C', 'A']` + both unchecked + disabled before and after `reload()`, then the database rows `[{C,false},{A,false}]`. |
| no test weakened after the red commit                                    | pass. `git diff 74c5a3d..HEAD -- '*.test.*' e2e/` is empty. No `skip`/`only`/`todo`/`fixme` under `src/` or `e2e/`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| every changed file is in `plan.md`                                       | pass. Skeleton: 3 stubs + 4 test files (plan step 1). Red: the 4 test files. Green: `src/lib/todos.ts`, `src/actions/todos.ts`, `src/components/clear-completed-button.tsx`, `src/app/page.tsx`, `spec/features-map.md`, `spec/technical-requirements.md`, `docs/metrics.md` — the plan's Files table, nothing more. Nested `src/**/CLAUDE.md` untouched (plan review note 3).                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| interfaces match §9 Function contracts                                   | pass, character for character: `clearCompletedTodos(): Promise<number>` (`src/lib/todos.ts:46`), `clearCompletedTodosAction(): Promise<ActionResult<{ deleted: number }>>` (`src/actions/todos.ts:68`), `ClearCompletedButton({ disabled }: { readonly disabled: boolean }): ReactNode` (`clear-completed-button.tsx:7`); `page.tsx:19` renders it after `<TodoForm />` and before the `todos.length === 0` ternary with `disabled={!todos.some((todo) => todo.completed)}` (D-10, REQ-9.5).                                                                                                                                                                                                                                                                                                                             |
| Zod at every action boundary                                             | pass (vacuous): the action takes no parameter, §9 says "no input to parse", advice Q3 settled it; the other three actions still parse.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Prisma only in `src/lib`; no raw SQL; migration reversible and indexed   | pass: the only new Prisma call is `prisma.todo.deleteMany({ where: { completed: true } })` in `src/lib/todos.ts:47`; no `$queryRaw`/`$executeRaw`; no migration, no schema change (`quick` tier).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| no secret, no suppression                                                | pass: `git diff da27244..HEAD -- src` adds no `console.`, `TODO`, `eslint-disable`, `@ts-*`, `process.env`; `check-suppressions.sh` OK.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| features map row moved                                                   | pass: F7 row (§9, the four files, the four test files, ✅) in the green commit; §9 ✗ → ✅ in `technical-requirements.md` as the plan listed; `check-features-map.sh` resolves every path.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| would any test fail if one changed line were reverted? (probe on a copy) | pass, 4 probes, each restored and the copy re-run green (29/29) afterwards: P1 `where: { completed: true }` → `{}` in lib → 2 lib tests fail (the data-loss mutant); P2 `revalidatePath('/')` deleted from the action → 2 action tests fail; P4 `disabled \|\| pending` → `disabled` → the pending component test fails; P5 the `await clearCompletedTodosAction()` replaced by `await Promise.resolve()` → 2 component tests fail. `page.tsx`'s `!todos.some(...)` is not mutation-tested; traced: dropping the `!` makes e2e:37/44 (`toBeDisabled` on empty/open-only) and e2e:53 (`toBeEnabled`) fail; swapping `some` for `every` makes e2e:53 fail (B done, A open).                                                                                                                                                |

### Author's three uncertainties (traced, none is a finding)

1. Result ignored / a rejected action inside `startTransition`: in React 19.1 an error thrown by the async function
   passed to `startTransition` is routed to the nearest error boundary, not left as an unhandled rejection; with no
   `src/app/error.tsx` that is Next's default boundary. `TodoItem.onToggle` (`todo-item.tsx:17`) takes the same
   path for a lib rejection (its `try/catch` arm rethrows non-`TodoNotFoundError`). §9 has no error criterion and
   advice Q6 pins "the component ignores the result"; consistent with the codebase. Named below as the riskiest
   unfalsified spot because no test covers it anywhere.
2. Server-computed `disabled`: `revalidatePath('/')` inside the action makes the action response carry the fresh
   RSC payload, which the router applies inside the same transition, so `pending` stays `true` until the new
   `disabled={true}` prop lands; no enabled flash by construction, and e2e:69 (`toBeDisabled()` after the click,
   before the reload) ran green. Honest. The stale second-tab button is §9 out of scope (deletes 0, REQ-9.7).
3. No `try/catch`: matches §9 ("the failure arm is never returned"), advice Q3 "Must not … add a try/catch that
   fabricates a failure arm", and `src/actions/CLAUDE.md` ("only unexpected errors are rethrown"): a Prisma failure
   is unexpected and propagates exactly as `toggleTodoAction`'s rethrow arm does.

### Findings

None. No input was found that makes the change behave other than §9 states.

### Notes (not blocking; for the dev-lead's disposition)

1. Test titles: `src/lib/todos.test.ts:163` and `src/actions/todos.test.ts:178` (the REQ-9.7 "nothing completed →
   0, still one statement / still revalidated" tests) start with `AC-9.1:` although §9 line 22 says REQ-9.7 has "no
   criterion" and advice Q7 says "Must not: give the REQ-9.7 test an `AC-9.n:` prefix"; likewise
   `clear-completed-button.test.tsx:49` labels the "disabled while pending" contract comment as `AC-9.2:`. The
   assertions are right and valuable (they kill the `deleted > 0` guard and the `|| pending` mutants); only the
   prefix overstates what AC-9.1/AC-9.2 say. Not a finding: nothing behaves differently, the plan did not pin
   titles, and `check-ac-coverage.sh` is unaffected. If the lead wants them aligned, it is a
   `test(todos): B1.3 review pass 1 -- …` rename, no `(red)` marker.
2. `src/lib/CLAUDE.md:10` still lists `todos.ts` as "§5, §6" with four functions (last change `dfa5277`); the
   plan left it out and the plan review (note 3) accepted the precedent. Doc drift only.
3. `spec/features-map.md:17` "Receipt: verified against `fc812e3`" is updated at close, as B1.2 did.

Verdict: ready for PR

Riskiest unfalsified: a clear whose Prisma call rejects (database down mid-click) surfaces through the transition
to Next's default error boundary with no §9 criterion and no test at any layer; it is the same path
`TodoItem.onToggle` already takes, so it is a codebase-wide gap, not a B1.3 regression.

## Dispositions (dev-lead, pass 1 of 3)

| Pass | #   | Finding (file:line)                                                                     | Source                          | Kind        | Disposition              | Justification                                                                                                    |
| ---- | --- | --------------------------------------------------------------------------------------- | ------------------------------- | ----------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| 1    | —   | a rejected clear/toggle inside a transition reaches the error boundary with no feedback | reviewer (riskiest unfalsified) | correctness | out of scope             | codebase-wide, no §9 criterion; tracked as card B1.4 "Feedback when a mutation fails"                            |
| 1    | —   | REQ-9.7 tests and the pending test carry `AC-9.1:` / `AC-9.2:` prefixes                 | reviewer note 1                 | coverage    | no change needed         | assertions correct; the prefixed tests still belong to those criteria's behavior; `check-ac-coverage` unaffected |
| 1    | —   | `src/lib/CLAUDE.md` todos row says "§5, §6"                                             | reviewer note 2                 | docs        | fix now (docs, next PR)  | nested CLAUDE.md is outside the plan's Files; updated with the closing commit                                    |
| 1    | —   | features-map receipt                                                                    | reviewer note 3                 | docs        | fix now (closing commit) | moved at card close, as for B1.2                                                                                 |

Re-verify: `pnpm test` 63 passed · `pnpm test:e2e` 12 passed · `pnpm test:mutation` 82.22 % · lint, typecheck green.
Passes used: 1/3. Gate cleared with `mark-reviewed.sh`.
