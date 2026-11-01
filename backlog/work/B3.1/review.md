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
