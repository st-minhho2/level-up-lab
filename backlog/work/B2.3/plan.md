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

| File                                          | Change                                                                  | Why (AC-14.n)  |
| --------------------------------------------- | ----------------------------------------------------------------------- | -------------- |
| `src/lib/todo-complete-all.ts`                | Add: `completeAllTodos` (one `updateMany`, returns count)               | 14.1, REQ-14.7 |
| `src/lib/todo-complete-all.test.ts`           | Add (red): AC-14.1; REQ-14.7 `count: 0` (no prefix)                     | 14.1           |
| `src/actions/complete-all.ts`                 | Add: `completeAllTodosAction` (`'use server'`, no Zod, §10/§11 failure) | 14.2, 14.3     |
| `src/actions/complete-all.test.ts`            | Add (red): AC-14.2, AC-14.3; `revalidatePath` throws (no prefix)        | 14.2, 14.3     |
| `src/lib/logger.ts`                           | Change: `MutationActionName` + `'completeAllTodosAction'` (type only)   | 14.3           |
| `src/components/complete-all-button.tsx`      | Add: `CompleteAllButton` (`'use client'`), alert as next sibling        | 14.4, 14.5     |
| `src/components/complete-all-button.test.tsx` | Add (red): AC-14.4 (a), (b); AC-14.5                                    | 14.4, 14.5     |
| `e2e/14-complete-all.spec.ts`                 | Add in phase B only (needs the mount); seed via `PrismaClient` as `09`  | 14.6           |
| `src/actions/CLAUDE.md`                       | "four actions" sentence names the fifth, `complete-all.ts`              | docs           |

Paperwork (exempt): `spec/features-map.md` F12 row ✗ in the skeleton (three modules), tests + page in `docs(map)`;
§14 index row stays ✗ until the closing commit (`check-ac-coverage.sh` would demand AC-14.6 before phase B);
`docs/metrics.md` per-card row.

## Sequence (phase B)

Waits until B2.1's PR #78 is MERGED (in Review it still holds the page and both package guides). Then
`git merge origin/main` (never rebase) and amend this plan with three rows: `src/app/page.tsx` (one JSX line and its
import, outside the list, both states, right after the clear button, `disabled` from the unfiltered array, never
B2.1's filtered one); `src/lib/CLAUDE.md` (row `todo-complete-all.ts`, §14) and `src/components/CLAUDE.md` (line
`complete-all-button.tsx`), both deferred from phase A because B2.1's plan holds them (`--check`). Lead re-approves as
`docs(backlog): B2.3 plan round 2 approved`. B2.2's phase B edits the same JSX region and both PRs stay draft
(Doing) until phase B is green, so the tie-break is the guard itself: the first card to commit its amended plan with
`scripts/next-task.sh --check` clean takes the page; the other's `--check` then reports the overlap and it waits for
that PR to merge (or the lead picks the order).

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
pnpm test:e2e e2e/14-complete-all.spec.ts  # phase B red: AC-14.6 (a), (b) fail, no "Mark all complete" button
pnpm test:e2e                # phase B green: + 2, all green
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
| 5 B green  | `code-writer` → green gate            | the page mount                       | `feat(ui): B2.3 mount mark all complete`    |
| 6 map      | dev-lead                              | F12 row: tests, page; metrics row    | `docs(map): F12 mark all complete [B2.3]`   |
| 7 review   | `reviewer` (diff), `/review-loop`     | `review.md` diff section, gate clear | `docs(backlog): B2.3 diff review …`         |

Diff review may run after step 3 (phase A banked) and again after step 5. PR stays draft until phase B is green.

Plan review: · Plan approved by: · Rounds: 1
