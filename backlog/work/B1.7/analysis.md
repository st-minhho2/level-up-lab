# B1.7 analysis

Written by `spec-analyst`; filed by `dev-lead` (the role's write of this file was refused by the harness, content
unchanged). Code at HEAD `f763cc9` is identical to `main` `9250a74`. Source: `reports/mutation/mutation.json` of the
85.09 % run: 97 Killed, 14 Survived, 3 NoCoverage, 115 CompileError (97/114). The card's three lines hold **four**
mutants:

| Mutant                           | Mutator               | Status     | Replacement                             |
| -------------------------------- | --------------------- | ---------- | --------------------------------------- |
| `src/actions/todos.ts` 24:54     | ConditionalExpression | Survived   | `typeof rawTitle === 'string'` → `true` |
| `src/actions/todos.ts` 24:96     | StringLiteral         | NoCoverage | `''` → `"Stryker was here!"`            |
| `src/actions/todos.ts` 46:20     | StringLiteral         | Survived   | toggle `revalidatePath('/')` → `('')`   |
| `src/lib/action-result.ts` 18:55 | StringLiteral         | NoCoverage | `\|\| 'form'` → `\|\| ""`               |

- Same line, not named by the card: `action-result.ts` 18:47, `.join('.')` → `.join("")` survives (Q3).
- Other survivors, outside this card: `lib/todos.ts` 13:11, 14:17, 38:73, 38:79; `env.ts` 10:61, 15:15, 18:12,
  20:44, 36:67, 36:75 (NoCoverage); `todo-schema.ts` 12:25; `logger.ts` 27:12.
- `formData.get('title')` is `null` for an absent field. Under 24:54, Zod 4.6 returns
  `title: ['Invalid input: expected string, received null']`; under 24:96, `createTodo('Stryker was here!')` is called.
- `todos.test.ts:119-129` (AC-5.4) asserts only `toHaveBeenCalledTimes(2)`; the create, edit and clear tests assert
  `toHaveBeenCalledWith('/')` (lines 67, 163, 235, 246).
- No `src/lib/action-result.test.ts` exists. All three schemas are flat, so the `form` fallback and the `.` separator
  cannot be reached from any action.
- `verify-red.sh --auto` (CI) exits 0 when there is no `(red)` commit; `verify-red.sh B1.7` (dev-lead's explicit gate)
  exits 1 in that case. The tdd-loop skill is "for every behavior change", and this card changes no behavior.

## Completeness

| Check                                | Result | Note                                                                                                               |
| ------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------ |
| Intent without solution words        | n/a    | no new section                                                                                                     |
| Every behavior has a REQ             | pass\* | toggle `/`: §7 bullet 2 and §10 Function contracts; `form` key: §10 Function contracts line 53; absent title: Q1   |
| One EARS pattern each                | n/a    | no REQ written                                                                                                     |
| ≤ 7 criteria                         | pass   | §5 stays at 7, §7 at 2, §10 at 5                                                                                   |
| Every Then measurable                | pass   | `toEqual` results, `mock.calls` `[['/'],['/']]`, call count 0                                                      |
| No banned adjective                  | pass   | no spec text                                                                                                       |
| Out of scope                         | pass   | the 10 other survivors, 18:47 (Q3), any `src/` change, CompileError mutants                                        |
| Unchanged behavior with proof titles | pass   | all of `todos.test.ts` stays green; AC-5.3 (l.70, 78) and AC-10.4 (l.85) untouched; AC-5.4 only gains an assertion |
| Dependencies done                    | pass   | ~~B1.6~~ `f191c34`                                                                                                 |
| No settled D-n contradicted          | pass\* | the red-first non-negotiable cannot be met as written (Needs a ruling)                                             |

## Proposed tests (exact titles)

1. `src/actions/todos.test.ts` › createTodoAction: `AC-5.3: returns fieldErrors.title ["Title is required"] when the
form has no title field and stores nothing`. Act `createTodoAction(null, new FormData())`; assert
   `toEqual({ ok: false, fieldErrors: { title: ['Title is required'] } })`, `createTodo` and `revalidatePath` called
   0 times. Kills 24:54 and 24:96.
2. Existing `AC-5.4: returns the toggled todo and revalidates /` (l.119): add
   `expect(cache.revalidatePath.mock.calls).toEqual([['/'], ['/']])`. Kills 46:20; only adds an assertion.
3. New `src/lib/action-result.test.ts`: `fieldErrorsOf puts the message of an issue without a path under form`.
   Arrange `const { error } = z.string().min(1, 'Boom').safeParse('')` (one issue, path `[]`); assert
   `fieldErrorsOf(error)` `toEqual({ form: ['Boom'] })`. Kills 18:55. No AC prefix: no criterion covers
   `fieldErrorsOf` (precedent: action tests l.105, l.203).

Projected score: 101/114 = 88.60 % [unverified].

## Open questions

1. **Is an absent `title` field the empty title of REQ-5.3?** Proposed: yes; test 1 titled `AC-5.3`, no spec edit.
   Why: REQ-5.3's trigger is "submitted title empty after trimming", and the FormData boundary maps `null` to `''`
   before Zod, so AC-5.3's Then holds exactly. Otherwise: AC-5.3's Given names it, a `docs(spec): §5` commit inside a
   D-n, before the test. A `Blob` takes the same branch, so no second test.
2. **Strengthen AC-5.4 or add a new test?** Proposed: strengthen (test 2). Why: the title already promises `/`, and
   every sibling test checks the path. Otherwise: a new `AC-5.4: revalidates "/" once per toggle`, leaving a title
   that promises more than it checks.
3. **Kill 18:47 (the `.` separator) too?** Proposed: no. Why: no section says how a nested path becomes a key, and no
   schema in `src/` produces one, so a test would invent a contract. Otherwise: a §7/§10 sentence fixing the key
   format inside a D-n, plus 1 test (89.47 %).
4. **Housekeeping.** (a) Adding `src/lib/action-result.test.ts` to the F8 row of `spec/features-map.md` is optional.
   (b) The 10 other survivors may deserve a follow-up card; several (`env.ts`, the `TodoNotFoundError` message,
   `'Todo id is required'`) pin text no section states. (c) No skeleton step: nothing under `src/` changes.

## Needs a ruling

One, which the lead can settle at the plan gate. CLAUDE.md ("A card's tests land red in their own test(...) commit,
proven by scripts/verify-red.sh") and invariant 2 assume a behavior change. Tests that kill mutants of correct code
are green by construction, so `verify-red.sh B1.7` would report "GREEN before implementation" (tests 1, 3) or "no new
test" (test 2).

```
Context:     B1.7 adds tests only; no test can be red against correct code, only against the mutant.
Options:
  A  Commit `test(<pkg>): B1.7 kill <mutant> survivor` WITHOUT `(red)` (the hardening shape backlog/CLAUDE.md allows);
     no skeleton, no feat. Red evidence = Stryker report before/after naming the 4 mutants Survived/NoCoverage -> Killed.
     Cost: 0 tooling; dev-lead skips explicit `verify-red.sh B1.7` (CI --auto passes vacuously).
     Risk: precedent for skipping red, bounded by the before/after mutant ids.   Reversible: yes.
  B  Apply each mutant by hand in a scratch worktree, record the failing test output in review.md.
     Cost: 4 manual runs.   Risk: not reproducible by CI.   Reversible: yes.
  C  Add a mutant mode to verify-red.sh.   Cost: script change = config change (human label).   Risk: tooling for one card.
Recommended: A. Flips to B if the lead wants a per-test failure message on record.
Affects:     dev-lead red gate for B1.7, card Test: line wording; no section, no src/ file.
```

Proposed D-13: "A card that adds tests without changing behavior (mutation hardening) lands them as
`test(<pkg>): <card> …` without `(red)`, with no skeleton and no `feat` commit; its red evidence is the mutation
report before and after, naming each targeted mutant as Survived or NoCoverage, then Killed."

## Tier recommendation

`quick`, as carded: 0 criteria added, no schema change, 3 test edits in 2 files. Advisor optional; only the ruling
needs a human.
