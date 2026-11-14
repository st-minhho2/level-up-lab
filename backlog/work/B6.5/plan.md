# B6.5 plan — The overdue count is announced to assistive technology (§33)

Approach: A from `advice.md` — `OverdueCount` always returns one `<span role="status">`, empty (child `undefined`,
never `''`) while `today` or the label is undefined; same element type and position, so the node survives N changes.
One `src/` file; `page.tsx`, `src/lib/overdue-count.ts` and every action unchanged. §23 line 55 stays: §33's "except"
governs (advisor, P4; D-34 "No other section changes"). Spec landed in f9d3f3a. No migration, dependency, env key or
CI-protected path (no `config-change-approved`). No skeleton: the component exists, so the red is on assertions.

## Files

| File                                    | Change                                                                                                                                                                                                                                                                                                             | Why (AC-§.n)           |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- |
| `src/components/overdue-count.tsx`      | Change: always render `<span role="status">{label}</span>`, `label` undefined while `today` or `overdueLabel(…)` is undefined; header names §23, §33                                                                                                                                                               | 33.1–33.5              |
| `src/components/overdue-count.test.tsx` | Change (red): add AC-33.1–33.4; per D-34 drop only the `role` assertion line of AC-23.3, its title unchanged (a renamed title reads as a new, green test to `verify-red.sh`)                                                                                                                                       | 33.1–33.4, 23.3 (D-34) |
| `e2e/33-overdue-announce.spec.ts`       | Add (red): AC-33.5, among `getByRole('status')` the one the `N items left` paragraph precedes in document order (`compareDocumentPosition` FOLLOWING and not CONTAINS, as `e2e/23-overdue-count.spec.ts:124-127`), never adjacency or "exactly one status on the page" (B6.6 adds another, may wrap the paragraph) | 33.5                   |
| `spec/features-map.md`                  | Add the F31 row (§33), ✅, in code-writer's `docs(map)` commit                                                                                                                                                                                                                                                     | map                    |

Paperwork (exempt): §33 index row stays ✗ until the closing PR; `docs/metrics.md` per-card row.

## Interfaces touched

```ts
// src/components/overdue-count.tsx: signature, props and file unchanged; only the rendered markup changes
export function OverdueCount({
  todos,
}: {
  readonly todos: readonly { readonly completed: boolean; readonly dueDate?: string }[];
}): ReactNode; // always <span role="status">; no aria-label / aria-live / aria-atomic
// No Server Action, Zod schema, Prisma model, query, env key, prop or route.
```

## Verification

Baseline: `pnpm test` 269 passed (43 files), e2e 57. Red (`test(todos): B6.5 … (red)`): `scripts/verify-red.sh B6.5`
exit 0; exactly 4 new `it`s (AC-33.1–33.4), each red on an assertion (no element with role `status` / no empty
span), never on an import; the AC-23.3 edit is a pre-existing test and stays green. `pnpm test:e2e
e2e/33-overdue-announce.spec.ts` → AC-33.5 fails on the missing status element, recorded in the PR body. Green:
`pnpm lint && pnpm typecheck` clean · `pnpm test` 269 → 273 passed (43 files), AC-23.3–23.6 green · `pnpm test:e2e`
57 → 58 passed, `e2e/23-overdue-count.spec.ts` AC-23.7 green · mutation: `src/lib` and `src/actions` untouched, score
unchanged ≥ 70 · `pnpm build` ok · `scripts/ci/check-features-map.sh`, `check-ac-coverage.sh`, `check-plan-scope.sh` OK.

## Work breakdown

| Step | Role / skill    | Produces                                             | Commit                         |
| ---- | --------------- | ---------------------------------------------------- | ------------------------------ |
| 1    | test-writer     | AC-33.1–33.4 + AC-23.3 role line dropped, `e2e/33-…` | `test(todos): B6.5 … (red)`    |
| 2    | code-writer     | the always-present status span                       | `feat(todos): B6.5 …`          |
| 3    | code-writer     | F31 row ✅                                           | `docs(map): F31 … [B6.5]`      |
| 4    | reviewer (diff) | `review.md` diff section                             | `docs(backlog): B6.5 review …` |

Costs the lead takes: one assertion of the existing AC-23.3 test goes (D-34; its title still says "no role or aria-label" until a later card renames it outside a red commit), replaced by AC-33.1's
stronger `role="status"` check; §23's function-contract line still reads "renders nothing", which `/spec-trace` will
report until a D-n tidies it.

Plan review: pending, round 2 (round 1: 2 reasons, AC-23.3 title kept, AC-33.5 locator named) · Plan approved by: · Rounds: 1
