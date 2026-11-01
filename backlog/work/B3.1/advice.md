# B3.1 advice

Read first: §17 (`spec/contracts/15-overdue.md`) is already committed (`6141b04`) with the answer to analysis question 1:
REQ-17.4's paragraph (line 125) and the `TodoDueDate` function contract (line 156) both say the checkbox is read from
the row's DOM, and line 159 says no file but `src/lib/todo-overdue.ts` and `src/components/todo-due-date.tsx` changes
in `src/`. So the spec already chose; this file confirms the choice is buildable, prices it, and prices the one
alternative. The `Lead approves spec` box under §17 is unticked (`spec/contracts/15-overdue.md:5`); the plan gate's
"approve" reply may tick it (D-7). Nothing was run: advice is read-only on `src/`, and `node_modules` is not installed
in this worktree, so lint-rule statements are `[unverified]`.

## Approaches

### Approach A (recommended): the spec's shape, completed read from the row's DOM

- Change: new pure module `src/lib/todo-overdue.ts` (`OVERDUE_LABEL`, `todayOf`, `isOverdue`; no Prisma, no
  `server-only`). `src/components/todo-due-date.tsx` gains: a `ref` on the existing always-rendered wrapper `<div>`;
  state `today` (starts `undefined`) and `completed` (starts `false`); one `useEffect` with no dependency array that,
  after mount and after every render, (1) sets `today` once with `setToday((prev) => prev ?? todayOf(new Date()))` and
  (2) sets `completed` from `ref.current?.closest('li')?.querySelector('input[type="checkbox"]')?.checked ?? false`
  (React bails out when the value is unchanged, so no loop; both setters in one effect batch into one re-render, so a
  completed row never paints the marker); and, while not editing, `{today !== undefined && isOverdue(dueDate, today,
completed) && <span className="text-sm text-red-600">{OVERDUE_LABEL}</span>}` right after the `Due <date>` span.
  Props unchanged. No other `src/` file changes.
- Pros: keeps D-21 intact (UI only in `todo-due-date.tsx`, logic in the card's own module); no hunk in
  `todo-item.tsx`, so no merge conflict with B3.3; the done row has no marker in its DOM, so `e2e/15-due-date.spec.ts:55`
  (`/^\s*B\s*Due 2026-11-05\s*$/`, B done) stays green from 2026-11-06 on; unit-testable in jsdom with an `<li>` wrapper
  (AC-17.4); server markup unchanged (REQ-17.5); `src/lib/todo-overdue.ts` is inside the Stryker scope.
- Cons: couples the component to the row's structure (an `li` whose first checkbox is the completion control; B3.3 must
  keep that, and AC-17.7 proves it end to end); the re-read relies on `TodoItem` re-rendering its child when the
  checkbox changes, true today (`todo-item.tsx:99` is a plain child, no `memo`; the controlled `checked={todo.completed}`
  at line 50 is committed to the DOM before passive effects run); an open overdue row shows no marker for one frame and
  none without JavaScript (accepted by REQ-17.5). Dropped behavior: none versus today.
- Fits rules: invariant 1 (a numbered section, contract signatures exact), invariant 3 (no mutation added), invariant 4
  (no Prisma), invariant 5 (no stateful constant), `ts-style` (`'use client'` only for state/effects/events, explicit
  return types, no `any`, readonly props, no `console`, no `TODO` without a card), D-21 and the plan constraints.

### Approach B (alternative): an optional prop `completed?: boolean`

- Change: `TodoDueDate` gains `completed?: boolean` (default `false`); `src/components/todo-item.tsx:99` becomes
  `<TodoDueDate todoId={todo.id} dueDate={todo.dueDate} completed={todo.completed} />`; the effect only sets `today`.
- Pros: no DOM coupling, no re-read, no dependence on re-render timing; trivially unit-testable with a prop.
- Cons: edits `todo-item.tsx`, which D-21 gives to B3.3, so it needs a lead exception and collides with B3.3's hunk at
  the same line (sequencing or an identical-line merge); changes §17 (REQ-17.4's paragraph, line 156's contract, AC-17.4's
  Given, line 159's "no other file") through a `docs(spec)` commit inside a new D-n, re-opening a spec the lead is about
  to approve; violates the plan constraints given for this card. Dropped behavior: none.
- Fits rules: compliant only after a D-n exception and a spec change (spec-fidelity: "Changing a section is a
  `docs(spec)` commit inside an approved D-n"). Not recommended now; it is the right shape if a later card wants a
  prop.

### Rejected variants (no dependence on the approach)

- `useSyncExternalStore(noop, () => todayOf(new Date()), () => undefined)` for `today`: React keeps server and first
  client render equal, but `getSnapshot` runs on every render, so the marker would move to the new day on a re-render
  with the same props; AC-17.6 (still 0 after the clock moves, then 1 in a fresh render) and REQ-17.7 forbid that.
- CSS only (`:has(:checked)`): the marker stays in a completed row's DOM, breaking `e2e/15-due-date.spec.ts:55`
  from 2026-11-06 on, and jsdom applies no CSS so AC-17.4 would be unprovable.
- `MutationObserver` on the checkbox: React sets the `checked` property, not the attribute, so nothing fires.
- `useLayoutEffect` instead of `useEffect`: allowed by the spec text ("after mount") and would also hide the one frame;
  React 19 no longer warns on the server `[unverified]`. Left to the code-writer; the tests do not tell them apart.

## Recommendation

Approach A. It is what §17 says, it keeps D-21 and the plan constraints true, and it is the only option that holds
REQ-17.4 without a second approval. Choose B only if the lead prefers a prop to DOM coupling and accepts a D-n, a spec
edit and the B3.3 merge. The §15 "Out of scope" line needs a lead ruling before the first test commit (see
`## Questions settled / escalated`, question 7).

## Impact

| File                                            | Add/Change                                                                                                                                                                                                                                          | Signature                                                                                                                                                    | ACs                |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------ |
| `src/lib/todo-overdue.ts`                       | Add (skeleton in the red commit: `OVERDUE_LABEL` defined, `todayOf` and `isOverdue` throw `NotImplementedError`; real in the green commit)                                                                                                          | `export const OVERDUE_LABEL: 'Overdue'`; `todayOf(now: Date): string`; `isOverdue(dueDate: string \| undefined, today: string, completed: boolean): boolean` | AC-17.1, AC-17.2   |
| `src/lib/todo-overdue.test.ts`                  | Add (red)                                                                                                                                                                                                                                           | copies the signatures above                                                                                                                                  | AC-17.1, AC-17.2   |
| `src/components/todo-due-date.tsx`              | Change (green only; the skeleton leaves it as is, so the component tests fail on an assertion)                                                                                                                                                      | `TodoDueDate({ todoId, dueDate }: { readonly todoId: string; readonly dueDate: string \| undefined }): ReactNode` unchanged                                  | AC-17.3 to AC-17.6 |
| `src/components/todo-due-date-overdue.test.tsx` | Add (red); `todo-due-date.test.tsx` stays untouched                                                                                                                                                                                                 | n/a                                                                                                                                                          | AC-17.3 to AC-17.6 |
| `e2e/17-overdue.spec.ts`                        | Add (red per D-16: it fails on an assertion because no marker exists)                                                                                                                                                                               | n/a                                                                                                                                                          | AC-17.7            |
| `spec/features-map.md`                          | Change: add an F15 / §17 row (`todo-overdue.ts`, `todo-due-date.tsx`; the three test files); the file has no F15 row today, so the skeleton commit adds it ✗ and the closing commit makes it ✅ (B2.4 precedent); paperwork, exempt from plan scope | n/a                                                                                                                                                          | docs               |
| `spec/contracts/13-due-date.md`                 | Change one line (86), in a `docs(spec)` commit before any test, only after the lead's ruling (question 7)                                                                                                                                           | n/a                                                                                                                                                          | none               |
| `spec/contracts/15-overdue.md`                  | Tick the box at line 5 (lead, at the plan gate); the index row in `spec/technical-requirements.md:24` goes ✓ in the closing PR                                                                                                                      | n/a                                                                                                                                                          | none               |

Not touched (plan constraints, checked): `src/app/page.tsx`, `todo-form.tsx`, `todo-item.tsx`, `src/lib/todos.ts`,
`src/actions/todos.ts`, `src/lib/logger.ts`, every `src/*/CLAUDE.md` (the orchestrator updates the `todo-due-date.tsx`
lines and should name the "first checkbox of the nearest `li`" coupling, D-21). The test files and `e2e/` must appear
in `plan.md`'s `## Files` (`scripts/ci/check-plan-scope.sh` exempts only `backlog/*`, `spec/*`, `docs/metrics.md`,
`docs/mistake-log.md`).

Client component changed: `src/components/todo-due-date.tsx`.

| Approach | Server-rendered markup                                                                           | Submit with JS off                                                                                                                                 | Submit before hydration                                                                     |
| -------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| today    | wrapper `<div>`, `Due <date>` span when set, one `type="button"` "Edit due date"; no form        | no form is rendered and the button is inert (edit mode is client state); nothing submits                                                           | same: `editing` is `false`, so no form exists to submit                                     |
| A        | byte-identical (`ref` adds no attribute; `today` is `undefined`, so no `Overdue` span, REQ-17.5) | unchanged; the marker never appears without JS (stated cost, REQ-17.5); the completion checkbox is still the §7 control, which is not changed here | unchanged; the marker appears after hydration; the edit button is inert before it, as today |
| B        | byte-identical (the prop is not rendered; `completed` is not in the markup)                      | as A                                                                                                                                               | as A                                                                                        |

## Risks

- Migration: none. No schema, env key, dependency, CI path or hook change; no `config-change-approved` label.
- Security: none; the marker is static text, nothing is stored or sent, `todayOf` output never leaves the browser.
- Performance: one `closest` plus `querySelector` per due-date wrapper per render (list of tens of rows): negligible.
  Each row renders once more after mount (the effect's state set); no network.
- Isolation: no module-level state or cache; `new Date()` is read inside the effect only, never at import, so SSR
  output and the test fakes stay deterministic (invariant 5 not touched).
- Hydration: any `Date` read during render would break AC-17.5; keep every `new Date()` inside the effect.
- Coupling with B3.3: if B3.3 puts a second checkbox before the completion one, wraps the row so the nearest `li`
  changes, or adds `memo` around `TodoDueDate`'s parent, REQ-17.4 breaks in the browser. AC-17.7 on the merged row is the
  guard; the orchestrator should run `pnpm test:e2e` after B3.3 merges.
- Existing tests that could turn red, read line by line: `src/components/todo-due-date.test.tsx` AC-15.5 (a) uses
  `getAllByText('Due 2026-11-05')` (exact text of one span, so the separate `Overdue` span from 2026-11-06 does not
  count), (b) has no date, AC-15.6 asserts alerts and the single wrapper child (the marker is inside the wrapper): all
  stay green; no assertion reads a dated row's whole text. `src/components/todo-item.test.tsx` has no `dueDate`.
  `e2e/15-due-date.spec.ts:55` and `:62`: B is done, so no marker. Today is 2026-11-01, so nothing is red today; the
  new tests pin the clock so they do not depend on it.
- Lint: `eslint-config-next` 15.5.28 is expected to bundle `react-hooks` v5 (`rules-of-hooks`, `exhaustive-deps`
  only; no `set-state-in-effect`) `[unverified]`. A dependency-less effect passes `exhaustive-deps`. If lint objects,
  fix the code, never add a suppression (`scripts/ci/check-suppressions.sh`).
- `react-dom/server` in a jsdom test (AC-17.5): `renderToString` should resolve; if it needs a `TextEncoder` shim or the
  `react-dom/server.browser` entry, that is a test-file import choice, not a config change `[unverified]`.
- Hygiene: the e2e seed helper in `e2e/15-due-date.spec.ts` does not set `dueDate`; `e2e/17-overdue.spec.ts` seeds with
  `dueDate: new Date(Date.UTC(y, m, d))` from the browser's day (`page.evaluate(() => new Date())` local fields), the
  shape `dueDateToDate` stores (`@db.Date`).

## Test strategy

| Layer     | File                                            | ACs                | Mocks                                                                                                                                                                                                                                                                                    |
| --------- | ----------------------------------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| unit      | `src/lib/todo-overdue.test.ts`                  | AC-17.1, AC-17.2   | none (pure; no `@/lib/prisma`, no `server-only`); `Date`s built from local fields; pin `TZ` with `vi.stubEnv('TZ', 'Pacific/Kiritimati')` so a UTC implementation of `todayOf` fails even on a UTC runner `[unverified]`                                                                 |
| component | `src/components/todo-due-date-overdue.test.tsx` | AC-17.3 to AC-17.6 | `vi.mock('@/actions/todos')` with a `vi.hoisted` object (`setTodoDueDateAction`); `vi.useFakeTimers({ toFake: ['Date'] })` plus `vi.setSystemTime(new Date(2026, 10, 1, 12))`, restored in `afterEach`; AC-17.5 uses `renderToString` and `hydrateRoot` with an `onRecoverableError` spy |
| e2e       | `e2e/17-overdue.spec.ts`                        | AC-17.7            | none; compose Postgres; days from the browser's local day; waits for hydration (`networkidle`) before the first click                                                                                                                                                                    |

Red commit shape: AC-17.2 and AC-17.1 fail on `NotImplementedError`; AC-17.3 (a) fails on its assertion, and the cases
the skeleton already satisfies ((b), (c), (d), the "no `Overdue`" half of AC-17.4 and AC-17.5) share an `it` with an
assertion it fails, as B2.4 did. Skeleton `todo-overdue.ts` must not throw at import: `OVERDUE_LABEL` is a constant.
Titles start with the id (`AC-17.2: marks a due date strictly before today …`); at most 7 criteria, so
`check-ac-coverage.sh` passes. Unit and component tests are green with no database; the e2e needs `docker compose up -d`.

## Mutation hot spots

Stryker mutates `src/lib/**` and `src/actions/**` only (`stryker.config.mjs`), so `todo-overdue.ts` is in scope and
`todo-due-date.tsx` is not; AC-17.3 to AC-17.6 guard the component by behavior. Target ≥ 70 % overall, expect all killed
here:

| Where                                                  | Mutant                                                            | Killed by                                                                               |
| ------------------------------------------------------ | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `isOverdue` `dueDate < today`                          | `<=`, `>`, `>=`                                                   | AC-17.2 rows 1, 2, 3 and the last (`'2026-11-01'` vs `'2026-10-31'`)                    |
| `isOverdue` `!completed`                               | removed or negated                                                | AC-17.2 row 5 (`true` completed)                                                        |
| `isOverdue` `dueDate !== undefined`                    | removed (`undefined < today` is `false`, so it may be equivalent) | AC-17.2 row 4; if Stryker reports it Survived, keep the guard and note it as equivalent |
| `todayOf` `getMonth() + 1`                             | `- 1`, no offset                                                  | AC-17.1 (`2026-11-01`, `2026-01-05`, `2026-12-31`)                                      |
| `todayOf` `getDate()`                                  | `getDay()`                                                        | AC-17.1 (`2026-11-02`)                                                                  |
| `padStart(4, '0')`, `padStart(2, '0')`, the `'0'` fill | length or fill changed, pad removed                               | AC-17.1 `'0005-01-01'` and the single-digit month and day rows                          |
| `getFullYear()` / `getMonth()` / `getDate()`           | UTC variants (not a built-in Stryker mutator)                     | only a non-UTC runner distinguishes them: hence the `TZ` pin in the unit test           |
| `OVERDUE_LABEL`                                        | string emptied or changed                                         | AC-17.2 constant check, AC-17.3 text                                                    |
| string comparison versus a numeric parse of the year   | `0999-12-31` vs `1000-01-01`                                      | AC-17.2 row 7                                                                           |

Component-only behaviors with no mutation coverage, killed by test design instead: `today` read once (AC-17.6's
"still 0 after the re-render with the same props"), no `Date` read in render (AC-17.5), the `li` lookup (AC-17.4's
no-`li` case shows the marker), no marker in edit mode (AC-17.6).

## Questions settled / escalated

```
Question:    How does TodoDueDate learn "completed" without changing src/components/todo-item.tsx (analysis Q1)?
Class:       P0 no conflict
Sources:     spec/contracts/15-overdue.md:125 "Completed is read in the browser from the row itself: the first `input[type="checkbox"]` inside the nearest `li`"
             spec/contracts/15-overdue.md:159 "No file other than `src/lib/todo-overdue.ts` and `src/components/todo-due-date.tsx` changes in `src/`"
             backlog/00-decisions.md:47 "B3.3 delete in `src/components/todo-item.tsx`"
Conflict:    none (the analysis proposed option C and the committed §17 already writes it)
Verdict:     The spec governs and it already fixes the mechanism, so approach A is the contract, not a choice. A prop (option A of the analysis, approach B here) would need a D-n exception to D-21 and a §17 edit.
Next action: Plan lists the two src files; code-writer implements the effect as described under Approach A.
Must not:    Add `completed={todo.completed}` to todo-item.tsx, or hide the marker with CSS.
Doc drift:   none (the orchestrator names the coupling in src/components/CLAUDE.md after the batch, D-21)
Escalate:    none
```

```
Question:    Which clock defines "today", and is midnight tracked (analysis Q2, Q3)?
Class:       P0 no conflict
Sources:     spec/contracts/15-overdue.md:116 "the server's clock, the server's time zone and UTC are never used to decide it"
             spec/contracts/15-overdue.md:122 "never by a timer"
Conflict:    none
Verdict:     REQ-17.1 and REQ-17.7 decide both; the analysis's alternatives are out of scope (line 164).
Next action: Implement `todayOf` with local getters; read `new Date()` once, in the effect.
Must not:    Use `toISOString()`, `Intl`, the server clock, or a timer or focus listener.
Doc drift:   none
Escalate:    none
```

```
Question:    Do the date-dependent §15 tests go red after 2026-11-05 (analysis Q4)?
Class:       P1 code ≠ spec (checked: none found)
Sources:     src/components/todo-due-date.test.tsx:46 "expect(screen.getAllByText('Due 2026-11-05')).toHaveLength(1);"
             e2e/15-due-date.spec.ts:55 "toHaveText(['C', /^\s*B\s*Due 2026-11-05\s*$/, 'A'])"
Conflict:    none
Verdict:     Both stay green: the first matches one span's exact text, the second reads a done row, which carries no marker (approach A). Evidence of what exists, not a requirement.
Next action: New tests pin the clock; no edit to existing tests.
Must not:    Loosen or edit `todo-due-date.test.tsx` or `15-due-date.spec.ts`.
Doc drift:   none
Escalate:    none
```

```
Question:    Where do the new tests live (analysis Q5)?
Class:       P2 spec silent
Sources:     .claude/rules/testing.md "Unit `src/**/<name>.test.ts` (node), component `src/**/<name>.test.tsx` (jsdom, Testing Library), one e2e file per section in `e2e/`."
Conflict:    none
Verdict:     The analysis's placement stands: `src/lib/todo-overdue.test.ts`, `src/components/todo-due-date-overdue.test.tsx`, `e2e/17-overdue.spec.ts`; the existing component test file stays untouched (never weaken).
Next action: List the three files in plan.md `## Files`.
Must not:    Append the cases to `todo-due-date.test.tsx`.
Doc drift:   none
Escalate:    none
```

```
Question:    Which paperwork rides with the card (analysis Q6)?
Class:       P2 spec silent
Sources:     spec/CLAUDE.md "`features-map.md` | any `src/` change that adds, moves or removes a feature | `scripts/ci/check-features-map.sh`"
             backlog/00-decisions.md:47 "Card plans leave out the package guides (`src/*/CLAUDE.md`), so `next-task.sh --check` stays clean"
Conflict:    none
Verdict:     Add an F15 / §17 row to `spec/features-map.md` (no F15 row exists today); leave `src/*/CLAUDE.md` to the orchestrator; expect adjacent-line merge conflicts on `spec/technical-requirements.md` and `backlog/plan/E3-todos-polish.md`.
Next action: Skeleton commit adds the row ✗; the closing commit makes it ✅ and flips the §17 index row.
Must not:    Edit a `src/*/CLAUDE.md` in this card's plan.
Doc drift:   spec/features-map.md (F15 row, skeleton commit); spec/technical-requirements.md:24 (closing PR)
Escalate:    none
```

```
Question:    Should `today` come from `useSyncExternalStore` or a layout effect instead of a plain effect?
Class:       P2 spec silent
Sources:     spec/contracts/15-overdue.md:156 "state `today` starts undefined (so the server render and the first client render show no marker) and is set once to todayOf(new Date()) after mount"
             spec/contracts/15-overdue.md:139 "still 0 after the re-render with the same props"
Conflict:    none
Verdict:     `useSyncExternalStore` re-reads the clock on every render and fails AC-17.6; `useEffect` or `useLayoutEffect` both meet "after mount".
Next action: Code-writer uses `setToday((prev) => prev ?? todayOf(new Date()))` in an effect.
Must not:    Compute `today` during render or in `useState`'s initializer.
Doc drift:   none
Escalate:    none
```

```
Question:    May the §17 docs(spec) commit edit §15's "Out of scope" line that excludes "an overdue or due-soon highlight or any comparison with today's date" (analysis "Needs a ruling")?
Class:       P4 two sections collide (and P6: the edit's authority needs a ruling only the human can give)
Sources:     spec/contracts/13-due-date.md:86 "an overdue or due-soon highlight or any"
             spec/contracts/15-overdue.md:117 "WHILE a todo is not completed and its due date (§15) is strictly before today THE SYSTEM SHALL show the text `Overdue`"
             backlog/00-decisions.md:47 "B3.3 brings deleting a todo into scope, lifting that exclusion from §5's Out of scope in its own `docs(spec)` commit."
             backlog/00-decisions.md:40 "§1's \"due dates\" and §5's \"filtering\" exclusions are lifted by the sections that specify them, each a `docs(spec)` commit in its own card"
             spec/CLAUDE.md:5 "within an approved D-n in `backlog/00-decisions.md`, change the spec section"
Conflict:    §15 line 86 says a comparison with today's date is out of scope / §17 REQ-17.2 to REQ-17.4 compare the due date with today and show a marker. D-21 names the overdue marker, the section number and the file, and lifts an exclusion only for B3.3's delete in §5; D-20 shows the lead names each lifted exclusion and its section when he means to lift one.
Verdict:     D-21 does not already govern the edit, so it is not a mechanical consequence. D-21 decides that the marker is built and that B3.1 owns §17 and `15-overdue.md`; it does not mention §15, which D-20 gave to B2.4 and the lead ticked as approved (`13-due-date.md:5`). spec/CLAUDE.md:5 allows changing an existing section only inside an approved D-n that covers it, and the only D-n text about lifting an exclusion in D-21 is scoped to §5 and delete. Both sections sit at level 3 of the authority order, so neither outranks the other, and the §17 approval box (`15-overdue.md:5`) approves §17's text, not an edit to §15. Only a new lead ruling (the next number, D-22) settles it. The behavior is not in doubt (D-21 builds the marker); the ruling is cheap and can come in the same reply as the plan approval.
Next action: Lead rules D-22 at the plan gate with the plan approval; then a `docs(spec): §15 …` commit lands before the `test(...)` commit (it is spec paperwork, exempt from plan scope). Until then no test commit.
Must not:    Edit §15's line on the strength of D-21 alone, or leave both lines standing and write "lifts §15" into §17 (spec/CLAUDE.md:12 bans history in a section).
Doc drift:   spec/contracts/13-due-date.md line 86 (the `docs(spec)` commit before the red commit); backlog/00-decisions.md gains D-22 (human writes it)
Escalate:    human
```

**Decision request**

- Context: §15's Out of scope (line 86) excludes an overdue highlight and any comparison with today's date; §17, which
  D-21 puts on the B3.1 card, is exactly that comparison. D-21 neither lifts nor mentions §15's line, and §15 is an
  approved section (ticked 2026-10-31). The spec rule is one line of text away from agreeing with itself, but editing an
  approved section needs a D-n.
- Options:

| #   | Behavior                                                                                                                                                                                                               | Cost                                                         | Risk                                                                                   | Reversible |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------- | ---------- |
| 1   | One `docs(spec): §15` commit rewrites line 86's phrase "an overdue or due-soon highlight or any comparison with today's date" to "a due-soon highlight" (§17 also excludes due-soon, line 164); §15 and §17 then agree | one line, one commit before the red commit; no AC id changes | none for behavior; a reviewer sees an approved section edited, cited to this D-n       | yes        |
| 2   | Leave §15 unchanged and write "lifts §15's exclusion" into §17                                                                                                                                                         | one sentence in §17                                          | the collision stays in the spec; §17 would carry history, which spec/CLAUDE.md:12 bans | yes        |
| 3   | Decline the marker: B3.1 closes unbuilt                                                                                                                                                                                | none to code; throws away the committed §17 and the analysis | contradicts D-21, which already assigns the card                                       | yes        |

- Recommended: option 1, flips to option 2 if the lead wants §15 byte-for-byte frozen after approval (then §17 owns the
  conflict note and the reviewer is told).
- Affects: §15 line 86 (`spec/contracts/13-due-date.md`); §17 (box and index row only); card B3.1; no AC ids; no `src/`
  file; D-22 to be written by the human.
