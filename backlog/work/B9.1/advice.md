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
