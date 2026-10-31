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
