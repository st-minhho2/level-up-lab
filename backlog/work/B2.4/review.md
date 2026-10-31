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

## Plan review (round 2)

Reviewed at `dc63cc0` (`plan.md` 88 lines; the card's `Test:` line in `backlog/plan/E2-todos-plus.md`), with B2.5's
approved plan read from `feat/B2.5-search` at `0e841e9` (`git show`, not changed). Run here: `pnpm test` →
`Tests  138 passed (138)`; `pnpm exec playwright test --list` → `Total: 24 tests in 8 files`;
`scripts/next-task.sh --check B2.4` → `[next-task] B2.4: no overlap with any Doing or Review card` (B2.5 is Doing on
`--list`, so the check compared against its plan); `scripts/ci/plan-files.sh --any B2.4 HEAD` → 14 paths (16 at round 1;
both guides gone); `check-backlog.sh` → `OK: README matches the cards`; `check-spec-sections.sh` → `OK: sections cited: 1 … 15`;
`check-features-map.sh` → `OK`; `check-ac-coverage.sh` → `§15: ✗, no tests expected yet (7 criteria)` then `OK`.

Round-1 reasons:

1. **Resolved.** Option (b): `src/lib/CLAUDE.md` and `src/components/CLAUDE.md` are out of Files (`plan.md:29-31`),
   and the cost is stated. B2.5's phase-B guide rows no longer collide with B2.4. B2.5's approved plan
   (`0e841e9`, "Sequence (phase B)") still says B2.4 lists both guides "(dd1d6cf)". That sentence is now stale, and
   dev-lead should tell the B2.5 session.
2. **Resolved as written.** Per-file counts 7 + 3 + 6 + 5 = 21, totals `138 → 159` and `24 → 25`, the e2e red recorded in the red
   commit body (`plan.md:70-76`). The arithmetic holds against the baselines above. Reason 1 below shows the planned
   skeleton cannot reach the first number.

Probe on a copy (`git archive HEAD` under the session scratchpad, never the tree): `src/lib/todo-due-date.ts` with the
schema stub `advice.md:51-52` prescribes and the card's `Test:` line now names ("permissive … accepts every value"):
`z.object({ id: z.string(), dueDate: z.string() })` under §15's exact annotation, `dueDateToDate` / `dueDateOf` throwing
`NotImplementedError`. Six tests split as the Files row describes (AC-15.1 accepts, empty → `undefined`, a reject, the
`0001-01-01` / `9999-12-31` boundary accepts, the two helpers): `vitest run` → `Tests  4 failed | 2 passed (6)`. The
two that pass are the accept-only tests. The same file with the stub `dueDate: z.string().refine(() => false, 'not implemented (B2.4)')`
→ `Tests  6 failed (6)`, and `tsc --noEmit` reports nothing for the module. The action stub is not at risk: B2.3's
skeleton (`5a1fb82`) rejects `NotImplementedError` from the action body, so a mocked `@/lib/todos` does not make it pass.

| Check                                                                                  | Result                                                                                                                                                                                                   |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                         | pass: 14 paths, all named by §15's Function contracts or the actions guide. Dropping two guides added no `src/` file                                                                                     |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib         | pass: unchanged since round 1 (signatures copy §15; one `update` in `src/lib/todos.ts`; `todo-due-date.ts` pure)                                                                                         |
| plan follows `advice.md`'s recommendation or states the deviation                      | pass: Approach A. The guides deviation (advice lists all three) is stated at `plan.md:29-31`                                                                                                             |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number              | pass: 7 criteria, unchanged                                                                                                                                                                              |
| verification lists exact commands with expected numbers                                | fail: the numbers are now present. `verify-red.sh B2.4` "exit 0 with 21 new unit tests failing" cannot hold with the skeleton's permissive schema stub if any of the 7 lib tests only accepts (reason 1) |
| work breakdown has skeleton → red → green → map → review with convention subjects      | pass: unchanged. Wording: step 3 still says "guides" (plural), and only `src/actions/CLAUDE.md` is left                                                                                                  |
| the section has a `Lead approves spec` box, ticked only by a human (D-7), never by you | pass: `spec/contracts/13-due-date.md:5` still `- [ ] Lead approves spec (lead, <date>)`                                                                                                                  |
| no settled D-n contradicted                                                            | pass: D-20, D-11 / D-12, D-19, D-7 as round 1; dropping the guides touches no ruling                                                                                                                     |
| `scripts/next-task.sh --check B2.4` on the committed plan says no overlap              | pass: `[next-task] B2.4: no overlap with any Doing or Review card` at `dc63cc0`                                                                                                                          |

Verdict: changes requested

1. **The planned skeleton makes the planned red gate fail.** `verify-red.sh` passes only with "zero NEW tests
   passed" (`scripts/verify-red.sh:15`). The skeleton's `setTodoDueDateSchema` is the permissive stub from
   `advice.md:51-52`, and the card's `Test:` line (changed in `dc63cc0`) commits to it: "the skeleton's permissive
   `setTodoDueDateSchema` stub accepts every value". That stub returns any accepted value unchanged. The Files row
   plans `0001-01-01` and `9999-12-31` boundary rows among 7 lib tests (`plan.md:17`).
   Trigger: the test-writer writes `it('… accepts the year bounds 0001-01-01 and 9999-12-31', …)` (or splits AC-15.1's
   two real-date accepts into their own `it`). At the base, `safeParse` returns `{ success: true, data: { id: 'todo-1', dueDate: '0001-01-01' } }`,
   so the test passes and `verify-red.sh` prints `-> GREEN before implementation` and exits 1. In the probe above,
   2 of 6 tests passed. The plan promises exit 0 with 21 failing.
   Fix: pick one and state it in the plan and the card's `Test:` line. (a) Recommended: the skeleton stub rejects
   every value, `dueDate: z.string().refine(() => false, 'not implemented (B2.4)')`. It typechecks under §15's
   annotation, and all 6 probe tests fail on an assertion. (b) Keep the permissive stub and require every accept row
   to share an `it` with an assertion the stub fails (for example the `''` → `undefined` case).

Costs the lead accepts with an `approve` (not reasons; stated so they are not found after):

1. **A half-edited date clears the stored date** (round 1, cost 1, unchanged). A native `<input type="date">`
   reports `''` for a partial entry. One Backspace and "Update due date" then clears the date without a message.
   REQ-15.7's message cannot be reached from this field. Changing that needs a §15 edit under a D-n.
2. **Mount-point hold, then regenerate after merge** (round 1, cost 2). B2.4 holds `src/lib/todos.ts` and
   `src/actions/todos.ts` for the whole card. After B2.4 merges, every worktree that merges `origin/main` needs
   `pnpm db:generate` before `pnpm typecheck` and `pnpm db:migrate` on its own schema before `pnpm test:e2e`.
3. **Spec text drift** (round 1, cost 3). §5's `Todo` block and §11's `MutationActionName` list stay as written while
   the code gains `dueDate` and `setTodoDueDateAction`. `/spec-trace` will report both. Removing the drift needs a D-n.
4. **No JavaScript / before hydration** (round 1, cost 4). "Edit due date" does nothing before hydration, the same as
   "Edit title" today.
5. **Guides one card behind the code** (new, chosen by round-1 reason 1 (b)). After B2.4 merges, `src/lib/CLAUDE.md`'s
   module table has no `todo-due-date.ts` row, and its `todos.ts` row lists neither `setTodoDueDate` nor §15.
   `src/components/CLAUDE.md` does not say `todo-due-date.tsx` is `'use client'`. Agents read these guides first. The
   plan names no owner ("whichever card edits them after B2.4 merges"). B2.5's phase B lists both guides for section 16 rows
   only, so §15's lines land only if dev-lead adds them to that amendment or to B2.4's closing PR.
   Separately, `src/actions/CLAUDE.md:3` says actions parse with a schema from `src/lib/todo-schema.ts`.
   `setTodoDueDateAction`'s schema lives in `todo-due-date.ts`, so the planned edit, which only names the action,
   leaves that sentence inexact.
6. **Paperwork** (round 1, cost 5, partly closed). The card's `Test:` line now names the skeleton's red reason. It has
   to follow whichever stub reason 1 picks. The advice hot spots (`safeParse({ id: 'todo-1' })` missing `dueDate`; the
   component's `id`-arm alert and the empty draft) are still read from `advice.md`, not the Files rows. The plan is 88
   lines against `planning.md`'s ≈ 40. Round 1 did not raise this and its content has not grown, so it is noted, not a reason.
