# B11.3 plan — A failed delete's message describes "Delete todo" (§53)

Approach: A from `advice.md`: in `src/components/delete-todo-button.tsx` only, `const messageId = useId()`; the
failure `role="alert"` element gets `id={messageId}`, the `<button>` gets
`aria-describedby={error !== undefined ? messageId : undefined}` (the §53 Function contracts line, word for word; same
pattern as `clear-completed-button.tsx`, §49). B (id from the todo id) rejected: REQ-53.2 forbids it. No new export, so
no skeleton (as B10.2). No e2e criterion (§53 "How the criteria observe it"). No migration, dependency, env key or
CI-protected path (no `config-change-approved`). Spec box: the `agent-ready` label is the spec approval (D-27).

## Files

| File                                                     | Change                                                                       | Why (AC-n) |
| -------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------- |
| `src/components/delete-todo-button.tsx`                  | Change: `useId`; `id` on the alert; `aria-describedby` on the button; §53    | 53.1–53.6  |
| `src/components/delete-todo-button-description.test.tsx` | Add (red): AC-53.1–53.6; `vi.hoisted` action mocks; `window.confirm` stubbed | 53.1–53.6  |
| `spec/features-map.md`                                   | Add the F51 row (§53), ✅, in code-writer's `docs(map)` commit               | map        |

Paperwork (exempt): §53 index row stays ✗ until the closing PR; `docs/metrics.md` per-card row.

## Interfaces touched

```ts
// src/components/delete-todo-button.tsx: signature and props unchanged (§53 Function contracts)
export function DeleteTodoButton({ todoId }: { readonly todoId: string }): ReactNode;
// + useId(); <… role="alert" id={messageId}>; <button aria-describedby={error !== undefined ? messageId : undefined}>
// No Server Action, Zod schema, Prisma model, query, env key, prop, export or route; todo-item.tsx untouched.
```

## Verification

Baseline: `pnpm exec vitest list` 381 tests; `pnpm exec playwright test --list` 90 tests in 42 files. Red
(`test(todos): B11.3 … (red)`, no skeleton, no pin): every criterion asserts a non-empty alert `id`, an
`aria-describedby` equal to it, or the description being the message (today `title` supplies "Delete todo"), none of
which exists, so all 6 fail on assertions; `scripts/verify-red.sh B11.3` exit 0. Green: `pnpm lint && pnpm typecheck`
clean · `pnpm test` 381 → 387 (6 new `it`s, AC-53.1–53.6), with `delete-todo-button.test.tsx` (AC-19.5, 19.6, 35.2)
and `todo-item.test.tsx` (AC-35.3, 10.2) green · `pnpm test:e2e` 90 → 90, with `e2e/19-delete.spec.ts` (AC-35.5)
green · mutation: CI only, no `src/lib` or `src/actions` change (B1.100) · `pnpm build` ok ·
`scripts/ci/check-features-map.sh` OK.

## Work breakdown

| Step | Role / skill    | Produces                          | Commit                          |
| ---- | --------------- | --------------------------------- | ------------------------------- |
| 1    | none            | no skeleton (no new export)       | —                               |
| 2    | test-writer     | AC-53.1–53.6                      | `test(todos): B11.3 … (red)`    |
| 3    | code-writer     | `useId`, `id`, `aria-describedby` | `feat(todos): B11.3 …`          |
| 4    | code-writer     | F51 row ✅                        | `docs(map): F51 … [B11.3]`      |
| 5    | reviewer (diff) | `review.md` diff section          | `docs(backlog): B11.3 review …` |

Costs the lead takes: the alert's `id` is a React `useId` value (`:r0:`-style), so tests compare it to the alert's
`id` rather than a literal; the idle description is not asserted (`title` may supply one), only the missing attribute.

Plan review: pending · Plan approved by: · Rounds: 1
