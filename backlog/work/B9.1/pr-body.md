<!-- Title: feat(todos): B9.1 after a successful add, focus is in the "New todo" box -->

## Item

B9.1 — After a successful add, focus is in the "New todo" box (spec §44)

- spec: §44 — unchanged in this branch (written before the label under D-40; AC-44.4 rewritten on main by D-41, #345)
- test: `src/components/todo-form-focus.test.tsx::AC-44.1 … AC-44.5`, `e2e/44-new-todo-focus.spec.ts::AC-44.6, AC-44.7` — red before (`scripts/verify-red.sh`), green after
- acceptance: AC-44.1 … AC-44.7

Closes #339

## Plan

### B9.1 plan — After a successful add, focus is in the "New todo" box (§44)

Approach: A from `advice.md`: in `src/components/todo-form.tsx` only, a `useRef<boolean>` holds the previous `pending`
and a `useLayoutEffect` keyed on `[pending]` (declared after the draft-sync layout effect, which stays untouched)
calls `box.current?.focus()` once when `pending` falls true → false and `state?.ok === true`. First render, typing,
counter and warning never change `pending` (REQ-44.2); a failed result never calls `focus()` (REQ-44.3); the same
result object resolved twice still focuses twice (REQ-44.4). B (effect keyed on `state`) rejected: misses a repeated
same-reference result. No new export, so no skeleton (as B7.6, B8.3). No migration, dependency, env key or
CI-protected path (no `config-change-approved`). §44 lifts and edits no other section (D-40).

#### Files

| File                                      | Change                                                                    | Why (AC-n) |
| ----------------------------------------- | ------------------------------------------------------------------------- | ---------- |
| `src/components/todo-form.tsx`            | Change: falling-edge `pending` ref + `useLayoutEffect` focus; header §44  | 44.1–44.7  |
| `src/components/todo-form-focus.test.tsx` | Add (red): AC-44.1 to AC-44.5, `createTodoAction` mocked via `vi.hoisted` | 44.1–44.5  |
| `e2e/44-new-todo-focus.spec.ts`           | Add (red): AC-44.6, AC-44.7                                               | 44.6, 44.7 |
| `spec/features-map.md`                    | Add the F42 row (§44), ✅, in code-writer's `docs(map)` commit            | map        |

Paperwork (exempt): §44 index row stays ✗ until the closing PR; `docs/metrics.md` per-card row.

#### Interfaces touched

```ts
// src/components/todo-form.tsx: signature and props unchanged (§44 Function contracts)
export function TodoForm(): ReactNode; // + focus() on the existing `box` ref once per settled ok result
// No Server Action, Zod schema, Prisma model, query, env key, prop, export or route; page.tsx untouched (D-40).
```

#### Verification

`scripts/verify-red.sh B9.1` exit 0 · `pnpm lint && pnpm typecheck` clean · `pnpm test` 338 → 343 · `pnpm test:e2e`
82 → 84 · mutation: CI only, no `src/lib` or `src/actions` change (B1.100) · `pnpm build` ok.

#### Work breakdown

no skeleton → `test(todos): B9.1 … (red)` (test-writer) → `feat(todos): B9.1 …` (code-writer) →
`docs(map): F42 … [B9.1]` (code-writer) → reviewer (diff).

Plan review: approved, round 2 · Plan approved by: reviewer (D-27, tier medium, issue #339) · Rounds: 1

## Map delta

pending

## Review

pending

## Evidence

- AC met: pending/7
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
