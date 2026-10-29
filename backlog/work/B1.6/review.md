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

## Diff review (pass 1)

SCOPE: all

Reviewed: `git diff origin/main..HEAD` (skeleton `592977a`, red `67294c1`, green `ff66382`; everything earlier on the
branch is pre-plan `docs(spec)` / `docs(backlog)`) against §11 (REQ-11.1 … REQ-11.7, AC-11.1 … AC-11.6, Function
contracts), §10, §4, D-11, D-12, `plan.md` (approved 2026-10-29, round 1), `advice.md`, the plan review and its 13
notes, every changed file in full. Run in this worktree on 2026-10-29, one gate after another (e2e finished before
Stryker started). Probes on a copy under the session scratchpad (`rsync` without `node_modules`, `.git`, `.env*`,
`.worktree.env`; `node_modules` symlinked; environment passed on the command line with `env -i`, no `.env` read):
22 one-edit probes with `vitest run` on the two test files, an 18-input security table on the real logger with a
mocked `getEnv`, and the copy built and served with `next build && next start -p 3794` (the path CI's e2e job uses)
with `DATABASE_URL` pointing at a closed port. The copy, its server and the probe scripts are deleted.

### Command results (last line of each)

| Command                             | Last line                                                                                                 |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                         | `All matched files use Prettier code style!`                                                              |
| `pnpm typecheck`                    | `tsc --noEmit` (no output, exit 0)                                                                        |
| `pnpm test`                         | `Tests  93 passed (93)` (11 files); 0 lines containing `"level"` in the run's output                      |
| `pnpm test:e2e`                     | `12 passed (14.2s)`                                                                                       |
| `pnpm test:mutation`                | `Final mutation score of 85.09 is greater than or equal to break threshold 70` (actions 88.46, lib 84.09) |
| `scripts/ci/check-suppressions.sh`  | `OK: no new suppressions`                                                                                 |
| `scripts/ci/check-config-change.sh` | `OK: no protected config changed`                                                                         |
| `scripts/ci/check-feat-commits.sh`  | `OK: no feat commit touches tests`                                                                        |
| `scripts/ci/check-ac-coverage.sh`   | `OK: every criterion of a shipped section has a test` (`§11: ✗, no tests expected yet (6 criteria)`)      |
| `scripts/ci/check-spec-sections.sh` | `OK: sections cited: 1 2 3 4 5 6 7 8 9 10 11`                                                             |
| `scripts/ci/check-features-map.sh`  | `OK`                                                                                                      |
| `scripts/ci/check-backlog.sh`       | `OK: README matches the cards`                                                                            |
| `scripts/verify-red.sh B1.6`        | `RESULT: red for the right reason` (actions 8 new / 8 failed, logger 13 new / 13 failed, 0 new passed)    |
| `git diff --stat origin/main..HEAD` | `17 files changed, 1300 insertions(+), 49 deletions(-)`                                                   |

Stryker on the changed files: `logger.ts` 95.00 (19 killed, 1 survived, 19 compile errors), the survivor is
`logger.ts:27` `return []` → `return ["Stryker was here"]` (equivalent in practice, advice and plan review note 9);
`src/actions/todos.ts` 88.46 with 3 pre-existing mutants (`24:54` `typeof rawTitle`, `24:96` its `''` fallback,
`46:20` toggle's `revalidatePath('/')`), none on a B1.6 line.

### Checklist

| Check                                                  | Result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every AC-§.n has a test whose assertion matches Then   | pass (grep, §11 is ✗): AC-11.1 ×1, AC-11.2 ×3, AC-11.3 ×2, AC-11.4 ×2 in `src/lib/logger.test.ts`; AC-11.5 ×5, AC-11.6 ×3 in `src/actions/todos.test.ts`, each title at the start of an `it(` line. AC-11.1 asserts 1 chunk, a string, `split('\n')` length 2, ending in `\n`, the 5 keys in order, the 4 values, `error` keys `name, message, stack`, stack prefix, stdout 0, `undefined`; its title equals the card's `Test:` line. AC-11.5 asserts the exact §10 object, the error text absent from the result, 1 call, 2 arguments, own name, `toBe(error)`, no `Buy milk`. AC-11.6 keeps the three 0-call Thens and ends each with the positive control (plan review note 1). |
| no test weakened after the red commit                  | pass: `git diff 67294c1..HEAD -- '*.test.*' e2e/` is empty; the red commit adds 364 lines and changes no existing assertion (one import and the hoisted logger mock added).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| every changed file is in `plan.md`                     | pass: skeleton `src/lib/logger.ts`; red the 2 test files; green `logger.ts`, `src/actions/todos.ts`, `src/lib/CLAUDE.md`, `src/actions/CLAUDE.md`, `spec/features-map.md`, `docs/metrics.md`. Exactly the plan's Files table. No `it.todo` stubs in the skeleton (plan review note 2). `todos.ts:3-4` header now names §11 (plan review note 11 (a)).                                                                                                                                                                                                                                                                                                                              |
| interfaces match the section's contracts               | pass: `MutationActionName` and `logMutationFailure(action, error: unknown): void` verbatim; module constants 500 / 2000 / `[redacted]` not exported; imports `getEnv` only (no `server-only`, no Prisma, no `console`); one `process.stderr.write` of `JSON.stringify(entry) + '\n'`; one outer `try`; whole URL then password, filter `''`, redact then `slice`; `code` only when `typeof` is `'string'`, `stack` only when a string; `NonError` + `String(value)`. Actions: signatures unchanged, Zod outside the `try`, the call after the `TodoNotFoundError` arm and before `return failure('form', …)`, each with its own name.                                              |
| Zod at every action boundary                           | pass: unchanged parses; AC-11.6 (b) proves an invalid title never reaches the call.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Prisma only in `src/lib`; no raw SQL; migration        | pass / n/a: no Prisma import added, no `prisma/` change.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| no secret, no suppression                              | pass: `check-suppressions.sh` OK; the test literal `postgresql://app:s3cret@db.internal:5432/lab` is the spec's fixture (plan review note 12: gitleaks clean). Invariant 7 probes below.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| features map row moved                                 | pass: new F9 (§11, `src/lib/logger.ts`, `src/actions/todos.ts`; tests `src/lib/logger.test.ts`, `src/actions/todos.test.ts`; ✅), `check-features-map.sh` OK. `docs/metrics.md` B1.6 row `85.09 (actions 88.5, lib 84.1)`, red `67294c1`, matches this run.                                                                                                                                                                                                                                                                                                                                                                                                                        |
| guides                                                 | pass: `src/actions/CLAUDE.md` "nothing logged" → the cause written once by `logMutationFailure` (§11), title gains §11; `src/lib/CLAUDE.md` gains the `logger.ts` row. The file's heading "(§3–§6)" still trails (plan review note 11 (b), left as advised).                                                                                                                                                                                                                                                                                                                                                                                                                       |
| no settled D-n contradicted                            | pass: D-12 (in-repo logger, `process.stderr.write`, no `console`, no dependency, no env key, R2 content, caps), D-11 (message, `form` key, no revalidation unchanged), D-5 (Zod outside the `try`), D-7 (box ticked by the lead in `43f0da1`).                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| would any test fail if one changed line were reverted? | pass for every line but one (finding 1). Probes below.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |

One-edit probes (copy; `vitest run src/lib/logger.test.ts src/actions/todos.test.ts`; 39 tests):

| P   | Edit                                                                | Fails                                  |
| --- | ------------------------------------------------------------------- | -------------------------------------- |
| A1  | create: call removed                                                | AC-11.5 create ×2, AC-11.6 (b) control |
| A2  | toggle: call removed                                                | AC-11.5 toggle, AC-11.6 (c) control    |
| A3  | edit: call removed                                                  | AC-11.5 edit                           |
| A4  | clear: call removed                                                 | AC-11.5 clear, AC-11.6 (a) control     |
| A5  | edit: call moved before the `TodoNotFoundError` arm                 | AC-11.6 (c)                            |
| A6  | toggle logs `'updateTodoTitleAction'`                               | AC-11.5 toggle, AC-11.6 (c)            |
| A7  | create logs on an invalid title                                     | AC-11.6 (b)                            |
| A8  | clear logs on success                                               | AC-11.6 (a)                            |
| A9  | toggle logs twice                                                   | AC-11.5 toggle, AC-11.6 (c)            |
| A10 | edit logs `new Error(String(error))` (a copy, not the thrown value) | AC-11.5 edit                           |
| L1  | password redacted before the URL                                    | AC-11.3 (a), straddle, non-Error       |
| L2  | cut before redact                                                   | straddle, non-Error                    |
| L3  | `replace` instead of `replaceAll`                                   | every occurrence                       |
| L4  | outer `try`/`catch` removed                                         | AC-11.4 (a)                            |
| L5  | `process.stdout.write`                                              | all 13 logger tests                    |
| L6  | `code` kept when truthy (`String(code)`)                            | AC-11.2 (b)                            |
| L7  | `name: 'Error'` (constant instead of `error.name`)                  | **none** (39 passed): finding 1        |
| L8  | no trailing `\n`                                                    | 12 logger tests                        |
| L9  | an extra key (`pid`) after `action`                                 | AC-11.1                                |
| L10 | JSON and `\n` written as two chunks                                 | 12 logger tests                        |
| L11 | `stack` cut but not redacted                                        | AC-11.3 (a)                            |
| L12 | `getEnv` failure rethrown from `secretsOf` (entry dropped)          | AC-11.4 (b)                            |

Invariant 7 and REQ-11.3 edge inputs (real logger, `getEnv` mocked to `postgresql://app:s3cret@db.internal:5432/lab`
unless stated; "leak" = the URL or `s3cret` in the written chunk):

| Input                                                                                     | Chunks | Result                                                                                |
| ----------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------- |
| `Error` with `cause` = `new Error(URL)`; with Prisma-style `meta` / `clientVersion` = URL | 1      | no leak: only `name`, `message`, `code`, `stack` are picked                           |
| `Error` whose `name` contains the URL                                                     | 1      | leak in `name` (its copy in `stack` is redacted): spec as written, plan review note 5 |
| `Error` whose string `code` contains the URL                                              | 1      | leak in `code`: spec as written, plan review note 5                                   |
| non-`Error` whose `toString` returns `obj <URL>`; `undefined`                             | 1      | `obj [redacted]`; `"undefined"`                                                       |
| `postgres://` scheme                                                                      | 1      | URL and password redacted                                                             |
| env `…/lab?schema=wt_x`, message holds the URL without the query                          | 1      | `postgresql://app:[redacted]@db.internal:5432/lab`: the password pass catches it      |
| env `postgresql://app@h:5432/lab?password=s3cret`, message `auth s3cret`                  | 1      | leak: `new URL().password` is `''` (note 1)                                           |
| env password `p@ss` (re-encoded `p%40ss`) or `p%40ss`, message `auth p@ss`                | 1      | leak of the decoded form: plan review note 4                                          |
| env password `e` (1 character)                                                            | 1      | over-redacted (`h[redacted]r[redacted]`, paths mangled), fail-safe                    |
| `getEnv` throws                                                                           | 1      | URL written verbatim: REQ-11.6 as written, plan review note 6                         |
| `TypeError`, `AggregateError([new Error(URL)])`                                           | 1      | names kept; the inner error is not serialized                                         |
| `Error` whose `message` is `42`; null-prototype object; `stack` getter throws             | 0      | no entry, no throw (REQ-11.6 wins, as advised; plan review note 3)                    |

End to end, production build of the copy (`next build`, `next start -p 3794`, `DATABASE_URL` with password `reach`
on port 1, so the password is a word inside Prisma's message), actions invoked by their ids from
`server-reference-manifest.json` (4 under `node`, 0 under `edge`): toggle, edit (title `Buy milk SECRETTITLE`) and
clear each answered `{"ok":false,"fieldErrors":{"form":["Could not save, try again"]}}` and wrote exactly 1 line on
stderr (3 in total), 0 on stdout; each line has keys `level, time, msg, action, error`, its own action name, `error`
keys `name, message, stack`, `PrismaClientInitializationError`, message 167 characters reading "… Can't [redacted]
database server at 127.0.0.1:1 …", stack 2000. So `getEnv()` succeeds inside `next start` and redaction is live
there; `reach` and `SECRETTITLE` occur 0 times in the server output. Same flow on `next dev`: edit with a blank title
(three spaces) answered the `title` error and wrote 0 lines.

### Findings

```
[1] KIND: coverage
    WHERE: src/lib/logger.ts:46 (name: error.name)
    DEFECT: no test pins that `name` is the thrown Error's own name: every Error-path test uses a plain `Error`,
            whose name is the constant `'Error'`.
    TRIGGER: probe L7 on the copy: `name: error.name` replaced by `name: 'Error'` → `Tests 39 passed (39)`; Stryker
            cannot generate it. In the end-to-end probe the real name is `PrismaClientInitializationError`.
    WRONG BEHAVIOUR: none today; a regression to a constant would log `Error` for every Prisma failure, losing
            REQ-11.3's "record its `name`", the field that tells an initialization failure from a request failure,
            with the suite green.
    CONFIDENCE: confirmed (probe run)
```

Not blocking: the code is what §11 says. For the test-writer if dev-lead takes it: one unprefixed test in
`logger.test.ts` (`records the name of an Error subclass`, `new TypeError('db down')` → `error.name` `TypeError`),
green on arrival, in a `test(todos): B1.6 review pass 1 -- …` commit (not `(red)`, so verify-red ignores it).
Advice "Mutation hot spots" already offered it.

### Notes (not findings)

1. Plausible residual, same class as plan review note 4: a password carried in the query string
   (`?password=…`, or `sslpassword` for a client certificate) is not `new URL(value).password`, so only the whole
   value is redacted. No producer found (the compose `DATABASE_URL` and `.env.example` carry it in the userinfo, and
   no Prisma 6 message template quoting a password was found). One line in the PR body beside notes 4–6.
2. Plan review notes 4, 5, 6 and 10 stand as PR-body lines (decoded / re-encoded password; `name` and `code` neither
   redacted nor capped; any invalid §4 key disables redaction; `PrismaClientInitializationError` carries `errorCode`,
   not `code`). In the production probe the reason survived the 500 cut (167 characters).
3. Closing commit (dev-lead): `spec/technical-requirements.md` §11 ✗ → ✅ (`check-ac-coverage.sh` then requires
   AC-11.1 … AC-11.6, all present by the grep above), `docs/metrics.md` top table mutation `82.98 %` → `85.09 %`,
   card status, features-map receipt.

Verdict: ready for PR

Riskiest unfalsified: a database driver message that quotes the password in a form other than
`new URL(DATABASE_URL).password` (decoded, re-encoded by the URL parser, or from a query parameter) would be written
verbatim; no Prisma 6 template that does so was found, and no test can show its absence.

Rounds: 1

### Dispositions (dev-lead, pass 1 of 3)

| Pass | #   | Finding (file:line)                                               | Source                          | Kind     | Disposition      | Justification                                                                                                                                                                 |
| ---- | --- | ----------------------------------------------------------------- | ------------------------------- | -------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | 1   | `logger.ts:46` `name: error.name` not pinned by a test (probe L7) | reviewer                        | coverage | fix now          | test `51f7399` (no AC prefix); dev-lead probe: `name: "Error"` fails it, revert passes 14/14                                                                                  |
| 1    | —   | password in a non-userinfo form written verbatim                  | reviewer (riskiest unfalsified) | security | out of scope     | D-12/§11 define the secrets as the whole `DATABASE_URL` and its userinfo password; no Prisma 6 template found that quotes it otherwise; recorded in the PR body as a residual |
| 1    | —   | `?password=` / `sslpassword` query residual                       | reviewer note 1                 | security | out of scope     | same rule; §4 `.env.example` uses userinfo only; widening the secret set is a §11 change (D-n), PR body residual                                                              |
| 1    | —   | plan review notes 4, 5, 6, 10 into the PR body                    | reviewer note 2                 | docs     | fix now          | carried into the PR body "Residual risks"                                                                                                                                     |
| 1    | —   | §11 ✗ → ✅, metrics top table, card status, map receipt           | reviewer note 3                 | docs     | no change needed | closing commit after merge, per plan                                                                                                                                          |
