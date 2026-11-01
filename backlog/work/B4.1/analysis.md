# B4.1 analysis

Section: §20 Todos: show the creation date, `spec/contracts/18-created-date.md` (new, D-22 and D-24). 7 REQ, 6 AC.

## Completeness

| Check                                | Result | Note                                                                                                                                                                                                        |
| ------------------------------------ | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Intent without solution words        | pass   | one person-level paragraph; no module, element or function named                                                                                                                                            |
| Every behavior has a REQ             | pass   | day in UTC, wording, one element per row in both modes, visible but not text, same on server and browser, stable across toggle/edit/due date/reload, no new control                                         |
| One EARS pattern each                | pass   | ubiquitous 20.1 to 20.5 and 20.7; event-driven 20.6                                                                                                                                                         |
| At most 7 criteria                   | pass   | 6: 2 lib, 3 component (markup, hydration, re-render), 1 e2e                                                                                                                                                 |
| Every Then measurable                | pass   | exact strings, `childNodes.length`, counts of `time`, checkbox and button, hydration error count, a bounding box of at least 1 px, computed `::after` content                                               |
| No banned adjective without a number | pass   | "visible" is defined as a box at least 1 px wide and 1 px high (REQ-20.4)                                                                                                                                   |
| Out of scope stated                  | pass   | time of day, relative or locale wording, browser-local day, tooltip, sort/filter/search, text-content date, hide toggle, invalid Date, layout outside the row                                               |
| Unchanged behavior with proof titles | pass   | 10 rows, titles copied from `grep` on `src/` and `e2e/`                                                                                                                                                     |
| Dependencies done                    | pass   | none; §5, §6, §10, §15, §17, §19 are on this branch; `Todo.createdAt` is already selected by `src/lib/todos.ts`                                                                                             |
| No settled D-n contradicted          | pass   | D-24 and D-22 followed (UI only in `todo-item.tsx`, logic in `src/lib/todo-created.ts`, no `page.tsx`, no package guide). One open point (question 1) needs the lead's confirmation, no D-n is contradicted |

Limits and texts come from existing sections: `YYYY-MM-DD` with a four-digit year (§15, §17), the `Due <date>` style
(§15), `createdAt desc` (§5). New text pinned here, not invented limits: the word `Created`, the attribute names
`datetime` and `data-created`, UTC as the zone.

## Open questions

1. **AC-5.1 conflict: where the date appears.** Seven e2e files and two unit tests read each `<li>`'s whole text as
   the title (`e2e/05-todos.spec.ts` AC-5.1, `06`, `09`, `10`, `13`, `14`, `19`; `todo-item.test.tsx` AC-19.5 (b) and
   the §6 note "the row adds no text content in its idle state"); `src/components/CLAUDE.md` says a row adds no
   visible text beyond its title. A date as plain text in the row breaks all of them. Options:
   - **A (written as default):** an empty `<time datetime data-created>` whose label is CSS generated content
     (`content: attr(data-created)`). Visible on screen, not in `textContent`, so §5, §6, §9, §10, §13, §14, §19 and
     their tests stay as they are; no D-n touches an existing section. Cost: the date cannot be selected, copied or
     found by page search, `getByText` cannot see it (the e2e reads the attribute and the computed `::after`
     content), and the guide's word "visible" is true only of text content. Reversible.
   - **B:** the date is real text in the row. Needs a D-n that rewords §5, §6 and §19 (and the guide) from "whole row
     text is the title" to "row text starts with the title", and rewrites 7 e2e files and 2 unit tests in `docs(spec)`
     plus `test(...)` commits before the card's own red commit. Cost: about 9 test files outside the card, and every
     parallel branch in batch 4 that reads row text is exposed. Better for accessibility and copy.
   - **C:** the date only in a `title` tooltip on the row's label. Same tests stay green; the date is not visible
     without hovering and not on touch screens. Declined as not meeting "shows".
     Proposed: A. Why: it is the only option that shows the date and leaves every settled criterion alone, which D-22
     and D-24 ask of a batch card. Otherwise: B turns a size-S card into a cross-section change that needs a D-n before
     the red commit.
2. **Time zone: UTC, not the browser's.** Proposed: UTC for `createdAt` (REQ-20.1). Why: the server render and the
   browser's first render must emit the same attribute, and a browser-local day needs a post-mount effect (as §17), so
   the date would be missing from the server HTML and the CSS-content approach would need a client state. The e2e is
   deterministic under any runner `TZ`. Otherwise: the day matches the person's own calendar near midnight, but it
   costs a client component, an effect and a hydration criterion like AC-17.5; the date appears only
   after hydration.
3. **Day only, `Created YYYY-MM-DD`, no time of day.** Proposed: as `Due <date>` (§15). Why: one date style in the
   row, no locale. Otherwise: a time needs a zone rule again and a longer string.
4. **Placement: after the due-date element and before the §10 alert, in view and edit mode.** Proposed as in the
   section. Why: the completion checkbox stays first (§17), the delete button stays last (§19). Otherwise: a REQ for
   edit-mode hiding and one more case in AC-20.3.
5. **No existing test file changes.** `TodoItem` imports only `src/lib/todo-created.ts`, and every `todo` factory in
   `todo-item.test.tsx` already carries a valid `createdAt`. The hydration test goes in a new
   `src/components/todo-item-created.test.tsx` (it mocks `@/actions/todos` and `@/actions/delete-todo`), like
   `todo-due-date-overdue.test.tsx` for §17. Otherwise the `feat(...)` commit would touch a test, which CI rejects.
6. **Computed `::after` content in e2e.** Chromium returns the resolved `attr()` string with surrounding quotes;
   AC-20.6 strips them. If a Chromium update changes that, the test-writer reports it rather than loosening the
   assertion.
7. **Not edited by this card's analysis:** `spec/features-map.md` (needs an F18 row: `src/lib/todo-created.ts`,
   `src/components/todo-item.tsx`; tests `src/lib/todo-created.test.ts`, `src/components/todo-item.test.tsx`,
   `src/components/todo-item-created.test.tsx`, `e2e/20-created-date.spec.ts`) and the package guides
   (`src/components/CLAUDE.md`, `src/lib/CLAUDE.md`), which D-24 leaves to the orchestrating session.

## Needs a ruling

Soft, at the plan gate: confirm question 1, option A (no existing section or test changes). The section is written
for A. If the lead rules B, the decision request below becomes a D-n and §20 REQ-20.3 and REQ-20.4 are rewritten before
any test.

**Decision request: B4.1 date in the row vs "a row's text is its title"**

- Context: `e2e/05-todos.spec.ts` AC-5.1, six more e2e files and `todo-item.test.tsx` read each `<li>`'s whole text as
  the title; `src/components/CLAUDE.md` says a row adds no visible text beyond its title; §20 asks for a date on every
  row.
- Options:

| #   | Behavior                                                                  | Cost                                                            | Risk                                                      | Reversible |
| --- | ------------------------------------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------- | ---------- |
| A   | date shown as CSS generated content from `data-created`, not in the text  | none outside the card                                           | not selectable or searchable; guide wording stretched     | yes        |
| B   | date is row text; §5, §6, §19 and the guide reworded; 9 test files edited | a D-n, 3 `docs(spec)` edits, 9 test edits before the card's red | conflicts with parallel batch-4 branches reading row text | yes        |
| C   | date only in a `title` tooltip                                            | none outside the card                                           | not visible; fails "shows"                                | yes        |

**Recommended: A** (flips to B only if copyable, searchable text matters more than leaving seven test files alone).
Affects: §20 REQ-20.3, REQ-20.4, AC-20.3, AC-20.6; under B also §5, §6, §19 and the listed tests.
