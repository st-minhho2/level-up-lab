# B2.3 review

## Plan review (round 1)

Reviewed at `5a467e8` (`plan.md` 86 lines, `advice.md`, `analysis.md`, `spec/contracts/12-complete-all.md`). Run here:
`pnpm test` → `Tests  115 passed (115)` (the plan's baseline holds); `scripts/next-task.sh --check B2.3` →
`[next-task] B2.3: no overlap with any Doing or Review card`; `scripts/ci/check-features-map.sh` → `OK`;
`scripts/ci/check-ac-coverage.sh` → `§14: ✗, no tests expected yet (6 criteria)` then `OK`;
`scripts/ci/check-spec-sections.sh` → two `::error::` lines, "is cited but has no heading in spec/contracts/", one for
section 12 and one for section 13 (reason 1; the section sign is left out here so this file does not add a third).

| Check                                                                                  | Result                                                                                                                                                                                                                                                                                                                 |
| -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                         | pass: the three modules, their tests and the e2e file are the paths §14's Function contracts name; `src/lib/logger.ts` is the §11 module §14 widens by one member; `src/actions/CLAUDE.md` is the package guide. F12 lands `✗` in the skeleton, as F11 does in B2.2's plan                                             |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib         | pass: signatures copy §14 (explicit return types, `readonly` prop, string-literal union); the only write is `updateMany` in `src/lib/todo-complete-all.ts` through `@/lib/prisma`; the action is `'use server'`, no input so no Zod step (§14 says so), `ActionResult` with `failure('form', MUTATION_FAILED_MESSAGE)` |
| plan follows `advice.md`'s recommendation or states the deviation                      | pass: Approach A with wiring A; the advice's unprefixed `revalidatePath`-throws case is in (`complete-all.test.ts`), titled without a prefix per `testing.md` rather than the advice's `REQ-14.8:`                                                                                                                     |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number              | pass: 6 criteria, each Then an exact call, result object, count, text or row order                                                                                                                                                                                                                                     |
| verification lists exact commands with expected numbers                                | pass: verify-red 8 new red / 0 pass (2 + 3 + 3 matches the Files rows), `pnpm test` 115 → 123 (baseline confirmed above), e2e + 2 in phase B, mutation ≥ 70 with the named hot spots                                                                                                                                   |
| work breakdown has skeleton → red → green → map → review with convention subjects      | pass: `chore(todos)` → `test(todos) … (red)` → `feat(todos)` → (phase B `test(ui) … (red)` → `feat(ui)`) → `docs(map): F12 … [B2.3]` → review; both red subjects match `verify-red.sh`'s `(red)` grep, and its "first red parent, last red files" rule keeps the phase-A unit tests red at phase B                     |
| the section has a `Lead approves spec` box, ticked only by a human (D-7), never by you | pass: `spec/contracts/12-complete-all.md:5` `- [ ] Lead approves spec (lead, <date>)`, unticked; plan line 7–8 routes it through the gate's `approve`                                                                                                                                                                  |
| no settled D-n contradicted                                                            | fail: D-20 says sibling sections are "written 'section n' until `spec-analyst` adds the heading, since `check-spec-sections.sh` rejects a cited § without one"; this branch's own artifacts cite the two sibling sections with the § sign (reason 1)                                                                   |
| `scripts/next-task.sh --check B2.3` on the committed plan says no overlap              | pass: `[next-task] B2.3: no overlap with any Doing or Review card` (B2.1 at `origin/feat/B2.1-filter`, B2.2 at `feat/B2.2-remaining-count`; their Files hold `src/app/page.tsx`, `src/lib/CLAUDE.md`, `src/components/CLAUDE.md` and B2.2's own modules, none of B2.3's)                                               |

Verdict: changes requested

1. **CI is red on this branch now, and D-20's citation rule is broken.** `backlog/work/B2.3/analysis.md:36` writes
   "B2.1 (&sect;12) and B2.2 (&sect;13)" (sign spelled out by dev-lead so this quote passes the same check) and `backlog/work/B2.3/advice.md:237` writes "in &sect;13, the count"; neither heading exists
   on this branch (they land with B2.1 and B2.2). `scripts/ci/check-spec-sections.sh` greps all of `backlog/` and exits
   1, and `.github/workflows/ci.yml` runs it, so every phase-A push fails CI, and the plan's own verification line
   (`check-ac-coverage.sh && check-spec-sections.sh && …`) cannot pass. Fix: a `docs(backlog)` commit writing "section 12"
   and "section 13" at those two places, then re-run the guard (expect `[check-spec-sections] OK`).
2. **The page tie-break with B2.2 cannot fire as written.** `plan.md:37–38` gives the page to "the card whose phase A
   reaches Review first", but `plan.md:84` keeps the PR draft until phase B is green, and `scripts/next-task.sh:64`
   counts an open draft PR as Doing (`OPEN && draft == false` → Review, else Doing). B2.2's plan keeps its PR draft the
   same way, so neither card is ever in Review before its own phase B. Trigger: B2.1 merges with B2.2 and B2.3 both on
   draft PRs; both read the rule, neither qualifies, and the order falls to whichever amends its plan first (the
   second's `--check` then reports the overlap). State the rule the guard actually enforces, e.g. "the card that
   commits its round-2 plan first with `--check` clean takes the page; the other waits for its merge", or name the
   lead as the one who picks.

Costs the lead accepts with an `approve` (not reasons to change the plan; stated here so they are not found after):

- **WIP.** From now until phase B is green B2.3 counts as Doing; with B2.1 and B2.2 that is 3 of 3, so B2.4 and B2.5
  cannot be claimed until one of the three opens a non-draft PR.
- **§11 text drift.** The `MutationActionName` block in `spec/contracts/09-logging.md` keeps four members while the code
  has five; `/spec-trace` will report it after merge. Removing it needs a D-n and a `docs(spec): §11 …` commit, not
  this card.
- **No JavaScript / before hydration.** `CompleteAllButton` is `<button type="button" onClick>`: inert without
  JavaScript and a click before hydration is lost, the same as "Clear completed" today. Nothing existing is dropped.
- **Two approvals.** Phase B adds `src/app/page.tsx`, `src/lib/CLAUDE.md`, `src/components/CLAUDE.md` in a round-2
  plan; `check-plan-scope.sh` reads the Files at the latest `plan … approved` commit, so those three edits are blocked
  until that commit exists.
- **Length.** `plan.md` is 86 lines against `planning.md`'s ≈ 40 (the longest plan under `backlog/work/`; earlier
  approved plans are 68–78). The two phases already split the work; noted, not blocking.

## Plan review (round 2)

Reviewed at `d415655` (`plan.md` 88 lines; diff from `5a467e8`: `plan.md` Sequence paragraph, one line each in
`analysis.md`, `advice.md` and round 1 above; nothing under `spec/`, `src/`, `e2e/`, `prisma/`). Run here:
`scripts/ci/check-spec-sections.sh` → `[check-spec-sections] OK: sections cited: 1 2 3 4 5 6 7 8 9 10 11 14`;
`scripts/next-task.sh --check B2.3` → `[next-task] B2.3: no overlap with any Doing or Review card`;
`scripts/ci/check-features-map.sh` → `[check-features-map] OK`; `scripts/ci/check-ac-coverage.sh` →
`§14: ✗, no tests expected yet (6 criteria)` then `OK`; `pnpm test` → `Tests  115 passed (115)`.

| Check                                                                                  | Result                                                                                                                                                                                                                                                                                                    |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                         | pass: Files table unchanged since round 1                                                                                                                                                                                                                                                                 |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib         | pass: Interfaces block unchanged since round 1                                                                                                                                                                                                                                                            |
| plan follows `advice.md`'s recommendation or states the deviation                      | pass: Approach A, wiring A; the advice change is citation text only                                                                                                                                                                                                                                       |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number              | pass: §14 unchanged, 6 criteria                                                                                                                                                                                                                                                                           |
| verification lists exact commands with expected numbers                                | pass: unchanged; baseline `115 passed` re-confirmed, so 123 after phase A holds                                                                                                                                                                                                                           |
| work breakdown has skeleton → red → green → map → review with convention subjects      | pass: unchanged                                                                                                                                                                                                                                                                                           |
| the section has a `Lead approves spec` box, ticked only by a human (D-7), never by you | pass: `spec/contracts/12-complete-all.md:5` still `- [ ] Lead approves spec (lead, <date>)`                                                                                                                                                                                                               |
| no settled D-n contradicted                                                            | pass (round 1 reason 1 resolved): the two sibling sections are now written "section 12" / "section 13" (`analysis.md:36`, `advice.md:237`), as D-20 requires; the guard cites only sections with a heading                                                                                                |
| `scripts/next-task.sh --check B2.3` on the committed plan says no overlap              | pass: `[next-task] B2.3: no overlap with any Doing or Review card`. Round 1 reason 2 resolved: `plan.md:37–40` now states the rule the guard enforces (first amended plan committed with `--check` clean takes the page, lead as fallback), consistent with B2.2's approved plan, which re-runs `--check` |

Verdict: approved

Costs added in round 2 (round 1's five still stand: WIP 3 of 3, §11 text drift, no JavaScript, two approvals, length
now 88 lines):

- **The tie-break can stall both cards until the lead picks.** `--check` is symmetric and reads each card's plan at
  its branch head, approved or not (`plan-files.sh --any`). The losing card only sees the overlap after committing its
  own amended plan; from then on the winner's `--check` reports the same overlap, and `dev-lead.md` step 4 forbids
  asking for a re-approval over one. Trigger: B2.1 merges; B2.3 commits its amended plan (clean); B2.2 commits its
  amendment before B2.3's `round 2 approved` commit → both `--check` runs exit 1. Nothing in the guard records who was
  first, so the plan's "(or the lead picks the order)" is the path that resolves it. Avoidable if the second card reads
  the other plan first (`scripts/ci/plan-files.sh --any B2.2 feat/B2.2-remaining-count | grep src/app/page.tsx`)
  before committing; not required by the plan.
- **Round 1 text was edited by dev-lead.** `d415655` rewrote the quote in round 1 reason 1 (the sign spelled out, with an
  inline note) because that quote itself failed `check-spec-sections.sh`. The edit keeps the meaning and is disclosed;
  recorded so the history of this file is not read as the reviewer's alone.

## Diff review (pass 1)

SCOPE: all (lib, actions, ui). Phase A only, reviewed as banked at `5a3ebfe`; range `fa98ab2..HEAD` (skeleton
`5a1fb82`, red `a18a9a9`, green `5a3ebfe`). Phase B (`src/app/page.tsx` mount, `e2e/14-complete-all.spec.ts` for
AC-14.6, `src/lib/CLAUDE.md`, `src/components/CLAUDE.md`) is not in this diff and gets pass 2.

### Commands (run by the reviewer, last line of each)

| Command                             | Last line                                                                                                             |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                         | `All matched files use Prettier code style!`                                                                          |
| `pnpm typecheck`                    | `> tsc --noEmit` (exit 0, no output)                                                                                  |
| `pnpm test`                         | `Tests  123 passed (123)` (15 files)                                                                                  |
| `pnpm test:e2e`                     | `13 passed (11.9s)` (unchanged; no §14 e2e in phase A)                                                                |
| `pnpm test:mutation`                | `Final mutation score of 89.41 is greater than or equal to break threshold 70`                                        |
|                                     | `complete-all.ts` 2 killed, 7 compile errors; `todo-complete-all.ts` 4 killed, 2 compile errors; 0 survived in either |
| `scripts/ci/check-suppressions.sh`  | `[check-suppressions] OK: no new suppressions`                                                                        |
| `scripts/ci/check-config-change.sh` | `[check-config-change] OK: no protected config changed`                                                               |
| `scripts/ci/check-feat-commits.sh`  | `[check-feat-commits] OK: no feat commit touches tests`                                                               |
| `scripts/ci/check-ac-coverage.sh`   | `§14: ✗, no tests expected yet (6 criteria)` then `OK: every criterion of a shipped section has a test`               |
| `scripts/ci/check-spec-sections.sh` | `OK: sections cited: 1 2 3 4 5 6 7 8 9 10 11 14`                                                                      |
| `scripts/ci/check-features-map.sh`  | `[check-features-map] OK`                                                                                             |
| `scripts/verify-red.sh B2.3`        | `RESULT: red for the right reason` (actions 3/3, lib 2/2, component 3/3 new failed, 0 passed)                         |
| `scripts/next-task.sh --check B2.3` | `[next-task] B2.3: no overlap with any Doing or Review card`                                                          |
| `git diff --stat main...HEAD`       | `17 files changed, 895 insertions(+), 26 deletions(-)`                                                                |

### Checklist

| Check                                                                 | Result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every AC-§.n has a test whose assertion matches its Then              | pass for phase A: AC-14.1 (`toBe(2)`, 1 call, exact `[{ where: { completed: false }, data: { completed: true } }]`, 6 other methods 0 calls); AC-14.2 (exact result, `calls[0]` `[]`, `revalidatePath` once with `['/']`); AC-14.3 (`resolves.toEqual` the exact failure, 0 revalidations, 1 lib call, log args by reference, order `['logged', 'resolved']`); AC-14.4 (a)/(b) and AC-14.5 match the Then clause by clause. AC-14.6 deferred to phase B as planned                                                                                                                                                                                                                                                   |
| no test weakened after the red commit                                 | pass: `git log --first-parent --no-merges a18a9a9..HEAD -- '*.test.*' e2e/` empty; `--merges --remerge-diff` output 0 lines (no merge in range)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| every changed file is in `plan.md`                                    | pass: the 8 `src/` files and `src/actions/CLAUDE.md` are Files rows; `spec/features-map.md` and `docs/metrics.md` are the plan's declared paperwork (see note 3 on commit placement)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| interfaces match the section's contracts                              | pass: the three exports are byte-identical to §14's Function contracts block (`async` added, as in the plan); `MutationActionName` gains exactly `'completeAllTodosAction'`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Zod at every action boundary                                          | pass by §14: no input exists ("no Zod step"); the action takes 0 parameters, so nothing crosses the boundary unparsed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Prisma only in `src/lib`, no raw SQL                                  | pass: only `src/lib/todo-complete-all.ts` imports `@/lib/prisma`; one `updateMany` through the query builder                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| migration reversible and indexed                                      | n/a: no `prisma/` change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| no secret, no suppression                                             | pass (`check-suppressions.sh` OK; no key, URL or env read added)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| features map row moved                                                | pass for phase A: F12 row present, ✗, every path resolves; flips with phase B's `docs(map)`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| would a test fail if one changed line were reverted (probe on a copy) | pass, with one survivor noted below. Probed on a `git archive HEAD` copy: component `disabled={disabled}` → 1 failed; `disabled={pending}` → 1 failed; `disabled && pending` → 2 failed; never clearing the error → 1 failed; alert before the button → 1 failed; no `role="alert"` → 1 failed; alert always rendered → 1 failed; no transition → 1 failed. Action: `revalidatePath` outside the `try` → 2 failed; `revalidatePath` before the lib call → 2 failed; log deferred with `setTimeout` → 2 failed. Lib: `where` dropped → 2 failed. Survivors: the wrapper `<div>` replaced by a fragment → 3 passed (note 2); the alert text hard-coded to the §10 message → 3 passed (equivalent: §10 has one message) |

### Findings

None blocking.

### Notes (non-blocking, answers to dev-lead's three questions)

1. **`… (REQ-14.7)` / `… (REQ-14.8)` titles fit `testing.md`.** The rule is "titles start with the criterion …
   tests without a criterion carry no prefix"; neither title starts with `AC-` and the REQ id is a trailing
   parenthetical, which `check-ac-coverage.sh`'s `AC-n.n:` title regex ignores. §14 itself says REQ-14.7 has no
   criterion and is covered by the lib test. Precedent on `main`: `src/lib/logger.test.ts:239`, `:247`, `:323`,
   `:334`, `:345` use the same `(REQ-11.4)` suffix.
2. **Component pinning.** `disabled || pending` is pinned from both sides (AC-14.4 (a) kills `pending`-only, (b)
   kills `disabled`-only, both kill `&&`), and the alert-after-button placement by `button.nextElementSibling === alert`
   plus same parent. One clause of the Function contract is not pinned: "as the button's next sibling **inside one
   wrapper element**". Trigger: replace the `<div …>` at `src/components/complete-all-button.tsx:22` with a fragment;
   all 3 component tests still pass, because AC-14.5 only asks for "the same parent element as the button and after
   it" and the render container satisfies that. REQ-14.9 still holds with a fragment (the two nodes stay adjacent in
   the page), so this is not a spec mismatch; it matters only if phase B's page puts something between them, which
   a fragment cannot cause. `ClearCompletedButton` (§9/§10) has the identical shape and the same unpinned wrapper.
3. **`docs/metrics.md` in the feat commit.** Ignoring whitespace the change is 3 lines: the per-card separator and
   the new `B2.3` row; the other 21 changed lines are prettier re-padding forced by the new row widening columns
   "Covered" and "Green". Content is unchanged and the numbers check out (89.41; actions 100.00 = 28/28, lib 87.32 =
   124/142 from `reports/mutation/mutation.json`). Placement deviates from the plan's work breakdown, which puts the
   metrics row in step 6 `docs(map)`; harmless (paperwork, `check-feat-commits.sh` guards only tests), but the
   row's Green cell `phase A feat (this commit)` is not a sha: step 6 should replace it with `5a3ebfe` (and the phase B
   feat sha). Likewise the skeleton's F12 row already names the three test files and `src/lib/logger.ts`, where the
   plan said "three modules" in the skeleton and tests in `docs(map)`; `check-features-map.sh` allows missing paths
   on ✗ rows, so it passed at every commit.

Verdict: ready for PR (phase A banked; the PR stays draft until phase B, which pass 2 reviews)

Riskiest unfalsified: REQ-14.8's "for any reason" is exercised only with `Error` instances; a guard such as
`if (!(error instanceof Error)) throw error;` at the top of the `catch` in `src/actions/complete-all.ts:14` survives
all 3 action tests (probed). The shipped `catch (error)` has no such guard, so the code is correct by trace; only the
test would not catch a future regression for a thrown non-Error value.

### Dispositions (dev-lead, pass 1)

| Pass | #   | Finding (file:line)                                                                      | Source             | Kind     | Disposition      | Justification                                                                                                                       |
| ---- | --- | ---------------------------------------------------------------------------------------- | ------------------ | -------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 1    | N1  | REQ-14.8 "any reason" tested only with `Error` values (`src/actions/complete-all.ts:14`) | reviewer (note)    | coverage | no change needed | the shipped `catch (error)` has no type guard; input `completeAllTodos` rejecting `'x'` takes the same branch. Regression risk only |
| 1    | N2  | "inside one wrapper element" not pinned (`src/components/complete-all-button.tsx:22`)    | reviewer (note)    | coverage | no change needed | REQ-14.9 (next sibling, same parent) is pinned by AC-14.5; `ClearCompletedButton` carries the same unpinned wrapper on main         |
| 1    | N3  | metrics row in the feat commit; Green cell "phase A feat (this commit)"                  | reviewer, dev-lead | docs     | fix now (step 6) | the `docs(map)` commit replaces the cell with `5a3ebfe` and adds the phase B sha; numbers verified (89.41, actions 28/28)           |
| 1    | N4  | F12 row names test files and `logger.ts`, plan said three modules                        | reviewer (note)    | docs     | no change needed | the row is more complete than the plan text; `check-features-map.sh` OK; paperwork path, outside plan-scope                         |
| 1    | Q1  | criterion-less titles with a `(REQ-14.n)` suffix                                         | dev-lead           | style    | no change needed | `src/lib/logger.test.ts:239` uses the same suffix on main; `check-ac-coverage.sh` OK                                                |

Dev-lead own pass: the eight invariants hold (no Zod needed: no input, §14; Prisma only in `src/lib/todo-complete-all.ts`;
no test changed after a18a9a9; no file outside the plan's Files under `src/`). Reverting any line of the three modules
fails at least one test (mutation 6/6 killed in the new lib/action files; component probes as above).
