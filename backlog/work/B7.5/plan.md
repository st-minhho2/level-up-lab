# B7.5 plan — The new-todo counter warns near the limit (§39)

Approach: A from `advice.md`: `TITLE_WARNING_THRESHOLD` and `isTitleNearLimit` in `src/lib/title-count.ts`; one
conditional `<p id="new-todo-warning">` in `src/components/todo-form.tsx` driven by the existing `draft`, between the
counter and the §5 error. It is the contract's Function contracts block line for line; one draft, no hidden element.
No migration, dependency, env key or CI-protected path (no `config-change-approved`).
Deviations from `advice.md`: the e2e file takes the section number (`e2e/37-…` is §37's): `e2e/39-title-counter-warning.spec.ts`;
the component tests go in their own file (B7.3's pattern), so `todo-form.test.tsx` and its AC-18.n/29.n stay untouched.

## Files

| File                                        | Change                                                                                     | Why (AC-39.n) |
| ------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------- |
| `src/lib/title-count.ts`                    | Change: `TITLE_WARNING_THRESHOLD = 180`, `isTitleNearLimit` (stub in skeleton, then real)  | 39.1          |
| `src/components/todo-form.tsx`              | Change: conditional warning `<p>` after the counter, before the §5 error; header names §39 | 39.2–39.7     |
| `src/lib/CLAUDE.md`                         | Change: `title-count.ts` row lists the two new exports and §39 (feat commit)               | docs          |
| `src/components/CLAUDE.md`                  | Change: `todo-form.tsx` line mentions the §39 warning (feat commit)                        | docs          |
| `src/lib/title-count.test.ts`               | Change (red): AC-39.1, all nine values, threshold < `TITLE_MAX_LENGTH`                     | 39.1          |
| `src/components/todo-form-warning.test.tsx` | Add (red): AC-39.2–39.6, `createTodoAction` mocked via `vi.hoisted`                        | 39.2–39.6     |
| `e2e/39-title-counter-warning.spec.ts`      | Add (red): AC-39.7                                                                         | 39.7          |
| `spec/features-map.md`                      | Add the F37 row (§39), ✅, in code-writer's `docs(map)` commit                             | map           |

Paperwork (exempt): §39 index row stays ✗ until the closing PR; `docs/metrics.md` per-card row.

## Interfaces touched

```ts
// src/lib/title-count.ts (pure, no server-only)
export const TITLE_WARNING_THRESHOLD = 180;
export function isTitleNearLimit(value: string): boolean; // titleCharacterCount(value) >= TITLE_WARNING_THRESHOLD
// src/components/todo-form.tsx: TodoForm(): ReactNode unchanged; aria-describedby unchanged.
// No Server Action, Zod schema, Prisma model, query, env key or route.
```

## Verification

Baseline `pnpm test` 298 passed (48 files). Red: `scripts/verify-red.sh B7.5` exit 0; AC-39.1 red on the stub's
`NotImplementedError`, AC-39.2–39.6 red on the missing `#new-todo-warning` (assertion); `pnpm test:e2e
e2e/39-title-counter-warning.spec.ts` → 1 red on the warning locator. Green: `pnpm lint && pnpm typecheck` clean ·
`pnpm test` 298 → 304 passed (49 files), AC-18.n, AC-29.n, AC-5.7 green · `pnpm test:e2e` +1, `e2e/18-title-counter`
and `e2e/29-escape-new-todo` green · mutation ≥ 70 (`src/lib/title-count.ts` changes) · `pnpm build` ok.

## Work breakdown

| Step | Role / skill      | Produces                                     | Commit                         |
| ---- | ----------------- | -------------------------------------------- | ------------------------------ |
| 1    | new-feature-slice | constant + stub `isTitleNearLimit`           | `chore(todos): B7.5 skeleton`  |
| 2    | test-writer       | 6 unit `it`s, 1 e2e                          | `test(todos): B7.5 … (red)`    |
| 3    | code-writer       | predicate, warning `<p>`, two CLAUDE.md rows | `feat(todos): B7.5 …`          |
| 4    | code-writer       | F37 row ✅                                   | `docs(map): F37 … [B7.5]`      |
| 5    | reviewer (diff)   | `review.md` diff section                     | `docs(backlog): B7.5 review …` |

Costs the lead takes: amber contrast is not measured [unverified]; a screen reader in browse mode reaches the warning
(not announced, per Out of scope).

Plan review: pending · Plan approved by: · Rounds: 1
