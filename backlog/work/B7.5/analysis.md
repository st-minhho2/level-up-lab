# B7.5 analysis

Section §39, `spec/contracts/37-title-counter-warning.md`: 8 REQ, 7 AC. Edits (D-37): §18 Out of scope lifts only "a
warning colour, a threshold"; §29 REQ-29.7 and its contract line state they do not apply to §39.

## Completeness

| Check                                | Result | Note                                                                                                                                                            |
| ------------------------------------ | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Intent without solution words        | pass   | Says what the person sees and what is not announced; no id, class or file in the Intent.                                                                        |
| Every behavior has a REQ             | pass   | Show (39.1), absent (39.2), element and style (39.3), update moments (39.4), counter unchanged (39.5), not live (39.6), threshold (39.7), box unchanged (39.8). |
| One EARS pattern each                | pass   | State-driven 39.1; Unwanted 39.2; Event-driven 39.4; Ubiquitous the rest.                                                                                       |
| At most 7 criteria                   | pass   | 7 (AC-39.1 to AC-39.7).                                                                                                                                         |
| Every Then measurable                | pass   | Counts of elements, exact text, exact class, exact `aria-describedby`, document order.                                                                          |
| No banned adjective without a number | pass   | "short" is pinned as the exact text; "near" is 180 (`TITLE_WARNING_THRESHOLD`).                                                                                 |
| Out of scope                         | pass   | Live region, announced text, countdown, second threshold, `aria-describedby` listing, blocking, other boxes, locale.                                            |
| Unchanged behavior with proof titles | pass   | 6 rows, titles copied from the test files (AC-18.1, AC-18.3, AC-18.5, AC-29.1, AC-5.7 unit; AC-18.7 e2e).                                                       |
| Dependencies done                    | pass   | D-37 settled; §18 and §29 on main; `title-count.ts` and `todo-form.tsx` exist.                                                                                  |
| No settled D-n contradicted          | pass   | D-37 text followed line for line; threshold 180 and ids from the card.                                                                                          |

Existing tests that run at 180 or more and stay green because the warning has no role, no counter text and is not in
`aria-describedby`: `todo-form.test.tsx` AC-18.4 (b) (201 characters, 1 `title` alert), `e2e/18-title-counter.spec.ts`
AC-18.7 (195 and 200 characters, regex `/^\d+ \/ 200$/` exactly 1 match, `aria-describedby` `new-todo-count`). The text
`Almost at the character limit` matches no `^\d+ / 200$`.

Red step: the skeleton adds `TITLE_WARNING_THRESHOLD` and a stub `isTitleNearLimit` that throws `NotImplementedError`,
so AC-39.1 fails on the stub, not on an import.

## Open questions

1. **Warning text.** Card says "a short warning text" without wording. Proposed: `Almost at the character limit`
   (no number, so it never matches `^\d+ / 200$` and does not repeat 200). Why: pinned so tests copy it. Otherwise: only
   the string in REQ-39.1, AC-39.2, AC-39.7 and the component changes.
2. **Warning style.** Proposed `text-sm text-amber-700 dark:text-amber-400` (amber, distinct from the zinc counter and
   the red error). Why: the card says "a warning style", the repo styles with Tailwind classes. Otherwise: only REQ-39.3,
   AC-39.2 and the contract change. Tailwind class contrast is not checked here [unverified].
3. **Placement relative to the error.** Proposed: directly after the counter, before the §5 error. Why: keeps the
   counter and its warning together; the error stays last as today. Otherwise: REQ-39.3 and AC-39.2's order clause.
4. **Absent, not hidden** (decided in REQ-39.2): chosen so a `getByText` or `queryBy*` count of 0 holds below 180 and
   no hidden node is read by a screen reader in browse mode.
5. **Warning not in `aria-describedby`** (REQ-39.5, 39.6): follows the card ("`aria-describedby` unchanged", "not
   announced"). A reader in browse mode still reaches it; accepted, stated in Out of scope.

## Needs a ruling

None. D-37 names the two edits; no other line of §18, §29 or another section conflicts: REQ-18.1, REQ-18.8, REQ-18.9,
AC-18.3 (a) ("exactly 1 element whose text matches", 0 alert, status, aria-live) and AC-18.7 hold as written because the
warning is below 180 absent and above it has no role and no counter text.
