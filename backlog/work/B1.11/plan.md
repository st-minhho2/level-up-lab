# B1.11 plan — Redact the database password exactly as written in `DATABASE_URL` (§11, Tier quick)

Approach: D-17 option A as written in §11 (`docs(spec)` landed). `secretsOf` keeps today's parser forms and adds the
forms read from the raw `DATABASE_URL` text: authority = after the first `://` up to the first `/`, `?` or `#`;
userinfo = before its last `@`; password = after its first `:`; query = the text before the first `#`, after the
first `?`, split on `&`, pairs named exactly `password`/`sslpassword`. Every password and query value (written and
parsed) contributes as is, decoded, and decoded then re-encoded; each decode guarded; empty dropped; longest first;
`new URL` throwing still means no secret (REQ-11.6). Analysis Q1–Q4 as proposed (re-encoded query values added;
last-`@`/first-`:` split, as the parser; fragment excluded; rejected URL → no secret). No skeleton, advisor skipped
(D-17 settled the rule). Plan review round 1 added two pins and a fifth red test: the "none" rules (no `@`, no `:`),
the fragment cut and the exact name are pinned by two tests green today, landed first without `(red)` (B1.8/B1.9
precedent); the first-`:` split is pinned by a fifth test, red today. (h)–(k) all fail today.

## Files

| File                     | Change                                                                                           | Why                       |
| ------------------------ | ------------------------------------------------------------------------------------------------ | ------------------------- |
| `src/lib/logger.ts`      | `secretsOf` adds the written password/query forms and re-encoded query values; helper(s) private | AC-11.3 (h)–(k)           |
| `src/lib/logger.test.ts` | 7 tests, each overriding `getEnv`: 2 pins (green), 4 `AC-11.3:` (h)–(k) + 1 first-`:` test (red) | AC-11.3 (h)–(k), REQ-11.4 |

No map change (F9 names both files), no env key, no dependency, no action change. Closing commit: card status, §11 ✅,
README row, `docs/metrics.md` rows.

## Interfaces touched

```ts
// src/lib/logger.ts (§11) — exported signature unchanged; internal helpers only
export function logMutationFailure(action: MutationActionName, error: unknown): void;
function secretsOf(): string[]; // + written password and query forms, re-encoded query values; never throws
```

## Verification

```bash
scripts/verify-red.sh B1.11  # 5 new tests fail on the message assertion ((h)–(k), first `:`), 0 new pass
pnpm lint && pnpm typecheck && pnpm test   # 106 → 108 (pin) → 113 green
pnpm test:e2e                # 13 unchanged
pnpm test:mutation           # ≥ 70 (base 89.47 %); logger.ts survivors listed by line, each named equivalent or accepted
scripts/ci/check-ac-coverage.sh && scripts/ci/check-feat-commits.sh && scripts/ci/check-suppressions.sh && scripts/ci/check-spec-sections.sh
```

## Work breakdown

| Step          | Role / skill                          | Produces                              | Commit                                                       |
| ------------- | ------------------------------------- | ------------------------------------- | ------------------------------------------------------------ |
| 0 Plan review | `reviewer` (plan)                     | `review.md` plan section              | `docs(backlog): B1.11 plan review …`                         |
| 1 Pin         | `test-writer` (green on arrival)      | 2 pins                                | `test(todos): B1.11 pin user name, fragment and no userinfo` |
| 2 Red         | `test-writer` → red gate (dev-lead)   | (h)–(k), first `:`; verify-red exit 0 | `test(todos): B1.11 redact the password as written (red)`    |
| 3 Green       | `code-writer` → green gate (dev-lead) | `logger.ts` change                    | `feat(todos): B1.11 redact the password as written`          |
| 4 Review      | `reviewer` (diff), `/review-loop`     | `review.md` diff section              | `docs(backlog): B1.11 diff review …`                         |

Pins (step 1, no AC prefix, titled like the file's REQ-11.4 tests): (1) `DATABASE_URL`
`postgresql://app@db.internal:5432/lab?mypassword=suffix&sslmode=require#&password=frag`, message
`user app, suffix, frag` → unchanged; (2) `postgresql://db.internal:5432/lab`, message `port 5432` → unchanged.
Fifth red test (step 2): `postgresql://app:p@ä:%41@db.internal:5432/lab`, message `auth p@ä:%41` → `auth [redacted]`,
title `redacts the written password after the first colon of the userinfo (REQ-11.4)`.

Brief overrides: test-writer step 1 commits green tests without `(red)` and does not run verify-red; code-writer
leaves `docs/metrics.md` for the closing commit; accepted survivors (review round 1 notes 1–3) are listed by line. Approving this plan also ticks §11's new
`Lead approves spec` box (D-7).

Plan review: approved, round 2 · Plan approved by: lead (session reply "approve B1.11"), 2026-10-29 · Rounds: 1
