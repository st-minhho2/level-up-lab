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
