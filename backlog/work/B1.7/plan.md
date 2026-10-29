# B1.7 plan — Kill pre-existing mutation survivors (§5, §7, §10, Tier quick)

Approach: tests only, the three tests of `analysis.md` "Proposed tests", landed under D-13 option A (proposed, the
lead rules at this gate): one `test(todos): B1.7 …` commit **without** `(red)`, no skeleton, no `feat`, no `src/`
change. Red evidence = the Stryker report before (85.09 %, the four mutants Survived/NoCoverage) and after (Killed).
Advisor skipped (quick, no `src/lib/todos.ts` query). Q1–Q3 as proposed: absent title is REQ-5.3's empty title
(AC-5.3 prefix), AC-5.4 gains an assertion, `.join('.')` (18:47) stays out of scope.

## Files

| File                                           | Change                                                                                                                                                            | Why                                      |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `src/actions/todos.test.ts`                    | new `AC-5.3: returns fieldErrors.title ["Title is required"] when the form has no title field and stores nothing`; AC-5.4 test adds `mock.calls` `[['/'], ['/']]` | AC-5.3 (24:54, 24:96); AC-5.4/§7 (46:20) |
| `src/lib/action-result.test.ts` (new)          | `fieldErrorsOf puts the message of an issue without a path under form`                                                                                            | §10 contracts l.52–53 (18:55)            |
| `backlog/00-decisions.md`, `backlog/README.md` | D-13 row as the lead rules it; its Waiting-on-human row removed                                                                                                   | gate                                     |
| `backlog/work/B1.7/review.md`                  | plan review, diff review, mutation before/after                                                                                                                   | —                                        |

No spec, features-map, `src/` (non-test) or e2e change. Card status, board and `docs/metrics.md` row land in the
closing commit after merge.

## Interfaces touched

```ts
// none: src/actions/todos.ts and src/lib/action-result.ts are unchanged; tests call the existing
export function createTodoAction(previous: ActionResult<Todo> | null, formData: FormData): Promise<ActionResult<Todo>>;
export function toggleTodoAction(id: string): Promise<ActionResult<Todo>>;
export function fieldErrorsOf(error: ZodError): Record<string, string[]>;
```

## Verification

```bash
pnpm lint && pnpm typecheck && pnpm test   # 94 → 96 tests green (2 new; AC-5.4 extended)
pnpm test:e2e                              # 12 unchanged
pnpm test:mutation                         # > 85.09 %: 24:54, 24:96, 46:20, 18:55 Killed (projected 88.60 %)
git diff --stat main...HEAD -- src         # only *.test.ts files
scripts/ci/check-ac-coverage.sh && scripts/ci/check-feat-commits.sh && scripts/ci/check-suppressions.sh
scripts/verify-red.sh --auto               # no (red) commit → exits 0 (D-13 A)
```

## Work breakdown

| Step     | Role / skill                      | Produces                                    | Commit                                           |
| -------- | --------------------------------- | ------------------------------------------- | ------------------------------------------------ |
| 0 Ruling | lead (at this gate, D-2)          | D-13 row in `00-decisions.md`               | `docs(backlog): D-13 …` (lead's words)           |
| 1 Tests  | `test-writer` (brief override)    | the three tests, green on arrival           | `test(todos): B1.7 kill four mutation survivors` |
| 2 Gate   | dev-lead                          | suites green, Stryker after, mutants Killed | —                                                |
| 3 Review | `reviewer` (diff), `/review-loop` | `review.md` diff section, gate cleared      | `docs(backlog): B1.7 diff review …`              |

Step 0. The D-13 request is in README "Waiting on human"; it is ruled in the same reply as this plan (one gate, D-2).
Option A → as above. Option B → step 2 also applies each of the four mutants by hand on a copy and records the
failing test's output in `review.md`. Option C → stop; a `verify-red.sh` mutant mode is a config change outside this
card. D-13 (A or B) also settles that `backlog/CLAUDE.md` (hardening commits carry no `(red)`) governs over
`code-writer.md:31`.

Step 1 brief override (test-writer Procedure 2–4 assume red): "Hardening under D-13: the tests kill mutants of
correct code, so they are green on arrival. Do not run `verify-red.sh B1.7`; commit without `(red)`. Test 3 narrows
the parse result (`const parsed = z.string().min(1, 'Boom').safeParse(''); if (parsed.success) throw new
Error('expected a failed parse'); fieldErrorsOf(parsed.error)`), since destructuring `error` fails typecheck
(TS2345). Report one line per test naming the mutant it kills."

Plan review: approved, round 2 · Plan approved by: lead (session reply "approve", D-13 option A), 2026-10-29 · Rounds: 1
