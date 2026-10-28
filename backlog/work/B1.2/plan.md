# B1.2 plan — Edit a todo title (§6)

Approach: A (advice.md) — reuse §5's title schema and the `findUnique` → `update` lib shape; no migration, no new
dependency, no change to list order (`createdAt desc`; an edit only moves `updatedAt`).

## Files

| File                                                                                                                                                                           | Change                                                                                                                                                                                                                  | Why (AC-6.n)       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| `src/lib/todo-schema.ts`                                                                                                                                                       | add `updateTodoTitleSchema = createTodoSchema.extend(toggleTodoSchema.shape)`                                                                                                                                           | 6.2, 6.4, 6.5, 6.6 |
| `src/lib/todos.ts`                                                                                                                                                             | add `updateTodoTitle(id, title)`: `findUnique` → `TodoNotFoundError` → `update({ where: { id }, data: { title }, select: todoFields })`                                                                                 | 6.2, 6.3, 6.7      |
| `src/actions/todos.ts`                                                                                                                                                         | add `updateTodoTitleAction(id, title)`: parse, lib call, `revalidatePath('/')`, `TodoNotFoundError` → `failure('id', 'Todo not found')`                                                                                 | 6.2, 6.4–6.7       |
| `src/components/todo-item.tsx`                                                                                                                                                 | edit mode: icon-only button `aria-label="Edit title"` (no text in the row), text field labelled "Edit title" prefilled, "Save"; stays in edit mode with the error and the draft on `ok: false`, leaves it on `ok: true` | 6.1, 6.2, 6.4, 6.5 |
| `spec/features-map.md`, `spec/technical-requirements.md`                                                                                                                       | F6 ✗ → ✅, §6 ✗ → ✅ (green commit / `docs(map)`)                                                                                                                                                                       | —                  |
| `docs/metrics.md`                                                                                                                                                              | per-card row B1.2                                                                                                                                                                                                       | —                  |
| tests (test-writer): `src/lib/todo-schema.test.ts`, `src/lib/todos.test.ts`, `src/actions/todos.test.ts`, `src/components/todo-item.test.tsx`, new `e2e/06-edit-title.spec.ts` | red commit; the hoisted action mock in `todo-item.test.tsx` gains the key `updateTodoTitleAction`                                                                                                                       | all                |

Constraint carried from advice: `<li>` idle text must stay exactly the title (`e2e/05-todos.spec.ts` AC-5.1 compares
whole-row text), so no visible "Edit" label; `sr-only` text is still text content and is not allowed either.

## Interfaces touched

```ts
// src/lib/todo-schema.ts
export const updateTodoTitleSchema: z.ZodObject<{ id: z.ZodString; title: z.ZodString }>;
// src/lib/todos.ts
export function updateTodoTitle(id: string, title: string): Promise<Todo>; // throws TodoNotFoundError
// src/actions/todos.ts ('use server')
export function updateTodoTitleAction(id: string, title: string): Promise<ActionResult<Todo>>;
// src/components/todo-item.tsx — props unchanged: TodoItem({ todo }: { readonly todo: Todo }): ReactNode
```

## Verification

```bash
scripts/verify-red.sh B1.2   # red commit: every new AC-6.n test fails on behavior, 0 pass
pnpm test                    # 34 existing + new AC-6.n tests green (schema 4, lib 3+1, actions 5+1, component 4)
pnpm test:e2e                # e2e/06-edit-title.spec.ts green (AC-6.1, 6.2, 6.3, 6.7); 05-todos and smoke unchanged
pnpm test:mutation           # ≥ 70 on src/lib + src/actions (kill `data: { title }` and `where` mutants with toEqual)
scripts/ci/check-ac-coverage.sh && scripts/ci/check-features-map.sh && scripts/ci/check-feat-commits.sh
```

## Work breakdown

| Step       | Role / skill                          | Produces                                                                                                     | Commit                                      |
| ---------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------- |
| 1 Skeleton | `new-feature-slice`                   | stubs rejecting `NotImplementedError`, schema shape, `it.todo` per AC-6.n, empty `e2e/06-edit-title.spec.ts` | `chore(todos): B1.2 skeleton`               |
| 2 Red      | `test-writer` → red gate (dev-lead)   | tests; `verify-red.sh B1.2` exit 0                                                                           | `test(todos): B1.2 edit a todo title (red)` |
| 3 Green    | `code-writer` → green gate (dev-lead) | behavior, map row, metrics row                                                                               | `feat(todos): B1.2 edit a todo title`       |
| 4 Map      | (in step 3 or own commit)             | `F6 ✗ → ✅`, `§6 ✅`                                                                                         | `docs(map): F6 edit title [B1.2]`           |
| 5 Review   | `reviewer` (diff), `/review-loop`     | `review.md`, gate cleared                                                                                    | —                                           |

Plan approved by: minh.ho2 (session reply "approve"), 2026-10-28 · Rounds: 1
