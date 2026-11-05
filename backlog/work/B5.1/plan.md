# B5.1 plan — Show how many open todos are overdue (§23)

Approach: A from `advice.md` — a pure `src/lib/overdue-count.ts` on §17's `isOverdue` plus a `'use client'`
`OverdueCount` that reads the day once after mount (`setToday((previous) => previous ?? todayOf(new Date()))`, no
timer), rendered by `page.tsx` from the unfiltered `todos` right after `<RemainingCount/>`. It matches §23's function
block, keeps §17's files untouched (D-30), and REQ-23.4 needs no new code (every action already revalidates `/`).
Analysis Q1–Q6 as proposed. No migration, dependency, env key or CI-protected path (no `config-change-approved`).
Costs: no count with JS off; after local midnight with the page open, rows and count may disagree until a reload.

## Files

| File                                    | Change                                                                     | Why (AC-23.n) |
| --------------------------------------- | -------------------------------------------------------------------------- | ------------- |
| `src/lib/overdue-count.ts`              | Add `countOverdue`, `overdueLabel` (skeleton stubs, then green)            | 23.1, 23.2    |
| `src/components/overdue-count.tsx`      | Add `OverdueCount` client component (skeleton renders nothing, then green) | 23.3–23.6     |
| `src/app/page.tsx`                      | Render `<OverdueCount …/>` after `<RemainingCount/>`; header names §23     | 23.7          |
| `src/lib/overdue-count.test.ts`         | Add (red): AC-23.1, AC-23.2                                                | 23.1, 23.2    |
| `src/components/overdue-count.test.tsx` | Add (red): AC-23.3–23.6, fake system time; AC-23.5 hydration (below)       | 23.3–23.6     |
| `e2e/23-overdue-count.spec.ts`          | Add (red): AC-23.7, days relative to the browser's local day               | 23.7          |
| `spec/features-map.md`                  | Add the F21 row (§23): skeleton ✗, ✅ in `docs(map)`                       | map           |

Paperwork (exempt): §23 index row stays ✗ until the closing PR; `docs/metrics.md` per-card row.

## Interfaces touched

```ts
// src/lib/overdue-count.ts (§23): pure, no Prisma, no server-only
export function countOverdue(
  todos: readonly { readonly completed: boolean; readonly dueDate?: string }[],
  today: string,
): number;
export function overdueLabel(count: number): string | undefined; // undefined at 0, else `${count} overdue`
// src/components/overdue-count.tsx (§23): 'use client'; one <span>, no role, no aria-label
export function OverdueCount({
  todos,
}: {
  readonly todos: readonly { readonly completed: boolean; readonly dueDate?: string }[];
}): ReactNode;
// src/app/page.tsx: <OverdueCount todos={todos.map(({ completed, dueDate }) => ({ completed, dueDate }))} />
// No Server Action, Zod schema, Prisma model, query or env key; §17's todayOf/isOverdue imported, unchanged.
```

## Verification

Red (`test(todos): B5.1 … (red)`): `scripts/verify-red.sh B5.1` exit 0; AC-23.1/23.2 fail on the skeleton's
`NotImplementedError`, AC-23.3/23.4/23.6 and the post-hydration step of AC-23.5 on assertions (nothing rendered);
`pnpm test:e2e e2e/23-overdue-count.spec.ts` → AC-23.7 failed, recorded in the body. AC-23.5 (review round 1):
`hydrateRoot(…, { onRecoverableError })` called 0 times, as AC-17.5 in `todo-due-date-overdue.test.tsx`, besides
the spec's 0 `process.stderr.write` calls (the spy alone cannot see a mismatch). `src/components/` is outside
Stryker's `mutate`: the component's day guards rest on AC-23.5/23.6. Green:
`pnpm lint && pnpm typecheck` clean · `pnpm test` 207 → 213 passed (6 new AC-23.n) · `pnpm test:e2e` 44 → 45 passed,
`e2e/17-overdue.spec.ts` and `e2e/22-all-done.spec.ts` unchanged and green · `pnpm test:mutation` ≥ 70 with
`src/lib/overdue-count.ts` in scope · `pnpm build` ok · `scripts/ci/check-plan-scope.sh` OK. Counts are the
test-writer's target; a different count is stated in the red commit.

## Work breakdown

| Step | Role / skill        | Produces                                              | Commit                         |
| ---- | ------------------- | ----------------------------------------------------- | ------------------------------ |
| 1    | `new-feature-slice` | 2 stubs (`NotImplementedError` / empty render), F21 ✗ | `chore(todos): B5.1 skeleton`  |
| 2    | test-writer         | 2 test files + `e2e/23-overdue-count.spec.ts`, red    | `test(todos): B5.1 … (red)`    |
| 3    | code-writer         | both modules, `page.tsx`                              | `feat(todos): B5.1 …`          |
| 4    | dev-lead            | F21 ✅                                                | `docs(map): F21 … [B5.1]`      |
| 5    | reviewer (diff)     | `review.md` diff section                              | `docs(backlog): B5.1 review …` |

Plan review: approved, round 2 (round 1: 1 reason, AC-23.5 hydration check, applied 0bc8786) · Plan approved by: · Rounds: 1
