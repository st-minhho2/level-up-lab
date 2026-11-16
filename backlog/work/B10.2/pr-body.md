<!-- Title: feat(todos): B10.2 a failed clear's message describes "Clear completed" -->

## Item

B10.2 — A failed clear's message describes "Clear completed" (spec §49)

- spec: §49 — unchanged in this branch (written before the label under D-45, #355)
- test: `src/components/clear-completed-button-description.test.tsx::AC-49.1 … AC-49.6` — red before (`scripts/verify-red.sh`), green after
- acceptance: AC-49.1 … AC-49.6

Closes #357

## Plan

Copied from `backlog/work/B10.2/plan.md`.

Approach: A from `advice.md`: in `src/components/clear-completed-button.tsx` only, `const messageId = useId()`; the
failure `<p role="alert">` gets `id={messageId}`, the `<button>` gets
`aria-describedby={error !== undefined ? messageId : undefined}` (the §49 Function contracts line, word for word;
same pattern as `todo-item.tsx`). B (fixed id) rejected: two instances would share it (REQ-49.5, AC-49.6). No new
export, so no skeleton (as B9.4). No e2e criterion (§49 "How the criteria observe it"). No migration, dependency, env
key or CI-protected path (no `config-change-approved`). Spec box: the `agent-ready` label is the spec approval (D-27).

| File                                                         | Change                                                                     | Why (AC-n) |
| ------------------------------------------------------------ | -------------------------------------------------------------------------- | ---------- |
| `src/components/clear-completed-button.tsx`                  | Change: `useId`; `id` on the alert; `aria-describedby` on the button; §49  | 49.1–49.6  |
| `src/components/clear-completed-button-description.test.tsx` | Add: pin AC-49.2, 49.5; then (red) AC-49.1, 49.3, 49.4, 49.6; `vi.hoisted` | 49.1–49.6  |
| `spec/features-map.md`                                       | Add the F47 row (§49), ✅, in code-writer's `docs(map)` commit             | map        |

```ts
// src/components/clear-completed-button.tsx: signature and props unchanged (§49 Function contracts)
export function ClearCompletedButton({
  disabled,
  completedCount,
}: {
  readonly disabled: boolean;
  readonly completedCount?: number;
}): ReactNode; // + useId(); <p role="alert" id={messageId}>; <button aria-describedby={error !== undefined ? messageId : undefined}>
```

Verification: pin commit (AC-49.2, 49.5 green at base) · `scripts/verify-red.sh B10.2` exit 0 · `pnpm test` 360 → 366
· `pnpm test:e2e` 88 → 88 · mutation: CI only, no src/lib or src/actions change · `pnpm build` ok.

Plan review: approved, round 2 · Plan approved by: reviewer (D-27, tier medium, issue #357) · Rounds: 1

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
