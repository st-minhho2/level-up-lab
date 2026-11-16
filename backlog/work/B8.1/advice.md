# B8.1 advice: opening the title editor selects the whole title (§41)

Reference: `src/components/todo-item.tsx` (the only `src/` file §41 changes; Function contracts block, `39-edit-title-select.md:55`).
Reads no `prisma/`, `src/lib`, `src/actions` change: §41 adds none (`39-edit-title-select.md:55-58`).

## Approaches

### A (recommended): `useRef` + `useEffect` keyed on `editing`

- Change: `const fieldRef = useRef<HTMLInputElement>(null)`; `ref={fieldRef}` on the title `<input>`;
  `useEffect(() => { if (editing) { fieldRef.current?.focus(); fieldRef.current?.select(); } }, [editing])`.
  `onEdit` already calls `setDraft(todo.title)` and `setEditing(true)` in one batch, so the field mounts holding the
  stored title (REQ-41.2: never an earlier draft) before the effect selects it.
- Pros: the dependency list is the spec's rule ("only on the switch", REQ-41.4); `editing` flips only in `onEdit`
  (true) and Escape/save success (false), so a new `todo` prop, `pending`, `error`, a keystroke or a click never
  re-runs it (REQ-41.3). The effect on exit does nothing (`if (editing)`), so no focus on leaving (Out of scope).
  Initial mount with `editing === false` does nothing (AC-41.1 `document.body`). `select()` gives 0..`value.length`
  in UTF-16 units (AC-41.2). React dev Strict Mode double effect runs twice at the switch, before any typing: harmless (analysis Q4).
- Cons: a post-paint effect, so one frame shows the field unfocused; effect plus ref to read.
- Fits rules: client component stays `'use client'`, no `any`, no new export, no dependency, no Server Action change; ts-style OK.

### B: stable callback ref (`useCallback((el) => { el?.focus(); el?.select(); }, [])`)

- Change: pass the memoized callback as `ref` of the title `<input>`; runs when the node mounts.
- Pros: no effect, runs synchronously at commit (no unfocused frame); mount of the field equals the switch.
- Cons: correct only while the callback identity is stable; an inline arrow, or a later dependency added to
  `useCallback`, re-fires on every render and breaks REQ-41.3/AC-41.4 silently. React 19 cleanup-return semantics and
  Strict Mode ref double-invoke are subtler to reason about. Intent less readable than the `[editing]` list.
- Dropped by both: `autoFocus` alone (cannot select; React-managed focus on mount only), `useLayoutEffect` (not needed).
- Fits rules: same as A.

## Recommendation

A. The effect's dependency array states the spec's single trigger and the failure mode of a mistaken change is loud (tests AC-41.4/41.5), unlike B's identity trap.

## Impact

| File                                       | Add/Change | Signature                                                                                                                            | ACs                |
| ------------------------------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------ |
| `src/components/todo-item.tsx`             | Change     | `export function TodoItem({ todo }: { readonly todo: Todo }): ReactNode` (unchanged); add ref + effect; import `useEffect`, `useRef` | AC-41.1 to AC-41.6 |
| `src/components/todo-item-select.test.tsx` | Add (test) | component tests, `vi.mock('@/actions/todos')` with `vi.hoisted` (analysis Q1)                                                        | AC-41.1 to AC-41.5 |
| `e2e/41-edit-title-select.spec.ts`         | Add (test) | Playwright, `page.evaluate` of activeElement/selection                                                                               | AC-41.6            |
| `spec/features-map.md` (F39)               | Change     | `docs(map)` row after `feat`                                                                                                         | none               |

Client component `todo-item.tsx`, server-rendered markup and hydration, today versus after, for both approaches:

- Server markup: the row renders `editing === false`, so the HTML has the label and the "Edit title" button and no
  title `<input>`; identical today and after (neither approach renders anything new in view mode).
- Submit with JavaScript off: no `<form>` exists in view mode and the "Edit title" button is `type="button"` with only
  `onClick`; it does nothing today and after. No behavior dropped.
- Submit before hydration: same; the click is inert until hydrated, then `onEdit` runs. After hydration the click
  yields the focused, selected field (A: after effect; B: at commit). No behavior dropped.

## Risks

- Migration: none. Dependency: none. Security and isolation: none (no action, query, env).
- Gate: the spec's `- [ ] Lead approves spec` (`39-edit-title-select.md:5`) is unticked; `spec/CLAUDE.md` requires
  the tick before any test is written. The plan gate may tick it in the same reply ("approve" = spec + plan, D-7).
- Existing tests that could turn red: `todo-item*.test.tsx` that `user.type` into the field. user-event's `type`
  clicks the field first, which moves the caret to the end, so results should not change (analysis note,
  [unverified]); the red commit's run and the green `pnpm test` decide. Any test that asserts `document.activeElement`
  is `body` after clicking "Edit title": none known (analysis).
- Performance: one `select()` per entry into edit mode.
- A future edit adding `todo.title`, `error` or `pending` to the effect deps re-selects mid-typing; AC-41.4/41.5 guard it.
- `src/components` is outside mutation scope (`src/lib` + `src/actions`), so mutation is not the safeguard; tests are.
- Features map: `docs(map)` commit is required (`spec/CLAUDE.md` table); `check-features-map.sh` resolves paths named.

## Test strategy

| Layer     | File                                       | ACs                             | Mocks                                                                                                                                 |
| --------- | ------------------------------------------ | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| component | `src/components/todo-item-select.test.tsx` | AC-41.1, 41.2, 41.3, 41.4, 41.5 | `vi.mock('@/actions/todos')` (`vi.hoisted`: toggleTodoAction, updateTodoTitleAction); `user.click`, `setSelectionRange` before events |
| e2e       | `e2e/41-edit-title-select.spec.ts`         | AC-41.6                         | none (real DB; count POSTs via `page.on('request')`)                                                                                  |

Titles begin `AC-41.n:`; tests land red alone in `test(todos): B8.1 … (red)`; red must fail on assertion or
`NotImplementedError`, so the skeleton commit changes nothing observable (the feature absent is already red: activeElement stays body).

## Mutation hot spots

Not scored (component). Still the lines a flawed change would survive in: the `if (editing)` guard (removal focuses on exit,
AC-41.4/AC-41.3a), the `[editing]` dependency (widening re-selects, AC-41.4/41.5), `select()` replaced by `focus()` only
(AC-41.1), `setDraft(todo.title)` in `onEdit` (AC-41.3).

## Questions settled / escalated

```
Question:    Which source governs the file names of the new tests (analysis Q1)?
Class:       P2 spec silent
Sources:     spec/contracts/39-edit-title-select.md:60 "AC-41.1 to AC-41.5 are component tests with Testing Library; AC-41.6 is a Playwright test"
Conflict:    none
Verdict:     Spec names layers, not paths; testing.md says one e2e file per section and component tests as src/**/<name>.test.tsx. The proposed paths in analysis.md are consistent; the card's Test: line must carry them.
Next action: Use todo-item-select.test.tsx and e2e/41-edit-title-select.spec.ts; plan lists them.
Must not:    Add the new tests to todo-item.test.tsx (rule: never weaken; additive red commit).
Doc drift:   none (card Test: line and features map F39 name the paths)
Escalate:    none
```

```
Question:    May the effect/ref mechanism be chosen by the code-writer (Strict Mode, A vs B)?
Class:       P2 spec silent
Sources:     spec/contracts/39-edit-title-select.md:52 "after the title <input> is in the document it receives focus and select(), once for that switch"
Conflict:    none
Verdict:     The spec pins behavior and the single trigger, not the mechanism; A and B both comply. Recommended A.
Next action: Plan names A; re-approve if B is chosen.
Must not:    Use an inline callback ref or an effect depending on todo, error, pending or draft.
Doc drift:   none
Escalate:    none
```

```
Question:    Is the unticked "Lead approves spec" box a blocker for the red commit?
Class:       P0 no conflict (a gate)
Sources:     spec/CLAUDE.md "The box is ticked by a human (the card's lead) before any test is written"
Conflict:    none
Verdict:     The gate is satisfied by the lead's "approve" on plan.md (D-7) or a prior tick; not by an agent.
Next action: dev-lead stops at the plan approval line before the test commit.
Must not:    Tick the box or start tests before approval.
Doc drift:   none
Escalate:    none
```
