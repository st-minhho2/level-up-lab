# B7.5 advice (§39, `spec/contracts/37-title-counter-warning.md`)

Class P0 overall: the spec is complete, D-37 is settled, no rule is bent. Reference implementation: B3.2 (§18) in the
same two files, plus §29 (Escape) in `todo-form.tsx`.

## Approaches

**A (recommended): predicate in `title-count.ts`, conditional `<p>` driven by the existing `draft`.**

- Change: `src/lib/title-count.ts` adds `export const TITLE_WARNING_THRESHOLD = 180;` and
  `isTitleNearLimit(value) { return titleCharacterCount(value) >= TITLE_WARNING_THRESHOLD; }`.
  `todo-form.tsx` renders `{isTitleNearLimit(draft) && <p id="new-todo-warning" className="text-sm text-amber-700
dark:text-amber-400">Almost at the character limit</p>}` between the counter `<p>` and the §5 error `<p>`.
- Pros: one draft (REQ-39.4 "no second copy"); the four draft writers and the layout effect (§18 REQ-18.6/18.7, §29)
  already cover change, save end, reset and Escape, so no new event handling; the threshold exists once (REQ-39.7);
  absent, not hidden, in the server HTML (REQ-39.2); `aria-describedby` untouched (REQ-39.5); only the two files the
  contract allows change.
- Cons: the warning renders in the same commit as the counter; nothing to mitigate. Drops no behavior.
- Fits rules: invariants 1 and 2 (spec-first, red first via a stub `isTitleNearLimit` throwing `NotImplementedError`),
  `ts-style.md` (constant named, no literal 180 in the component, explicit return type), `src/lib/CLAUDE.md` (pure, no
  `server-only`, importable by the client form).

**B (alternative): a second state flag or a ref read (`nearLimit` state, or `box.current.value.length`) in the
component, or a CSS-hidden element toggled by class.**

- Change: the component keeps its own boolean or hides the element.
- Pros: none that A lacks.
- Cons: a second copy of the value breaks REQ-39.4; a `hidden`/`display: none` element breaks REQ-39.2; a ref read
  during render breaks on the server render and misses the reset (the layout effect re-reads the box and calls
  `setDraft`, which is the only reliable trigger); a new component file changes a file the contract says stays unchanged.
- Fits rules: no; rejected.

## Recommendation

Approach A. It is what the contract's Function contracts block spells out line for line.

## Impact

| File                                            | Add/Change                  | Signature                                                                                                                                                                           | ACs                         |
| ----------------------------------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| `src/lib/title-count.ts`                        | Change                      | `export const TITLE_WARNING_THRESHOLD = 180;` `isTitleNearLimit(value: string): boolean`                                                                                            | AC-39.1                     |
| `src/components/todo-form.tsx`                  | Change                      | `TodoForm(): ReactNode` unchanged; imports `isTitleNearLimit`; one conditional `<p>`                                                                                                | AC-39.2 to AC-39.6, AC-39.7 |
| `src/lib/title-count.test.ts`                   | Change (test commit)        | AC-39.1 added                                                                                                                                                                       | AC-39.1                     |
| `src/components/todo-form.test.tsx`             | Change (test commit)        | AC-39.2 to AC-39.6 added (`vi.hoisted` mock object: add a key only)                                                                                                                 | AC-39.2 to AC-39.6          |
| `e2e/37-title-counter-warning.spec.ts`          | Add (test commit)           | one test, AC-39.7 (name follows the `NN-` numbering; the lead may prefer the §-based `39-`; existing files use the section's contract number, e.g. `18-` for §18 and `37-` is free) | AC-39.7                     |
| `spec/features-map.md`                          | Change (`docs(map)`)        | new F37 row, §39, both source files, three test files, status                                                                                                                       | n/a                         |
| `src/lib/CLAUDE.md`, `src/components/CLAUDE.md` | Change (`docs(map)` commit) | `title-count.ts` row gains `TITLE_WARNING_THRESHOLD`, `isTitleNearLimit`; `todo-form.tsx` line mentions the warning                                                                 | n/a                         |

Client component `todo-form.tsx`, one line per approach (markup, submit with JavaScript off, submit before hydration):

- A, server-rendered markup: `draft` is `''` on the server, so the form renders as today, with no `#new-todo-warning`.
  JS off: native POST through the form's server action; the response is rendered with `draft = ''`, so the warning is
  absent, as the counter reads `0 / 200` today; after = same. Before hydration: same native POST, same result; text
  typed before hydration is submitted and the page re-renders from the server with no warning; after = same. After
  hydration the `onSubmit` seed (`setDraft` from the submitted form) shows the warning for a 180+ title only while the
  save is pending or after a `form` failure, which is REQ-39.4 and AC-39.4.
- B, server-rendered markup: a ref read gives the same server HTML (absent) but a hidden element would be in it
  (breaks REQ-39.2); submit behavior same as A for JS off and before hydration; con: loses the reset follow-up (see
  Approaches).

## Risks

- Migration: no. Security: none (no action, schema or input path). Performance: one comparison per render.
- Isolation: no env, port or storage touched (invariant 5).
- Existing tests that run at 180+ characters: `todo-form.test.tsx` AC-18.4 (201 `x`, 1 `title` alert) and AC-29.1 (201
  `x` script-set); `e2e/18-title-counter.spec.ts` AC-18.7 (195, 200). All stay green only if the warning has no role,
  no `aria-live` and no counter-shaped text; the plan must keep `Almost at the character limit` exactly. A test that counts
  `p` elements in the form, if one exists, would turn red [unverified: not grepped for every `getAllByRole`/`querySelectorAll`].
- Card test title (AC-39.1 in `E7-todos-hints.md`) lists fewer values than the spec's nine; the test title must start
  with `AC-39.1:` and the body must cover all nine values and `TITLE_WARNING_THRESHOLD < TITLE_MAX_LENGTH`.
- `spec/features-map.md` has no F37 row yet and `spec/technical-requirements.md:46` shows §39 as `✗`: the map row
  moves with `feat` (code-writer `docs(map)`); the `✗` flips only in the card's Closing lane.
- Tailwind contrast of `text-amber-700`/`dark:text-amber-400` is not checked [unverified]; the class string is pinned by
  the spec.
- No new dependency.

## Test strategy

| Layer     | File                                   | ACs                             | Mocks                                                                                                         |
| --------- | -------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Unit      | `src/lib/title-count.test.ts`          | AC-39.1                         | `vi.mock('@/lib/prisma')` only if the module graph loads the real lib (imports `todo-schema`); none otherwise |
| Component | `src/components/todo-form.test.tsx`    | AC-39.2, 39.3, 39.4, 39.5, 39.6 | `@/actions/todos` via the existing `vi.hoisted` object (add keys, never remove)                               |
| E2E       | `e2e/37-title-counter-warning.spec.ts` | AC-39.7                         | none; compose PostgreSQL, `PrismaClient.deleteMany` in `beforeEach`, `openHydrated` as in the §18 file        |

Red step: a skeleton commit adds the constant and a stub `isTitleNearLimit` that throws `NotImplementedError`; the
component tests fail on the missing warning element (assertion), not on an import.
Script-set values (AC-39.3's 201 and AC-39.5's 190) are set through the DOM without an input event: the layout effect
re-reads the box after each commit, so the test must trigger a re-render (as AC-18.4/29.1 do) before asserting.

## Mutation hot spots

- `>=` versus `>` at 180 (the 179/180 pair in AC-39.1), and `trim()` inclusion (5 spaces + 175 versus 1 space + 180 + 1
  space).
- The 201-character case (guards against a `=== 180` or `<= 200` mutant) and the 90 emoji case (UTF-16 count).
- The `&&` in the component (a mutant to always render or never render), the class string and the text literal.

## Questions settled / escalated

```
Question:    Is the 180 threshold and the warning markup specified, or do they need a ruling?
Class:       P0 no conflict
Sources:     spec/contracts/37-title-counter-warning.md:24 "the constant `TITLE_WARNING_THRESHOLD` equal to 180 and the predicate `isTitleNearLimit(value)`"
Conflict:    none
Verdict:     The spec (rank 3) pins the text, class, id, placement and threshold; the analysis open questions 1 to 3 are answered there.
Next action: dev-lead writes plan.md with approach A.
Must not:    Hard-code 180 in the component or add a second copy of the draft.
Doc drift:   spec/features-map.md F37 row in the feat `docs(map)` commit; technical-requirements.md status flips in the Closing lane.
Escalate:    none
```

```
Question:    Do §18 and §29 lines conflict with a warning inside the form?
Class:       P4 two sections collide (resolved in the spec)
Sources:     spec/contracts/37-title-counter-warning.md:36 "§29 REQ-29.7 limits §29's own change (Escape in the box) and does not apply to §39"
Conflict:    §18 Out of scope lists "a warning colour, a threshold"; §29 REQ-29.7 and "markup unchanged" / §39 adds an element
Verdict:     D-37 and §39's "Edits to other sections" govern (rank 2 and 3): only the named lines are lifted; REQ-18.1, REQ-18.8, AC-18.7 hold.
Next action: no spec edit needed; the `docs(spec)` commit already landed (#314 lineage).
Must not:    Edit §18 or §29 in this card.
Doc drift:   none
Escalate:    none
```
