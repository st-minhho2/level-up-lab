# B7.1 advice

Spec: §35 `spec/contracts/33-delete-confirm.md`; §19 `17-delete.md` already edited under D-37 (REQ-19.1, REQ-19.5, AC-19.5 to
AC-19.7, contract, Out of scope all point at §35). No spec/spec conflict found.

## Approaches

**A (recommended): confirm inside `DeleteTodoButton.onDelete`, exactly the §35 contract.**
Change: a module-level `const CONFIRM_MESSAGE = 'Delete this todo? This cannot be undone.'`; `onDelete` starts with
`if (!window.confirm(CONFIRM_MESSAGE)) return;` and then the existing `startTransition(...)`.

- Pros: one file in `src/`; no prop, state, element or attribute (REQ-35.5); the confirm runs before the transition so the
  button is not disabled while the dialog is open (§35 prose); a cancel returns before `setError`, so an earlier alert stays
  (REQ-35.3); nothing in `src/actions` or `src/lib` moves, so mutation scope is untouched.
- Cons: `window.confirm` blocks the main thread (accepted by §35); a jsdom test that clicks without a stub reads as a cancel.
- Fits rules: ts-style (no `any`, constant named at module level), invariants 1 and 3 (the mutation still goes through
  `deleteTodoAction`).

**B (alternative): confirm in `TodoItem` or a new `useConfirm` hook file.**
Change: wrap the `onClick` from the parent, or add `src/components/use-confirm.ts`.

- Pros: reusable for later confirmations.
- Cons: contradicts §35 ("`TodoItem` ... unchanged", signature unchanged, "no prop"); a new file and an export with no
  section; the button's own tests would no longer prove the contract (AC-35.1 and AC-35.2 render `DeleteTodoButton`
  alone). Dropped behavior: none, but it needs a spec change under a new D-n.
- Fits rules: no (invariant 1: behavior outside the numbered contract).

## Recommendation

A. It is the only approach the spec describes.

## Impact

| File                                                | Add/Change | Signature                                                                               | ACs                                |
| --------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------- | ---------------------------------- |
| `src/components/delete-todo-button.tsx`             | Change     | `DeleteTodoButton({ todoId }: { readonly todoId: string }): ReactNode` (unchanged)      | AC-35.1, AC-35.2, AC-35.3          |
| `src/components/delete-todo-button.test.tsx`        | Change     | AC-19.5 (a), AC-19.6 stub confirm `true`; add AC-35.1, AC-35.2 (red step only)          | AC-19.5, AC-19.6, AC-35.1, AC-35.2 |
| `src/components/todo-item.test.tsx`                 | Change     | AC-19.5 (b) becomes the title quoted in §35 as AC-35.3, with `confirm` stub             | AC-35.3                            |
| `e2e/19-delete.spec.ts`                             | Change     | AC-19.7 becomes the AC-35.4 title quoted in §35; add AC-35.5; `page.once('dialog', ..)` | AC-35.4, AC-35.5                   |
| `spec/features-map.md` (`docs(map)`, after `feat`)  | Change     | F33 row, if absent or stale                                                             | -                                  |
| `src/components/CLAUDE.md` (only if the lead wants) | Change     | one line: delete button asks `window.confirm` (§35)                                     | -                                  |

`delete-todo-button.tsx` (client component), markup per approach:

| Case                       | Today                                                 | After A                                                          |
| -------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------- |
| Server-rendered markup     | `<span><button type=button aria-label="Delete todo">` | byte-identical (no element, text, role or aria added, REQ-35.5)  |
| Submit with JavaScript off | none: `type="button"`, no form, nothing happens       | same, nothing happens, no dialog                                 |
| Submit before hydration    | click lost, no dialog, no action                      | same; e2e keeps `waitForLoadState('networkidle')` before a click |

Approach B drops nothing at runtime; its cost is the spec conflict above.

## Risks

- Migration: none. Dependency: none. Security: none (same action, same Zod parse).
- Isolation: none; no env, port or storage touched.
- Existing tests that turn red: `delete-todo-button.test.tsx` AC-19.5 (a) (asserts 0 confirm calls) and AC-19.6 (no stub, jsdom
  confirm reads as cancel so the action is never called), `todo-item.test.tsx:198` click without stub, `e2e/19-delete.spec.ts`
  (Playwright dismisses with no handler). All four must be rewritten in the `test(...)` commit (D-37 allows it because §19
  changed first). `todo-item-created.test.tsx` only queries the button, no click: unaffected. No other e2e file clicks it
  (grep `Delete todo` in `e2e/`: only `19-delete.spec.ts`).
- Order trap: AC-35.2 (b) needs `mockReturnValueOnce(true).mockReturnValueOnce(false)`; `beforeEach` has `vi.resetAllMocks()` so
  re-spy after it, and `afterEach` keeps `restoreAllMocks()`.
- Approval box: `33-delete-confirm.md:5` is `- [ ] Lead approves spec`. spec/CLAUDE.md says a human ticks it before any test is
  written; the plan gate ("approve") may tick it in the same reply (D-7). `plan.md` must carry that.
- The jsdom "not implemented" claim is `[unverified]` (analysis Q5); stubbing in every click test makes it moot.

## Test strategy

| Layer     | File                                         | ACs                                 | Mocks                                                                                                     |
| --------- | -------------------------------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------- |
| component | `src/components/delete-todo-button.test.tsx` | AC-35.1, AC-35.2, AC-19.5a, AC-19.6 | `vi.mock('@/actions/delete-todo')` via `vi.hoisted`; `vi.spyOn(window, 'confirm')`; `invocationCallOrder` |
| component | `src/components/todo-item.test.tsx`          | AC-35.3 (title fixed in §35)        | the actions of §5, §6, §15, §19; `confirm` stub `true`                                                    |
| e2e       | `e2e/19-delete.spec.ts`                      | AC-35.4 (title fixed), AC-35.5      | none; `page.once('dialog')` registered before each click, records `type()` and `message()`                |

`scripts/verify-red.sh B7.1`: red on assertions (confirm not called, action called on a cancel), not on an import; the component
already exists, so no skeleton `NotImplementedError` is needed.

## Mutation hot spots

`src/lib` and `src/actions` are unchanged, so the ≥ 70 % gate has no new code. In the component (outside the gate, still worth a
test each): the negation in `if (!window.confirm(...)) return` (AC-35.2 a and b), the message literal (exact string in AC-35.1),
the placement before `startTransition` (call order in AC-35.1), and `setError` not being reached on a cancel (AC-35.2 b).

## Questions settled / escalated

```
Question:    Which approach implements the confirmation, and may it live outside DeleteTodoButton?
Class:       P0 no conflict
Sources:     spec/contracts/33-delete-confirm.md:22 "The message is a fixed string: it does not name the todo, so `DeleteTodoButton` needs no new prop."
             spec/contracts/33-delete-confirm.md:54 "No Server Action, Zod schema, Prisma model, route, `src/lib` module or other component changes"
Conflict:    none
Verdict:     §35 governs (spec level 3): confirm inside DeleteTodoButton, approach A.
Next action: dev-lead writes plan.md with approach A and the approval-box tick.
Must not:    add a prop, a hook file or a confirm in TodoItem.
Doc drift:   none
Escalate:    none
```

```
Question:    Does a cancel clear an earlier failure alert?
Class:       P0 no conflict
Sources:     spec/contracts/33-delete-confirm.md:18 "leave the row, including any message of an earlier failed attempt (§19 REQ-19.10), exactly as it was"
Conflict:    none
Verdict:     REQ-35.3 governs: return before setError; the alert stays.
Next action: test AC-35.2 (b) asserts the same single alert after the second click.
Must not:    call setError(undefined) on a cancel.
Doc drift:   none
Escalate:    none
```

```
Question:    Who rewrites the existing delete tests that now fail?
Class:       P1 code ≠ spec (tests encode the old §19)
Sources:     spec/contracts/33-delete-confirm.md:56 "the existing e2e and unit tests that click "Delete todo" are rewritten from §19 (its AC-19.5 to AC-19.7, edited by D-37) to stub or accept the dialog"
Conflict:    delete-todo-button.test.tsx expects 0 confirm calls / spec §35 REQ-35.1 says exactly once
Verdict:     spec governs over tests (level 3 over 5); the rewrite goes into the red `test(...)` commit, never the `feat` commit.
Next action: test-writer rewrites the four tests listed under Risks, then verify-red.
Must not:    touch a test file in the `feat(...)` commit (CI rejects it) or loosen an assertion.
Doc drift:   spec/features-map.md F33 row, in the `docs(map)` commit after feat.
Escalate:    none
```
