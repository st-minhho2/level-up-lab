# B1.8 review

## Plan review (round 1)

SCOPE: lib

Reviewed: `backlog/work/B1.8/plan.md` at `12c7e7f` (`Plan review: · Plan approved by: · Rounds: 1`, empty) against §11
(`spec/contracts/09-logging.md` as extended in `c54edb6`, second `- [ ] Lead approves spec (lead, <date>)` box
unticked), card B1.8 (`backlog/plan/E1-*.md`), D-14 and D-7 (`backlog/00-decisions.md`), `analysis.md`,
`decision-request.md`, `src/lib/logger.ts`, `src/lib/logger.test.ts`, `scripts/verify-red.sh`,
`scripts/ci/check-feat-commits.sh`, `backlog/CLAUDE.md` (commit order), `.claude/skills/review-loop/SKILL.md`,
`docs/mistake-log.md`, `docs/metrics.md`, and the B1.5 / B1.6 plans as precedent. Run in this worktree on 2026-10-29:
`pnpm test` → `Tests 94 passed (94)`; `check-spec-sections.sh`, `check-ac-coverage.sh`, `check-features-map.sh`,
`check-backlog.sh`, `check-feat-commits.sh`, `check-suppressions.sh` all OK; `git log main..HEAD` = 5 docs commits, no
`src/` change. Probes on a `git archive HEAD` copy under `$TMPDIR` (`node_modules` symlinked, only `.env.example`
present, never the tree).

| Check                                                                             | pass / fail: reason                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: `src/lib/logger.ts` and `src/lib/logger.test.ts` are both named by F9 (`spec/features-map.md:17`, ✅); no other `src/` file; no map change needed. Closing commit (card, §11 ✅ in the index, README row, metrics row) matches `backlog/CLAUDE.md` "Closing a card".                                                                                                                                                                                          |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: `logMutationFailure(action: MutationActionName, error: unknown): void` unchanged and verbatim from §11 Function contracts; internal `LoggedError` keeps `code?: string`; no Prisma import (tests use plain `Error` + `Object.assign`, analysis Q2); no action, schema, env or dependency change. Probe: an `errorCode` read via `error as Error & { readonly code?: unknown; readonly errorCode?: unknown }` typechecks under vitest without `as unknown as`. |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: no `advice.md`; the plan states "Advisor skipped (quick, D-14 settled the only choice)", allowed for a quick card (`backlog/CLAUDE.md`). Follows analysis Q1 (keep (d)–(g)), Q2 (plain `Error`), Q3 (no skeleton; B1.5 precedent), Q4 (box ticked by the gate).                                                                                                                                                                                               |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: §11 stays at 6 criteria; AC-11.2 (d) exact key order and `P1001`, (e) `P2002`, (f) `P1001`, (g) no `code` key, (d)–(g) no `errorCode` key; no banned adjective in the added text.                                                                                                                                                                                                                                                                             |
| verification lists exact commands with expected numbers                           | pass: `verify-red.sh B1.8` → 2 new failed, 0 new passed (probe: (d), (f) fail, (e), (g) pass on today's code, `Tests 2 failed \| 16 passed (18)`); `pnpm test` 94 → 98 (94 confirmed); e2e 12 (3 + 3 + 2 + 4 across the four spec files); mutation ≥ 70 from 85.09 (`docs/metrics.md:21`), logger ≥ 95 (B1.6 precedent); four guards named.                                                                                                                         |
| work breakdown has skeleton → red → green → map → review with convention subjects | **fail**: no skeleton (justified: no new export) and no map step (justified: F9 already names both files) are fine; but step 3 lands two AC-11.2 cases **after** the `feat` commit, outside the green gate, under a subject that is neither `… (red)` nor `review pass N -- …` (reason 1). The plan-review step row of B1.5 / B1.6 is missing (cosmetic, note 2).                                                                                                   |
| the section has a `Lead approves spec` box, ticked only by a human (D-7)          | pass: `spec/contracts/09-logging.md:6` `- [ ] Lead approves spec (lead, <date>)` unticked; the plan says the gate's approve ticks it (D-7). Not ticked by me.                                                                                                                                                                                                                                                                                                       |
| no settled D-n contradicted                                                       | pass: D-14 option A literally (string `code`, else string `errorCode`, else absent; no other property; no separate key; 6 criteria); D-12 (stderr, no `console`, caps, redaction) and D-11 untouched; D-7 box and approval line present.                                                                                                                                                                                                                            |

Verdict: changes requested

Reasons:

1. **Cases (e) and (g) land after the green commit, so the green gate cannot catch the wrong implementation they
   exist to catch.** Confirmed by probe: on the copy, `describeError` changed to
   `typeof code === 'string' ? { code } : errorCode !== undefined ? { code: errorCode } : {}` (the `typeof` on
   `errorCode` dropped, a spec violation of REQ-11.3 and AC-11.2 (g)) passes (d), (e), (f) and all 14 existing logger
   tests; only (g) fails (`Tests 1 failed | 17 passed (18)`). Under the plan, step 2's green gate runs with (d), (f)
   only, so that `feat` commit goes green, and the defect surfaces at step 3 as a test that is red on arrival, which
   the plan does not route (it says "green on arrival"). It also breaks the stated order: invariant 2 and
   `backlog/CLAUDE.md` put `test(...)` before `feat(...)`, and the only post-`feat` test commits the conventions
   allow are `test(<pkg>): <card> review pass N -- …` inside `/review-loop`; `test(todos): B1.8 pin code precedence and
errorCode type` is neither. Fix: land (e) and (g) **before** the red commit, as a green characterization commit
   without the `(red)` marker (e.g. `test(todos): B1.8 pin code precedence and errorCode type`), the way
   `docs/mistake-log.md` (2026-10-28) moved an already-green test ahead of the red commit. `verify-red.sh` takes the
   parent of the first `(red)` commit as its base, so (e) and (g) count as pre-existing there and may pass; (d) and (f)
   stay the only new tests (2 new failed, 0 new passed). The `pnpm test` count after step 1 becomes 96, after green 98;
   state both. The code-writer then sees all four cases from the start of its step.

Notes (not blocking):

1. Test titles: `verify-red.sh` treats a test as old when its title **starts with** an existing title in the base
   file. The new titles must not begin with `AC-11.2: records a string code as error.code, between message and stack`
   or `AC-11.2: records no code key when the code is a number`; a (g) title such as
   `AC-11.2: records no code key when the code is a number …` would hide from the red check. The card's (d) title
   (`AC-11.2: records a string errorCode as error.code when the Error has no string code`) is safe.
2. Add the plan-review row to the work breakdown (`docs(backlog): B1.8 plan review`) as B1.5 / B1.6 did, so the PR
   body's Plan section lists every commit on the branch.
3. Each of (d)–(g) should assert the absence of an `errorCode` key, as AC-11.2's last clause says ("in (d) to (g)
   `error` has no `errorCode` key"); with plain `Object.assign` errors that is a real property of the input, so a
   spread of the error would expose it.

## Plan review (round 2)

SCOPE: lib

Reviewed: `backlog/work/B1.8/plan.md` at `25eeaab` (revised after round 1; `Plan approved by:` empty) against the
same sources as round 1, plus `scripts/verify-red.sh` (base selection, "new test" match), `.claude/agents/test-writer.md`,
`.claude/skills/tdd-loop/SKILL.md`, `backlog/CLAUDE.md` (commit order), `lefthook.yml` (commit-msg),
`.github/workflows/ci.yml` (`verify-red.sh --auto`) and `docs/mistake-log.md:17`. Guards in this worktree on
2026-10-29: `check-spec-sections`, `check-ac-coverage`, `check-features-map`, `check-backlog`, `check-feat-commits`,
`check-suppressions` all OK; `git diff main...HEAD` touches no `src/`. Probe on a `git clone` of the worktree under
`$TMPDIR/b18-plan-r2-probe` (`node_modules` symlinked, only `.env.example` present, no hooks bypassed): built the
plan's step 1 (pin: (e), (g) and the `errorCodedError` helper) and step 2 (red: (d), (f)) as two commits with the
plan's subjects, then:

- `pnpm test` after the pin commit → `Tests 96 passed (96)`; after the red commit → `Tests 2 failed | 96 passed (98)`.
- `scripts/verify-red.sh B1.8` (default range, explicit `--range 25eeaab..HEAD`, and `--auto` as CI runs it) → base
  is the pin commit, `src/lib/logger.test.ts: 18 ran (2 new), 2 new failed, 0 new passed  OK (red on behavior)`,
  exit 0.
- Green-gate strength, `logger.ts` variants on the copy with all four cases present: D-14 as written → `18 passed`;
  `typeof` on `errorCode` dropped (round 1's escape) → (g) fails, `1 failed | 17 passed`; `errorCode` ahead of
  `code` → (e) fails; an extra `errorCode` key written → (d), (f) fail. Each wrong variant is now stopped at step 3.
- `pnpm typecheck` with the helper `errorCodedError(message, errorCode, code?)` → clean.

| Check                                                                             | pass / fail: reason                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: unchanged from round 1; `src/lib/logger.ts`, `src/lib/logger.test.ts`, both F9; closing commit per `backlog/CLAUDE.md` "Closing a card".                                                                                                                                                                                                                                                                                                                              |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: `logMutationFailure(action: MutationActionName, error: unknown): void` unchanged; `LoggedError.code?: string` unchanged; no Prisma import, no action/env/dependency change (probe typechecks).                                                                                                                                                                                                                                                                        |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: no `advice.md`; "Advisor skipped (quick, D-14 settled the only choice)" stated; analysis Q1–Q4 followed.                                                                                                                                                                                                                                                                                                                                                              |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: §11 at 6 criteria; AC-11.2 (d)–(g) exact values and key order.                                                                                                                                                                                                                                                                                                                                                                                                        |
| verification lists exact commands with expected numbers                           | pass: `verify-red.sh B1.8` 2 new failed / 0 new passed (confirmed); `pnpm test` 94 → 96 → 98 (96 and 98 confirmed by probe); e2e 12 unchanged and mutation ≥ 70 / logger ≥ 95 carried from round 1 [not re-run: plan stage].                                                                                                                                                                                                                                                |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: round 1 reason 1 resolved: (e), (g) land before the red commit, so the green gate sees all four (probe above); plan-review row added (round 1 note 2). Skeleton and map steps omitted with reasons (no new export; F9 already names both files). The pin subject is not in `backlog/CLAUDE.md`'s commit order; the plan states the deviation and its reason, `lefthook.yml` commit-msg accepts it, and `verify-red.sh --auto` ignores it (no `(red)`). See notes 1–2. |
| the section has a `Lead approves spec` box, ticked only by a human (D-7)          | pass: `spec/contracts/09-logging.md:6` `- [ ] Lead approves spec (lead, <date>)` unticked; plan says the gate's approve ticks it. Not ticked by me.                                                                                                                                                                                                                                                                                                                         |
| no settled D-n contradicted                                                       | pass: D-14 (string `code`, else string `errorCode`, else absent; no other property read; no separate key) as written; D-12, D-11, D-7 untouched; no D-n newer than D-14.                                                                                                                                                                                                                                                                                                    |

Verdict: approved (ready for the lead's gate, not approved for build)

Notes (not blocking; costs the lead should see):

1. **Step 1 asks `test-writer` to work against its own procedure; name it in "Brief overrides".** `test-writer.md`
   steps 2–4 expect every new test to fail and the commit subject to end in `(red)`. If the test-writer follows its
   default and marks the pin commit `(red)`, `verify-red.sh` takes the parent of that first `(red)` commit as base,
   (e) and (g) become "new" and pass, and the red gate fails with "GREEN before implementation" (traced from
   `scripts/verify-red.sh` lines 63–74 and the `isNew` filter). The gate catches it, so no defect ships, but the cost
   is a redo of steps 1–2. One line in "Brief overrides" ("step 1: test-writer commits (e), (g) green, without
   `(red)`, does not run verify-red") removes it.
2. The cited precedent (`docs/mistake-log.md:17`) moved an already-green test into the **skeleton** commit, not
   into a separate `test(...)` commit; it supports "green before the red commit", not the subject. The plan's stated
   deviation is enough; the PR body (which copies `plan.md`) carries it.
3. Red gate base: `/tdd-loop` step 2 checks `git diff --stat <skeleton>..HEAD`; with no skeleton, the dev-lead should
   use the parent of the pin commit (the plan-approval commit) so the diff names only `src/lib/logger.test.ts`.
4. Round 1 note 3 still applies at the test-writer's step: (d)–(g) each assert no `errorCode` key (AC-11.2's last
   clause); the plan's Files row says "4 `AC-11.2:` tests" without naming it. The probe's (d) title
   `AC-11.2: records a string errorCode as error.code when the Error has no string code` and (g) title
   `AC-11.2: records no code key when the errorCode is a number and there is no code` pass verify-red's prefix
   match (round 1 note 1); a (g) title beginning with `AC-11.2: records no code key when the code is a number` would not.
5. The plan is 52 lines against the ≈ 40-line one-screen guide (`rules/planning.md`); the overage is the wide
   tables, not scope. The footer still reads `Rounds: 1`; the dev-lead updates it to 2.

## Diff review (round 1)

SCOPE: lib. Commits: pin `098e5e2` (test file only, +26), red `18c1a2c` (test file only, +21), feat `e2cb5b0`
(`src/lib/logger.ts` only, +4/−1). Compared with `git diff origin/main...HEAD` (local `main` is stale: `main...HEAD`
reports 21 files, `origin/main...HEAD` 11, of which `src/` = `logger.ts`, `logger.test.ts`).

### Command results (run by the reviewer unless marked)

| Command                                     | Last line                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                                 | `All matched files use Prettier code style!` (exit 0)                                                                                                                                                                                                                                                                           |
| `pnpm typecheck`                            | `tsc --noEmit` (exit 0, no output)                                                                                                                                                                                                                                                                                              |
| `pnpm test`                                 | `Tests  100 passed (100)` (12 files)                                                                                                                                                                                                                                                                                            |
| `pnpm test:e2e`                             | `12 passed (11.4s)`                                                                                                                                                                                                                                                                                                             |
| `pnpm test:mutation`                        | not re-run; relied on dev-lead's `reports/mutation/mutation.json` (mtime 15:28:48, feat commit 15:28:56; its logger.ts:47 mutants carry `ownCode`, so it measured the feat code): 104 killed / 12 survived / 1 NoCoverage / 116 CompileError = 88.89 %; logger.ts 22 killed / 1 survived (:27 `secretsOf` filter, pre-existing) |
| `scripts/ci/check-suppressions.sh`          | `OK: no new suppressions`                                                                                                                                                                                                                                                                                                       |
| `scripts/ci/check-config-change.sh`         | `OK: no protected config changed`                                                                                                                                                                                                                                                                                               |
| `scripts/ci/check-feat-commits.sh`          | `OK: no feat commit touches tests`                                                                                                                                                                                                                                                                                              |
| `scripts/ci/check-ac-coverage.sh`           | `OK: every criterion of a shipped section has a test`                                                                                                                                                                                                                                                                           |
| `scripts/ci/check-spec-sections.sh`         | `OK: sections cited: 1 2 3 4 5 6 7 8 9 10 11`                                                                                                                                                                                                                                                                                   |
| `scripts/ci/check-features-map.sh`          | `OK`                                                                                                                                                                                                                                                                                                                            |
| `scripts/verify-red.sh B1.8`                | `RESULT: red for the right reason` (18 ran, 2 new, 2 new failed, 0 new passed; base `098e5e2`)                                                                                                                                                                                                                                  |
| `git diff 18c1a2c..HEAD -- '*.test.*' e2e/` | empty (0 lines)                                                                                                                                                                                                                                                                                                                 |

### Checklist

| Check                                                          | Result                                                                                                                                                                                 |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every AC-11.2 case has a test whose assertion matches its Then | pass: (d) keys `name, message, code, stack` + `code` `P1001`; (e) `code` `P2002`; (f) `code` `P1001`; (g) no `code` key; each of (d)–(g) asserts no `errorCode` key. (a)–(c) unchanged |
| no test weakened after the red commit                          | pass: `git diff 18c1a2c..HEAD -- '*.test.*' e2e/` empty; pin commit only adds                                                                                                          |
| every changed file is in `plan.md`                             | pass: `src/lib/logger.ts`, `src/lib/logger.test.ts`; helper `errorCodedError(message, errorCode, code?)` as planned; titles of (d)/(g) as plan review round 2 note 4 named             |
| interfaces match §11's contracts                               | pass: `logMutationFailure` signature unchanged; `LoggedError.code?: string` unchanged; no `errorCode` key written; precedence string `code` → string `errorCode` → none                |
| Zod at action boundary / Prisma only in lib / no raw SQL       | n/a: no action, no Prisma import in the logger (unchanged)                                                                                                                             |
| migration                                                      | n/a                                                                                                                                                                                    |
| no secret, no suppression                                      | pass (guards above)                                                                                                                                                                    |
| features map row moved                                         | n/a by plan (F9 already names both files; status moves in the closing commit)                                                                                                          |
| would a test fail if the changed line were reverted?           | yes: reverting the feat is exactly the red commit's state; verify-red shows (d) and (f) fail on assertions                                                                             |

### Answers to the dev-lead's two questions

1. **Ternary pinned?** Yes. Stryker on logger.ts:47 (`typeof ownCode === 'string' ? ownCode : errorCode`):
   `ConditionalExpression true` Killed (by (d): `errorCode`-only would log no code), `false` Killed (by (a) and (e):
   `code` `P1001`/`P2002` would be lost or replaced), `EqualityOperator !==` Killed, `StringLiteral ""` CompileError.
   The spread at :51 (`typeof code === 'string'`): `true`/`false`/`!==`/`""` are all CompileError, because `code` is
   `unknown` and cannot be spread into `code?: string`; typecheck is a gate, and at runtime (b) and (g) would also
   kill `true`. The `{}` object-literal mutant at :51 is Killed.
2. **Throwing `errorCode` getter vs REQ-11.6.** REQ-11.6 holds: probe (below) returns `undefined` and does not throw.
   But the entry is lost, see [1].

### Probes (copy under the session scratchpad, `.env*` excluded, `src/lib/probe.test.ts`)

- Error with `code` `'P2002'` (own, non-enumerable) and an `errorCode` getter that throws → returns `undefined`,
  stderr receives **0** chunks.
- `new Prisma.PrismaClientInitializationError("Can't reach database server", '6.0.0', 'P1001')` from the installed
  `@prisma/client` → entry `error.code` `P1001`, keys `name, message, code, stack`: the change does what the card is for.
- Error with `errorCode` `'s3cret'` (the URL's password) → written as `"code":"s3cret"`, unredacted. Consistent with
  REQ-11.4 (redaction covers `message` and `stack` only) and identical to a string `code` before this card; not a finding.

### Findings

```
[1] KIND: correctness
    WHERE: src/lib/logger.ts:46
    DEFECT: the destructuring reads `error.errorCode` eagerly, even when `error.code` is a string, so a throwing
            `errorCode` accessor now drops the whole entry where the code before this card logged it.
    TRIGGER: an Error with own `code` 'P2002' and `Object.defineProperty(e, 'errorCode', { get() { throw … } })`
             passed to logMutationFailure('toggleTodoAction', e).
    WRONG BEHAVIOUR: 0 chunks on stderr; REQ-11.1 asks for exactly one entry, and §11's contract reads errorCode
                     only "otherwise" (when `code` is not a string). No throw, so REQ-11.6 holds.
    CONFIDENCE: confirmed (probe)
```

Non-blocking. The trigger is a hostile accessor: Prisma 6's `PrismaClientInitializationError` sets `errorCode` as a
plain property (probe 2), and a throwing `code`, `name`, `message` or `stack` getter already dropped the entry before
this card (pre-existing; §11 is silent on throwing accessors). Suggested disposition: no change needed, or a lazy read
(`typeof ownCode === 'string' ? ownCode : (error as …).errorCode`) if the lead wants the contract's reading order
literal; that change would need its own test first (`rules/testing.md`: a bug found without a test is not fixed).

Note (not a finding): `plan.md` footer still reads `Rounds: 1` (plan review round 2 note 5).

Verdict: ready for PR

Riskiest unfalsified: none in the changed lines; the closest is [1]'s hostile-accessor case, which §11 does not
address for any property of the thrown Error.

### Dispositions (dev-lead, pass 1 of 3)

| Pass | #   | Finding (file:line)                                                                              | Source                 | Kind        | Disposition      | Justification                                                                                                                                                                                                                                                                                                                                                    |
| ---- | --- | ------------------------------------------------------------------------------------------------ | ---------------------- | ----------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | 1   | `logger.ts:46` reads `errorCode` even when `code` is a string; a throwing getter drops the entry | reviewer               | correctness | no change needed | proving input (reviewer probe): an `Error` whose `errorCode` getter throws → `logMutationFailure` returns `undefined`, does not throw, writes 0 chunks; REQ-11.6 holds and the §10 result is unchanged. Same class as a throwing `code`/`message`/`stack` getter before this card; real Prisma `PrismaClientInitializationError(…, 'P1001')` logs `code` `P1001` |
| 1    | —   | mutants on the new ternary pinned?                                                               | dev-lead (unsure)      | coverage    | no change needed | reviewer traced: `true` killed by (d), `false` by (a)/(e), `!==` killed, `""` and the `typeof code` mutants are CompileErrors; Stryker logger 22 killed / 1 survived (`:27`, pre-existing)                                                                                                                                                                       |
| 1    | —   | an `errorCode` equal to the password is logged unredacted                                        | reviewer (observation) | security    | out of scope     | REQ-11.4 redacts `message` and `stack` only, as for `code` before this card; widening redaction is B1.9 (D-15)                                                                                                                                                                                                                                                   |
| 1    | —   | plan footer `Rounds: 1`                                                                          | reviewer (observation) | docs        | no change needed | `Rounds` counts the lead's rounds only (dev-lead.md step 5); plan review rounds (2) are in this file                                                                                                                                                                                                                                                             |
