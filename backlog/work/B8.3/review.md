# B8.3 review

## Plan review (round 1)

Scope: ui (only `src/components/complete-all-button.tsx`, two component tests, three e2e files, the features map).
Plan read at `db8f746`. `git diff --stat main...HEAD` → only `backlog/work/B8.3/{advice,plan}.md`.
Baselines re-run by the reviewer: `pnpm test` → `Test Files 50 passed (50)`, `Tests 323 passed (323)` (matches the
plan); `pnpm exec playwright test --list` → `Total: 75 tests in 33 files` (the plan gives no e2e baseline).
Risk tier: `scripts/agent/tier.sh backlog/work/B8.3/plan.md` → `medium` (as D-39 says).

| Check                                                                                           | Result                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                                  | pass: `complete-all-button.tsx` is the one file §43 names ("The only file of `src/` this section changes"); the new unit and e2e files are the ones §43 names; the four rewritten test files are those §43's "Tests the red step rewrites" table pins (lines checked: `complete-all-button.test.tsx:37`, `-count.test.tsx:41`, `e2e/14-complete-all.spec.ts:51,59`, `e2e/36-complete-all-count.spec.ts:64,94`); F41 is D-39's id for B8.3 |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib                  | pass: `CompleteAllButton` signature copied verbatim from §43 Function contracts; the private `CompleteAllButtonShown` is not exported (one exported component per file holds); no action, schema, lib, Prisma or `page.tsx` change                                                                                                                                                                                                        |
| plan follows `advice.md`'s recommendation or states the deviation                               | pass: approach A followed; the advice's optional `src/components/CLAUDE.md` row is dropped with the reason the advice itself gives (§43's one-file statement)                                                                                                                                                                                                                                                                             |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number                       | pass: 7 AC (AC-43.1 to AC-43.7), each Then is child-node, role and button counts, exact names, `document.activeElement`, spy call counts, navigation counts                                                                                                                                                                                                                                                                               |
| verification lists exact commands with expected numbers                                         | **fail**: unit green is "323 → ~328 passed (51 files) [estimate]" and e2e is "all green" with neither a baseline nor a target (reason 1)                                                                                                                                                                                                                                                                                                  |
| work breakdown has skeleton → red → green → map → review with convention subjects               | pass: skeleton step present as "none" with a reason (no new export, as B7.6); `test(todos): B8.3 … (red)`, `feat(todos): B8.3 …`, `docs(map): F41 … [B8.3]`, `docs(backlog): B8.3 review …` match B7.6's subjects                                                                                                                                                                                                                         |
| the section has a `Lead approves spec` box, ticked only by a human (D-7), never by the reviewer | pass: `- [ ] Lead approves spec` in `spec/contracts/41-complete-all-hidden.md:5`, unticked, not touched                                                                                                                                                                                                                                                                                                                                   |
| no settled D-n contradicted                                                                     | pass: D-39 (no `page.tsx`, `src/lib`, `src/actions` change; one component; F41); the §14, §36 and §22:76 edits D-39 lists are on the branch already (`12-complete-all.md:21,41`, `34-complete-all-count.md:18,36,39,40,74,75`, `20-all-done.md:76`), so the plan edits no spec                                                                                                                                                            |
| `scripts/next-task.sh --check B8.3` says no overlap                                             | pass: `[next-task] B8.3: no overlap with any Doing or Review card`                                                                                                                                                                                                                                                                                                                                                                        |

Other things checked, no finding:

- Every other test that finds the button (`e2e/16-search.spec.ts:139,148`, `e2e/22-all-done.spec.ts:107`,
  `e2e/30-filter-counts.spec.ts:102`, `e2e/38-search-count.spec.ts:86,166`) does so while an open todo is stored;
  none asserts the button disabled or present after the last open todo goes. No unit test outside the two rewritten
  files renders `CompleteAllButton`.
- The six rewritten titles differ from today's, so `verify-red.sh` treats them as new and requires them red; each is
  red against today's component (it renders a disabled button at `disabled` true).
- Costs the lead takes are stated: focus falls to `body` after a successful mark-all (REQ-43.5); two functions in one
  file; six existing tests change in the red commit only. Dropped behavior: the disabled-at-0 button, which is the
  card's purpose. No role is blocked.

Verdict: changes requested

1. Verification has no exact expected number for the green unit run and none for the e2e run. Replace
   "323 → ~328 passed (51 files) [estimate]" with the count the test layout produces: AC-43.1 as one `it` (the card's
   `Test:` line names a single AC-43.1 title covering (a) and (b)) plus AC-43.2, AC-43.3, AC-43.4 gives 323 → 327,
   50 → 51 files; 328 only if AC-43.1 (a) and (b) are separate `it`s. State the intended one. Add the e2e baseline and
   target: `pnpm test:e2e` 75 → 78 passed, 33 → 34 files (AC-43.5, 43.6, 43.7 new; the four e2e rewrites are in
   place). Without them the diff review cannot tell a merged or dropped case from the plan (same reason as B7.6
   round 1). While there, the e2e list names 16, 22, 30 and 09 but not `e2e/38-search-count.spec.ts`, which also finds
   the button; "all green" covers it, so this is optional.
