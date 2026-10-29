# B1.10 review

SCOPE: ui

## Plan review (round 1)

Reviewed at HEAD `96b9d4c` (`docs(backlog): B1.10 plan`). Read: `plan.md`, `analysis.md`, card B1.10, §10
(`spec/contracts/08-mutation-feedback.md`), `00-decisions.md` D-10–D-14, `e2e/CLAUDE.md`, `playwright.config.ts`,
`.github/workflows/ci.yml` + `review.yml:57`, `scripts/worktree.sh`, `scripts/verify-red.sh`,
`scripts/ci/check-features-map.sh`, `src/components/todo-form.tsx` (HEAD and `9327a03`), `src/actions/todos.ts`.

### Probes (on copies under `$TMPDIR`, throwaway schemas `b110_review_*` on the compose server, all dropped after)

| Probe                                                                                                                                                      | Result                                                                                                                                                                                                                                                                                                       |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| The plan's four `$executeRaw` tagged templates, verbatim, through `PrismaClient` with `?schema=b110_review_probe`                                          | function created in `b110_review_probe` (the `?schema=` search path, not `public`); `prisma.todo.create` rejects with `PrismaClientUnknownRequestError` (Postgres `P0001` `e2e: insert rejected`); count stays 0; after the two `DROP … IF EXISTS` a create succeeds; a second install after a drop succeeds |
| `pnpm test` in the worktree                                                                                                                                | `Tests  100 passed (100)` (the plan's number)                                                                                                                                                                                                                                                                |
| e2e count                                                                                                                                                  | 3 + 4 + 3 + 2 = 12 tests in `e2e/` today (the plan's "12 → 13")                                                                                                                                                                                                                                              |
| A test written to the analysis's Arrange/Act/Assert (reviewer's own copy, not the deliverable) against HEAD's `src/`, port 3977, schema `b110_review_head` | `1 passed`; the runner printed `[WebServer] {"level":"error",…,"msg":"mutation failed","action":"createTodoAction",…"e2e: insert rejected"…}`                                                                                                                                                                |
| Same file against `9327a03`'s tree (`git archive`), port 3978, schema `b110_review_old`                                                                    | `1 failed` at `expect(locator('form').getByRole('alert')).toHaveCount(1)`: `Expected: 1  Received: 0`; the runner printed the uncaught Prisma error from `createTodoAction`                                                                                                                                  |

Option A's red is reproducible, and the approach is green at HEAD.

### Checklist

| Check                                                                             | Result                                                                                                                                                                                                                                                                                                               |
| --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: `e2e/10-mutation-feedback.spec.ts` is §10 (F8); F8 tests column gets it; `check-features-map.sh` only needs the path to exist                                                                                                                                                                                  |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass\*: no `src/` interface changes. Raw SQL in `e2e/` goes against `ts-style.md` ("`$queryRaw` only … in `src/lib`") and the `review.yml:57` bot line. The plan covers this through proposed D-16 (tagged, no interpolation, DDL only, `e2e_` names). It passes only if the lead rules D-16 with the raw-SQL clause |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: no `advice.md`; the plan says the advisor was skipped (tier quick, no `src/lib/todos.ts` query change), which `dev-lead.md:34` allows                                                                                                                                                                          |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: §10 stays at 5. The test asserts AC-10.5's Then (1 → 0 alerts in the form, exact text, box `Buy milk` → `''`, Add enabled), plus list text and row counts for REQ-10.6 "list no new todo"                                                                                                                      |
| verification lists exact commands with expected numbers                           | **fail**: see reason 1. The red-proof line ("scratch worktree at 9327a03 + this spec file → … fails on the alert count") names no command, port, schema or spec-file route, and has no output that tells a real red apart from a fault that never reached the server                                                 |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass\*: the plan states the deviation (D-13 shape: no skeleton, no `(red)`, no `feat`). `verify-red.sh --auto` skips a `test(...)` commit without `(red)` (`verify-red.sh:45`). The map and review steps carry convention subjects                                                                                   |
| the section has a `Lead approves spec` box, ticked only by a human                | pass: §10 is unchanged and its boxes were ticked by the lead at the B1.4/B1.5 gates; no new box is needed and the reviewer ticks none                                                                                                                                                                                |
| no settled D-n contradicted                                                       | pass\*: D-13's red evidence (a Stryker report) cannot apply because Stryker never runs e2e. The plan proposes D-16 instead of departing silently. The lead must rule D-16 before step 2                                                                                                                              |

### Reasons (changes requested)

1. **The red-proof step (step 3, D-16 A) is not runnable as written, and its expected result does not discriminate.**
   On its own, a failure at `toHaveCount(1)` against `9327a03` is also what you get when the fault never reaches the
   server's schema. Concrete trigger: the spec file runs with a `PrismaClient` on one schema (for example the feature
   worktree's `.env`) against a dev server on another (the scratch tree's). The trigger lands in the test's schema,
   the server's insert succeeds, no alert appears, and the test fails on the same line with nothing missing in `src/`.
   A second trap is `reuseExistingServer: !process.env.CI`: if a server is already listening on the scratch PORT
   (for example the feature worktree's own dev server when the PORT is copied over), Playwright reuses it, and the
   "red" run tests whatever code that server is running. The plan must name:
   - the exact commands. For example, from the main checkout: `scripts/worktree.sh <scratch-name> 9327a03` (its own
     PORT and `wt_…` schema), then `pnpm install --frozen-lockfile && pnpm db:deploy`, then put the spec file into the
     scratch `e2e/` and say who does it (`dev-lead`'s Edit/Write is path-guarded to `backlog/`, so name it as a Bash
     copy or a test-writer step), then `pnpm exec playwright test e2e/10-mutation-feedback.spec.ts`, then remove the
     scratch worktree and branch (never pushed)
   - a check that the scratch PORT is free before the run
   - the expected output: `1 failed` at the alert-count assertion, **and** the runner's `[WebServer]` output for the
     same run containing `e2e: insert rejected` (the old action's uncaught Prisma error). That line proves the fault
     reached the server's schema. Both go into `review.md`

   In the reviewer's probe this pair showed up exactly. Without the second line, option A proves no more than option
   C.

### Notes (no change required)

- Analysis Q3 says Playwright does not expose the server's stderr. That is true for the test body. But when
  Playwright starts the server itself (CI, or locally with no server on the PORT), the runner prints it as
  `[WebServer] …`, and that is where reason 1's discriminator comes from. The decision not to assert the §11 line in
  the test still stands.
- `page.locator('form')` matches 1 form today. A row in edit mode adds a second `<form>`, but this test never opens
  one, so the count stays correct. Scoping to the form that holds the "New todo" box would make the test independent
  of row edit forms. That choice is optional.
- The plan has no branch for "the test is red at HEAD", which would mean a §10 bug and reshape the card into
  `(red)` + `feat`. The probe falsified that risk (green at HEAD), so no stop rule is required. If it does happen, the
  test-writer should stop and report rather than adjust the assertions.
- The PR body should disposition the `review.yml` bot's "raw SQL outside src/lib" finding as "no change needed
  (D-16)", as the analysis says.

Verdict: changes requested

## Plan review (round 2)

Reviewed at HEAD `6fec648` (`docs(backlog): B1.10 plan review round 1, plan revised`); the plan diff against
`96b9d4c` touches only the Verification red-evidence line, the new "Step 3" block and the brief override. Re-read
`scripts/worktree.sh`, `scripts/worktree-prune.sh`, `.claude/hooks/guard-bash.sh`, `playwright.config.ts` (HEAD and
`9327a03`).

### Probes (read-only; nothing created, no schema touched)

| Probe                                                                                 | Result                                                                                                                                                                                                                                                      |
| ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Step 3's six lines, singly and as one command, through `guard-bash.sh`                | all exit 0 (none blocked; `. $S/.worktree.env` does not match the `.env*` secret pattern)                                                                                                                                                                   |
| `worktree.sh` from the session root `…/frosty-ardinghelli-20793b`                     | root is not `*/.worktrees/*`, so it runs; slug of `red/B1.10-pre-b1-5` is `red-b1-10-pre-b1-5`, which matches `S`; `.worktree.env` carries `WORKTREE_PORT`; run from the feature worktree it would refuse, and the plan says "from the session's repo root" |
| `9327a03` has `scripts/load-env.ts` and the same `loadDotEnv()` + `PORT` config       | yes: the spec file's `PrismaClient` and the dev server both read the scratch `.env` (schema `wt_red_b1_10_pre_b1_5`), so the trigger lands in the server's schema; `9327a03` is an ancestor of `origin/main`                                                |
| `scripts/worktree-prune.sh --dry-run --base origin/main` from the session root, today | `[prune] docs/B1.8-done (cherry)` and `[prune] feat/B1.9-widen-log-redaction (tree)`, each with `git worktree remove --force` and `git branch -D`; `[keep]` docs/B1.7-done and feat/B1.10. See reason 1                                                     |
| `origin/main` since the branch point                                                  | only `5387591` (B1.9, #31): `src/lib/logger*` changed, no `e2e/` change, so "12 → 13" still holds and the unit count is the plan's "106 if B1.9 merged first"                                                                                               |

### Round 1 reason 1: resolved

The step now names every command, who runs them (dev-lead, Bash only, so the Edit/Write path guard does not apply),
the port-free check that stops `reuseExistingServer` from testing the wrong code, the spec-file route
(`git show <test sha>:…`), and a two-part expected output (`1 failed` at `toHaveCount(1)` AND a `[WebServer]` line
with `e2e: insert rejected`) with a stop rule for anything else. That pair tells a real red apart from a fault that
never reached the server's schema. The brief override now also covers "red at HEAD → stop and report".

### Checklist

| Check                                                                             | Result                                                                                       |
| --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass (unchanged from round 1)                                                                |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass\* (unchanged: holds only if the lead rules D-16 with the raw-SQL clause)                |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass (unchanged)                                                                             |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass (unchanged)                                                                             |
| verification lists exact commands with expected numbers                           | pass: step 3 is runnable and its expected output discriminates; the cleanup line is reason 1 |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass\* (unchanged: D-13 shape, stated)                                                       |
| the section has a `Lead approves spec` box, ticked only by a human                | pass (unchanged; none ticked by the reviewer)                                                |
| no settled D-n contradicted                                                       | pass\* (unchanged: D-16 must be ruled before step 2)                                         |

### Reasons (changes requested)

1. **Step 3's cleanup removes more than the scratch tree.** `scripts/worktree-prune.sh --base origin/main` prunes
   every worktree under `.worktrees/` whose branch counts as merged, not only `red/B1.10-pre-b1-5`. Trigger (dry run
   today, from the session root): it would also `git worktree remove --force` and `git branch -D`
   `docs/B1.8-done` (cherry) and `feat/B1.9-widen-log-redaction` (tree, B1.9 merged as #31). `--force` discards
   uncommitted changes, so if another session is writing B1.9's closing commit in that worktree at the time, the work
   is lost. The comment "worktree, branch, schema removed" reads as the scratch only. Fix, one line: run
   `scripts/worktree-prune.sh --dry-run --base origin/main` first and proceed only if `red/B1.10-pre-b1-5` is the sole
   `[prune]` line, otherwise stop and leave the scratch for the human to remove; or state the side effect in the plan so
   the lead accepts it at the gate.

### Notes (no change required)

- `tee review-red.txt` writes an untracked file into the session root. `$TMPDIR/b110-red.txt` keeps that tree clean.
  Only the pasted excerpt goes into `review.md`.
- Postgres was down during this review (`postgres not running` in the dry run). `worktree.sh` only warns when
  `db:deploy` fails, so `docker compose up -d` comes before step 3; otherwise the run fails on a missing table, which
  the stop rule catches.
- `lsof … && exit 1` aborts the rest of a one-call run before the cleanup. That is the right stop, and the scratch
  tree is then left for the human.

Verdict: changes requested

## Red evidence (D-16 A, dev-lead)

Scratch worktree `red/B1.10-pre-b1-5` at `9327a03` (pre-B1.5), port 3883 checked free, own schema, `e2e/10-mutation-feedback.spec.ts` from `ef5725a` copied in, `pnpm exec playwright test e2e/10-mutation-feedback.spec.ts`; scratch tree, branch and schema pruned afterwards (dry-run listed only the scratch tree).

```
[WebServer] ConnectorError(ConnectorError { user_facing_error: None, kind: QueryError(PostgresError { code: "P0001", message: "e2e: insert rejected", severity: "ERROR", detail: None, column: None, hin
Error: expect(locator).toHaveCount(expected) failed
Expected: 1
Received: 0
> 59 |     await expect(newTodoFormAlerts(page)).toHaveCount(1);
1 failed
```

Result: `1 failed` at the alert `toHaveCount(1)` (received 0), and the trigger fired in the server's schema (`P0001 "e2e: insert rejected"`): red for the missing behavior, not a misplaced fault. At HEAD the same file passes (`13 passed`).

## Diff review (round 1)

Reviewed at HEAD `f635dba` against `origin/main` `5387591` (merge base `077ce60`; local `main` is stale). Diff:
`8 files changed, 464 insertions(+), 15 deletions(-)`, of which code: `e2e/10-mutation-feedback.spec.ts` (new, 74
lines); the rest is `backlog/` and `spec/features-map.md`. No `src/`, `prisma/`, config or dependency change. Read:
`plan.md`, §10 (REQ-10.5, REQ-10.6, AC-10.5), D-13, D-16, `playwright.config.ts`, `e2e/CLAUDE.md`, the other e2e
files' `beforeEach`, `src/components/todo-form.tsx`, `createTodoAction`, `.github/workflows/ci.yml` (e2e job).

### Commands (run by the reviewer in the worktree; last line of each)

| Command                                     | Result                                                                                                                                         |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                                 | `All matched files use Prettier code style!`                                                                                                   |
| `pnpm typecheck`                            | `tsc --noEmit`, exit 0                                                                                                                         |
| `pnpm test`                                 | `Tests  100 passed (100)` (12 files; unchanged, no `src/` change)                                                                              |
| `pnpm test:e2e`                             | `13 passed (12.4s)`; the run printed `[WebServer] {"level":"error",…"action":"createTodoAction",…"P0001",…"e2e: insert rejected"…}` (§11 line) |
| `pnpm test:mutation`                        | skipped: no `src/lib` or `src/actions` change, and Stryker never runs `e2e/` (D-16)                                                            |
| `scripts/ci/check-suppressions.sh`          | `OK: no new suppressions`                                                                                                                      |
| `scripts/ci/check-config-change.sh`         | `OK: no protected config changed`                                                                                                              |
| `scripts/ci/check-feat-commits.sh`          | `OK: no feat commit touches tests`                                                                                                             |
| `scripts/ci/check-ac-coverage.sh`           | `OK: every criterion of a shipped section has a test`                                                                                          |
| `scripts/ci/check-spec-sections.sh`         | `OK: sections cited: 1 2 3 4 5 6 7 8 9 10 11`                                                                                                  |
| `scripts/ci/check-features-map.sh`          | `OK`                                                                                                                                           |
| `scripts/verify-red.sh --auto`              | `no test(...): B<e>.<n> … (red) commit in range; nothing to verify` (expected: D-13/D-16 shape)                                                |
| `git diff ef5725a..HEAD -- e2e/ '*.test.*'` | empty (0 lines): no test changed after the test commit                                                                                         |
| semgrep (`ci.yml:113`)                      | [unverified]: not installed locally; the four statements are tagged templates without `${}`                                                    |

### Probes (copy `$TMPDIR/b110-diff-probe` from `git archive HEAD`, no `.env`; throwaway schema `b110_diff_probe`, ports 3979/3980; schema dropped afterwards, `pg_trigger` holds no `e2e_reject_todo_insert` anywhere after the review)

| Probe                                                                                                    | Result                                                                                                                                                                       |
| -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Flake, dev server: file 10 `--repeat-each=15`                                                            | `15 passed (22.1s)`                                                                                                                                                          |
| Flake, CI path (`CI=true`, `NODE_ENV=test`, `pnpm build && pnpm start`), `--repeat-each=10 --retries=0`  | `10 passed (19.9s)`                                                                                                                                                          |
| M1: `todo-form.tsx` `kept` always `''` (box not kept after a failure)                                    | `1 failed` at line 61 `toHaveValue('Buy milk')`: `Received: ""`                                                                                                              |
| M2: Add `disabled={pending \|\| error !== undefined}`                                                    | `1 failed` at line 62 `toBeEnabled()`: `Received: disabled`                                                                                                                  |
| M3: the `role="alert"` `<p>` rendered after `</form>` (inside a fragment)                                | `1 failed` at line 59 `toHaveCount(1)`: `Received: 0`, so the scoped locator enforces AC-10.5's "inside the `<form>`"                                                        |
| Leftover trigger (state a killed worker leaves: trigger installed, no drop), then full `playwright test` | `9 failed, 4 passed`: every 05/06/09 test that inserts (seed or UI) fails; file 10's `beforeEach` drops it, and the next full run is `13 passed`                             |
| Leftover trigger, then `playwright test e2e/05-todos.spec.ts` twice                                      | `2 failed, 1 passed` both times: a targeted run never reaches file 10, so it never heals                                                                                     |
| SIGINT to the runner while the trigger is installed                                                      | inconclusive: trigger count 0 after exit, but the poll may have hit after line 66's drop; the orphaned `next dev` it left on the port hung the next reused run (probe-local) |

### Checklist

| Check                                                                | Result                                                                                                                                                                                                              |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every AC-§.n has a test whose assertion matches its Then             | pass: AC-10.5 first click → 1 alert in the form, exact text, box `Buy milk`, Add enabled (M1–M3 each fail it); second click → 0 alerts, box `''`. REQ-10.6 "list no new todo" → list text + `count() === 1`         |
| no test weakened after the red commit                                | pass: `git diff ef5725a..HEAD -- e2e/ '*.test.*'` empty; red evidence (D-16 A) recorded with the `[WebServer] P0001` discriminator the plan required                                                                |
| every changed file is in `plan.md`                                   | pass: e2e file, `features-map.md` F8, `00-decisions.md` D-16, README; `plan/E1-todos.md` card and `work/B1.10/*` predate the plan or are role artifacts                                                             |
| interfaces match the section's contracts                             | pass: no `src/` interface; the four `$executeRaw` statements are verbatim the plan's "Interfaces touched"                                                                                                           |
| Zod at every action boundary · Prisma only in `src/lib` · no raw SQL | pass\* by D-16: parameterless DDL in `e2e/` through the file's own `PrismaClient`, `e2e_` names, no interpolation, no other raw SQL; the `review.yml` bot's "raw SQL outside src/lib" line is dispositioned by D-16 |
| migration reversible and indexed                                     | n/a (no migration)                                                                                                                                                                                                  |
| no secret, no suppression, no `skip`/`only`/`fixme`                  | pass                                                                                                                                                                                                                |
| features map row moved                                               | pass: F8 tests column ends with `e2e/10-mutation-feedback.spec.ts`; `check-features-map.sh` OK                                                                                                                      |
| would any test fail if one changed line were reverted?               | pass: no `src/` line changed; reverting the shipped behavior (M1–M3, and `9327a03` in the red evidence) fails this test at the asserting line                                                                       |
| e2e conventions (`e2e/CLAUDE.md`)                                    | pass: `beforeEach` resets rows, explicit `createdAt`, AC id first in the title, `workers: 1` / `fullyParallel: false` so the trigger never overlaps another file                                                    |

### dev-lead's three questions

1. **Killed run leaves the trigger behind**: yes, see finding [1]. The consequence is confirmed; the kill itself was
   not reproduced. CI is unaffected (fresh `postgres` service per job, `retries: 1` re-runs `beforeEach`).
2. **`filter({ has: New todo box })` and "inside the `<form>`"**: it satisfies it. M3 (alert moved outside the form)
   fails at `toHaveCount(1)` with `Received: 0`. The second phase's `toHaveCount(0)` would pass vacuously if the
   form vanished, but line 70 (`toHaveValue('')` on the box) then fails, so no vacuous pass survives.
3. **Timing between the alert and the row count**: no race found. `prisma.todo.count()` (line 64) runs after the
   alert is visible, so `createTodoAction` has returned and the rejected `INSERT` is final; line 72 runs after the
   list shows `Buy milk`, so the row is committed. 25 repeated runs (dev 15, production build 10) and 3 full suites
   were green.

### Findings

```
[1] KIND: correctness
    WHERE: e2e/10-mutation-feedback.spec.ts:14-27 (cleanup only in this file's beforeEach/afterEach)
    DEFECT: a run whose worker dies after line 54 and before afterEach leaves e2e_reject_todo_insert on `todos` in the
            worktree schema, and only this file ever drops it.
    TRIGGER: trigger installed with no drop (the state a SIGKILL / crashed worker / closed laptop leaves), then
             `pnpm test:e2e` → `9 failed, 4 passed` (every 05/06/09 test that inserts); or
             `pnpm exec playwright test e2e/05-todos.spec.ts` → `2 failed, 1 passed` on every run until someone runs
             file 10 or drops the trigger by hand.
    WRONG BEHAVIOUR: unrelated §5/§6/§9 tests fail locally with a PrismaClientUnknownRequestError; the comment at
             lines 14-15 implies IF EXISTS prevents "break every create in this schema", but it only heals once file
             10 runs again. No §-behaviour is wrong, CI is unaffected, and the full run self-heals.
    CONFIDENCE: confirmed for the consequence (state simulated, suite run); plausible for the kill path (SIGINT probe
             inconclusive)
```

Non-blocking: a fix in the other e2e files is outside the plan's Files list, and a Playwright `globalSetup` is a
config change that needs approval. Disposition options for dev-lead: out of scope (follow-up card, or a line in the
PR body), or a `test(todos): B1.10 review pass 1 -- …` commit that reworded only the lines 14-15 comment to say
what the drop really does ("until this file runs again").

Verdict: ready for PR (finding [1] needs a disposition; it does not block)

Riskiest unfalsified: a fill and click before hydration (a slow CI runner) would submit the native form. That skips
`onSubmit`, leaves `draft` `''`, and would fail line 61 spuriously. The test shares this with 05's AC-5.6. 25
repeated runs and 3 full suites never hit it.

### Dispositions (dev-lead, pass 1 of 3)

| Pass | #   | Finding (file:line)                                                                                                              | Source                          | Kind        | Disposition      | Justification                                                                                                                                                                                                                                                                         |
| ---- | --- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | ----------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | 1   | a run killed between install and drop leaves `e2e_reject_todo_insert` in the worktree schema; a targeted 05/06/09 run then fails | reviewer                        | correctness | out of scope     | accepted at the plan (analysis Q5): local-only (CI starts a fresh database), a full run heals it through file 10's `beforeEach`; recovery = the two `DROP … IF EXISTS` lines, named in the PR body; a cross-file cleanup needs `globalSetup` (config) or edits outside the Files list |
| 1    | —   | a click before hydration sends the native POST, `draft` stays `''`, line 61 fails                                                | reviewer (riskiest unfalsified) | flake       | out of scope     | same exposure as `e2e/05-todos.spec.ts` AC-5.6; 25 repeated runs and 3 full suites (dev and `build && start`) never hit it                                                                                                                                                            |
| 1    | —   | `filter({ has: New todo box })` vs "inside the `<form>`"                                                                         | dev-lead (unsure)               | spec        | no change needed | reviewer probe: the alert-outside-the-form mutation fails line 59 (`Received: 0`); a vanished form is caught by line 70                                                                                                                                                               |
| 1    | —   | timing between the alert and the row counts                                                                                      | dev-lead (unsure)               | flake       | no change needed | both counts run after a visible-state assertion that implies the action returned (line 64) or the row committed (line 72)                                                                                                                                                             |
