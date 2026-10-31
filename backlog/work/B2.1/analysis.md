# B2.1 analysis

Section: §12 in `spec/contracts/10-filter.md` (new; 11 REQ, 7 AC). §5's "filtering" Out-of-scope exclusion now points
at §12.

## Completeness

| Check                                | Result | Note                                                                                                                                                                                  |
| ------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Intent without solution words        | pass   | the Intent names the person's goal; the address (`filter` query parameter) appears only in REQ-12.5/12.6                                                                              |
| Every behavior has a REQ             | pass   | views (12.2-12.4), bad input (12.5), address (12.6), marking (12.7), empty text (12.8), order and no storage change (12.9), Clear completed (12.10), mutations while filtered (12.11) |
| One EARS pattern each                | pass   | ubiquitous 12.1, 12.6, 12.9; state-driven 12.2-12.4, 12.7, 12.8, 12.10; unwanted 12.5; event-driven 12.11                                                                             |
| At most 7 criteria                   | pass   | AC-12.1 to AC-12.7; every REQ is covered by at least one                                                                                                                              |
| Every Then measurable                | pass   | id sequences, exact strings, `href`s, 0 listitems, `aria-current` presence, stored rows                                                                                               |
| No banned adjective without a number | pass   | none used                                                                                                                                                                             |
| Out of scope                         | pass   | search (B2.5), due date (B2.4), count (B2.2), persistence outside the address, DB-side filtering, ordering                                                                            |
| Unchanged behavior with proof titles | pass   | six titles copied from `grep` on `src/lib/todos.test.ts` and `e2e/05-todos.spec.ts`, `e2e/09-clear-completed.spec.ts`                                                                 |
| Dependencies done                    | pass   | card depends on nothing; §5, §6, §9, §10 are done                                                                                                                                     |
| No settled D-n contradicted          | pass   | D-20 (lifts the §5 exclusion, creation-time order stays, own modules, `todos.ts` and `actions/todos.ts` untouched); D-5 duplicates allowed                                            |

Mount point: only `src/app/page.tsx` is shared with another Doing card. `src/lib/todos.ts` and `src/actions/todos.ts`
are not in the card's Files.

Existing e2e queries use `getByRole('listitem')` (`e2e/05-todos.spec.ts:31`, `e2e/09-clear-completed.spec.ts:42`);
REQ-12.1 therefore forbids a `<ul>` in the filter navigation, as §9 already does for its button.

## Open questions

1. **Where does the filter live?**
   Proposed: the URL query parameter `filter` (`/?filter=active`), read in the Server Component through `searchParams`.
   Why: the page is an RSC, the view survives a reload and can be shared, no client state, no hydration flash; the
   card's own evidence greps `searchParams`. Otherwise: client state (`useState`) would need `page.tsx` to pass every
   todo to a client list and a reload would lose the view, which changes §7 more.
2. **Server or client component for the three links?**
   Proposed: no `'use client'`; `TodoFilterNav` is plain `<Link>`s (REQ-12.1, REQ-12.6). Why: `src/components/CLAUDE.md`
   and `ts-style.md` reserve `'use client'` for state and events; links need neither. The lead's note suggested "a client
   filter component". Otherwise: add `'use client'` (no behavior change, the AC-12.4 test is the same).
3. **Empty-state texts under a filter.** §5 fixes only "No todos yet" (no todo exists). Proposed: "No active todos" and
   "No completed todos" when todos exist but none match (REQ-12.8); "No todos yet" stays whenever the store is empty,
   under every filter. Why: the person must tell "nothing stored" from "nothing matches". Otherwise: the lead supplies
   other wording; the AC-12.3 and AC-12.7 literals change.
4. **Unknown or repeated `filter` value.** Proposed: fall back to All, no error, no redirect (REQ-12.5); `Active`
   (capital) and `all` are "unknown" and give All, which is the same view. Why: a hand-edited URL must not break the
   page. Otherwise: a redirect to `/` would add a navigation not in the card's scope.
5. **Interplay with B2.5 (search) on the same address.** Proposed: §12 states only `filter`; the three links point to
   `/`, `/?filter=active`, `/?filter=completed`, so following a link drops any other parameter. Why: B2.5 does not
   exist yet and §12 must not guess its parameter name. Otherwise: B2.5 (or a later section) extends REQ-12.6 with a
   `docs(spec)` commit so links keep `q`; that is a change to §12 and needs its own ruling then.
6. **`Clear completed` while Active is selected.** Proposed: it keeps §9 semantics (every completed todo is deleted,
   shown or not) and its enabled state reads the unfiltered list (REQ-12.10, AC-12.6). Why: §9 says "every todo whose
   completion state is completed". Otherwise: scoping it to the visible rows would rewrite §9 and needs a D-n.
7. **The approval box in §12 is unticked** (`Lead approves spec (lead, <date>)`): `spec/CLAUDE.md` makes the lead tick
   it before any test is written; the plan gate may tick it in the same reply (D-7).

## Needs a ruling

None. Questions 1-6 stay inside D-20 and the existing sections; each has a proposed decision that `dev-lead` or the
lead can overrule before the plan is approved.
