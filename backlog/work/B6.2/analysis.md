# B6.2 analysis

## Completeness

| Check                                | Result | Note                                                                                               |
| ------------------------------------ | ------ | -------------------------------------------------------------------------------------------------- |
| Intent without solution words        | pass   |                                                                                                    |
| Every behavior has a REQ             | pass   | REQ-30.1 to 30.6                                                                                   |
| One EARS pattern each                | pass   | ubiquitous, unwanted, event, optional                                                              |
| At most 7 criteria                   | pass   | 7                                                                                                  |
| Every Then measurable                | pass   | exact strings and counts                                                                           |
| No banned adjective without a number | pass   |                                                                                                    |
| Out of scope                         | pass   |                                                                                                    |
| Unchanged behavior with proof titles | pass   | titles quoted from grep                                                                            |
| Dependencies done                    | pass   | D-33 only                                                                                          |
| No settled D-n contradicted          | pass   | D-33: file, section, component, `page.tsx` honoured; lift made in `10-filter.md` Out of scope line |

## Open questions

1. Where the count sits. Question: the card says "each filter link reads its name and the number", but four e2e files
   (`e2e/12-filter.spec.ts`, `16-search`, `21-clear-search`, `25-search-shortcut`) find links with `exact: true` and
   AC-12.4 reads link text. Proposed decision: the count is a `<span>` after the link, so the link's name stays
   "All"/"Active"/"Completed". Why: no existing test is touched or weakened. Otherwise: link text "All (4)" breaks those
   tests, which only a spec change plus rewritten tests could fix.
2. Format. Proposed: `(n)`, matching B6.4's `Clear completed (n)`. Otherwise: any other text changes AC-30.2/30.3 only.
3. `counts` is optional on `TodoFilterNav` so AC-12.4's test passes untouched (REQ-30.6); the page always passes it.
4. `filterCounts` lives in a new `src/lib/filter-counts.ts`, not in `todo-filter.ts` (D-33 lists no lib file); needs a
   `spec/features-map.md` row F28 listing it, which is not mine to edit.
5. The spec's `10-filter.md` edit (drop "counts on the links" from Out of scope) must be its own `docs(spec)` commit
   before the §30 file and any test, per D-33.

## Needs a ruling

None as a D-n. The lead should confirm open question 1, since it departs from the card's wording "each filter link
reads".
