# B2.4 plan — An optional due date per todo (§15)

Approach: A from `advice.md` — §15's function contracts one to one; one phase, one lead approval. `src/app/page.tsx` is
**not touched** (it already passes whole `Todo` objects to `TodoItem`, which renders `TodoDueDate`), so B2.5 may take
the page at once. Analysis Q1–Q10 as advised: no due date on create (`TodoForm`, `todo-schema.ts` unchanged), year
0001–9999, past dates accepted, no §5 edit (§15 extends `Todo`), seed unchanged. Approving ticks §15's
`Lead approves spec` box. Migration: one nullable `DATE` column, local compose database only. No dependency, no env
key, no CI-protected path (no `config-change-approved`).

## Files

| File                                    | Change                                                                                             | Why (AC-15.n)  |
| --------------------------------------- | -------------------------------------------------------------------------------------------------- | -------------- |
| `prisma/schema.prisma`                  | `model Todo` + `dueDate DateTime? @db.Date` (`/add-migration`)                                     | REQ-15.1, 15.9 |
| `prisma/migrations/*`                   | Add `<ts>_add_todo_due_date/migration.sql`: one nullable column, no index, no backfill             | REQ-15.9       |
| `src/lib/todo-due-date.ts`              | Add: `DUE_DATE_INVALID_MESSAGE`, `setTodoDueDateSchema`, `dueDateToDate`, `dueDateOf` (pure)       | 15.1, 15.2     |
| `src/lib/todo-due-date.test.ts`         | Add (red): AC-15.1 + boundary rows (`0001-01-01`, `9999-12-31`, `1900-02-29`, trailing chars)      | 15.1           |
| `src/lib/todos.ts`                      | `Todo.dueDate?`; `dueDate` selected and mapped via `dueDateOf` in all four reads; `setTodoDueDate` | 15.2           |
| `src/lib/todo-due-date-store.test.ts`   | Add (red): AC-15.2 (list mapping, set, clear, missing id → `TodoNotFoundError`, no `update`)       | 15.2, REQ-15.8 |
| `src/lib/logger.ts`                     | `MutationActionName` + `'setTodoDueDateAction'` (type only)                                        | 15.4           |
| `src/actions/todos.ts`                  | Add `setTodoDueDateAction` (Zod outside `try`, one lib call, `revalidatePath('/')`, §10/§11)       | 15.3, 15.4     |
| `src/actions/todos.test.ts`             | Add (red): `describe('setTodoDueDateAction')` AC-15.3, AC-15.4; hoisted `lib` gains one key        | 15.3, 15.4     |
| `src/components/todo-due-date.tsx`      | Add `TodoDueDate` (`'use client'`): text, icon button, date form, transition, alert                | 15.5, 15.6     |
| `src/components/todo-due-date.test.tsx` | Add (red): AC-15.5 (a), (b); AC-15.6                                                               | 15.5, 15.6     |
| `src/components/todo-item.tsx`          | One import + `<TodoDueDate todoId={todo.id} dueDate={todo.dueDate} />` inside the `<li>` (green)   | 15.5, 15.7     |
| `e2e/15-due-date.spec.ts`               | Add (red): AC-15.7 set → reload → clear → reload; order C, B, A and B's completion kept            | 15.7           |
| `src/actions/CLAUDE.md`                 | The actions sentence names `setTodoDueDateAction`                                                  | docs           |

Guides: `src/lib/CLAUDE.md` and `src/components/CLAUDE.md` are left out (plan review round 1, reason 1) so B2.5 can
list them and `page.tsx` in its first plan with a clean `--check`; the two §15 module lines join those guides in
whichever card edits them after B2.4 merges (a cost stated at the gate).

Skeleton stubs (plan review round 2): `setTodoDueDateSchema` rejects every value
(`dueDate: z.string().refine(() => false, 'not implemented (B2.4)')`), `dueDateToDate`, `dueDateOf`, `setTodoDueDate`,
`setTodoDueDateAction` throw `NotImplementedError`, `TodoDueDate` returns `null`, `todos.ts` mapping unchanged. A case
the stubs already satisfy (renders nothing, no `dueDate` in the list) shares an `it` with an assertion they fail.

Paperwork (exempt): `spec/features-map.md` F13 row ✗ in the skeleton, ✅ in `docs(map)`; §15 index row stays ✗ until
the closing PR; `docs/metrics.md` per-card row. Risk carried from advice: `dueDateOf` written null-safe
(`stored?.toISOString().slice(0, 10)`) so existing lib rows without `dueDate` keep passing (feat touches no test).

## Interfaces touched

```ts
// src/lib/todo-due-date.ts (§15) — pure, no Prisma, no server-only
export const DUE_DATE_INVALID_MESSAGE: 'Due date must be a valid date';
export const setTodoDueDateSchema: z.ZodObject<{ id: z.ZodString; dueDate: z.ZodType<string | undefined, string> }>;
export function dueDateToDate(dueDate: string): Date; // `${dueDate}T00:00:00.000Z`
export function dueDateOf(stored: Date | null): string | undefined; // 'YYYY-MM-DD' | undefined
// src/lib/todos.ts
export interface Todo {
  readonly id: string;
  readonly title: string;
  readonly completed: boolean;
  readonly createdAt: Date;
  readonly dueDate?: string;
}
export async function setTodoDueDate(id: string, dueDate: string | undefined): Promise<Todo>; // TodoNotFoundError
// src/actions/todos.ts ('use server')
export async function setTodoDueDateAction(id: string, dueDate: string): Promise<ActionResult<Todo>>;
// src/lib/logger.ts: MutationActionName | 'setTodoDueDateAction'
// src/components/todo-due-date.tsx ('use client')
export function TodoDueDate({
  todoId,
  dueDate,
}: {
  readonly todoId: string;
  readonly dueDate: string | undefined;
}): ReactNode;
// prisma: model Todo { … dueDate DateTime? @db.Date }   migration add-todo-due-date
```

## Verification

Red (`test(todos): B2.4 … (red)`): `scripts/verify-red.sh B2.4` exit 0 with 21 new unit tests failing on an assertion
or `NotImplementedError` (never an import): `src/lib/todo-due-date.test.ts` 7, `src/lib/todo-due-date-store.test.ts` 3,
`src/actions/todos.test.ts` +6 (AC-15.3 ×4, AC-15.4, `revalidatePath` throws), `src/components/todo-due-date.test.tsx`
5 (AC-15.5 ×2, AC-15.6 ×3); `pnpm test:e2e e2e/15-due-date.spec.ts` → 1 failed, recorded in the red commit body
(`verify-red.sh` skips e2e). Green: `pnpm lint && pnpm typecheck` clean · `pnpm test` 138 → 159 passed ·
`pnpm test:e2e` 24 → 25 passed · `pnpm test:mutation` ≥ 70 (target ≥ 85; hot spots in `advice.md`) · `pnpm build` ok ·
`scripts/ci/check-plan-scope.sh` OK. Counts are the test-writer's target; a different count is stated in the red commit.

## Work breakdown

| Step | Role / skill                          | Produces                                               | Commit                         |
| ---- | ------------------------------------- | ------------------------------------------------------ | ------------------------------ |
| 1    | `add-migration` + `new-feature-slice` | schema, migration, stubs, logger member, F13 ✗         | `chore(todos): B2.4 skeleton`  |
| 2    | test-writer                           | 4 unit/component files + `e2e/15`, all red             | `test(todos): B2.4 … (red)`    |
| 3    | code-writer                           | lib, action, component, `TodoItem` line, actions guide | `feat(todos): B2.4 …`          |
| 4    | dev-lead                              | F13 ✅                                                 | `docs(map): F13 … [B2.4]`      |
| 5    | reviewer (diff)                       | `review.md` diff section                               | `docs(backlog): B2.4 review …` |

Plan review: pending · Plan approved by: · Rounds: 1
