# B1.10 plan — End-to-end proof that a failed create keeps the typed title (§10, Tier quick)

Approach: one e2e test (analysis "Proposed test"), tests-only in D-13's commit shape (no `(red)`, no skeleton, no
`feat`), red evidence per proposed D-16 option A (ruled at this gate): the new spec file fails on the alert assertion
when run against the pre-B1.5 `src/` (`9327a03`) in a scratch worktree; output recorded in `review.md`. Fault = the
lead's option B: a `plpgsql` trigger on `todos` rejecting inserts, created/dropped by the test through two
`prisma.$executeRaw` tagged templates with no interpolation, names prefixed `e2e_`, dropped `IF EXISTS` in
`beforeEach` and `afterEach`. Analysis Q1–Q6 as proposed: `AC-10.5` title, §10 unchanged; list text and row count
asserted (REQ-10.6 "list no new todo"); §11 line not asserted (needs a config change); alerts counted inside `form`;
`docs(map)` adds the file to F8. Advisor skipped (quick; no `src/lib/todos.ts` query change).

## Files

| File                                     | Change                                                                      | Why               |
| ---------------------------------------- | --------------------------------------------------------------------------- | ----------------- |
| `e2e/10-mutation-feedback.spec.ts` (new) | 1 test: trigger on → alert, title kept, Add enabled, list same; off → saved | AC-10.5, REQ-10.6 |
| `spec/features-map.md`                   | F8 tests column + `e2e/10-mutation-feedback.spec.ts`                        | map               |
| `backlog/00-decisions.md`, README        | D-16 row as the lead rules it; Waiting-on-human row removed                 | gate              |

No `src/`, `prisma/`, env, dependency or config change. Closing commit: card status, README row, metrics rows.

## Interfaces touched

```ts
// none in src/. Test-only SQL (e2e), run through the file's own PrismaClient in the worktree schema:
await prisma.$executeRaw`CREATE OR REPLACE FUNCTION e2e_reject_todo_insert() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'e2e: insert rejected'; END $$`;
await prisma.$executeRaw`CREATE TRIGGER e2e_reject_todo_insert BEFORE INSERT ON todos FOR EACH ROW EXECUTE FUNCTION e2e_reject_todo_insert()`;
await prisma.$executeRaw`DROP TRIGGER IF EXISTS e2e_reject_todo_insert ON todos`; // + DROP FUNCTION IF EXISTS …
```

## Verification

```bash
pnpm lint && pnpm typecheck && pnpm test   # 100 unchanged (106 if B1.9 merged first)
pnpm test:e2e                              # 12 → 13 passed; e2e/10-mutation-feedback.spec.ts green; 05/06/09 unaffected
# red evidence (D-16 A): step 3 below → "1 failed" at the alert count AND `[WebServer]` output with `e2e: insert rejected`
scripts/ci/check-features-map.sh && scripts/ci/check-ac-coverage.sh && scripts/ci/check-suppressions.sh && scripts/ci/check-feat-commits.sh
```

## Work breakdown

| Step          | Role / skill                        | Produces                               | Commit                                                              |
| ------------- | ----------------------------------- | -------------------------------------- | ------------------------------------------------------------------- |
| 0 Plan review | `reviewer` (plan)                   | `review.md` plan section               | `docs(backlog): B1.10 plan review …`                                |
| 1 Ruling      | lead (at this gate)                 | D-16 row                               | `docs(backlog): D-16 …`                                             |
| 2 Test        | `test-writer` (green on arrival)    | the e2e file                           | `test(todos): B1.10 e2e proof that a failed create keeps the title` |
| 3 Red proof   | dev-lead (scratch worktree, D-16 A) | failing output in `review.md`          | —                                                                   |
| 4 Map         | dev-lead                            | F8 row                                 | `docs(map): F8 e2e proof of the kept title [B1.10]`                 |
| 5 Review      | `reviewer` (diff), `/review-loop`   | `review.md` diff section, gate cleared | `docs(backlog): B1.10 diff review …`                                |

Step 3 (dev-lead, Bash only; nothing committed in the scratch tree), from the session's repo root:

```bash
scripts/worktree.sh red/B1.10-pre-b1-5 9327a03          # own port P, own schema, deps, db:deploy into that schema
S=.worktrees/red-b1-10-pre-b1-5; P=$(. $S/.worktree.env; echo $WORKTREE_PORT)
lsof -nP -iTCP:$P -sTCP:LISTEN && exit 1                 # port must be free, or reuseExistingServer runs the wrong code
git show <test sha>:e2e/10-mutation-feedback.spec.ts > $S/e2e/10-mutation-feedback.spec.ts
(cd $S && pnpm exec playwright test e2e/10-mutation-feedback.spec.ts) 2>&1 | tee "$TMPDIR/b1-10-red.txt"
scripts/worktree-prune.sh --dry-run --base origin/main  # plan review round 2: list every [prune] line first
scripts/worktree-prune.sh --base origin/main            # only if each [prune] line is the scratch tree or a card already merged on origin/main
```

Before step 3: `docker compose up -d`. The prune removes every merged worktree, not only the scratch one (today also
`docs/B1.8-done` and `feat/B1.9-widen-log-redaction`, both merged, which the card closings prune anyway); an unmerged
one in the dry-run list → stop and report.

Expected: `1 failed`, at the alert `toHaveCount(1)` (received 0), and in the same run a `[WebServer]` line containing
`e2e: insert rejected` (the trigger fired in the server's schema, so the red is the missing behavior, not a
misplaced fault). Anything else (pass, other line, no `[WebServer]` match) → stop and report; the probe in
`review.md` round 1 produced exactly the expected result.

Brief override: test-writer commits a green test without `(red)` and does not run verify-red (D-13 shape); if the test
is red at HEAD it stops and reports, never adjusts an assertion.

Plan review: changes requested round 2 (one line, fixed after the round; review cap reached, lead accepted the fix) · Plan approved by: lead (session reply "approve B1.10, D-16 option A"), 2026-10-29 · Rounds: 1
