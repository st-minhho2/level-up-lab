# B9.4 advice

Card: A focus move during a pending add is kept (§47, `spec/contracts/45-new-todo-focus-pending.md`). Class P0: no conflict.
Authority read: invariants, D-44 (spec §47 landed in eabf994), §47 REQ-47.1..47.4, §44 (already says "unless §47"),
`src/components/todo-form.tsx` (reference implementation, §44 effect at lines 44-50).

## Approaches

**A (recommended): read `document.activeElement` inside the existing §44 layout effect.**

- Change: in the effect at `todo-form.tsx:45-50`, when `wasPending.current && !pending && state?.ok === true`, call
  `box.current?.focus()` only if `document.activeElement` is `box.current`, the "Add" button (a new `useRef` on the
  button), `document.body` or `null`. A small module-level helper (not exported) may hold the test.
- Pros: exactly REQ-47.3 (read once per settled result, at the commit that settles it, so a move made and undone
  counts as no move: AC-47.4); no listeners, no new state; one file, as the spec's Function contracts demand; the
  effect already runs after React's form reset and after the draft sync, so REQ-47.4 values are untouched.
- Cons: needs a ref on "Add" (markup attribute-free, `ref` only). In a browser that reports `<html>` as active
  element the box is not focused (analysis open question 2; spec lists body and null only).
- Fits rules: client component only for state/effects; no new export, no lib, no dependency; ts-style (no `any`,
  `instanceof`-free identity comparison).

**B (alternative): record focus moves with `focusin` listeners while pending.**

- Change: a `useEffect` attaching `focusin` on `document` while `pending`, storing a "moved" flag read at settle.
- Pros: independent of what the browser reports for a disabled "Add".
- Cons: contradicts REQ-47.3 (reads at move time, not at the commit; a move undone during the save counts as a
  move, AC-47.4 second save fails); extra state and listener lifecycle; a move made before `pending` flips is
  missed. Rejected: not what the spec says.

## Recommendation

A. It is the literal reading of the §47 Function contract ("read in the same layout effect").

## Impact

| File                                              | Add/Change | Signature                                                                                                | ACs                |
| ------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------- | ------------------ |
| `src/components/todo-form.tsx`                    | Change     | `export function TodoForm(): ReactNode` (unchanged); `ref` on "Add"; condition in the §44 layout effect  | AC-47.1 to AC-47.6 |
| `src/components/todo-form-focus-pending.test.tsx` | Add (test) | component tests, `createTodoAction` deferred via `vi.hoisted`                                            | AC-47.1 to AC-47.4 |
| `e2e/47-new-todo-focus-pending.spec.ts`           | Add (test) | Playwright, `page.route` holding the POST with the `next-action` header 2000 ms, then `route.continue()` | AC-47.5, AC-47.6   |
| `spec/features-map.md`                            | Change     | F45 row, in the `docs(map)` commit                                                                       | n/a                |

Client component `todo-form.tsx`, per approach:

| Approach | Server-rendered markup                             | Submit with JS off                               | Submit before hydration               | Dropped behavior                                        |
| -------- | -------------------------------------------------- | ------------------------------------------------ | ------------------------------------- | ------------------------------------------------------- |
| A        | today and after: identical (a `ref` is not markup) | native POST of the form, effect never runs: same | same as today: native POST, no effect | none                                                    |
| B        | identical                                          | same                                             | same                                  | drops REQ-47.3 "undone move counts as none" (con above) |

## Risks

- Migration: none. Dependencies: none. Security: none (no input path changes). Isolation: no env or port use.
- Performance: one property read per settled result.
- Existing tests that could turn red: `todo-form-focus.test.tsx` AC-44.1 to AC-44.5 (jsdom: after clicking "Add" the
  disabled button or body may be active; both are in the allowed set, and AC-44.4 tabs to "Add", also allowed).
  `todo-form.test.tsx` AC-29.5 and AC-18.4 (no move). e2e 44, 25, 29 (no move during the save). Run them all.
- jsdom: a disabled focused button may stay `activeElement`; test AC-47.3(c) must `blur()` explicitly, as the spec says.
- AC-47.6 fragility (row inserted above the edited row): analysis question 6 applies; if the editor loses focus on
  re-render, stop and report as a `todo-item.tsx` defect, do not widen §47.
- Mutation: only `src/components` changes, so the 70 % gate on `src/lib`/`src/actions` is unaffected.
- PR title must be `fix(todos): B9.4 …` (D-44, change failure rate).

## Test strategy

| Layer     | File                                              | ACs                | Mocks                                                                                                       |
| --------- | ------------------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------- |
| component | `src/components/todo-form-focus-pending.test.tsx` | AC-47.1 to AC-47.4 | `vi.mock('@/actions/todos')` with `vi.hoisted`; deferred promise resolved by hand; `vi.spyOn(box, 'focus')` |
| e2e       | `e2e/47-new-todo-focus-pending.spec.ts`           | AC-47.5, AC-47.6   | none; `page.route` delay of the Server Action POST (network boundary)                                       |

Red proof: today every ok result calls `focus()`, so AC-47.1, 47.2, 47.4 (first save) and both e2e fail on an
assertion; AC-47.3 passes today (the unchanged-behavior guard), so the card's `Test:` line names AC-47.1 and
`verify-red.sh` must judge on behavior, not on all six being red. Skeleton commit is unnecessary (no new export).

## Mutation hot spots

Not scored (component), but the tests should kill: dropping the `document.body`/`null` cases (AC-47.3c), dropping the
"Add" case (AC-47.3b), dropping the box case (AC-47.4 second save), reading the element at submit instead of at settle
(AC-47.4), and calling `focus()` before the check (focus spy count).

## Questions settled / escalated

```
Question:    How is "moved elsewhere" read: at submit, by listener, or at settle?
Class:       P0 no conflict
Sources:     spec/contracts/45-new-todo-focus-pending.md:21 "THE SYSTEM SHALL read `document.activeElement` once for each settled result, at the commit that settles it and not when the form is submitted"
Conflict:    none
Verdict:     At settle, in the existing layout effect (REQ-47.3, Function contracts line 47); approach A.
Next action: Write the red tests, then change only the condition in todo-form.tsx.
Must not:    Add a focusin listener or a "moved" state.
Doc drift:   none (§44 already carries "unless §47"); F45 row in features-map.md in the docs(map) commit
Escalate:    none
```

```
Question:    Does `document.documentElement` count as no focus?
Class:       P2 spec silent
Sources:     spec/contracts/45-new-todo-focus-pending.md:19 "`document.activeElement` is the "New todo" box, the "Add" button, `document.body` or `null`"
Conflict:    none
Verdict:     The list is closed; `<html>` is not listed, so it counts as "any other element" per REQ-47.2. Browsers report body or null, so no test needs it; analysis question 2 already says to amend REQ-47.1 first if one ever does.
Next action: Implement the four listed cases only.
Must not:    Add `documentElement` to the allowed set in code.
Doc drift:   none
Escalate:    none
```

```
Question:    Is a test for AC-47.3 required to be red?
Class:       P0 no conflict
Sources:     .claude/rules/testing.md "fail on an assertion or the skeleton's `NotImplementedError`, never on an import"
Conflict:    none
Verdict:     The rule governs the card's named test (AC-47.1), which fails on an assertion today; AC-47.3 guards behavior that already holds and may be green in the red commit.
Next action: Run `scripts/verify-red.sh B9.4`, note in the commit body which ACs are guards.
Must not:    Weaken AC-47.3 or invent a failing assertion to make it red.
Doc drift:   none
Escalate:    none
```
