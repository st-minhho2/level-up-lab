# B9.1 advice: focus the "New todo" box after a successful add (§44)

Governing source: `spec/contracts/42-new-todo-focus.md` (§44, REQ-44.1 to 44.5, AC-44.1 to 44.7). D-40 lifts nothing and
says the sibling "`todo-form.tsx` unchanged" notes do not apply (§44 lines 27-36). Only `src/components/todo-form.tsx`
changes (§44 line 57). Reference for style: §39 `todo-form.tsx` (existing `box` ref, `useLayoutEffect`).

## Approaches

### A (recommended): focus on the falling edge of `pending`, when `state` is a success

Change: in `todo-form.tsx`, a `useRef<boolean>` holds the previous `pending`; a `useLayoutEffect` keyed on `[pending]`,
declared after the existing draft-sync layout effect, calls `box.current?.focus()` when `pending` went true to false and
`state !== null && state.ok`. First render (`pending` false, ref false) never focuses.

- Pros: one focus per settled action even when the action resolves the very same object twice (a mock using
  `mockResolvedValue(obj)` in AC-44.4 "resolves ok both times"); runs in the commit that settles the action, after
  React's form reset (REQ-44.1 "once the box holds the empty value"); re-renders from typing, the counter or the
  warning do not change `pending`, so REQ-44.2 and REQ-44.4 hold by construction; failure leaves `state.ok === false`
  so no `focus()` call (REQ-44.3).
- Cons: relies on React 19 committing the `state` update and `pending: false` together (true for `useActionState`);
  an action that throws would leave an older `ok` state and focus (the action returns `ActionResult`, so not reachable
  through `createTodoAction`).
- Rules: ts-style (no `any`, client component only for events/state, no wrapper around the action, so the native POST
  stays); invariants 1 and 3 untouched.

### B (alternative): `useLayoutEffect(..., [state])`, focus when `state?.ok`

- Pros: the literal reading of the §44 Function contracts line ("`state` becomes a new result").
- Cons: if the mock (or any action) resolves the same object reference twice, React bails out, `state` is unchanged and
  the effect does not rerun, so AC-44.4's second result would not focus; the test would need a fresh object per call,
  which the spec does not require. Also a second success after a failure from the same reference is fine, but
  success then success is not.
- Rules: compliant.

## Recommendation

A. It satisfies the observable contract (focus once per settled success) without depending on object identity. If the
test-writer always returns a fresh object, B also passes, but A is not weaker on any AC.

## Impact

| File                                      | Add/Change                        | Signature                                                              | ACs                |
| ----------------------------------------- | --------------------------------- | ---------------------------------------------------------------------- | ------------------ |
| `src/components/todo-form.tsx`            | Change                            | `export function TodoForm(): ReactNode` (unchanged); header adds `§44` | AC-44.1 to AC-44.7 |
| `src/components/todo-form-focus.test.tsx` | Add (test commit, red)            | AC-44.1 to AC-44.5, `vi.hoisted` mock of `@/actions/todos`             | AC-44.1 to AC-44.5 |
| `e2e/44-new-todo-focus.spec.ts`           | Add (test commit, red)            | Playwright, `toBeFocused`                                              | AC-44.6, AC-44.7   |
| `spec/features-map.md`                    | Change (`docs(map)` after `feat`) | row F42, §44, files above                                              | map check          |
| `src/components/CLAUDE.md`                | Optional one line                 | `todo-form.tsx` also focuses the box after a successful add (§44)      | none               |

Client component `todo-form.tsx` (one line per approach):

- A: server-rendered markup identical to today (effect adds no attribute or element). JS off: native POST, full reload,
  no focus, today and after. Submit before hydration: native POST, same. After hydration: focus moves to the box after
  an ok result; today it falls to the page. Drops nothing.
- B: markup identical, JS off and pre-hydration identical to A; drops focus on a repeated same-reference result (con above).

Skeleton commit: no new export, so the skeleton is a no-op for `src/`; the red test fails on the assertion
(`document.activeElement` is `document.body`), not on an import.

## Risks

- Migration: none. No dependency, env, Prisma, action, lib change; medium tier (D-28); mutation run skipped (no
  `src/lib`/`src/actions` change, B1.100).
- Existing tests that could turn red: `todo-form.test.tsx`, `todo-form-warning.test.tsx` (they never assert focus;
  `userEvent` clicks leave focus where the click put it). The "New todo" box now focused after a save can change
  `/` behavior in e2e flows that add then press `/`: `e2e/25-search-shortcut.spec.ts` AC-25.6 adds nothing before `/`,
  but check any e2e that adds a todo then types `/` (in the box `/` is typed, §25). Run the whole e2e suite.
- AC-44.3 spies on the box's `focus`: the spy must be installed before the first commit (e.g. on
  `HTMLInputElement.prototype.focus`), and A must not call `focus()` for a failed result or on mount.
- Do not touch the draft layout effect (§18 REQ-18.6): it has no dependency list on purpose.
- Escape (§29) is unchanged; `pending` guard stays.
- Gate: the §44 "Lead approves spec" box is unticked and the index shows ✗; D-40 relies on the lead's label (D-27) as
  approval for an agent-ready run. For an interactive run, `dev-lead` needs the lead's tick at the plan gate, before any
  test is written.

## Test strategy

| Layer     | File                                      | ACs                | Mocks                                                                                     |
| --------- | ----------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------- |
| component | `src/components/todo-form-focus.test.tsx` | AC-44.1 to AC-44.5 | `vi.hoisted` `createTodoAction` at `@/actions/todos`; spy on `focus`; no mock of the unit |
| e2e       | `e2e/44-new-todo-focus.spec.ts`           | AC-44.6, AC-44.7   | none (real DB, `toBeFocused`)                                                             |

Titles start `AC-44.n:`. AC-44.4 needs a case with the same object resolved twice to prove A.

## Mutation hot spots

Not gated (component only), but weak spots: the `ok` condition (flip to `!ok` must fail AC-44.3), the edge test
(`wasPending && !pending`, dropping `wasPending` must fail AC-44.2), and `box.current?.focus()` removal (AC-44.1).

## Questions settled / escalated

Question: Does the "`todo-form.tsx` unchanged" note of §29, §39, §19 block this card?
Class: P4 two sections collide
Sources: spec/contracts/42-new-todo-focus.md:27 "The "`todo-form.tsx` unchanged" notes of the sections below limit each section's own change; they do not apply to §44"
Conflict: §29/§39/§19 say unchanged / §44 says it changes `todo-form.tsx`
Verdict: §44 states the notes limit only their own section's change; D-40 records the same (backlog/00-decisions.md:65). Both outrank the sibling notes' reading by authority order 2 and 3.
Next action: build per approach A.
Must not: edit the siblings' contracts or skip `todo-form.tsx` because a sibling note says unchanged.
Doc drift: none
Escalate: none

Question: Effect keyed on `state` or on `pending`?
Class: P2 spec silent (Function contracts say "new result", not how to detect it)
Sources: spec/contracts/42-new-todo-focus.md:54 "each time the `state` of useActionState(createTodoAction, null) becomes a new result with ok === true"
Conflict: none
Verdict: The contract states the behavior (focus once per successful result), not the mechanism; A realises it for repeated identical objects too. Tests assert behavior, so either passes with fresh objects.
Next action: test-writer includes a same-reference double success in AC-44.4.
Must not: choose the mechanism by what makes one test pass.
Doc drift: none
Escalate: none

Question: AC-44.4's When clicks "Add" with the box empty, yet its Given resolves ok both times; what governs, and may this agent-ready run edit AC-44.4 in a `docs(spec): §44` commit?
Class: P3 section contradicts itself (AC-44.4 Then vs REQ-44.1 and AC-44.4's own Given/When), with a P6 ruling on who may repair it
Sources: spec/contracts/42-new-todo-focus.md:19 "make the "New todo" box `document.activeElement`, whichever control had focus before (the "Add" button, the box, or none)"
Sources: spec/contracts/42-new-todo-focus.md:45 "after the click on "Add" `document.activeElement` is that button and stays it until the second result"
Sources: backlog/00-decisions.md:65 "B9.1 lifts and edits nothing and states that the sibling sections' "`todo-form.tsx` unchanged" notes do not apply"
Sources: backlog/00-decisions.md:52 "the lead's `agent-ready` label on a GitHub issue is the spec approval for that issue's card"
Sources: spec/CLAUDE.md:3 "Never edit a section to match the code; code and spec disagree → report the divergence (`/spec-trace`) and let the human decide."
Conflict: REQ-44.1 (an ok result focuses the box whichever control had focus) and AC-44.4's Given (ok both times) / When (click "Add", box empty, submits) / Then (button stays focused, 2 calls) cannot all hold; the reviewer probe (afterClick=2, focusAfterClick=box) confirms the AC, not the REQ, is the odd one out.
Verdict: The requirement governs behavior and the AC must be read against it (authority 3, same file, so P3). But repairing the AC is a change to an approved section's criterion, and nothing in this run authorizes it: D-40 scopes B9.1 to "lifts and edits nothing"; D-27's label approved the spec as filed, not a rewritten one; the section's approval box is unticked and D-7 makes spec approval a human act; spec/CLAUDE.md allows a `docs(spec)` change only inside an approved D-n naming it, and no D-n names AC-44.4. The headless run therefore may not edit AC-44.4, and may not pick a reading (for example, a mock that rejects the second call, or a test that deviates from the When) on its own. Stop at the plan gate for this card.
Next action: escalate to the human with the Decision request below; do not write the red test for AC-44.4 until a D-n lands (the other ACs, 44.1 to 44.3, 44.5 to 44.7, are unaffected and may be planned as-is).
Must not: edit AC-44.4, write a test that quietly changes its When (Tab, click outside) or its Then (box focused after the click), or weaken the Then to pass.
Doc drift: spec/contracts/42-new-todo-focus.md AC-44.4 (a `docs(spec): §44 …` commit, after the D-n, before the skeleton and the red test); no D-40 rewrite (00-decisions.md is never rewritten, the new D-n supersedes).
Escalate: human

Decision request
Context: AC-44.4's When clicks "Add" with the box empty, which submits (title error, ok: false under real validation; ok: true under the mock), so the Then "button stays focused, 2 calls" is unreachable under REQ-44.1. The intent of AC-44.4 is REQ-44.4: two successes in a row focus the box twice, and focus moved elsewhere in between stays there.
The run is agent-ready (D-27/D-40, spec first); D-40 says B9.1 edits nothing, so only the lead can authorize an edit.
Options:
| Option | Behavior | Cost | Risk | Reversible |
| 1 (recommended) | New D-n lets `docs(spec): §44` rewrite AC-44.4's When to move focus off the box without a submit, e.g. "the person adds `Buy milk`; presses Tab so focus leaves the box (it is on "Add" or the page); then types `Walk the dog` in the box and presses Enter", Then: after the first result the box is focused; after the Tab focus is not the box and stays so until the second result; after the second the box is focused, value `''`, 2 calls | one spec commit, label stays | low: REQ unchanged, only the AC's When/Then | yes |
| 2 | D-n keeps the click on "Add" but makes the Then match REQ-44.1: after the click the box is focused again (a third focus) and calls = 2 | one spec commit | medium: AC no longer shows "focus elsewhere stays" (REQ-44.4 second clause uncovered) | yes |
| 3 | No edit; test-writer reads the When as "clicks Add with a non-empty box" | none | high: silently differs from the spec text, fails the spec-is-contract invariant | no |
Recommended: option 1, flips if the lead wants the click on the real button kept as the proof (then option 2 with a separate Tab-based criterion, which makes 8 ACs and needs a new section, spec/CLAUDE.md limit of 7).
Affects: §44 AC-44.4 (REQ-44.4 coverage), `src/components/todo-form-focus.test.tsx` AC-44.4 case, `backlog/work/B9.1/plan.md` (the "AC-44.4 same-ref case" line), review.md reason 1, card B9.1.

Question: AC-44.7 requires the box to hold 3 spaces after a `title` error, but `todo-form.tsx:28` empties it; what governs, and can the run act under D-40/D-41?
Class: P4 two sections collide (§44 REQ-44.3 and AC-44.7 against §18 REQ-18.6 and §10 REQ-10.6), with P3 inside §44 (REQ-44.5 and AC-44.3(b)) and a P6 ruling on who may repair it
Sources: spec/contracts/42-new-todo-focus.md:21 "THE SYSTEM SHALL NOT focus the box: no `focus()` call is made on it and the box keeps its value (§10)"
Sources: spec/contracts/42-new-todo-focus.md:48 "the box is not focused after the click, and the `/` press focuses "Search todos" (§25) and the "New todo" box's value is still 3 spaces"
Sources: spec/contracts/42-new-todo-focus.md:23 "THE SYSTEM SHALL change nothing but focus: the box's value"
Sources: spec/contracts/16-title-counter.md:22 "emptied after a success, emptied after a `title` error of §5, or refilled with the typed title after a `form` failure of §10"
Sources: spec/contracts/08-mutation-feedback.md:22 "IF creating a todo fails as in REQ-10.1 THEN THE SYSTEM SHALL show the message under the "New todo" text box, keep the typed title in the box"
Sources: backlog/00-decisions.md:65 "B9.1 lifts and edits nothing and states that the sibling sections' "`todo-form.tsx` unchanged" notes do not apply"
Sources: backlog/00-decisions.md:66 "REQ-44.1 to REQ-44.5 and every other criterion are unchanged; B9.1 still lifts nothing else."
Conflict: §44 REQ-44.3 and AC-44.7 (a title error keeps the value) / §18 REQ-18.6 (a title error empties the box) and §10 REQ-10.6 (only a `form` failure keeps the title; "(§10)" in REQ-44.3 points there); REQ-44.5 says §44 changes nothing but focus, and AC-44.3(b) asserts no value on a title error.
Verdict: The code is right and §44 is the outlier. Authority 3 puts §10 and §18 (live, tested: AC-18.4, AC-10.5) above a §44 criterion that would change their behavior, and §44 line 25 declares "Edits to other sections that this one makes: none". Under rule 1, spec-fidelity, and invariant 2 the run may neither edit `todo-form.tsx` to keep the draft after a title error (that is a behavior change beyond focus, REQ-44.5, and would break §18 REQ-18.6) nor loosen or rewrite AC-44.7 or the red e2e. D-40 says B9.1 "lifts and edits nothing", and D-41 names only AC-44.4. No D-n covers AC-44.7 or the REQ-44.3 clause, so spec/CLAUDE.md allows no `docs(spec)` commit. The run cannot reach green (e2e AC-44.7 stays red) and needs a D-n.
Next action: stop at this gate and escalate; do not start the `feat` commit. ACs 44.1 to 44.6 are unaffected.
Must not: change `kept` in todo-form.tsx to keep the draft after a title error; edit AC-44.7's Then or the e2e to `''`; reword REQ-44.3 inside the run.
Doc drift: spec/contracts/42-new-todo-focus.md REQ-44.3 and AC-44.7 (a `docs(spec): §44 ...` commit after the D-n, before any further test or code); no 00-decisions.md rewrite, the new D-n supersedes. e2e/44-new-todo-focus.spec.ts AC-44.7 follows the spec in a test commit.
Escalate: human

Decision request
Context: After 3 spaces and "Add" the real action returns a `title` error; §18 REQ-18.6 and the code empty the box (React's form reset), while §44 REQ-44.3 and AC-44.7 say the box keeps its value. D-40 forbids §44 from editing other sections and D-41 touched only AC-44.4.
The red e2e fails only on `toHaveValue('   ')` received `''`; the focus, alert, rows and `/` clauses already pass.
Intent of §44 is focus only (REQ-44.5), so the keep-value claim looks like a slip copied from the §10 case.
Options:
| Option | Behavior | Cost | Risk | Reversible |
| 1 (recommended) | New D-n lets `docs(spec): §44` fix REQ-44.3 ("keeps its value (§10)" becomes "a `form` failure keeps its value (§10); a `title` error empties it (§18 REQ-18.6)") and AC-44.7's Then (box value is `''`, or drop the value clause; `/` still focuses "Search todos"); the e2e follows in a test commit | one spec commit, one e2e edit, no src change | low: matches shipped behavior and §10/§18 tests | yes |
| 2 | D-n makes a title error keep the typed value: §44 REQ-44.3 stands, `kept` in todo-form.tsx changes, and §18 REQ-18.6 and §10 get edits | spec edits to §18, §10 and REQ-44.5, rewrite of AC-18.4 and others, `src/` change beyond focus, new full-tier work | high: reverses a shipped rule, breaks `todo-form.test.tsx` cases, wider than B9.1's one-component scope | partly |
| 3 | Drop AC-44.7's value clause only, leave REQ-44.3 as is | one spec commit | medium: REQ-44.3 stays self-contradicting with §18 | yes |
Recommended: option 1, flips if the lead wants a title error to keep the draft as a product choice (then option 2 as its own section, not B9.1).
Affects: §44 REQ-44.3, AC-44.7, `e2e/44-new-todo-focus.spec.ts` AC-44.7 (red commit 62a54cd), `backlog/work/B9.1/plan.md` (AC-44.7 line), card B9.1; §18 REQ-18.6 and §10 REQ-10.6 under option 2.

Question: AC-44.4 and AC-44.5 stay red after the green step because user-event keeps a stale UIValue; may the run fix the test (option a) or must it write the value in todo-form.tsx (option b)?
Class: P1 code ≠ spec in appearance only; in fact a test-tooling defect (the spec and the component agree)
Sources: spec/contracts/42-new-todo-focus.md:23 "THE SYSTEM SHALL change nothing but focus: the box's value, `name`, `id`, `maxlength`"
Sources: spec/contracts/42-new-todo-focus.md:46 "with no click on the box the person types `Walk` and reads the form"
Sources: .claude/rules/testing.md "Never loosen an assertion to go green; change the spec first."
Sources: .claude/rules/invariants.md "no `skip`, `only`, `todo` left behind, no loosened assertion."
Sources: node_modules/@testing-library/user-event/dist/esm/document/UI.js:19 "return element[UIValue] === undefined ? element.value : String(element[UIValue]);"
Conflict: none between spec and component. Test AC-44.4/44.5 expect 'Walk the dog' / 'Walk' after a save; user-event types onto its own UIValue 'Buy milk', which only a value-setter write cleans (interceptor.js:95, trackValue.js:29/44), and form.reset() does not use the setter.
Verdict: Claim verified. I ran `pnpm vitest run src/components/todo-form-focus.test.tsx`: AC-44.1 to 44.3 pass; AC-44.4 fails "expected 'Buy milkWalk the dog' to be 'Walk the dog'" (line 167) and AC-44.5 fails "Received: Buy milkWalk" (line 185). The component is right: the box is '' (the toHaveValue('') waits pass) and Chromium e2e AC-44.6 saves exactly `Walk the dog`. Option (b) is out: REQ-44.5 (authority 3) says §44 changes only focus, and a production `value = ''` written to satisfy a test library is a behavior change without a section, which invariant 1 calls a bug; no D-n allows it. Option (a) is allowed without the lead: it changes no spec text, no criterion, no assertion, no mock; it adds one setup line that makes the DOM the user-event model of a real browser (where reset also leaves the user's next keystroke on an empty value). invariant 2 and testing.md forbid loosening, not correcting a setup line; src/CLAUDE.md and the plan list the file (plan.md:16), so no Files change. It must be a test-writer step, never code-writer's, in its own `test(todos): B9.1 ...` commit placed before the `feat(todos)` commit (check-feat-commits.sh rejects a feat commit that touches a test), with a `scripts/verify-red.sh B9.1` re-proof that the tests are still red on the skeleton: they are, because the AC-44.4 focus assertion at line 146 and AC-44.1's activeElement assertion fail without the focus() call. The commit body says "Red because ... ; adds a user-event value reset, no assertion changed".
Next action: dispatch test-writer for one commit editing src/components/todo-form-focus.test.tsx: in AC-44.4 insert `newTodoBox().value = '';` (with the comment "user-event keeps the typed text as its own value; React's form reset bypasses the value setter, a real browser has no such state") after the Tab assertions at line 151, before `await user.click(newTodoBox());` (line 153); in AC-44.5 insert the same line after `await settled();` (line 179), before `await user.keyboard('Walk');`. Re-run verify-red B9.1, then code-writer's uncommitted todo-form.tsx goes green in `feat(todos)`. [unverified: I did not run the edited tests]
Must not: use `user.clear(newTodoBox())` in AC-44.5 (it calls focus itself, so the test would pass without the component focusing: that drops the REQ-44.1 proof and is a loosened assertion); drop or change `toHaveValue('Walk')` or `submittedTitle(1)`; type with `user.type` (it clicks the box, same masking); write `box.current.value = ''` in todo-form.tsx; touch the test inside the `feat` commit; rely on `fireEvent.change` without proving it (dom-testing-library may route through the prototype setter and skip user-event's interceptor).
Doc drift: none (spec text unchanged; the plan's Test strategy may note the setup line in the test commit body).
Escalate: none
