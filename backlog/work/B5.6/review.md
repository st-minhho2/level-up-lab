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
