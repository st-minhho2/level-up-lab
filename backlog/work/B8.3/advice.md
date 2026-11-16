# B8.3 advice: "Mark all complete" hidden when nothing is open (§43)

## Approaches

**A (recommended): split into an exported shell and a private inner component.** `CompleteAllButton` (same name,
props, export) returns `null` when `disabled` is true, else `<CompleteAllButtonShown count={count} />`. The inner
function (not exported, same file) holds today's `useTransition`, `useState(error)`, the handler and the markup, minus
`disabled || pending` becoming `pending`.

- Change: one file, `src/components/complete-all-button.tsx`.
- Pros: unmounting resets state, so the failure message cannot return (REQ-43.4, AC-43.3) with no effect, ref or
  timer (§43 "keeps no timer, effect or ref"). A result arriving after the hide (action still in flight when the
  refreshed list flips `disabled`) calls `setError` on an unmounted instance: no stale message on re-show. `null`
  from the first render, so SSR contains nothing (REQ-43.1). No `focus()`, no ref, no tabindex (REQ-43.5).
- Cons: two functions in one file. `ts-style.md` says one exported component per file; the inner is not exported, so
  it holds, but the reviewer should see it named. A pending transition on an unmounted instance is dropped (nothing
  user-visible; AC-43.2 keeps `disabled` false, so no unmount there).
- Fits rules: yes (invariants 1, 3; no Prisma, no action change).

**B (alternative): one component, early `return null` after the hooks, clear state during render.**
`if (disabled) { if (error !== undefined) setError(undefined); return null; }` after the hooks.

- Pros: one function; no new name.
- Cons: React keeps the `useState` while `null` is returned, so a mark-all that fails while the button is hidden
  (in flight across the flip) sets `error` after the clear and the message returns on re-show, which breaks
  REQ-43.4. Setting state in render is the pattern React documents but it is easy to get wrong, and mutation testing
  will probe the guard. An early return before the hooks is forbidden (rules of hooks), so the order is fixed.
- Fits rules: yes, but weaker against REQ-43.4.

Dropped by either approach: the disabled-at-0 button (the card's purpose); `disabled` still disables nothing
beyond `pending` once shown. No behavior else is dropped.

## Recommendation

A. It satisfies the §43 contract line "a failure message set while the button was shown is not shown after the
component was last rendered with `disabled` true" by construction, and needs no page, lib or action change (D-39).

## Impact

| File                                                     | Add/Change   | Signature                                                                                                                                                           | ACs                                      |
| -------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `src/components/complete-all-button.tsx`                 | Change       | `CompleteAllButton({ disabled, count }: { readonly disabled: boolean; readonly count?: number }): ReactNode` unchanged; private `CompleteAllButtonShown({ count })` | AC-43.1 to AC-43.7, AC-14.4 (a), AC-36.3 |
| `src/components/complete-all-button-hidden.test.tsx`     | Add (red)    | AC-43.1 to AC-43.4                                                                                                                                                  | AC-43.1 to AC-43.4                       |
| `e2e/43-complete-all-hidden.spec.ts`                     | Add (red)    | AC-43.5 to AC-43.7                                                                                                                                                  | AC-43.5 to AC-43.7                       |
| `src/components/complete-all-button.test.tsx`            | Change (red) | title and assertion of AC-14.4 (a), title verbatim from §43                                                                                                         | AC-14.4                                  |
| `src/components/complete-all-button-count.test.tsx`      | Change (red) | AC-36.3 title verbatim from §43                                                                                                                                     | AC-36.3                                  |
| `e2e/14-complete-all.spec.ts`                            | Change (red) | AC-14.6 (a), (b) titles and assertions                                                                                                                              | AC-14.6                                  |
| `e2e/36-complete-all-count.spec.ts`                      | Change (red) | AC-36.6, AC-36.7 titles and assertions                                                                                                                              | AC-36.6, AC-36.7                         |
| `src/components/CLAUDE.md` (optional, same feat commit?) | Doc          | one line: hidden at `disabled` true (§43)                                                                                                                           | none                                     |

`CompleteAllButton` is a client component. Server-rendered markup (it is a plain `type="button"` with no form, so
JavaScript off and pre-hydration give the same result as a click):

| Case                        | Today                                         | After A or B                                  |
| --------------------------- | --------------------------------------------- | --------------------------------------------- |
| Server render, an open todo | wrapper div, enabled button, label with count | same                                          |
| Server render, no open todo | wrapper div, disabled button                  | nothing (no wrapper, no text)                 |
| Submit with JavaScript off  | no form, click does nothing                   | same (shown) / no control (hidden)            |
| Submit before hydration     | click does nothing (no handler yet)           | same when shown; nothing to click when hidden |

The CLAUDE.md line: `.claude/` is not touched; `src/components/CLAUDE.md` is outside the §43 "only file" statement
("The only file of `src/` this section changes"), so skip it unless the lead asks. I list it for the lead, not as
planned scope. Remove the row from the plan if skipped; the plan must not list it unapproved.

## Risks

- Migration: none. Dependency: none. Security: none (no action, schema or input change). Performance: none.
- Isolation: no state, port or env touched.
- Existing tests that turn red: `complete-all-button.test.tsx` AC-14.4 (a), `complete-all-button-count.test.tsx`
  AC-36.3, e2e 14 (AC-14.6 a, b), e2e 36 (AC-36.6, AC-36.7); all six are the rewrites §43 pins by title. Their
  quoted titles in §36 and §22:76 are already re-pointed; a title that differs by one character fails the title check.
- Tests that stay green: AC-36.2, AC-36.4, AC-14.4 (b), AC-14.5, e2e 16, 22, 30, 38 (each finds the button while an
  open todo exists). e2e 22 AC-22.6 and e2e 30 AC-30.6 click the button, and later steps assert counts and filter
  links, not the button.
- Timing: after a successful mark-all, the button is removed only when the refreshed RSC arrives (REQ-43.2). In
  Playwright assert with auto-retrying `toHaveCount(0)`, never an immediate count.
- Browser dependence: `document.activeElement` is `BODY` after removal in Chromium (analysis question 6); the e2e
  AC-43.5 check is configured for Chromium only.
- Do not add a `useEffect`, ref or `autoFocus` anywhere: AC-43.4 pins 0 `focus()` calls and 0 `tabindex`.
- `spec/technical-requirements.md:50` shows §43 with status `✗`; it flips with the closing lane, not in this card's
  feat commit.

## Test strategy

| Layer     | File                                                 | ACs                                  | Mocks                                                                                                                                                               |
| --------- | ---------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Component | `src/components/complete-all-button-hidden.test.tsx` | AC-43.1 (a, b), 43.2, 43.3, 43.4     | `vi.mock('@/actions/complete-all')` with `vi.hoisted`; `vi.spyOn(HTMLElement.prototype, 'focus')` for 43.4; deferred promise for 43.2; `rerender` for 43.3 and 43.4 |
| Component | `complete-all-button.test.tsx`, `-count.test.tsx`    | AC-14.4 (a), AC-36.3 (rewrites)      | same actions mock; no new mock                                                                                                                                      |
| e2e       | `e2e/43-complete-all-hidden.spec.ts`                 | AC-43.5, 43.6, 43.7                  | none; real database, hydrated page, navigation counter as in `36-complete-all-count.spec.ts`                                                                        |
| e2e       | `e2e/14-...`, `e2e/36-...`                           | AC-14.6, AC-36.6, AC-36.7 (rewrites) | none                                                                                                                                                                |

Add one component test beyond the ACs only if it carries an AC id; an in-flight failure across a hide (the case that
separates A from B) has no AC, so it is a gap: raise it as `/spec-trace` input, not an unnumbered test.

## Mutation hot spots

- `if (disabled) return null` condition (negation, constant `false`): killed by AC-43.1 (a, b) and AC-43.3.
- `disabled || pending` to `pending`: the mutant `disabled || pending` stays killed by nothing once `disabled` true
  returns null; the `pending` disabled state is killed by AC-43.2 and AC-14.4 (b).
- Dropping the wrapper `div` or the error `p`: killed by AC-14.5 and AC-43.3 (the alert follows the button).
- `count ?? 0` default: AC-36.3 (no count, enabled, name "Mark all complete").
- The error reset on remount (A) or the render-time clear (B): AC-43.3 second re-render, 0 `alert` roles.
- Mutation applies to `src/lib` and `src/actions`; neither changes, so the score is unaffected. [unverified]

## Questions settled / escalated

```
Question:    Which source governs where focus goes when the button unmounts while focused?
Class:       P0 no conflict
Sources:     spec/contracts/41-complete-all-hidden.md "REQ-43.5 ... THE SYSTEM SHALL NOT manage focus"
             backlog/00-decisions.md D-39 "no card changes `src/app/page.tsx`, `src/lib/` or `src/actions/`"
Conflict:    none
Verdict:     §43 REQ-43.5 governs (spec wins on behavior); D-39 forbids the files a focus target would need.
Next action: Implement with no focus(), ref or tabindex.
Must not:    Add an id, ref or autoFocus to move focus to the heading or search box.
Doc drift:   none
Escalate:    none
```

```
Question:    Does the §22 proof row (`20-all-done.md:76`) need a ruling, as analysis.md "Needs a ruling" item 1 asked?
Class:       P0 no conflict
Sources:     backlog/00-decisions.md D-39 "B8.3 also re-points §22's unchanged-behavior row (`20-all-done.md:76`)"
             spec/contracts/20-all-done.md:76 "AC-14.6: C (open), B (done), A (open): the button is enabled, and after the click and after a reload the list reads [C, B, A], all 3 checked, 0 buttons named "Mark all complete""
Conflict:    none (the ruling exists and the edit landed on main)
Verdict:     D-39 (authority 2) settled it; the row quotes the title §43 pins for e2e/14:59.
Next action: Use the §43 title verbatim in e2e/14-complete-all.spec.ts.
Must not:    Reword the title; the title check fails on a one-character difference.
Doc drift:   none
Escalate:    none
```

```
Question:    `count` 0 with `disabled` false: what renders?
Class:       P2 spec silent
Sources:     spec/contracts/41-complete-all-hidden.md "`count` 0 with `disabled` false does not occur from the page."
Conflict:    none
Verdict:     Only `disabled` decides (§43 contract line); the page never produces the pair, so no test and no branch.
Next action: Do not read `count` for visibility.
Must not:    Add `count === 0` to the hide condition.
Doc drift:   none
Escalate:    none
```

```
Question:    Approach A (inner component) or B (render-time state clear)?
Class:       P2 spec silent
Sources:     spec/contracts/41-complete-all-hidden.md "whether the message is cleared by state or by derivation is the implementation's choice, the observable result is AC-43.3"
Conflict:    none
Verdict:     The implementation's choice, inside §43 and ts-style; A recommended for the in-flight case.
Next action: Plan A; the lead approves in plan.md.
Must not:    Use an effect or ref to clear the message.
Doc drift:   none
Escalate:    none
```

## Addendum: AC-43.6 "0 `alert` roles" and the route announcer

```
Question:    Does AC-43.6's "0 `alert` roles" mean the component's failure message, so test-writer narrows e2e/43-complete-all-hidden.spec.ts:118?
Class:       P2 spec silent (the spec does not say which alerts count; read literally it is unsatisfiable)
Sources:     spec/contracts/41-complete-all-hidden.md:65 "after the uncheck 1 button named exactly \"Mark all complete (1)\", enabled, and 0 `alert` roles"
             spec/contracts/41-complete-all-hidden.md:121 "A failed mark-all still shows the §10 alert and recovers"
             node_modules/next/dist/client/components/app-router-announcer.js:26 "announcer.role = 'alert';"
             e2e/19-delete.spec.ts:185 "await expect(rowOf(page, 'B').getByRole('alert')).toHaveCount(0);"
Conflict:    AC-43.6 read page-wide says 0 alerts / Next injects 1 role=alert (next-route-announcer, shadow root, appended on hydration) into every hydrated page, which Playwright's role engine pierces. Verified in the file above. Page-wide, the AC can never pass.
Verdict:     The criterion is about the component's own §10 failure message (REQ-43.4 is the absence of a stale failure after the uncheck; §10 is the only alert the feature owns). A reading that no Next app can satisfy is not the contract, and the spec's own §43 and §36 tests count alerts inside the component. Precedent: e2e/19-delete.spec.ts:185 scopes the query. Authority order puts the spec first, and the spec is not contradicted: no spec change, no D-n. The fix is to the locator only, in test-writer's `test(todos): B8.3 ...` commit (tests are never weakened: the scoped query still fails if the component renders its alert).
Next action: test-writer scopes line 118 to the component's container, never to a locator that could miss the component's alert, and never removes the assertion: the scope must contain the button's parent (for example the element holding the button), or exclude the announcer with `page.locator('body > :not(next-route-announcer)').getByRole('alert')`. Commit as test(todos): B8.3 AC-43.6 scope alert query past the route announcer; it is green at the base like b06a5be, so verify-red.sh evidence is unchanged for the red tests. code-writer then re-runs.
Must not:    Delete the alert assertion, use `.first()` or `toHaveCount(1)`, or edit the e2e in the feat(...) commit.
Doc drift:   none (optional: add one clause to §43 AC-43.6 "alert roles inside the page content, excluding the framework route announcer" via docs(spec) under a D-n; not needed).
Escalate:    none
```
