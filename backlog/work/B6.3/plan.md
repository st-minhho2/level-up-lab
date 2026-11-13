# B6.3 plan — An open todo due today says so (§31)

Approach: A from `advice.md` — a new pure `src/lib/todo-due-today.ts` (`DUE_TODAY_LABEL`, `isDueToday`, as §31's
Function contracts name it) and one `<span>` after the `Overdue` slot in `src/components/todo-due-date.tsx`, driven by
§17's existing `today` / `completed` state (no new state, effect or prop). D-33 fixes the component; it does not forbid
the lib module §31 names (advice question 1). No migration, dependency, env key or CI-protected path (no
`config-change-approved`); package guides stay out (D-33). §17's Out of scope lift landed in f63bb76, §31 in 5d56abc.

## Files

| File                                          | Change                                                                                                                          | Why (AC-31.n)       |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| `src/lib/todo-due-today.ts`                   | Add: skeleton (`DUE_TODAY_LABEL`, `isDueToday` throwing `NotImplementedError`), then the rule `!completed && dueDate === today` | 31.1                |
| `src/components/todo-due-date.tsx`            | Change: span with `DUE_TODAY_LABEL` after the Overdue slot when `today !== undefined && isDueToday(…)`; header names §31        | 31.2–31.6           |
| `src/lib/todo-due-today.test.ts`              | Add (red): AC-31.1, six cases + the label                                                                                       | 31.1                |
| `src/components/todo-due-date-today.test.tsx` | Add (red): AC-31.2–31.5, fake `Date` only, `@/actions/todos` mocked via `vi.hoisted`                                            | 31.2–31.5           |
| `e2e/31-due-today.spec.ts`                    | Add (red): AC-31.6, browser's own day                                                                                           | 31.6                |
| `e2e/17-overdue.spec.ts`                      | Change (red commit only): `RowText`/`readsAs`/`describeRow` gain `Due today` for open rows due today; every old check kept      | 31.1 (AC-17.7 kept) |
| `spec/features-map.md`                        | Add the F29 row (§31), ✅, in code-writer's `docs(map)` commit                                                                  | map                 |

Paperwork (exempt): §31 index row stays ✗ until the closing PR; `docs/metrics.md` per-card row.

## Interfaces touched

```ts
// src/lib/todo-due-today.ts (new, pure, no server-only)
export const DUE_TODAY_LABEL = 'Due today';
export function isDueToday(dueDate: string | undefined, today: string, completed: boolean): boolean;
// src/components/todo-due-date.tsx: signature, props and server markup unchanged
export function TodoDueDate({
  todoId,
  dueDate,
}: {
  readonly todoId: string;
  readonly dueDate: string | undefined;
}): ReactNode;
// No Server Action, Zod schema, Prisma model, query, env key, prop or route.
```

## Verification

Baseline: `pnpm test` 241 passed (39 files), e2e 52. Red (`test(todos): B6.3 … (red)`): `scripts/verify-red.sh B6.3`
exit 0. Exactly 5 new `it`s, one per AC, each holding a case that is red on today's code, so none passes at the red
commit (`verify-red.sh:16`): `todo-due-today.test.ts` 1 (AC-31.1: the six cases and the label in one `it`, red on
the skeleton's `NotImplementedError`, never on an import, whatever the card's older Test-line wording);
`todo-due-date-today.test.tsx` 4 (AC-31.2 cases a–d in one `it`, red on (a); AC-31.3 one `it`, red after the
unchecked render; AC-31.4 one `it`, red after the effects; AC-31.5 one `it`, red after the re-render with
`2026-11-01`); no standalone label or absence-only `it`. `pnpm test:e2e e2e/31-due-today.spec.ts e2e/17-overdue.spec.ts`
→ AC-31.6 and AC-17.7 fail on row text, recorded in the body. Green: `pnpm lint && pnpm typecheck` clean ·
`pnpm test` 241 → 246 passed (39 → 41 files), all AC-15.n, AC-17.n, AC-28.n green · `pnpm test:e2e` 52 → 53
passed, `e2e/15-due-date.spec.ts`, `e2e/17-overdue.spec.ts`, `e2e/23-overdue-count.spec.ts` green ·
`pnpm test:mutation` ≥ 70 with `src/lib/todo-due-today.ts` in scope (AC-31.1 kills `!completed`, `!== undefined`,
`===` mutants) · `pnpm build` ok · `scripts/ci/check-features-map.sh` and `scripts/ci/check-plan-scope.sh` OK.

## Work breakdown

| Step | Role / skill                      | Produces                                      | Commit                         |
| ---- | --------------------------------- | --------------------------------------------- | ------------------------------ |
| 1    | code-writer (`new-feature-slice`) | `src/lib/todo-due-today.ts` stub              | `chore(todos): B6.3 skeleton`  |
| 2    | test-writer                       | 2 test files, `e2e/31-…`, `e2e/17-…` extended | `test(todos): B6.3 … (red)`    |
| 3    | code-writer                       | the rule and the span                         | `feat(todos): B6.3 …`          |
| 4    | code-writer                       | F29 row ✅                                    | `docs(map): F29 … [B6.3]`      |
| 5    | reviewer (diff)                   | `review.md` diff section                      | `docs(backlog): B6.3 review …` |

Costs the lead takes: an F15 e2e (`e2e/17-overdue.spec.ts`) changes in the red commit (extended, never loosened);
`src/components/CLAUDE.md` still names §15 and §17 as the only idle additions (D-33 keeps guides out of card plans).

Plan review: pending (round 1: 1 reason, exact test count and split, applied) · Plan approved by: · Rounds: 1
