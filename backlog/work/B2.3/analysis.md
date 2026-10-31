# B2.3 analysis

Section: §14 Todos: mark all complete, `spec/contracts/12-complete-all.md` (new, D-20). 10 REQ, 6 AC.

## Completeness

| Check                                | Result | Note                                                                                                                                                 |
| ------------------------------------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Intent without solution words        | pass   | one person-level paragraph; no module, table or library named                                                                                        |
| Every behavior has a REQ             | pass   | mark, keep others/order, count, enabled, disabled, persistence, nothing open, failure, failure message placement, recovery                           |
| One EARS pattern each                | pass   | event 1.1-1.3 and 14.10, state 14.4-14.5, ubiquitous 14.6, unwanted 14.7-14.9                                                                        |
| At most 7 criteria                   | pass   | 6 (AC-14.1 to AC-14.6)                                                                                                                               |
| Every Then measurable                | pass   | exact call arguments, result objects, counts, message text, row order                                                                                |
| No banned adjective without a number | pass   | none used                                                                                                                                            |
| Out of scope stated                  | pass   | mark all incomplete, confirmation, undo, count message, filtered or searched view, two tabs, ordering, Zod                                           |
| Unchanged behavior with proof titles | pass   | 7 rows; titles copied from `git grep` on `src/` and `e2e/` in this worktree                                                                          |
| Dependencies done                    | pass   | card has none; §5, §9, §10, §11 all done and on main                                                                                                 |
| No settled D-n contradicted          | pass   | D-20 (section 14, `12-complete-all.md`, own modules, "mark all complete needs no ruling") followed; D-11 message and §11 logging reused, not changed |

Limits taken from existing sections: message `Could not save, try again` (§10 `MUTATION_FAILED_MESSAGE`), list order
`createdAt desc` (§5), log entry shape (§11). No new number was invented.

## Open questions

1. **§10 and §11 name four actions; §14 adds a fifth.** REQ-10.1, REQ-11.1 and the `MutationActionName` union in §11
   list create, toggle, edit and clear only. Proposed: §14 states its own failure and logging behavior (REQ-14.8) and its
   function contracts widen `MutationActionName` by one member, `'completeAllTodosAction'`; §10 and §11 text stay
   untouched (additive, no existing behavior changes, no D-n needed per D-20's "needs no ruling"). Why: the logger is
   typed by that union, so a fifth action cannot log without it. If the lead reads this as rewriting §11, the
   alternative is a D-n and a `docs(spec): §11 …` commit first; the cost is one more PR before B2.3's red test.
2. **The button's `disabled` input once B2.1 filters the list.** REQ-14.4/14.5 speak of "todos" (every stored todo). If
   B2.1's `page.tsx` passes a filtered list to the component expression, the button would be disabled in the Completed
   view and enabled-with-no-effect in others. Proposed: the mounting card computes `disabled` from the unfiltered list;
   §14 puts "marking only a filtered view" out of scope. Whoever merges second (B2.1 or B2.3) reconciles it in
   `page.tsx`; changes otherwise: a divergence that `/spec-trace` would report after both merge.
3. **Index table rows.** `spec/technical-requirements.md` gets a §14 row now; B2.1 (§12) and B2.2 (§13) will add their
   rows to the same table, so expect a trivial adjacent-line merge conflict. Proposed: resolve in the second PR to
   merge, keep rows in numeric order.
4. **e2e file name.** Existing e2e files carry the section number (`05`, `06`, `09`, `10`), not the contract file number.
   Proposed: `e2e/14-complete-all.spec.ts` for AC-14.6. Changes otherwise: a rename in the red commit only.
5. **Features map.** `spec/features-map.md` has no row for this feature (F10-F12 are reserved by the card ids, not yet
   written). Proposed: the lead adds F12 (§14: `src/lib/todo-complete-all.ts`, `src/actions/complete-all.ts`,
   `src/components/complete-all-button.tsx`, `src/app/page.tsx`) in the `docs(map)` commit with the `feat`; the analyst
   does not edit the map.
6. **"Mark all complete" semantics for a concurrent edit.** Two tabs acting at once is out of scope (as in §9); a todo
   created between the click and the update is simply not-completed state in storage and is marked by the one
   `updateMany`. No behavior is specified for it. Proposed: leave silent.

## Needs a ruling

None. Question 1 is the only one near a ruling: the proposal is additive and D-20 says this card needs none; the lead
may still choose the D-n route.
