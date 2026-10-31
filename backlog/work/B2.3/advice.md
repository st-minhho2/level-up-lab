# B2.3 advice

Read first: §14 (`spec/contracts/12-complete-all.md`) already fixes every path, signature, message and the logger
member, and D-20 (a) fixes the batch-1 ownership rule (own modules; `src/app/page.tsx`, `src/lib/todos.ts`,
`src/actions/todos.ts` held by one Doing card at a time). So this file chooses nothing the spec chose; it settles the
module placement against the held files, the page-mount sequencing, the skeleton and red/green split, the test
boundary, and the two analysis questions the caller asked about. The `Lead approves spec` box under §14 is unticked
(`spec/contracts/12-complete-all.md:5`); per D-7 the plan gate's "approve" reply may tick it. Nothing was run: this
advice is read-only on `src/`, and the sibling plans were read from their worktrees, not changed.

## Approaches

### Approach A (recommended): own modules as §14 names them; two phases, the page mount after B2.1 merges

Phase A builds and proves everything that does not need `page.tsx`; phase B adds the one JSX line and the e2e once the
page is free. This is B2.2's shape (its plan, "Sequence (phase B)").

- Change, phase A: `src/lib/todo-complete-all.ts` (`completeAllTodos`), `src/actions/complete-all.ts`
  (`completeAllTodosAction`), `src/components/complete-all-button.tsx` (`CompleteAllButton`), and the one-member
  widening of `MutationActionName` in `src/lib/logger.ts`, each with its test file. `src/lib/todos.ts`,
  `src/actions/todos.ts`, `src/app/page.tsx` untouched, so `scripts/next-task.sh --check B2.3` finds no overlap with
  B2.1 (page.tsx) or B2.2 (todo-count, remaining-count).
- Change, phase B (after B2.1 is MERGED): `git merge origin/main`; amend `plan.md` with one `src/app/page.tsx` row and
  one `e2e/14-complete-all.spec.ts` row; lead re-approves as `docs(backlog): B2.3 plan round 2 approved`; red e2e
  (AC-14.6 fails on "no button named Mark all complete", an assertion); green mounts
  `<CompleteAllButton disabled={!todos.some((todo) => !todo.completed)} />` outside the list, in both states.
- Pros: the spec's own paths, so `check-spec-sections.sh`, the features map and `/spec-trace` agree; no held file
  touched while B2.1 and B2.2 are Doing; phase A is reviewable and mutation-testable on its own; the unit, action and
  component ACs (AC-14.1 to AC-14.5) are red and green without a browser.
- Cons: AC-14.6 and the card's "done" wait for B2.1's merge, so the card holds its WIP slot (PR draft until phase B is
  green, as B2.2); two plan approvals; B2.2's phase B and B2.3's phase B both edit `page.tsx` and both add a row to
  the same index and features-map tables, so the second to merge resolves adjacent-line conflicts.
- Fits rules: yes. Invariant 1 (a module per §14), 3 (mutation only in the Server Action, no input so no Zod step,
  `ActionResult`), 4 (Prisma only in `src/lib`), 2 (red e2e before the page feat; the phase-B `feat` touches no test).

### Approach B (rejected): put the lib function in `src/lib/todos.ts` and the action in `src/actions/todos.ts`, mount now

- Change: `completeAllTodos` next to `clearCompletedTodos`, the action next to `clearCompletedTodosAction`, the page
  line added now on top of B2.1's work.
- Pros: one fewer module pair; the closest imitation of §9; the card would finish in one phase.
- Cons: contradicts §14's Function contracts, which name `src/lib/todo-complete-all.ts` and
  `src/actions/complete-all.ts`, and AC-14.2 and AC-14.4 mock `@/lib/todo-complete-all` and `@/actions/complete-all`
  (spec wins on behavior and signatures, `spec-fidelity.md`); takes the two held shared files while B2.1 holds
  `page.tsx` and a later card may need `todos.ts`, so `next-task.sh --check` reports an overlap and the lead has to
  serialize the batch (D-20 (a) was chosen to avoid exactly that); the `todos.test.ts` and `actions/todos.test.ts`
  files grow, and their existing mocks (`vi.mock('@/lib/todos')` with a fixed key set) would need a new key, a change
  to tests that prove the "Unchanged behavior" rows.
- Fits rules: it breaks no invariant, but it breaks the spec's paths and D-20 (a); not allowed without a D-n.

### Component, two ways of wiring the click (inside Approach A)

| Wiring                                                                      | Server-rendered markup today / after                                                                                                                  | JavaScript off                                                        | Submit before hydration                                       |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------- |
| A. `<button type="button" onClick>` + `useTransition` (as `ClearCompleted`) | today: no such component; after: `<div><button type="button" [disabled]>Mark all complete</button></div>`, no `<p role="alert">` until a failed click | the button is inert (no form, no handler); same as "Clear completed"  | the click is lost (no handler yet); same as "Clear completed" |
| B. `<form action={completeAllTodosAction}>` with a submit button            | after: `<form><button type="submit">…</button></form>`                                                                                                | would submit and mutate without JavaScript, then show no failure text | a submit works once the action reference is posted            |

- Recommended wiring A. B drops AC-14.4's "the action is called once with 0 arguments" and the contract line
  "calls completeAllTodosAction in a transition" (a form action receives `FormData`, and its result cannot feed the
  alert beside the button without `useActionState`, a different signature), and it diverges from the sibling clear
  button the spec points at. Listed as the con of B; no `Unchanged behavior` row moves.

## Recommendation

Approach A with wiring A. Concretely: phase A in the order skeleton, red, green, then phase B as a second red and
green on `page.tsx` + `e2e/14-complete-all.spec.ts`.

Sequencing against the siblings (the caller's question):

- B2.3 owns no held file in phase A, so it runs in parallel with B2.1 and B2.2 now. It never needs `todos.ts` or
  `actions/todos.ts`: §14's contract names its own modules and the lib/action tests mock them, not the shared ones.
- Phase B waits for B2.1 to be MERGED (B2.1 in Review still holds the page; `next-task.sh --check` counts Review).
  Do not mount early "to save a phase": the line is trivial but the e2e (AC-14.6) must be red on the merged page and
  the plan-scope hook rejects a file outside the approved Files list.
- B2.2's phase B and B2.3's phase B are two one-line edits to the same JSX region. Let the card whose phase A reaches
  Review first take the page first; the second runs `--check` after the first merges, then rebases. Suggest placing
  the button directly after `<ClearCompletedButton …/>` (both are list-wide controls, `self-start` wrapper, same
  column), leaving the count and the filter nav to their cards; the placement is the mounting card's choice per §14.
- Index/map: keep the §14 index row `✗` through phase A (`check-ac-coverage.sh` expects tests for `✅` and `◐` rows and
  AC-14.6 has no test until phase B); flip to `✅` in the closing commit. The F12 map row (status `✗`, with the three
  modules) lands in the skeleton so `check-features-map.sh` stays green on each push; test files and `page.tsx` join
  the row at the `docs(map)` commit.

## Impact

| File                                                                     | Add/Change | Signature                                                                                                                        | ACs                        |
| ------------------------------------------------------------------------ | ---------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| `src/lib/todo-complete-all.ts`                                           | Add        | `export function completeAllTodos(): Promise<number>` (`import { prisma } from '@/lib/prisma'`, one `updateMany`, returns count) | AC-14.1, REQ-14.7          |
| `src/lib/todo-complete-all.test.ts`                                      | Add        | node; `vi.mock('@/lib/prisma')`; AC-14.1 and the REQ-14.7 `count: 0` test                                                        | AC-14.1                    |
| `src/actions/complete-all.ts`                                            | Add        | `export async function completeAllTodosAction(): Promise<ActionResult<{ updated: number }>>`                                     | AC-14.2, AC-14.3           |
| `src/actions/complete-all.test.ts`                                       | Add        | node; `vi.mock('@/lib/todo-complete-all')`, `vi.mock('next/cache')`, `vi.mock('@/lib/logger')`                                   | AC-14.2, AC-14.3, REQ-14.8 |
| `src/lib/logger.ts`                                                      | Change     | `MutationActionName` gains `'completeAllTodosAction'` (type only, no runtime change)                                             | AC-14.3                    |
| `src/components/complete-all-button.tsx`                                 | Add        | `export function CompleteAllButton({ disabled }: { readonly disabled: boolean }): ReactNode` (`'use client'`)                    | AC-14.4, AC-14.5           |
| `src/components/complete-all-button.test.tsx`                            | Add        | jsdom; `vi.hoisted` actions object, `vi.mock('@/actions/complete-all', ...)`                                                     | AC-14.4, AC-14.5           |
| `src/app/page.tsx` (phase B only)                                        | Change     | `<CompleteAllButton disabled={!todos.some((todo) => !todo.completed)} />` + import                                               | AC-14.6                    |
| `e2e/14-complete-all.spec.ts` (phase B)                                  | Add        | Playwright; seed through `PrismaClient` as `e2e/09`, `seedInDisplayOrder`                                                        | AC-14.6                    |
| `spec/features-map.md`, `spec/technical-requirements.md`                 | Change     | F12 row (`✗` then `✅`), §14 row `✗` then `✅`                                                                                   | map, index                 |
| `src/lib/CLAUDE.md`, `src/actions/CLAUDE.md`, `src/components/CLAUDE.md` | Change     | one row or line each; the actions guide's "four actions" sentence gains the fifth                                                | docs                       |
| `docs/metrics.md`                                                        | Change     | per-card row B2.3                                                                                                                | metrics                    |

Client component `CompleteAllButton` (new; no existing component changes): see the wiring table above; with
JavaScript off and before hydration the button is inert, identical to `ClearCompletedButton` today; the approach
drops nothing that exists. `ClearCompletedButton`, `TodoItem`, `TodoForm` are untouched.

Shape of the bodies (spec-exact, for the red and green writers):

```ts
// src/lib/todo-complete-all.ts
export async function completeAllTodos(): Promise<number> {
  const { count } = await prisma.todo.updateMany({ where: { completed: false }, data: { completed: true } });
  return count;
}
// src/actions/complete-all.ts: try { const updated = await completeAllTodos(); revalidatePath('/');
//   return { ok: true, data: { updated } }; } catch (error) { logMutationFailure('completeAllTodosAction', error);
//   return failure('form', MUTATION_FAILED_MESSAGE); }   (no Zod step, no TodoNotFoundError arm)
```

## Risks

- Migration: none (no schema change; `updateMany` on existing columns). `@updatedAt` bumps for the touched rows only;
  the list order is `createdAt desc`, unaffected (REQ-14.2).
- Security: no input crosses the boundary, so nothing to parse or inject; the `where` is a literal. The action is
  unauthenticated like every other action here (single-person app, §1). The failure result never carries the thrown
  text; the logger's redaction is §11's, unchanged.
- Performance: one statement. No index on `completed` is added (a schema change the spec does not ask for, and the
  table is one person's list); the existing `createdAt` index still serves the list.
- Isolation: no env key, port or path; nothing stateful hard-coded (invariant 5).
- Existing tests that could turn red: none in phase A. After the type widening, `src/actions/todos.test.ts` and
  `src/lib/logger.test.ts` still compile (they only use the existing members). In phase B, e2e `05`, `06`, `09`, `10`
  locate buttons by exact name (`Add`, `Edit title`, `Save`, `Clear completed`), none by `/complete/`, so the new
  button does not collide; `toHaveCount` calls are on named locators.
- Gap in the spec's criteria: REQ-14.8 says a throw from `revalidatePath` also resolves to the form failure and is
  logged (the Function contracts line says it too), but AC-14.3 exercises only the lib rejection (AC-11.5 covered the
  `revalidatePath` case for `createTodoAction`; §14 has no twin). An unprefixed test is allowed
  (`testing.md`: no criterion, no prefix, like the REQ-14.7 lib test); without it a mutant that moves `revalidatePath`
  outside the `try` survives. Not a spec change.
- Merge friction: `spec/technical-requirements.md` and `spec/features-map.md` (adjacent rows) and `page.tsx` (phase B)
  conflict trivially with B2.1/B2.2; resolve in the second PR, rows in numeric order.
- Dependencies: none proposed.

## Test strategy

| Layer     | File                                          | ACs                        | Mocks                                                                                                                                                                                                                                                                                          |
| --------- | --------------------------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| unit      | `src/lib/todo-complete-all.test.ts`           | AC-14.1; REQ-14.7 (no AC)  | `@/lib/prisma` with `todo: { updateMany, findMany, update, … }` all `vi.fn`; assert `updateMany` once with exactly the contract object and the others 0 calls                                                                                                                                  |
| unit      | `src/actions/complete-all.test.ts`            | AC-14.2, AC-14.3; REQ-14.8 | `@/lib/todo-complete-all`, `next/cache`, `@/lib/logger` (typed `vi.fn<(action: MutationActionName, error: unknown) => void>()`); extra case: `revalidatePath` throws `new Error('cache down')` (title `REQ-14.8: …`, no AC prefix) and `JSON.stringify(result)` omits `db down` / `cache down` |
| component | `src/components/complete-all-button.test.tsx` | AC-14.4, AC-14.5           | `@/actions/complete-all` through a `vi.hoisted` object; a hand-settled deferred promise for the pending state                                                                                                                                                                                  |
| e2e       | `e2e/14-complete-all.spec.ts` (phase B)       | AC-14.6                    | none; real server and database, seeded in display order C (open), B (done), A (open)                                                                                                                                                                                                           |

Red proof: skeleton stubs throw `NotImplementedError` (lib, action, component render), so every phase-A test fails on
that or an assertion; the logger widening is type-only and goes in the skeleton so the red tests typecheck. Phase B red:
AC-14.6 fails because the page has no such button (an assertion on the empty-list case (a), then (b)).

`pnpm test` count: 115 existing unchanged plus the new tests (AC-14.1 one or two, AC-14.2, AC-14.3 plus the
`revalidatePath` case, AC-14.4 two, AC-14.5 one). Counts to be fixed by the plan, not here.

## Mutation hot spots

- `where: { completed: false }` and `data: { completed: true }` (object-literal, boolean-literal, `ObjectLiteral`
  mutants): killed only by asserting the whole argument with `toEqual`/`toMatchObject`, as AC-14.1 states; the
  `count: 0` test also pins the scope.
- `return count` (destructure vs the whole result) and `{ updated }` key name/value (AC-14.2 exact result).
- `revalidatePath('/')` string and its position inside the `try` (needs the `cache down` case; the AC-14.2 once-call
  assertion kills the call-count mutant); `logMutationFailure` called before `return` and with exactly two arguments in
  that order (`toHaveBeenCalledWith('completeAllTodosAction', error)` plus `toHaveBeenCalledTimes(1)`).
- Component: `disabled || pending` (a `&&` mutant needs case (a) disabled with nothing pending and case (b) pending
  with `disabled=false`), `result.ok ? undefined : result.fieldErrors.form?.[0]` (success must clear a prior alert:
  the second click in AC-14.5), the `error !== undefined` guard, and the alert being the button's next sibling in one
  wrapper (assert same parent and order).
- The module header strings and the `'use server'` / `'use client'` directives are not mutants; the component file is
  outside Stryker's `src/lib` + `src/actions` scope, so its score rests on the AC-14.4/14.5 tests alone.

## Questions settled / escalated

```
Question:    Does B2.3 hold src/lib/todos.ts and src/actions/todos.ts, or its own modules?
Class:       P0 no conflict
Sources:     spec/contracts/12-complete-all.md:55 "// src/lib/todo-complete-all.ts (§14); Prisma only through '@/lib/prisma'"
             backlog/00-decisions.md:40 "each card keeps its logic in its own modules (e.g. `src/lib/todo-filter.ts`, `src/lib/todo-count.ts`, `src/actions/complete-all.ts`)"
Conflict:    none
Verdict:     Own modules. §14's Function contracts (level 3) name the paths and AC-14.2/14.4 mock them; D-20 (a) (level 2)
             says the same and reserves the shared files for one Doing card at a time.
Next action: Plan lists only the §14 modules in phase A; no row for todos.ts or actions/todos.ts.
Must not:    Add the function beside clearCompletedTodos "for symmetry".
Doc drift:   none
Escalate:    none
```

```
Question:    When may the page mount happen, given B2.1 holds src/app/page.tsx and B2.2 defers to a phase B?
Class:       P0 no conflict
Sources:     backlog/00-decisions.md:40 "the shared mount points `src/app/page.tsx`, `src/lib/todos.ts`, `src/actions/todos.ts` are held by one Doing card at a time (`next-task.sh --check`)"
             spec/contracts/12-complete-all.md:59 "where it sits among the other controls is the mounting card's choice"
Conflict:    none
Verdict:     Phase B, after B2.1 is MERGED, with a round-2 plan approval adding the page and e2e rows; same rule as B2.2.
             The spec fixes what the page renders, not when; D-20 (a) fixes who may hold the file.
Next action: Write plan.md with phase A files only plus a "Sequence (phase B)" section modeled on B2.2's.
Must not:    Edit page.tsx in phase A, or list it in the approved Files before B2.1 merges.
Doc drift:   none
Escalate:    none
```

```
Question:    Analysis Q1: may §14's function contracts widen MutationActionName in src/lib/logger.ts without a D-n and without editing §11?
Class:       P4 two sections collide (letter only: §11's exact union block lists four members, §14 adds a fifth)
Sources:     spec/contracts/12-complete-all.md:57 "// src/lib/logger.ts (§11): the union MutationActionName gains one member, 'completeAllTodosAction'; no other change to §11"
             spec/contracts/09-logging.md:50 "'createTodoAction' | 'toggleTodoAction' | 'updateTodoTitleAction' | 'clearCompletedTodosAction';"
             backlog/00-decisions.md:40 "A remaining-items count and \"mark all complete\" need no ruling."
Conflict:    §11 block says the union has four members and REQ-11.1 / AC-11.5 enumerate four actions / §14 says it gains a fifth
             and REQ-14.8 requires the fifth log entry. REQ-11.1 says "WHEN [one of four] resolves ... SHALL write", it does
             not say "only these"; §11's Out of scope excludes entries for expected failures and successes, not for a new
             action. So no behavior collides; only the type block reads stale.
Verdict:     Widen it, in the skeleton, type-only. The logger is typed by the union, so REQ-14.8 cannot be met otherwise;
             §14 states the change itself and is additive. Both sections sit at level 3 and §14 is the newer, more specific
             text for its own action; D-20 grants no ruling for this card. The lead's plan-gate approval (D-7) ticks §14's
             spec box, which includes this line, and is the human act that covers it. Rewriting §11/§10 prose ("four
             controls", the union block) would be a `docs(spec)` commit inside a D-n (`spec-fidelity.md`); this card does
             not need it and must not do it.
Next action: Skeleton commit widens the union; plan states "§11 text untouched, widening per §14".
Must not:    Edit 09-logging.md or 08-mutation-feedback.md in this card, or add a runtime change to logger.ts.
Doc drift:   `/spec-trace` after merge will show §11's union block (four members) against the code (five); expected,
             covered by §14. If the lead wants the drift gone, a later `docs(spec): §11 …` commit under a D-n (not this PR);
             `src/actions/CLAUDE.md` "four actions" sentence changes in B2.3's green commit.
Escalate:    none
```

```
Question:    Analysis Q2: is the button's `disabled` computed from the unfiltered list once B2.1 filters the view?
Class:       P2 spec silent (on the filtered view), with REQ-14.4/14.5 and the Out of scope line pointing one way
Sources:     spec/contracts/12-complete-all.md:17 "WHILE at least one todo is not completed THE SYSTEM SHALL show a button named \"Mark all complete\" that is enabled."
             spec/contracts/12-complete-all.md:59 "<CompleteAllButton disabled={!todos.some((todo) => !todo.completed)} />"
             spec/contracts/12-complete-all.md:67 "marking only the todos in a filtered or searched view"
Conflict:    none (B2.1's filtered list is a view of `todos`; §14 reads every stored todo)
Verdict:     Unfiltered. REQ-14.4/14.5 say "todos" with no view qualifier, REQ-14.1 acts on every non-completed todo (the
             `updateMany` has no filter), and filtering is out of scope; a disabled state derived from a filtered view would
             disable the button in "Completed" while open todos exist, contradicting REQ-14.4. In "Completed" with only open
             todos stored the button is enabled and the visible list is empty; that is the spec's behavior, not a bug.
             Same variable as the clear button and, in §13, the count (REQ-13.5): the full `listTodos()` array.
Next action: Phase B plan names the argument: the array returned by `listTodos()`, not `filterTodos(...)`. Diff review
             check: `git grep -n "some((todo) => !todo.completed)" src/app/` names the unfiltered variable.
Must not:    Pass B2.1's filtered array, or rename B2.1's `todos` binding to make the expression compile.
Doc drift:   none (the analysis already proposes this; no spec text changes)
Escalate:    none
```

```
Question:    Does AC-14.6 need the page mount inside the same card, and what does the §14 index row show meanwhile?
Class:       P0 no conflict
Sources:     scripts/ci/check-ac-coverage.sh:14 "case \"$status\" in ✅*|◐*) ;; *) echo \"[check-ac-coverage] §$n: $status, no tests expected yet ($total criteria)\"; continue ;; esac"
             backlog/plan/E2-todos-plus.md:37 "- **Acceptance:** AC-14.1–AC-14.6"
Conflict:    none
Verdict:     Yes: the card's Acceptance includes AC-14.6, which is a browser criterion on `/`; the card closes at phase B.
             Keep the index row `✗` until then so the guard does not demand AC-14.6 in phase A.
Next action: Plan: draft PR through phase A; `✅` flip with the closing commit; e2e file `e2e/14-complete-all.spec.ts`
             (analysis Q4, section number as `05`, `06`, `09`, `10`).
Must not:    Mark the §14 row `◐` or `✅` in phase A, or split AC-14.6 into another card without the lead.
Doc drift:   none
Escalate:    none
```

SETTLED (this file): 5. ESCALATED: none.
