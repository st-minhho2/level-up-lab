# B3.3 review

SCOPE: all (plan names `src/lib`, `src/actions`, `src/components`, `e2e`)

## Plan review (round 1)

Plan at 4853e0c (`backlog/work/B3.3/plan.md`), against §19 (`spec/contracts/17-delete.md`), `advice.md`, `analysis.md`,
`backlog/00-decisions.md` (D-7, D-19, D-20, D-21 batch 3 at line 47). Read-only; baseline `pnpm test` run here:
`Tests  169 passed (169)`, which matches the plan's starting count.

| Check                                                                                  | Result                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                         | pass: `scripts/ci/plan-files.sh --any B3.3` prints the 10 Files rows, all §19 modules, their tests, `e2e/19-delete.spec.ts`, the `todo-item.tsx` mount D-21 assigns to B3.3, and the `logger.ts` member §19's contract names. F17 has no row in `spec/features-map.md` yet; the plan adds it ✗ in the skeleton and ✅ in `docs(map)`                                                                                                                                    |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib         | pass: the 4 signatures match §19's Function contracts word for word (`async` is the same return type); the mutation is in `src/actions/delete-todo.ts` (`'use server'`, Zod `toggleTodoSchema` outside the `try`, one lib call, `revalidatePath`, `ActionResult`); Prisma only in `src/lib/todo-delete.ts` through `@/lib/prisma`; no raw SQL. The inline `{ readonly todoId: string }` props type follows the repo's existing components (`CompleteAllButton`) and §19 |
| plan follows `advice.md`'s recommendation or states the deviation                      | pass: Approach A, with no deviation. Analysis Q1–Q8 taken as proposed                                                                                                                                                                                                                                                                                                                                                                                                   |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number              | pass: AC-19.1–AC-19.7 (7), every Then gives exact values, call counts, arguments or messages; no banned adjective                                                                                                                                                                                                                                                                                                                                                       |
| verification lists exact commands with expected numbers                                | pass, with one note: the commands are exact (`verify-red.sh B3.3` exit 0, `pnpm test` 169 → ≈ 180, `test:e2e` +1, mutation ≥ 70, `check-plan-scope.sh` OK). The per-file split is inconsistent: the Files row for `todo-item.test.tsx` says "new AC-19.5 (b) test" (1) and Verification says "`TodoItem` 2". The plan states that the red commit records the actual count, so this does not block                                                                       |
| work breakdown has skeleton → red → green → map → review with convention subjects      | pass: `chore(todos): B3.3 skeleton` → `test(todos): B3.3 … (red)` → `feat(todos): B3.3 …` → `docs(map): F17 … [B3.3]` → `docs(backlog): B3.3 review …`                                                                                                                                                                                                                                                                                                                  |
| the section has a `Lead approves spec` box, ticked only by a human (D-7), never by you | **fail**: see reason 1                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| no settled D-n contradicted                                                            | pass for the plan itself: none of `page.tsx`, `src/lib/todos.ts`, `src/actions/todos.ts`, `todo-due-date.tsx`, `todo-form.tsx` or `src/*/CLAUDE.md` is in Files (D-20/D-21); no path in Files matches `check-config-change.sh`'s `PROTECTED` pattern, so no `config-change-approved` is needed (D-19). The D-7 conflict is in the spec commit, covered by reason 1                                                                                                      |
| `scripts/next-task.sh --check B3.3` on the committed plan says no overlap              | pass: `[next-task] B3.3: no overlap with any Doing or Review card` (exit 0, run at 4853e0c)                                                                                                                                                                                                                                                                                                                                                                             |

### Costs the lead approves with this plan (none blocks; all are stated by the spec or the advice)

1. No confirmation and no undo: one click deletes the row permanently (REQ-19.5).
2. With JavaScript off, or before hydration, the button does nothing. It has an `onClick` and no `<form>` (advice, approach B rejected).
3. A delete that finds no todo leaves the stale row with "Todo not found" until the next refresh (REQ-19.8, Out of scope).
4. The row's checkbox and Edit/Save stay enabled while a delete is pending, and the delete button stays enabled while
   a toggle or save is pending. A toggle sent against a row being deleted can report "Todo not found" and then disappear (advice,
   §19 asks only that the delete button is disabled).
5. `src/lib/logger.ts` widens `MutationActionName`, but §11's contract block (`spec/contracts/09-logging.md:49-50`) still lists
   4 names. The drift was already there (§14 and §15 widened it the same way). It is not this card's to fix: §19 says "no other change to §11".
6. `todo-item.test.tsx` (an existing test file) changes in the red commit: one new `vi.hoisted` mock and new
   AC-19.5 (b) tests, no existing assertion touched. Without it, every test in the file fails on `server-only` after the feat.

### Reasons (changes requested)

1. **§19's `Lead approves spec` box was ticked by an agent, not by the lead.** `spec/contracts/17-delete.md:5` reads
   `- [x] Lead approves spec (lead, 2026-11-01, D-21; B3.3)`. It was already ticked in the commit that created the file,
   6ed4178 `docs(spec): §19 delete a todo` (`Co-Authored-By: Claude Sonnet 5.5`, the spec-analyst). No human step
   came between writing the section and ticking it. D-7 says "Spec approval is a human act: the lead ticks the
   section's box; the plan gate's 'approve' reply may tick it in the same step", and `spec/CLAUDE.md:9` repeats it.
   D-21 (line 47) removes only the _second plan_ approval. It delegates no spec approval, and the lead ruled it before §19's text
   existed. The sibling sections of the same batch have the box unticked: `feat/B3.1-overdue:spec/contracts/15-overdue.md:5` and
   `feat/B3.2-title-counter:spec/contracts/16-title-counter.md:5` both read `- [ ] Lead approves spec (lead, <date>)`.
   Side effect: `scripts/metrics/lead-time.sh` takes the oldest commit adding a `Lead approves spec (… B3.3)`
   line as an approval candidate, so this tick also records an agent commit as an approval timestamp.
   Fix: a `docs(spec): §19 …` commit that sets line 5 back to `- [ ] Lead approves spec (lead, <date>)`. The
   lead's "approve" at the plan gate then ticks spec and plan in one step (D-7), so this costs no extra
   approval round.

Non-blocking, for the lead: `backlog/00-decisions.md` has two rows numbered D-21 (line 41, the §16 length rule; line
47, batch 3), and `spec/contracts/14-search.md:5` and `17-delete.md:5` both cite "D-21" with different meanings. The log
is never rewritten, so only a new D-n from the lead can disambiguate (also raised in `advice.md`).

Verdict: changes requested

## Plan review (round 2)

Plan at 3ac4d76 (`backlog/work/B3.3/plan.md`), against §19 (`spec/contracts/17-delete.md` at 520d4d1), `advice.md`,
`analysis.md` and `backlog/00-decisions.md` (D-7, D-19, D-20, D-21 at line 47). Read-only. Baseline `pnpm test` was
re-run here: `Tests  169 passed (169)`, which matches the plan's starting count.

Round 1 fixes:

- Reason 1 is fixed. 520d4d1 changes only `spec/contracts/17-delete.md:5`, to `- [ ] Lead approves spec (lead, <date>)`.
  That matches the unticked boxes on the B3.1 and B3.2 branches. The lead's "approve" at the plan gate ticks it (D-7).
  The old agent tick stays in history (6ed4178). `scripts/metrics/lead-time.sh` takes the later of the oldest spec-tick
  commit and the latest `docs(backlog): B3.3 plan … approved` commit, so the lead's approval commit wins. This holds
  only if that commit uses the conventional subject.
- Non-blocking note: the counts are now aligned. Verification says ≈ 10 new tests (lib 2, action 5, button 2, `TodoItem` 1),
  and `pnpm test` goes from 169 to ≈ 179, which matches the Files row "new AC-19.5 (b) test". The action count of 5 against
  4 listed cases (AC-19.2, AC-19.3, AC-19.4 (a) (b)) is approximate ("≈"), and the plan has the red commit record the
  real count.

| Check                                                                                  | Result                                                                                                                                                                                                                                                                                                                                     |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| every file in the plan belongs to the section's features (map)                         | pass: `scripts/ci/plan-files.sh --any B3.3` prints the same 10 rows as round 1. All are §19 modules, their tests, `e2e/19-delete.spec.ts`, the `todo-item.tsx` mount that D-21 assigns to B3.3, and the `logger.ts` member that §19 names. F17 is added ✗ in the skeleton and set to ✅ in `docs(map)`. `check-features-map.sh` reports OK |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib         | pass: the plan has not changed since round 1. The 4 signatures match §19's Function contracts. The only mutation is in `src/actions/delete-todo.ts` (Zod `toggleTodoSchema` outside the `try`, one lib call, `revalidatePath('/')`, `ActionResult`). Prisma appears only in `src/lib/todo-delete.ts`, and there is no raw SQL              |
| plan follows `advice.md`'s recommendation or states the deviation                      | pass: Approach A, with no deviation. Analysis Q1–Q8 are taken as proposed                                                                                                                                                                                                                                                                  |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number              | pass: AC-19.1–AC-19.7 (7). Every Then states exact values, call counts, arguments or messages                                                                                                                                                                                                                                              |
| verification lists exact commands with expected numbers                                | pass: `verify-red.sh B3.3` exit 0 with ≈ 10 red. `test:e2e e2e/19-delete.spec.ts` gives 1 failed at red, then +1 green. `pnpm test` goes from 169 to ≈ 179. Mutation ≥ 70. `pnpm build`. `check-plan-scope.sh` OK. The counts are now consistent with Files                                                                                |
| work breakdown has skeleton → red → green → map → review with convention subjects      | pass: `chore(todos): B3.3 skeleton` → `test(todos): B3.3 … (red)` → `feat(todos): B3.3 …` → `docs(map): F17 … [B3.3]` → `docs(backlog): B3.3 review …`                                                                                                                                                                                     |
| the section has a `Lead approves spec` box, ticked only by a human (D-7), never by you | pass: `spec/contracts/17-delete.md:5` reads `- [ ] Lead approves spec (lead, <date>)` and is left for the lead's approve                                                                                                                                                                                                                   |
| no settled D-n contradicted                                                            | pass: Files contains none of `page.tsx`, `src/lib/todos.ts`, `src/actions/todos.ts`, `todo-due-date.tsx`, `todo-form.tsx` or `src/*/CLAUDE.md` (D-20/D-21). No path is CI-protected (D-19). The spec box is no longer pre-ticked (D-7)                                                                                                     |
| `scripts/next-task.sh --check B3.3` on the committed plan says no overlap              | pass: `[next-task] B3.3: no overlap with any Doing or Review card` (exit 0, run at 3ac4d76)                                                                                                                                                                                                                                                |

### Costs the lead approves with this plan (none blocks)

Costs 1–6 from round 1 still apply unchanged: no confirmation or undo; nothing happens without JavaScript or before
hydration; a stale row keeps "Todo not found"; the other row controls stay enabled during a delete; the §11 contract
block still lists 4 action names; `todo-item.test.tsx` changes in the red commit. There is one new cost:

7. **This branch fails `scripts/ci/check-spec-sections.sh` (`.github/workflows/ci.yml:134`) unless B3.1 and B3.2 merge
   first.** Trigger: at 3ac4d76 the script prints `::error::section 17 is cited but has no heading in spec/contracts/` and the
   same error for section 18, exit 1. The cause is `backlog/work/B3.3/advice.md:164` ("`spec/technical-requirements.md` (section 17, 18, §19
   rows)"). The `# section 17` and `# section 18` headings exist only on `feat/B3.1-overdue` and `feat/B3.2-title-counter`. At `main`
   (d53f4c7) the script reports OK. So either B3.3 merges after both sibling PRs, or the dev-lead rewords that line
   (for example "the B3.1/B3.2 index rows") in a `docs(backlog)` commit before the PR. The plan's Files and code are not affected.
   If the script is still red at diff review, it becomes a finding there.

Non-blocking: the plan is 62 lines, against `planning.md`'s "≈ 40 lines". Every approved plan in `backlog/work/`
runs 52–93 lines, so this follows the repo's practice. The two D-21 rows in the decisions log still need a new D-n from
the lead (round 1 note).

Verdict: approved (ready for the lead's plan gate. This does not approve the build.)

## Diff review (pass 1)

SCOPE: all (`src/lib`, `src/actions`, `src/components`, `e2e`)

Reviewed at 0333e43 against base d53f4c7 (merge-base with `main`; `main` is now a005b41, `git merge-tree` clean), §19
(`spec/contracts/17-delete.md`), `plan.md` (approved 2026-11-01). Commits: skeleton 44db343 → red 8293598 → feat
451418c → metrics 0333e43.

### Commands (run here, last line of each)

| Command                             | Result                                                                                                                                                 |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm lint`                         | `All matched files use Prettier code style!` (exit 0)                                                                                                  |
| `pnpm typecheck`                    | `tsc --noEmit` (exit 0)                                                                                                                                |
| `pnpm test`                         | `Tests  178 passed (178)` (27 files)                                                                                                                   |
| `pnpm test:e2e`                     | `33 passed (41.4s)`                                                                                                                                    |
| `pnpm test:mutation`                | `Final mutation score of 92.63 is greater than or equal to break threshold 70`; `todo-delete.ts` 100.00 (8 killed), `delete-todo.ts` 100.00 (8 killed) |
| `scripts/ci/check-suppressions.sh`  | `OK: no new suppressions`                                                                                                                              |
| `scripts/ci/check-config-change.sh` | `OK: no protected config changed`                                                                                                                      |
| `scripts/ci/check-feat-commits.sh`  | `OK: no feat commit touches tests`                                                                                                                     |
| `scripts/ci/check-ac-coverage.sh`   | `OK: every criterion of a shipped section has a test` (§19 still ✗ in the index, 7 criteria)                                                           |
| `scripts/ci/check-spec-sections.sh` | `OK: sections cited: 1 … 16 19` (plan-review cost 7 no longer reproduces)                                                                              |
| `scripts/ci/check-features-map.sh`  | `OK`                                                                                                                                                   |
| `scripts/ci/check-plan-scope.sh`    | `OK: feat/B3.3-delete stays inside the approved plan of B3.3`                                                                                          |
| `scripts/ci/check-backlog.sh`       | `OK: README matches the cards`                                                                                                                         |
| `scripts/verify-red.sh B3.3`        | `RESULT: red for the right reason` (lib 2/2, action 4/4, button 2/2, `TodoItem` 1 new of 11; e2e skipped)                                              |
| `git diff --stat main...HEAD`       | `20 files changed, 1149 insertions(+), 4 deletions(-)`                                                                                                 |

### Checklist

| Check                                                     | Result                                                                                                                                                                                                                                                                                                                                                                                                                    |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every AC-19.n has a test whose assertion matches its Then | pass: 19.1 `todo-delete.test.ts` (both results, `TodoNotFoundError.id`, exact `deleteMany` args ×2, 6 other methods at 0); 19.2–19.4 `delete-todo.test.ts` (exact results, call counts and args, log-before-resolve order); 19.5 (a) and 19.6 `delete-todo-button.test.tsx` (`confirm` spy 0 calls, disabled/enabled, alert parent and `nextElementSibling`); 19.5 (b) `todo-item.test.tsx`; 19.7 `e2e/19-delete.spec.ts` |
| no test weakened after the red commit                     | pass: `git log --first-parent --no-merges 8293598..HEAD -- '*.test.*' e2e/` empty; the `--merges --remerge-diff` form is empty (no merges)                                                                                                                                                                                                                                                                                |
| every changed file is in `plan.md`                        | pass: the 10 Files rows, plus paperwork (`features-map.md`, `metrics.md`). `check-plan-scope.sh` OK                                                                                                                                                                                                                                                                                                                       |
| interfaces match the section's contracts                  | pass: `deleteTodo(id: string): Promise<void>`, `deleteTodoAction(id: string): Promise<ActionResult<{ id: string }>>`, `DeleteTodoButton({ todoId }: { readonly todoId: string }): ReactNode`, `MutationActionName` + `'deleteTodoAction'` only                                                                                                                                                                            |
| Zod at every action boundary                              | pass: `toggleTodoSchema.safeParse({ id })` before the `try` in `src/actions/delete-todo.ts:13`; a non-string or empty id never reaches the lib                                                                                                                                                                                                                                                                            |
| Prisma only in `src/lib`, no raw SQL                      | pass: one `prisma.todo.deleteMany({ where: { id } })` in `src/lib/todo-delete.ts:8`; no `$queryRaw`/`$executeRaw`                                                                                                                                                                                                                                                                                                         |
| migration reversible and indexed                          | n/a: no `prisma/` change                                                                                                                                                                                                                                                                                                                                                                                                  |
| no secret, no suppression                                 | pass (`check-suppressions.sh` OK; diff read line by line)                                                                                                                                                                                                                                                                                                                                                                 |
| features map row moved                                    | pass: F17 ✅ (`spec/features-map.md`), in the feat commit 451418c, not in a separate `docs(map)` commit as the plan's step 4 says; the map's own header asks for the same commit, so not a finding                                                                                                                                                                                                                        |
| would a test fail if one changed line were reverted       | pass for behaviour, see probes; two placement lines are unguarded (below)                                                                                                                                                                                                                                                                                                                                                 |

### Probes (on a copy of the tree, nothing edited here)

1. `disabled={pending}` removed from `DeleteTodoButton` → AC-19.5 (a) fails (1 failed of 13).
2. Success no longer clears the message (`result.ok ? error : …`) → AC-19.6 fails.
3. `<DeleteTodoButton>` moved before the checkbox in `todo-item.tsx` (the lead's "checkbox stays the first control"
   constraint broken) → 38/38 component tests and 33/33 e2e still pass. No test guards the placement.
4. The `<span>` wrapper replaced by a fragment → 38/38 component tests still pass (inside the `<li>` the alert is still
   the button's next sibling, so REQ-19.10 holds either way; the wrapper is §19's contract shape, not observable).
5. Question 3 (is the new `todo-item.test.tsx` mock complete?): an `afterEach` asserting `deleteTodoAction` has 0 calls in
   every test except AC-19.5 (b) → 11/11 pass; inverted to `toBe(1)` → the 10 existing tests fail, so the hook ran. No
   existing test calls, or depends on, the delete mock; the mock exposes the module's only export.
6. Lib and action lines: Stryker killed all 16 mutants of `todo-delete.ts` and `delete-todo.ts` (0 survived, 0 no-coverage).

### Answers to the dev-lead's questions

1. Delete racing a toggle or save on the same row: accepted at the plan gate (plan-review cost 4) and outside §19
   ("deleting from two tabs at once" and optimistic UI are Out of scope; §19 only requires the delete button disabled).
   Traced: delete first → the toggle or save finds no row (`TodoNotFoundError` → "Todo not found", no log, no
   revalidate) and the row leaves on the delete's refresh; toggle first → it saves, then the delete removes the row.
   No path stores a wrong state or logs a failure. Not a finding.
2. Wrapper `<span>` and row text: the button has no text node (`aria-label` + `aria-hidden` SVG), and the alert renders
   only after a failed delete, so idle `<li>` text is unchanged: `e2e/05,06,10,13,14,15,16` `toHaveText([...])`
   checks pass (33/33), and no e2e button locator (`Add`, `Save`, `Edit title`, `Edit due date`, `Update due date`,
   `Search`, …) is a substring of "Delete todo". Layout: when the §10 row alert (`ml-auto`) shows, the delete button sits after it
   at the right edge; otherwise it follows the due-date control. §19 and §7 set no position, so not a finding.
3. See probe 5.

### Findings

None blocking.

Non-blocking, for the dev-lead:

- The checkbox-first placement that sibling B3.1 relies on is held only by the source comment (probe 3). A
  `test(todos): B3.3 review pass 1 -- …` hardening test (for example, the first focusable element of the `<li>` is the
  checkbox) would guard it; §19 does not require it, so not a finding.
- `backlog/plan/E3-todos-polish.md:32`'s `Test:` contract line names
  `AC-19.1: deletes the todo by id with one deleteMany, resolves undefined, and rejects with TodoNotFoundError when no row was deleted`;
  the committed title is `AC-19.1: resolves undefined for a deleted id, rejects TodoNotFoundError with id "missing" …`.
  No CI script reads that line; it can be aligned in the closing commit.

Verdict: ready for PR

Riskiest unfalsified: the `<DeleteTodoButton>` position in `src/components/todo-item.tsx:107` (last child, checkbox
first): moving it first keeps every unit, component and e2e test green, so a later edit or a B3.1 merge resolution
could break the lead's constraint without a red test.
