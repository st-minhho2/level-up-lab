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
