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

pending (F20 · §22 · ✗ → ✅ after the green step)

## Review

pending (`/review-loop` after the green step)

## Checklist

- [ ] **Diff matches the approved plan**: no file outside the Files table, no interface outside the list.
- [ ] Red commit precedes the feat commit; no `feat(` commit touches `*.test.*` or `e2e/**`.
- [ ] Every `AC-§.n` of the section is a test title; mutation on `src/lib` + `src/actions` ≥ 70 %.
- [ ] No new `eslint-disable` / `@ts-ignore` / `@ts-expect-error`; no protected config change (or label `config-change-approved` with the reason).
- [ ] Migrations reviewed as SQL; `prisma/seed.ts` updated if a table changed.
- [ ] `spec/features-map.md` row moved; `docs/metrics.md` per-card row filled; mistake-log updated if a known mistake repeated.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
