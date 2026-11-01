# B3.1 review

## Plan review (round 1)

SCOPE: all (`src/lib`, `src/components`, `e2e`; no `src/actions`, no `prisma/`)

Reviewed at `56a89af`: `plan.md` (66 lines), `analysis.md`, `advice.md`, `decision-request.md`,
`spec/contracts/15-overdue.md`, `spec/contracts/13-due-date.md:84-86`, D-7, D-19, D-21 (batch 3, `00-decisions.md:47`),
card B3.1, `src/components/todo-item.tsx`, `src/components/todo-due-date.tsx` and its test, `e2e/15-due-date.spec.ts`,
`.claude/agents/spec-analyst.md`, the B3.3 plan on `feat/B3.3-delete` (`3ac4d76`, read only).

Ran here: `pnpm test` (vitest on a copy) → `Tests  169 passed (169)`; `playwright test --list` →
`Total: 32 tests in 10 files` (both baselines hold); `scripts/next-task.sh --check B3.1` →
`[next-task] B3.1: no overlap with any Doing or Review card`; `check-spec-sections.sh` → `OK: sections cited: 1 … 17`;
`check-features-map.sh` → `OK`; `check-ac-coverage.sh` → `§17: ✗, no tests expected yet (7 criteria)` then `OK`;
`check-backlog.sh` → `OK`; `plan-files.sh --any B3.1` → the 7 Files paths, none protected; `eslint src e2e` → 0
problems; `eslint-plugin-react-hooks` 5.2.0.

Probes on a copy (`git archive HEAD` under the session scratchpad, never the tree):

- `vi.stubEnv('TZ', 'Pacific/Kiritimati')` inside a `unit` test on a `TZ=UTC` run: `new Date(2026, 10, 2)` becomes
  `2026-11-01T10:00:00.000Z`, offset `-840`. The pin works (vitest 4 forks pool), so AC-17.1 catches a UTC `todayOf`.
- `renderToString` + `hydrateRoot` in the `component` (jsdom) project, no shim: 0 `onRecoverableError`. The string is
  `…<span …>Due <!-- -->2026-10-31</span>…`. See reason 3.
- Approach A built as the advice writes it (one dependency-less `useEffect` calling `setToday` and `setCompleted`):
  an AC-17.4 probe (`<li>` checked → unchecked → checked) gives `[0, 1, 0]`, no update loop, all 36 component tests
  green; `eslint` → `22:3 warning React Hook useEffect contains a call to 'setToday'. Without a list of dependencies,
this can lead to an infinite chain of updates … react-hooks/exhaustive-deps`. The same setters moved into a named
  function that the effect calls → 0 problems, 36 green. See reason 2.

| Check                                                                                  | Result                                                                                                                                                                                                                                                                                         |
| -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                         | pass: `todo-overdue.ts` and `todo-due-date.tsx` are the only `src/` files §17's Function contracts name (`15-overdue.md` "No file other than …"); the three test files are §17's; F15 lands ✗ in the skeleton, ✅ in `docs(map)`; `13-due-date.md` only under D-22 option 1                    |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib         | pass: signatures copy §17 exactly (explicit return types, `readonly` props, `undefined` not `null`); `todo-overdue.ts` is pure (no Prisma, no `server-only`); no mutation, no action, no schema                                                                                                |
| plan follows `advice.md`'s recommendation or states the deviation                      | pass: Approach A. The advice's lint claim ("a dependency-less effect passes `exhaustive-deps`", `[unverified]`) is false (probe above), see reason 2                                                                                                                                           |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number              | pass: AC-17.1 to AC-17.7, each Then an exact string, boolean list, element count, order or call count; no banned adjective. AC-17.5's string measure needs a plan decision (reason 3)                                                                                                          |
| verification lists exact commands with expected numbers                                | fail: commands exact, baselines right (169, 32), but `pnpm test` "≈ 177 (exact count in the red commit)" and no count of new red tests for `verify-red.sh`, although the ACs fix the cases (reason 4); "lint clean" is not what Approach A as written yields (reason 2)                        |
| work breakdown has skeleton → red → green → map → review with convention subjects      | fail: steps 1–5 are right (`chore(todos): B3.1 skeleton` → `test(todos): B3.1 … (red)` → `feat(todos): B3.1 …` → `docs(map): F15 … [B3.1]` → `docs(backlog): B3.1 review …`), but step 0 gives the D-22 row to a role that cannot write it, after the spec edit it authorizes (reason 1)       |
| the section has a `Lead approves spec` box, ticked only by a human (D-7), never by you | pass: `spec/contracts/15-overdue.md:5` `- [ ] Lead approves spec (lead, <date>)`, unticked; the plan routes the tick through the gate's `approve`; untouched by this review                                                                                                                    |
| no settled D-n contradicted                                                            | pass: D-21 batch 3 (UI only in `todo-due-date.tsx`; no `page.tsx`, `todo-item.tsx`, `todo-form.tsx`, `todos.ts`, `actions/todos.ts`, `logger.ts`, `src/*/CLAUDE.md`); D-19 (no protected path, no label); D-7 (box left to the lead). The §15 line is correctly escalated as D-22, not assumed |
| `scripts/next-task.sh --check B3.1` on the committed plan says no overlap              | pass: `[next-task] B3.1: no overlap with any Doing or Review card` (exit 0, at `56a89af`). `spec/*` is exempt from the check; B3.3 edits `03-todos.md`, B3.2 none of §15, so D-22 option 1 collides with no sibling                                                                            |

Verdict: changes requested

1. **Step 0 gives the D-22 row to `spec-analyst`, which cannot write it, and orders it after the edit it authorizes.**
   Plan step 0: "spec-analyst | §15 line 86 (D-22 option 1 only); D-22 row | `docs(spec): §15 …`, `docs(backlog): D-22`".
   `.claude/agents/spec-analyst.md:11` path-guards `'!backlog/00-decisions.md'`, `:52` says never edit it, and
   `00-decisions.md:3-5` says "the human appends the next D-n". Trigger: the lead replies "approve, D-22 option 1";
   `spec-analyst` runs step 0, its `docs(spec): §15` commit lands, its write to `00-decisions.md` is refused, and §15
   (approved 2026-10-31) stands changed with no recorded D-n, which `spec-fidelity.md` ("a `docs(spec)` commit inside
   an approved D-n") forbids. Fix: step 0 becomes "lead (or the orchestrating session, in the lead's words, as D-21
   was recorded) appends D-22 → `docs(backlog): D-22 …`", then `spec-analyst` lands `docs(spec): §15 …`. Also say what
   option 2 changes: a sentence in `15-overdue.md`, the section the same `approve` ticks, so state whether that
   sentence lands before the tick. Option 3 closes the card; say so.
2. **Approach A as written adds a lint warning the plan calls "clean".** Probe: the effect the advice prescribes
   produces 1 `react-hooks/exhaustive-deps` warning ("can lead to an infinite chain of updates"); `main` has 0, and
   `pnpm lint` (`eslint .`, no `--max-warnings`) exits 0, so no gate catches it. The lead should choose before
   approval and the plan should say which: (a) the setters in a named function the effect calls (probed: 0 warnings,
   same behaviour, 36 green), which keeps the per-render re-read REQ-17.4 needs but silences the rule by indirection,
   with a comment giving the reason (both setters bail out on equal values, so no loop); or (b) accept 1 warning and
   say so in Verification. A suppression comment is not an option (`check-suppressions.sh`).
3. **AC-17.5's "contain `Due 2026-10-31` once" cannot hold on today's markup.** Probe: `renderToString` gives
   `Due <!-- -->2026-10-31`, because `todo-due-date.tsx:67` renders `Due {dueDate}` as two text nodes. Trigger: the
   test-writer asserts on the string as the Then says; green then requires `{`Due ${dueDate}`}` (one text node), a
   change to §15's span that the plan's `todo-due-date.tsx` row does not list, so the diff review would flag it as
   unplanned (or the test-writer measures parsed text instead, and the two roles disagree). Fix: pick one in the plan
   and say it in the Files row: the green step renders `Due <date>` as one text node (§15 tests unaffected: they
   query `getAllByText('Due 2026-11-05')`, which matches either way), or the test measures the string with comments
   removed.
4. **Verification numbers are approximate.** "`pnpm test` 169 → ≈ 177 passed (exact count in the red commit)" and
   "new unit/component tests fail" with no count. The ACs and the plan's own split (AC-17.1, AC-17.2 in the unit file;
   AC-17.3 (a)–(d), AC-17.4, AC-17.5, AC-17.6 in the component file) fix the number of `it`s now. Write it: N unit + M
   component → `pnpm test` 169 → 169 + N + M; `verify-red.sh B3.1` → N + M red; `e2e/17` → 1 failed; green
   `pnpm test:e2e` 33 passed. Same ruling as B2.4 round 1 and B3.2 round 1.
5. **The one-frame cost is stated for mount only; ticking an overdue row has one too** (plausible, not measured in
   a browser). On a tick, the RSC refresh re-renders `TodoDueDate` with the old `completed = false` state while the
   checkbox is already checked. That update is in a transition, not a discrete event, so React runs passive effects
   after paint, and `Overdue` can paint beside a checked box for one frame before the effect removes it. The advice's
   "a completed row never paints the marker" covers mount only. No test tells them apart (AC-17.4 uses `act`;
   AC-17.7's Playwright assertions retry). Fix: name `useLayoutEffect` for the row read (the advice allows it; React
   19 does not warn on the server), or list the frame as a stated cost beside the mount one.

Notes (not blocking):

- `backlog/00-decisions.md` has two rows numbered D-21 (`:41` §16 search length, `:47` batch 3). The plan's and the
  request's "D-21" mean `:47`; D-22 is the next free id. The lead may want D-22's text to say "D-21 (batch 3)".
- Card B3.1's `Test:` line says red because `todo-overdue.ts` "does not exist"; with the skeleton the red is
  `NotImplementedError` (right per `testing.md`). The card text drifts; the closing commit can fix it.
- B3.3's plan (`3ac4d76`) adds an icon-only `DeleteTodoButton` inside the `<li>`, not a checkbox, so "first checkbox
  of the nearest `li`" still holds and AC-17.7's whole-row text is unchanged. Re-run `e2e/17` after B3.3 merges, as
  the plan says.

Riskiest unfalsified: the tick-time single frame of `Overdue` beside a checked box (reason 5), not probed in a browser.

## Plan review (round 2)

SCOPE: all (`src/lib`, `src/components`, `e2e`; no `src/actions`, no `prisma/`)

Reviewed at `3ab42f7`: `plan.md` (69 lines), the `56a89af..3ab42f7` diff, `decision-request.md`, `spec/contracts/15-overdue.md`,
`spec/contracts/13-due-date.md:84-86`, `spec/CLAUDE.md`, D-7, D-21 (`00-decisions.md:47`), `src/components/todo-item.tsx`,
`src/components/todo-due-date.tsx`, `e2e/15-due-date.spec.ts`, `next.config.ts` (no React Compiler, so `TodoDueDate`
re-renders whenever `TodoItem` does), `package.json` (`react` / `react-dom` 19.1.0).

Ran here: `scripts/next-task.sh --check B3.1` → `[next-task] B3.1: no overlap with any Doing or Review card` (exit 0);
`check-spec-sections.sh` → `OK: sections cited: 1 … 17`; `check-features-map.sh` → `OK`; `check-ac-coverage.sh` →
`§17: ✗, no tests expected yet (7 criteria)` then `OK`; `check-backlog.sh` → `OK`; `plan-files.sh --any B3.1` → the 7
Files paths (the widened table still parses); `check-plan-scope.sh` → `OK … changes only paperwork`; `playwright test
--list` → `Total: 32 tests in 10 files`.

Probes on a copy (`git archive HEAD` under the session scratchpad, `node_modules` linked, never the tree), with the
plan's green step built as written: `todo-overdue.ts` per §17's contract; in `todo-due-date.tsx` a wrapper ref, `today`
and `completed` state, a named `readRow()` (`setToday((current) => current ?? todayOf(new Date()))`, then the first
checkbox of `closest('li')`) called from a dependency-less `useLayoutEffect`, `{`Due ${dueDate}`}` and the `Overdue`
span after it:

- `eslint` on the two implementation files → 0 problems; `tsc --noEmit` → clean (reason 2 resolved for `useLayoutEffect`).
- `vitest run` → `Tests  174 passed (174)` = the 169 baseline (all 36 §15/§7 component tests unchanged and green with
  the one-text-node span) + 5 probes:
  AC-17.3 (a) shape → 1 `Overdue`, `Due 2026-10-31` once; AC-17.4 sequence (checked → unchecked → checked) → `[0, 1, 0]`,
  no update loop; AC-17.5 → the two `renderToString` strings identical, `Due 2026-10-31` occurs once (no `<!-- -->`),
  0 `Overdue`, `hydrateRoot` `onRecoverableError` 0 calls, `console.error` 0 calls, after effects text
  `Due 2026-10-31Overdue`; AC-17.6 midnight → 0, still 0 after the same-props re-render at `2026-11-02 00:00:01`, 1 in
  the fresh render; `<TodoItem>` re-rendered from `completed: false` to `true` → row text `ADue 2026-10-31` and the box
  checked after the same synchronous commit.
- `renderToString` in the `unit` (node) project → `console.error` 0 calls, `process.stderr.write` 0 calls: React 19.1
  does not warn on `useLayoutEffect` in a server render.

Round 1 reasons:

1. Resolved: step 0a is "this session (lead's words) → D-22 row, first", step 0b `spec-analyst` lands the spec line
   after it; option 2 and option 3 consequences are stated (Approach paragraph).
2. Resolved: `useLayoutEffect`, no deps, named function; 0 lint warnings measured (above).
3. Resolved: the `todo-due-date.tsx` row names `Due <date>` as one text node; measured, AC-17.5's string holds and §15's
   tests stay green.
4. Resolved: 2 + 4 `it`s → `verify-red.sh` 6 red, 169 green; `pnpm test` 169 → 175; `pnpm test:e2e` 32 → 33; lint 0
   warnings. 169 and 32 re-measured.
5. Resolved: the layout effect runs in the same commit that sets the controlled checkbox from the RSC refresh, and its
   `setCompleted` re-renders synchronously before the browser can paint (traced; jsdom confirms the order; no browser
   frame capture).

| Check                                                                                  | Result                                                                                                                                                                                                                 |
| -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                         | pass: unchanged from round 1; `plan-files.sh` lists the same 7 paths                                                                                                                                                   |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib         | pass: signatures copy §17 exactly; no action, no Prisma, no schema; `todo-overdue.ts` pure                                                                                                                             |
| plan follows `advice.md`'s recommendation or states the deviation                      | pass: Approach A; `useLayoutEffect` is the advice's allowed variant, named in the Files row                                                                                                                            |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number              | pass: AC-17.1 to AC-17.7, exact strings and counts; AC-17.5's string measure now matches the planned markup (probe)                                                                                                    |
| verification lists exact commands with expected numbers                                | pass: 6 red / 169 green, 169 → 175, 32 → 33, lint 0 warnings (main 0), mutation ≥ 70 with `todo-overdue.ts` target 100                                                                                                 |
| work breakdown has skeleton → red → green → map → review with convention subjects      | pass: 0a `docs(backlog): D-22 …` → 0b `docs(spec): §15 …` / `§17 …` → `chore(todos): B3.1 skeleton` → `test(todos): B3.1 … (red)` → `feat(todos): B3.1 …` → `docs(map): F15 … [B3.1]` → `docs(backlog): B3.1 review …` |
| the section has a `Lead approves spec` box, ticked only by a human (D-7), never by you | pass: `spec/contracts/15-overdue.md:5` `- [ ] Lead approves spec (lead, <date>)`, unticked; ticked by the gate's `approve`; untouched here                                                                             |
| no settled D-n contradicted                                                            | pass: D-21 batch 3 (only `todo-due-date.tsx` in `src/components`), D-19 (no protected path), D-7; the §15 collision stays escalated as D-22                                                                            |
| `scripts/next-task.sh --check B3.1` on the committed plan says no overlap              | pass: `[next-task] B3.1: no overlap with any Doing or Review card` (exit 0, at `3ab42f7`)                                                                                                                              |

Verdict: approved (ready for the lead's gate, not for build)

Costs the lead approves with (stated, not blocking):

- Option 2 only: `approve` ticks §17's box, then step 0b adds a sentence to §17, so the ticked text gains one sentence
  the lead has not read; and `spec/CLAUDE.md` ("no history, no D-n citations in the text") limits how it may be worded.
  Option 1 (recommended) has neither cost: §17 is unchanged after the tick.
- The no-deps layout effect re-reads the row after every render of every row (a DOM query per row per render) and
  silences `exhaustive-deps` by indirection; the green step should carry the "why" comment (both setters bail out on
  equal values, so it settles in one pass), which the Files row does not mention.
- The marker never appears without JavaScript, and a row depends on "first checkbox of the nearest `li`" (B3.3 must
  keep it; re-run `e2e/17` after B3.3 merges), as the plan already states.

Notes (not blocking): the plan is 69 lines against `planning.md`'s ≈ 40 (as in round 1, the width is the Files table);
`00-decisions.md` still has two `D-21` rows (`:41`, `:47`), so D-22's text may want "D-21 (batch 3)".

Riskiest unfalsified: no browser frame capture shows that ticking an overdue row never paints `Overdue` beside a
checked box; it rests on React flushing layout-effect updates before paint in a transition commit (traced, jsdom only).

## Diff review (round 1)

Range `d53f4c7..da67575` (skeleton 4c7f1c6, red fae3314, green 4bda829, map da67575). All commands run by the
reviewer in the worktree; probes on a copy under `$TMPDIR`; nothing in the tree was edited but this file.

| Command                             | Last line                                                                                                                        |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                         | `All matched files use Prettier code style!` (eslint 0 problems)                                                                 |
| `pnpm typecheck`                    | `tsc --noEmit` clean                                                                                                             |
| `pnpm test`                         | `Tests  175 passed (175)`                                                                                                        |
| `pnpm test:e2e`                     | `33 passed (35.5s)`                                                                                                              |
| `pnpm test:mutation`                | `Final mutation score of 92.14 is greater than or equal to break threshold 70` (`todo-overdue.ts` 100.00, 11 killed, 0 survived) |
| `scripts/ci/check-suppressions.sh`  | `OK: no new suppressions`                                                                                                        |
| `scripts/ci/check-config-change.sh` | `OK: no protected config changed`                                                                                                |
| `scripts/ci/check-feat-commits.sh`  | `OK: no feat commit touches tests`                                                                                               |
| `scripts/ci/check-ac-coverage.sh`   | `OK` (§17 still ✗ in the index, so not checked; manual: AC-17.1–17.7 each in exactly one title)                                  |
| `scripts/ci/check-spec-sections.sh` | `OK: sections cited: 1 … 17`                                                                                                     |
| `scripts/ci/check-features-map.sh`  | `OK`                                                                                                                             |
| `scripts/verify-red.sh B3.1`        | `RESULT: red for the right reason` (2 + 4 new failed, 0 new passed; e2e skipped, red body quotes 1 failed)                       |
| `scripts/ci/check-plan-scope.sh`    | `OK: feat/B3.1-overdue stays inside the approved plan of B3.1`                                                                   |
| `git diff --stat main...HEAD`       | `17 files changed, 1155 insertions(+), 8 deletions(-)`                                                                           |

Checklist:

- every AC-§.n has a test whose assertion matches its Then: pass. AC-17.1 (5 dates × 3 zones, Kiritimati / Pago_Pago /
  UTC), AC-17.2 (8 results + constant), AC-17.3 (a)–(d) counts, order, no role/aria-label/button, (d) text `''`,
  AC-17.4 `[0, 1, 0, 1]`, AC-17.5 identical strings, 1 × `Due 2026-10-31`, 0 × `Overdue`, 0 recoverable errors, 1 after
  effects, AC-17.6 edit/save/re-render/midnight `[0, 0, 1]`, AC-17.7 every step incl. B checked and row texts.
- no test weakened after red: pass; `git log --first-parent --no-merges fae3314..HEAD -- '*.test.*' e2e/` empty; no
  merge commits in range (remerge-diff empty).
- every changed file in `plan.md`: pass for `src/`, `e2e/`, `spec/features-map.md`, `spec/contracts/13-due-date.md`
  (D-23 option 1). The rest is pipeline paperwork outside the plan's code scope: §17 contract + index row (spec
  authoring before the plan), D-23 row, card status, `docs/metrics.md`; `check-plan-scope` OK.
- interfaces match §17's contracts: pass; `OVERDUE_LABEL`, `todayOf`, `isOverdue` and `TodoDueDate` props exact.
- Zod at every action boundary / Prisma only in `src/lib` / no raw SQL / migration: n/a, no action, query or schema
  changed; `todo-overdue.ts` is pure and has no `server-only`.
- no secret, no suppression: pass (scripts above; no `eslint-disable` in the diff).
- features map row moved: pass, F15 ✗ → ✅ in da67575.
- would a test fail if a changed line were reverted (probes on the copy, `vitest run src/components
src/lib/todo-overdue.test.ts`):
  - `previous ?? todayOf(...)` → `todayOf(...)`: AC-17.6 fails.
  - `setCompleted(rowIsCompleted(...))` → `setCompleted(false)`: AC-17.4 fails.
  - `{`Due ${dueDate}`}` → `Due {dueDate}`: AC-17.5 fails.
  - `today` initialised to `todayOf(new Date())`: AC-17.3, AC-17.5 and 5 §6/§10/§15 tests fail.
  - `checkbox?.checked ?? false` → `?? true`: AC-17.3–17.6 fail.
  - marker rendered in edit mode: AC-17.6 + 3 × AC-15.6 fail.
  - `todayOf` on `getUTC*`: AC-17.1 fails.
  - survives: `wrapper?.closest('li')` → `wrapper?.parentElement` (41/41 green). Equivalent for every DOM that exists
    today (the wrapper is a direct child of the `li` in `TodoItem` and in the AC-17.4 `Row`); it would differ only for
    a checkbox beside the wrapper outside any `li`, which no AC states. Not a finding; B3.3 should keep the wrapper a
    direct child of the `li` or this stays untested.
  - survives: `useLayoutEffect` → `useEffect` (41/41 unit green, AC-17.7 green). See question 2 below; not a §17 AC.

The orchestrator's three questions, answered by measurement:

1. Toggle paths (jsdom, real `TodoItem`, `toggleTodoAction` held pending): start `checked=false, Overdue=1` →
   pending `checked=false, disabled=true, Overdue=1` → failed result `checked=false, Overdue=1`; success then the
   revalidated re-render `completed: true` → `checked=true, Overdue=0`; untick re-render → `checked=false, Overdue=1`.
   React restores the controlled box before the pending commit, so no path leaves `completed` stale. Cost per row:
   one `closest` + `querySelector` per render; both setters bail out on equal values (eager bailout), so an extra
   render happens only when `today` is first set or `completed` actually changes (traced, not profiled).
2. Paint (real Chromium, `pnpm dev` from the copy, 31 overdue rows, A ticked and unticked 5 times, a
   `requestAnimationFrame` loop checking every `li`): 76 frames, 0 frames with a checked box beside `Overdue`, 0 frames
   with an open overdue row missing it. Sensitivity check: the same probe with `useEffect` records 2 bad frames
   (`ADue 2020-01-01 unchecked, no Overdue` after an untick), so the probe can see the flash and the layout effect
   prevents it. No committed test guards this (above); it is the plan's design, not a §17 Then.
3. e2e dates: the seed writes `<day>T00:00:00.000Z` explicitly and the server reads the DATE back as written, so the
   runner's and the server's zones do not matter; days come from the browser's local fields as AC-17.7 states. The
   only exposure is a run that crosses the browser's local midnight between `browserDays` and the last assertion
   (one test, a few seconds per day): C becomes overdue and the count goes to 2. Inherent to AC-17.7's Given; not a
   finding. e2e/15 asserts B's whole-row text with `Due 2026-11-05` but B is completed, so it stays green after
   2026-11-05.

Findings: none blocking.

Verdict: ready for PR

Riskiest unfalsified: the `useLayoutEffect` no-flash property and "wrapper is a direct child of the `li`" are guarded
only by this review's probes, not by a committed test; B3.3 (which owns `todo-item.tsx`) can break either silently
except through AC-17.7's end-state counts.

## Diff review (round 2)

Range since round 1: `9908d4a..5c547f9` (merge d43e2b5 D-22 renumber, merge 3d13b83 B3.3 #93, test 5c547f9 semgrep
rewrite of e2e/17's row-text helper). Base for the diff: `origin/main` (c839ed9); local `main` is stale (a005b41), so
`git diff --stat main...HEAD` lists B3.3's files too. All commands run by the reviewer in the worktree; probes on a
copy under `$TMPDIR`; nothing in the tree edited but this file.

| Command                              | Last line                                                                                                 |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                          | `All matched files use Prettier code style!`                                                              |
| `pnpm typecheck`                     | `tsc --noEmit` clean                                                                                      |
| `pnpm test`                          | `Tests  184 passed (184)`                                                                                 |
| `pnpm test:e2e`                      | `34 passed (37.9s)`                                                                                       |
| `pnpm test:mutation`                 | `Final mutation score of 92.91 is greater than or equal to break threshold 70` (`todo-overdue.ts` 100.00) |
| `scripts/ci/check-suppressions.sh`   | `OK: no new suppressions`                                                                                 |
| `scripts/ci/check-config-change.sh`  | `OK: no protected config changed`                                                                         |
| `scripts/ci/check-feat-commits.sh`   | `OK: no feat commit touches tests`                                                                        |
| `scripts/ci/check-ac-coverage.sh`    | `OK: every criterion of a shipped section has a test`                                                     |
| `scripts/ci/check-spec-sections.sh`  | `OK: sections cited: 1 … 17 19`                                                                           |
| `scripts/ci/check-features-map.sh`   | `OK`                                                                                                      |
| `scripts/ci/check-plan-scope.sh`     | `OK: feat/B3.1-overdue stays inside the approved plan of B3.1`                                            |
| `scripts/verify-red.sh B3.1`         | `RESULT: red for the right reason` (2 + 4 new failed, 0 new passed; e2e skipped)                          |
| `git diff --stat origin/main...HEAD` | `17 files changed, 1267 insertions(+), 8 deletions(-)`                                                    |
| semgrep                              | not run: not installed locally, and no CI run exists for 5c547f9 (see "Before merge")                     |

Checklist:

- e2e rewrite not weaker than the regex (5c547f9): pass.
  - String level: the old `^\s*<t>\s*Due <day>\s*(Overdue\s*)?$` and `readsAs` compared on 2 550 244 inputs (all
    ≤ 4-token strings over title/`Due`/day/day-prefix/`Overdue`/`Overdu`/space/`\n`/NBSP/ZWSP/BOM/`x`, plus 2 × 10⁶
    random edits of each expected text, for E, B, A-overdue, A-not-overdue): 0 disagreements. `\s` and `trim()` cover
    the same 25 code units (checked over U+0000–U+FFFF). Playwright 1.64.1 does not normalise text for a RegExp
    expectation (`ExpectedTextMatcher.matches` normalises only strings), so neither side saw collapsed whitespace.
  - Mapping: a row that fails keeps its raw text; `readsAs(describeRow(r), r)` is true for every expected row, so raw
    text equal to the description cannot slip through as a pass. 5 rows enforced by `toHaveCount(5)` and array length.
  - Text source differs: old `toHaveText` used Playwright's `elementText` (counts `input[type=button|submit|reset]`
    values and shadow-root text, skips `script`/`style`); new uses `textContent` (the reverse). An input the old
    rejects and the new accepts exists only for a row holding `<input type="button" value="Overdue">` or shadow DOM;
    `TodoItem`, `TodoDueDate`, `DeleteTodoButton` render neither (`<button>` + icon `svg` only). Not a finding.
  - Sensitivity probe: stray `x` after `Due <day>` in every open dated row (marker counts unchanged) → AC-17.7 fails
    in `expectRows` with `"DDue 2026-11-02x"`, `"ADue 2026-10-31xOverdue"` in the diff.
- no test weakened after red: `--no-merges fae3314..HEAD` lists only 5c547f9 (a `test(...)` review-pass commit,
  explained above); `--merges --remerge-diff` on tests/e2e is empty for both merges. Conflict resolutions touch only
  `00-decisions.md` (D-22 from main + D-23 kept), `docs/metrics.md`, `spec/features-map.md`,
  `spec/technical-requirements.md` (both rows kept each time); read in full, no content lost.
- AC-17.7 against B3.3's row: holds. `TodoDueDate`'s wrapper is still a direct child of the `li`; the `li`'s first
  checkbox is still the completion box (B3.3 appends `DeleteTodoButton` as the last child, a `<button>` with an icon,
  no checkbox, no text), so `rowIsCompleted` and the row texts are unchanged; e2e 17 and 19 both green in one run.
- every changed file in `plan.md`, interfaces, Prisma/Zod/SQL/migration, secrets, map row: unchanged since round 1.

Findings: none blocking.

Before merge (not code findings; for dev-lead): PR #95 is `CONFLICTING` / `DIRTY` against `origin/main` c839ed9
(`docs(backlog): B3.3 done (#97)`): `docs/metrics.md` and `spec/technical-requirements.md` conflict
(`git merge-tree`). GitHub starts no `pull_request` run on a conflicting PR, so no CI run exists for 5c547f9 (runs
listed only for 0eccb34 and d43e2b5); semgrep's clearance of the rewrite is unverified until the branch merges
origin/main again and CI runs. That merge needs this check repeated (`--remerge-diff` on tests).

Verdict: ready for PR

Riskiest unfalsified: semgrep on 5c547f9 has not run anywhere; the rewrite holds no `RegExp(` call, but whether the
CI ruleset flags anything else in e2e/17 is unknown until CI runs after the conflict merge.
