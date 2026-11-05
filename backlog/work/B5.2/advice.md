# B5.2 advice: Escape cancels a title edit (§24)

## Approaches

**A (recommended): `onKeyDown` on the title `<input>` in `todo-item.tsx`.**
Change: `onKeyDown={onTitleKeyDown}`; when `event.key === 'Escape'` and `!pending`: `setEditing(false)`,
`setDraft(todo.title)`, `setError(undefined)`. Pros: exactly the Function contract; one file; REQ-24.6 holds because
other keys fall through untouched; `onEdit` already resets the draft, so the reset on Escape is belt and braces for
REQ-24.3. Cons: Escape on the checkbox, Save or Delete button while editing does nothing (analysis open question 3,
out of scope per §24). Fits rules: client component only for events, no action, no lib, no schema.

**B (alternative): `onKeyDown` on the `<form>` (bubbles from the field and from Save).**
Pros: also cancels with focus on Save. Cons: leaves the spec's "title field" wording (REQ-24.1); Escape on the Save
button is unspecified; not the contract text. Not recommended.

Drops nothing in either approach.

## Recommendation

A. Guard with the existing `pending` from `useTransition` (REQ-24.5). Do not `preventDefault`; nothing needs it.

## Impact

| File                                | Add/Change                            | Signature                                                          | ACs                               |
| ----------------------------------- | ------------------------------------- | ------------------------------------------------------------------ | --------------------------------- |
| `src/components/todo-item.tsx`      | Change: keydown handler on field      | `TodoItem({ todo }: { readonly todo: Todo }): ReactNode` unchanged | AC-24.1 to AC-24.5                |
| `src/components/todo-item.test.tsx` | Add: AC-24.1 to AC-24.5 titles        | none                                                               | AC-24.1 to AC-24.5                |
| `e2e/24-escape-edit-title.spec.ts`  | Add: new file                         | none                                                               | AC-24.6                           |
| `spec/features-map.md`              | Change: add F22 row (§24), own commit | none                                                               | none (CI `check-features-map.sh`) |
| `spec/technical-requirements.md`    | Change at close: §24 status ✗ to ✅   | none                                                               | none                              |

Client component `todo-item.tsx`, per approach:

- A: server-rendered markup today and after: idle row only (label plus "Edit title" button); the edit field is
  client state, never server-rendered, so identical. JavaScript off: editing cannot start (button has no handler
  without hydration), so Escape is moot, unchanged. Submit before hydration: the form exists only after hydration,
  unchanged. Dropped behavior: none.
- B: same three answers; identical markup.

## Risks

- Migration: none. Dependency: none. Security: no new input path; no action call on Escape.
- Isolation: no env, port or storage touched. e2e uses `/` with a seeded list; no fixed ids, no shared state.
- Performance: one handler.
- Existing tests that could turn red: AC-10.2 (failed save keeps draft) and AC-6.4/6.5 must still see the field after
  a failed save: handler must not act on non-Escape keys. `userEvent.type` sends `{Escape}` only if asked, so none turn red.
- In-flight toggle (spec silent, REQ-24.5 names "a save"): `pending` is shared by toggle and save, so Escape is also
  ignored during a toggle. Safe: avoids a late toggle error appearing after cancel. See Questions.
- AC-24.4 timing: the draft must be read from the closure at submit (already so); do not clear it on Escape while pending.
- e2e AC-24.6 "0 POST requests to `/`": register `page.on('request')` after the field opens and before Escape; Server
  Actions are POSTs to the page URL.
- Feat commit must not touch tests; skeleton commit is optional here (no new export), so red is a behavior failure
  (field still present after Escape).

## Test strategy

| Layer     | File                                | ACs                             | Mocks                                                                                                                 |
| --------- | ----------------------------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| component | `src/components/todo-item.test.tsx` | AC-24.1, 24.2, 24.3, 24.4, 24.5 | existing `vi.hoisted` `actions` object (`updateTodoTitleAction`); add no key removal; AC-24.4 uses a deferred promise |
| e2e       | `e2e/24-escape-edit-title.spec.ts`  | AC-24.6                         | none (real app and DB)                                                                                                |

Titles start `AC-24.n:`; the card's red test is the AC-24.1 title. AC-24.5 asserts `toHaveBeenCalledWith('todo-9', 'Buy milk')`
once and, in a separate step, ArrowLeft leaves the field with 0 calls.

## Mutation hot spots

- `event.key === 'Escape'` (equality, string literal): the AC-24.5 ArrowLeft test kills it.
- `!pending` guard (negation, removal): AC-24.4 kills it.
- `setError(undefined)` removal: AC-24.3. `setDraft(todo.title)` removal: only observable via AC-24.2 if `onEdit` did not
  also reset; it does, so that mutant survives. Accept (equivalent mutant) or drop the redundant reset; keep it, REQ-24.3 names the discard.
  (Component code is outside the mutation scope `src/lib` + `src/actions` anyway.)

## Questions settled / escalated

```
Question:    Does Escape act while a toggle (not a save) is in flight?
Class:       P2 spec silent
Sources:     spec/contracts/22-escape-edit-title.md:19 "WHILE a save of that row is in flight THE SYSTEM SHALL ignore Escape"
Conflict:    none
Verdict:     Spec governs only saves; ignoring during any pending transition is a superset that keeps every AC true. Use `pending`.
Next action: Note it in plan.md; no spec change.
Must not:    Add a second state flag for saves only.
Doc drift:   none
Escalate:    none
```

```
Question:    Which file name for the e2e of AC-24.6?
Class:       P0 no conflict
Sources:     backlog/work/B5.2/analysis.md:10 "file `e2e/24-escape-edit-title.spec.ts` (name by section, as 22-all-done)"
Conflict:    none
Verdict:     Name by section: `e2e/24-escape-edit-title.spec.ts` (contract file number 22 is not the section).
Next action: Create it in the test commit.
Must not:    Name it `22-escape-edit-title.spec.ts` after the contract file.
Doc drift:   spec/features-map.md has no F22 row; add it (§24, `todo-item.tsx`, tests above) in the `docs(map): F22 [B5.2]` commit.
Escalate:    none
```
