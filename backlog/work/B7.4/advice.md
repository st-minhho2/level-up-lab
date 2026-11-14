# B7.4 advice: the search form says how many todos match (§38)

Governing section: `spec/contracts/36-search-count.md` (§38), Tier full, 7 REQ, 7 AC. The spec pins element, position,
text, source of the number and the two files that change. No P1 to P6 conflict was found; analysis.md's four open
questions are answered below.

## Approaches

### A (recommended): optional `count` prop, decided inline in `TodoSearchForm`

- Change: `TodoSearchForm` gains `count?: number`. After the `isSearchInEffect(query) && <Link>` block, as the last child
  of `<form>`: `{isSearchInEffect(query) && Number.isInteger(count) && count !== undefined && count >= 1 && <p>{count === 1 ? '1 match' : `${count} matches`}</p>}`.
  `page.tsx` passes `count={shown.length}` (always; the form decides).
- Pros: exactly the spec's contract line; no new lib function or helper (the spec forbids one); reuses
  `isSearchInEffect` already imported; a render without `count` is byte-identical (REQ-38.7); the number is the one the
  list renders, so it cannot drift from the rows (REQ-38.2).
- Cons: the `Number.isInteger` guard needs a TypeScript narrowing (`typeof count === 'number'`) written without `as`.
- Fits rules: yes. No mutation, action, schema or Prisma touch (invariants 3, 4); the component is presentational.

### B (alternative): the page gates the prop (`count={isSearchInEffect(query) ? shown.length : undefined}`)

- Change: same form edit but without the `isSearchInEffect` test inside the form.
- Pros: the form is simpler.
- Cons: contradicts REQ-38.3 and AC-38.3, which render the form with (query `''`, `count` 3) and expect no paragraph, so
  the form itself must gate. It also moves a rule into `page.tsx`, which has no unit test (`page.test.ts` covers only
  `generateMetadata`). Not compliant with the spec; listed only to reject it.

## Recommendation

Approach A. Mind the order inside the `<form>`: the paragraph goes after the Clear-search block, not beside the
"Search" button (REQ-21.1 keeps the link after the button; the count follows both).

## Impact

| File                                       | Add/Change                                      | Signature                                                                                                                                                           | ACs                |
| ------------------------------------------ | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| `src/components/todo-search-form.tsx`      | Change                                          | `TodoSearchForm({ filter, query, count }: { readonly filter: TodoFilter; readonly query: string; readonly count?: number }): ReactNode`; header comment gains `§38` | AC-38.1 to AC-38.4 |
| `src/app/page.tsx`                         | Change                                          | `<TodoSearchForm filter={filter} query={query} count={shown.length} />`; header comment gains `§38`                                                                 | AC-38.5 to AC-38.7 |
| `src/components/todo-search-form.test.tsx` | Change (test commit, existing file; answers Q4) | new `it('AC-38.n: …')` cases                                                                                                                                        | AC-38.1 to AC-38.4 |
| `e2e/38-search-count.spec.ts`              | Add (test commit)                               | one file for §38                                                                                                                                                    | AC-38.5 to AC-38.7 |
| `spec/features-map.md`                     | Change (`docs(map)` commit after `feat`)        | F36 row                                                                                                                                                             | n/a                |
| `src/components/CLAUDE.md`                 | Change (optional, see Risks)                    | the `todo-search-form.tsx` line                                                                                                                                     | n/a                |

Client component changed: `todo-search-form.tsx` (`'use client'`, for the §25/§27 refs and handlers).

- Approach A, server-rendered markup: today the form SSRs label, input, hidden filter, button, and the link while a
  search is in effect. After: the same plus a `<p>` last in the form when the conditions hold. The `<p>` is plain
  markup in the SSR HTML, so it needs no hydration.
- Approach A, submit with JavaScript off: today a native GET to `/` with `q` (and `filter`); after: identical. The new
  `<p>` has no input, no handler and no `name`, so it adds no field. The next page SSR shows the new count.
- Approach A, submit before hydration: today the native GET submit works; after: identical, the count comes from the
  server render of the next page. No behavior is dropped.
- Approach B: same three lines, except the paragraph would show for (query `''`, `count` 3) if the page forgot to gate
  it. Con listed under B above; nothing else is dropped.

## Risks

- Migration: none. No schema, action, Zod schema, env var or dependency.
- Security: none; `count` is a number from `shown.length` and is rendered as React text.
- Performance: none; no second query (`shown.length` already exists).
- Isolation: nothing stateful is hard-coded; no port, schema or cache key.
- Existing tests that could turn red:
  - `todo-search-form.test.tsx` AC-16.5 "no list items" and AC-21.4 render without `count`; unchanged (REQ-38.7). A
    `<p>` is not a list item.
  - e2e files find "N items left", "No todos match your search" and `/^\d+ \/ 200$/` by exact text or pattern; the
    spec's collision list was re-checked, and a grep of `e2e/` for `match` (case-insensitive substring) finds no
    spec that matches by it. In AC-38.5's `/?q=milk` page, "2 matches" and "2 items left" differ.
  - Tests that assert `getByRole('search')` `textContent` or the form's whole `innerHTML` with a search in effect would
    change only if they pass `count`; the existing ones do not.
- Doc drift: `src/components/CLAUDE.md` still says `todo-search-form.tsx` "stays a Server Component ... no
  `'use client'`", yet the file is `'use client'` since §25/§27. This predates the card; it needs a one-line fix, but
  that file is under `src/`, so it goes in the lead's plan (not in the `feat` commit's scope without approval). Also the
  features-map F36 row and `spec/technical-requirements.md` §38 row, which analysis.md says the orchestrator adds.
- Branch hygiene: analysis.md says the worktree once held siblings' uncommitted edits; check `git status` is limited to
  this card's files before each commit.

## Test strategy

| Layer             | File                                       | ACs                                                                                                                                                                                                                                                                                                          | Mocks                                                                                |
| ----------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| component (jsdom) | `src/components/todo-search-form.test.tsx` | AC-38.1 (last child after "Clear search", no id/role/aria-*, 0 status/alert/log), AC-38.2 ("1 match", "2 matches", "11 matches", 1 `p` each), AC-38.3 (six renders, 0 `p`, `innerHTML` equals the render with no `count`), AC-38.4 (box, button, link href `/?filter=completed`, hidden input, 0 list items) | none beyond what the file already mocks (`next/link` is not mocked today; keep that) |
| e2e               | `e2e/38-search-count.spec.ts`              | AC-38.5 (five addresses, count equals rows), AC-38.6 (tick D under `active&q=milk`, no navigation, reload, then `/?q=milk`), AC-38.7 (snapshot of titles and flags, both buttons enabled, "N items left" unchanged)                                                                                          | none (real database, seeded through the UI or the existing e2e helpers)              |

Red reason for the card's named test (AC-38.1): the form ignores `count`, so the `p` is absent: an assertion failure,
not an import failure. The skeleton commit needs only the optional prop in the signature (ignored) so the test
compiles; it should not render the paragraph. AC-38.3 and AC-38.4 hold against the skeleton (no `p`, unchanged
markup); that is correct (they guard REQ-38.3, REQ-38.6, REQ-38.7), and `scripts/verify-red.sh` judges the card's
named AC-38.1 and AC-38.2 plus the e2e as the red set.

## Mutation hot spots

All in `src/components/todo-search-form.tsx` (outside the `src/lib` + `src/actions` mutation scope, but each is pinned by a test):

- `count === 1` vs `count !== 1` or the two strings: killed by "1 match" and "2 matches" and "11 matches".
- `count >= 1` vs `> 1` or `>= 0`: killed by `count` 1 (shown) and `count` 0 (absent).
- `Number.isInteger(count)` dropped: killed by `count` 1.5 (and -1 by the `>= 1` bound).
- `isSearchInEffect(query)` dropped: killed by `query ''` and `'   '` with `count` 3.
- Paragraph moved before the link or the button: killed by the last-child assertion in AC-38.1.
- `count={shown.length}` in `page.tsx` changed to `todos.length` or `filterTodos(...).length`: killed only by e2e AC-38.5
  ("2 matches" on `/?q=milk` against 4 stored todos; `/?filter=active&q=milk` gives 1, not 2).

## Questions settled / escalated

```
Question:    Does the count show when a search is in effect and the stored list is empty (analysis Q1)?
Class:       P0 no conflict
Sources:     spec/contracts/36-search-count.md:18 "WHILE a search is in effect (§21 `isSearchInEffect`) and `count` is a whole number of at least 1"
Conflict:    none
Verdict:     REQ-38.1 needs count >= 1; with no stored todos shown.length is 0, so nothing is added.
Next action: none beyond the AC-38.3 count 0 case.
Must not:    add a separate empty-store branch.
Doc drift:   none
Escalate:    none
```

```
Question:    Should a non-integer or negative `count` render text (analysis Q2)?
Class:       P0 no conflict
Sources:     spec/contracts/36-search-count.md:20 "`count` is 0, absent, negative or not a whole number THEN THE SYSTEM SHALL add no paragraph"
Conflict:    none
Verdict:     REQ-38.3 and AC-38.3 say nothing is added; keep the guard.
Next action: guard with `typeof count === 'number' && Number.isInteger(count) && count >= 1`.
Must not:    clamp or round `count` to show "1 match".
Doc drift:   none
Escalate:    none
```

```
Question:    May the contract signature in §16 be reflowed by Prettier (analysis Q3)?
Class:       P0 no conflict
Sources:     backlog/work/B7.4/analysis.md:35 "Proposed: accept. Otherwise it fails the repo's format check."
Conflict:    none
Verdict:     formatting only; the signature's names, types and optionality are unchanged. Accept.
Next action: none.
Must not:    hand-edit the spec to keep one line.
Doc drift:   none
Escalate:    none
```

```
Question:    Does the AC-38.x unit test go in the existing `todo-search-form.test.tsx` (analysis Q4)?
Class:       P2 spec silent
Sources:     spec/contracts/36-search-count.md:107 "`src/components/todo-search-form.test.tsx` :: "AC-16.5: with filter all and query \'\' renders one search landmark"
             backlog/plan/E7-todos-hints.md:97 "`src/components/todo-search-form.test.tsx::AC-38.1: renders exactly 1 paragraph"
Conflict:    none
Verdict:     the card's Test line names the existing file; §21, §25 and §27 did the same. The card governs file placement.
Next action: add the AC-38.x tests to the existing file.
Must not:    create `todo-search-count.test.tsx`.
Doc drift:   none
Escalate:    none
```

```
Question:    The CLAUDE.md line says the form "stays a Server Component, no 'use client'" while the file is 'use client'.
Class:       P1 code != spec (documentation, not behavior)
Sources:     src/components/CLAUDE.md:17 "`todo-search-form.tsx` (§16) stays a Server Component"
             src/components/todo-search-form.tsx:1 "'use client';"
Conflict:    the guide says Server Component / the file is a client component (since §25, §27)
Verdict:     the file is what exists; the guide is stale. No §38 behavior depends on it (the `<p>` SSRs either way).
Next action: lead decides if the guide line is fixed in this card's `docs(map)` commit or a separate docs PR.
Must not:    remove `'use client'` to match the guide (the §25/§27 handlers need it).
Doc drift:   src/components/CLAUDE.md, the `todo-search-form.tsx` line, in the card's docs commit or a follow-up.
Escalate:    none
```
