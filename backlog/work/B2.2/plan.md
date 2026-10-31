# B2.2 plan — Show how many todos remain (§13)

Approach: A from `advice.md` — two phases. Phase A (now) builds the pure count and its component, touching no shared
mount point; phase B mounts it in the home page after B2.1 is MERGED. No already-rendered component can host the count
(§13 Function contracts name the page as the mount; `advice.md` "Approaches"), so the page edit cannot be avoided, only
sequenced. Analysis Q1–Q5 as proposed: "N item left" / "N items left"; outside the `<ul>`, in both states; count over
the stored list (REQ-13.5); derived from the `listTodos()` array, no second query; no live region.

## Files

| File                                      | Change                                                     | Why (AC-§.n)       |
| ----------------------------------------- | ---------------------------------------------------------- | ------------------ |
| `src/lib/todo-count.ts`                   | Add: `countRemaining`, `remainingLabel` (pure, no Prisma)  | AC-13.1, AC-13.2   |
| `src/lib/todo-count.test.ts`              | Add: unit, node; frozen inputs, boundaries 0/1/2/11        | AC-13.1, AC-13.2   |
| `src/components/remaining-count.tsx`      | Add: `RemainingCount` Server Component, one `<p>`          | AC-13.3 to AC-13.7 |
| `src/components/remaining-count.test.tsx` | Add: component, jsdom; the `<p>` text for 0, 1, 2          | AC-13.2            |
| `e2e/13-remaining-count.spec.ts`          | Add in phase B only (needs the mount); seeds like `e2e/09` | AC-13.3 to AC-13.7 |

Paperwork: `spec/features-map.md` F11 row (status ✗) lands in the skeleton commit with the two modules, so
`check-features-map.sh` stays green on every phase-A push; test files join the row in step 6. Not touched:
`src/lib/todos.ts`, `src/actions/todos.ts`, `prisma/`, `layout.tsx`, every client component. No dependency, no env
key, no protected path (no `config-change-approved`). Skeleton brief override: two synchronous stubs and one Server
Component (no `'use client'`), each throwing `NotImplementedError`; no page, action or schema.

## Sequence (phase B)

Waits until B2.1's PR is MERGED (B2.1 in Review still holds the page). Then: `git merge origin/main`; amend this plan
with one row for the home page under `src/app/` (one JSX line plus two imports, placed outside the list per §13 and
after B2.1's filter nav), lead re-approves as `docs(backlog): B2.2 plan round 2 approved`, re-run
`scripts/next-task.sh --check B2.2` (today: no overlap with B2.1's plan, which holds the page). Expect a
`spec/technical-requirements.md` index conflict at that merge (both add a row). Coupling check for the diff review:
`git grep -n "countRemaining(" src/app/` passes the same unfiltered variable as the clear button (REQ-13.5).

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
pnpm test:e2e e2e/13-remaining-count.spec.ts   # phase B red: 5 failed (AC-13.3…13.7, "items left" not found)
pnpm test:e2e                # phase B green: + 5, all green
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
| 5 B green  | `code-writer` → green gate            | the page mount            | `feat(ui): B2.2 show the remaining count`     |
| 6 map      | dev-lead                              | F11 row: tests, page      | `docs(map): F11 remaining count [B2.2]`       |
| 7 review   | `reviewer` (diff), `/review-loop`     | `review.md` diff section  | `docs(backlog): B2.2 diff review …`           |

Diff review may run once after step 3 (phase A banked) and again after step 5; phase B's green-gate range starts at
the step-4 red commit. PR stays draft until phase B is green; the card holds its WIP slot until then.

Plan review: approved, round 2 · Plan approved by: · Rounds: 1
