# B6.5 decision request — §23's "no role" clause vs the card's `role="status"` (D-34, proposed)

Raised by `spec-analyst` (`NEEDS RULING`, `work/B6.5/analysis.md` "Needs a ruling") in the headless run for issue #276.

## Conflict

- Card B6.5 (`plan/E6-todos-cues.md`): the overdue count sits in a polite live region (`role="status"`).
- §23 REQ-23.7 (`spec/contracts/21-overdue-count.md:23`): the count element "has no role and no `aria-label`".
- §23 AC-23.3 (`spec/contracts/21-overdue-count.md:35`): "with no `role` and no `aria-label` attribute"; its test in
  `src/components/overdue-count.test.tsx` asserts it.
- D-33 lets B6.5 lift only the Out of scope line "announcing changes to assistive technology" from §23. It does not
  cover rewriting REQ-23.7, AC-23.3 or an existing test's assertion.

## Options

- **A (recommended):** extend D-33 for B6.5: a `docs(spec): §23` commit drops "no role" from REQ-23.7 and from
  AC-23.3's Then (keeping the tag, `aria-label`, 0 paragraph/listitem/button/link/alert roles and text-content
  checks), and the card's red commit removes only the `role` assertion from the AC-23.3 test. Cost: one existing
  test loses one assertion; AC-33.1 asserts the role instead. No other section changes.
- **B:** keep §23 as written: B6.5 cannot be done; close it as won't-do.

B6.6 (§13 "exactly one paragraph"/no live region) may need the same ruling; worth deciding both at once.

Reply `D-34: A` or `D-34: B`.
