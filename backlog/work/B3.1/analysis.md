# B3.1 analysis

Written by `spec-analyst` (its file write was refused by the harness; saved verbatim by `dev-lead`).

## Completeness

| Check                                | Result  | Note                                                                                                                                                                                                              |
| ------------------------------------ | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Intent without solution words        | pass    | one paragraph; no module, hook or CSS named                                                                                                                                                                       |
| Every behavior has a REQ             | pass    | today (17.1), overdue (17.2), not overdue (17.3), completed (17.4), server render and hydration (17.5), re-evaluation and edit mode (17.6), midnight (17.7), marker is plain text and changes nothing else (17.8) |
| One EARS pattern each                | pass    | ubiquitous 17.1, 17.5, 17.8; state-driven 17.2, 17.3, 17.4, 17.7; event-driven 17.6. REQ-17.4 also has a WHEN clause for the toggle; split it if the reviewer wants one pattern each.                             |
| ≤ 7 criteria                         | pass    | AC-17.1 to AC-17.7. Day-change and edit-mode cases folded into AC-17.6, hydration into AC-17.5, accessible text into AC-17.3.                                                                                     |
| Every Then measurable                | pass    | exact strings, counts of `Overdue` elements, element order, `onRecoverableError` calls, row order, checked state                                                                                                  |
| No banned adjective without number   | pass    | none                                                                                                                                                                                                              |
| Out of scope                         | pass    | midnight timer, server or stored zone, due-soon, days-late count, sort/filter by overdue, done-late marker, locale format, wrong browser clock, notification, new control, storage change                         |
| Unchanged behavior with proof titles | pass    | 7 rows, titles grepped from `src/components/*.test.tsx` and `e2e/`                                                                                                                                                |
| Dependencies done                    | pass    | §15 on main (B2.4 Done)                                                                                                                                                                                           |
| No settled D-n contradicted          | partial | D-21 followed: UI only in `todo-due-date.tsx`, logic in `src/lib/todo-overdue.ts`. §15's Out of scope line conflicts (see Needs a ruling).                                                                        |

Limits come from §15: date format, year range 0001 to 9999, the one wrapper, the button name "Edit due date". The
only new text is `Overdue`.

### How "today" is defined

- **Clock and zone:** the browser's `new Date()` in the browser's local time zone (REQ-17.1). A due date has no zone
  (REQ-15.1), so a person's today is the day on their own calendar. The server's clock, zone and UTC are never used.
- **Comparison:** `dueDate < today` on fixed-width `YYYY-MM-DD` strings. Due today is not overdue. AC-17.2 pins the
  month, year and 0999/1000 boundaries.
- **Server versus browser:** `today` starts `undefined`. The server HTML and the first client render both show
  `Due <date>` and no `Overdue`. An effect adds the marker after hydration (REQ-17.5). AC-17.5 measures identical
  markup under two system times and 0 `onRecoverableError` calls. Cost: at most one frame without the marker on an
  open overdue row, and no marker without JavaScript.
- **Marker:** a `<span>` with the text `Overdue` in the §15 wrapper, after `Due <date>`. No role, no `aria-label`, so
  §15's "no element with role alert" and "exactly one button" still hold.
- **Midnight:** the marker does not update (REQ-17.7). `today` is read once at mount; a reload or fresh render
  re-reads it. A timer is out of scope.

## Open questions

1. **Completed todos: `TodoDueDate` does not receive `completed`.** `src/components/todo-item.tsx:99` mounts
   `<TodoDueDate todoId={todo.id} dueDate={todo.dueDate} />`, and that file is B3.3's in this batch (D-21).
   - A. Optional prop `completed?: boolean` plus `completed={todo.completed}` at line 99. Cleanest, but needs a lead
     exception to D-21 and conflicts with B3.3's hunk, or sequencing.
   - B. CSS only (`:has(:checked)`). Rejected: the marker stays in a completed row's DOM, so
     `e2e/15-due-date.spec.ts:55` (`/^\s*B\s*Due 2026-11-05\s*$/` on B's `<li>` text, B done) fails from 2026-11-06;
     jsdom applies no CSS, so no unit test could prove it.
   - C. Read the row's checkbox from the DOM inside `todo-due-date.tsx` (nearest `li`, first
     `input[type="checkbox"]`) after mount and after every render; no marker while it is checked. Stays inside this
     card's two files, unit-testable in jsdom with an `<li>` wrapper (AC-17.4), and absent from a completed row's DOM,
     so §15's e2e holds.
   - D. Touch `todo-item.tsx` despite D-21: A without the exception, a violation.
   - E. Ship now and fix after B3.3: breaks REQ-17.4.

   **Proposed: C**, written into REQ-17.4, the function contract and AC-17.4. Only option that keeps both D-21 and
   REQ-17.4 true. Costs: couples to the row structure (an `li` whose first checkbox is the completion control; B3.3
   must keep that); the re-read relies on `TodoItem` re-rendering the child on toggle, which holds today (no `memo`);
   AC-17.7 (e2e on the real row) proves it end to end. If the lead picks A: the contract gains
   `completed?: boolean` (default `false`), REQ-17.4's "read from the row" paragraph and AC-17.4's Given change to a
   prop, `todo-item.tsx:99` gains `completed={todo.completed}` (lead exception to D-21; B3.3 lists the same line or
   merges first); other REQs and ACs stay.

2. **Clock source.** Browser local day (proposed) versus server day or UTC. Server or UTC would let the server render
   the marker, but a viewer far from the server's zone sees the wrong day for up to 14 hours, and a due date has no
   zone. If flipped, the hydration criterion goes and AC-17.1 becomes a UTC rule.
3. **Midnight not tracked** (REQ-17.7). A timer would cost one requirement and a fake-timer criterion; the AC count is
   already 7, so it would fold into AC-17.6.
4. **Existing tests become date-dependent.** `todo-due-date.test.tsx` AC-15.5 (a) and AC-15.6 render
   `dueDate="2026-11-05"`; from 2026-11-06 an open row there shows `Overdue`. They stay green: no assertion checks the
   whole text of a dated row. The test-writer pins the system time in every new test
   (`vi.useFakeTimers({ toFake: ['Date'] })` plus `vi.setSystemTime` with local-field `Date`s); the e2e takes days
   from the browser's local day, not from literals.
5. **Test placement.** Unit `src/lib/todo-overdue.test.ts` (AC-17.1, AC-17.2); component new
   `src/components/todo-due-date-overdue.test.tsx` (AC-17.3 to AC-17.6), so `todo-due-date.test.tsx` stays untouched;
   e2e `e2e/17-overdue.spec.ts` (AC-17.7).
6. **Files outside the section.** `spec/features-map.md` needs an F15 / §17 row (code-writer, green step).
   `src/lib/CLAUDE.md`, `src/components/CLAUDE.md`: orchestrator after the batch (D-21). Expect adjacent-line merge
   conflicts with B3.2/B3.3 on the index in `spec/technical-requirements.md` and on
   `backlog/plan/E3-todos-polish.md`.

## Needs a ruling

**Request: may the §17 `docs(spec)` commit edit one line of §15's "Out of scope"?**

- **Context:** `spec/contracts/13-due-date.md` "Out of scope" lists "an overdue or due-soon highlight or any
  comparison with today's date". §17 does exactly that, so two sections disagree. D-21 names the overdue marker and
  §17; it lifts §5's exclusion only for B3.3 and is silent on §15's line. §15 not edited.
- **Options** (Behavior | Cost | Risk | Reversible):
  1. Edit the line in the §17 docs(spec) commit, dropping the overdue and comparison phrase. §15 and §17 agree. One
     line, as B2.4 did with §1/§3/§5 lines. No behavior risk. Reversible.
  2. Leave §15 and have §17 say it lifts the line. Conflict explained, not removed; §17 would carry history, which
     `spec/CLAUDE.md` bans. Reversible.
  3. Decline the marker. §15 stands, B3.1 closes unbuilt, D-21 contradicted. Reversible.
- **Recommended:** 1 (flips to 2 if the lead wants §15 frozen byte for byte).
- **Affects:** §15 (one Out of scope line), §17, card B3.1. No AC ids change.
