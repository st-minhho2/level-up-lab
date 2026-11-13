# B6.1 plan — Escape clears the new-todo title (§29)

Approach: A from `advice.md`. An `onKeyDown` on the "New todo" input only: `pending` or `!isSearchEscape(event.nativeEvent)`
→ return; else `preventDefault()`, `box.current.value = ''`, `setDraft('')`. This matches §29's Function contracts
literally and D-33 (one `src/` file). The input stays uncontrolled, so the server-rendered markup and the reset design
of §10 and §18 stay as they are. It gets the native event, as `todo-search-form.tsx` does, so a legacy `Esc` does
nothing (AC-29.3). No skeleton commit: the card adds no export, so the red tests fail on assertions, not imports (advice).
No migration, dependency, env key or CI-protected path, so no `config-change-approved` label.

## Files

| File                                | Change                                                                                         | Why (AC-29.n) |
| ----------------------------------- | ---------------------------------------------------------------------------------------------- | ------------- |
| `src/components/todo-form.tsx`      | Add the input's `onKeyDown`, import `isSearchEscape`; header and draft-writer comment name §29 | 29.1–29.7     |
| `src/components/todo-form.test.tsx` | Add (red): `describe` §29, AC-29.1–AC-29.6; native `fireEvent.keyDown`, existing mock keys     | 29.1–29.6     |
| `e2e/29-escape-new-todo.spec.ts`    | Add (red): AC-29.7                                                                             | 29.7          |
| `spec/features-map.md`              | Add the F27 row (§29) ✅, code-writer's `docs(map)` after `feat` (B1.85)                       | map           |

Paperwork (exempt): the §29 index row stays ✗ until the closing PR; `docs/metrics.md` per-card row.

## Interfaces touched

```ts
// src/components/todo-form.tsx (§5, §10, §18, §29): TodoForm(): ReactNode, signature, props and markup unchanged
import { isSearchEscape } from '@/lib/escape-search'; // §27, unchanged
onKeyDown={(event: ReactKeyboardEvent<HTMLInputElement>): void => { /* pending guard, native-event Escape, clear */ }}
// No Server Action, Zod schema, Prisma model, query, env key, src/lib file or new export.
```

## Verification

Red (`test(todos): B6.1 … (red)`): `scripts/verify-red.sh B6.1` exit 0. AC-29.1, 29.2, 29.6 and 29.7 fail on assertions
(the box still holds the text, `defaultPrevented` false). AC-29.3–29.5 pass today because they guard behavior that is
already there, and the commit body says so. Green: `pnpm lint && pnpm typecheck` clean · `pnpm test` all pass, including
the 6 new AC-29.n tests, and the AC-5.2, AC-10.5, AC-18.3 and AC-18.6 tests stay as they are · `pnpm test:e2e` all pass:
`e2e/29-escape-new-todo.spec.ts` green, and `e2e/18-title-counter.spec.ts` and `e2e/27-escape-search.spec.ts` stay green.
`pnpm test:mutation` stays ≥ 70: components are outside Stryker, and AC-29.1/29.3/29.5 kill the guard and
`preventDefault` mutants by assertion. `pnpm build` ok · `scripts/ci/check-plan-scope.sh` OK.

## Work breakdown

| Step | Role / skill    | Produces                                                | Commit                                  |
| ---- | --------------- | ------------------------------------------------------- | --------------------------------------- |
| 1    | test-writer     | §29 tests in `todo-form.test.tsx` and the e2e file, red | `test(todos): B6.1 … (red)`             |
| 2    | code-writer     | `onKeyDown` in `todo-form.tsx`                          | `feat(todos): B6.1 …`                   |
| 3    | code-writer     | F27 row ✅                                              | `docs(map): F27 Escape clears … [B6.1]` |
| 4    | reviewer (diff) | `review.md` diff section                                | `docs(backlog): B6.1 review …`          |

Plan review: pending · Plan approved by: · Rounds: 1
