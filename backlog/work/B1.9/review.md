# B1.9 review

## Plan review (round 1)

SCOPE: lib

Reviewed: `backlog/work/B1.9/plan.md` at `5f76a7b` (`Plan review: · Plan approved by: · Rounds: 1`, empty) against §11
(`spec/contracts/09-logging.md` as extended in `b53b264`, third box `- [ ] Lead approves spec (lead, <date>)` at line 7
unticked), card B1.9 (`backlog/plan/E1-todos.md:104`), D-15 and D-7 (`backlog/00-decisions.md`), `analysis.md`,
`src/lib/logger.ts`, `src/lib/logger.test.ts`, `scripts/verify-red.sh`, `scripts/ci/check-feat-commits.sh`,
`scripts/ci/lib.sh`, `backlog/CLAUDE.md`, `spec/CLAUDE.md`, `.env.example`, `.github/workflows/ci.yml`, and the B1.8 plan
and review as precedent. Run in this worktree on 2026-10-29: `pnpm test` → `Tests 100 passed (100)`; e2e titles
3 + 4 + 3 + 2 = 12; `check-spec-sections`, `check-ac-coverage`, `check-features-map`, `check-backlog`,
`check-feat-commits`, `check-suppressions` all OK; `git log origin/main..HEAD` = 5 docs commits, no `src/` change.

Probe on a `git clone` of the worktree under `$TMPDIR/b19-plan-r1-probe` (`node_modules` symlinked, tracked files only,
no hooks bypassed), plan steps 1–3 built as commits with the plan's subjects:

- Step 1 (pin (f)) → `Tests 101 passed (101)`.
- Step 2 (red (c), (d), (e), (g)) → `Tests 4 failed | 19 passed (23)` in `logger.test.ts`, each on the message
  assertion; received strings match `analysis.md` exactly (`auth p@ss/w, p%40ss%2Fw, [redacted]`, unchanged,
  `key [redacted]-ssl`, `… or q%zz`). `scripts/verify-red.sh B1.9` and `--auto` → base = pin commit,
  `23 ran (4 new), 4 new failed, 0 new passed  OK (red on behavior)`, exit 0.
- Step 3, a reference reading of the Function contracts (per-decode guards, exact names, empty and undecodable dropped,
  length-descending sort) → `Tests 105 passed (105)`, `tsc --noEmit` clean, `eslint src/lib/logger.ts` clean.
- `stryker run --mutate src/lib/logger.ts` on that reference: 40 killed / 8 survived = 83.33 %. Survivors include the
  whole query-name guard: `if (false) { continue; }` and `||` → `&&` survive, i.e. an implementation that treats
  every query parameter as a secret passes all 105 tests (reason 1). With one extra pin (below): 43 killed /
  5 survived = 89.58 %, the remaining 5 equivalent (`decoded`'s catch body, `at === -1` redundant with the name test,
  `!== undefined` in the filter, the outer catch's `return []`).

| Check                                                                             | pass / fail: reason                                                                                                                                                                                                                         |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: `src/lib/logger.ts` and `src/lib/logger.test.ts` are both F9; no other `src/` file; no map change needed. Closing commit (card, §11 ✅, README row, metrics) matches `backlog/CLAUDE.md` "Closing a card".                            |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: `logMutationFailure(action: MutationActionName, error: unknown): void` unchanged, verbatim from §11; `secretsOf` stays internal; no Prisma, action, schema, env key or dependency change. Note 3 on `readonly`.                       |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: no `advice.md`; plan states "advisor skipped (D-15 settled the rule)", allowed for a quick card (`backlog/CLAUDE.md`). Follows analysis Q1–Q3 as proposed, Q4 out of scope, Q5 pipeline shape.                                        |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: 6 criteria (AC-11.1 to AC-11.6); AC-11.3 (c)–(g) each an exact `error.message`; probe reproduces every Then string with the reference reading.                                                                                        |
| verification lists exact commands with expected numbers                           | pass: 100 → 101 → 105 and verify-red 4 failed / 0 passed confirmed by probe; e2e 12 confirmed; mutation ≥ 70 from 88.89 % (B1.8 review measurement; note 2); four guards named. Numbers change with reason 1.                               |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: no skeleton (no new export) and no map step (F9 names both files) are justified; the green pin before `(red)` follows the approved B1.8 shape and `verify-red.sh` counts it as existing (probe); subjects follow `backlog/CLAUDE.md`. |
| the section has a `Lead approves spec` box, ticked only by a human (D-7)          | pass: `spec/contracts/09-logging.md:7` unticked; the plan says the gate's approve ticks it (D-7). Not ticked by me.                                                                                                                         |
| no settled D-n contradicted                                                       | pass: D-15 option A as written (decoded, re-encoded, raw and decoded query values of the two names, longest first, empty never); D-12, D-14 untouched; Q1's "undecodable left out" is a reading inside D-15, written into REQ-11.4.         |

Verdict: changes requested

Reasons:

1. **The exact-name rule for query parameters has no test, so an implementation that redacts every query value goes
   green.** §11 Function contracts: a pair counts only when its name "is exactly `password` or `sslpassword`"; Out of
   scope lists every other parameter and "a parameter name in another case". No AC-11.3 case has a pair with another
   name, and none has a different-case name. TRIGGER: this repo's own `DATABASE_URL` shape,
   `…/level_up_lab?schema=public` (`.env.example:3`, `ci.yml:73`), with an implementation that skips the name check
   (or lower-cases it). Probe: the `if (false)` mutant of the name guard survives the plan's 105 tests. WRONG
   BEHAVIOUR: every `public` in a message or stack becomes `[redacted]` (a Prisma `public.todos` table error loses
   its schema), and a `PASSWORD=` pair is treated as a secret, both against §11. CONFIDENCE: confirmed (probe).
   Fix in the plan: step 1 pins one more test, green on arrival, titled without an AC prefix like the file's other
   REQ-11.4 tests, e.g. `leaves the values of query parameters not named exactly password or sslpassword unredacted
(REQ-11.4)` with `DATABASE_URL` `postgresql://app@db.internal:5432/lab?schema=public&PASSWORD=upper&password` and
   message `The table public.todos does not exist; upper`, expected unchanged. Probe: passes on today's `logger.ts`
   and on the reference, kills the guard mutants (83.33 % → 89.58 % on `logger.ts`). Update the Files row (6 tests,
   two pinned green), the step 1 row and the counts (100 → 102 → 106; verify-red unchanged, the pin is in the base).

Notes (no change required):

1. Local `main` is stale (`6a0512a`; `origin/main` is `287c5a4`), so `git diff --stat main...HEAD` lists B1.7 and B1.8
   files. The guards and `verify-red.sh` resolve against `origin/main`; the diff review will use `origin/main...HEAD`.
2. `docs/metrics.md:21` still reads 88.60 % (after B1.7); the plan's 88.89 % base is the B1.8 review's measurement.
   The closing commit updates the row.
3. `secretsOf(): string[]` could return `readonly string[]` (`ts-style.md`: `readonly` where it never changes);
   `scrub` already takes `readonly string[]`. Optional.
4. Expected equivalent survivors after the green commit, depending on the code-writer's shape: a decode helper's catch
   body, an `at === -1` check made redundant by the name check, a `!== undefined` filter term, the outer catch's
   `return []` (pre-existing class). "Killed or listed" covers them; list them by line in the green gate.
5. Analysis note (a) (`[[redacted]acted]` for a secret inside the marker) stays cosmetic and pre-existing.

## Plan review (round 2)

SCOPE: lib

Reviewed: `backlog/work/B1.9/plan.md` at `aad318e` (`Plan approved by:` empty) against round 1 reason 1 and
`git diff 5f76a7b aad318e -- backlog/work/B1.9/plan.md` (approach paragraph, Files row, step 1 row and subject, test
counts; nothing else changed). §11 unchanged since `b53b264`; `spec/contracts/09-logging.md:7` still unticked.

Probe: fresh `git clone` of the worktree at `aad318e` under `$TMPDIR/b19-plan-r2-probe` (`node_modules` symlinked, no
hooks bypassed), plan steps 1–3 as commits with the plan's subjects; test files and reference `logger.ts` taken from
the round 1 probe, the guard added to the pin exactly as the plan words it.

- Step 1 (`test(todos): B1.9 pin empty and other query values`, (f) + guard) → `Tests 102 passed (102)`.
- Step 2 (`… (red)`) → `Tests 4 failed | 102 passed (106)`; `scripts/verify-red.sh B1.9 --range aad318e..HEAD` →
  base = pin commit, `24 ran (4 new), 4 new failed, 0 new passed  OK (red on behavior)`, `red for the right reason`.
- Step 3 (round 1 reference) → `Tests 106 passed (106)`; `tsc --noEmit` and `eslint` on both files clean;
  `check-feat-commits`, `check-ac-coverage`, `check-suppressions`, `check-spec-sections` OK on `aad318e..HEAD`.
- Guard mutants on the reference: dropping the name check (`if (at === -1)` only) → guard fails, `1 failed | 23
passed`; comparing the lower-cased name → guard fails, `1 failed | 23 passed`. Round 1 measured the same pin at
  89.58 % on `logger.ts`.

| Check                                                                             | pass / fail: reason                                                                                                                                                      |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| every file in the plan belongs to the section's features (map)                    | pass: unchanged from round 1; still only `src/lib/logger.ts` and `src/lib/logger.test.ts` (F9).                                                                          |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: interfaces block unchanged.                                                                                                                                        |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: unchanged (no `advice.md`, skip stated).                                                                                                                           |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: still 6 criteria; the guard is a REQ-11.4 test with an exact expected message, no new criterion.                                                                   |
| verification lists exact commands with expected numbers                           | pass: 100 → 102 → 106 and verify-red 4 new failed / 0 new passed, all reproduced by the probe.                                                                           |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: step 1 subject `test(todos): B1.9 pin empty and other query values` carries no `(red)`, so `verify-red.sh` keeps it in the base (probe).                           |
| the section has a `Lead approves spec` box, ticked only by a human (D-7)          | pass: line 7 unticked; not ticked by me.                                                                                                                                 |
| no settled D-n contradicted                                                       | pass: the guard pins §11 Out of scope ("any query parameter other than `password` and `sslpassword`", "a parameter name in another case") and the pair-without-`=` rule. |

Round 1 reason 1: resolved. The plan names the guard's URL, message, expected value, title (no AC prefix, REQ-11.4
suffix like the file's other REQ tests), places it in the pin commit and updates the Files row, step 1 and the counts.
The probe shows it green on today's code and the reference and red on both name-check mutants.

Verdict: approved

Notes (no change required):

1. The plan is 57 lines against `planning.md`'s ≈ 40 (53 in round 1, accepted then); the 4 added lines are the
   guard's wording. Not split-worthy: one file pair, one helper.
2. The trailer still reads `Rounds: 1`; the lead updates it with the approval line.
3. Round 1 notes 1–5 stand (stale local `main`, metrics row, optional `readonly string[]`, expected equivalent
   survivors listed by line in the green gate, cosmetic `[[redacted]acted]`).
