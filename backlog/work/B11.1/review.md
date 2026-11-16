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

## Diff review (round 1)

Scope: ui. Diff `main...HEAD` at `025490c` (10 files, +707 −5). Pin `218f7b0`, red `d053c8b`, feat `28d7d05`, map `025490c`.

### Command results (last line of each, run by the reviewer)

| Command                             | Result                                                                                   |
| ----------------------------------- | ---------------------------------------------------------------------------------------- |
| `pnpm lint`                         | All matched files use Prettier code style!                                               |
| `pnpm typecheck`                    | `tsc --noEmit`, no output (clean)                                                        |
| `pnpm test`                         | Tests 389 passed (389) (plan: 389)                                                       |
| `pnpm test:e2e`                     | 91 passed (4.2m) (plan: 91; AC-51.7 passed)                                              |
| `scripts/mutation-gate.sh`          | mutation: CI only, no src/lib or src/actions change                                      |
| `scripts/ci/check-suppressions.sh`  | [check-suppressions] OK: no new suppressions                                             |
| `scripts/ci/check-config-change.sh` | [check-config-change] OK: no protected config changed                                    |
| `scripts/ci/check-feat-commits.sh`  | [check-feat-commits] OK: no feat commit touches tests                                    |
| `scripts/ci/check-ac-coverage.sh`   | [check-ac-coverage] OK: every criterion of a shipped section has a test                  |
| `scripts/ci/check-spec-sections.sh` | [check-spec-sections] OK: sections cited: 1 … 53                                         |
| `scripts/ci/check-features-map.sh`  | [check-features-map] OK                                                                  |
| `scripts/verify-red.sh B11.1`       | RESULT: red for the right reason (exit 0; escape-focus 4 new failed, focus 2 new failed) |
| `git log … d053c8b..HEAD -- tests`  | empty (no-merges and remerge-diff); the branch has no merge commit                       |

### Checklist

| Check                                                 | Result                                                                                                                                                                                                                                                                                   |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every AC-51.n has a test whose assertion matches Then | pass: AC-51.1–51.6 in `todo-due-date-escape-focus.test.tsx` (receiver-filtered `mock.contexts` counts as §51 says), AC-51.7 in `e2e/51-escape-due-date-focus.spec.ts`; AC-45.3 (a), AC-45.5 rewritten exactly as §51 lists (one assertion and the title words each)                      |
| no test weakened after the red commit                 | pass: both `git log` checks empty                                                                                                                                                                                                                                                        |
| every changed file is in `plan.md`                    | pass: five planned files plus exempt paperwork (`docs/metrics.md`, `work/B11.1/*`)                                                                                                                                                                                                       |
| interfaces match §51's function contract              | pass: props and signature unchanged; `focus()` only from the effect after Escape; marker set after the `modified \|\| pending` guard                                                                                                                                                     |
| Zod / Prisma / raw SQL / migration                    | n/a: no action, lib, schema or migration change                                                                                                                                                                                                                                          |
| no secret, no suppression                             | pass (`check-suppressions` OK; diff read)                                                                                                                                                                                                                                                |
| features map row moved                                | pass: F49 §51 ✅; `Lead approves spec` box in `49-escape-due-date-focus.md:5` untouched                                                                                                                                                                                                  |
| would a test fail if one changed line were reverted?  | **fail for one line** (finding 1). Probed on copies under `$TMPDIR`: marker set before the guard → AC-51.3 fails (killed); reset `escapedRef.current = false` deleted → all 389 unit tests pass (survives); `return;` after the field focus deleted is equivalent while the reset exists |

### Findings

```
[1] KIND: coverage
    WHERE: src/components/todo-due-date.tsx:74
    DEFECT: deleting the one-shot reset `escapedRef.current = false;` fails no unit or e2e test, although
            without it a later successful save or clear moves focus to "Edit due date".
    TRIGGER: on the probe copy with line 74 deleted: open the editor, Escape, click "Edit due date", submit
             2026-12-01 (action resolves ok), focus "Search todos" while pending; after the result "Edit due date"
             receives focus() and becomes document.activeElement. A probe test of exactly this fails on the mutant
             and passes on 28d7d05; `pnpm exec vitest run` on the mutant: Tests 389 passed (389).
    WRONG BEHAVIOUR: REQ-51.3 / REQ-51.5 ("once for each Escape that leaves edit mode and at no other time";
             a save calls no focus()) would break with the whole suite green. advice.md "Mutation hot spots"
             says AC-51.1's re-render and AC-51.5 kill this mutant; they do not (a re-render does not change
             `editing`, so the effect does not run, and no test exits by a save after an Escape). Components are
             outside Stryker's scope, so CI's mutation job will not catch it either. The shipped code is correct.
    CONFIDENCE: confirmed (I ran it)
```

Fix belongs to test-writer: one hardening `it` (title prefixed `AC-51.5:` or `AC-51.3:`) in
`todo-due-date-escape-focus.test.tsx` doing Escape → "Edit due date" → a successful save (and, in a second row of an
`it.each`, a successful "Clear due date") and asserting 0 `focus()` calls with the new "Edit due date" as receiver and
the focused element unchanged, committed as `test(todos): B11.1 review pass 1 -- …`. No `src/` change is needed.

Non-blocking: AC-51.5 dispatches the Escapes on "Update due date" and "New todo" without focusing those targets first,
so "focus unchanged" there only asserts the field kept focus; the handler is per element, so dispatch target is what
matters and a form-level handler mutant would still fail on the field-still-present assertion.

Verdict: back to test-writer

Riskiest unfalsified: AC-51.7 relies on Playwright's `Enter` on the focused button reaching React's click handler in
dev mode; it passed once here (2.0s), not repeated for flakiness.

## Diff review (round 2)

Scope: ui. Diff `main...HEAD` at `afe12a2` (10 files, +829 −5). Since round 1: `c7dccab` (this file) and `afe12a2`
(`test(todos): B11.1 review pass 1 -- …`, +54 lines in `todo-due-date-escape-focus.test.tsx`, 0 removed lines). The
feat commit `28d7d05` and `src/components/todo-due-date.tsx` are unchanged.

### Command results (last line of each, run by the reviewer)

| Command                             | Result                                                                                |
| ----------------------------------- | ------------------------------------------------------------------------------------- |
| `pnpm lint`                         | All matched files use Prettier code style!                                            |
| `pnpm typecheck`                    | `tsc --noEmit`, no output (clean)                                                     |
| `pnpm test`                         | Tests 391 passed (391) (389 + the 2 `it.each` rows of `afe12a2`)                      |
| `pnpm test:e2e`                     | 91 passed (2.8m); AC-51.7 passed (1.4s)                                               |
| `scripts/mutation-gate.sh`          | mutation: CI only, no src/lib or src/actions change                                   |
| `scripts/ci/check-suppressions.sh`  | [check-suppressions] OK: no new suppressions                                          |
| `scripts/ci/check-config-change.sh` | [check-config-change] OK: no protected config changed                                 |
| `scripts/ci/check-feat-commits.sh`  | [check-feat-commits] OK: no feat commit touches tests                                 |
| `scripts/ci/check-ac-coverage.sh`   | [check-ac-coverage] OK: every criterion of a shipped section has a test               |
| `scripts/ci/check-spec-sections.sh` | [check-spec-sections] OK: sections cited: 1 … 53                                      |
| `scripts/ci/check-features-map.sh`  | [check-features-map] OK                                                               |
| `scripts/verify-red.sh B11.1`       | RESULT: red for the right reason (escape-focus 4 new failed, focus 2 new failed)      |
| `git log --no-merges d053c8b..HEAD` | `afe12a2` only: the hardening commit, `test(...)` subject, additions only (explained) |
| `git log --merges --remerge-diff`   | empty; the branch has no merge commit                                                 |

### Checklist

| Check                                                 | Result                                                                                                                                                                                                             |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| every AC-51.n has a test whose assertion matches Then | pass (unchanged from round 1); `afe12a2` adds two `AC-51.3:` rows exercising REQ-51.3/51.5 after an earlier Escape                                                                                                 |
| no test weakened after the red commit                 | pass: the only test commit after `d053c8b` is `afe12a2`, a `test(...)` commit with 0 removed lines                                                                                                                 |
| every changed file is in `plan.md`                    | pass: five planned files plus exempt paperwork; `afe12a2` touches a planned test file                                                                                                                              |
| interfaces match §51's function contract              | pass (unchanged)                                                                                                                                                                                                   |
| Zod / Prisma / raw SQL / migration                    | n/a                                                                                                                                                                                                                |
| no secret, no suppression                             | pass                                                                                                                                                                                                               |
| features map row moved                                | pass: F49 §51 ✅; `Lead approves spec` box untouched                                                                                                                                                               |
| would a test fail if one changed line were reverted?  | pass. Probes on a clone under `$TMPDIR`: reset `escapedRef.current = false;` deleted → 2 failed (both `afe12a2` rows, "expected 1 to be +0"), finding 1 closed; `if (escapedRef.current)` → `if (true)` → 6 failed |

### Findings

None. Round 1 finding 1 is closed by `afe12a2` (confirmed by the probe above).

Verdict: ready for PR

Riskiest unfalsified: AC-51.7's `Enter` on the focused "Edit due date" reaching React's click handler in dev mode;
it has now passed in two separate full runs (2.0s, 1.4s), not run under repeat-each for flakiness.
