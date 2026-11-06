# B5.6 plan — Escape closes the due-date editor without saving (§28)

Approach: A from `advice.md` — an inline `onKeyDown` on the existing "Due date" input in
`src/components/todo-due-date.tsx` only (D-30, §28 Function contracts): Escape with no modifier and no save in flight →
`preventDefault`, leave edit mode, reset the draft to `dueDate ?? ''`, clear the message. No new export, so no skeleton
step (as B5.2); no import of §27's `isSearchEscape` (advice question 1). No migration, dependency, env key or
CI-protected path (no `config-change-approved`). `src/app/page.tsx`, `src/actions/*`, `src/lib/*`,
`src/components/todo-item.tsx` untouched (D-30). The §15 Out of scope lift landed in 406927e (D-32).

## Files

| File                                    | Change                                                                                                                | Why (AC-28.n) |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------- |
| `src/components/todo-due-date.tsx`      | Add `onKeyDown` on the "Due date" input, `'Escape'` as a named module constant; header names §28 (green)              | 28.1–28.7     |
| `src/components/todo-due-date.test.tsx` | Add a §28 `describe`: AC-28.4–28.6 pinned green first (hold today), then AC-28.1–28.3 (red); keys only added to mocks | 28.1–28.6     |
| `e2e/28-escape-due-date.spec.ts`        | Add (red): AC-28.7, seeds C, B (done, due 2026-11-05), A; counts POSTs to `/` with `page.on('request')`               | 28.7          |
| `spec/features-map.md`                  | Add the F26 row (§28): code-writer's feat (✗), ✅ in `docs(map)`                                                      | map           |

Paperwork (exempt): §28 index row stays ✗ until the closing PR; `docs/metrics.md` per-card row.

## Interfaces touched

```ts
// src/components/todo-due-date.tsx: unchanged signature and markup; one private handler added
export function TodoDueDate({
  todoId,
  dueDate,
}: {
  readonly todoId: string;
  readonly dueDate: string | undefined;
}): ReactNode;
function onDueDateKeyDown(event: KeyboardEvent<HTMLInputElement>): void; // private, on the <input> only (REQ-28.7)
// No Server Action, Zod schema, Prisma model, query, env key, prop or export.
```

## Verification

Baseline: `pnpm test` 227 passed (39 files), e2e 51 tests. Pin (`test(todos): B5.6 pin AC-28.4–28.6 …`): AC-28.4
(pending: field kept, `defaultPrevented` false, closes on the save's `ok`, 1 call), AC-28.5 (Enter through `userEvent` submits
`('todo-9','2026-12-01')`; ArrowLeft, Ctrl/Meta/Alt/Shift+Escape one case each), AC-28.6 (body, "Update due date",
"New todo") hold on today's code, green, each asserting its own Then: 1 + 6 + 3 rows, 227 → 237 passed. Red (`test(todos): B5.6 … (red)`, `fireEvent.keyDown`
cancelable): `scripts/verify-red.sh B5.6` exit 0; AC-28.1–28.3 fail on assertions (field still present, `defaultPrevented`
false, alert kept), never an import; `pnpm test:e2e e2e/28-escape-due-date.spec.ts` → AC-28.7 fails on the "Due date"
field count, recorded in the body. Green: `pnpm lint && pnpm typecheck` clean · `pnpm test` 237 → 241 passed (red adds
AC-28.1 1, AC-28.2 2 rows (with and without a due date), AC-28.3 1; a different count is stated in the red commit), all AC-15.n, AC-17.n, AC-24.n green ·
`pnpm test:e2e` 51 → 52 passed, `e2e/15-due-date.spec.ts`, `e2e/17-overdue.spec.ts`, `e2e/24-escape-edit-title.spec.ts`
green · `pnpm test:mutation` ≥ 70 (scope `src/lib` + `src/actions`, unchanged by this card; the component's guards are
killed by AC-28.4/28.5 per advice "Mutation hot spots", read by the reviewer) · `pnpm build` ok ·
`scripts/ci/check-plan-scope.sh` OK.

## Work breakdown

| Step | Role / skill    | Produces                                             | Commit                            |
| ---- | --------------- | ---------------------------------------------------- | --------------------------------- |
| 1    | test-writer     | AC-28.4–28.6 in `todo-due-date.test.tsx`, green      | `test(todos): B5.6 pin AC-28.4 …` |
| 2    | test-writer     | AC-28.1–28.3 + `e2e/28-escape-due-date.spec.ts`, red | `test(todos): B5.6 … (red)`       |
| 3    | code-writer     | the input's `onKeyDown`, F26 row ✗                   | `feat(todos): B5.6 …`             |
| 4    | dev-lead        | F26 ✅                                               | `docs(map): F26 … [B5.6]`         |
| 5    | reviewer (diff) | `review.md` diff section                             | `docs(backlog): B5.6 review …`    |

Plan review: approved, round 2 (round 1: 1 reason, unit counts stated, applied be6294a) · Plan approved by: reviewer (D-27, tier medium, issue #225) · Rounds: 1
