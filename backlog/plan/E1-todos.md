# E1 · Todos

### B1.1 · Todo list: list, create, toggle

_F3 F4 F5 · §5_
**Status: Done** — `c7153b2` (#1); 34 unit/component tests, 5 e2e, mutation 78.87 % (actions 71.4, lib 80.7).

- **Spec:** §5 — unchanged
- **Test:** `src/actions/todos.test.ts::AC-5.2: creates the trimmed title as a not-completed todo and revalidates / once` — red because: `createTodoAction` rejected with `NotImplementedError`
- **Acceptance:** AC-5.1 … AC-5.7
- **Tier:** full · **Depends on:** — · **Owner:** Lead · **Size:** M [estimate]
- **Work:** red `61cb3f4`, `7af9887` (mock fix) · green `d99c241` · squash `c7153b2`

### B1.2 · Edit a todo title

_F6 · §6_
**Status: Done** — fc812e3 (#5); 55 unit/component + 9 e2e green, mutation 81.40 % (actions 85.7, lib 80.0); red fa7a3dd, green 78f73f4, hardening 8ac5f37

- **Spec:** §6 — unchanged (section written from `work/B1.2/analysis.md` + `advice.md`)
- **Test:** `src/actions/todos.test.ts::AC-6.2: updates the trimmed title and revalidates / once` — red because: `updateTodoTitleAction` is not exported from `src/actions/todos.ts`
- **Acceptance:** AC-6.1 … AC-6.7
- **Tier:** full · **Depends on:** ~~B1.1~~ · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B1.2/` — analysis.md (spec-analyst), advice.md (advisor, approach A: schema `createTodoSchema.extend(toggleTodoSchema.shape)`, `findUnique` then `update` with `data: { title }`, icon-only edit button so AC-5.1's row text stays unchanged); plan.md approved 2026-10-28 (rounds 1/1), review.md (plan + diff review, passes 1/3) · squash `fc812e3` (#5)

### B1.3 · Clear completed todos

_F7 (new) · §9_
**Status: Done** — 1ec6cb0 (#8); 63 unit/component + 12 e2e green, mutation 82.22 % (actions 86.4, lib 80.9); red 74c5a3d, green db784ad

- **Spec:** §9 — unchanged (section written from `work/B1.3/analysis.md`)
- **Test:** `src/actions/todos.test.ts::AC-9.1: deletes every completed todo, returns the count and revalidates / once` — red because: `clearCompletedTodosAction` is not exported from `src/actions/todos.ts`
- **Acceptance:** AC-9.1 … AC-9.3
- **Work:** `work/B1.3/` — analysis, advice, plan (rounds 1/1), review (plan + diff, passes 1/3); squash `1ec6cb0` (#8)
- **Tier:** quick · **Depends on:** ~~B1.1~~ · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B1.3/` (analysis.md)
- **Ruled:** D-10 — button always rendered, disabled while nothing is completed.

### B1.4 · Feedback when a mutation fails

_F8 (new) · §10_
**Status: Done** — b605e3f (#11); 67 unit/component + 12 e2e green, mutation 82.80 % (actions 88.0, lib 80.3); red 025938b, green 0c8db17

- **Spec:** §10 — unchanged (section written from `work/B1.4/analysis.md`)
- **Test:** `src/actions/todos.test.ts::AC-10.1: resolves fieldErrors.form ["Could not save, try again"] when the lib rejects with another error and does not revalidate` — red because: `toggleTodoAction` rethrows a non-`TodoNotFoundError` (`todos.ts` `throw error`), so the awaited promise rejects instead of resolving to `{ ok: false, fieldErrors: { form: [...] } }`
- **Acceptance:** AC-10.1 … AC-10.3
- **Tier:** quick · **Depends on:** ~~B1.1~~ ~~B1.2~~ ~~B1.3~~ · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B1.4/` — analysis, plan (rounds 1/1), review (plan + diff, passes 1/3); squash `b605e3f` (#11)
- **Ruled:** D-11 — Server Actions never reject for an expected failure; `fieldErrors.form` carries the message.

### B1.5 · Feedback when creating a todo fails

_F8 · §10_
**Status: Done** — e7b3390 (#13); 72 unit/component + 12 e2e green, mutation 82.98 % (actions 88.5, lib 80.9); red 311c8ef, green 73db034, review fixes 933962a, 0e3d738

- **Spec:** §10 — unchanged (amended within D-11 from `work/B1.5/analysis.md`)
- **Test:** `src/actions/todos.test.ts::AC-10.4: resolves fieldErrors.form ["Could not save, try again"] when createTodo rejects and does not revalidate` — red because: `createTodoAction` awaits `createTodo` with no try/catch (`src/actions/todos.ts:26`), so the awaited promise rejects instead of resolving to `{ ok: false, fieldErrors: { form: [...] } }`
- **Acceptance:** AC-10.4 … AC-10.5
- **Tier:** full · **Depends on:** ~~B1.4~~ · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B1.5/` — analysis, advice, plan (rounds 2/2: A dropped the native POST), review (plan rounds 2, diff passes 3/3, 2 findings fixed); squash `e7b3390` (#13)

### B1.6 · Log swallowed mutation failures

_F9 (new) · §11_
**Status: Done** — f191c34 (#15); 94 unit/component + 12 e2e green, mutation 85.09 % (actions 88.5, lib 84.1, logger 95.0); skeleton 592977a, red 67294c1, green ff66382, review test 51f7399

- **Spec:** §11 — unchanged (section written from `work/B1.6/analysis.md`)
- **Test:** `src/lib/logger.test.ts::AC-11.1: writes one newline-terminated JSON line with level, time, msg, action and error to stderr and nothing to stdout` — red because: `src/lib/logger.ts` does not exist yet; once the skeleton stub throws `NotImplementedError`, `logMutationFailure` throws instead of writing the line
- **Acceptance:** AC-11.1 … AC-11.6
- **Tier:** full · **Depends on:** ~~B1.5~~ · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B1.6/` — analysis, advice, plan (rounds 1/1), review (plan round 1, diff pass 1/3, 1 coverage finding fixed); squash `f191c34` (#15)
- **Ruled:** D-12 — in-repo stderr JSON logger; name, message, string code, stack; secrets scrubbed; input never logged.

### B1.7 · Kill pre-existing mutation survivors

_F3 F4 F8 · §5 §7 §10_
**Status: Done** — 07f753a (#27); 96 unit/component + 12 e2e green, mutation 88.60 % (actions 100, lib 85.2); hardening 0af8a79 (D-13, no red commit); todos.ts 24:54, 24:96, 46:20 and action-result.ts 18:55 Killed
code: `src/actions/todos.ts:24` (`typeof rawTitle === 'string'` → `true`; the `''` fallback → `"Stryker was here!"`:
no test submits a form without a string `title`), `src/actions/todos.ts:46` (toggle's `revalidatePath('/')` →
`revalidatePath('')`: `AC-5.4: returns the toggled todo and revalidates /` counts calls, never the path),
`src/lib/action-result.ts:18` (`|| 'form'`: no test builds a Zod issue without a path). Tests only; no behavior
change.

- **Spec:** §5 — unchanged (§7 and §10 unchanged too; tests only, no section edit)
- **Test:** `src/actions/todos.test.ts::AC-5.3: returns fieldErrors.title ["Title is required"] when the form has no title field and stores nothing` — red because: against Stryker mutant `src/actions/todos.ts` 24:54 (`typeof rawTitle === 'string'` → `true`) the result is `title: ['Invalid input: expected string, received null']`, and against 24:96 (`''` → `"Stryker was here!"`) `createTodo` is called; green against the current code by design (tests-only card, no `(red)` commit; see `work/B1.7/analysis.md` Needs a ruling)
- **Acceptance:** the three survivors above are killed; `pnpm test:mutation` above 85.09 %
- **Tier:** quick · **Depends on:** ~~B1.6~~ · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B1.7/` — analysis, plan (rounds 1/1), review (plan rounds 2, diff pass 1/3, 0 findings); squash `07f753a` (#27)
- **Ruled:** D-13 — tests-only hardening cards land without `(red)`; red evidence is the mutation report before and after.

### B1.8 · Log the Prisma error code of a failed connection

_F9 · §11_
**Status: Done** — 287c5a4 (#29); 100 unit/component + 12 e2e green, mutation 88.89 % (actions 100, lib 85.7, logger 95.7); pin 098e5e2, red 18c1a2c, green e2cb5b0
Prisma's `PrismaClientInitializationError` (database down) carries its code as `errorCode?: string`
(`@prisma/client` `runtime/library.d.ts`), so a database-down entry has `name`, `message`, `stack` and no code.
§11 REQ-11.3 names only `code`: a §11 change, ruled by D-14.

- **Spec:** §11 — unchanged (REQ-11.3, AC-11.2 cases (d)–(g) and Function contracts extended under D-14)
- **Test:** `src/lib/logger.test.ts::AC-11.2: records a string errorCode as error.code when the Error has no string code` — red because: `describeError` in `src/lib/logger.ts` reads only `error.code`, so the entry's `error` keys are `name, message, stack` with no `code` (fails on the key-order assertion, not on an import)
- **Acceptance:** AC-11.2 (cases (d)–(g); (a)–(c) stay green)
- **Tier:** quick · **Depends on:** ~~B1.6~~ · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B1.8/` — decision request, analysis, plan (rounds 1/1), review (plan rounds 2, diff pass 1/3, 1 finding no change needed); squash `287c5a4` (#29)
- **Ruled:** D-14 — the logged `code` is the string `code`, else the string `errorCode`, else absent.

### B1.9 · Redact every form of the database password in logs

_F9 · §11_
**Status: Done** — 5387591 (#31); 106 unit/component + 12 e2e green, mutation 89.47 % (actions 100, lib 86.9, logger 94.9); pin 45dd8c2, red 8039100, green e820652
`new URL(url).password` is the percent-encoded userinfo as the URL parser normalizes it, so a driver message quoting the
decoded password (`p@ss` for `p%40ss`), a differently encoded form, or a `password`/`sslpassword` query parameter of
`DATABASE_URL` is written verbatim (B1.6 review note 1, plan review note 4). §11 REQ-11.4 names only the URL and "the
password inside it": a §11 change, ruled by D-15.

- **Spec:** §11 — unchanged (REQ-11.4, AC-11.3 cases (c)–(g) and Function contracts extended under D-15)
- **Test:** `src/lib/logger.test.ts::AC-11.3: redacts the decoded and the re-encoded password` — red because: `secretsOf` in `src/lib/logger.ts` returns only the URL and `new URL(url).password` (`p%40ss%2fw`), so `error.message` is `auth p@ss/w, p%40ss%2Fw, [redacted]` instead of `auth [redacted], [redacted], [redacted]` (fails on the message assertion, not on an import)
- **Acceptance:** AC-11.3 (cases (c)–(g); (a), (b) and (f) are green before the change, (c), (d), (e), (g) red)
- **Tier:** quick · **Depends on:** ~~B1.8~~ · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B1.9/` — analysis, plan (rounds 1/1), review (plan rounds 2, diff pass 1/3, 0 findings); squash `5387591` (#31)
- **Ruled:** D-15 — redaction covers the password decoded and re-encoded and the raw and decoded `password`/`sslpassword` query values, longest first.

### B1.10 · End-to-end proof that a failed create keeps the typed title

_F8 · §10_
**Status: Done** — c850ddb (#33); 106 unit/component + 13 e2e green (e2e/10-mutation-feedback.spec.ts new), mutation 89.47 % unchanged (no src/ change); test ef5725a, red evidence at 9327a03 (D-16 A)
`src/components/todo-form.test.tsx` mocks `createTodoAction` (AC-10.5). No file in `e2e/` makes a create fail
(`ls e2e`: `05-todos.spec.ts`, `06-edit-title.spec.ts`, `09-clear-completed.spec.ts`, `smoke.spec.ts`), so the real
`useActionState` form, Server Action, Prisma error and §11 log line are never exercised together in Chromium.
Fault injection is ruled (lead, option B): the e2e test adds a PostgreSQL trigger on `todos` that rejects inserts and
drops it afterwards; no app, env or config change; the raw SQL in `e2e/` is reviewed by this card's reviewer.

- **Spec:** §10 — unchanged (REQ-10.6 and AC-10.5 already state the behavior; tests only, no section edit)
- **Test:** `e2e/10-mutation-feedback.spec.ts::AC-10.5: a create the database rejects shows 1 alert "Could not save, try again" in the form, keeps "Buy milk" in the box, "Add" enabled and the list unchanged; the next Add saves it once` — red because: green against the current code by design (behavior shipped in B1.5 `e7b3390`; tests-only card, D-13 shape, no `(red)` commit); against `9327a03`'s `src/` (pre-B1.5: `createTodoAction` has no `try`, `TodoForm` reads only `fieldErrors.title`) it fails on the alert-count assertion [unverified]; see `work/B1.10/analysis.md` Needs a ruling
- **Acceptance:** AC-10.5 (end to end, through the real form, Server Action and PostgreSQL); REQ-10.6 "list no new todo"
- **Tier:** quick · **Depends on:** ~~B1.5~~ · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B1.10/` — analysis, plan (rounds 1/1), review (plan rounds 2, cap reached, fix accepted by the lead; diff pass 1/3, 1 finding out of scope); squash `c850ddb` (#33)
- **Ruled:** D-16 — e2e-only tests-only cards: red evidence against the pre-card `src/`; DDL fault injection through `prisma.$executeRaw` allowed in `e2e/`.

### B1.11 · Redact the database password exactly as written in `DATABASE_URL`

_F9 · §11_
**Status: Done** — 0b2a6d5 (#36); 115 unit/component + 13 e2e green, mutation 89.02 % (actions 100, lib 87.0, logger 91.4); pin dc3ba53, red 58fe164, green 4dfccfa, hardening 50935fb
contracts take them from `url.search` and the password from `url.password`, both normalized by the URL parser
(`src/lib/logger.ts:51`: `const url = new URL(value);`, then `url.password` and `querySecretsOf(url.search)`). Probe
(`node -e`): `postgresql://app:pä%40ss@db.internal:5432/lab` gives `url.password` `p%C3%A4%40ss`, decoded `pä@ss`,
re-encoded `p%C3%A4%40ss`, so the written form `pä%40ss` is no secret; `…/lab?password=a b%26c` gives `url.search`
`?password=a%20b%26c`, so the written `a b%26c` is no secret. A driver message quoting either form would be logged
verbatim (B1.9 diff review, riskiest unfalsified; no such driver found). A §11 change, ruled by D-17 (`work/B1.11/decision-request.md`).

- **Spec:** §11 — unchanged (REQ-11.4, AC-11.3 cases (h)–(k) and Function contracts extended under D-17)
- **Test:** `src/lib/logger.test.ts::AC-11.3: redacts the userinfo password as written in DATABASE_URL` — red because: `secretsOf` in `src/lib/logger.ts` takes the password only from `new URL(value).password` (`p%C3%A4%40ss`, decoded `pä@ss`), so for `postgresql://app:pä%40ss@db.internal:5432/lab` `error.message` is `auth pä%40ss` instead of `auth [redacted]` (fails on the message assertion, not on an import)
- **Acceptance:** AC-11.3 (cases (h)–(k), all four red before the change; (a)–(g) stay green)
- **Tier:** quick · **Depends on:** ~~B1.9~~ · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B1.11/` — decision request, analysis, plan (rounds 1/1), review (plan rounds 2, diff pass 1/3, 1 finding fixed by hardening `50935fb`); squash `0b2a6d5` (#36)
- **Ruled:** D-17 — secrets come from both the raw `DATABASE_URL` text and the URL parser, each as written, parsed, decoded and re-encoded.

### B1.12 · `card-status.sh` replaces the whole status paragraph

_tooling · no §_
**Status: Open** — `scripts/card-status.sh` rewrites only the first line of a card's status paragraph:
`incard && /^\*\*Status: / { print "**Status: " new "** — " ev; incard = 2; next }` prints the new line and then
copies every following line unchanged, so a status written over several lines keeps its old continuation lines under
the new `**Status: Done**` line. Five closed cards show it on `main` (`75c0ecf`): B1.7 (5 leftover lines), B1.8 (3),
B1.9 (4), B1.10 (5), B1.11 (6), e.g. B1.10's "Done — c850ddb (#33) …" is followed by "`src/components/todo-form.test.tsx`
mocks `createTodoAction` (AC-10.5). No file in `e2e/` makes a create fail …". `scripts/ci/check-backlog.sh` reads only
the first status line, so CI stays green. `scripts/card-status.sh` is a protected path
(`scripts/ci/check-config-change.sh` `PROTECTED`): the fix PR needs the human-only `config-change-approved` label.

- **Spec:** none — tooling (`scripts/CLAUDE.md` row "`card-status.sh <id> <Open|Partial|Done> "<evidence>"` rewrites a
  card's status line"); no `src/` change, no section
- **Test:** shell probe on a scratch copy of `backlog/plan/E1-todos.md` — red because: after
  `scripts/card-status.sh B1.10 Done "x"` the card still holds the 5 old continuation lines; expected: the status
  paragraph (the `**Status:` line and every following line up to the first blank line or `- **` line) is exactly
  `**Status: Done** — x`, and every other line of the file is byte-identical
- **Acceptance:** the probe above for a one-line and a multi-line status; the five cards B1.7–B1.11 cleaned (status
  line kept, leftover lines removed); `check-backlog.sh` OK
- **Tier:** quick · **Depends on:** — · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B1.12/`
