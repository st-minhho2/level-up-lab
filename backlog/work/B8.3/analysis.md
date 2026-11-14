# B8.3 analysis

Section §43, `spec/contracts/41-complete-all-hidden.md`; edits to §14 (`12-complete-all.md`) and §36
(`34-complete-all-count.md`) as D-39 lists.

## Completeness

| Check                                | Result | Note                                                                                                                                                                            |
| ------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Intent without solution words        | pass   | says what a person is and is not offered; no component, prop or element named                                                                                                   |
| Every behavior has a REQ             | pass   | nothing at 0 open (43.1), pending (43.2), removal without reload (43.3), return without the old message (43.4), focus (43.5), rest of the page (43.6), filter and search (43.7) |
| One EARS pattern each                | pass   | state-driven x3, event-driven x3, unwanted x1                                                                                                                                   |
| At most 7 criteria                   | pass   | 7 (AC-43.1 to AC-43.7)                                                                                                                                                          |
| Every Then measurable                | pass   | child-node counts, role counts, exact names, `document.activeElement`, focus spy count, navigations                                                                             |
| No banned adjective without a number | pass   | none used                                                                                                                                                                       |
| Out of scope                         | pass   | focus to another control, placeholder text, animation, announcement, prop removal                                                                                               |
| Unchanged behavior with proof titles | pass   | 9 titles quoted from grep; §36's rows re-pointed (71 to AC-14.4 (b), 74 and 75 to the new titles pinned in §43)                                                                 |
| Dependencies done                    | pass   | D-39 on this branch; §14, §36, §22, §9 exist on main                                                                                                                            |
| No settled D-n contradicted          | pass   | edits only the lines D-39 names; no id changed; `page.tsx`, `src/lib`, `src/actions` untouched; §6, §12, §24, §30 not edited                                                    |

Design: the component returns `null` when its existing `disabled` prop is `true`. `page.tsx` already passes
`disabled={!todos.some(...)}`, so D-39's "no card changes `page.tsx`" holds and the signature is unchanged.

Red tests (card): new `src/components/complete-all-button-hidden.test.tsx` (AC-43.1 to AC-43.4) and
`e2e/43-complete-all-hidden.spec.ts` (AC-43.5 to AC-43.7); six rewrites with pinned titles in §43. All fail on an
assertion (the component today renders a disabled button), never on an import: the component and its props exist.

## Open questions

1. Focus after removal. Proposed: not managed; the browser moves it to `body` (REQ-43.5). Why: the only option that
   changes no file outside `complete-all-button.tsx`. Otherwise: a target needs an `id` or `ref` in `page.tsx` or a
   sibling card's component (see Needs a ruling).
2. `count` 0 with `disabled` false. Proposed: unspecified, as §36 question 1 left the inconsistent pair; `disabled`
   alone decides. Why: the page never produces it. Otherwise: a REQ tying the two props.
3. The failure message when the button is hidden and shown again. Proposed: REQ-43.4 and AC-43.3 say it does not come
   back (the component keeps its state while it returns `null`, so a naive implementation would bring it back).
   Otherwise: drop REQ-43.4's second clause and AC-43.3's last step.
4. "Enabled state" wording in §16 REQ-16.9, §21 REQ-21.6 and §38 REQ-38.6 ("the enabled state of ... Mark all
   complete") and the E7 hint "enable both buttons" in AC-16.7. Proposed: leave; with a button that is shown only when
   enabled they still hold, and AC-16.7's open todo keeps it shown. Otherwise: three more edits D-39 does not list.
5. §36 unchanged row 74 ("With nothing stored the button is plain and disabled") described behavior this card
   changes. Proposed: re-pointed as D-39 says, now "With nothing stored no button is shown (§43)", proof the new e2e
   title. Otherwise: delete the row.
6. e2e assertions of `document.activeElement` after a disabled focused button is removed depend on the browser
   (Chromium is the configured project). Proposed: keep AC-43.5's `BODY` check. Otherwise: assert only 0 buttons.

## Needs a ruling

1. **`spec/contracts/20-all-done.md:76` (§22) is not in D-39's list and goes stale.** Its unchanged-behavior row quotes
   the title of `e2e/14-complete-all.spec.ts:59`, which the red step rewrites (it ends "the button disabled" today, and
   "0 buttons named "Mark all complete"" after). A title mismatch fails the title check. Asked: add that one proof to the
   lines the card may change (re-point to the new title in §43), as D-39 did for §36's rows. I did not edit §22.
2. **Managed focus, only if the lead wants it.** Any option that moves focus (to the heading, the search box or the
   first filter link) needs an `id` or `ref` outside `complete-all-button.tsx`: `src/app/page.tsx` (D-39 forbids it)
   or `todo-search-form.tsx` / `todo-filter-nav.tsx` (B8.2 owns the latter). The default in §43 needs no ruling.
