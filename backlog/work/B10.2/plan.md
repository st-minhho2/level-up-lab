# B10.2 plan — A failed clear's message describes "Clear completed" (§49)

Approach: A from `advice.md`: in `src/components/clear-completed-button.tsx` only, `const messageId = useId()`; the
failure `<p role="alert">` gets `id={messageId}`, the `<button>` gets
`aria-describedby={error !== undefined ? messageId : undefined}` (the §49 Function contracts line, word for word;
same pattern as `todo-item.tsx`). B (fixed id) rejected: two instances would share it (REQ-49.5, AC-49.6). No new
export, so no skeleton (as B9.4). No e2e criterion (§49 "How the criteria observe it"). No migration, dependency, env
key or CI-protected path (no `config-change-approved`). Spec box: the `agent-ready` label is the spec approval (D-27).

## Files

| File                                                         | Change                                                                     | Why (AC-n) |
| ------------------------------------------------------------ | -------------------------------------------------------------------------- | ---------- |
| `src/components/clear-completed-button.tsx`                  | Change: `useId`; `id` on the alert; `aria-describedby` on the button; §49  | 49.1–49.6  |
| `src/components/clear-completed-button-description.test.tsx` | Add: pin AC-49.2, 49.5; then (red) AC-49.1, 49.3, 49.4, 49.6; `vi.hoisted` | 49.1–49.6  |
| `spec/features-map.md`                                       | Add the F47 row (§49), ✅, in code-writer's `docs(map)` commit             | map        |

Paperwork (exempt): §49 index row stays ✗ until the closing PR; `docs/metrics.md` per-card row.

## Interfaces touched

```ts
// src/components/clear-completed-button.tsx: signature and props unchanged (§49 Function contracts)
export function ClearCompletedButton({
  disabled,
  completedCount,
}: {
  readonly disabled: boolean;
  readonly completedCount?: number;
}): ReactNode; // + useId(); <p role="alert" id={messageId}>; <button aria-describedby={error !== undefined ? messageId : undefined}>
// No Server Action, Zod schema, Prisma model, query, env key, prop, export or route; page.tsx untouched.
```

## Verification

Baseline: `pnpm exec vitest list` 360 tests; `pnpm exec playwright test --list` 88 tests in 40 files. Pin
(`test(todos): B10.2 pin AC-49.2, AC-49.5 …`, no `(red)` marker, as B9.4's AC-47.3): AC-49.2 and AC-49.5 assert only
what their Then states, all of which holds today (no `aria-describedby` exists yet, a success shows no alert), so both
are green at the base and guard the removal side of REQ-49.2/49.3 once the attribute exists. Red
(`test(todos): B10.2 … (red)`, no skeleton: no `aria-describedby` and no `id` exist, so AC-49.1, 49.3, 49.4, 49.6 fail
on their description / `aria-describedby` assertions): `scripts/verify-red.sh B10.2` exit 0, judging the red commit
only. Green: `pnpm lint && pnpm
typecheck` clean · `pnpm test` 360 → 366 (6 new `it`s, AC-49.1–49.6), with `clear-completed-button.test.tsx`
(AC-9.2, 9.3, 10.3) and `clear-completed-button-count.test.tsx` (AC-32.2, 32.4) green · `pnpm test:e2e` 88 → 88, with
`e2e/09-clear-completed.spec.ts` and `e2e/32-clear-completed-count.spec.ts` green · mutation: CI only, no `src/lib`
or `src/actions` change (B1.100) · `pnpm build` ok · `scripts/ci/check-features-map.sh` OK.

## Work breakdown

| Step | Role / skill    | Produces                          | Commit                          |
| ---- | --------------- | --------------------------------- | ------------------------------- |
| 1    | none            | no skeleton (no new export)       | —                               |
| 2a   | test-writer     | AC-49.2, 49.5 (green at base)     | `test(todos): B10.2 pin …`      |
| 2b   | test-writer     | AC-49.1, 49.3, 49.4, 49.6         | `test(todos): B10.2 … (red)`    |
| 3    | code-writer     | `useId`, `id`, `aria-describedby` | `feat(todos): B10.2 …`          |
| 4    | code-writer     | F47 row ✅                        | `docs(map): F47 … [B10.2]`      |
| 5    | reviewer (diff) | `review.md` diff section          | `docs(backlog): B10.2 review …` |

Costs the lead takes: the alert's `id` is a React `useId` value (`:r0:`-style), so tests compare it to the alert's
`id` rather than a literal; jsdom keeps the description on a disabled button (AC-49.3), as browsers do.

Plan review: round 1 changes requested (2), revised · Plan approved by: · Rounds: 1
