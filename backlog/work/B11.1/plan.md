# B11.1 plan — Escape in the due-date editor puts focus on "Edit due date" (§51)

Approach: A from `advice.md`: in `src/components/todo-due-date.tsx` only, a one-shot `escapedRef = useRef(false)` set by
the Escape branch of `onDueDateKeyDown` (after the existing `modified || pending` guard) and an
`editButtonRef = useRef<HTMLButtonElement>(null)` on "Edit due date"; the `[editing]` effect keeps the entry focus of
§45 and, when `!editing` and the marker is set, clears it and calls `focus()` on the button (REQ-51.1, 51.5). `save`,
`onSave`, `onClear` never touch the marker (REQ-51.3). Same shape as §48 on main (B10.1). B (state flag) rejected: one
extra render per Escape, easy to mis-key against REQ-51.5. No new export, so no skeleton (as B10.1). No migration,
dependency, env key or CI-protected path (no `config-change-approved`).

## Files

| File                                                 | Change                                                                                     | Why (AC-n)          |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------- |
| `src/components/todo-due-date.tsx`                   | Change: Escape marker ref, "Edit due date" button ref, effect consumes; §51 in the header  | 51.1–51.7           |
| `src/components/todo-due-date-escape-focus.test.tsx` | Add: AC-51.1 to AC-51.6, action mocked via `vi.hoisted`, focus spy read by `mock.contexts` | 51.1–51.6           |
| `src/components/todo-due-date-focus.test.tsx`        | Change (red commit): `:86`, `:133` `document.body` → the button; titles `:79`, `:110`      | AC-45.3(a), AC-45.5 |
| `e2e/51-escape-due-date-focus.spec.ts`               | Add (red): AC-51.7, `page.evaluate` for activeElement, POST counter                        | 51.7                |
| `spec/features-map.md`                               | Add the F49 row (§51), ✅, in code-writer's `docs(map)` commit                             | map                 |

Paperwork (exempt): §51 index row stays ✗ until the closing PR; `docs/metrics.md` per-card row.

## Interfaces touched

```ts
// src/components/todo-due-date.tsx: signature and props unchanged (§51 Function contracts)
export function TodoDueDate({
  todoId,
  dueDate,
}: {
  readonly todoId: string;
  readonly dueDate: string | undefined;
}): ReactNode;
// + focus() on "Edit due date" once per Escape that leaves edit mode, after the commit; none on save, clear, re-render.
// No Server Action, Zod schema, Prisma model, query, env key, prop, export or route; button attributes unchanged.
```

## Verification

Baseline: `pnpm exec vitest list` 381 tests; `pnpm test:e2e --list` 90 tests in 42 files. Pin (green by design, before
the red, so `verify-red.sh` counts them as old): `test(todos): B11.1 pin AC-51.3 to AC-51.5 …` adds 4 `it`s, AC-51.3,
`AC-51.4: (a)`/`(b)`, AC-51.5, in `todo-due-date-escape-focus.test.tsx`; `pnpm test` 381 → 385 green. Red
(`test(todos): B11.1 … (red)`, no skeleton) adds 4 `it`s, AC-51.1, `AC-51.2: (a)`/`(b)`, AC-51.6, rewrites AC-45.3(a)
and AC-45.5 as §51 lists, and adds the e2e AC-51.7: today Escape leaves `document.activeElement` at body, so each fails
on that assertion; `scripts/verify-red.sh B11.1` exit 0. Green: `pnpm lint && pnpm typecheck` clean · `pnpm test`
385 → 389 (AC-51.1–51.6, 8 `it`s), with `todo-due-date.test.tsx` (AC-28.x), `todo-due-date-today-button.test.tsx`
(AC-37.x), `todo-due-date-clear.test.tsx` (AC-40.x), `todo-due-date-focus.test.tsx` (AC-45.x) and
`todo-item-escape-focus.test.tsx` (AC-48.x) green · `pnpm test:e2e` 90 → 91 (`e2e/51-escape-due-date-focus.spec.ts`),
with `e2e/28-escape-due-date.spec.ts` and `e2e/45-due-date-focus.spec.ts` green · mutation: CI only, no `src/lib` or
`src/actions` change (B1.100) · `pnpm build` ok · `scripts/ci/check-features-map.sh` OK.

## Work breakdown

| Step | Role / skill    | Produces                                   | Commit                          |
| ---- | --------------- | ------------------------------------------ | ------------------------------- |
| 1    | none            | no skeleton (no new export)                | —                               |
| 2a   | test-writer     | AC-51.3–51.5 (4 its), green                | `test(todos): B11.1 pin …`      |
| 2b   | test-writer     | AC-51.1, 51.2, 51.6 + 2 §45 rewrites + e2e | `test(todos): B11.1 … (red)`    |
| 3    | code-writer     | marker ref + button ref + effect           | `feat(todos): B11.1 …`          |
| 4    | code-writer     | F49 row ✅                                 | `docs(map): F49 … [B11.1]`      |
| 5    | reviewer (diff) | `review.md` diff section                   | `docs(backlog): B11.1 review …` |

Costs the lead takes: AC-51.3 to 51.5 are pins, green before the code (the marker's traps, advice "Mutation hot
spots"); the two §45 tests change assertions (spec-named, D-45), the only test edits; the effect is a `useEffect` as in
§45 and §48, flushed in the same task for a keydown; the `HTMLButtonElement.prototype.focus` spy also sees
`userEvent.click` calls, so counts filter by receiver (§51 says so).

Plan review: approved, round 1 · Plan approved by: reviewer (D-27, tier medium, issue #362) · Rounds: 1
