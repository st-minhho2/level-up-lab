# B11.3 advice: a failed delete's message describes "Delete todo" (§53)

## Approaches

**A (recommended): `useId` in `delete-todo-button.tsx`, the same shape as `clear-completed-button.tsx` (§49).**

- Change: `const messageId = useId()` once per instance; `id={messageId}` on the `role="alert"` span;
  `aria-describedby={error !== undefined ? messageId : undefined}` on the button. Nothing else moves.
- Pros: one file, as the §53 contract says; `useId` is unique per instance and independent of the todo id
  (REQ-53.2); `error` already follows §19 (kept while pending, replaced on settle, cleared on success, untouched by
  a cancelled confirmation), so REQ-53.4/53.5/53.6 hold with no new state; precedent in `clear-completed-button.tsx`.
- Cons: `useId` yields ids with colons (`:r1:`); fine for `aria-describedby`, `querySelectorAll('[id]')` and
  `getElementById`, but not usable in a CSS selector without escaping (no test does that).
- Fits rules: yes (no new dependency, no Prisma, no action change, no `any`).

**B (alternative): derive the id from the todo id (`todo-<id>-delete-error`).**

- Pros: deterministic ids.
- Cons: breaks REQ-53.2 (the id must be independent of the todo's id) and gives a duplicate id if two buttons share
  a todoId (AC-53.5 uses distinct ids, but the spec forbids the derivation). Rejected by the spec.

## Recommendation

Approach A. Spec-compliant and one file.

## Impact

| File                                                     | Add/Change                               | Signature                                                                                                                  | ACs                |
| -------------------------------------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| `src/components/delete-todo-button.tsx`                  | Change                                   | `DeleteTodoButton({ todoId }: { readonly todoId: string }): ReactNode` unchanged; import `useId`; header comment names §53 | AC-53.1 to AC-53.6 |
| `src/components/delete-todo-button-description.test.tsx` | Add (test commit, red first)             | n/a                                                                                                                        | AC-53.1 to AC-53.6 |
| `spec/features-map.md`                                   | Change (`docs(map)`, right after `feat`) | n/a                                                                                                                        | n/a                |

Client component `delete-todo-button.tsx`, server-rendered markup (it is `'use client'` but still SSR-rendered):

- Approach A, JavaScript off: today the button has no handler (type="button", no form), so a submit does nothing; after: the same. The idle markup is identical (no `aria-describedby`, no message, no id); the id only appears with a message, which needs JS to exist.
- Approach A, before hydration: today a click does nothing; after: the same, with the same idle markup. No behavior dropped.
- Approach B: same on both counts; drops nothing but violates REQ-53.2 (listed as a con above).

## Risks

- Migration: none. Security: none (no input, no action change). Performance: none. Isolation: none.
- Existing tests that could turn red: `delete-todo-button.test.tsx` and `todo-item.test.tsx` showed no assertion on attribute names, ids or `[id]` counts (grep), so none expected. The AC-35.3 "adds no text to the row" assertions hold: no text is added.
- `useId` in a Server-rendered row is stable across hydration; no mismatch risk.
- No new dependency.
- Spec approval box `- [ ] Lead approves spec` in §53 is unticked, as for the neighbouring §47 to §52 sections; the lead's plan approval ticks it (D-7 per `spec/CLAUDE.md`).
- The §35 function-contract comment "no prop, state, element or attribute is added" contradicts the code after the change only on its face; §53 says explicitly it does not apply (REQ-35.5 already carries the clause). No doc change needed.

## Test strategy

| Layer     | File                                                     | ACs                | Mocks                                                                                                                           |
| --------- | -------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| component | `src/components/delete-todo-button-description.test.tsx` | AC-53.1 to AC-53.5 | `@/actions/delete-todo` via `vi.hoisted`; `window.confirm` stubbed; `toHaveAccessibleDescription`; deferred promise for AC-53.3 |
| component | same file                                                | AC-53.6            | the §5, §6, §15, §19 actions as in `todo-item.test.tsx`; confirm stubbed                                                        |

Red because: the component sets no `aria-describedby` and no id, so the attribute and description assertions fail. Skeleton is not needed (the file exists; the failure is on assertions, not an import).

## Mutation hot spots

`src/components` is outside the mutation scope (`src/lib` + `src/actions`), so no score applies. Conditions worth pinning anyway: the `error !== undefined` guard (AC-53.1 absence before the failure, AC-53.2 absence after success), and the id uniqueness (AC-53.5, equality to the alert's id, not only non-empty).

## Questions settled / escalated

```
Question:    Does REQ-35.5 / the §35 contract comment forbid adding aria-describedby and an id to DeleteTodoButton?
Class:       P0 no conflict
Sources:     spec/contracts/33-delete-confirm.md:20 "This rule covers the confirmation only: §53 adds `aria-describedby` to the button for the message of a failed delete."
Conflict:    none
Verdict:     §53 governs the failure message; §35's rule covers only the confirmation, and REQ-35.5 already says so (authority 3, same tier, explicit carve-out).
Next action: implement approach A after the red test commit.
Must not:    derive the id from todoId or add any other aria-* attribute, text or prop.
Doc drift:   none
Escalate:    none
```
