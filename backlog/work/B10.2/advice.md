# B10.2 advice

## Approaches

**A (recommended): the contract's `useId` wiring in `clear-completed-button.tsx`.**

- Change: `const messageId = useId()`; the failure `<p role="alert">` gets `id={messageId}`; the `<button>` gets
  `aria-describedby={error !== undefined ? messageId : undefined}`. Same pattern as `todo-item.tsx:93` and
  `todo-due-date.tsx:131` (`error !== undefined ? errorId : undefined`).
- Pros: one file, no new state (`error` is set only from a result, so REQ-49.4 holds for free); `useId` keeps two
  buttons distinct (REQ-49.5); the id is stable for the instance; the `<p>` stays the button's next sibling (AC-10.3).
- Cons: none against the spec. A disabled button still has a description, so the pending retry keeps it (AC-49.3).
- Fits rules: invariants 1 and 3 (no new mutation path, no new action); ts-style (explicit return type kept, no `any`).

**B (alternative): a fixed id such as `clear-completed-error`**, as `todo-form.tsx:97` does for `new-todo-error`.

- Pros: trivial to read in a test.
- Cons: breaks REQ-49.5 and AC-49.6 (two buttons would share the id). The form can use a fixed id only because the
  page has one new-todo form. Not compliant with the spec; rejected.

## Recommendation

Approach A. It is the signature in the section's Function contracts block, word for word.

## Impact

| File                                                         | Add/Change | Signature                                                                                                                                               | ACs                |
| ------------------------------------------------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| `src/components/clear-completed-button.tsx`                  | Change     | `ClearCompletedButton({ disabled, completedCount }: { readonly disabled: boolean; readonly completedCount?: number }): ReactNode` (unchanged) + `useId` | AC-49.1 to AC-49.6 |
| `src/components/clear-completed-button-description.test.tsx` | Add        | six `it('AC-49.n: …')`, `vi.hoisted` mock of `@/actions/todos`, `toHaveAccessibleDescription`                                                           | AC-49.1 to AC-49.6 |
| `spec/features-map.md`                                       | Change     | add row F47 (§49) naming the component and the new test (code-writer's `docs(map)` commit)                                                              | none               |

Client component `clear-completed-button.tsx` (the only one the card changes), per approach:

- A, server-rendered markup: `<div><button type="button" disabled?>Clear completed (n)</button></div>`. Today the
  same, after the same: the initial `error` is `undefined`, so no `aria-describedby` and no `<p>` are rendered (REQ-49.2).
- A, submit with JavaScript off: there is no form; the button is `type="button"` with an `onClick`, so it does
  nothing today and after. Nothing dropped.
- A, submit before hydration: the click is lost today and after (no handler yet); no message can exist, so no
  description. Nothing dropped.
- B: same markup as A on first render; the con is the shared id (listed above). Nothing else dropped.

## Risks

- Migration: none. Dependencies: none new.
- Security: none; no input, no action change.
- Performance: one `useId` hook per instance.
- Isolation: none (no env, port or storage).
- Spec status: the section still shows `- [ ] Lead approves spec` and `spec/technical-requirements.md:56` marks §49 `✗`.
  `spec/CLAUDE.md` requires the box ticked before any test is written; the `lead` ticks it with the plan approval (D-7).
- Existing tests that could turn red: `clear-completed-button.test.tsx` AC-9.2, AC-9.3, AC-10.3 and
  `clear-completed-button-count.test.tsx` AC-32.2, AC-32.4. None should, since only an attribute and an `id` are added;
  AC-10.3 reads `button.nextElementSibling`, which stays the alert.
- The `spec/contracts/08-mutation-feedback.md:60` clause is already on main; no §10 edit remains.

## Test strategy

| Layer     | File                                                                               | ACs                                   | Mocks                                                                                                                             |
| --------- | ---------------------------------------------------------------------------------- | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| component | `src/components/clear-completed-button-description.test.tsx`                       | AC-49.1, 49.2, 49.3, 49.4, 49.5, 49.6 | `@/actions/todos` via `vi.hoisted` (all four keys, as `clear-completed-button.test.tsx`); pending retry is a hand-settled promise |
| e2e       | none (spec: the attribute is observable in jsdom; a failed clear needs a DB fault) | none                                  | n/a                                                                                                                               |

Red because: no `aria-describedby` and no `id` exist, so the AC-49.1 description assertion fails on a value, not an import.
The skeleton step is not needed (no new export); the red commit must fail on assertions.

## Mutation hot spots

- `error !== undefined ? messageId : undefined`: the conditional flip, `!==` to `===`, and the `undefined` branch
  (killed by the absent-attribute asserts of AC-49.1, 49.2, 49.5).
- `id={messageId}` removed or replaced by a literal (killed by AC-49.1 id equality and AC-49.6 distinct ids).
- Note the mutation gate covers `src/lib` and `src/actions` only; this file is outside it, so the asserts above are by review.

## Questions settled / escalated

Question: Does the section number §49 live in `47-clear-completed-description.md`?
Class: P0 no conflict
Sources: `spec/technical-requirements.md:56` "| §49 | [contracts/47-clear-completed-description.md](contracts/47-clear-completed-description.md) |"
Conflict: none
Verdict: The index maps §49 to file 47; analysis.md open question 2 is settled by the index.
Next action: use the §49 id in titles and the file 47 path in paths.
Must not: rename the file or renumber the section.
Doc drift: none
Escalate: none

Question: Is an e2e criterion required?
Class: P0 no conflict
Sources: `spec/contracts/47-clear-completed-description.md:71` "No e2e criterion: the browser path of a failed clear"
Conflict: none
Verdict: the spec says no; analysis.md open question 1 is settled.
Next action: write only the component test file.
Must not: add an e2e file or a fault hook.
Doc drift: none
Escalate: none

Question: Does `features-map.md` need an F47 row?
Class: P2 spec silent
Sources: `backlog/plan/E10-todos-access.md:29` "_F47 · section 49_"
Conflict: none (no F47 row exists in `spec/features-map.md`)
Verdict: `spec/CLAUDE.md` requires the map to move with a `src/` feature change, in code-writer's `docs(map)` commit.
Next action: add F47 (§49) after `feat`.
Must not: edit the map in the spec or test commits.
Doc drift: `spec/features-map.md` row F47, in the `docs(map)` commit
Escalate: none
