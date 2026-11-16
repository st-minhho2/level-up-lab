# B10.1 plan — Escape in the title editor puts focus on "Edit title" (§48)

Approach: A from `advice.md`: in `src/components/todo-item.tsx` only, a one-shot `useRef(false)` marker set by the
Escape branch of `onTitleKeyDown` (after the existing `pending` guard, before `setEditing(false)`) and a
`useRef<HTMLButtonElement>` on "Edit title"; the `[editing]` effect, when `!editing` and the marker is set, clears it and
calls `focus()` on the button (REQ-48.1, 48.4). Saves never touch the marker (REQ-48.3). B (callback ref focusing
during commit) rejected: re-invoked on every render, harder to reason about under Strict Mode. No new export, so no
skeleton (as B9.1, B9.4). No migration, dependency, env key or CI-protected path (no `config-change-approved`).

## Files

| File                                             | Change                                                                       | Why (AC-n) |
| ------------------------------------------------ | ---------------------------------------------------------------------------- | ---------- |
| `src/components/todo-item.tsx`                   | Change: Escape marker ref, "Edit title" button ref, effect consumes; §48 hdr | 48.1–48.7  |
| `src/components/todo-item-escape-focus.test.tsx` | Add (red): AC-48.1 to AC-48.6, actions mocked via `vi.hoisted`, focus spy    | 48.1–48.6  |
| `e2e/48-escape-title-focus.spec.ts`              | Add (red): AC-48.7, `page.evaluate` for activeElement, POST counter          | 48.7       |
| `spec/features-map.md`                           | Add the F46 row (§48), ✅, in code-writer's `docs(map)` commit               | map        |

Paperwork (exempt): §48 index row stays ✗ until the closing PR; `docs/metrics.md` per-card row.

## Interfaces touched

```ts
// src/components/todo-item.tsx: signature and props unchanged (§48 Function contracts)
export function TodoItem({ todo }: { readonly todo: Todo }): ReactNode; // + focus() on "Edit title" once per Escape
// No Server Action, Zod schema, Prisma model, query, env key, prop, export or route; button attributes unchanged.
```

## Verification

Baseline: `pnpm exec vitest list` 360 tests; `pnpm test:e2e --list` 88 tests in 40 files. Pin (green by design,
before the red, so `verify-red.sh` counts them as old): `test(todos): B10.1 pin AC-48.3 to AC-48.5 …` adds 6 `it`s,
one per part, `AC-48.3: (a)`/`(b)`, `AC-48.4: (a)`/`(b)`, `AC-48.5: (a)`/`(b)`, in
`todo-item-escape-focus.test.tsx`; `pnpm test` 360 → 366 green. Red (`test(todos): B10.1 … (red)`, no skeleton) adds
3 `it`s, AC-48.1, AC-48.2, AC-48.6, plus the e2e AC-48.7: today Escape leaves `document.activeElement` at body, so each
fails on that assertion (AC-48.6 asserts its precondition, the button focused after the Escape, before the rest):
`scripts/verify-red.sh B10.1` exit 0. Green: `pnpm lint && pnpm typecheck` clean · `pnpm test` 366 → 369 (AC-48.1–48.6,
9 `it`s), with `todo-item.test.tsx` (AC-24.x), `todo-item-select.test.tsx` (AC-41.x)
and `todo-search-form.test.tsx` (AC-25.x) green · `pnpm test:e2e` 88 → 89 (`e2e/48-escape-title-focus.spec.ts`), with
`e2e/24-escape-edit-title.spec.ts` and `e2e/25-search-shortcut.spec.ts` green · mutation: CI only, no `src/lib` or
`src/actions` change (B1.100) · `pnpm build` ok · `scripts/ci/check-features-map.sh` OK.

## Work breakdown

| Step | Role / skill    | Produces                         | Commit                          |
| ---- | --------------- | -------------------------------- | ------------------------------- |
| 1    | none            | no skeleton (no new export)      | —                               |
| 2a   | test-writer     | AC-48.3–48.5 (6 its), green      | `test(todos): B10.1 pin …`      |
| 2b   | test-writer     | AC-48.1, 48.2, 48.6 + e2e 48.7   | `test(todos): B10.1 … (red)`    |
| 3    | code-writer     | marker ref + button ref + effect | `feat(todos): B10.1 …`          |
| 4    | code-writer     | F46 row ✅                       | `docs(map): F46 … [B10.1]`      |
| 5    | reviewer (diff) | `review.md` diff section         | `docs(backlog): B10.1 review …` |

Costs the lead takes: a toggle in flight also blocks Escape (REQ-48.2 names it; code already does, analysis Q1);
AC-48.3 to 48.5 are pins, green before the code (the marker's traps, advice "Mutation hot spots"); jsdom leaves
`activeElement` at body when the focused field is removed, which AC-48.3(a), 48.4(b), 48.6 rely on; the effect is a
`useEffect` like §41's: React flushes it in the same task for a keydown, and no criterion tells it from
`useLayoutEffect` (review round 1, riskiest unfalsified).

Plan review: pending · Plan approved by: · Rounds: 1
