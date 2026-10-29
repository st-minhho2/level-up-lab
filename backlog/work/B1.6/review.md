# B1.6 review

## Plan review (round 1)

SCOPE: all

Reviewed: `backlog/work/B1.6/plan.md` at `43f0da1` (`Plan approved by: lead (session reply "approve"), 2026-10-29 ·
Rounds: 1`) against §11 (`spec/contracts/09-logging.md`, Tier full, `- [x] Lead approves spec (lead, 2026-10-29, plan
gate of B1.6)` ticked in `43f0da1`), §10, §4, card B1.6, D-7, D-11, D-12, `analysis.md`, `advice.md`, the source files
and guides the plan names, `scripts/verify-red.sh`, `scripts/ci/check-feat-commits.sh`, `check-suppressions.sh`,
`stryker.config.mjs`, `eslint.config.mjs`, the role hook scopes, and `git log origin/main..HEAD` (7 docs commits, no
`src/` change). Run in this worktree on 2026-10-29: `pnpm test` → `Tests 72 passed (72)`; `check-spec-sections.sh` OK
(1–11); `check-features-map.sh` OK; `check-ac-coverage.sh` OK (`§11: ✗, no tests expected yet (6 criteria)`);
`check-feat-commits.sh`, `check-suppressions.sh`, `check-config-change.sh` OK. Probes on a `git clone` of this
worktree under the session scratchpad (`node_modules` symlinked, no `.env` read, hooks off), never on the tree; the
copy was deleted afterwards. The probe carried advice S-A as a `chore(todos): B1.6 skeleton` commit, 21 tests written
as advice "Test strategy" describes as a `test(todos): B1.6 log swallowed mutation failures (red)` commit, then L-A
and the four wired catch arms.

| Check                                                                             | pass / fail: reason                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: `src/lib/logger.ts` and `src/lib/logger.test.ts` are the new F9 (§11) the green commit adds; `src/actions/todos.ts` and its test are already in F4–F8 and join F9. The two guides are inside the code-writer's `src/*` scope; `spec/features-map.md` and `docs/metrics.md` are in its hook list too (`.claude/agents/code-writer.md:11`). No `prisma/`, `src/app`, component or `e2e/` file, consistent with §11 Out of scope.                       |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: `logMutationFailure(action: MutationActionName, error: unknown): void` and the union are §11's Function contracts verbatim; action signatures unchanged; the logger imports `getEnv` only (no Prisma, no `server-only`, no `console`). Probe: `tsc --noEmit` exit 0 and `eslint` clean on the stub, on L-A, on the wired actions and on both test files; `check-suppressions.sh` has nothing to see.                                                 |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: S-A (stub throws, actions wired only in green) and L-A (URL then password, redact then cut, one outer `try`) as advised. One silent difference: the advice's skeleton has `it.todo` lines; the plan's does not, which the code-writer's hook forces (note 2).                                                                                                                                                                                        |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: 6 (AC-11.1 … AC-11.6, Tier full); every Then is a chunk count, key order, exact string, length (500, 2000), call count (1, 0) or same-reference check. `grep -iw` of the banned list over `plan.md` and §11: 0 hits.                                                                                                                                                                                                                                 |
| verification lists exact commands with expected numbers                           | pass: `verify-red.sh B1.6` → 21 new failed, 0 new passed (probe: confirmed, note 1); `pnpm test` 72 → 93 (probe: `Tests 93 passed (93)`, 0 JSON lines printed); e2e 12; mutation ≥ 70 from 82.98 with logger 95 (probe: confirmed, note 9); the four guards. The plan writes "≈ 21" and "≈ 93"; both are exact in the probe.                                                                                                                               |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: `chore(todos): B1.6 skeleton` → `test(todos): B1.6 log swallowed mutation failures (red)` (matches verify-red's `^test\([^)]*\): B1\.6 .*\(red\)$` and Lefthook's subject rule) → `feat(todos): B1.6 …` with the F9 row by the code-writer (B1.4/B1.5 precedent) → reviewer diff. Probe: verify-red takes the `chore` commit as the base; `check-feat-commits.sh` checks only `feat(` subjects, so a `chore` touching or not touching tests is fine. |
| the section's `Lead approves spec` box is ticked by a human (never by you)        | pass: `spec/contracts/09-logging.md:5` reads `- [x] Lead approves spec (lead, 2026-10-29, plan gate of B1.6)`, ticked in `43f0da1` (`docs(backlog): B1.6 plan approved`) on the lead's "approve" reply, the step D-7 names and the plan's approach paragraph announces. Not ticked by me.                                                                                                                                                                  |
| no settled D-n contradicted                                                       | pass: D-12 followed exactly (in-repo `src/lib/logger.ts`, `process.stderr.write`, no `console`, no dependency, no env key, R2 content, caps 500/2000, input never a field); D-11's message, `form` key and no-revalidation untouched, its last sentence replaced by D-12 as D-12 says; D-7 (box and approval line present); D-5 untouched (Zod stays outside the `try`, so a title error is never logged: AC-11.6 (b)).                                    |

Verdict: approved

Notes (none blocking; for the code-writer, the test-writer, the PR body and the diff review):

1. **Red step (brief a, b), confirmed by probe.** `scripts/verify-red.sh B1.6 --range 43f0da1..HEAD` on the copy:
   `base: chore(todos): B1.6 skeleton`; `src/actions/todos.test.ts: 26 ran (8 new), 8 new failed, 0 new passed OK`;
   `src/lib/logger.test.ts: 13 ran (13 new), 13 new failed, 0 new passed OK`; `RESULT: red for the right reason`.
   The 13 logger tests fail on `NotImplementedError` (AC-11.4 (a)/(b) on the `not.toThrow()` line); the 5 AC-11.5
   tests on `called 1 times, but got 0`; the 3 AC-11.6 tests only on their positive controls, so the controls are
   required, not optional. The stub's message `logMutationFailure(<action>, <String(error)>) is not implemented` does
   not match verify-red's import-error pattern (`is not defined` and friends). With the green body: 93 passed, and a
   full `vitest run` prints 0 lines containing `"level"`. Write 21 and 93, not "≈".
2. **Skeleton owner and test stubs.** Step 2 gives the skeleton to `code-writer`, whose hook denies `*.test.ts`
   (`'!*.test.ts'`), while `new-feature-slice` step 2 creates `it.todo` stub files. The plan's "Produces:
   `src/lib/logger.ts` stub" is the right reading: tell the code-writer to skip the skill's test-stub step (it would
   be blocked). Without stubs, `logger.test.ts` does not exist at the base and every title counts as new (probe above);
   the `it.todo` lines of B1.2/B1.3 are not needed for the red proof.
3. **Security (brief c), confirmed.** End to end on the copy: `next dev` with `DATABASE_URL` pointing at a closed port
   and a password `s3cret`, then `toggleTodoAction` and `clearCompletedTodosAction` invoked by their action ids: each
   wrote exactly 1 line on stderr and 0 on stdout; the response body was
   `{"ok":false,"fieldErrors":{"form":["Could not save, try again"]}}`; 0 occurrences of `s3cret` in the server output;
   the entry had keys `level, time, msg, action, error` and `error` `name, message, stack`
   (`PrismaClientInitializationError`, message 162 characters, stack cut to 2000). Unit probes on L-A: an `Error` with
   `cause` or Prisma-style `meta`/`clientVersion` holding the URL → neither property is serialized (only `name`,
   `message`, `code`, `stack` are picked); a message with `\n{"level":"error",…}` stays one line (JSON escapes `\n`);
   a non-`Error` whose `toString` returns the URL → `obj [redacted]`; a plain object → `[object Object]`; a 1-character
   password `e` over-redacts (fail-safe). Two inputs write no entry at all (REQ-11.6 wins, as advised): a
   null-prototype object and an `Error` whose `message` is not a string (`replaceAll` throws into the outer `catch`).
4. **Residual, plausible (no producer found): the password as `new URL` returns it is not always "the password
   inside" `DATABASE_URL`.** The WHATWG parser re-encodes the userinfo set: `postgresql://app:p@ss@db.internal:5432/lab`
   and `…app:pa^ss@…` both pass §4's `parseEnv` and give `password` `p%40ss` and `pa%5Ess`, strings that do not occur in
   the value. Probe: a message `auth failed for p@ss` (and `pa^ss`) is written verbatim; the whole URL is still
   redacted. Same class as the advice's decoded-password case (`p%40ss` in the env, `p@ss` printed). REQ-11.4's wording
   ("the password inside it") and the Function contracts (`new URL(value).password`) diverge only on these inputs; the
   contract governs and `.env.example`'s password has no such character. One line in the PR body; if the lead wants it
   closed, a §8 change adding the `decodeURIComponent` form is one REQ/AC (the 7th criterion), not this card.
5. **Residual, spec as written: `code` and `name` are neither redacted nor capped.** REQ-11.4 covers `message` and
   `stack` only. Probe: an `Error` with `code` equal to the URL logs it verbatim, and a 5000-character `code` makes a
   5 KB line; a `name` holding the URL is verbatim in `name` (its copy in `stack` is redacted). Producers in this app:
   Prisma codes are `P` plus 4 digits, Node system codes are constants. PR-body line, no change.
6. **Residual, spec-accepted: any invalid §4 key turns redaction off.** `getEnv()` has no runtime caller in `src/`
   today (grep: only `env.ts` itself); Prisma reads `env("DATABASE_URL")` from `prisma/schema.prisma:11` directly. So the
   logger is the first place an invalid `PORT`, `CACHE_PREFIX` or `NODE_ENV` surfaces, and it surfaces as unredacted
   entries while every action keeps working (REQ-11.6, AC-11.4 (b)). PR-body line.
7. **`new URL` failure path.** L-A computes both secrets in one `try`, so when `new URL` throws neither the whole value
   nor the password is redacted (probe with a mocked `getEnv` returning `not a url s3cret`: logged verbatim); a literal
   reading of the contract ("the whole body runs in one try/catch … returns undefined") would write nothing instead.
   Unreachable: §4's `.url()` uses the same `URL` parser (probe: every URL above passed `parseEnv` and parsed). The diff
   review accepts L-A as advised; keeping the whole value when only the password step fails would be the safer split
   if the code-writer prefers it, at the cost of the equivalent mutant already noted.
8. **Node runtime (brief d), confirmed.** No `runtime` export in `src/` or `next.config.ts`, no `middleware.ts`, no
   `instrumentation.ts`; `.next/server/server-reference-manifest.json` on the copy lists the 4 actions under `node` and
   0 under `edge`; the dev-server probe in note 3 wrote through `process.stderr`. CI's e2e job runs
   `pnpm build && pnpm start` (`playwright.config.ts:20`), so the production build path is exercised on the PR.
9. **Mutation, confirmed.** Stryker on the copy, `--mutate src/lib/logger.ts,src/actions/todos.ts`: `logger.ts` 95.00
   (19 killed, 1 survivor `return []` → `return ["Stryker was here"]` in `secretsOf`, equivalent in practice, as
   advised), `todos.ts` 88.46 (3 pre-existing: `typeof rawTitle`, its `''` fallback, toggle's `revalidatePath('/')`),
   no survivor on a new line.
10. **Diagnosis gap, for the lead, not this card.** The most common failure, a database that is down, is a
    `PrismaClientInitializationError`, which carries `errorCode` (`node_modules/@prisma/client/runtime/library.d.ts:2620`),
    not `code`; so P1001 never reaches the entry's `code` (probe in note 3: no `code` key), although AC-11.2 uses
    `P1001` as its example. The reason survives in `message` (`Can't reach database server at \`127.0.0.1:1\``).
11. **Files list (brief e).** (a) `src/actions/todos.ts:3`, the header, names §10 only; the plan's line says "stale
    'not logged' comments rewritten" but not "header gains §11" (advice Impact; `src/CLAUDE.md`: the header names the
    section). (b) `src/lib/CLAUDE.md`'s title "(§3–§6)" and `src/CLAUDE.md`'s rows already trail the code; the advice
    leaves them, so does this review. (c) §11 stays ✗ through this PR, so `check-ac-coverage.sh` prints "no tests
    expected yet" on the PR head; probe: with §11 flipped to ✅ the candidate titles give `§11 criteria=6 covered=6`
    (prettier keeps every title on its `it(` line at printWidth 120). The diff review greps the six ids directly.
    (d) The index flip, card status and README row belong to the closing PR, as B1.5's did. Nothing else is missing.
12. **Secret scanners.** `gitleaks dir` (8.30.1, repo `.gitleaks.toml`) on the planned literals
    (`postgresql://app:s3cret@db.internal:5432/lab`, `(password s3cret)`): no leaks. Semgrep `p/secrets` is not
    installed here [unverified]; `src/lib/env.test.ts:4` on `main` already carries a credentialed URI and CI passes.
13. `plan.md` is 54 lines against `planning.md`'s "≈ 40"; the overrun is table width, not scope.

Riskiest unfalsified: a driver message that quotes the database password alone, decoded or with a re-encoded
character (note 4); no Prisma 6 template found that does so.

Rounds: 1
