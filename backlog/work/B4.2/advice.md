# B4.2 advice: clear the search with one link (§21)

Read: card B4.2 (`backlog/plan/E4-todos-details.md`), `spec/contracts/19-clear-search.md`, `analysis.md`, the rules, D-22
and D-24, `src/components/todo-search-form.tsx` and its test, `src/components/todo-filter-nav.tsx` (the reference for a
`Link` in a Server Component), `src/lib/todo-search.ts`, `src/lib/todo-filter.ts`, `src/app/page.tsx`,
`e2e/16-search.spec.ts`, `scripts/verify-red.sh`, `scripts/ci/check-features-map.sh`, `check-ac-coverage.sh`.
No dependency, no migration, no action, no schema change.

## Approaches

### A (recommended): the contract as written

- **Change.** New pure module `src/lib/clear-search.ts` (`CLEAR_SEARCH_LABEL`, `isSearchInEffect`, `clearSearchHref`).
  `TodoSearchForm` renders, as the last child of the `<form>` and after the "Search" button,
  `{isSearchInEffect(query) && <Link href={clearSearchHref(filter)}>{CLEAR_SEARCH_LABEL}</Link>}`. No `'use client'`,
  `page.tsx` untouched, the input `key` untouched (it already remounts the box empty when `q` leaves the address).
- **Pros.** Matches the Function contracts block word for word (spec wins on structure of the signatures). One root,
  one `search` landmark, so REQ-21.1 and REQ-21.5 hold with no page change (D-22, D-24). Logic sits in `src/lib`, so
  Stryker (`src/lib/**`) mutates it; the component has only a conditional and an `href`. `Link` renders an `<a href>`:
  works with JavaScript off, and with JavaScript on it navigates client side and the `key` change empties the box.
  Same pattern as `TodoFilterNav`.
- **Cons.** The link needs a style of its own inside a `flex gap-2` form (a `self-center` class); one more branch in a
  component that has none.
- **Fits rules.** Yes: invariants 1 to 4 (no mutation, no Prisma, nothing stateful), D-22/D-24 file limits, ts-style
  (explicit return types, `readonly`, no `any`).

### B (alternative): bare `<a>` instead of `next/link`

- **Change.** Same module and placement, `<a href={clearSearchHref(filter)}>` in place of `Link`.
- **Pros.** No router involved; every click is a full page load, so JavaScript state can never matter; the jsdom
  render is identical.
- **Cons.** Contradicts the function contract (`next/link`, "as the links of §12"); eslint `@next/next/no-html-link-for-pages`
  flags an internal `<a href="/">` (a suppression needs the reviewer and a card id); drops client-side navigation and the
  router's prefetch that the filter links give; two link styles in one page. REQ-21.5 would still hold.
- **Fits rules.** Only with a lint suppression (`check-suppressions.sh`); not recommended.

(A third shape, the link as a sibling outside the form or a fragment root, breaks REQ-21.1 "inside the search form" and
the component's one-root contract; not weighed further.)

## Recommendation

Approach A. The spec fixes the signatures and the markup; B only trades a contract line for a lint suppression.

## Impact

| File                                       | Add/Change                                      | Signature                                                                                                                                                                         | ACs                               |
| ------------------------------------------ | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| `src/lib/clear-search.ts`                  | Add (skeleton, then green)                      | `export const CLEAR_SEARCH_LABEL: string`; `export function isSearchInEffect(query: string): boolean`; `export function clearSearchHref(filter: TodoFilter): string`              | AC-21.1, AC-21.2                  |
| `src/components/todo-search-form.tsx`      | Change (green commit only)                      | `TodoSearchForm({ filter, query }: { readonly filter: TodoFilter; readonly query: string }): ReactNode` (unchanged); adds `import Link from 'next/link'` and the conditional link | AC-21.3, AC-21.4, AC-21.5 to 21.7 |
| `src/lib/clear-search.test.ts`             | Add (test-writer, red)                          | `describe('clearSearchHref, CLEAR_SEARCH_LABEL, isSearchInEffect (§21)')`                                                                                                         | AC-21.1, AC-21.2                  |
| `src/components/todo-search-form.test.tsx` | Change: add cases only (red)                    | two new `it` titles `AC-21.3: …`, `AC-21.4: …`; the two AC-16.5 `it` blocks stay byte for byte                                                                                    | AC-21.3, AC-21.4                  |
| `e2e/21-clear-search.spec.ts`              | Add (red; skipped by verify-red)                | `test.describe('§21 clear the search')` with AC-21.5, AC-21.6 and a JavaScript-disabled `describe` for AC-21.7                                                                    | AC-21.5, AC-21.6, AC-21.7         |
| `spec/features-map.md`                     | Change: one row, `docs(map)` commit after feat  | row F19, section 21, "Clear the search", files `src/lib/clear-search.ts` and `src/components/todo-search-form.tsx`, tests the three test files, status `✅`                       | `check-features-map.sh`           |
| `spec/technical-requirements.md`           | Change: §21 status `✗` to `✅` (closing commit) | one table cell                                                                                                                                                                    | `check-ac-coverage.sh`            |

`src/app/page.tsx`, `todo-item.tsx`, `remaining-count.tsx`, `todo-count.ts`, `todo-search.ts`, `todo-filter.ts`,
`todo-filter-nav.tsx`, `todos.ts`, `actions/todos.ts` and every `src/*/CLAUDE.md` stay untouched (D-22, D-24).

The F19 row follows the commit order of `backlog/CLAUDE.md`: a `docs(map): F19 clear the search [B4.2]` commit after the
`feat(...)` commit adds the row (status `✅`). The skeleton adds `src/lib/clear-search.ts` before any row names it, so
`check-features-map.sh` is red on that intermediate commit and green at the PR tip, where CI runs it. The index cell of
section 21 (`✗` to `✅`) and the card status flip belong to the closing commit of the card, with the README totals
(`check-backlog.sh`).

Client component changes: none. `TodoSearchForm` is a Server Component (no `'use client'`, no state, no events), so no
hydration path exists to break. For its server-rendered markup:

| Case                       | Today                                          | After approach A                                                                                                   | After approach B                                 |
| -------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------ |
| Submit with JavaScript off | native GET of `q` (and `filter`) to `/`, works | unchanged; the extra `<a href>` is a plain link, a click is a full page load to `/` or `/?filter=<filter>`         | same                                             |
| Submit before hydration    | native GET, works                              | unchanged; `Link` before hydration is a plain anchor, so a click is a native navigation, then the page is the same | same                                             |
| After hydration            | native GET (the form has no handler)           | the link navigates client side; the new `key` remounts the box empty                                               | full page load, box empty by the fresh render    |
| Behavior dropped           | n/a                                            | none                                                                                                               | client navigation and prefetch of the clear link |

## Risks

- **Migration.** None. No schema, env or Prisma change.
- **Security.** The href is built from the closed union `TodoFilter` (`'all' | 'active' | 'completed'`), never from
  `q` or user text; no injection path. No new mutation, so invariant 3 is not in play.
- **Performance.** One conditional element on a page that already queries all todos; `Link` prefetch of `/` and
  `/?filter=…` hits `force-dynamic` pages (the filter links already do the same).
- **Isolation (invariant 5).** No port, schema or path hard-coded. E2e asserts the address as path plus query
  (`addressIs`), not the origin, so it holds on any worktree `PORT`.
- **The red gate on AC-21.4 (the real one).** `verify-red.sh` passes only if no NEW test passes in the base (the
  skeleton). AC-21.4 asserts the link is absent; the unchanged component passes it, so `verify-red.sh B4.2` would fail
  on it. See Question 1 for the compliant way.
- **Existing tests that could turn red.**
  - The two AC-16.5 tests in `todo-search-form.test.tsx`: under approach A they use `getAllByRole('button', { name: 'Search' })`
    (string `name` is an exact match) and assert 0 list items; the new link is a link, not a button nor a list item,
    so they stay green. With query `'milk'` the link is present in the second test; neither test counts links.
  - `e2e/16-search.spec.ts`: `searchButton` uses `exact: true`, and no locator there counts links in the `search`
    landmark; unaffected. `e2e/12-filter.spec.ts`: filter locators scope to the `Filter todos` navigation; unaffected.
  - Any e2e locator for a link named `Search…` unscoped would match "Clear search" case-insensitively by substring; none
    exists today (`grep -n "getByRole('link'" e2e/*.ts` shows scoped ones only). New e2e uses `exact: true`.
- **Scope drift.** A `Clear search` link in the JS-off e2e depends on `javaScriptEnabled` being a context option; if the
  Playwright version rejects `test.use` inside a `describe`, see Question 4.
- **Dependencies.** None added.

## Test strategy

| Layer     | File                                       | ACs                                    | Mocks                                                                                                                          |
| --------- | ------------------------------------------ | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| unit      | `src/lib/clear-search.test.ts`             | AC-21.1, AC-21.2                       | none (pure module, no Prisma, no `server-only`)                                                                                |
| component | `src/components/todo-search-form.test.tsx` | AC-21.3, AC-21.4 (new); AC-16.5 (kept) | none (synchronous Server Component, imports no action); `next/link` renders as `<a>` in jsdom as in `todo-filter-nav.test.tsx` |
| e2e       | `e2e/21-clear-search.spec.ts`              | AC-21.5, AC-21.6, AC-21.7              | none; real server and the compose Postgres through `PrismaClient`, `deleteMany` in `beforeEach`                                |

**Unit.** One `it` per AC, titles start `AC-21.1:` and `AC-21.2:`, exactly as the card's Test line for AC-21.1. AC-21.1:
`clearSearchHref` for the three filters equals `'/'`, `'/?filter=active'`, `'/?filter=completed'`, none contains `q=`,
and `CLEAR_SEARCH_LABEL` `toBe('Clear search')`. AC-21.2: a `readonly [string, boolean][]` table for the six queries
(`'x'.repeat(201)` included), `toBe` on each, and `expect(() => isSearchInEffect(q)).not.toThrow()`.

**Component.** The §21 cases are added to the existing `todo-search-form.test.tsx`; the file keeps its `renderForm` and
`hiddenFilterInputs` helpers. **The two existing AC-16.5 tests stay unchanged** (the spec's Test note and Unchanged
behavior table name them as proof; none asserts a link's absence, so nothing in them needs editing; the test-writer
must not touch those two `it` blocks, and the diff of that file shows only added lines). AC-21.3: three renders, each in
its own `render` (use `cleanup` between, or `unmount`) with `getAllByRole('link', { name: 'Clear search' })` of length 1,
`tagName` `A`, `href` attribute `/`, `/?filter=active`, `/?filter=completed`, `href` not containing `q=`, inside the
`search` landmark (`within(landmark)`), after the "Search" button (`button.compareDocumentPosition(link) &
Node.DOCUMENT_POSITION_FOLLOWING`), `queryAllByRole('button', { name: 'Clear search' })` of length 0, one searchbox with
value `milk`, one button "Search", 0 `listitem`, hidden filter inputs 0 / 1 / 1 through `hiddenFilterInputs`. AC-21.4:
renders `('all','')`, `('active','')`, `('completed','   ')`; `queryAllByRole('link')` empty, `queryAllByText('Clear
search')` empty, one `search` landmark, one searchbox, one button "Search" of `type` `submit`.

**E2e.** One `describe`, titles `AC-21.5: …`, `AC-21.6: …`, `AC-21.7: …`; helpers copied into the file (as the existing
files do: `seedInDisplayOrder`, `seedFourTodos`, `addressIs`, `openHydrated`, `filterLink`, `exactText`), plus
`clearLink(page)` = `page.getByRole('search').getByRole('link', { name: 'Clear search', exact: true })` and
`expect(clearLink(page)).toHaveCount(n)` for the "link count" assertions. Rows through `getByRole('listitem')`
`toHaveText([...])`. AC-21.5 and AC-21.6 run hydrated (`openHydrated`), click, then `toHaveURL(addressIs(...))`; the
reload step uses `page.reload()` and re-reads URL, rows, box, link count and `aria-current="page"` on the "Active"
filter link. `/?q=%20%20` uses `page.goto` and expects count 0.

**How AC-21.7 disables JavaScript.** In `e2e/21-clear-search.spec.ts`, a nested
`test.describe('§21 clear the search with JavaScript disabled', () => { test.use({ javaScriptEnabled: false }); … })`.
`javaScriptEnabled` is a Playwright context option, so `test.use` in a `describe` gives that group a fresh browser
context with scripts off, and the other tests in the file keep the default context (no change to `playwright.config.ts`,
no new project, nothing under `.claude/` or CI). In it: seed the four todos, `page.goto('/?filter=completed&q=milk')`
(not `openHydrated`: with scripts off there is no hydration, and `networkidle` adds nothing), expect rows
`['Milkshake']`, click the link (a native navigation), `await expect(page).toHaveURL(addressIs('/?filter=completed'))`,
expect rows `['Milkshake', 'Walk the dog']`, box value `''`, link count 0, then read the store with
`prisma.todo.findMany({ orderBy: { createdAt: 'desc' } })` and assert titles `['Buy milk', 'Milkshake', 'Call mom',
'Walk the dog']` and completed `[false, true, false, true]`. The test never types or clicks a control that needs
script, so a pass proves the anchor works without JavaScript (REQ-21.5), which jsdom cannot show.

**Red gate.** Skeleton commit `chore(todos): B4.2 skeleton`: `src/lib/clear-search.ts` with the label constant (a
constant is not behavior) and the two functions throwing `NotImplementedError`. The component is not
touched in the skeleton (`pnpm test` must pass there; a throwing stub wired into the form would turn the two AC-16.5 tests
red). Red commit `test(todos): B4.2 clear the search (red)`: the three test files. Expected red: AC-21.1 and AC-21.2 on
`NotImplementedError` (and AC-21.1's label assertion is the only line that could pass on its own, in the same `it` as the
failing hrefs, so the test as a whole fails); AC-21.3 on the missing link; AC-21.4 per Question 1.

**Commands.** `pnpm test` (the two lib tests plus component cases on top of the existing count), `pnpm test:e2e`
(`e2e/21-clear-search.spec.ts`, 3 tests; needs `docker compose up -d`), `pnpm test:mutation`.

## Mutation hot spots

Only `src/lib/clear-search.ts` is mutated (`stryker.config.mjs`: `src/lib/**`, `src/actions/**`); the component is not.

- `isSearchInEffect`: drop `.trim()` survives unless a whitespace-only case (`'   '`, `'\t\n'`) is asserted to be `false`
  (AC-21.2 has both); `!== ''` to `=== ''` dies on `'milk'`; the `''` literal mutated to `"Stryker was here!"` dies on
  `''` and `'   '`; a `length > 200` guard would be wrong (the 201-character case must be `true`) and is killed by it.
- `clearSearchHref`: the `'all'` branch (`'/'` versus `/?filter=all`) dies on the first AC-21.1 case; a mutated
  template literal or a swapped branch dies on `'active'` and `'completed'`; assert exact strings with `toBe`, and the
  absence of `q=` is redundant with exact equality but kept as the spec says. Write it as one conditional
  (`filter === 'all' ? '/' : `/?filter=${filter}``), which has no equivalent mutant; a `switch` with a `default` would.
- `CLEAR_SEARCH_LABEL`: the string literal mutant dies on `toBe('Clear search')`.
- Aim: 100 % on this 3-line module; the 70 % break threshold is global, so a survivor here also costs the other files.

## Questions settled / escalated

```
Question:    Does AC-21.4 ("no link when no search") pass on the skeleton and so fail the red gate?
Class:       P2 spec silent (the spec fixes the criterion, not how a negative criterion is shown red)
Sources:     .claude/rules/testing.md:30 "fail on an assertion or the skeleton's `NotImplementedError`, never on an import"
             scripts/verify-red.sh:15 "zero NEW tests passed"
             spec/contracts/19-clear-search.md:51 "each render has 0 elements with role `link` (inside or outside the `search` landmark)"
Conflict:    none between sources; the unchanged component satisfies AC-21.4 today, so a test that only reads the markup is green before any code
Verdict:     The red rule governs (invariant 2, testing.md, verify-red). The criterion's own text is not weakened or
             changed: the test-writer adds, inside the AC-21.4 `it`, a call `isSearchInEffect(query)` per render with
             `expect(...).toBe(false)` (that is REQ-21.2's definition, AC-21.2 covers the same function), imported
             from `src/lib/clear-search`. On the skeleton it throws `NotImplementedError`, so the test is red for the
             right reason; after the feat commit it asserts the same markup plus a true statement. The skeleton stays
             lib-only, so `pnpm test` is green on that commit.
Next action: dev-lead writes this line into plan.md "How to verify"; test-writer includes the call in AC-21.4; run
             `scripts/verify-red.sh B4.2` and read the AC-21.4 failure message.
Must not:    leave AC-21.4 purely markup based and expect `verify-red.sh` to pass; wire a throwing stub into
             `TodoSearchForm` in the skeleton to force red (breaks the two AC-16.5 tests and the skeleton's green `pnpm test`);
             move AC-21.4 out of the component file.
Doc drift:   none
Escalate:    none
```

```
Question:    Where does the link sit, and `Link` or a bare `<a>` (analysis questions 1 and 2)?
Class:       P0 no conflict
Sources:     spec/contracts/19-clear-search.md:12 "inside the search form of §16 and after its \"Search\" button"
             spec/contracts/19-clear-search.md:63 "<Link href={clearSearchHref(filter)}>{CLEAR_SEARCH_LABEL}</Link> (next/link, rendered as an <a>, as the links of §12)"
Conflict:    none
Verdict:     The Function contracts block governs: last child of the `<form>`, `next/link`. Approach A.
Next action: build as the block reads; add a `self-center` style class only.
Must not:    use a bare `<a>` (lint suppression) or place the link outside the form.
Doc drift:   none
Escalate:    none
```

```
Question:    Helper in a new module or in `todo-search.ts` (analysis question 3)?
Class:       P0 no conflict
Sources:     backlog/00-decisions.md:49 "B4.2 adds a \"clear search\" link in `src/components/todo-search-form.tsx`"
             spec/contracts/19-clear-search.md:56 "// src/lib/clear-search.ts (§21; pure: no Prisma, no server-only; importable from a Server Component)"
Conflict:    none
Verdict:     `src/lib/clear-search.ts` (D-22 logic in the card's own module; the contract names it; `todo-search.ts` stays).
Next action: skeleton creates it.
Must not:    add `isSearchInEffect` to `todo-search.ts`, or inline `query.trim() !== ''` in the component (the logic
             would then escape Stryker).
Doc drift:   none
Escalate:    none
```

```
Question:    The one added sentence in `14-search.md` and the unchanged AC-16.5 tests (analysis questions 4 and 5).
Class:       P0 no conflict
Sources:     spec/contracts/14-search.md:67 "`TodoSearchForm` also renders the \"Clear search\" link of §21 while a search is active"
             spec/contracts/19-clear-search.md:64 "its §16 tests are not changed, because none of them asserts that a link is absent"
Conflict:    none
Verdict:     The sentence is already on the branch (docs(spec) commit); the AC-16.5 tests stay unchanged and the §21 cases
             are added to the same file.
Next action: test-writer adds cases only; reviewer checks the diff of `todo-search-form.test.tsx` has no removed or
             modified line.
Must not:    edit, split or re-title the AC-16.5 tests, or create a second component test file.
Doc drift:   none
Escalate:    none
```

```
Question:    The F19 row and the index status (analysis question 6): which commit?
Class:       P0 no conflict (analysis said P2; backlog/CLAUDE.md is silent on neither)
Sources:     backlog/CLAUDE.md:44 "`feat(<pkg>): B<e>.<n> …` → `docs(map): F<n> … [B<e>.<n>]`"
             backlog/CLAUDE.md:75 "Flip the feature's status in `spec/features-map.md` and the section's status in `spec/technical-requirements.md`."
Conflict:    none; `check-features-map.sh` is red on the skeleton commit alone (a module in no row) and green at the PR tip
Verdict:     The commit order governs: the F19 row lands in `docs(map): F19 … [B4.2]` after the feat commit, the index cell
             and the card status in the closing commit. `check-ac-coverage.sh` then finds AC-21.1 to AC-21.7 as test titles.
Next action: plan.md lists `spec/features-map.md` (docs(map)) and `spec/technical-requirements.md` (closing).
Must not:    flip to `✅` before the tests exist; put the row in the skeleton commit or leave it to a follow-up PR.
Doc drift:   spec/features-map.md in the docs(map) commit; spec/technical-requirements.md in the closing commit.
Escalate:    none
```

```
Question:    How does AC-21.7 turn JavaScript off (analysis question 7)?
Class:       P0 no conflict
Sources:     spec/contracts/19-clear-search.md:42 "a browser context with JavaScript disabled, on `/?filter=completed&q=milk`"
Conflict:    none
Verdict:     `test.use({ javaScriptEnabled: false })` inside its own `describe` (see Test strategy); no config, no new
             project. If Playwright refuses `test.use` there, the fallback is `browser.newContext({ javaScriptEnabled: false })`
             in the test itself, closed in a `finally`; the assertions do not change.
Next action: test-writer writes the nested describe.
Must not:    drop AC-21.7, or add a project to `playwright.config.ts` (a config change needs the `config-change-approved` label, D-19).
Doc drift:   none
Escalate:    none
```

```
Question:    The index jumps from §19 to §21 and the "Lead approves spec" box is unticked (analysis questions 8 and 9).
Class:       P0 no conflict
Sources:     spec/technical-requirements.md:27 "| §21 | [contracts/19-clear-search.md](contracts/19-clear-search.md)"
             spec/contracts/19-clear-search.md:5 "- [ ] Lead approves spec (lead, <date>)"
Conflict:    none
Verdict:     Not blocking: the order-only index collision resolves at merge with the sibling cards (D-24); the box is the
             lead's tick at the plan gate. Neither changes code or an AC id.
Next action: dev-lead mentions both in plan.md; the lead ticks the box with the plan approval.
Must not:    tick the box or renumber sections to close the gap.
Doc drift:   none
Escalate:    none
```
