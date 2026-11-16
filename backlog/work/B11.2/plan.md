# B11.2 plan — A failed mark-all's message describes "Mark all complete" (§52)

Approach: A from `advice.md`: in `src/components/complete-all-button.tsx` only, inside `CompleteAllButtonShown` (after
§43's early return, so an unmount drops state and id together, REQ-52.5), `const messageId = useId()`; the failure
`<p role="alert">` gets `id={messageId}`, the `<button>` gets `aria-describedby={error !== undefined ? messageId : undefined}`
(the §52 Function contracts line; same pattern as B10.2's `clear-completed-button.tsx`). B (id from the outer component
as a prop) rejected: a new inner prop and an id that survives the unmount. No new export, so no skeleton (as B10.2). No
e2e criterion (§52 Out of scope). No migration, dependency, env key or CI-protected path (no `config-change-approved`).
Spec box: the `agent-ready` label is the spec approval (D-27).

## Files

| File                                                      | Change                                                                     | Why (AC-n) |
| --------------------------------------------------------- | -------------------------------------------------------------------------- | ---------- |
| `src/components/complete-all-button.tsx`                  | Change: `useId`; `id` on the alert; `aria-describedby` on the button; §52  | 52.1–52.6  |
| `src/components/complete-all-button-description.test.tsx` | Add: pin AC-52.2, 52.5, 52.6; then (red) AC-52.1, 52.3, 52.4; `vi.hoisted` | 52.1–52.6  |
| `spec/features-map.md`                                    | Add the F50 row (§52), ✅, in code-writer's `docs(map)` commit             | map        |

Paperwork (exempt): §52 index row stays ✗ until the closing PR; `docs/metrics.md` per-card row.

## Interfaces touched

```ts
// src/components/complete-all-button.tsx: signature and props unchanged (§52 Function contracts)
export function CompleteAllButton({
  disabled,
  count,
}: {
  readonly disabled: boolean;
  readonly count?: number;
}): ReactNode; // + useId() in CompleteAllButtonShown; <p role="alert" id={messageId}>; <button aria-describedby={error !== undefined ? messageId : undefined}>
// No Server Action, Zod schema, Prisma model, query, env key, prop, export or route; page.tsx untouched.
```

## Verification

Baseline: `pnpm exec vitest list` 381 tests; `pnpm exec playwright test --list` 90 tests in 42 files. Pin
(`test(todos): B11.2 pin AC-52.2, AC-52.5, AC-52.6 …`, no `(red)` marker, as B10.2): their Then holds today (no
`aria-describedby` and no `id` exist yet; §43 unmount already drops the alert; a failure without `form` shows no alert),
so they are green at the base and guard the absence side of REQ-52.2/52.5 once the attribute exists. Red
(`test(todos): B11.2 … (red)`, no skeleton: AC-52.1, 52.3, 52.4 fail on their `aria-describedby` / description
assertions): `scripts/verify-red.sh B11.2` exit 0, judging the red commit only. Green: `pnpm lint && pnpm typecheck`
clean · `pnpm test` 381 → 387 (6 new `it`s, AC-52.1–52.6), with `complete-all-button.test.tsx` (AC-14.4, 14.5),
`complete-all-button-count.test.tsx` (AC-36.2, 36.4) and `complete-all-button-hidden.test.tsx` (AC-43.2–43.4) green ·
`pnpm test:e2e` 90 → 90, with `e2e/14-complete-all.spec.ts` green · mutation: CI only, no `src/lib` or `src/actions`
change (B1.100) · `pnpm build` ok · `scripts/ci/check-features-map.sh` OK.

## Work breakdown

| Step | Role / skill    | Produces                          | Commit                          |
| ---- | --------------- | --------------------------------- | ------------------------------- |
| 1    | none            | no skeleton (no new export)       | —                               |
| 2a   | test-writer     | AC-52.2, 52.5, 52.6 (green, base) | `test(todos): B11.2 pin …`      |
| 2b   | test-writer     | AC-52.1, 52.3, 52.4               | `test(todos): B11.2 … (red)`    |
| 3    | code-writer     | `useId`, `id`, `aria-describedby` | `feat(todos): B11.2 …`          |
| 4    | code-writer     | F50 row ✅                        | `docs(map): F50 … [B11.2]`      |
| 5    | reviewer (diff) | `review.md` diff section          | `docs(backlog): B11.2 review …` |

Costs the lead takes: the alert's `id` is a React `useId` value, so tests compare it to the alert's `id` rather than a
literal; jsdom keeps the description on a disabled (pending) button (AC-52.4), as browsers do.

Plan review: pending · Plan approved by: · Rounds: 1
