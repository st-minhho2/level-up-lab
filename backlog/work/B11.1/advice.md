# B11.1 advice

Section §51 (`spec/contracts/49-escape-due-date-focus.md`), component `src/components/todo-due-date.tsx` only. Reference
implementation: §48 in `src/components/todo-item.tsx:20-47,56-62` (`escapedRef` + `editButtonRef`, consumed in the
`[editing]` effect).

## Approaches

**A (recommended): escape flag ref + button ref, consumed in the existing `[editing]` effect.**
Change: add `editButtonRef = useRef<HTMLButtonElement>(null)` on the "Edit due date" `<button>` and
`escapedRef = useRef(false)`. `onDueDateKeyDown`'s Escape branch (after the existing `modified || pending` guard) sets
`escapedRef.current = true`. The effect at `todo-due-date.tsx:62` keeps `if (editing) { field.focus(); return; }` and
adds `if (escapedRef.current) { escapedRef.current = false; editButtonRef.current?.focus(); }`.
Pros: same shape as §48 (already reviewed on main); focus happens after the commit in which the button is in the
document (function contract); `onSave`/`onClear`/`save` never set the flag, so REQ-51.3 holds by construction; a save in
flight never sets it (Escape returns early while `pending`, REQ-51.2); keyed on `editing` only, so re-renders and a new
`dueDate` prop make no call (REQ-51.5); no `select()` (REQ-51.6).
Cons: a ref flag is implicit state; the flag stays true if Escape sets it but `editing` was already false (cannot happen:
the handler exists only in the form).
Fits rules: ts-style (no `any`, `readonly`), invariants (no Prisma, no action change).

**B: state flag (`const [restoreFocus, setRestoreFocus] = useState(false)`) with an effect on `[editing, restoreFocus]`.**
Pros: explicit and visible in React devtools. Cons: one extra render per Escape; effect dependency on the flag re-runs it
when reset, easy to mis-key and violate REQ-51.5 ("once", "no other time"); diverges from §48's pattern.
Also dropped: calling `focus()` inside the handler (the button is not rendered yet, REQ-51.1 would fail) and
`flushSync` (unneeded complexity).

## Recommendation

A. Seven lines in one file, mirrors §48, no new dependency, no migration.

## Impact

| File                                                 | Add/Change                                                                                                                                         | Signature                                               | ACs                 |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ------------------- |
| `src/components/todo-due-date.tsx`                   | Change: two refs, flag in Escape branch, effect extended, `ref` on the button, header comment                                                      | `TodoDueDate({ todoId, dueDate }): ReactNode` unchanged | AC-51.1 to AC-51.7  |
| `src/components/todo-due-date-escape-focus.test.tsx` | Add (red commit)                                                                                                                                   | tests only                                              | AC-51.1 to AC-51.6  |
| `e2e/51-escape-due-date-focus.spec.ts`               | Add (red commit)                                                                                                                                   | Playwright                                              | AC-51.7             |
| `src/components/todo-due-date-focus.test.tsx`        | Change (red commit): `:86` and `:133` `document.body` becomes the "Edit due date" button; titles `:79`, `:110` say "is the button "Edit due date"" | tests only                                              | AC-45.3(a), AC-45.5 |
| `spec/features-map.md`                               | Change in `docs(map)` commit: F49                                                                                                                  | none                                                    | none                |

Client component `todo-due-date.tsx`, per approach:

- A, server-rendered markup: today versus after identical (a `ref` is not serialized; view mode still renders the same
  button, `aria-label`, `title`, `type`, `disabled`). Submit with JS off: the form exists only in edit mode, which needs
  JS, so no submit is possible, today or after. Submit before hydration: the "Edit due date" click does nothing before
  hydration, today and after. Dropped behavior: none.
- B, markup: identical to A on all three; dropped behavior: none, but one extra render per Escape (con above).

## Risks

- Migration: none. Security: none (no input, action or schema). Performance: none for A.
- Isolation: refs are per component instance; another row's wrapper never receives focus (AC-51.6).
- Existing tests that turn red: exactly two, named in §51 (`todo-due-date-focus.test.tsx:79`, `:110`); both are rewritten
  in the red commit, the only test edits. Line `:58` (initial render) and `todo-item-escape-focus.test.tsx` (§48, title
  editor) stay green. AC-28.1/28.4/28.6, AC-37.4/37.5, AC-40.5 assert no focus target after Escape and stay green.
- Review risk: the `HTMLButtonElement.prototype.focus` spy is polluted by `userEvent.click`; tests must filter
  `mock.contexts` by receiver (spec says so).
- Dependencies: none added. Doc drift edits to §45 and the lifted lines are already in the `docs(spec)` commit.

## Test strategy

| Layer     | File                                                 | ACs                         | Mocks                                                                  |
| --------- | ---------------------------------------------------- | --------------------------- | ---------------------------------------------------------------------- |
| component | `src/components/todo-due-date-escape-focus.test.tsx` | AC-51.1 to AC-51.6          | `@/actions/todos` via `vi.hoisted` (`setTodoDueDateAction`); focus spy |
| component | `src/components/todo-due-date-focus.test.tsx`        | AC-45.3(a), AC-45.5 (edits) | same as today                                                          |
| e2e       | `e2e/51-escape-due-date-focus.spec.ts`               | AC-51.7                     | none (needs `docker compose up -d`)                                    |

Red proof: AC-51.1 fails on an assertion (`document.activeElement` is `body`); `scripts/verify-red.sh B11.1`. A skeleton
commit is not needed: no new export exists.

## Mutation hot spots

- `escapedRef.current = true` removed or set outside the Escape branch (save/clear would steal focus: AC-51.3/51.4).
- The `escapedRef.current = false` reset removed (second render or later `editing` flip refocuses: AC-51.1 re-render, 51.5).
- `if (editing) return` ordering in the effect (entry focus vs button focus: AC-51.6).
- `|| pending` and the `modified` guard in `onDueDateKeyDown` (AC-51.3, AC-51.5).
- Optional chain on `editButtonRef.current?.focus()` (equivalent mutant; acceptable).
  Component code is outside the ≥ 70 % scope (`src/lib` + `src/actions`), so this is a review aid, not a gate.

## Questions settled / escalated

```
Question:    Does Escape-restores-focus contradict §45 REQ-45.4 or D-30/D-32?
Class:       P0 no conflict
Sources:     spec/contracts/49-escape-due-date-focus.md:29 "`43-due-date-focus.md:21` (§45 REQ-45.4): the clause"
Conflict:    none (§51 lists the §45 edits and lifts in the same docs(spec) commit; D-45 allows them)
Verdict:     §51 governs for Escape; a save and a clear keep §45's no-focus rule.
Next action: write the red tests, including the two §45 test rewrites.
Must not:    restore focus after a save or clear.
Doc drift:   features-map F49 in the `docs(map)` commit after `feat`.
Escalate:    none
```

```
Question:    May the effect-based focus replace calling focus() in the handler?
Class:       P0 no conflict
Sources:     spec/contracts/49-escape-due-date-focus.md:83 "receives focus() once, after the commit in which edit mode has ended and that button is in the document"
Conflict:    none
Verdict:     the function contract requires post-commit focus; handler-time focus is non-compliant.
Next action: implement Approach A.
Must not:    call focus() inside onDueDateKeyDown.
Doc drift:   none
Escalate:    none
```
