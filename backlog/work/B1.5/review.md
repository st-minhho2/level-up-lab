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

## Plan review (round 2)

SCOPE: all

Reviewed: `backlog/work/B1.5/plan.md` at `9efec0b` (`Plan approved by: lead (session reply "approve"), 2026-10-29 ·
Rounds: 2`), approach B-2 of `advice.md`. Worktree clean, no `src/` change. Probes on a copy under the session
scratchpad (B-2 form, the §10 try/catch in `createTodoAction`, AC-10.5 written as §10's row says, and a probe-only
fault for titles starting `FAIL`), `next dev` on port 3790 with this worktree's schema; copy deleted afterwards.

| Check                                                                             | pass / fail: reason                                                                                                                                                                                                                                                                                                                                                              |
| --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| round 1 reason 1 (A dropped the native POST and §7's literal hook)                | resolved: the plan switches to B-2 and states why in one line. `useActionState(createTodoAction, null)` stays literal (§7). Probe: `curl /` renders `<form … action="" encType="multipart/form-data" method="POST">` with `$ACTION_REF_1`, `$ACTION_1:0`, `$ACTION_1:1`, `$ACTION_KEY`; a no-JS multipart POST with title `Probe native ok` stores and lists the todo (200).     |
| round 1 reason 2 (map row given to dev-lead)                                      | resolved: the F8 row is the code-writer's, in the green commit (Files line and step 3), whose hook allows `spec/features-map.md`; `check-feat-commits.sh` rejects only test files, so the row may ride in `feat(todos)` (B1.4 precedent).                                                                                                                                        |
| every file in the plan belongs to the section's features (map)                    | pass: unchanged from round 1; `todo-form.tsx` line now says "header comment names §10" (round 1 note 5a).                                                                                                                                                                                                                                                                        |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: no new import, no wrapper, no type import; `createTodoAction` signature unchanged. Probe: `tsc --noEmit` exit 0, `eslint` clean on `todo-form.tsx` with B-2 applied.                                                                                                                                                                                                       |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: B-2 is the advice's named fallback; the deviation from A is stated with its reason. One sentence of the rationale is wrong (note 1), it does not change the choice.                                                                                                                                                                                                        |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: unchanged (§10 has 5).                                                                                                                                                                                                                                                                                                                                                     |
| verification lists exact commands with expected numbers                           | pass: probe with B-2 and AC-10.5 only: `vitest run` → `Tests 68 passed (68)` (67 + 1; the two action tests make 70); AC-10.5 fails on today's `todo-form.tsx` (`1 failed \| 3 passed`); `playwright test` (Chromium) → the 12 existing tests passed, AC-5.6 included. Mutants: `kept = ''` and alert reading `title` only fail AC-10.5; `kept = draft` fails AC-5.2 and AC-10.5. |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: no skeleton (justified), map folded into green by the code-writer, subjects unchanged from round 1.                                                                                                                                                                                                                                                                        |
| the section's `Lead approves spec` box is ticked by a human (never by you)        | pass: `spec/contracts/08-mutation-feedback.md:6` `- [x] Lead approves spec (lead, 2026-10-29, plan gate of B1.5)`, unchanged.                                                                                                                                                                                                                                                    |
| no settled D-n contradicted                                                       | pass: unchanged from round 1 (D-5, D-7, D-11).                                                                                                                                                                                                                                                                                                                                   |

Verdict: approved

Notes (none blocking):

1. **Correction to the plan, and to round 1 reason 1.** "B-2's commit-order dependency is pinned by react/react-dom
   19.1.0 exact and caught by AC-10.5" holds for `vitest` only (`react-dom` 19.1.0 in jsdom). The browser runs Next's
   vendored React, `19.2.0-canary-0bdb9206-20250818` in `node_modules/next/dist/compiled/react-dom`, pinned by
   `"next": "15.5.28"` (exact, `package.json:34`); AC-10.5 does not exercise it and no e2e can (§10 has no fault hook).
   Probed in Chromium on that runtime with a probe-only fault: failure keeps `FAIL Buy milk`, 1 alert, "Add" enabled,
   0 rows stored; edit and fail again keeps the new text; the next success lists the todo, 0 alerts, box `''`; a
   failure on the first submit after load keeps the title. So B-2 is correct on both runtimes today; a `next` upgrade
   (a dependency change, needs approval) must re-check the order by hand. dev-lead: carry the corrected sentence
   into the PR body's Plan section.
2. No-JS path, spec silent: after a failed native POST the server renders the alert but the box is empty (`value=""`,
   `draft` is `''` on the server). Better than A (nothing submitted); if the lead wants REQ-10.6 to hold without JS,
   that is an analysis question, not this card.
3. For the test-writer: the mutant "keep the draft after any `ok: false`" survives every planned test; correct, the
   box after a `title` error is out of scope (§10). With `user-event`, do not type again after a form reset without
   `clear()` first (advice: `onetwo`); AC-10.5 as §10 words it does not type twice, so it is unaffected.
4. `docs/metrics.md` names no role; dev-lead's hook allows it. `plan.md` is 59 lines (≈ 40; table width, as round 1).

Rounds: 2

## Diff review (pass 1)

SCOPE: all

Reviewed: `origin/main..HEAD` (red `311c8ef` → green `73db034`, no skeleton) against §10 (REQ-10.1, REQ-10.5,
REQ-10.6, AC-10.4, AC-10.5, Function contracts), §5, §7, D-5, D-7, D-11, `plan.md` (round 2, approach B-2,
approved 2026-10-29), `advice.md`, plan reviews rounds 1–2, every changed file in full. Run in this worktree on
2026-10-29 (compose PostgreSQL on 5433, worktree schema). Probes on a copy under the session scratchpad (`rsync`
without `node_modules`/`.git`/`.env`, `node_modules` symlinked, own dev server on port 3791 with a probe-only fault in
the copy's `createTodo`: a title starting `FAIL` throws, a title containing `SLOW` waits 2.5 s); the copy, its server
and the scripts are deleted. The probe left 2 rows (`Probe ok one`, `Probe ok two`) in the worktree schema; every e2e
`beforeEach` deletes them.

### Command results (last line of each)

| Command                             | Last line                                                                                                 |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                         | `All matched files use Prettier code style!`                                                              |
| `pnpm typecheck`                    | `tsc --noEmit` (no output, exit 0)                                                                        |
| `pnpm test`                         | `Tests  70 passed (70)` (10 files)                                                                        |
| `pnpm test:e2e`                     | `12 passed (14.1s)`                                                                                       |
| `pnpm test:mutation`                | `Final mutation score of 82.98 is greater than or equal to break threshold 70` (actions 88.46, lib 80.88) |
| `scripts/ci/check-suppressions.sh`  | `OK: no new suppressions`                                                                                 |
| `scripts/ci/check-config-change.sh` | `OK: no protected config changed`                                                                         |
| `scripts/ci/check-feat-commits.sh`  | `OK: no feat commit touches tests`                                                                        |
| `scripts/ci/check-ac-coverage.sh`   | `OK: every criterion of a shipped section has a test` (`§10 criteria=5 covered=5`)                        |
| `scripts/ci/check-spec-sections.sh` | `OK: sections cited: 1 2 3 4 5 6 7 8 9 10`                                                                |
| `scripts/ci/check-features-map.sh`  | `OK`                                                                                                      |
| `scripts/ci/check-backlog.sh`       | `OK: README matches the cards`                                                                            |
| `scripts/verify-red.sh B1.5`        | `RESULT: red for the right reason` (todo-form 1 new / 1 failed, actions 2 new / 2 failed, 0 new passed)   |
| `git diff --stat origin/main..HEAD` | `15 files changed, 726 insertions(+), 56 deletions(-)`                                                    |

Tooling note: the first `pnpm test:mutation` ran while `pnpm test:e2e`'s dev server was rewriting `.next/types` and
died in the TypeScript checker (`TS6053 … .next/types/app/layout.ts not found`); rerun alone, clean. Do not run the
two concurrently in one worktree.

### Checklist

| Check                                                | Result                                                                                                                                                                                                                                                                                                                                                                                        |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every AC-§.n has a test whose assertion matches Then | pass: AC-10.4 `todos.test.ts:65`, title identical to the card's `Test:` line; `.resolves.toEqual` the exact object, `revalidatePath` 0, `createTodo` 1 with `'Buy milk'`, then the `title` error and still 1 call. AC-10.5 `todo-form.test.tsx:67`: alerts inside the `<form>` equal `['Could not save, try again']` (count and text), box `Buy milk`, "Add" enabled; then 0 alerts and `''`. |
| no test weakened after the red commit                | pass: `git diff 311c8ef..HEAD -- '*.test.*' e2e/` is empty; the red commit only adds tests (3 new, 0 existing lines changed except one import).                                                                                                                                                                                                                                               |
| every changed file is in `plan.md`                   | pass: `73db034` touches exactly the plan's 5 non-test files; `311c8ef` the 2 test files. Everything else on the branch is pre-plan `docs(spec)`/`docs(backlog)`. `spec/technical-requirements.md` §10 ◐ stays for the closing commit, as planned.                                                                                                                                             |
| interfaces match the section's contracts             | pass: `createTodoAction(previous, formData)` unchanged; Zod above the `try`, `createTodo` + `revalidatePath('/')` + success inside, bindingless `catch` → `failure('form', MUTATION_FAILED_MESSAGE)`, no `TodoNotFoundError` arm, no rethrow. `TodoForm(): ReactNode`, `useActionState(createTodoAction, null)` literal (§7), single `<p id="new-todo-error" role="alert">`, `title ?? form`. |
| Zod at every action boundary                         | pass (unchanged parse).                                                                                                                                                                                                                                                                                                                                                                       |
| Prisma only in `src/lib`; no raw SQL                 | pass: no `src/lib` or `prisma/` change.                                                                                                                                                                                                                                                                                                                                                       |
| migration reversible and indexed                     | n/a.                                                                                                                                                                                                                                                                                                                                                                                          |
| no secret, no suppression, no `console`              | pass: check-suppressions OK; nothing logged (D-11).                                                                                                                                                                                                                                                                                                                                           |
| features map row moved                               | pass: F8 gains `src/components/todo-form.tsx` and `src/components/todo-form.test.tsx`; `check-features-map.sh` OK. `docs/metrics.md` B1.5 row `82.98 (actions 88.5, lib 80.9)` matches this run.                                                                                                                                                                                              |
| no settled D-n contradicted                          | pass: D-5 (`maxLength={200}`, trimmed by the action), D-7 (both boxes ticked by the lead), D-11 (`form` key, no revalidation, no log).                                                                                                                                                                                                                                                        |
| would any test fail if one line were reverted?       | pass for every behavioral line, 9 probes (table below); 2 survivors are structural or out of scope.                                                                                                                                                                                                                                                                                           |

Probes (copy; one edit each; `vitest run` on the two test files):

| P   | Edit                                           | Fails                                                                          |
| --- | ---------------------------------------------- | ------------------------------------------------------------------------------ |
| 1   | action: try/catch removed                      | AC-10.4 and the `revalidatePath`-throws test                                   |
| 2   | action: `revalidatePath` moved after the `try` | the `revalidatePath`-throws test (`todos.test.ts:85`)                          |
| 3   | action: Zod parse moved inside the `try`       | none (22 passed): not observable, `safeParse` never throws; structure only     |
| 4   | form: alert reads `title` only                 | AC-10.5                                                                        |
| 5   | form: `kept` always `''`                       | AC-10.5                                                                        |
| 6   | form: `kept = draft` always                    | AC-10.5 and AC-5.2                                                             |
| 7   | form: keep the draft after any `ok: false`     | none: the box after a `title` error is §10 Out of scope (plan review 2 note 3) |
| 8   | form: `onChange` no longer writes `draft`      | AC-10.5                                                                        |
| 9   | form: `defaultValue={kept}` removed            | AC-10.5                                                                        |

Stryker: 0 survivors on `todos.ts` 26–33 (the card's lines). Survivors on the file are `22:54` (`typeof rawTitle ===
'string'` → `true`), `22:96` (no coverage, `''` fallback) and `43:20` (toggle's `'/'`), all pre-existing.

Real browser (Chromium on Next's vendored React, copy, probe-only fault), REQ-10.6 / AC-10.5 and the B-2 edge cases:

| Scenario                                                        | Box after               | Alerts in form                 | "Add"   | Rows      |
| --------------------------------------------------------------- | ----------------------- | ------------------------------ | ------- | --------- |
| first submit after load fails (`FAIL Buy milk`, click)          | `FAIL Buy milk`         | 1, `Could not save, try again` | enabled | unchanged |
| fail → edit (`… 2`) → fail (Enter)                              | `FAIL Buy milk 2`       | 1                              | enabled | unchanged |
| fail → clear, `   ` → title error                               | `''` (§5, out of scope) | 1, `Title is required`         | enabled | unchanged |
| title error → `FAIL x` fails → edit to `Probe ok one` succeeds  | `FAIL x`, then `''`     | 1 (replaced), then 0           | enabled | +1        |
| after that success, type `FAIL y` → fail (stale draft?)         | `FAIL y`                | 1                              | enabled | unchanged |
| `FAIL SLOW` pending (button disabled), type ` more`, then fails | `FAIL SLOW more`        | 1                              | enabled | unchanged |
| title typed **before hydration**, "Add" clicked after, fails    | `''`                    | 1                              | enabled | unchanged |
| after a success, value set without an `input` event, fails      | previous title (stale)  | 1                              | enabled | unchanged |

Every scenario a person reaches by typing after hydration holds. The last two rows are finding 1.

### Findings

```
[1] KIND: spec-mismatch
    WHERE: src/components/todo-form.tsx:13 (kept = … ? draft : ''), :28 (draft written only by onChange)
    DEFECT: the box is reset to `draft`, a copy kept by onChange, not to the title that was submitted, so text that
            reached the box without a React onChange is dropped (or replaced by an older title) after a `form` failure.
    TRIGGER: real Chromium, Next's vendored React, copy with createTodo throwing for titles starting `FAIL`, JS chunks
            delayed 4 s (Playwright route): keystrokes `FAIL typed before hydration` land before hydration
            (`hydrated: false`, value present); after hydration click "Add" → `{ value: '', alerts: ['Could not save,
            try again'] }`. Control, same flow typed after hydration → value kept. Second trigger, Browser pane: create
            `Probe ok two` (success), then the box gets `FAIL z` without an `input` event (as an extension or a
            password manager may set it), click "Add" → box shows `Probe ok two`, a title already saved; clicking
            "Add" again stores a duplicate (D-5 allows it). Mechanism read in Next's vendored react-dom
            (`initInput(…, isHydrating = true)` keeps the DOM value and queues no change event).
    WRONG BEHAVIOUR: REQ-10.6 "keep the typed title in the box": the box is empty (or shows a different, already
            saved title) instead of the title the person typed and submitted. AC-10.5 cannot see it (jsdom, client
            render, user-event keystrokes after mount).
    CONFIDENCE: confirmed (both triggers run; jsdom reproduces the first: server-render `<TodoForm />`, set the
            input's value without an event, `render(…, { container, hydrate: true })`, failing action, click "Add"
            → `toHaveValue('Buy milk')` fails with `''` on this branch).
```

For the test-writer / code-writer (not prescriptive): the hydration recipe above is red on `73db034`. One candidate,
probed: capture the submitted title in the form's `onSubmit` (`new FormData(event.currentTarget).get('title')` →
`setDraft`), keeping `action={formAction}` (no wrapper, native POST before hydration unchanged). With it the
pre-hydration trigger keeps `FAIL typed before hydration` in Chromium and the component suite is 20/20 green (AC-5.2,
AC-5.3, AC-5.7, AC-10.5, the hydration probe, todo-item, clear-completed-button). The new test has no AC id of its own
(REQ-10.6; no criterion types before hydration), titled like the `revalidatePath` test.

### Notes (not findings)

1. P3: AC-10.4's blank-title half does not pin "Zod outside the `try`" (advice said it would); moving the parse
   inside changes no observable result. The code is as §10 says; nothing to do.
2. Closing commit (dev-lead): `spec/technical-requirements.md` §10 ◐ → ✅; the top table of `docs/metrics.md`. B1.5
   used a second plan round (round 1 approach A, plan review asked to change the approach), so "Cards completed
   without a second plan round" becomes 3/4 (75 %, target ≥ 90 %) and "PRs needing a second design round" counts
   1; the metrics file's own rule opens a `docs/mistake-log.md` row if that stays below target at the next card.
3. Plan review round 2 note 1 still stands for the PR body: AC-10.5 runs on `react-dom` 19.1.0 in jsdom, the browser
   on Next's vendored 19.2 canary; the B-2 ordering held in Chromium again today (table above).

Verdict: back to test-writer (finding 1: a failing test for REQ-10.6 first, then code-writer)

Riskiest unfalsified: B-2's commit order (the `defaultValue` update lands before React's post-action form reset) is
verified only by hand in Chromium (plan review round 2 and this pass); no automated test runs `TodoForm`'s failure
path on Next's vendored React, so a `next` upgrade could empty the box after a failure while AC-10.5 (jsdom,
`react-dom` 19.1.0) stays green.

Rounds: 1

## Dispositions (dev-lead, passes 1–2 of 3)

| Pass | #   | Finding (file:line)                                                                | Source                          | Kind          | Disposition      | Justification                                                                                                                                     |
| ---- | --- | ---------------------------------------------------------------------------------- | ------------------------------- | ------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | 1   | `todo-form.tsx:13`, `:28` box reset to the onChange draft, not the submitted title | reviewer                        | spec-mismatch | fix now          | test `bbdf7cb` (red on the box value), fix `933962a`: draft read from the submitted FormData in `onSubmit`; 71 unit, 12 e2e                       |
| 1    | —   | B-2 commit order verified by hand only on Next's vendored React                    | reviewer (riskiest unfalsified) | coverage      | out of scope     | needs a fault-injection hook for an e2e (config change, ask first); carried into the PR body as a known risk of a `next` upgrade                  |
| 1    | —   | §10 index ◐ → ✅; metrics top table (second plan round)                            | reviewer note 2                 | docs          | no change needed | closing commit after merge, per plan                                                                                                              |
| 2    | 1   | `todo-form.tsx:19-22` draft taken at submit; text typed while pending is discarded | reviewer                        | correctness   | fix now          | test `3fc71da` (red: box kept `Buy milk`, not `Buy milk now`), fix `0e3d738`: `onChange` restored next to the `onSubmit` capture; 72 unit, 12 e2e |

## Diff review (pass 2)

SCOPE: ui

Reviewed: `git diff 73db034..HEAD` (`bbdf7cb` test, `933962a` fix, `3f80972` docs) against pass 1 finding 1, §10
(REQ-10.5, REQ-10.6, AC-10.5, Intent "What they typed is still in the box"), §7 (`useActionState(createTodoAction)`),
`plan.md` (round 2, B-2) and the dispositions. Run in this worktree on 2026-10-29, the gates one after another (e2e
finished before Stryker started). Probes on a copy under the session scratchpad (`rsync` without `node_modules`,
`.git`, `.env`; `node_modules` symlinked; probe-only fault in the copy's `createTodo`: a title starting `FAIL` throws,
one containing `SLOW` waits 2.5 s), own `next dev` on port 3792 with this worktree's schema. The copy, the scripts and
the 8 probe rows are deleted.

### Command results (last line of each)

| Command                             | Last line                                                                                                     |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                         | `All matched files use Prettier code style!`                                                                  |
| `pnpm typecheck`                    | `tsc --noEmit` (no output, exit 0)                                                                            |
| `pnpm test`                         | `Tests  71 passed (71)`                                                                                       |
| `pnpm test:e2e`                     | `12 passed (13.8s)`                                                                                           |
| `pnpm test:mutation`                | `Final mutation score of 82.98 is greater than or equal to break threshold 70` (`src/actions/todos.ts` 88.46) |
| `scripts/ci/check-suppressions.sh`  | `OK: no new suppressions`                                                                                     |
| `scripts/ci/check-config-change.sh` | `OK: no protected config changed`                                                                             |
| `scripts/ci/check-feat-commits.sh`  | `OK: no feat commit touches tests`                                                                            |
| `scripts/ci/check-ac-coverage.sh`   | `OK: every criterion of a shipped section has a test` (`§10 criteria=5 covered=5`)                            |
| `scripts/ci/check-spec-sections.sh` | `OK: sections cited: 1 2 3 4 5 6 7 8 9 10`                                                                    |
| `scripts/ci/check-features-map.sh`  | `OK`                                                                                                          |
| `scripts/ci/check-backlog.sh`       | `OK: README matches the cards`                                                                                |
| `scripts/verify-red.sh B1.5`        | `RESULT: red for the right reason` (unchanged: judges `311c8ef` only)                                         |
| `git diff --stat origin/main..HEAD` | `15 files changed, 896 insertions(+), 57 deletions(-)`                                                        |

Mutation is unchanged from pass 1 (82.98; no `src/lib` or `src/actions` change since).

### Pass 1 finding 1: resolved

Both triggers now keep the title (Chromium, Next's vendored React, copy with the fault):

| Scenario                                                                | Box after                     | Alerts in form | "Add"   | Rows      |
| ----------------------------------------------------------------------- | ----------------------------- | -------------- | ------- | --------- |
| typed **before hydration** (JS chunks delayed 4 s), "Add" clicked after | `FAIL typed before hydration` | 1              | enabled | unchanged |
| then `Probe2 ok A` succeeds                                             | `''`                          | 0              | enabled | +1        |
| after a success, `FAIL z` set without an `input` event, "Add"           | `FAIL z` (was the old title)  | 1              | enabled | unchanged |
| fail (Enter), edit, fail (Enter), then succeed                          | kept, kept edited, `''`       | 1, 1, 0        | enabled | +1        |
| `   ` → title error, then `FAIL …` → form failure, then "Add" unchanged | `''`, kept, kept              | 1 each         | enabled | unchanged |

The new test is meaningful: with `73db034`'s `todo-form.tsx` on the copy it fails on the box value (`Received: ''`),
alone (`1 failed | 4 passed`).

### onSubmit against the native POST and the enhancement

- Server render unchanged: `curl /` → `<form class="flex flex-col gap-2" action="" encType="multipart/form-data"
method="POST">` with `$ACTION_REF_1`, `$ACTION_1:0`, `$ACTION_1:1`, `$ACTION_KEY`; no `onsubmit` attribute
  (React handlers are not serialized).
- No JavaScript (Chromium, `javaScriptEnabled: false`): a valid title is stored and listed; a `FAIL` title shows the
  alert, box `''` (plan review round 2 note 2, unchanged).
- Submit **before** hydration with JavaScript on (chunks delayed 6 s, Enter): the form posts natively (navigation),
  the alert shows, box `''`. Same path as no-JS; `onSubmit` cannot run there, and `73db034` behaved the same. Not
  introduced by this diff; it is round 2 note 2's open question.
- The handler does not call `preventDefault`, so React's `FormActionEventPlugin` still takes the action path
  (`react-dom-client.development.js` `extractEvents$1`: a prevented submit runs `startHostTransition` with a `null`
  action). Probe: adding `event.preventDefault()` fails AC-5.2, AC-5.3 and both AC-10.5 tests, so the suite guards it.

### Checklist

| Check                                                  | Result                                                                                                                                                                                           |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| every AC-§.n has a test whose assertion matches Then   | pass: unchanged; AC-10.5 `todo-form.test.tsx:67` still covers the full Then (alert, `Buy milk`, enabled, recovery to 0 / `''`).                                                                  |
| no test weakened after the red commit                  | pass: `git diff 311c8ef..HEAD -- '*.test.*' e2e/` is one added test (+21), in `bbdf7cb` (`test(todos): B1.5 review pass 1 -- …`, body "Red because …"); no existing line changed.                |
| every changed file is in `plan.md`                     | pass: `todo-form.tsx` and its test are planned files. The plan's Interfaces line `// written by the input's onChange` is stale since `933962a` (note 2).                                         |
| interfaces match the section's contracts               | pass: `TodoForm(): ReactNode`, `useActionState(createTodoAction, null)` literal (§7), one `<p id="new-todo-error" role="alert">`, `title ?? form`.                                               |
| Zod / Prisma / raw SQL / migration                     | n/a: no `src/actions`, `src/lib` or `prisma/` change since pass 1.                                                                                                                               |
| no secret, no suppression                              | pass.                                                                                                                                                                                            |
| features map row moved                                 | pass: unchanged since pass 1, `check-features-map.sh` OK.                                                                                                                                        |
| would any test fail if one changed line were reverted? | pass for the changed lines: `setDraft('')` in `onSubmit` fails both AC-10.5 tests; `kept` always `''` fails both; the `73db034` form fails the new test; `preventDefault()` added fails 4 tests. |

### Findings

```
[1] KIND: correctness
    WHERE: src/components/todo-form.tsx:19-22 (onSubmit is now the only writer of `draft`; the input's onChange was removed)
    DEFECT: `draft` is frozen at submit time, so text the person types into the still-enabled box while the save is
            pending is overwritten by React's post-action reset after a `form` failure.
    TRIGGER: real Chromium, copy with the fault: fill `FAIL SLOW`, click "Add", while "Add" is disabled type ` more`
            (box reads `FAIL SLOW more`), the save fails → box `FAIL SLOW`, 1 alert. Same flow on `73db034`'s form
            → `FAIL SLOW more` (pass 1's table row "`FAIL SLOW` pending … `FAIL SLOW more`" held then). jsdom
            reproduces it with react-dom 19.1.0: `createTodoAction` returns a promise settled by hand; `user.type`
            `Buy milk`, click "Add", wait for "Add" disabled, `user.type` ` and eggs`, settle `{ ok: false,
            fieldErrors: { form: ['Could not save, try again'] } }` → `toHaveValue('Buy milk and eggs')` fails with
            `Buy milk` on HEAD, passes on `73db034`.
    WRONG BEHAVIOUR: §10 Intent "What they typed is still in the box" and REQ-10.6 "keep the typed title in the box":
            the characters typed during the pending save are deleted. A regression introduced by `933962a`; pass 1's
            suggested candidate (onSubmit alone) had the same gap and its probes did not type while pending.
    CONFIDENCE: confirmed (both runtimes run, HEAD and 73db034 compared)
```

For the test-writer / code-writer (not prescriptive): the jsdom recipe above is red on HEAD and green on `73db034`.
Candidate, probed: keep the `onSubmit` capture **and** restore the input's `onChange={(event) => setDraft(…)}`
(submit seeds the draft for text that never fired a change event; later keystrokes, pending ones included, update
it). With it: component suite 21/21 (the 20 existing plus the recipe); Chromium: pending edit kept (`FAIL SLOW
more`), typed before hydration kept, value set without an event kept, title error then failure kept, success → `''`,
no-JS POST stores. The narrow residue (text set without an event while pending) is not reachable by typing.

### Notes (not findings)

1. The new test is titled `AC-10.5:` although pass 1 suggested no prefix: its Given (a value set without a change
   event, no recovery half) is not AC-10.5's ("the person types `Buy milk`"). `check-ac-coverage.sh` is indifferent;
   the precedent kept such a test unprefixed (plan review round 1 note 2). Lead's call; not blocking.
2. `plan.md` Interfaces reads `useState('') // written by the input's onChange`; after `933962a` it is written by
   `onSubmit`, after the candidate fix by both. dev-lead: carry the final wording into the PR body's Plan section.
3. Pass 1 notes 2 and 3 and the riskiest-unfalsified line still stand (closing commit; B-2's order on Next's vendored
   React, re-confirmed by hand today in every row above).

Verdict: back to test-writer (finding 1: a failing test for the edit-while-pending case first, then code-writer)

Riskiest unfalsified: B-2's commit order on Next's vendored React (`defaultValue` committed before the post-action
form reset) is still checked only by hand in Chromium; a `next` upgrade could empty the box after a failure while
the jsdom suite (react-dom 19.1.0) stays green.

Rounds: 2

## Diff review (pass 3)

SCOPE: ui

Reviewed: `git diff 3f80972..0e3d738 -- src` (`3fc71da` test, `0e3d738` fix) against pass 2 finding 1, pass 1
finding 1, §10 (Intent, REQ-10.5, REQ-10.6, AC-10.5), §7 (`useActionState(createTodoAction)`), `plan.md` (round 2,
B-2) and the dispositions; then a final full read of `git diff origin/main..HEAD` at `31442d7`. Run in this worktree
on 2026-10-29, the gates one after another (e2e finished before Stryker started; the probe server started after
Stryker finished). Probes on a copy under the session scratchpad (`rsync` without `node_modules`, `.git`, `.env`,
`.next`; `node_modules` symlinked; probe-only fault in the copy's `createTodo`: a title starting `FAIL` throws, one
containing `SLOW` waits 2.5 s), own `next dev` on port 3793 with this worktree's schema. The copy, the scripts and the
2 probe rows are deleted; the worktree is clean.

### Command results (last line of each)

| Command                             | Last line                                                                                                     |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                         | `All matched files use Prettier code style!`                                                                  |
| `pnpm typecheck`                    | `tsc --noEmit` (no output, exit 0)                                                                            |
| `pnpm test`                         | `Tests  72 passed (72)` (10 files)                                                                            |
| `pnpm test:e2e`                     | `12 passed (19.7s)`                                                                                           |
| `pnpm test:mutation`                | `Final mutation score of 82.98 is greater than or equal to break threshold 70` (`src/actions/todos.ts` 88.46) |
| `scripts/ci/check-suppressions.sh`  | `OK: no new suppressions`                                                                                     |
| `scripts/ci/check-config-change.sh` | `OK: no protected config changed`                                                                             |
| `scripts/ci/check-feat-commits.sh`  | `OK: no feat commit touches tests`                                                                            |
| `scripts/ci/check-ac-coverage.sh`   | `OK: every criterion of a shipped section has a test`                                                         |
| `scripts/ci/check-spec-sections.sh` | `OK: sections cited: 1 2 3 4 5 6 7 8 9 10`                                                                    |
| `scripts/ci/check-features-map.sh`  | `OK`                                                                                                          |
| `scripts/ci/check-backlog.sh`       | `OK: README matches the cards`                                                                                |
| `scripts/verify-red.sh B1.5`        | `RESULT: red for the right reason` (judges `311c8ef`)                                                         |
| `git diff --stat origin/main..HEAD` | `15 files changed, 1048 insertions(+), 57 deletions(-)`                                                       |

Mutation rerun although no `src/lib` or `src/actions` line changed since pass 1: same score.

### Pass 2 finding 1: resolved

- jsdom (react-dom 19.1.0): the new test `keeps text typed while the save is pending …` (`todo-form.test.tsx:115`)
  fails with the input's `onChange` removed from HEAD's form and with `933962a`'s form (`1 failed | 8 passed`), passes
  on HEAD.
- Chromium (Next's vendored React): fill `FAIL SLOW`, click "Add", while "Add" is disabled type ` more` at the end →
  box `FAIL SLOW more` during the save and after the failure, 1 alert `Could not save, try again`, "Add" enabled.

### Pass 1 finding 1: still resolved

| Scenario (Chromium, copy with the fault)                                | Box after                     | Alerts in form | "Add"   | Rows      |
| ----------------------------------------------------------------------- | ----------------------------- | -------------- | ------- | --------- |
| typed **before hydration** (JS chunks delayed 4 s), "Add" clicked after | `FAIL typed before hydration` | 1              | enabled | unchanged |
| `Probe3 ok A` succeeds                                                  | `''`                          | 0              | enabled | +1        |
| after that success, `FAIL z` set without an `input` event, "Add"        | `FAIL z`                      | 1              | enabled | unchanged |
| `FAIL e1` (Enter) fails, type ` x`, Enter fails again                   | `FAIL e1`, then `FAIL e1 x`   | 1, 1           | enabled | unchanged |
| `   ` → title error, then `FAIL after title` → form failure             | `''` (§5), then kept          | 1 each         | enabled | unchanged |
| no JavaScript: `Probe3 nojs ok` posted natively, then `FAIL nojs`       | stored and listed; then `''`  | 0; then 1      | —       | +1; same  |

jsdom probes on the copy (3 extra tests, not committed): pass 1's hydration recipe (server-render, value set without
an event, `hydrate: true`, failing action) keeps `Buy milk`; typed before hydration plus more typed after keeps the
whole text; fail → succeed (`''`) → value set without an event → fail keeps the new text. Server render unchanged:
`curl /` → `<form … action="" encType="multipart/form-data" method="POST">` with `$ACTION_REF_1`, `$ACTION_1:0`,
`$ACTION_1:1`, `$ACTION_KEY`. The no-JS `form` failure leaving `''` is plan review round 2 note 2 (spec silent).

### Checklist

| Check                                                  | Result                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every AC-§.n has a test whose assertion matches Then   | pass: AC-10.4 `todos.test.ts:65`, title identical to the card's `Test:` line, exact object, `revalidatePath` 0, `createTodo` 1 with `Buy milk`, then the `title` error and still 1 call; AC-10.5 `todo-form.test.tsx:67` covers alert count and text inside the `<form>`, `Buy milk`, "Add" enabled, then 0 alerts and `''`.                                                 |
| no test weakened after the red commit                  | pass: `git diff 311c8ef..HEAD -- '*.test.*' e2e/` is two added tests (`bbdf7cb`, `3fc71da`, each `test(todos): B1.5 review pass N -- …` with "Red because …"); no existing line changed.                                                                                                                                                                                     |
| every changed file is in `plan.md`                     | pass: the `src/` files are the plan's `todos.ts`, `todo-form.tsx`, `CLAUDE.md` and the two test files; `spec/features-map.md` (F8 gains the form and its test) and `docs/metrics.md` (B1.5 row, `82.98 (actions 88.5, lib 80.9)`, matches this run) as planned; the rest is pre-plan `docs(spec)` / `docs(backlog)` and this file. §10 index ◐ stays for the closing commit. |
| interfaces match the section's contracts               | pass: `createTodoAction(previous, formData)` unchanged, Zod above the `try`, bindingless `catch` → `failure('form', MUTATION_FAILED_MESSAGE)`, no rethrow; `TodoForm(): ReactNode`, `useActionState(createTodoAction, null)` literal (§7), one `<p id="new-todo-error" role="alert">`, `title ?? form`.                                                                      |
| Zod / Prisma / raw SQL / migration                     | n/a since pass 1: no `src/lib`, `src/actions` or `prisma/` change.                                                                                                                                                                                                                                                                                                           |
| no secret, no suppression, no `console`                | pass.                                                                                                                                                                                                                                                                                                                                                                        |
| features map row moved                                 | pass: unchanged since pass 1, `check-features-map.sh` OK.                                                                                                                                                                                                                                                                                                                    |
| no settled D-n contradicted                            | pass: D-5, D-7, D-11 as in pass 1.                                                                                                                                                                                                                                                                                                                                           |
| would any test fail if one changed line were reverted? | pass: `onChange` removed fails the pending test; `onSubmit` removed fails the `AC-10.5` no-change-event test (and 2 probes); `event.preventDefault()` added fails 5 committed tests (AC-5.2, AC-5.3, both AC-10.5, the pending test).                                                                                                                                        |

### Findings

None.

### Notes (not findings)

1. Pass 2 note 1 stands: `todo-form.test.tsx:94` carries `AC-10.5:` although its Given (a value set without a change
   event, no recovery half) is not AC-10.5's; the pending test (`:115`) is correctly unprefixed. Lead's call.
2. `plan.md` Interfaces still reads `useState('') // written by the input's onChange`; the form now has two writers
   (`onSubmit` seeds it from the submitted form, `onChange` follows typing). dev-lead: carry that wording into the PR
   body's Plan section, with plan review round 2 note 1 (B-2's order on Next's vendored React).
3. Closing commit (pass 1 note 2): §10 ◐ → ✅ and the metrics top table (second plan round).
4. Residue named in pass 2, unchanged: text set without an event while the save is pending is not kept; not reachable
   by typing.

Verdict: ready for PR

Riskiest unfalsified: B-2's commit order on Next's vendored React (`defaultValue` committed before the post-action
form reset) is checked only by hand in Chromium (plan review round 2, passes 1–3); a `next` upgrade could empty the
box after a failure while the jsdom suite (react-dom 19.1.0) stays green.

Rounds: 3
