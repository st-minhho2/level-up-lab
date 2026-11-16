# B9.2 advice

Card B9.2, section §45 (`spec/contracts/43-due-date-focus.md`), file `src/components/todo-due-date.tsx` only.
Reference implementation: `src/components/todo-item.tsx:30-37` (§41 focuses the title on entering edit mode).

## Approaches

**A (recommended): a `useEffect` keyed on `editing`, with a ref on the date input.**

- Change: add `const fieldRef = useRef<HTMLInputElement>(null)`, `ref={fieldRef}` on the date `<input>`, and
  `useEffect(() => { if (editing) fieldRef.current?.focus(); }, [editing])`. No `select()` (REQ-45.5). Header comment
  gains "§45 focuses the date field on entering edit mode".
- Pros: same shape as `todo-item.tsx:32-37`, so the reviewer already knows it. The dependency is `editing` alone, so
  draft, pending, error, a new `dueDate` prop and "Today" never re-run it (REQ-45.3). It runs only on false to true
  (REQ-45.4), and Escape or a save sets `editing` false then true again on the next click (REQ-45.2). The effect runs
  after commit, so the input is in the document (function contract). No new prop or export.
- Cons: a second effect beside the dependency-less `useLayoutEffect(syncOverdueInputs)` at line 56; a comment must say
  why the dependency array differs. Under React StrictMode in `next dev` the effect runs twice (focus twice, same
  element); the AC-45.5 spy count assumes no StrictMode in the test and a production build in e2e.
- Fits rules: yes (`ts-style.md`: effects only for events/state in a client component; no `any`, no new dependency).

**B: `autoFocus` on the date input.**

- Change: add `autoFocus` to the `<input>`.
- Pros: one attribute, no ref, no effect.
- Cons: React focuses on mount of the input, so any remount of the input (not only the view to edit switch) refocuses.
  It adds an attribute to the field, against REQ-45.5 "the field's attributes". It is not the `focus()` call the
  function contract names ("receives `focus()`, once for that switch"), and the AC-45.5 spy on
  `HTMLInputElement.prototype.focus` would count the call only through React's internal path, which is a tested
  detail of React, not of this section. Lint (`jsx-a11y/no-autofocus`) may also reject it.
- Fits rules: weak. Not recommended.

## Recommendation

Approach A. It is what the §45 function contract describes word for word and what §41 already does for the title.

## Impact

| File                                                                                                                                                            | Add/Change | Signature                                                                   | ACs                |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------- | ------------------ |
| `src/components/todo-due-date.tsx`                                                                                                                              | Change     | `TodoDueDate({ todoId, dueDate }): ReactNode` unchanged; add ref and effect | AC-45.1 to AC-45.7 |
| `src/components/todo-due-date-focus.test.tsx`                                                                                                                   | Add        | tests AC-45.1 to AC-45.6 (card Test line names this file)                   | AC-45.1 to AC-45.6 |
| `e2e/43-due-date-focus.spec.ts` (name per the e2e convention; section number is 45, files follow the contract file number, e.g. `41-edit-title-select.spec.ts`) | Add        | Playwright, reads `document.activeElement` with `page.evaluate`             | AC-45.7            |
| `spec/features-map.md`                                                                                                                                          | Change     | F43 row, in the `docs(map)` commit right after `feat`                       | none               |

Client component `todo-due-date.tsx`, per approach:

- A. Server-rendered markup: unchanged (editing starts false; the server renders the "Edit due date" button only).
  Submit with JavaScript off: there is no form in view mode and the button is `type="button"`, so nothing submits,
  today and after. Submit before hydration: same, the click is inert, today and after; the effect never runs.
  Dropped behavior: none.
- B. Server-rendered markup: unchanged. JS off and before hydration: same as A. Dropped behavior: none, but it adds
  an `autofocus` handling difference on the field (a con above).

## Risks

- Migration: none. Dependencies: none. Security and isolation: none (no action, no data).
- Existing tests: analysis found none asserting focus on the body after "Edit due date". Re-check
  `todo-due-date*.test.tsx` AC-28.x and AC-37.x, AC-40.5(b): Escape and "Today" tests act on explicit targets, but a
  `userEvent.keyboard('{Escape}')` sent to `document.activeElement` would now land in the field, not on the body. Run the
  five due-date test files after the feat commit.
- AC-45.4 needs focus on "Today" then a rejected save to leave focus on "Update due date" (the click moved it); the effect
  must not depend on `error` or `pending`.
- Spec approval box of §45 (`43-due-date-focus.md:5`) is unticked. Under D-40 the issue label, or "approve" at the plan
  gate (D-7), ticks it; no test is written before.
- Mutation: `src/lib` and `src/actions` are untouched, so mutation testing is skipped (B1.100).
- StrictMode: confirm `next.config` / `layout.tsx` do not enable `reactStrictMode` in the e2e build, or AC-45.7 only reads the
  final active element (it does not count calls, so it is safe either way).

## Test strategy

| Layer     | File                                          | ACs                | Mocks                                                                                                                                    |
| --------- | --------------------------------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| component | `src/components/todo-due-date-focus.test.tsx` | AC-45.1 to AC-45.6 | `vi.mock('@/actions/todos')` with `vi.hoisted` object (add key, never remove); spy on `HTMLInputElement.prototype.focus` in AC-45.5 only |
| e2e       | `e2e/43-due-date-focus.spec.ts`               | AC-45.7            | none; wait for hydration (`networkidle`), count POSTs to `/`, `page.evaluate(() => document.activeElement)`                              |

Red proof: AC-45.1 fails on an assertion today (`document.activeElement` stays `body`). Titles start `AC-45.n:`.

## Mutation hot spots

Not measured by the gate here (component only). Still, the likely survivors: `[editing]` dependency (AC-45.3, AC-45.4,
AC-45.5 kill it), `if (editing)` guard (AC-45.5 count 1 after Escape kills it), optional chaining on the ref,
and an added `select()` (AC-45.5 spy and selection assertion).

## Questions settled / escalated

```
Question:    Which source governs where focus goes after Escape or a save?
Class:       P0 no conflict
Sources:     spec/contracts/43-due-date-focus.md:21 "a row that leaves edit mode (focus is not restored to "Edit due date", §28, §37)"
Conflict:    none
Verdict:     §45 REQ-45.4 and its Out of scope keep §28 and §37; the component does not move focus on exit.
Next action: do not add focus code on the exit path.
Must not:    restore focus to the "Edit due date" button.
Doc drift:   none
Escalate:    none
```

```
Question:    The "`todo-due-date.tsx` unchanged" notes in sibling sections: do they block this change?
Class:       P4 two sections collide (resolved by the spec itself)
Sources:     spec/contracts/43-due-date-focus.md:28 "they do not apply to §45, whose component is `todo-due-date.tsx`"
Conflict:    §19, §21, §37, §40 notes say the file is unchanged / §45 says it is the file it changes
Verdict:     §45 names each note by file and line and excludes it; D-40 (backlog/00-decisions.md:65) rules the same. Spec governs.
Next action: edit `todo-due-date.tsx`; no other `src/` file.
Must not:    treat the sibling notes as a veto, or edit the sibling sections.
Doc drift:   spec/features-map.md F43 row, in the `docs(map)` commit after `feat`.
Escalate:    none
```

```
Question:    Should focus select the date text?
Class:       P0 no conflict
Sources:     spec/contracts/43-due-date-focus.md:22 "the field's text is not selected by the focus, as §41's selection is for the title only"
Conflict:    none
Verdict:     REQ-45.5 governs; `todo-item.tsx:35` `select()` is evidence of §41 only.
Next action: call `focus()` only.
Must not:    copy `select()` from `todo-item.tsx`.
Doc drift:   none
Escalate:    none
```
