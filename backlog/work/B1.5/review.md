# B1.5 review

## Plan review (round 1)

SCOPE: all

Reviewed: `backlog/work/B1.5/plan.md` at `ef73bec` (`Plan approved by: lead (session reply "approve"), 2026-10-29`)
against §10 (`spec/contracts/08-mutation-feedback.md`, Tier full, second box `- [x] Lead approves spec (lead,
2026-10-29, plan gate of B1.5)` ticked in `ef73bec`), §5, §7, card B1.5, D-5, D-7, D-11, `analysis.md`, `advice.md`,
the four `src/` files and two guides the plan names, `e2e/05-todos.spec.ts`, `scripts/verify-red.sh`,
`scripts/ci/check-feat-commits.sh`, the role hook scopes, and `git log origin/main..HEAD` (6 docs commits, no
`src/` change). Run in this worktree on 2026-10-29: `pnpm test` → `Tests 67 passed (67)`; `check-features-map.sh` OK;
`check-spec-sections.sh` OK (1–10); `check-ac-coverage.sh` exit 1 (`§10 criteria=5 covered=3 MISSING: AC-10.4
AC-10.5`, expected until the red commit: note 6). Probes on a copy under the session scratchpad (`rsync` without
`node_modules`, symlinked), never on the tree: see notes 1, 3 and reason 1.

| Check                                                                             | pass / fail: reason                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: `src/actions/todos.ts` (F4, F5, F6, F7, F8) and `src/components/todo-form.tsx` (F4) are the two files §10's Function contracts block names for the create path; F8 gains `todo-form.tsx` and its test, which `check-features-map.sh` will resolve (both exist). The two guides are inside the code-writer's `src/*` scope; `docs/metrics.md` is bookkeeping. No `src/lib`, `prisma/`, `src/app` or `e2e/` file, consistent with §10 Out of scope and analysis Q4.                                                                                                       |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: `createTodoAction(previous, formData): Promise<ActionResult<Todo>>` unchanged; Zod `safeParse` stays above the `try`, one lib call, `revalidatePath('/')`, `failure('form', MUTATION_FAILED_MESSAGE)` in a bindingless `catch` (the shape `clearCompletedTodosAction` already has, `src/actions/todos.ts:75`). The wrapper is typed explicitly, imports `ActionResult` and `Todo` as types only (erased; `todo-item.tsx:6` already does the same). Probe: `tsc --noEmit` exit 0 and `eslint` clean on both files with approach A applied. The one §7 issue is reason 1. |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: approach A for `TodoForm`, the action layer exactly as advised, the recommended untitled `revalidatePath` test, no e2e. But the advice's A-vs-B-2 comparison misses one property A loses (reason 1), so the recommendation the lead approved was weighed on incomplete facts.                                                                                                                                                                                                                                                                                           |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: §10 has 5 (AC-10.1..AC-10.5, Tier full); AC-10.4 is an exact object, call counts (`createTodo` 1, `revalidatePath` 0) and the `title` error; AC-10.5 is an alert count (1 / 0) inside the `<form>`, exact text, box value `Buy milk` then `''`, button enabled. `grep -iw` of the banned list over `plan.md` and §10: 0 hits.                                                                                                                                                                                                                                           |
| verification lists exact commands with expected numbers                           | pass: `verify-red.sh B1.5` → 3 new fail, 0 new pass (probe: confirmed, note 1); `pnpm test` 67 + 3 = 70 (probe with A applied: `Tests 70 passed (70)`); `pnpm test:e2e` 12; mutation ≥ 70 from 82.80; the three guards. One wrong pointer: the e2e "via AC-5.2/5.3 e2e" does not exist (note 5).                                                                                                                                                                                                                                                                              |
| work breakdown has skeleton → red → green → map → review with convention subjects | fail: subjects match (`test(todos): B1.5 … (red)` matches verify-red's `^test\([^)]*\): B1\.5 .*\(red\)$`; `feat(todos): B1.5 …` touches no test file, so `check-feat-commits.sh` passes); no skeleton, justified (note 4). But step 4 gives the F8 map row to dev-lead, whose hook cannot write `spec/features-map.md` (reason 2).                                                                                                                                                                                                                                           |
| the section's `Lead approves spec` box is ticked by a human (never by you)        | pass: `spec/contracts/08-mutation-feedback.md:6` reads `- [x] Lead approves spec (lead, 2026-10-29, plan gate of B1.5)`, ticked in `ef73bec` (`docs(backlog): B1.5 plan approved`) on the lead's "approve" reply, the step D-7 names. Not ticked by me.                                                                                                                                                                                                                                                                                                                       |
| no settled D-n contradicted                                                       | pass: D-5 (limits and messages untouched; the box keeps `maxLength={200}`; Zod stays first, so a blank title never reaches `createTodo`, pinned by AC-10.4's second call); D-7 (box and `Plan approved by:` line present); D-11 followed (`form` key, exact message, no revalidation, cause not logged, create path covered by this card as D-11 names).                                                                                                                                                                                                                      |

Verdict: changes requested

1. **Approach A drops the form's progressive enhancement and the literal `useActionState(createTodoAction)` of §7,
   and neither the advice nor the plan says so.** Confirmed in two ways. Source:
   `node_modules/next/dist/compiled/react-dom/cjs/react-dom-server.node.development.js:4058` enables the
   server-rendered form POST only when the function given to `useActionState` carries `$$FORM_ACTION` (a Server
   Action reference); A passes an inline client closure, so the server renders the form with
   `action="javascript:throw new Error('React form unexpectedly submitted.')"` (`:9600`). Probe (copy, `next dev` on
   port 3999, `curl /`): HEAD renders `<form … action="" encType="multipart/form-data" method="POST"><input
type="hidden" name="$ACTION_REF_1"/>…<input type="hidden" name="$ACTION_KEY" …/>`; with A applied it renders the
   `javascript:throw` action and no hidden fields. TRIGGER: a submit with JavaScript disabled or failed to load. WRONG
   BEHAVIOUR: today the todo is stored by a native POST; after A nothing is submitted. With JavaScript present, a
   submit before hydration is captured by React's replay script (`:9619`) and replayed, so the e2e path is safe
   (note 3). No section requires the no-JS path (spec, decisions and docs are silent on it), which is exactly why the
   plan must not drop it silently (`spec-fidelity.md`: a gap goes to the lead, never to a guess in code). §7
   (`05-ui.md:8`) reads `TodoForm (useActionState(createTodoAction), …)`; the advice's P2 entry calls A compliant
   because "A keeps the hook", but the argument changes. Required: the plan states both facts in one line and the
   lead re-approves A knowing them (if the lead reads §7's parenthetical as binding, that is a §7 change through
   `/advise`, not this card), or the plan switches to B-2, which keeps `useActionState(createTodoAction, null)`
   literal and keeps the native POST. B-2's caveat (reset-versus-`defaultValue` commit order) is smaller than the
   advice frames it: `react`/`react-dom` are pinned exactly at `19.1.0` in `package.json:35-36`, an upgrade is a
   dependency change that needs approval anyway, and AC-10.5 is the regression test that would catch a changed order.
   Either choice passes AC-10.4, AC-10.5 and the §5 tests as probed (here for A; in the advice for B-2).
2. **Step 4 assigns the map row to a role that cannot write it.** `.claude/agents/dev-lead.md:11` (hook:
   `'backlog/*' 'docs/metrics.md' 'docs/mistake-log.md'`) and `:15` ("you write only `backlog/`, `docs/metrics.md`,
   `docs/mistake-log.md`") exclude `spec/features-map.md`; the plan's step 4 reads "4 Map | dev-lead | F8 row,
   metrics row". TRIGGER: dev-lead edits `spec/features-map.md` at step 4. WRONG BEHAVIOUR: `path-guard.sh` blocks the
   write, or the row is written outside the dev-lead's scope. The code-writer's hook allows `spec/features-map.md`
   and `docs/metrics.md`. Required: name the code-writer for the F8 row (in the green commit, as B1.4 did, or in a
   separate `docs(map): F8 create path [B1.5]` commit it makes); the metrics row can stay with dev-lead.

Notes (none blocking; for the test-writer, the code-writer and the diff review):

1. Red step, confirmed by probe. The three tests written as the plan and advice describe, run against HEAD code:
   AC-10.4 `promise rejected "Error: db down" instead of resolving`; the untitled test `promise rejected "Error: cache
down" instead of resolving`; AC-10.5 `Unable to find role="alert"`. verify-red's classification, replayed on that
   JSON report with HEAD as the base: `todos.test.ts` 18 ran, 2 new, 2 new failed, 0 new passed, 0 wrong reason;
   `todo-form.test.tsx` 4 ran, 1 new, 1 failed, 0 passed, 0 wrong reason; no new title is prefixed by an existing one,
   so the prefix match at `scripts/verify-red.sh:119` counts all three as new. Keep AC-10.5's recovery inside the
   failure test (alone it is green at the base, as B1.4's review note 1 found), alert first, value second. Use the
   literal `'Could not save, try again'` as every Then cell does; the constant now exists, but the literal pins its
   value.
2. The untitled `revalidatePath`-throws test is legitimate and must not carry `AC-10.4:`. AC-10.4's Given is
   "`createTodo` rejects"; this test's Given is "`createTodo` resolves, `revalidatePath` throws", which only §10's
   Function contracts sentence ("any value thrown by createTodo or revalidatePath resolves to the `form` failure")
   states. An `AC-10.4:` prefix would claim a proof the criterion does not ask for (`spec-fidelity.md`: ids appear
   verbatim at the start of the test titles that prove them). Repo precedent for an unprefixed behavior test exists
   and §10 itself cites one (`returns fieldErrors.id ["Todo not found"] for an unknown id and does not revalidate`,
   `src/actions/todos.test.ts:151`). It earns its place: probe, moving `revalidatePath('/')` out of the `try` on the
   copy fails this test only (`1 failed | 17 passed`), a structural change Stryker does not generate.
3. Approach A against existing tests, probed on the copy: `pnpm exec vitest run` → 70 passed (the three §5
   `TodoForm` tests unchanged and green); no `act(...)` warning (the 3 "warning" lines are Vite config notices, also
   present at HEAD); `playwright test` (Chromium, `next dev`, port 3999, this worktree's schema) → `12 passed`,
   including AC-5.6, the only e2e that types into "New todo" and clicks "Add" (`e2e/05-todos.spec.ts:36-37`). React
   keeps the `value` attribute in sync with a controlled `value` prop (`react-dom-client.development.js`
   `updateInput` → `setDefaultValue`), so the post-action `form.reset()` restores the draft. Mutant "clear the draft
   unconditionally" fails AC-10.5 (probed). Unspecified edge, not a finding: text typed before hydration stays in the
   DOM while `draft` is `''` (`initInput` keeps the DOM value when hydrating; 19.1.0 has no change replay), so the
   next re-render empties the box; the replayed submit still carries the typed title.
4. No skeleton: justified. Every function exists, `MUTATION_FAILED_MESSAGE` and `failure` are already exported, and
   the three tests fail on assertions at the base (note 1), which is what `testing.md` requires of the red commit.
5. Files list and pointers. (a) `src/components/todo-form.tsx:3` reads `// §7 TodoForm.`; after this card it
   implements §10 too, and its siblings name it (`todo-item.tsx:3`, `clear-completed-button.tsx:3`; `src/CLAUDE.md`:
   the header names the section). Add "header gains §10" to the file's line. (b) The sentence to drop ("createTodoAction
   still lets a lib error reach the error boundary until B1.5") is in `src/actions/CLAUDE.md` only;
   `src/components/CLAUDE.md` needs no change (the advice's Impact table says so). (c) Verification says "Chromium
   check of the controlled input via AC-5.2/5.3 e2e"; there are none, the check is AC-5.6. (d) §7's "error under the
   box" stays true; its `useActionState(createTodoAction)` is reason 1. (e) The header comment of
   `src/actions/todos.ts` is listed. (f) The §10 index flip ◐ → ✅ in the closing commit matches `backlog/CLAUDE.md`
   ("Closing a card", step 3).
6. `check-ac-coverage.sh` exits 1 on every commit from `8236e58` (§10 set to ◐ with AC-10.4/10.5) until the red
   commit adds the two titles. Push the branch only after the red commit, or CI fails on the docs commits.
7. Optional, spec silent: the merged `error` drives `aria-invalid` too, so a `form` failure marks the box invalid
   although its content is valid. Not required by §10; changing it is a question for the analysis, not a guess.
8. `plan.md` is 56 lines against `planning.md`'s "≈ 40"; the overrun is table-row width, not scope (same as B1.4).

Rounds: 1
