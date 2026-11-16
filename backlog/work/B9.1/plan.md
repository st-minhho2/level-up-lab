# B9.1 plan — After a successful add, focus is in the "New todo" box (§44)

Approach: A from `advice.md`: in `src/components/todo-form.tsx` only, a `useRef<boolean>` holds the previous `pending`
and a `useLayoutEffect` keyed on `[pending]` (declared after the draft-sync layout effect, which stays untouched)
calls `box.current?.focus()` once when `pending` falls true → false and `state?.ok === true`. First render, typing,
counter and warning never change `pending` (REQ-44.2); a failed result never calls `focus()` (REQ-44.3); the same
result object resolved twice still focuses twice (REQ-44.4). B (effect keyed on `state`) rejected: misses a repeated
same-reference result. No new export, so no skeleton (as B7.6, B8.3). No migration, dependency, env key or
CI-protected path (no `config-change-approved`). §44 lifts and edits no other section (D-40).

## Files

| File                                      | Change                                                                    | Why (AC-n) |
| ----------------------------------------- | ------------------------------------------------------------------------- | ---------- |
| `src/components/todo-form.tsx`            | Change: falling-edge `pending` ref + `useLayoutEffect` focus; header §44  | 44.1–44.7  |
| `src/components/todo-form-focus.test.tsx` | Add (red): AC-44.1 to AC-44.5, `createTodoAction` mocked via `vi.hoisted` | 44.1–44.5  |
| `e2e/44-new-todo-focus.spec.ts`           | Add (red): AC-44.6, AC-44.7                                               | 44.6, 44.7 |
| `spec/features-map.md`                    | Add the F42 row (§44), ✅, in code-writer's `docs(map)` commit            | map        |

Paperwork (exempt): §44 index row stays ✗ until the closing PR; `docs/metrics.md` per-card row. Not in scope:
`src/components/CLAUDE.md` (advice lists it as optional; §44 names one `src/` file).

## Interfaces touched

```ts
// src/components/todo-form.tsx: signature and props unchanged (§44 Function contracts)
export function TodoForm(): ReactNode; // + focus() on the existing `box` ref once per settled ok result
// No Server Action, Zod schema, Prisma model, query, env key, prop, export or route; page.tsx untouched (D-40).
```

## Verification

Baseline: `pnpm test` 338 tests in 53 files (2–8 component tests time out at 5000 ms under host load, a different set
per run; not behavior); `pnpm test:e2e --list` 82 tests in 36 files. Red (`test(todos): B9.1 … (red)`, no skeleton:
the form never calls `focus()`, so AC-44.1, 44.4, 44.6 fail on `document.activeElement`): `scripts/verify-red.sh B9.1`
exit 0. Green: `pnpm lint && pnpm typecheck` clean · `pnpm test` 338 → 343 (5 new `it`s, AC-44.1–44.5), with
`todo-form.test.tsx` and `todo-form-warning.test.tsx` green · `pnpm test:e2e` 82 → 84 (`e2e/44-new-todo-focus.spec.ts`),
with `e2e/25-search-shortcut.spec.ts`, `e2e/29-escape-new-todo.spec.ts`, `e2e/05-todos.spec.ts` green · mutation: CI
only, no `src/lib` or `src/actions` change (B1.100) · `pnpm build` ok · `scripts/ci/check-features-map.sh`,
`scripts/ci/check-plan-scope.sh` OK.

## Work breakdown

| Step | Role / skill    | Produces                                | Commit                         |
| ---- | --------------- | --------------------------------------- | ------------------------------ |
| 1    | none            | no skeleton (no new export)             | —                              |
| 2    | test-writer     | unit + e2e files, AC-44.4 same-ref case | `test(todos): B9.1 … (red)`    |
| 3    | code-writer     | `pending` edge ref + focus effect       | `feat(todos): B9.1 …`          |
| 4    | code-writer     | F42 row ✅                              | `docs(map): F42 … [B9.1]`      |
| 5    | reviewer (diff) | `review.md` diff section                | `docs(backlog): B9.1 review …` |

Costs the lead takes: an action that throws (not reachable through `createTodoAction`, which returns `ActionResult`)
would leave the prior ok `state` and focus the box; e2e flows that add then press `/` now type `/` into the box (§25);
any submit that resolves ok, including a click on "Add" with an empty box, sends focus back to the box, so REQ-44.4's
"focus moved elsewhere stays there" holds only for moves that do not submit. AC-44.4 follows D-41 (merged
`docs(spec): §44`, #345): Tab from the box to "Add" (no submit, 1 call, "Add" focused), then click the box, type
`Walk the dog`, Enter (2 calls, box focused, `''`); the test-writer copies that When literally, one `it`.

Plan review: approved, round 2 · Plan approved by: reviewer (D-27, tier medium, issue #339) · Rounds: 1
