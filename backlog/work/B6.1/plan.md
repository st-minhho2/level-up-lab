# B6.1 plan — Escape clears the new-todo title (§29)

Approach: A from `advice.md`. An `onKeyDown` on the "New todo" input only: `pending` or `!isSearchEscape(event.nativeEvent)`
→ return; else `preventDefault()`, `box.current.value = ''`, `setDraft('')`. This matches §29's Function contracts
literally and D-33 (one `src/` file). The input stays uncontrolled, so the server-rendered markup and the reset design
of §10 and §18 stay as they are. It gets the native event, as `todo-search-form.tsx` does, so a legacy `Esc` does
nothing (AC-29.3). No skeleton commit: the card adds no export, so the red tests fail on assertions, not imports (advice).
No migration, dependency, env key or CI-protected path, so no `config-change-approved` label.

## Files

| File                                | Change                                                                                                     | Why (AC-29.n) |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------- |
| `src/components/todo-form.tsx`      | Add the input's `onKeyDown`, import `isSearchEscape`; header and draft-writer comment name §29             | 29.1–29.7     |
| `src/components/todo-form.test.tsx` | Add a §29 `describe`: AC-29.3–29.5 pinned green first, then AC-29.1, 29.2, 29.6 (red); mock keys unchanged | 29.1–29.6     |
| `e2e/29-escape-new-todo.spec.ts`    | Add (red): AC-29.7                                                                                         | 29.7          |
| `spec/features-map.md`              | Add the F27 row (§29) ✅, code-writer's `docs(map)` after `feat` (B1.85)                                   | map           |

Paperwork (exempt): the §29 index row stays ✗ until the closing PR; `docs/metrics.md` per-card row.

## Interfaces touched

```ts
// src/components/todo-form.tsx (§5, §10, §18, §29): TodoForm(): ReactNode, signature, props and markup unchanged
import { isSearchEscape } from '@/lib/escape-search'; // §27, unchanged
onKeyDown={(event: ReactKeyboardEvent<HTMLInputElement>): void => { /* pending guard, native-event Escape, clear */ }}
// No Server Action, Zod schema, Prisma model, query, env key, src/lib file or new export.
```

## Verification

Baseline: `pnpm test` 241 passed (39 files), e2e 52 tests. Keys: Escape variants go through `fireEvent.keyDown`
(cancelable, `defaultPrevented` from its return value, so `Esc` stays the legacy value). Enter and typing go through
`userEvent`, because jsdom does not submit a form on an untrusted keydown. Pin (`test(todos): B6.1 pin AC-29.3–29.5 …`):
these hold on today's code and each asserts its own Then. AC-29.3 is 8 key rows plus 1 Enter test (`title` `Buy milk`,
1 call), AC-29.4 is 4 target rows (body, "Add", "Other", "Search todos") and AC-29.5 is 1 pending test, so 14 rows,
241 → 255 passed. Red (`test(todos): B6.1 … (red)`): `scripts/verify-red.sh B6.1` exit 0. AC-29.1 (1), AC-29.2
(3 rows: empty, `x` ×201 set by script, `  hi  `) and AC-29.6 (1) fail on assertions (the box still holds the text,
`defaultPrevented` false, counter not `0 / 200`), never on an import. `pnpm test:e2e e2e/29-escape-new-todo.spec.ts`
→ AC-29.7 fails on the box value after Escape (`Buy eggs`, not empty), recorded in the body. Green: `pnpm lint &&
pnpm typecheck` clean · `pnpm test` 255 → 260 passed; a different count is stated in the red commit. The AC-5.2, AC-10.5,
AC-18.3 and AC-18.6 tests stay green · `pnpm test:e2e` 52 → 53 passed, and `e2e/18-title-counter.spec.ts` and
`e2e/27-escape-search.spec.ts` stay green.
`pnpm test:mutation` stays ≥ 70: components are outside Stryker, and AC-29.1/29.3/29.5 kill the guard and
`preventDefault` mutants by assertion. `pnpm build` ok · `scripts/ci/check-plan-scope.sh` OK.

## Work breakdown

| Step | Role / skill    | Produces                                                    | Commit                                  |
| ---- | --------------- | ----------------------------------------------------------- | --------------------------------------- |
| 1    | test-writer     | AC-29.3–29.5 in `todo-form.test.tsx`, green                 | `test(todos): B6.1 pin AC-29.3 …`       |
| 2    | test-writer     | AC-29.1, 29.2, 29.6 + `e2e/29-escape-new-todo.spec.ts`, red | `test(todos): B6.1 … (red)`             |
| 3    | code-writer     | `onKeyDown` in `todo-form.tsx`                              | `feat(todos): B6.1 …`                   |
| 4    | code-writer     | F27 row ✅                                                  | `docs(map): F27 Escape clears … [B6.1]` |
| 5    | reviewer (diff) | `review.md` diff section                                    | `docs(backlog): B6.1 review …`          |

Plan review: approved, round 2 (round 1: 3 reasons, pin commit, counts, `userEvent` Enter, applied 91013c5) · Plan approved by: · Rounds: 1
