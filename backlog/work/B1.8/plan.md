# B1.8 plan — Log the Prisma error code of a failed connection (§11, Tier quick)

Approach: D-14 option A as written in §11 (`docs(spec)` landed): `describeError` takes `error.code` when it is a
string, else `error.errorCode` when that is a string, else no `code` key; key order unchanged. Advisor skipped (quick,
D-14 settled the only choice). No skeleton (no new export; red fails on assertions). Analysis Q1 kept (cases (d)–(g)),
Q2 plain `Error` objects (no Prisma import in the logger test). The red commit holds only the cases that fail today,
(d) and (f); (e) and (g) pass against today's code (they pin precedence and the `typeof` on `errorCode`), so they land
first, green, in a commit without `(red)` (precedent: `docs/mistake-log.md` 2026-10-28): the green gate then sees all
four, and `verify-red.sh B1.8` (base = parent of the red commit) counts (e)/(g) as existing. No new title starts with
an existing test's title (verify-red's "old test" match).

## Files

| File                     | Change                                                                                                        | Why             |
| ------------------------ | ------------------------------------------------------------------------------------------------------------- | --------------- |
| `src/lib/logger.ts`      | `describeError`: code = string `code` ?? string `errorCode`; comment names Prisma's initialization errors     | AC-11.2 (d)–(g) |
| `src/lib/logger.test.ts` | new helper `errorCodedError(message, errorCode, code?)`; 4 `AC-11.2:` tests, (e)/(g) green first, (d)/(f) red | AC-11.2 (d)–(g) |

No map change (F9 already names both files), no env, no dependency, no action change. Closing commit: card status,
§11 ✅ in the index, README row, `docs/metrics.md` per-card row.

## Interfaces touched

```ts
// src/lib/logger.ts (§11) — exported signature unchanged; internal LoggedError unchanged (code?: string)
export function logMutationFailure(action: MutationActionName, error: unknown): void;
```

## Verification

```bash
scripts/verify-red.sh B1.8   # 2 new tests fail on the key/value assertions ((d), (f)), 0 new pass
pnpm lint && pnpm typecheck && pnpm test   # 96 → 98 (pin) → 100 green (4 new AC-11.2; base includes B1.7)
pnpm test:e2e                # 12 unchanged
pnpm test:mutation           # ≥ 70 (base 88.60 % after B1.7); new logger mutants Killed, logger ≥ 95 %
scripts/ci/check-ac-coverage.sh && scripts/ci/check-feat-commits.sh && scripts/ci/check-suppressions.sh && scripts/ci/check-spec-sections.sh
```

## Work breakdown

| Step          | Role / skill                          | Produces                    | Commit                                                     |
| ------------- | ------------------------------------- | --------------------------- | ---------------------------------------------------------- |
| 0 Plan review | `reviewer` (plan)                     | `review.md` plan section    | `docs(backlog): B1.8 plan review …`                        |
| 1 Pin         | `test-writer` (green on arrival)      | (e), (g)                    | `test(todos): B1.8 pin code precedence and errorCode type` |
| 2 Red         | `test-writer` → red gate (dev-lead)   | (d), (f); verify-red exit 0 | `test(todos): B1.8 log errorCode as the code (red)`        |
| 3 Green       | `code-writer` → green gate (dev-lead) | `logger.ts` change          | `feat(todos): B1.8 log Prisma's errorCode as the code`     |
| 4 Review      | `reviewer` (diff), `/review-loop`     | `review.md` diff section    | `docs(backlog): B1.8 diff review …`                        |

Brief overrides: test-writer step 1 commits green tests without `(red)` and does not run verify-red; code-writer leaves `docs/metrics.md` for the closing commit (lead's instruction for this run).
Approving this plan also ticks §11's new `Lead approves spec` box (D-7).

Plan review: approved, round 2 · Plan approved by: lead (session reply "approve B1.8"), 2026-10-29 · Rounds: 1
