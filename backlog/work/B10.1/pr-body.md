<!-- Title: feat(todos): B10.1 Escape in the title editor puts focus on "Edit title" -->

## Item

B10.1 — Escape in the title editor puts focus on "Edit title" (spec §48)

- spec: §48 — unchanged in this branch (written before the label under D-45, #355)
- test: `src/components/todo-item-escape-focus.test.tsx::AC-48.1 … AC-48.6`, `e2e/48-escape-title-focus.spec.ts::AC-48.7` — red before (`scripts/verify-red.sh`), green after
- acceptance: AC-48.1 … AC-48.7

Closes #356

## Plan

Copied from `backlog/work/B10.1/plan.md`.

Approach: A from `advice.md`: in `src/components/todo-item.tsx` only, a one-shot `useRef(false)` marker set by the
Escape branch of `onTitleKeyDown` (after the existing `pending` guard, before `setEditing(false)`) and a
`useRef<HTMLButtonElement>` on "Edit title"; the `[editing]` effect, when `!editing` and the marker is set, clears it and
calls `focus()` on the button (REQ-48.1, 48.4). Saves never touch the marker (REQ-48.3). No new export, so no skeleton.
No migration, dependency, env key or CI-protected path (no `config-change-approved`).

| File                                             | Change                                                                       | Why (AC-n) |
| ------------------------------------------------ | ---------------------------------------------------------------------------- | ---------- |
| `src/components/todo-item.tsx`                   | Change: Escape marker ref, "Edit title" button ref, effect consumes; §48 hdr | 48.1–48.7  |
| `src/components/todo-item-escape-focus.test.tsx` | Add (red): AC-48.1 to AC-48.6, actions mocked via `vi.hoisted`, focus spy    | 48.1–48.6  |
| `e2e/48-escape-title-focus.spec.ts`              | Add (red): AC-48.7, `page.evaluate` for activeElement, POST counter          | 48.7       |
| `spec/features-map.md`                           | Add the F46 row (§48), ✅, in code-writer's `docs(map)` commit               | map        |

```ts
// src/components/todo-item.tsx: signature and props unchanged (§48 Function contracts)
export function TodoItem({ todo }: { readonly todo: Todo }): ReactNode; // + focus() on "Edit title" once per Escape
```

Verification: pin commit AC-48.3–48.5 (360 → 366, green) · `scripts/verify-red.sh B10.1` exit 0 · `pnpm test` 366 →
369 · `pnpm test:e2e` 88 → 89 · mutation: CI only, no src/lib or src/actions change · `pnpm build` ok.

Plan review: approved, round 2 · Plan approved by: reviewer (D-27, tier medium, issue #356) · Rounds: 1

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
