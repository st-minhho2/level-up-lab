# B8.2 advice

## Approaches

**A (recommended): filter the link list inside `TodoFilterNav`.** Before the `map`, compute
`visible = counts === undefined ? FILTER_LINKS : FILTER_LINKS.filter((l) => counts[l.filter] !== 0 || l.filter === selected)`
and map `visible` as today (link + span in one Fragment).

- Pros: one file, no new export or prop (matches §42 "only file of src/ this section changes"); absent from the document, not `hidden`
  (REQ-42.1); REQ-42.7 holds for free, since the component is pure over props and `page.tsx` re-renders it on every revalidate; stays an RSC (no `'use client'`).
- Cons: none found.
- Rules: fits ts-style (RSC, no state), invariants 1 to 4 untouched.

**B (alternative): move the rule into `src/lib/filter-counts.ts` (`visibleFilters(counts, selected)`) and call it from the nav.**

- Pros: the rule is unit-testable and mutation-measured under `src/lib`.
- Cons: a new export with no §42 contract (the spec forbids new lib functions, invariant 1); touches a second file; D-39 says no card changes `src/lib/`.
- Fits rules: no. Rejected.

## Recommendation

A. Names and the REQ-42.6 branch (no `counts`: all three links, no span) stay as in §12/§30.

## Impact

| File                                                                       | Add/Change                                                           | Signature                                                   | ACs                       |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------- |
| `src/components/todo-filter-nav.tsx`                                       | Change: filter links before the map; update the header comment (§42) | `TodoFilterNav({ selected, counts? }): ReactNode` unchanged | AC-42.1 to AC-42.4        |
| `src/components/todo-filter-nav-hide-empty.test.tsx`                       | Add (red step)                                                       | n/a                                                         | AC-42.1 to AC-42.4        |
| `src/components/todo-filter-nav-counts.test.tsx`                           | Change (red step, D-39): AC-30.3 at line 80                          | n/a                                                         | AC-30.3                   |
| `e2e/42-filter-hide-empty.spec.ts`                                         | Add (red step)                                                       | n/a                                                         | AC-42.5 to AC-42.7        |
| `e2e/12-filter.spec.ts` (:131), `e2e/30-filter-counts.spec.ts` (:89, :118) | Change (red step, D-39): AC-12.7, AC-30.6, AC-30.7                   | n/a                                                         | AC-12.7, AC-30.6, AC-30.7 |

Client components changed by the card: none (`TodoFilterNav` is a server component). Both approaches: server-rendered markup is the
nav with the remaining links and spans; JavaScript off and a submit before hydration are not applicable (links, no form or submit);
today three links (all three spans with counts), after: only the non-zero or selected ones. Dropped behavior (links with a 0 count in
the markup) is the intended change, not a con of A.

## Risks

- Migration: no. Dependencies: none. Security/isolation/performance: none (a 3-element filter).
- Existing tests that turn red and are rewritten in the red commit under D-39: AC-30.3 (unit), AC-12.7, AC-30.6, AC-30.7 (e2e).
  Check other e2e that click "Active" or "Completed" with 0 stored in that state: analysis found 16, 21, 25 safe; re-grep at red time.
- `feat(...)` must touch no test file, so every rewrite above lands in the `test(...)` commit.
- Keyboard focus on a link that disappears is out of scope (§42), not a risk to fix in code.
- Medium tier (D-28): one `src/components` file, no prisma/deps/CI.

## Test strategy

| Layer     | File                                                    | ACs                       | Mocks                                                        |
| --------- | ------------------------------------------------------- | ------------------------- | ------------------------------------------------------------ |
| component | `src/components/todo-filter-nav-hide-empty.test.tsx`    | AC-42.1 to AC-42.4        | none (pure; `next/link` renders as `<a>`); rerender for 42.4 |
| component | `src/components/todo-filter-nav-counts.test.tsx`        | AC-30.3 (rewritten)       | none                                                         |
| e2e       | `e2e/42-filter-hide-empty.spec.ts`                      | AC-42.5 to AC-42.7        | none (real DB, seed through the UI)                          |
| e2e       | `e2e/12-filter.spec.ts`, `e2e/30-filter-counts.spec.ts` | AC-12.7, AC-30.6, AC-30.7 | none                                                         |

Red proof: `scripts/verify-red.sh B8.2` must fail on assertions (the skeleton renders three links), not on imports.

## Mutation hot spots

`src/components` is outside the mutation scope (`src/lib` + `src/actions`), so no score applies. The cases an assertion must still pin:
`!== 0` versus `> 0`; `|| filter === selected` (AC-42.2, AC-42.3); the `counts === undefined` branch (AC-42.4 last render);
order after filtering; AC-42.1 `textContent` "All(4)Completed(4)" and 0 `hidden`/`aria-hidden`.

## Questions settled / escalated

```
Question:    Do REQ-30.3/30.4 "three numbers" need an edit beyond D-39's list?
Class:       P0 no conflict
Sources:     spec/contracts/40-filter-hide-empty.md:25 "The \"three numbers\" of §30 REQ-30.3 and REQ-30.4 and the three spans of §30's"
Conflict:    none
Verdict:     §42 states the reading; no further edit (spec wins, D-39 list respected).
Next action: none
Must not:    edit REQ-30.3/30.4 without a D-39 amendment
Doc drift:   none
Escalate:    none
```

```
Question:    Focus on a link that disappears?
Class:       P0 no conflict
Sources:     spec/contracts/40-filter-hide-empty.md:71 "Restoring or moving focus when the focused link disappears after a change of counts"
Conflict:    none
Verdict:     Out of scope by §42 Out of scope.
Next action: none
Must not:    add focus code
Doc drift:   none
Escalate:    none
```

```
Question:    New test file names
Class:       P2 spec silent
Sources:     backlog/work/B8.2/analysis.md:21 "New tests: AC-42.1 to AC-42.4 in `src/components/todo-filter-nav-hide-empty.test.tsx`"
Conflict:    none
Verdict:     Accept (testing.md: one e2e file per section, `<section>-` prefix).
Next action: use the names in the red commit
Must not:    reuse an existing test file for new ACs
Doc drift:   none
Escalate:    none
```
