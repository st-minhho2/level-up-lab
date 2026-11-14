# B6.4 analysis

## Completeness

| Check                                | Result | Note                                                                                                         |
| ------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------ |
| Intent without solution words        | pass   |                                                                                                              |
| Every behavior has a REQ             | pass   | REQ-32.1 to 32.6                                                                                             |
| One EARS pattern each                | pass   | state-driven x2, unwanted, event, ubiquitous, optional                                                       |
| At most 7 criteria                   | pass   | 7                                                                                                            |
| Every Then measurable                | pass   | exact label strings, role counts                                                                             |
| No banned adjective without a number | pass   |                                                                                                              |
| Out of scope                         | pass   | the deleted-count message stays §9's exclusion                                                               |
| Unchanged behavior with proof titles | pass   | titles quoted from grep of `clear-completed-button.test.tsx` and `e2e/09-clear-completed.spec.ts`            |
| Dependencies done                    | pass   | D-33 only                                                                                                    |
| No settled D-n contradicted          | pass   | D-33: file, section, component, count passed from `page.tsx` honoured; the "not §9's message" line is in §32 |

## Open questions

1. Prop optional. Proposed: `completedCount?: number`, absent = "Clear completed". Why: five existing component tests
   render `<ClearCompletedButton disabled=… />` and find the name "Clear completed"; they stay untouched. Otherwise a
   required prop breaks them and forces rewriting tests.
2. A new pure `src/lib/clear-completed-label.ts`. D-33 names no lib file; I added it so the card's `Test:` is red on a
   missing export and the format has one home. Otherwise the label is a template literal in the component and the
   first red test is the component test (red on an assertion, not a missing export).
3. Count source: `filterCounts(todos).completed` (§30), no second query and no new count function. Otherwise a new
   `todos.filter(...).length` in `page.tsx`.
4. Format `Clear completed (n)` follows the card; the label is the accessible name. Playwright's substring name match
   keeps seven existing e2e lookups of "Clear completed" working; unit tests with `getByRole` default to exact only
   in new tests.
5. `spec/features-map.md` needs row F30 (§32: `src/lib/clear-completed-label.ts`, `src/components/clear-completed-button.tsx`,
   `src/app/page.tsx`; tests `src/lib/clear-completed-label.test.ts`, a component test, `e2e/32-clear-completed-count.spec.ts`);
   not mine to edit. The index row for §32 is registered with status ✗.
6. §9's own text is not edited: its "a message showing the deleted count" exclusion is a different feature, so the
   distinction is stated in §32 (REQ-32.5 and the paragraph under the requirements).

## Needs a ruling

None.
