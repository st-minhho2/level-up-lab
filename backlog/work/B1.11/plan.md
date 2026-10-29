# B1.11 plan — Redact the database password exactly as written in `DATABASE_URL` (§11, Tier quick)

Approach: D-17 option A as written in §11 (`docs(spec)` landed). `secretsOf` keeps today's parser forms and adds the
forms read from the raw `DATABASE_URL` text: authority = after the first `://` up to the first `/`, `?` or `#`;
userinfo = before its last `@`; password = after its first `:`; query = the text before the first `#`, after the
first `?`, split on `&`, pairs named exactly `password`/`sslpassword`. Every password and query value (written and
parsed) contributes as is, decoded, and decoded then re-encoded; each decode guarded; empty dropped; longest first;
`new URL` throwing still means no secret (REQ-11.6). Analysis Q1–Q4 as proposed (re-encoded query values added;
last-`@`/first-`:` split, as the parser; fragment excluded; rejected URL → no secret). No skeleton, advisor skipped
(D-17 settled the rule). All four new cases fail today (analysis: reference run), so no pin commit is needed.

## Files

| File                     | Change                                                                                           | Why             |
| ------------------------ | ------------------------------------------------------------------------------------------------ | --------------- |
| `src/lib/logger.ts`      | `secretsOf` adds the written password/query forms and re-encoded query values; helper(s) private | AC-11.3 (h)–(k) |
| `src/lib/logger.test.ts` | 4 `AC-11.3:` tests (h)–(k), each overriding `getEnv` with its case's URL                         | AC-11.3 (h)–(k) |

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
scripts/verify-red.sh B1.11  # 4 new tests fail on the message assertion ((h), (i), (j), (k)), 0 new pass
pnpm lint && pnpm typecheck && pnpm test   # 106 → 110 green
pnpm test:e2e                # 13 unchanged
pnpm test:mutation           # ≥ 70 (base 89.47 %); new secretsOf mutants Killed, survivors listed by line
scripts/ci/check-ac-coverage.sh && scripts/ci/check-feat-commits.sh && scripts/ci/check-suppressions.sh && scripts/ci/check-spec-sections.sh
```

## Work breakdown

| Step          | Role / skill                          | Produces                   | Commit                                                    |
| ------------- | ------------------------------------- | -------------------------- | --------------------------------------------------------- |
| 0 Plan review | `reviewer` (plan)                     | `review.md` plan section   | `docs(backlog): B1.11 plan review …`                      |
| 1 Red         | `test-writer` → red gate (dev-lead)   | (h)–(k); verify-red exit 0 | `test(todos): B1.11 redact the password as written (red)` |
| 2 Green       | `code-writer` → green gate (dev-lead) | `logger.ts` change         | `feat(todos): B1.11 redact the password as written`       |
| 3 Review      | `reviewer` (diff), `/review-loop`     | `review.md` diff section   | `docs(backlog): B1.11 diff review …`                      |

Brief override: code-writer leaves `docs/metrics.md` for the closing commit. Approving this plan also ticks §11's new
`Lead approves spec` box (D-7).

Plan review: · Plan approved by: · Rounds: 1
