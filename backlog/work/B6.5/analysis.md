# B6.5 analysis

## Completeness

| Check                                | Result | Note                                                                                                                                                                     |
| ------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Intent without solution words        | pass   | says "hears the number change", no role or attribute named                                                                                                               |
| Every behavior has a REQ             | pass   | REQ-33.1 to 33.6: role, empty at 0, text unchanged, in-place change, SSR parity, no timer                                                                                |
| One EARS pattern each                | pass   | ubiquitous x3, state-driven, event-driven, unwanted behavior                                                                                                             |
| At most 7 criteria                   | pass   | 5 (4 component, 1 e2e)                                                                                                                                                   |
| Every Then measurable                | pass   | roles, exact strings, node identity (`toBe`), child-node count 0, timer count 0                                                                                          |
| No banned adjective without a number | pass   | none                                                                                                                                                                     |
| Out of scope                         | pass   | §13/§22 announcement left to B6.6, assertive region, aria-live/atomic attributes                                                                                         |
| Unchanged behavior with proof titles | pass   | titles quoted from grep: AC-23.4, AC-23.6, AC-23.7 (e2e/23-overdue-count.spec.ts), AC-22.3                                                                               |
| Dependencies done                    | pass   | D-33 chosen                                                                                                                                                              |
| No settled D-n contradicted          | pass   | D-33 and D-34 cover the Out of scope line and REQ-23.7 / AC-23.3 "no role"; §23's function contract line stays, §33's "except" governs (advisor, P4), see Needs a ruling |

Done: §33 written, indexed with status ✗, §23's Out of scope line lifted (D-33), "no role" dropped from §23 REQ-23.7 and AC-23.3 (D-34), card `Spec:`/`Test:` set.

## Open questions

1. Element tag. Proposed: keep `<span>` (REQ-23.7 only bars P, LI, BUTTON, A). Otherwise a `<div>` changes §23's contract text.
2. Empty region on the server. Proposed: render `<span role="status"></span>` always (REQ-33.2, REQ-33.5), since a live region inserted together with its text is often not announced. §23 REQ-23.5 says "no overdue count in it", which still holds; the contract's "renders nothing while today is undefined" changes.
3. No `aria-live`/`aria-atomic` attributes (REQ-33.1): `role="status"` implies polite and atomic. Proposed: none, so a test cannot pass by adding a second mechanism. Otherwise the card's "polite live region" would need `aria-live="polite"` explicit.
4. B6.6 will add another `role="status"` on the same page. Proposed: AC-33.5 finds ours as the status element after the `N items left` paragraph, never "exactly one status on the page". Otherwise B6.5's e2e breaks when B6.6 lands.
5. e2e file `e2e/33-overdue-announce.spec.ts` (one file per section, as `23-overdue-count.spec.ts`). Proposed. Otherwise extend e2e/23.
6. Test-file collision: AC-23.3 in `src/components/overdue-count.test.tsx` and AC-23.7 do not conflict except AC-23.3's "no role" assertion (D-34: the card's red commit drops only the `role` assertion from the AC-23.3 test).

## Needs a ruling

Resolved: D-34 (A) rules on §23 REQ-23.7 and AC-23.3. Both now omit "no role"; the tag, no `aria-label`, the 0-roles and the text-content clauses stay. §33's AC asserts `role="status"`.

Resolved by `advisor` (P4, no ruling needed; dev-lead run for issue #276): option B. §33 is the later section and
names the override itself (its "except" and the sentence after REQ-33.6); D-34's "No other section changes" bars
editing §23's contract line; AC-23.4 and AC-23.5 hold with an empty span. §23 line 55 stays as it is.

Was open, one item (open question 2): §23's function contract for `OverdueCount` says it "renders nothing while today is undefined or overdueLabel(...) is undefined". REQ-33.2 and AC-33.2/33.3 require an empty `<span role="status">` in those states. D-33 lifts only an Out of scope line and D-34 only the "no role" clause, so neither covers this sentence; I did not edit it. §33's function contract says "as §23, except …", so the card is plannable, but §23 and §33 disagree in text.

- A (proposed): `docs(spec): §23` also rewrites that clause to "renders one empty `<span>` while today is undefined or the label is undefined (§33)"; no AC of §23 changes (AC-23.4 and AC-23.5 hold with an empty span). Extend D-34 or add a D-n.
- B: leave §23's sentence and rely on §33's "except"; the two sections stay in tension for `spec-trace`.
- Cost of A: one clause of one contract line; no test title changes.
