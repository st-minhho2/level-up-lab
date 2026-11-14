# B8.2 analysis

Section: §42, `spec/contracts/40-filter-hide-empty.md` (written, 7 REQ, 7 AC). Edits under D-39 in `10-filter.md` (REQ-12.1, AC-12.7) and `28-filter-counts.md` (REQ-30.1, REQ-30.5, AC-30.3, AC-30.6, AC-30.7, Out of scope).

## Completeness

| Check                                | Result | Note                                                                                                                      |
| ------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------- |
| Intent without solution words        | pass   | says which view is offered, not how it is rendered                                                                        |
| Every behavior has a REQ             | pass   | hide, keep current, order, all-zero, landmark, without counts, change of counts: REQ-42.1 to REQ-42.7                     |
| One EARS pattern each                | pass   | optional feature (42.1, 42.6), state-driven (42.2, 42.4), ubiquitous (42.3, 42.5), event-driven (42.7)                    |
| At most 7 criteria                   | pass   | AC-42.1 to AC-42.7 (4 component, 3 e2e)                                                                                   |
| Every Then measurable                | pass   | link names in order, span texts, counts of links and spans, `aria-current`, address                                       |
| No banned adjective without a number | pass   | none used                                                                                                                 |
| Out of scope                         | pass   | focus on a disappearing link, announcements, animation, hiding the current link, other orders, search-following counts    |
| Unchanged behavior with proof titles | pass   | titles for AC-12.4, AC-30.4, AC-30.2, AC-30.5, AC-12.5 copied from the test files (grep)                                  |
| Dependencies done                    | pass   | §12 and §30 are done (✅ in the index); D-39 settled                                                                      |
| No settled D-n contradicted          | pass   | only the edits D-39 lists are made; §6, §14, §24, §36 untouched; `src/app/page.tsx`, `src/lib/`, `src/actions/` unchanged |

Tests the red step rewrites (D-39): `src/components/todo-filter-nav-counts.test.tsx:80` (AC-30.3), `e2e/12-filter.spec.ts:131` (AC-12.7), `e2e/30-filter-counts.spec.ts:89` (AC-30.6) and `:118` (AC-30.7).
New tests: AC-42.1 to AC-42.4 in `src/components/todo-filter-nav-hide-empty.test.tsx`; AC-42.5 to AC-42.7 in `e2e/42-filter-hide-empty.spec.ts`.
Checked and not broken: `e2e/16-search`, `21-clear-search`, `25-search-shortcut` follow "Active" or "All" only with open todos stored.

## Open questions

1. **REQ-30.4 and REQ-30.3 say "the three numbers".** D-39 does not list them. Proposed: leave them as written and state in §42 (done, one sentence) that "three numbers" reads "the number of each link §42 renders". Why: it needs no extra edit of a section D-39 did not name. Otherwise: edit REQ-30.3 and REQ-30.4, which needs a D-39 amendment.
2. **Focus on a link that disappears** (a keyboard user on "Active" checks the last open todo, the link unmounts). Proposed: out of scope, as the focused element is the checkbox, not the link; a link can only disappear when it is not the current filter, so it cannot be focused after a click on it. Otherwise: a focus rule, as B8.3 needs.
3. **Prettier realigned the tables of §12 and §30** (whitespace-only changes on rows other than the edited ones). Proposed: accept. Otherwise: revert the whitespace and hand-align.
4. **New test file names** (`todo-filter-nav-hide-empty.test.tsx`, `e2e/42-filter-hide-empty.spec.ts`) are proposed; the e2e name follows "one file per section" with the section number.

## Needs a ruling

None.
