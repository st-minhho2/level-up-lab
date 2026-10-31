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
