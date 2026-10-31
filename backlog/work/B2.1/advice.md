# B2.1 advice

Read first: `analysis.md` is accurate against this worktree (HEAD `93894c4`). §12 (`spec/contracts/10-filter.md`)
already fixes the three lib signatures, the nav component signature and the `page.tsx` wiring, so most of this advice is
"follow the contract, here is what bites". Reference implementations: `src/components/clear-completed-button.tsx`
(the sibling that sits next to the nav) and `src/app/page.tsx`. No dependency, no migration, no change to
`src/lib/todos.ts` or `src/actions/todos.ts` (D-20 (a)).

## Approaches

### A. URL query parameter, pure lib module, server-rendered links (recommended; it is the §12 contract)

- Change: `src/lib/todo-filter.ts` (new, pure, `// §12`, no `server-only`, no Prisma): `TodoFilter`, `parseTodoFilter`,
  `filterTodos`, `emptyListMessage`. `src/components/todo-filter-nav.tsx` (new, no `'use client'`): `<nav aria-label="Filter
todos">` with three `next/link` `<Link>`s, `aria-current="page"` on the selected one only, no `<ul>`.
  `src/app/page.tsx`: `HomePage({ searchParams })`, `await searchParams`, render the nav between `<ClearCompletedButton />`
  and the list or empty text, in both states.
- Pros: state lives in the address, so reload and shared link work (REQ-12.6) with no client state and no hydration
  flash; the nav is plain anchors, so it works with JavaScript off and before hydration; nothing under `src/actions/`
  changes, and `revalidatePath('/')` keeps REQ-12.11 working (the refresh re-renders the current URL, query included;
  AC-12.6 proves it end to end); the lib module is pure, so mutation testing covers every branch with fast unit tests.
- Cons: `page.tsx` is edited (it is the batch-1 mount point this card holds); following a link drops any other query
  parameter (analysis Question 5, B2.5's problem); the filtering happens in memory over the whole list (REQ-12 says so;
  fine for a single-person list).
- Fits rules: yes. No mutation, no Prisma outside `src/lib`, no `'use client'` without state or events, constants and
  messages from §12.

### B. Client component holding the filter in `useState`, page passes every todo to a client list

- Change: a `'use client'` `TodoFilteredList` takes `todos`, owns `filter` state, and renders the nav as buttons and the
  list; `page.tsx` passes the full list.
- Pros: no `searchParams` in the page; instant switch with no server round trip.
- Cons: breaks REQ-12.5, REQ-12.6 and AC-12.5 (no `filter` parameter, a reload loses the view, no `href`s to assert);
  rewrites how `page.tsx` renders the list (a larger §7 change); buttons do nothing with JavaScript off or before
  hydration; moves the empty-state branch into a client component. Contradicts the spec, so it needs a `docs(spec)` change
  inside a new D-n first. Listed for completeness only.
- Fits rules: formally yes, but it is not the contract.

## Recommendation

A. It is what §12 prescribes; B would need a spec change and a ruling. The analysis's note that the lead's wording
suggested "a client filter component" is not authority: the §12 Function contracts say "no 'use client': links only".

Implementation notes that the spec leaves to the code:

- `parseTodoFilter(value)`: `value === 'active' ? 'active' : value === 'completed' ? 'completed' : 'all'`. A string
  comparison covers `undefined`, `''`, `'Active'`, `'bogus'` and the array case (`['active', 'completed']` is not
  `=== 'active'`), so no `Array.isArray` branch is needed and nothing can throw.
- `filterTodos`: `todos.filter(...)` returns a new array in input order and never mutates (`'all'` should still return a
  copy, `[...todos]` or `filter(() => true)`, because the contract says "returns a new array").
- `emptyListMessage(filter, totalCount)`: `totalCount === 0 || filter === 'all'` → `'No todos yet'`; else the filter's
  text. Mind `('all', 3)`.
- The nav takes the selected link's `aria-current` as `'page'` or `undefined` (never `"false"`): AC-12.4 asserts absence.
- `page.tsx`: `ClearCompletedButton` keeps `todos.some(...)` on the unfiltered list (REQ-12.10); the list is
  `filterTodos(todos, filter)`; the `<p>` is shown when that is empty, text `emptyListMessage(filter, todos.length)`.
  `searchParams` is a `Promise` in Next 15: `await` it. The `<p>` keeps its classes so the existing e2e text query holds.

## Impact

| File                                            | Add/Change | Signature                                                                                                                                                                                                                                                            | ACs                       |
| ----------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| `src/lib/todo-filter.ts`                        | Add        | `type TodoFilter`; `parseTodoFilter(value: string \| string[] \| undefined): TodoFilter`; `filterTodos<T extends { readonly completed: boolean }>(todos: readonly T[], filter: TodoFilter): T[]`; `emptyListMessage(filter: TodoFilter, totalCount: number): string` | AC-12.1, AC-12.2, AC-12.3 |
| `src/components/todo-filter-nav.tsx`            | Add        | `TodoFilterNav({ selected }: { readonly selected: TodoFilter }): ReactNode`                                                                                                                                                                                          | AC-12.4, AC-12.7          |
| `src/app/page.tsx`                              | Change     | `HomePage({ searchParams }: { searchParams: Promise<{ filter?: string \| string[] }> }): Promise<ReactNode>`                                                                                                                                                         | AC-12.5, AC-12.6, AC-12.7 |
| `src/lib/todo-filter.test.ts`                   | Add (red)  | unit tests                                                                                                                                                                                                                                                           | AC-12.1, AC-12.2, AC-12.3 |
| `src/components/todo-filter-nav.test.tsx`       | Add (red)  | component test                                                                                                                                                                                                                                                       | AC-12.4                   |
| `e2e/12-filter.spec.ts`                         | Add (red)  | Playwright, one file per section                                                                                                                                                                                                                                     | AC-12.5, AC-12.6, AC-12.7 |
| `spec/features-map.md`                          | Change     | new row F10 (§12): ✗ in the skeleton commit (guard needs every new module named), ✅ in `docs(map)`                                                                                                                                                                  | check-features-map        |
| `spec/technical-requirements.md`                | Change     | §12 status ✗ → ✅ at closing                                                                                                                                                                                                                                         | closing lane              |
| `src/lib/CLAUDE.md`, `src/components/CLAUDE.md` | Change     | one table row (`todo-filter.ts`, §12) and one line for the link-only nav                                                                                                                                                                                             | doc drift                 |

Client components the card changes: none. `ClearCompletedButton`, `TodoItem` and `TodoForm` are untouched, and
`TodoFilterNav` is a Server Component, so there is no client submit to compare.

| Component                         | Approach | Server-rendered markup                            | Submit/click with JS off                        | Before hydration                  |
| --------------------------------- | -------- | ------------------------------------------------- | ----------------------------------------------- | --------------------------------- |
| `TodoFilterNav` (new)             | A        | `<nav aria-label="Filter todos"><a href=...>` x 3 | link navigates, page re-renders filtered        | same, plain anchor                |
| `ClearCompletedButton` (existing) | A        | unchanged                                         | unchanged (button has no form, does nothing)    | unchanged (inert until hydration) |
| filtered list (new client, B)     | B        | `<button>`s inside a client list                  | does nothing (drops AC-12.5 reload and address) | does nothing until hydration      |

Behavior dropped by B (listed as cons above): shareable and reloadable view, working links without JavaScript.

## Risks

- Migration: none. Dependencies: none (`next/link` ships with Next).
- Security: `filter` is untrusted input, reduced to a three-value union by `parseTodoFilter` before use; it is never
  echoed into HTML or a query. The link `href`s are constants.
- Performance: the full list is already read per render; filtering in memory adds one pass. Unchanged query.
- Isolation: `src/app/page.tsx` is the only file shared with other Doing cards. B2.2 (remaining count, §13) also wants
  a line in `page.tsx`; per D-20 only one card holds it at a time, so B2.2 must wait for this card's merge or be
  rebased on it. Which list B2.2's count reads (unfiltered or filtered) is B2.2's analysis to settle, not §12's.
- `revalidatePath('/')` under a query string (REQ-12.11): Next re-renders the current route with its current search
  params, so the filter should survive a toggle or clear. AC-12.6 is the proof; if it fails the fix is in the page or
  actions, which needs a re-plan (it would touch `src/actions/todos.ts`, held by D-20).
- `next/link` in jsdom without a router context: renders a plain anchor in Next 15, so no mock should be needed; if it
  warns, mock `next/link` is not allowed by `testing.md` as a boundary, so prefer fixing the render over mocking.
- Existing tests that could turn red: `e2e/05-todos.spec.ts`, `e2e/09-clear-completed.spec.ts`,
  `e2e/10-mutation-feedback.spec.ts` query `getByRole('listitem')`, `getByText('No todos yet')` and the Clear button;
  the nav adds links, not list items, and keeps the empty text, so none should change. Component tests do not render
  `page.tsx`. The `<ul>` ban in the nav (REQ-12.1) is what protects the listitem counts.
- Mutation: `src/lib/todo-filter.ts` falls under Stryker's `src/lib/**/*.ts`; the whole file is pure, so the 70 % bar is
  met only if each ternary arm and each message has an exact assertion.
- Unticked approval box in §12: no test may be written before the lead ticks it (D-7); the plan gate's "approve" reply
  can tick it. See Question 3.

## Test strategy

| Layer     | File                                      | ACs                       | Mocks                                                                                                |
| --------- | ----------------------------------------- | ------------------------- | ---------------------------------------------------------------------------------------------------- |
| Unit      | `src/lib/todo-filter.test.ts`             | AC-12.1, AC-12.2, AC-12.3 | none (pure module; no `vi.mock`, it imports no Prisma)                                               |
| Component | `src/components/todo-filter-nav.test.tsx` | AC-12.4                   | none (links only; no actions module is imported)                                                     |
| e2e       | `e2e/12-filter.spec.ts`                   | AC-12.5, AC-12.6, AC-12.7 | none; seed through `PrismaClient` with explicit `createdAt` as `e2e/09-clear-completed.spec.ts` does |

Red reasons (`scripts/verify-red.sh B2.1`): the unit file fails on the skeleton's `NotImplementedError` (skeleton
`todo-filter.ts` with the three signatures throwing), the component test on the skeleton nav, the e2e on the missing
nav. The card's `Test:` line names `AC-12.1`'s title in `src/lib/todo-filter.test.ts`; keep that exact title.

Cases the tests must carry beyond the examples: AC-12.1 asserts the input array is unchanged after all three calls and
that `'all'` returns a different array instance; AC-12.2 each listed input including the array; AC-12.3 all six pairs;
AC-12.4 `'active'` then `'all'` renders, links by role and name, `queryAllByRole('listitem')` length 0,
`aria-current` absent (`not.toHaveAttribute`) on the other two; AC-12.7 three seeded states with 0 listitems each.

## Mutation hot spots

- `parseTodoFilter`: each of the two equality checks and the fallback (a mutant that returns `value` unchecked, or
  accepts `'Active'`); the array case needs an explicit assertion.
- `filterTodos`: the `completed` predicate negation for `'active'` versus `'completed'`; the `'all'` arm returning the
  same instance instead of a copy.
- `emptyListMessage`: `totalCount === 0` versus `> 0`, the `'all'` arm with `totalCount` 3, and the two literals.
- `TodoFilterNav` is outside Stryker's `mutate` globs; its `aria-current` branch is held by AC-12.4 and the e2e.

## Questions settled / escalated

Question: Where does the filter live (analysis Question 1)?
Class: P0 no conflict
Sources: spec/contracts/10-filter.md:25 "THE SYSTEM SHALL carry the selected filter in the `filter` query parameter"
Conflict: none
Verdict: The address, read through `searchParams` in the Server Component; §12 REQ-12.6 and the Function contracts fix it.
Next action: Implement Approach A.
Must not: Add client state or a cookie (REQ-12.6, Out of scope).
Doc drift: none
Escalate: none

Question: Server or client component for the three links (analysis Question 2; the lead's note said "client")?
Class: P0 no conflict (the note is not a source)
Sources: spec/contracts/10-filter.md:68 "// src/components/todo-filter-nav.tsx (no 'use client': links only, no state or events)"
Conflict: none (a request's wording versus the spec; the spec governs)
Verdict: No `'use client'`; the spec wins (authority 3) over any wording outside the authority list, and
`src/components/CLAUDE.md` reserves `'use client'` for state or events.
Next action: Write `todo-filter-nav.tsx` without the directive.
Must not: Add `'use client'` "to be safe".
Doc drift: none
Escalate: none

Question: Is the unticked approval box a blocker for the red test commit (analysis Question 7)?
Class: P6 needs a ruling only the human can give (an approval act, not a decision)
Sources: spec/contracts/10-filter.md:3 "- [ ] Lead approves spec (lead, <date>)"
Sources: backlog/00-decisions.md:17 "Spec approval is a human act: the lead ticks the section's `Lead approves spec` box; the plan gate's "approve" reply may tick it in the same step."
Conflict: none
Verdict: Not a conflict. D-7 says only the lead ticks it, and the plan's approval may tick it. No test is written
before it. No D-n is needed, only the tick in the plan-approval reply.
Next action: `dev-lead` asks for "approve" in the plan gate, then ticks the box in a `docs(spec)` commit.
Must not: Tick the box as the agent, or write the red tests before it is ticked.
Doc drift: `spec/contracts/10-filter.md` line 3 ticked, in the commit that follows approval and precedes the `test(...)` commit.
Escalate: none

Question: Empty-state wording, an unknown or repeated `filter` value, interplay with B2.5, and Clear completed while
Active is selected (analysis Questions 3 to 6)?
Class: P0 no conflict (each is now written into the spec)
Sources: spec/contracts/10-filter.md:29 "THE SYSTEM SHALL show \"No todos yet\" when no todo exists, otherwise \"No active todos\" under Active and \"No completed todos\" under Completed."
Sources: spec/contracts/10-filter.md:26 "its value is anything other than exactly `active` or `completed` (including a repeated parameter), THEN THE SYSTEM SHALL select All and report no error"
Sources: spec/contracts/10-filter.md:31 "enable \"Clear completed\" (§9) exactly when at least one stored todo is completed, whether or not that todo is shown"
Conflict: none
Verdict: §12 REQ-12.5, REQ-12.8 and REQ-12.10 settle them; B2.5's parameter is not guessed (links point to `/`,
`/?filter=...` only). Authority 3 (spec) governs the analysis's proposals.
Next action: Copy the literals from §12 into the tests and code.
Must not: Scope Clear completed to the visible rows, redirect on a bad value, or invent a `q` parameter.
Doc drift: none (B2.5's section extends REQ-12.6 in its own `docs(spec)` commit, under its own ruling)
Escalate: none

Question: When does the F10 row enter `spec/features-map.md`?
Class: P4 two sections collide (and P2 for the map: it has no F10 row)
Sources: scripts/ci/check-features-map.sh:3 "and every src/ module under lib/, actions/, components/ appears in some row."
Sources: scripts/ci/check-features-map.sh:2 "(✗ rows may name files that do not exist yet)"
Sources: backlog/CLAUDE.md:36 "`feat(<pkg>): B<e>.<n> …` → `docs(map): F<n> … [B<e>.<n>]`"
Sources: spec/CLAUDE.md:26 "any `src/` change that adds, moves or removes a feature"
Conflict: spec/CLAUDE.md says the map moves with the code in the same commit; backlog/CLAUDE.md puts `docs(map)` after
`feat(...)`. The guard also fails any commit that adds `src/lib/todo-filter.ts` or
`src/components/todo-filter-nav.tsx` (the skeleton) while no row names them.
Verdict: The guard is executable and decides the order: a ✗ F10 row naming the new files and tests must exist no
later than the skeleton commit; the `docs(map)` commit after `feat(...)` flips it to ✅ (backlog/CLAUDE.md
order). A ✗ row may name files not yet written, so it passes before the tests exist. The spec/CLAUDE.md
"same commit" is met by the ✗ row landing with the skeleton.
Next action: `dev-lead` puts the ✗ F10 row (files: `src/lib/todo-filter.ts`, `src/components/todo-filter-nav.tsx`,
`src/app/page.tsx`; tests: the three test files above) into the skeleton commit, then flips ✅ in
`docs(map): F10 … [B2.1]`. Whether the plan's Files list carries `spec/features-map.md` is the plan's call.
Must not: Leave the row to the end (the skeleton commit would fail `check-features-map.sh`), or mark it ✅ before the
tests are green (`check-ac-coverage.sh` would then demand every AC-12.n title).
Doc drift: `spec/features-map.md` (F10 ✗ in the skeleton commit, ✅ in `docs(map)`); `src/lib/CLAUDE.md` and
`src/components/CLAUDE.md` rows in the `feat(...)` or `docs(map)` commit; `spec/technical-requirements.md`
§12 ✗ → ✅ in the closing commit.
Escalate: none
