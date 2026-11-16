# B11.1 review

## Plan review (round 1)

Scope: ui (`src/components/todo-due-date.tsx`, two component test files, one e2e file, the features map). Plan at `d43c197`.

| Check                                                                                  | pass / fail: reason                                                                                                                                                                                                                                                                                                                                    |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| every file in the plan belongs to the section's features (map)                         | pass: the component, `todo-due-date-escape-focus.test.tsx` and `e2e/51-escape-due-date-focus.spec.ts` are the ones §51 "How the criteria observe it" names; the two rewritten tests are the ones §51 lists (`todo-due-date-focus.test.tsx:79`, `:110`); F49 matches the card (`_F49 · section 51_`) and D-45 (F46–F51)                                 |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib         | pass: no export, prop, action, schema, query or env key changes; two `useRef`s in an existing `'use client'` component                                                                                                                                                                                                                                 |
| plan follows `advice.md`'s recommendation or states the deviation                      | pass: approach A (marker set after the `modified \|\| pending` guard at `todo-due-date.tsx:72`, consumed in the `[editing]` effect at `:62-66`); B's rejection stated                                                                                                                                                                                  |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number              | pass: AC-51.1 to AC-51.7 (7); every Then is an `activeElement` identity, a count, a value or a call count                                                                                                                                                                                                                                              |
| verification lists exact commands with expected numbers                                | pass: baselines confirmed by me (`pnpm exec vitest list` → 381; `playwright test --list` → "Total: 90 tests in 42 files"); 381 → 385 (pin) → 389 (red, two rewrites keep the count) and 90 → 91 are consistent; `verify-red.sh` exit 0 holds: the two rewritten §45 tests get new titles, so they count as new, and they fail on `document.body` today |
| work breakdown has skeleton → red → green → map → review with convention subjects      | pass: skeleton step explicitly empty (no new export); pin commit before the red as B10.1 (`e1b0d51` on main) so the green-by-design AC-51.3–51.5 count as old; subjects follow `backlog/CLAUDE.md`                                                                                                                                                     |
| the section has a `Lead approves spec` box, ticked only by a human (D-7), never by you | pass: `49-escape-due-date-focus.md:5` `- [ ] Lead approves spec`, unticked; not touched here                                                                                                                                                                                                                                                           |
| no settled D-n contradicted                                                            | pass: D-45 (no `page.tsx`, `src/lib/`, `src/actions/`, `todo-form.tsx`); the lifts §51 names are on main (§45 REQ-45.4, AC-45.3(a), AC-45.5, contract line, Out of scope; `26-escape-due-date.md:54`, `35-due-date-today.md:66-67`, `38-due-date-clear.md:74` no longer say "after Escape"); D-28 `scripts/agent/tier.sh` → `medium`                   |
| `scripts/next-task.sh --check B11.1` on the committed plan says no overlap             | pass: `[next-task] B11.1: no overlap with any Doing or Review card`                                                                                                                                                                                                                                                                                    |

Approach traced against today's code: `onDueDateKeyDown` (`:70-79`) is the only Escape path and is shared by the
field, "Today" and "Clear due date", so one marker covers REQ-51.1's three origins; it returns before any state change
while `pending`, so REQ-51.2 and the "save in flight" half of REQ-51.3 need no new guard; `save` (`:89-99`) is the only
other path that sets `editing` false and it never touches the marker; "Edit due date" (`:146`) is rendered in the
commit that ends edit mode and is `disabled={pending}`, which is false on the Escape path. No dropped behavior found:
server markup, the button's attributes and the §45 entry focus are unchanged (the `ref` adds no attribute).

Costs the lead takes (stated in the plan, repeated here): two existing §45 tests change one assertion each
(spec-named); AC-51.3 to AC-51.5 are pins, green before the code; the plan is 68 lines against the ≈ 40-line guide
(`planning.md`), as B10.1's 60-line plan was.

Non-blocking note for test-writer: AC-51.5's Escape "on the button 'Update due date'" needs that button focused without
a click (a click submits the form and starts a save); focus it before the spied window.

Verdict: approved (ready for the lead's gate, not approved for build)

Riskiest unfalsified: the passive `[editing]` effect runs before the AC-51.1/51.2 assertions only if React flushes it
synchronously after a discrete keydown, as it does for §48 on main; not run here (plan mode).
