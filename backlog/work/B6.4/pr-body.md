<!-- Title: feat(todos): B6.4 the clear-completed button says how many it will clear -->

## Item

B6.4 — The clear-completed button says how many it will clear (spec §32)

- spec: §32 — written in this branch (D-33); the label count is not §9's "message showing the deleted count" (D-33)
- test: `src/lib/clear-completed-label.test.ts::AC-32.1 …`, `src/components/clear-completed-button-count.test.tsx::AC-32.2 … AC-32.4`, `e2e/32-clear-completed-count.spec.ts::AC-32.5 … AC-32.7` — red before (`scripts/verify-red.sh`; AC-32.3 and AC-32.7 pinned green first), green after
- acceptance: AC-32.1 … AC-32.7

Closes #275

## Plan

### B6.4 plan — The clear-completed button says how many it will clear (§32)

Approach: A from `advice.md` — the §32 Function contracts as written: a pure `clearCompletedLabel` in `src/lib`, an
optional `completedCount` prop on `ClearCompletedButton`, and `page.tsx` passes `filterCounts(todos).completed` from the
one unfiltered, unsearched `listTodos()` result (no second query). B is rejected: it drops the contract's named export.
No migration, dependency, env key or CI-protected path (no `config-change-approved`). `src/lib/todos.ts`,
`src/lib/filter-counts.ts`, `src/actions/*` and §9's test file stay untouched; package guides stay out (D-33).

#### Files

| File                                                   | Change                                                                                         | Why (AC-32.n) |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------- | ------------- |
| `src/lib/clear-completed-label.ts`                     | Add: `clearCompletedLabel` (skeleton throws `NotImplementedError`, green formats the label)    | 32.1          |
| `src/components/clear-completed-button.tsx`            | Optional `completedCount` prop (skeleton ignores it); green renders `clearCompletedLabel(…)`   | 32.2–32.4     |
| `src/app/page.tsx`                                     | Green: `completedCount={filterCounts(todos).completed}`; header names §32                      | 32.5–32.7     |
| `src/lib/clear-completed-label.test.ts`                | Add (red): AC-32.1, the card's Test line title                                                 | 32.1          |
| `src/components/clear-completed-button-count.test.tsx` | Add: AC-32.3 pinned green; AC-32.2, 32.4 red; §9's `clear-completed-button.test.tsx` untouched | 32.2–32.4     |
| `e2e/32-clear-completed-count.spec.ts`                 | Add: AC-32.7 pinned green; AC-32.5, 32.6 red; seeded with `PrismaClient` as sibling specs      | 32.5–32.7     |
| `spec/features-map.md`                                 | Add the F30 row (§32) in code-writer's `docs(map)` commit                                      | map           |

Paperwork (exempt): §32 index row stays ✗ until the closing PR; `docs/metrics.md` per-card row.

#### Interfaces touched

```ts
// src/lib/clear-completed-label.ts (pure: no Prisma, no server-only; imported by a client component)
export function clearCompletedLabel(completed: number): string;
// src/components/clear-completed-button.tsx ('use client')
export function ClearCompletedButton({
  disabled,
  completedCount,
}: {
  readonly disabled: boolean;
  readonly completedCount?: number;
}): ReactNode;
// No Server Action, Zod schema, Prisma model, query or env key.
```

#### Verification

Baseline: `pnpm test` 269 passed (43 files), e2e 57 tests (25 files, counted). Pin (`test(todos): B6.4 pin AC-32.3,
AC-32.7 …`, no `(red)`): AC-32.3 green on the skeleton (no count → "Clear completed", REQ-32.6 holds today), 269 → 270;
AC-32.7 green on the skeleton (empty list). Red (`test(todos): B6.4 … (red)`): `scripts/verify-red.sh B6.4` exit 0
(zero new tests green); AC-32.1 fails on `NotImplementedError`, AC-32.2/32.4 on the exact name "Clear completed (n)",
never an import; `pnpm test:e2e e2e/32-clear-completed-count.spec.ts` → AC-32.5, 32.6 fail on the name. Green:
`pnpm lint && pnpm typecheck` clean · `pnpm test` 270 → 273 passed, AC-9.n/AC-10.3 green untouched · `pnpm test:e2e`
57 → 60 passed; `e2e/09`, `12`, `13`, `16`, `22`, `26`, `30` green untouched (substring name match) ·
`pnpm test:mutation` ≥ 70 (0/1 boundary, 12 for padding, killed by AC-32.1) · `pnpm build` ok ·
`scripts/ci/check-plan-scope.sh` OK.

#### Work breakdown

| Step | Role / skill                | Produces                                               | Commit                                     |
| ---- | --------------------------- | ------------------------------------------------------ | ------------------------------------------ |
| 1    | skeleton: new-feature-slice | `clear-completed-label.ts` stub, button's ignored prop | `chore(todos): B6.4 skeleton`              |
| 2    | test-writer                 | AC-32.3 (component), AC-32.7 (e2e), green              | `test(todos): B6.4 pin AC-32.3, AC-32.7 …` |
| 3    | test-writer                 | AC-32.1, 32.2, 32.4, 32.5, 32.6, red                   | `test(todos): B6.4 … (red)`                |
| 4    | code-writer                 | label, prop wiring, page count                         | `feat(todos): B6.4 …`                      |
| 5    | code-writer                 | F30 row                                                | `docs(map): F30 … [B6.4]`                  |
| 6    | reviewer (diff)             | `review.md` diff section                               | `docs(backlog): B6.4 review …`             |

Plan review: approved, round 1 · Plan approved by: reviewer (D-27, tier medium, issue #275) · Rounds: 1

## Map delta

F30 · §32 · new row ✅ — `clearCompletedLabel` in `src/lib/clear-completed-label.ts`, `completedCount` on
`ClearCompletedButton`, wired in `src/app/page.tsx` (a881ff6); evidence: `pnpm test` → 273 passed, `pnpm test:e2e` →
60 passed. §32's index row stays ✗ until the closing PR.

## Review

`/review-loop`: passes 1/3, verdict ready for PR, 0 findings (confirmed 0, plausible 0); plan review approved round 1.

| Command                            | Last line                                                                    |
| ---------------------------------- | ---------------------------------------------------------------------------- |
| `pnpm test`                        | `Tests  273 passed (273)` (plan: 270 → 273)                                  |
| `pnpm test:e2e`                    | `60 passed (1.4m)` (plan: 57 → 60)                                           |
| `pnpm test:mutation`               | 92.74 ≥ 70; `clear-completed-label.ts` 100                                   |
| `scripts/verify-red.sh B6.4`       | `RESULT: red for the right reason` (3 new failed, 0 new passed)              |
| `scripts/ci/check-plan-scope.sh`   | `OK: feat/B6.4-agent stays inside the approved plan of B6.4 (D-27 approval)` |
| `scripts/ci/check-feat-commits.sh` | `OK: no feat commit touches tests`                                           |
| `pnpm build`                       | [unverified] not run by the reviewer; CI runs it                             |

Dispositions: none needed (0 findings). Revert probe: `clearCompletedLabel(completedCount ?? 0)` → `(0)` fails
AC-32.2 and AC-32.4. Riskiest unfalsified: `src/app/page.tsx:51` is covered only by e2e AC-32.5/32.6; its revert was
traced, not run.

## Evidence

- AC met: 7/7
- tier: medium
- plan deviations: none
- trace: n/a

## Checklist

- [ ] **Diff matches the approved plan**: no file outside the Files table, no interface outside the list.
- [ ] Red commit precedes the feat commit; no `feat(` commit touches `*.test.*` or `e2e/**`.
- [ ] Every `AC-§.n` of the section is a test title; mutation on `src/lib` + `src/actions` ≥ 70 %.
- [ ] No new `eslint-disable` / `@ts-ignore` / `@ts-expect-error`; no protected config change (or label `config-change-approved` with the reason).
- [ ] Migrations reviewed as SQL; `prisma/seed.ts` updated if a table changed.
- [ ] `spec/features-map.md` row moved; `docs/metrics.md` per-card row filled; mistake-log updated if a known mistake repeated.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
