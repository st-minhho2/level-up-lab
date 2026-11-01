# B4.2 analysis — Clear the search with one link (§21)

Section: §21 Todos: clear the search, `spec/contracts/19-clear-search.md` (new, D-24 under D-22). 6 REQ, 7 AC.
Written by `spec-analyst`; saved by `dev-lead` (the role's Write call to this path was refused as a subagent write).

## Completeness

| Check                                | Result | Note                                                                                                                                                                                                                                   |
| ------------------------------------ | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Intent without solution words        | pass   | one person-level paragraph; says "a link" (the card's subject), names no module, component or function                                                                                                                                 |
| Every behavior has a REQ             | pass   | shown while a search is in effect, absent otherwise, address keeps the filter and drops `q`, what the page shows after (full list, empty box, no link, empty text), plain anchor without JavaScript, nothing stored or counted changes |
| One EARS pattern each                | pass   | state-driven 21.1; unwanted 21.2; event-driven 21.3, 21.4; ubiquitous 21.5, 21.6                                                                                                                                                       |
| At most 7 criteria                   | pass   | 7: 2 lib, 2 component, 3 e2e                                                                                                                                                                                                           |
| Every Then measurable                | pass   | exact hrefs, exact link text, link counts, row lists, exact addresses, `aria-current`, exact stored titles and completion flags                                                                                                        |
| No banned adjective without a number | pass   | none used                                                                                                                                                                                                                              |
| Out of scope stated                  | pass   | browser `x` of `type="search"`, button or shortcut, clearing the filter too, keeping the search on a filter link, link with no search, focus move, client-side navigation, match count, layout outside the form                        |
| Unchanged behavior with proof titles | pass   | 11 rows, each title checked as a substring of a `src/` or `e2e/` test file                                                                                                                                                             |
| Dependencies done                    | pass   | none; §5, §12, §13, §14, §16 are on this branch                                                                                                                                                                                        |
| No settled D-n contradicted          | pass   | D-24 followed (UI only in `todo-search-form.tsx`, logic in an own module, the four forbidden files untouched, §16 line lifted in the same `docs(spec)` commit); D-22 followed; D-21 query-length rule kept                             |

Limits and texts come from existing sections: trim and "in effect" (§16 REQ-16.3, REQ-16.4), the 200-character rule
(REQ-16.5), the filter addresses (§12 REQ-12.6), the empty texts (§12 REQ-12.8, §16 REQ-16.8). The only new text is
the link's `Clear search`; no new limit.

## Open questions

1. **Where the link sits.** Proposed: inside `<form role="search">`, after the "Search" button, as the last child.
   Why: it stays in the one search landmark and the component keeps one root, so `page.tsx` is untouched. Otherwise:
   a sibling or fragment, a second root the component's contract does not name.
2. **`next/link` or a bare `<a>`.** Proposed: `Link`, as `TodoFilterNav` does. Why: it renders an `<a href>`, works
   with JavaScript off, and the file stays without `'use client'`. Otherwise: a bare `<a>` does a full page load; both
   satisfy REQ-21.5.
3. **Helper in a new module `src/lib/clear-search.ts`**, not `todo-search.ts`. Why: D-22/D-24 keep each card's logic in
   its own module and leave §16's module untouched. Otherwise: edit §16's function contract and risk overlap with
   another card.
4. **One added sentence in `14-search.md`** after its Function contracts, pointing at §21 so the markup description is
   not read as exhaustive. Otherwise: only the removal, leaving a contract block that omits an element the form
   renders. The lead may drop it; no AC id changes.
5. **`src/components/todo-search-form.test.tsx` gains the §21 cases** (AC-21.3, AC-21.4); its two AC-16.5 tests stay
   unchanged (none asserts a link's absence). Otherwise: a second test file for one component.
6. **No F19 row in `spec/features-map.md`** (outside this role's write paths). Proposed: the feature commit adds
   F19 | §21 | `src/lib/clear-search.ts`, `src/components/todo-search-form.tsx` | `src/lib/clear-search.test.ts`,
   `src/components/todo-search-form.test.tsx`, `e2e/21-clear-search.spec.ts`. Otherwise `check-features-map.sh` does
   not name the section's files.
7. **JavaScript-disabled e2e (AC-21.7)** via `test.use({ javaScriptEnabled: false })` in its own `describe`. Why: the
   only behavioral proof of REQ-21.5, since `'use client'` absence is not observable in jsdom. Otherwise: drop it and
   rely on the `<a href>` assertion in AC-21.3; the other six criteria are unaffected.
8. **The index jumps from §19 to §21** until the siblings add their rows (section 20 by B4.1, section 22 by B4.3).
   One-line, order-only conflict; resolved at merge.
9. **The "Lead approves spec" box under §21 is unticked**, for the lead to tick at the plan gate.

## Needs a ruling

none
