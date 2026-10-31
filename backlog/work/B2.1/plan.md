# B2.1 plan — Filter the list: All / Active / Completed (§12, Tier full)

Approach: A from `advice.md`, which is the §12 contract: `?filter=` query parameter, pure `src/lib/todo-filter.ts`,
link-only `TodoFilterNav` without `'use client'` (no state, no events; analysis Q2), wired in `src/app/page.tsx`, the
batch-1 mount point this card holds (D-20 (a)). `src/lib/todos.ts` and `src/actions/todos.ts` untouched. No
dependency, migration, env key or CI-protected path (no `config-change-approved`). Approving this plan also ticks §12's
`Lead approves spec` box (D-7) and accepts the two new empty texts "No active todos" / "No completed todos".

## Files

| File                                      | Change                                                                                    | Why (AC-12.n) |
| ----------------------------------------- | ----------------------------------------------------------------------------------------- | ------------- |
| `src/lib/todo-filter.ts`                  | new: `TodoFilter`, `parseTodoFilter`, `filterTodos`, `emptyListMessage` (skeleton throws) | 12.1–12.3     |
| `src/components/todo-filter-nav.tsx`      | new: `<nav aria-label="Filter todos">`, three `<Link>`s, `aria-current` on selected only  | 12.4, 12.7    |
| `src/app/page.tsx`                        | `searchParams` → `parseTodoFilter`; nav in both states; list `filterTodos`; empty text    | 12.5–12.7     |
| `src/lib/todo-filter.test.ts`             | new (red): AC-12.1 (card `Test:` title verbatim), AC-12.2, AC-12.3                        | 12.1–12.3     |
| `src/components/todo-filter-nav.test.tsx` | new (red): AC-12.4                                                                        | 12.4          |
| `e2e/12-filter.spec.ts`                   | new (red): AC-12.5, AC-12.6, AC-12.7; seed via `PrismaClient` as `09-clear-completed`     | 12.5–12.7     |
| `src/lib/CLAUDE.md`                       | one row `todo-filter.ts` (§12)                                                            | docs          |
| `src/components/CLAUDE.md`                | one line: `todo-filter-nav.tsx` is link-only, no `'use client'`                           | docs          |
| `spec/features-map.md`                    | F10 row ✗ in skeleton (guard needs every module named), ✅ in `docs(map)`                 | map           |
| `docs/metrics.md`                         | per-card row B2.1                                                                         | metrics       |

§12 index ✗ → ✅ in the closing commit. `scripts/next-task.sh --check B2.1`: result in `review.md` plan section.

## Interfaces touched

```ts
// src/lib/todo-filter.ts (§12, pure: no Prisma, no server-only)
export type TodoFilter = 'all' | 'active' | 'completed';
export function parseTodoFilter(value: string | string[] | undefined): TodoFilter;
export function filterTodos<T extends { readonly completed: boolean }>(todos: readonly T[], filter: TodoFilter): T[];
export function emptyListMessage(filter: TodoFilter, totalCount: number): string;
// src/components/todo-filter-nav.tsx (§12)
export function TodoFilterNav({ selected }: { readonly selected: TodoFilter }): ReactNode;
// src/app/page.tsx (§7, §12) — route: GET / and /?filter=active|completed
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string | string[] }>;
}): Promise<ReactNode>;
```

## Verification

```bash
scripts/verify-red.sh B2.1   # every new unit/component test fails on NotImplementedError or an assertion, 0 new pass
pnpm lint && pnpm typecheck && pnpm test   # 115 → ≈ 121 green (AC-12.1–12.4)
pnpm test:e2e                # e2e/12-filter.spec.ts 3 new green (AC-12.5–12.7); 05, 09, 10 unchanged
pnpm test:mutation           # ≥ 70 (base 89.02 %); todo-filter.ts mutants all Killed or listed
scripts/ci/check-ac-coverage.sh && scripts/ci/check-features-map.sh && scripts/ci/check-feat-commits.sh && scripts/ci/check-spec-sections.sh
```

Risk: if AC-12.6 shows the filter lost after `revalidatePath('/')`, the fix touches `src/actions/todos.ts`: stop, re-plan.

## Work breakdown

| Step          | Role / skill                          | Produces                                  | Commit                                    |
| ------------- | ------------------------------------- | ----------------------------------------- | ----------------------------------------- |
| 1 Plan review | `reviewer` (plan)                     | `review.md` plan section                  | `docs(backlog): B2.1 plan review`         |
| 2 Skeleton    | `new-feature-slice`                   | two stubs, F10 ✗ row                      | `chore(todos): B2.1 skeleton`             |
| 3 Red         | `test-writer` → red gate (dev-lead)   | 3 test files; `verify-red.sh B2.1` exit 0 | `test(todos): B2.1 filter the list (red)` |
| 4 Green       | `code-writer` → green gate (dev-lead) | lib, nav, page wiring, `CLAUDE.md` rows   | `feat(todos): B2.1 filter the list`       |
| 5 Map         | dev-lead                              | F10 ✅, metrics row                       | `docs(map): F10 filter the list [B2.1]`   |
| 6 Review      | `reviewer` (diff), `/review-loop`     | `review.md` diff section, gate cleared    | `docs(backlog): B2.1 diff review`         |

Plan review: pending · Plan approved by: · Rounds: 1
