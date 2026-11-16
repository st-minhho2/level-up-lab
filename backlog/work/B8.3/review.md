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

## Plan review (round 2)

Plan read at `8e62808`. `git diff db8f746 8e62808 -- backlog/work/B8.3/plan.md` touches only the Verification
paragraph. `git diff --stat main...HEAD` → only `backlog/work/B8.3/{advice,plan,review}.md`. Risk tier:
`scripts/agent/tier.sh backlog/work/B8.3/plan.md` → `medium`.

| Check                                                                                           | Result                                                                                                                                                                                                                                      |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                                  | pass: Files table unchanged since round 1; matches §43's one-file statement (`41-complete-all-hidden.md:85`) and its "Tests the red step rewrites" table (lines 91–100)                                                                     |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib                  | pass: unchanged since round 1                                                                                                                                                                                                               |
| plan follows `advice.md`'s recommendation or states the deviation                               | pass: approach A; the optional `src/components/CLAUDE.md` row dropped with its reason                                                                                                                                                       |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number                       | pass: AC-43.1 to AC-43.7, counts, exact names, `document.activeElement`, spy counts                                                                                                                                                         |
| verification lists exact commands with expected numbers                                         | pass (round-1 reason 1 resolved): `pnpm test` 323 → 327, 50 → 51 files, with AC-43.1 as one `it` matching the card's single `Test:` title; e2e baseline 75 tests / 33 files, target 75 → 78, 33 → 34 files (one test each for AC-43.5–43.7) |
| work breakdown has skeleton → red → green → map → review with convention subjects               | pass: unchanged since round 1                                                                                                                                                                                                               |
| the section has a `Lead approves spec` box, ticked only by a human (D-7), never by the reviewer | pass: `- [ ] Lead approves spec` at `41-complete-all-hidden.md:5`, unticked, not touched                                                                                                                                                    |
| no settled D-n contradicted                                                                     | pass: D-39 as in round 1                                                                                                                                                                                                                    |
| `scripts/next-task.sh --check B8.3` says no overlap                                             | pass: `[next-task] B8.3: no overlap with any Doing or Review card`                                                                                                                                                                          |

Costs the lead takes (restated so the approval sees them): after a successful mark-all, focus falls to `body` and is
not managed (REQ-43.5); the disabled-at-0 button is dropped (the card's purpose); six existing tests (AC-14.4 (a),
AC-36.3, AC-14.6 (a), (b), AC-36.6, AC-36.7) are rewritten in the red commit only, titles verbatim from §43; two
functions in one file, one exported. No role is blocked.

Non-blocking: the plan's footer still reads `Rounds: 1`; `e2e/38-search-count.spec.ts` is still not named in the e2e
list (covered by the full `pnpm test:e2e` run).

Verdict: approved (ready for the lead's gate, not approved for build)

## Diff review (round 1)

Diff read at `ddcf943` (red `be1e940`, feat `360114b`). Scope: ui.

### Command results (run by the reviewer)

| Command                             | Last line                                                                                  |
| ----------------------------------- | ------------------------------------------------------------------------------------------ |
| `pnpm lint`                         | `✖ 1 problem (0 errors, 1 warning)` (pre-existing, `todo-form.tsx:33`, not in this diff)   |
| `pnpm typecheck`                    | `tsc --noEmit` clean                                                                       |
| `pnpm test`                         | `Tests  327 passed (327)` (51 files), as the plan said: 323 → 327, 50 → 51                 |
| `pnpm test:e2e`                     | `78 passed (2.4m)`, as the plan said: 75 → 78                                              |
| `scripts/mutation-gate.sh`          | `mutation: CI only, no src/lib or src/actions change`                                      |
| `scripts/ci/check-suppressions.sh`  | `OK: no new suppressions`                                                                  |
| `scripts/ci/check-config-change.sh` | `OK: no protected config changed`                                                          |
| `scripts/ci/check-feat-commits.sh`  | `OK: no feat commit touches tests`                                                         |
| `scripts/ci/check-ac-coverage.sh`   | `OK: every criterion of a shipped section has a test`                                      |
| `scripts/ci/check-spec-sections.sh` | `OK: sections cited: 1 … 43`                                                               |
| `scripts/ci/check-features-map.sh`  | `OK`                                                                                       |
| `scripts/ci/check-plan-scope.sh`    | `OK: feat/B8.3-agent stays inside the approved plan of B8.3 (D-27 approval)`               |
| `scripts/verify-red.sh B8.3`        | `RESULT: red for the right reason` (5 new unit tests red on behavior; e2e skipped, server) |
| `git diff --stat main...HEAD`       | `13 files changed, 743 insertions(+), 23 deletions(-)`                                     |

### Checklist

| Check                                       | Result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| every AC-43.n has a test matching its Then  | pass for AC-43.1–43.3, 43.5–43.7; AC-43.4 asserts the focus spy over a narrower window than its Then (finding 1, non-blocking). The six §14/§36 rewrites carry §43's titles verbatim                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| no test weakened after the red commit       | pass. `git log --first-parent --no-merges be1e940..HEAD -- '*.test.*' e2e/` → `b06a5be`, `5eff2d5`, both `test(...)` commits with bodies; `--merges --remerge-diff` → empty. `b06a5be` adds AC-43.2 only (31 insertions, 0 deletions) and is green at the base because REQ-43.2 restates §14; it could not sit in the `(red)` commit, so its place is the defect of the plan's breakdown (which listed AC-43.2 as red), not of the tests. `5eff2d5` narrows one locator per `advice.md` addendum (line 157–170): the page-wide count could never be 0 because of `<next-route-announcer>`; `toHaveCount(0)` is kept and the scope still contains the component's wrapper. Neither loosens an assertion |
| every changed file is in `plan.md`          | pass: the 8 rows plus paperwork `docs/metrics.md` and `backlog/work/B8.3/*`; `check-plan-scope.sh` OK                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| interfaces match §43 Function contracts     | pass: export name, props and return type unchanged; `null` when `disabled`; no ref, effect, timer, `focus()` or `tabindex` (`complete-all-button.tsx:16–22`); private `CompleteAllButtonShown` not exported                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Zod at action boundary / Prisma only in lib | n/a: no action, lib, schema or query change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| no raw SQL, migration                       | n/a                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| no secret, no suppression                   | pass (`check-suppressions.sh`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Server/Client boundary, accessible names    | pass: still `'use client'`; button name from `completeAllLabel(count ?? 0)` unchanged; `page.tsx` untouched                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| features map row moved                      | pass: F41 §43 ✅ in `ddcf943`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| revert probes on a clone (`$TMPDIR/c838`)   | (a) failure state kept across hide (`CompleteAllButtonShown` always mounted, `if (hidden) return null` after the hooks) → AC-43.3 fails; (b) `useEffect(() => () => document.body.focus(), [])` (focus on removal) → AC-43.4 fails; (c) `document.body.focus()` after the result in `onCompleteAll` → all 10 tests of the three unit files pass (finding 1); (d) `disabled={disabled \|\| pending}` restored → equivalent mutant (`disabled` is always false inside the shown branch)                                                                                                                                                                                                                  |

Answers to the lead's three questions:

- Post-red test commits: acceptable. `b06a5be` adds a guard that cannot be red (REQ-43.2 already holds); `5eff2d5` fixes
  an assertion that could never pass, under a recorded advice, without loosening it. Both are `test(...)` commits with
  a "why" body; `check-feat-commits.sh` and `verify-red.sh` are unaffected. Process note for the PR body: the plan's
  Verification listed AC-43.2 as red; it was green at the base.
- AC-43.4: not vacuous for the removal window. Probe (b) shows a `focus()` during the removal fails it, and with the
  test's own `button.focus()` deleted the test still passes (`user.click` already leaves focus on the button in
  jsdom), so the Given holds without it. The gap is the window: finding 1.
- Metrics Green cell `feat(todos) B8.3`: non-blocking paperwork (exempt). The feat commit cannot quote its own sha;
  the closing PR should replace it with `360114b` (or the squash sha), as every other row has a sha.

### Findings

```
[1] KIND: coverage
    WHERE: src/components/complete-all-button-hidden.test.tsx:104-123 (spy cleared at 116)
    DEFECT: AC-43.4's Then says the focus spy is called 0 times after the click, but the test clears the spy after
            the click has resolved, so focus() calls between the click and the re-render are not counted.
    TRIGGER: add `document.body.focus();` after `setError(...)` in `onCompleteAll` (complete-all-button.tsx:33);
             probe (c) on $TMPDIR/c838: `npx vitest run src/components/complete-all-button` → 10 passed.
    WRONG BEHAVIOUR: a component that calls focus() on a result (which REQ-43.5 forbids: "calls focus() on nothing")
            passes the unit suite; e2e AC-43.5 catches it only when the focus target becomes document.activeElement.
    CONFIDENCE: confirmed (I ran it)
```

Non-blocking: the shipped component has no `focus()` call (read at `complete-all-button.tsx:1–56`), every mutant
that moves `document.activeElement` is caught by AC-43.5 in e2e, and the removal window itself is guarded (probe b).
A hardening `test(todos): B8.3 review pass 1 -- …` that drops the redundant `button.focus()` and clears the spy
before the click would close it; the lead may take it now or leave it.

Verdict: ready for PR

Riskiest unfalsified: the AC-43.6 alert scope `body > :not(next-route-announcer)` relies on the app rendering the
component under a body child other than the announcer; no e2e state produces the §10 alert, so I could not show this
locator counting a real failure message in the browser.
