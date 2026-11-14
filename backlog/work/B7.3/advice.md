# B7.3 advice: the "Today" button (§37)

Authority read: invariants, `spec/contracts/35-due-date-today.md` (§37), §15 REQ-15.6, §28 REQ-28.1 to 28.7, §17 REQ-17.1/17.7,
`analysis.md`, `src/components/todo-due-date.tsx`. No D-n beyond D-37 applies; no conflict outside D-37's edit list.

## Approaches

**A (recommended): one shared Escape handler, one new button, in `todo-due-date.tsx` only.**
Change: widen `onDueDateKeyDown` to `KeyboardEvent<HTMLInputElement | HTMLButtonElement>` and attach it to the field and
to the new button; add `onToday()` doing `setDraft(todayOf(new Date()))`; render `<button type="button" onClick={onToday}
onKeyDown={onDueDateKeyDown} disabled={pending}>Today</button>` between the field and the submit button.

- Pros: one file (the §37 contract's "only file"), no new export, REQ-37.4/37.5 hold by construction (same code path as
  §28: `pending`, modifiers, `preventDefault`, draft reset, message cleared); `todayOf` already imported.
- Cons: the handler's name `onDueDateKeyDown` then covers a button; rename it (`onEscapeKeyDown`) or comment why.
- Fits rules: yes (invariants 1, 3, 4: no mutation, no Prisma, no new lib).

**B (alternative): a second handler `onTodayKeyDown` duplicating the Escape logic.**

- Pros: each element has an explicit handler.
- Cons: two copies of the §28 rule that can drift (REQ-37.4 says "what §28 specifies"); more mutation surface; no benefit.
- Fits rules: yes, but worse on spec-fidelity (one rule, one place).

Dropped behavior: neither approach drops anything.

## Recommendation

A. The click reads `new Date()` inside the handler (REQ-37.2, AC-37.3); never use the `today` state (mount-time, REQ-17.7).
Do not call `setError`, `startTransition` or `setEditing` in `onToday` (REQ-37.3; analysis Q1: message is kept).
Keep the `today` marker logic and view-mode markup untouched (REQ-37.6).

## Impact

| File                                                 | Add/Change | Signature                                                                                         | ACs                |
| ---------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------- | ------------------ |
| `src/components/todo-due-date.tsx`                   | Change     | `TodoDueDate({ todoId, dueDate }): ReactNode` unchanged; add `onToday(): void`; widen key handler | AC-37.1 to AC-37.5 |
| `src/components/todo-due-date-today-button.test.tsx` | Add        | component tests, `setTodoDueDateAction` mocked via `vi.hoisted`                                   | AC-37.1 to AC-37.5 |
| `e2e/35-due-date-today.spec.ts`                      | Add        | Playwright, one file per section (seed pattern of `e2e/28-escape-due-date.spec.ts`)               | AC-37.6            |
| `spec/technical-requirements.md` index row §37 `✗`   | Change     | flip status at card close, not by the build                                                       | none               |

Client component `todo-due-date.tsx`, per approach (A and B render the same markup):

- Server-rendered markup: today and after are identical. Edit mode needs client state, so the SSR HTML is view mode only,
  and §37 adds nothing there (REQ-37.6).
- Submit with JavaScript off: today the editor cannot open (no form is rendered); after, unchanged. The "Today" button
  does not exist without JS, so nothing is submitted or lost.
- Submit before hydration: today "Edit due date" does nothing (no handler yet); after, unchanged. "Today" is unreachable
  before hydration for the same reason, so no click can be dropped.

## Risks

- Migration: none. Dependencies: none. Security: none (no input crosses a boundary; the field still goes through
  `setTodoDueDateAction` and its Zod schema on save).
- Performance: none.
- Isolation: e2e needs `docker compose up -d`; the browser's local day, not the server's, is `<today>` (read as AC-17.7).
- Existing tests: analysis found every button query by exact name ("Edit due date", "Update due date"); `todo-due-date.test.tsx:27`
  checks `container.children` length 1 (the wrapper), unaffected. AC-28.6 "Escape on $name" still passes: "Update due
  date" has no handler. Re-run `todo-due-date*.test.tsx`, `e2e/15`, `28`, `31` to confirm.
- A native `<button>` Enter/Space triggers click: acceptable, it only fills the field (AC-37.5(b) uses ArrowLeft).
- Timer pitfall: the tests use `vi.useFakeTimers({ toFake: ['Date'] })`; do not read the day outside the handler.
- Layout: the form is `flex items-center gap-2`; a new button needs no wrapper (AC-37.1 requires exactly 4 element children).

## Test strategy

| Layer     | File                                                 | ACs                | Mocks                                                   |
| --------- | ---------------------------------------------------- | ------------------ | ------------------------------------------------------- |
| Component | `src/components/todo-due-date-today-button.test.tsx` | AC-37.1 to AC-37.5 | `@/actions/todos` (`vi.hoisted`), fake `Date` only      |
| E2E       | `e2e/35-due-date-today.spec.ts`                      | AC-37.6            | none (real Postgres, request listener for POSTs to `/`) |

Titles start `AC-37.n:`. The red commit is `test(components): B7.3 ... (red)`, red on the missing "Today" button (assertion,
not import); run `scripts/verify-red.sh B7.3`. The e2e file name `35-...` follows the contract file number (e2e files
`28-` ... `34-` show the pattern is the contract's number, which here is `35`); confirm with the lead if the CI guard
expects §-numbered names (analysis Q3 covers the component file only).

## Mutation hot spots

- `todayOf(new Date())` read at the click versus mount (AC-37.3 second click, zero-padding of `2026-01-05`).
- The `pending` guard on the key handler and `disabled={pending}` on "Today" (AC-37.5a).
- The modifier check (each of Ctrl, Meta, Alt, Shift on Escape) and `event.key !== CANCEL_KEY` (AC-37.5b).
- `type="button"` (removal would submit: AC-37.2 asserts 0 action calls).
- Button order in the form (AC-37.1).
- Mutation score is measured on `src/lib` and `src/actions`, which this card does not change; no lib change, so the score is unaffected.

## Questions settled / escalated

```
Question:    Which source governs the button's markup, order and Escape behavior?
Class:       P0 no conflict
Sources:     spec/contracts/35-due-date-today.md:15 "WHILE a row is in due-date edit mode (§15 REQ-15.6) THE SYSTEM SHALL show in the edit form, in this order, the label"
Conflict:    none
Verdict:     §37 governs; D-37 edits to REQ-15.6 are already merged into the spec.
Next action: write the red test file, then the build.
Must not:    add a second component, a lib function or a prop.
Doc drift:   none (spec index row §37 flips at card close)
Escalate:    none
```

```
Question:    Does REQ-28.7 forbid Escape handling on "Today"?
Class:       P4 two sections collide (resolved in the spec)
Sources:     spec/contracts/26-escape-due-date.md:23 "§37 adds the "Today" button in edit mode and Escape on it (REQ-37.4); this requirement limits §28's own change and does not apply to §37."
Conflict:    REQ-28.7 says Escape elsewhere does nothing / REQ-37.4 says Escape on "Today" closes the editor
Verdict:     the spec states REQ-28.7 does not apply to §37; §37 governs (D-37).
Next action: keep AC-28.6 as is (it tests "Update due date", body and "New todo", not "Today").
Must not:    attach the handler to "Update due date" or to the form.
Doc drift:   none
Escalate:    none
```

```
Question:    Does "Today" keep the row's error message, and is it disabled while saving?
Class:       P2 spec silent (closed by the spec)
Sources:     spec/contracts/35-due-date-today.md:19 "change the stored due date, leave edit mode or change the row's message"
Conflict:    none
Verdict:     REQ-37.3 keeps the message; REQ-37.5 disables the button while pending. analysis Q1 and Q2 are settled by them.
Next action: do not call setError in onToday.
Must not:    clear the error on click.
Doc drift:   none
Escalate:    none
```
