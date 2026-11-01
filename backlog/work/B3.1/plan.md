# B3.1 plan — Mark overdue todos (§17)

Approach: A from `advice.md` — §17's contract one to one; "completed" read from the row's checkbox in the DOM, so
`src/components/todo-item.tsx` stays B3.3's (D-21). One phase, one lead approval, no `src/app/page.tsx`. No
dependency, no env key, no migration, no CI-protected path (no `config-change-approved`). Approving ticks §17's
`Lead approves spec` box. **Ruling asked in the same reply:** D-22 (`decision-request.md`): §15's Out of scope line 86
excludes "an overdue … highlight or any comparison with today's date"; recommended option 1 = one `docs(spec): §15`
line rewritten to "a due-soon highlight", before the red commit.

## Files

| File                                            | Change                                                                                                                                                                 | Why (AC-17.n) |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| `src/lib/todo-overdue.ts`                       | Add (pure, no `server-only`): `OVERDUE_LABEL`, `todayOf`, `isOverdue`                                                                                                  | 17.1, 17.2    |
| `src/lib/todo-overdue.test.ts`                  | Add (red): AC-17.1 (local fields, `TZ` pinned non-UTC), AC-17.2 (8 rows + constant)                                                                                    | 17.1, 17.2    |
| `src/components/todo-due-date.tsx`              | Ref on the wrapper; `today`/`completed` state; one effect (no deps) reading the clock once and the row's checkbox; `Overdue` span after `Due <date>`, not in edit mode | 17.3–17.6     |
| `src/components/todo-due-date-overdue.test.tsx` | Add (red): AC-17.3 (a)–(d), AC-17.4, AC-17.5 (`renderToString` ×2 + `hydrateRoot`), AC-17.6; mocks `@/actions/todos` only, fakes `Date` only                           | 17.3–17.6     |
| `e2e/17-overdue.spec.ts`                        | Add (red): AC-17.7 rows E, D, C, B, A from the browser's local day; tick, untick, set today, reload                                                                    | 17.7          |
| `spec/features-map.md`                          | F15 row (§17): ✗ in the skeleton, ✅ in `docs(map)`                                                                                                                    | paperwork     |
| `spec/contracts/13-due-date.md`                 | Only under D-22 option 1: Out of scope line 86 phrase → "a due-soon highlight"                                                                                         | D-22          |

Not touched (D-21): `src/app/page.tsx`, `src/components/todo-form.tsx`, `src/components/todo-item.tsx`,
`src/lib/todos.ts`, `src/actions/todos.ts`, `src/lib/logger.ts`, `src/*/CLAUDE.md` (orchestrator after the batch),
`src/components/todo-due-date.test.tsx` (§15 tests stay as they are; they assert no whole-row text, so stay green
after 2026-11-05). Cost at the gate: the component relies on "first checkbox of the nearest `li`" (B3.3 must keep it;
AC-17.7 guards it, re-run after B3.3 merges). Skeleton: `OVERDUE_LABEL = 'Overdue'` real (no import-time throw),
`todayOf`/`isOverdue` throw `NotImplementedError`, `TodoDueDate` unchanged; a case the skeleton already satisfies
shares an `it` with an assertion it fails.

## Interfaces touched

```ts
// src/lib/todo-overdue.ts (§17) — pure; a client component imports it
export const OVERDUE_LABEL: 'Overdue';
export function todayOf(now: Date): string; // local YYYY-MM-DD: padStart(4) year, getMonth() + 1, getDate(); never UTC
export function isOverdue(dueDate: string | undefined, today: string, completed: boolean): boolean; // !completed && dueDate !== undefined && dueDate < today
// src/components/todo-due-date.tsx (§15, extended; props unchanged)
export function TodoDueDate({
  todoId,
  dueDate,
}: {
  readonly todoId: string;
  readonly dueDate: string | undefined;
}): ReactNode;
```

## Verification

Red: `scripts/verify-red.sh B3.1` exit 0, new unit/component tests fail on an assertion or `NotImplementedError`
(never an import); `pnpm test:e2e e2e/17-overdue.spec.ts` → 1 failed, in the red commit body. Green:
`pnpm lint && pnpm typecheck` clean · `pnpm test` 169 → ≈ 177 passed (exact count in the red commit) ·
`pnpm test:e2e` 32 → 33 passed · `pnpm test:mutation` ≥ 70 (`todo-overdue.ts` target 100; hot spots in `advice.md`) ·
`pnpm build` ok · `scripts/ci/check-plan-scope.sh` OK · `git log <red>..HEAD -- '*.test.*' e2e/` empty for `feat`.

## Work breakdown

| Step | Role / skill        | Produces                                   | Commit                                     |
| ---- | ------------------- | ------------------------------------------ | ------------------------------------------ |
| 0    | spec-analyst        | §15 line 86 (D-22 option 1 only); D-22 row | `docs(spec): §15 …`, `docs(backlog): D-22` |
| 1    | `new-feature-slice` | `todo-overdue.ts` stubs, F15 ✗             | `chore(todos): B3.1 skeleton`              |
| 2    | test-writer         | 2 unit/component files + `e2e/17`, all red | `test(todos): B3.1 … (red)`                |
| 3    | code-writer         | `todo-overdue.ts`, `todo-due-date.tsx`     | `feat(todos): B3.1 …`                      |
| 4    | dev-lead            | F15 ✅                                     | `docs(map): F15 … [B3.1]`                  |
| 5    | reviewer (diff)     | `review.md` diff section                   | `docs(backlog): B3.1 review …`             |

Plan review: pending · Plan approved by: · Rounds: 1
