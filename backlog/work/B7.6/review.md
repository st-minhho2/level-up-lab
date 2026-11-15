# B7.6 review

## Plan review (round 1)

Scope: ui (only `src/components/todo-due-date.tsx`, a component test, an e2e file, the features map).
Baseline re-run by the reviewer: `pnpm test` → `Test Files 48 passed (48)`, `Tests 298 passed (298)` (matches the plan).

| Check                                                                                           | Result                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                                  | pass: the component is the one §40's contract names ("The only file of `src/` this section changes"); the test, e2e and the F38 row are §40's; the AC-37.1 rewrite is authorized by D-38                                                                                                                                                                                                                                   |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib                  | pass: `TodoDueDate` signature unchanged (copied from §40 Function contracts); internal `save(value: string): void` / `onClear(): void` with return types; the mutation stays `setTodoDueDateAction`; no lib, action, schema or Prisma change (REQ-40.7)                                                                                                                                                                    |
| plan follows `advice.md`'s recommendation or states the deviation                               | pass, with a note: approach A is followed. The advice's Impact section asks for a `chore(todos): B7.6 skeleton` stub; the plan drops it ("No new export, so no skeleton (as B7.3)") with a reason and the B7.3 precedent. Red still fails on an assertion (no button named "Clear due date"), not an import, so `verify-red.sh` step 6 can pass. Not flagged as a deviation from the advice in words; acceptable as stated |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number                       | pass: 6 AC (AC-40.1–40.6), each Then is counts, exact texts, call args, `defaultPrevented`, disabled state                                                                                                                                                                                                                                                                                                                 |
| verification lists exact commands with expected numbers                                         | **fail**: green is "`pnpm test` 298 → 298 + N new passed (49 files)" and "`pnpm test:e2e` +1" with no e2e baseline; N is not a number (reason 1)                                                                                                                                                                                                                                                                           |
| work breakdown has skeleton → red → green → map → review with convention subjects               | pass: skeleton step present as "none" with a reason; `test(todos): B7.6 … (red)`, `feat(todos): B7.6 …`, `docs(map): F38 … [B7.6]`, `docs(backlog): B7.6 review …` match B7.3's subjects on main (`14defd1 feat(todos): B7.3 …`)                                                                                                                                                                                           |
| the section has a `Lead approves spec` box, ticked only by a human (D-7), never by the reviewer | pass: `- [ ] Lead approves spec` present in `spec/contracts/38-due-date-clear.md`, unticked; not touched                                                                                                                                                                                                                                                                                                                   |
| no settled D-n contradicted                                                                     | pass: D-37 (component only, no server change) and D-38 (AC-37.1 rewritten to 5 children in the red commit, not the feat commit) are followed; §37's AC-37.1 on this branch already reads "exactly 5"                                                                                                                                                                                                                       |
| `scripts/next-task.sh --check B7.6` says no overlap                                             | pass: `[next-task] B7.6: no overlap with any Doing or Review card`                                                                                                                                                                                                                                                                                                                                                         |

Other things checked, no finding:

- No existing test besides AC-37.1 (`todo-due-date-today-button.test.tsx:84`, `toHaveLength(4)`) counts the form's children or
  the buttons in the due-date editor; `getAllByRole('button')` length checks are only in other components' tests; every
  `name: 'Clear …'` query is `Clear completed…`, exact-string, so a "Clear due date" button collides with none.
- AC-37.1's rewritten title differs from the current one, so `verify-red.sh` treats it as new and requires it red: it
  is (the current form has 4 children).
- Costs the lead takes are stated: the button shows and sends `''` when no date is stored (REQ-40.1, Out of scope
  forbids hiding it), and B7.3's AC-37.1 test changes under D-38. No dropped behavior; no role is blocked.

Verdict: changes requested

1. Verification has no expected number for the green unit run or the e2e run. Replace "298 + N new passed (49
   files)" with the count the strategy produces (AC-40.1 a/b, AC-40.2 a/b, AC-40.3 a/b, AC-40.4 a/b, AC-40.5 a, b and
   one row per Ctrl/Meta/Alt/Shift/ArrowLeft as `advice.md` plans = 15, AC-37.1 replaced not added → 313 passed, 49
   files, if that is the layout the test-writer will use; state whichever count is intended), and give the e2e
   baseline and target ("`pnpm test:e2e` X → X + 1 passed"). Without them the diff review cannot tell a dropped or
   merged `it.each` row from the plan.

## Plan review (round 2)

Scope: ui. Plan read at `a677ea0`. `git diff --stat main...HEAD` → only `backlog/work/B7.6/{advice,plan,review}.md`,
so round 1's unit baseline (`Tests 298 passed (298)`, 48 files) still holds. e2e baseline re-run by the reviewer:
`pnpm exec playwright test --list` → `Total: 70 tests in 30 files` (matches the plan's "70 → 71 (30 → 31 files)").

| Check                                                                             | Result                                                                                                                                                                                                                                                                                                                     |
| --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: unchanged from round 1; the F38 id matches D-37 ("feature ids F33–F38 in that order", B7.6 last) and the contract file `38-due-date-clear.md`; F36/F37 are B7.4/B7.5's, not taken by this plan                                                                                                                       |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: unchanged; `TodoDueDate` signature copied verbatim from §40 Function contracts; internal `save(value: string): void`, `onClear(): void`; no action, schema, lib or Prisma change (REQ-40.7)                                                                                                                          |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: approach A; the skeleton drop is stated with its reason ("No new export, so no skeleton (as B7.3)") and red still fails on an assertion                                                                                                                                                                              |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: 6 AC, each Then counts, exact texts, call args, `defaultPrevented`, disabled state                                                                                                                                                                                                                                   |
| verification lists exact commands with expected numbers                           | pass (round 1 reason 1 resolved): `pnpm test` 298 → 313 passed, 49 files (15 = AC-40.1 a/b + 40.2 a/b + 40.3 a/b + 40.4 a/b + 40.5 a + b + 5 `it.each` rows for Ctrl/Meta/Alt/Shift/ArrowLeft, AC-37.1 replaced in place); `pnpm test:e2e` 70 → 71, 30 → 31 files, baseline confirmed above; mutation "CI only" per B1.100 |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: unchanged from round 1                                                                                                                                                                                                                                                                                               |
| the section has a `Lead approves spec` box, ticked only by a human (D-7)          | pass: `- [ ] Lead approves spec` in `spec/contracts/38-due-date-clear.md`, unticked, not touched                                                                                                                                                                                                                           |
| no settled D-n contradicted                                                       | pass: D-37 (component only; F38) and D-38 (AC-37.1 rewritten to 5 children in the red commit) followed                                                                                                                                                                                                                     |
| `scripts/next-task.sh --check B7.6` says no overlap                               | pass: `[next-task] B7.6: no overlap with any Doing or Review card`                                                                                                                                                                                                                                                         |

Costs the lead takes (as stated in the plan, re-checked): the button is shown and sends `''` when no date is stored
(REQ-40.1; hiding it is Out of scope), a no-op save; B7.3's AC-37.1 test changes under D-38, in the red commit only
(a `feat(...)` commit touching it would be rejected by `check-feat-commits.sh`); a mutant in the shared `save` is
caught by AC-15.n and AC-40.n tests both. No dropped behavior; no role blocked. The plan's footer still reads
"Rounds: 1"; paperwork, not a reason.

Verdict: approved (ready for the lead's gate, not approved for build)

## Diff review (round 1)

SCOPE: ui. Branch `feat/B7.6-agent` at `940c7aa`; red `17301e0`, feat `ab98c4c`, map `940c7aa`.

### Command results (last line each, run by the reviewer)

| Command                             | Result                                                                                        |
| ----------------------------------- | --------------------------------------------------------------------------------------------- |
| `pnpm lint`                         | `All matched files use Prettier code style!`                                                  |
| `pnpm typecheck`                    | `tsc --noEmit`, exit 0                                                                        |
| `pnpm test`                         | `Tests  313 passed (313)`, 49 files (plan: 298 → 313, 49 files)                               |
| `pnpm test:e2e`                     | `71 passed (2.6m)` (plan: 70 → 71); AC-40.6 green                                             |
| `scripts/mutation-gate.sh`          | `mutation: CI only, no src/lib or src/actions change`                                         |
| `scripts/ci/check-suppressions.sh`  | `OK: no new suppressions`                                                                     |
| `scripts/ci/check-config-change.sh` | `OK: no protected config changed`                                                             |
| `scripts/ci/check-feat-commits.sh`  | `OK: no feat commit touches tests`                                                            |
| `scripts/ci/check-ac-coverage.sh`   | `OK: every criterion of a shipped section has a test`                                         |
| `scripts/ci/check-spec-sections.sh` | `OK: sections cited: 1 … 43`                                                                  |
| `scripts/ci/check-features-map.sh`  | `OK`                                                                                          |
| `scripts/ci/check-plan-scope.sh`    | `OK: feat/B7.6-agent stays inside the approved plan of B7.6 (D-27 approval)`                  |
| `scripts/verify-red.sh B7.6`        | `RESULT: red for the right reason` (clear test 15/15 new failed; today-button 1/1 new failed) |
| `git diff --stat main...HEAD`       | `10 files changed, 745 insertions(+), 9 deletions(-)`                                         |

### Checklist

| Check                                                     | Result                                                                                                                                                                                                                                                             |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| every AC-40.n has a test whose assertion matches its Then | pass: AC-40.1–40.5 in `todo-due-date-clear.test.tsx` (counts, order, `type`, text, no `aria-label`/`title`, call args, `defaultPrevented`); AC-40.6 in `e2e/40-due-date-clear.spec.ts` (before/after reload, `[C, B, A]`, A/C `innerHTML` unchanged)               |
| no test weakened after the red commit                     | pass: `git log --first-parent --no-merges 17301e0..HEAD -- '*.test.*' e2e/` empty; no merges with remerge diff                                                                                                                                                     |
| AC-37.1 rewrite (D-38)                                    | pass: in the red commit only; 4 → 5 children, a strengthening, as §40 edits AC-37.1                                                                                                                                                                                |
| every changed file is in `plan.md`                        | pass: 5 Files rows + `docs/metrics.md` and `backlog/work/B7.6/*` (paperwork named in the plan)                                                                                                                                                                     |
| interfaces match §40 Function contracts                   | pass: `TodoDueDate` props and signature unchanged; `save`/`onClear` internal; button order label, input, Today, Clear due date, Update due date                                                                                                                    |
| Zod at action boundary / Prisma only in lib / raw SQL     | n/a: no action, lib, schema or Prisma change (REQ-40.7)                                                                                                                                                                                                            |
| migration                                                 | n/a                                                                                                                                                                                                                                                                |
| no secret, no suppression                                 | pass (`check-suppressions.sh` OK; diff read)                                                                                                                                                                                                                       |
| features map row moved                                    | pass: F38 (§40) ✅ in `docs(map)` commit `940c7aa`                                                                                                                                                                                                                 |
| Server/Client boundary                                    | pass: `todo-due-date.tsx` already `'use client'`; no new import                                                                                                                                                                                                    |
| would a test fail if one changed line were reverted?      | pass, probed on a clone at `$TMPDIR/c`, `todo-due-date-clear.test.tsx` (15 tests): `save('')` → `save(draft)` 4 failed; → `save(' ')` 4 failed; drop Clear's `onKeyDown` 1 failed; drop Clear's `disabled={pending}` 3 failed; `type="button"` → `submit` 8 failed |

### Findings

No blocking finding.

Note, not blocking: the `docs/metrics.md` B7.6 row's last column reads `feat B7.6`, not a sha as the B7.1–B7.3
rows do (`ab98c4c` exists now). Paperwork; the closing PR can fix it.

Verdict: ready for PR

Riskiest unfalsified: Escape on "Clear due date" (REQ-40.6) is covered only in jsdom with `fireEvent` keydowns
(AC-40.5); no real-browser keyboard path for it is exercised, which §40 allows (AC-40.6 does not require it).
