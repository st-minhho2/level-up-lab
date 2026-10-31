# B2.1 review

SCOPE: all (`src/lib`, `src/components`, `src/app`, `e2e`)

## Plan review (round 1)

Plan at `3257152`. Read: `plan.md`, `analysis.md`, `advice.md`, `spec/contracts/10-filter.md` (§12), D-7, D-20,
`.claude/agents/dev-lead.md` (plan template), `scripts/ci/check-plan-scope.sh`, `scripts/ci/check-features-map.sh`,
`scripts/verify-red.sh`, B2.2's plan on `feat/B2.2-remaining-count` (`b69db78`).

| Check                                                                             | Result                                                                                                                                                                                                                                                                                                                                                                                                       |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| every file in the plan belongs to the section's features (map)                    | pass: `todo-filter.ts`, `todo-filter-nav.tsx`, `page.tsx` and the three test files form the new F10 (§12) row; `page.tsx` is already in F3/F7; the rest is docs/paperwork. `scripts/ci/plan-files.sh --any B2.1 HEAD` prints exactly the 10 Files rows. The ✗ F10 row lands in the skeleton commit, which `check-features-map.sh` needs (it fails on any `src/lib/*.ts` or `src/components/*.tsx` in no row) |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: signatures are §12's Function contracts verbatim; explicit return types; string-literal union; inline readonly props match `ClearCompletedButton`; no action, no Prisma in `src/` outside `src/lib`; e2e seeding through `PrismaClient` is the `e2e/CLAUDE.md` convention                                                                                                                              |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: Approach A                                                                                                                                                                                                                                                                                                                                                                                             |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: AC-12.1 to AC-12.7; every Then is ids, exact strings, `href`s, counts or `aria-current` presence                                                                                                                                                                                                                                                                                                       |
| verification lists exact commands with expected numbers                           | **fail**: see reason 1                                                                                                                                                                                                                                                                                                                                                                                       |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: `chore(todos): B2.1 skeleton` → `test(todos): B2.1 filter the list (red)` → `feat(todos): B2.1 filter the list` → `docs(map): F10 filter the list [B2.1]` → diff review                                                                                                                                                                                                                                |
| the section has a `Lead approves spec` box, ticked only by a human                | pass: `spec/contracts/10-filter.md:5` `- [ ] Lead approves spec (lead, <date>)`, unticked; the plan leaves the tick to the lead's `approve` (D-7), as B1.4–B1.11 did in their `plan approved` commits                                                                                                                                                                                                        |
| no settled D-n contradicted                                                       | pass: D-20 (a) own modules, `todos.ts` and `actions/todos.ts` untouched, `page.tsx` held by this card; D-7 tick by the lead only                                                                                                                                                                                                                                                                             |
| `scripts/next-task.sh --check B2.1` on the committed plan                         | pass: `[next-task] B2.1: no overlap with any Doing or Review card` (run at `3257152`, exit 0)                                                                                                                                                                                                                                                                                                                |

Probe (scratch copy, not the tree): a jsdom test rendering three `next/link` `<Link>`s inside `<nav aria-label="Filter
todos">` with no mock passed 1/1 (`href`s, `aria-current="page"` present on one, absent on `aria-current={undefined}`,
0 `listitem`). The advice's "`next/link` in jsdom" risk is falsified: AC-12.4 needs no mock.

Baselines measured for reason 1: `pnpm test` → `Tests 115 passed (115)`; `npx playwright test --list` →
`Total: 13 tests in 5 files`.

Verdict: changes requested

1. **Verification has no exact unit count.** `pnpm test   # 115 → ≈ 121 green` gives the diff reviewer nothing to
   compare: "≈ 121" passes at 119 and at 125. Trigger: the test-writer splits AC-12.4 into two tests (`'active'`, then
   `'all'`, one behavior per test) and AC-12.2 into one test per input; the count lands anywhere from 119 to 130 and
   the plan line is neither met nor missed. Fix: an exact number, or a floor tied to titles, e.g. "115 existing
   unchanged + ≥ 4 new, one or more per AC-12.1 to AC-12.4 title; 0 failed".
2. **Verification gives no e2e total and names only part of the suite.** `05, 09, 10 unchanged` omits
   `e2e/06-edit-title.spec.ts` (4 tests) and `e2e/smoke.spec.ts` (2), both of which load `/` and so run through the
   edited `page.tsx`. Fix: `pnpm test:e2e → 13 existing + 3 new = 16 passed` (or the exact new count if AC-12.7's three
   states are separate tests).
3. **Stale overlap sentence.** The plan says "B2.2 had no plan yet". B2.2's plan now exists (`b69db78` on
   `feat/B2.2-remaining-count`) and does not list `src/app/page.tsx` (its phase B waits for this card's merge), so the
   re-run above still reports no overlap. Update the sentence to the result at `3257152`, so the lead approves on the
   current board.

Costs the lead accepts by approving (none blocks; listed so they are not found after approval):

- `approve` also approves §12, including "No active todos" / "No completed todos" and REQ-12.10: under Active,
  "Clear completed" is enabled and deletes completed todos the person cannot see (AC-12.6 asserts exactly that).
- Following any filter link drops every other query parameter (links are `/`, `/?filter=active`,
  `/?filter=completed`); B2.5 (search) will need a `docs(spec)` change to REQ-12.6 to keep its parameter.
- Under Active, checking a todo removes its row on revalidation (REQ-12.11): the checkbox that had keyboard focus
  unmounts and focus falls to the document. §12 says nothing about focus and no test covers it.
- `page.tsx` is held by this card until merge: B2.2's phase B (mounting the count) waits for it (D-20 (a)).
- REQ-12.10 and REQ-12.11 live only in `page.tsx` and are held only by e2e AC-12.6, which mutation testing does not
  cover (`page.tsx` is outside Stryker's `mutate` globs).
- If AC-12.6 shows the filter lost after `revalidatePath('/')`, the fix touches `src/actions/todos.ts` and the plan
  stops for re-approval (the plan's own Risk line). `TodoItem` and `ClearCompletedButton` call the actions without a
  router call, so the current URL with its query is what re-renders; not falsified without a running server.

## Plan review (round 2)

Plan at `5aeb4d3`. `git diff be8f63d 5aeb4d3` touches only `plan.md` (5 lines: the overlap sentence, the two
verification lines, the status footer); Files, Interfaces and Work breakdown are byte-identical to round 1. §12
(`spec/contracts/10-filter.md`) unchanged since `d6cbb31`; B2.2's branch tip is still `b69db78`.

| Check                                                                             | Result                                                                                                                                                                                                                                                  |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: unchanged from round 1; `scripts/ci/plan-files.sh --any B2.1 HEAD` still prints exactly the 10 Files rows                                                                                                                                         |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: Interfaces block unchanged, still §12's Function contracts verbatim                                                                                                                                                                               |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: Approach A                                                                                                                                                                                                                                        |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: AC-12.1 to AC-12.7, unchanged                                                                                                                                                                                                                     |
| verification lists exact commands with expected numbers                           | pass: round-1 reasons 1 and 2 fixed. `pnpm test` → "115 unchanged + ≥ 4 new (≥ 1 per AC-12.1–12.4) green" is a floor tied to titles; `pnpm test:e2e` → "13 + 3 = 16 passed", naming 05, 06, 09, 10 and smoke (the 6 files under `e2e/` after this card) |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: unchanged                                                                                                                                                                                                                                         |
| the section has a `Lead approves spec` box, ticked only by a human                | pass: `spec/contracts/10-filter.md:5` still `- [ ] Lead approves spec (lead, <date>)`; left to the lead's `approve` (D-7)                                                                                                                               |
| no settled D-n contradicted                                                       | pass: D-20 (a) and D-7 as in round 1                                                                                                                                                                                                                    |
| `scripts/next-task.sh --check B2.1` on the committed plan                         | pass: `[next-task] B2.1: no overlap with any Doing or Review card` (run at `5aeb4d3`, exit 0). Round-1 reason 3 fixed: the plan now cites B2.2's `b69db78`, which still lists no `src/app/page.tsx`                                                     |

Note (not blocking): the plan's footer reads `Rounds: 1`; after this review it is 2. The e2e "+ 3" commits the
test-writer to one test per AC-12.5 to AC-12.7; if AC-12.7's three states land as separate tests the total moves to 18
and the diff reviewer will ask for it to be stated in the red commit body.

Costs the lead accepts by approving: the six listed under round 1 stand unchanged (§12 approved with its two new
empty texts and REQ-12.10's hidden-clear behavior; filter links drop other query parameters, which B2.5 must change in
the spec; focus lost when a checked row leaves the Active list; `page.tsx` held until merge, B2.2 phase B waits;
REQ-12.10/12.11 held only by e2e AC-12.6, outside Stryker; the `revalidatePath('/')` filter-retention risk, which
stops for re-approval if it materialises).

Verdict: approved (ready for the lead's gate, not approved for build)

## Diff review (pass 1)

Range `origin/main...1c20326` (skeleton `0336a6c`, red `e0b4e64`, feat `8902054`, map `1c20326`). Scope: all (lib,
ui; no `src/actions` change). Every gate below re-run by the reviewer at `1c20326`.

### Commands (last line of each)

| Command                              | Last line                                                                                                                                         |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                          | `All matched files use Prettier code style!` (exit 0)                                                                                             |
| `pnpm typecheck`                     | `tsc --noEmit` (exit 0, no output)                                                                                                                |
| `pnpm test`                          | `Tests  119 passed (119)` (115 + 4 new)                                                                                                           |
| `pnpm test:e2e`                      | `16 passed (23.9s)` (13 + 3 new)                                                                                                                  |
| `pnpm test:mutation`                 | `Final mutation score of 89.94 is greater than or equal to break threshold 70`; `todo-filter.ts` 15 killed, 0 survived, 0 no-cov, 18 CompileError |
| `pnpm build` (CI runs it before e2e) | route table printed, `ƒ /` dynamic (run on a copy)                                                                                                |
| `scripts/ci/check-suppressions.sh`   | `OK: no new suppressions`                                                                                                                         |
| `scripts/ci/check-config-change.sh`  | `OK: no protected config changed`                                                                                                                 |
| `scripts/ci/check-feat-commits.sh`   | `OK: no feat commit touches tests`                                                                                                                |
| `scripts/ci/check-ac-coverage.sh`    | `OK: every criterion of a shipped section has a test` (§12 still ✗; on a copy with §12 ✅: `§12 criteria=7 covered=7`)                            |
| `scripts/ci/check-spec-sections.sh`  | `OK: sections cited: 1 2 3 4 5 6 7 8 9 10 11 12`                                                                                                  |
| `scripts/ci/check-features-map.sh`   | `OK`                                                                                                                                              |
| `scripts/ci/check-plan-scope.sh`     | `OK: feat/B2.1-filter stays inside the approved plan of B2.1`                                                                                     |
| `scripts/ci/check-backlog.sh`        | `OK: README matches the cards`                                                                                                                    |
| `scripts/verify-red.sh B2.1`         | `RESULT: red for the right reason` (unit 3/3 and component 1/1 new failed; e2e skipped, needs a server)                                           |

### Checklist

| Check                                      | Result                                                                                                                                                                                                                             |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every AC-12.n has a test matching its Then | pass: 12.1–12.3 `src/lib/todo-filter.test.ts`, 12.4 `src/components/todo-filter-nav.test.tsx`, 12.5–12.7 `e2e/12-filter.spec.ts`; each assertion list matches its Then cell value for value                                        |
| no test weakened after red                 | pass: `git log --first-parent --no-merges e0b4e64..HEAD -- '*.test.*' e2e/` empty; `--merges --remerge-diff` empty                                                                                                                 |
| every changed file in `plan.md`            | pass: the 10 Files rows; `check-plan-scope.sh` OK                                                                                                                                                                                  |
| interfaces match §12 Function contracts    | pass: the four `todo-filter.ts` exports, `TodoFilterNav`, `HomePage({ searchParams })` are byte-for-byte the contract; nav sits between `<ClearCompletedButton>` and the list in both states                                       |
| Zod at every action boundary               | n/a: `src/actions/todos.ts` unchanged; `searchParams` is a read, parsed by `parseTodoFilter` (closed union)                                                                                                                        |
| Prisma only in `src/lib`; no raw SQL       | pass: `todo-filter.ts` is pure; `e2e/12-filter.spec.ts` seeds with `PrismaClient` as `09-clear-completed` does                                                                                                                     |
| migration reversible and indexed           | n/a: no `prisma/` change                                                                                                                                                                                                           |
| no secret, no suppression                  | pass                                                                                                                                                                                                                               |
| features map row moved                     | pass: F10 ✅ in `1c20326`; §12 index stays ✗ until the closing commit                                                                                                                                                              |
| one changed line reverted → a test fails   | 3 of 4 `page.tsx` probes killed, 1 survives (finding 1). Killed: `disabled={!shown.some…}` → AC-12.6 `toBeEnabled` fails; `emptyListMessage(filter, shown.length)` → AC-12.7 fails; `filterTodos(todos, 'all')` → AC-12.5/6/7 fail |

Answers to the dev-lead's three questions:

- AC-12.6 does prove the filter survives `revalidatePath('/')`. `TodoItem` has no optimistic state (`checked={todo.completed}`),
  so rows read `['B']` only after the server re-render applies `?filter=active`; a lost filter would read `[D, C, B]`
  and the auto-retrying `toHaveText(['B'])` would time out. The post-clear half is weaker: rows were already `['B']`, the
  URL never changes client-side, and `toBeDisabled()` can pass while `ClearCompletedButton` is `pending`
  (`disabled={disabled || pending}`) before the re-render lands. No plausible bug passes because of it (with only B
  stored every derivation gives disabled; AC-9.2 holds the derivation on load).
- The no-`default` `switch` in `filterTodos` is fine: the `TodoFilter` return type makes it exhaustive, Stryker's
  case/block mutants on it are `CompileError` (not survivors), and `todo-filter.ts` scores 100 %.
- 05, 06, 09, 10 assert what they did: none of those files changed in this range; the nav adds no `<li>` (every
  `getByRole('listitem')` count is unchanged) and its text "AllActiveCompleted" contains none of the `getByText`
  strings ("No todos yet"). All 13 pre-existing e2e tests pass.

### Findings

```
[1] KIND: coverage
    WHERE: src/app/page.tsx:29 (`<TodoFilterNav selected={filter} />`), e2e/12-filter.spec.ts:65-83
    DEFECT: the page's wiring of the selected filter into the nav (REQ-12.7 on `/`) is asserted nowhere; a constant `selected` ships green.
    TRIGGER: on a copy, page.tsx line 29 changed to `<TodoFilterNav selected="all" />`; `playwright test e2e/12-filter.spec.ts` → 3 passed; no other test references aria-current outside todo-filter-nav.test.tsx (which renders the component directly, not the page).
    WRONG BEHAVIOUR: on `/?filter=active` and `/?filter=completed` "All" carries aria-current="page" and the selected link none; REQ-12.7 (covered by AC-12.5) requires the selected link marked. page.tsx is outside Stryker's mutate globs, so nothing else catches it.
    CONFIDENCE: confirmed (I ran it)
```

Fix (test-writer, `test(todos): B2.1 review pass 1 -- aria-current follows the address`): in AC-12.5, after the
"Active" click and after the reload assert "Active" has `aria-current="page"` and the other two none, and the same
for "Completed" after its click. No `src/` change expected; the current code should pass it.

Verdict: back to test-writer

Riskiest unfalsified: the post-clear half of AC-12.6 can pass on the `pending`-disabled button before the
re-render lands, so the filter surviving the clear's `revalidatePath('/')` is proven only by the toggle step.

## Diff review (pass 2)

Range `origin/main...bb91542` (`origin/main` = merge base `fa98ab2`). New since pass 1: `bb91542`
`test(todos): B2.1 review pass 1 -- aria-current follows the address on the page` (`e2e/12-filter.spec.ts` +15 −0),
no `src/` change. Scope: all (lib, ui; `src/actions` unchanged). Every gate below re-run by the reviewer at `bb91542`.

### Commands (last line of each)

| Command                             | Last line                                                                                                              |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                         | `All matched files use Prettier code style!` (exit 0)                                                                  |
| `pnpm typecheck`                    | `tsc --noEmit` (exit 0, no output)                                                                                     |
| `pnpm test`                         | `Tests  119 passed (119)`                                                                                              |
| `pnpm test:e2e`                     | `16 passed (19.5s)`                                                                                                    |
| `pnpm test:mutation`                | `Final mutation score of 89.94 is greater than or equal to break threshold 70`; `todo-filter.ts` 15 killed, 0 survived |
| `scripts/ci/check-suppressions.sh`  | `OK: no new suppressions`                                                                                              |
| `scripts/ci/check-config-change.sh` | `OK: no protected config changed`                                                                                      |
| `scripts/ci/check-feat-commits.sh`  | `OK: no feat commit touches tests`                                                                                     |
| `scripts/ci/check-ac-coverage.sh`   | `OK: every criterion of a shipped section has a test`                                                                  |
| `scripts/ci/check-spec-sections.sh` | `OK: sections cited: 1 2 3 4 5 6 7 8 9 10 11 12`                                                                       |
| `scripts/ci/check-features-map.sh`  | `OK`                                                                                                                   |
| `scripts/ci/check-plan-scope.sh`    | `OK: feat/B2.1-filter stays inside the approved plan of B2.1`                                                          |
| `scripts/ci/check-backlog.sh`       | `OK: README matches the cards`                                                                                         |
| `scripts/verify-red.sh B2.1`        | `RESULT: red for the right reason` (unit 3/3, component 1/1 new failed; e2e skipped, needs a server)                   |
| `git diff --stat main...HEAD`       | `18 files changed, 959 insertions(+), 8 deletions(-)`                                                                  |

### Finding [1] of pass 1

Closed (confirmed). On a copy of `bb91542` with `src/app/page.tsx:29` → `<TodoFilterNav selected="all" />`,
`playwright test e2e/12-filter.spec.ts` → 1 failed, 2 passed: AC-12.5 fails at `e2e/12-filter.spec.ts:79` (after
"Active") in `expectOnlySelected` (`expect(locator).not.toHaveAttribute() failed` on "All"). A narrower mutant,
`selected={filter === 'completed' ? 'all' : filter}`, also fails AC-12.5 in `expectOnlySelected`, so the new
"Completed" step is load-bearing, not only the "Active" one.

### Checklist

| Check                                      | Result                                                                                                                                                                                                                             |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every AC-12.n has a test matching its Then | pass: unchanged from pass 1; AC-12.5 now also asserts REQ-12.7 on the page after each of the four navigations                                                                                                                      |
| no test weakened after red                 | pass: `git log --first-parent --no-merges e0b4e64..HEAD -- '*.test.*' e2e/` lists only `bb91542`, a `test(...)` commit that adds 15 lines and removes 0 (one helper, four calls; title unchanged); `--merges --remerge-diff` empty |
| every changed file in `plan.md`            | pass: `bb91542` touches `e2e/12-filter.spec.ts`, a Files row; `check-plan-scope.sh` OK                                                                                                                                             |
| interfaces match §12 Function contracts    | pass: re-read against `spec/contracts/10-filter.md`; no change since pass 1                                                                                                                                                        |
| Zod at every action boundary               | n/a: no `src/actions` change                                                                                                                                                                                                       |
| Prisma only in `src/lib`; no raw SQL       | pass                                                                                                                                                                                                                               |
| migration reversible and indexed           | n/a: no `prisma/` change                                                                                                                                                                                                           |
| no secret, no suppression                  | pass                                                                                                                                                                                                                               |
| features map row moved                     | pass: F10 ✅; §12 index ✗ until the closing commit, as the plan states                                                                                                                                                             |
| one changed line reverted → a test fails   | pass: all four pass-1 `page.tsx` probes now killed; added probe `{shown.length > 0 && <TodoFilterNav … />}` (nav hidden in an empty view) → AC-12.7 fails in `expectFilterLinksVisible`                                            |

Whole-diff re-read for anything pass 1 missed: the spec edit to `03-todos.md` sits in `d6cbb31 docs(spec): §12`
under D-20; the card's `Spec:`/`Test:` lines and the metrics row (red `e0b4e64`, feat `8902054`, 89.94) match the
commits; a repeated `filter` parameter arrives as an array and falls to All; `emptyListMessage` takes the unfiltered
count, so clearing under Completed with open todos left reads "No completed todos" (REQ-12.8). No new finding.

### Findings

None blocking.

Verdict: ready for PR

Riskiest unfalsified: the post-clear half of AC-12.6 (carried from pass 1): `toBeDisabled()` can pass on the
`pending`-disabled button before the re-render lands, so the filter surviving the clear's `revalidatePath('/')` is
proven only by the toggle step; no mutant within this card's files makes it ship wrong.
