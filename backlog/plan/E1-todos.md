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

- **Spec:** §5 — unchanged (§7 and §10 unchanged too; tests only, no section edit)
- **Test:** `src/actions/todos.test.ts::AC-5.3: returns fieldErrors.title ["Title is required"] when the form has no title field and stores nothing` — red because: against Stryker mutant `src/actions/todos.ts` 24:54 (`typeof rawTitle === 'string'` → `true`) the result is `title: ['Invalid input: expected string, received null']`, and against 24:96 (`''` → `"Stryker was here!"`) `createTodo` is called; green against the current code by design (tests-only card, no `(red)` commit; see `work/B1.7/analysis.md` Needs a ruling)
- **Acceptance:** the three survivors above are killed; `pnpm test:mutation` above 85.09 %
- **Tier:** quick · **Depends on:** ~~B1.6~~ · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B1.7/` — analysis, plan (rounds 1/1), review (plan rounds 2, diff pass 1/3, 0 findings); squash `07f753a` (#27)
- **Ruled:** D-13 — tests-only hardening cards land without `(red)`; red evidence is the mutation report before and after.

### B1.8 · Log the Prisma error code of a failed connection

_F9 · §11_
**Status: Done** — 287c5a4 (#29); 100 unit/component + 12 e2e green, mutation 88.89 % (actions 100, lib 85.7, logger 95.7); pin 098e5e2, red 18c1a2c, green e2cb5b0

- **Spec:** §11 — unchanged (REQ-11.3, AC-11.2 cases (d)–(g) and Function contracts extended under D-14)
- **Test:** `src/lib/logger.test.ts::AC-11.2: records a string errorCode as error.code when the Error has no string code` — red because: `describeError` in `src/lib/logger.ts` reads only `error.code`, so the entry's `error` keys are `name, message, stack` with no `code` (fails on the key-order assertion, not on an import)
- **Acceptance:** AC-11.2 (cases (d)–(g); (a)–(c) stay green)
- **Tier:** quick · **Depends on:** ~~B1.6~~ · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B1.8/` — decision request, analysis, plan (rounds 1/1), review (plan rounds 2, diff pass 1/3, 1 finding no change needed); squash `287c5a4` (#29)
- **Ruled:** D-14 — the logged `code` is the string `code`, else the string `errorCode`, else absent.

### B1.9 · Redact every form of the database password in logs

_F9 · §11_
**Status: Done** — 5387591 (#31); 106 unit/component + 12 e2e green, mutation 89.47 % (actions 100, lib 86.9, logger 94.9); pin 45dd8c2, red 8039100, green e820652

- **Spec:** §11 — unchanged (REQ-11.4, AC-11.3 cases (c)–(g) and Function contracts extended under D-15)
- **Test:** `src/lib/logger.test.ts::AC-11.3: redacts the decoded and the re-encoded password` — red because: `secretsOf` in `src/lib/logger.ts` returns only the URL and `new URL(url).password` (`p%40ss%2fw`), so `error.message` is `auth p@ss/w, p%40ss%2Fw, [redacted]` instead of `auth [redacted], [redacted], [redacted]` (fails on the message assertion, not on an import)
- **Acceptance:** AC-11.3 (cases (c)–(g); (a), (b) and (f) are green before the change, (c), (d), (e), (g) red)
- **Tier:** quick · **Depends on:** ~~B1.8~~ · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B1.9/` — analysis, plan (rounds 1/1), review (plan rounds 2, diff pass 1/3, 0 findings); squash `5387591` (#31)
- **Ruled:** D-15 — redaction covers the password decoded and re-encoded and the raw and decoded `password`/`sslpassword` query values, longest first.

### B1.10 · End-to-end proof that a failed create keeps the typed title

_F8 · §10_
**Status: Done** — c850ddb (#33); 106 unit/component + 13 e2e green (e2e/10-mutation-feedback.spec.ts new), mutation 89.47 % unchanged (no src/ change); test ef5725a, red evidence at 9327a03 (D-16 A)

- **Spec:** §10 — unchanged (REQ-10.6 and AC-10.5 already state the behavior; tests only, no section edit)
- **Test:** `e2e/10-mutation-feedback.spec.ts::AC-10.5: a create the database rejects shows 1 alert "Could not save, try again" in the form, keeps "Buy milk" in the box, "Add" enabled and the list unchanged; the next Add saves it once` — red because: green against the current code by design (behavior shipped in B1.5 `e7b3390`; tests-only card, D-13 shape, no `(red)` commit); against `9327a03`'s `src/` (pre-B1.5: `createTodoAction` has no `try`, `TodoForm` reads only `fieldErrors.title`) it fails on the alert-count assertion [unverified]; see `work/B1.10/analysis.md` Needs a ruling
- **Acceptance:** AC-10.5 (end to end, through the real form, Server Action and PostgreSQL); REQ-10.6 "list no new todo"
- **Tier:** quick · **Depends on:** ~~B1.5~~ · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B1.10/` — analysis, plan (rounds 1/1), review (plan rounds 2, cap reached, fix accepted by the lead; diff pass 1/3, 1 finding out of scope); squash `c850ddb` (#33)
- **Ruled:** D-16 — e2e-only tests-only cards: red evidence against the pre-card `src/`; DDL fault injection through `prisma.$executeRaw` allowed in `e2e/`.

### B1.11 · Redact the database password exactly as written in `DATABASE_URL`

_F9 · §11_
**Status: Done** — 0b2a6d5 (#36); 115 unit/component + 13 e2e green, mutation 89.02 % (actions 100, lib 87.0, logger 91.4); pin dc3ba53, red 58fe164, green 4dfccfa, hardening 50935fb

- **Spec:** §11 — unchanged (REQ-11.4, AC-11.3 cases (h)–(k) and Function contracts extended under D-17)
- **Test:** `src/lib/logger.test.ts::AC-11.3: redacts the userinfo password as written in DATABASE_URL` — red because: `secretsOf` in `src/lib/logger.ts` takes the password only from `new URL(value).password` (`p%C3%A4%40ss`, decoded `pä@ss`), so for `postgresql://app:pä%40ss@db.internal:5432/lab` `error.message` is `auth pä%40ss` instead of `auth [redacted]` (fails on the message assertion, not on an import)
- **Acceptance:** AC-11.3 (cases (h)–(k), all four red before the change; (a)–(g) stay green)
- **Tier:** quick · **Depends on:** ~~B1.9~~ · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B1.11/` — decision request, analysis, plan (rounds 1/1), review (plan rounds 2, diff pass 1/3, 1 finding fixed by hardening `50935fb`); squash `0b2a6d5` (#36)
- **Ruled:** D-17 — secrets come from both the raw `DATABASE_URL` text and the URL parser, each as written, parsed, decoded and re-encoded.

### B1.12 · `card-status.sh` replaces the whole status paragraph

_tooling · no §_
**Status: Done** — 6ae7be3 (#39); probe backlog/work/B1.12/probe.sh 5/5 PASS (24665de: 4 FAIL); B1.7–B1.11 cleaned (0 added / 23 deleted); no src/ change, mutation 89.02 % unchanged

- **Spec:** none — tooling (`scripts/CLAUDE.md` row "`card-status.sh <id> <Open|Partial|Done> "<evidence>"` rewrites a
  card's status line"); no `src/` change, no section
- **Test:** shell probe on a scratch copy of `backlog/plan/E1-todos.md` — red because: after
  `scripts/card-status.sh B1.10 Done "x"` the card still holds the 5 old continuation lines; expected: the status
  paragraph (the `**Status:` line and every following line up to the first blank line or `- **` line) is exactly
  `**Status: Done** — x`, and every other line of the file is byte-identical
- **Acceptance:** the probe above for a one-line and a multi-line status; the five cards B1.7–B1.11 cleaned (status
  line kept, leftover lines removed); `check-backlog.sh` OK
- **Tier:** quick · **Depends on:** — · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B1.12/` — plan (rounds 1/1), probe.sh, review (plan rounds 2, diff pass 1/3, 1 finding fixed: fixture B9.4); squash `6ae7be3` (#39)

### B1.13 · `worktree-prune.sh` drops the schema of every merged or removed worktree, in every layout

_tooling · no §_
**Status: Done** — 957780e (#46); scripts/prune-smoke.sh 13 of 13 ok (8572cc2's script: 3 of 10, FAIL P1 P2 P3 P4 P7 P8 P10); first real run pruned the card's own worktree and dropped wt_fix_b1_13_prune_every_layout from an app checkout; no src/ change, mutation 89.02 % unchanged; red 175dfb0, green 564e9ac, hardening 3837abc + 0cd8517

- **Spec:** none — tooling (`scripts/CLAUDE.md` row "`worktree-prune.sh` removes merged worktrees, branches,
  schemas; `--schemas`: orphan schemas"); no `src/` change, no section
- **Test:** shell smoke on a throwaway git repo (bare origin, worktrees under `.worktrees/`,
  `.claude/worktrees/<name>/` and `.claude/worktrees/<name>/.worktrees/`) and a throwaway database on the local
  compose server — red because: run from the main checkout or from the `.claude/worktrees/<name>` checkout against
  main's script, a worktree squash-merged on `origin/main` while the local `main` is stale is kept, a nested merged
  worktree is not listed, the schema of a worktree whose directory was deleted stays, an orphan `wt_*` schema is not
  reported, and a worktree with no commits beyond the base is removed
- **Acceptance:** the smoke passes on bash 3.2 from both checkouts: merged worktrees in every layout are removed with
  their schema and branch, compared against `origin/<base>` after a fetch; a worktree whose directory is gone loses
  its schema; a worktree with no commits beyond the base, the current checkout and the app's own
  `.claude/worktrees/<name>` checkouts are never removed (`--all` asks); orphan `wt_*` schemas are reported and
  dropped only with an explicit flag; no database other than the local compose server is touched
- **Tier:** quick · **Depends on:** — · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B1.13/` — plan (rounds 1/1), review (plan rounds 2, cap reached, round-2 fixes accepted by the lead; diff pass 2/3, 2 findings fixed by hardening `3837abc` + `0cd8517`); squash `957780e` (#46)

### B1.14 · `worktree-prune.sh` keeps a branch whose commits net to no change

_tooling · no §_
**Status: Done** — 5400d6a (#50); scripts/prune-smoke.sh 15 of 15 ok (557797e's script: 13 of 15, FAIL P14 P15); prune after merge removed the card's worktree (reason pr #50) and dropped wt_fix_b1_14_prune_keeps_net_empty; no src/ change, mutation 89.02 % unchanged; red cdb93f1, green fbbd9dc

- **Spec:** none — tooling (`scripts/CLAUDE.md` row "`worktree-prune.sh` … removes merged worktrees of every layout
  (vs fetched `origin/main`), branches, schemas"); no `src/` change, no section
- **Test:** new probe in `scripts/prune-smoke.sh` — red because: an M worktree whose branch is a commit plus its
  revert, never on origin, is removed and its branch deleted (reason `tree`); expected: kept with its directory,
  schema and branch, and listed as `[keep]`
- **Acceptance:** the new probe passes, also for a gone directory (branch kept); P1–P13 still pass (a squash-merged
  branch is still removed); `scripts/CLAUDE.md` names the new probe range; `check-backlog.sh` OK
- **Tier:** quick · **Depends on:** — · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B1.14/` — plan (rounds 1/1), review (plan round 1 approved; diff pass 1/3, 0 findings); squash `5400d6a` (#50)

### B1.15 · `docker compose` reaches the one compose server from every checkout

_tooling · no §_
**Status: Done** — 225c4f6 (#52); docker-compose.yml name: level-up-lab; scripts/compose-smoke.sh 6 of 6 ok (6663614's file: 2 of 6, FAIL C2 C3 C4 C5), read-only, no volume/network/container created; no data volume renamed or dropped; no src/ change, mutation 89.02 % unchanged; red 5bf91da, green be8c673

- **Spec:** none — tooling (`scripts/CLAUDE.md` row "`worktree.sh <branch> [base]` … compose PostgreSQL (optional)");
  no `src/` change, no section
- **Test:** shell probe from a `.worktrees/<slug>` and a `.claude/worktrees/<name>` checkout while the main
  checkout's compose Postgres is up — red because: `docker compose ps -q postgres` prints nothing and
  `docker compose config` names the project after the checkout's directory; expected: the advised command lists
  `level-up-lab-postgres-1`, and the advised `up -d` creates no new container, network or volume
  (`docker volume ls` unchanged)
- **Acceptance:** the probe passes from both checkout layouts and from the main checkout; every place that advises
  a compose command (`CLAUDE.md`, `README.md`, `scripts/setup-env.sh`, `scripts/worktree.sh`, the `add-migration`
  skill) reaches the same project; the devcontainer still starts its Postgres; no data volume is renamed or dropped
- **Tier:** quick · **Depends on:** — · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B1.15/` — plan (rounds 1/1, option (a)), review (plan rounds 2, cap reached, round-2 fixes accepted by the lead; diff pass 1/3, 0 findings); squash `225c4f6` (#52)

### B1.16 · Baseline for parallel delivery: lead time and change failure rate per card

_tooling · no §_
**Status: Done** — f53fbf4 (#57); scripts/metrics-smoke.sh 11 of 11 ok (25f66fe: 0 of 10, scripts missing); lead time median 35 min (0.6 h) over 14 cards, B1.1 n/a; change failure rate 1/15 = 6.7 % (#50 → B1.13); no src/ change, mutation 89.02 % unchanged; red 25f66fe, green cb42e66, hardening 2a3f95e + 1b4d382

- **Spec:** none — tooling (`scripts/CLAUDE.md` row to add for `scripts/metrics/`); no `src/` change, no section
- **Test:** shell smoke on a throwaway git repo with a `gh` shim (approval commits, squash merges, fix/revert PRs at
  known times) — red because: `scripts/metrics/lead-time.sh` does not exist, so no per-card value or median is printed
  (red on a missing script, as B1.15 option (b))
- **Acceptance:** `scripts/metrics/lead-time.sh` prints, for each card B1.1–B1.15, the approval time (the later of the
  commit adding `Plan approved by: lead` to `work/<card>/plan.md` and the commit ticking the section's
  `Lead approves spec` box for that card), the squash-merge time of the card's feature PR, the hours between, and the
  median; change failure rate = PRs titled `fix`/`revert` that repair an already-merged card within 14 days
  [estimate] ÷ cards, computed for B1.1–B1.15 by a script or a documented query; `docs/metrics.md` top table gains
  both rows (value, date, how to re-measure); bash 3.2, `git` + `gh` only, no new dependency
- **Tier:** quick · **Depends on:** — · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B1.16/` — plan (rounds 1/1), review (plan rounds 2, cap reached, round-2 fixes accepted by the lead; diff pass 2/3, 3 findings fixed by `2a3f95e` + `1b4d382`); squash `f53fbf4` (#57)

### B1.17 · Plan-scope hook: a card worktree writes only the files of its approved plan

_tooling · no §_
**Status: Done** — 25fee24 (#60); scripts/hook-smoke.sh 284 probes OK (b7fc272: 221 ok, 59 FAIL, scripts missing); plan-scope.sh in settings.json, check-plan-scope.sh in CI guards; no src/ change, mutation 89.02 % unchanged; red b7fc272, green 393aa38, hardening 9e4b64a + 487fe2a + f155633; live check 5 of 5 in a session started at 25fee24: main-thread and code-writer writes outside the plan refused, main-thread test refused, test-writer test allowed (agent_type reaches the hook)

- **Spec:** none — tooling (`.claude/docs/hooks.md` hook table, `scripts/CLAUDE.md`); no `src/` change, no section
- **Test:** new probes in `scripts/hook-smoke.sh` for each worktree layout (`.worktrees/<slug>`,
  `.claude/worktrees/<name>`, nested) — red because: in a worktree on branch `feat/B9.1-x` whose approved plan lists
  only `src/lib/a.ts`, a Write to `src/lib/b.ts` is allowed (exit 0); expected: refused (exit 2) naming the plan
- **Acceptance:** in a card worktree (card id from the branch name) a PreToolUse `Edit|Write|MultiEdit` hook refuses
  a write to a file not listed in the approved `backlog/work/<card>/plan.md` Files table, and every write outside the
  card's work folder while the plan carries no `Plan approved by: lead`; test files (`*.test.ts(x)`, `e2e/`) and
  migrations (`prisma/migrations/`) only through their roles; the filing and closing lanes and non-card checkouts are
  unaffected; probes pass for every layout; `.claude/` change → the PR needs the human-only `config-change-approved`
  label
- **Tier:** quick · **Depends on:** ~~B1.16~~ · **Owner:** Lead · **Size:** M [estimate]
- **Work:** `work/B1.17/` — plan (rounds 1/1; lead chose (a) paperwork allow-list, (A) no skeleton test stubs), review (plan rounds 2, cap reached, round-2 fixes accepted by the lead; diff pass 3/3, 4 findings fixed by `9e4b64a` + `487fe2a` + `f155633`); squash `25fee24` (#60)

### B1.18 · WIP limit: at most three cards in Doing, none sharing a planned file

_tooling · no §_
**Status: Done** — ce47a10 (#63); scripts/next-task-smoke.sh 21 ok on bash 5 and 3.2 (1e16ba4: 1 ok, 15 FAIL); board derived (To do, Doing, Review, Closing), WIP 3 on pick and --claim, --check plan overlap; no src/ change, mutation 89.02 % unchanged; red 1e16ba4, green 06212fd, hardening bbc2d44 + 9db597a + bb7133d

- **Spec:** none — tooling (`backlog/CLAUDE.md`, `scripts/CLAUDE.md`); no `src/` change, no section
- **Test:** shell smoke on a throwaway repo with three cards in Doing — red because: `scripts/next-task.sh` prints a
  fourth card (exit 0) and accepts a card whose plan Files overlap a Doing card's plan Files; expected: both refused
  (exit 1) with the reason
- **Acceptance:** the board shows each remaining card as To do, Doing or Review (`backlog/README.md`, checked by
  `scripts/ci/check-backlog.sh`); `scripts/next-task.sh` refuses a fourth Doing card and refuses a card whose plan
  Files overlap a Doing card's plan Files; `scripts/next-task.sh --list` shows the column; bash 3.2;
  `scripts/next-task.sh` and `scripts/ci/` are protected → the PR needs the human-only `config-change-approved` label
- **Tier:** quick · **Depends on:** ~~B1.17~~ · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B1.18/` — plan (rounds 1/1; lead chose (b) derived board, not split), review (plan rounds 2, cap reached, round-2 fixes accepted by the lead; diff pass 2/3, 3 findings fixed by `bbc2d44` + `9db597a` + `bb7133d`); squash `ce47a10` (#63)

### B1.19 · Git hooks run in every worktree, or the commit stops

_tooling · no §_
**Status: Done** — 29ee42c (#67); scripts/githooks-smoke.sh 6 of 6 on bash 5, 3.2 and linux (36c0641: 1 ok, 5 FAIL); shared hooks installed with the main checkout binary and assert; no src/ change, mutation 89.02 % unchanged; red 36c0641, green 441b7f6 + 60969be, hardening 7ddc5bd

- **Spec:** none — tooling (`.claude/docs/hooks.md` "Git hooks", `scripts/CLAUDE.md`); no `src/` change, no section
- **Test:** shell probe on a throwaway repo with two worktrees, one installed and then removed — red because: a
  commit from the other worktree (no `node_modules`) succeeds and prints "Can't find lefthook in PATH"; expected: the
  hooks run from any worktree whose own or the main checkout's `node_modules` holds lefthook, and otherwise the
  commit is refused with the reason
- **Acceptance:** after any worktree is pruned, a commit from every remaining worktree layout runs the Lefthook hooks
  or fails loudly; `scripts/require-hooks.sh` cannot pass silently through a skipped hook; `lefthook.yml` / `package.json`
  are protected config → the PR needs the human-only `config-change-approved` label and any dependency change the
  lead's OK
- **Tier:** quick · **Depends on:** ~~B1.18~~ · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B1.19/` — plan (rounds 1/1; lead chose layout (b), length accepted), review (plan rounds 2, cap reached, round-2 fixes accepted by the lead; diff pass 1/3, ready, 1 finding fixed by `7ddc5bd`); squash `29ee42c` (#67)

### B1.20 · Plan rows with `[ ]` match their own path in the plan-scope hook and guard

_tooling · no §_
**Status: Open** — `.claude/hooks/plan-scope.sh:36` (`[[ -n "$p" && "$REL" == $p ]]`) and
`scripts/ci/check-plan-scope.sh:25` (`[[ -n "$p" && "$f" == $p ]]`) compare a plan's Files token only as a glob; a
row `src/app/[id]/page.tsx` is the bracket expression `[id]`, so the file it names never matches and its write is
refused (B1.18 diff review pass 2, confirmed in bash; `next-task.sh --check` was fixed the same way in #63)

- **Spec:** none — tooling (`.claude/docs/hooks.md` plan-scope row); no `src/` change, no section
- **Test:** new probes in `scripts/hook-smoke.sh` — red because: with a plan listing `src/app/[id]/page.tsx`, a
  write to that file is refused (exit 2) and `check-plan-scope.sh` lists it as outside the plan (exit 1); expected:
  allowed (exit 0) by both
- **Acceptance:** both compare a token literally before as a glob, in every worktree layout; every existing probe
  still passes; `.claude/` and `scripts/ci/` are protected → the PR needs the human-only `config-change-approved` label
- **Tier:** quick · **Depends on:** ~~B1.17~~ · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B1.20/`

### B1.21 · Parallel sessions report status: draft PR, a ping when waiting, branches kept current

_tooling · no §_
**Status: Done** — b256d60 (#71); scripts/worktree-smoke.sh 6 of 6 on bash 5 and 3.2 (f05525b: 2 ok, 2 FAIL); draft PR at the gate and ready only on green CI (first run on #71); lead chose (b), no ping hook; no src/ change, mutation 89.02 % unchanged; red f05525b, green 0c0b0f5, hardening b1d5c85 + 146a0df + 1c26654

- **Spec:** none — tooling (`.claude/agents/dev-lead.md`, `.claude/skills/work-next/SKILL.md`, `.claude/docs/git-workflow.md`,
  `scripts/CLAUDE.md`); no `src/` change, no section
- **Test:** `scripts/worktree-smoke.sh` on a throwaway repo — red because: `scripts/worktree.sh feat/B9.1-x` in a
  repo whose local `main` is behind `origin/main` cuts the branch from the stale commit (also when origin is
  unreachable after a fetch)
- **Acceptance:** dev-lead opens a DRAFT PR right after the plan gate (the card's status board) and marks it ready
  only on green CI after merging `origin/main` (no force push); the lead learns a session waits from the desktop
  app's end-of-turn notification (lead's choice (b), no hook), and the wait time is read from git/gh by the
  metrics card; `scripts/worktree.sh` cuts new branches from a freshly fetched `origin/main` by default; protected
  paths → the PR carries `config-change-approved` (D-19)
- **Tier:** quick · **Depends on:** ~~B1.19~~ · **Owner:** Lead · **Size:** M [estimate]
- **Work:** `work/B1.21/` — plan (rounds 2/2; lead chose (b) no ping hook, length accepted; round 2 added tdd-loop and reviewer to Files), review (plan rounds 2, cap reached; diff pass 2/3, 10 findings, 9 fixed by `b1d5c85` + `146a0df` + `1c26654`, 1 out of scope); squash `b256d60` (#71)

### B1.22 · Batch review and the parallel-lane metrics: throughput, lead wait time, uncaught plan deviations

_tooling · no §_
**Status: Done** — 11f50ff (#74); scripts/metrics-smoke.sh 23 of 23 on bash 5 and 3.2 (9a33e93: 11 ok, 7 FAIL); throughput 5.04 for the days of B1.1–B1.15 (D-18 target ≥ 6.56), 6.3 for the B1.16–B1.21 days; wait time gate 1 / PR 1 / upper bound 22 min; uncaught plan deviations 0/19; no src/ change, mutation 89.02 % unchanged; red 9a33e93, green 67215eb, review passes 21c9dc7 + 680d8c0, 2112c9a + c7e5b62, 48c0529, a6ab22c + 8ecfece, 289310f

- **Spec:** none — tooling (`.claude/docs/git-workflow.md`, `docs/metrics.md`, `scripts/CLAUDE.md`); no `src/` change, no
  section
- **Test:** new probes in `scripts/metrics-smoke.sh` on its throwaway repo and `gh` shim — red because: `scripts/metrics/
throughput.sh`, `wait-time.sh` and `plan-deviations.sh` do not exist, so no cards-per-8-hour value, no plan-gate or PR
  wait, and no count of merged files outside an approved plan is printed
- **Acceptance:** `git-workflow.md` documents batch review (the lead reviews plans and PRs in batches, e.g. twice a
  day); throughput per D-18 (cards merged ÷ Σ daily active spans × 8, UTC+7) with its B1.1–B1.21 baseline; session
  wait time for the lead (plan gate = `<card> plan approved` commit − the commit before it; PR = merge − completion of
  the last green `ci` run on the head); plan deviations no hook caught (merged card PRs with a non-paperwork file outside
  the approved plan); each gets a `docs/metrics.md` top-table row with value, date and how to re-measure; bash 3.2,
  `git` + `gh` only
- **Tier:** quick · **Depends on:** ~~B1.21~~ · **Owner:** Lead · **Size:** M [estimate]
- **Work:** `work/B1.22/` — plan (rounds 2/2, cap; lead chose X literal, Y (a), Z bypass counter, length accepted), review (diff passes 3/3, 10 findings fixed; lead rulings (a) on pass-1 [4], no approval counts from #60, and on pass-2 [1], a selection picks whole days); squash `11f50ff` (#74)

### B1.23 · Card sessions run their own PR steps: push, open, label, mark ready

_tooling · no §_
**Status: Partial** — merged 97fb986 (#99); pending the live check: batch 4's card sessions (from a checkout at or after 97fb986) run `scripts/pr-step.sh push`, `draft` and `ready` with no refusal. pr-step-smoke 10 of 10 and hook-smoke 309 on bash 3.2 and 5.2 (red 2167759: 0 ok, 10 FAIL); no src/ change, mutation 92.95 on CI

- **Spec:** none — tooling (`.claude/settings.json`, `.claude/docs/hooks.md`); no `src/` change, no section
- **Test:** `scripts/pr-step-smoke.sh` (new) and guard and settings probes in `scripts/hook-smoke.sh` — red because: no
  wrapper exists, `guard-bash.sh` passes a redirect or command substitution in a wrapper call, and `.claude/settings.json`
  allows nothing, so a session's PR steps fall to auto mode's judgement
- **Acceptance:** (plan round 3, lead's choice (B)) `scripts/pr-step.sh` runs exactly `push`, `draft "<title>"` (fixed
  body file `backlog/work/<card>/pr-body.md`) and `ready <n> [--undo]`, on the current card branch only; `guard-bash.sh`
  lets a wrapper call through only as one plain segment from the top level with the tracked, unmodified script;
  `permissions.allow` is exactly `Bash(scripts/pr-step.sh *)`; the 16 deny entries stay; `scripts/pr-step.sh` is
  protected config; dev-lead Loop 5/9 call the wrapper; the next card session runs push, draft and ready with no refusal;
  the PR carries `config-change-approved` (D-19). Labels and the PR body edit stay outside the wrapper
- **Tier:** quick · **Depends on:** — · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B1.23/` — plan (review rounds 2/2, cap; lead chose (B), then approved round 2 with the guard-bash row and its cost), review (diff passes 3/3; 12 findings fixed, pass-3 [1] carried: a suffixed-title length probe); squash `97fb986` (#99)

### B1.24 · guard-bash blocks every forced-push and branch-delete spelling

_tooling · no §_
**Status: Open** — B1.23 plan review round 1 ran `.claude/hooks/guard-bash.sh` on a copy: these exit 0 (pass) today while
invariant 6 says an agent never force-pushes: a quoted `+refspec` (`'+main'`, `"+feat/x"`), a `+` before a non-letter
(`+@:feat/x`, `+0a1b2c3:refs/heads/feat/x`, `+$BR`), `--mirror`, `git -C . push` with a force flag; and deleting
another card's branch passes too (`--delete`, `:branch`, `--prune`). The `main` ruleset does not protect card branches

- **Spec:** none — tooling (`.claude/hooks/guard-bash.sh`, `.claude/docs/hooks.md`); no `src/` change, no section
- **Test:** new exit-2 probes in `scripts/hook-smoke.sh`, one per spelling above — red because: `guard-bash.sh` exits 0
  on each today
- **Acceptance:** every spelling above exits 2 with the force-push message; plain `git push`, `git push -u origin
feat/x` and `scripts/pr-step.sh push` (B1.23) still exit 0; the existing force-push probes stay; the PR carries
  `config-change-approved` (D-19)
- **Tier:** quick · **Depends on:** — · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B1.24/`

### B1.25 · verify-red reads escaped quotes in existing test titles

_tooling · no §_
**Status: Open** — `scripts/verify-red.sh` `baseTitles` keeps the escapes of a quoted test title it reads from source
(`titles.add(m[2])`), so a title written `'… query \'\' …'` at the base never equals vitest's `… query '' …`; the
existing test counts as new and passing, and the script reports "GREEN before implementation" (exit 1). Seen on B4.2's
red commit b5fc079 (two AC-16.5 titles); a copy with `m[2].replace(/\\(.)/g, '$1')` reports red for the right reason

- **Spec:** none — tooling (`scripts/verify-red.sh`, a new smoke); no `src/` change, no section
- **Test:** `scripts/verify-red-smoke.sh` (new) on a throwaway worktree — red because: a base test whose title has an
  escaped quote, kept unchanged next to a new failing test, makes `verify-red.sh` exit 1 ("GREEN before implementation")
- **Acceptance:** an existing title with escaped quotes (single, double, backtick) is recognised as old; a new failing
  test still makes the card red; a new passing test still fails the gate; the PR carries `config-change-approved`
  (D-19: `scripts/verify-red.sh`)
- **Tier:** quick · **Depends on:** — · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B1.25/`

### B1.26 · pr-step opens a card closing PR

_tooling · no §_
**Status: Open** — `scripts/pr-step.sh:41` reads the `draft` body only from `backlog/work/<card>/pr-body.md`, and
`draft` opens only drafts. After a card's feature PR merges, that file on `main` holds the feature PR's body, and the
closing lane (`backlog/CLAUDE.md` "Closing a card") may not touch it, so B4.1's closing PR #113 (branch
`docs/B4.1-done`) was opened with a plain `gh pr create` outside the wrapper. The filing lane lists no work-folder file
either, so a filing PR has the same gap

- **Spec:** none — tooling (`scripts/pr-step.sh`, `scripts/pr-step-smoke.sh`, `.claude/agents/dev-lead.md`); no `src/`
  change, no section
- **Test:** new probes in `scripts/pr-step-smoke.sh` — red because: on a `docs/<card>-done` branch whose
  `pr-body.md` holds the feature PR's body, `draft` opens the PR with that body, and no step opens a closing PR from a
  body file the closing lane may write
- **Acceptance:** a closing PR (and a filing PR) opens through the wrapper from a body file that is neither the feature
  PR's `pr-body.md` nor outside its lane's checklist (design set by the plan); `push`, `draft` and `ready` on a card's
  feature branch are unchanged; pr-step-smoke R1–R10 stay green; the PR carries `config-change-approved` (D-19:
  `scripts/pr-step.sh`)
- **Tier:** quick · **Depends on:** — · **Owner:** Lead · **Size:** S [estimate]
- **Work:** `work/B1.26/`
