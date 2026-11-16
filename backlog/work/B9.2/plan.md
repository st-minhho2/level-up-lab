# B9.2 plan — Opening the due-date editor puts focus in the date field (§45)

Approach: A from `advice.md`: in `src/components/todo-due-date.tsx` only, a `useRef<HTMLInputElement>` on the date
`<input>` and `useEffect(() => { if (editing) fieldRef.current?.focus(); }, [editing])`, as §41 does in
`todo-item.tsx:30-37` but with no `select()` (REQ-45.5). Keyed on `editing` alone, so a re-render in edit mode, a
rejected or failed save, a new `dueDate`, "Today" and the exit never call `focus()` (REQ-45.3, REQ-45.4). B
(`autoFocus`) rejected: it adds an attribute (REQ-45.5) and is not the `focus()` call the contract names. No new
export, so no skeleton. No migration, dependency, env key or CI-protected path (no `config-change-approved`). §40's
contract clause already landed on main (D-40, #334).

## Files

| File                                          | Change                                                            | Why (AC-45.n) |
| --------------------------------------------- | ----------------------------------------------------------------- | ------------- |
| `src/components/todo-due-date.tsx`            | Change: field ref, effect on `editing`; header comment names §45  | 45.1–45.7     |
| `src/components/todo-due-date-focus.test.tsx` | Add (red): AC-45.1 to AC-45.6, `@/actions/todos` mocked (hoisted) | 45.1–45.6     |
| `e2e/45-due-date-focus.spec.ts`               | Add (red): AC-45.7 (file named by section number, as e2e 41-43)   | 45.7          |
| `spec/features-map.md`                        | Add the F43 row (§45), ✅, in code-writer's `docs(map)` commit    | map           |

Paperwork (exempt): §45 index row stays ✗ until the closing PR; `docs/metrics.md` per-card row. No existing test changes.

## Interfaces touched

```ts
// src/components/todo-due-date.tsx: signature and props unchanged (§45 Function contracts)
export function TodoDueDate({
  todoId,
  dueDate,
}: {
  readonly todoId: string;
  readonly dueDate: string | undefined;
}): ReactNode; // plus: on the switch view → edit, the date <input> receives focus() once
// No Server Action, Zod schema, Prisma model, query, env key, prop, export or route.
```

## Verification

Baseline: `pnpm test` 338 tests in 53 files (component timeouts at 5 s seen under parallel-run load, a different set
each run; [unverified] as flakiness, re-run before the gates); `playwright test --list` 82 tests in 36 files.
Red (`test(todos): B9.2 … (red)`, no skeleton): `scripts/verify-red.sh B9.2` exit 0; AC-45.1, AC-45.2, AC-45.3,
AC-45.5, AC-45.6 fail on `document.activeElement` / the spy count; AC-45.4 may pass red (it asserts no refocus; the
card's `Test:` line is AC-45.1); e2e 45 fails on the active element.
Green: `pnpm lint && pnpm typecheck` clean · `pnpm test` 338 → 344 (53 → 54 files), the five
`todo-due-date*.test.tsx` files green unchanged · `pnpm test:e2e` 82 → 83 (36 → 37 files), `e2e/15-due-date.spec.ts`,
`e2e/28-escape-due-date.spec.ts`, `e2e/37-*`, `e2e/40-due-date-clear.spec.ts` green · mutation: CI only, no `src/lib`
or `src/actions` change (B1.100) · `pnpm build` ok · `scripts/ci/check-features-map.sh`, `scripts/ci/check-plan-scope.sh` OK.

## Work breakdown

| Step | Role / skill    | Produces                            | Commit                         |
| ---- | --------------- | ----------------------------------- | ------------------------------ |
| 1    | none            | no skeleton (no new export)         | —                              |
| 2    | test-writer     | unit file AC-45.1–45.6, e2e AC-45.7 | `test(todos): B9.2 … (red)`    |
| 3    | code-writer     | ref + effect                        | `feat(todos): B9.2 …`          |
| 4    | code-writer     | F43 row ✅                          | `docs(map): F43 … [B9.2]`      |
| 5    | reviewer (diff) | `review.md` diff section            | `docs(backlog): B9.2 review …` |

Costs the lead takes: focus is not restored on leaving edit mode (§28, §37 Out of scope kept); under React StrictMode in
`next dev` the effect runs twice (same element), the e2e reads only the final active element.

Plan review: approved, round 1 · Plan approved by: · Rounds: 1
