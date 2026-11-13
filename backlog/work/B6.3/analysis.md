# B6.3 analysis

## Completeness

| Check                                | Result | Note                                                                                                   |
| ------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------ |
| Intent without solution words        | pass   | states what a person sees, no component or hook named                                                  |
| Every behavior has a REQ             | pass   | marker, no-marker cases, completed, hydration, re-render, midnight, markup shape: REQ-31.1 to REQ-31.7 |
| One EARS pattern each                | pass   | state-driven x4, event-driven x1, ubiquitous x2                                                        |
| At most 7 criteria                   | pass   | 6 (AC-31.1 to AC-31.6)                                                                                 |
| Every Then measurable                | pass   | exact counts, strings, order                                                                           |
| No banned adjective without a number | pass   | none used                                                                                              |
| Out of scope                         | pass   | other due-soon days, counts, timer, a11y announcement, sorting/filtering                               |
| Unchanged behavior with proof titles | pass   | titles grepped verbatim from the test files (AC-15.5, AC-15.6, AC-17.2, AC-17.3, AC-5.1, e2e AC-5.1)   |
| Dependencies done                    | pass   | D-33 settled; §17 and §15 are done                                                                     |
| No settled D-n contradicted          | pass   | D-33: file 29-due-today.md, section 31, F29, `todo-due-date.tsx`                                       |

Also done: the due-today case lifted from §17's Out of scope (`spec/contracts/15-overdue.md`, one phrase), to be
committed on its own as `docs(spec)` per D-33; §31 registered in `spec/technical-requirements.md` with status ✗.

## Open questions

1. New file `src/lib/todo-due-today.ts` for `isDueToday` / `DUE_TODAY_LABEL`. D-33 says the card mounts in
   `src/components/todo-due-date.tsx` only. Proposed: a separate pure lib file (keeps §17's contract untouched, the
   red test is an import-free-of-React unit). Otherwise: put both in `todo-overdue.ts` (a §17 file change) or inline
   the comparison in the component (no unit test target; the card's red test would have to be the component test).
2. Is the file name `todo-due-today.ts` acceptable to `scripts/ci/check-spec-sections.sh` and the features-map
   (F29 row not yet present; `spec/features-map.md` is not mine to edit; code-writer adds it in `docs(map)`)?
3. Test files proposed: `src/lib/todo-due-today.test.ts`, `src/components/todo-due-date-today.test.tsx`,
   `e2e/31-due-today.spec.ts`. Titles `AC-31.n: ...`; the spec dir number (29) differs from the section (31), as in earlier sections.
4. The "Lead approves spec" box is left unticked for the human (spec/CLAUDE.md).

## Needs a ruling

None.
