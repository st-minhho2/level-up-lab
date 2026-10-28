# B1.3 plan — Clear completed todos (§9, Tier quick)

Approach: A (advice.md) — one `deleteMany({ where: { completed: true } })` in `src/lib`, a no-input Server Action
returning the deleted count, a client button with a `disabled` prop rendered by `page.tsx` in both empty and list
states (D-10). No migration, no new dependency, no change to the `<li>` row (AC-5.1 stays green).

## Files

| File                                                                                                                                                                                                                                                                                            | Change                                                                                                                                                 | Why (AC-9.n) |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------ |
| `src/lib/todos.ts`                                                                                                                                                                                                                                                                              | add `clearCompletedTodos(): Promise<number>` = `prisma.todo.deleteMany({ where: { completed: true } })` → `.count`                                     | 9.1, 9.3     |
| `src/actions/todos.ts`                                                                                                                                                                                                                                                                          | add `clearCompletedTodosAction(): Promise<ActionResult<{ deleted: number }>>`: lib call, `revalidatePath('/')`, `{ ok: true, data: { deleted } }`      | 9.1, 9.3     |
| `src/components/clear-completed-button.tsx`                                                                                                                                                                                                                                                     | new client component `ClearCompletedButton({ disabled })`: `<button type="button" disabled>` named "Clear completed", calls the action in a transition | 9.2, 9.3     |
| `src/app/page.tsx`                                                                                                                                                                                                                                                                              | render `<ClearCompletedButton disabled={!todos.some((t) => t.completed)} />` after `<TodoForm />`, before the empty/list ternary                       | 9.2, 9.3     |
| `spec/features-map.md`, `spec/technical-requirements.md`                                                                                                                                                                                                                                        | F7 row (§9, ✅), §9 ✗ → ✅ (green commit)                                                                                                              | —            |
| `docs/metrics.md`                                                                                                                                                                                                                                                                               | per-card row B1.3                                                                                                                                      | —            |
| tests (test-writer): `src/lib/todos.test.ts` (+ `deleteMany` in the hoisted `db`), `src/actions/todos.test.ts` (+ `clearCompletedTodos` in the hoisted lib object and the `importOriginal` factory), new `src/components/clear-completed-button.test.tsx`, new `e2e/09-clear-completed.spec.ts` | red commit                                                                                                                                             | all          |

Skeleton stubs (so red fails on behavior, not on imports): `clearCompletedTodos` and `clearCompletedTodosAction`
reject with `NotImplementedError`; `ClearCompletedButton` throws on render (a plain button stub would turn the
AC-9.2 "enabled" test green too early).

## Interfaces touched

```ts
// src/lib/todos.ts
export function clearCompletedTodos(): Promise<number>; // deleted count
// src/actions/todos.ts ('use server')
export function clearCompletedTodosAction(): Promise<ActionResult<{ deleted: number }>>;
// src/components/clear-completed-button.tsx ('use client')
export function ClearCompletedButton({ disabled }: { readonly disabled: boolean }): ReactNode;
```

## Verification

```bash
scripts/verify-red.sh B1.3   # red commit: new AC-9.n tests fail on behavior, 0 new pass
pnpm test                    # 55 existing + new (lib 2–3, actions 2, component 2–3) green
pnpm test:e2e                # e2e/09-clear-completed.spec.ts green (AC-9.2 empty / open-only / one done; AC-9.3); 05, 06, smoke unchanged
pnpm test:mutation           # ≥ 70; lib test asserts deleteMany called once with exactly { where: { completed: true } }
scripts/ci/check-ac-coverage.sh && scripts/ci/check-features-map.sh && scripts/ci/check-feat-commits.sh
```

## Work breakdown

| Step       | Role / skill                          | Produces                                                   | Commit                                          |
| ---------- | ------------------------------------- | ---------------------------------------------------------- | ----------------------------------------------- |
| 1 Skeleton | `new-feature-slice`                   | three throwing stubs, `it.todo` per AC-9.n, empty e2e file | `chore(todos): B1.3 skeleton`                   |
| 2 Red      | `test-writer` → red gate (dev-lead)   | tests; `verify-red.sh B1.3` exit 0                         | `test(todos): B1.3 clear completed todos (red)` |
| 3 Green    | `code-writer` → green gate (dev-lead) | behavior, F7 map row, §9 ✅, metrics row                   | `feat(todos): B1.3 clear completed todos`       |
| 4 Review   | `reviewer` (diff), `/review-loop`     | `review.md`, gate cleared                                  | —                                               |

Plan approved by: · Rounds: 1
