# B7.5 review

## Plan review (round 1)

Scope: ui (`src/components/todo-form.tsx`, a component test, one e2e file) plus the pure `src/lib/title-count.ts`.
Read: `plan.md`, `advice.md`, `spec/contracts/37-title-counter-warning.md` (§39), card B7.5 in
`backlog/plan/E7-todos-hints.md`, D-27, D-28, D-37, `src/components/todo-form.tsx`, `src/components/todo-form.test.tsx`,
`e2e/` file names, `scripts/verify-red.sh`, `.claude/docs/git-workflow.md` and `backlog/CLAUDE.md` commit order.

| Check                                                                             | Result                                                                                                                                                                                                                                                                                                                                      |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: `title-count.ts` and `todo-form.tsx` are the only `src/` files §39 allows (contract line 247-248); F37 is the id the card and D-37 give (F35 is §37, the last row); test files are new or the card's `Test:` file                                                                                                                     |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: `TITLE_WARNING_THRESHOLD = 180` and `isTitleNearLimit(value: string): boolean` copied from §39 Function contracts; pure module, no `server-only`; no action, schema, Prisma, env or route                                                                                                                                             |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: approach A; both deviations stated. e2e `39-…` is correct (`e2e/37-due-date-today.spec.ts` already exists for §37, so advice's `37-…` collides); a separate `todo-form-warning.test.tsx` follows B7.3's `todo-due-date-today-button.test.tsx`                                                                                         |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: 7 criteria (AC-39.1–39.7), each Then counts elements, exact text, class, attribute values or call counts; "visible" in AC-39.7 is a Playwright assertion                                                                                                                                                                              |
| verification lists exact commands with expected numbers                           | fail: commands and numbers are listed (`pnpm test` 298 → 304, 48 → 49 files; baseline 298 / 48 confirmed by running it), but the stated red for AC-39.5 cannot happen as planned; see reason 1. Minor: e2e is "+1" with no baseline (70 `test(` in `e2e/` today, so 71 expected) and mutation names no command (`scripts/mutation-gate.sh`) |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: `chore(todos): B7.5 skeleton` → `test(todos): B7.5 … (red)` → `feat(todos): B7.5 …` → `docs(map): F37 … [B7.5]` → `docs(backlog): B7.5 review …`, matching `backlog/CLAUDE.md` and the B6/B7 history                                                                                                                                  |
| the section has a `Lead approves spec` box, ticked only by a human, never by you  | pass: `- [ ] Lead approves spec` present in `37-title-counter-warning.md`, unticked; not touched by this review                                                                                                                                                                                                                             |
| no settled D-n contradicted                                                       | pass: D-37 (section 39, `37-title-counter-warning.md`, `todo-form.tsx`, threshold in `title-count.ts`, F37, medium tier) matched; §18's lift and REQ-29.7 are the ones D-37 names; tier medium under D-28 (no `prisma/`, dependency, env or protected path)                                                                                 |
| `scripts/next-task.sh --check B7.5` says no overlap                               | pass: `[next-task] B7.5: no overlap with any Doing or Review card` (exit 0)                                                                                                                                                                                                                                                                 |

Also checked: `scripts/ci/check-plan-scope.sh` → `[check-plan-scope] OK: feat/B7.5-agent changes only paperwork`.
Existing tests that could break on a warning element: none found. `todo-form.test.tsx:193-199` counts counter-text
matches, `alert`, `status` and `[aria-live]` in the form, none of which the warning adds; `e2e/18-title-counter.spec.ts:28`
counts the `^\d+ / 200$` counter, which the warning text does not match.

Reasons (changes requested):

1. AC-39.5 cannot be red at the skeleton as the plan states. Its Then holds only absences (0 warnings after Escape and
   after typing) and behavior that already exists (§29 Escape, `maxlength`, form data `['title']`). Probe on a clone
   (`$TMPDIR/probe395`, current code, which renders no warning just as the skeleton will): a test asserting exactly
   AC-39.5's Then passed (`Tests 1 passed (1)`). `scripts/verify-red.sh` fails when any NEW test passes (step 6), so
   the run would stop at the red gate. The plan must say how AC-39.5's test goes red, e.g. it asserts the Given
   (exactly 1 `#new-todo-warning` while the box holds `'x'` ×190, before Escape), and the same for any AC-39.4 split:
   if (a) and (b) become separate `it`s, (a) alone is also green at the skeleton (keep them in one `it`, as the plan's
   count of 6 implies, or give (a) the pending-state assertion).
2. Verification: state the e2e expectation as a number (`pnpm test:e2e` 70 → 71 tests) and the mutation command
   (`scripts/mutation-gate.sh`, which runs Stryker on `src/lib/title-count.ts`, expected ≥ 70).

Costs the lead takes on approval (stated in the plan, repeated so nothing is found after the gate):

1. The amber contrast of `text-amber-700` / `dark:text-amber-400` is not measured [unverified]; the class string is
   pinned by §39.
2. The warning is not announced; a screen reader reaches it only in browse mode (§39 Out of scope).
3. After a `form` failure on a 180+ title the warning stays shown beside the §5 error (AC-39.4 (b)); it does not
   follow the §5 verdict.

Verdict: changes requested

## Plan review (round 2)

Scope: ui plus the pure `src/lib/title-count.ts`. Read: `plan.md` at `4c345e4` (diff against round 1's `dfa2e7c`:
only the Verification paragraph changed), §39 contract, round 1 above.

| Check                                                                             | Result                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: unchanged from round 1 (Files table identical); `title-count.ts` and `todo-form.tsx` are the two files §39 allows                                                                                                                                                                                                                                                                                                                                         |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: unchanged; signatures copied from §39 Function contracts                                                                                                                                                                                                                                                                                                                                                                                                  |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: approach A; both deviations (`e2e/39-…`, separate `todo-form-warning.test.tsx`) stated                                                                                                                                                                                                                                                                                                                                                                    |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: AC-39.1–39.7, all counted or exact                                                                                                                                                                                                                                                                                                                                                                                                                        |
| verification lists exact commands with expected numbers                           | pass: round 1 reason 1 fixed (every AC is one `it` that first asserts a present warning; AC-39.5 asserts exactly 1 `#new-todo-warning` at `'x'` ×190 before Escape, so it is red at the skeleton; AC-39.4 (a)+(b) one `it`, (b) asserts the pending-state warning). Reason 2 fixed: `pnpm test:e2e` 70 → 71 (70 `test(` in `e2e/` today, recounted), `scripts/mutation-gate.sh` ≥ 70 on `title-count.ts`. Unit count 298 → 304 = 1 (AC-39.1) + 5 (AC-39.2–39.6) |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: unchanged, matches `backlog/CLAUDE.md` commit order                                                                                                                                                                                                                                                                                                                                                                                                       |
| the section has a `Lead approves spec` box, ticked only by a human, never by you  | pass: `- [ ] Lead approves spec` present, unticked, not touched                                                                                                                                                                                                                                                                                                                                                                                                 |
| no settled D-n contradicted                                                       | pass: D-37 matched; medium tier under D-28 (no `prisma/`, dependency, env, CI, hook or `.claude/` path), so the lead's `approve` gate still applies to an interactive card                                                                                                                                                                                                                                                                                      |
| `scripts/next-task.sh --check B7.5` says no overlap                               | pass: `[next-task] B7.5: no overlap with any Doing or Review card` (exit 0)                                                                                                                                                                                                                                                                                                                                                                                     |

Also: `scripts/ci/check-plan-scope.sh` → `[check-plan-scope] OK: feat/B7.5-agent changes only paperwork`. Non-blocking:
`plan.md` is 58 lines (two tables carry most of it; same length round 1 passed).

Costs the lead takes on approval:

1. The amber contrast of `text-amber-700` / `dark:text-amber-400` is not measured [unverified]; the class string is
   pinned by §39.
2. The warning is not announced; a screen reader reaches it only in browse mode (§39 Out of scope).
3. After a `form` failure on a 180+ title the warning stays shown beside the §5 error (AC-39.4 (b)); it does not
   follow the §5 verdict. This one is not in `plan.md`'s Costs line; it is §39's stated rule, stated here instead.

Verdict: approved (ready for the lead's gate, not approved for build)
