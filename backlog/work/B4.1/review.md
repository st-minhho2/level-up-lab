# B4.1 review

## Plan review (round 1)

SCOPE: all (`src/lib`, `src/components`, `e2e`; no `src/actions`, no `prisma/`)

Reviewed at `2b05b36`: `plan.md` (58 lines), `analysis.md`, `advice.md`, `spec/contracts/18-created-date.md` (§20),
D-7, D-22, D-24 (`00-decisions.md:17,47,49`), card B4.1 (`plan/E4-*.md:8-17`), `src/components/todo-item.tsx`,
`src/components/todo-due-date.tsx`, `src/components/todo-due-date-overdue.test.tsx`, `src/components/CLAUDE.md`,
`src/lib/CLAUDE.md`, `e2e/CLAUDE.md`, the `new-feature-slice` skill, `scripts/verify-red.sh`, `stryker.config.mjs`,
the B3.1 skeleton (`4c7f1c6`) as precedent, `c0d4593` (#106, the guides PR).

Ran here: `scripts/next-task.sh --check B4.1` → `[next-task] B4.1: no overlap with any Doing or Review card`;
`pnpm test` → `Tests  190 passed (190)` (plan baseline holds); `grep -cE '^\s*test\(' e2e/*.spec.ts` → 35 (plan
baseline holds); `check-features-map.sh` → `OK`; `check-spec-sections.sh` → `OK: sections cited: 1 … 20`;
`check-ac-coverage.sh` → `§20: ✗, no tests expected yet (6 criteria)`; `plan-files.sh --any B4.1` → the 5 Files
paths, none protected.

Probe on a copy (`git archive HEAD` under the session scratchpad, never the tree): Approach A as the advice writes it
(`todo-created.ts` with UTC getters; one empty `<time dateTime data-created className="… after:content-[attr(data-created)]">`
after `<TodoDueDate>`) plus two throwaway tests shaped like AC-20.3 and AC-20.4 (`renderToString` under `Asia/Tokyo` and
`America/Los_Angeles` with faked `Date`, then `hydrateRoot`): `vitest run` → `Tests  192 passed (192)`, so all 190
existing tests stay green unchanged (the §20 test note holds), 0 `onRecoverableError`, the two strings identical,
`li.textContent` exactly `Walk the dog`; `tsc --noEmit` exit 0; `eslint` on both files 0 problems. e2e not probed (no
server run here); Tailwind compilation and computed `::after` content rest on the advice's `[probed]` Chromium run.

| Check                                                                                  | Result                                                                                                                                                                                                                                                                                                                   |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| every file in the plan belongs to the section's features (map)                         | pass: `todo-created.ts` and `todo-item.tsx` are the only `src/` files §20's Function contracts allow ("No file other than …"); the 3 test files are the ones advice and §20's test note name; F18 lands ✗ in the skeleton (needed: `check-features-map.sh` requires every `src/lib/*.ts` in a row) and ✅ in `docs(map)` |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib         | pass: signatures copy §20 exactly (explicit return types, `readonly` props, literal-typed constant); `todo-created.ts` is pure like `todo-overdue.ts` (no Prisma, no `server-only`, safe in a client component); no mutation, action, schema, env key or migration                                                       |
| plan follows `advice.md`'s recommendation or states the deviation                      | pass: Approach A, the advice's recommendation, with B and C named for the lead at the gate                                                                                                                                                                                                                               |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number              | pass: AC-20.1 to AC-20.6 (6); every Then is an exact string, count, `childNodes.length`, call count or a ≥ 1 px box; "visible" is defined by the 1 px box (REQ-20.4). AC-20.6's Kiritimati local days (Nov 4, Nov 2, Nov 2) recomputed and correct                                                                       |
| verification lists exact commands with expected numbers                                | pass: `verify-red.sh B4.1` exit 0 with 5 new red tests; `pnpm test` 190 → 195; `pnpm test:e2e` 35 → 36; `test:mutation` ≥ 70 (`todo-created.ts` 100); `pnpm build`; `check-plan-scope.sh`. Both baselines confirmed above                                                                                                |
| work breakdown has skeleton → red → green → map → review with convention subjects      | pass: `chore(todos): B4.1 skeleton` → `test(todos): B4.1 … (red)` → `feat(todos): B4.1 …` → `docs(map): F18 … [B4.1]` → `docs(backlog): B4.1 review …`; skeleton keeps `todo-item.tsx` unchanged so AC-20.3–20.5 fail on an assertion and AC-20.1–20.2 on `NotImplementedError`, as B3.1's skeleton did                  |
| the section has a `Lead approves spec` box, ticked only by a human (D-7), never by you | pass: `18-created-date.md:5` `- [ ] Lead approves spec (plan gate of B4.1; D-22, D-24)`, unticked; untouched by this review                                                                                                                                                                                              |
| no settled D-n contradicted                                                            | fail: the action complies with D-22/D-24 (UI only in `todo-item.tsx`, logic in its own module, no `page.tsx`, no guide edit, one approval), but the plan cites D-24 for an "orchestrator's docs PR after the batch" that D-24 does not provide (reason 1)                                                                |
| `scripts/next-task.sh --check B4.1` says no overlap                                    | pass: `[next-task] B4.1: no overlap with any Doing or Review card`                                                                                                                                                                                                                                                       |

Verdict: changes requested

1. **The plan misstates D-24, and the guide drift it leaves has no owner.** `plan.md:21-22` says the package guides are
   "left out per D-24 (orchestrator's docs PR after the batch …)". That is D-22's batch-3 wording
   (`00-decisions.md:47` "the orchestrating session updates them in one docs PR after the batch"). D-24
   (`00-decisions.md:49`) says instead "The package guides are updated before the batch (own PR), so card plans still
   leave them out", and that PR is `c0d4593` (#106, §17–§19 only), already on this branch. No ruling, card or README
   row names a guides update after batch 4 (`grep` over `backlog/README.md`, `00-decisions.md`, E4 cards: no match).
   Consequence once B4.1 merges under A: `src/components/CLAUDE.md` still says "A row (`<li>`) adds no visible text
   beyond its title" while every row shows `Created YYYY-MM-DD`, and `src/lib/CLAUDE.md` has no `todo-created.ts` row;
   both are what the next agent reads before touching the row. Fix in `plan.md`: quote D-24 correctly and put the
   drift to the lead at the gate as an explicit item (the two guide lines from `advice.md:138`, and who lands them:
   a post-batch-4 `docs(guides)` PR like #106, or accept the drift). Leaving the guides out of this card's Files stays
   correct.

Costs of Approach A the lead approves with this plan (from §20, `advice.md` and the probe; not reasons to change it):

- The date cannot be selected, copied or found with the browser's page search, and Testing Library / Playwright
  `getByText` cannot see it; tests read the `data-created` attribute and the computed `::after` content instead.
- The day is UTC: a todo added within 14 h of local midnight shows a neighbouring day (AC-20.6 pins it: in Kiritimati
  A is added on local Nov 2 and shows `Created 2026-11-01`), and §17's "today" is browser-local, so the two dates in a
  row follow different zones.
- Screen-reader exposure of generated content was probed in Chromium only (`time: Created 2026-11-01` in the tree);
  Firefox and Safari are `[unverified]`, and the e2e runs Chromium only.
- A concatenated or dynamic class name silently drops the visible date; only AC-20.6 (e2e) kills it, because jsdom
  computes no `::after` and Stryker does not mutate `src/components`. The green gate must run `pnpm test:e2e`.
- Red-gate detail for the test-writer: `verify-red.sh` passes only if zero new tests pass, and the skeleton exports the
  real `CREATED_PREFIX`; an assertion on the constant in its own `it` would be green at red. Keep it inside the AC-20.2
  test that also calls `createdLabel` (as planned: 5 tests, one per AC-20.1–20.5).
- Paperwork, not blocking: card B4.1's `Test:` line says red "because `src/lib/todo-created.ts` does not exist" (an
  import failure, which `testing.md` forbids); with the planned skeleton the red reason is `NotImplementedError`.

## Plan review (round 2)

SCOPE: all (`src/lib`, `src/components`, `e2e`; no `src/actions`, no `prisma/`)

Reviewed at `5f7d200`: `git diff 2b05b36 5f7d200` (`plan.md` +13/−5, card `E4-todos-details.md` `Test:` line),
D-22, D-24 (`00-decisions.md:47,49`), `c0d4593`, `src/components/CLAUDE.md:5`, `src/lib/CLAUDE.md`, the E4 epic
header, `advice.md:130-140`. Branch vs `origin/main`: 7 files, all paperwork (`backlog/`, `spec/`), nothing under
`src/`, `prisma/`, `e2e/`.

Ran here: `scripts/next-task.sh --check B4.1` → `[next-task] B4.1: no overlap with any Doing or Review card`;
`check-backlog.sh` → `OK: README matches the cards`; `check-features-map.sh` → `OK`; `check-spec-sections.sh` →
`OK: sections cited: 1 … 20`; `check-ac-coverage.sh` → `OK`; `plan-files.sh --any B4.1` → the same 5 Files paths as
round 1. Round 1's probe of Approach A still applies (no `src/` or test change since).

Round 1 reason 1, resolved: `plan.md` now quotes D-24 as written ("updated before the batch", `c0d4593` = #106,
confirmed an ancestor of HEAD), states that no ruling or card covers a post-batch update (`grep` over
`backlog/README.md`, the E4 cards: only the epic header's "package guides stay out of card plans", no owner), names
the two drifted lines (`src/components/CLAUDE.md:5` "adds no visible text beyond its title", no `todo-created.ts`
row in `src/lib/CLAUDE.md`), and puts owner-or-accept to the lead as gate item 3. Round 1's two paperwork notes
also landed: the `CREATED_PREFIX` red-gate trap is written into the Skeleton paragraph, and the card's `Test:` line
red reason is now the skeleton's `NotImplementedError`.

| Check                                                                                  | Result                                                                                                                                                                                                               |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                         | pass: unchanged from round 1 (5 files, the two `src/` files §20 allows, three test files; F18 ✗ then ✅)                                                                                                             |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib         | pass: unchanged; signatures copy §20; pure module, no Prisma, no action                                                                                                                                              |
| plan follows `advice.md`'s recommendation or states the deviation                      | pass: Approach A; the plan now departs from `advice.md:138`'s "orchestrating session's docs PR after batch 4 (D-24)" and states why (D-24 says "before the batch"), which is the stated deviation the check asks for |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number              | pass: AC-20.1 to AC-20.6 (6), unchanged                                                                                                                                                                              |
| verification lists exact commands with expected numbers                                | pass: unchanged (`verify-red.sh B4.1` exit 0 with 5 red; `pnpm test` 190 → 195; `pnpm test:e2e` 35 → 36; mutation ≥ 70, `todo-created.ts` 100; `pnpm build`; `check-plan-scope.sh`)                                  |
| work breakdown has skeleton → red → green → map → review with convention subjects      | pass: unchanged                                                                                                                                                                                                      |
| the section has a `Lead approves spec` box, ticked only by a human (D-7), never by you | pass: `18-created-date.md:5` still `- [ ]`; gate item 2 names it; untouched by this review                                                                                                                           |
| no settled D-n contradicted                                                            | pass: D-24 now quoted correctly; guides stay out of the Files as D-22/D-24 and the E4 header require; no `page.tsx`                                                                                                  |
| `scripts/next-task.sh --check B4.1` says no overlap                                    | pass: `[next-task] B4.1: no overlap with any Doing or Review card`                                                                                                                                                   |

Verdict: approved (ready for the lead's gate, not approved for build)

Costs the lead approves with this plan: every bullet under round 1's "Costs of Approach A" still holds (date not
selectable, searchable or visible to `getByText`; UTC day vs §17's browser-local "today"; screen-reader exposure
probed in Chromium only; a dropped or dynamic class is killed only by AC-20.6, so the green gate must run
`pnpm test:e2e`). Added by gate item 3: if the lead accepts the drift, the next agent touching the row reads a
guide that contradicts it until someone files a `docs(guides)` change.

Not blocking:

- `plan.md` is 66 lines against `planning.md`'s ≈ 40; round 1 passed 58 without comment and the extra 8 are the
  round-1 fix, so not raised now.
- `advice.md:138` keeps the old "docs PR after batch 4 (D-24)" wording; the plan supersedes it.
- `plan.md`'s footer still reads `Rounds: 1`.

## Diff review (pass 1)

SCOPE: all (`src/lib`, `src/components`, `e2e`; no `src/actions`, no `prisma/`)

Reviewed at `d9e2a8c` against `origin/main` (merge base `38d4b4c`; the local `main` ref is stale, so every range below
uses `origin/main`). Commits since the plan approval (`0b38446`): `e91dbd6` skeleton, `a5475db` red, `28be424` feat
(+ F18 ✅, metrics row), `d9e2a8c` test (AC-20.1 zone self-check removed, lead ruling). Code diff: `todo-created.ts`
(+17), `todo-item.tsx` (+10/−1); tests: 2 unit, 3 component, 1 e2e.

### Command results (run by the reviewer, last line of each)

| Command                                 | Last line                                                                                                                       |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                             | `✖ 1 problem (0 errors, 1 warning)` (pre-existing `todo-form.tsx:23`), Prettier clean                                           |
| `pnpm typecheck`                        | `tsc --noEmit`, exit 0                                                                                                          |
| `pnpm test`                             | `Tests  195 passed (195)`                                                                                                       |
| `pnpm test:e2e`                         | `36 passed (52.0s)`                                                                                                             |
| `pnpm test:mutation` (committed config) | `Final mutation score of 93.07 is greater than or equal to break threshold 70`; `todo-created.ts` 100.00 (5 killed, 0 survived) |
| `check-suppressions.sh`                 | `OK: no new suppressions`                                                                                                       |
| `check-config-change.sh`                | `OK: no protected config changed`                                                                                               |
| `check-feat-commits.sh`                 | `OK: no feat commit touches tests`                                                                                              |
| `check-ac-coverage.sh`                  | `OK` (§20 still `✗` in the index until the closing PR, so coverage was checked by hand below)                                   |
| `check-spec-sections.sh`                | `OK: sections cited: 1 … 20`                                                                                                    |
| `check-features-map.sh`                 | `OK`                                                                                                                            |
| `check-plan-scope.sh`                   | `OK: feat/B4.1-created-date stays inside the approved plan of B4.1`                                                             |
| `verify-red.sh B4.1`                    | `RESULT: red for the right reason` (lib 2/2 new failed, component 3/3 new failed, e2e skipped)                                  |

### Checklist

| Check                                                                | Result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every AC-20.n has a test whose assertion matches its Then            | pass: 20.1 (5 values × 2 zones, `toEqual`), 20.2 (3 labels, the constant, the `[:A-Za-z]` check after removing `Created`), 20.3 (1 empty `time`, attrs, no role/aria-label, view `textContent`, checkbox and button counts, both modes), 20.4 (identical strings, 1 occurrence each, 0 `onRecoverableError`, 1 `time` after effects), 20.5 (4 re-renders), 20.6 (e2e: `data-created`, ≥ 1 px box, `::after` content at load and after reload; order, B2 + Due text, 3 rows each step) |
| no test weakened after the red commit                                | pass, explained: `git log --first-parent --no-merges a5475db..HEAD -- '*.test.*' e2e/` → only `d9e2a8c`, a `test(...)` commit with its reason and the lead's ruling; it removed `localDatesUnder` (a precondition self-check), no Then value. `--merges --remerge-diff` → empty (no merges). See note 1 for what AC-20.1 still proves                                                                                                                                                 |
| every changed file is in `plan.md`                                   | pass: `check-plan-scope.sh` OK; the 5 Files plus the planned paperwork (F18, metrics)                                                                                                                                                                                                                                                                                                                                                                                                 |
| interfaces match §20's Function contracts                            | pass: `CREATED_PREFIX` inferred as the literal `'Created '`; `createdDayOf` uses `getUTCFullYear/Month/Date` padded 4/2/2, no `Intl`; `createdLabel` = prefix + day; `<time dateTime data-created className="… after:content-[attr(data-created)]">` after `<TodoDueDate>`, before the §10 alert, outside the edit ternary; no state, no effect, one new import                                                                                                                       |
| Zod at every action boundary · Prisma only in `src/lib` · no raw SQL | n/a (no action, no Prisma, no SQL changed); `todo-created.ts` is pure, no `server-only`                                                                                                                                                                                                                                                                                                                                                                                               |
| migration reversible and indexed                                     | n/a (no migration)                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| no secret, no suppression                                            | pass (`check-suppressions.sh` OK; diff read)                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| features map row moved                                               | pass: F18 `✅`; §20 index row stays `✗` until the closing PR (plan)                                                                                                                                                                                                                                                                                                                                                                                                                   |
| would a test fail if one changed line were reverted?                 | pass, probed on a copy (scratchpad, never the tree): (a) UTC getters → local getters: AC-20.1–20.5 all fail under `pnpm exec vitest` (forks), and AC-20.1 still fails with the host at `TZ=UTC`; (b) `after:content-[attr(data-created)]` dropped: 195/195 unit+component pass, e2e AC-20.6 fails with `after: "none"`, `boxed: false` on all 3 rows (the plan's stated single kill, confirmed); (c) pad widths and prefix: Stryker 5/5 killed                                        |

Caller's questions:

1. **AC-20.1 after `d9e2a8c`.** Under `pnpm test` (Vitest 4.1.12, default `forks` pool) assigning `process.env.TZ`
   does move the zone: probe (a) shows a local-getter `createdDayOf` fails AC-20.1 even when the shell runs at
   `TZ=UTC`, so the test still proves zone independence where the definition of done runs it. Under the `threads`
   pool (Stryker's) with a UTC host, all 5 §20 unit/component tests pass against local getters (probe:
   `TZ=UTC vitest run --pool=threads` → `5 passed`), i.e. there AC-20.1 is zone-blind; Stryker generates no
   `getUTC*` → `get*` mutant, so the 100 % is unaffected. Not a weakening of a Then (every Then value is still
   asserted exactly); the cost is that the guard which made a threads-pool run fail loudly is gone (note 1).
2. **Accessible names / §17.** Probed in Chromium with Playwright on the copy (row with a due date and Overdue):
   `ariaSnapshot` is `checkbox "Walk the dog"`, `text`, `button "Edit title"`, `text: Due … Overdue`,
   `button "Edit due date"`, `time: Created 2026-11-01`, `button "Delete todo"` in view mode and the same with the
   textbox/Save in edit mode; `getByRole('checkbox', { name: 'Walk the dog', exact: true })` → 1 in both modes; the
   `<time>` is outside the `<label>`, so no control's name changes; `li.textContent` and `innerText` exclude the date;
   `getByText('Created 2026-11-01')` → 0. The only first `input[type=checkbox]` of the `<li>` is the completion one
   (AC-20.3 asserts it with a count of 1). Screen readers in Chromium hear `Created 2026-11-01` as the `time` node,
   which §20 accepts; Firefox/WebKit not probed.
3. **The class kill.** Confirmed: only e2e AC-20.6 kills a dropped class (probe b). The assertion is robust to the
   cases it is meant for: a missing class gives `content: none` and a 0 px box; a wrong `attr()` name gives `""` ≠
   the label; the poll waits out hydration; quote stripping is anchored (`^"(.*)"$`). It runs Chromium only
   (`playwright.config.ts` has one project), so a WebKit/Firefox difference in resolving `attr()` through Tailwind's
   `var(--tw-content)` would not be seen.

### Findings

No blocking finding.

Non-blocking notes (no wrong behaviour triggered, so not findings):

1. `src/lib/todo-created.test.ts`: AC-20.1's zone proof depends on Vitest's `forks` pool; if `pnpm test` ever moves to
   `threads`, AC-20.1 on a UTC CI host passes for a local-getter implementation with no signal. A pool change is a
   config change (D-19) and would be reviewed then; worth one line in the card's closing evidence.
2. `src/components/todo-item-created.test.tsx:65`: `firstCheckboxIsCompletion` compares `querySelector` with
   `queryByRole`, which is `null === null` → `true` when the row has no checkbox; AC-20.5 asserts only that field, so
   it alone would not see a row that lost its checkbox. AC-20.3 pins `checkboxes: 1` and AC-5.1/AC-5.4 cover the
   checkbox, so no reachable defect escapes.
3. Plan step 4 (`docs(map): F18 … [B4.1]` as its own commit) landed inside the feat commit `28be424` with the metrics
   row. Paperwork only; squash-merged, and `check-plan-scope.sh` is OK.
4. Guide drift accepted at the gate: `src/components/CLAUDE.md:5` still says "A row (`<li>`) adds no visible text
   beyond its title", and `src/lib/CLAUDE.md` has no `todo-created.ts` row. Carry it into the PR body's "Waiting on
   you" so it is not lost.

Verdict: ready for PR

Riskiest unfalsified: the date's rendering and screen-reader exposure in Firefox and WebKit (the e2e and every probe
ran Chromium only), and AC-20.1's zone proof outside the `forks` pool.
