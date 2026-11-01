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

## Diff review (pass 1)

SCOPE: all (`src/lib`, `src/components`, `e2e`; no `src/actions`, no `prisma/`)

Reviewed at 5095e67 against base 38d4b4c (merge-base with `origin/main`; `origin/main` is now bac26da, B4.3). §21
(`spec/contracts/19-clear-search.md`), `plan.md` (approved 2026-11-01). Commits: skeleton 0118ee5 → red b5fc079 →
feat f0646cf → map 5095e67.

### Commands (run here, last line of each)

| Command                                        | Result                                                                                                                                                             |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm lint`                                    | `All matched files use Prettier code style!` (exit 0; 1 warning, `todo-form.tsx:23`, not in this diff)                                                             |
| `pnpm typecheck`                               | `tsc --noEmit` (exit 0)                                                                                                                                            |
| `pnpm test`                                    | `Tests  194 passed (194)` (31 files)                                                                                                                               |
| `pnpm test:e2e`                                | `38 passed (45.1s)`                                                                                                                                                |
| `pnpm test:mutation`                           | `Final mutation score of 93.20 is greater than or equal to break threshold 70`; `clear-search.ts` 100.00 (11 killed)                                               |
| `scripts/ci/check-suppressions.sh`             | `OK: no new suppressions`                                                                                                                                          |
| `scripts/ci/check-config-change.sh`            | `OK: no protected config changed`                                                                                                                                  |
| `scripts/ci/check-feat-commits.sh`             | `OK: no feat commit touches tests`                                                                                                                                 |
| `scripts/ci/check-ac-coverage.sh`              | `OK: every criterion of a shipped section has a test` (§21 index row ✗, so skipped; checked by hand below: 7 of 7)                                                 |
| `scripts/ci/check-spec-sections.sh`            | `OK: sections cited: 1 … 19 21`                                                                                                                                    |
| `scripts/ci/check-features-map.sh`             | `OK`                                                                                                                                                               |
| `scripts/ci/check-plan-scope.sh`               | `OK: feat/B4.2-clear-search stays inside the approved plan of B4.2`                                                                                                |
| `scripts/verify-red.sh B4.2`                   | `::error::B4.2 tests are not red for the right reason` (exit 1): the known false result on the 2 unchanged AC-16.5 titles (B1.25, lead's ruling); not counted      |
| own red probe (skeleton sources + red tests)   | `Tests  4 failed \| 2 passed (6)`: AC-21.1/21.2/21.4 on `NotImplementedError`, AC-21.3 on `Unable to find … role "link" and name "Clear search"`; AC-16.5 ×2 green |
| `git diff --stat origin/main...HEAD`           | 16 files: 5 build files of the plan, `docs/metrics.md`, `spec/features-map.md` and `backlog/`/`spec/` paperwork                                                    |
| `git merge-tree --write-tree origin/main HEAD` | conflicts only in `docs/metrics.md`, `spec/features-map.md`, `spec/technical-requirements.md` (row order, as the plan predicted)                                   |

### Checklist

| Check                                                | Result                                                                                                                                                                                                                                                                                                                                                |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every AC-§.n has a test whose assertion matches Then | pass: 21.1, 21.2 in `clear-search.test.ts`; 21.3, 21.4 in `todo-search-form.test.tsx`; 21.5–21.7 in `e2e/21-clear-search.spec.ts`. Each Then clause read against its assertions (hrefs, label, 6 booleans, link/button/searchbox/listitem/hidden counts, document order, addresses, rows, empty box, `aria-current`, reload, stored titles and flags) |
| no test weakened after the red commit                | pass: `git log --first-parent --no-merges b5fc079..HEAD -- '*.test.*' e2e/` empty; `--merges --remerge-diff` empty (the only merge, c6ebd42, precedes the red); `todo-search-form.test.tsx` diff has 0 removed lines; no `only`/`skip`/`todo`                                                                                                         |
| every changed file is in `plan.md`                   | pass: the 5 Files rows; `docs/metrics.md` and `spec/features-map.md` are the plan's paperwork line                                                                                                                                                                                                                                                    |
| interfaces match §21 Function contracts              | pass: `CLEAR_SEARCH_LABEL = 'Clear search'`, `isSearchInEffect` = `query.trim() !== ''`, `clearSearchHref` = `'all' ? '/' : /?filter=…`; `TodoSearchForm` signature unchanged, no `'use client'`, `<Link>` after the submit button inside the `<form>`, no `aria-label`; input `key` unchanged                                                        |
| Zod at every action boundary                         | n/a: no action changed                                                                                                                                                                                                                                                                                                                                |
| Prisma only in `src/lib`; no raw SQL                 | pass: `clear-search.ts` imports only a type; Prisma only in the e2e seed, as in `e2e/16`                                                                                                                                                                                                                                                              |
| migration reversible and indexed                     | n/a: no migration                                                                                                                                                                                                                                                                                                                                     |
| no secret, no suppression                            | pass (`check-suppressions.sh`; diff read)                                                                                                                                                                                                                                                                                                             |
| features map row moved                               | pass: F19 ✗ (0118ee5) → ✅ (5095e67); §21 index row stays ✗ until the closing PR, as planned                                                                                                                                                                                                                                                          |
| would a test fail if one changed line were reverted? | pass, probed on a copy (below)                                                                                                                                                                                                                                                                                                                        |

### Probes (on a copy, not the tree)

Component file mutated, `todo-search-form.test.tsx` run:

| Mutation                                         | Result                                             |
| ------------------------------------------------ | -------------------------------------------------- |
| conditional removed (link always rendered)       | AC-21.4 fails (`queryAllByRole('link')` 1, not 0)  |
| condition `query !== ''` (no trim)               | AC-21.4 fails on `(completed, '   ')`              |
| `href="/"` always                                | AC-21.3 fails                                      |
| `href` always `/?filter=${filter}` (no All case) | AC-21.3 fails                                      |
| link moved before the "Search" button            | AC-21.3 fails (`compareDocumentPosition` 2, not 4) |
| link moved outside the `<form>` (fragment)       | AC-21.3 fails (landmark does not contain it)       |
| `<Link>` replaced by `<button type="button">`    | AC-21.3 fails (no role `link`)                     |

The caller's question 2: AC-21.4 does catch a reverted conditional through its markup assertions; its
`isSearchInEffect` line only carried the red.

The caller's question 1, e2e on the copy (port 3197, own dist dir):

- A `window` marker set after hydration survives the click from `/?filter=active&q=milk` and from `/?q=milk`, so the
  click goes through the client router, not a document load.
- With the real code, typing `eggs` into the box (not submitted) and clicking "Clear search" leaves the box empty on
  both paths: the `key` changes because the query changes, and the input remounts.
- With the input `key` reduced to `{filter}` (a §16 line, not changed here), AC-21.5 still passes (`1 passed`), while
  the `eggs` probe leaves `eggs` in the box. When the person never typed, the box empties anyway: React updates the
  `value` attribute and the input is not dirty. So AC-21.5 proves "empty box" only for an untouched box. The code is
  right; the criterion cannot detect a regression of the key. Note 1.

The caller's question 3, layout probe (`/` vs `/?q=milk`, document `scrollWidth`):

| Viewport | `/` (no link)                                | `/?q=milk`                                                        |
| -------- | -------------------------------------------- | ----------------------------------------------------------------- |
| 320 px   | 326 (already 6 px over: the "Search" button) | 377; the link sits at x 334..377, wholly off screen, 2 lines tall |
| 375 px   | 375 (fits)                                   | 377 (2 px horizontal scroll); input shrinks 218 → 201 px          |

The form has no `flex-wrap`, and the input does not shrink below about 201 px. No section governs this: §7 has no layout
or width rule, and §21 puts layout outside the search form out of scope. So this is not a finding. Note 2.

### Findings

None blocking (0 confirmed, 0 plausible).

Notes for the lead (not findings, no section violated):

1. **Dirty-box coverage gap.** No criterion of §16 or §21 types into the box before leaving the search, so a future
   change of the input `key` that drops the query would pass AC-21.5 (probed). A criterion "type text, do not submit,
   click Clear search, box is empty" would need a §21 change through §8.
2. **Narrow widths.** At 375 px the link adds 2 px of horizontal scroll. At 320 px it renders entirely past the
   viewport. A `flex-wrap` on the form would fix both, but it changes §16 markup classes and needs a card.
3. **verify-red.sh** exits 1 falsely here (B1.25). My own run of the red tests on the skeleton sources shows 4 red for
   the right reason and the 2 AC-16.5 tests green.
4. **Merge with `origin/main` (bac26da, B4.3)** conflicts only in the three paperwork rows. §22 does not change "2 items
   left" for the AC-21.6 store, which has 2 open todos.

Verdict: ready for PR

Riskiest unfalsified: the client-router path under `pnpm build && pnpm start` (CI's web server), where `next/link`
prefetches in production. A cached RSC payload for `/` from before a mutation on `/?q=milk` could show stale rows
after "Clear search". Next 15's dynamic `staleTimes` default is 0 and the page is `force-dynamic`, so I expect a
refetch. I ran e2e only against `pnpm dev`, which does not prefetch.
