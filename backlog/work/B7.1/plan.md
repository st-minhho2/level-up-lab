# B7.1 plan — Deleting a todo asks for confirmation first (§35)

Approach: A from `advice.md` — `DeleteTodoButton.onDelete` opens with
`if (!window.confirm(CONFIRM_MESSAGE)) return;` before `startTransition`, the message a module-level unexported
constant, exactly §35's Function contracts. Signature, props, markup, `TodoItem`, `src/actions`, `src/lib` unchanged.
No migration, dependency, env key or CI-protected path (no `config-change-approved`). §19/§20 edits landed under D-37
in c155c3a; the §35 approval box stays for the lead (D-7; D-27: the issue label is the spec approval, as §21–§34).

## Files

| File                                         | Change                                                                                                       | Why (AC-35.n)      |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------ |
| `src/components/delete-todo-button.tsx`      | Change: confirm guard + `CONFIRM_MESSAGE` constant; header and comment name §35 instead of "no confirmation" | 35.1–35.5          |
| `src/components/delete-todo-button.test.tsx` | Change (red): add AC-35.1, AC-35.2; AC-19.5 (a), AC-19.6 rewritten to the edited §19 (confirm stub `true`)   | 35.1, 35.2, 19.5–6 |
| `src/components/todo-item.test.tsx`          | Change (red): add AC-35.3 (title verbatim from §35); AC-19.5 (b) stubs confirm `true`                        | 35.3, 19.5         |
| `e2e/19-delete.spec.ts`                      | Change (red): add AC-35.4 (title verbatim from §35), AC-35.5; AC-19.7 accepts every dialog                   | 35.4, 35.5, 19.7   |
| `spec/features-map.md`                       | Add the F33 row (§35), ✅, in code-writer's `docs(map)` commit                                               | map                |

Paperwork (exempt): §35 index row stays ✗ until the closing PR; `docs/metrics.md` per-card row.

## Interfaces touched

```ts
// src/components/delete-todo-button.tsx ('use client'): signature unchanged (§19)
export function DeleteTodoButton({ todoId }: { readonly todoId: string }): ReactNode;
// const CONFIRM_MESSAGE = 'Delete this todo? This cannot be undone.'; // not exported
// onDelete: if (!window.confirm(CONFIRM_MESSAGE)) return; startTransition(...) as §19
// No Server Action, Zod schema, Prisma model, query, env key, prop, state, element, attribute or route.
```

## Verification

Baseline: `pnpm test` 280 passed (45 files). Red (`test(todos): B7.1 … (red)`, no skeleton: no new export, so red is an
assertion — confirm spy 0 calls, action called on a cancel): `scripts/verify-red.sh B7.1` exit 0; `git diff --stat`
touches only the three test files. `pnpm test:e2e e2e/19-delete.spec.ts` → AC-35.4, AC-35.5 fail on the missing dialog,
recorded in the commit body. Green: `pnpm lint && pnpm typecheck` clean · `pnpm test` 280 → 283 passed (45 files), every
AC-19.n and AC-20.n green · `pnpm test:e2e` +2, all green · `pnpm test:mutation` ≥ 70 (`src/lib`, `src/actions`
untouched; the component's negation, literal and order are killed by AC-35.1/35.2) · `pnpm build` ok ·
`scripts/ci/check-features-map.sh` and `scripts/ci/check-plan-scope.sh` OK.

## Work breakdown

| Step | Role / skill    | Produces                                    | Commit                         |
| ---- | --------------- | ------------------------------------------- | ------------------------------ |
| 1    | none            | no skeleton (no new function or export)     | —                              |
| 2    | test-writer     | 3 unit `it`s, 2 e2e tests, 4 rewrites (§19) | `test(todos): B7.1 … (red)`    |
| 3    | code-writer     | the confirm guard                           | `feat(todos): B7.1 …`          |
| 4    | code-writer     | F33 row ✅                                  | `docs(map): F33 … [B7.1]`      |
| 5    | reviewer (diff) | `review.md` diff section                    | `docs(backlog): B7.1 review …` |

Costs the lead takes: `window.confirm` blocks the main thread while open (§35 accepts it); a jsdom click without a stub
reads as a cancel, so every future test that clicks "Delete todo" must stub `window.confirm`.

Plan review: approved, round 1 · Plan approved by: · Rounds: 1
