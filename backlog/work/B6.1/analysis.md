# B6.1 analysis

Section 29, `spec/contracts/27-escape-new-todo.md`, 7 REQ, 7 AC. Fixed by D-33; lifts nothing (§5 is silent on Escape).

## Completeness

| Check                              | Result | Note                                                                                                                    |
| ---------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------- |
| Intent without solution words      | pass   | states the person's outcome; no handler, ref or state named                                                             |
| Every behavior has a REQ           | pass   | empty + preventDefault 29.1, counter 29.2, nothing stored 29.3, pending 29.4, other keys 29.5, scope 29.6, markup 29.7  |
| One EARS pattern each              | pass   | event 29.1/29.2, ubiquitous 29.3/29.6/29.7, state 29.4, unwanted 29.5                                                   |
| At most 7 criteria                 | pass   | 7                                                                                                                       |
| Every Then measurable              | pass   | values, counts, `defaultPrevented`, call counts, addresses, row order                                                   |
| No banned adjective without number | pass   | none used                                                                                                               |
| Out of scope                       | pass   | listed, including a new lib predicate and clearing the alert                                                            |
| Unchanged behavior with proof      | pass   | 6 rows, titles quoted from grep of `todo-form.test.tsx`, `e2e/18-title-counter.spec.ts`, `e2e/27-escape-search.spec.ts` |
| Dependencies done                  | pass   | D-33 only; §18 and §27 are ✅                                                                                           |
| No settled D-n contradicted        | pass   | D-33: only `src/components/todo-form.tsx` changes; `page.tsx` and no other component touched                            |

## Open questions

1. **Escape while a save is pending.** Proposed: ignored (REQ-29.4), as §28 REQ-28.5 does. Why: the box is uncontrolled
   and the form reset after the action writes `defaultValue` from the draft (§18 REQ-18.6/18.7); emptying mid-save
   would race that reset and the failure refill. Otherwise: REQ-29.4 and AC-29.5 are dropped and the code must prove
   the race away.
2. **Escape does not clear a shown alert** (§5 `Title is required`, §10 `Could not save, try again`). Proposed: keep it
   (REQ-29.7, AC-29.6); the alert comes from `useActionState`, which cannot be cleared without a new state or wrapper
   (the file warns against a wrapper). Otherwise: a new requirement and a state change in the form.
3. **Reuse of `isSearchEscape` (§27) from `@/lib/escape-search`.** Proposed: import it; D-33 allows only
   `todo-form.tsx` to change, so no new `src/lib` file. The name says "search" but the predicate is key-only.
   Otherwise: a new lib file contradicts D-33's mounts.
4. **Red test is a component assertion, not a missing export.** No function is added, so AC-29.1 is red on the box
   still holding `Buy milk`, not on an import. Fits `testing.md` (fails on an assertion).
5. **`spec/features-map.md` row F27** (§29, `src/components/todo-form.tsx`, `src/components/todo-form.test.tsx`,
   `e2e/29-escape-new-todo.spec.ts`) is not added by me (not my write path). Proposed: code-writer's `docs(map)`
   commit, status ✗ until merged (B1.85 pending check). E2E file name follows the existing `e2e/<§>-<slug>.spec.ts`
   pattern with §29.

## Needs a ruling

None.
