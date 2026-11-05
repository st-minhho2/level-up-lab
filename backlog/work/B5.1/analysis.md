# B5.1 analysis

## Completeness

| Check                                | Result | Note                                                                                                        |
| ------------------------------------ | ------ | ----------------------------------------------------------------------------------------------------------- |
| Intent without solution words        | pass   | person, due days, list changes; no component or hook named                                                  |
| Every behavior has a REQ             | pass   | count, hidden at 0, filter/search, live update, hydration, midnight, placement: REQ-23.1 to 23.7            |
| One EARS pattern each                | pass   | ubiquitous 3, state-driven 2, event-driven 1, unwanted 1                                                    |
| At most 7 criteria                   | pass   | AC-23.1 to AC-23.7                                                                                          |
| Every Then measurable                | pass   | exact texts, role counts, tag names, navigation count, timer count                                          |
| No banned adjective without a number | pass   | none used                                                                                                   |
| Out of scope                         | pass   | timer, link to overdue filter, days late, plural wording, a11y announcement                                 |
| Unchanged behavior with proof titles | pass   | four rows, titles copied from grep of the test files                                                        |
| Dependencies done                    | pass   | D-30 (done); §13, §15, §17 on main                                                                          |
| No settled D-n contradicted          | pass   | D-30: new component rendered by `page.tsx`, section 23, file `21-overdue-count.md`; no other src file moves |

Other facts: `spec/features-map.md` has no F21 row (the card names F21); the lead adds it in the card's `docs(map)`
commit, the analyst does not edit that file. Registered in `technical-requirements.md` as §23, status ✗.

## Open questions

1. Wording. Question: what text shows the count? Proposed: `N overdue` ("2 overdue"). Why: shortest, needs no plural
   rule, distinct from §17's exact row text `Overdue` (e2e matches it with `exact: true`, so no collision). Otherwise:
   a different string changes REQ-23.1, AC-23.2/23.3/23.7 only.
2. Source of the day. Proposed: the count reads the stored data passed as props and the browser day (`todayOf`),
   not the rows' DOM as §17 does for completion. Why: it counts every stored todo including those a filter or search
   hides (REQ-23.3), which no row in the DOM could. Otherwise: a DOM read would break REQ-23.3.
3. Row/count disagreement across midnight. Each row reads its own day at its mount (§17 REQ-17.7), the count at its
   own; after midnight with the page open they can differ until reload. Proposed: accept (REQ-23.6 mirrors §17,
   no timer). Otherwise: a shared clock needs a context and touches §17's component, against D-30.
4. Props shape. Proposed: page passes `{ completed, dueDate }` pairs only (not the whole todo) so no `createdAt`
   crosses the server/client boundary. Otherwise: pass `todos` whole; behavior is the same.
5. Placement is fixed "after the §13 paragraph" in DOM order; the exact visual layout (same line or next) is left to
   code. Proposed: leave. Otherwise: a visual layout criterion cannot be measured here.
6. Mutation and unit tests for the client component need fake system time and `hydrateRoot`, as in §17's tests; no new
   tooling.

## Needs a ruling

None.
