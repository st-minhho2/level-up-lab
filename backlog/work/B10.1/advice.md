# B10.1 advice: Escape in the title editor focuses "Edit title" (§48)

Reference: `src/components/todo-item.tsx` (the only file §48 changes, `spec/contracts/46-escape-title-focus.md:56`). §41's
effect at `todo-item.tsx:32-37` is the pattern for "focus after the commit". The spec side (§41 REQ-41.4, §24 and §41
Out of scope) already landed in `774dd91`; no further `docs(spec)` commit is needed.

## Approaches

### A (recommended): one-shot ref marker plus a button ref, consumed in an effect keyed on `editing`

- Change: `const focusButtonRef = useRef(false)` (marker) and `const editButtonRef = useRef<HTMLButtonElement>(null)`
  on the "Edit title" button. `onTitleKeyDown`, after the existing `pending` guard, sets `focusButtonRef.current = true`
  before `setEditing(false)`. The existing effect (or a second one) runs on `[editing]`: `if (!editing &&
focusButtonRef.current) { focusButtonRef.current = false; editButtonRef.current?.focus(); }`. No other code path sets
  the marker.
- Pros: focus only after the commit that mounted the button (REQ-48.1); a ref write causes no render, so a new `todo`
  prop, `pending`, `error`, a save result or a later switch into edit mode cannot focus (REQ-48.3, REQ-48.4); the marker
  is cleared at consumption so "once per Escape"; no new state, props or exports; mirrors the §41 effect.
- Cons: a ref marker is implicit coupling between handler and effect (comment must say why). Effect keyed on `editing`
  only, so the exhaustive-deps lint stays satisfied only because refs are exempt.
- Fits rules: yes (client component, no `any`, no new dependency, props unchanged, `ts-style.md`).

### B (alternative): callback ref on the button that focuses when the marker is set

- Change: same marker, but the button's `ref` is a callback that calls `node.focus()` when `node` is non-null and the
  marker is set, then clears it.
- Pros: no effect; runs during the commit that attaches the button.
- Cons: side effect in a ref callback (focus during commit, before layout effects and before the previous field's
  removal settles); an inline callback ref is re-invoked on every render (null then node), so the marker clearing is
  load-bearing; harder to read and to reason about under Strict Mode. Rejected: more fragile for the same behavior.

Dropped by both: nothing. A state flag (`restoreFocus`) consumed by an effect was considered and not offered: it adds a
render and, if keyed on `editing`, turns AC-48.4 to AC-48.6 red (analysis.md finding on focus stealing).

## Recommendation

A. Keep the effect keyed on `[editing]` (§41 comment at `:30-31` extended to say the Escape marker is consumed here).
Set the marker only inside the Escape branch, after the `pending` early return, so REQ-48.2 (no focus while a save or
toggle is in flight) holds with no new code. A successful save path (`onSave`) never touches the marker.

## Impact

| File                                             | Add/Change                                                                      | Signature                                                       | ACs                |
| ------------------------------------------------ | ------------------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------ |
| `src/components/todo-item.tsx`                   | Change: marker ref, button ref, Escape sets marker, effect consumes it          | `TodoItem({ todo }: { readonly todo: Todo }): ReactNode` (same) | AC-48.1 to AC-48.7 |
| `src/components/todo-item-escape-focus.test.tsx` | Add (red commit, test-writer)                                                   | none                                                            | AC-48.1 to AC-48.6 |
| `e2e/48-escape-title-focus.spec.ts`              | Add (red commit, test-writer)                                                   | none                                                            | AC-48.7            |
| `spec/features-map.md`                           | Change in `docs(map)` commit after `feat`                                       | none                                                            | none               |
| `src/components/CLAUDE.md`                       | Optional one line for `todo-item.tsx` (§48), only if the lead wants; not needed | none                                                            | none               |

Client component `todo-item.tsx`, per approach (server-rendered markup; submit with JS off; submit before hydration):

- A: server markup today and after: the row renders in view mode (`editing` starts false): label plus the "Edit title"
  button, identical bytes (refs add no attributes). JS off: the button is `type="button"` with only an `onClick`, so it
  does nothing, today and after; there is no form in the markup to submit. Before hydration: same, the edit form does not
  exist until a click is handled, so no submit is possible; unchanged. Dropped behavior: none.
- B: identical on all three lines; the ref callback adds no attributes. Dropped behavior: none.

## Risks

- Migration: none. Dependencies: none. Security: none (no input, action or lib change). Isolation: none.
- Performance: none (one ref write, one effect run per commit that changes `editing`).
- Existing tests that could turn red: `todo-item-select.test.tsx` AC-41.3(a) (clicks "Edit title" after Escape: the
  button is now focused, the click still enters edit mode and the §41 effect focuses and selects the field; stays
  green by reading). `todo-item.test.tsx` AC-24.x assert roles and values, not `activeElement`. Any test asserting
  `document.activeElement === document.body` after Escape would break; the grep of `todo-item*.test.tsx` finds none
  [unverified: re-run `pnpm test` on the feat commit].
- Trap for the code-writer: do not set the marker in `onSave`, in an `editing`-keyed effect without the marker, or on a
  `todo` prop change; AC-48.4 to AC-48.6 fail such a design. Do not call `focus()` in the keydown handler: the button
  does not exist until the commit.
- Mutation testing does not apply (no `src/lib` or `src/actions` change); the AC-48.x tests must still kill the
  obvious mutants below by assertion on `activeElement` and the `focus` spy.

## Test strategy

| Layer     | File                                                                                                               | ACs                                                        | Mocks                                                                                                                                                                                               |
| --------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| component | `src/components/todo-item-escape-focus.test.tsx`                                                                   | AC-48.1 to AC-48.6                                         | `@/actions/todos` (`updateTodoTitleAction`, `toggleTodoAction`) via `vi.hoisted`, add keys never remove; `vi.spyOn(HTMLElement.prototype, 'focus')` with `mock.contexts`; promises resolved by hand |
| e2e       | `e2e/48-escape-title-focus.spec.ts`                                                                                | AC-48.7                                                    | none (real app, `page.evaluate` for `activeElement`, POST counter)                                                                                                                                  |
| unchanged | `todo-item.test.tsx`, `todo-item-select.test.tsx`, `e2e/24-escape-edit-title.spec.ts`, `todo-search-form.test.tsx` | AC-24.1 to 24.6, AC-41.3, AC-10.2, AC-6.4, AC-25.3, AC-5.1 | as today, not edited                                                                                                                                                                                |

Red proof: the skeleton is a no-op (no `NotImplementedError` is possible without a new function); the tests fail on the
assertion that the button is `document.activeElement`. AC-48.3 to AC-48.6 pass on today's code for the "no focus" halves
only if each file also asserts the positive half; keep AC-48.1 and AC-48.2 as the red anchors so `scripts/verify-red.sh B10.1`
reports red on behavior.

## Mutation hot spots

Not scored by the pipeline (component only), but the tests must kill:

- dropping the `pending` guard order (marker set while pending): AC-48.3(a) and (b).
- marker never cleared: AC-48.6 (a later save focuses the button) and AC-48.4(b).
- focusing on every `editing === false` transition (no marker): AC-48.4, AC-48.5, AC-48.6.
- focusing the field instead of the button, or `focus()` in the handler before the commit: AC-48.1 (`activeElement`).
- clearing the error or draft dropped: AC-48.1 label, AC-48.2 alert count.

## Questions settled / escalated

```
Question:    Which mechanism moves focus without stealing it after a late save result?
Class:       P2 spec silent
Sources:     spec/contracts/46-escape-title-focus.md:22 "a later re-render of the row (a new `todo` prop, a message shown or removed, a save or toggle pending or settled), a later switch into edit mode (§41) and a later successful save never focus the button"
             spec/contracts/46-escape-title-focus.md:53 "after the "Edit title" button is in the document it receives focus(), once for that Escape"
Conflict:    none (the spec fixes the observable behavior and names no mechanism)
Verdict:     Spec REQ-48.4 and the function contract govern; mechanism is the code-writer's within them. Approach A satisfies both; analysis.md open question 3 proposes the same.
Next action: Plan approach A in plan.md; test-writer writes AC-48.1 to AC-48.7 red.
Must not:    Key the focus on `editing` becoming false without a one-shot marker, or call focus() in the keydown handler.
Doc drift:   none
Escalate:    none
```

```
Question:    Is a toggle in flight (checkbox clicked during edit) covered by "Escape is ignored"?
Class:       P0 no conflict
Sources:     spec/contracts/46-escape-title-focus.md:20 "a save, §6; or a toggle, §10: the cases in which "Edit title" is disabled"
             src/components/todo-item.tsx:46 "if (event.key !== 'Escape' || pending) {"
Conflict:    none (shipped `pending` already covers both; §24 REQ-24.5 names only a save, §48 REQ-48.2 names both)
Verdict:     §48 REQ-48.2 governs by authority order 3; code already matches, so no code change for this part.
Next action: AC-48.3(b) is a pinning test; it may pass on today's code, AC-48.1 and AC-48.2 carry the red.
Must not:    Add a separate toggle guard or a second pending flag.
Doc drift:   none
Escalate:    none
```

```
Question:    Does the button's disabled state ever block the focus call?
Class:       P0 no conflict
Sources:     src/components/todo-item.tsx:113 "disabled={pending}"
             spec/contracts/46-escape-title-focus.md:19 "no action of that row is in flight"
Conflict:    none
Verdict:     Escape is ignored while pending, so the button is enabled at the commit that focuses it (analysis.md finding 1).
Next action: none
Must not:    Clear `pending` or force-enable the button to make focus succeed.
Doc drift:   features-map.md in the `docs(map)` commit after `feat`, per spec/CLAUDE.md
Escalate:    none
```
