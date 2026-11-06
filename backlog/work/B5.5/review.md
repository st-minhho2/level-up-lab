# B5.5 review

## Plan review (round 1)

| Check                                                                             | Result                                                                                                                                                                                                                      |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: `escape-search.ts` and its test are new for §27 (F25); `todo-search-form.tsx` and its test are the component D-30 assigns to B5.5; `e2e/27-escape-search.spec.ts` follows the section number like `24-`, `25-`, `26-` |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: readonly interface, explicit return types, string constant; no action, no Prisma, no `server-only` in a module imported by a client component                                                                         |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: approach A; the deviation (`e2e/27-` instead of advice's `e2e/25-`) is stated and correct                                                                                                                             |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: 6 criteria, every Then is values, counts or an exact address                                                                                                                                                          |
| verification lists exact commands with expected numbers                           | fail: the baseline is wrong (`pnpm test` gives 222 today, not 221), and `verify-red.sh B5.5` exit 0 contradicts "AC-27.4/27.5 may pass on the skeleton" (reasons 1, 2)                                                      |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: `chore` skeleton, `test … (red)`, `feat`, `docs(map) … [B5.5]`, `docs(backlog)` review                                                                                                                                |
| the section has a `Lead approves spec` box, ticked only by a human                | pass: present in `spec/contracts/25-escape-search.md`, unticked                                                                                                                                                             |
| no settled D-n contradicted                                                       | pass: D-30 (one component, untouched list), D-32 (lifts landed in c1aca6d), D-31 (`src/components/CLAUDE.md` stays out)                                                                                                     |
| `scripts/next-task.sh --check B5.5` says no overlap                               | pass: `[next-task] B5.5: no overlap with any Doing or Review card`                                                                                                                                                          |

Also run: `scripts/ci/check-plan-scope.sh` → `OK: feat/B5.5-agent changes only paperwork`; `pnpm test` → `Tests  222 passed (222)`.

Risk tier: medium (D-28: rows under `src/`, `e2e/`, `spec/`; none high).

### Reasons (changes requested)

1. **The planned red cannot pass the red gate.** The Verification says `scripts/verify-red.sh B5.5` exits 0 and, in
   the same sentence, that AC-27.4 and AC-27.5 "may pass on the skeleton". `scripts/verify-red.sh` passes only if
   "zero NEW tests passed" (header step 6; line 147 records `GREEN before implementation` as a problem and exits 1).
   As specified, AC-27.4 (non-Escape keys and modified Escape leave `milk`, `defaultPrevented` false, 0 clicks) and
   AC-27.5 (Escape outside the box changes nothing) hold on today's component, which has no `onKeyDown`, so both new
   tests pass in the red commit and the gate fails. Stating it in the commit body does not change the exit code. The
   plan must say how each of these two tests is red against the skeleton without loosening its Then (for example a
   plain-Escape-in-the-box control step in the same test that must empty the box and click the link once before the
   negative keys are pressed), or route them otherwise and say which.
   Cost to state for the lead: a control step makes each of those tests assert REQ-27.1 as well as REQ-27.5/27.6.
2. **The unit-test baseline is wrong.** The plan says `pnpm test` 221 → 226; on this branch `pnpm test` reports
   `Tests  222 passed (222)`, so the target is 222 → 227 (5 new). The e2e baseline of 50 matches the 50 `test(`
   calls under `e2e/` [unverified by run: needs the compose database].

### Non-blocking observations

- Probe: in jsdom with no app router, `next/link` (15.5.28) forwards `ref` to the anchor, `ref.current.click()`
  fires exactly 1 click and 0 `fetch` calls, and jsdom prints `Not implemented: navigation to another Document`
  (stderr, not a failure; `vitest.setup.ts` does not fail on it). So AC-27.2's click count and 0 requests are
  observable as the advice expects; the line will appear in the test output.
- AC-27.3's "0 navigations" needs a concrete observable in the component test (`location.href` unchanged before and
  after); the test-writer should name it, as AC-25.2 did.

Verdict: changes requested

## Plan review (round 2)

| Check                                                                             | Result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: unchanged from round 1; F25 is the next free id (map ends at F24, §26)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: the pasted block matches §27's Function contracts verbatim; no action, Prisma, env key or `next/navigation` hook                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: approach A; `e2e/27-` deviation stated                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: 6 criteria, values, counts and exact addresses                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| verification lists exact commands with expected numbers                           | pass: reason 1 resolved: AC-27.4/27.5 move to a pin commit before the `(red)` commit. `scripts/verify-red.sh` takes the parent of the first `(red)` commit as its base and counts a test as new only if its describe path and title did not run there (header steps 3–6), so the pinned tests are old at the base and may pass; AC-27.1–27.3 are new and must fail. Same route as B5.2 (`b918076`, "pin AC-24.4, AC-24.5"). Reason 2 resolved: `pnpm test` → `Tests  222 passed (222)` re-run today; 222 → 224 → 227 is consistent. e2e baseline 50 = 50 `test(` calls under `e2e/` [unverified by run] |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: `chore` skeleton → `test … pin` → `test … (red)` → `feat` → `docs(map) … [B5.5]` → `docs(backlog)` review                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| the section has a `Lead approves spec` box, ticked only by a human                | pass: present, unticked                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| no settled D-n contradicted                                                       | pass: D-30, D-31, D-32 as in round 1                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `scripts/next-task.sh --check B5.5` says no overlap                               | pass: `[next-task] B5.5: no overlap with any Doing or Review card`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |

Also run: `scripts/ci/check-plan-scope.sh` → `[check-plan-scope] OK: feat/B5.5-agent changes only paperwork`.

Risk tier: medium (D-28: rows under `src/`, `e2e/`, `spec/`; none high).

### Costs the lead approves with this plan

1. **AC-27.4 and AC-27.5 are never seen red.** They pass on today's component (no `onKeyDown`) and the plan adds no
   positive control, so no gate proves either assertion can fail; a test that observed nothing (for example a click
   listener attached to the wrong element) would also pass. `src/components` is outside the mutation scope, so
   Stryker does not cover this either. The diff review will probe it by reverting the guard in the `feat` (for
   example `isSearchEscape` → any `Escape`) on a copy and checking that AC-27.4 then fails.
2. **AC-27.3's "0 navigations" still has no named observable** in the plan (round 1 observation). The test-writer
   must pick one (`location.href` unchanged, as AC-25.2 did); the diff review checks it is asserted, not implied.
3. The plan footer reads `Rounds: 1`; the dev-lead updates it to 2 when recording this verdict.

Verdict: approved (ready for the lead's gate, not approved for build)

## Diff review (round 1)

Commits: skeleton e7cbbbe · pin dad111a · red 2f4b204 · feat 7a0b815. Run by the reviewer in the worktree on 2026-11-06.

### Command results (last line of each)

| Command                             | Result                                                                                                    |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                         | `All matched files use Prettier code style!` (exit 0)                                                     |
| `pnpm typecheck`                    | `tsc --noEmit` clean                                                                                      |
| `pnpm test`                         | `Tests  227 passed (227)` (plan: 222 → 227)                                                               |
| `pnpm test:e2e`                     | `51 passed (1.4m)` (plan: 50 → 51)                                                                        |
| `pnpm test:mutation`                | `Final mutation score of 92.62 is greater than or equal to break threshold 70`; `escape-search.ts` 100.00 |
| `scripts/ci/check-suppressions.sh`  | `OK: no new suppressions`                                                                                 |
| `scripts/ci/check-config-change.sh` | `OK: no protected config changed`                                                                         |
| `scripts/ci/check-feat-commits.sh`  | `OK: no feat commit touches tests`                                                                        |
| `scripts/ci/check-ac-coverage.sh`   | `OK: every criterion of a shipped section has a test` (§27 ✗ until the closing PR)                        |
| `scripts/ci/check-spec-sections.sh` | `OK: sections cited: 1 … 27`                                                                              |
| `scripts/ci/check-features-map.sh`  | `OK`                                                                                                      |
| `scripts/ci/check-plan-scope.sh`    | `OK: feat/B5.5-agent stays inside the approved plan of B5.5 (D-27 approval)`                              |
| `scripts/verify-red.sh B5.5`        | `RESULT: red for the right reason` (lib 1 new failed; component 2 new failed; e2e skipped)                |
| `git diff --stat main...HEAD`       | `17 files changed, 810 insertions(+), 6 deletions(-)` (code: the 7 files in the plan + paperwork)         |

Extra runs: `playwright test e2e/27 e2e/21 e2e/25 --repeat-each=10 --workers=1` under `pnpm dev` → `50 passed`;
`e2e/27 e2e/21 --repeat-each=5` against a production build (`CI=1 NODE_ENV=production`, on a copy) → `20 passed`.

### Checklist

| Check                                                                | Result                                                                                                                                                                                                                                        |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every AC-27.n has a test whose assertion matches its Then            | pass: 27.1 (`escape-search.test.ts`, all 10 cases + constant + no throw), 27.2–27.5 (`todo-search-form.test.tsx`), 27.6 (`e2e/27-escape-search.spec.ts`: exact address, empty box, `[D, B]`, 0 links, 0 POSTs, then 0 requests of any method) |
| no test weakened after the red commit                                | pass: `git log --first-parent --no-merges 2f4b204..HEAD -- '*.test.*' e2e/` empty; the `--merges --remerge-diff` form empty (no merges)                                                                                                       |
| every changed file is in `plan.md`                                   | pass: 6 Files rows + `docs/metrics.md` (paperwork, named in the plan)                                                                                                                                                                         |
| interfaces match §27's Function contracts                            | pass: `SEARCH_ESCAPE_KEY: string`, `EscapeEvent` (5 readonly fields), `isSearchEscape` verbatim; `TodoSearchForm` signature and markup unchanged (only `onKeyDown` and `ref` added)                                                           |
| Zod at every action boundary · Prisma only in `src/lib` · no raw SQL | n/a: no action, no Prisma, no SQL touched; `escape-search.ts` imports nothing                                                                                                                                                                 |
| migration reversible and indexed                                     | n/a: none                                                                                                                                                                                                                                     |
| no secret, no suppression                                            | pass (check-suppressions OK; diff read)                                                                                                                                                                                                       |
| features map row moved                                               | pass: F25 ✗ (skeleton) → ✅; see observation 1 for the commit                                                                                                                                                                                 |
| AC-27.3 "0 navigations" asserted (plan cost 2)                       | pass: `window.location.href` unchanged and 0 form submits, plus 0 `fetch` calls                                                                                                                                                               |
| would a test fail if one changed line were reverted? (on a copy)     | pass, see probes                                                                                                                                                                                                                              |

Probes on `/tmp/probe-b55-504633` (one change each, `vitest run src/components/todo-search-form.test.tsx`):

| Probe                                                                                 | Result                                                                                                 |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| P1 `isSearchEscape(event)` (synthetic, React maps `Esc` → `Escape`)                   | AC-27.4 fails: the `nativeEvent` read is needed and pinned                                             |
| P2 guard → any `Escape` regardless of modifiers (plan cost 1)                         | AC-27.4 fails                                                                                          |
| P3 drop `preventDefault()`                                                            | AC-27.2, AC-27.3 fail                                                                                  |
| P4 drop `value = ''`                                                                  | AC-27.2, AC-27.3 fail                                                                                  |
| P5 drop the link `click()`                                                            | AC-27.2 fails                                                                                          |
| P6 `if (isSearchInEffect(query))` → `if (true)`                                       | 12 passed: equivalent (the ref is `null` whenever the link is not rendered, so `?.click()` is a no-op) |
| P7 a document-wide Escape listener that clears the box (positive control for AC-27.5) | AC-27.4, AC-27.5 fail                                                                                  |

### Findings

None blocking.

Observations (no TRIGGER on behavior, so not findings):

1. The F25 ✅ flip landed in the `feat` commit 7a0b815, not in the separate `docs(map): F25 … [B5.5]` commit of
   plan step 4 / `backlog/CLAUDE.md` commit order. Same file, same content, so `check-plan-scope` passes. It cannot
   be split without rewriting history, so the PR body should state the deviation.
2. The `docs/metrics.md` row was written by the code-writer in the `feat` commit; the plan names it as exempt paperwork
   without naming a role. Its numbers match this run (6/6, 92.62, `escape-search.ts` 100).
3. AC-27.6's second Escape counts requests of any method until `networkidle`. It passed 10/10 under `pnpm dev` and 5/5
   against a production build (Link prefetch active). An expired prefetch cache could still issue a GET inside the window.
4. Locally, `CI=1 pnpm exec playwright test` fails to start the production server unless `NODE_ENV=production` is set
   (`<Html> should not be imported outside of pages/_document` while prerendering `/404`). This is environmental and
   not caused by this card; GitHub CI was not re-run here [unverified].

Verdict: ready for PR

Riskiest unfalsified: AC-27.6's "0 requests of any method" after the second Escape. Under a production server, a Link
prefetch whose cache has expired could fire inside the `networkidle` window and turn the test red without a code change.
