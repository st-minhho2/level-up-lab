SCOPE: all

# B2.2 review

## Plan review (round 1)

Reviewed: `backlog/work/B2.2/plan.md` at `b69db78` (`Plan approved by:` empty) against §13
(`spec/contracts/11-remaining-count.md`), card B2.2 in `backlog/plan/E2-todos-plus.md`, `analysis.md`, `advice.md`,
D-7 and D-20, the rules, and the sibling branch `feat/B2.1-filter` (local, plan at `3257152`). Run here on
2026-10-31: `pnpm test` → `Tests 115 passed (115)`; `scripts/ci/plan-files.sh --any B2.2` → the 5 paths of the Files
table (no `src/app/page.tsx`); CI guards on HEAD and on a copy with the two phase-A stubs (see reasons 1 and 2).

| Check                                                                             | pass / fail: reason                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: the 5 Files rows are the modules and tests §13's Function contracts name (F11 on the card); the phase-B `src/app/page.tsx` row is the mount §13 names. F11 has no map row yet, see reason 1.                                                                                                                                                                                                                                                                |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: the three signatures are §13's Function contracts character for character; explicit return types, `readonly` props, kebab-case files; no action, no Zod schema, no Prisma, `todos.ts` and `actions/todos.ts` untouched.                                                                                                                                                                                                                                     |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: Approach A, e2e deferred to phase B, round-2 approval subject `docs(backlog): B2.2 plan round 2 approved` (matches `plan-files.sh` `plan (round [0-9]+ )?approved`), `page.tsx` kept out of the Files table, coupling grep kept. Commit scopes differ from the advice (`todos`/`ui` vs `lib`/`e2e`/`app`); all pass the commit-msg regex. The advice's phase-B red evidence (one `pnpm test:e2e` run recorded in the commit body) is dropped, see reason 3. |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: AC-13.1 … AC-13.7 (7, `check-ac-coverage.sh`: "§13: ✗, no tests expected yet (7 criteria)"); every Then is a number, an exact string or an element / `listitem` count; the 7 Unchanged-behavior titles exist verbatim (grep: `e2e/05` ×3, `e2e/09` ×2, `src/lib/todos.test.ts`, `src/components/todo-item.test.tsx`).                                                                                                                                       |
| verification lists exact commands with expected numbers                           | fail: `115 → ~123` is an estimate (baseline 115 confirmed); `scripts/ci/check-features-map.sh` is missing although it is the guard reason 1 trips; phase B has no red command for `e2e/13` (`verify-red.sh` skips `e2e/*.spec.ts`). See reason 3.                                                                                                                                                                                                                 |
| work breakdown has skeleton → red → green → map → review with convention subjects | fail: the order is skeleton → red → green → B red → B green → map → review, and "Diff review may run once after step 3" sits before the map step; the map row cannot wait for phase B (reason 1). Subjects match the commit-msg regex and `verify-red.sh`'s `^test\([^)]*\): B2\.2 .*\(red\)$` (both red commits; traced: base = parent of the first, unit files from the last, e2e skipped, so phase A's red stays provable after phase B).                      |
| the section has a `Lead approves spec` box, ticked only by a human (D-7)          | pass: `- [ ] Lead approves spec (lead, <date>)` present, unticked. The plan does not say whether the round-1 `approve` ticks it (B2.1's plan says so for its section); phase-A tests land on §13, so say it.                                                                                                                                                                                                                                                      |
| no settled D-n contradicted                                                       | fail (input, not the plan body): D-20 says a section is "written 'section n' until `spec-analyst` adds the heading, since `check-spec-sections.sh` rejects a cited § without one". `advice.md` lines 66, 95, 162 cite B2.1's section with the § sign; its heading exists only on `feat/B2.1-filter` (`d6cbb31`). See reason 2. The plan itself keeps D-20 (a): own modules, `page.tsx` deferred until B2.1 releases it.                                           |
| `scripts/next-task.sh --check B2.2` says no overlap                               | pass: `[next-task] B2.2: no overlap with any Doing or Review card` (exit 0, run at `b69db78`). No longer vacuous: `feat/B2.1-filter` now has a plan (`1112f25`, `3257152`) whose Files include `src/app/page.tsx`, `src/lib/CLAUDE.md`, `src/components/CLAUDE.md`; B2.2's 5 paths overlap none. The plan's "today's pass is vacuous" is stale.                                                                                                                   |

Verdict: changes requested

1. **The F11 map row lands too late; every phase-A push is CI-red.** `scripts/ci/check-features-map.sh` requires every
   `src/lib/*.ts` and `src/components/*.tsx` module to be named in some row, whatever its status. Trigger: the step-1
   skeleton adds `src/lib/todo-count.ts` and `src/components/remaining-count.tsx`; on a copy of `b69db78` with those two
   stubs the script prints `::error::src/lib/todo-count.ts is in no features-map row` and
   `::error::src/components/remaining-count.tsx is in no features-map row`, exit 1. CI's `guards` job runs it on
   every `pull_request` synchronize, drafts included, so from the skeleton push until step 6 (after B2.1 merges,
   open-ended) the draft PR is red, and the phase-A diff review the plan offers fails its own command list. Fix: an F11
   row with status ✗ naming the two modules and the two test files, in the skeleton commit (B2.1's plan does exactly this
   for F10, "guard needs every module named"); step 6 adds `src/app/page.tsx` and `e2e/13-remaining-count.spec.ts` and
   flips the status. `spec/features-map.md` is paperwork, so no Files row and no overlap.
2. **`advice.md` cites a section that has no heading on this branch; the guard fails today.** Trigger: HEAD `b69db78`,
   `scripts/ci/check-spec-sections.sh` → `::error::` "(section 12) is cited but has no heading in spec/contracts/" (quoted without the § sign, which this
   guard would flag here too), exit 1 (it scans
   `backlog/`). It stays red until B2.1 merges and this branch merges `origin/main`, i.e. for all of phase A, and the
   plan's own Verification line runs this script. Fix: a `docs(backlog): B2.2 …` commit writing "section 12" at
   `advice.md:66`, `:95`, `:162`, as D-20 prescribes.
3. **Verification is not exact.** State the expected unit count as a sum per file (115 + AC-13.1 cases + AC-13.2 cases
   - component cases = N), add `scripts/ci/check-features-map.sh` to the guard line, and give phase B's red command and
     expectation (`pnpm test:e2e e2e/13-remaining-count.spec.ts` → 5 failed on "0 items left" / "N items left" not found,
     recorded in the `test(ui)` commit body), since `verify-red.sh` lists e2e files as skipped.

Costs the lead accepts by approving (none blocking; for the round-2 amendment and the diff review):

- **REQ-13.5 has no test under a filter.** None of AC-13.1 … AC-13.7 runs with a filter selected; a `page.tsx` that
  passes B2.1's `filterTodos(todos, filter)` result to `countRemaining` passes all 7 criteria and breaks REQ-13.5
  (e.g. `/?filter=completed` with 2 open todos would read "0 items left"). The only guard is the plan's `git grep`
  line plus the diff reviewer. A test needs a §13 change (7 of 7 criteria used).
- **Paperwork conflict at the phase-B merge.** `git merge-tree --write-tree HEAD feat/B2.1-filter` today:
  `CONFLICT (content): Merge conflict in spec/technical-requirements.md` (both branches add an index row);
  `spec/features-map.md` will conflict the same way once F10 and F11 are both appended. The advice's "merge brings
  B2.1's version in without conflict" holds for `page.tsx` only.
- **Package docs drift.** `src/lib/CLAUDE.md`'s module table will not list `todo-count.ts`, and
  `src/components/CLAUDE.md` says "client components" while `RemainingCount` is a Server Component. B2.1's plan edits
  both files, so adding them in round 1 would create an overlap; put them in the round-2 amendment.
- **Skeleton skill vs contract.** `new-feature-slice` says "one exported async function per behavior", components
  "only if the spec needs interactivity", and may create `src/app/page.tsx` for a home-page slice. §13 needs two sync
  functions, one Server Component stub and no `page.tsx` in phase A (the plan-scope hook blocks it anyway); the
  dispatch should say so.
- **Phase-B green gate range.** dev-lead's `git log --first-parent --no-merges <red>..HEAD -- '*.test.*' e2e/` must
  start at the phase-B red commit; from the phase-A red it lists the `test(ui)` e2e commit (explained, but not "empty").
- **Wall clock.** The board shows B2.1 and B2.2 both Doing; B2.2 holds its WIP slot, an unused `countRemaining` /
  `RemainingCount` (no unused-export check in `package.json`) and a draft PR until B2.1 is MERGED.
- `plan.md` is 65 lines against `planning.md`'s ≈ 40; the overrun is the phase-B prose and wide tables, not scope.

Riskiest unfalsified: the phase-B argument of `countRemaining(` on the merged `page.tsx`; nothing executable checks it.

## Plan review (round 2)

Reviewed: `backlog/work/B2.2/plan.md` at `0476e21` (`Plan approved by:` empty), the diff `8ef4071..0476e21` (plan,
`advice.md`), against §13, D-7, D-20 and the rules. Run here on 2026-10-31: `pnpm test` → `Tests 115 passed (115)`;
on HEAD `check-spec-sections.sh` → `[check-spec-sections] OK: sections cited: 1 2 3 4 5 6 7 8 9 10 11 13` (exit 0),
`check-features-map.sh` → `[check-features-map] OK`, `check-ac-coverage.sh` → `§13: ✗, no tests expected yet (7
criteria)` (exit 0), `check-feat-commits.sh` → `OK: no feat commit touches tests`; `plan-files.sh --any B2.2` → the
same 5 paths. Probe (scratch copy of `0476e21` + the two phase-A stubs + an F11 row with status ✗):
`check-features-map.sh` → `[check-features-map] OK`, exit 0; `check-spec-sections.sh` exit 0.

| Check                                                                             | pass / fail: reason                                                                                                                                                                                                                                                                                                                                                                                                                |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: unchanged 5 rows, all named by §13's Function contracts; F11 row (✗) now lands in the skeleton commit (round-1 reason 1 closed, probe above).                                                                                                                                                                                                                                                                                |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: the three signatures match §13 verbatim; `ReactNode` return is the house form (`todo-item.tsx:8`, `clear-completed-button.tsx:7`; React 19.1, `@types/react` ^19); no action, schema or Prisma.                                                                                                                                                                                                                              |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: Approach A unchanged; `advice.md` now writes "section 12" at the three lines (round-1 reason 2 closed, guard exit 0). The advice's phase-B evidence "recorded in the commit body" is not restated; the command and its expected 5 failures now are, which is the measurable part.                                                                                                                                            |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: AC-13.1 … AC-13.7, 7 criteria, unchanged since round 1.                                                                                                                                                                                                                                                                                                                                                                      |
| verification lists exact commands with expected numbers                           | pass: 115 (confirmed) + 8 (AC-13.1 ×4, AC-13.2 ×4) + 3 (component 0/1/2) = 126; `verify-red.sh` 11 new failed, 0 new passed (its PASS rule, `verify-red.sh:14`; `NotImplementedError` reads "<name> is not implemented", which matches none of `IMPORT_ERROR`); phase-B red `pnpm test:e2e e2e/13-…` → 5 failed (each test's first count assertion fails, traced per AC); `check-features-map.sh` added (round-1 reason 3 closed). |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: the map row is split (✗ row in step 1, tests + page + status in step 6), so the phase-A diff review after step 3 runs on a green map guard; all 7 subjects match the `lefthook.yml:43` regex and the two red subjects match `verify-red.sh`'s `^test\([^)]*\): B2\.2 .*\(red\)$`; phase-B green-gate range now starts at the step-4 red.                                                                                     |
| the section has a `Lead approves spec` box, ticked only by a human (D-7)          | pass: `- [ ] Lead approves spec (lead, <date>)` present, unticked. The plan still does not say whether the plan-gate `approve` ticks it; D-7 permits either, see costs.                                                                                                                                                                                                                                                            |
| no settled D-n contradicted                                                       | pass: D-20's "section n" rule now held in `advice.md`; D-20 (a) kept (`page.tsx` deferred); D-7 untouched.                                                                                                                                                                                                                                                                                                                         |
| `scripts/next-task.sh --check B2.2` says no overlap                               | pass: `[next-task] B2.2: no overlap with any Doing or Review card` (exit 0, run at `0476e21`); the plan's "today: no overlap with B2.1's plan, which holds the page" replaces the stale "vacuous" line.                                                                                                                                                                                                                            |

Verdict: approved (ready for the lead's gate; not approved for build until `Plan approved by:` is written by the lead)

Costs the lead accepts by approving (carried from round 1 unless marked new; none blocking):

- **REQ-13.5 has no test under a filter.** A phase-B `page.tsx` passing B2.1's filtered array to `countRemaining`
  passes all 7 criteria (`/?filter=completed` with 2 open todos would read "0 items left"). Only the plan's `git grep`
  line and the diff reviewer guard it; a test needs a §13 change (7 of 7 criteria used).
- **Spec box timing (new wording).** Phase-A tests land on §13 while its `Lead approves spec` box is unticked. If the
  lead's `approve` reply is not meant to tick it (D-7 allows the gate to), tick it separately before step 2.
- **Phase-B amendment review is round 3 (new).** `planning.md` puts a reviewer plan review before every approval; the
  amendment's review, numbered on, is "Plan review (round 3)", which this role's rules turn into "Waiting on human".
  The plan's "plan round 2 approved" subject refers to a second _approval_, not review round 2. Name the amendment's
  review distinctly or expect the human hold.
- **Paperwork conflicts at the phase-B merge:** `spec/technical-requirements.md` (stated in the plan) and
  `spec/features-map.md` (F10 and F11 both appended; not stated).
- **Package docs drift:** `src/lib/CLAUDE.md` module table and `src/components/CLAUDE.md` ("client components" vs a
  Server Component) are left for the phase-B amendment, since B2.1's plan holds both files.
- **Wall clock:** B2.2 holds its WIP slot and a draft PR with two unused exports until B2.1 is MERGED.
- **Length:** `plan.md` is 73 lines against `planning.md`'s ≈ 40 (65 at round 1); the growth is round-1 fixes, not scope.

Riskiest unfalsified: the phase-B argument of `countRemaining(` on the merged `page.tsx`; nothing executable checks it.

## Diff review (pass 1)

Scope: phase A only (plan steps 1–3: `7d1b580` chore, `09e53b9` red, `2c03bf5` feat). `src/app/page.tsx` and
`e2e/13-remaining-count.spec.ts` are phase B and absent on purpose (`git diff --stat main...HEAD -- src/app e2e
prisma src/actions` → empty). Merge base `fa98ab2` = `main` = `origin/main`. Run here on 2026-10-31 at `2c03bf5`.

### Command results (last line of each)

| Command                             | Result                                                                                                                                                   |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                         | `All matched files use Prettier code style!` (exit 0)                                                                                                    |
| `pnpm typecheck`                    | `tsc --noEmit`, no output (exit 0)                                                                                                                       |
| `pnpm test`                         | `Tests  126 passed (126)` (14 files; 115 + 8 + 3, as the plan states)                                                                                    |
| `pnpm test:e2e`                     | `13 passed (12.3s)` (unchanged count, phase A)                                                                                                           |
| `pnpm test:mutation`                | `Final mutation score of 89.53 is greater than or equal to break threshold 70`; lib 87.67, actions 100.00; `todo-count.ts` 100.00 (8 killed, 0 survived) |
| `scripts/ci/check-suppressions.sh`  | `OK: no new suppressions`                                                                                                                                |
| `scripts/ci/check-config-change.sh` | `OK: no protected config changed`                                                                                                                        |
| `scripts/ci/check-feat-commits.sh`  | `OK: no feat commit touches tests`                                                                                                                       |
| `scripts/ci/check-ac-coverage.sh`   | `OK: every criterion of a shipped section has a test` (§13: ✗, no tests expected yet (7 criteria))                                                       |
| `scripts/ci/check-spec-sections.sh` | `OK: sections cited: 1 2 3 4 5 6 7 8 9 10 11 13`                                                                                                         |
| `scripts/ci/check-features-map.sh`  | `OK`                                                                                                                                                     |
| `scripts/ci/check-plan-scope.sh`    | `OK: feat/B2.2-remaining-count stays inside the approved plan of B2.2`                                                                                   |
| `scripts/verify-red.sh B2.2`        | `RESULT: red for the right reason` (todo-count 8 new failed / 0 passed; remaining-count 3 / 0)                                                           |
| `git diff --stat main...HEAD`       | `13 files changed, 635 insertions(+), 1 deletion(-)`; code: the 4 files of the plan's phase-A rows                                                       |

### Checklist

| Check                                                                            | Result                                                                                                                                                                                                                                                                                                                                                                                                 |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| every AC-§.n has a test whose assertion matches its Then                         | pass for phase A: AC-13.1 (a)–(d) → `toBe(0/3/3/0)` + `toEqual(before)` on frozen inputs (an in-place change throws); AC-13.2 0/1/2/11 → exact strings. AC-13.3 … 13.7 belong to `e2e/13` (phase B); the guard still reads §13 ✗, so no false "shipped".                                                                                                                                               |
| no test weakened after the red commit                                            | pass: `git log --first-parent --no-merges 09e53b9..HEAD -- '*.test.*' e2e/` empty; `--merges --remerge-diff` empty (no merge commits).                                                                                                                                                                                                                                                                 |
| every changed file is in `plan.md`                                               | pass: 4 code files = phase-A Files rows; `spec/features-map.md`, `docs/metrics.md`, `backlog/` are paperwork (`check-plan-scope.sh` OK).                                                                                                                                                                                                                                                               |
| interfaces match the section's contracts                                         | pass: the three signatures match §13 Function contracts character for character. Probe: a phase-B-shaped `<RemainingCount count={countRemaining(await listTodos())} />` in a scratch `src/app` file typechecks (`tsc` exit 0), so `Todo` (`readonly completed: boolean`) fits the parameter.                                                                                                           |
| Zod at every action boundary · Prisma only in `src/lib` · no raw SQL · migration | n/a: no action, no Prisma, no SQL, no migration in the diff. `todo-count.ts` imports nothing; no `server-only` in either module (as §13 requires).                                                                                                                                                                                                                                                     |
| no secret, no suppression                                                        | pass (`check-suppressions.sh`; no key-shaped string in the 4 files).                                                                                                                                                                                                                                                                                                                                   |
| features map row moved                                                           | pass for phase A: F11 (✗) added in the skeleton, test files added in the feat; status, page and e2e wait for step 6.                                                                                                                                                                                                                                                                                   |
| would a test fail if one changed line were reverted?                             | probe on a scratch copy, card tests only: `<p>`→`<span>` 3 failed; `<p>{count} items left</p>` 1 failed; `count <= 1` 2 failed; Stryker kills all 8 mutants of `todo-count.ts`. Survivors, none a spec violation: wrapping the `<p>` in a `<div>`, a trailing space in the `<p>`, `aria-live="polite"` on the `<p>`, `Math.abs(count) === 1` (unreachable: `countRemaining` never returns a negative). |

### Answers to dev-lead's three questions

1. **Server Component in `src/components/`.** Not a finding. §13 Function contracts name the path and say "a Server
   Component"; the spec wins over `src/components/CLAUDE.md` and the root map row ("client components"). Nothing it
   imports is `server-only`, so a client parent may also render it. The doc drift is the cost the plan review already
   carried to the phase-B amendment (B2.1's plan holds `src/components/CLAUDE.md`); it must land there.
2. **`docs/metrics.md` row with Green "phase A".** Acceptable mid-card: no script parses the per-card Green column
   (`grep` over `scripts/`: only the paperwork path lists), and dev-lead step 8 writes the row at the map step. It is
   provisional: at step 6/8 it must read the phase-B feat sha in Green, both red shas, and `7 (100 %)` in Covered (the
   other rows' format), or the table carries a non-sha forever.
3. **Component tests titled AC-13.2.** Not an overstatement: AC-13.2 is covered by the 4 unit tests alone (they assert
   all four Then strings, including 11), so deleting the component tests leaves the coverage claim true. The
   component tests assert AC-13.2's Then strings through `RemainingCount` plus the contract's "one `<p>`"; the plan's
   Files row approved that mapping. No AC names the component, so the alternative is an un-prefixed title, which
   `testing.md` reserves for infrastructure tests.

### Findings

None blocking. Non-blocking notes for dev-lead's map/closing step (backlog and docs are dev-lead's write paths):

- `backlog/plan/E2-todos-plus.md:25` (added on this branch) names the test
  `src/lib/todo-count.test.ts::AC-13.1: counts the todos whose completed is false and leaves the input unmodified`;
  `git grep` finds no such title (the four AC-13.1 tests read "returns N for … and leaves the input unchanged").
  Point the line at an existing title.
- The metrics row (question 2) and the package-doc drift (question 1) must be closed in phase B.

Verdict: ready for PR (phase A banked; per the plan the PR stays draft until phase B is green and diff-reviewed again)

Riskiest unfalsified: phase A — no test pins the `<p>`'s attributes, so an out-of-scope live region
(`aria-live="polite"`) would pass every test; phase B — the argument of `countRemaining(` on the merged `page.tsx`
(B2.1's filtered array would pass all 7 criteria and break REQ-13.5).

## Plan review (phase B amendment)

Reviewed: the amendment `76e750e` (`f11454b..76e750e` on `plan.md`: 3 Files rows added, "Sequence (phase B)"
rewritten, status line) and the merge `b2db063` (parents `f11454b`, `830901d` = `origin/main`), against §13, §12, §9,
§7, D-7, D-20 and the rules. The round-1 plan stays approved (`25327bd`); only the amendment is judged here. Run here on
2026-10-31 at `76e750e`: `pnpm test` → `Tests  130 passed (130)` (16 files); `pnpm exec playwright test --list` →
`Total: 16 tests in 6 files`; `check-spec-sections.sh` → `OK: sections cited: 1 2 3 4 5 6 7 8 9 10 11 12 13`;
`check-features-map.sh` → `OK`; `check-ac-coverage.sh` → `§13: ✗, no tests expected yet (7 criteria)`, OK;
`check-plan-scope.sh` → `OK: feat/B2.2-remaining-count stays inside the approved plan of B2.2`; `plan-files.sh B2.2`
(approved) → the 5 round-1 paths, `plan-files.sh --any B2.2 HEAD` → those 5 + the 3 new rows. Probe (scratch copy of
`76e750e` + the planned two imports and `<RemainingCount count={countRemaining(todos)} />` after `<TodoFilterNav>`):
`tsc --noEmit` exit 0, `eslint src/app/page.tsx` exit 0.

**Merge `b2db063`.** `git show --remerge-diff b2db063`: three conflicts, each one appended row against one appended row
(`docs/metrics.md` B2.1 / B2.2, `spec/features-map.md` F10 / F11, `spec/technical-requirements.md` §12 / §13); each
resolution keeps both, in id order, byte-identical to its side. `git diff origin/main HEAD -- src/app e2e src/actions
prisma src/lib/todos.ts src/lib/todo-filter.ts src/components/todo-filter-nav.tsx` → empty, so the merged `page.tsx`
is B2.1's verbatim. `git log --first-parent --merges --remerge-diff --format= 09e53b9..HEAD -- '*.test.*' e2e/` →
empty; `--no-merges` → empty: no test touched after the red.

**Merged `page.tsx`.** `todos` is the `listTodos()` result (all stored rows), `shown = filterTodos(todos, filter)`.
§13's contract ("from the same `listTodos()` result") and REQ-13.5 require `todos`; the amendment names `todos` and
forbids `shown`, the same source as the clear button (REQ-12.10). Placement after `<TodoFilterNav>`, before the list or
empty text: §9 (button "between `<TodoForm />` and the list") and §12 (nav "between `<ClearCompletedButton />` and the
list or the empty text") still hold, both "between", not "next to"; outside the `<ul>`, both states (REQ-13.2). No
existing e2e or component assertion selects a `<p>` or "left" text (`grep` over `e2e/`), and AC-12.4 keeps the nav at
0 `listitem`, so AC-13.4's 3 listitems and AC-13.3's single "No todos yet" (`emptyListMessage('all', 0)`) hold.

| Check                                                                             | pass / fail: reason                                                                                                                                                                                                                                                                                                                                                                                                           |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: `src/app/page.tsx` is named by §13's Function contracts; the two package guides close the doc drift both earlier reviews carried (`src/components/CLAUDE.md` says "client components"; `src/lib/CLAUDE.md` lacks `todo-count.ts`). F11 gains `src/app/page.tsx` and `e2e/13` at step 6.                                                                                                                                 |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: no new signature; `HomePage` keeps §12's; the mount is §13's contract line; no action, schema, Prisma or `'use client'`. Probe above typechecks and lints.                                                                                                                                                                                                                                                              |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: Approach A phase B, exactly as sequenced (mount only after B2.1 MERGED; `git merge`, not rebase).                                                                                                                                                                                                                                                                                                                       |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: §13 unchanged, 7 criteria; its `Lead approves spec` box now reads ticked (lead, 2026-10-31).                                                                                                                                                                                                                                                                                                                            |
| verification lists exact commands with expected numbers                           | **fail**: `pnpm test … = 126 green` is stale after the merge: measured `130 passed (130)` (B2.1 brought 4), and phase B adds no unit test, so the gate expects 130. `pnpm test:e2e` "phase A: unchanged" / "phase B green: + 5" give no base: measured 16 tests in 6 files today, so phase B green is 21 in 7. The phase-B red line (`e2e/13` → 5 failed) still holds (each test's first count assertion; traced in round 2). |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass, with notes: steps 4–7 unchanged; the two package-guide rows are assigned to no step (state it: step 5 `feat` or step 6 `docs(map)`); `test(ui)` / `feat(ui)` use a `<pkg>` that `backlog/CLAUDE.md` lists (`todos`, `health`, `env`, `ui`) and match `verify-red.sh`'s `(red)` pattern.                                                                                                                                 |
| the section has a `Lead approves spec` box, ticked only by a human (D-7)          | pass: ticked "(lead, 2026-10-31, plan gate of B2.2)"; not touched by this review.                                                                                                                                                                                                                                                                                                                                             |
| no settled D-n contradicted                                                       | pass: D-20 (a) "mount points held by one Doing card at a time (`next-task.sh --check`)": B2.2 now holds `src/app/page.tsx`; B2.3's plan (`feat/B2.3-complete-all`, Sequence) states the same tie-break ("the first card to commit its amended plan with `--check` clean takes the page"), so "B2.3 waits for this card to merge" agrees with B2.3's own plan.                                                                 |
| `scripts/next-task.sh --check B2.2` says no overlap                               | pass: `[next-task] B2.2: no overlap with any Doing or Review card` (exit 0, at `76e750e`); B2.3's planned Files (local and `origin/` ref) hold none of the 8 paths.                                                                                                                                                                                                                                                           |

Verdict: changes requested

1. **Verification numbers.** Replace `= 126 green` with the post-merge expectation (`pnpm test` → 130 passed, 16 files,
   phase B adds none) and give `pnpm test:e2e` absolute counts (phase B red: `e2e/13` 5 failed, the other 16 passed;
   phase B green: 21 passed in 7 files). TRIGGER: the step-5 green gate runs `pnpm test`, reads 130 against the plan's
   126, and either stops on a false mismatch or learns to ignore the plan's number.

Costs the lead accepts by approving the amendment (none blocking):

- **REQ-13.5 under a filter is still guarded by `grep` only.** All 7 criteria render `/` (filter `all`, where `shown`
  equals `todos`), so `countRemaining(shown)` passes every test; `/?filter=completed` with 2 open todos would read
  "0 items left". Only the plan's `git grep` line and the diff reviewer stop it; a test needs a §13 change (7 of 7).
- **Phase-B red has no script proof.** `verify-red.sh` lists `e2e/*.spec.ts` as "skipped, needs a server"
  (`verify-red.sh:70`) and re-proves only the phase-A unit files, so `verify-red.sh B2.2` exit 0 says nothing about
  step 4. The proof is the manual `pnpm test:e2e e2e/13-remaining-count.spec.ts` output; record it in the step-4
  commit body and `review.md`. Step 4 does not name dev-lead's red gate as step 2 does.
- **Re-approval subject.** The amendment dropped the old Sequence's "`docs(backlog): B2.2 plan round 2 approved`".
  `plan-files.sh` honours only subjects matching `^docs\(backlog\): B2\.2 plan (round [0-9]+ )?approved`; any other
  wording leaves the approved Files at the 5 round-1 paths and the plan-scope hook blocks `page.tsx` (fails safe).
- **The claim is local.** The branch is 3 commits ahead of `origin/feat/B2.2-remaining-count`; B2.3's `--check`
  resolves `refs/heads/` first, so it sees the page row only from this machine until the branch is pushed.
- **Diff-review base.** Local `main` is `fa98ab2`, `origin/main` is `830901d`: `git diff --stat main...HEAD` now shows
  27 files (B2.1's included), `origin/main...HEAD` shows 13. The phase-B diff review uses `origin/main`, as
  `check-plan-scope.sh` does.
- **Length:** `plan.md` is 76 lines against `planning.md`'s ≈ 40 (73 at round 2).

Riskiest unfalsified: the argument of `countRemaining(` in the phase-B `page.tsx`; no criterion renders a filtered view,
so `shown` in place of `todos` passes every planned test and breaks REQ-13.5.
