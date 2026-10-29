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
