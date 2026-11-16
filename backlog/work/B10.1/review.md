# B10.1 review

## Plan review (round 1)

Scope: ui (`src/components/todo-item.tsx`, a component test, an e2e file). Plan at `79381fc`.

| Check                                                                                  | pass / fail: reason                                                                                                                                                                                                                                                    |
| -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                         | pass: the three code/test files are the ones §48 "How the criteria observe it" names; `spec/features-map.md` gets F46 (§48), the id the card (`_F46 · section 48_`) and D-45 (F46–F51) give                                                                            |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib         | pass: no export, prop, action, schema or query changes; two `useRef`s inside an existing `'use client'` component                                                                                                                                                      |
| plan follows `advice.md`'s recommendation or states the deviation                      | pass: approach A (one-shot marker set after the `pending` guard at `todo-item.tsx:46`, consumed in the `[editing]` effect at `:32-37`); B's rejection stated                                                                                                           |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number              | pass: AC-48.1 to AC-48.7 (7), each Then is a count, an `activeElement` identity, a value or a call count                                                                                                                                                               |
| verification lists exact commands with expected numbers                                | fail: baselines confirmed (`pnpm exec vitest list` 360, `playwright --list` "Total: 88 tests in 40 files"), but "`scripts/verify-red.sh B10.1` exit 0" cannot hold with the red commit the plan describes (reason 1)                                                   |
| work breakdown has skeleton → red → green → map → review with convention subjects      | fail: the commit that lands the green-by-design tests before the red one is missing (reason 1); the other subjects follow `backlog/CLAUDE.md`                                                                                                                          |
| the section has a `Lead approves spec` box, ticked only by a human (D-7), never by you | pass: `46-escape-title-focus.md:5` `- [ ] Lead approves spec`, unticked; not touched here                                                                                                                                                                              |
| no settled D-n contradicted                                                            | pass: D-45 (no `page.tsx`, `src/lib/`, `src/actions/`, `todo-form.tsx`; §41 REQ-41.4 and §24 Out of scope lifts already on main, `39-edit-title-select.md:21`, `22-escape-edit-title.md:49`); D-28 tier: `scripts/agent/tier.sh backlog/work/B10.1/plan.md` → `medium` |
| `scripts/next-task.sh --check B10.1` on the committed plan says no overlap             | pass: `[next-task] B10.1: no overlap with any Doing or Review card`                                                                                                                                                                                                    |

Approach traced against today's code: `toggleTodoAction` and `updateTodoTitleAction` share the one `useTransition`
`pending` (`todo-item.tsx:13`, `:24`, `:59`), so setting the marker after the `pending` early return covers REQ-48.2's
save and toggle cases with no new guard; the "Edit title" button (`:113`) is rendered in the same commit that sets
`editing` false and is not disabled then. No dropped behavior found: server markup, JS-off and pre-hydration rows are
unchanged (advice "Impact", refs add no attributes).

Verdict: changes requested

1. The red step as planned fails `scripts/verify-red.sh`. The script passes "only if … zero NEW tests passed"
   (`scripts/verify-red.sh:16`); the plan puts AC-48.1 to AC-48.6 in one `(red)` commit and says AC-48.3 to 48.6
   "may be green, named in the commit body" (plan lines 31-34, 50-51). Traced against today's code: AC-48.3 (a)/(b)
   (Escape ignored while `pending`, `:46`), AC-48.4 (no `focus()` on the button anywhere today) and AC-48.5 (no focus
   move on a rejected or failed save) are green on the base, so verify-red reports "GREEN before implementation" and
   exits 1; naming them in the body does not change the exit code. B9.4 hit the same wording and the run invented an
   unplanned commit (`test(todos): B9.4 pin AC-47.3 …`, green, before the red, so verify-red counts it as old).
   Fix in the plan: add a work-breakdown row before step 2, e.g. `test(todos): B10.1 pin AC-48.3 to AC-48.5 …`
   (no `(red)` marker, body "Green on today's code by design: …"), in the same file; say the `(red)` commit then adds
   AC-48.1, AC-48.2, AC-48.6 and the e2e; and decide AC-48.6 explicitly: its Given "after one Escape (AC-48.1: the
   button is focused)" is red today only if the test asserts that precondition, otherwise it is green and belongs in
   the pin commit. Restate the verification line so `verify-red.sh B10.1` exit 0 follows from that split.

Non-blocking: "6 new `it`s" fixes one `it` per criterion although AC-48.3 to 48.5 have (a)/(b) parts; the repo splits
such parts in about half the cases (`AC-41.3: (a)` / `(b)`, `AC-45.3: (a)` / `(b)`). The plan's number is a directive
the test-writer can follow; if the parts are split instead, restate 366 before the red commit, not at diff time.

Riskiest unfalsified: REQ-48.1 says focus moves "in the commit that shows the row in view mode"; a `useEffect` runs
after commit (flushed synchronously for a discrete keydown in React 19, so not observable in jsdom or Playwright);
no criterion can tell it from `useLayoutEffect`.

## Plan review (round 2)

Scope: ui. Plan at `0540b9a` (diff from `79381fc`: the Verification paragraph, the work-breakdown row 2a/2b, the
Costs line).

| Check                                                                                  | pass / fail: reason                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                         | pass: `scripts/ci/plan-files.sh --file` prints the 4 paths; the 3 code/test paths are the ones §48 names (`46-escape-title-focus.md:56`, "How the criteria observe it"); F46 matches the card (`E10-todos-access.md:15`); the map's last row is F45, so F46 is next                                                                                                                                                                                                                                                                                                                                       |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib         | pass: unchanged from round 1; signature copied verbatim from §48 Function contracts, two `useRef`s in the existing `'use client'` component                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| plan follows `advice.md`'s recommendation or states the deviation                      | pass: approach A, marker set after the `pending` return at `todo-item.tsx:46`, consumed in the `[editing]` effect at `:32-37`; B rejected with reason                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number              | pass: AC-48.1 to AC-48.7                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| verification lists exact commands with expected numbers                                | pass: pin 360 → 366, red +3 unit + 1 e2e, green 366 → 369, e2e 88 → 89. Traced against `scripts/verify-red.sh`: it selects only `(red)` subjects (`:58`), the base is the parent of the first one (`:66`), i.e. the pin commit, so the 6 pinned names ran at the base and count as old; the 3 new (AC-48.1, 48.2, 48.6) fail on `activeElement` today (no `focus()` on the button anywhere in `todo-item.tsx`, the field is removed by `setEditing(false)` at `:49`); AC-48.6 is red only through its asserted precondition, which the plan now states; e2e is listed and skipped (`:79`). Exit 0 follows |
| work breakdown has skeleton → red → green → map → review with convention subjects      | pass: no skeleton (no new export, stated); 2a pin without `(red)`, 2b `(red)`, feat, `docs(map)`, review; subjects pass the `commit-msg` regex in `lefthook.yml:43`; pin-before-red has precedent (`backlog/work/B7.4/plan.md:41`)                                                                                                                                                                                                                                                                                                                                                                        |
| the section has a `Lead approves spec` box, ticked only by a human (D-7), never by you | pass: `46-escape-title-focus.md:5` unticked; not touched                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| no settled D-n contradicted                                                            | pass: D-45 as round 1; `scripts/agent/tier.sh backlog/work/B10.1/plan.md` → `medium`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `scripts/next-task.sh --check B10.1` on the committed plan says no overlap             | pass: `[next-task] B10.1: no overlap with any Doing or Review card`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |

Round 1 reason 1 is resolved: the pin/red split and the AC-48.6 precondition decision are both in the plan, and the
(a)/(b) count is fixed at 6 pinned `it`s before the red commit (round 1 non-blocking note answered).

Costs the lead approves with this plan (all stated in it): a toggle in flight blocks Escape and its focus move
(REQ-48.2, already today's behavior); AC-48.3 to 48.5 are green before the code, so they guard against a wrong
implementation (marker set while pending, focus on every `editing` false) but prove no red; AC-48.3(a), 48.4(b) and
48.6 rely on jsdom leaving `activeElement` at body when the focused field is removed.

Non-blocking: the plan is 60 lines against the ≈ 40 of `planning.md`; the excess is the two tables and the
Verification paragraph, not scope. The test names in the pin commit must stay byte-identical in the red commit
(verify-red keys old tests by describe path and title, `:107`); renaming or wrapping them in a new `describe` there
turns them "new" and green, and verify-red exits 1.

Verdict: approved (ready for the lead's gate, not approved for build)

Riskiest unfalsified: REQ-48.1's "in the commit that shows the row in view mode" against a `useEffect` (runs after
commit, flushed in the same task for a discrete keydown); no criterion distinguishes it from `useLayoutEffect`.

## Diff review (round 1)

Scope: ui. HEAD `f007d3e`; red `958c6cd` (pin `e1b0d51`), feat `961b111`, map `f007d3e`. No merge commits on the branch.

### Commands (last line each)

| Command                             | Result                                                                                                  |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                         | `All matched files use Prettier code style!`                                                            |
| `pnpm typecheck`                    | `tsc --noEmit` clean                                                                                    |
| `pnpm test`                         | `Tests  369 passed (369)` (58 files; plan: 366 → 369)                                                   |
| `pnpm test:e2e`                     | `89 passed (4.5m)` (plan: 88 → 89; `48-escape-title-focus.spec.ts` AC-48.7 green)                       |
| `scripts/mutation-gate.sh`          | `mutation: CI only, no src/lib or src/actions change`                                                   |
| `scripts/ci/check-suppressions.sh`  | `OK: no new suppressions`                                                                               |
| `scripts/ci/check-config-change.sh` | `OK: no protected config changed`                                                                       |
| `scripts/ci/check-feat-commits.sh`  | `OK: no feat commit touches tests`                                                                      |
| `scripts/ci/check-ac-coverage.sh`   | `OK: every criterion of a shipped section has a test`                                                   |
| `scripts/ci/check-spec-sections.sh` | `OK: sections cited: 1 … 53`                                                                            |
| `scripts/ci/check-features-map.sh`  | `OK`                                                                                                    |
| `scripts/verify-red.sh B10.1`       | exit 0, `9 ran (3 new), 3 new failed, 0 new passed  OK (red on behavior)`; e2e skipped (needs a server) |
| `git diff --stat main...HEAD`       | 9 files, 712 insertions, 2 deletions                                                                    |

### Checklist

| Check                                                             | Result                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every AC-48.n has a test whose assertion matches its Then         | pass: AC-48.1–48.6 in `todo-item-escape-focus.test.tsx:89-276` (9 `it`s), AC-48.7 in `e2e/48-escape-title-focus.spec.ts:55`; each Then clause read against its `expect`s (activeElement, textbox/alert counts, values, call counts, focus-spy receivers via `mock.contexts`, POST array, URL, reload order)                                                                                                                                    |
| no test weakened after the red commit                             | pass: `git log --first-parent --no-merges 958c6cd..HEAD -- '*.test.*' e2e/` empty; `--merges --remerge-diff` empty (0 lines)                                                                                                                                                                                                                                                                                                                   |
| every changed file is in `plan.md`                                | pass: the 4 planned files plus paperwork (`advice.md`, `plan.md`, `pr-body.md`, `review.md`, `docs/metrics.md` row named in the plan)                                                                                                                                                                                                                                                                                                          |
| interfaces match §48 Function contracts                           | pass: `TodoItem({ todo })` signature and props unchanged; button attributes (`type`, `disabled`, `aria-label`, `title`) unchanged, only `ref` added; no new export                                                                                                                                                                                                                                                                             |
| Zod at action boundary · Prisma only in lib · raw SQL · migration | n/a: no action, lib, Prisma or migration change                                                                                                                                                                                                                                                                                                                                                                                                |
| Server/Client boundary                                            | pass: change stays inside the existing `'use client'` component                                                                                                                                                                                                                                                                                                                                                                                |
| no secret, no suppression                                         | pass (check-suppressions OK; diff read)                                                                                                                                                                                                                                                                                                                                                                                                        |
| features map row moved                                            | pass: F46 §48 ✅ added in `docs(map)` commit `f007d3e`                                                                                                                                                                                                                                                                                                                                                                                         |
| `Lead approves spec` box                                          | untouched, unticked (`46-escape-title-focus.md:5`)                                                                                                                                                                                                                                                                                                                                                                                             |
| would a test fail if a changed line were reverted?                | probe on `git clone` in `$TMPDIR`: (m1) `if (escapedRef.current)` → `if (true)`: killed by AC-48.4(a), AC-48.4(b), AC-41.1; red commit already proves removing the focus call fails AC-48.1/48.2/48.6; (m2) drop `escapedRef.current = false`: survives (33/33); (m3) marker set on every keydown: killed by AC-48.4(a),(b); (m4) `escapedRef.current = pending` in the ignored branch (the "marker set while pending" trap): survives (33/33) |

### Findings

No blocking finding. The shipped code is correct on every input I traced: the marker is set only after the
`pending` guard (`todo-item.tsx:56-59`) and cleared before the focus call (`:43-45`).

Non-blocking (coverage of the criteria, not a test deviating from its Then): m2 and m4 survive because a successful
save's `setEditing(false)` runs after the `await` inside `startTransition`, so its commit renders "Edit title" with
`disabled={pending}` still true; `focus()` on a disabled button is a no-op, so `activeElement` stays `document.body`
and AC-48.3(a) and AC-48.6, which assert only `activeElement`, pass. REQ-48.3 forbids the `focus()` call itself; a
focus spy on the button in AC-48.3(a) and AC-48.6 (as AC-48.4 has) would kill both. The pin commit body's claim that
AC-48.3 "guards the Escape marker against being set while a save … is pending" is therefore not true of the test as
written. The behavior these mutants produce is not observable to a person today; it becomes so only if the button
stops being disabled while a save is pending. Worth a follow-up card or a spec note, not a block.

Verdict: ready for PR

Riskiest unfalsified: the "marker set while pending" and "marker never cleared" traps are guarded only by the button
being disabled at the save's exit commit (probes m2, m4 survive); a later change that enables "Edit title" during a
save would pull focus back with every test green.
