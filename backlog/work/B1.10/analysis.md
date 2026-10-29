# B1.10 analysis

Written by `spec-analyst` at HEAD `f17f376` (the card commit); filed by `dev-lead` (the harness refused this role's
write of this new file; content unchanged except the proposed ruling's number, D-15 → D-16, since D-15 is taken).
Tests-only card: no section edit, no `src/`, `prisma/` or config change. §10 already holds the behavior: REQ-10.6 ("keep
the typed title in the box, keep the "Add" button usable, and list no new todo") and AC-10.5 (its Then is fully
observable in a browser).

Evidence read:

- `src/actions/todos.ts:28-36`: `createTodo` and `revalidatePath('/')` sit in one `try`; the `catch` calls
  `logMutationFailure('createTodoAction', error)` and returns `failure('form', MUTATION_FAILED_MESSAGE)`.
- `src/components/todo-form.tsx:15`: `const kept = state !== null && !state.ok && state.fieldErrors.form !== undefined ? draft : '';`
  is the box's `defaultValue`; the alert is `<p id="new-todo-error" role="alert">` inside the `<form>`.
- AC-10.5 tests exist only in `src/components/todo-form.test.tsx:67,94` (action mocked). `e2e/` has `05-todos`,
  `06-edit-title`, `09-clear-completed`, `smoke`; none makes a write fail. §10 has no e2e file.
- Before B1.5 (`9327a03`, "B1.4 done"), `createTodoAction` awaited `createTodo` with no `try`, and `TodoForm` read
  only `fieldErrors.title?.[0]` and had no `defaultValue`: the action rejected and no alert could appear.
- `prisma/schema.prisma`: `model Todo … @@map("todos")`, `title VarChar(200)`. e2e files already open their own
  `new PrismaClient()` against the worktree schema (`DATABASE_URL` from `.env` via `playwright.config.ts`).
- `stryker.config.mjs` mutates `src/lib/**` and `src/actions/**` with the vitest runner only: e2e never runs under
  Stryker, so D-13's red evidence (mutation report before/after) cannot apply to this card.
- `.github/workflows/review.yml:57` tells the PR bot to post "raw SQL outside src/lib" as a blocking finding;
  invariant 4 allows raw SQL "with a card and a reviewer"; the lead's option B is recorded on the card only.

## Completeness

| Check                                | Result | Note                                                                                                                                 |
| ------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| Intent without solution words        | n/a    | no new section; §10 Intent unchanged                                                                                                 |
| Every behavior has a REQ             | pass   | box keeps title, Add usable, no new todo: REQ-10.6; message removed on the next success: REQ-10.5; nothing refreshed: REQ-10.1       |
| One EARS pattern each                | n/a    | no REQ written                                                                                                                       |
| ≤ 7 criteria                         | pass   | §10 stays at 5 (Q1)                                                                                                                  |
| Every Then measurable                | pass   | alert count 1 then 0 inside the `<form>`, exact text, box value `Buy milk` then `''`, button enabled, list text, row counts          |
| No banned adjective                  | pass   | no spec text                                                                                                                         |
| Out of scope                         | pass   | toggle/edit/clear failures in e2e, the §11 line's content (Q3), request failures (§10 Out of scope), any `src/` or config change     |
| Unchanged behavior with proof titles | pass   | every existing test stays as is; `e2e/05-todos.spec.ts` :: "AC-5.6: a created todo survives a reload, and so does its toggled state" |
| Dependencies done                    | pass   | ~~B1.5~~ `e7b3390`                                                                                                                   |
| No settled D-n contradicted          | pass\* | D-13's commit shape fits; its red evidence does not (Needs a ruling); raw SQL in `e2e/` has no D-n yet                               |

## Proposed test (exact title)

`e2e/10-mutation-feedback.spec.ts` (new; one file per section, §10 has none) › `§10 feedback when a mutation fails`:

`AC-10.5: a create the database rejects shows 1 alert "Could not save, try again" in the form, keeps "Buy milk" in the box, "Add" enabled and the list unchanged; the next Add saves it once`

- Arrange: `beforeEach` `prisma.todo.deleteMany()` and drops the fault (below, `IF EXISTS`); seed `Walk the dog` with
  an explicit `createdAt`; `page.goto('/')`; install the fault.
- Act 1: fill the text box "New todo" with `Buy milk`, click "Add".
- Assert 1: `page.locator('form').getByRole('alert')` has count 1 and text exactly `Could not save, try again`; the
  box has value `Buy milk`; "Add" is enabled; `getByRole('listitem')` has text `['Walk the dog']`;
  `prisma.todo.count()` is 1.
- Act 2: remove the fault, click "Add" again (the box still holds `Buy milk`).
- Assert 2: 0 alerts in the form; the box has value `''`; list text `['Buy milk', 'Walk the dog']`;
  `prisma.todo.count({ where: { title: 'Buy milk' } })` is 1.
- `afterEach` drops the fault (`IF EXISTS`); `afterAll` disconnects.

Fault (lead's option B), two `prisma.$executeRaw` tagged templates with no interpolation, names prefixed `e2e_`:

```sql
CREATE OR REPLACE FUNCTION e2e_reject_todo_insert() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'e2e: insert rejected'; END $$;
CREATE TRIGGER e2e_reject_todo_insert BEFORE INSERT ON todos FOR EACH ROW EXECUTE FUNCTION e2e_reject_todo_insert();
-- removal
DROP TRIGGER IF EXISTS e2e_reject_todo_insert ON todos;
DROP FUNCTION IF EXISTS e2e_reject_todo_insert();
```

Unqualified names land in the worktree's schema through Prisma's `?schema=` search path, and DDL runs as a
parameterless prepared statement [unverified, not run]. Prisma surfaces the `RAISE` as a request error; which class is
irrelevant, since the action's `catch` takes any thrown value [unverified].

Mutation score: unchanged at 88.89 % (no `src/` change; e2e outside Stryker).

## Open questions

1. **New criterion or AC-10.5?** Proposed: title the test `AC-10.5`, §10 unchanged. Why: AC-10.5's Given is what the
   real action returns with the trigger on, then off; every Then is a DOM fact Playwright reads. Otherwise: an
   `AC-10.6` "end to end" criterion is a section change, a `docs(spec): §10` commit inside a D-n, before the test.
2. **Assert "list no new todo" beyond AC-10.5's Then?** Proposed: yes, seed one row and assert the list text and the
   row count. Why: it is REQ-10.6's last clause and the only browser-visible proof that nothing was refreshed
   (REQ-10.1); on an empty list "No todos yet" would hide a lost row.
3. **Assert the §11 log line?** Proposed: no. Why: Playwright does not expose the `webServer`'s stderr to a test, and
   locally the server is reused (`reuseExistingServer: !process.env.CI`); reading it needs a `playwright.config.ts`
   change (config, needs approval). AC-11.x are proven in `src/lib/logger.test.ts`.
4. **Alert locator scope.** Proposed: count alerts inside `page.locator('form')`, as AC-10.5 says. Why: Next's route
   announcer may expose a `role="alert"` node that a page-wide count would include [unverified].
5. **A leftover trigger.** Proposed: drop `IF EXISTS` in this file's `beforeEach` and `afterEach`. Why: if a run is
   killed between install and drop, every create in that schema fails until it is dropped. CI uses a fresh database.
   Residual risk is local only; the PR body names the two `DROP` lines as the recovery. Otherwise: a Playwright
   `globalSetup` cleanup, a config change.
6. **Commit shape and package.** Proposed: D-13's shape, `test(todos): B1.10 e2e proof that a failed create keeps the
title` without `(red)`, no skeleton, no `feat`. Then `docs(map): F8 … [B1.10]` adding
   `e2e/10-mutation-feedback.spec.ts` to F8's tests column (dev-lead's commit).

## Needs a ruling

One request, two parts; the lead can settle both at the plan gate.

```
Context:     B1.10 adds one e2e test of behavior shipped in B1.5; it is green against current code by construction.
             D-13 gives the commit shape but names the Stryker report as red evidence, and Stryker never runs e2e.
             The card's fault injection (raw DDL in e2e/) is ruled on the card only; review.yml:57 flags "raw SQL
             outside src/lib" as blocking.
Options:
  A  Red evidence = run the new spec file against 9327a03's src/ (pre-B1.5) in a scratch worktree, failing on the
     alert assertion; output recorded in review.md. Record option B (trigger added/dropped in e2e/, DDL only,
     tagged $executeRaw, no app/env/config change) as part of the same D-n.
     Cost: 1 extra e2e run.   Risk: manual, not CI-reproducible.   Reversible: yes.
  B  Red evidence = the same test with the fault never installed fails on the alert assertion (proves the test is
     driven by the fault, not that it detects missing behavior). Same raw-SQL record.
     Cost: 1 run with a temporary local edit.   Risk: weaker evidence.   Reversible: yes.
  C  No red evidence (characterization test); green on CI is the evidence. Same raw-SQL record.
     Cost: 0.   Risk: a vacuously passing test goes unnoticed.   Reversible: yes.
Recommended: A. Flips to B if the lead reads A as the manual probe D-13 declined.
Affects:     §10 AC-10.5 (no text change); e2e/10-mutation-feedback.spec.ts; card Test: line; B1.10 red gate; review.yml
             bot finding to be dispositioned "no change needed (D-16)".
```

Proposed D-16: "A tests-only card whose tests run outside Stryker (e2e) lands in D-13's shape; its red evidence is the
new test failing on an assertion against the `src/` before the card that shipped the behavior, recorded in
`review.md`. An e2e test may inject a database fault with parameterless DDL through `prisma.$executeRaw` (a trigger it
adds and drops); no other raw SQL outside `src/lib`."

## Tier recommendation

`quick`, as carded: 0 criteria added, no schema change, 1 new test file. Advisor optional; only the ruling needs a
human.
