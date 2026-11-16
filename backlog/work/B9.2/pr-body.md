<!-- Title: feat(todos): B9.2 opening the due-date editor puts focus in the date field -->

## Item

B9.2 — Opening the due-date editor puts focus in the date field (spec §45)

- spec: §45 — unchanged in this branch (written before the label under D-40)
- test: `src/components/todo-due-date-focus.test.tsx::AC-45.1 … AC-45.6`, `e2e/45-due-date-focus.spec.ts::AC-45.7` — red before (`scripts/verify-red.sh`), green after
- acceptance: AC-45.1 … AC-45.7

Closes #340

## Plan

### B9.2 plan — Opening the due-date editor puts focus in the date field (§45)

Approach: A from `advice.md`: in `src/components/todo-due-date.tsx` only, a `useRef<HTMLInputElement>` on the date
`<input>` and `useEffect(() => { if (editing) fieldRef.current?.focus(); }, [editing])`, as §41 does in
`todo-item.tsx:30-37` but with no `select()` (REQ-45.5). Keyed on `editing` alone, so a re-render in edit mode, a
rejected or failed save, a new `dueDate`, "Today" and the exit never call `focus()` (REQ-45.3, REQ-45.4). B
(`autoFocus`) rejected: it adds an attribute (REQ-45.5) and is not the `focus()` call the contract names. No new
export, so no skeleton. No migration, dependency, env key or CI-protected path (no `config-change-approved`).

#### Files

| File                                          | Change                                                            | Why (AC-45.n) |
| --------------------------------------------- | ----------------------------------------------------------------- | ------------- |
| `src/components/todo-due-date.tsx`            | Change: field ref, effect on `editing`; header comment names §45  | 45.1–45.7     |
| `src/components/todo-due-date-focus.test.tsx` | Add (red): AC-45.1 to AC-45.6, `@/actions/todos` mocked (hoisted) | 45.1–45.6     |
| `e2e/45-due-date-focus.spec.ts`               | Add (red): AC-45.7 (file named by section number, as e2e 41-43)   | 45.7          |
| `spec/features-map.md`                        | Add the F43 row (§45), ✅, in code-writer's `docs(map)` commit    | map           |

#### Interfaces touched

```ts
// src/components/todo-due-date.tsx: signature and props unchanged (§45 Function contracts)
export function TodoDueDate({
  todoId,
  dueDate,
}: {
  readonly todoId: string;
  readonly dueDate: string | undefined;
}): ReactNode; // plus: on the switch view → edit, the date <input> receives focus() once
```

#### Verification

Baseline: `pnpm test` 338 tests (53 files); `playwright test --list` 82 tests in 36 files. Red: `scripts/verify-red.sh B9.2`
exit 0. Green: `pnpm lint && pnpm typecheck` clean · `pnpm test` 338 → 344+ (53 → 54 files) · `pnpm test:e2e` 82 → 83
(36 → 37 files) · mutation: CI only, no `src/lib` or `src/actions` change (B1.100) · `pnpm build` ok.

Plan review: approved, round 1 · Plan approved by: reviewer (D-27, tier medium, issue #340) · Rounds: 1

Work breakdown note: one test commit more than planned. AC-45.4 passes before any code (the plan said it may), and
`verify-red.sh` fails a red commit holding a passing test, so it landed alone first as a pin (`0a93ba1`, as B8.1's
AC-41.4 pin), then the red commit `f42f37d`. Files and interfaces unchanged.

## Map delta

F43 · §45 · (new) → ✅ — `TodoDueDate` focuses the date field on entering edit mode, `src/components/todo-due-date.tsx`;
evidence: `pnpm test` → 346 passed (54 files), `pnpm test:e2e` → 83 passed (`ce17db4`).

## Review

`/review-loop`: passes 1/3, verdict ready for PR, 0 findings (confirmed 0, plausible 0), no dispositions needed.

- Gates run by the reviewer: lint, typecheck, `pnpm test` 346/346, `pnpm test:e2e` 83/83, `verify-red.sh B9.2` exit 0,
  `check-suppressions`, `check-config-change`, `check-feat-commits`, `check-ac-coverage`, `check-spec-sections`,
  `check-features-map`, `check-plan-scope` all OK.
- Revert probes: effect without deps → 3 fail (AC-45.5, AC-45.4 (a)(b)); deps `[editing, dueDate]` → AC-45.5 fails;
  no `focus()` → 6 fail (the red commit).
- Riskiest unfalsified: REQ-45.5 "the field's text is not selected" has no criterion that measures it; a `select()`
  added after `focus()` keeps all 61 due-date unit tests green. A spec-coverage gap, not a defect in this diff.

Unit count 338 → 346, not 344: AC-45.3 and AC-45.4 are two `it`s each (accepted in plan review round 1, note 2).

## Evidence

- AC met: 7/7
- tier: medium
- plan deviations: none
- trace: n/a
- mutation: CI only, no src/lib or src/actions change

## Checklist

- [ ] **Diff matches the approved plan**: no file outside the Files table, no interface outside the list.
- [ ] Red commit precedes the feat commit; no `feat(` commit touches `*.test.*` or `e2e/**`.
- [ ] Every `AC-§.n` of the section is a test title; mutation on `src/lib` + `src/actions` ≥ 70 %.
- [ ] No new `eslint-disable` / `@ts-ignore` / `@ts-expect-error`; no protected config change (or label `config-change-approved` with the reason).
- [ ] Migrations reviewed as SQL; `prisma/seed.ts` updated if a table changed.
- [ ] `spec/features-map.md` row moved; `docs/metrics.md` per-card row filled; mistake-log updated if a known mistake repeated.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
