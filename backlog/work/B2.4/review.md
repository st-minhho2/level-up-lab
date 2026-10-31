# B2.4 review

## Plan review (round 1)

Reviewed at `dd1d6cf` (`plan.md` 82 lines, `advice.md`, `analysis.md`, `spec/contracts/13-due-date.md`), with the
sibling's plan read from `feat/B2.5-search` at `7939d8e` (`git show`, not changed). Run here:
`pnpm test` → `Tests  138 passed (138)` and `pnpm exec playwright test --list` → `Total: 24 tests in 8 files` (the
plan's baselines hold); `scripts/next-task.sh --check B2.4` → `[next-task] B2.4: no overlap with any Doing or Review card`;
`scripts/ci/check-spec-sections.sh` → `OK: sections cited: 1 … 15`; `check-features-map.sh` → `OK`;
`check-ac-coverage.sh` → `§15: ✗, no tests expected yet (7 criteria)` then `OK`; `check-backlog.sh` → `OK`;
`scripts/ci/plan-files.sh --any B2.4` → 16 paths, none matching `check-config-change.sh`'s protected pattern.

Probes on a copy (`git archive HEAD` under the session scratchpad, never the tree):

- `TodoDueDate` stub (button, transition, `setTodoDueDateAction` read only in a handler) wired into `TodoItem` before
  the error `<span>`: `vitest run src/components` → `Tests  28 passed (28)`; the existing `todo-item.test.tsx` hoisted
  mock without the new key stays green, `toHaveTextContent(/^Buy mik$/)` included.
- Mapper over the four existing functions with `dueDate: true` in `todoFields`: `stored?.toISOString().slice(0, 10)` →
  `src/lib/todos.test.ts` 10/10 green; `stored === null ? undefined : stored.toISOString()…` → 6 failed,
  `TypeError: Cannot read properties of undefined (reading 'toISOString')`. The plan's null-safe line is required.
- A schema annotated with §15's exact type (`z.ZodObject<{ id: z.ZodString; dueDate: z.ZodType<string | undefined, string> }>`,
  `z.string({ error })` → `refine` → `transform`) passes `tsc --noEmit`; all eleven AC-15.1 values, `0001-01-01`,
  `9999-12-31`, `1900-02-29`, `'2026-11-05 '` and a missing `dueDate` parse as §15 says. The signatures are buildable.
- Chromium (`@playwright/test`), `<input type="date" value="2026-11-05">`, one Backspace → `inputValue()` is `''`;
  typing `11` into an empty field → `''`; `fill('2026-02-30')` → `Error: Malformed value`. See cost 1.

| Check                                                                                  | Result                                                                                                                                                                                                                                                                                                                                                            |
| -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                         | pass: every `src/` and `e2e/` path is one §15's Function contracts name (`todo-due-date.ts`, `todos.ts`, `actions/todos.ts`, `todo-due-date.tsx`, `todo-item.tsx`, the logger union); the three guides are package docs; F13 lands `✗` in the skeleton, `✅` in `docs(map)`; `page.tsx`, `todo-schema.ts`, `todo-form.tsx`, `prisma/seed.ts` stay out, as advised |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib         | pass: signatures copy §15 (explicit return types, `readonly`, `undefined` in `Todo`, `Date \| null` only at the row); the one write is `prisma.todo.update` in `src/lib/todos.ts`; `todo-due-date.ts` is pure (no Prisma, no `server-only`); the action is Zod outside the `try` → one lib call → `revalidatePath('/')` → `ActionResult`                          |
| plan follows `advice.md`'s recommendation or states the deviation                      | pass: Approach A; Q4 null-safe `dueDateOf`, Q5 no §5 edit, Q9 F13 `✗` in the skeleton, seed unchanged. Small unstated drift: the advice puts the three guides in the last docs commit, the plan's step 3 in `feat(todos)` (harmless, `check-feat-commits.sh` rejects only tests)                                                                                  |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number              | pass: 7 criteria (AC-15.1 to AC-15.7), each Then an exact parse result, call argument, `Date`, call count, text, alert count or row order; no banned adjective                                                                                                                                                                                                    |
| verification lists exact commands with expected numbers                                | fail: commands are exact, numbers are not; `pnpm test` "138 + new", e2e "24 + `e2e/15-due-date.spec.ts`", `verify-red.sh` "exit 0" with no count of new red tests, and no red proof for the e2e file, which `verify-red.sh` skips (reason 2)                                                                                                                      |
| work breakdown has skeleton → red → green → map → review with convention subjects      | pass: `chore(todos): B2.4 skeleton` (schema + migration folded in, as `add-migration` step 7 allows) → `test(todos): B2.4 … (red)` → `feat(todos): B2.4 …` → `docs(map): F13 … [B2.4]` → `docs(backlog): B2.4 review …`; the skeleton leaves `TodoItem` unwired, so the red e2e fails on a missing "Edit due date" button, not on an import                       |
| the section has a `Lead approves spec` box, ticked only by a human (D-7), never by you | pass: `spec/contracts/13-due-date.md:5` `- [ ] Lead approves spec (lead, <date>)`, unticked; `plan.md:6-7` routes it through the gate's `approve`                                                                                                                                                                                                                 |
| no settled D-n contradicted                                                            | pass: D-20 (section 15, `13-due-date.md`, migration, ordering stays creation time; this card holds `todos.ts` and `actions/todos.ts`), D-11 / D-12 (form message, one §11 entry, no `console`), D-5 untouched, D-19 (no protected path, so no label), D-7 (box left to the lead)                                                                                  |
| `scripts/next-task.sh --check B2.4` on the committed plan says no overlap              | pass: `[next-task] B2.4: no overlap with any Doing or Review card` (B2.5's Files at `7939d8e` are its four search modules and tests only)                                                                                                                                                                                                                         |

Verdict: changes requested

1. **The plan's reason for leaving `page.tsx` out does not hold under the guard.** `plan.md:3-5` says "`src/app/page.tsx`
   is **not touched** …, so B2.5 may take the page at once". B2.4's Files hold `src/lib/CLAUDE.md` and
   `src/components/CLAUDE.md` (`plan.md:27,29`), and `scripts/next-task.sh:116` exempts only `backlog/*`, `spec/*`,
   `docs/metrics.md`, `docs/mistake-log.md`, so the guides are not paperwork. B2.5's plan (`feat/B2.5-search:backlog/work/B2.5/plan.md`)
   says its round-2 amendment adds "`src/app/page.tsx` mount, `e2e/16-search.spec.ts`, `src/lib/CLAUDE.md`,
   `src/components/CLAUDE.md` rows" and starts early "only if … `--check` is clean". Trigger: B2.4 approved and in Doing,
   B2.5 commits that amendment and runs `scripts/next-task.sh --check B2.5` → the literal match at `next-task.sh:131`
   prints "`src/lib/CLAUDE.md` also planned by B2.4" and the same for `src/components/CLAUDE.md`, exit 1; B2.5 waits for
   B2.4's merge, which is the serialization the lead would approve this plan to avoid. Fix (pick one, then say it in
   the plan so the lead approves the true cost): (a) keep both guide rows and rewrite the sentence to "B2.5 may mount
   `page.tsx` before B2.4 merges only if its amendment leaves `src/lib/CLAUDE.md` and `src/components/CLAUDE.md` out
   (those two rows follow after B2.4 merges)", and have dev-lead tell the B2.5 session; or (b) drop B2.4's two guide
   rows and land them after B2.5's phase B, accepting guides one card behind the code.
2. **Verification has no expected totals.** `planning.md` asks for "`pnpm test` → N tests green"; B2.3's accepted plan
   gave `115 + 2 + 3 + 3 = 123`. Here: `plan.md:68-69` gives "138 + new AC-15.1–15.6 tests" and "24 + `e2e/15-due-date.spec.ts`",
   and `verify-red.sh B2.4` "exit 0" without the number of new red tests. `scripts/verify-red.sh:10` lists e2e files as
   "skipped, needs a server", so AC-15.7's red has no proof at all in this plan. Trigger: a red commit with the e2e file
   passing (for example asserting only that the list reads `[C, B, A]`) passes every line of this verification. Fix:
   name the count per file (`todo-due-date.test.ts` n, `todo-due-date-store.test.ts` n, action `describe` n, component
   n, e2e n) and the totals `138 → N` and `24 → M`, and add `pnpm test:e2e e2e/15-due-date.spec.ts` → `M - 24 failed`
   at the red commit, recorded in its body (B2.5's plan does the same for its e2e).

Costs the lead accepts with an `approve` (not reasons; stated so they are not found after):

1. **A half-edited date clears the stored date.** §15 fixes `<input type="date">`; a native date field reports `''`
   for any partial or invalid entry (probe above). So a person who opens "Edit due date" on `2026-11-05`, presses
   Backspace once (one segment blank) and clicks "Update due date" sends `''`, and the action clears the date
   (REQ-15.3) with no message; REQ-15.7's message and "keeps the field open with the typed value" are reachable only by
   a caller that is not this field. Any approach that follows §15 carries it; changing it needs a §15 edit under a D-n.
2. **Mount-point hold and regenerate after merge.** B2.4 holds `src/lib/todos.ts` and `src/actions/todos.ts` (D-20) for
   the whole card. After it merges, every worktree that merges `origin/main` needs `pnpm db:generate` (or
   `pnpm install`) before `pnpm typecheck`, and `pnpm db:migrate` on its own schema before `pnpm test:e2e`.
3. **Spec text drift.** §5's `Todo` block and the `listTodos` comment (`03-todos.md:54`) keep four fields, and §11's
   `MutationActionName` list keeps its members while the code gains `setTodoDueDateAction`; `/spec-trace` will report
   both after merge. Removing them needs a D-n and a `docs(spec)` commit, not this card.
4. **No JavaScript / before hydration.** "Edit due date" is a `type="button"` with a click handler: inert without
   JavaScript and a click before hydration is lost, the same as "Edit title" today. Nothing existing is dropped.
5. **Paperwork notes, no action at the gate.** The card's `Test:` line says red "because `src/lib/todo-due-date.ts` does
   not exist"; with this skeleton the module exists and the red is an assertion or `NotImplementedError` (the right
   kind), so the card line goes stale. Two advice hot spots are not in the Files rows: `safeParse({ id: 'todo-1' })`
   (missing `dueDate`, kills the `z.string({ error })` mutant) and the component's `id`-arm alert and empty draft
   (`dueDate={undefined}` → field value `''`); the test-writer reads them from `advice.md:185,197`.
