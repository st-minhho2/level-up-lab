# B5.6 advice: Escape closes the due-date editor without saving (§28)

Sources read: `spec/contracts/26-escape-due-date.md` (§28), `backlog/work/B5.6/analysis.md`, `.claude/rules/*`,
`src/components/todo-due-date.tsx` (the unit), `src/components/todo-item.tsx` (§24 reference implementation of the
same pattern), `src/lib/escape-search.ts` (§27 helper). D-30 confines the card to one file; D-32 lifted Escape from §15.

## Approaches

### A (recommended): inline `onKeyDown` on the "Due date" input, in `todo-due-date.tsx` only

- Change: add `onDueDateKeyDown(event: KeyboardEvent<HTMLInputElement>): void` next to `onSave`. Guard first:
  `if (event.key !== 'Escape' || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || pending) return;`
  Then `event.preventDefault(); setEditing(false); setDraft(dueDate ?? ''); setError(undefined);`. Wire it as
  `onKeyDown` on the `<input>` only (not the form, not the button), so REQ-28.7 holds by construction. The
  `'Escape'` literal becomes a named module constant, as `src/CLAUDE.md` asks for spec constants.
- Pros: exactly the one file D-30 and the Function contracts allow; no new export, so no features-map or
  check-spec-sections change beyond the lead's F26 row; mirrors `onTitleKeyDown` in `todo-item.tsx` (§24), so one
  pattern across the Escape cards; the red test fails on an assertion (the editor stays open), not on an import.
- Cons: the modifier test is duplicated from `isSearchEscape` (four lines), a known cost of decoupling §28 from §27.
  Resetting the draft is redundant with `onEdit`, which already reseeds from `dueDate`; REQ-28.3 asks for it anyway
  and AC-28.2 can only pass either way, so keep it (it is a required behavior) and see Mutation hot spots.
- Fits rules: invariant 1 (a section exists), 3 (no mutation added; the Escape path calls no action), 4 (no Prisma);
  `ts-style.md` (explicit return type, `KeyboardEvent` type import, no `any`, no new dependency).

### B (alternative): reuse `isSearchEscape` from `src/lib/escape-search.ts`

- Change: import the helper and call `isSearchEscape(event)`.
- Pros: no duplicated modifier logic.
- Cons: couples §28 to a helper named and specified for §27 (a change to §27 would silently change §28); a
  client component importing a §27 module adds a cross-section edge; analysis question 2 already decided "no".
  Renaming it to a shared helper would touch `src/lib` and §27's tests, outside D-30's one-file list, and needs a ruling.
- Fits rules: allowed by the layering, but not by D-30's file list; not recommended.

## Recommendation

Approach A. One file, one handler, no new surface. Tier `full` stays as the spec states.

## Impact

| File                                    | Add/Change                                                                                  | Signature                                                                           | ACs                |
| --------------------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------ |
| `src/components/todo-due-date.tsx`      | Change: `onKeyDown` on the input, named key constant, `KeyboardEvent` type import           | `function onDueDateKeyDown(event: KeyboardEvent<HTMLInputElement>): void` (private) | AC-28.1 to AC-28.6 |
| `src/components/todo-due-date.test.tsx` | Change (test commit, red): AC-28.1 to AC-28.6; add keys to existing mocks, never remove one | none                                                                                | AC-28.1 to AC-28.6 |
| `e2e/28-escape-due-date.spec.ts`        | Add (test commit, red)                                                                      | none                                                                                | AC-28.7            |
| `spec/features-map.md`                  | Change: F26 row (lead's; `docs(map)` commit after `feat`)                                   | none                                                                                | none               |

Client component `todo-due-date.tsx`, one line per approach:

- Approach A, server-rendered markup: today the server renders view mode only (`Due <date>` span plus the "Edit due
  date" button); `editing` starts false, so the input does not exist in server HTML. After: identical, the handler
  lives on an element that is never server-rendered. Submit with JavaScript off: today no editor can open (the
  button has only `onClick`, no form fallback), after: the same, nothing dropped. Submit before hydration: today the
  button click does nothing, after: the same; no field exists to press Escape in. No behavior dropped.
- Approach B: same three lines, identical; the only delta is the import. No behavior dropped.

## Risks

- Migration: none. Dependencies: none new. Security: none (no input reaches the server on Escape; no action call).
- Isolation: no env, port or storage touched (invariant 5).
- Pending: the input is not `disabled` while pending (only the button is), so Escape can reach the handler; the
  `pending` guard is the whole of REQ-28.5. A missing guard lets a save finish after the editor closed, and the
  later `setEditing(false)`/error would show an alert on a closed row.
- The success path after an ignored Escape sets `editing` false itself; do not also close on Escape there.
- Existing tests that could turn red: none expected. §15 tests never press keys in the field; `todo-item.test.tsx`
  mocks `TodoDueDate` or renders it without Escape (verify with a run). The e2e file `15-due-date.spec.ts` is
  unaffected. `userEvent.keyboard('{Escape}')` in jsdom produces a cancelable keydown; AC-28.1 needs
  `fireEvent.keyDown` or the `defaultPrevented` of a created `KeyboardEvent` to read `defaultPrevented`.
- Mutation testing covers `src/lib` and `src/actions` only; this component is outside the 70 % gate, so the six
  component tests carry the proof; each guard clause needs its own test (below).
- Escape while the native date picker is open is the browser's (out of scope); in e2e, press Escape after
  `fill`, with the picker closed.

## Test strategy

| Layer     | File                                    | ACs                | Mocks                                                                                   |
| --------- | --------------------------------------- | ------------------ | --------------------------------------------------------------------------------------- |
| component | `src/components/todo-due-date.test.tsx` | AC-28.1 to AC-28.6 | `@/actions/todos` via `vi.hoisted` (`setTodoDueDateAction`); never the component itself |
| e2e       | `e2e/28-escape-due-date.spec.ts`        | AC-28.7            | none (real DB; `page.on('request')` counts POSTs to `/`; clock not needed)              |

Notes per AC: AC-28.1 asserts `defaultPrevented === true`, the text `Due 2026-11-05` exactly once, 1 edit button,
action 0 calls. AC-28.2 covers both `dueDate` values (rerender with `undefined`). AC-28.3 renders the alert through
a rejected mock then Escape. AC-28.4 uses an unresolved promise, resolves it inside `act`. AC-28.5 is a `it.each`
over ArrowLeft, Ctrl, Meta, Alt, Shift + Escape, one modifier per case (so each `||` term is killed). AC-28.6 fires
Escape on `document.body`, the button and "New todo". Titles start `AC-28.n:`. Red on the assertion (the field stays
after Escape); the skeleton commit changes nothing because the export already exists.

## Mutation hot spots

Outside the tool's scope (component), so these are for the reviewer's manual mutation reading:

- Each of `ctrlKey`, `metaKey`, `altKey`, `shiftKey` in the guard: one test case per modifier (AC-28.5).
- `|| pending`: AC-28.4 is the only killer; also assert `defaultPrevented` is false there.
- `event.key !== 'Escape'`: ArrowLeft and Enter cases; Enter must still submit.
- `setDraft(dueDate ?? '')`: AC-28.2 with and without a due date (`''` versus `undefined`); the discarded value must differ from both.
- `setError(undefined)`: AC-28.3 (0 alerts).
- `event.preventDefault()`: AC-28.1 reads `defaultPrevented`.
- Handler on the input only: AC-28.6 (body, button, "New todo").

## Questions settled / escalated

```
Question:    Which source governs the Escape modifier rule, and may the component import isSearchEscape?
Class:       P0 no conflict
Sources:     spec/contracts/26-escape-due-date.md:17 "no Ctrl, Meta, Alt or Shift held"
             spec/contracts/26-escape-due-date.md:42 "No new export, Server Action, Zod schema, Prisma model, query, environment variable or prop."
             spec/contracts/26-escape-due-date.md:48 "The only file of `src/` this section changes is `src/components/todo-due-date.tsx`"
Conflict:    none
Verdict:     §28 governs; the check is inline in the component (analysis questions 1 and 2, D-30). A shared helper would change a second file.
Next action: write the red tests, implement approach A.
Must not:    import `src/lib/escape-search.ts` or add a lib helper.
Doc drift:   none (features-map F26 row is the lead's, in the `docs(map)` commit after `feat`)
Escalate:    none
```

```
Question:    Is Escape ignored while pending although the input is enabled?
Class:       P0 no conflict
Sources:     spec/contracts/26-escape-due-date.md:21 "THE SYSTEM SHALL ignore Escape (no `preventDefault`)"
Conflict:    none
Verdict:     REQ-28.5 and the Function contracts line (`no save in flight (§15's pending state)`) govern: guard on `pending` from `useTransition`.
Next action: test AC-28.4 with an unresolved action promise.
Must not:    disable the input to get the effect (changes §15 markup, forbidden by REQ-28.7) or close the editor while pending.
Doc drift:   none
Escalate:    none
```

```
Question:    Does the draft reset on Escape duplicate onEdit's reseed, so can it be dropped?
Class:       P0 no conflict
Sources:     spec/contracts/26-escape-due-date.md:42 "reset the draft to dueDate ?? '', clear the message"
Conflict:    none
Verdict:     The Function contracts block is exact; keep the reset although `onEdit` reseeds too.
Next action: implement it as written.
Must not:    remove it as redundant.
Doc drift:   none
Escalate:    none
```
