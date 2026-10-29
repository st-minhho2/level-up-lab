# B1.11 review

## Plan review (round 1)

SCOPE: lib

Reviewed: `backlog/work/B1.11/plan.md` at `6c2ad44` (`Plan review: · Plan approved by: · Rounds: 1`, empty) against
§11 (`spec/contracts/09-logging.md` as extended in `5c109e3`, fourth box `- [ ] Lead approves spec (lead, <date>)` at
line 8 unticked), card B1.11 (`backlog/plan/E1-todos.md:138`), D-17 and D-7 (`backlog/00-decisions.md`),
`analysis.md`, `decision-request.md`, `src/lib/logger.ts`, `src/lib/logger.test.ts`, `src/lib/env.ts`,
`scripts/verify-red.sh`, `stryker.config.mjs`, `docs/metrics.md`, and the B1.9 plan review as precedent. Run in this
worktree on 2026-10-29: `pnpm test` → `Tests 106 passed (106)`; e2e titles 3 + 3 + 4 + 1 + 2 = 13;
`check-ac-coverage`, `check-spec-sections`, `check-features-map`, `check-backlog`, `check-feat-commits`,
`check-suppressions` all OK; `origin/main..HEAD` = 3 docs commits, no `src/` change.

Probe on a `git clone` of the worktree under `$TMPDIR/b111-plan-r1-probe` (`node_modules` symlinked, tracked files
only, no hook bypassed):

- Plan step 1 (red (h)–(k), titles from the card) → `Tests 4 failed | 106 passed (110)`, each on the message
  assertion; received strings match `analysis.md` exactly (`auth pä%40ss`, `pw a b%26c`, `ssl k%2Fey`,
  `auth p@ä%41`). `scripts/verify-red.sh B1.11` → `28 ran (4 new), 4 new failed, 0 new passed  OK (red on behavior)`.
  Confirmed: no new case passes today, so the plan needs no pin for (h)–(k).
- Plan step 2, a reference reading of the Function contracts (written authority up to the first `/`, `?` or `#`, last
  `@`, first `:`; written query before the first `#`, after the first `?`; every source × as is / decoded /
  re-encoded, per-source decode guard, empty dropped, longest first) → `Tests 110 passed (110)`, `tsc --noEmit` and
  `eslint src/lib/logger.ts` clean.
- Twelve plausible wrong implementations swapped into the reference, each run against `logger.test.ts`: first-`@`
  split, no written password, no written query, written query via `URLSearchParams`, no re-encode, case-insensitive
  name → each killed by the plan's tests or B1.9's. **Survive the plan's 110 tests:** `userinfo.split(':')[1]`,
  `userinfo.lastIndexOf(':')` (reason 1), fragment kept in the written query, suffix name match (`…password=`),
  authority ending only at `/`, written query after the last `?` (reason 2, notes 2–3).
- `stryker run` on the reference with the plan's tests: all files **78.57 %** (base at `6c2ad44`: 89.47 %, confirmed
  by a run), `logger.ts` **69.32 %** (base 94.87 %), 24 survivors in `logger.ts`, among them the "none without `@`"
  and "none without `:`" guards (`if (false)`), the `#` cut (`hash === -1` → `true`) and the authority end (line-45
  class). With the three pins below: all files 82.42 %, `logger.ts` 77.27 %, 20 survivors (the remaining ones listed
  in note 3).

| Check                                                                             | pass / fail: reason                                                                                                                                                                                                                                              |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: `src/lib/logger.ts` and `src/lib/logger.test.ts` are both F9; no other `src/` file; no map change needed. Closing commit (card, §11 ✅, README row, metrics) matches `backlog/CLAUDE.md` "Closing a card".                                                 |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: `logMutationFailure(action: MutationActionName, error: unknown): void` unchanged, verbatim from §11; helpers private; no Prisma, action, schema, env key or dependency change.                                                                             |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: no `advice.md`; "advisor skipped (D-17 settled the rule)" is allowed for a quick card. Analysis Q1–Q4 followed as proposed, Q5 pipeline shape.                                                                                                             |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: 6 criteria; AC-11.3 (h)–(k) each an exact `error.message`; the reference reproduces every Then string (a)–(k).                                                                                                                                             |
| verification lists exact commands with expected numbers                           | fail: commands exact and today's numbers right (106 → 110, verify-red 4/0, e2e 13, base 89.47 %), but "new `secretsOf` mutants Killed" is not reachable on the planned tests (probe: 24 survivors, 69.32 % on `logger.ts`). Numbers change with reasons 1 and 2. |
| work breakdown has skeleton → red → green → map → review with convention subjects | fail (with reason 2 only): no skeleton (no new export) and no map step (F9 names both files) are justified; reason 2 needs a green pin step before `(red)`, as in B1.8 and B1.9.                                                                                 |
| the section has a `Lead approves spec` box, ticked only by a human (D-7)          | pass: `spec/contracts/09-logging.md:8` unticked; the plan says the gate's approve ticks it (D-7). Not ticked by me.                                                                                                                                              |
| no settled D-n contradicted                                                       | pass: D-17 option A as written (written and parsed sources, four forms each, D-15's rules kept); D-15, D-12, D-14 untouched.                                                                                                                                     |

Verdict: changes requested

Reasons:

1. **The "after its first `:`" rule has no test, and the plausible wrong reading leaks part of the password.**
   §11 Function contracts: the written password is the userinfo "after its first `:`". No AC-11.3 case has a `:` in
   the password, so `const [, password] = userinfo.split(':')` or `userinfo.slice(userinfo.lastIndexOf(':') + 1)`
   passes all 110 planned tests (probe). TRIGGER: `DATABASE_URL` `postgresql://app:p@ä:%41@db.internal:5432/lab`
   (§4 accepts it: `z.string().url()` probe `true`; the parser gives `p%40%C3%A4%3A%41`) and an `Error` whose message
   is `auth p@ä:%41`. WRONG BEHAVIOUR: with `split(':')[1]` the written secret is `p@ä`, the message is logged as
   `auth [redacted]:%41`; with `lastIndexOf` it is `auth p:[redacted]`; §11 requires `auth [redacted]`. None of the
   parsed forms (`p%40%C3%A4%3A%41`, `p@ä:A`, `p%40%C3%A4%3AA`) matches the written text. CONFIDENCE: confirmed
   (probe). Fix in the plan, either (a) one more test in the red commit, titled like the file's other REQ-11.4 tests,
   e.g. `redacts the written password after the first colon of the userinfo (REQ-11.4)` with that URL and message,
   expected `auth [redacted]`: red today (probe: `auth p@ä:%41`), green on the reference, kills both variants and the
   first-`@` one; or (b) a `docs(spec)` commit within D-17 changing (k)'s URL to `postgresql://app:p@ä:%41@…` and its
   message to `auth p@ä:%41`, so one case pins both splits. (a) needs no spec change and follows B1.9's precedent.

2. **The "none" rules and the fragment cut have no test, so implementations that turn non-secrets into secrets go
   green.** §11 Function contracts: no written password "without an `@`" or "without a `:`"; the written query is
   "value up to its first `#`"; a pair's name is "exactly" `password` or `sslpassword`. TRIGGER: this repo's ordinary
   password-less shape `postgresql://app@db.internal:5432/lab` with `userinfo.slice(userinfo.indexOf(':') + 1)` (no
   guard) → the user name `app` becomes a secret and every `app` in a message or stack (a container path such as
   `/app/.next/server/…`) is `[redacted]`; `postgresql://db.internal:5432/lab` with an unguarded
   `authority.slice(0, authority.lastIndexOf('@'))` → secret `543`, so `5432` is logged as `[redacted]2`;
   `…/lab?sslmode=require#&password=frag` with `value.slice(value.indexOf('?') + 1)` (no `#` cut) → `frag` is
   redacted; `?mypassword=suffix` with an unanchored name match → `suffix` is redacted. WRONG BEHAVIOUR: text that is
   no secret under §11 is replaced, and the probe's reference loses 11 points of mutation score (89.47 % → 78.57 %;
   `logger.ts` 94.87 % → 69.32 %) with these guards among the survivors. CONFIDENCE: confirmed (probe: each variant
   passes the plan's 110 tests). Fix in the plan: a step before `(red)`, `test(todos): B1.11 pin user name, fragment
and no userinfo`, with two tests green today (probe): `DATABASE_URL`
   `postgresql://app@db.internal:5432/lab?mypassword=suffix&sslmode=require#&password=frag`, message
   `user app, suffix, frag`, expected unchanged; and `postgresql://db.internal:5432/lab`, message `port 5432`,
   expected unchanged (both URLs pass §4, probe). They kill the four variants above.

Counts with both fixes, probed in sequence (pin → red → reference): `Tests 108 passed (108)` → `5 failed | 108 passed
(113)`, `verify-red.sh B1.11` base = pin commit, `31 ran (5 new), 5 new failed, 0 new passed  OK (red on behavior)` →
`Tests 113 passed (113)`. Update the Files row (7 tests: 2 pinned green, 5 red), the work breakdown (pin step) and the
verification block (106 → 108 → 113; verify-red 5/0), and replace "new `secretsOf` mutants Killed" with "≥ 70;
`logger.ts` survivors listed by line, each named equivalent or accepted (note 3)".

Notes (no change required):

1. The written password's decoded and re-encoded forms, and the written query values' decoded and re-encoded forms,
   always equal a parsed form for a value §4 accepts (the parser only adds escapes, so both decode alike); no test
   can tell them apart and their mutants are equivalent. The spec lists them for uniformity under D-17; fine.
2. Still unpinned after the fixes, over-redaction only and implausible: the authority ending at `?` or `#` (matters
   only for a URL with no path and an `@` after `?`/`#`) and the first `?` (a `?` inside a written-unique query
   value). Expected among the listed survivors.
3. Remaining survivors on the probe's reference with the pins (20, shape-dependent): the `at === -1` guard
   (redundant with the exact-name check), injected-array mutants that add a secret no message contains, a redundant
   empty-query guard, `url.search` without `.slice(1)` (the written query covers the first pair), the line-45
   authority-end class, the outer catch's `return []` (pre-existing). The code-writer's shape decides the count.
4. Analysis note (c), `?password=k#ey` giving the secret `k`, is pre-existing and unchanged by this card.

## Plan review (round 2)

SCOPE: lib

Reviewed: `backlog/work/B1.11/plan.md` at `a7ef913` (`Plan approved by:` empty) against round 1's two reasons.
`git diff 6c2ad44 a7ef913` touches only `plan.md` and `review.md`; no `src/`, `spec/`, `prisma/` or `e2e/` change,
so round 1's passing checks stand. §11's `Lead approves spec` box (`spec/contracts/09-logging.md:8`) still unticked.
Re-run on 2026-10-29 on a fresh clone of the round-1 probe (`$TMPDIR/b111-plan-r2-probe`, its commits are the plan's
steps 1–2 with the plan's exact URLs, messages and fifth title): pin commit → `Tests 108 passed (108)`; red commit →
`Tests 5 failed | 108 passed (113)`, the five being (h)–(k) and the first-`:` test; round-1 probe with the reference
`logger.ts` → `Tests 113 passed (113)`. `verify-red.sh` matches only `(red)` subjects, so its base is the pin commit,
as the plan states.

| Check                                                                             | pass / fail: reason                                                                                                                                                                                                           |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: unchanged, `logger.ts` and `logger.test.ts` (F9) only.                                                                                                                                                                  |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: unchanged.                                                                                                                                                                                                              |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: unchanged; the approach paragraph now states round 1's additions.                                                                                                                                                       |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: still 6 criteria; the fifth red test and both pins state exact message → exact expected text.                                                                                                                           |
| verification lists exact commands with expected numbers                           | pass (reason 1 of round 1 resolved): verify-red 5 new failed / 0 passed; 106 → 108 → 113 (probe matches); e2e 13; mutation "≥ 70 (base 89.47 %), `logger.ts` survivors listed by line" replaces the unreachable "all Killed". |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass (reason 2 resolved): pin step before `(red)`, subject `test(todos): B1.11 pin user name, fragment and no userinfo` (no `(red)`, as B1.7's hardening commit); no skeleton, no map step, both justified.                   |
| the section has a `Lead approves spec` box, ticked only by a human (D-7)          | pass: unticked; not ticked by me.                                                                                                                                                                                             |
| no settled D-n contradicted                                                       | pass: unchanged; D-17 option A as written.                                                                                                                                                                                    |

Round 1 reasons:

1. First-`:` split: resolved as written, option (a). Fifth test in the red commit, URL
   `postgresql://app:p@ä:%41@db.internal:5432/lab`, message `auth p@ä:%41` → `auth [redacted]`, title verbatim; red
   today (probe), green on the reference.
2. "None" rules, fragment cut, exact name: resolved as written. Both pins with the round-1 URLs and messages, landed
   green before `(red)`; counts and verification updated; test-writer brief override states it commits them without
   `(red)` and skips verify-red.

Notes (no change required): the plan is 62 lines, over `planning.md`'s ≈ 40, the excess being the pin/fifth-test
inputs a test-writer needs verbatim; the scope is still one function in one file. The footer still reads `Rounds: 1`;
the lead updates it at the gate.

Verdict: approved (ready for the lead's gate, not approved for build)

## Diff review (round 1)

SCOPE: lib

Reviewed `git diff origin/main...HEAD` at `4dfccfa` (pin `dc3ba53`, red `58fe164`, feat `4dfccfa`) against §11
(`spec/contracts/09-logging.md`, REQ-11.4 and the Function contracts) and `plan.md` (approved, 2026-10-29). Probes ran
on a clone at `$TMPDIR/b111-diff-r1-probe` (no `.env*` copied), with a throwaway `src/lib/probe.test.ts` there only.

### Commands (run by me, 2026-10-29, last line each)

| Command                              | Result                                                                                                                                                                                               |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                          | `All matched files use Prettier code style!` (exit 0)                                                                                                                                                |
| `pnpm typecheck`                     | `tsc --noEmit`, no output (exit 0)                                                                                                                                                                   |
| `pnpm test`                          | `Tests  113 passed (113)`                                                                                                                                                                            |
| `pnpm test:e2e`                      | `13 passed (11.9s)`                                                                                                                                                                                  |
| `pnpm test:mutation`                 | not re-run; relied on code-writer's `reports/mutation/mutation.json` (23:33, its embedded `logger.ts` source is byte-identical to `4dfccfa`): 88.41 % overall (145/164), `logger.ts` 90.00 % (63/70) |
| `scripts/ci/check-suppressions.sh`   | `OK: no new suppressions`                                                                                                                                                                            |
| `scripts/ci/check-config-change.sh`  | `OK: no protected config changed`                                                                                                                                                                    |
| `scripts/ci/check-feat-commits.sh`   | `OK: no feat commit touches tests`                                                                                                                                                                   |
| `scripts/ci/check-ac-coverage.sh`    | `OK: every criterion of a shipped section has a test` (§11 criteria=6 covered=6)                                                                                                                     |
| `scripts/ci/check-spec-sections.sh`  | `OK: sections cited: 1 2 3 4 5 6 7 8 9 10 11`                                                                                                                                                        |
| `scripts/ci/check-features-map.sh`   | `OK`                                                                                                                                                                                                 |
| `scripts/verify-red.sh B1.11`        | `31 ran (5 new), 5 new failed, 0 new passed  OK (red on behavior)`, `RESULT: red for the right reason`                                                                                               |
| `git diff --stat origin/main...HEAD` | 10 files; `src/` only `src/lib/logger.ts` (+40/−17) and `src/lib/logger.test.ts` (+65/−0)                                                                                                            |

### Checklist

| Check                                                       | Result                                                                                                                                                                       |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every AC-§.n has a test whose assertion matches its Then    | pass: AC-11.3 (h)–(k) each assert the exact `error.message` the Then names; (a)–(g) unchanged.                                                                               |
| no test weakened after the red commit                       | pass: `git diff 58fe164..HEAD -- '*.test.*' e2e/` is empty; pin and red commits only add `it(...)` blocks.                                                                   |
| every changed file is in `plan.md`                          | pass: `logger.ts`, `logger.test.ts`; other paths are the spec/backlog commits before the gate.                                                                               |
| interfaces match the section's contracts                    | pass: `logMutationFailure` signature unchanged; helpers private; constants and order as written (see Q2 below).                                                              |
| Zod at every action boundary / Prisma only in lib / no SQL  | n/a, no action or Prisma change.                                                                                                                                             |
| migration reversible and indexed                            | n/a.                                                                                                                                                                         |
| no secret, no suppression                                   | pass (guards above; test URLs are fixtures).                                                                                                                                 |
| features map row moved                                      | n/a by plan (F9 already names both files); closing commit pending.                                                                                                           |
| would a test fail if one changed line were reverted (probe) | **fail for two lines**: deleting `url.password,` (logger.ts:73) or `...queryPasswordsOf(url.search.slice(1)),` (logger.ts:75) leaves all 31 logger tests green; finding [1]. |

### Findings

```
[1] KIND: coverage
    WHERE: src/lib/logger.ts:73 and src/lib/logger.ts:75 (tests: src/lib/logger.test.ts)
    DEFECT: since the written sources now cover every existing test case, nothing pins REQ-11.4's "as the URL parser
            returns it" forms; deleting either parser source, or Stryker's 75:27 (`url.search.slice(1)` → `url.search`),
            leaves all 113 tests green while a §4-accepted URL leaks.
    TRIGGER: (a) DATABASE_URL `postgresql://app@db.internal:5432/lab?password=a b/c` (parseEnv accepts; url.search is
             `?password=a%20b/c`), message `pw a%20b/c`; (b) DATABASE_URL `postgresql://app:p$s s@db.internal:5432/lab`
             (parseEnv accepts; url.password is `p$s%20s`), message `auth p$s%20s`.
    WRONG BEHAVIOUR: on 4dfccfa both log `pw [redacted]` / `auth [redacted]` (correct). With mutant 75:27 or line 75
             deleted, (a) logs `pw a%20b/c`; with line 73 deleted, (b) logs `auth p$s%20s`; in all three the suite
             stays `31 passed` in logger.test.ts (probe). §11 requires both parser forms redacted. Neither form is
             reachable from the written source: the parser leaves `/` and `$` unescaped where encodeURIComponent
             escapes them, and escapes the space the written form keeps.
    CONFIDENCE: confirmed (probed reference, 75:27, line-75 deletion, line-73 deletion)
```

Fix (test-writer, no code change, green on arrival): two tests in `src/lib/logger.test.ts`, one commit
`test(todos): B1.11 review pass 1 -- pin the parser's own password forms`, titled like the file's REQ-11.4 tests:
`redacts the parser's escaped form of the first password query value (REQ-11.4)` with trigger (a) → `pw [redacted]`,
and `redacts the parser's escaped form of the userinfo password (REQ-11.4)` with trigger (b) → `auth [redacted]`.
Expected: `Tests 115 passed (115)`; on re-run Stryker kills 75:27 (`logger.ts` 64/70). Test count 113 → 115 differs
from the plan's verification line; Files list unchanged, so the lead only notes the count.

### Answers to dev-lead's three questions

1. **75:27 is a real leak path for a regression, not for the shipped code.** `4dfccfa` redacts trigger (a); the
   mutant does not, and no test notices. It needs a first-pair value with both a character the parser escapes (space,
   `"`, `<`, `>`) and one it keeps that encodeURIComponent escapes (`/`, `:`, `@`, `$`, `&`, `+`, `,`, `;`, `=`, `?`);
   test (i) `a b%26c` has only the first kind, so its re-encoded form equals the parser's and masks the mutant. Same
   gap for line 73 (trigger (b)), which Stryker cannot show (no mutator deletes a spread element). Finding [1].
2. **Both choices match the Function contracts.**
   - No `://` → no written password: the contract defines the written password as text "after the first `://`"; with
     none there is no authority, and the code yields `[]` like its own "none without an `@`/`:`" rules. Unreachable
     through `getEnv()` anyway: §4's refine requires a `postgresql://` or `postgres://` prefix, so 40:59 (NoCoverage)
     is equivalent.
   - Re-encode inside the decode guard: the contract says only what happens when decodeURIComponent throws; it is
     silent on encodeURIComponent throwing. That throws only on a lone surrogate (probe: written password
     `p\uD800%41` decodes to `p\uD800A`, encode throws URIError; `new URL` and Zod `.url()` accept the value). The
     code then keeps only the written form and drops `p\uD800A`; a literal reading would throw into `secretsOf`'s
     catch and redact nothing, so the choice is the safer one. A lone surrogate cannot reach `process.env` (the OS
     string is UTF-8 decoded with U+FFFD), so no finding; recorded as a spec gap for `/spec-trace`, not a code change.
3. **The drop (89.47 → 88.41 %) hides one secret-forming survivor, 75:27**, plus two secret-forming lines Stryker
   cannot mutate away (73, 75 deletions), all three covered by finding [1]. The other six `logger.ts` survivors are
   not secret-forming: 40:59 unreachable (above); 44:38, 62:28, 80:12 add a `"Stryker was here"` secret no message
   contains (80:12 is the pre-existing outer catch); 62:10 and 62:23 (`question === -1` → `false` / `+1`) only make
   a `?`-less value's `&`-pieces candidates, i.e. over-redaction, never under.

### Notes (no change required)

- Contract line by line: authority regex `:\/\/([^/?#]*)` = first `://` up to the first `/`, `?`, `#`;
  `lastIndexOf('@')`, `indexOf(':')`; written query = up to first `#`, after first `?`; `startsWith('<name>=')` is the
  same set as "name before the first `=` is exactly …"; empty dropped; longest first; `new URL` throwing → `[]`.
- Pre-existing, unchanged by this card: a short secret that occurs inside `[redacted]` (e.g. a password `e`) rewrites
  the marker; over-redaction only.

Verdict: back to test-writer (finding [1]: two pins, no code change; then a round-2 diff review)

Riskiest unfalsified: a parser normalization no source covers — none found (tab stripping, `@`/`:` splits, escape
sets probed); the lone-surrogate encode gap is unspecified but unreachable through `process.env`.

### Dispositions (dev-lead, pass 1 of 3)

| Pass | #   | Finding (file:line)                                                                                  | Source                          | Kind     | Disposition      | Justification                                                                                                                                                                                         |
| ---- | --- | ---------------------------------------------------------------------------------------------------- | ------------------------------- | -------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | 1   | `logger.ts:73` (`url.password`) and `:75` (parsed query, Stryker 75:27) no longer pinned by any test | reviewer                        | coverage | fix now          | `50935fb` (2 hardening tests, green on arrival); `pnpm test` 115 passed; Stryker re-run: 75:27 Killed, overall 89.02 %, `logger.ts` 91.43 % (64/70); the fix touches tests only, so no re-review pass |
| 1    | —   | no `://` → no written password; re-encode inside the decode guard                                    | code-writer / dev-lead (unsure) | spec     | no change needed | reviewer: both match the Function contracts; a value without `://` fails §4; a lone surrogate (encode throws) cannot reach `process.env`                                                              |
| 1    | —   | survivors 40:59, 44:38, 62:10, 62:23, 62:28, 80:12                                                   | code-writer                     | coverage | no change needed | none forms a secret: 40:59 unreachable (§4), 44:38/62:28/80:12 inject a secret no message contains, 62:10/62:23 over-redaction only (plan review round 1 notes 2–3)                                   |
