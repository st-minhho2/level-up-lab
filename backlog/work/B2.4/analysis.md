# B2.4 analysis

Section: §15 Todos: an optional due date, `spec/contracts/13-due-date.md` (new, D-20). 11 REQ, 7 AC. Also edited in the
same `docs(spec)` commit: §1 (scope sentence and exclusion list), §3 (`dueDate` column, one sentence), §5 (out of
scope: "due dates (§15)"), index row ✗.

## Completeness

| Check                                | Result | Note                                                                                                                                                                                                        |
| ------------------------------------ | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Intent without solution words        | pass   | one person-level paragraph; no module, column or library named                                                                                                                                              |
| Every behavior has a REQ             | pass   | set, clear, keep title/state/order, idle row, edit mode, invalid value, unknown id, persistence, failure, recovery, "a todo has at most one date, none by default"                                          |
| One EARS pattern each                | pass   | ubiquitous 15.1, 15.9; event 15.2-15.4, 15.6, 15.11; state 15.5; unwanted 15.7, 15.8, 15.10                                                                                                                 |
| At most 7 criteria                   | pass   | 7 (AC-15.1 to AC-15.7); AC-15.2 and AC-15.6 are the widest, the test-writer splits them into several `it` with the same AC prefix                                                                           |
| Every Then measurable                | pass   | exact parse results, call arguments, `Date` values, texts, counts of alerts, row order                                                                                                                      |
| No banned adjective without a number | pass   | none used                                                                                                                                                                                                   |
| Out of scope stated                  | pass   | creation-time date, overdue highlight, sorting/grouping/filtering/search by date, times, zones, recurrence, range limit, cancel edit, locale format, two tabs, undo; ordering stays creation time only (§1) |
| Unchanged behavior with proof titles | pass   | 9 rows, titles copied from `git grep` on `src/` and `e2e/` in this worktree                                                                                                                                 |
| Dependencies done                    | pass   | card has none; §5, §6, §10, §11 on main; B2.1-B2.3 done (so `page.tsx` is already the batch-1 version)                                                                                                      |
| No settled D-n contradicted          | pass   | D-20 (section 15, `13-due-date.md`, migration, ordering stays creation time) followed; D-11 message and §11 logging reused; D-5 untouched (title rule not edited)                                           |

Limits taken from existing sections: message `Could not save, try again` (§10), order `createdAt desc` (§5), log entry
(§11), id message `Todo id is required` (as `toggleTodoSchema`). New text invented by this section (content, not a
limit): `Due date must be a valid date`, the button names "Edit due date" / "Update due date", the field label
"Due date", the row text `Due <date>`. The year range 0001-9999 is a consequence of the four-digit `YYYY` form
(question 2).

Design notes for `dev-lead` (shape of the function contracts):

- Mount points: `src/lib/todos.ts` (the `Todo` type, `todoFields`, a row-to-`Todo` mapping in the four existing
  functions, new `setTodoDueDate`) and `src/actions/todos.ts` (new `setTodoDueDateAction`) are touched, as the brief
  allows. `src/app/page.tsx` and `src/lib/todo-schema.ts` are NOT touched: `page.tsx` already passes whole `Todo`
  objects to `TodoItem`, and the new Zod schema lives in a new pure module `src/lib/todo-due-date.ts`.
- The action sits in `src/actions/todos.ts`, not in a new actions file, so the existing component tests that mock
  `@/actions/todos` keep loading (testing.md: "add a key, never remove one"); a new actions module would be
  imported unmocked by `todo-item.test.tsx` and drag `server-only` Prisma into jsdom.
- The new component `src/components/todo-due-date.tsx` is rendered inside `TodoItem` (one added line in
  `todo-item.tsx`); the existing `todo-item.test.tsx` keeps working because the idle row adds no text (REQ-15.5).
  Its tests need `setTodoDueDateAction` in the hoisted mock object of any test that renders `TodoItem`: not required
  for the old tests (the action is read only on click), so no existing test file has to change.
- B2.5 (search) overlap: both cards will probably edit `listTodos` in `src/lib/todos.ts` and `src/lib/todos.test.ts`
  and add a row to `spec/technical-requirements.md`; expect adjacent-line merge conflicts, the second PR to merge
  resolves them. `scripts/next-task.sh --check B2.4` will report the overlap on `src/lib/todos.ts` and
  `src/actions/todos.ts`. The AC-15.2 lib tests are written in `src/lib/todos.test.ts` (existing file) or, to avoid the
  overlap, in a new `src/lib/todo-due-date-store.test.ts` that imports from `@/lib/todos`; the test-writer chooses.
- E2e file: `e2e/15-due-date.spec.ts` (files carry the section number).
- Migration: `pnpm db:migrate --name add-todo-due-date` on the local compose database; one nullable `DATE` column, no
  index, no backfill. `prisma/seed.ts` is unchanged. The e2e tests create rows with `prisma.todo.create`, which works
  once the column exists.

## Open questions

1. **Setting a date while creating a todo.** The brief says "an optional due date per todo"; §15 lets a person set it
   on an existing row only (button "Edit due date"), and puts "setting a date at creation" out of scope. Proposed:
   keep it out; a later card adds a "Due date" field to `TodoForm`. Why: `TodoForm` has intricate draft-keeping logic
   (§10) and 5 existing criteria; a second field widens `createTodoAction`'s signature and its tests, past 7 criteria
   (an eighth would be a second section). Otherwise: a new section 17 (or an extension of §5) for create-with-date and
   a larger B2.4.
2. **Valid-date range.** Never invented: §15 accepts any real calendar date written `YYYY-MM-DD`, year 0001 to 9999,
   past dates included, no future limit. Proposed: as written; the lower bound 0001 excludes year `0000`, which the
   format admits but PostgreSQL `DATE` does not. Otherwise: a different bound (for example "today or later") needs the
   lead, and a clock input in the schema.
3. **Time zone and format.** Proposed (written in REQ-15.1/15.2): a due date is a calendar day with no time zone,
   stored as `DATE`, carried as the string `YYYY-MM-DD`, shown exactly like that (`Due 2026-11-05`), never through a
   locale. Why: any time zone would invent a rule and shift the day for some viewers. Otherwise: a locale format
   (`5 Nov 2026`) needs a decision on which locale; an e2e criterion would depend on the machine.
4. **`Todo.dueDate` shape.** `readonly dueDate?: string` (absent when none, `undefined` in app types per ts-style),
   `Date | null` only inside the Prisma row; the lib maps both ways (`dueDateOf`, `dueDateToDate`). Why optional: the
   existing tests build `Todo` objects without the field and may not change. Otherwise: required `string | undefined`
   would break typecheck in those tests.
5. **§5's `Todo` interface block is not edited.** §15's function contracts say "§5 Todo, extended", so the §5 block
   (exact signatures) is now stale by one optional line, and §5 says `listTodos` selects `id,title,completed,createdAt`.
   Proposed: leave §5 as is, because rewriting a §5 signature is beyond the §5 out-of-scope line D-20 lifts; the
   lead may order a one-line `docs(spec): §5` edit instead. Otherwise: `/spec-trace` would report the divergence after
   the code lands.
6. **§10 and §11 name four actions; §15 adds a sixth (§14 added the fifth).** Same approach as B2.3 question 1:
   §15 states its own failure and logging behavior (REQ-15.10) and widens `MutationActionName` by one member,
   `'setTodoDueDateAction'`; §10 and §11 text stay untouched. Why: additive, the precedent was accepted with B2.3;
   the alternative is a D-n and a `docs(spec): §11` commit first, one more PR before the red test.
7. **Error placement when two controls fail in one row.** REQ-15.10 puts the message in the same row; the row may then
   hold the toggle's alert and the due date's alert (two `role="alert"`). §10's "exactly 1 alert in the row" criteria
   concern one failing control. Proposed: accept; AC-15.6 asserts the alert inside the component's wrapper only.
8. **Button and field names.** "Update due date" (not "Save due date") so that `getByRole('button', { name: 'Save' })`
   in `e2e/06-edit-title.spec.ts` (substring match) never matches two buttons when both edit modes are open. Proposed:
   as written.
9. **Features map and `check-spec-sections.sh` wording.** `spec/features-map.md` has no F13 row; the analyst does not
   edit it. Proposed: the lead adds F13 (§15: `src/lib/todo-due-date.ts`, `src/lib/todos.ts`, `src/actions/todos.ts`,
   `src/components/todo-due-date.tsx`, `src/components/todo-item.tsx`, `prisma/schema.prisma`) in the `docs(map)` commit
   with the `feat`. The tick of the approval box in §15 is left for the lead (plan gate).
10. **Clearing a date.** REQ-15.3: clearing = submitting an empty field (no separate "Clear" button; a native date
    input can be emptied from the keyboard). Proposed: as written. Otherwise: a "Clear due date" button adds an eighth
    criterion's worth of behavior, so a second section.

## Needs a ruling

None. Questions 1, 5 and 6 sit nearest to one: each is additive and within D-20's lifted exclusions, and each
names the cheaper default; the lead may overrule any of them at the plan gate.
