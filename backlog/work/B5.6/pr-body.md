<!-- Title: feat(todos): B5.6 Escape closes the due-date editor without saving -->

## Item

B5.6 — Escape closes the due-date editor without saving (spec §28)

- spec: §28 — written in this branch (D-30); the Escape half of "cancelling an edit (Escape/blur)" lifted from §15's Out of scope (D-32), blur stays out
- test: `src/components/todo-due-date.test.tsx::AC-28.1 … AC-28.6`, `e2e/28-escape-due-date.spec.ts::AC-28.7` — red before (`scripts/verify-red.sh`; AC-28.4–AC-28.6 pinned green first), green after
- acceptance: AC-28.1 … AC-28.7

Closes #225

## Plan

### B5.6 plan — Escape closes the due-date editor without saving (§28)

Approach: A from `advice.md` — an inline `onKeyDown` on the existing "Due date" input in
`src/components/todo-due-date.tsx` only (D-30, §28 Function contracts): Escape with no modifier and no save in flight →
`preventDefault`, leave edit mode, reset the draft to `dueDate ?? ''`, clear the message. No new export, so no skeleton
step (as B5.2); no import of §27's `isSearchEscape` (advice question 1). No migration, dependency, env key or
CI-protected path (no `config-change-approved`). `src/app/page.tsx`, `src/actions/*`, `src/lib/*`,
`src/components/todo-item.tsx` untouched (D-30). The §15 Out of scope lift landed in 406927e (D-32).

#### Files

| File                                    | Change                                                                                                                | Why (AC-28.n) |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------- |
| `src/components/todo-due-date.tsx`      | Add `onKeyDown` on the "Due date" input, `'Escape'` as a named module constant; header names §28 (green)              | 28.1–28.7     |
| `src/components/todo-due-date.test.tsx` | Add a §28 `describe`: AC-28.4–28.6 pinned green first (hold today), then AC-28.1–28.3 (red); keys only added to mocks | 28.1–28.6     |
| `e2e/28-escape-due-date.spec.ts`        | Add (red): AC-28.7, seeds C, B (done, due 2026-11-05), A; counts POSTs to `/` with `page.on('request')`               | 28.7          |
| `spec/features-map.md`                  | Add the F26 row (§28): code-writer's feat (✗), ✅ in `docs(map)`                                                      | map           |

Paperwork (exempt): §28 index row stays ✗ until the closing PR; `docs/metrics.md` per-card row.

#### Interfaces touched

```ts
// src/components/todo-due-date.tsx: unchanged signature and markup; one private handler added
export function TodoDueDate({
  todoId,
  dueDate,
}: {
  readonly todoId: string;
  readonly dueDate: string | undefined;
}): ReactNode;
function onDueDateKeyDown(event: KeyboardEvent<HTMLInputElement>): void; // private, on the <input> only (REQ-28.7)
// No Server Action, Zod schema, Prisma model, query, env key, prop or export.
```

#### Verification

Baseline: `pnpm test` 227 passed (39 files), e2e 51 tests. Pin (`test(todos): B5.6 pin AC-28.4–28.6 …`): AC-28.4
(pending: field kept, `defaultPrevented` false, closes on the save's `ok`, 1 call), AC-28.5 (Enter through `userEvent` submits
`('todo-9','2026-12-01')`; ArrowLeft, Ctrl/Meta/Alt/Shift+Escape one case each), AC-28.6 (body, "Update due date",
"New todo") hold on today's code, green, each asserting its own Then: 1 + 6 + 3 rows, 227 → 237 passed. Red (`test(todos): B5.6 … (red)`, `fireEvent.keyDown`
cancelable): `scripts/verify-red.sh B5.6` exit 0; AC-28.1–28.3 fail on assertions (field still present, `defaultPrevented`
false, alert kept), never an import; `pnpm test:e2e e2e/28-escape-due-date.spec.ts` → AC-28.7 fails on the "Due date"
field count, recorded in the body. Green: `pnpm lint && pnpm typecheck` clean · `pnpm test` 237 → 241 passed (red adds
AC-28.1 1, AC-28.2 2 rows (with and without a due date), AC-28.3 1; a different count is stated in the red commit), all AC-15.n, AC-17.n, AC-24.n green ·
`pnpm test:e2e` 51 → 52 passed, `e2e/15-due-date.spec.ts`, `e2e/17-overdue.spec.ts`, `e2e/24-escape-edit-title.spec.ts`
green · `pnpm test:mutation` ≥ 70 (scope `src/lib` + `src/actions`, unchanged by this card; the component's guards are
killed by AC-28.4/28.5 per advice "Mutation hot spots", read by the reviewer) · `pnpm build` ok ·
`scripts/ci/check-plan-scope.sh` OK.

#### Work breakdown

| Step | Role / skill    | Produces                                             | Commit                            |
| ---- | --------------- | ---------------------------------------------------- | --------------------------------- |
| 1    | test-writer     | AC-28.4–28.6 in `todo-due-date.test.tsx`, green      | `test(todos): B5.6 pin AC-28.4 …` |
| 2    | test-writer     | AC-28.1–28.3 + `e2e/28-escape-due-date.spec.ts`, red | `test(todos): B5.6 … (red)`       |
| 3    | code-writer     | the input's `onKeyDown`, F26 row ✗                   | `feat(todos): B5.6 …`             |
| 4    | dev-lead        | F26 ✅                                               | `docs(map): F26 … [B5.6]`         |
| 5    | reviewer (diff) | `review.md` diff section                             | `docs(backlog): B5.6 review …`    |

Plan review: approved, round 2 (round 1: 1 reason, unit counts stated, applied be6294a) · Plan approved by: reviewer (D-27, tier medium, issue #225) · Rounds: 1

## Map delta

- F26 · §28 · ✗ → ✅ — `onDueDateKeyDown` on the "Due date" input in `src/components/todo-due-date.tsx`; evidence: `pnpm test` → 241 passed, `pnpm test:e2e` → 52 passed, mutation 92.62 (`src/lib` + `src/actions`, unchanged by this card). The ✗ row landed in the feat commit 7e16b8f, the ✅ flip in `docs(map)` 6e04aba (written by `code-writer`: `dev-lead`'s path hook refuses `spec/features-map.md`, mistake-log row 8df2de3).

## Review

`/review-loop`: passes 1/3, verdict ready for PR, 0 findings. Plan review: approved in round 2 (round 1: 1 reason, unit counts stated, applied be6294a).

| Pass | #   | Finding (file:line)                                                            | Source   | Kind       | Disposition      | Justification                                                                                                            |
| ---- | --- | ------------------------------------------------------------------------------ | -------- | ---------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------ |
| 1    | Q1  | `pending` read in `onDueDateKeyDown` stale between submit and render?          | dev-lead | question   | no change needed | submit and Escape are separate discrete events; React flushes `pending = true` first; no `pending` guard → AC-28.4 fails |
| 1    | Q2  | AC-28.7's POST count flaky?                                                    | dev-lead | flake risk | no change needed | a wrong save posts at once, before the field could close; `fill` sends no POST; 1/1 green                                |
| 1    | S1  | `setDraft(dueDate ?? '')` on Escape survives its removal                       | reviewer | coverage   | no change needed | equivalent: `onEdit` reseeds the draft on every open, so the reset is unobservable; §28 Function contracts require it    |
| 1    | P1  | reviewer probe wrote 10 `sed -i` edits into the worktree's `todo-due-date.tsx` | reviewer | process    | fixed            | `git restore` by dev-lead before any commit; HEAD was intact; mistake-log row 571c92f                                    |

Probes (one line removed each, on an archive copy): `preventDefault` → 1 fails · `setEditing(false)` → 4 · `setError` → 1 · each of ctrl/meta/alt/shift → 1 · `pending` → 1 · `CANCEL_KEY = 'Esc'` → 4 · `setDraft` → 0 (equivalent, S1).

Riskiest unfalsified: an Escape in the window between a successful save's `setEditing(false)` and `pending` turning false; harmless (the save is stored) and untested.

Full text: `backlog/work/B5.6/review.md` "Diff review (round 1)".

## Evidence

- AC met: 7/7 (AC-28.1 … AC-28.7)
- tier: medium
- plan deviations: none (step 4's `docs(map)` commit was written by `code-writer`, not `dev-lead`; same file and content as the Files table)
- trace: n/a

## Checklist

- [ ] **Diff matches the approved plan**: no file outside the Files table, no interface outside the list.
- [ ] Red commit precedes the feat commit; no `feat(` commit touches `*.test.*` or `e2e/**`.
- [ ] Every `AC-§.n` of the section is a test title; mutation on `src/lib` + `src/actions` ≥ 70 %.
- [ ] No new `eslint-disable` / `@ts-ignore` / `@ts-expect-error`; no protected config change (or label `config-change-approved` with the reason).
- [ ] Migrations reviewed as SQL; `prisma/seed.ts` updated if a table changed.
- [ ] `spec/features-map.md` row moved; `docs/metrics.md` per-card row filled; mistake-log updated if a known mistake repeated.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
