# B7.4 review

## Plan review (round 1)

Plan: `backlog/work/B7.4/plan.md` at `74b2fbc`. Spec: `spec/contracts/36-search-count.md` (§38). Scope: ui.

| Check                                                                             | Result                                                                                                                                                                                                                                                                                                                                  |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: `scripts/ci/plan-files.sh --file` gives 5 files; the two `src/` files are the ones §38's Function contracts name (`todo-search-form.tsx`, `page.tsx`); the unit test goes in the file the card's `Test:` line names; `e2e/38-search-count.spec.ts` is one file per section; F36 is the next id after F35 (D-37: F33–F38 in order) |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: one optional `readonly count?: number` prop, explicit `ReactNode` return, copied verbatim from §38's contract; no action, Zod schema, Prisma or `src/lib` change                                                                                                                                                                  |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: approach A; B rejected with the AC-38.3 reason advice gives; the advice's P1 doc drift (`src/components/CLAUDE.md`) is stated as out of this card                                                                                                                                                                                 |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: AC-38.1 to AC-38.7, each Then counts elements or quotes exact text                                                                                                                                                                                                                                                                |
| verification lists exact commands with expected numbers                           | pass: baseline `pnpm test` 298 passed (48 files), confirmed by running it here (`Tests  298 passed (298)`); 298 → 302; e2e +3; `verify-red.sh B7.4` exit 0. Notes 1 and 2 below                                                                                                                                                         |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: `chore(todos): B7.4 skeleton` → `test(todos): B7.4 pin …` → `test(todos): B7.4 … (red)` → `feat(todos)` → `docs(map): F36 … [B7.4]` → review; the green pin commit has precedent (B7.2 plan step 2) and carries no `(red)` marker                                                                                                 |
| the section has a `Lead approves spec` box, ticked only by a human                | pass: `36-search-count.md:5` `- [ ] Lead approves spec`, unticked; the plan leaves it to the lead                                                                                                                                                                                                                                       |
| no settled D-n contradicted                                                       | pass: D-37 names B7.4, section 38, `todo-search-form.tsx` with the count from `page.tsx`, F36; the §16 edits are in `14-search.md:59-66` (landed in `80c8129`); risk tier `scripts/agent/tier.sh` → `medium` (D-28), consistent with D-37                                                                                               |
| `scripts/next-task.sh --check B7.4` says no overlap                               | pass: `[next-task] B7.4: no overlap with any Doing or Review card` (exit 0)                                                                                                                                                                                                                                                             |

Non-blocking notes (for the builder, not reasons to re-plan):

1. Mutation line: `stryker.config` mutates only `src/lib/**/*.ts` and `src/actions/**/*.ts`, so the component mutants
   the plan lists (`=== 1`, `>= 1`, `isInteger`, `isSearchInEffect`, order) are not measured by `pnpm test:mutation`;
   with no `src/lib`/`src/actions` change `scripts/mutation-gate.sh` is expected to print "mutation: CI only, …". The
   diff review will check those mutants by hand on a probe copy.
2. e2e: "+3, all green" has no absolute baseline (B7.2's plan counted one); the diff review will count before/after.
3. Skeleton: destructuring an unused `count` may trip `no-unused-vars` in `pnpm lint`; the skeleton must stay lint-clean
   without rendering anything for `count`.

Costs the lead takes (already in the plan): the count is not announced (REQ-38.4, out of scope by §38), and the stale
`src/components/CLAUDE.md` line about `todo-search-form.tsx` stays stale after this card.

Verdict: approved
