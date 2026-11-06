# B5.5 analysis

## Completeness

| Check                                | Result | Note                                                                                                                              |
| ------------------------------------ | ------ | --------------------------------------------------------------------------------------------------------------------------------- |
| Intent without solution words        | pass   | empty box, full list of the chosen view, one key; no function or file named                                                       |
| Every behavior has a REQ             | pass   | empty box, navigation when a search is in effect, no navigation otherwise, nothing stored, other keys, only in the box            |
| One EARS pattern each                | pass   | REQ-27.1 to 27.3 event-driven, 27.4 and 27.6 ubiquitous, 27.5 unwanted behavior                                                   |
| ≤ 7 criteria                         | pass   | AC-27.1 to AC-27.6                                                                                                                |
| Every Then measurable                | pass   | exact values, click counts, addresses, `defaultPrevented`                                                                         |
| No banned adjective without a number | pass   | none used                                                                                                                         |
| Out of scope stated                  | pass   | other keys, Escape elsewhere, hint, filter clearing, IME, focus restore                                                           |
| Unchanged behavior with proof titles | pass   | titles quoted from grep of `todo-search-form.test.tsx`, `e2e/21-…`, `e2e/16-…`                                                    |
| Dependencies done                    | pass   | D-30 (number, file, component), D-32 (lifts done: §16 `14-search.md` and §21 `19-clear-search.md` Out of scope lines); §25 merged |
| No settled D-n contradicted          | pass   | only `todo-search-form.tsx` changes (D-30); the two lifts are exactly those D-32 names. See question 1                            |

Test for the card: `src/lib/escape-search.test.ts::AC-27.1 …` (red: `isSearchEscape` not exported). AC-27.2 to 27.5 extend
`src/components/todo-search-form.test.tsx`; AC-27.6 is `e2e/25-escape-search.spec.ts` (e2e numbering follows the contract
file `25-`). The features-map row (F25) is the lead's to add.

## Open questions

1. Link activation vs §21's "client-side navigation by script" (Out of scope). Question: Escape clicks the link through
   a ref; is that "navigation by script"? Proposed decision: no, the click runs the link's own navigation, so the address
   has one source (`clearSearchHref`) and no `next/navigation` hook is added (a hook would break the existing component
   tests, which render without an app router). Why: D-32 lifts only the shortcut phrase. Otherwise: `router.push` needs a
   mock added to the existing test file and a second reading of that Out of scope line.
2. Escape with no search in effect but text typed. Proposed decision: empty the box only (REQ-27.3), no navigation. Why:
   there is no address to leave; the spec of §21 hides the link there. Otherwise: always navigate to `clearSearchHref`.
3. Shift counts as a blocking modifier here (unlike §25's `/`). Proposed decision: yes, Escape alone only. Otherwise: drop
   `shiftKey` from `EscapeEvent`.
4. The browser's native Escape clearing of `type="search"` is cancelled (`preventDefault`) so one behavior applies
   everywhere. Proposed decision: keep. Otherwise: leave the native clear and only add the navigation.
5. AC-27.4 includes a typed `a`; jsdom `user-event` would change the value. Proposed decision: the test presses keys with
   `fireEvent.keyDown` (no character typed) so the value stays `milk`. Otherwise: assert on `defaultPrevented` only.
6. Focus after the page changes (the box remounts by key, §16) is not specified. Proposed decision: out of scope.

## Needs a ruling

none
