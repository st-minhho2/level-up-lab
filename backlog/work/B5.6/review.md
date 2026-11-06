# B5.6 review

## Plan review (round 1)

Plan at `6baac77`. Baselines and scope run by the reviewer in the worktree on 2026-11-06.

| Check                                                                             | Result                                                                                                                                                                                                                                                                                                                                                                            |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: `scripts/ci/plan-files.sh --file` prints the 4 files; `src/components/todo-due-date.tsx` is the one file D-30 and §28 assign; its test, the new `e2e/28-escape-due-date.spec.ts` and the new F26 row (§28, after F25 = §27) follow from it. `scripts/ci/check-plan-scope.sh` → `OK: feat/B5.6-agent changes only paperwork`                                                 |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: `TodoDueDate({ todoId, dueDate }): ReactNode` unchanged; one private `onDueDateKeyDown(event: KeyboardEvent<HTMLInputElement>): void` with an explicit return type; no action, schema, model, query, env key or prop                                                                                                                                                        |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: approach A (handler on the input only, modifier and `pending` guard, named `'Escape'` constant, draft reset kept, no `isSearchEscape` import); the pin of AC-28.4–28.6 goes beyond the advice and is correct: I traced all three on today's code and each holds (no handler, so the field stays, `defaultPrevented` is false, Enter submits, the `ok` save closes the edit) |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: 7 criteria (AC-28.1–28.7); every Then is a role or label count, a field value, a `defaultPrevented` value or a call count                                                                                                                                                                                                                                                   |
| verification lists exact commands with expected numbers                           | fail: baselines verified (`pnpm test` → `Tests 227 passed (227)`, 39 files; e2e `test(` count 51), e2e target 52 stated, but the unit targets after the pin and after green are not numbers: "227 + n … stated in the pin and red commits" (reason 1)                                                                                                                             |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass with stated deviation: no skeleton (no new export, red is behavioral, "as B5.2"); a pin step precedes the red; the pin subject has no `(red)` marker, so `verify-red.sh` treats only step 2 as the red; `feat`, `docs(map) … [B5.6]`, `docs(backlog)` follow convention                                                                                                      |
| the section has a `Lead approves spec` box, ticked only by a human                | pass: `spec/contracts/26-escape-due-date.md:5` `- [ ] Lead approves spec`, unticked; not ticked by me                                                                                                                                                                                                                                                                             |
| no settled D-n contradicted                                                       | pass: D-30 (one component, `todo-due-date.tsx`; `page.tsx`, actions, lib, `todo-item.tsx` untouched); D-32 (406927e changes only §15's "Escape/blur" phrase to "by blur (Escape is §28)"); D-27/D-28 (`scripts/agent/tier.sh` on the plan → `medium`); D-7                                                                                                                        |
| `scripts/next-task.sh --check B5.6` says no overlap                               | pass: `[next-task] B5.6: no overlap with any Doing or Review card`                                                                                                                                                                                                                                                                                                                |

Changes requested:

1. Verification gives no expected unit count after the pin and after green. "227 + n (n = … stated in the pin and
   red commits)" puts the number off until after approval, and the diff review then has no target to compare. The
   AC notes fix the shape, so the plan can state it: for example AC-28.4 1 + AC-28.5 6 (Enter plus the five
   `it.each` rows) + AC-28.6 3 = 10 pinned (227 → 237), then AC-28.1 1 + AC-28.2 1 or 2 + AC-28.3 1 red (→ 240 or
   241 after green). Pick the split, write both numbers, and keep the B5.2 sentence "a different count is stated in
   the red commit".

Costs the lead should know before approving (none blocks):

1. Focus is not returned to "Edit due date" after Escape: the input unmounts and focus falls to `document.body`,
   so a keyboard user loses their place in the list. §28 Out of scope says so explicitly.
2. Escape with focus on "Update due date" does nothing (REQ-28.7 limits the key to the field); a person who tabbed
   to the button must click elsewhere or save.
3. `setDraft(dueDate ?? '')` on Escape repeats `onEdit`'s reseed, so no test can kill its removal (advice states
   it). The component is outside the mutation scope (`src/lib` + `src/actions`), so the 70 % gate does not cover
   any of the guard terms; AC-28.4 and AC-28.5's one-modifier-per-row cases are the only proof, read by hand in the
   diff review.
4. AC-28.5's Enter case cannot be a `fireEvent.keyDown` (jsdom does not submit a form on a synthetic keydown); it
   needs `userEvent` or a submit, while the `defaultPrevented` reads need `fireEvent.keyDown`'s return value. The
   test file already imports both.
5. The `Lead approves spec` box of §28 is still unticked; the lead's gate (D-7) may tick it with the plan approval.

Verdict: changes requested

## Plan review (round 2)

Plan at `be6294a` (diff from round 1: `backlog/work/B5.6/plan.md` only, 5 lines, Verification and the status line).
Re-run by the reviewer in the worktree on 2026-11-06.

| Check                                                                             | Result                                                                                                                                                                                                                                                                                                                                                                        |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: Files table unchanged since round 1 (4 files: `todo-due-date.tsx`, its test, new `e2e/28-escape-due-date.spec.ts`, new F26 row after F25 = §27); `scripts/ci/check-plan-scope.sh` → `[check-plan-scope] OK: feat/B5.6-agent changes only paperwork`                                                                                                                     |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: unchanged; `TodoDueDate({ todoId, dueDate }): ReactNode` as in `src/components/todo-due-date.tsx` today; one private `onDueDateKeyDown(event: KeyboardEvent<HTMLInputElement>): void`; no action, schema, model, query, env key, prop or export                                                                                                                         |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: approach A; the pin step and the Enter-through-`userEvent` choice (round 1 cost 4) are now stated                                                                                                                                                                                                                                                                       |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: 7 criteria, every Then a count, a value, a `defaultPrevented` value or a call count                                                                                                                                                                                                                                                                                     |
| verification lists exact commands with expected numbers                           | pass (round 1 reason 1 resolved): baseline re-run `Tests 227 passed (227)`, `Test Files 39 passed (39)`, e2e `test(` count 51; pin 1 + 6 + 3 = 10 → 237 (AC-28.5 = Enter + 5 key rows, AC-28.6 = body, button, "New todo"); red adds AC-28.1 1 + AC-28.2 2 + AC-28.3 1 = 4 → 241 after green; e2e 51 → 52; the "different count is stated in the red commit" sentence is kept |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass with stated deviation: no skeleton (no new export); pin precedes red, as B5.5 `dad111a` and B5.2 `b918076`. `scripts/verify-red.sh` takes the parent of the first `(red)` commit as base, so the pin commit is in the base and its 10 tests count as old: they cannot trip "GREEN before implementation"                                                                 |
| the section has a `Lead approves spec` box, ticked only by a human                | pass: `spec/contracts/26-escape-due-date.md:5` `- [ ] Lead approves spec`, unticked; not ticked by me                                                                                                                                                                                                                                                                         |
| no settled D-n contradicted                                                       | pass: D-30, D-32, D-7 as round 1; D-27/D-28 `scripts/agent/tier.sh backlog/work/B5.6/plan.md` → `medium`                                                                                                                                                                                                                                                                      |
| `scripts/next-task.sh --check B5.6` says no overlap                               | pass: `[next-task] B5.6: no overlap with any Doing or Review card`                                                                                                                                                                                                                                                                                                            |

Costs the lead should know before approving (none blocks; round 1's five stand, restated in one line each):

1. After Escape focus falls to `document.body`, not "Edit due date" (§28 Out of scope).
2. Escape with focus on "Update due date" does nothing (REQ-28.7).
3. The component is outside the mutation gate (`src/lib` + `src/actions`); the guard terms (`pending`, each
   modifier, the key check, `setDraft`, `setError`, `preventDefault`) are proven only by AC-28.1–28.6 and are read by
   hand in the diff review. `setDraft(dueDate ?? '')` on Escape repeats `onEdit`'s reseed, so its removal survives
   every test; it stays because the Function contracts block names it.
4. The pin tests (AC-28.4–28.6) are green before any code, so they prove only that the handler does not break today's
   behavior; they turn into killers only once the handler exists.
5. The §28 `Lead approves spec` box is still unticked; the lead's gate (D-7) may tick it.

Verdict: approved (ready for the lead's gate, not approved for build)

## Diff review (round 1)

Reviewed at HEAD 6e04aba (commits b5e0219 pin, c4f38ea red, 7e16b8f feat, 8df2de3 mistake log, 6e04aba docs(map)).

**Worktree incident (reviewer's own, not the change's).** A probe of mine ran with `TMPDIR` unset, so its `cd` was a
no-op and ten `sed -i` mutations landed on the worktree's `src/components/todo-due-date.tsx` (uncommitted; HEAD is
intact, `git status` shows ` M src/components/todo-due-date.tsx`). `path-guard.sh` blocks the reviewer from restoring
`src/`. The orchestrator must run `git -C <worktree> restore src/components/todo-due-date.tsx` and confirm
`git status --short` is empty before anything else is committed or pushed. Every gate below ran on the clean HEAD
before the incident. The probes were re-run on a `git archive HEAD` copy.

### Commands (last line of each)

| Command                               | Result                                                                                            |
| ------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `pnpm lint`                           | `All matched files use Prettier code style!` (exit 0)                                             |
| `pnpm typecheck`                      | `tsc --noEmit` (exit 0, no output)                                                                |
| `pnpm test`                           | `Tests  241 passed (241)` (39 files; plan: 241)                                                   |
| `pnpm test:e2e`                       | `52 passed (1.3m)` (plan: 52; AC-28.7 ✓ 1.3s)                                                     |
| `pnpm test:mutation`                  | `Final mutation score of 92.62 is greater than or equal to break threshold 70`                    |
| `scripts/ci/check-suppressions.sh`    | `OK: no new suppressions`                                                                         |
| `scripts/ci/check-config-change.sh`   | `OK: no protected config changed`                                                                 |
| `scripts/ci/check-feat-commits.sh`    | `OK: no feat commit touches tests`                                                                |
| `scripts/ci/check-ac-coverage.sh`     | `OK: every criterion of a shipped section has a test` (§28 ✗ until closing, 7 criteria)           |
| `scripts/ci/check-spec-sections.sh`   | `OK: sections cited: 1 … 28`                                                                      |
| `scripts/ci/check-features-map.sh`    | `OK`                                                                                              |
| `scripts/verify-red.sh B5.6`          | `RESULT: red for the right reason` (4 new, 4 failed, base b5e0219; e2e skipped, needs a server)   |
| `scripts/ci/check-plan-scope.sh`      | `OK: feat/B5.6-agent stays inside the approved plan of B5.6 (D-27 approval)`                      |
| `git diff --stat main...HEAD`         | local `main` is stale (range includes B5.5, #232); the CI range `3804abe..HEAD` is the card's own |
| pin commit b5e0219 on an archive copy | `todo-due-date.test.tsx`: `Tests  15 passed (15)` (AC-28.4–28.6 green before code, as planned)    |

### Checklist

| Check                                                                                            | pass / fail: reason                                                                                                                                                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every AC-28.n has a test whose assertion matches its Then                                        | pass: 28.1 (0 fields, text ×1, 1 button, `defaultPrevented` true, 0 calls), 28.2 (both rows), 28.3 (0 alerts, 0 fields, 1 call), 28.4, 28.5 (Enter + 5 keys), 28.6 (3 targets), 28.7 e2e                                                                                                                                      |
| no test weakened after the red commit                                                            | pass: `git log --first-parent --no-merges c4f38ea..HEAD -- '*.test.*' e2e/` empty; no merge commits in range                                                                                                                                                                                                                  |
| every changed file in `plan.md`                                                                  | pass: the component, its test, the e2e file, the features map; `docs/metrics.md` and `docs/mistake-log.md` are exempt paperwork; `check-plan-scope.sh` OK                                                                                                                                                                     |
| interfaces match §28 Function contracts                                                          | pass: props unchanged, no new export; private `onDueDateKeyDown` on the input only; guard, `preventDefault`, leave edit, `setDraft(dueDate ?? '')`, clear message as written                                                                                                                                                  |
| Zod at action boundary / Prisma only in lib / no raw SQL / migration                             | n/a: no action, lib, Prisma or migration change                                                                                                                                                                                                                                                                               |
| no secret, no suppression                                                                        | pass (`check-suppressions.sh`, diff read)                                                                                                                                                                                                                                                                                     |
| features map row moved                                                                           | pass: F26 added ✗ in 7e16b8f, ✅ in 6e04aba (code-writer re-dispatch, mistake-log row 8df2de3)                                                                                                                                                                                                                                |
| UI: accessible names, row text, Server/Client boundary                                           | pass: no markup, label or text added (REQ-28.7); still `'use client'` for state/events; the document-level §25 listener ignores Escape (`isSearchShortcut` is `/` only)                                                                                                                                                       |
| one reverted line makes a test fail (archive copy, `todo-due-date.test.tsx`, baseline 19 passed) | pass with one equivalent survivor: `preventDefault` 1 fail · `setEditing(false)` 4 · `setError` 1 · each of ctrl/meta/alt/shift 1 · `pending` 1 · `CANCEL_KEY='Esc'` 4 · `setDraft` 0 failed (equivalent: `onEdit` reseeds the draft on every open, so the Escape reset is unobservable; already named in plan review cost 3) |

### Questions from the dev-lead

1. **Can `pending` be stale in `onDueDateKeyDown` between `startTransition` and the next render?** Not as far as I
   can show. The submit is a discrete event. React 19.1 sets the transition's `pending = true` at the event's sync
   priority and flushes it in the microtask at the end of that event. A later Escape is its own task, and React
   dispatches through the fiber's current props, so it runs the closure that sees `pending === true`. Escape cannot
   share a task with the submit: Enter's implicit submission follows Enter's own keydown, which returns early. After
   an `ok` result, a stale `pending === false` read could only arrive after the save has ended, when closing is
   already the right outcome. AC-28.4 kills the `pending` term (probe above). It checks the rendered state, not a
   same-task race, which no browser produces.
2. **Is AC-28.7's POST count flaky?** Low risk. The listener is attached after `fill` and before Escape. A wrong
   save would `POST /` synchronously from `startTransition` at submit, before the field could close, and the field
   closes only on the result. So the assertion catches a regression on every run, without depending on timing. A
   false positive needs another `POST /` in that window. The app has none: Server Actions are the only POSTs, and
   `fill` on a date input calls none. It passed once here (1.3s). I could not repeat it after the incident because
   the worktree source is dirty.

### Findings

None blocking.

Verdict: ready for PR, after the worktree is restored to HEAD (incident above). The diff itself needs no change.

Riskiest unfalsified: the window after an `ok` save where `setEditing(false)` runs after the `await` and is not part
of the transition, while `pending` turns false in a separate commit. Escape in that window should be harmless, since
the save is already stored and closing is correct. Neither test covers it, and no browser can time a key press into it.
