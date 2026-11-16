# B9.3 advice

## Approaches

**A (recommended): one call in the existing document keydown listener.**
Change: in `src/components/todo-search-form.tsx`, inside the `isSearchShortcut(...)` branch of `onKeyDown`
(line 55-57), after `searchBoxRef.current?.focus()` add `searchBoxRef.current?.select()`.

- Pros: one line; the listener already rejects modifiers and text-entry targets (REQ-46.3) via `isSearchShortcut`, so
  no new guard; `select()` reads the value at call time (REQ-46.2); one call per accepted press (REQ-46.5); the
  unmount cleanup already removes the listener; no new export, prop, lib function or dependency.
- Cons: none against the spec. Real-browser `select()` on `type="search"` rests on AC-46.6 (analysis Q3).
- Fits rules: spec-fidelity (§46 contract line says exactly this), ts-style (`'use client'` already present).

**B (alternative): extract `focusAndSelect(input)` into `src/lib/`.**

- Pros: unit-testable apart from the component.
- Cons: a new lib function that §46 forbids ("No new export ... or lib function"); a behavior outside a numbered
  section breaks invariant 1; more mutation surface for no gain.
- Fits rules: no. Rejected.

## Recommendation

Approach A. 1 source file, 0 migrations, 0 dependencies.

## Impact

| File                                              | Add/Change | Signature                                                                                 | ACs                |
| ------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------- | ------------------ |
| `src/components/todo-search-form.tsx`             | Change     | `TodoSearchForm({ filter, query, count? }): ReactNode` unchanged; header comment adds §46 | AC-46.1 to AC-46.5 |
| `src/components/todo-search-form-select.test.tsx` | Add        | tests (test commit, red first)                                                            | AC-46.1 to AC-46.5 |
| `e2e/44-search-select.spec.ts`                    | Add        | Playwright (name left to test-writer)                                                     | AC-46.6            |
| `spec/features-map.md`                            | Change     | F44 entry (code-writer's `docs(map)` commit after feat)                                   | none               |

`todo-search-form.tsx` is a client component the card changes. Server-rendered markup: identical today and after,
both approaches (REQ-46.4; AC-46.3 compares `innerHTML`). Submit with JavaScript off: the native GET form submits as
today; the listener never runs, so no shortcut, no selection (unchanged). Submit before hydration: same native GET
submit, unchanged; a `/` before hydration does nothing today and after. Behavior dropped by A: none. B: none.
Note: `src/components/CLAUDE.md` still says `todo-search-form.tsx` is a Server Component with no `'use client'`; it is
stale since §25 (doc drift, not caused by this card).

## Risks

- Migration: none. Security: none (no input, no request). Performance: none.
- Isolation: the listener is document-wide; tests must unmount between cases (RTL cleanup) so spies do not leak.
- Existing tests: AC-25.2, 25.3, 25.5 check focus, value, `defaultPrevented`; AC-25.5 counts `focus` calls only, so
  a `select()` call keeps them green. AC-27.x Escape unaffected (Escape handler is on the box, not the `/` path).
- Gate: `44-search-select.md:5` "Lead approves spec" is unticked, and `spec/technical-requirements.md:53` shows §46 ✗.
  The lead's approve at the plan gate ticks it (spec/CLAUDE.md, D-7) before any test is written.
- jsdom: `select()` after `focus()` on `type="search"` sets 0..length; AC-46.2(a) needs the emoji length 7 (UTF-16),
  which `value.length` already gives.

## Test strategy

| Layer     | File                                              | ACs                | Mocks                                                                                                                                 |
| --------- | ------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| Component | `src/components/todo-search-form-select.test.tsx` | AC-46.1 to AC-46.5 | none beyond what `todo-search-form.test.tsx` uses (`next/link` as there); spies on box `focus`/`select` via `vi.spyOn` on the element |
| e2e       | `e2e/44-search-select.spec.ts`                    | AC-46.6            | none (real app, DB via compose)                                                                                                       |

Titles start `AC-46.n:`. Set selections with `setSelectionRange` before the event. Red because `select()` is never
called: AC-46.1 fails on `selectionEnd` 0 vs 4 (an assertion, not an import; no skeleton needed).

## Mutation hot spots

`src/components` is outside the mutation scope (`src/lib` + `src/actions`), and no lib file changes. Still, the tests
must kill: dropping `.select()`; swapping order (focus must precede select, AC-46.5); calling `select()` outside the
`isSearchShortcut` branch (AC-46.4 spy 0 calls); selecting on the ref before `focus()`.

## Questions settled / escalated

Question: Does `select()` change what Escape does after `/`?
Class: P0 no conflict
Sources: spec/contracts/44-search-select.md:75 "changing Escape in the box (§27)"
Conflict: none
Verdict: No; §27 is untouched (44-search-select.md:30), analysis Q1 proposal stands.
Next action: none
Must not: Add Escape handling to the shortcut path.
Doc drift: none
Escalate: none

Question: Is the selection wanted when the box already has focus?
Class: P0 no conflict
Sources: spec/contracts/44-search-select.md:21 "focus already in a text-entry element, §25 REQ-25.3, the search box itself included"
Conflict: none
Verdict: No selection; `isSearchShortcut` already rejects, so nothing to add.
Next action: none
Must not: Add a separate `document.activeElement === box` check.
Doc drift: none
Escalate: none

Question: The e2e file name?
Class: P2 spec silent
Sources: spec/contracts/44-search-select.md:66 "AC-46.6 is a Playwright test in `e2e/`"
Conflict: none
Verdict: Spec names no file; analysis Q4 proposes `e2e/44-search-select.spec.ts`; test-writer decides, rule: one file per section.
Next action: test-writer picks the name.
Must not: Append AC-46.6 to `e2e/25-search-shortcut.spec.ts` (unchanged-behavior proof there).
Doc drift: none
Escalate: none
