# B6.2 advice

## Approaches

**A (recommended): the page computes, the nav renders.** Matches §30 "Function contracts" exactly.

- Change: new pure `src/lib/filter-counts.ts` (`FilterCounts`, `filterCounts`); `TodoFilterNav` gains optional
  `counts?: FilterCounts` and renders, per link, a `Fragment` of `<Link>` + `<span>(n)</span>` (span a sibling of the
  link, never inside it, so the link name stays "All"/"Active"/"Completed"); `page.tsx` renders
  `<TodoFilterNav selected={filter} counts={filterCounts(todos)} />` from the unfiltered, unsearched `todos`.
- Pros: one `listTodos()` read (§30 note); `todos` is the stored list, so REQ-30.3 holds by construction; nav stays a
  Server Component (REQ-30.4 live update comes from the existing `revalidatePath('/')`, same path §13 and §26 use);
  no `counts` prop gives §12's markup (REQ-30.6), so AC-12.4 stays green untouched.
- Cons: `page.tsx` is the batch's shared file (D-33: B6.4 also edits it), so one line there may conflict on merge.
- Fits rules: pure lib module (no Prisma, no `server-only`), no action, no schema, no new dependency.

**B (alternative): the nav takes `todos` and counts inside.** Cons: contradicts the §30 signature (`counts`, not
`todos`); makes `counts` mandatory in practice, so REQ-30.6/AC-30.4 and AC-12.4's `renderNav(selected)` break or need a
second prop; moves the "stored, not filtered" guarantee from the page to a component. Not compliant with §30. Rejected.

## Recommendation

A. Spec-given; smallest diff; nothing existing is touched or weakened.

## Impact

| File                                 | Add/Change | Signature                                                                                                                                                                                       | ACs                 |
| ------------------------------------ | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| `src/lib/filter-counts.ts`           | Add        | `export interface FilterCounts { readonly all: number; readonly active: number; readonly completed: number }` · `filterCounts(todos: readonly { readonly completed: boolean }[]): FilterCounts` | AC-30.1             |
| `src/components/todo-filter-nav.tsx` | Change     | `TodoFilterNav({ selected, counts }: { readonly selected: TodoFilter; readonly counts?: FilterCounts }): ReactNode`                                                                             | AC-30.2, 30.3, 30.4 |
| `src/app/page.tsx`                   | Change     | `<TodoFilterNav selected={filter} counts={filterCounts(todos)} />`; header comment adds §30                                                                                                     | AC-30.5, 30.6, 30.7 |
| `spec/features-map.md`               | Change     | new row F28 (§30): files above, tests below, ✗ then ✅ at close; in the code-writer's `docs(map)` commit (CI `check-features-map.sh` fails on an unlisted `src/lib` module)                     | n/a                 |

Test files are in Test strategy. `src/lib/CLAUDE.md` and `src/components/CLAUDE.md` rows are guides; D-33 keeps
package guides out of card plans, so leave them out of `plan.md`'s Files list (note it, do not extend silently).
Not touched (spec says so): `src/lib/todos.ts`, `src/actions/todos.ts`, `src/lib/todo-filter.ts`, `prisma/`.

Client components changed: none. `TodoFilterNav` is a Server Component (no `'use client'`) and stays one, so there is
no form and no submit in it.

| Component           | Approach | Server-rendered markup                    | Submit, JS off        | Submit, before hydration      | Today vs after                                                                        |
| ------------------- | -------- | ----------------------------------------- | --------------------- | ----------------------------- | ------------------------------------------------------------------------------------- |
| `TodoFilterNav` (A) | A        | links plus `<span>(n)</span>` in the HTML | n/a: links, no submit | n/a: links work as plain GETs | today 3 links; after 3 links each followed by a count, all in the first HTML response |
| `TodoFilterNav` (B) | B        | same markup                               | n/a                   | n/a                           | same; B drops the optional-prop behavior (REQ-30.6), listed as a con above            |

Layout note: the nav is `flex gap-3`, so a `Fragment` makes link and count separate flex items, each 12 px apart
(`All  (4)  Active`). §30 forbids styling beyond the existing nav classes and a wrapper `<span>` would add a span the
AC-30.2 count does not expect, so ship the Fragment. A wrapper `<div>` is the compliant fix if the lead dislikes the
spacing; it needs the spec's blessing, not a guess.

## Risks

- Migration: none. Security: none (read-only, no input). Performance: `filterCounts` is O(n) on the list the page
  already holds; no second query.
- Isolation: nothing stateful, no env.
- Existing tests that could turn red: `e2e/12-filter.spec.ts` `expectFilterLinksVisible` uses
  `getByRole('link')...toHaveText([...])` (links only, spans are not links: safe); `e2e/12`, `16`, `21`, `25` use
  `getByRole('link', { name, exact: true })` (names unchanged: safe); `todo-filter-nav.test.tsx` AC-12.4 renders
  without `counts` (safe). Check no e2e uses `getByText('(')`/loose `getByText('2')` on the page: grep found none in the nav
  files; the implementer should re-grep `getByText(` before the feat commit.
- Merge conflict on `page.tsx` and `spec/features-map.md` (union-merge rows, B1.89) with B6.1/B6.3: rebase, keep one F28 row.
- Skeleton red proof: skeleton must accept `counts` yet render nothing for it, and `filterCounts` must throw
  `NotImplementedError`, so component tests fail on an assertion, not an import or type error (unused-prop lint: use it
  in a no-op way the skeleton can justify, or destructure after `void`).
- Dependencies: none new.

## Test strategy

| Layer     | File                                                                                                                                   | ACs                                                              | Mocks                                                                                                                                                                      |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit      | `src/lib/filter-counts.test.ts`                                                                                                        | AC-30.1 (card Test line title; 3 inputs, input frozen/unchanged) | none (pure)                                                                                                                                                                |
| Component | `src/components/todo-filter-nav-counts.test.tsx` (new file, precedent `todo-item-created.test.tsx`; leaves the AC-12.4 file untouched) | AC-30.2, AC-30.3, AC-30.4                                        | none (no actions imported by the nav)                                                                                                                                      |
| e2e       | `e2e/30-filter-counts.spec.ts`                                                                                                         | AC-30.5, AC-30.6, AC-30.7                                        | none; seed with `PrismaClient`, `openHydrated` + `watchNavigations` as `e2e/26-page-title.spec.ts`; AC-30.6 steps: check D, "Mark all complete", reload, "Clear completed" |

AC-30.4 asserts the nav's `textContent` is exactly "AllActiveCompleted" and 0 spans. AC-30.2 asserts via
`link.nextElementSibling` tag `SPAN` and text. Titles start `AC-30.n:`; 7 criteria, all covered (`check-ac-coverage.sh`).
`page.test.ts` stays as is (it covers `generateMetadata` only); page wiring is proven by AC-30.5 in e2e.

## Mutation hot spots

- `filterCounts`: `!todo.completed` vs `todo.completed` predicate swap; `all` as `length` vs sum; the empty-list zeros;
  mutating the input (sort/splice).
- Mutation covers `src/lib` and `src/actions` only: the nav's `counts === undefined` branch and the page wiring
  (`todos` vs `shown`) are not scored; AC-30.4 and AC-30.5 are the guard.

## Questions settled / escalated

```
Question:    Does the count go inside the link text (card wording "each link reads") or in a span after it?
Class:       P1 code ≠ spec (card wording vs section)
Sources:     spec/contracts/28-filter-counts.md:17 "in a `<span>` that follows its link inside the "Filter todos" navigation"
             backlog/work/B6.2/analysis.md:20 "Where the count sits."
Conflict:    card Acceptance says "each filter link reads its name and the number" / §30 REQ-30.2 says the link's own text and name stay "All", "Active", "Completed"
Verdict:     §30 governs (authority 3; the card is a pointer, and the same §30 lists a count inside the link text under Out of scope). It also protects four e2e files with exact link names.
Next action: implement the span after the link; the lead ticks "Lead approves spec" in §30.
Must not:    render "All (4)" as link text.
Doc drift:   none
Escalate:    none
```

```
Question:    Who adds the features-map row F28, and when?
Class:       P2 spec silent on timing (D-33 and spec/CLAUDE.md answer it)
Sources:     spec/CLAUDE.md "the map in code-writer's own `docs(map)` commit, right after `feat`"
             backlog/00-decisions.md:58 "feature ids F27–F32 in that order"
Conflict:    none
Verdict:     B6.1 = F27, B6.2 = F28. The code-writer adds the F28 row (✗ until Done) in the `docs(map)` commit after `feat`; spec-analyst did not and need not.
Next action: add the row listing `src/lib/filter-counts.ts`, `src/components/todo-filter-nav.tsx`, `src/app/page.tsx` and the three test files; flip ✅ and the §30 status in `technical-requirements.md` only in the closing lane.
Must not:    edit the map in the `test(` or `feat(` commit.
Doc drift:   spec/features-map.md in the `docs(map)` commit
Escalate:    none
```
