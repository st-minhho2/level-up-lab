# B2.5 decision request (next D-n) — dev-lead to lead

Context: section 16 REQ-16.5 says "a query longer than 200 characters matches no todo"; the `searchTodos` contract line
says `title.toLowerCase().includes(query.toLowerCase())` with no length rule. `'İ'` (U+0130) lowercases to two code
units, so a title `'İ'.repeat(200)` (valid under §5's `max(200)`) matches the query `'i̇'.repeat(101)` (length 202).
Reachable only through a hand-built `/?q=` address (the form's `maxLength` stops typing it); no stored todo or count
changes. Phase A (green 29a9d4e) implements the contract line word for word. Found by the reviewer, diff review pass 1
finding 1 (`review.md`); `advisor` verdict: spec ≠ spec in one approved section, a tie only the lead can break.

| Option | Behavior                                                                                                      | Spec change                                                                               | Cost                                                                                                        | Risk                                                                                       |
| ------ | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| A      | any trimmed query with `length > 200` (JS `.length`, the unit of §5's `max(200)`) returns `[]`, no exceptions | contract line gains the length rule; new AC-16.8 pins the U+0130 case (AC-16.2 unchanged) | `docs(spec): §16`, one red `test(todos)`, a ~2-line guard in `searchTodos` (`feat`), unit + mutation re-run | low: the guard sits before `filter`, order and new-array result unchanged                  |
| B      | REQ-16.5 narrowed: a longer query can match when Unicode lowercasing lengthens the title                      | REQ-16.5 prose only                                                                       | `docs(spec): §16`; no code or test                                                                          | medium: the promise "over 200 matches nothing" stays untrue for one surprising input class |

Recommended: **A** — REQ-16.5 is the user-visible promise and the fix is small and local. Flips to **B** if the lead
wants phase A closed with no further commits and accepts U+0130 as out of practical reach.

Proposed D-n (A): "§16 `searchTodos` returns no todo for a trimmed query whose `length` exceeds `SEARCH_QUERY_MAX_LENGTH`
(UTF-16 code units, as §5 counts titles), before any comparison; a new AC-16.8 pins a title of 200 `İ` against a query of
101 `i̇`."

Needed before phase B's round-2 plan approval (the mount and e2e build on `searchTodos`). Either option re-ticks
section 16's `Lead approves spec` box.
