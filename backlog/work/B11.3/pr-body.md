<!-- Title: feat(todos): B11.3 a failed delete's message describes "Delete todo" -->

## Item

B11.3 — A failed delete's message describes "Delete todo" (spec §53)

- spec: §53 — unchanged in this branch (written before the label under D-45, #355)
- test: `src/components/delete-todo-button-description.test.tsx::AC-53.1 … AC-53.6` — red before (`scripts/verify-red.sh`), green after
- acceptance: AC-53.1 … AC-53.6

Closes #364

## Plan

Copied from `backlog/work/B11.3/plan.md`.

Approach: A from `advice.md`: in `src/components/delete-todo-button.tsx` only, `const messageId = useId()`; the
failure `role="alert"` element gets `id={messageId}`, the `<button>` gets
`aria-describedby={error !== undefined ? messageId : undefined}` (the §53 Function contracts line, word for word; same
pattern as `clear-completed-button.tsx`, §49). B (id from the todo id) rejected: REQ-53.2 forbids it. No new export, so
no skeleton (as B10.2). No e2e criterion (§53 "How the criteria observe it"). No migration, dependency, env key or
CI-protected path (no `config-change-approved`). Spec box: the `agent-ready` label is the spec approval (D-27).

| File                                                     | Change                                                                       | Why (AC-n) |
| -------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------- |
| `src/components/delete-todo-button.tsx`                  | Change: `useId`; `id` on the alert; `aria-describedby` on the button; §53    | 53.1–53.6  |
| `src/components/delete-todo-button-description.test.tsx` | Add (red): AC-53.1–53.6; `vi.hoisted` action mocks; `window.confirm` stubbed | 53.1–53.6  |
| `spec/features-map.md`                                   | Add the F51 row (§53), ✅, in code-writer's `docs(map)` commit               | map        |

```ts
// src/components/delete-todo-button.tsx: signature and props unchanged (§53 Function contracts)
export function DeleteTodoButton({ todoId }: { readonly todoId: string }): ReactNode;
// + useId(); <… role="alert" id={messageId}>; <button aria-describedby={error !== undefined ? messageId : undefined}>
```

Verification: `scripts/verify-red.sh B11.3` exit 0 · `pnpm test` 381 → 387 · `pnpm test:e2e` 90 → 90 · mutation: CI
only, no src/lib or src/actions change · `pnpm build` ok.

Plan review: approved, round 1 · Plan approved by: reviewer (D-27, tier medium, issue #364) · Rounds: 1

## Map delta

pending

## Review

pending

## Evidence

- AC met: pending
- tier: medium
- plan deviations: none
- trace: n/a

🤖 Generated with [Claude Code](https://claude.com/claude-code)
