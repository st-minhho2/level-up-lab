# B5.4 plan — The browser tab title shows the remaining count (§26)

Approach: A from `advice.md` — a pure `src/lib/page-title.ts` plus `generateMetadata` in `src/app/page.tsx`, exactly
§26's Function contracts and D-30 (the batch's one `page.tsx` card, no new component); the title is server-rendered,
so it is right with JavaScript off and after a reload, and `revalidatePath('/')` refreshes it (REQ-26.4, proven by
AC-26.5/26.6). Two `listTodos()` reads per request, as §26 states (no `cache()`, `src/lib/todos.ts` untouched). The e2e
file follows the section number: `e2e/26-page-title.spec.ts` (advice Q2). No migration, dependency, env key or
CI-protected path (no `config-change-approved`). Deviation from advice: the skeleton is its own `chore` commit
(dev-lead Loop 6), not part of `test(...)`.

## Files

| File                         | Change                                                                                                                                                                  | Why (AC-26.n) |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| `src/lib/page-title.ts`      | Add `pageTitle` (skeleton throws `NotImplementedError`, then green)                                                                                                     | 26.1          |
| `src/app/page.tsx`           | Add `generateMetadata` (skeleton returns `{}`, so `/` still renders); header §26                                                                                        | 26.2–26.7     |
| `src/lib/page-title.test.ts` | Add (red): AC-26.1                                                                                                                                                      | 26.1          |
| `src/app/page.test.ts`       | Add (red): AC-26.2, AC-26.3; mocks `@/lib/todos` and `@/lib/prisma` with a factory (`{ prisma: {} }`: `server-only` via the client components' actions, review round 1) | 26.2, 26.3    |
| `e2e/26-page-title.spec.ts`  | Add (red): AC-26.4–AC-26.7 with `expect(page).toHaveTitle`                                                                                                              | 26.4–26.7     |
| `spec/features-map.md`       | Add the F24 row (§26): skeleton ✗, ✅ in `docs(map)`                                                                                                                    | map           |

Paperwork (exempt): §26 index row stays ✗ until the closing PR; `docs/metrics.md` per-card row.

## Interfaces touched

```ts
// src/lib/page-title.ts (§26): pure, no Prisma, no server-only
export function pageTitle(remaining: number): string; // `(${remaining}) Todos` when remaining >= 1, else `Todos`
// src/app/page.tsx (§26): no argument, never reads searchParams (REQ-26.3); title only, layout description kept
export async function generateMetadata(): Promise<Metadata>; // { title: pageTitle(countRemaining(await listTodos())) }
// No Server Action, Zod schema, Prisma model, query, env key; layout.tsx, todos.ts, todo-count.ts unchanged.
```

## Verification

Red (`test(todos): B5.4 … (red)`): `scripts/verify-red.sh B5.4` exit 0; AC-26.1 fails on the skeleton's
`NotImplementedError`, AC-26.2/26.3 on assertions (`title` undefined from the `{}` skeleton);
`pnpm test:e2e e2e/26-page-title.spec.ts` → AC-26.4–26.7 failed on the title (`level-up-lab`, the layout's), the
other 46 e2e stay green between the commits, recorded in the body. Green: `pnpm lint && pnpm typecheck` clean · `pnpm test` 218 → 221 passed
(3 new AC-26.n) · `pnpm test:e2e` 46 → 50 passed, `e2e/13-remaining-count.spec.ts` and `e2e/smoke.spec.ts` unchanged
and green · `pnpm test:mutation` ≥ 70 with `src/lib/page-title.ts` in scope (`page.tsx` is outside Stryker; AC-26.2–
26.7 cover it) · `pnpm build` ok · `scripts/ci/check-plan-scope.sh` OK. Counts are the test-writer's target; a
different count is stated in the red commit. AC-26.5 red after green code → stop (a client fallback needs a D-n).

## Work breakdown

| Step | Role / skill        | Produces                                        | Commit                         |
| ---- | ------------------- | ----------------------------------------------- | ------------------------------ |
| 1    | `new-feature-slice` | `pageTitle` + `generateMetadata` stubs, F24 ✗   | `chore(todos): B5.4 skeleton`  |
| 2    | test-writer         | 2 unit files + `e2e/26-page-title.spec.ts`, red | `test(todos): B5.4 … (red)`    |
| 3    | code-writer         | `page-title.ts`, `generateMetadata`             | `feat(todos): B5.4 …`          |
| 4    | dev-lead            | F24 ✅                                          | `docs(map): F24 … [B5.4]`      |
| 5    | reviewer (diff)     | `review.md` diff section                        | `docs(backlog): B5.4 review …` |

Plan review: pending · Plan approved by: · Rounds: 1
