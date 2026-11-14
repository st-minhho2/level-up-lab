<!-- Title: feat(todos): B7.3 the due-date editor has a "Today" button -->

## Item

B7.3 — The due-date editor has a "Today" button (spec §37)

- spec: §37 — unchanged in this branch (written before the label under D-37, c155c3a)
- test: `src/components/todo-due-date-today-button.test.tsx::AC-37.1 … AC-37.5`, `e2e/37-due-date-today.spec.ts::AC-37.6` — red before (`scripts/verify-red.sh`), green after
- acceptance: AC-37.1 … AC-37.6

Closes #294

## Plan

### B7.3 plan — The due-date editor has a "Today" button (§37)

Approach: A from `advice.md`: in `src/components/todo-due-date.tsx` only, one `type="button"` "Today" between the field
and "Update due date", `onClick` sets the draft to `todayOf(new Date())` read in the handler, `disabled={pending}`, and
its `onKeyDown` is the field's existing §28 handler (widened to input | button), so REQ-37.4/37.5 share §28's one code
path. No new export, so no skeleton. No migration, dependency, env key or CI-protected path (no `config-change-approved`).
Deviation from `advice.md`: the e2e file takes the section number (`e2e/28-escape-due-date.spec.ts` is §28), not the
contract's: `e2e/37-due-date-today.spec.ts`.

#### Files

| File                                                 | Change                                                                                        | Why (AC-37.n) |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------- |
| `src/components/todo-due-date.tsx`                   | Change: "Today" button, `onToday()`, key handler typed for input and button; header names §37 | 37.1–37.6     |
| `src/components/todo-due-date-today-button.test.tsx` | Add (red): AC-37.1–37.5, `setTodoDueDateAction` mocked via `vi.hoisted`, fake `Date` only     | 37.1–37.5     |
| `e2e/37-due-date-today.spec.ts`                      | Add (red): AC-37.6, POSTs to `/` counted by a request listener                                | 37.6          |
| `spec/features-map.md`                               | Add the F35 row (§37), ✅, in code-writer's `docs(map)` commit                                | map           |

Paperwork (exempt): §37 index row stays ✗ until the closing PR; `docs/metrics.md` per-card row.

#### Interfaces touched

```ts
// src/components/todo-due-date.tsx: signature and props unchanged (§37 Function contracts)
export function TodoDueDate({
  todoId,
  dueDate,
}: {
  readonly todoId: string;
  readonly dueDate: string | undefined;
}): ReactNode;
// internal only: function onToday(): void  → setDraft(todayOf(new Date()))
// internal only: onDueDateKeyDown(event: KeyboardEvent<HTMLInputElement | HTMLButtonElement>): void
// No Server Action, Zod schema, Prisma model, query, env key, prop, export or route.
```

#### Verification

Baseline: `pnpm test` 280 passed (45 files). Red (`test(todos): B7.3 … (red)`, no skeleton: red is the missing "Today"
button, an assertion): `scripts/verify-red.sh B7.3` exit 0; 5 new unit `it`s (AC-37.1–37.5) each red;
`pnpm test:e2e e2e/37-due-date-today.spec.ts` → 1 fails on the "Today" locator, recorded in the body. Green:
`pnpm lint && pnpm typecheck` clean · `pnpm test` 280 → 285 passed (46 files), every AC-15.n, AC-17.n, AC-28.n, AC-31.n
in `todo-due-date*.test.tsx` green · `pnpm test:e2e` +1, `e2e/15-due-date.spec.ts`, `e2e/28-escape-due-date.spec.ts`,
`e2e/31-due-today.spec.ts` green · `pnpm test:mutation` ≥ 70 (`src/lib`, `src/actions` untouched) · `pnpm build` ok ·
`scripts/ci/check-features-map.sh` and `scripts/ci/check-plan-scope.sh` OK.

#### Work breakdown

| Step | Role / skill    | Produces                                | Commit                         |
| ---- | --------------- | --------------------------------------- | ------------------------------ |
| 1    | none            | no skeleton (no new function or export) | —                              |
| 2    | test-writer     | 5 unit `it`s, `e2e/37-due-date-today…`  | `test(todos): B7.3 … (red)`    |
| 3    | code-writer     | the button and its handlers             | `feat(todos): B7.3 …`          |
| 4    | code-writer     | F35 row ✅                              | `docs(map): F35 … [B7.3]`      |
| 5    | reviewer (diff) | `review.md` diff section                | `docs(backlog): B7.3 review …` |

Costs the lead takes: Enter or Space on the focused "Today" activates it (native button), which only fills the field.
"Today" keeps a row's error message (REQ-37.3). B7.6 (same batch) later adds "Clear due date" to the same form.

Plan review: approved, round 1 · Plan approved by: reviewer (D-27, tier medium, issue #294) · Rounds: 1

## Map delta

- `spec/features-map.md`: new row F35 · §37 · "Today" button in the due-date editor · `src/components/todo-due-date.tsx` ·
  `src/components/todo-due-date-today-button.test.tsx`, `e2e/37-due-date-today.spec.ts` · ✅ (672d9f8)
- `spec/technical-requirements.md`: §37 index row, ✗ until the closing PR

## Review

`backlog/work/B7.3/review.md`, diff review round 1: **Verdict: ready for PR**, 0 findings.

- Range: red a2db3b4, feat df8e436, map 672d9f8.
- Reviewer's gates: `pnpm test` 291 passed (46 files), `pnpm test:e2e` 65 passed, mutation 93.22 (≥ 70), suppressions,
  config-change, feat-commits, ac-coverage, spec-sections, features-map, plan-scope (D-27 approval) all OK,
  `verify-red.sh B7.3` red for the right reason (11 of 11 new failed).
- Revert probes: drop "Today"'s `onKeyDown` → AC-37.4 fails; drop `disabled={pending}` → AC-37.5 (a) fails; read the
  mount-time day → AC-37.3 fails; drop the `pending` guard → AC-37.5 (a) and AC-28.4 fail.
- Notes (non-blocking): the plan said 285 tests; the 5 criteria run as 11 `it.each` cases, so 291. The metrics row now
  reads 93.22 and df8e436 (47ee80e).
- Riskiest unfalsified: REQ-37.3 "does not change the row's message" has no criterion; adding `setError(undefined)` to
  `onToday` keeps all 38 `todo-due-date*` tests green. Guarding it needs a new AC (`docs(spec)` under a D-n).

Dev-lead's green gate: `pnpm lint`, `pnpm typecheck` clean, `pnpm test` 291 passed, `pnpm test:e2e` 65 passed;
branch already contains origin/main (7e8a32f), `check-spec-sections.sh` OK.

## Evidence

- AC met: AC-37.1 … AC-37.6 (6 of 6; 5 unit as 11 cases, 1 e2e)
- tier: medium
- plan deviations: none (`docs/metrics.md` row is listed paperwork)
- trace: n/a

## Checklist

- [x] **Diff matches the approved plan**: no file outside the Files table, no interface outside the list.
- [x] Red commit precedes the feat commit; no `feat(` commit touches `*.test.*` or `e2e/**`.
- [x] Every `AC-§.n` of the section is a test title; mutation on `src/lib` + `src/actions` ≥ 70 %.
- [x] No new `eslint-disable` / `@ts-ignore` / `@ts-expect-error`; no protected config change (or label `config-change-approved` with the reason).
- [x] Migrations reviewed as SQL; `prisma/seed.ts` updated if a table changed. (n/a: no migration)
- [x] `spec/features-map.md` row moved; `docs/metrics.md` per-card row filled; mistake-log updated if a known mistake repeated.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
