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
