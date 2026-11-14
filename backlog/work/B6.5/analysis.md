# B6.5 analysis

## Completeness

| Check                                | Result  | Note                                                                                           |
| ------------------------------------ | ------- | ---------------------------------------------------------------------------------------------- |
| Intent without solution words        | pass    | says "hears the number change", no role or attribute named                                     |
| Every behavior has a REQ             | pass    | REQ-33.1 to 33.6: role, empty at 0, text unchanged, in-place change, SSR parity, no timer      |
| One EARS pattern each                | pass    | ubiquitous x3, state-driven, event-driven, unwanted behavior                                   |
| At most 7 criteria                   | pass    | 5 (4 component, 1 e2e)                                                                         |
| Every Then measurable                | pass    | roles, exact strings, node identity (`toBe`), child-node count 0, timer count 0                |
| No banned adjective without a number | pass    | none                                                                                           |
| Out of scope                         | pass    | §13/§22 announcement left to B6.6, assertive region, aria-live/atomic attributes               |
| Unchanged behavior with proof titles | pass    | titles quoted from grep: AC-23.4, AC-23.6, AC-23.7 (e2e/23-overdue-count.spec.ts), AC-22.3     |
| Dependencies done                    | pass    | D-33 chosen                                                                                    |
| No settled D-n contradicted          | partial | D-33 lifts the Out of scope line only; REQ-23.7 / AC-23.3 conflict with it, see Needs a ruling |

Done: §33 written, indexed with status ✗, §23's Out of scope line lifted (D-33 lets the card do it), card `Spec:`/`Test:` set.

## Open questions

1. Element tag. Proposed: keep `<span>` (REQ-23.7 only bars P, LI, BUTTON, A). Otherwise a `<div>` changes §23's contract text.
2. Empty region on the server. Proposed: render `<span role="status"></span>` always (REQ-33.2, REQ-33.5), since a live region inserted together with its text is often not announced. §23 REQ-23.5 says "no overdue count in it", which still holds; the contract's "renders nothing while today is undefined" changes.
3. No `aria-live`/`aria-atomic` attributes (REQ-33.1): `role="status"` implies polite and atomic. Proposed: none, so a test cannot pass by adding a second mechanism. Otherwise the card's "polite live region" would need `aria-live="polite"` explicit.
4. B6.6 will add another `role="status"` on the same page. Proposed: AC-33.5 finds ours as the status element after the `N items left` paragraph, never "exactly one status on the page". Otherwise B6.5's e2e breaks when B6.6 lands.
5. e2e file `e2e/33-overdue-announce.spec.ts` (one file per section, as `23-overdue-count.spec.ts`). Proposed. Otherwise extend e2e/23.
6. Test-file collision: AC-23.3 in `src/components/overdue-count.test.tsx` and AC-23.7 do not conflict except AC-23.3's "no role" assertion (see ruling).

## Needs a ruling

Decision request for the human: §23 REQ-23.7 says the count element "has no role and no `aria-label`", and AC-23.3 asserts "no `role` attribute". The card requires `role="status"`. D-33 authorises lifting the Out of scope line, not changing REQ-23.7 or AC-23.3.

- A (proposed): §33 states that REQ-33.1 overrides only the "no role" clause; `spec-analyst` edits REQ-23.7's wording and AC-23.3 in a `docs(spec): §23` commit, and the AC-23.3 test (`src/components/overdue-count.test.tsx`) is changed in the card's red commit to drop the `role` assertion (keeping tag, aria-label, 0-roles and text-content assertions). The test change is the rewrite of an existing test, so the human approves it.
- B: leave §23 as is and implement no role: the card cannot be done.
- Cost of A: one existing test title keeps its id (AC-23.3) but loses one assertion; no other section changes. I have not edited REQ-23.7 or AC-23.3.
