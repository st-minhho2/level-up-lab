# B4.1 plan — Show the creation date of each todo (§20)

Approach: A from `advice.md` — an empty `<time dateTime data-created>` per row whose `::after` shows `Created
YYYY-MM-DD` (UTC) through `after:content-[attr(data-created)]`, so the row's text content stays its title and AC-5.1
(and the 6 other sections that read whole-row text) hold with no existing test changed. One phase, one lead approval
(D-22, D-24): `src/app/page.tsx` is not touched. Lead rules at the gate (soft, analysis Q1): A (recommended), B (date
as row text: needs the next D-n, `docs(spec)` §5, §6, §19, ≈ 9 test files rewritten first) or C (tooltip, declined).
No dependency, no env key, no migration, no CI-protected path (no `config-change-approved`).

## Files

| File                                        | Change                                                                                                  | Why (AC-20.n)    |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ---------------- |
| `src/lib/todo-created.ts`                   | Add `CREATED_PREFIX`, `createdDayOf` (UTC getters, no `Intl`), `createdLabel`; pure, no `server-only`   | 20.1, 20.2       |
| `src/lib/todo-created.test.ts`              | Add (red): AC-20.1 under `TZ` Kiritimati and Los Angeles, AC-20.2                                       | 20.1, 20.2       |
| `src/components/todo-item.tsx`              | One import + one empty `<time …>` after `<TodoDueDate>`, before the §10 alert, outside the edit ternary | 20.3–20.6        |
| `src/components/todo-item-created.test.tsx` | Add (red): AC-20.3, AC-20.4 (`renderToString` + `hydrateRoot`), AC-20.5; mocks the actions modules only | 20.3, 20.4, 20.5 |
| `e2e/20-created-date.spec.ts`               | Add (red): AC-20.6 C, B, A in a `Pacific/Kiritimati` browser, tick/rename/due date/reload, `::after`    | 20.6             |

Paperwork (exempt): `spec/features-map.md` F18 row ✗ in the skeleton, ✅ in `docs(map)`; §20 index row stays ✗ until
the closing PR; `docs/metrics.md` per-card row. Package guides (`src/*/CLAUDE.md`) left out per D-24 (orchestrator's
docs PR after the batch; drift listed in `advice.md`). `todo-item.test.tsx` is not touched (§20 test note).

Skeleton: `createdDayOf`, `createdLabel` throw `NotImplementedError`; `CREATED_PREFIX` exported as `'Created '`
(a constant, per §20); `todo-item.tsx` not changed in the skeleton (a throwing call would turn existing `TodoItem`
tests red for the wrong reason), so AC-20.3–20.5 fail on an assertion (no `time` element).

## Interfaces touched

```ts
// src/lib/todo-created.ts (§20)
export const CREATED_PREFIX: 'Created ';
export function createdDayOf(createdAt: Date): string;
export function createdLabel(createdAt: Date): string;
// src/components/todo-item.tsx (§7, props unchanged)
export function TodoItem({ todo }: { readonly todo: Todo }): ReactNode; // + <time dateTime data-created className="… after:content-[attr(data-created)]" />
```

## Verification

Red (`test(todos): B4.1 … (red)`): `scripts/verify-red.sh B4.1` exit 0, 5 new unit/component tests failing on
`NotImplementedError` (AC-20.1, AC-20.2) or an assertion (AC-20.3–20.5); `pnpm test:e2e e2e/20-created-date.spec.ts`
→ 1 failed, recorded in the commit body. Green: `pnpm lint && pnpm typecheck` clean · `pnpm test` 190 → 195 passed ·
`pnpm test:e2e` 35 → 36 green (AC-20.6 is the only kill of a dropped `className`) · `pnpm test:mutation` ≥ 70
(target ≥ 85; `todo-created.ts` 100) · `pnpm build` ok · `scripts/ci/check-plan-scope.sh` OK. Counts are the
test-writer's target; a different count is stated in the red commit.

## Work breakdown

| Step | Role / skill        | Produces                                   | Commit                         |
| ---- | ------------------- | ------------------------------------------ | ------------------------------ |
| 1    | `new-feature-slice` | `todo-created.ts` stubs, F18 ✗             | `chore(todos): B4.1 skeleton`  |
| 2    | test-writer         | 2 unit/component files + `e2e/20`, all red | `test(todos): B4.1 … (red)`    |
| 3    | code-writer         | lib functions, `TodoItem` `<time>`         | `feat(todos): B4.1 …`          |
| 4    | dev-lead            | F18 ✅                                     | `docs(map): F18 … [B4.1]`      |
| 5    | reviewer (diff)     | `review.md` diff section                   | `docs(backlog): B4.1 review …` |

Plan review: pending · Plan approved by: · Rounds: 1
