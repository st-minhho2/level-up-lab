# B6.1 advice

Card B6.1, §29 (`spec/contracts/27-escape-new-todo.md`), D-33 mounts only `src/components/todo-form.tsx`.
Reference implementation: §27 `src/components/todo-search-form.tsx` (Escape handler) and §28 `src/components/todo-due-date.tsx`
(Escape ignored while pending).

## Approaches

**A (recommended): a keydown handler on the "New todo" input only.**
Change: in `todo-form.tsx`, add `onKeyDown` to the `<input id="new-todo">`. Body: `if (pending || !isSearchEscape(event.nativeEvent)) return;`
then `event.preventDefault(); if (box.current !== null) box.current.value = ''; setDraft('');`. Import `isSearchEscape` from
`@/lib/escape-search` (type-only `KeyboardEvent as ReactKeyboardEvent` from react). Update the module header to name §29.

- Pros: exactly the spec's Function contract; no markup, prop, state or lib change; the input stays uncontrolled, so the
  form-reset design (`kept`, `defaultValue`, layout effect) and the native POST stay intact; scope REQ-29.6 holds by
  construction (the handler sits on the input, so the "Add" button, body and other fields never reach it).
- Cons: the empty value is written to the DOM node and to `draft`, two writers; the existing comment block lists three draft
  writers and must say four.
- Fits rules: invariants 1 to 4 (no action, no Prisma, no lib file), D-33 (one file), ts-style (explicit return type,
  no `any`).

Load-bearing detail: pass `event.nativeEvent`, not the synthetic event. React's synthetic `key` normalizes legacy `'Esc'` to
`'Escape'`, but AC-29.3 requires `Esc` to do nothing (REQ-29.5). `todo-search-form.tsx:22` already does this, with the same comment.
The synthetic event would also satisfy `EscapeEvent` structurally, so the type checker will not catch the mistake; only the
`Esc` row of AC-29.3 does.

**B (alternative): make the input controlled (`value={draft}`) and clear with `setDraft('')` only.**

- Pros: one writer.
- Cons: changes the server-rendered markup (a `value` attribute) and the `defaultValue`/reset design that §10 and §18
  REQ-18.6/18.7 rely on; text typed before hydration is lost or overwritten by `draft` (the file warns about this);
  case (b) of AC-29.2 (a value set by script with no input event) would not be emptied reliably. Violates REQ-29.7 in spirit
  ("markup unchanged") and the file's comment against wrapping the action. Rejected.

(Rejected variant: `onKeyDown` on the `<form>` with a target check, or `form.reset()`. The first reaches the "Add" button and
needs a target test for REQ-29.6; `reset()` restores `defaultValue`, which is `kept`, not `''`.)

## Recommendation

A. Seven lines in one file, matches the spec's Function contracts block literally.

## Impact

| File                                | Add/Change                      | Signature                                                                                               | ACs                |
| ----------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------ |
| `src/components/todo-form.tsx`      | Change                          | `onKeyDown={(event: ReactKeyboardEvent<HTMLInputElement>): void => ...}` on the input; header names §29 | AC-29.1 to AC-29.7 |
| `src/components/todo-form.test.tsx` | Change (test commit, red)       | new `describe('<TodoForm> Escape clears the title (§29)')`, titles `AC-29.1` to `AC-29.6`               | AC-29.1 to AC-29.6 |
| `e2e/29-escape-new-todo.spec.ts`    | Add (test commit, red)          | one test `AC-29.7: ...`                                                                                 | AC-29.7            |
| `spec/features-map.md`              | Change (`docs(map)` after feat) | row F27: §29, `src/components/todo-form.tsx`, the two test files, status per B1.85                      | map check          |

`todo-form.tsx` is the one client component the card changes:

| Approach | Server-rendered markup                                   | Submit with JavaScript off | Submit before hydration                                   | Dropped behavior                                |
| -------- | -------------------------------------------------------- | -------------------------- | --------------------------------------------------------- | ----------------------------------------------- |
| Today    | uncontrolled input, `defaultValue=''`, counter `0 / 200` | native POST, works         | native POST, works; typed text reaches the server         | none                                            |
| A        | identical (a handler is not markup)                      | identical                  | identical; no Escape effect until hydrated, same as today | none                                            |
| B        | input gains `value`, hydration warning risk              | identical                  | typed text can be overwritten at hydration                | pre-hydration typed text; script-set value case |

Features-map: row F27 is absent today (`grep F27 spec/features-map.md` returns 0), `docs(map)` is code-writer's.

## Risks

- Migration: none. Dependency: none. Security: none (no input crosses a boundary; no action).
- Isolation: the only shared file is `todo-form.tsx`; B6.2 to B6.3 mount elsewhere (D-33). `spec/features-map.md` is edited by
  every card of the batch (F27 to F29): expect a trivial rebase conflict on that table.
- Existing tests that could turn red: AC-18.x and AC-10.5 tests rely on the `useLayoutEffect` re-read; the handler must not
  change it. AC-18.6 (pending) is unaffected because Escape is ignored while pending. Keep the layout effect untouched.
- Race: while `pending`, ignoring Escape (REQ-29.4) is what keeps the reset from racing; do not read `pending` from a stale
  closure (it is a render value, the handler is recreated each render, so it is fresh).
- After a failed save `kept = draft`; Escape sets `draft` to `''`, so the next `defaultValue` is `''` and the alert stays
  (AC-29.6). Do not clear the alert (out of scope).
- Mutation: the `pending` guard, the `!isSearchEscape` guard and the `preventDefault` call are each a mutant; each needs an assertion.
- Doc drift: `src/components/CLAUDE.md` and `src/CLAUDE.md` section lists do not name §29; D-33 keeps package guides out of
  card plans, so not in this PR.

## Test strategy

| Layer     | File                                | ACs                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Mocks                                                               |
| --------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| component | `src/components/todo-form.test.tsx` | AC-29.1 (typed, defaultPrevented via `fireEvent.keyDown` return value, counter `0 / 200`, 0 calls); AC-29.2 (a) empty, (b) `x` x201 set by script, (c) `  hi  `, each own render; AC-29.3 `it.each` over `a`, ArrowLeft, `Esc`, `escape`, Ctrl/Meta/Alt/Shift+Escape (fire native events, not `user.keyboard`, so `Esc` stays legacy), plus Enter once with `title` `Buy milk`; AC-29.4 body, "Add", "Other", "Search todos"; AC-29.5 pending promise from `pendingSave()`; AC-29.6 `failedSave()` then ok | `vi.hoisted` actions object (add no key, `createTodoAction` exists) |
| e2e       | `e2e/29-escape-new-todo.spec.ts`    | AC-29.7 (rows `[B, A]` then `[Call mom, B, A]`, 0 POSTs, address `/`, reload)                                                                                                                                                                                                                                                                                                                                                                                                                              | none (real app, compose DB)                                         |

Red reasons: all component tests fail on an assertion (box still `Buy milk`), none on an import (no new export, so no skeleton
commit is needed beyond a no-op; confirm with `verify-red.sh B6.1`). AC-29.3 and AC-29.4 pass today by nature; they stay
in the file as guards but only AC-29.1, 29.2, 29.5(after-Escape parts are same as today), 29.6, 29.7 are red: say so in the
test commit body ("Red because ..."). `verify-red.sh` judges the commit as a whole.

## Mutation hot spots

- `pending` guard in `onKeyDown` (AC-29.5: `defaultPrevented` false and text kept while pending).
- Each modifier in `isSearchEscape` is covered by §27's own tests, but the call site must use the native event (AC-29.3 `Esc`).
- `box.current !== null` branch and `setDraft('')` (AC-29.2 case b: counter must read `0 / 200` and box `''` even when the
  draft was already `''`).
- `event.preventDefault()` removal (AC-29.1 asserts `defaultPrevented`).

## Questions settled / escalated

Question: Does `isSearchEscape` get the synthetic or the native event?
Class: P0 no conflict (a trap, not a conflict)
Sources: spec/contracts/27-escape-new-todo.md:34 "the person presses `a`, ArrowLeft, `Esc`, `escape`, Ctrl+Escape, Meta+Escape, Alt+Escape and Shift+Escape in the box"
src/components/todo-search-form.tsx:21 "The native event: React's synthetic `key` normalizes the legacy 'Esc' to 'Escape', which REQ-27.5 excludes."
Conflict: none
Verdict: The contract's "isSearchEscape(event)" does not say which event; AC-29.3 (`Esc` does nothing) fixes it as `event.nativeEvent`. Spec governs; §27's component is the reference.
Next action: use `event.nativeEvent`.
Must not: pass the synthetic event.
Doc drift: none
Escalate: none

Question: Is Escape ignored while a save is pending, and does it leave the alert?
Class: P0 no conflict
Sources: spec/contracts/27-escape-new-todo.md:20 "WHILE a save of the form is pending (§10, the \"Add\" button disabled) THE SYSTEM SHALL ignore Escape in the box"
spec/contracts/27-escape-new-todo.md:56 "removing a shown message of §5 or §10 with the key"
Conflict: none
Verdict: REQ-29.4 and Out of scope settle both (analysis.md open questions 1 and 2 are answered by the section).
Next action: implement the guard `pending`; leave `state` alone.
Must not: clear the alert or add state to `useActionState`.
Doc drift: none
Escalate: none

Question: May `todo-form.tsx` import `isSearchEscape` from `@/lib/escape-search` although D-33 forbids a new lib file?
Class: P0 no conflict
Sources: spec/contracts/27-escape-new-todo.md:47 "imported from '@/lib/escape-search'"
spec/contracts/27-escape-new-todo.md:50 "The only file of `src/` this section changes is `src/components/todo-form.tsx`"
Conflict: none
Verdict: an import is not a lib change; the file exists (§27, `src/lib/escape-search.ts`) and stays unchanged.
Next action: import it.
Must not: add a new predicate or edit `escape-search.ts`.
Doc drift: `spec/features-map.md` row F27 in the `docs(map)` commit after `feat`.
Escalate: none
