<!-- Title: feat(todos): B4.3 say all done when every todo is completed (§22) -->

## Item

B4.3 — Say all done when every todo is completed (spec §22)

- spec: §22 — new section, written under D-24 (`spec/contracts/20-all-done.md`)
- test: `src/lib/todo-count.test.ts::AC-22.1: returns "All done" for 0 and undefined for 1, 2 and 11` — red before (`scripts/verify-red.sh`), green after
- acceptance: AC-22.1 … AC-22.7 (all)

## Plan

### B4.3 plan — Say all done when every todo is completed (§22)

Approach: A from `advice.md` — `allDoneMessage(count)` in `src/lib/todo-count.ts`; `RemainingCount` returns a fragment:
the §13 `<p>` unchanged plus, at count 0, one bare `<span>` (no class, no role) reading "All done". Markup for counts
other than 0 is byte-identical, so every AC-13.x test stays green untouched. One phase, one lead approval (D-22, D-24):
no `src/app/page.tsx`, `src/components/todo-item.tsx`, `src/components/todo-search-form.tsx`, `src/lib/todo-search.ts`,
no `src/*/CLAUDE.md`. Analysis Q1–Q9 as proposed: accompanies "0 items left"; an empty list also shows "All done"
(REQ-22.5: the component sees `count` only); filter and search never change it (REQ-22.7). Approving ticks §22's
`Lead approves spec` box. No migration, no dependency, no env key, no CI-protected path (no `config-change-approved`).

#### Files

| File                                      | Change                                                                           | Why (AC-22.n) |
| ----------------------------------------- | -------------------------------------------------------------------------------- | ------------- |
| `src/lib/todo-count.ts`                   | Add `allDoneMessage` (text in a module-private const); header `// §13, §22`      | 22.1          |
| `src/lib/todo-count.test.ts`              | Add (red): AC-22.1, counts 0, 1, 2, 11 → literal `'All done'`, 3 × `undefined`   | 22.1          |
| `src/components/remaining-count.tsx`      | Fragment: §13 `<p>` unchanged + `<span>` when `allDoneMessage(count)` is defined | 22.2–22.7     |
| `src/components/remaining-count.test.tsx` | Add: AC-22.3 (1, 2, 11) pinned green, then AC-22.2 (count 0) red; AC-13.2 kept   | 22.2, 22.3    |
| `e2e/22-all-done.spec.ts`                 | Add (red): AC-22.4 to AC-22.7, titles A, B, C (never "All done")                 | 22.4–22.7     |

Paperwork (exempt): `spec/features-map.md` F20 row ✗ in the skeleton, ✅ in `docs(map)`; §22 index row stays ✗ until
the closing PR; `docs/metrics.md` per-card row. Expected order-only conflict on the index rows when B4.1/B4.2 merge.

Skeleton stub: `allDoneMessage` throws `NotImplementedError`; `remaining-count.tsx` unchanged (AC-22.2 fails on a
missing "All done" element, an assertion, not an import). AC-22.3 holds already (no "All done" at counts 1, 2, 11), so
it lands green in its own `test(todos): B4.3 pin AC-22.3 …` commit (no `(red)` marker) before the red commit, as B1.11
did: `verify-red.sh` fails on any new test that is green before the code (`scripts/verify-red.sh:15`).

#### Interfaces touched

```ts
// src/lib/todo-count.ts (§13, §22) — pure, no Prisma, no server-only; countRemaining, remainingLabel unchanged
export function allDoneMessage(count: number): string | undefined; // 'All done' when count === 0, else undefined
// the text is a module-private const (not exported: §22 adds one export); tests assert the literal
// src/components/remaining-count.tsx: RemainingCount({ count }: { readonly count: number }): ReactNode — props
// unchanged; <p>{remainingLabel(count)}</p> plus, when defined, <span>{allDoneMessage(count)}</span>; no role, no aria-live
```

#### Verification

Pin (`test(todos): B4.3 pin AC-22.3 …`): AC-22.3 green, 190 → 191. Red (`test(todos): B4.3 … (red)`):
`scripts/verify-red.sh B4.3` exit 0; AC-22.1 and AC-22.2 fail on `NotImplementedError` / a missing element;
`pnpm test:e2e e2e/22-all-done.spec.ts` → AC-22.4, 22.5, 22.6, 22.7 failed (22.7 on part a), recorded in the body.
Green: `pnpm lint && pnpm typecheck` clean · `pnpm test` 190 → 193 passed, the 8 existing `todo-count.test.ts` and 3
`remaining-count.test.tsx` tests unchanged and green · `pnpm test:e2e` 35 → 39 passed (`13`, `16` unchanged) ·
`pnpm test:mutation` ≥ 70, `allDoneMessage` 100 (`<= 0` mutant equivalent for whole counts, `advice.md`) ·
`pnpm build` ok · `scripts/ci/check-plan-scope.sh` OK. Counts are the test-writer's target; a different count is
stated in the red commit.

#### Work breakdown

| Step | Role / skill        | Produces                               | Commit                            |
| ---- | ------------------- | -------------------------------------- | --------------------------------- |
| 1    | `new-feature-slice` | `allDoneMessage` stub, F20 ✗           | `chore(todos): B4.3 skeleton`     |
| 2a   | test-writer         | AC-22.3 in `remaining-count.test.tsx`  | `test(todos): B4.3 pin AC-22.3 …` |
| 2b   | test-writer         | AC-22.1, AC-22.2 + `e2e/22`, red       | `test(todos): B4.3 … (red)`       |
| 3    | code-writer         | `todo-count.ts`, `remaining-count.tsx` | `feat(todos): B4.3 …`             |
| 4    | dev-lead            | F20 ✅                                 | `docs(map): F20 … [B4.3]`         |
| 5    | reviewer (diff)     | `review.md` diff section               | `docs(backlog): B4.3 review …`    |

Plan review: approved, round 2 (round 1: 2 reasons applied 359efed) · Plan approved by: lead, 2026-11-01 · Rounds: 1

## Map delta

F20 · §22 · ✗ → ✅ — `allDoneMessage` in `src/lib/todo-count.ts`, the `<span>` in `src/components/remaining-count.tsx`; evidence: `pnpm test` → 193 passed, `pnpm test:e2e` → 39 passed, mutation 93.05 (todo-count.ts 100) (f8607f0)

## Review

`/review-loop`: pass 1/3, ready, 0 findings; 2 spec-wording gaps (G1, G2) out of scope as follow-ups for the lead.

#### Diff review (pass 1)

SCOPE: all (lib `src/lib/todo-count.ts`; ui `src/components/remaining-count.tsx`, `e2e/22-all-done.spec.ts`; no
`src/actions` change). Reviewed at `9afcfc0` against `origin/main` (`38d4b4c`, the merge base). Local `main`
(`a005b41`) is stale: `git diff --stat main...HEAD` lists 74 files from batches already merged. Against `origin/main`
it lists 15 files, and the card's own commits (`5a9bf61..HEAD`) change 8.

#### Commands (run by the reviewer, last line of each)

| Command                             | Last line                                                                                                                                                |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                         | `All matched files use Prettier code style!` (eslint: 0 errors, 1 warning, `todo-form.tsx:23`, not in this diff)                                         |
| `pnpm typecheck`                    | `tsc --noEmit` (no output, exit 0)                                                                                                                       |
| `pnpm test`                         | `Tests  193 passed (193)`                                                                                                                                |
| `pnpm test:e2e`                     | `39 passed (47.4s)`                                                                                                                                      |
| `pnpm test:mutation`                | `Final mutation score of 93.05 is greater than or equal to break threshold 70` (`todo-count.ts` 100.00, 12 killed, 0 survived)                           |
| `scripts/ci/check-suppressions.sh`  | `OK: no new suppressions`                                                                                                                                |
| `scripts/ci/check-config-change.sh` | `OK: no protected config changed`                                                                                                                        |
| `scripts/ci/check-feat-commits.sh`  | `OK: no feat commit touches tests`                                                                                                                       |
| `scripts/ci/check-ac-coverage.sh`   | `OK: every criterion of a shipped section has a test` (§22 is ✗ so it is skipped; on the probe copy with §22 set to ✅: `§22  criteria=7 covered=7`, OK) |
| `scripts/ci/check-spec-sections.sh` | `OK: sections cited: 1 … 19 22`                                                                                                                          |
| `scripts/ci/check-features-map.sh`  | `OK`                                                                                                                                                     |
| `scripts/ci/check-plan-scope.sh`    | `OK: feat/B4.3-all-done stays inside the approved plan of B4.3`                                                                                          |
| `scripts/verify-red.sh B4.3`        | `RESULT: red for the right reason` (base `6db7487` pin; 1 new red in each unit file; e2e skipped)                                                        |
| `scripts/next-task.sh --check B4.3` | `B4.3: no overlap with any Doing or Review card`                                                                                                         |
| `pnpm build`                        | not run                                                                                                                                                  |

#### Checklist

| Check                                                       | Result                                                                                                                                                                                                                                                                                                                        |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every AC-22.n has a test whose assertion matches its Then   | pass, with one exception: AC-22.6's Then cannot be met as written (spec gap G1 below). 22.1 `todo-count.test.ts`; 22.2 and 22.3 `remaining-count.test.tsx`; 22.4 to 22.7 `e2e/22-all-done.spec.ts`. Each Then clause maps to an assertion (counts via `toHaveCount`/`toHaveLength`, exact text, tag name, the 4 named roles). |
| no test weakened after the red commit                       | pass: `git log --first-parent --no-merges acf989d..HEAD -- '*.test.*' e2e/` is empty, and `--merges --remerge-diff` over the same range is empty. The pin commit `6db7487` comes before the red commit and only adds AC-22.3.                                                                                                 |
| every changed file is in `plan.md`                          | pass: 5 planned files + paperwork (`features-map.md`, `metrics.md`, `pr-body.md`); `check-plan-scope.sh` OK                                                                                                                                                                                                                   |
| interfaces match §22 Function contracts                     | pass: `allDoneMessage(count: number): string \| undefined` is exact. `RemainingCount` props are unchanged. `page.tsx` is unchanged and still passes `countRemaining(todos)` (stored todos). The text is a module-private const, so `todo-count.ts` has one new export.                                                        |
| Zod at every action boundary / Prisma only in lib / raw SQL | n/a: no action, no Prisma, no SQL in the diff                                                                                                                                                                                                                                                                                 |
| migration reversible and indexed                            | n/a: no migration                                                                                                                                                                                                                                                                                                             |
| no secret, no suppression                                   | pass (`check-suppressions.sh`; no key material in the diff)                                                                                                                                                                                                                                                                   |
| features map row moved                                      | pass: F20 ✗ in the skeleton `6c8c270` → ✅ in `f8607f0`. The §22 index row stays ✗ until the closing PR, as planned                                                                                                                                                                                                           |
| `Lead approves spec` ticked by a human only                 | pass: ticked in `5a9bf61` "plan approved" (the lead's gate, D-7), not by an agent role                                                                                                                                                                                                                                        |
| Server/Client boundary                                      | pass: `remaining-count.tsx` has no `'use client'`, no state and no events. `todo-count.ts` stays free of `server-only`                                                                                                                                                                                                        |
| would a test fail if one changed line were reverted         | pass (probes below)                                                                                                                                                                                                                                                                                                           |

#### Probes (on a copy in the scratchpad; the copy was restored after each probe and the tree was never edited)

Component, `vitest run src/components/remaining-count.test.tsx`:

| Mutation of `remaining-count.tsx`                          | Result                                             |
| ---------------------------------------------------------- | -------------------------------------------------- |
| span rendered at every count                               | `1 failed \| 4 passed`: AC-22.3 fails              |
| span only at count 1 / only at 2 / only at 11 (three runs) | AC-22.3 fails in each run (`1 failed \| 4 passed`) |
| message as `<p>` at 0                                      | AC-13.2 (0) and AC-22.2 fail                       |
| message replaces the §13 `<p>` at 0                        | AC-13.2 (0) and AC-22.2 fail                       |
| `<span role="alert">` / `<li>` / two spans                 | AC-22.2 fails in each run                          |
| `<span role="status">`                                     | `5 passed`: survives (spec gap G2)                 |

Caller's question (2): AC-22.3 (pinned green, never seen red) fails at each of counts 1, 2 and 11 when the span is
rendered there, so it is a working test.

e2e, `playwright test e2e/22-all-done.spec.ts` on the copy (the copy's own `pnpm dev`, the same compose schema):

| Mutation                                                                                             | Result                                                                                              |
| ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| span at every count (`-g AC-22.7`)                                                                   | AC-22.7 fails at `:157:47` (part (b), `0 "All done"`: expected 0, received 1) after part (a) passes |
| page decides "All done" from `shown`, not `todos` (label still from `todos`; component span removed) | AC-22.4, 22.5, 22.6 pass. AC-22.7 fails at `:157:47` (part (b))                                     |
| `clear-completed-button.tsx` calls `window.location.reload()` after the action (`-g AC-22.6`)        | `1 passed`: survives (G1)                                                                           |
| test copy: `expect(navigations()).toBe(0)` added right after `page.reload()`                         | fails, `Expected: 0 Received: 1` (G1)                                                               |

Caller's question (3): part (b) of AC-22.7 does run and catches the realistic regression, where "All done" is judged
from the filtered view (REQ-22.7). It fails on its own assertion (line 157), not on part (a).

#### Findings

None blocking.

#### Spec gaps (for the lead or `/spec-trace`; not a defect in this diff, and no change to the tests or code is asked)

- **G1, AC-22.6 wording (caller's question 1).** The Then asks for "0 document navigations during the first four
  steps", but the When lists five steps and the fourth is the reload. The reload is itself a document navigation:
  the probe shows `navigations()` = 1 right after `page.reload()`. So the literal Then cannot be met. The test
  enforces the only reading that can be met, 0 navigations across check, uncheck and "Mark all complete"
  (`e2e/22-all-done.spec.ts:113`). That matches the AC as far as the AC can be measured. The cost: REQ-22.6 says
  "cleared (§9) … without a full reload", but no AC measures that clause. The probe shows that a "Clear completed"
  ending in `window.location.reload()` passes AC-22.6, and no other e2e watches navigations for §9
  (`grep -n navigat e2e/` finds the watcher only in `13-` and `22-`). Today the risk is low:
  `clear-completed-button.tsx` is a `type="button"` with a transition-wrapped Server Action and no form, and this
  card does not touch it. Suggested amendment (a `docs(spec)` commit under a D-n): "0 document navigations during
  the check, the uncheck, 'Mark all complete' and 'Clear completed' (the reload excepted)".
- **G2, AC-22.2 and the contract.** The Function contract says the sibling element "has no role", and Out of scope
  excludes `role="status"`. AC-22.2's Then lists only `listitem`, `button`, `link` and `alert`, so a
  `<span role="status">` passes every test (probe). The code ships a bare `<span>`, so nothing is wrong today. The
  AC is narrower than the contract.

Verdict: ready for PR

Riskiest unfalsified: the "Clear completed" half of REQ-22.6 ("without a full reload"). No test anywhere measures
it, because AC-22.6 limits the navigation check to steps that include the reload (G1). The code path is unchanged
by this card.

#### Dispositions (dev-lead, pass 1)

| Pass | #   | Finding (file:line)                                                                      | Source   | Kind     | Disposition  | Justification                                                                                                     |
| ---- | --- | ---------------------------------------------------------------------------------------- | -------- | -------- | ------------ | ----------------------------------------------------------------------------------------------------------------- |
| 1    | G1  | `spec/contracts/20-all-done.md` AC-22.6: "first four steps" include the reload itself    | reviewer | spec gap | out of scope | the test checks the only satisfiable reading; rewording is a `docs(spec)` change under a D-n (follow-up for lead) |
| 1    | G2  | `spec/contracts/20-all-done.md` AC-22.2: "has no role" not measured beyond 4 named roles | reviewer | spec gap | out of scope | shipped `<span>` has no role; closing it needs an AC change under a D-n (follow-up for lead)                      |
| 1    | —   | own pass: invariants, plan scope, map, revert probe of `=== 0` and the `<span>`          | dev-lead | check    | no change    | AC-22.1 fails on `!== 0`/`true`; AC-22.2, 22.4–22.7 fail without the span; files within plan + paperwork          |

## Checklist

- [ ] **Diff matches the approved plan**: no file outside the Files table, no interface outside the list.
- [ ] Red commit precedes the feat commit; no `feat(` commit touches `*.test.*` or `e2e/**`.
- [ ] Every `AC-§.n` of the section is a test title; mutation on `src/lib` + `src/actions` ≥ 70 %.
- [ ] No new `eslint-disable` / `@ts-ignore` / `@ts-expect-error`; no protected config change (or label `config-change-approved` with the reason).
- [ ] Migrations reviewed as SQL; `prisma/seed.ts` updated if a table changed.
- [ ] `spec/features-map.md` row moved; `docs/metrics.md` per-card row filled; mistake-log updated if a known mistake repeated.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
