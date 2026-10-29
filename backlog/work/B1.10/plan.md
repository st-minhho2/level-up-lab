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
# red evidence (D-16 A): scratch worktree at 9327a03 + this spec file → the AC-10.5 test fails on the alert count
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

Brief override: test-writer commits a green test without `(red)` and does not run verify-red (D-13 shape).

Plan review: · Plan approved by: · Rounds: 1
