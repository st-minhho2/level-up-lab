# B1.9 plan — Redact every form of the database password in logs (§11, Tier quick)

Approach: D-15 option A as written in §11 (`docs(spec)` landed). `secretsOf` builds the secret list from
`getEnv().DATABASE_URL`: the whole value; `url.password`, its `decodeURIComponent`, and `encodeURIComponent` of that;
for every `&`-pair of `url.search` named exactly `password` or `sslpassword`, the raw value and its
`decodeURIComponent`. Each decode in its own guard (an undecodable form is left out, the rest stay, AC-11.3 (g));
empty strings dropped; duplicates harmless; sorted longest first before `scrub`. Analysis Q1–Q3 as proposed
(undecodable left out; `decodeURIComponent` only, `+` stays literal; every pair, exact name). Q4: `name`/`code` stay
unredacted (out of scope, a new D-n if wanted). No skeleton (no new export), advisor skipped (D-15 settled the rule).
(f) passes today, so it lands first, green, without `(red)` (B1.8 precedent), and the red commit holds (c), (d), (e), (g).

## Files

| File                     | Change                                                                                      | Why             |
| ------------------------ | ------------------------------------------------------------------------------------------- | --------------- |
| `src/lib/logger.ts`      | `secretsOf` widened per §11 Function contracts; length-descending order; comment says why   | AC-11.3 (c)–(g) |
| `src/lib/logger.test.ts` | 5 `AC-11.3:` tests, each overriding `getEnv` with its case's URL; (f) green first, rest red | AC-11.3 (c)–(g) |

No map change (F9 names both files), no env key, no dependency, no action change. Closing commit: card status, §11 ✅,
README row, `docs/metrics.md` rows.

## Interfaces touched

```ts
// src/lib/logger.ts (§11) — exported signature unchanged; internal helper only
export function logMutationFailure(action: MutationActionName, error: unknown): void;
function secretsOf(): string[]; // now: every D-15 form, empty dropped, longest first; never throws
```

## Verification

```bash
scripts/verify-red.sh B1.9   # 4 new tests fail on the message assertion ((c), (d), (e), (g)), 0 new pass
pnpm lint && pnpm typecheck && pnpm test   # 100 → 101 (pin) → 105 green
pnpm test:e2e                # 12 unchanged
pnpm test:mutation           # ≥ 70 (base 88.89 %); new secretsOf mutants Killed or listed
scripts/ci/check-ac-coverage.sh && scripts/ci/check-feat-commits.sh && scripts/ci/check-suppressions.sh && scripts/ci/check-spec-sections.sh
```

## Work breakdown

| Step          | Role / skill                          | Produces                         | Commit                                                |
| ------------- | ------------------------------------- | -------------------------------- | ----------------------------------------------------- |
| 0 Plan review | `reviewer` (plan)                     | `review.md` plan section         | `docs(backlog): B1.9 plan review …`                   |
| 1 Pin         | `test-writer` (green on arrival)      | (f)                              | `test(todos): B1.9 pin empty query passwords`         |
| 2 Red         | `test-writer` → red gate (dev-lead)   | (c), (d), (e), (g); verify-red 0 | `test(todos): B1.9 redact every password form (red)`  |
| 3 Green       | `code-writer` → green gate (dev-lead) | `logger.ts` change               | `feat(todos): B1.9 redact every form of the password` |
| 4 Review      | `reviewer` (diff), `/review-loop`     | `review.md` diff section         | `docs(backlog): B1.9 diff review …`                   |

Brief overrides: test-writer step 1 commits a green test without `(red)` and does not run verify-red; code-writer
leaves `docs/metrics.md` for the closing commit. Approving this plan also ticks §11's new `Lead approves spec` box (D-7).

Plan review: · Plan approved by: · Rounds: 1
