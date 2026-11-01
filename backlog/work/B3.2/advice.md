# B3.2 advice: character counter on the new-todo box (§18)

Mode: advice, `advisor`. Read: card B3.2, `spec/contracts/16-title-counter.md`, `analysis.md`, rules, `src/lib/todo-schema.ts`,
`src/components/todo-form.tsx` and its test, D-21, react-dom 19.1.0 source (commit-phase order). Nothing was run
[unverified]: the reset analysis below comes from reading `node_modules/react-dom/cjs/react-dom-client.development.js`.

## Approaches

Common to both: `src/lib/title-count.ts` (pure, no `server-only`, imports `TITLE_MAX_LENGTH` from `@/lib/todo-schema`,
which imports only `zod`, so a client component may import it); `titleCharacterCount = value.trim().length`;
`titleCounterText = \`${titleCharacterCount(value)} / ${TITLE_MAX_LENGTH}\``. UI only in `todo-form.tsx`: `<p
id="new-todo-count">`after the`<div className="flex gap-2">`row, inside the`<form>`; `aria-describedby`is`'new-todo-error new-todo-count'`while the error shows, else`'new-todo-count'`.

Fact that decides the reset question (react-dom 19.1.0, lines 13370, 13422, 13578): when the action's transition
commits, the form fiber carries a FormReset flag; `commitMutationEffectsOnFiber` for the HostRoot calls
`recursivelyResetForms`, which calls `form.reset()`, at the END of the mutation phase. `form.reset()` fires a `reset`
event first and restores values after the handlers return. Layout effects run after the mutation phase, in the same
commit. So an `onReset` handler sees the OLD box value; a layout effect sees the NEW one. The `defaultValue` prop
(`kept`) is already updated by `commitHostUpdate` before the reset, which is why today's keep-the-draft code works.

### A (recommended): read the box in `onChange` and in a layout effect after every commit

- Change: add `useRef<HTMLInputElement>(null)` on the box. Keep the single `draft` state as the one copy, and make it
  follow the box: `onChange` sets it from `event.target.value` (as today); `useLayoutEffect(() => { setDraft(ref.current?.value ?? ''); })`
  with no dependency array re-reads the box after every commit, so after the reset commit `draft` is the post-reset value
  (`''` after success and after a `title` error, the kept title after a `form` failure). The counter renders
  `titleCounterText(draft)`. `setDraft` with an equal string bails out, so there is no loop. Initial state `''` makes
  the server HTML read `0 / 200` (REQ-18.3). `onSubmit` seeding stays (script-set text reaches `draft` at submit).
- Pros: matches the contract sentence "derived from the box itself, read after every input event and after every form
  reset"; one state copy that the reset also resets (the defect REQ-18.6/18.7 exclude is avoided); no timer; the same
  mechanism covers success, `title` error, `form` failure and text typed while pending; testable in jsdom with the
  existing `createTodoAction` mock (jsdom's `form.reset()` is real, as AC-5.2's existing "box is empty" assertion shows).
- Cons: an effect that sets state (a lint rule against set-state-in-effect, if the installed eslint plugin has it, would
  need a reasoned disable comment; `grep` found no such rule configured, but run `pnpm lint` first); relies on
  TodoForm re-rendering in the reset commit (it does: `pending` and `state` come from the same transition) so the
  layout effect runs; this is the one assumption the red/green AC-18.4 to AC-18.6 tests prove.
- Fits rules: ts-style (client component only for state/events), invariant 3 (no mutation path touched), D-21 (one UI file).

### B (alternative): `onReset` computes the post-reset value from `kept`

- Change: no ref, no effect. `onReset={() => { setDraft(kept); }}` where `kept` is the new render's `defaultValue`
  (the handler prop is already the new one when the reset fires, because `commitHostUpdate` runs first).
- Pros: pure React, no effect, smallest diff.
- Cons: the counter is derived from the `defaultValue` prop, not read from the box, which is the "copy of the value
  kept in state" shape the Function contracts paragraph warns against; it silently breaks if anyone changes `kept`
  without the handler; sets state from inside the commit phase; a `reset` event can be cancelled by a script, then box
  and counter diverge. If a spike shows A's layout effect does not run in the reset commit, switch to B (or to
  `onReset` + `queueMicrotask` read of the box, which sets state outside `act` and is worse); this is a code-writer
  choice inside the same two files, no plan change.
- Dropped by B: reading the real box value after reset (REQ-18.6's wording "the value the box holds after the reset").
  Dropped by A: nothing.

Rejected: `key` on the input (remounts, drops focus and text typed while pending); native `input`/`reset` listeners
writing `textContent` (fights React's text node, and the server-rendered text must stay React-owned); counting `raw`
value (contradicts REQ-18.2 and §5).

## Recommendation

Approach A. Counter state is the existing `draft`, re-read from the box through a ref after each `onChange` and each
commit. One plan approval; no second phase (D-21).

## Impact

| File                                | Add/Change | Signature                                                                                                               | ACs                                |
| ----------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| `src/lib/title-count.ts`            | Add        | `export function titleCharacterCount(value: string): number`; `export function titleCounterText(value: string): string` | AC-18.1, AC-18.2                   |
| `src/lib/title-count.test.ts`       | Add (red)  | n/a, `// §18`; `NotImplementedError` skeleton first so red is on behavior                                               | AC-18.1, AC-18.2                   |
| `src/components/todo-form.tsx`      | Change     | `TodoForm(): ReactNode` unchanged; adds ref, `useLayoutEffect`, `<p id="new-todo-count">`, `aria-describedby`           | AC-18.3 to AC-18.6                 |
| `src/components/todo-form.test.tsx` | Change     | add 4 `it('AC-18.n: …')`; `vi.hoisted` keys unchanged (no new key needed); no existing test edited                      | AC-18.3, AC-18.4, AC-18.5, AC-18.6 |
| `e2e/18-title-counter.spec.ts`      | Add        | one test, `beforeEach` resets rows like `e2e/05-todos.spec.ts`                                                          | AC-18.7                            |
| `spec/features-map.md`              | Change     | F16 row (`src/lib/title-count.ts`, `src/components/todo-form.tsx`), lead's `docs(map)` commit                           | n/a                                |
| `spec/technical-requirements.md`    | Change     | §18 row `✗` to `✅` at close; expect a trivial merge conflict with the §17/§19 rows of B3.1/B3.3                        | n/a                                |

Not listed, per D-21: `src/app/page.tsx`, `todo-due-date.tsx`, `todo-item.tsx`, `todos.ts`, `actions/todos.ts`,
`logger.ts`, any `src/*/CLAUDE.md` (the orchestrating docs PR adds the `title-count.ts` and `todo-form.tsx` rows).

Client component `src/components/todo-form.tsx`, markup per approach:

| State                          | Today                                                         | After A                                                                                               | After B                      |
| ------------------------------ | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------- |
| Server-rendered HTML           | form, row (input + button), no counter, no `aria-describedby` | same plus `<p id="new-todo-count">0 / 200</p>` after the row; box `aria-describedby="new-todo-count"` | same as A                    |
| Submit with JavaScript off     | native POST of `title`; server response re-renders            | unchanged: the counter has no `name`, is not submitted; the page re-renders with `0 / 200`            | same as A                    |
| Submit before hydration        | native POST via the action's progressive form                 | unchanged; counter reads `0 / 200` until first input event or reset (Out of scope, §18)               | same as A                    |
| After hydration, JavaScript on | `draft` follows `onChange`; reset lands on `kept`             | counter = `titleCounterText(draft)`, `draft` re-read from the box after each commit                   | counter from `kept` on reset |

Behavior dropped: none by A. B drops the read-from-the-box property (listed as a con above).

## Risks

- Migration: none. Dependencies: none (React 19.1.0, no new package).
- Security: counter is not a control, never submitted (REQ-18.9); no new input path; client-importable lib has no
  `server-only` and no Prisma.
- Performance: one extra render per input event at most; the layout effect re-renders only when the box value
  differs from `draft`.
- Isolation: none (no env, port or storage). The e2e file name `18-title-counter.spec.ts` avoids a collision with B3.1/B3.3.
- Spec text hazard: the spec's `'é'` in AC-18.1 is `e` + U+0301 (bytes `0x65 0x301`, checked), expected `2`; the
  test-writer must write `'é'` explicitly, since a precomposed `'é'` (U+00E9) counts `1` and would turn the test
  into a lie. `'İ'` is U+0130 (count `1`).
- Reset assumption (A): the layout effect must run in the commit that resets the box; proven only by AC-18.4 to AC-18.6
  going red then green, not by this read of react-dom [unverified by a run].
- Existing tests that could turn red: the five `todo-form.test.tsx` tests use role/name queries and `role="alert"`
  counts; the counter has no role, so they stay green. `findByText('Title is required')` unaffected. `e2e/05` and
  `e2e/10` use `listitem` and alert locators, not text of the whole form. A lint rule on set-state-in-effect is the one
  tooling risk (see A, Cons). If the existing `AC-10.5` "no change event wrote it" test fails after A, the layout
  effect is overwriting `draft` too early (before submit seeding); the effect must read the box, never a stale ref.
- Stryker mutates only `src/lib` and `src/actions`: the component is not mutation-tested, so AC-18.3 to AC-18.6 are the
  only guard of the reset logic; their asserts must use exact values (`'12 / 200'`, `'0 / 200'`), not only
  `titleCounterText(box.value)`.

## Test strategy

| Layer     | File                                | ACs                                                                                                                                                                                 | Mocks                                                                                                                                                                           |
| --------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| unit      | `src/lib/title-count.test.ts`       | AC-18.1, AC-18.2                                                                                                                                                                    | none for `titleCharacterCount`/`titleCounterText`; real `createTodoSchema` for the schema agreement rows (it imports only zod, so no `vi.mock('@/lib/prisma')`)                 |
| component | `src/components/todo-form.test.tsx` | AC-18.3 (typing, paste, form data), AC-18.4 (reset after success; script-set 201 + title error), AC-18.5 (form failure, description text, second submit), AC-18.6 (pending promise) | `actions` hoisted object, `createTodoAction` only (existing); no new key; `userEvent` for typing/paste/clear; script set via `textbox.value = …` (as the existing AC-10.5 test) |
| e2e       | `e2e/18-title-counter.spec.ts`      | AC-18.7                                                                                                                                                                             | none; real server and compose PostgreSQL                                                                                                                                        |

jsdom feasibility of the reset: yes. The existing AC-5.2 and AC-10.5 tests already depend on React's `form.reset()`
running in jsdom (box is `''` after success, keeps the draft after a failure), so AC-18.4 to AC-18.6 can observe the
counter after the same resets. Settling a pending promise: reuse the pattern of "keeps text typed while the save is
pending". Accessible description: `toHaveAccessibleDescription('Could not save, try again 8 / 200')` (jest-dom).
Script-set value must be done on the real `HTMLInputElement` (the existing test narrows with `instanceof`).

Red proof: skeleton `title-count.ts` throws `NotImplementedError` so AC-18.1/18.2 fail on behavior; AC-18.3 fails on the
missing counter, AC-18.4 to AC-18.6 on the missing `new-todo-count`, never on an import. `scripts/verify-red.sh B3.2`.

## Mutation hot spots

`src/lib/title-count.ts` (target >= 70 %, aim 100 %; two functions):

| Mutant                                                                  | Killed by                                                            |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------- |
| drop `.trim()`                                                          | `'   '` -> 0, `'  a b  '` -> 3                                       |
| `trim` -> `trimStart` or `trimEnd`                                      | `'  a b  '` (3) and 5 spaces + `'x'` x200 + 5 spaces (200)           |
| `.length` -> code points (`[...v].length`) or grapheme count            | `'😀'` -> 2                                                          |
| `normalize('NFC')` or `toLowerCase()` added                             | `'é'` -> 2, `'İ'` -> 1                                               |
| clamp `Math.min(n, 200)`, `Math.max(n, 1)`                              | `'x'` x201 -> 201 (count and text `201 / 200`), `''` -> 0            |
| `trim` removing less than `String.prototype.trim` (regex of spaces)     | `'\t\n a  '` -> 1 (keep plain `trim()` in the implementation)        |
| text separator `' / '` or `TITLE_MAX_LENGTH` replaced / literal swapped | exact strings `'0 / 200'`, `'8 / 200'`, `'200 / 200'`, `'201 / 200'` |
| count/limit order swapped in the template                               | same exact strings                                                   |

Equivalent-mutant risk: none expected; no branches. Keep both functions branch-free so there is nothing to survive.

## Questions settled / escalated

```
Question:    Which reset mechanism for REQ-18.6/18.7, and is it testable in jsdom with the existing mocks?
Class:       P2 spec silent
Sources:     spec/contracts/16-title-counter.md:55 "The counter text is derived from the box itself, read after every input event and after every"
             backlog/work/B3.2/analysis.md:57 "A layout effect, an `onReset` handler (the event fires before values"
             src/components/todo-form.tsx:11 "React resets the form after the action; the reset lands on defaultValue, so it must already hold the draft"
Conflict:    none (the spec fixes the oracle, AC-18.4 to AC-18.6, and leaves the mechanism to the code-writer)
Verdict:     The contract forbids a state copy the reset does not also reset and requires reading the box after a
             reset; analysis.md Q5 leaves the mechanism open. A satisfies both; `onReset` alone reads the old value.
             Testable in jsdom with the existing `createTodoAction` mock only. Authority 3 (spec) governs; code is evidence.
Next action: dev-lead lists approach A in plan.md Files and Interfaces.
Must not:    Read the box inside `onReset` (old value), or keep `draft` as a copy that only `onChange` writes.
Doc drift:   none
Escalate:    none
```

```
Question:    Trimmed or raw count while the box is full of padding (analysis.md open question 1)?
Class:       P0 no conflict
Sources:     spec/contracts/16-title-counter.md:18 "compute `<used>` as the length of the box's current value after removing the leading and trailing whitespace"
Conflict:    none
Verdict:     REQ-18.2 and AC-18.1/18.2 already state the trimmed count; the lead's ticking of the approval box ratifies it.
Next action: implement `value.trim().length`.
Must not:    Count the raw value so the counter matches `maxlength`.
Doc drift:   none
Escalate:    none
```

```
Question:    May the plan list `spec/features-map.md` and `spec/technical-requirements.md` under D-21?
Class:       P0 no conflict
Sources:     backlog/00-decisions.md:47 "Card plans leave out the package guides (`src/*/CLAUDE.md`), so `next-task.sh --check` stays clean"
             backlog/work/B3.2/analysis.md:63 "The lead adds F16 to `spec/features-map.md`"
Conflict:    none
Verdict:     D-21 excludes the package guides, not the map or the index. The map row is the lead's `docs(map)` commit and the
             index flip happens at close; both may be named in the plan, with the merge-conflict note.
Next action: list both under Files with owner "lead".
Must not:    Add a `src/lib/CLAUDE.md` or `src/components/CLAUDE.md` row from this card.
Doc drift:   spec/features-map.md F16 (docs(map) commit); spec/technical-requirements.md §18 `✗` to `✅` (closing commit)
Escalate:    none
```
