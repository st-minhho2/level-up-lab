# B7.4 analysis

Section §38, `spec/contracts/36-search-count.md`; edits to §16 (`14-search.md`) as D-37 lists. 7 REQ, 7 AC.

## Completeness

| Check                                | Result | Note                                                                                                                                                                                                                                |
| ------------------------------------ | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Intent without solution words        | pass   | the intent says what a person learns, not which element                                                                                                                                                                             |
| Every behavior has a REQ             | pass   | show (38.1), source of the number (38.2), nothing at 0 or without a search (38.3), text and no live region (38.4), updates (38.5), nothing else changes (38.6), optional prop (38.7)                                                |
| One EARS pattern each                | pass   | state-driven, ubiquitous, unwanted, event-driven, optional feature                                                                                                                                                                  |
| At most 7 criteria                   | pass   | AC-38.1 to AC-38.7 (4 unit, 3 e2e)                                                                                                                                                                                                  |
| Every Then measurable                | pass   | exact texts, element counts, attribute absence, document navigations                                                                                                                                                                |
| No unquantified adjective            | pass   | none used                                                                                                                                                                                                                           |
| Out of scope                         | pass   | includes the count with no search, "1 of n", announcing, `aria-describedby`, count in the filter links                                                                                                                              |
| Unchanged behavior with proof titles | pass   | 7 titles, copied from grep of `todo-search-form.test.tsx`, `e2e/16-search.spec.ts`, `e2e/21-clear-search.spec.ts`                                                                                                                   |
| Dependencies done                    | pass   | D-37 (on main); §16, §21, §25, §27 are done                                                                                                                                                                                         |
| No settled D-n contradicted          | pass   | D-37 edits only: lift "counts of matches" (14-search.md Out of scope), `count` in the §16 contract, REQ-25.6, REQ-27.6 and §21 lines stated not to apply (in §38). REQ-16.9 is respected: the stored-todo derivations are untouched |

Edits made outside the new file: `spec/contracts/14-search.md` only (the lift, the `TodoSearchForm` contract, the page contract line, which now passes `count={shown.length}`). Prettier reflowed the contract signature over several lines. No other section file was edited; the "do not apply" statements live in §38's "Edits to other sections".

Pins, so the run meets no gap:

- Element: a `<p>`, the last child of `<form role="search">`, after "Clear search". No id, role, `aria-*`, `title`.
- Text: `1 match` / `n matches`; `count === 1` decides inline. No `src/lib` helper (the card names only the form and `page.tsx`).
- Shown when `isSearchInEffect(query)` and `Number.isInteger(count)` and `count >= 1`.
- `page.tsx` passes `shown.length` always; the form decides. `page.test.ts` only tests `generateMetadata`, so the page is proven by e2e AC-38.5 to AC-38.7.
- Collisions checked against e2e exact texts and patterns: "No todos match your search" (§16, §21, §22), "No todos yet", "N items left" (exact in §13, §16, §21, §26; the regex in §23, §33), "All done", "Overdue", "Due today", "N overdue", `/^\d+ \/ 200$/` (§18, §29). None equals "N match(es)".
- Existing unit tests render without `count`, so they are unchanged (REQ-38.7). The §16 test "no list items" is unaffected (a `<p>`).

## Open questions

1. Should the count also show while the search is in effect and the stored list is empty? Proposed: no change needed; `shown.length` is 0 there, so nothing is added and "No todos yet" stands alone. Otherwise: none.
2. A non-integer or negative `count` shows nothing (REQ-38.3, AC-38.3). Proposed: keep, because the prop is optional and untyped at runtime. Otherwise the form would have to render "1.5 matches" or "-1 matches".
3. Prettier reformatted the §16 `TodoSearchForm` contract signature onto several lines (`pnpm format` style). Proposed: accept. Otherwise it fails the repo's format check.
4. Whether the red unit test for AC-38.1 may live in the existing `src/components/todo-search-form.test.tsx` (as §21, §25, §27 did) or needs a new file. Proposed: the existing file; no sibling card touches it. Otherwise `todo-search-count.test.tsx`.

## Needs a ruling

None. Two things to note for `dev-lead`, neither a conflict D-37 leaves open:

- `spec/technical-requirements.md` and `spec/features-map.md` gain a §38 / F36 row from the orchestrator; the features map row lists `src/components/todo-search-form.tsx`, `src/app/page.tsx` and tests `src/components/todo-search-form.test.tsx`, `e2e/38-search-count.spec.ts`.
- The worktree already held siblings' uncommitted edits (`13-due-date.md`, `16-title-counter.md`, `27-escape-new-todo.md`, `37-…`, `38-…`); none was touched here.
