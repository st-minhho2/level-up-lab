# B10.3 review

## Plan review (round 1)

Scope: ui (`src/components/todo-search-form.tsx`, a component test, one e2e file, the features map).

| Check                                                                             | Result                                                                                                                                                                                              |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: §50 names `todo-search-form.tsx` as the only `src/` file and names the test and e2e files; F48 follows F45 = §47 (F = § − 2)                                                                  |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: signature unchanged, a literal attribute, no action, no Prisma, no new export                                                                                                                 |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: approach A, B rejected with §50:88-90 as the reason                                                                                                                                           |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: 7 (AC-50.1 to AC-50.7), each Then has exact strings, counts or booleans                                                                                                                       |
| verification lists exact commands with expected numbers                           | fail: baselines confirmed (`vitest list` 360, `playwright --list` "Total: 88 tests in 40 files"), but "`scripts/verify-red.sh B10.3` exit 0" cannot hold with AC-50.2 in the red commit (reason 1)  |
| work breakdown has skeleton → red → green → map → review with convention subjects | fail: skeleton skipped with a reason (no new export, as B9.4), but the green-by-design AC-50.2 has no pin step before the red commit (reason 1)                                                     |
| the section has a `Lead approves spec` box, ticked only by a human                | pass: `48-search-hint.md:5` `- [ ] Lead approves spec`, unticked; not touched by me                                                                                                                 |
| no settled D-n contradicted                                                       | pass: D-45 lifts of §25 and §46 Out of scope are already on this branch's base (no "visible hint" left in `23-search-shortcut.md` or `44-search-select.md` Out of scope); the run edits no contract |
| `scripts/next-task.sh --check B10.3` says no overlap                              | pass: "[next-task] B10.3: no overlap with any Doing or Review card" (exit 0)                                                                                                                        |

Probe (clone under `$TMPDIR`, `node_modules` linked, one throwaway test file, current `todo-search-form.tsx`):
`Tests  1 failed | 1 passed (2)`. The AC-50.2 Then, written out in full (both renders: 1 searchbox named "Search
todos", 0 named "Press / to search", 0 elements with that text, `textContent` exactly `Search todosSearch` and
`Search todosSearchClear search1 match`, 0 `[aria-describedby]`/`[title]`), **passed** before the change. The AC-50.4
probe (`renderToStaticMarkup` + `DOMParser` under the jsdom project) loaded and failed on the assertion
(`expected null to be 'Press / to search'`), so the Q2 fallback (a second `node` file) is not needed.

Reasons:

1. AC-50.2 is green before the implementation, so the planned red commit fails its own gate. `scripts/verify-red.sh`
   (header line 16) passes only if "zero NEW tests passed" and reports `GREEN before implementation`; the code-writer's
   step 1 (`.claude/agents/code-writer.md:30`) stops on "one already green". The plan's answer, "may already be green,
   named in the commit body", does not get past either check. Trigger: the test-writer commits AC-50.1 to AC-50.6 in one
   `test(todos): B10.3 … (red)` commit and runs `scripts/verify-red.sh B10.3`, which exits 1. Fix (the B4.3 and B1.11
   way, `backlog/work/B4.3/plan.md:26-27`): land AC-50.2 green in its own `test(todos): B10.3 pin AC-50.2 …` commit
   (no `(red)`) before the red commit. Add that row to the work breakdown and fix the counts: pin 360 → 361; red adds 5
   failing (AC-50.1, 50.3, 50.4, 50.5, 50.6); green 366. Do not add a `placeholder` assertion to AC-50.2 to make it red.
   Its Then does not contain one.

Non-blocking, for the lead:

- `spec/contracts/23-search-shortcut.md:26`, "The hint "press / to search" is not shown.", still contradicts REQ-50.1.
  The plan names it as a lead-owned `docs(spec)` fix. The advice puts that fix "before the test commit", but the plan
  does not say whether the build waits for it. The lead should state whether it lands first or alongside.
- The Q2 fallback in the plan's Costs is moot (probe above). The planned Files list stands.

Verdict: changes requested
