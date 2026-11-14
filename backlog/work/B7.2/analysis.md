# B7.2 analysis

Section §36, `spec/contracts/34-complete-all-count.md`; edits to §14 (`12-complete-all.md`) as D-37 lists.

## Completeness

| Check                                | Result | Note                                                                                                                                |
| ------------------------------------ | ------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| Intent without solution words        | pass   | says what a person learns before pressing; no component or prop named                                                               |
| Every behavior has a REQ             | pass   | label with n (36.1), label at 0 (36.2), unfiltered count (36.3), live update (36.4), no extra element (36.5), no count given (36.6) |
| One EARS pattern each                | pass   | state-driven x2, unwanted x1, event-driven x1, ubiquitous x1, optional x1                                                           |
| At most 7 criteria                   | pass   | 7 (AC-36.1 to AC-36.7)                                                                                                              |
| Every Then measurable                | pass   | exact names, role counts, call counts, 0 navigations                                                                                |
| No banned adjective without a number | pass   | none used                                                                                                                           |
| Out of scope                         | pass   | mirrors §32 minus its clear-specific items                                                                                          |
| Unchanged behavior with proof titles | pass   | 6 titles quoted from grep of `complete-all-button.test.tsx` and `e2e/14-complete-all.spec.ts`                                       |
| Dependencies done                    | pass   | D-37 on this branch; §14, §30 (`filterCounts().active`), §32 pattern exist on main                                                  |
| No settled D-n contradicted          | pass   | D-37 edits only: REQ-14.4, REQ-14.5, contracts (52-53), Out of scope line 61 stated not to apply. AC-14.x and REQ ids untouched     |

Pattern chosen as §32: pure `src/lib/complete-all-label.ts` exporting `completeAllLabel(open: number): string`; the count is `filterCounts(todos).active` from the single `listTodos()` call.

Existing tests keep their names and pass: the three unit tests render without `count` (name exact "Mark all complete", REQ-36.6). The four e2e files that find the button (`14`, `16`, `22`, `30`) use Playwright's substring name match, which "Mark all complete (n)" contains; none passes `exact: true` [grep checked].

Red test (card): `src/lib/complete-all-label.test.ts`, red because `completeAllLabel` does not exist.

## Open questions

1. `count` > 0 with `disabled` true (inconsistent props). Proposed: the label follows `count` only and `disabled` alone drives enablement, as §32 does; the page never produces it. Why: §32 precedent, no new rule. Otherwise: add a REQ tying them.
2. Negative or non-integer `count`. Proposed: unspecified, `completeAllLabel(open)` writes no count for open < 1 (same as §32's `>= 1` rule). Why: input is `filterCounts().active`, always a whole number >= 0. Otherwise: add a guard REQ.
3. REQ-36.4 lists "deleted (§19)" besides §32's events, because deleting an open todo changes the open count. Proposed: keep it. Otherwise: AC-36.6 covers only toggle.
4. AC-14.6 (a)/(b) and AC-14.4 Thens still read "named 'Mark all complete'": true without a count or at 0; AC-14.6 (b) names no label while enabled. Proposed: leave them (D-37 lists REQ-14.4, REQ-14.5, contracts only).

## Needs a ruling

None.
