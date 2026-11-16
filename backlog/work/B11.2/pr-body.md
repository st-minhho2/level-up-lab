<!-- Title: feat(todos): B11.2 a failed mark-all's message describes "Mark all complete" -->

## Item

B11.2 — A failed mark-all's message describes "Mark all complete" (spec §52)

- spec: §52 — unchanged in this branch (written before the label under D-45, #355)
- test: `src/components/complete-all-button-description.test.tsx::AC-52.1 … AC-52.6` — red before (`scripts/verify-red.sh`), green after
- acceptance: AC-52.1 … AC-52.6

Closes #363

## Plan

Copied from `backlog/work/B11.2/plan.md`.

Approach: A from `advice.md`: in `src/components/complete-all-button.tsx` only, inside `CompleteAllButtonShown` (after
§43's early return, so an unmount drops state and id together, REQ-52.5), `const messageId = useId()`; the failure
`<p role="alert">` gets `id={messageId}`, the `<button>` gets `aria-describedby={error !== undefined ? messageId : undefined}`
(the §52 Function contracts line; same pattern as B10.2's `clear-completed-button.tsx`). B (id from the outer component
as a prop) rejected: a new inner prop and an id that survives the unmount. No new export, so no skeleton (as B10.2). No
e2e criterion (§52 Out of scope). No migration, dependency, env key or CI-protected path (no `config-change-approved`).
Spec box: the `agent-ready` label is the spec approval (D-27).

### Files

| File                                                      | Change                                                                     | Why (AC-n) |
| --------------------------------------------------------- | -------------------------------------------------------------------------- | ---------- |
| `src/components/complete-all-button.tsx`                  | Change: `useId`; `id` on the alert; `aria-describedby` on the button; §52  | 52.1–52.6  |
| `src/components/complete-all-button-description.test.tsx` | Add: pin AC-52.2, 52.5, 52.6; then (red) AC-52.1, 52.3, 52.4; `vi.hoisted` | 52.1–52.6  |
| `spec/features-map.md`                                    | Add the F50 row (§52), ✅, in code-writer's `docs(map)` commit             | map        |

Paperwork (exempt): §52 index row stays ✗ until the closing PR; `docs/metrics.md` per-card row.

### Interfaces touched

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

### Verification

Baseline: `pnpm exec vitest list` 381 tests; `pnpm exec playwright test --list` 90 tests in 42 files. Pin
(`test(todos): B11.2 pin AC-52.2, AC-52.5, AC-52.6 …`, no `(red)` marker): green at the base. Red
(`test(todos): B11.2 … (red)`): AC-52.1, 52.3, 52.4; `scripts/verify-red.sh B11.2` exit 0. Green: `pnpm lint && pnpm
typecheck` clean · `pnpm test` 381 → 387 · `pnpm test:e2e` 90 → 90 · mutation: CI only (no `src/lib` or `src/actions`
change) · `pnpm build` ok · `scripts/ci/check-features-map.sh` OK.

### Work breakdown

| Step | Role / skill    | Produces                          | Commit                          |
| ---- | --------------- | --------------------------------- | ------------------------------- |
| 1    | none            | no skeleton (no new export)       | —                               |
| 2a   | test-writer     | AC-52.2, 52.5, 52.6 (green, base) | `test(todos): B11.2 pin …`      |
| 2b   | test-writer     | AC-52.1, 52.3, 52.4               | `test(todos): B11.2 … (red)`    |
| 3    | code-writer     | `useId`, `id`, `aria-describedby` | `feat(todos): B11.2 …`          |
| 4    | code-writer     | F50 row ✅                        | `docs(map): F50 … [B11.2]`      |
| 5    | reviewer (diff) | `review.md` diff section          | `docs(backlog): B11.2 review …` |

Plan review: approved, round 1 · Plan approved by: reviewer (D-27, tier medium, issue #363) · Rounds: 1

## Map delta

pending

## Review

pending

## Evidence

- AC met: pending
- tier: medium
- plan deviations: none
- trace: n/a

## Checklist

- [ ] **Diff matches the approved plan**: no file outside the Files table, no interface outside the list.
- [ ] Red commit precedes the feat commit; no `feat(` commit touches `*.test.*` or `e2e/**`.
- [ ] Every `AC-§.n` of the section is a test title; mutation on `src/lib` + `src/actions` ≥ 70 %.
- [ ] No new `eslint-disable` / `@ts-ignore` / `@ts-expect-error`; no protected config change (or label `config-change-approved` with the reason).
- [ ] Migrations reviewed as SQL; `prisma/seed.ts` updated if a table changed.
- [ ] `spec/features-map.md` row moved; `docs/metrics.md` per-card row filled; mistake-log updated if a known mistake repeated.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
