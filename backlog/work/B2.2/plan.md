# B2.2 plan — Show how many todos remain (§13)

Approach: A from `advice.md` — two phases. Phase A (now) builds the pure count and its component, touching no shared
mount point; phase B mounts it in the home page after B2.1 is MERGED. No already-rendered component can host the count
(§13 Function contracts name the page as the mount; `advice.md` "Approaches"), so the page edit cannot be avoided, only
sequenced. Analysis Q1–Q5 as proposed: "N item left" / "N items left"; outside the `<ul>`, in both states; count over
the stored list (REQ-13.5); derived from the `listTodos()` array, no second query; no live region.

## Files

| File                                      | Change                                                                                                                        | Why (AC-§.n)                 |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| `src/lib/todo-count.ts`                   | Add: `countRemaining`, `remainingLabel` (pure, no Prisma)                                                                     | AC-13.1, AC-13.2             |
| `src/lib/todo-count.test.ts`              | Add: unit, node; frozen inputs, boundaries 0/1/2/11                                                                           | AC-13.1, AC-13.2             |
| `src/components/remaining-count.tsx`      | Add: `RemainingCount` Server Component, one `<p>`                                                                             | AC-13.3 to AC-13.7           |
| `src/components/remaining-count.test.tsx` | Add: component, jsdom; the `<p>` text for 0, 1, 2                                                                             | AC-13.2                      |
| `e2e/13-remaining-count.spec.ts`          | Add in phase B only (needs the mount); seeds like `e2e/09`                                                                    | AC-13.3 to AC-13.7           |
| `src/app/page.tsx`                        | Phase B: `<RemainingCount count={countRemaining(todos)} />` after `<TodoFilterNav>`, before the list or empty text; 2 imports | AC-13.3 to AC-13.7, REQ-13.5 |
| `src/components/CLAUDE.md`                | Phase B: one line, `remaining-count.tsx` (§13) is a Server Component (no state, no events)                                    | doc drift (review)           |
| `src/lib/CLAUDE.md`                       | Phase B: module row `todo-count.ts` §13, pure, no Prisma, no `server-only`                                                    | doc drift (review)           |

Paperwork: `spec/features-map.md` F11 row (status ✗) lands in the skeleton commit with the two modules, so
`check-features-map.sh` stays green on every phase-A push; test files join the row in step 6. Not touched:
`src/lib/todos.ts`, `src/actions/todos.ts`, `prisma/`, `layout.tsx`, every client component. No dependency, no env
key, no protected path (no `config-change-approved`). Skeleton brief override: two synchronous stubs and one Server
Component (no `'use client'`), each throwing `NotImplementedError`; no page, action or schema.

## Sequence (phase B)

Round 2 (lead): B2.1 #78 merged (830901d); `origin/main` merged into this branch (b2db063: paperwork conflicts in
`docs/metrics.md`, `spec/features-map.md`, `spec/technical-requirements.md`, both rows kept). `countRemaining` takes
`todos` (the stored list from `listTodos()`), never `shown` (B2.1's filtered list): REQ-13.5, same source as the clear
button (REQ-12.10). Diff-review check: `git grep -n "countRemaining(" src/app/page.tsx` → `countRemaining(todos)`.
B2.3 waits for this card to merge before it takes the page.

## Interfaces touched

```ts
// src/lib/todo-count.ts (§13) — no server-only, importable anywhere
export function countRemaining(todos: readonly { readonly completed: boolean }[]): number;
export function remainingLabel(count: number): string;
// src/components/remaining-count.tsx (§13) — Server Component, no state, no events
export function RemainingCount({ count }: { readonly count: number }): ReactNode;
```

## Verification

```bash
scripts/verify-red.sh B2.2   # phase A: 11 new tests fail on NotImplementedError, 0 new pass
pnpm lint && pnpm typecheck && pnpm test   # 115 + 8 (todo-count.test.ts: AC-13.1 ×4 lists, AC-13.2 ×4 counts)
                             #     + 3 (remaining-count.test.tsx: AC-13.2 render 0, 1, 2) = 126 green
pnpm test:e2e                # phase A: unchanged, all green
pnpm test                    # phase B (after the b2db063 merge, B2.1 added 4): 130 passed, no new unit test
pnpm test:e2e                # phase B red: e2e/13 5 failed (AC-13.3…13.7), 16 passed; run by hand, verify-red skips e2e
pnpm test:e2e                # phase B green: 21 passed in 7 files
pnpm test:mutation           # ≥ 70; todo-count.ts mutants (`!completed`, `=== 1`, strings) Killed
scripts/ci/check-ac-coverage.sh && scripts/ci/check-spec-sections.sh && scripts/ci/check-feat-commits.sh \
  && scripts/ci/check-features-map.sh
```

## Work breakdown

| Step       | Role / skill                          | Produces                  | Commit                                        |
| ---------- | ------------------------------------- | ------------------------- | --------------------------------------------- |
| 1 skeleton | `new-feature-slice`                   | two stubs + F11 row (✗)   | `chore(todos): B2.2 skeleton`                 |
| 2 red      | `test-writer` → red gate (dev-lead)   | unit + component tests    | `test(todos): B2.2 remaining count (red)`     |
| 3 green    | `code-writer` → green gate (dev-lead) | both modules              | `feat(todos): B2.2 count the remaining todos` |
| 4 B red    | `test-writer` (after round-2 approve) | `e2e/13`, red on the page | `test(ui): B2.2 remaining count on / (red)`   |
| 5 B green  | `code-writer` → green gate            | page mount + 2 CLAUDE.md  | `feat(ui): B2.2 show the remaining count`     |
| 6 map      | dev-lead                              | F11 row: tests, page      | `docs(map): F11 remaining count [B2.2]`       |
| 7 review   | `reviewer` (diff), `/review-loop`     | `review.md` diff section  | `docs(backlog): B2.2 diff review …`           |

Diff review may run once after step 3 (phase A banked) and again after step 5; phase B's green-gate range starts at
the step-4 red commit. PR stays draft until phase B is green; the card holds its WIP slot until then.

Plan review: approved, round 2; phase-B amendment: changes requested (1 reason, numbers) applied, not re-reviewed · Plan approved by: lead (session reply "approve"),
2026-10-31 (round 1); round 2: pending, approval commit `docs(backlog): B2.2 plan round 2 approved` · Rounds: 2
