# B6.6 advice: the remaining count is announced (§34)

Sources read: `spec/contracts/32-remaining-announce.md`, `work/B6.6/analysis.md`, `src/components/remaining-count.tsx` and
its test, `src/app/page.tsx`, `src/components/CLAUDE.md`, `backlog/plan/E6-todos-cues.md` (B6.6). No schema, action,
lib or page change is needed; the section's Function contracts block says so (line 44-45).

## Approaches

### A (recommended): bare `<div role="status">` wrapper, no class

- Change: `src/components/remaining-count.tsx` renders `<div role="status">` around the existing `<p>` and the
  existing `<span>` (when `allDoneMessage(count)` is defined). Still a Server Component, props unchanged, no new export.
- Pros: exactly the contract (line 41); smallest diff; one file; the element is always present (REQ-34.2); React keeps
  the same DOM node across client navigations/refresh renders (REQ-34.3); no `aria-live` attribute (REQ-34.4).
- Cons: the page's `flex flex-col gap-6` main sees one child instead of two, so the 1.5rem gap between "N items left"
  and "All done" disappears (`<p>` block, `<span>` inline, so "All done" sits on the next line with no gap). A visible
  layout change, though no visible text changes (REQ-34.5 is about text and behavior).
- Fits rules: yes. `spec-fidelity.md` (props and signature exact), invariants 1 and 3 (no mutation added).

### B (alternative): wrapper with a class that restores the gap

- Change: as A plus `className="flex flex-col gap-6"` (or `contents`).
- Pros: pixel-identical layout.
- Cons: §34 states no style, so the contract would have to name the class: a `docs(spec)` change inside a new D-n (§8),
  which the lead has not given; `display: contents` on a live region is unreliable in some browsers, and the flex
  class is untested by any AC (a mutation survivor). Adds a spec edit for a cosmetic gap.
- Fits rules: only after a D-n; not recommended.

## Recommendation

A. It is what the approved contract says. If the lead dislikes the lost gap, that is a follow-up card with its own
D-n and spec edit, not part of B6.6.

## Impact

| File                                      | Add/Change | Signature                                                                                 | ACs                        |
| ----------------------------------------- | ---------- | ----------------------------------------------------------------------------------------- | -------------------------- |
| `src/components/remaining-count.tsx`      | Change     | `RemainingCount({ count }: { readonly count: number }): ReactNode` (unchanged)            | AC-34.1-34.3, AC-34.4-34.6 |
| `src/components/remaining-count.test.tsx` | Change     | adds `describe('<RemainingCount> (§34)')` with AC-34.1, AC-34.2, AC-34.3 (test commit)    | AC-34.1-34.3               |
| `e2e/34-remaining-announce.spec.ts`       | Add        | Playwright, AC-34.4, AC-34.5, AC-34.6 (test commit)                                       | AC-34.4-34.6               |
| `spec/features-map.md`                    | Change     | F32 row flipped in the `docs(map)` commit after `feat`                                    | n/a                        |
| `src/components/CLAUDE.md`                | Change     | one sentence: `remaining-count.tsx` wraps both in `role="status"` (§34); with `docs(map)` | n/a                        |

Skeleton: none needed. No new function or export exists, so there is no `NotImplementedError` to stub; the unit
test goes red on the missing `status` role (an assertion, not an import), matching the card's Test line.
Medium tier (D-28): no `prisma/`, dependency, env, CI, hook or `.claude/` file. (`src/components/CLAUDE.md` is not under `.claude/`.)

Client component changes: none. `remaining-count.tsx` stays a Server Component; no JS-off or pre-hydration submit
exists, since the component has no form or control. Server-rendered markup, today versus after:

- Approach A, JS off / before hydration: today `<p>0 items left</p><span>All done</span>`; after
  `<div role="status"><p>0 items left</p><span>All done</span></div>`. Present in the HTML already, so the region
  exists before any change (REQ-34.2). Dropped behavior: the flex gap between the two (listed as a con above).
- Approach B: same markup plus a class; drops nothing visually, adds a spec edit.

## Risks

- Migration: none. Dependencies: none. Security: none (no input, no mutation). Performance: none.
- Isolation: no state or ports touched; e2e creates and removes its own todos like `22-all-done.spec.ts`.
- Layout: lost gap (above). The lead should know before approving the plan.
- Existing tests that could turn red: the `AC-13.2`, `AC-22.2`, `AC-22.3` unit tests assert paragraphs, "All done"
  not a `P`, and no `alert`; all still true under the wrapper. No e2e file uses `getByRole('status')` today
  (grep of `src` and `e2e`), so none is ambiguous now. `13-remaining-count.spec.ts` and `22-all-done.spec.ts` use text
  locators; the wrapper adds text-less structure, so they stay green [unverified, to confirm at the green gate].
- Merge-order risk with B6.5: it adds another `role="status"` on `/`. E2E tests here must scope to the status whose
  text contains "item(s) left" (see Question 3); B6.5's tests must scope the same way. `getByRole('status')` alone
  breaks whichever merges second. `features-map.md` and the index row appends are table-merge-safe (B1.x merge driver).
- E2E "same node" (AC-34.5): the test marks the node with a data attribute via `evaluate`. The `status` is re-rendered
  by `router.refresh`-style revalidation; React reuses the node only while the element type and position in the page
  stay constant. A is stable because the `div` is always the same child of `main`; B6.2/B6.4 inserting siblings before
  it does not move it relative to its own key-less sibling order, but conditional siblings inserted _before_ it would
  still be reconciled by position, so keep it unconditional.

## Test strategy

| Layer     | File                                      | ACs                                           | Mocks                                                                                         |
| --------- | ----------------------------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------- |
| component | `src/components/remaining-count.test.tsx` | AC-34.1, AC-34.2                              | none (synchronous Server Component renders directly)                                          |
| component | `src/components/remaining-count.test.tsx` | AC-34.3 (`rerender`, `toBe` on the held node) | none                                                                                          |
| e2e       | `e2e/34-remaining-announce.spec.ts`       | AC-34.4, AC-34.5, AC-34.6                     | none; real DB via the compose PostgreSQL, seeded through the UI/actions as the other specs do |

Details: AC-34.1 asserts exactly 1 `status`, the paragraph "0 items left" and one "All done" inside it
(`within(status)`), 0 `alert`, 0 `[aria-live="assertive"]`. AC-34.2 loops 1, 2, 11 with `unmount` between renders
(same pattern as the existing AC-22.3 test) and asserts values with `toEqual`. AC-34.3 uses `const { rerender }`, holds
`screen.getByRole('status')`, rerenders 0 then 2, asserts `toBe(held)` and exact text after each. E2E locators are
`page.getByRole('status').filter({ hasText: /items? left/ })`. AC-34.5 marks the node with `evaluate` setting
`data-live-probe`, checks and unchecks C, and counts navigations with a `framenavigated` listener. Test titles start
`AC-34.n:`. Commit order: `chore` skeleton is skipped (no stub); `test(ui): B6.6 … (red)` proven by
`scripts/verify-red.sh B6.6`, then `feat(ui): B6.6 …` touching no test file, then `docs(map): F32 … [B6.6]`.
Note: AC-34.4-34.6 e2e are green against the old markup only if they fail on the `status` role; as written they do
(0 matches), so red is on an assertion.

## Mutation hot spots

`pnpm test:mutation` covers `src/lib` + `src/actions`; this card changes neither, so the ≥ 70 % gate is unaffected
[unverified]. In the component, the mutants a reviewer should try by hand:

- `role="status"` changed to another role or dropped: killed by AC-34.1/34.2.
- `message === undefined` branch inverted: killed by AC-34.1 (count 0) and AC-34.2 (counts 1, 2, 11).
- The `<span>` moved outside the wrapper: killed by `within(status)` in AC-34.1.
- Wrapper made conditional on count: killed by AC-34.2 (non-zero counts) and AC-34.1.
- A `key` or conditional that remounts the wrapper: killed by AC-34.3 `toBe`.
- Adding `aria-live="assertive"` or `role="alert"`: killed by AC-34.1.

## Questions settled / escalated

Question: Open question 1: is "live announcement" lifted from §22's Out of scope?
Class: P4 two sections collide (resolved)
Sources: spec/contracts/32-remaining-announce.md:21 "THE SYSTEM SHALL change no visible text and no other behavior of §13 and §22"
Conflict: §22 Out of scope listed the announcement / §34 REQ-34.1 puts §22's message in the region
Verdict: D-35 A governs (authority 2); lift commit 19aa647 landed. Nothing further.
Next action: none
Must not: re-edit §22 or §13
Doc drift: none
Escalate: none

Question: Open question 2: wrapper loses the `gap-6` between the count and "All done"; accept?
Class: P2 spec silent (on style); §34 line 23 says no text is added and line 41 names a bare `<div role="status">`
Sources: spec/contracts/32-remaining-announce.md:41 "renders one <div role=\"status\"> that contains the §13 <p> whose text is remainingLabel(count)"
Conflict: none (no style stated; the layout change is a consequence, not a contradiction)
Verdict: Accept, no class (approach A), as the analysis proposes. The contract gives the element no class and a class would be an untested, unspecified addition (invariant 1). `display: contents` on a live region is unreliable. If the lead wants the gap kept, that is a new D-n plus a `docs(spec)` edit first.
Next action: state the lost gap in plan.md under the plan's risks so the lead approves it knowingly
Must not: add `className` or `contents` to the wrapper "to keep the look"
Doc drift: none
Escalate: none

Question: Open question 3: B6.5 adds a second `role="status"` on `/`; keep scoping to the count's status?
Class: P0 no conflict
Sources: spec/contracts/32-remaining-announce.md:33 "the other `status` elements of the page, if any, are not counted"
Conflict: none
Verdict: Keep the scoping: AC-34.4 and AC-34.5 text already scope by "items left"/"item left". Use `getByRole('status').filter({ hasText: /items? left/ })` in e2e; never bare `getByRole('status')`. The contract is already written to tolerate this.
Next action: write the e2e locators that way in the test commit
Must not: assert `toHaveCount(1)` on all `status` elements of the page
Doc drift: none
Escalate: none

Question: Open question 4: card Test line is a unit test red on the missing `status` role, no skeleton; accept?
Class: P0 no conflict
Sources: .claude/rules/testing.md:21 "fail on an assertion or the skeleton's `NotImplementedError`, never on an import"
Conflict: none
Verdict: Accept. No new function or export exists, so there is no skeleton; red on the missing role is an assertion failure, which the rule allows. Skip the `chore(...) skeleton` commit and say so in the test commit body ("Red because ...").
Next action: write the unit tests, run `scripts/verify-red.sh B6.6`
Must not: add a stub export just to have a skeleton commit
Doc drift: none
Escalate: none
