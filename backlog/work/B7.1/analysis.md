# B7.1 analysis

Section 35, `spec/contracts/33-delete-confirm.md`, written ahead of the issue label (D-37). Edits to §19 and §20 are
exactly the ones D-37 lists.

## Completeness

| Check                                | Result | Note                                                                                                                                |
| ------------------------------------ | ------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| Intent without solution words        | pass   | Intent says "the browser asks once"; the mechanism (`window.confirm`) is in REQ-35.1 and D-37, not the intent beyond that phrase.   |
| Every behavior has a REQ             | pass   | ask (35.1), confirm (35.2), cancel (35.3), only on activation (35.4), no markup (35.5).                                             |
| One EARS pattern each                | pass   | event, event, unwanted, ubiquitous, ubiquitous.                                                                                     |
| At most 7 criteria                   | pass   | 5: AC-35.1 to AC-35.5.                                                                                                              |
| Every Then measurable                | pass   | call counts, exact message, call order, row counts, `[C, A]` / `[C, B, A]`.                                                         |
| No banned adjective without a number | pass   | none used.                                                                                                                          |
| Out of scope                         | pass   | custom modal, titled message, "don't ask again", other buttons, undo.                                                               |
| Unchanged behavior with proof titles | pass   | titles copied from grep of `src/` and `e2e/`; the two titles §20 quotes are fixed in §35 because the red step rewrites those tests. |
| Dependencies done                    | pass   | §19, §20 shipped; D-37 recorded.                                                                                                    |
| No settled D-n contradicted          | pass   | D-37 edits only; REQ-19.3 and REQ-20.7 stated to hold.                                                                              |

D-37 edits made: §19 intent line, REQ-19.1, REQ-19.5, the closing paragraph ("final once confirmed"), AC-19.5 (a)
and (b), AC-19.6, AC-19.7 (Given only), the `DeleteTodoButton` contract, and Out of scope (the line is now "Any
confirmation other than the one of §35"). Ids unchanged. §20: the two proof rows (`18-created-date.md:80,82`) point
at AC-35.3 and AC-35.4 because the AC-19.5 (b) and AC-19.7 titles are rewritten by the red step.

## Open questions

1. **Message text.** D-37 does not give it. Proposed: `Delete this todo? This cannot be undone.` (fixed, does not name
   the todo, so no new prop; "cannot be undone" restates §19). Otherwise: a one-line change in REQ-35.1, AC-35.1,
   AC-35.4, the contract, and the two quoted titles.
2. **Cancel after an earlier failure.** Proposed (REQ-35.3): a cancelled click leaves an earlier failure message in
   place. Alternative: clear it. Chosen because a cancel is not an attempt and §19 REQ-19.11 clears only on success.
3. **Titles of AC-35.3 and AC-35.4** are fixed verbatim in §35 (quoted by §20). The test-writer must use them.
   AC-35.1, 35.2, 35.5 titles are free.
4. **Where AC-19.6's confirm stub lives.** §19 AC-19.6 and AC-19.7 now say `window.confirm` is stubbed or accepted;
   AC-19.5/19.6 stay in `delete-todo-button.test.tsx`, AC-19.7 in `e2e/19-delete.spec.ts`. The red step edits those
   (D-37 lists lines 58, 70-71, 189-198, e2e:64); that is a change of existing tests, allowed only because §19's
   criteria changed first.
5. **The jsdom claim.** §35 says an unstubbed `window.confirm` in jsdom returns a falsy value ("not implemented").
   Not run here [unverified]; the rule ("always stub") holds either way.

## Needs a ruling

None. Not conflicting with D-37: `src/components/todo-item.test.tsx` and other existing tests that click "Delete
todo" (D-37 names only the three test files above) must stub the dialog; the red step greps for any other click.
