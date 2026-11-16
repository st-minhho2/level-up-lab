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

## Plan review (round 2)

Since round 1: D-41 (`docs(spec): §44`, #345) rewrote AC-44.4's When to Tab off the box (no submit), then click the
box, type `Walk the dog`, Enter. It is merged into this branch at 7b42809. The plan (e04c2c7) now cites D-41 and adds
round 1's reason 2 to "Costs the lead takes".

| Check                                                                             | Result                                                                                                                                                                                                    |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: unchanged since round 1. `todo-form.tsx` is the only `src/` file §44 names; the test file, the e2e file and F42 match "How the criteria observe it" and D-40                                        |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: `export function TodoForm(): ReactNode` unchanged; no action, schema, Prisma, env or route                                                                                                          |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: approach A; B's rejection stated; leaving out the optional `src/components/CLAUDE.md` line is stated                                                                                                |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: 7 criteria. AC-44.4's Then now holds in its own When (probe below): box focused after the first result; "Add" focused with 1 call after the Tab; box focused, `''`, 2 calls after the second result |
| verification lists exact commands with expected numbers                           | pass: 338 → 343 (`pnpm test`), 82 → 84 (`pnpm test:e2e`), `verify-red.sh B9.1` exit 0, mutation "CI only" (B1.100), the e2e files §25, §29 and §5 named as regression checks                              |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: skeleton step "none, no new export" (B7.6 and B8.3 precedent); `test(todos)`, `feat(todos)`, `docs(map)`, `docs(backlog)`                                                                           |
| the section has a `Lead approves spec` box, ticked only by a human                | pass: `spec/contracts/42-new-todo-focus.md:5` `- [ ] Lead approves spec`, unticked; this review did not touch it                                                                                          |
| no settled D-n contradicted                                                       | pass: D-40 (no lift or edit) and D-41 (AC-44.4 Tab wording, one `it`, copied literally) are both followed                                                                                                 |
| `scripts/next-task.sh --check B9.1` says no overlap                               | pass: `[next-task] B9.1: no overlap with any Doing or Review card` (exit 0)                                                                                                                               |

Probe: `git clone` of HEAD at `$TMPDIR/probe2`, with approach A applied as the plan states it (a `wasPending` ref and a
`useLayoutEffect` on `[pending]`, after the draft effect, calling `box.current?.focus()` on true → false with
`state?.ok === true`). A vitest file runs D-41's When literally, with the same result object resolved both times:

```
PROBE load=body first=box tab=add calls=1 second=box value='' calls=2
Test Files  3 passed (3)   Tests  35 passed (35)   (probe + todo-form.test.tsx + todo-form-warning.test.tsx)
```

Round 1's reasons are resolved. Reason 1: D-41 fixed AC-44.4's When before the red commit. Reason 2: the
submit-returns-focus cost is now in the plan.

Non-blocking note for the test-writer: the plan counts 5 new `it`s, so AC-44.3's (a) and (b) share one `it`. That fits
"one criterion, one title", but if the test-writer splits (a) and (b) into two `it`s, the count becomes 344. In that
case the diff review expects the plan's number to be updated, not the test to be merged.

Riskiest unfalsified spot: the e2e cost for §25. AC-25.6 and other flows that add and then press `/` now type `/` into
the focused box. The plan names `e2e/25-search-shortcut.spec.ts` as a regression check, but this review did not run
any e2e suite against approach A. The diff review must see it green.

Verdict: approved (ready for the lead's gate. It does not approve the build.)

Rounds: 2

## Diff review (round 1)

Reviewed at `b177e55`. Scope: ui (`src/components/todo-form.tsx`, `src/components/todo-form-focus.test.tsx`,
`e2e/44-new-todo-focus.spec.ts`, `spec/features-map.md`).

### Command results (run by the reviewer)

| Command                             | Last line                                                                                         |
| ----------------------------------- | ------------------------------------------------------------------------------------------------- |
| `pnpm lint`                         | `All matched files use Prettier code style!` (exit 0)                                             |
| `pnpm typecheck`                    | `tsc --noEmit` clean                                                                              |
| `pnpm test`                         | `Tests  343 passed (343)` (54 files; plan said 338 → 343)                                         |
| `pnpm test:e2e`                     | `84 passed (2.1m)` (plan said 82 → 84; `25-search-shortcut`, `29-escape-new-todo`, `05-todos` in) |
| `scripts/mutation-gate.sh`          | `mutation: CI only, no src/lib or src/actions change`                                             |
| `scripts/ci/check-suppressions.sh`  | `OK: no new suppressions`                                                                         |
| `scripts/ci/check-config-change.sh` | `OK: no protected config changed`                                                                 |
| `scripts/ci/check-feat-commits.sh`  | `OK: no feat commit touches tests`                                                                |
| `scripts/ci/check-ac-coverage.sh`   | `OK: every criterion of a shipped section has a test`                                             |
| `scripts/ci/check-spec-sections.sh` | `OK: sections cited: 1 … 46`                                                                      |
| `scripts/ci/check-features-map.sh`  | `OK`                                                                                              |
| `scripts/ci/check-plan-scope.sh`    | `OK: feat/B9.1-agent stays inside the approved plan of B9.1 (D-27 approval)`                      |
| `scripts/verify-red.sh B9.1`        | `RESULT: red for the right reason` (3 new failed in `todo-form-focus.test.tsx`; e2e skipped)      |
| `git diff --stat main...HEAD`       | `8 files changed, 729 insertions(+), 1 deletion(-)`                                               |

### Checklist

| Check                                                     | Result                                                                                                                                                                                                                                                                                                                                    |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every AC-44.n has a test whose assertion matches its Then | pass for AC-44.1–44.3 and AC-44.5–44.7; AC-44.4 matches its Then literally but cannot fail on its second half, see finding [1]                                                                                                                                                                                                            |
| no test weakened after the red commit                     | pass. After `947055c`: `62a54cd` (red), `9e20190` (adds AC-44.2, 44.3, green at base, explained), `8b79096` (AC-44.7 `'   '` → `''`, the D-42 Then, now in the merged §44), `b5669ab` (2 lines `newTodoBox().value = ''`, no assertion changed). Merges after red touching tests: none (`--remerge-diff` empty)                           |
| b5669ab keeps AC-44.4 / AC-44.5 proving focus             | pass (probe 3): with `main`'s `todo-form.tsx` and the current tests, AC-44.1, 44.4, 44.5 fail, 2 pass. The setter moves no focus, so `user.keyboard('Walk')` still lands on `document.body` without the component's `focus()`. The real browser needs no reset: AC-44.6 types `Walk the dog` after the add and the row reads exactly that |
| every changed file is in `plan.md`                        | pass (4 files + exempt paperwork; `check-plan-scope.sh` OK)                                                                                                                                                                                                                                                                               |
| interfaces match §44 Function contracts                   | pass: `TodoForm(): ReactNode` unchanged, no new export or prop. Deviation from the plan: deps `[pending, state]`, not `[pending]` (exhaustive-deps). Traced: `wasPending` is false after the settle commit, so a re-run on `state` alone cannot focus; probe 2 counts exactly 1 `focus()` per settled result, so no double focus          |
| Zod at action boundary / Prisma only in lib / no raw SQL  | n/a (no action, lib or prisma change)                                                                                                                                                                                                                                                                                                     |
| migration                                                 | n/a                                                                                                                                                                                                                                                                                                                                       |
| no secret, no suppression                                 | pass                                                                                                                                                                                                                                                                                                                                      |
| features map row moved                                    | pass: F42 §44 ✅ in `docs(map)` `b177e55`                                                                                                                                                                                                                                                                                                 |
| reverting a changed line fails a test                     | pass for the `focus()` line (probe 3). The `wasPending.current &&` guard is an equivalent mutant (the effect re-runs only when `pending` or `state` changes, and `!pending` already rules out the pending commit)                                                                                                                         |
| Server/Client boundary, accessible names                  | pass: still `'use client'`, "New todo" / "Add" unchanged, AC-44.5 asserts the name, `maxlength`, `aria-describedby`                                                                                                                                                                                                                       |

### Probes (copy at `$TMPDIR/probe1`)

1. Mutant "focus only on the first successful result" (a `data-f` flag on the box blocks every later `focus()`):
   `pnpm vitest run src/components/todo-form` → `Tests  39 passed (39)`.
2. The rejected approach B (`if (state?.ok === true) focus()`, deps `[state]`, no `pending` edge):
   `Tests  39 passed (39)`. I added a probe test: the AC-44.4 flow, with a `focus` spy installed after `Walk the dog`
   is typed and before Enter, and `toHaveBeenCalledTimes(1)` after the second same-object result. Against the
   branch's code: `1 passed`. Against approach B: `expected "patchedFocus" to be called 1 times, but got 0 times`.
3. `main`'s `todo-form.tsx` with the current `todo-form-focus.test.tsx`: `3 failed | 2 passed (5)` (AC-44.1, 44.4,
   44.5 fail).

### Findings

```
[1] KIND: coverage
    WHERE: src/components/todo-form-focus.test.tsx:155-170 (AC-44.4 second half); e2e/44-new-todo-focus.spec.ts:83-88 (AC-44.6 second add)
    DEFECT: no test can fail when the second successful result does not call focus(): in AC-44.4 the user's click on the box, and in AC-44.6 the first add's focus, already puts focus on the box before Enter, and the box keeps it while the save is pending.
    TRIGGER: two ok results in a row, the second one the same object (mockResolvedValue(savedResult('Buy milk'))), with the component changed to focus only once (probe 1) or to approach B, deps [state] (probe 2).
    WRONG BEHAVIOUR: REQ-44.4 ("two successful results in a row focus the box twice") and the Function contract ("receives focus() once" for each new ok result) are broken, and all 39 todo-form tests still pass. The plan's reason for choosing approach A over B (B misses a repeated same-reference result) is not tested at all.
    CONFIDENCE: confirmed (unit tests: probes 1 and 2 run). For AC-44.6 the result is traced, not run: Enter in the focused box keeps focus there.
```

Fix (test-writer, `test(todos): B9.1 review pass 1 -- …`, no `src/` change): in AC-44.4, install
`vi.spyOn(newTodoBox(), 'focus')` after `Walk the dog` is typed and before `{Enter}`, then assert
`toHaveBeenCalledTimes(1)` after the second result settles. This is the same spy pattern AC-44.3 uses and the count
the Function contract states. It leaves AC-44.4's When and Then unchanged. Probe 2 shows the assertion passes on this
branch and fails on approach B and on the focus-once mutant.

Concerns raised by dev-lead:

- (1) `b5669ab` weakens no assertion. It adds two setter lines, and AC-44.4/44.5 still fail without the component's
  `focus()` (probe 3).
- (2) Deps `[pending, state]` cause no double focus (traced and counted, probe 2). This is a plan wording deviation
  with no change in behavior, and the plan should be updated to name it.
- (3) `8b79096` copies the D-42 Then verbatim (title and the `''` assertion).

Verdict: back to test-writer

Riskiest unfalsified: AC-44.6's second add, in a real browser. Nothing shows whether a server re-render after
`revalidatePath('/')` could blur the box and need the second `focus()`. Once [1] is fixed, the unit spy covers
`focus()` being called, but not that call in the browser.
