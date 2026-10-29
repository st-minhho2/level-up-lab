# B1.6 advice

Read first: D-12 is settled (in-repo logger, one JSON line on `process.stderr.write`, content R2) and §11 fixes the
function contract line by line, so this file chooses nothing the spec already chose; it settles the skeleton, the
shape of the module body, the test boundary and the red proofs. The `Lead approves spec` box under §11 is unticked
(`spec/contracts/09-logging.md:5`) and stays so until the plan gate (D-7). Every number below comes from a throwaway
copy of this worktree under the session scratchpad (`rsync` without `node_modules`, `.git`, `.env*`; `node_modules`
symlinked) carrying a candidate `logger.ts`, a candidate `logger.test.ts`, the four wired catch arms and the new
action tests, run with the repo's own `tsc`, `eslint`, `vitest` 4.1.12 and `stryker`; nothing was written in the
repo and no `.env` was read. The candidate files are evidence, not a patch: the test-writer and code-writer own the
real ones.

## Approaches

### Skeleton (`chore(todos): B1.6 skeleton`)

**S-A. Stub only, actions untouched (recommended).** The commit adds `src/lib/logger.ts` with the exported type and a
stub that throws, plus `it.todo` lines; no action imports the logger yet.

```ts
// §11 logging failures (B1.6). Skeleton.
import { NotImplementedError } from '@/lib/errors';

export type MutationActionName =
  'createTodoAction' | 'toggleTodoAction' | 'updateTodoTitleAction' | 'clearCompletedTodosAction';

export function logMutationFailure(action: MutationActionName, error: unknown): void {
  throw new NotImplementedError(`logMutationFailure(${action}, ${String(error)})`);
}
```

- Why a stub that throws and not a no-op: with `return;` AC-11.4 (a) ("the call returns `undefined` and does not
  throw") passes before any behavior exists and `verify-red.sh` counts it as "GREEN before implementation"; with
  the throw it fails, and the card's own Test line says the same ("once the skeleton stub throws
  `NotImplementedError`, `logMutationFailure` throws instead of writing the line"). REQ-11.6 ("never throws") binds
  the finished function, not a stub that exists to be red; the green commit replaces the body.
- Why the parameters appear in the message: `_action` / `_error` pass `tsc` (`noUnusedParameters` allows the
  underscore) but fail `eslint` (`@typescript-eslint/no-unused-vars` has no `argsIgnorePattern` here); probe:
  `eslint` reports both. The B1.2 skeleton already interpolates its parameters into the `NotImplementedError`
  text; `${String(error)}` on `unknown` passes `restrict-template-expressions` and `no-base-to-string` (probe: `tsc` and
  `eslint` clean).
- Test stubs, as B1.3 did (5 lines in an existing test file): a new `src/lib/logger.test.ts` holding
  `describe('logMutationFailure (§11)')` with `it.todo('AC-11.1: …')` … `it.todo('AC-11.4: …')`, and two
  `it.todo` lines (`AC-11.5`, `AC-11.6`) at the end of `src/actions/todos.test.ts`. `it.todo` titles are not counted
  by `check-ac-coverage.sh` (it reads `it(`/`test(`) and not matched as base titles by `verify-red.sh` (its regex
  needs `it(`), so they neither hide nor fake a red test. No `e2e/` file: §11 has no browser behavior.
- Scope `todos`, as B1.4 and B1.5 (`<pkg>` is the `src/` folder that owns the card's tests; `lib/logger` is called
  only from `src/actions/todos.ts`).
- Gates at this commit: `pnpm lint`, `pnpm typecheck`, `pnpm test` green (72 tests, 6 todo); `check-features-map.sh`
  names `src/lib/logger.ts` as "in no features-map row" until the green commit adds F9; CI runs that guard on the PR
  head, Lefthook does not run it, so the intermediate commit is not gated (B1.5 review note 6 says the same for
  `check-ac-coverage.sh`: push after the red commit).

**S-B. Stub plus the four wired calls.** Rejected. The skeleton rule is "no behavior". Wired calls make the four
existing "db down" tests reject with `NotImplementedError` out of the catch arm (they do not mock the logger yet:
the mock arrives with the red commit), so `pnpm test` is red at the skeleton; with a no-op stub they pass, and then
AC-11.5 (the spy is called once) is green before the green commit, which `verify-red.sh` rejects. Leaving the wiring
to green is what makes AC-11.5 red on an assertion (`expected "vi.fn()" to be called 1 times, but got 0 times`,
probe).

How the action tests stay meaningful while the stub throws: they never run it. `src/actions/todos.test.ts` mocks
`@/lib/logger` at the module boundary from the red commit on (`vi.hoisted` object, `vi.mock('@/lib/logger', …)`
placed beside the `next/cache` mock), the actions do not import the logger until green, and the stub is reached
only by `src/lib/logger.test.ts`, where throwing is exactly the red the card wants.

### Logger body (`src/lib/logger.ts`, 66 lines in the probe, comments included)

**L-A. Sequential `replaceAll` over `[url, password]`, then `slice` (recommended).** The probed module, in
reading order: imports `getEnv` only; the exported type; three module constants (`LOG_MESSAGE_MAX_LENGTH = 500`,
`LOG_STACK_MAX_LENGTH = 2000`, `REDACTED = '[redacted]'`); one private `interface LoggedError`; three private
functions; the exported function.

```ts
function secretsOf(): string[] {
  try {
    const url = getEnv().DATABASE_URL;
    return [url, new URL(url).password].filter((secret) => secret !== '');
  } catch {
    return [];
  }
}

function scrub(text: string, secrets: readonly string[], maxLength: number): string {
  let scrubbed = text;
  for (const secret of secrets) {
    scrubbed = scrubbed.replaceAll(secret, REDACTED);
  }
  return scrubbed.slice(0, maxLength);
}

function describeError(error: unknown, secrets: readonly string[]): LoggedError {
  if (!(error instanceof Error)) {
    return { name: 'NonError', message: scrub(String(error), secrets, LOG_MESSAGE_MAX_LENGTH) };
  }
  const { code } = error as Error & { readonly code?: unknown };
  return {
    name: error.name,
    message: scrub(error.message, secrets, LOG_MESSAGE_MAX_LENGTH),
    ...(typeof code === 'string' ? { code } : {}),
    ...(typeof error.stack === 'string' ? { stack: scrub(error.stack, secrets, LOG_STACK_MAX_LENGTH) } : {}),
  };
}

export function logMutationFailure(action: MutationActionName, error: unknown): void {
  try {
    const entry = {
      level: 'error',
      time: new Date().toISOString(),
      msg: 'mutation failed',
      action,
      error: describeError(error, secretsOf()),
    };
    process.stderr.write(`${JSON.stringify(entry)}\n`);
  } catch {
    // REQ-11.6: a logging failure never changes what the person sees.
  }
}
```

Decisions inside it (each one is a place where a plausible variant is wrong):

- **Order of redaction.** The whole `DATABASE_URL` first, the password second. Password first leaves
  `postgresql://app:[redacted]@db.internal:5432/lab`, which breaks AC-11.3 (a)'s exact
  `Can't reach [redacted] (password [redacted])` (probe: swapping the array fails AC-11.3 and the two ordering
  tests below). Redaction then cut (REQ-11.4 "before the entry is cut"): cutting first leaves a fragment of the URL
  when it straddles the 500 or 2000 boundary (probe: cut-first fails the straddle test).
- **Empty strings never reach `replaceAll`.** A URL without a password has `new URL(url).password === ''`
  (probe), and `'abc'.replaceAll('', '-')` is `-a-b-c-` (probe). Spec: "when it is not empty". `filter((secret) => secret !== '')`
  covers the password and, by the same line, a mocked empty URL.
- **Percent-encoding.** `new URL('postgresql://app:p%40ss%2Fw@h/db').password` is `p%40ss%2Fw`, the encoded form
  (probe), and that is what the contract takes ("the `password` of `new URL(value)`"). A driver message that prints
  the decoded `p@ss/w` is not matched; see Question 2.
- **`new URL` failure** (not reachable after §4's Zod `.url()`, reachable only through a mocked `getEnv`): `secretsOf`
  returns `[]`, the entry is still written, unredacted, the same outcome as an unreadable environment. This
  keeps both the `getEnv` and the `URL` failure inside the single REQ-11.6 clause "no redaction is applied" instead of
  silently dropping the entry through the outer `catch`.
- **`code`.** `error as Error & { readonly code?: unknown }` is a downcast, not `as unknown as`; `typeof code ===
'string'` is a type guard, so no `any`, and there is no `'code' in error` guard whose mutant (`true`) would be
  equivalent (a missing `code` is `undefined`, which `typeof` already rejects). Empty-string `code` is recorded
  (it is a string). `stack` uses `typeof error.stack === 'string'`: an `Error` whose `stack` was deleted must still log,
  and `scrub(undefined…)` would throw into the outer `catch` and lose the entry.
- **Key order.** Object literal order is the output order: `level, time, msg, action, error`, then inside
  `name, message, code, stack`. The conditional spreads keep `code` before `stack`; `JSON.stringify` drops no key here
  because absent keys are absent, not `undefined`.
- **Non-Error values** go through the same `scrub`: REQ-11.4 says "the recorded `message`", not "the message of an
  Error" (AC-11.3 only exercises Errors; see the extra tests). `String(value)` throws for a null-prototype object
  (`String(Object.create(null))` is a `TypeError`, probe): the outer `catch` returns `undefined` and no entry is
  written. REQ-11.6 ("without throwing") wins over completeness; the contract says `String(value)` literally; not worth
  a branch.
- **`process.stderr.write` typing.** `process.stderr.write(string)` returns `boolean`; the result is ignored on purpose
  (no back-pressure handling for one line per failure), it is not a promise, so `no-floating-promises` is silent.
  `process` types come from the existing `@types/node` already used by `env.ts`; probe: `tsc --noEmit` exit 0 under
  `strict`, `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`. In the tests the same method is spied
  with `MockInstance<typeof process.stderr.write>`; `ReturnType<typeof vi.spyOn<…, 'write'>>` does not compile (probe:
  TS2344), and a chunk is `string | Uint8Array`, so a helper narrows with `typeof chunk === 'string'`.
- **No `console`, no `eslint-disable`, no `server-only`.** `no-console` is silent because `console` is never named
  (probe: `eslint` clean on the module, its test and the actions file); `check-suppressions.sh` has nothing to see.

**L-B. One regex alternation (`new RegExp([url, password].map(escapeRegExp).join('|'), 'g')`).** Rejected. It avoids
one pathological case of L-A (a password of one or two characters, say `e`, is also found inside the `[redacted]` that
the URL pass just wrote, so the output is over-redacted garbage, never a leak: fail-safe) at the price of an escape
helper, a `RegExp` constructed at run time and more mutants, for a case no §11 criterion states. Reversible later.

## Recommendation

S-A for the skeleton and L-A for the body, exactly as probed. Reasons: S-A is the only skeleton that leaves
`pnpm test` green and every new test red on a behavior (21 of 21 fail, 0 pass, probe below) without a no-op stub that
makes AC-11.4 (a) vacuous; L-A is §11's function contract transcribed (one `try`, `getEnv()` only, the three named
constants, `process.stderr.write` once, `String(value)`), with the redact-then-cut and URL-then-password orders pinned
by tests and two guards (`secret !== ''`, `typeof`) that each have a test. No migration, no dependency, no env key,
no `eslint.config.mjs` change. The probed module and tests: `scripts/verify-red.sh` shape (21 new, 21 failed), `pnpm test`
72 → 93, `tsc` and `eslint` clean, Stryker on `logger.ts` 95.00 %.

## Impact

| File                                                                                                                        | Add / Change | Signature / content                                                                                                                                                                                                                                                                                                                | ACs / REQs                     |
| --------------------------------------------------------------------------------------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| `src/lib/logger.ts`                                                                                                         | Add          | `type MutationActionName`; `logMutationFailure(action: MutationActionName, error: unknown): void`; header `// §11 …` (about 66 lines in the probe). Skeleton: stub that throws. Green: the body above                                                                                                                              | AC-11.1 … AC-11.4, REQ-11.2–6  |
| `src/lib/logger.test.ts`                                                                                                    | Add          | 8 AC tests and 5 unprefixed behavior tests (about 175 lines); `vi.hoisted` `getEnv` mock, fake timers, spies on `process.stderr.write` / `process.stdout.write`, `MockInstance` types                                                                                                                                              | AC-11.1 … AC-11.4, REQ-11.3–4  |
| `src/actions/todos.ts`                                                                                                      | Change       | `import { logMutationFailure } from '@/lib/logger'`; `catch (error)` in `createTodoAction` and `clearCompletedTodosAction`; one call per arm after the `TodoNotFoundError` arm and before `failure(…)`; the three "not logged until a logger card lands" comments reworded; header gains §11 (+6 / −3 lines). Signatures unchanged | AC-11.5, AC-11.6, REQ-11.1/5/7 |
| `src/actions/todos.test.ts`                                                                                                 | Change       | red commit: `vi.hoisted` `logger` object beside `lib` and `cache`, `vi.mock('@/lib/logger', …)`, 8 new tests in one `describe` (+128 lines in the probe); no existing test line changes                                                                                                                                            | AC-11.5, AC-11.6               |
| `src/lib/CLAUDE.md`                                                                                                         | Change       | a `logger.ts` row: §11, `logMutationFailure`, no `server-only`, reads configuration only through `getEnv()`                                                                                                                                                                                                                        | docs                           |
| `src/actions/CLAUDE.md`                                                                                                     | Change       | "… with nothing revalidated and nothing logged" becomes "… with nothing revalidated and the cause written once by `logMutationFailure` (§11)"                                                                                                                                                                                      | docs                           |
| `spec/features-map.md`                                                                                                      | Change       | new row F9, §11, "Log swallowed mutation failures": Files `src/lib/logger.ts`, `src/actions/todos.ts`; Tests `src/lib/logger.test.ts`, `src/actions/todos.test.ts`; ✅ once green. By the code-writer (its hook allows the map), not the dev-lead                                                                                  | F9 (`docs(map)`)               |
| `spec/technical-requirements.md`                                                                                            | Change       | §11 ✗ → ✅ in the closing commit (while ✗, `check-ac-coverage.sh` prints "no tests expected yet" and does not fail the red/skeleton commits; at ✅ it requires AC-11.1 … AC-11.6, all present)                                                                                                                                     | -                              |
| `docs/metrics.md`                                                                                                           | Change       | B1.6 row and the mutation line (dev-lead)                                                                                                                                                                                                                                                                                          | -                              |
| `src/CLAUDE.md`, `eslint.config.mjs`, `stryker.config.mjs`, `package.json`, `src/lib/env.ts`, `prisma/`, `e2e/`, components | none         | `src/CLAUDE.md` tables already trail the code (actions say §5–§7, lib §3–§6): not this card's; the `lib` row of `src/lib/CLAUDE.md` is enough. `stryker.config.mjs` already mutates `src/lib/**/*.ts` (so `logger.ts` is in, only `prisma.ts` and tests are out)                                                                   | -                              |

Stale comments and text that become false with the green commit, all inside the files above: `src/actions/todos.ts`
lines 31 and 49 ("the cause is not logged until a logger card lands") and line 68 ("same as toggle", which pointed
at line 49); the header line of `todos.ts` ("§10: a failed create, toggle, edit or clear resolves to a `form` error")
should also name §11; `src/actions/CLAUDE.md` line 5-7 ("nothing logged"). Nothing else in `src/`, `docs/`, `README.md`
or `.claude/docs` mentions logging (grep).

§10's "Out of scope: … logging the cause" needs no `docs(spec)` edit (Question 3): it states what §10 does not
specify, and it stays true; D-12's "Affects" names §11, the logger and the catch arms, not §10.

Node-runtime assumption: `process.stderr` exists only on the Node runtime. No `runtime = 'edge'` appears in `src/` or
`next.config.ts` (grep), and Server Actions default to Node, so the line is written. If a future card moved an
action to the Edge runtime, `process.stderr.write` would throw a `TypeError` inside the `try` and the logger would
fall silent, still honouring REQ-11.6 (the person sees the §10 result). [unverified in a built app: the repo has
no way to force a failure in `next start`]

## Risks

- **Migration, dependency, configuration:** none. No `eslint.config.mjs`, `stryker.config.mjs`, `package.json`,
  hook or CI change, so no `config-change-approved` label. `console` is not named anywhere (the lint rule stays as
  it is).
- **Security (invariant 7).** The entry carries `message` and `stack`, so everything a driver puts there is
  recorded. Handled: the whole `DATABASE_URL` and its password (as `new URL` returns it) are replaced before the
  cut. Residual, accepted by D-12 and §11's closing paragraph: host and user name stay; a decoded password is not
  matched (Question 2); the typed title is excluded structurally (the signature takes the action name and the error,
  nothing else). Probe against the repo's Prisma 6 client with a closed port: the message of a failed `create` is
  `Invalid \`prisma.todo.create()\` invocation in <file>:<line>:<col>`, a frame of **source text** around the call
site, then `Can't reach database server at \`127.0.0.1:1\``; a title passed as a variable (`SECRETTITLE`) appeared
  neither in the message nor in the stack, while a URL written as a literal in the shown source lines did (my probe
  script held one; the app's source has none). That narrows analysis open question 2's [unverified] to
  validation-error messages that quote arguments, which a Zod-validated path does not produce; not reproduced, not
  claimed gone.
- **Cap versus reason.** In that probe the message was 497 characters and the stack 1703: the Prisma frame precedes
  the reason, and on a longer absolute path the 500-character cut would drop "Can't reach database server". The
  stack starts with `name: message`, so the reason survives there up to 2000 characters; the caps are D-12's, not a
  choice to reopen. Worth a sentence in the PR body.
- **Performance:** one synchronous `getEnv()` (cached), one `new URL`, a few `replaceAll`, one write of at most about
  3 KB per swallowed failure; failures are rare by definition. `process.stderr.write` to a pipe may be asynchronous;
  the line is not awaited (REQ-11.1 asks for the entry "before the result is returned", i.e. the call is made first).
- **Isolation:** no env key, port, storage or cache value; invariant 5 is untouched (`LOG_*` are spec constants named
  at module level, as `src/CLAUDE.md` asks).
- **Existing tests that could turn red or noisy:**
  - Five tests in `src/actions/todos.test.ts` reach a catch arm: the three `AC-10.1` ones, `AC-10.4` and the
    `revalidatePath`-throws one (the brief said four; B1.5 added the fifth). Run against the wired actions with the
    pre-B1.6 test file they stay green and **print five JSON lines** into `pnpm test` (probe, the real logger and
    `getEnv()` with no `DATABASE_URL`: unredacted entries with absolute stack paths). The red commit's `vi.mock` of
    `@/lib/logger` is therefore not optional; with it they stay green and silent, and `vi.resetAllMocks()` in
    `beforeEach` leaves the spy returning `undefined`.
  - Component tests mock the actions module (`@/actions/todos`), never the logger; unaffected. `e2e/` cannot fail a mutation (§10 has
    no fault hook); unaffected.
  - Stryker runs only the `unit` project: `logger.test.ts` and `todos.test.ts` are both in it.
- **Control flow:** `redirect()` / `notFound()` throw in Next; no action calls them, so the blanket catch swallows
  nothing it should not (as B1.5 recorded), and none would now be logged as a failure.
- **Order of commits:** `check-features-map.sh` fails on the skeleton and red commits (a `src/lib` module in no row)
  and passes at the green commit's F9 row; CI judges the PR head. Do not add an F9 row in the skeleton unless the lead
  prefers a ✗ row (the checker accepts missing paths for ✗ rows); the code-writer's green commit is the planned place.
- **Plan size:** the plan has 10 files, three of them one-line docs; keep it on one screen by listing `logger.test.ts`
  and `todos.test.ts` as one line each, as B1.5 did.

## Test strategy

| Layer       | File                        | ACs                                                | Mocks                                                                                                                                                                                                                                                                                                                                                      |
| ----------- | --------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| unit (node) | `src/lib/logger.test.ts`    | AC-11.1, 11.2 (×3), 11.3 (×2), 11.4 (×2), 5 extras | `vi.mock('@/lib/env', () => ({ getEnv: env.getEnv }))` with `vi.hoisted`; `vi.useFakeTimers()` + `vi.setSystemTime(new Date('2026-01-02T03:04:05.678Z'))` in `beforeEach`, `vi.useRealTimers()` in `afterEach`; `vi.spyOn(process.stderr, 'write').mockReturnValue(true)` and the same on `process.stdout`; `mockRestore` in `afterEach`; no `console` spy |
| unit (node) | `src/actions/todos.test.ts` | AC-11.5 (×5), AC-11.6 (×3)                         | the existing `lib`, `cache` mocks plus `vi.hoisted(() => ({ logMutationFailure: vi.fn() }))` and `vi.mock('@/lib/logger', () => ({ logMutationFailure: logger.logMutationFailure }))`; `TodoNotFoundError` from the real lib module (already imported via `importOriginal`)                                                                                |
| e2e         | none                        | none                                               | a real mutation cannot be made to fail (§10 Out of scope), and a stderr line is not browser behavior                                                                                                                                                                                                                                                       |

The logger test re-arms `env.getEnv.mockReturnValue({ DATABASE_URL })` in `beforeEach` after `vi.resetAllMocks()`
(a `vi.fn()` reset returns `undefined`, and `getEnv().DATABASE_URL` would throw into the "unreadable" path and make
every redaction test vacuous: assert on `message` values, not on "no leak" alone).

Red proof, per test (probe: the skeleton above, the real unwired actions, the candidate tests; `vitest run`
JSON classified the way `verify-red.sh` does; result 21 new, 21 failed, 0 passed, no import or transform message):

| Test (title starts with)                                                                                                                                        | Fails on                                                                                                                    |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `AC-11.1: writes one newline-terminated JSON line with level, time, msg, action and error to stderr and nothing to stdout` (the card's `Test:` title, verbatim) | `NotImplementedError: logMutationFailure(toggleTodoAction, Error: db down) is not implemented` at the call                  |
| `AC-11.2:` (a) string `code` `P1001`, (b) number `code` `42`, (c) the string `boom` (three tests)                                                               | the same `NotImplementedError`                                                                                              |
| `AC-11.3:` (a) URL and password redacted, exact message; (b) 600 `x` and 3000 `y` cut to 500 and 2000 (two tests)                                               | the same `NotImplementedError`                                                                                              |
| `AC-11.4:` (a) write throws `EPIPE`; (b) `getEnv()` throws (two tests)                                                                                          | `AssertionError: expected [Function outcome] to not throw an error but 'NotImplementedError: …'` (the `not.toThrow()` line) |
| 5 unprefixed: no `stack`; redact-then-cut straddle; non-Error redacted and cut; passwordless URL; every occurrence                                              | the same `NotImplementedError`                                                                                              |
| `AC-11.5:` ×5 (create, `revalidatePath` throws, toggle, edit, clear)                                                                                            | `expected "vi.fn()" to be called 1 times, but got 0 times`, after the result assertions that already hold                   |
| `AC-11.6:` ×3 (successes; invalid titles; `TodoNotFoundError`)                                                                                                  | the same `got 0 times`, on the **positive control** that ends each test (below)                                             |

Shapes the test-writer needs (all probed):

- **AC-11.1 assertions**: `result` is `undefined`; `stderr` called 1 time, `stdout` 0 times; the single chunk is a string
  whose `split('\n')` has length 2 (the real multi-line stack makes "exactly 1 `\n`" a real check, `JSON.stringify`
  escapes the stack's newlines) and ends with `\n`; `Object.keys` of the parsed entry equals
  `['level', 'time', 'msg', 'action', 'error']` and of `error` equals `['name', 'message', 'stack']`; `time` equals
  `2026-01-02T03:04:05.678Z`; the stack starts with `Error: db down`.
- **Typing helper** in the file: `interface LoggedEntry` and `JSON.parse(chunk) as LoggedEntry` (an assertion from `any`, no
  `as unknown as`, lint clean in the probe); `expect.objectContaining` is not used (`any`, per `testing.md`).
  `Object.assign(new Error('db down'), { code })` builds the coded errors.
- **AC-11.4 (a)**: `stderr.mockImplementation(() => { throw new Error('EPIPE'); })`; `expect(outcome).not.toThrow()`, the
  result is `undefined`, and `stderr` was called (the logger tried). **(b)**: `env.getEnv.mockImplementation(() => { throw
new Error('Invalid environment'); })`; the same, plus exactly 1 chunk whose `error.message` is `db down`.
- **AC-11.5**: per action, `mockRejectedValue(error)` with a kept `const error = new Error('db down')`; the result
  `toEqual` the §10 object; `JSON.stringify(result)` does not contain `db down` (and `cache down` in the
  `revalidatePath` case, with `cache.revalidatePath.mockImplementation(() => { throw error; })` after
  `lib.createTodo.mockResolvedValue(todo())`); `logMutationFailure` called 1 time; `mock.calls[0]` has length 2,
  `[0]` is the action's own name, `[1]` `toBe(error)` (same reference); `JSON.stringify(mock.calls[0])` does not
  contain `Buy milk`. Five plain `it`s, no `it.each`, to keep one behavior per title and the `check-ac-coverage` regex
  trivial. The `revalidatePath` case carries `AC-11.5:` because AC-11.5's Given names it (unlike B1.5's
  `AC-10.4` / `revalidatePath` split).
- **AC-11.6 positive control (Question 6).** Every Then of AC-11.6 is "called 0 times", which is true of today's
  unwired actions, so alone the three tests are green at the base and `verify-red.sh` fails the commit ("GREEN before
  implementation"; B1.4 and B1.5 reviews hit the same rule for recovery assertions). Each test therefore ends with one
  failure that must be logged: (a) four successes, 0 calls, then `lib.clearCompletedTodos.mockRejectedValue(error)` and
  the clear action, 1 call with `('clearCompletedTodosAction', error)`; (b) `   ` and 201 `x` on create and `   ` on
  edit, 0 calls and the `title` errors, then a valid create rejecting, 1 call; (c) `toggleTodo` and `updateTodoTitle`
  each `mockRejectedValueOnce(new TodoNotFoundError('todo-1'))`, 0 calls and `{ id: ['Todo not found'] }`, then
  `toggleTodo.mockRejectedValueOnce(error)`, 1 call. The control adds an assertion to AC-11.6's Then and weakens
  none; it also kills the hand mutant "log before the `instanceof` arm" (below).

Extra unprefixed logger tests and why each exists (REQ-level behavior that no AC states):

1. `omits stack when the Error has none`: `error.stack = undefined`; expects exactly `{ name, message }`.
2. `redacts before cutting, so a URL that straddles the cut leaves no fragment (REQ-11.4)`: message
   `'x'.repeat(490) + DATABASE_URL` becomes `'x'.repeat(490) + '[redacted]'` (500 exactly).
3. `redacts and cuts the text of a thrown non-Error value too (REQ-11.4)`: the URL then 600 `z` becomes `[redacted]` plus 490 `z`.
4. `redacts only the URL when DATABASE_URL has no password`: `postgresql://app@db.internal:5432/lab`; message
   `Can't reach <url>: db down` becomes `Can't reach [redacted]: db down`.
5. `redacts every occurrence of the password`: `s3cret and s3cret` becomes `[redacted] and [redacted]`.

Optional sixth (not probed as an assertion, mutant only): a `code` of `''` is recorded. Skip it unless the reviewer
asks.

Expected totals (probe, `vitest run`, both projects): `pnpm test` 72 → 93 tests, 11 files; skeleton commit 72 passed
and 6 todo; red commit 72 passed and 21 failed (verify-red judges the 21 and ignores the 72); green 93 passed.
Mutation, `pnpm test:mutation`: whole-run score was 82.98 after B1.5; the probe for the two files alone gives
`logger.ts` 95.00 and `todos.ts` 88.46 (unchanged from B1.5's 88.46).

## Mutation hot spots

`src/lib/logger.ts` is inside Stryker's globs (`src/lib/**/*.ts`; only `*.test.ts` and `src/lib/prisma.ts` are
excluded); `vitest.stryker.config.mts` runs the `unit` project, which holds `logger.test.ts` and `todos.test.ts`.
Probe of the candidate: 39 mutants, 19 killed, 19 compile errors (the type checker rejects them), 1 survivor,
score 95.00; `todos.ts` unchanged at 88.46 (23 killed, 2 survived and 1 uncovered, all three pre-existing:
`typeof rawTitle === 'string'` and the `''` fallback in create, `revalidatePath('/')` in toggle), no survivor on the
new lines.

| Mutation (Stryker unless "by hand")                                                                                                                                 | Killed by                                                                                                                                                   | Status                                                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| the literals `'error'`, `'mutation failed'`, `'\n'`, `'NonError'`, `'[redacted]'`, emptied object literals, `slice` removed, `filter` removed, `instanceof` flipped | the 19 Stryker kills split as AC-11.1 (7), AC-11.2 (a) (1), AC-11.2 (c) (1), AC-11.3 (a) (6), AC-11.3 (b) (1), extra test 4 (3)                             | killed                                                                                                                             |
| `typeof code === 'string'` to `false`                                                                                                                               | AC-11.2 (a)                                                                                                                                                 | killed                                                                                                                             |
| `typeof code === 'string'` to `true`                                                                                                                                | Stryker: compile error (`unknown` is not assignable to `string`). By hand with the type checker off: AC-11.2 (b), `1 failed`                                | killed; no `'code' in error` guard, so no equivalent twin                                                                          |
| `typeof error.stack === 'string'` to `true`                                                                                                                         | Stryker: compile error (`string \| undefined` into `scrub`). By hand: extra test 1 (`1 failed`, probe): `slice` of `undefined` throws and the entry is lost | killed                                                                                                                             |
| `instanceof Error` to `true` / `false`                                                                                                                              | AC-11.2 (c) / AC-11.1                                                                                                                                       | killed                                                                                                                             |
| `filter((secret) => secret !== '')` to `true` / `''` literal                                                                                                        | extra test 4 (3 kills): without it `replaceAll('')` writes `[redacted]` between every letter                                                                | killed                                                                                                                             |
| `slice` removed (`MethodExpression`), `filter` removed                                                                                                              | AC-11.3 (b); extra test 4                                                                                                                                   | killed                                                                                                                             |
| emptied `catch` of `secretsOf`                                                                                                                                      | Stryker: compile error (the declared `string[]` return). By hand (return `undefined`): AC-11.4 (b), the entry would be lost                                 | killed                                                                                                                             |
| `return []` to `return ['Stryker was here']` in that `catch`                                                                                                        | nothing can: that string never occurs in a message                                                                                                          | **1 survivor, equivalent in practice**; leave it, do not add a test that plants the marker                                         |
| password before URL (by hand)                                                                                                                                       | AC-11.3 (a), extra tests 2 and 3 (`3 failed`, probe)                                                                                                        | killed                                                                                                                             |
| cut before redact (by hand)                                                                                                                                         | extra tests 2 and 3 (`2 failed`, probe)                                                                                                                     | killed; Stryker cannot generate it                                                                                                 |
| `replaceAll` to `replace` (by hand)                                                                                                                                 | extra test 5 (`1 failed`, probe)                                                                                                                            | killed                                                                                                                             |
| outer `try`/`catch` removed (by hand)                                                                                                                               | AC-11.4 (a) (`1 failed`, probe)                                                                                                                             | killed; Stryker does not mutate an empty `catch`, so AC-11.4 (a) is the only guard and must assert `not.toThrow()` and `undefined` |
| `code ?` truthy instead of `typeof … === 'string'` (by hand)                                                                                                        | AC-11.2 (b) (`1 failed`, probe)                                                                                                                             | killed                                                                                                                             |
| action names: `'createTodoAction'` etc. mutated to other strings (Stryker)                                                                                          | fails to compile against `MutationActionName` (counted as errors); by hand, AC-11.5's `[0]` assertions                                                      | killed; the exact-name assertion is the guard                                                                                      |
| `logMutationFailure` call placed before the `instanceof TodoNotFoundError` arm (by hand)                                                                            | AC-11.6 (c) control (`1 failed`, probe)                                                                                                                     | killed                                                                                                                             |
| `revalidatePath` or the call moved out of the `try`, call dropped from one arm                                                                                      | AC-11.5 (revalidate case; per-action tests)                                                                                                                 | killed by the planned tests                                                                                                        |

Not killed by design: `error.name` read from `error.constructor.name` or a constant `'Error'` (a subclass such as
`TypeError` would log differently): AC-11.1 uses a plain `Error`. If the reviewer cares, one extra test with
`new TypeError('x')` fixes it; the spec says `name = error.name`.

## Questions settled / escalated

```
Question:    Does the skeleton wire the four calls, and how can the stub throw when REQ-11.6 says the logger never throws?
Class:       P0 no conflict
Sources:     backlog/plan/E1-todos.md:67 "once the skeleton stub throws `NotImplementedError`, `logMutationFailure` throws instead of writing the line"
             .claude/rules/testing.md:17 "assertion or the skeleton's `NotImplementedError`, never on an import"
             spec/contracts/09-logging.md:23 "THEN THE SYSTEM SHALL still return the §10 result without throwing"
Conflict:    none (REQ-11.6 binds the implemented function; a stub that exists to be red is not "the system")
Verdict:     S-A. The skeleton adds the stub (throws) and it.todo lines only; the actions are untouched, the action tests
             mock '@/lib/logger' from the red commit on, so the stub runs only in logger.test.ts, where its throw is the
             red. Wiring in the skeleton breaks the four existing tests (no mock yet) or, with a no-op stub, turns AC-11.5
             green before the green commit. The unused-parameter lint trap is solved by interpolating both parameters into
             the NotImplementedError text, as B1.2 did.
Next action: dev-lead writes "Skeleton: src/lib/logger.ts stub (throws), it.todo lines; actions not wired" in plan.md.
Must not:    wire the calls in the skeleton, use a no-op stub, or name the parameters `_action` / `_error` (eslint rejects).
Doc drift:   none
Escalate:    none
```

```
Question:    The contract takes "the `password` of `new URL(value)`", which stays percent-encoded; is a decoded password also redacted?
Class:       P2 spec silent
Sources:     spec/contracts/09-logging.md:21 "IF the recorded `message` or `stack` contains the value of `DATABASE_URL` or the password inside it"
             spec/contracts/09-logging.md:52 "the `password` of `new URL(value)` when it is not empty, replace each occurrence in message and stack with REDACTED,"
Conflict:    none that bites: "the password inside it" can read as the decoded text, but the Function contracts, which win on
             the exact behavior, name the value `new URL(value).password` and no decode step
Verdict:     The contract governs: redact the whole value and `new URL(value).password` as returned (encoded). No
             `decodeURIComponent` branch: it is behavior with no section (invariant 1) and no AC to pin it. Practical risk is
             low: the Prisma messages read in the probe and in analysis quote host, port and user, never a password.
Next action: code-writer implements `secretsOf` as probed; reviewer notes the residual.
Must not:    add a decoded-password branch on taste, or `decodeURIComponent` inside `scrub`.
Doc drift:   none (if the lead wants the decoded form too, it is a §8 change: a D-n, `docs(spec): §11` with a new REQ and AC, then red tests; it would be the seventh criterion at most)
Escalate:    none
```

```
Question:    Must §10's "Out of scope: … logging the cause" be reworded now that §11 logs it?
Class:       P0 no conflict
Sources:     spec/contracts/08-mutation-feedback.md:70 "automatically, a different text per control, logging the cause, optimistic UI, an error page (`error.tsx`)."
             backlog/00-decisions.md:22 "Replaces D-11's sentence that the swallowed error is not logged."
Conflict:    none (an "out of scope" line says what §10 does not specify; it does not forbid §11)
Verdict:     No edit. D-12 replaces D-11's sentence and lists §11 as "as written" and the card's work as the catch arms;
             rewording §10 is not in its "Affects", and the section states a rule, not a history. §10's behavior (message, key, no
             revalidation) is unchanged and its Unchanged-behavior rows are §11's proof, not a change to §10.
Next action: none; the lead may fold a one-word "(§11)" into a `docs(spec): §10` commit if the ambiguity bothers a reader.
Must not:    edit §10 inside the feat or test commits, or read the line as a ban on logging.
Doc drift:   none
Escalate:    none
```

```
Question:    Is another D-n needed for B1.6 (sink, content, level, dependency, config)?
Class:       P0 no conflict
Sources:     backlog/00-decisions.md:22 "Swallowed mutation failures (§11) are logged by an in-repo logger"
             .claude/rules/ts-style.md:18 "`console` is not a logger in `src/` (allowed in scripts, seeds, tests)"
             .claude/rules/invariants.md:18 "**Secrets are never read or printed.**"
Conflict:    none
Verdict:     None. D-12 fixes the sink (`process.stderr.write`), the content (R2) and the exclusions; the logger names no
             `console`, adds no dependency, no `eslint.config.mjs` or `stryker.config.mjs` change and no env key (invariant 5);
             the only secret in §4 is redacted before the write (invariant 7), the input is excluded by signature, and the
             action layer keeps Zod, one lib call, `revalidatePath`, `ActionResult` (invariant 3). Layering holds
             (`actions` -> `lib/logger` -> `lib/env`; no `server-only`, no Prisma).
Next action: dev-lead lists the ten files in plan.md; no D-n request.
Must not:    ask for a D-n, move the logger under a `console` allow-list, or add a log-level key.
Doc drift:   none
Escalate:    none
```

```
Question:    The §11 approval box is unticked (`- [ ] Lead approves spec (lead, <date>)`): does B1.6 wait for a separate act?
Class:       P0 no conflict
Sources:     spec/contracts/09-logging.md:5 "- [ ] Lead approves spec (lead, <date>)"
             backlog/00-decisions.md:17 "the lead ticks the section's `Lead approves spec` box; the plan gate's \"approve\" reply may tick it in the same step."
Conflict:    none
Verdict:     No separate act: D-7 lets the plan gate's "approve" tick it, as it did for §10 twice. The plan must say so in one
             line ("approve" = §11 spec + plan) so the single reply covers both, and nothing under `src/` or any test changes before it.
Next action: dev-lead states "approve ticks §11's box (D-7)" in the plan's gate line.
Must not:    tick the box, or start the skeleton before the `Plan approved by:` line exists.
Doc drift:   none (the tick lands in the `docs(backlog): B1.6 plan approved` commit)
Escalate:    none
```

```
Question:    May each AC-11.6 test end with a positive control (a failure that is logged) although AC-11.6's Then only says "called 0 times"?
Class:       P0 no conflict
Sources:     .claude/rules/testing.md:17 "assertion or the skeleton's `NotImplementedError`, never on an import"
             .claude/rules/spec-fidelity.md:7 "Criteria ids `AC-§.n` are permanent and appear verbatim at the start of test titles."
Conflict:    none (an added assertion is not a loosened one; the three 0-call assertions are kept as written)
Verdict:     Yes, and it is required: without the control the three tests pass at the base and `verify-red.sh` rejects the red
             commit. Precedent: B1.4 review note 1 and B1.5 review note 1 (recovery assertions inside the failure tests). The
             control also pins the position of the call in toggle (after the `TodoNotFoundError` arm).
Next action: test-writer ends AC-11.6 (a), (b), (c) with the controls described under Test strategy.
Must not:    write AC-11.6 as bare "0 calls" tests, or split the control into a separate unprefixed test (it would be green at the base).
Doc drift:   none
Escalate:    none
```
