# B6.1 review

## Plan review (round 1)

| Check                                                                                  | Result                                                                                                                                                                                      |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                         | pass: `todo-form.tsx` is D-33's only mount for §29; the test file, `e2e/29-escape-new-todo.spec.ts` (§-number naming like `27-escape-search.spec.ts`) and the F27 row are the section's own |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib         | pass: inline `onKeyDown` with `ReactKeyboardEvent<HTMLInputElement>` and `: void`; no action, schema, Prisma or lib change; `isSearchEscape` imported unchanged                             |
| plan follows `advice.md`'s recommendation or states the deviation                      | pass: approach A, including `event.nativeEvent` (AC-29.3 `Esc`) and the `pending` guard                                                                                                     |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number              | pass: 7 criteria, every Then is a value, count, `defaultPrevented` flag, address or row order                                                                                               |
| verification lists exact commands with expected numbers                                | fail: see reason 2                                                                                                                                                                          |
| work breakdown has skeleton → red → green → map → review with convention subjects      | fail: skeleton omitted with a valid reason (no new export, as B5.6), but the red step as planned cannot pass its gate: see reason 1                                                         |
| the section has a `Lead approves spec` box, ticked only by a human (D-7), never by you | pass: `spec/contracts/27-escape-new-todo.md:5` `- [ ] Lead approves spec`, unticked                                                                                                         |
| no settled D-n contradicted                                                            | pass: D-33 (one `src/` file, F27, lifts nothing), D-7, D-27/D-28 (medium tier: no `prisma/`, dependency, env, CI or `.claude/`)                                                             |
| `scripts/next-task.sh --check B6.1` on the committed plan                              | pass: `[next-task] B6.1: no overlap with any Doing or Review card` (exit 0)                                                                                                                 |

Baseline measured on this branch: `pnpm test` → `Tests  241 passed (241)`, 39 files; `e2e/` holds 52 tests.

Verdict: changes requested

1. **The red commit as planned fails `scripts/verify-red.sh B6.1`.** The plan puts AC-29.3, AC-29.4 and AC-29.5 in
   the `(red)` commit and says they pass on today's code. `scripts/verify-red.sh` passes only if "zero NEW tests
   passed" (header line 16; line 147 reports `GREEN before implementation` and exits 1). Trigger: the red commit
   with those three tests in it; today's `todo-form.tsx` has no `onKeyDown`, so each of their Thens (`defaultPrevented`
   false, `Buy milk` kept, 0 calls) already holds. Fix as B5.6 did: a `test(todos): B6.1 pin AC-29.3–AC-29.5 …`
   commit before the red one (green on today's code, each asserting its own Then), then `test(todos): B6.1 … (red)`
   with AC-29.1, AC-29.2, AC-29.6 (and the e2e AC-29.7). Add the pin row to the work breakdown. Cost of not fixing:
   the gate stops the run at step 1, or a test-writer weakens or drops a guard test to get the gate through.
2. **Verification has no expected numbers.** "all pass, including the 6 new AC-29.n tests" gives no baseline and
   no totals, and "6" contradicts the plan's own test shape: AC-29.2 has 3 cases on separate renders, AC-29.3 has
   8 keys plus Enter, AC-29.4 has 4 targets; if any is an `it.each` the count is not 6. State: baseline 241 passed
   (39 files), e2e 52; the rows each AC adds; totals after the pin, after the red and after green
   (241 → … → …); `pnpm test:e2e` 52 → 53, the red AC-29.7 failing on which assertion.
3. **AC-29.3's Enter cannot go green through `fireEvent.keyDown`.** The plan says the tests fire "native
   `fireEvent.keyDown`". Trigger: `fireEvent.keyDown(box, { key: 'Enter' })` dispatches an untrusted event, and jsdom
   performs no implicit form submission for it, so `createTodoAction` has 0 calls and AC-29.3's "Enter calls
   `createTodoAction` exactly once with `title` equal to `Buy milk`" fails on the correct code. State that Enter goes
   through `userEvent` (as B5.6's AC-28.5 did), and only the Escape-variant keys through `fireEvent.keyDown` (so `Esc`
   stays the legacy value and `defaultPrevented` is read from the return value).

No cost to the lead beyond these: approach A drops no behavior (markup, native POST, §10/§18 reset unchanged), and
the alert is kept by REQ-29.7, not removed.

## Plan review (round 2)

Reviewed `plan.md` at 91013c5 (round 1 reasons applied).

| Check                                                                                  | Result                                                                                                                                                                                                                                                                                                                                                                |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                         | pass: unchanged from round 1; F27 is free in `spec/features-map.md` (last row F26) and D-33 assigns F27 to B6.1                                                                                                                                                                                                                                                       |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib         | pass: inline `onKeyDown` typed `ReactKeyboardEvent<HTMLInputElement>` → `void`, `isSearchEscape(event.nativeEvent)` as `todo-search-form.tsx:22` does; no action, schema, Prisma, lib or export change (§29 Function contracts)                                                                                                                                       |
| plan follows `advice.md`'s recommendation or states the deviation                      | pass: approach A                                                                                                                                                                                                                                                                                                                                                      |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number              | pass: 7 criteria, all Thens are values, counts or flags                                                                                                                                                                                                                                                                                                               |
| verification lists exact commands with expected numbers                                | pass (reason 2 resolved): baseline 241 / 39 files, e2e 52; pin +14 (9 + 4 + 1) → 255; red +5 (1 + 3 + 1) failing, with the failing assertion per AC; green 260; e2e 52 → 53 with AC-29.7 failing on `Buy eggs` at red                                                                                                                                                 |
| work breakdown has skeleton → red → green → map → review with convention subjects      | pass (reason 1 resolved): pin → red → feat → map → review. Traced `scripts/verify-red.sh`: it selects only `(red)` subjects (line 63), takes the first red commit's parent (the pin commit) as base, and counts a test as new only if it did not run at the base, so the 14 pinned tests are old and the 5 red ones must fail. Same shape as B5.6 (b5e0219 → c4f38ea) |
| the section has a `Lead approves spec` box, ticked only by a human (D-7), never by you | pass: `spec/contracts/27-escape-new-todo.md:5` `- [ ] Lead approves spec`, unticked                                                                                                                                                                                                                                                                                   |
| no settled D-n contradicted                                                            | pass: D-33 (one `src/` file, F27, lifts nothing), D-7, D-27/D-28 (medium tier)                                                                                                                                                                                                                                                                                        |
| `scripts/next-task.sh --check B6.1` on the committed plan                              | pass: `[next-task] B6.1: no overlap with any Doing or Review card` (exit 0)                                                                                                                                                                                                                                                                                           |

Reason 3 resolved: Escape variants go through `fireEvent.keyDown`, so `Esc` reaches `nativeEvent.key` unnormalized and
`defaultPrevented` comes from the return value; Enter and typing go through `userEvent`.

Probe not run: TMPDIR unset. The claim that `userEvent` Enter in the box submits the form once (AC-29.3's Enter row,
pinned green on today's code) is traced, not run: no existing `todo-form.test.tsx` test submits with Enter (all click
"Add"). If it fails at the pin step, the test-writer must stop and report, not change the Enter row to a click.

Non-blocking notes: the mutation line says components are outside Stryker and then that AC-29.1/29.3/29.5 kill
mutants; only the first half applies (the score is unaffected). The plan runs about 55 lines, over the ≈ 40 line
guide, but holds one file of `src/` and one task.

Costs for the lead: none dropped. Approach A keeps the markup, the native POST, the §10 and §18 reset design and the
§5/§10 alert (REQ-29.7). Escape while a save is pending does nothing, which REQ-29.4 asks for.

Verdict: approved (ready for the lead's gate or, at medium tier, D-27's reviewer approval; not approved for build)
