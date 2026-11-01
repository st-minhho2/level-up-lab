# B4.2 review

## Plan review (round 1)

SCOPE: all (`src/lib`, `src/components`, `e2e`; no `src/actions`, no `prisma/`)

Read: `plan.md` (1b64c9c), `spec/contracts/19-clear-search.md`, the §16 lines changed by 4e5ddb1, `analysis.md`,
`advice.md` (41128e5), D-7, D-19, D-22, D-24, card B4.2, `spec/features-map.md`, `src/components/todo-search-form.tsx`
and its test, `src/lib/errors.ts`, `scripts/verify-red.sh`, `scripts/ci/plan-files.sh`, `check-plan-scope.sh`,
`check-features-map.sh`, `check-spec-sections.sh`, `playwright.config.ts`, `stryker.config.mjs`, the B3.1 skeleton
4c7f1c6 (precedent). Ran: `pnpm test` → `Tests  190 passed (190)` (baseline confirmed); `pnpm exec playwright test
--list` → `Total: 35 tests in 13 files` (baseline confirmed, one project `chromium`); `scripts/ci/plan-files.sh --any
B4.2` → the 5 Files rows, nothing else; `git diff --stat origin/main...HEAD` → 7 files, all `backlog/` and `spec/`.

| Check                                                                             | Result                                                                                                                                                                                                                                                                                                                                                                                                   |
| --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: `clear-search.ts` and its test plus `e2e/21-clear-search.spec.ts` form the new F19 row (✗ in the skeleton; `check-features-map.sh` skips missing paths only on ✗ rows, as B3.1 did in 4c7f1c6); `todo-search-form.tsx` and its test are F14 and D-24 gives that file to B4.2; `page.tsx`, `todo-search.ts`, `todo-filter*.ts(x)`, `todo-item.tsx`, `remaining-count.tsx`, `src/*/CLAUDE.md` absent |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: three pure exports, explicit return types, closed `TodoFilter` input, no Prisma, no `server-only`, no action; `TodoSearchForm` signature unchanged and still without `'use client'`; signatures equal the §21 Function contracts block                                                                                                                                                             |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass, with a note: approach A as recommended. The F19 row lands ✗ in the skeleton (Files note and step 1), whereas advice Question 6 put it only in `docs(map)`; the plan calls this "Q6 as corrected by advice", which is the wrong label for a deviation (note 1)                                                                                                                                      |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: 7 criteria (2 lib, 2 component, 3 e2e); every Then is exact strings, hrefs, counts, row lists, addresses, `aria-current` or stored values; no banned adjective                                                                                                                                                                                                                                     |
| verification lists exact commands with expected numbers                           | pass: `verify-red.sh B4.2` exit 0 with 4 new failing; `pnpm test` 190 → 194 (2 + 2, matches the Files rows); `pnpm test:e2e` 35 → 38; e2e red 3 failed in the red body; mutation ≥ 70 and `clear-search.ts` 100; `pnpm build`; `check-plan-scope.sh` OK                                                                                                                                                  |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: `chore(todos): B4.2 skeleton` → `test(todos): B4.2 … (red)` → `feat(todos): B4.2 …` → `docs(map): F19 … [B4.2]` → `docs(backlog): B4.2 review …`                                                                                                                                                                                                                                                   |
| the section has a `Lead approves spec` box, ticked only by a human                | pass: `19-clear-search.md:5` `- [ ] Lead approves spec (lead, <date>)`, unticked; the plan says the lead's approval ticks it (D-7); not touched by this review                                                                                                                                                                                                                                           |
| no settled D-n contradicted                                                       | pass: D-22/D-24 (UI only in `todo-search-form.tsx`, logic in the card's own module, no `page.tsx`, no package guides; §16 out-of-scope line lifted in 4e5ddb1); D-19 (no config, dependency or Playwright project change); D-7 (approve ticks the box)                                                                                                                                                   |
| `scripts/next-task.sh --check B4.2` on the committed plan says no overlap         | pass: `[next-task] B4.2: no overlap with any Doing or Review card` (exit 0, run on 1b64c9c)                                                                                                                                                                                                                                                                                                              |

Probed: the AC-21.4 red route holds. `NotImplementedError` reads `isSearchInEffect is not implemented`, which matches
none of `verify-red.sh`'s import-error patterns (`is not defined` and the others), so the failure counts as behavior.
JavaScript-off AC-21.7 is feasible without config: `src/app` has no `loading.tsx` and no `Suspense`, so with scripts off
the server HTML holds the full list and the anchor. No `javaScriptEnabled` exists yet anywhere in `e2e/` or
`playwright.config.ts`, so this is the repo's first such test (advice states the `browser.newContext` fallback). No
existing locator collides with a "Clear search" link: every `getByRole('link'` in `e2e/` is scoped to the "Filter
todos" navigation, `searchButton` is `exact: true`, and the AC-16.5 tests use a string `name` (exact) for the button
and count no links.

Verdict: approved (ready for the lead's gate, not approved for build)

Costs the lead approves with this plan (none blocks):

1. **Mislabelled deviation.** Plan line 7 says "Q6 as corrected by advice (F19 row in `docs(map)` after feat)", but lines
   22 and 53 add the row ✗ in the skeleton and flip it to ✅ in `docs(map)`. The skeleton row is the better choice:
   it follows the B3.1 precedent and keeps `check-features-map.sh` green on every commit instead of red on the
   skeleton, as advice accepted. The cost is only that the plan's own sentence misdescribes it.
2. **AC-21.4 is red only through an added lib call.** The unchanged component already shows no link, so the
   markup half of AC-21.4 is green before any code. The plan makes the test red with an extra
   `expect(isSearchInEffect(q)).toBe(false)` per render, which throws on the stub. The cost is that the red commit
   never shows the "no link" assertions failing, and the component test repeats an AC-21.2 fact. After green, a
   reverted conditional (link always rendered) still fails AC-21.4's markup assertions, so the criterion keeps its
   force. Any red proof for a negative criterion has this limit.
3. **Client navigation versus Out of scope.** §21 Out of scope lists "client-side navigation by script", but the Function
   contract requires `next/link`. After hydration, `next/link` navigates on the client, and advice counts that as a
   plus of A. The contract block is exact and governs (spec-fidelity). The anchor still has a real `href` (REQ-21.5,
   proven by AC-21.7 with scripts off). The lead approves A knowing that the contract, not the Out-of-scope line,
   decides this.
4. **Stale red reason on the card.** The card's Test line says AC-21.1 is "red because: `src/lib/clear-search.ts` does
   not exist". That would be an import failure, which `testing.md` and `verify-red.sh` reject. With the planned
   skeleton, the real reason is `NotImplementedError`. The red commit body should state that reason, not copy the
   card's.
5. **Length.** 59 lines against planning.md's ≈ 40. Precedent: B3.2 59, B3.1 69, B2.3/B2.4 93. One section, five
   code/test files; no split needed.

Riskiest unfalsified: AC-21.5's hydrated path, `next/link` from `/?filter=active&q=milk` to `/?filter=active`. The plan
relies on the RSC refetch changing the input `key` so the box remounts empty. I could not run e2e at plan time; AC-21.5
and AC-21.7 prove it at build.
