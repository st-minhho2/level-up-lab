# B7.3 review

## Plan review (round 1)

Scope: ui (`src/components/todo-due-date.tsx`, a component test, one e2e file). Read: `plan.md`, `advice.md`,
`spec/contracts/35-due-date-today.md` (§37), card B7.3 in `backlog/plan/E7-todos-hints.md`, D-37,
`src/components/todo-due-date.tsx`, `e2e/` file names, `.claude/docs/git-workflow.md` commit subjects.

| Check                                                                             | Result                                                                                                                                                                                                                                                                                                          |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: `todo-due-date.tsx` is the only `src/` file §37 allows ("The only file of `src/` this section changes"); the test file is the card's `Test:` line; F35 is the feature id D-37 gives B7.3                                                                                                                  |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: props and signature unchanged, copied from §37 Function contracts; no action, schema, Prisma or lib change; `'use client'` component already                                                                                                                                                              |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: approach A; the one deviation (e2e file `37-…`, not advice's `35-…`) is stated. It is correct: `e2e/28-escape-due-date.spec.ts` (contract `26-…`) and `31-due-today.spec.ts` (contract `29-…`) are named by section, and `35-` is B7.1's section (D-37), so advice's name would collide in the same batch |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: 6 criteria (AC-37.1–37.6), each Then counts elements, exact values, call counts or `defaultPrevented`                                                                                                                                                                                                     |
| verification lists exact commands with expected numbers                           | pass: `pnpm test` 280 → 285 (45 → 46 files), `pnpm test:e2e` +1, named regression files, `verify-red.sh B7.3` exit 0, mutation ≥ 70 (lib/actions untouched), `check-features-map.sh`, `check-plan-scope.sh`                                                                                                     |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: skeleton step present and justified empty (no new export); `test(todos): … (red)`, `feat(todos): …`, `docs(map): F35 … [B7.3]`, `docs(backlog): B7.3 review …` match `git-workflow.md` and the B6 `feat(todos)` history                                                                                   |
| the section has a `Lead approves spec` box, ticked only by a human, never by you  | pass: `- [ ] Lead approves spec` present in `35-due-date-today.md`, unticked; not touched by this review                                                                                                                                                                                                        |
| no settled D-n contradicted                                                       | pass: D-37 (section 37, contract `35-due-date-today.md`, `todo-due-date.tsx`, F35, medium tier, no `page.tsx`) matched; REQ-28.7 / §17 / §31 "new control" lines are the ones D-37 states do not apply                                                                                                          |
| `scripts/next-task.sh --check B7.3` says no overlap                               | pass: `[next-task] B7.3: no overlap with any Doing or Review card` (exit 0)                                                                                                                                                                                                                                     |

Also checked: `scripts/ci/check-plan-scope.sh` → `[check-plan-scope] OK: feat/B7.3-agent changes only paperwork`.
Existing tests that could break on a fourth form child: none found. `todo-due-date.test.tsx:27` counts the wrapper's
children (1), not the form's; every existing "Today"/"Due today" query in `src/` and `e2e/` uses `exact: true`
(`e2e/31-due-today.spec.ts:70,82,128`), so a button named "Today" adds no ambiguous match.

Costs the lead takes on approval (all stated in the plan, repeated here so nothing is found after the gate):

1. Enter or Space on a focused "Today" activates it (native button) and only fills the field; it never saves.
2. "Today" keeps an existing row error message (REQ-37.3); only Escape or a later successful save clears it.
3. While a save is pending, "Today" is disabled, so if it had focus, focus drops to the body (no spec line restores it;
   "moving focus" is §37 Out of scope).
4. B7.6 later edits the same form and the same component (D-37 orders it after B7.3).

Non-blocking note: advice's con for approach A says to rename `onDueDateKeyDown` or comment why it covers a button;
the plan keeps the name and widens the type without saying which. Either is fine; the diff review will expect the
existing REQ-28.5/28.6 comment to name REQ-37.4/37.5 as well.

Verdict: approved (ready for the lead's gate, not approved for build)

## Diff review (round 1)

Scope: ui. Diff `main...HEAD` at `672d9f8`: red `a2db3b4`, feat `df8e436`, map `672d9f8`. Read: §37 contract, `plan.md`,
`src/components/todo-due-date.tsx`, `todo-due-date-today-button.test.tsx`, `e2e/37-due-date-today.spec.ts`.

### Command results (last line of each, run by the reviewer)

| Command                             | Last line                                                                                          |
| ----------------------------------- | -------------------------------------------------------------------------------------------------- |
| `pnpm lint`                         | `All matched files use Prettier code style!` (exit 0)                                              |
| `pnpm typecheck`                    | `> tsc --noEmit` (exit 0, no output)                                                               |
| `pnpm test`                         | `Tests  291 passed (291)` (46 files)                                                               |
| `pnpm test:e2e`                     | `65 passed (5.9m)` (run alone; a first run beside Stryker ended `61 passed`, exit 1, load-related) |
| `pnpm test:mutation`                | `Final mutation score of 93.22 is greater than or equal to break threshold 70`                     |
| `scripts/ci/check-suppressions.sh`  | `OK: no new suppressions`                                                                          |
| `scripts/ci/check-config-change.sh` | `OK: no protected config changed`                                                                  |
| `scripts/ci/check-feat-commits.sh`  | `OK: no feat commit touches tests`                                                                 |
| `scripts/ci/check-ac-coverage.sh`   | `OK: every criterion of a shipped section has a test` (§37 still ✗ in the index, by plan)          |
| `scripts/ci/check-spec-sections.sh` | `OK: sections cited: 1 … 37`                                                                       |
| `scripts/ci/check-features-map.sh`  | `OK`                                                                                               |
| `scripts/ci/check-plan-scope.sh`    | `OK: feat/B7.3-agent stays inside the approved plan of B7.3 (D-27 approval)`                       |
| `scripts/verify-red.sh B7.3`        | `RESULT: red for the right reason` (11 ran, 11 new failed; e2e skipped, needs a server)            |
| `git diff --stat main...HEAD`       | `9 files changed, 671 insertions(+), 3 deletions(-)`                                               |

### Checklist

| Check                                                                | Result                                                                                                                                                                                                 |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| every AC-37.n has a test whose assertion matches its Then            | pass: 37.1–37.5 in the component test (11 cases), 37.6 in `e2e/37-due-date-today.spec.ts`; each asserts the Then's counts, values, call lists and `defaultPrevented`                                   |
| no test weakened after the red commit                                | pass: `git log --first-parent --no-merges a2db3b4..HEAD -- '*.test.*' e2e/` empty; `--merges --remerge-diff` empty (no merges)                                                                         |
| every changed file is in `plan.md`                                   | pass: the 4 Files rows plus the plan's exempt paperwork (`docs/metrics.md`, `backlog/work/B7.3/*`)                                                                                                     |
| interfaces match the section's contracts                             | pass: props and signature unchanged; form children label, input, `button type="button"` "Today" (`disabled={pending}`), submit; `todayOf(new Date())` read in the handler                              |
| Zod at every action boundary · Prisma only in `src/lib` · no raw SQL | n/a: no action, lib, schema or query changed                                                                                                                                                           |
| migration reversible and indexed                                     | n/a: no migration                                                                                                                                                                                      |
| no secret, no suppression                                            | pass (check-suppressions; diff read)                                                                                                                                                                   |
| features map row moved                                               | pass: F35 §37 ✅ in `672d9f8`                                                                                                                                                                          |
| would a test fail if one changed line were reverted?                 | pass, probed on a clone under `$TMPDIR`: drop "Today"'s `onKeyDown` → AC-37.4 fails; drop its `disabled={pending}` → AC-37.5 (a) fails; read the mount-time day (`today ?? …`) → AC-37.3 fails; drop ` |     | pending` → AC-37.5 (a) and AC-28.4 fail |

### Findings

None blocking.

Notes for the lead (non-blocking, no change asked of this card):

1. REQ-37.3 "SHALL NOT … change the row's message" has no criterion: no AC-37.n Given holds a message when "Today" is
   clicked. Probe: adding `setError(undefined)` to `onToday` leaves all 38 `todo-due-date*` tests green. The code is
   correct today; the guard would need a new AC (a `docs(spec)` change under a D-n), not a test in this card.
2. `plan.md` expected `pnpm test` 280 → 285 ("5 new `it`s"); the red commit has 5 criteria as 11 `it.each` cases, so 291. The number in the plan was wrong, the tests are not extra.
3. `docs/metrics.md` row says mutation 92.74; this run measured 93.22 with `src/lib` and `src/actions` unchanged
   (timeout count varies with load). The row also says "this feat commit" instead of `df8e436`.

Verdict: ready for PR

Riskiest unfalsified: REQ-37.3's "does not change the row's message" (note 1), held only by the code, not by a test.
