# B7.6 plan — The due-date editor has a "Clear due date" button (§40)

Approach: A from `advice.md`: in `src/components/todo-due-date.tsx` only, extract `onSave`'s transition into an internal
`save(value)` shared by `onSave` (`save(draft)`) and a new `onClear` (`save('')`), so REQ-40.3/40.4 reuse the one result
path; one `type="button"` "Clear due date" between "Today" and "Update due date", `disabled={pending}`, `onKeyDown` the
existing §28 handler (REQ-40.5/40.6). No new export, so no skeleton (as B7.3). No migration, dependency, env key or
CI-protected path (no `config-change-approved`). e2e file takes the section number (`e2e/37-…` is §37): `e2e/40-…`.

## Files

| File                                                 | Change                                                                                 | Why (AC-n) |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------- | ---------- |
| `src/components/todo-due-date.tsx`                   | Change: `save(value)`, `onClear()`, "Clear due date" button; header names §40          | 40.1–40.6  |
| `src/components/todo-due-date-clear.test.tsx`        | Add (red): AC-40.1–40.5, `setTodoDueDateAction` mocked via `vi.hoisted`                | 40.1–40.5  |
| `src/components/todo-due-date-today-button.test.tsx` | Change (red commit): AC-37.1 rewritten to 5 children, title from edited AC-37.1 (D-38) | 37.1       |
| `e2e/40-due-date-clear.spec.ts`                      | Add (red): AC-40.6, seed [C, B due 2026-11-05, A], edit B, clear, reload               | 40.6       |
| `spec/features-map.md`                               | Add the F38 row (§40), ✅, in code-writer's `docs(map)` commit                         | map        |

Paperwork (exempt): §40 index row stays ✗ until the closing PR; `docs/metrics.md` per-card row.

## Interfaces touched

```ts
// src/components/todo-due-date.tsx: signature and props unchanged (§40 Function contracts)
export function TodoDueDate({
  todoId,
  dueDate,
}: {
  readonly todoId: string;
  readonly dueDate: string | undefined;
}): ReactNode;
// internal only: function save(value: string): void   → startTransition → setTodoDueDateAction(todoId, value)
// internal only: function onClear(): void              → save('')
// No Server Action, Zod schema, Prisma model, query, env key, prop, export or route.
```

## Verification

Baseline: `pnpm test` 298 passed (48 files). Red (`test(todos): B7.6 … (red)`, no skeleton: red is the missing "Clear
due date" button and AC-37.1's 5th child, assertions): `scripts/verify-red.sh B7.6` exit 0; AC-40.1–40.5 and AC-37.1
each red; `pnpm test:e2e e2e/40-due-date-clear.spec.ts` → 1 fails on the "Clear due date" locator, recorded in the body.
Green: `pnpm lint && pnpm typecheck` clean · `pnpm test` 298 → 313 passed (49 files: 15 new `it`/`it.each` cases per `advice.md`'s layout, AC-37.1 replaced in place), every AC-15.n, AC-17.n,
AC-28.n, AC-31.n, AC-37.n in `todo-due-date*.test.tsx` green · `pnpm test:e2e` 70 → 71 (30 → 31 files), `e2e/15-due-date.spec.ts`,
`e2e/28-escape-due-date.spec.ts`, `e2e/37-due-date-today.spec.ts` green · mutation: CI only, no src/lib or src/actions
change (B1.100; ≥ 70 holds) · `pnpm build` ok · `scripts/ci/check-features-map.sh`, `scripts/ci/check-plan-scope.sh` OK.

## Work breakdown

| Step | Role / skill    | Produces                                         | Commit                         |
| ---- | --------------- | ------------------------------------------------ | ------------------------------ |
| 1    | none            | no skeleton (no new function or export)          | —                              |
| 2    | test-writer     | AC-40.1–40.5 `it`s, AC-37.1 rewrite, e2e AC-40.6 | `test(todos): B7.6 … (red)`    |
| 3    | code-writer     | `save`, `onClear`, the button                    | `feat(todos): B7.6 …`          |
| 4    | code-writer     | F38 row ✅                                       | `docs(map): F38 … [B7.6]`      |
| 5    | reviewer (diff) | `review.md` diff section                         | `docs(backlog): B7.6 review …` |

Costs the lead takes: the button shows with no stored date and then sends `''` (a no-op save, REQ-40.1). A mutant in
`save` is caught by both AC-15.n and AC-40.n tests. B7.3's AC-37.1 test changes (D-38), in the red commit only.

Plan review: approved, round 2 · Plan approved by: reviewer (D-27, tier medium, issue #310) · Rounds: 1
