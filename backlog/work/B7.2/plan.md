# B7.2 plan — The "Mark all complete" button says how many it will mark (§36)

Approach: A from `advice.md` — §32's pattern, the §36 Function contracts as written: a pure `completeAllLabel` in
`src/lib`, an optional `count` prop on `CompleteAllButton`, and `page.tsx` passes `filterCounts(todos).active` from the
one unfiltered, unsearched `listTodos()` result (no second query). B is rejected: it drops the contract's prop and
REQ-36.6. The §14 edits D-37 asks for are on this branch (c155c3a, advice.md), so no `docs(spec)` commit. No
migration, dependency, env key or CI-protected path (no `config-change-approved`). `src/lib/todos.ts`,
`src/lib/filter-counts.ts`, `src/actions/*` and §14's `complete-all-button.test.tsx` stay untouched (D-33).

## Files

| File                                                | Change                                                                                       | Why (AC-36.n) |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------- |
| `src/lib/complete-all-label.ts`                     | Add: `completeAllLabel` (skeleton throws `NotImplementedError`, green formats the label)     | 36.1          |
| `src/components/complete-all-button.tsx`            | Optional `count` prop (skeleton ignores it); green renders `completeAllLabel(count ?? 0)`    | 36.2–36.4     |
| `src/app/page.tsx`                                  | Green: `count={filterCounts(todos).active}`; header names §36                                | 36.5–36.7     |
| `src/lib/complete-all-label.test.ts`                | Add (red): AC-36.1, the card's Test line title                                               | 36.1          |
| `src/components/complete-all-button-count.test.tsx` | Add: AC-36.3 pinned green; AC-36.2, 36.4 red; §14's `complete-all-button.test.tsx` untouched | 36.2–36.4     |
| `e2e/36-complete-all-count.spec.ts`                 | Add: AC-36.7 pinned green; AC-36.5, 36.6 red; seeded with `PrismaClient` as sibling specs    | 36.5–36.7     |
| `spec/features-map.md`                              | Add the F34 row (§36) in code-writer's `docs(map)` commit                                    | map           |

Paperwork (exempt): §36 index row stays ✗ until the closing PR; `docs/metrics.md` per-card row.

## Interfaces touched

```ts
// src/lib/complete-all-label.ts (pure: no Prisma, no server-only; imported by a client component)
export function completeAllLabel(open: number): string;
// src/components/complete-all-button.tsx ('use client')
export function CompleteAllButton({
  disabled,
  count,
}: {
  readonly disabled: boolean;
  readonly count?: number;
}): ReactNode;
// No Server Action, Zod schema, Prisma model, query or env key.
```

## Verification

Baseline: `pnpm test` 280 passed (45 files), e2e 64 tests (28 files, counted). Pin (`test(todos): B7.2 pin AC-36.3,
AC-36.7 …`, no `(red)`): AC-36.3 green on the skeleton (no count / count 0 → "Mark all complete", REQ-36.6 holds
today), 280 → 281; AC-36.7 green on the skeleton (empty list). Red (`test(todos): B7.2 … (red)`):
`scripts/verify-red.sh B7.2` exit 0 (zero new tests green); AC-36.1 fails on `NotImplementedError`, AC-36.2/36.4 on the
exact name "Mark all complete (n)", never an import; `pnpm test:e2e e2e/36-complete-all-count.spec.ts` → AC-36.5, 36.6
fail on the name. Green: `pnpm lint && pnpm typecheck` clean · `pnpm test` 281 → 284 passed, AC-14.n green untouched ·
`pnpm test:e2e` 64 → 67 passed; `e2e/14`, `16`, `22`, `30` green untouched (substring name match) ·
`pnpm test:mutation` ≥ 70 (0/1 boundary, 12 for padding, killed by AC-36.1) · `pnpm build` ok ·
`scripts/ci/check-plan-scope.sh` OK.

## Work breakdown

| Step | Role / skill                | Produces                                            | Commit                                     |
| ---- | --------------------------- | --------------------------------------------------- | ------------------------------------------ |
| 1    | skeleton: new-feature-slice | `complete-all-label.ts` stub, button's ignored prop | `chore(todos): B7.2 skeleton`              |
| 2    | test-writer                 | AC-36.3 (component), AC-36.7 (e2e), green           | `test(todos): B7.2 pin AC-36.3, AC-36.7 …` |
| 3    | test-writer                 | AC-36.1, 36.2, 36.4, 36.5, 36.6, red                | `test(todos): B7.2 … (red)`                |
| 4    | code-writer                 | label, prop wiring, page count                      | `feat(todos): B7.2 …`                      |
| 5    | code-writer                 | F34 row                                             | `docs(map): F34 … [B7.2]`                  |
| 6    | reviewer (diff)             | `review.md` diff section                            | `docs(backlog): B7.2 review …`             |

Plan review: pending · Plan approved by: · Rounds: 1
