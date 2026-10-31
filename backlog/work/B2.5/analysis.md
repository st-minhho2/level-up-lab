# B2.5 analysis

Section: §16 Todos: search by title, `spec/contracts/14-search.md` (new, D-20). 10 REQ, 7 AC.

## Completeness

| Check                                | Result | Note                                                                                                                                                                                                 |
| ------------------------------------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Intent without solution words        | pass   | one person-level paragraph; no module, parameter or library named                                                                                                                                    |
| Every behavior has a REQ             | pass   | the form, the address, matching, no-search values, plain-text comparison, search with filter, filter links, empty message, order/stored/count/buttons, keeping the search after a mutation           |
| One EARS pattern each                | pass   | ubiquitous 16.1, 16.2, 16.5, 16.9; state-driven 16.3, 16.6, 16.8; unwanted 16.4; event-driven 16.7, 16.10                                                                                            |
| At most 7 criteria                   | pass   | 7 (AC-16.1 to AC-16.7): 3 pure-function lib, 1 message, 1 component, 2 e2e                                                                                                                           |
| Every Then measurable                | pass   | exact return values, id lists, addresses, counts of `listitem`, exact texts                                                                                                                          |
| No banned adjective without a number | pass   | none used                                                                                                                                                                                            |
| Out of scope stated                  | pass   | highlight, search as you type, other fields, fuzzy/regex/wildcard, accent folding, DB search, `next/form`, clear link, keeping the search through filter links, scoped count and bulk actions, order |
| Unchanged behavior with proof titles | pass   | 11 rows; titles copied from `grep` on `src/` and `e2e/` in this worktree                                                                                                                             |
| Dependencies done                    | pass   | card has none; sections 5, 6, 9, 12, 13, 14 are on this branch; section 15 (B2.4, in parallel) is not referenced as a dependency                                                                     |
| No settled D-n contradicted          | pass   | D-20 (section 16, `14-search.md`, own modules, in-memory like `todo-filter.ts`) followed; D-5 title limit reused; section 12 behavior is not rewritten (see question 1)                              |

Limits taken from existing sections: 200 characters (§5 `TITLE_MAX_LENGTH`), order `createdAt desc` (§5), the §12
empty texts and `parseTodoFilter` semantics (repeated parameter, exact match). New text pinned here, not invented
limits: the query parameter name `q`, the label "Search todos", the button "Search", the message "No todos match your search".

## Open questions

1. **Following a filter link drops the search.** REQ-12.6 fixes the filter links to `/`, `/?filter=active`,
   `/?filter=completed`, and B2.1's analysis left B2.5 to extend it. Proposed: §16 leaves §12 untouched (REQ-16.7 states
   the consequence); the search form keeps the filter instead (hidden `filter` field), so search-then-filter loses the
   search but filter-then-search keeps both. Why: rewriting REQ-12.6 changes an approved section and needs a D-n (§8),
   and `todo-filter-nav.tsx` is outside B2.5's modules. If the lead wants links that keep `q`, the cost is a D-n, a
   `docs(spec): §12 …` commit changing REQ-12.6 and AC-12.4/AC-12.5, new red tests for `TodoFilterNav` (a `query`
   prop) and one more card before B2.5's red test.
2. **Count and bulk actions are not scoped to the search.** Proposed: REQ-16.9 derives the remaining count, "Clear
   completed" and "Mark all complete" enabled states from every stored todo, exactly as REQ-13.5, REQ-12.10 and the
   §14 out-of-scope line do for the filter; "Mark all complete" therefore also marks hidden todos (AC-16.7 proves it).
   Why: one rule for both narrowings, and the §13 count would change meaning ("items left" vs "matches left") if
   scoped. Otherwise: the label of a bulk action would need to say "all matching" and §9/§14 actions would take a
   query, a Server Action signature change outside B2.5's modules.
3. **Query length.** Proposed: input `maxLength` 200, equal to `TITLE_MAX_LENGTH` (one definition, D-5), re-exported as
   `SEARCH_QUERY_MAX_LENGTH`; the parser does not truncate, a longer value (hand-typed address) matches nothing because no
   title exceeds 200, and reports no error (AC-16.1, AC-16.2). Why: truncating would make a 201-character query match
   titles it does not contain. Otherwise: a truncation rule and one more AC case. `todo-schema.ts` is held by B2.4;
   the import reads one exported constant, no edit. If B2.4 moves that constant, the import line changes.
4. **Empty-result text.** Proposed: "No todos match your search" whenever at least one todo is stored and a search is
   active, under every filter (REQ-16.8); no todo stored keeps "No todos yet" (REQ-12.8). Why: an empty Active view
   caused by the filter alone would still read "No todos match your search" when a query is present, which is true
   of the combination and avoids a four-way message table. Otherwise: a separate text for "search matches only
   other-filter todos", one more AC row.
5. **Empty submit and the address.** A GET form with an empty box sends `/?q=` (or `/?filter=active&q=`). Proposed:
   accepted (REQ-16.4 treats it as no search); no redirect to a clean address. Why: a redirect needs a route
   handler or middleware. Otherwise: a spec line and a mount change.
6. **A todo created or retitled while a search is active may vanish.** Creating "Walk dog" under `/?q=milk` leaves the
   list unchanged. Proposed: REQ-16.10 applies the search to the stored todos after every mutation, as REQ-12.11
   does for the filter; no auto-clear of the search. Otherwise: §5's creation flow would change (outside B2.5).
7. **Case folding.** Proposed: `toLowerCase()` on both sides (JavaScript default, locale-independent), no accent
   folding (AC-16.3 pins `cafe` vs `Café`). Why: no locale input exists in the app. Otherwise: `Intl.Collator`
   comparison and new cases.
8. **Mounting and the other shared files.** `src/app/page.tsx` is B2.4's; the mount (search form, `q` in the
   `searchParams` type, the chained `searchTodos(filterTodos(...))`, the empty text) lands in a later phase after B2.4
   merges (REQ placement is "the mounting card's choice"). Proposed: B2.5's red tests cover the three pure functions and
   the component (AC-16.1 to AC-16.5); AC-16.6 and AC-16.7 (e2e) are written red now and turn green at the mount. Why:
   the `Test:` line is a lib test, so verify-red is not blocked by the mount. Otherwise: the e2e pair waits for B2.4.
9. **Index, map, e2e name.** The index row is ✗ until the card closes (as §14 was). Proposed: e2e file
   `e2e/16-search.spec.ts` (files carry the section number); the lead adds F14 to `spec/features-map.md`
   (`src/lib/todo-search.ts`, `src/components/todo-search-form.tsx`, `src/app/page.tsx`) in the `docs(map)` commit
   with the `feat`; the analyst does not edit the map. Index rows for sections 12 to 14 are adjacent, so a trivial
   merge conflict with B2.4's row for section 15 is expected: resolve in the second PR, keep numeric order.
10. **Approval box.** Left `- [ ] Lead approves spec (lead, <date>)`; the lead ticks it at the plan gate (D-7).

## Needs a ruling

None. Question 1 is the only one near a ruling: the proposal leaves §12 unchanged, so no D-n is needed; the lead
may still choose the D-n route to keep `q` through filter links.
