# B5.1 advice: show how many open todos are overdue (§23)

Reference implementations: `src/components/todo-due-date.tsx` (§17: `today` state, `todayOf`, no timer) and
`src/components/remaining-count.tsx` (§13/§22: the element beside the count paragraph).

## Approaches

**A (recommended). Self-contained client component mirroring §17's day read.**
`src/lib/overdue-count.ts` (pure) + `src/components/overdue-count.tsx` (`'use client'`, `useState<string | undefined>`
`today`, `useEffect(() => setToday((previous) => previous ?? todayOf(new Date())), [])`) + one line in `page.tsx`.

- Pros: exactly the contract's function block; REQ-23.5 holds (first render returns `undefined`); REQ-23.6 holds (the
  setter keeps the first day, no timer, `vi.getTimerCount()` 0); REQ-23.4 needs no code (every action already calls
  `revalidatePath('/')`, the RSC re-renders with new `todos` props, the `today` state survives); touches no §17 file.
- Cons: after midnight the row markers and the count can disagree until reload (analysis Q3, accepted, REQ-23.6).
- Rules: invariant 3 untouched (no mutation); `src/lib` pure with no Prisma, so the client may import it.

**B. Derive the day with `useSyncExternalStore` (server snapshot `undefined`), or share one clock context with §17.**

- Pros: B-store avoids one effect; a shared context would remove the row/count disagreement.
- Cons: a `getSnapshot` that recomputes `todayOf(new Date())` re-reads the day at midnight on any re-render, which
  breaks REQ-23.6 unless cached (then it is A with more code); a context changes `todo-due-date.tsx` and
  `todo-item.tsx`, whose contracts the spec says stay (§23 "keep their contracts") and D-30 forbids a second
  component in the batch. Dropped behavior: none, but it costs scope the spec excludes.
- Not recommended.

## Recommendation

A. Order inside `page.tsx`: `<RemainingCount … />` then `<OverdueCount todos={todos.map(({ completed, dueDate }) => ({ completed, dueDate }))} />`
from the same `todos` (no second `listTodos()`), before the `shown.length === 0` branch so it renders in both states.
Count from `todos`, never `shown` (REQ-23.3).

## Impact

| File                                    | Add/Change | Signature                                                                                                    | ACs                |
| --------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------ | ------------------ |
| `src/lib/overdue-count.ts`              | Add        | `countOverdue(todos, today): number`; `overdueLabel(count): string \| undefined` (uses `isOverdue` from §17) | AC-23.1, AC-23.2   |
| `src/components/overdue-count.tsx`      | Add        | `OverdueCount({ todos }): ReactNode`, `'use client'`, one `<span>`, no role/aria-label                       | AC-23.3 to AC-23.6 |
| `src/app/page.tsx`                      | Change     | one `<OverdueCount …/>` after `<RemainingCount/>`, header comment gains §23                                  | AC-23.7            |
| `spec/features-map.md`                  | Change     | F21 row (card names F21; absent today), in the `docs(map)` commit                                            | doc drift          |
| `src/lib/overdue-count.test.ts`         | Add (red)  | n/a                                                                                                          | AC-23.1, AC-23.2   |
| `src/components/overdue-count.test.tsx` | Add (red)  | n/a                                                                                                          | AC-23.3 to AC-23.6 |
| `e2e/23-overdue-count.spec.ts`          | Add (red)  | n/a (section-numbered, like `22-all-done.spec.ts`)                                                           | AC-23.7            |

Client component `overdue-count.tsx` (new, so "today" is none):

- Approach A, server-rendered markup: nothing (empty). JS off: nothing, forever. Submit before hydration: no count
  shown, mutations of other components behave as before; the count appears after hydration. After: the span.
- Approach B (store): same three states; a recomputing snapshot would also re-read the day, dropping REQ-23.6 (a con).

`page.tsx` is a Server Component, no client markup change beyond the empty render of the new component.

## Risks

- Migration: none. Dependency: none. Security: none (no input, only `completed` and `dueDate` cross to the client;
  no `createdAt`/`id`).
- Spec box `- [ ] Lead approves spec` in §23 is unticked; per `spec/CLAUDE.md` it is ticked by a human before any
  test is written (the plan gate's "approve" may tick it, D-7).
- Isolation: `check-spec-sections.sh` and `check-features-map.sh` need the F21 row and the two new paths.
- Existing tests that could turn red: `remaining-count.test.tsx` AC-22.2 (not touched), `e2e/22-all-done.spec.ts` and
  `e2e/17-overdue.spec.ts` if they match `Overdue` loosely (`N overdue` is lower case, distinct from `Overdue`;
  e2e uses `exact: true`, analysis Q1); `e2e/05-todos.spec.ts` AC-5.1 if it reads whole-page text.
- `act`-wrapped render needed so the effect has run in AC-23.3/23.4; AC-23.5 hydration test must spy
  `process.stderr.write`, not `console` (ts-style).
- Package guides (`src/lib/CLAUDE.md`, `src/components/CLAUDE.md`) stay out of this card (D-30 batch rule, analysis).

## Test strategy

| Layer | File                                    | ACs                       | Mocks                                                                                                               |
| ----- | --------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| unit  | `src/lib/overdue-count.test.ts`         | AC-23.1, AC-23.2          | none (pure); assert input list unchanged                                                                            |
| comp  | `src/components/overdue-count.test.tsx` | AC-23.3, 23.4, 23.5, 23.6 | none needed (no action imported); `vi.useFakeTimers` + `setSystemTime` local `new Date`; `process.stderr.write` spy |
| e2e   | `e2e/23-overdue-count.spec.ts`          | AC-23.7                   | none; seeds F..A relative to the browser's local day                                                                |

## Mutation hot spots

- `isOverdue` boundary: due today not counted, due yesterday counted (AC-23.1 has 2026-11-01 and 2026-10-31).
- `count === 0` branch in `overdueLabel` (AC-23.2 cases 0, 1, 2, 11), and the literal ` overdue`.
- `countOverdue` completed flag (done, past due, excluded) and `[]`.
- Component: `previous ?? todayOf(...)` (AC-23.6 third step), `today === undefined` guard (AC-23.5).

## Questions settled / escalated

```
Question:    Which count of todos does N use when a filter or search is active?
Class:       P0 no conflict
Sources:     spec/contracts/21-overdue-count.md:19 "THE SYSTEM SHALL still count every stored todo (§13 REQ-13.5)"
Conflict:    none
Verdict:     page.tsx passes the unfiltered `todos`, not `shown`; REQ-23.3 and the function contract agree.
Next action: map `todos`, not `shown`.
Must not:    count from `shown` or from rows' DOM.
Doc drift:   spec/features-map.md F21 row in the docs(map) commit
Escalate:    none
```

```
Question:    Does the unticked "Lead approves spec" box block the red test commit?
Class:       P0 no conflict
Sources:     spec/CLAUDE.md "The box is ticked by a human (the card's lead) before any test is written"
Conflict:    none
Verdict:     a gate, not a ruling; the plan's human "approve" ticks it (D-7). No test before it.
Next action: dev-lead writes plan.md, waits for the approval line.
Must not:    start the skeleton or tests before the approval.
Doc drift:   none
Escalate:    none
```
