# B2.3 plan — Mark all todos complete (§14)

Approach: A from `advice.md` — own modules as §14's Function contracts name them (D-20 (a)), two phases like B2.2.
Phase A (now) builds lib, action, client button and the logger union member, touching no held mount point
(`src/app/page.tsx`, `src/lib/todos.ts`, `src/actions/todos.ts` untouched). Phase B mounts the button in the home page
after B2.1 is MERGED. Click wired with `onClick` + `useTransition` like `ClearCompletedButton` (AC-14.4 "0 arguments").
Analysis Q1–Q6 as proposed: `MutationActionName` widened type-only, §10/§11 text untouched (approving this plan ticks
§14's `Lead approves spec` box, D-7, and accepts that `/spec-trace` will show §11's four-member block vs five in code);
`disabled` from the unfiltered `listTodos()` array; e2e named by section (`14-`). No dependency, migration, env key or
CI-protected path (no `config-change-approved`).

## Files

| File                                          | Change                                                                                                                                                                             | Why (AC-14.n)            |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| `src/lib/todo-complete-all.ts`                | Add: `completeAllTodos` (one `updateMany`, returns count)                                                                                                                          | 14.1, REQ-14.7           |
| `src/lib/todo-complete-all.test.ts`           | Add (red): AC-14.1; REQ-14.7 `count: 0` (no prefix)                                                                                                                                | 14.1                     |
| `src/actions/complete-all.ts`                 | Add: `completeAllTodosAction` (`'use server'`, no Zod, §10/§11 failure)                                                                                                            | 14.2, 14.3               |
| `src/actions/complete-all.test.ts`            | Add (red): AC-14.2, AC-14.3; `revalidatePath` throws (no prefix)                                                                                                                   | 14.2, 14.3               |
| `src/lib/logger.ts`                           | Change: `MutationActionName` + `'completeAllTodosAction'` (type only)                                                                                                              | 14.3                     |
| `src/components/complete-all-button.tsx`      | Add: `CompleteAllButton` (`'use client'`), alert as next sibling                                                                                                                   | 14.4, 14.5               |
| `src/components/complete-all-button.test.tsx` | Add (red): AC-14.4 (a), (b); AC-14.5                                                                                                                                               | 14.4, 14.5               |
| `e2e/14-complete-all.spec.ts`                 | Add in phase B: AC-14.6 (a), (b); plus one test without an AC prefix (REQ-14.4): on `/?filter=completed` with one open todo the button is enabled; seed via `PrismaClient` as `09` | 14.6, REQ-14.4           |
| `src/app/page.tsx`                            | Phase B: `<CompleteAllButton disabled={!todos.some((todo) => !todo.completed)} />` right after `<ClearCompletedButton>`, before `<TodoFilterNav>`; 1 import; header names §14      | 14.6, REQ-14.4, REQ-14.5 |
| `src/lib/CLAUDE.md`                           | Phase B: module row `todo-complete-all.ts` §14, `completeAllTodos`, one `updateMany`; `logger.ts` row names §11, §14                                                               | docs                     |
| `src/components/CLAUDE.md`                    | Phase B: one line, `complete-all-button.tsx` (§14) is `'use client'` (state, events) like the clear button                                                                         | docs                     |
| `src/actions/CLAUDE.md`                       | "four actions" sentence names the fifth, `complete-all.ts`                                                                                                                         | docs                     |

Paperwork (exempt): `spec/features-map.md` F12 row ✗ in the skeleton (three modules), tests + page in `docs(map)`;
§14 index row stays ✗ until the closing commit (`check-ac-coverage.sh` would demand AC-14.6 before phase B);
`docs/metrics.md` per-card row.

## Sequence (phase B)

Round 2 (lead): B2.1 #78 merged (830901d) and B2.2 #79 merged (0af252c); `origin/main` merged into this branch
(577a463, 2f9a1c1: paperwork conflicts in `docs/metrics.md`, `spec/features-map.md`, `spec/technical-requirements.md`,
both rows kept). `disabled` is computed from `todos` (the stored list from `listTodos()`), never `shown` (B2.1's
filtered list): REQ-14.4/14.5 speak of every todo, filtered marking is out of scope (§14). Placement: the second
list-wide control, directly after the clear button, so the controls read form → clear → mark all → filter → count →
list. Diff-review check: `git grep -n "CompleteAllButton disabled" src/app/page.tsx` → `!todos.some(`, also pinned by the
REQ-14.4 e2e on `/?filter=completed` (added after the amendment review, its cost 1). The lead's approval is committed
as `docs(backlog): B2.3 plan round 2 approved` (the subject `plan-scope.sh` reads). Phase B red has no script proof
(`verify-red.sh` skips e2e): the red commit body records `pnpm test:e2e e2e/14-complete-all.spec.ts` → 3 failed.

## Interfaces touched

```ts
// src/lib/todo-complete-all.ts (§14) — Prisma only through '@/lib/prisma'
export async function completeAllTodos(): Promise<number>;
// src/actions/complete-all.ts (§14) — 'use server'
export async function completeAllTodosAction(): Promise<ActionResult<{ updated: number }>>;
// src/lib/logger.ts (§11, §14)
export type MutationActionName =
  | 'createTodoAction'
  | 'toggleTodoAction'
  | 'updateTodoTitleAction'
  | 'clearCompletedTodosAction'
  | 'completeAllTodosAction';
// src/components/complete-all-button.tsx (§14) — 'use client'
export function CompleteAllButton({ disabled }: { readonly disabled: boolean }): ReactNode;
```

## Verification

```bash
scripts/verify-red.sh B2.3   # phase A: 8 new tests fail on NotImplementedError or an assertion, 0 new pass
pnpm lint && pnpm typecheck && pnpm test   # 115 + 2 (lib) + 3 (action) + 3 (component) = 123 green
pnpm test:e2e                # phase A: unchanged, all green
pnpm test:e2e e2e/14-complete-all.spec.ts  # phase B red: 3 failed (AC-14.6 (a), (b), REQ-14.4), no such button
pnpm test                    # phase B: 138 unchanged (after merging B2.1, B2.2)
pnpm test:e2e                # phase B green: 21 + 3 = 24 passed
pnpm test:mutation           # ≥ 70; todo-complete-all.ts and complete-all.ts mutants Killed (where/data literals,
                             # revalidatePath inside the try, logMutationFailure args)
scripts/ci/check-ac-coverage.sh && scripts/ci/check-spec-sections.sh && scripts/ci/check-feat-commits.sh \
  && scripts/ci/check-features-map.sh
```

## Work breakdown

| Step       | Role / skill                          | Produces                             | Commit                                      |
| ---------- | ------------------------------------- | ------------------------------------ | ------------------------------------------- |
| 1 skeleton | `new-feature-slice`                   | 3 stubs, logger member, F12 row (✗)  | `chore(todos): B2.3 skeleton`               |
| 2 red      | `test-writer` → red gate (dev-lead)   | lib, action, component tests         | `test(todos): B2.3 mark all complete (red)` |
| 3 green    | `code-writer` → green gate (dev-lead) | three modules, actions guide line    | `feat(todos): B2.3 mark all complete`       |
| 4 B red    | `test-writer` (after round-2 approve) | `e2e/14`, red on the page            | `test(ui): B2.3 mark all on / (red)`        |
| 5 B green  | `code-writer` → green gate            | page mount + 2 CLAUDE.md             | `feat(ui): B2.3 mount mark all complete`    |
| 6 map      | dev-lead                              | F12 row: tests, page; metrics row    | `docs(map): F12 mark all complete [B2.3]`   |
| 7 review   | `reviewer` (diff), `/review-loop`     | `review.md` diff section, gate clear | `docs(backlog): B2.3 diff review …`         |

Diff review may run after step 3 (phase A banked) and again after step 5. PR stays draft until phase B is green.

Plan review: approved, round 2; phase-B amendment: approved (a0a72fb), REQ-14.4 e2e added after it · Plan approved by: lead (session reply "approve"), 2026-10-31
(round 1); round 2: · Rounds: 2
