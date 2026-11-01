## Item

B4.1 — Show the creation date of each todo (spec §20)

- spec: §20 — new section (D-24), `spec/contracts/18-created-date.md`
- test: `src/lib/todo-created.test.ts::AC-20.1: writes the UTC creation day as YYYY-MM-DD under Pacific/Kiritimati and America/Los_Angeles` — red before (`scripts/verify-red.sh`), green after
- acceptance: AC-20.1 … AC-20.6 (all)

## Plan

## B4.1 plan — Show the creation date of each todo (§20)

Approach: A from `advice.md` — an empty `<time dateTime data-created>` per row whose `::after` shows `Created
YYYY-MM-DD` (UTC) through `after:content-[attr(data-created)]`, so the row's text content stays its title and AC-5.1
(and the 6 other sections that read whole-row text) hold with no existing test changed. One phase, one lead approval
(D-22, D-24): `src/app/page.tsx` is not touched. Lead rules at the gate (soft, analysis Q1): A (recommended), B (date
as row text: needs the next D-n, `docs(spec)` §5, §6, §19, ≈ 9 test files rewritten first) or C (tooltip, declined).
No dependency, no env key, no migration, no CI-protected path (no `config-change-approved`).

### Files

| File                                        | Change                                                                                                  | Why (AC-20.n)    |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ---------------- |
| `src/lib/todo-created.ts`                   | Add `CREATED_PREFIX`, `createdDayOf` (UTC getters, no `Intl`), `createdLabel`; pure, no `server-only`   | 20.1, 20.2       |
| `src/lib/todo-created.test.ts`              | Add (red): AC-20.1 under `TZ` Kiritimati and Los Angeles, AC-20.2                                       | 20.1, 20.2       |
| `src/components/todo-item.tsx`              | One import + one empty `<time …>` after `<TodoDueDate>`, before the §10 alert, outside the edit ternary | 20.3–20.6        |
| `src/components/todo-item-created.test.tsx` | Add (red): AC-20.3, AC-20.4 (`renderToString` + `hydrateRoot`), AC-20.5; mocks the actions modules only | 20.3, 20.4, 20.5 |
| `e2e/20-created-date.spec.ts`               | Add (red): AC-20.6 C, B, A in a `Pacific/Kiritimati` browser, tick/rename/due date/reload, `::after`    | 20.6             |

Paperwork (exempt): `spec/features-map.md` F18 row ✗ in the skeleton, ✅ in `docs(map)`; §20 index row stays ✗ until
the closing PR; `docs/metrics.md` per-card row. `todo-item.test.tsx` is not touched (§20 test note). Package guides
(`src/*/CLAUDE.md`) stay out of the Files: D-24 had them updated before the batch (#106, c0d4593), and no ruling or card
covers an update after it. After merge `src/components/CLAUDE.md` still says "A row adds no visible text beyond its
title" and `src/lib/CLAUDE.md` has no `todo-created.ts` row: the lead names an owner for a post-batch `docs(guides)`
PR or accepts the drift (gate item 3).

Skeleton: `createdDayOf`, `createdLabel` throw `NotImplementedError`; `CREATED_PREFIX` exported as `'Created '`
(a constant, per §20), so no test asserts it alone (it would be green at red): AC-20.2 asserts it in the same test as
`createdLabel`. `todo-item.tsx` not changed in the skeleton (a throwing call would turn existing `TodoItem` tests red
for the wrong reason), so AC-20.3–20.5 fail on an assertion (no `time` element). The card's `Test:` line red reason is
reworded to the skeleton's `NotImplementedError` (not a missing module).

Gate items for the lead: 1. option A (recommended), B or C; 2. §20 as written (UTC day, `Created YYYY-MM-DD`, no time
of day; ticks the §20 box); 3. the package-guide drift above.

### Interfaces touched

```ts
// src/lib/todo-created.ts (§20)
export const CREATED_PREFIX: 'Created ';
export function createdDayOf(createdAt: Date): string;
export function createdLabel(createdAt: Date): string;
// src/components/todo-item.tsx (§7, props unchanged)
export function TodoItem({ todo }: { readonly todo: Todo }): ReactNode; // + <time dateTime data-created className="… after:content-[attr(data-created)]" />
```

### Verification

Red (`test(todos): B4.1 … (red)`): `scripts/verify-red.sh B4.1` exit 0, 5 new unit/component tests failing on
`NotImplementedError` (AC-20.1, AC-20.2) or an assertion (AC-20.3–20.5); `pnpm test:e2e e2e/20-created-date.spec.ts`
→ 1 failed, recorded in the commit body. Green: `pnpm lint && pnpm typecheck` clean · `pnpm test` 190 → 195 passed ·
`pnpm test:e2e` 35 → 36 green (AC-20.6 is the only kill of a dropped `className`) · `pnpm test:mutation` ≥ 70
(target ≥ 85; `todo-created.ts` 100) · `pnpm build` ok · `scripts/ci/check-plan-scope.sh` OK. Counts are the
test-writer's target; a different count is stated in the red commit.

### Work breakdown

| Step | Role / skill        | Produces                                   | Commit                         |
| ---- | ------------------- | ------------------------------------------ | ------------------------------ |
| 1    | `new-feature-slice` | `todo-created.ts` stubs, F18 ✗             | `chore(todos): B4.1 skeleton`  |
| 2    | test-writer         | 2 unit/component files + `e2e/20`, all red | `test(todos): B4.1 … (red)`    |
| 3    | code-writer         | lib functions, `TodoItem` `<time>`         | `feat(todos): B4.1 …`          |
| 4    | dev-lead            | F18 ✅                                     | `docs(map): F18 … [B4.1]`      |
| 5    | reviewer (diff)     | `review.md` diff section                   | `docs(backlog): B4.1 review …` |

Plan review: round 1 changes requested (1 reason, applied 5f7d200) · round 2 approved (e2d5ee4) · Plan approved by: lead, 2026-11-01 (option A; guide drift accepted) · Rounds: 1

## Map delta

F18 · §20 · ✗ → ✅ — `createdDayOf`, `createdLabel` in `src/lib/todo-created.ts`, one empty `<time>` in `src/components/todo-item.tsx`; evidence (card): `pnpm test` → 195 passed (190 + 5), `pnpm test:e2e` → 36 passed (35 + 1), mutation 93.07 (todo-created.ts 100, 5 killed).

## Review

`/review-loop`: passes 2/3, 0 findings, ready for PR. Pass 1 (34e99c8) on the card; pass 2 (103769f) on the merge of B4.3 (#109, f0cf151: 3 paperwork conflicts, both rows kept, no test or `src/` conflict). After the merge: `Tests  198 passed (198)` · `40 passed (46.3s)` · `Final mutation score of 93.16 is greater than or equal to break threshold 70` (todo-created.ts 100). Pass 2 notes: the pass-1 counts below predate the merge (no change needed); `e2e/22` seeds runner-local `createdAt`, so its rows may show the neighbouring UTC day, which is §20 as specified and read by no §22 test (no change needed). Dispositions of the pass-1 notes:

| Pass | #   | Finding                                                                                        | Source   | Disposition      | Justification                                                                                                                                       |
| ---- | --- | ---------------------------------------------------------------------------------------------- | -------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | 1   | AC-20.1 zone proof holds only in vitest's `forks` pool (d9e2a8c dropped the TZ self-check)     | reviewer | no change needed | lead ruling at green; `pnpm test` (forks) still fails a local-getter `createdDayOf` under `TZ=UTC`; Stryker never makes a `getUTC*` → `get*` mutant |
| 1    | 2   | `todo-item-created.test.tsx:65` `firstCheckboxIsCompletion` is true when a row has no checkbox | reviewer | no change needed | AC-20.3 asserts exactly 1 checkbox in both modes, so a row without one fails there                                                                  |
| 1    | 3   | F18 ✅ landed in the feat commit, not a separate `docs(map)`                                   | reviewer | no change needed | paperwork in the same change is what `spec/CLAUDE.md` asks; no file outside the plan                                                                |
| 1    | 4   | package guides still say a row adds no visible text; no `todo-created.ts` row                  | reviewer | out of scope     | drift accepted by the lead at the plan gate                                                                                                         |

Riskiest unfalsified: rendering and screen-reader exposure in Firefox and WebKit (e2e and probes ran in Chromium only).

<details><summary>review.md — Diff review (pass 1)</summary>

SCOPE: all (`src/lib`, `src/components`, `e2e`; no `src/actions`, no `prisma/`)

Reviewed at `d9e2a8c` against `origin/main` (merge base `38d4b4c`; the local `main` ref is stale, so every range below
uses `origin/main`). Commits since the plan approval (`0b38446`): `e91dbd6` skeleton, `a5475db` red, `28be424` feat
(+ F18 ✅, metrics row), `d9e2a8c` test (AC-20.1 zone self-check removed, lead ruling). Code diff: `todo-created.ts`
(+17), `todo-item.tsx` (+10/−1); tests: 2 unit, 3 component, 1 e2e.

#### Command results (run by the reviewer, last line of each)

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

#### Checklist

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

#### Findings

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

</details>

## Checklist

- [ ] **Diff matches the approved plan**: no file outside the Files table, no interface outside the list.
- [ ] Red commit precedes the feat commit; no `feat(` commit touches `*.test.*` or `e2e/**`.
- [ ] Every `AC-§.n` of the section is a test title; mutation on `src/lib` + `src/actions` ≥ 70 %.
- [ ] No new `eslint-disable` / `@ts-ignore` / `@ts-expect-error`; no protected config change (or label `config-change-approved` with the reason).
- [ ] Migrations reviewed as SQL; `prisma/seed.ts` updated if a table changed.
- [ ] `spec/features-map.md` row moved; `docs/metrics.md` per-card row filled; mistake-log updated if a known mistake repeated.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
