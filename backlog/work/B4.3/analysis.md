# B4.3 analysis

Section: §22 Todos: say "all done", `spec/contracts/20-all-done.md` (new, D-24). 7 REQ, 7 AC. Builds on §13.

## Completeness

| Check                                | Result | Note                                                                                                                                                                                                       |
| ------------------------------------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Intent without solution words        | pass   | one person-level paragraph; no module, function or element named                                                                                                                                           |
| Every behavior has a REQ             | pass   | shown at count 0, absent otherwise, accompanies the §13 text, plain text, empty list, live update and reload, filter and search                                                                            |
| One EARS pattern each                | pass   | state-driven 22.1, 22.2, 22.5; ubiquitous 22.3, 22.4; event-driven 22.6; unwanted 22.7                                                                                                                     |
| At most 7 criteria                   | pass   | 7: 1 lib, 2 component, 4 e2e (all-done list, empty list, live update and reload, filter and search)                                                                                                        |
| Every Then measurable                | pass   | exact return values, role counts, exact texts and counts, tag name not `P`, navigation count 0                                                                                                             |
| No banned adjective without a number | pass   | none used                                                                                                                                                                                                  |
| Out of scope stated                  | pass   | hiding on an empty list, per-view text, decoration, replacing the label, live region, reactivate control, page title, non-whole counts                                                                     |
| Unchanged behavior with proof titles | pass   | 11 rows, titles copied from `grep` on `src/` and `e2e/` (AC-13.1/13.2 component and lib, AC-13.3/13.5/13.7, AC-16.7, AC-5.7, AC-12.7, AC-14.6)                                                             |
| Dependencies done                    | pass   | none; §5, §9, §12, §13, §14, §16 are on this branch                                                                                                                                                        |
| No settled D-n contradicted          | pass   | D-24 followed: UI only in `remaining-count.tsx`, logic in `todo-count.ts`, no `page.tsx`, `todo-item.tsx`, `todo-search-form.tsx`, `todo-search.ts` or package guide; §13 behavior added to, not rewritten |

Texts and limits come from existing sections: "0 items left" and "No todos yet" (§13, §5), "No active todos" and "No
todos match your search" (§12, §16), count rule REQ-13.5 and REQ-16.9. New text pinned here: `All done`, function name
`allDoneMessage`. No numeric limit is introduced.

## Open questions

1. **"All done" accompanies "0 items left", it does not replace it.** Proposed: accompany (REQ-22.3). Why: the
   existing AC-13.2 component tests assert exactly one `paragraph` reading "0 items left" for `count={0}`, and AC-13.3
   (e2e) asserts exactly one "0 items left" element; tests are never weakened, so the §13 `<p>` stays as is and the new
   text is a sibling that is not a `<p>` (a second `<p>` would break "exactly one paragraph"). Otherwise: replacing
   needs a §13 rewrite under a new D-n and a change to three existing tests.
2. **An empty list also shows "All done".** Proposed: yes (REQ-22.5). Why: `page.tsx` renders
   `<RemainingCount count={countRemaining(todos)} />` and D-24 forbids changing it, so the component sees only
   `count`, and 0 means both "nothing stored" and "all stored are done". Options weighed:
   (a) decide on `count === 0`, an empty list included: no page change, no query; reads "0 items left / No todos yet
   / All done", which is vacuously true but a little odd. Chosen.
   (b) add an optional `total` prop to `RemainingCount`: `page.tsx` does not pass it, so the prop would be dead code
   and untestable end to end.
   (c) let the component call `listTodos()` itself: a second query, which §13 forbids ("same `listTodos()` result, no
   second query").
   (d) a one-line `page.tsx` change passing the stored total: the clean answer, but D-24 reserves `page.tsx` for no
   card in this batch.
   (e) read the DOM from a client component: hydration mismatch risk and an invisible coupling to the page markup.
   Otherwise: if the lead wants silence on an empty list, (d) needs D-24 amended and a follow-up card, or B4.3 waits for
   a card that may touch `page.tsx`; the section's Out of scope names it.
3. **Filter and search never change the message.** Proposed: REQ-22.7 decides from the count of every stored todo.
   Why: §13 REQ-13.5 and §16 REQ-16.9 already make the count independent of what is listed, and the component cannot
   know the view. Consequence: on `/?filter=active` with only done todos stored the page reads "No active todos",
   "0 items left" and "All done", which agrees; with an open todo stored and `/?filter=completed` it shows no "All
   done". Otherwise: a per-view message needs the filter in the component, a `page.tsx` change.
4. **The message element is a `<span>`-like sibling with no role.** Proposed: the section fixes only "not a `<p>`, `<li>`,
   button, link, no role" and leaves the tag, fragment-or-wrapper and styling to the code-writer. Why: the exact tag is
   not behavior; the tests assert on what a person sees and on role counts. Otherwise: a pinned tag is a second source
   of truth the tests would copy.
5. **Existing tests are not changed; the new tests are added to existing files.** `src/lib/todo-count.test.ts` and
   `src/components/remaining-count.test.tsx` gain `AC-22.n` cases in the red commit (additions only); the e2e file is
   new: `e2e/22-all-done.spec.ts`, one per section as `e2e/CLAUDE.md` names them. Nothing is mocked beyond what those
   files already do.
6. **`spec/features-map.md` needs an F20 row** (§22, `src/lib/todo-count.ts`, `src/components/remaining-count.tsx`,
   the three test files). I may not edit that file; proposed: the lead or the orchestrator adds it with the batch's
   other rows (F18, F19 are also absent) in the same docs PR as the guide update.
7. **The index jumps from §19 to §22** until B4.1 and B4.2 add sections 20 and 21. All three PRs add one row after §19, so the
   conflict is a one-line, order-only resolution, as in batch 3. Proposed: the orchestrator resolves it at merge.
8. **The approval box in §22 is left unticked** (`- [ ] Lead approves spec (lead, <date>)`), as instructed; the lead
   ticks it at the plan gate. Two sibling branches add the same line in their own files, so no conflict arises there.
9. **A count other than a whole number at least 0 is unspecified.** Proposed: `allDoneMessage` returns `undefined` for
   anything but exactly 0, which follows from the contract, and no test covers it. Why: `countRemaining` cannot
   produce one. Otherwise: an extra AC case (the cap of 7 leaves no room without merging cases).

## Needs a ruling

None. The empty-list behavior (question 2) is a choice inside D-24's constraint, proposed here and visible to the lead
at the plan gate; only the opposite choice (silent on an empty list) would need a D-n, because it needs `page.tsx`.
