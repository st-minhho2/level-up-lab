# B2.2 analysis

Section: §13 in `spec/contracts/11-remaining-count.md` (written; 5 REQ, 7 AC). Index row added with status ✗.

## Completeness

| Check                                | Result | Note                                                                                                                                                                                    |
| ------------------------------------ | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Intent without solution words        | pass   | states what a person sees (how many are open); no component, query or file named                                                                                                        |
| Every behavior has a REQ             | pass   | show count and wording (13.1), empty list (13.2), update on create and toggle (13.3), derived from storage (13.4), all stored todos and not completed (13.5)                            |
| One EARS pattern each                | pass   | ubiquitous 13.1, 13.4, 13.5; state-driven 13.2; event-driven 13.3                                                                                                                       |
| At most 7 criteria                   | pass   | 7 (AC-13.1 … AC-13.7); an eighth would be a second section                                                                                                                              |
| Every Then measurable                | pass   | exact numbers, exact strings, element and `listitem` counts; no adjective                                                                                                               |
| No banned adjective without a number | pass   | none used                                                                                                                                                                               |
| Out of scope                         | pass   | completed count, per-filter or per-search count, other plurals, live region, page title, two tabs, optimistic update                                                                    |
| Unchanged behavior with proof titles | pass   | 7 rows, titles copied from `git grep` on `e2e/05-todos.spec.ts`, `e2e/09-clear-completed.spec.ts`, `src/lib/todos.test.ts`, `src/components/todo-item.test.tsx`                         |
| Dependencies done                    | pass   | card says `Depends on: —`; but see question 2 (merge order on `page.tsx`)                                                                                                               |
| No settled D-n contradicted          | pass   | D-20 says the count needs no ruling and fixes §13 and `11-remaining-count.md`; choice (a): logic in its own module `src/lib/todo-count.ts`; `todos.ts` and `actions/todos.ts` untouched |

Card: `Spec:` and `Test:` set in `backlog/plan/E2-todos-plus.md`. Test red because `src/lib/todo-count.ts` does not
exist; the test-writer adds the skeleton that throws `NotImplementedError` so the red is on behavior (`testing.md`).
Mutation scope: `todo-count.ts` is in `src/lib` and counts toward the 70 % gate; AC-13.1 (`false` filter, empty,
input untouched) and AC-13.2 (the `=== 1` boundary, 0 and 11) are written to kill the obvious survivors.

## Open questions

1. **Wording and plural.** Question: what exact text? Proposed decision: "N item left" for 1, "N items left" otherwise,
   including "0 items left" (TodoMVC wording). Why: a measurable Then needs an exact string; the card gives none.
   Otherwise: only the strings in REQ-13.1, AC-13.2 and the Function contracts change.
2. **Where it renders, and who holds `page.tsx`.** Question: where on `/`, and when may B2.2 edit `src/app/page.tsx`?
   Proposed decision: the spec fixes only "outside the `<ul>`, in both states" (so it is never a `listitem`, AC-13.4);
   the lead places it in the plan (suggestion: directly after `<ClearCompletedButton />`, before the list or "No todos
   yet"). B2.1 holds `page.tsx`, so B2.2's `feat` waits until B2.1 is not Doing (`next-task.sh --check`); the card's
   `Depends on: —` could say so, not changed here (not my field). Why: D-20 choice (a). Otherwise: a merge conflict on
   `page.tsx`, or two Doing cards on one shared mount point.
3. **Count against the filter (B2.1) and search (B2.5).** Question: does "remaining" count what is shown or what is
   stored? Proposed decision: what is stored (REQ-13.5): with the Completed filter on, the count still reads the open
   todos. Why: the count is a fact about the list, not about the view, and it needs no extra query. Otherwise: if B2.1
   changes `listTodos()` to take a filter, `page.tsx` must still hold the unfiltered list for `countRemaining`
   (B2.1 and B2.5 owners must keep it; this is a coupling to settle when B2.1's section lands). If the human wants the
   count of the visible rows instead, REQ-13.5 and AC-13.1's meaning of "the whole list" change and a ruling is needed.
4. **Source of the number.** Question: separate `count()` query or derived? Proposed decision: derive it from the array
   `listTodos()` already returns (REQ-13.4, the Function contracts note). Why: no change to the shared `src/lib/todos.ts`,
   no extra database call, no race between two reads. Otherwise: a new `src/lib` read function and a mock in lib tests.
5. **Live announcement.** Question: should the count be a live region (`role="status"`)? Proposed decision: no, listed
   out of scope. Why: no §7 or §10 rule asks for it and an announcement would need its own criterion. Otherwise: one
   more criterion (AC-13.8 would force a second section, the table is full at 7).

## Needs a ruling

None. D-20: "A remaining-items count and 'mark all complete' need no ruling." Questions 1 to 5 are proposals the lead
can accept in `plan.md`; question 3 becomes a ruling only if the lead wants the visible-rows count.
