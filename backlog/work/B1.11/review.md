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
