# B1.4 plan — Feedback when a mutation fails (§10, Tier quick)

Approach: A per D-11 — the three mutating Server Actions catch every non-`TodoNotFoundError` and resolve to
`failure('form', MUTATION_FAILED_MESSAGE)` without revalidating; the two client components surface
`fieldErrors.form` in a `role="alert"` next to the control and clear it on the next success. No migration, no new
dependency, no change to the `<li>` idle text (AC-5.1) or the empty-state text (AC-5.7). Advisor skipped (quick tier,
no new query; the design is fixed by §10's function contracts).

## Files

| File                                                                                                                                                                                                                                                                                       | Change                                                                                                                                                                                                                                                     | Why (AC-10.n) |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| `src/lib/action-result.ts`                                                                                                                                                                                                                                                                 | add `export const MUTATION_FAILED_MESSAGE = 'Could not save, try again' as const`                                                                                                                                                                          | 10.1–10.3     |
| `src/actions/todos.ts`                                                                                                                                                                                                                                                                     | `toggleTodoAction`, `updateTodoTitleAction`, `clearCompletedTodosAction`: one try/catch each; `TodoNotFoundError` → `failure('id', …)` (unchanged), anything else → `failure('form', MUTATION_FAILED_MESSAGE)`, no `revalidatePath` on failure; no rethrow | 10.1          |
| `src/components/todo-item.tsx`                                                                                                                                                                                                                                                             | toggle reads `fieldErrors.id?.[0] ?? fieldErrors.form?.[0]`; Save reads `title ?? id ?? form`; success clears the alert; remove the unreachable 'Could not update the todo' literal                                                                        | 10.2          |
| `src/components/clear-completed-button.tsx`                                                                                                                                                                                                                                                | wrapper `<div>` with the button and, after a failed result, `<p role="alert">` as next sibling; success clears it; button re-enabled when pending ends                                                                                                     | 10.3          |
| `src/actions/CLAUDE.md`                                                                                                                                                                                                                                                                    | "only unexpected errors are rethrown" → the D-11 rule                                                                                                                                                                                                      | docs          |
| `spec/features-map.md`, `spec/technical-requirements.md`                                                                                                                                                                                                                                   | F8 row (§10 ✅), §10 ✗ → ✅ (green commit)                                                                                                                                                                                                                 | —             |
| `docs/metrics.md`                                                                                                                                                                                                                                                                          | per-card row B1.4                                                                                                                                                                                                                                          | —             |
| tests (test-writer): `src/actions/todos.test.ts` (rewrite the two "rethrows a non-TodoNotFoundError …" tests into the `AC-10.1:` form-error tests + clear-completed case), `src/components/todo-item.test.tsx` (AC-10.2 a/b/c), `src/components/clear-completed-button.test.tsx` (AC-10.3) | red commit                                                                                                                                                                                                                                                 | all           |

Skeleton: none needed (every function and component exists); the red commit's tests fail on assertions against the
current behavior (actions reject; components ignore the result). `verify-red.sh B1.4` base = parent of the red commit.
No e2e change: a real mutation cannot be made to fail mid-test (§10 out of scope); existing e2e stay green.

## Interfaces touched

```ts
// src/lib/action-result.ts
export const MUTATION_FAILED_MESSAGE: 'Could not save, try again';
// src/actions/todos.ts — signatures unchanged; failure arms per §10
// src/components/todo-item.tsx, clear-completed-button.tsx — props unchanged; alert text from fieldErrors.form
```

## Verification

```bash
scripts/verify-red.sh B1.4   # red commit: new AC-10.n tests fail on behavior, 0 new pass; the two rewritten tests count as new
pnpm test                    # 63 − 2 rewritten + new (actions 3, todo-item 3, button 2) ≈ 69 green
pnpm test:e2e                # 12 unchanged
pnpm test:mutation           # ≥ 70; the catch arms are now covered (previous survivors at actions:22/38 should die)
scripts/ci/check-ac-coverage.sh && scripts/ci/check-features-map.sh && scripts/ci/check-feat-commits.sh
```

## Work breakdown

| Step     | Role / skill                          | Produces                                                 | Commit                                                   |
| -------- | ------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------- |
| 1 Red    | `test-writer` → red gate (dev-lead)   | tests; `verify-red.sh B1.4` exit 0                       | `test(todos): B1.4 feedback when a mutation fails (red)` |
| 2 Green  | `code-writer` → green gate (dev-lead) | behavior, F8 map row, §10 ✅, metrics row, actions guide | `feat(todos): B1.4 feedback when a mutation fails`       |
| 3 Review | `reviewer` (diff), `/review-loop`     | `review.md`, gate cleared                                | —                                                        |

Plan approved by: · Rounds: 1
