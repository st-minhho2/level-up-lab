# B9.4 plan — A focus move during a pending add is kept (§47)

Approach: A from `advice.md`: in `src/components/todo-form.tsx` only, the existing §44 layout effect (falling edge of
`pending` with `state?.ok === true`) reads `document.activeElement` once, at the commit that settles the result, and
calls `box.current?.focus()` only when it is the box, the "Add" button (a new `useRef<HTMLButtonElement>` on it),
`document.body` or `null` (REQ-47.1..47.3). B (`focusin` listener while pending) rejected: it judges at move time, so a
move undone during the save counts as a move (contradicts REQ-47.3, AC-47.4). No new export, so no skeleton (as B9.1).
No migration, dependency, env key or CI-protected path (no `config-change-approved`). The feature PR is titled
`fix(todos): B9.4 …` (D-44: it repairs B9.1); the green commit keeps the `feat(todos): B9.4 …` prefix the gates read.

## Files

| File                                              | Change                                                                         | Why (AC-n) |
| ------------------------------------------------- | ------------------------------------------------------------------------------ | ---------- |
| `src/components/todo-form.tsx`                    | Change: `addButton` ref; activeElement check in the §44 effect; header §47     | 47.1–47.6  |
| `src/components/todo-form-focus-pending.test.tsx` | Add (red): AC-47.1 to AC-47.4, deferred `createTodoAction` via `vi.hoisted`    | 47.1–47.4  |
| `e2e/47-new-todo-focus-pending.spec.ts`           | Add (red): AC-47.5, AC-47.6, `page.route` holds the `next-action` POST 2000 ms | 47.5, 47.6 |
| `spec/features-map.md`                            | Add the F45 row (§47), ✅, in code-writer's `docs(map)` commit                 | map        |

Paperwork (exempt): §47 index row stays ✗ until the closing PR; `docs/metrics.md` per-card row.

## Interfaces touched

```ts
// src/components/todo-form.tsx: signature and props unchanged (§47 Function contracts)
export function TodoForm(): ReactNode; // focus() of §44 only if document.activeElement ∈ {box, "Add", body, null}
// No Server Action, Zod schema, Prisma model, query, env key, prop, export or route; page.tsx untouched.
```

## Verification

Baseline: `pnpm exec vitest list` 356 tests; `pnpm test:e2e --list` 86 tests in 39 files. Red
(`test(todos): B9.4 … (red)`, no skeleton: every ok result calls `focus()`, so AC-47.1, 47.2, 47.4 and both e2e fail
on `document.activeElement` / the focus spy; AC-47.3 guards behavior that already holds and may be green, named in the
commit body): `scripts/verify-red.sh B9.4` exit 0. Green: `pnpm lint && pnpm typecheck` clean · `pnpm test` 356 → 360
(4 new `it`s, AC-47.1–47.4), with `todo-form-focus.test.tsx` (AC-44.1–44.5) and `todo-form.test.tsx` green ·
`pnpm test:e2e` 86 → 88 (`e2e/47-new-todo-focus-pending.spec.ts`), with `e2e/44-new-todo-focus.spec.ts`,
`e2e/25-search-shortcut.spec.ts`, `e2e/29-escape-new-todo.spec.ts` green · mutation: CI only, no `src/lib` or
`src/actions` change (B1.100) · `pnpm build` ok · `scripts/ci/check-features-map.sh` OK.

## Work breakdown

| Step | Role / skill    | Produces                                  | Commit                         |
| ---- | --------------- | ----------------------------------------- | ------------------------------ |
| 1    | none            | no skeleton (no new export)               | —                              |
| 2    | test-writer     | component + e2e files                     | `test(todos): B9.4 … (red)`    |
| 3    | code-writer     | `addButton` ref + activeElement condition | `feat(todos): B9.4 …`          |
| 4    | code-writer     | F45 row ✅                                | `docs(map): F45 … [B9.4]`      |
| 5    | reviewer (diff) | `review.md` diff section                  | `docs(backlog): B9.4 review …` |

Costs the lead takes: `<html>` as active element counts as "elsewhere" (spec lists body and null only; analysis Q2);
a focused element the save removes reads as body, so the box is focused (Q3); AC-47.6 inserts the new row above the
edited row: if the editor loses focus on that re-render it is a `todo-item.tsx` defect, reported, §47 not widened (Q6);
jsdom may keep a disabled "Add" as active element, which is in the allowed set; AC-47.3(c) blurs explicitly.

Plan review: approved, round 1 · Plan approved by: · Rounds: 1
