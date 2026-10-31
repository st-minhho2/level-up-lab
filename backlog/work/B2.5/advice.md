# B2.5 advice

Read first: §16 (`spec/contracts/14-search.md`) already fixes every path, signature, constant and message, and D-20 (a)
fixes the ownership rule (own modules; `src/app/page.tsx`, `src/lib/todos.ts`, `src/actions/todos.ts` held by one Doing
card at a time). So this file chooses nothing the spec chose; it settles the module placement against the held files,
the page-mount sequencing, the `TITLE_MAX_LENGTH` import, the red/green split, and the test boundary per AC. The
`Lead approves spec` box under §16 is unticked (`spec/contracts/14-search.md:5`); per D-7 the plan gate's "approve"
reply may tick it. Nothing was run: this advice is read-only on `src/`.

What is and is not visible of B2.4 (read through the shared git object store, because `origin/feat/B2.4-due-date` does
not exist: the branch is local to its worktree and was not pushed): `feat/B2.4-due-date` holds two commits on `main`
(`docs(spec): section 15 …`, `docs(backlog): B2.4 spec and test lines`). It has **no `backlog/work/B2.4/plan.md`**, so
its Files list, the thing `scripts/next-task.sh --check` compares, does not exist yet and the overlap cannot be
computed. What is visible is its `analysis.md` design notes (lines 28 to 42): B2.4 touches `src/lib/todos.ts`,
`src/actions/todos.ts`, `src/lib/logger.ts`, `src/components/todo-item.tsx`, `prisma/`, and adds
`src/lib/todo-due-date.ts` and `src/components/todo-due-date.tsx`; it states that `src/app/page.tsx` and
`src/lib/todo-schema.ts` are **not** touched. That is intent from an analysis, not a plan, and it differs from the
brief ("holds `page.tsx` and `todo-schema.ts`"). The advice below treats the brief as the rule (the two files are
held) and says what changes if B2.4's plan confirms its analysis.

## Approaches

### Approach A (recommended): own modules as §16 names them; two phases, the page mount after B2.4 is MERGED

Phase A builds and proves everything that does not need `page.tsx`; phase B adds the page wiring and the e2e once the
page is free. Same shape as B2.2 and B2.3.

- Change, phase A: `src/lib/todo-search.ts` (`SEARCH_QUERY_MAX_LENGTH`, `parseSearchQuery`, `searchTodos`,
  `searchEmptyMessage`), `src/components/todo-search-form.tsx` (`TodoSearchForm`, a Server Component), and their two test
  files. `src/lib/todos.ts`, `todo-schema.ts`, `actions/todos.ts`, `page.tsx` and `prisma/` untouched (§16 says the
  first three never change).
- Change, phase B (after B2.4 is MERGED): `git merge origin/main`; amend `plan.md` with a `src/app/page.tsx` row, an
  `e2e/16-search.spec.ts` row and the guide lines; the lead re-approves as `docs(backlog): B2.5 plan round 2 approved`;
  red e2e (AC-16.6 fails on "no search landmark", an assertion), then the green mounts the form and chains
  `searchTodos(filterTodos(todos, filter), query)`.
- Pros: the spec's own paths, so `check-spec-sections.sh`, the features map and `/spec-trace` agree; no held file is
  touched while B2.4 is Doing; phase A is reviewable and mutation-testable alone; AC-16.1 to AC-16.5 turn red then green
  without a browser or a database; a red e2e is never pushed on a branch whose page cannot yet satisfy it, so CI stays
  green (draft PR until phase B).
- Cons: AC-16.6 and AC-16.7 and the card's "done" wait for B2.4's merge, so B2.5 holds its WIP slot; two plan
  approvals; `spec/technical-requirements.md`, `spec/features-map.md` and `docs/metrics.md` (adjacent rows F13/F14,
  §15/§16) conflict trivially with B2.4: the second PR to merge resolves them, rows in numeric order.
- Fits rules: yes. Invariant 1 (a module per §16), 2 (red before each `feat`, the phase-B `feat` touches no test),
  3 and 4 (no mutation, no Prisma: this card adds neither), 5 (no stateful value; `action="/"` is the route, not a port).

### Approach B (alternative): one phase, mount now on top of `main`

- Change: everything of A, plus the `page.tsx` edit and `e2e/16-search.spec.ts`, in one pass before B2.4 merges.
- Pros: one plan approval; the card finishes in one phase; if B2.4's analysis is right (`page.tsx` untouched) the
  3-way merge is clean, because B2.4 only changes `Todo`'s shape, which `searchTodos<T extends { title }>` carries
  through unchanged.
- Cons: takes a file the lead named as held, on the strength of an analysis rather than a plan
  (`next-task.sh --check B2.5` cannot answer until B2.4's plan exists, and B2.5's Files list would contain
  `src/app/page.tsx`); if B2.4's plan adds a `page.tsx` row after all, the later plan has to be re-approved; the e2e
  would run against a schema B2.4 is about to change (the `Todo` shape and the row markup).
- Fits rules: breaks no invariant. Allowed only if `scripts/next-task.sh --check B2.5` reports no overlap once B2.4's
  plan is on its branch; otherwise it contradicts the brief and D-20 (a). The lead decides at the plan gate; A is the
  default.

### The `TITLE_MAX_LENGTH` import (inside A and B), two ways

| Way                                                                        | Change                                                     | Pros                                                                                             | Cons                                                                                                                                         |
| -------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 (recommended): `export const SEARCH_QUERY_MAX_LENGTH = TITLE_MAX_LENGTH` | one `import { TITLE_MAX_LENGTH } from '@/lib/todo-schema'` | spec says "the value of `TITLE_MAX_LENGTH` … one definition" (`14-search.md` Function contracts) | couples to a file B2.4 may edit; the import drags `zod` into the module (pure, still no `server-only`, still client-importable)              |
| 2 (rejected): `export const SEARCH_QUERY_MAX_LENGTH = 200`, a literal      | none                                                       | no coupling                                                                                      | a second definition of the limit, contradicting §16 and `src/CLAUDE.md` ("named module-level values taken from the section"), D-5 drift risk |

Way 1 is safe against B2.4: the analysis keeps `todo-schema.ts` untouched (the due-date schema lives in
`todo-due-date.ts`), and the import reads one exported constant, no edit. Guard against a later move with an unprefixed
test (see Test strategy): `SEARCH_QUERY_MAX_LENGTH` equals the real `TITLE_MAX_LENGTH`, with `@/lib/todo-schema` not
mocked. If B2.4 or a later card renames or moves the constant, that test and `pnpm typecheck` fail in the same PR, not
at runtime.

### Component wiring (`TodoSearchForm`), per the brief's markup question

`TodoSearchForm` is new and is not a client component (§16: "no `'use client'`: a native GET form"). No existing client
component changes (`TodoForm`, `TodoItem`, `ClearCompletedButton`, `CompleteAllButton`, `TodoFilterNav` are untouched).

| Wiring                                                                   | Server-rendered markup today / after                                                                                                                                                                                  | JavaScript off                                                    | Submit before hydration                             |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------- |
| A (recommended): native `<form role="search" method="get" action="/">`   | today: no such element; after: `<form role="search" method="get" action="/"><label …>Search todos</label><input type="search" name="q" …><button type="submit">Search</button></form>` (+ hidden `filter` unless All) | works: a full GET navigation to `/?q=…` (and `filter=…`)          | works: the form is native, no handler is needed     |
| B (rejected): `'use client'` form with `useRouter().push` or `next/form` | after: same elements, plus a handler                                                                                                                                                                                  | the submit would be inert unless the form keeps `action`/`method` | lost or a full navigation, depending on the handler |

B drops the JavaScript-off and before-hydration behavior that A has for free, adds a client bundle for no state, and
`next/form` is expressly out of scope (`14-search.md` Out of scope). Listed as the con of B; no "Unchanged behavior" row
moves. Two markup details for the writers: the label needs an `id`/`htmlFor` pair, use a literal id (`search-todos`) as
`TodoForm` does with `new-todo`; and the search box is `type="search"`, role `searchbox`, so it never collides with
`getByRole('textbox', { name: 'New todo' | 'Edit title' })` in `e2e/05`, `e2e/06`, and the button name "Search" collides
with no existing button name (`Add`, `Edit title`, `Save`, `Clear completed`, `Mark all complete`, B2.4's `Edit due date`
and `Update due date`).

## Recommendation

Approach A, TITLE_MAX_LENGTH Way 1, component wiring A. Order in phase A: skeleton (`todo-search.ts` and
`todo-search-form.tsx` throwing `NotImplementedError`, F14 row in `spec/features-map.md` with `✗`), `test(...)` red
commit (`scripts/verify-red.sh B2.5` on the card's AC-16.2 title), `feat(...)` green, no test file touched. Then phase B
as a second red and green.

Sequencing against B2.4 (the brief's question):

- Phase A owns no held file, so it runs now in parallel. It reads `src/lib/todo-schema.ts` (import only).
- Phase B starts when B2.4 is MERGED (Review still holds the page per `next-task.sh --check`), or earlier only if
  B2.4's plan, once written, lists no `src/app/page.tsx` and no `src/lib/todo-schema.ts` and `--check B2.5` is clean.
  Do not mount early to "save a phase" without that proof; the plan-scope hook rejects a file outside the approved
  Files list.
- The e2e is written in phase B, not red now. This departs from the proposal in `analysis.md` question 8 (e2e written
  red now) and follows B2.3's precedent: the card's `Test:` line is a lib test, so `verify-red.sh` is not blocked, and a
  pushed red e2e would turn CI red for the whole waiting period. It also lets the seed helper be written against
  the merged schema (see due date below). Phase B red has no script proof (`verify-red.sh` skips e2e): record
  `pnpm test:e2e e2e/16-search.spec.ts` → N failed in the red commit body.
- Index and map: keep the §16 index row `✗` through phase A (`check-ac-coverage.sh` demands a test for every AC of a
  `✅` or `◐` row, and AC-16.6 and AC-16.7 have none until phase B); flip to `✅` in the closing commit. The F14 map row
  (`✗`, the two modules) lands in the skeleton so `check-features-map.sh` stays green; tests and `page.tsx` join the
  row at the `docs(map)` commit.
- Package guides (`src/lib/CLAUDE.md`, `src/components/CLAUDE.md`): B2.4 will certainly add rows to both (new
  `todo-due-date.ts`, `todo-due-date.tsx`), and B2.4's plan is not visible, so edit them only in phase B or the
  closing commit, one adjacent row each, resolving the conflict in the second PR.

How section 15's due date rendering touches the page mount (the brief's question):

- Typing: `searchTodos<T extends { readonly title: string }>` returns `T[]`, so B2.4's `Todo` (gaining
  `dueDate?: string`) flows through `TodoItem` unchanged; the mount is `searchTodos(filterTodos(todos, filter), query)`.
  The phase-A tests must use their own minimal literals (`{ id, title }`), never the `Todo` type, so they compile
  before and after B2.4 lands.
- Markup: B2.4 puts `<TodoDueDate>` inside each `<li>`; with no due date it adds no text (REQ-15.5) but one icon
  button `Edit due date` per row. §16's e2e (AC-16.6, AC-16.7) asserts `listitem` text, which stays `D`, `C`, … for
  rows seeded with no due date, and counts `listitem` elements (the search form and its button are not list items).
  Seed with `prisma.todo.create({ data: { title, completed, createdAt } })` as `e2e/14` does, setting no `dueDate`
  (the column is nullable, §15). Titles are searched, never due dates (§16 Out of scope), so a `Due 2026-…` text never
  matches a query.
- No row-level interaction: the search chain is in `page.tsx`, the due date is in `TodoItem`; neither reads the other.
- Merge: if B2.4's plan does touch `page.tsx`, expect an adjacent-line conflict around the `shown` assignment and the
  imports; the second card to merge resolves it.

## Impact

| File                                                     | Add/Change | Signature                                                                                                                                                                                                                                                                                                       | ACs                                            |
| -------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `src/lib/todo-search.ts`                                 | Add (A)    | `SEARCH_QUERY_MAX_LENGTH`; `parseSearchQuery(value: string \| string[] \| undefined): string`; `searchTodos<T extends { readonly title: string }>(todos: readonly T[], query: string): T[]`; `searchEmptyMessage(filter: TodoFilter, totalCount: number, query: string): string`                                | AC-16.1, AC-16.2, AC-16.3, AC-16.4             |
| `src/lib/todo-search.test.ts`                            | Add (A)    | node, no mocks; imports the real `@/lib/todo-filter` and `@/lib/todo-schema`                                                                                                                                                                                                                                    | AC-16.1 to AC-16.4, REQ-16.5 length guard      |
| `src/components/todo-search-form.tsx`                    | Add (A)    | `TodoSearchForm({ filter, query }: { readonly filter: TodoFilter; readonly query: string }): ReactNode`, no `'use client'`                                                                                                                                                                                      | AC-16.5                                        |
| `src/components/todo-search-form.test.tsx`               | Add (A)    | jsdom, Testing Library, no mocks                                                                                                                                                                                                                                                                                | AC-16.5                                        |
| `src/app/page.tsx`                                       | Change (B) | `searchParams: Promise<{ filter?: string \| string[]; q?: string \| string[] }>`; `parseSearchQuery(params.q)`; `shown = searchTodos(filterTodos(todos, filter), query)`; `<TodoSearchForm filter={filter} query={query} />`; empty `<p>` = `searchEmptyMessage(filter, todos.length, query)`; header names §16 | AC-16.6, AC-16.7, REQ-16.1, REQ-16.8, REQ-16.9 |
| `e2e/16-search.spec.ts`                                  | Add (B)    | Playwright; `PrismaClient` seed in display order as `e2e/14`; `openHydrated` helper                                                                                                                                                                                                                             | AC-16.6, AC-16.7                               |
| `spec/features-map.md`, `spec/technical-requirements.md` | Change     | F14 row (`✗` in the skeleton, completed at `docs(map)`); §16 index row `✗` then `✅`                                                                                                                                                                                                                            | map, index                                     |
| `src/lib/CLAUDE.md`, `src/components/CLAUDE.md`          | Change (B) | one row each: `todo-search.ts` (§16, pure), `todo-search-form.tsx` (§16, no `'use client'`: native GET form)                                                                                                                                                                                                    | docs                                           |
| `docs/metrics.md`                                        | Change     | per-card row B2.5                                                                                                                                                                                                                                                                                               | metrics                                        |

Client components the card changes: none (the one new component is a Server Component). Markup of `TodoSearchForm` today
versus after, JavaScript off and before hydration: see the wiring table above; the form submits in both. The page
today renders no search element and no hidden `filter` input; after phase B it renders one `search` landmark outside
the list in both states. Nothing existing is dropped: the filter links keep `/`, `/?filter=active`,
`/?filter=completed`, so following one drops `q` (REQ-16.7).

Shape of the bodies (spec-exact, for the writers):

```ts
// src/lib/todo-search.ts  // §16
export const SEARCH_QUERY_MAX_LENGTH: number = TITLE_MAX_LENGTH;
export function parseSearchQuery(value: string | string[] | undefined): string {
  return typeof value === 'string' ? value.trim() : '';
}
export function searchTodos<T extends { readonly title: string }>(todos: readonly T[], query: string): T[] {
  const needle = query.trim().toLowerCase();
  return todos.filter((todo) => todo.title.toLowerCase().includes(needle)); // '' matches every title: no shortcut branch
}
export function searchEmptyMessage(filter: TodoFilter, totalCount: number, query: string): string {
  if (totalCount === 0) return 'No todos yet'; // or emptyListMessage(filter, 0), same text
  return query.trim() !== '' ? 'No todos match your search' : emptyListMessage(filter, totalCount);
}
```

Writing `searchTodos` without a `query === ''` early return is deliberate: `includes('')` is true for every title and
`filter` already returns a new array, so the early return would be an equivalent mutant (see hot spots). The 201
characters case needs no code: no title exceeds 200, so `includes` is false (REQ-16.5).

## Risks

- Migration: none (no schema change, no Prisma call).
- Security: no mutation, no database access; the query is compared in memory as plain text (no `RegExp`, no `LIKE`), so
  no pattern or injection surface. React escapes the echoed value (`defaultValue`). The query is never logged. No auth
  change (single-person app, §1).
- Performance: one extra in-memory filter over the list `listTodos()` already returns; the cost is proportional to the
  list size, which §5 does not bound but a one-person list keeps small. No index, no change to the `createdAt desc`
  read. The input `maxLength` 200 bounds the typed query; a hand-typed address is bounded by the URL.
- Isolation: no env key, port, path or cache prefix (invariant 5); `action="/"` is the page route.
- Stale box after a soft navigation (to verify in the AC-16.6 e2e, no code change planned): `defaultValue` on an
  already-mounted uncontrolled input does not rewrite text the person typed. In the spec's flow the box is not dirty
  when "Active" is clicked (the previous step was a full GET navigation), so it reads empty as AC-16.6 requires. If the
  e2e shows otherwise, the green fix is `key={query}` on the `<input>`, markup unchanged.
- Empty submit address: `/?q=` and `/?filter=active&q=` are accepted (REQ-16.4); the form stays usable.
- Existing tests that the change could turn red: none in phase A (no existing file edited). In phase B,
  `e2e/05-todos.spec.ts` AC-5.7 and `e2e/12-filter.spec.ts` assert "No todos yet" and filter texts through the new
  `searchEmptyMessage`; with `q` absent it returns `emptyListMessage(filter, total)` unchanged, which is also what the
  unit AC-16.4 cases `('active', 3, '')` pin. No existing e2e uses an unnamed `getByRole('textbox')`, `'button'` or
  `getByRole('search')` (grepped), so the new search box and button collide with none. `e2e/10-mutation-feedback`
  counts `role="alert"`; the search form adds none.
- Held-file merge friction: as listed under A's cons; `page.tsx` only if B2.4's plan adds it.
- Dependencies: none proposed. `zod` is already a dependency; the import only pulls it into `todo-search.ts`'s graph.

## Test strategy

| Layer                      | File                                       | ACs                          | Mocks                                                                                          | Phase |
| -------------------------- | ------------------------------------------ | ---------------------------- | ---------------------------------------------------------------------------------------------- | ----- |
| Unit (node)                | `src/lib/todo-search.test.ts`              | AC-16.1                      | none (pure)                                                                                    | A     |
| Unit (node)                | `src/lib/todo-search.test.ts`              | AC-16.2 (the card's `Test:`) | none; fresh `{ id, title }` literals, not the `Todo` type                                      | A     |
| Unit (node)                | `src/lib/todo-search.test.ts`              | AC-16.3                      | none                                                                                           | A     |
| Unit (node)                | `src/lib/todo-search.test.ts`              | AC-16.4                      | none (real `emptyListMessage` from `@/lib/todo-filter`)                                        | A     |
| Unit (node), no AC prefix  | `src/lib/todo-search.test.ts`              | REQ-16.5, D-5                | none; `SEARCH_QUERY_MAX_LENGTH` equals the real `TITLE_MAX_LENGTH` and is 200                  | A     |
| Component (jsdom)          | `src/components/todo-search-form.test.tsx` | AC-16.5 (two renders)        | none: a server component with no action import                                                 | A     |
| E2E (Playwright, one file) | `e2e/16-search.spec.ts`                    | AC-16.6                      | none; real page, Prisma seed D open, C done, B open, A done                                    | B     |
| E2E (Playwright, one file) | `e2e/16-search.spec.ts`                    | AC-16.7                      | none; `openHydrated` before retitle and "Mark all complete"; assert stored rows through Prisma | B     |

Per-AC notes:

- AC-16.1 one test, table of inputs; assert exact strings, `''` for `[]`, a 201-character query returned unchanged
  (`toHaveLength(201)`), and `expect(() => …).not.toThrow()` for each input.
- AC-16.2 one test (the card's title): ids `[D, B]` ×3, `[B]`, `[]`, `[D, C, B, A]` ×2, `[]`; the input array still reads
  `[D, C, B, A]` after every call; for `''` assert `result !== input` (`not.toBe`) and equal contents.
- AC-16.3 one test over the punctuation queries (`'a.b'` → `[D]`, `'%'` → `[B]`, `'_'` → `[E]`, `'.*'` and `'('` → `[]`)
  and a second over `Café` (`'cafe'` → `[]`, `'CAFÉ'` → the todo). Keep the unprefixed length-guard test separate.
- AC-16.4 one test, the nine tuples of the criterion, exact strings.
- AC-16.5 two `it`s or one with two renders: `getByRole('search')` 1; `form` attributes `method` `get` and `action`
  `/`; `getByRole('searchbox', { name: 'Search todos' })` with `name` `q`, `maxlength` `200`, value `''` then `'milk'`;
  `getByRole('button', { name: 'Search' })` with `type` `submit`; `queryAllByRole('listitem')` length 0; hidden input
  `name=filter` `value=active` in the second render and `container.querySelector('input[name="filter"]')` null in the
  first. A hidden input has no role, so query by selector, not role.
- AC-16.6 steps verbatim; assert address with the `addressIs` helper idiom of `e2e/12-filter.spec.ts`; one element
  with the text "No todos match your search" after `zzz`; `/?q=%20%20` lists all four. Add one unprefixed test (REQ-16.8,
  empty store): `/?q=milk` with nothing stored reads "No todos yet" and the form is still present (REQ-16.1).
- AC-16.7 steps verbatim; "2 items left" appears once before and after the retitle, "0 items left" after the click;
  stored todos D, C, B all `completed: true` read from Prisma; the address is still `/?q=milk` after each step.
- Phase-A gates: `pnpm test` (unit + component), `pnpm test:mutation` (only `src/lib/todo-search.ts` is in the
  mutate set; components are not mutated); `scripts/ci/check-ac-coverage.sh` stays "no tests expected yet" for the
  `✗` row.

## Mutation hot spots

`todo-search.ts` is the only mutated file (`src/lib/**`); threshold 70 %, aim for no survivors.

- `parseSearchQuery`: the `typeof value === 'string'` guard (a mutant returning `value.trim()` for arrays throws or
  returns an array; killed by the `['milk', 'bread']` and `[]` cases); the `.trim()` call (killed by `'  milk  '`);
  accidental collapsing of inner spaces (killed by `'Buy  milk'`, two spaces); accidental truncation at 200 (killed by
  the 201-character case).
- `searchTodos`: the `.trim()` on the query (killed by `'  milk  '` and `'   '` → all four); `toLowerCase` on the title
  only or the query only (killed by `'MILK'` vs "Buy Milk"; "milkshake" for the lower-case title side); `includes`
  replaced by `startsWith` or `===` (killed by `'ilks'` → `[B]`, which matches mid-title); the negated predicate (killed
  by every id list); input order (killed by `[D, B]` not `[B, D]`); mutation of the input (killed by the post-call
  array read).
- Equivalent-mutant trap: an early `if (needle === '') return [...todos]` makes the `''` branch removable with no
  observable change (`includes('')` is true), a survivor that only a "new array" assertion partly pins. The recommended
  body has no such branch.
- `searchEmptyMessage`: the order of the two guards (`totalCount === 0` first: `('active', 0, 'milk')` → "No todos
  yet" kills the swap); `query.trim() !== ''` (killed by `('active', 3, '   ')` → "No active todos"); the constant
  strings (killed by exact `toBe`); the fall-through to `emptyListMessage(filter, totalCount)` (killed by
  `('completed', 3, '')` → "No completed todos").
- `SEARCH_QUERY_MAX_LENGTH`: a mutant `TITLE_MAX_LENGTH + 1` or `0` is killed by the unprefixed equality-to-200 test.

## Questions settled / escalated

```
Question:    Does B2.5 hold or wait on `src/app/page.tsx` and `src/lib/todo-schema.ts` while B2.4 is Doing?
Class:       P0 no conflict (the brief) with a P2 spec-silent gap (B2.4 has no plan to check)
Sources:     backlog/00-decisions.md:40 "the shared mount points `src/app/page.tsx`, `src/lib/todos.ts`, `src/actions/todos.ts` are held by one Doing card at a time (`next-task.sh --check`)"
             backlog/work/B2.4 (branch feat/B2.4-due-date) analysis.md:32 "`src/app/page.tsx` and `src/lib/todo-schema.ts` are NOT touched"
Conflict:    D-20 and the brief treat the files as held / B2.4's analysis says it does not touch them; its plan.md does not exist, so `--check` has nothing to compare
Verdict:     D-20 (a) governs (rank 2) over an analysis note (rank 5 in effect, not a plan). Phase A takes no held file; phase B waits for B2.4 MERGED unless B2.4's written plan lists neither file and `scripts/next-task.sh --check B2.5` is clean.
Next action: dev-lead writes plan.md with phase A only, `page.tsx` and the e2e as a declared phase B; re-run `--check B2.5` when B2.4's plan appears.
Must not:    mount the form in `page.tsx` now on the strength of B2.4's analysis.
Doc drift:   none
Escalate:    none
```

```
Question:    May `todo-search.ts` import `TITLE_MAX_LENGTH` from `todo-schema.ts` (analysis question 3), and what if B2.4 moves it?
Class:       P0 no conflict
Sources:     spec/contracts/14-search.md "`SEARCH_QUERY_MAX_LENGTH: number; // 200, the value of TITLE_MAX_LENGTH from '@/lib/todo-schema' (§5); one definition`"
             src/CLAUDE.md:16 "Spec constants are named module-level values taken from the section (`TITLE_MAX_LENGTH = 200`), never literals in logic."
Conflict:    none
Verdict:     The spec governs: import it, a read-only use of one exported constant is not an edit of the held file. B2.4's analysis leaves `todo-schema.ts` untouched; a later move fails `pnpm typecheck` and the unprefixed equality test in the same PR.
Next action: write `export const SEARCH_QUERY_MAX_LENGTH: number = TITLE_MAX_LENGTH;` and the equality test with `@/lib/todo-schema` unmocked.
Must not:    redefine 200 as a literal in `todo-search.ts` or in the component's `maxLength`; use `SEARCH_QUERY_MAX_LENGTH` there.
Doc drift:   none
Escalate:    none
```

```
Question:    Is the e2e (AC-16.6, AC-16.7) written red in phase A (analysis question 8) or in phase B?
Class:       P2 spec silent (sequencing is not a section matter)
Sources:     backlog/work/B2.5/analysis.md "AC-16.6 and AC-16.7 (e2e) are written red now and turn green at the mount."
             .claude/rules/testing.md "Red first: tests are committed alone (`test(<pkg>): B<e>.<n> … (red)`, body "Red because …")"
Conflict:    none between rules; the analysis proposal is a proposal, B2.3's accepted plan put its e2e in phase B
Verdict:     Phase B. The rule is satisfied either way (red before green, tests alone in their commit); phase B avoids a pushed red e2e on a PR that cannot be green until B2.4 merges, and lets the seed helper use the merged schema. The plan, not the analysis, decides.
Next action: dev-lead lists `e2e/16-search.spec.ts` under phase B in plan.md and records the red proof in that commit's body.
Must not:    commit the e2e inside the phase-A `feat(...)`, or leave a `test.skip`/`fixme` in a pushed branch to keep CI green.
Doc drift:   none
Escalate:    none
```

```
Question:    How does section 15's due date rendering interact with the page mount and the §16 e2e?
Class:       P0 no conflict
Sources:     spec/contracts/13-due-date.md (branch feat/B2.4-due-date) "`TodoItem({ todo })` renders <TodoDueDate todoId={todo.id} dueDate={todo.dueDate} /> inside its <li>; nothing else changes"
             spec/contracts/14-search.md "searching anything but the title (a due date, section 15, is not searched)"
Conflict:    none
Verdict:     No interaction in code: `searchTodos` is generic over `{ title }` and passes `dueDate` through; the due date renders inside `TodoItem`, which §16 does not touch. For the e2e, seed no due date, so each row's text stays the bare title.
Next action: phase-A tests use `{ id, title }` literals; phase B re-reads B2.4's merged `todo-item.tsx` and `e2e/15-due-date.spec.ts` before writing the row locators.
Must not:    import the `Todo` type or `dueDate` into the §16 tests, or search the due date.
Doc drift:   none
Escalate:    none
```
