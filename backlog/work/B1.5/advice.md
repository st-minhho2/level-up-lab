# B1.5 advice

Read first: `analysis.md` Q1 proposes keeping the typed title after a `form` failure only (option B there). §10 as amended
already carries that wording (REQ-10.6, AC-10.5, the `todo-form.tsx` sentence of Function contracts), so this file does not
re-open it; it chooses the mechanism. The spec box for this amendment (`spec/contracts/08-mutation-feedback.md`, second
`Lead approves spec` line) is unticked and stays so until the plan gate (D-7). Facts quoted below were read in this
worktree; probe results come from throwaway files under the session scratchpad (a copy of the real `todo-form.tsx` and
`todo-form.test.tsx` run with the repo's own `vitest`, `react-dom` 19.1.0 and jsdom 30), never from the repo.

## Approaches

### Action layer (settled by §10's Function contracts; one shape)

`src/actions/todos.ts`, `createTodoAction` only. Zod parse stays outside the `try`; the lib call, `revalidatePath` and the
success return go inside; the catch has no `instanceof` arm (`createTodo` never throws `TodoNotFoundError`) and no binding
(the cause is not logged, D-11):

```ts
const rawTitle = formData.get('title');
const parsed = createTodoSchema.safeParse({ title: typeof rawTitle === 'string' ? rawTitle : '' });
if (!parsed.success) {
  return { ok: false, fieldErrors: fieldErrorsOf(parsed.error) };
}
try {
  const todo = await createTodo(parsed.data.title);
  revalidatePath('/');
  return { ok: true, data: todo };
} catch {
  // §10 / D-11: the form shows the message and nothing is revalidated; the cause is not logged until a logger card lands.
  return failure('form', MUTATION_FAILED_MESSAGE);
}
```

Nothing else in the file changes except the module header comment (`§10: a failed toggle, edit or clear …` gains
"create"), which is a comment, not behavior. `failure`, `MUTATION_FAILED_MESSAGE` and `fieldErrorsOf` are already
imported; `ActionResult` is unchanged. `catch {` (no binding) is the shape `clearCompletedTodosAction` already uses and
satisfies `noUnusedLocals`.

### A. Controlled input, draft in `useState`, wrapper around the action (recommended)

Change (`src/components/todo-form.tsx`, 42 → 55 lines in the probe): `const [draft, setDraft] = useState('')`; the input
gets `value={draft}` and `onChange={(event) => setDraft(event.target.value)}`; `useActionState` receives a typed async
wrapper instead of `createTodoAction` itself:

```tsx
const [state, formAction, pending] = useActionState(
  async (previous: ActionResult<Todo> | null, formData: FormData): Promise<ActionResult<Todo>> => {
    const result = await createTodoAction(previous, formData);
    if (result.ok || result.fieldErrors.form === undefined) setDraft('');
    return result;
  },
  null,
);
const error = state !== null && !state.ok ? (state.fieldErrors.title?.[0] ?? state.fieldErrors.form?.[0]) : undefined;
```

Plus two `import type` lines (`ActionResult` from `@/lib/action-result`, `Todo` from `@/lib/todos`; `todo-item.tsx` already
imports `Todo` as a type, so no `server-only` problem) and `useState` in the React import. The wrapper never reads
`FormData`: the draft is already the typed text (every keystroke went through `onChange`), so a `form` failure simply
leaves it alone, and the only write is the clear.

- React 19 semantics: the form is reset by React after every `<form action>` finishes (probe, and analysis Q1: an
  uncontrolled box ends `''` on success, `title` error and `form` error alike). A controlled input is not at the mercy of
  that reset: the DOM value is always re-asserted from `draft`, and React keeps the `value` attribute in sync with the
  prop, so the reset restores exactly the draft. No dependence on whether the reset runs before or after a prop update.
- `useActionState` is kept (§7 still reads `TodoForm (useActionState(createTodoAction) …)`), `pending` still disables the
  button, and `createTodoAction` is still called as `(previousResult, formData)`, so the §5 test that reads
  `createTodoAction.mock.calls[0]?.[1]` as `FormData` is unchanged. `previous` is the real previous `ActionResult`
  because the wrapper's own state type is `ActionResult<Todo> | null` (no extra state shape).
- Cost: the wrapper is a closure recreated each render (React uses the latest one at dispatch time; no stale-closure bug
  because `setDraft` is stable), one extra state hook, a re-render per keystroke (a one-box form), `setDraft` runs after
  an `await` so it is outside the action's transition and lands as its own update just before the action state does
  (probed: no `act` warning, no flash that matters; the box clears one paint before the message disappears on success).
- AC-10.5 and §5 tests: probe against the real file and the real §5 tests, 4 of 4 green (AC-5.7, AC-5.3, AC-5.2 verbatim,
  and a draft AC-10.5). A rejected action promise (transport failure, out of scope) leaves the draft untouched, which is
  the kinder outcome.
- Fits rules: yes (`'use client'` for state and events, mutation still only through the action, no `any`, explicit return
  types; the wrapper's types are written out because `null` as initial state defeats inference).

### B. Uncontrolled input, `defaultValue` driven from state (B-1 wrapper returns the title, B-2 draft tracked `onChange`)

- B-1: the wrapper returns `{ result, title }` (a local `interface`), the input stays uncontrolled with
  `defaultValue={kept}` where `kept` is the title when `result` has a `form` error and `''` otherwise; the error is read
  from `state.result`. About +11 lines and the state type no longer equals `ActionResult`, so `previous` must be unwrapped
  (`prev?.result ?? null`).
- B-2: `useActionState(createTodoAction, null)` untouched; `const [draft, setDraft] = useState('')`; `onChange` writes
  it; `kept = state !== null && !state.ok && state.fieldErrors.form !== undefined ? draft : ''` feeds `defaultValue`.
  +4 lines (42 → 46 in the probe), the smallest diff, and the line `useActionState(createTodoAction, null)` stays literal.
- React 19 semantics: this relies on one ordering fact, that the `defaultValue` update (value attribute) is committed
  before React's post-action form reset in the same commit, so the reset lands on the new default. It held in React
  19.1.0 / jsdom 30 for every probe scenario (below), but it is an implementation detail, not a documented guarantee.
  B-2 also rewrites the attribute on each keystroke while the state is a failure (harmless: the dirty flag wins).
- Probe, standalone forms with a mock action, `fireEvent`: fail then success; fail, edit, fail again keeps the edited
  text; fail, clear the box, title error empties and leaves 1 alert; a title error on typed text empties (as today);
  pending disables then re-enables; fail, success, new text, fail keeps the new text. A and B-1 and B-2 all pass. With
  `userEvent` B-1 and B-2 fail only the last scenario (`onetwo` instead of `two`): `user-event` tracks the box value
  itself and does not see a native `form.reset()`, while A writes through React's setter and is unaffected. The product is
  fine (the DOM value was `''`); it means a future test that types again after a reset must use `fireEvent` or a
  `clear()` under B.
- Fits rules: yes. Not chosen because the correctness of the green path hangs on the commit-order detail above and a
  later reader must know it; A states "the box is the draft" in plain code.

### C. Rejected without a build

- Carry the submitted title in `ActionResult` (the action echoes it): forbidden, §10 says `ActionResult` is unchanged and
  the `createTodoAction` signature is fixed.
- `useEffect` copying `state` into `draft`: an extra render per result and an effect for something derivable; no gain over A.
- Drop `useActionState` for a `useState` + `startTransition` handler (the `TodoItem` style): contradicts §7's
  `useActionState(createTodoAction)` and loses form-action semantics for no reason.
- Keep the draft after every `ok: false` (analysis option C): changes §5 observable behavior, which §10 puts out of scope.

## Recommendation

Action layer as above, and A for `TodoForm`. Reasons: A makes the contract sentence in §10 ("after a result with a `form`
error the text box keeps the title the person typed, after ok:true it is empty") a direct property of one state variable;
it does not depend on reset ordering; it keeps `useActionState`, the call shape of `createTodoAction` and the single
`<p id="new-todo-error" role="alert">` untouched. B-2 is the fallback if the reviewer weighs the 9 extra lines above the
ordering caveat; either passes AC-10.5 and the §5 tests as probed, so the choice is the plan's, not a ruling. No
migration, no dependency, no new env value, no new file.

## Impact

| File                                        | Add / Change | Signature                                                                                                                                                     | ACs              |
| ------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| `src/actions/todos.ts`                      | Change       | `createTodoAction(previous: ActionResult<Todo> \| null, formData: FormData): Promise<ActionResult<Todo>>` unchanged; try/catch around lib call and revalidate | AC-10.4          |
| `src/components/todo-form.tsx`              | Change       | `TodoForm(): ReactNode` unchanged; `draft` state, controlled input, typed wrapper in `useActionState`, error reads `title ?? form`                            | AC-10.5          |
| `src/actions/CLAUDE.md`                     | Change       | sentence "`createTodoAction` still lets a lib error reach the error boundary until B1.5" removed; create joins the list of actions that never reject          | docs             |
| `src/components/CLAUDE.md`                  | none         | already says `role="alert"` for inline errors and names "New todo" and "Add"; still true                                                                      | -                |
| `spec/features-map.md`                      | Change       | F8 row: add `src/components/todo-form.tsx` to Files and `src/components/todo-form.test.tsx` to Tests; receipt line at the closing commit                      | F8 (`docs(map)`) |
| `spec/technical-requirements.md`            | Change       | §10 ◐ → ✅ in the green commit (the card closes the section)                                                                                                  | -                |
| `src/lib/*`, `prisma/`, `e2e/`, `src/app/*` | none         | `createTodo`, schema, `ActionResult`, `failure` untouched; no e2e (see Test strategy)                                                                         | -                |

Existing tests that must not change (all stay green, probed where a component): `src/actions/todos.test.ts` AC-5.2,
AC-5.3 (both), the toggle/edit/clear AC-10.1 tests; `src/components/todo-form.test.tsx` AC-5.7, AC-5.3 ("shows the title
field error returned by the action"), AC-5.2 ("submits the typed title and clears the box on success"); `todo-item` and
`clear-completed-button` tests (files not touched); `e2e/05-todos.spec.ts` AC-5.6 (Playwright `fill` fires `input`, so the
controlled box sees the title and the success path clears it). Features map F8 is the only map row that changes
(F4 already lists `todo-form.tsx`, so `check-features-map.sh` passes before and after). Test files get new tests only:
`todos.test.ts` (one or two in `describe('createTodoAction')`) and `todo-form.test.tsx` (one in the existing describe);
the hoisted mock objects already hold `createTodoAction`, so no key is added.

## Risks

- Migration: none. Dependency: none. Security: input is still Zod-parsed before any lib call; the swallowed error is not
  returned (the message is the constant), so no internal detail leaks; nothing logged (D-11).
- Isolation, performance: none (no env value, port, storage or cache key; no query).
- Partial success reported as failure (accepted by §10): `revalidatePath` sits inside the `try`, so if it throws after
  `createTodo` stored the row, the person sees "Could not save, try again" and the box keeps the title; a retry stores a
  second row. D-5 allows duplicate titles, and §10's contract says exactly "any value thrown by createTodo or
  revalidatePath resolves to the `form` failure", so this is the specified behavior, not a defect; the plan should not
  "fix" it by moving `revalidatePath` out of the `try`.
- Control-flow throws: Next signals `redirect()`/`notFound()` by throwing; this action calls neither, so a blanket
  `catch {}` swallows nothing it should not. Any later `redirect()` in the action would need an arm (not now).
- Existing tests that could turn red: none expected. Component: A's controlled input is the only change to the box; the
  three §5 component tests were run against it. Action: the only changed branch is the previously unreachable catch.
- Red-commit trap (testing rule: fail on an assertion, never on an import): the AC-10.5 test goes red on the first
  assertion (`Unable to find role="alert"` against today's code, probed), which proves the message half. The
  "keeps `Buy milk`" assertion is never reached while the message is missing, so its bite was proved separately: a
  message-only `TodoForm` (error reads `form`, box uncontrolled) fails exactly on `toHaveValue('Buy milk')` with the
  box `''`. Keep both assertions in the one test, message first, value second.
- `user-event` and native reset (see B): AC-10.5 types once and clicks twice, which is safe under A and B alike; do not
  add a "type again after success" step.
- Real-browser coverage: jsdom reproduces React's form reset (analysis probe, this probe), but no e2e can make a real
  create fail without a fault-injection hook (a configuration change to ask about, same position as B1.4), so the
  Chromium behavior of A is inferred, not observed. `pnpm test:e2e` (AC-5.6) still exercises the controlled success path
  against Postgres and must stay green.
- Lint and typecheck of the new `todo-form.tsx` were not run (probe lived outside the repo): `[unverified]` for
  `pnpm lint` (no `any`, no unused value) and `pnpm typecheck` (wrapper annotations).

## Test strategy

| Layer     | File                                | ACs                          | Mocks                                                                                                                                   |
| --------- | ----------------------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| unit      | `src/actions/todos.test.ts`         | AC-10.4                      | existing: `@/lib/todos` (keep `importOriginal`), `next/cache`, `@/lib/prisma`; `lib.createTodo.mockRejectedValue(new Error('db down'))` |
| unit      | `src/actions/todos.test.ts`         | no AC (REQ-10.1 wording)     | same; `cache.revalidatePath.mockImplementation(() => { throw new Error('cache down') })` with `createTodo` resolving a todo             |
| component | `src/components/todo-form.test.tsx` | AC-10.5 (REQ-10.5, REQ-10.6) | existing hoisted `actions` object via `vi.mock('@/actions/todos', () => actions)`; `mockResolvedValueOnce` failure then success         |
| e2e       | none                                | -                            | -                                                                                                                                       |

AC-10.4, `describe('createTodoAction')`, title copied from the card's `Test:` line: `AC-10.4: resolves fieldErrors.form
["Could not save, try again"] when createTodo rejects and does not revalidate`. Arrange `createTodo` rejecting; Act the
first call `createTodoAction(null, form('Buy milk'))`, assert `await expect(...).resolves.toEqual({ ok: false,
fieldErrors: { form: ['Could not save, try again'] } })`, `createTodo` called once with `'Buy milk'`, `revalidatePath`
called 0 times; the second call with `form('   ')` asserts `toEqual({ ok: false, fieldErrors: { title: ['Title is
required'] } })` and `createTodo` still called once. Red because: today's action awaits `createTodo` with no `try`, the
promise rejects and `.resolves` fails on an assertion. The second half is green before and after (it pins "Zod outside
the try") and must stay in the same test. Use `toEqual` on the whole result (not `toMatchObject`) so an extra key dies.

Recommended second action test (a plan decision, not an AC): `revalidatePath` throws after `createTodo` resolves, the
result is the same `form` failure. Red against today's code (the throw escapes), and it is the only test that fails if a
later edit moves `revalidatePath` out of the `try`, a structural change Stryker does not generate. Title without an `AC-`
prefix (it has no criterion; the testing rule allows that), e.g. `resolves fieldErrors.form when revalidatePath throws
after the todo was created`.

AC-10.5, inside `describe('<TodoForm>')`: arrange `mockResolvedValueOnce({ ok: false, fieldErrors: { form: ['Could not
save, try again'] } })` then `mockResolvedValueOnce({ ok: true, data: { id: 't1', title: 'Buy milk', completed: false,
createdAt: new Date() } })`; type `Buy milk` in the box "New todo", click "Add"; the form is
`textbox.closest('form')`; `within(form).findAllByRole('alert')` has length 1 and exact text `Could not save, try again`
(`toHaveTextContent(/^Could not save, try again$/)`), the box `toHaveValue('Buy milk')`, the button `toBeEnabled()`;
click "Add" again; `await waitFor` the alert count is 0, then the box `toHaveValue('')`. The recovery step lives inside
the failure test (it is green on its own today; `verify-red.sh` judges the test as a whole). This exact test, written as
above, is what the probe ran: red on today's code, red on the message-only variant, green on A and on B-2.

## Mutation hot spots

Stryker mutates `src/lib/**` and `src/actions/**` (not components); current score 82.80 % (actions 88.0, lib 80.3, after
B1.4). Predicted from the mutant operators, `[unverified]` (not run; it writes into the worktree):

- `catch { return failure(...) }` block emptied (returns `undefined`): killed by AC-10.4's `.resolves.toEqual` on the
  whole object.
- `failure('form', MUTATION_FAILED_MESSAGE)` with `'form'` mutated to `''`: killed by the exact `fieldErrors` key in
  AC-10.4. The constant's own string literal is already pinned by the three AC-10.1 tests and now by AC-10.4 too.
- `try` body: `revalidatePath('/')` removed: killed by AC-5.2 (`toHaveBeenCalledTimes(1)`, unchanged).
- `if (!parsed.success)` replaced by `false`: the blank title would reach `createTodo`; killed by AC-10.4's second call
  (`createTodo` must stay at 1 call, result must be the `title` error) and by AC-5.3.
- `return { ok: true, data: todo }` mutants (`ok: false`, `data` dropped): killed by AC-5.2 (`toMatchObject`).
- Pre-existing survivor class that this card does not worsen: `typeof rawTitle === 'string' ? rawTitle : ''` (no test
  submits a form without a `title` field or with a `File`). A one-line hardening test in the review pass
  (`createTodoAction(null, new FormData())` resolves `{ title: ['Title is required'] }`, `createTodo` not called) would
  kill it; optional, not an AC.
- The new `catch` adds 2 to 3 mutants and all are killed, so the score cannot fall below 82.80 % from this card if the two
  action tests exist; the gate stays at 70 %.

## Questions settled / escalated

```
Question:    What is the exact shape of createTodoAction's try/catch, and does anything else in the action file change?
Class:       P0 no conflict
Sources:     spec/contracts/08-mutation-feedback.md:50 "and nothing is revalidated. createTodoAction parses with Zod first, outside the try (a title error keeps its"
             spec/contracts/08-mutation-feedback.md:51 "§5 `title` key and never reaches the lib), and has no TodoNotFoundError arm: any value thrown by createTodo or"
             backlog/00-decisions.md:21 "any error other than `TodoNotFoundError` becomes `{ ok: false, fieldErrors: { form: ['Could not save, try again'] } }` with no revalidation"
Conflict:    none (src/actions/todos.ts:23-30 is code that predates the amendment, not a source of behavior)
Verdict:     The spec governs: Zod `safeParse` and its `title` return stay above the `try`; `createTodo` and `revalidatePath` and the
             success return sit in one `try`; `catch {` returns `failure('form', MUTATION_FAILED_MESSAGE)`, no `instanceof`, no
             binding, no log. Only the header comment of the file gains "create"; no import, signature or other action changes.
Next action: dev-lead writes the Files line "src/actions/todos.ts: try/catch in createTodoAction (AC-10.4)" in plan.md.
Must not:    put `safeParse` inside the `try`, add a `TodoNotFoundError` arm, move `revalidatePath` out of the `try`, or log the cause.
Doc drift:   src/actions/CLAUDE.md (remove "createTodoAction still lets a lib error reach the error boundary until B1.5"), in the feat commit
Escalate:    none
```

```
Question:    Which mechanism keeps the typed title after a `form` failure only (REQ-10.6, AC-10.5)?
Class:       P2 spec silent
Sources:     spec/contracts/08-mutation-feedback.md:63 "after a result with a `form` error the text box keeps the title the person typed, after ok:true it is empty, and the"
             spec/contracts/08-mutation-feedback.md:69 "The content of the text box after a `title` error (§5)"
             spec/contracts/05-ui.md:8 "`TodoForm` (`useActionState(createTodoAction)`,"
Conflict:    none (the spec states the observable result and is silent on the mechanism; §7's parenthetical names the hook, which A keeps)
Verdict:     Approach A. §10 governs what the box shows; mechanism is a plan choice below the spec. A is the one whose correctness does
             not depend on React's reset-versus-attribute commit order, and it passes the real §5 tests and the draft AC-10.5. B-2 is the
             acceptable smaller alternative; the `title`-error behavior (box emptied) is identical in both and out of scope.
Next action: plan.md names A (or B-2) and pastes the `useActionState` wrapper signature under "Interfaces touched".
Must not:    change `ActionResult` or `createTodoAction`'s signature to carry the title, or keep the draft after a `title` error.
Doc drift:   none (spec/features-map.md F8 row gains todo-form.tsx and its test in the docs(map) commit)
Escalate:    none
```

```
Question:    Does option B (keep the draft after a `form` failure only) need a D-n?
Class:       P0 no conflict
Sources:     backlog/00-decisions.md:21 "The swallowed error is not logged until a logger card lands."
             backlog/00-decisions.md:15 "Todo titles: 1–200 characters after trimming, duplicates allowed."
             backlog/00-decisions.md:17 "the lead ticks the section's `Lead approves spec` box; the plan gate's "approve" reply may tick it in the same step."
Conflict:    none
Verdict:     No D-n. D-11 settles the message, the `form` key, no revalidation and no logging, and says nothing for or against the box
             content; D-5's limits are untouched (the box keeps `maxLength={200}` and the action still trims and validates); no existing
             section describes a failing create, so no behavior is rewritten; no invariant is bent (the mutation still goes only through the
             action, Zod at the boundary). The unsettled choice is a UI detail inside §10, which the lead accepts or amends by ticking the
             box under §10's heading at the plan gate (D-7). If the lead amends to "accept the reset" (analysis option A), A's wrapper
             and `draft` state are dropped and AC-10.5 loses its `Buy milk` assertion; nothing else here changes.
Next action: dev-lead puts "box keeps the typed title after a form failure (REQ-10.6)" in the plan so the one reply "approve" ticks it.
Must not:    ask for a D-n, or tick the box.
Doc drift:   none
Escalate:    none
```

```
Question:    A failing `revalidatePath` after a stored row reports a failure; is that acceptable?
Class:       P0 no conflict
Sources:     spec/contracts/08-mutation-feedback.md:51 "any value thrown by createTodo or"
             spec/contracts/08-mutation-feedback.md:52 "revalidatePath resolves to the `form` failure."
Conflict:    none
Verdict:     Yes, the spec says so in terms; D-5 allows a duplicate title if the person retries. Not a reason to restructure the `try`.
Next action: none beyond the second action test recommended under Test strategy.
Must not:    narrow the `try` to the lib call alone.
Doc drift:   none
Escalate:    none
```
