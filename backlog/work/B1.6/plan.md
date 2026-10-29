# B1.6 plan — Log swallowed mutation failures (§11, Tier full)

Approach: S-A + L-A from `advice.md`, within D-12 (in-repo stderr JSON logger, R2 content). Skeleton adds
`src/lib/logger.ts` with the exported type and a `NotImplementedError` stub; actions are wired only in green. Green
writes the logger body (redact whole `DATABASE_URL` → its password → cut 500/2000; one outer try/catch; `getEnv()`
failure = no redaction) and calls `logMutationFailure('<action>', error)` in the four catch arms, after the
`TodoNotFoundError` arm. No dependency, no config change, no new env key, no migration. Ticking §11's lead box is
part of this approval (D-7).

## Files

| File                                         | Change                                                                                                               | Why (AC-11.n) |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------- |
| `src/lib/logger.ts` (new)                    | skeleton: `MutationActionName`, stub; green: body per §11 function contracts                                         | 11.1–11.4     |
| `src/actions/todos.ts`                       | four catch arms call `logMutationFailure` (create/clear bind `error`); stale "not logged" comments rewritten         | 11.5, 11.6    |
| `src/lib/logger.test.ts` (new)               | AC-11.1–11.4 + extra cases from advice (no stack, straddle, non-Error, passwordless URL, every occurrence)           | 11.1–11.4     |
| `src/actions/todos.test.ts`                  | `vi.mock('@/lib/logger')` (hoisted spy); AC-11.5; AC-11.6 ×3, each ending with one logged failure (positive control) | 11.5, 11.6    |
| `src/lib/CLAUDE.md`, `src/actions/CLAUDE.md` | logger row (§11); "nothing logged" → §11                                                                             | docs          |
| `spec/features-map.md`                       | new F9 row (code-writer, green commit)                                                                               | —             |
| `docs/metrics.md`                            | per-card row B1.6                                                                                                    | —             |

§11 index ✗ → ✅ in the closing commit. §10 unchanged ("logging the cause" stays out of §10's scope). No e2e.

## Interfaces touched

```ts
// src/lib/logger.ts (§11)
export type MutationActionName =
  'createTodoAction' | 'toggleTodoAction' | 'updateTodoTitleAction' | 'clearCompletedTodosAction';
export function logMutationFailure(action: MutationActionName, error: unknown): void;
// src/actions/todos.ts — signatures unchanged; catch arms call logMutationFailure before returning failure('form', …)
```

## Verification

```bash
scripts/verify-red.sh B1.6   # ≈ 21 new tests fail on behavior (stub NotImplementedError / spy 0 calls), 0 new pass
pnpm lint && pnpm typecheck && pnpm test   # 72 → ≈ 93 green, test run prints no JSON line
pnpm test:e2e                # 12 unchanged
pnpm test:mutation           # ≥ 70 (baseline 82.98 %; logger ≈ 95 % probed)
scripts/ci/check-ac-coverage.sh && scripts/ci/check-features-map.sh && scripts/ci/check-feat-commits.sh && scripts/ci/check-suppressions.sh
```

## Work breakdown

| Step          | Role / skill                          | Produces                                  | Commit                                                    |
| ------------- | ------------------------------------- | ----------------------------------------- | --------------------------------------------------------- |
| 1 Plan review | `reviewer` (plan)                     | `review.md` plan section                  | `docs(backlog): B1.6 plan review`                         |
| 2 Skeleton    | `code-writer` (new-feature-slice)     | `src/lib/logger.ts` stub                  | `chore(todos): B1.6 skeleton`                             |
| 3 Red         | `test-writer` → red gate (dev-lead)   | tests; `verify-red.sh B1.6` exit 0        | `test(todos): B1.6 log swallowed mutation failures (red)` |
| 4 Green       | `code-writer` → green gate (dev-lead) | behavior, guides, F9 map row, metrics row | `feat(todos): B1.6 log swallowed mutation failures`       |
| 5 Review      | `reviewer` (diff), `/review-loop`     | `review.md` diff section, gate cleared    | —                                                         |

Plan approved by: · Rounds: 1
