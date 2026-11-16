# B8.1 plan — Opening the title editor selects the whole title (§41)

Approach: A from `advice.md`: in `src/components/todo-item.tsx` only, a `useRef<HTMLInputElement>` on the title
`<input>` and one `useEffect` keyed on `[editing]` that, when `editing` is true, calls `focus()` then `select()`. The
dependency list is the spec's single trigger (REQ-41.4); `todo`, `draft`, `error`, `pending` never re-run it (REQ-41.3).
No new export, so no skeleton (as B7.3, B7.6). No migration, dependency, env key or CI-protected path (no
`config-change-approved`). The e2e file takes the section number: `e2e/41-…`.

## Files

| File                                       | Change                                                                       | Why (AC-n) |
| ------------------------------------------ | ---------------------------------------------------------------------------- | ---------- |
| `src/components/todo-item.tsx`             | Change: ref on the title `<input>`, `useEffect([editing])`; header names §41 | 41.1–41.5  |
| `src/components/todo-item-select.test.tsx` | Add (red): AC-41.1–41.5, `@/actions/todos` mocked via `vi.hoisted`           | 41.1–41.5  |
| `e2e/41-edit-title-select.spec.ts`         | Add (red): AC-41.6, seed [B `Buy mik`, A `Walk the dog`], POST count         | 41.6       |
| `spec/features-map.md`                     | Add the F39 row (§41), ✅, in code-writer's `docs(map)` commit               | map        |

Paperwork (exempt): §41 index row stays ✗ until the closing PR; `docs/metrics.md` per-card row.

## Interfaces touched

```ts
// src/components/todo-item.tsx: signature and props unchanged (§41 Function contracts)
export function TodoItem({ todo }: { readonly todo: Todo }): ReactNode;
// internal only: const fieldRef = useRef<HTMLInputElement>(null)   → ref={fieldRef} on the "Edit title" <input>
// internal only: useEffect(() => { if (editing) { fieldRef.current?.focus(); fieldRef.current?.select(); } }, [editing])
// No Server Action, Zod schema, Prisma model, query, env key, prop, export or route.
```

## Verification

Baseline: `pnpm test` 323 passed (50 files); `pnpm test:e2e` 33 spec files. Red (`test(todos): B8.1 … (red)`, no
skeleton: red is the field opening unfocused with the caret at the end, assertions): `scripts/verify-red.sh B8.1`
exit 0; AC-41.1–41.4 each red (AC-41.5 may pass before green, its first step depends on AC-41.1's selection: recorded
in the body); `pnpm test:e2e e2e/41-edit-title-select.spec.ts` → 1 fails on `activeElement`/selection, recorded.
Green: `pnpm lint && pnpm typecheck` clean · `pnpm test` 323 → 323 + N passed (51 files; N = the red commit's new
`it`/`it.each` cases), every AC-6.n, AC-10.n, AC-24.n, AC-25.n in `todo-item*.test.tsx` green · `pnpm test:e2e` +1 file
green, `e2e/06-*`, `e2e/24-*` green · mutation: CI only, no src/lib or src/actions change (B1.100; ≥ 70 holds) ·
`pnpm build` ok · `scripts/ci/check-features-map.sh`, `scripts/ci/check-plan-scope.sh` OK.

## Work breakdown

| Step | Role / skill    | Produces                                | Commit                         |
| ---- | --------------- | --------------------------------------- | ------------------------------ |
| 1    | none            | no skeleton (no new function or export) | —                              |
| 2    | test-writer     | AC-41.1–41.5 `it`s, e2e AC-41.6         | `test(todos): B8.1 … (red)`    |
| 3    | code-writer     | ref + `useEffect([editing])`            | `feat(todos): B8.1 …`          |
| 4    | code-writer     | F39 row ✅                              | `docs(map): F39 … [B8.1]`      |
| 5    | reviewer (diff) | `review.md` diff section                | `docs(backlog): B8.1 review …` |

Costs the lead takes: a post-paint effect, so one frame shows the field unfocused (advice A cons). React dev Strict
Mode runs the effect twice at the switch, before any typing: harmless. `src/components` is outside mutation scope, so
the `[editing]` list and the `if (editing)` guard are guarded by AC-41.3–41.5 only. The spec's "Lead approves spec"
box stays unticked: the issue's `agent-ready` label is the spec approval (D-27), as for §38–§40.

Plan review: pending · Plan approved by: · Rounds: 1
