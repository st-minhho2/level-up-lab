# B11.2 advice

## Approaches

**A (recommended): `useId` in `CompleteAllButtonShown`, derived `aria-describedby`.**
Change: import `useId`; `const messageId = useId();` beside the `useState`; the button gets
`aria-describedby={error !== undefined ? messageId : undefined}`; the `<p>` gets `id={messageId}`. Same shape as the reference
`src/components/clear-completed-button.tsx:18,37,44` (§49). `useId` lives in the inner component, so the outer `disabled`
early return (§43) keeps its hook-free shape and an unmount drops state and id together (REQ-52.5).

- Pros: one derived value, no effect/ref/timer (§52 function contract); the attribute and the `<p>` read the same `error`,
  so one can never show without the other (REQ-52.3); the id is stable while the component stays mounted (REQ-52.4, AC-52.4
  "same id"); a failed result without `form` leaves `error` undefined: no id, no attribute (REQ-52.2, AC-52.6).
- Cons: none found.
- Fits rules: invariants 1-3 (one file, no mutation path touched); ts-style (no `any`, explicit return type kept); no
  dependency.

**B (alternative): call `useId` in the outer `CompleteAllButton` and pass it down as a prop.**
Pros: none over A. Cons: adds a prop to an inner component and calls a hook before the `if (disabled) return null`
branch for nothing; the id would survive unmount and come back with the button, weakening REQ-52.5's "no leftover
state" reading. Fits rules: allowed, but needless; §52 says "props and export unchanged" for the exported component, and the
inner prop would be a new surface.

## Recommendation

Approach A. One file, about 4 changed lines, no migration.

## Impact

| File                                                      | Add/Change                                                           | Signature                                                                                                                | ACs                |
| --------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------ |
| `src/components/complete-all-button.tsx`                  | Change                                                               | `CompleteAllButton({ disabled, count }: { readonly disabled: boolean; readonly count?: number }): ReactNode` (unchanged) | AC-52.1 to AC-52.6 |
| `src/components/complete-all-button-description.test.tsx` | Add (test commit, red first)                                         | n/a; titles `AC-52.n: ...`; new file, existing test files are not edited                                                 | AC-52.1 to AC-52.6 |
| `spec/features-map.md`                                    | Change (`docs(map)` commit after `feat`, if F50 needs a status flip) | n/a                                                                                                                      | none               |

`complete-all-button.tsx` (client component), server-rendered markup:

- Approach A, JavaScript off: the button renders as today (`<button type="button">`, no form, no `onClick` effect);
  the error state is `undefined` on the server, so no `aria-describedby` and no `<p>`; today versus after: identical,
  and a click does nothing today or after.
- Approach A, submit before hydration: a click is not a submit (type=button) and the handler is not attached yet, so
  nothing happens today and after; the markup is identical to today.
- Approach B: same two lines, identical markup (id is not rendered without the message).
- Behavior dropped by either approach: none.

## Risks

- Migration: none. Dependencies: none. Security: none (no input, no action change).
- Performance: one `useId` call; none measurable.
- Isolation: `useId` per instance, never a fixed id (REQ-52.1); two instances never share an id.
- Existing tests that could turn red: none expected. AC-14.4/14.5, AC-36.2/36.4, AC-43.2 to 43.4 assert name, count of
  alerts, enabled state, focus and `tabindex`; none asserts the absence of `id` or `aria-describedby`. AC-52.2 and
  AC-52.6 need the container to hold no `id` when no message is shown: holds, since the `<p>` is the only element
  with an id and exists only while the message is shown.
- Doc drift: `spec/contracts/12-complete-all.md:58` clause already added per analysis; none further.
- Mutation: `error !== undefined ? messageId : undefined` is the one new branch; surviving mutants are the ternary
  flip and the `id` removal.

## Test strategy

| Layer             | File                                                            | ACs                                         | Mocks                                                                                                                                                                   |
| ----------------- | --------------------------------------------------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| component (jsdom) | `src/components/complete-all-button-description.test.tsx` (new) | AC-52.1, 52.2, 52.3, 52.4, 52.5, 52.6       | `vi.mock('@/actions/complete-all')` via `vi.hoisted` `completeAllTodosAction`; a held promise for AC-52.4 (two renders, one settled with the failure, one with success) |
| e2e               | none                                                            | none (§52 Out of scope: no fault injection) | n/a                                                                                                                                                                     |

Use `toHaveAccessibleDescription` and `hasAttribute('aria-describedby')`; for AC-52.5 re-render with `disabled`/`count`
props and assert `container.childNodes.length` is 0. Red because: without the attribute, AC-52.1/52.3/52.4 fail on
`aria-describedby` assertions; AC-52.2, 52.5 (after first re-render) and 52.6 already hold and are guarded as
regressions, so each file must contain at least one assertion that fails on the skeleton (AC-52.1, 52.3, 52.4 do).

## Mutation hot spots

- `src/components/complete-all-button.tsx` is outside the `src/lib` + `src/actions` mutation scope; still, the ternary
  (`!== undefined`) and `id={messageId}` are what AC-52.1 (id equals alert id, non-empty) and AC-52.3/52.6 (absent
  attribute) kill.
- The unchanged `result.fieldErrors.form?.[0]` read is killed by AC-52.6 (empty `fieldErrors`).

## Questions settled / escalated

```
Question:    Where does useId go, given the early return on disabled?
Class:       P0 no conflict
Sources:     spec/contracts/50-complete-all-description.md:64 "a failure message that is shown is `<p id={useId()} role="alert">` and the button carries `aria-describedby` with that same id only while the message is shown"
Conflict:    none
Verdict:     §52 governs; hooks cannot follow the `if (disabled) return null` in the outer component, so the inner CompleteAllButtonShown holds it, as the reference clear-completed-button.tsx does.
Next action: write the red test file, then the one-file feat.
Must not:    hard-code an id, add a ref/effect/focus call/tabindex, or add a prop.
Doc drift:   none
Escalate:    none
```

```
Question:    A failed result without a `form` message: describe the button?
Class:       P0 no conflict
Sources:     spec/contracts/50-complete-all-description.md:20 "or when a failed result carries no `form` message) THE SYSTEM SHALL give the button no `aria-describedby` attribute"
Conflict:    none
Verdict:     REQ-52.2 and AC-52.6 settle it; deriving from `error !== undefined` satisfies it.
Next action: cover it in AC-52.6's test.
Must not:    point `aria-describedby` at an id that is not rendered.
Doc drift:   none
Escalate:    none
```

```
Question:    Does the §41 note "only file of src/ that §43 changes" bind §52?
Class:       P4 two sections collide (resolved by the spec itself)
Sources:     spec/contracts/50-complete-all-description.md:34 "it does not bind §52, which changes the same one file and no other"
Conflict:    41 note lists the files §43 leaves alone / §52 changes complete-all-button.tsx
Verdict:     §52 states the note is §43's own scope; spec contracts outrank nothing here, and the section text is explicit.
Next action: none.
Must not:    treat the §41 note as forbidding the edit.
Doc drift:   none
Escalate:    none
```
