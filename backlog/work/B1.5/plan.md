# B1.5 plan — Feedback when creating a todo fails (§10, Tier full)

Approach: A from `advice.md` — `createTodoAction` gets the §10 try/catch (Zod parse outside, `createTodo` +
`revalidatePath` inside, bare `catch` → `failure('form', MUTATION_FAILED_MESSAGE)`); `TodoForm` owns a controlled
`draft` and wraps the action passed to `useActionState`, clearing the draft unless the result is a `form` failure.
Why A over B-2: its correctness does not depend on React 19's reset-versus-`defaultValue` commit order (an
undocumented detail). Option B of analysis Q1 (keep the typed title after a `form` failure only) is what §10 says;
ticking the §10 box at this gate settles it. No migration, no dependency, no `ActionResult` change.

## Files

| File                                                                                  | Change                                                                                                                                                                                                                              | Why (AC-10.n) |
| ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| `src/actions/todos.ts`                                                                | `createTodoAction`: one try/catch around `createTodo` + `revalidatePath` + success return; header comment gains "create"                                                                                                            | 10.4          |
| `src/components/todo-form.tsx`                                                        | `useState` draft, controlled input, typed wrapper around `createTodoAction`; alert reads `title?.[0] ?? form?.[0]`                                                                                                                  | 10.5          |
| `src/actions/CLAUDE.md`, `src/components/CLAUDE.md`                                   | drop "create still reaches the error boundary until B1.5"; the form joins the §10 alert contract                                                                                                                                    | docs          |
| `spec/features-map.md`                                                                | F8 row gains `src/components/todo-form.tsx` and `src/components/todo-form.test.tsx`                                                                                                                                                 | —             |
| `docs/metrics.md`                                                                     | per-card row B1.5                                                                                                                                                                                                                   | —             |
| tests (test-writer): `src/actions/todos.test.ts`, `src/components/todo-form.test.tsx` | AC-10.4 (card's exact title; blank-title half in the same test); one untitled-criterion test where `revalidatePath` throws after `createTodo` resolves; AC-10.5 (alert first, then value `Buy milk`, recovery inside the same test) | all           |

Skeleton: none (every function exists); red fails on assertions (the action rejects; the form shows no alert and an
empty box). Existing §5 TodoForm and action tests stay untouched. No e2e: no fault-injection hook (§10 out of scope).
§10 index ◐ → ✅ in the closing commit after merge.

## Interfaces touched

```ts
// src/actions/todos.ts — signature unchanged
export function createTodoAction(previous: ActionResult<Todo> | null, formData: FormData): Promise<ActionResult<Todo>>;
// src/components/todo-form.tsx — TodoForm(): ReactNode unchanged; inside:
useActionState(async (previous: ActionResult<Todo> | null, formData: FormData): Promise<ActionResult<Todo>> => {
  /* await action; clear draft unless form failure */
}, null);
```

## Verification

```bash
scripts/verify-red.sh B1.5   # 3 new tests fail on behavior, 0 new pass
pnpm lint && pnpm typecheck && pnpm test   # 67 + 3 = 70 green
pnpm test:e2e                # 12 unchanged (Chromium check of the controlled input via AC-5.2/5.3 e2e)
pnpm test:mutation           # ≥ 70 (baseline 82.80 %); catch mutants killed by AC-10.4's toEqual
scripts/ci/check-ac-coverage.sh && scripts/ci/check-features-map.sh && scripts/ci/check-feat-commits.sh
```

## Work breakdown

| Step          | Role / skill                          | Produces                               | Commit                                                        |
| ------------- | ------------------------------------- | -------------------------------------- | ------------------------------------------------------------- |
| 1 Plan review | `reviewer` (plan)                     | `review.md` plan section               | `docs(backlog): B1.5 plan review`                             |
| 2 Red         | `test-writer` → red gate (dev-lead)   | tests; `verify-red.sh B1.5` exit 0     | `test(todos): B1.5 feedback when creating a todo fails (red)` |
| 3 Green       | `code-writer` → green gate (dev-lead) | behavior, guides                       | `feat(todos): B1.5 feedback when creating a todo fails`       |
| 4 Map         | dev-lead                              | F8 row, metrics row                    | `docs(map): F8 create path [B1.5]`                            |
| 5 Review      | `reviewer` (diff), `/review-loop`     | `review.md` diff section, gate cleared | —                                                             |

Plan approved by: · Rounds: 1
