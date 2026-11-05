# B5.4 analysis

## Completeness

| Check                                | Result | Note                                                                                                             |
| ------------------------------------ | ------ | ---------------------------------------------------------------------------------------------------------------- |
| Intent without solution words        | pass   | tab title, count, background tab; no function or file named                                                      |
| Every behavior has a REQ             | pass   | format, zero, source of N, live update, reload, no other route                                                   |
| One EARS pattern each                | pass   | REQ-26.1/26.2 state-driven, 26.4 event-driven, 26.3/26.5/26.6 ubiquitous                                         |
| ≤ 7 criteria                         | pass   | AC-26.1 to AC-26.7                                                                                               |
| Every Then measurable                | pass   | exact title strings and counts                                                                                   |
| No banned adjective without a number | pass   | none used                                                                                                        |
| Out of scope stated                  | pass   | favicon/badge, filter in title, other routes, overdue, announcements, abbreviation                               |
| Unchanged behavior with proof titles | pass   | titles quoted from grep of `e2e/13-…`, `e2e/05-…`, `e2e/smoke.spec.ts`, `src/lib/todo-count.test.ts`             |
| Dependencies done                    | pass   | D-30 (number, file, mount), D-32 (lift of "a count in the page title" from §13: done in `11-remaining-count.md`) |
| No settled D-n contradicted          | pass   | D-30: `generateMetadata` in `src/app/page.tsx`, no other component; D-32 lift limited to that one phrase         |

Test for the card: `src/lib/page-title.test.ts::AC-26.1 …` (red: `pageTitle` not exported). AC-26.2/26.3 need a unit test of
`generateMetadata` with `@/lib/todos` mocked (`src/app/page.test.ts`, new file); AC-26.4 to 26.7 are
`e2e/24-page-title.spec.ts` (e2e numbering follows the section's file `24-`). The features-map row (F24) is the lead's to add.

## Open questions

1. Two reads per request. Question: `generateMetadata` and the page each call `listTodos()`, so `/` runs two queries
   where §13 said "no second query". Proposed decision: accept two reads, written in the contract's last paragraph
   of Function contracts (REQ-13 is about the count's source inside the page, not the request). Why: the alternative,
   wrapping `listTodos` in React `cache()`, changes `src/lib/todos.ts` and D-30 confines the card to `page.tsx`.
   Otherwise: a `cache()` wrapper means a lib change and a spec edit to §5.
2. Does the title refresh on a Server Action `revalidatePath('/')` without a reload (REQ-26.4)? Proposed decision:
   yes, Next.js re-renders metadata with the refreshed RSC payload; AC-26.5/26.6 prove it in the browser. Why: not
   verifiable by reading code here. Otherwise: a client effect setting `document.title` would be needed, a second
   component that D-30 does not allow, so the card would stop for a ruling.
3. Deletion and complete-all in REQ-26.4: included because §14 and §19 exist and use the same revalidation; only
   create, toggle and clear are exercised by an AC. Proposed decision: keep. Otherwise: drop the two words.
4. Large N: no cap, no separator (`(1000) Todos`); the spec has no limit to borrow. Proposed decision: keep.
5. `pageTitle(remaining)` for a non-integer or negative input returns `Todos` (only `>= 1` formats); `1.5` would
   format as `(1.5) Todos`. Proposed decision: input is always `countRemaining`'s integer; not specified further.

## Needs a ruling

None. D-32 covers the §13 lift (done in `spec/contracts/11-remaining-count.md`, one phrase removed); question 2 becomes
a ruling only if AC-26.5 fails in the browser.
