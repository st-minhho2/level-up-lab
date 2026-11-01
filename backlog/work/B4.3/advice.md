# B4.3 advice

Card: B4.3 Say "all done" when every todo is completed. Section §22, `spec/contracts/20-all-done.md`. Constraint: D-24
(UI only in `src/components/remaining-count.tsx`, logic in `src/lib/todo-count.ts`; no `src/app/page.tsx`,
`todo-item.tsx`, `todo-search-form.tsx`, `todo-search.ts`, no `src/*/CLAUDE.md`). Reference implementation: §13
(`todo-count.ts`, `remaining-count.tsx`, `e2e/13-remaining-count.spec.ts`).

## Approaches

### A (recommended): fragment, `<p>` untouched, one `<span>` sibling

- Change: `allDoneMessage(count)` added to `todo-count.ts`; `RemainingCount` returns a fragment: the §13
  `<p>{remainingLabel(count)}</p>`, then `{message !== undefined && <span>{message}</span>}`. No class, no role, no
  wrapper.
- Pros: the §13 markup is byte-identical for every count other than 0 (REQ-22.3 "unchanged"); at 0 the DOM gains one
  sibling and nothing else. The existing AC-13.x tests and e2e cannot see a difference. `<span>` is not `<p>`, `<li>`,
  `<button>`, `<a>` and has no role attribute (REQ-22.4). The component stays a Server Component.
- Cons: `page.tsx` lays children out in `flex flex-col gap-6`, so the span is its own flex item and sits 24px under
  the count rather than hugging it. Cosmetic only; colour, icon and spacing are out of scope (§22 Out of scope).
- Fits rules: spec-fidelity (signature `RemainingCount({ count }): ReactNode`, props unchanged), D-24, ts-style
  (explicit return types, no `'use client'`).

### B (alternative): wrapper `<div>` around the `<p>` and the `<span>`

- Change: same lib function; the component returns `<div><p>…</p>{span}</div>` so both stay together under the page's
  gap.
- Pros: the message hugs the count visually.
- Cons: the markup of the count changes in every state (a wrapper at counts 1, 2, 11 too), against REQ-22.3 "shown
  unchanged"; the section's contract describes "one sibling element", not a wrapper; one more DOM node for the e2e
  `getByText` queries to reason about. Spacing is a style matter the spec excludes, so the cost buys nothing the
  spec asks for.
- Fits rules: compliant, but a wider diff than the spec describes.

## Recommendation

Approach A. `allDoneMessage` is `count === 0 ? 'All done' : undefined` (strict equality: the contract says "when count
=== 0"). The empty list also shows "All done" (REQ-22.5, analysis question 2): the component only sees `count`, and
the page may not change under D-24. No new dependency, no migration, no Server Action, no Zod schema.

## Impact

| File                                      | Add/Change                                                                                                                                                    | Signature                                                                                      | ACs                                             |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `src/lib/todo-count.ts`                   | Add one export; `countRemaining` and `remainingLabel` untouched                                                                                               | `export function allDoneMessage(count: number): string \| undefined`                           | AC-22.1                                         |
| `src/components/remaining-count.tsx`      | Change: import `allDoneMessage`, render the span when defined; header comment gains `§22`                                                                     | `export function RemainingCount({ count }: { readonly count: number }): ReactNode` (unchanged) | AC-22.2, AC-22.3, AC-22.4 to AC-22.7 (via page) |
| `src/lib/todo-count.test.ts`              | Add `describe('allDoneMessage (§22)')` with AC-22.1; existing cases untouched (red commit)                                                                    | n/a                                                                                            | AC-22.1                                         |
| `src/components/remaining-count.test.tsx` | Add `describe('<RemainingCount> (§22)')` with AC-22.2 and AC-22.3; existing AC-13.2 cases untouched (red commit)                                              | n/a                                                                                            | AC-22.2, AC-22.3                                |
| `e2e/22-all-done.spec.ts`                 | New: AC-22.4 to AC-22.7; same seeding, `openHydrated` and `watchNavigations` helpers as `e2e/13-remaining-count.spec.ts` (copied into the file, not imported) | n/a                                                                                            | AC-22.4, AC-22.5, AC-22.6, AC-22.7              |

Client components changed by this card: none. `RemainingCount` has no `'use client'`, no state, no events and no form,
so the three-line check does not apply to it; it is a Server Component whose output is plain HTML.

| Component                 | Approach | Server-rendered markup                                                    | Submit with JavaScript off | Submit before hydration | Today vs after                                                 |
| ------------------------- | -------- | ------------------------------------------------------------------------- | -------------------------- | ----------------------- | -------------------------------------------------------------- |
| `RemainingCount` (server) | A        | `<p>N items left</p>` plus, at 0 only, `<span>All done</span>`            | no form, none to submit    | no form, none to submit | today the `<p>` only; after, the same `<p>` plus the span at 0 |
| `RemainingCount` (server) | B        | `<div><p>…</p><span>…</span></div>` at 0, `<div><p>…</p></div>` otherwise | no form                    | no form                 | adds a wrapper in every state (con listed under B)             |

Live update (REQ-22.6) needs no client code: the mutating Server Actions of §5, §9 and §14 already call
`revalidatePath('/')`, so the RSC re-renders `RemainingCount` with the new count and the span appears or disappears.
The e2e proves it hydrated with 0 document navigations. No behavior is dropped by either approach.

## Risks

- Migration: none. Security: none (no input, constant text). Performance: none (no query; `page.tsx` still passes
  `countRemaining(todos)` from the single `listTodos()` result).
- Isolation (invariant 5): the e2e uses the worktree schema through `DATABASE_URL` like the other e2e files; nothing
  stateful is hard-coded.
- Existing tests that could turn red: every existing e2e finds the count with `getByText(label, { exact: true })`
  (`e2e/13`), which "All done" cannot match; existing `listitem` assertions are unaffected because the span is
  outside the `<ul>`. A non-exact `getByText` for a short text on a page at count 0 is the only way an old test
  would see the span, and `git grep` finds none for "All done". Component tests for AC-13.2 count `paragraph`
  roles: the span is not a paragraph. Expect no existing test to change.
- Empty-list behavior: "0 items left / No todos yet / All done" is vacuously true and a little odd. It is the
  documented choice (REQ-22.5); silence needs `page.tsx` and so a new D-n and card, not an ad hoc prop (a prop
  `page.tsx` never passes is dead code).
- A todo titled "All done" in an e2e would make `getByText('All done')` match twice; use titles A, B, C as the
  criteria do.
- No new dependency. `check-spec-sections.sh` needs the module header `// §22` where `todo-count.ts` and the
  component name it (the header already says §13; add `§22` to both).
- Approval box in `20-all-done.md` is unticked; the lead ticks it at the plan gate (analysis question 8).

## Test strategy

| Layer     | File                                      | ACs                                | Mocks                                                                                                                                                                                                                                                                                                                                 |
| --------- | ----------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit      | `src/lib/todo-count.test.ts`              | AC-22.1                            | none (pure); one `it`: 0 gives `'All done'`, 1, 2, 11 give `undefined` (`toBe`, `toBeUndefined`)                                                                                                                                                                                                                                      |
| Component | `src/components/remaining-count.test.tsx` | AC-22.2, AC-22.3                   | none; render `<RemainingCount count={n} />`; AC-22.2: `getAllByRole('paragraph')` length 1 with text `0 items left`, `getByText('All done').tagName !== 'P'`, `queryAllByRole` length 0 for listitem, button, link, alert; AC-22.3: three renders with `cleanup()` between, expect label, 1 paragraph, `queryByText('All done')` null |
| e2e       | `e2e/22-all-done.spec.ts`                 | AC-22.4, AC-22.5, AC-22.6, AC-22.7 | none; Prisma seeding with explicit `createdAt`; AC-22.6 hydrated with `watchNavigations` (0 over the first four steps), titles A, B, C                                                                                                                                                                                                |

Red (verify-red): AC-22.1 fails on an assertion because the skeleton must export `allDoneMessage` throwing
`NotImplementedError` (an import error is not red, per `testing.md`); the component tests fail on the missing "All
done" element; the e2e fail on the missing text. Every new title starts with its `AC-22.n:`. The AC-22.3 "exactly
one paragraph" and AC-22.7(b) "0 All done" cases pass today by design (they pin REQ-22.2/22.3); they are the guard
against a regression, so the red commit's "Red because" must name AC-22.1, 22.2, 22.4, 22.5, 22.6 and 22.7(a) as the
failing ones.

## Mutation hot spots

- `src/lib/todo-count.ts` `allDoneMessage`: `count === 0` to `true` (killed by 1, 2, 11 in AC-22.1), to `false`
  (killed by 0), `!==` (killed by both), the string `'All done'` to `''` (killed by `toBe('All done')`).
  `count <= 0` or `count < 1` are equivalent for the whole counts at least 0 the spec allows (it states a negative
  count is unspecified), so that mutant may survive; do not add a negative-count test to chase it.
- `countRemaining` and `remainingLabel` are unchanged; their AC-13.x tests keep their current kill rate.
- `remaining-count.tsx` is outside the Stryker `mutate` globs (`src/lib/**/*.ts`, `src/actions/**/*.ts`); the
  `message !== undefined` branch is covered by AC-22.2 and AC-22.3.

## Questions settled / escalated

```
Question:    Does "All done" replace or accompany "0 items left"?
Class:       P0 no conflict
Sources:     spec/contracts/20-all-done.md:REQ-22.3 "\"All done\" accompanies it and never replaces it, and is not itself a paragraph."
             src/components/remaining-count.test.tsx:12 "renders one paragraph reading "0 items left" for a count of 0"
Conflict:    none
Verdict:     Accompany: the spec says so; the existing AC-13.2 test pins one paragraph reading "0 items left".
Next action: Render the §13 <p> unchanged and add a non-<p> sibling.
Must not:    Replace the label at 0, or add a second <p>.
Doc drift:   none
Escalate:    none
```

```
Question:    Does the empty list show "All done"?
Class:       P2 spec silent (closed by the spec itself in REQ-22.5)
Sources:     spec/contracts/20-all-done.md:REQ-22.5 "WHILE no todo exists THE SYSTEM SHALL show \"All done\" together with \"0 items left\" and \"No todos yet\""
             backlog/00-decisions.md:49 "no `src/app/page.tsx`"
Conflict:    none
Verdict:     Yes. The component receives only `count`, and D-24 bars `page.tsx`, so the spec decides on the count alone.
Next action: Implement `count === 0`; write AC-22.5 as the spec states it.
Must not:    Add an optional `total` prop or a second `listTodos()` call to hide the message on an empty list.
Doc drift:   none
Escalate:    none
```

```
Question:    Which element carries the message, and does the page layout need a change?
Class:       P2 spec silent (tag left to the code writer by the contract)
Sources:     spec/contracts/20-all-done.md:Function contracts "one sibling element that is not a <p>, <li>, <button>, <a> and has no role"
Conflict:    none
Verdict:     A `<span>` as a fragment sibling (Approach A); the contract fixes only what it must not be.
Next action: Use a bare `<span>`; no class, no role.
Must not:    Add `role="status"` or `aria-live` (Out of scope), or edit `page.tsx` to space it.
Doc drift:   src/lib/CLAUDE.md:15 lists only `countRemaining`, `remainingLabel`: add `allDoneMessage` and a F20 row in spec/features-map.md in the orchestrator's batch-4 docs PR, not in this card (D-24 and §22 forbid package-guide edits here).
Escalate:    none
```
