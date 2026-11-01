# B3.3 plan — Delete a todo (§19)

Approach: A from `advice.md` — §19's function contracts one to one: own lib and action modules, `DeleteTodoButton`
(`onClick` + `useTransition`, as `CompleteAllButton`), one line in `todo-item.tsx`. One phase, one lead approval
(D-21): `src/app/page.tsx` is not touched, so `e2e/19-delete.spec.ts` lands red with the unit tests. Analysis Q1–Q8 as
proposed: no confirmation, missing id keeps the row with "Todo not found", the button owns its alert, delete shown in
edit mode too. No dependency, no env key, no migration, no CI-protected path (no `config-change-approved`).

## Files

| File                                         | Change                                                                                       | Why (AC-19.n)    |
| -------------------------------------------- | -------------------------------------------------------------------------------------------- | ---------------- |
| `src/lib/todo-delete.ts`                     | Add `deleteTodo`: one `deleteMany({ where: { id } })`, count 0 → `TodoNotFoundError`         | 19.1             |
| `src/lib/todo-delete.test.ts`                | Add (red): AC-19.1 + unprefixed "rethrows a storage error unchanged"                         | 19.1             |
| `src/actions/delete-todo.ts`                 | Add `deleteTodoAction` (`'use server'`): Zod outside `try`, one lib call, `revalidatePath`   | 19.2, 19.3, 19.4 |
| `src/actions/delete-todo.test.ts`            | Add (red): AC-19.2, AC-19.3, AC-19.4 (a) (b); mocks lib, `next/cache`, logger, prisma `{}`   | 19.2, 19.3, 19.4 |
| `src/lib/logger.ts`                          | `MutationActionName` + `'deleteTodoAction'` (type only)                                      | 19.4             |
| `src/components/delete-todo-button.tsx`      | Add `DeleteTodoButton` (`'use client'`): icon button, transition, disabled, alert sibling    | 19.5, 19.6       |
| `src/components/delete-todo-button.test.tsx` | Add (red): AC-19.5 (a), AC-19.6                                                              | 19.5, 19.6       |
| `src/components/todo-item.tsx`               | One import + `<DeleteTodoButton todoId={todo.id} />` in the `<li>`, outside the edit ternary | 19.5, 19.7       |
| `src/components/todo-item.test.tsx`          | Change (red, test-writer only): hoisted `deleteActions` + `vi.mock`; new AC-19.5 (b) test    | 19.5             |
| `e2e/19-delete.spec.ts`                      | Add (red): AC-19.7 C, B, A → delete B, reload → delete C, A, reload → "No todos yet"         | 19.7             |

Paperwork (exempt): `spec/features-map.md` F17 row ✗ in the skeleton, ✅ in `docs(map)`; §19 index row stays ✗ until
the closing PR; `docs/metrics.md` per-card row. Package guides (`src/*/CLAUDE.md`) left out per D-21 (orchestrator).

Skeleton (advice): `deleteTodo`, `deleteTodoAction` return `Promise.reject(new NotImplementedError(…))`,
`DeleteTodoButton` throws `NotImplementedError` on render; `todo-item.tsx` not mounted in the skeleton (a throwing stub
would turn existing `TodoItem` tests red for the wrong reason). Red traps: the `todo-item.test.tsx` mock lands in the
`(red)` commit, and no new title starts with an existing title verbatim (`verify-red.sh` classes it as old).

## Interfaces touched

```ts
// src/lib/todo-delete.ts (§19)
export async function deleteTodo(id: string): Promise<void>; // TodoNotFoundError from '@/lib/todos'
// src/actions/delete-todo.ts ('use server')
export async function deleteTodoAction(id: string): Promise<ActionResult<{ id: string }>>; // toggleTodoSchema
// src/lib/logger.ts: MutationActionName | 'deleteTodoAction'
// src/components/delete-todo-button.tsx ('use client')
export function DeleteTodoButton({ todoId }: { readonly todoId: string }): ReactNode;
```

## Verification

Red (`test(todos): B3.3 … (red)`): `scripts/verify-red.sh B3.3` exit 0, ≈ 11 new unit tests failing on an assertion or
`NotImplementedError` (lib 2, action 5, button 2, `TodoItem` 2); `pnpm test:e2e e2e/19-delete.spec.ts` → 1 failed,
recorded in the commit body. Green: `pnpm lint && pnpm typecheck` clean · `pnpm test` 169 → ≈ 180 passed ·
`pnpm test:e2e` all green (+1) · `pnpm test:mutation` ≥ 70 (target ≥ 85; hot spots in `advice.md`) · `pnpm build` ok ·
`scripts/ci/check-plan-scope.sh` OK. Counts are the test-writer's target; a different count is stated in the red commit.

## Work breakdown

| Step | Role / skill        | Produces                                   | Commit                         |
| ---- | ------------------- | ------------------------------------------ | ------------------------------ |
| 1    | `new-feature-slice` | 3 stubs, logger member, F17 ✗              | `chore(todos): B3.3 skeleton`  |
| 2    | test-writer         | 4 unit/component files + `e2e/19`, all red | `test(todos): B3.3 … (red)`    |
| 3    | code-writer         | lib, action, button, `TodoItem` line       | `feat(todos): B3.3 …`          |
| 4    | dev-lead            | F17 ✅                                     | `docs(map): F17 … [B3.3]`      |
| 5    | reviewer (diff)     | `review.md` diff section                   | `docs(backlog): B3.3 review …` |

Plan review: pending · Plan approved by: · Rounds: 1
