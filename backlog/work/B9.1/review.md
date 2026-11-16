# B9.1 review

## Plan review (round 1)

| Check                                                                             | Result                                                                                                                                                                                                                              |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: `src/components/todo-form.tsx` is the only `src/` file §44 names (contract line "The only file of `src/` this section changes"); the test file, the e2e file and F42 match §44's "How the criteria observe it" and D-40 (F42) |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: `export function TodoForm(): ReactNode` unchanged; no action, schema, Prisma, env or route touched                                                                                                                            |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: approach A as recommended; B's rejection stated; leaving out the optional `src/components/CLAUDE.md` line is stated                                                                                                           |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | fail: 7 criteria and every Then is measurable, but AC-44.4's Then cannot be met in the flow its When gives (reason 1)                                                                                                               |
| verification lists exact commands with expected numbers                           | pass: baselines checked: `npx vitest list` → 338, `pnpm test:e2e --list` → "Total: 82 tests in 36 files"; targets 343 / 84, verify-red exit 0, mutation "CI only" (B1.100)                                                          |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: the skeleton step is "none, no new export", with B7.6 and B8.3 as precedent; subjects `test(todos)`, `feat(todos)`, `docs(map)`, `docs(backlog)` follow the `feat(todos): B8.3 …` precedent                                   |
| the section has a `Lead approves spec` box, ticked only by a human                | pass: `spec/contracts/42-new-todo-focus.md:5` `- [ ] Lead approves spec`, unticked; not touched by this review                                                                                                                      |
| no settled D-n contradicted                                                       | pass: D-40 (no lift or edit, sibling "unchanged" notes do not apply, a failed save moves no focus) is followed                                                                                                                      |
| `scripts/next-task.sh --check B9.1` says no overlap                               | pass: `[next-task] B9.1: no overlap with any Doing or Review card` (exit 0)                                                                                                                                                         |

Probe: approach A applied to a copy at `$TMPDIR/probe` (the plan's falling-edge `pending` ref plus a `useLayoutEffect`
on `[pending]`, placed after the draft effect), with a vitest file that runs AC-44.4's When literally.

```
PROBE afterFirst=1 afterClick=2 focusAfterClick=box
```

A second probe case, a same-reference ok result resolved twice with the second submit by Enter, focused the box twice
with 2 calls. That supports the plan's argument for A over B.

Verdict: changes requested

1. **AC-44.4 cannot be met as written, and the plan does not say how the test-writer will read it.** AC-44.4's When
   says that after the first add the person "clicks the "Add" button (focus on it)". The box is empty at that point.
   The input has no `required`, so the click submits the form, the same way AC-44.3(b) relies on "clicks "Add" with
   the box empty". AC-44.4's Given makes the mock resolve `{ ok: true }`, so under approach A (and under B, or any
   implementation of REQ-44.1) that click is itself a successful result: `createTodoAction` is called a second time
   and focus returns to the box. The probe confirms it (`afterClick=2 focusAfterClick=box`). The Then requires "that
   button … stays [focused] until the second result" and "called 2 times". Both fail, and the test-writer would have
   to replace the click with `add.focus()` (not what the When says) or a mock that fails on the second call (not what
   the Given says). Either one quietly rewrites the criterion. The plan must name the fix before the lead approves:
   run `/advise` and land a `docs(spec): §44 …` edit to AC-44.4's When (for example, focus moved by Tab or by a click
   outside the form) under D-40 or a new D-n, before the red commit. The plan's "AC-44.4 same-ref case" line in the
   work breakdown and its Verification count (5 new `it`s) depend on that wording.
2. **Cost to add to the plan's "Costs the lead takes" (follows from 1).** With approach A, a click on "Add" with an
   empty box, or any other submit that resolves ok, sends focus back to the box. That is correct under REQ-44.1, but
   it means REQ-44.4's "moves focus elsewhere … keeps it there" holds only for moves that do not submit the form. The
   lead should read that before approving.

Rounds: 1
