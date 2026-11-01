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
   first.** Trigger: at 3ac4d76 the script prints `::error::§17 is cited but has no heading in spec/contracts/` and the
   same error for §18, exit 1. The cause is `backlog/work/B3.3/advice.md:164` ("`spec/technical-requirements.md` (§17/§18/§19
   rows)"). The `# §17` and `# §18` headings exist only on `feat/B3.1-overdue` and `feat/B3.2-title-counter`. At `main`
   (d53f4c7) the script reports OK. So either B3.3 merges after both sibling PRs, or the dev-lead rewords that line
   (for example "the B3.1/B3.2 index rows") in a `docs(backlog)` commit before the PR. The plan's Files and code are not affected.
   If the script is still red at diff review, it becomes a finding there.

Non-blocking: the plan is 62 lines, against `planning.md`'s "≈ 40 lines". Every approved plan in `backlog/work/`
runs 52–93 lines, so this follows the repo's practice. The two D-21 rows in the decisions log still need a new D-n from
the lead (round 1 note).

Verdict: approved (ready for the lead's plan gate. This does not approve the build.)
