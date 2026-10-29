# B1.4 review

## Plan review (round 1)

SCOPE: all

Reviewed: `backlog/work/B1.4/plan.md` at `f5f53fe` (`Plan approved by: lead (session reply "approve"), 2026-10-29`)
against §10 (`spec/contracts/08-mutation-feedback.md`, Tier quick, box `- [x] Lead approves spec (lead, 2026-10-29,
plan gate of B1.4)` ticked in the same commit per D-7), §9 as edited by `f1149ea` (`docs(spec): §9 failure arm
follows §10 (D-11)`), §5, §6, card B1.4, D-1..D-11, `analysis.md` (no `advice.md`: see row 3), the four `src/`
files and three test files the plan names, `scripts/verify-red.sh`, the four role hook scopes, and, run in this
worktree on 2026-10-29: `pnpm test` (10 files, 63 passed), `check-features-map.sh` OK, `check-spec-sections.sh` OK
(1–10), `check-ac-coverage.sh` OK (§10 ✗, 3 criteria, none expected yet). Probe on a copy under the scratchpad
(six candidate AC-10 tests against the current code): see note 1.

| Check                                                                             | pass / fail: reason                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| every file in the plan belongs to the section's features (map)                    | pass: the four `src/` files (`lib/action-result.ts`, `actions/todos.ts`, `components/todo-item.tsx`, `components/clear-completed-button.tsx`) are exactly the four paths §10's Function contracts block names; each already sits in a map row (F4–F7) and F8 does not exist yet (the map ends at F7), so the plan adds it. `src/actions/CLAUDE.md` is inside the code-writer's `src/*` scope and names the rule that changes. `spec/features-map.md`, `spec/technical-requirements.md`, `docs/metrics.md` are the bookkeeping dev-lead step 8 requires (who may write the index: note 3). The three test files are the ones the AC-10.n Then cells point at; no e2e file, consistent with §10 Out of scope and analysis Q5.                                                    |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: `export const MUTATION_FAILED_MESSAGE = 'Could not save, try again' as const` is a string literal type with an explicit type in §10's block; the three action signatures are unchanged and stay `'use server'`: Zod parse → one lib call → `revalidatePath('/')` → `ActionResult`, now with the failure arm `failure('form', …)` and no rethrow (§10, D-11); `src/lib/todos.ts` and Prisma are untouched (no query, no migration, no raw SQL); the components keep `'use client'` for the transition and state only; props unchanged (`{ readonly todo }`, `{ readonly disabled }`); no `any`, no enum, kebab-case files.                                                                                                                                                |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: no `advice.md`; the plan states the deviation ("Advisor skipped (quick tier, no new query; the design is fixed by §10's function contracts)"), which is dev-lead step 2's own rule ("Tier `quick`: skip unless the section touches `src/lib/todos.ts` queries"); §10 touches none, and `analysis.md` Q1 already weighed the only design alternative (catch in each component, option B) and D-11 settled it as A. Acceptable: the one open design choice was ruled by a human, not guessed.                                                                                                                                                                                                                                                                              |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: §10 declares AC-10.1..AC-10.3 (3, the `quick` cap); every Then is an exact object, a call count (`revalidatePath` 0 times, lib once), an element count with role `alert` (1 / 0), an exact text, a DOM position (inside the row's `<li>`; same parent as the button and after it), a checkbox state or a text box value (`Walk the cat`); `grep -iw` of the banned list over the plan and §10 hits only the tier word `quick`.                                                                                                                                                                                                                                                                                                                                           |
| verification lists exact commands with expected numbers                           | pass: `verify-red.sh B1.4` → 0 new pass (the rewritten tests carry new `AC-10.1:` titles, so verify-red counts them as new); `pnpm test` → 63 (verified: 63 passed) − 2 + 8 = 69, the sum matches the breakdown (actions 3, todo-item 3, button 2); `pnpm test:e2e` → 12 unchanged; mutation ≥ 70; the three CI guards. Two inaccuracies, neither blocking: the breakdown "todo-item 3 (a/b/c), button 2" cannot all be red (note 1) and the named survivors `actions:22/38` are not lines this card changes (note 4).                                                                                                                                                                                                                                                         |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: no skeleton, with the reason stated ("every function and component exists"), and the red tests can fail on behaviour without one: `toggleTodoAction`/`updateTodoTitleAction` rethrow (probe P5: `promise rejected "Error: db down" instead of resolving`; P6: `clearCompletedTodosAction` throws `db down`), `TodoItem` shows `Could not update the todo` (P1 fails on the text), `ClearCompletedButton` renders no alert (P3 fails on the count). `test(todos): B1.4 feedback when a mutation fails (red)` matches verify-red's `^test\([^)]*\): B1\.4 .*\(red\)$`; `feat(todos): B1.4 …`; map folded into the green commit as B1.2/B1.3 did (`spec/CLAUDE.md`: "moves with the code, same commit"); step 3 is the diff review. The one new export has no stub: note 2. |
| the section's `Lead approves spec` box is ticked by a human (never by you)        | pass: `spec/contracts/08-mutation-feedback.md:6` reads `- [x] Lead approves spec (lead, 2026-10-29, plan gate of B1.4)`, written in `f5f53fe` (`docs(backlog): B1.4 plan approved`, the human's account) on the `approve` reply, the step D-7 names. Not ticked by me.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| no settled D-n contradicted                                                       | pass: D-2/D-7 (one gate, box and `Plan approved by:` line present), D-4 (step 3 is the review gate), D-5 (title limits and §6 messages untouched: Save reads `title` first), D-6 (ids B1.4 / §10 / F8 only), D-10 (the wrapper `<div>` still renders exactly one button named "Clear completed", disabled while nothing is completed; `page.tsx` untouched), D-11 followed to the letter (`form` key, exact message, no revalidation, create path left for B1.5).                                                                                                                                                                                                                                                                                                              |

Rewriting the two pinned tests ("rethrows a non-TodoNotFoundError from the lib (review: instanceof arm)",
`src/actions/todos.test.ts:88` and `:156`) in the red commit is legitimate under `testing.md` ("change the spec
first"): D-11 (`e1c795f`) and the `docs(spec): §9` clause edit (`f1149ea`) both precede the plan; §5 and §6 text never
stated the rethrow; §7 already said actions never throw to the client; the two tests carry no `AC-` prefix, so no
criterion loses its proof, and D-11's consequence column names this exact rewrite. It is a replacement with a
stricter contract (resolve to an exact object, 0 revalidations, lib called once), not a loosened assertion.

Verdict: approved

Notes (none blocking; for the test-writer, the code-writer and the diff review):

1. Red step, confirmed by probe: a standalone REQ-10.5 test is green at the base. P2 ("toggle failure then success
   leaves 0 alerts in the row") and P4 ("clear failure then success leaves 0 alerts, button enabled") both pass
   against the current code, because `TodoItem` already clears its error on success and `ClearCompletedButton`
   never renders an alert. `verify-red.sh` would report them as "GREEN before implementation" and exit 1. The
   recovery assertions of AC-10.2 (c) and AC-10.3 must live inside a test that first asserts exactly 1 alert with
   the exact text `Could not save, try again` (red on the text / the count), then recovers. `testing.md`'s "one
   behavior per test" does not apply here: (c) is the second half of AC-10.2's Then, not a behaviour of its own.
   The counts then become todo-item 2, button 1–2, `pnpm test` 67–68; the diff review takes the red commit as the
   baseline either way.
2. `MUTATION_FAILED_MESSAGE` does not exist at the base and there is no skeleton. The red tests must use the
   literal `'Could not save, try again'` (which is what every Then cell states), never import the constant: an
   import would resolve to `undefined` under Vitest (red for the wrong reason, `fieldErrors.form: [undefined]`) and
   fail `pnpm typecheck` at the red commit. The `.resolves.toEqual(…)` form (P5) fails on an assertion; a plain
   `await` (P6) fails on the thrown `db down`, which verify-red also accepts but reads worse.
3. Step 2 assigns "§10 ✅" (the index flip in `spec/technical-requirements.md`) to the code-writer, whose Edit/Write
   hook allows `src/*`, `prisma/*`, `spec/features-map.md`, `docs/metrics.md` only; dev-lead's allows `backlog/*`
   and the two `docs/` files. B1.3's green commit `db784ad` nonetheless contains the flip, so a path outside both
   hooks was used. `backlog/CLAUDE.md` ("Closing a card", step 3) places that flip in the closing commit, with the
   card's status line, not in the green commit. Not a plan defect in direction, but the plan should name the
   writer and the commit; otherwise the diff review will see a file outside both scopes. `check-ac-coverage.sh`
   needs the three `AC-10.n:` titles before the flip, which the red commit provides.
4. "previous survivors at actions:22/38 should die": line 22 is `createTodoAction`'s
   `typeof rawTitle === 'string' ? rawTitle : ''` (create path, out of scope until B1.5) and line 38 is toggle's
   `revalidatePath('/')`, whose only mutant AC-5.4 does not kill is the `'/'` argument (AC-5.4 asserts the count,
   not the argument). Neither line changes in this card, so the new catch arms will not kill them [unverified: no
   Stryker run; the line locations are confirmed]. The new tests do add kills (the `instanceof` arm and the
   `failure('form', …)` literal), so ≥ 70 is not at risk (B1.3: actions 86.4).
5. Spec hygiene outside this plan: `f1149ea` put `per §10 (D-11)` into §9's function-contract comment, but
   `spec/CLAUDE.md` says a section states the current rule only, "no D-n citations in the text". §10 itself cites
   no D-n. A `docs(spec): §9 …` follow-up can drop the parenthesis; I do not edit the spec.
6. `src/actions/CLAUDE.md` after the change must still say that `createTodoAction` rethrows (D-11 leaves it to
   B1.5); the plan's "→ the D-11 rule" should not read as if all four actions catch. The §9 header comment in
   `src/actions/todos.ts:66` ("no failure arm") is inside a listed file and changes with it.
7. `plan.md` is 53 lines against planning.md's "≈ 40", the same length as B1.3's; the overrun is table-row width,
   not scope, so it is not a split.

Rounds: 1
