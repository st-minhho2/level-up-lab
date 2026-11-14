# B6.6 analysis

## Completeness

| Check                                | Result | Note                                                                                                                       |
| ------------------------------------ | ------ | -------------------------------------------------------------------------------------------------------------------------- |
| Intent without solution words        | pass   | says what a screen-reader user hears; no role or tag named                                                                 |
| Every behavior has a REQ             | pass   | region (34.1), present at 0 (34.2), same node (34.3), polite (34.4), nothing visible changes (34.5)                        |
| One EARS pattern each                | pass   | four ubiquitous, one state-driven                                                                                          |
| At most 7 criteria                   | pass   | 6 (AC-34.1-34.3 component, AC-34.4-34.6 e2e)                                                                               |
| Every Then measurable                | pass   | counts of `status` roles, node identity (`toBe`), exact texts                                                              |
| No banned adjective without a number | pass   | "polite" is defined as no assertive live region and no alert (REQ-34.4)                                                    |
| Out of scope                         | pass   | assertive, SR-only text, §23, §30, §18, §10                                                                                |
| Unchanged behavior with proof titles | pass   | 7 titles quoted from grep of the test files                                                                                |
| Dependencies done                    | pass   | D-33 only                                                                                                                  |
| No settled D-n contradicted          | pass   | D-33 lifts §13's line; REQ-22.4 ("not an alert") and REQ-18.8 stay true; `page.tsx` untouched (D-33 gives it to B6.2/B6.4) |

## Open questions

1. **Settled by D-35 A.** §22's Out of scope listed "live announcement to assistive technology (`role="status"`, `aria-live`, as in §13)"
   (`spec/contracts/20-all-done.md:60`), and D-33 lifts only §13's line. This card puts §22's message in the region.
   Proposed: the `docs(spec)` commit also deletes that phrase from §22's Out of scope, and nothing else of §22.
   Why: otherwise two sections contradict. Otherwise: §34 and §22 disagree and a reviewer must pick a side.
2. One wrapper `<div role="status">` replaces a fragment, so the page's flex column (`gap-6`) sees one child where it saw
   two (`<p>`, `<span>`): the gap between "N items left" and "All done" disappears. Proposed: accept it, and give the
   wrapper no class (§34 states no style). Why: `display: contents` on a live region is unreliable across browsers.
   Otherwise: the lead names a class for the wrapper and the contract adds it.
3. B6.5 adds a second `role="status"` on `/` in the same batch, present at 0. AC-34.4-34.6 therefore count only the
   `status` whose text contains "items left"/"item left"; `getByRole('status')` alone is ambiguous. Proposed: keep the
   scoping. Otherwise: e2e tests of both cards break on whichever merges second.
4. The card's Test line is a unit test red on the missing `status` role (an assertion), because no new function or export
   exists in this section. Proposed: accept.

## Needs a ruling

None. Settled by D-35 A: the phrase is lifted from §22's Out of scope, nothing else of §22 changes.
