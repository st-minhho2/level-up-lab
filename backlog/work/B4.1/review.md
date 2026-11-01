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
