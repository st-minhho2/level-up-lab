# B1.7 review

## Plan review (round 1)

SCOPE: all (`src/actions` and `src/lib` tests; no code change)

Reviewed: `backlog/work/B1.7/plan.md` at `29a2442` (`Plan approved by:` empty, `Rounds: 1`) against §5
(`spec/contracts/03-todos.md`), §7 (`05-ui.md`), §10 (`08-mutation-feedback.md`), card B1.7, `analysis.md`, D-2, D-7,
D-11, `backlog/CLAUDE.md`, the roles `dev-lead`, `test-writer`, `code-writer`, the skills `tdd-loop` and `review-loop`,
`scripts/verify-red.sh`, `scripts/ci/check-feat-commits.sh`, `check-features-map.sh`, `check-ac-coverage.sh`,
`stryker.config.mjs`, `vitest.stryker.config.mts`, `.github/workflows/ci.yml`, and `reports/mutation/mutation.json`
(the 85.09 % run, 14:14 today). Run in this worktree: `pnpm test` → `Tests 94 passed (94)`;
`playwright test --list` → `Total: 12 tests in 4 files`; mutation.json → `CompileError 115, Killed 97, Survived 14,
NoCoverage 3`, the four target ids exactly as `analysis.md` lists them. Probe on a `git archive HEAD` copy under
`$TMPDIR/b17-probe-eRJJ` (`node_modules` symlinked, no `.env` read), never on the tree: the three tests written as
`analysis.md` "Proposed tests" describes, then each target mutant applied by hand:

| Mutant (by hand on the copy)                                           | Result with the three tests                                                            |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| none (current code)                                                    | `Tests 28 passed (28)` in the two files (26 + 1 new + 1 new file; suite 94 → 96 holds) |
| `todos.ts` 24:54 `typeof … ? rawTitle` → `true ? rawTitle`             | 1 failed: `AC-5.3: … when the form has no title field and stores nothing`              |
| `todos.ts` 24:96 `: ''` → `: 'Stryker was here!'`                      | 1 failed: the same test                                                                |
| `todos.ts` 46:20 `revalidatePath('/')` → `('')`                        | 1 failed: `AC-5.4: returns the toggled todo and revalidates /`                         |
| `action-result.ts` 18:55 `\|\| 'form'` → `\|\| ''`                     | 1 failed: `fieldErrorsOf puts the message of an issue without a path under form`       |
| `action-result.ts` 18:47 `.join('.')` → `.join('')` (Q3, out of scope) | `28 passed`: survives, as the plan states                                              |

| Check                                                                             | pass / fail: reason                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: `src/actions/todos.test.ts` is in F4, F8 (§5, §10); `src/lib/action-result.test.ts` is new and in no row, but `check-features-map.sh` only requires non-test modules and skips `action-result.ts`, so CI stays OK; adding it to F8 is optional (analysis Q4a). The two `backlog/` files are not features. See reason 1 for who writes `00-decisions.md`.                                                                                                                                                                                                       |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: no interface changes; the three signatures pasted match §5 Function contracts l.58–59 and the code (`todos.ts:19,39`, `action-result.ts:15`). No `src/` non-test file, no Prisma, no action change.                                                                                                                                                                                                                                                                                                                                                            |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: no `advice.md`; the plan states "Advisor skipped (quick, no `src/lib/todos.ts` query)", which `dev-lead.md` step 2 allows for Tier quick. The analysis's ruling request is folded into the plan gate instead of README "Waiting on human" (see reason 1).                                                                                                                                                                                                                                                                                                      |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: no criterion added (§5 stays 7, §10 5). Each test asserts a value: `toEqual` result, `mock.calls` `[['/'], ['/']]`, call count 0, `{ form: ['Boom'] }`. Cost for the lead (Q1): AC-5.3's Given names only `"   "` and 201 characters; titling the absent-field test `AC-5.3` reads REQ-5.3's "submitted title empty after trimming" as covering a missing field, which no section says. The no-prefix alternative has a precedent (`todos.test.ts:105`).                                                                                                       |
| verification lists exact commands with expected numbers                           | fail (reason 3): `pnpm test` 94 → 96 (probe confirms), e2e 12 (confirmed by `--list`), mutation "> 85.09 %, four ids Killed, projected 88.60 %" (101/114 [unverified]: Stryker not run). But the plan sends the test-writer to analysis's test 3, whose Arrange fails `pnpm typecheck` (probe: TS2345). The before report is git-ignored and the after run overwrites it; its evidence survives only in `analysis.md`'s table, which is enough if the review quotes it.                                                                                              |
| work breakdown has skeleton → red → green → map → review with convention subjects | fail (reasons 1, 2): skeleton, red, green and map are dropped, stated and conditional on D-13 A. Subject `test(todos): B1.7 kill four mutation survivors` passes Lefthook's Conventional Commits rule and is skipped by `verify-red.sh --auto` (regex `…\(red\)$`, CI line 150 exits 0). But no step lands D-13, and step 1's role cannot do the step as its file reads.                                                                                                                                                                                             |
| the section has a `Lead approves spec` box, ticked only by a human                | pass: §5 `03-todos.md:5` `[x]` (B1.1), §10 `08-mutation-feedback.md:5–6` `[x]` (B1.4, B1.5); no section changes, so no new tick is needed. §7 (`05-ui.md`) has no Tier and no box (pre-existing); every test also traces to a boxed section: `/` for toggle is in §10 Function contracts ("wraps its lib call and revalidatePath('/')"), `form` for a pathless issue in §10 l.52–53.                                                                                                                                                                                 |
| no settled D-n contradicted                                                       | pass: D-2 (one human gate) kept, the ruling rides on it; D-7 not needed (no section change); D-11 messages and keys untouched. D-13 is unsettled; the plan's approach depends on it. Cost for the lead: D-13 A is an exception to CLAUDE.md "Tests first … land red … proven by verify-red.sh" and invariant 2, whose text stays unqualified; and `code-writer.md:31` names survivor hardening `test(<pkg>): <card> … (red)`, which contradicts `backlog/CLAUDE.md` (hardening has no `(red)`). D-13's wording should say which one governs a survivor-killing test. |

Verdict: changes requested

1. **D-13 has no step and no writer.** `backlog/00-decisions.md` is in Files, but `dev-lead`'s hook denies it
   (`'!backlog/00-decisions.md'`, `dev-lead.md:11`) and the file says the human appends a D-n as
   `docs(backlog): D-n …`. Add a step 0 to the work breakdown: lead, D-13 row, `docs(backlog): D-13 …`, landed before
   step 1, with the plan stating what changes if the lead picks B or C instead of A. Either add the request to
   README "Waiting on human" (`dev-lead.md` control-plane rule for a NEEDS RULING) or state the deviation (ruled at
   the plan gate under D-2).
2. **The test-writer cannot do step 1 as its role reads.** `test-writer.md` Procedure 2–4 require every new test to
   fail, `verify-red.sh <card>` exit 0 and a `(red)` subject, and its report starts `RED:`. Trigger: briefed with the
   template's `Mode: red`, it either stops ("green before implementation") or commits with `(red)`, and then CI's
   `verify-red.sh --auto` picks the commit up and fails with "GREEN before implementation" (probe: all 3 new tests
   pass on current code). The plan should give the brief's exact override: hardening under D-13, tests green on
   arrival, no `verify-red.sh`, subject without `(red)`, report one line per test naming the mutant id it kills.
3. **Test 3's Arrange fails `pnpm typecheck`.** `const { error } = z.string().min(1, 'Boom').safeParse('')` gives
   `ZodError<string> | undefined`; `fieldErrorsOf(error)` → `TS2345` (probe). The plan points at analysis's tests as
   exact, so name the narrowed form: `const parsed = …safeParse(''); if (parsed.success) throw new Error(…);
fieldErrorsOf(parsed.error)`. Probe: `tsc --noEmit` exit 0, `eslint` clean on both files, test passes, and it
   kills 18:55.

Notes (not blocking): the probe table above is per-test red evidence against each mutant (option B's content) at
no extra cost; the diff review will repeat it on the committed tests and read `killedBy` from the after report.
Plan is 49 lines against the ≈ 40-line guide; it fits once the wide table wraps.

## Plan review (round 2)

SCOPE: all (`src/actions` and `src/lib` tests; no code change)

Reviewed: `backlog/work/B1.7/plan.md` at `95a845c` (`Plan approved by:` empty, `Rounds: 1`). The change since round
1 (`git diff 29a2442 95a845c`) touches only `backlog/` (plan, README, review), so round 1's test count, e2e count and
mutant probes still hold. Re-read: `dev-lead.md` (hook, control-plane rules, steps 4–6), `test-writer.md`,
`code-writer.md:31`, `backlog/CLAUDE.md`, `00-decisions.md` (D-1–D-12 settled, Open empty), README "Waiting on human",
`scripts/verify-red.sh` (`--auto` selects only subjects matching `^test\([^)]*\): B…\(red\)$`, prints "nothing to
verify" and exits 0 when none), `ci.yml:148–150`, §10 `08-mutation-feedback.md:52–53`. New probe on a
`git archive HEAD` copy under `$TMPDIR/b17r2-GuyC` (`node_modules` symlinked), test 3 written exactly as the step 1
brief gives it: `tsc --noEmit` exit 0; `eslint src/lib/action-result.test.ts` exit 0; `Tests 1 passed (1)`; with
`action-result.ts:18` `|| 'form'` → `|| ''` applied by hand, `Tests 1 failed (1)`.

Round 1 reasons:

| #   | Round 1 reason                           | Round 2                                                                                                                                                                                                                                                                                                                         |
| --- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | D-13 has no step and no writer           | resolved: step 0 (lead, `docs(backlog): D-13 …`, before step 1); the request is a README "Waiting on human" row (D-13, blocks B1.7), ruled at this gate under D-2; B and C consequences stated; D-13 also names `backlog/CLAUDE.md` as governing over `code-writer.md:31`.                                                      |
| 2   | test-writer cannot do step 1 as it reads | resolved: the step 1 brief override says green on arrival, no `verify-red.sh B1.7`, no `(red)`, one report line per test naming its mutant; the subject `test(todos): B1.7 kill four mutation survivors` is not picked by `verify-red.sh --auto`, so CI's step exits 0. The role's write scope (`*.test.ts`) covers both files. |
| 3   | test 3's Arrange fails typecheck         | resolved: the brief names the narrowed Arrange; probe above: typecheck, lint green, passes, kills 18:55.                                                                                                                                                                                                                        |

| Check                                                                             | pass / fail: reason                                                                                                                                                                                                                                                                                                                      |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: as round 1. `src/actions/todos.test.ts` in F4/F8; `src/lib/action-result.test.ts` new, no map row needed (`check-features-map.sh` checks non-test modules); `00-decisions.md` written by the lead (step 0), `review.md` by the reviewer.                                                                                           |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: no interface change; the three pasted signatures match §5 Function contracts and `todos.ts:19,39`, `action-result.ts:15`.                                                                                                                                                                                                          |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: no `advice.md`; "Advisor skipped (quick, no `src/lib/todos.ts` query)" per `dev-lead.md` step 2.                                                                                                                                                                                                                                   |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: no criterion added. Q1 cost stays for the lead: the absent-field test carries the `AC-5.3` prefix though AC-5.3's Given names only `"   "` and 201 characters (no-prefix alternative: `todos.test.ts:105`).                                                                                                                        |
| verification lists exact commands with expected numbers                           | pass: `pnpm test` 94 → 96 (round 1 probe), e2e 12, Stryker > 85.09 % with four ids Killed (88.60 % projected, [unverified]), `verify-red.sh --auto` exit 0 (traced, see above), `git diff --stat main...HEAD -- src` test files only. The before report is git-ignored; its evidence is `analysis.md`'s table and round 1's probe table. |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass (by stated deviation, conditional on D-13 A or B): skeleton, red, green, map dropped because nothing under `src/` non-test changes; steps 0–3 with subjects; option C stops the card.                                                                                                                                               |
| the section has a `Lead approves spec` box, ticked only by a human                | pass: §5 `03-todos.md:5` and §10 `08-mutation-feedback.md:5–6` ticked; no section change, no new tick. §7 has no box (pre-existing; every test also traces to a boxed section).                                                                                                                                                          |
| no settled D-n contradicted                                                       | pass: D-2 kept (D-13 ruled at the one gate), D-7 not triggered, D-11 untouched. D-13 is open and the plan depends on it; cost for the lead unchanged from round 1: option A is an exception to CLAUDE.md "Tests first … land red" and invariant 2, whose text stays unqualified.                                                         |

Verdict: approved (ready for the lead's gate, not approved for build)

Notes (not blocking):

- The plan is 62 lines against the ≈ 40-line guide; the growth is the step 0 and step 1 text round 1 asked for, and
  the work is one task (3 tests, 2 files), so splitting would add a card without reducing risk.
- The diff review's standard command `scripts/verify-red.sh B1.7` exits 1 under D-13 A ("no … (red) commit"); the
  diff review will run `--auto` as the plan's Verification says and record that substitution.
- The README "Waiting on human" D-13 row is not in Files; it should leave with step 0's commit or the closing commit.
- Under option B, the per-mutant failing-test output is the diff review's job (it reruns the round 1 probe table on
  the committed tests), so `dev-lead` need not write into `review.md`.
