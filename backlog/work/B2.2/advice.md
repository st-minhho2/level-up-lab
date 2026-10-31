# B2.2 advice — Show how many todos remain (§13)

Sources read: `spec/contracts/11-remaining-count.md`, `backlog/work/B2.2/analysis.md`, `backlog/00-decisions.md` D-20,
`feat/B2.1-filter` (`spec/contracts/10-filter.md`, `backlog/work/B2.1/analysis.md`; B2.1 has no `plan.md` yet),
`src/app/page.tsx`, `src/app/layout.tsx`, the three client components, `src/lib/todos.ts`, `scripts/next-task.sh`,
`scripts/ci/plan-files.sh`, `scripts/ci/check-plan-scope.sh`, `.claude/hooks/plan-scope.sh`, `.claude/agents/dev-lead.md`.
`src/lib` has no count helper today; `git grep -n -i remaining src/` → no match.

## Approaches

The lead's question comes first because it decides the shape of both approaches.

**Can an already-rendered component host the count without touching `page.tsx`? No.**

- The contract names the mount: `spec/contracts/11-remaining-count.md:44` "src/app/page.tsx: renders <RemainingCount count={countRemaining(todos)} /> outside the <ul>, in both states, from the same listTodos() result (no second query)". Only `page.tsx` holds `todos`; `src/lib/todos.ts` is closed to this card (`:47` "No Server Action, no Zod schema, no Prisma model and no change to `src/lib/todos.ts` or `src/actions/todos.ts`").
- `todo-form.tsx`, `clear-completed-button.tsx` and `todo-item.tsx` take no `count` prop (`ClearCompletedButton({ disabled })`, `TodoItem({ todo })`, `TodoForm()`). Feeding any of them the number means `page.tsx` passes a prop: `page.tsx` is edited anyway, the file the lead wants to avoid.
- Hosting without a prop means a second `listTodos()` call inside that component. That breaks "(no second query)" (REQ-13.4 in `:18` derives from the list the page holds) and puts a read inside a client component (`ts-style.md`: reads in Server Components through `src/lib`).
- `todo-item.tsx` renders inside the `<ul><li>`: an `<li>` is a `listitem`, AC-13.4 requires "3 `listitem` roles (the count is none of them)", and one row per todo cannot show one total.
- `clear-completed-button.tsx` is bound by §9/§10: `spec/contracts/08-mutation-feedback.md:20` "show the message directly after the "Clear completed" button" (AC-10.3: same parent, after it). A count in its wrapper changes a section that is not this card's, and the count would be hidden or disabled-adjacent in no state the spec allows ("never hidden", REQ-13.2).
- `todo-form.tsx` is `'use client'` with `useActionState`; making the count a child of it makes a Server Component a client import (the contract says `RemainingCount` has "no state, no events: a Server Component"). Its markup changes under JavaScript off and before hydration (see Impact).
- `layout.tsx` wraps every route, has no `todos`, and a layout is not re-rendered by `revalidatePath('/')` on a page transition, so REQ-13.3 (new count "in the same page without a full reload") would not hold without a client store, which §13 puts out of scope.

Conclusion: `page.tsx` is required by the contract text, not a design choice. Class P0 (no conflict): D-20 choice (a) serialises the file, §13 needs it, the two agree once the card waits.

### Approach A (recommended): two phases, `page.tsx` last, after B2.1 merges

Phase A, now, no shared file touched:

1. `chore(lib): B2.2 skeleton`: `src/lib/todo-count.ts` and `src/components/remaining-count.tsx` that throw `NotImplementedError`.
2. `test(lib): B2.2 … (red)`: `src/lib/todo-count.test.ts` (AC-13.1, AC-13.2) and `src/components/remaining-count.test.tsx` (the `<p>` text from `remainingLabel`). `scripts/verify-red.sh B2.2` covers exactly these (it skips `e2e/*.spec.ts`).
3. `feat(lib): B2.2 …`: implement both. Green gate at full strength: `pnpm lint && pnpm typecheck && pnpm test && pnpm test:e2e` all green, because nothing user-visible changed and no new e2e file exists yet.

Phase B, after B2.1's PR is MERGED:

4. `git fetch origin && git merge origin/main` (never rebase). `page.tsx` is untouched on this branch, so the merge brings B2.1's version in without conflict.
5. Plan amendment: add the `page.tsx` row, lead re-approves, commit `docs(backlog): B2.2 plan round 2 approved` (the subject matches `plan-files.sh`'s `plan (round [0-9]+ )?approved`; a row added without that commit "does not count until the lead approves again"). Re-run `scripts/next-task.sh --check B2.2`.
6. `test(e2e): B2.2 … (red)`: `e2e/13-remaining-count.spec.ts` (AC-13.3 … AC-13.7), written against the merged page, run once to show it red on "0 items left" not found (e2e is not covered by `verify-red.sh`).
7. `feat(app): B2.2 …`: one `<RemainingCount count={countRemaining(todos)} />` in `page.tsx`. Full green gate.

Why `e2e/13` waits for phase B: `.claude/agents/dev-lead.md:66-68` "run the red gate yourself … dispatch code-writer, then the green gate (pnpm lint && pnpm typecheck && pnpm test && pnpm test:e2e". An e2e file committed red in phase A makes the phase-A green gate impossible (AC-13.3 to AC-13.7 cannot pass without `page.tsx`); written in phase B it goes red then green inside one gate. The file can be listed in the round-1 `## Files` (not shared with any card), only its dispatch is deferred.

- Pros: unit, component and mutation work is reviewed and banked now; every `feat` commit passes the full green gate; no merge conflict on `page.tsx`; the e2e tests are written against the page as it will ship; round-1 plan carries no overlap, so `--check` passes today.
- Cons: two approvals (the second is mechanical); `RemainingCount` and `countRemaining` are unused in `src/app` for a while (no unused-export check found in `package.json`, `[unverified]` for the lint config); the PR stays draft until B2.1 merges; the card's wall-clock still equals B2.1's.
- Fits rules: `planning.md` ("If the direction changes while coding … update the plan, get it re-approved": here the change is planned and the re-approval is on the record); `invariants.md` 1 and 2; `check-plan-scope.sh` (files as of the approval commit).

Plan wording that keeps round 1 parseable: `plan-files.sh` reads every backticked token in column 1 of the `## Files` table, so `src/app/page.tsx` must stay out of that table in round 1. Name it in prose under "Sequence" (not backticked in a table row).

### Approach B: the whole card waits for B2.1 to merge

Start the card after B2.1's merge; one plan, one approval, `page.tsx` in `## Files` from the start.

- Pros: one plan round, no dead code, no second approval, the simplest board story.
- Cons: nothing lands while B2.1 is open although about 80 % of the card (the two modules and their tests) touches no shared file; `next-task.sh --check B2.2` fails on `src/app/page.tsx` as soon as B2.1's plan lists it, so the plan cannot be approved over it (`dev-lead.md` step 4: "an overlap → re-plan around it or wait, never ask the lead to approve over it"); the WIP slot is held without work.
- Fits rules: yes, nothing bent.

Rejected: the "host in an existing component" variants above; none passes AC-13.4 or REQ-13.4 without the same `page.tsx` edit.

## Recommendation

Approach A, with `e2e/13-remaining-count.spec.ts` in phase B. Choose B only if the lead prefers one approval over earlier review of the pure modules.

Gate details the plan should state:

- "Waits for B2.1 to merge" means MERGED, not ready. `scripts/next-task.sh:117` treats `Doing` and `Review` alike as holders; only a merged PR (state `Closing`) stops counting. B2.1 in `Review` still blocks phase B.
- `--check B2.2` passes vacuously today: `scripts/next-task.sh` reads B2.1's plan with `|| true` and B2.1 has no `plan.md` yet. A pass now is no proof of no overlap; the re-run before the round-2 approval is the real check (it is skipped once B2.1 is merged).
- Placement in `page.tsx` is fixed only as "outside the `<ul>`, in both states" (`:44`). B2.1 §12 puts `<TodoFilterNav>` "between `<ClearCompletedButton />` and the list or the empty text". Decide the spot (suggest directly before the list or empty text, after the nav) when phase B reads the merged file; either passes AC-13.3 and AC-13.4.

## Impact

| File                                      | Add/Change                         | Signature                                                                                                            | ACs                                  |
| ----------------------------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `src/lib/todo-count.ts`                   | Add                                | `countRemaining(todos: readonly { readonly completed: boolean }[]): number`; `remainingLabel(count: number): string` | AC-13.1, AC-13.2                     |
| `src/components/remaining-count.tsx`      | Add                                | `RemainingCount({ count }: { readonly count: number }): ReactNode` (Server Component, one `<p>`)                     | AC-13.3 to AC-13.7                   |
| `src/lib/todo-count.test.ts`              | Add                                | unit, node                                                                                                           | AC-13.1, AC-13.2                     |
| `src/components/remaining-count.test.tsx` | Add                                | component, jsdom                                                                                                     | AC-13.2 (render)                     |
| `e2e/13-remaining-count.spec.ts`          | Add (phase B)                      | Playwright, one file per section                                                                                     | AC-13.3 to AC-13.7                   |
| `src/app/page.tsx`                        | Change (phase B, after B2.1 merge) | one JSX line: `<RemainingCount count={countRemaining(todos)} />` plus two imports                                    | AC-13.3, AC-13.4, AC-13.5 to AC-13.7 |

Not touched: `src/lib/todos.ts`, `src/actions/todos.ts`, `prisma/`, `layout.tsx`, every client component.

Client components the card changes: none. Lines per approach for the three that were candidate hosts, to show what each would drop:

- `todo-form.tsx`, hosting inside it: server-rendered markup today is one `<form>` with the box and "Add"; after, plus a `<p>` inside the form. JavaScript off: the form posts natively, the page re-renders, the count is correct in both. Before hydration: the native POST works today and after; the count is in the HTML. Dropped behavior: none visible, but `RemainingCount` would become a client import and lose "a Server Component" in the contract, and `page.tsx` still needs a prop. Rejected for that reason.
- `clear-completed-button.tsx`, hosting inside it: today a `<div>` with the button (`disabled` from the page) and an alert `<p>` after it; after, a second `<p>` in the same `<div>`. JavaScript off or before hydration: the button is inert (`type="button"`, `onClick`) both today and after; the count text is in the HTML. Dropped: the contract line that the alert is "directly after the button" gets a sibling in between unless the count goes before it. Rejected: edits §9/§10 territory, `page.tsx` still needs a prop.
- `todo-item.tsx`: inside the `<li>`, so it is a `listitem` per row; fails AC-13.4 outright.

Approach A and B change no client component, so a submit with JavaScript off and a submit before hydration behave as today: both go through the native POST of `TodoForm` and the full re-render shows the new count (the count is derived on every render, REQ-13.4).

## Risks

- **Migration:** none. No Prisma model, no Zod schema, no action.
- **Security:** none. A pure function over data the page already holds; no input, no new endpoint (Route Handlers stay GET-only).
- **Performance:** O(n) over an array already in memory, no extra query (analysis question 4).
- **Isolation:** `todo-count.ts` has no `server-only` and no Prisma (importable from a client component per the contract); nothing stateful hard-coded.
- **Coupling with B2.1 (analysis question 3):** B2.1's contract (`spec/contracts/10-filter.md`, Function contracts) says `<ClearCompletedButton disabled>` "still derives from the unfiltered todos" and the list is `filterTodos(todos, filter)`, so `todos` in the merged `page.tsx` is the whole stored list, which is what REQ-13.5 needs: `countRemaining(todos)` is correct as long as the variable stays unfiltered. That §12 is not yet approved (`- [ ] Lead approves spec`), and B2.5 (search) will add another narrowing. Residual gap: none of AC-13.1 … AC-13.7 runs with a filter selected, so a page that passed a filtered array would stay green on B2.2's own tests while breaking REQ-13.5. Mitigation, no spec change: phase B's plan lists `git grep -n "countRemaining(" src/app/page.tsx` showing the argument is the same variable as `ClearCompletedButton`'s source, and the diff reviewer is told to check it. A criterion for it needs a spec change (§13 holds 7 of 7, an eighth means a second section): not recommended unless the lead wants it.
- **Existing tests that could go red:** `e2e/05-todos.spec.ts` AC-5.7 (`getByText('No todos yet')`) and AC-9.2 use text and role queries; "0 items left" contains neither string, so they stay green. A `getByText(/items? left/)` collision is the only risk and does not exist. B2.1's filter e2e use `getByRole('listitem')`; the `<p>` count is not a `listitem`.
- **Index status:** `spec/technical-requirements.md` keeps §13 at ✗ until all seven `AC-13.n` titles exist; flipping it after phase A only would fail `scripts/ci/check-ac-coverage.sh` (AC-13.3 to AC-13.7 live in e2e). The flip belongs to the closing lane (`backlog/CLAUDE.md`, "Closing a card" step 3), after merge, never to a phase-A commit. `git grep -n F11 spec/features-map.md` → no match: the `docs(map): F11 …` commit of the card adds the row.
- **Board:** the card stays Doing across both phases and the PR draft; the closing lane runs after merge. If B2.1 is abandoned (PR CLOSED), `page.tsx` is free and phase B can start at once.

## Test strategy

| Layer     | File                                      | ACs                                                                           | Mocks                                                                       |
| --------- | ----------------------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Unit      | `src/lib/todo-count.test.ts`              | AC-13.1, AC-13.2                                                              | none (pure)                                                                 |
| Component | `src/components/remaining-count.test.tsx` | text of the one `<p>` for 0, 1, 2; titled `AC-13.2:` for the label it renders | none (no action import)                                                     |
| e2e       | `e2e/13-remaining-count.spec.ts`          | AC-13.3, AC-13.4, AC-13.5, AC-13.6, AC-13.7                                   | none; seeds through `PrismaClient` as `e2e/09-clear-completed.spec.ts` does |

- AC-13.1 written to kill survivors: `[]`; three open; open, done, open, done, open; two done; the input compared (`toEqual` on a copy taken before, and `Object.isFrozen` input via `Object.freeze` so a mutating implementation throws).
- AC-13.2: `0`, `1`, `2`, `11`, plus a count with two digits so `=== 1` is the only boundary.
- AC-13.3 asserts exactly one "0 items left" and one "No todos yet" and `getByRole('listitem')` count 0; AC-13.4 seeds C (open), B (done), A (open) in display order with the `seedInDisplayOrder` pattern of `e2e/09`.
- AC-13.5 to AC-13.7 assert the text after each step and no navigation (compare `page.url()` or use a `framenavigated` counter); AC-13.7 asserts before click, after click and after reload.
- The component test is titled with an AC id that exists (`AC-13.2:`, the label it renders); there is no AC for the component alone, so keep it to one behavior per test with no `AC-` prefix invented.
- Red evidence: phase A by `scripts/verify-red.sh B2.2` (skeleton throws `NotImplementedError`); phase B by one `pnpm test:e2e e2e/13-remaining-count.spec.ts` run recorded in the commit body.
- Mutation: `pnpm test:mutation` must stay at or above 70 %; `src/lib/todo-count.ts` counts toward the gate (`stryker.config.mjs` `mutate` includes `src/lib/**/*.ts`).

## Mutation hot spots

| Spot (`src/lib/todo-count.ts`)                            | Likely mutant                          | Killed by                                   |
| --------------------------------------------------------- | -------------------------------------- | ------------------------------------------- |
| `!todo.completed` in the filter                           | drop the `!` (counts done todos)       | AC-13.1 (c) and (d): 3 vs 2, 0 vs 2         |
| the result of the filter (`.length`)                      | return `todos.length`                  | AC-13.1 (c): 3, not 5                       |
| `count === 1`                                             | `!==`, `true`, `false`, `>= 1`, `<= 1` | AC-13.2 on 0, 1, 2, 11                      |
| template `${count} item left` / `${count} items left`     | empty string, swapped suffixes         | exact strings on all four inputs            |
| input handling (`sort`, `splice`, `reverse` on the input) | in-place mutation                      | frozen input plus a before/after comparison |

## Questions settled / escalated

```
Question:    Can the count render without editing src/app/page.tsx, hosted in an already-rendered component?
Class:       P0 no conflict
Sources:     spec/contracts/11-remaining-count.md:44 "src/app/page.tsx: renders <RemainingCount count={countRemaining(todos)} /> outside the <ul>, in both states, from the same listTodos() result (no second query)"
             spec/contracts/11-remaining-count.md:47 "No Server Action, no Zod schema, no Prisma model and no change to `src/lib/todos.ts` or `src/actions/todos.ts`"
             backlog/00-decisions.md:40 "the shared mount points `src/app/page.tsx`, `src/lib/todos.ts`, `src/actions/todos.ts` are held by one Doing card at a time (`next-task.sh --check`)"
Conflict:    none (§13 needs page.tsx; D-20 serialises page.tsx; the two meet in the sequencing, not in a contradiction)
Verdict:     page.tsx is required. The spec governs behavior and names it; no existing component can host the count without a prop from page.tsx, a second query, a listitem, or a §9/§10 change. D-20 (a) governs when: B2.2 takes page.tsx only after B2.1 stops holding it.
Next action: write plan.md with phase A in `## Files` (no page.tsx row) and a prose "Sequence" for phase B; run `scripts/next-task.sh --check B2.2`.
Must not:    mount the count inside TodoForm, ClearCompletedButton or layout.tsx to dodge the shared file, or list page.tsx in round 1 and ask the lead to approve over an overlap.
Doc drift:   none
Escalate:    none
```

```
Question:    How is B2.2 sequenced against B2.1 so every feat commit passes the green gate and plan-scope?
Class:       P2 spec silent (sequencing is not in any contract; the rules decide)
Sources:     .claude/agents/dev-lead.md:66 "`/tdd-loop`: dispatch `test-writer`, then run the **red gate**"
             scripts/ci/plan-files.sh:3 "so a row added after approval"
             .claude/agents/dev-lead.md:38 "an overlap → re-plan around it or wait, never ask the lead to approve over it"
Conflict:    none
Verdict:     Approach A. Phase A (modules, unit and component tests) now; e2e/13 and page.tsx after B2.1 is MERGED, behind a `plan round 2 approved` commit and a re-run of `--check`. An e2e file committed red in phase A would make the phase-A green gate unreachable.
Next action: lead picks A or B in plan.md; with A, plan.md names the phase-B trigger (B2.1 merged) and the amendment commit subject.
Must not:    commit e2e/13 red before `page.tsx` is available, edit page.tsx on a round-1 approval, or treat B2.1 in Review as released.
Doc drift:   none
Escalate:    none
```

```
Question:    Does the count read the stored list or B2.1's filtered list (analysis question 3)?
Class:       P0 no conflict (REQ-13.5 settles it; B2.1's contract keeps `todos` whole)
Sources:     spec/contracts/11-remaining-count.md:20 "THE SYSTEM SHALL count every stored todo, not only the rows currently listed"
             spec/contracts/10-filter.md (branch feat/B2.1-filter) "<ClearCompletedButton disabled> still derives from the unfiltered todos"
Conflict:    none
Verdict:     the stored list. Coupling risk stays: no §13 AC runs with a filter selected and §12 is not yet approved. Mitigated by a grep line in the phase-B verification and a reviewer instruction, not by a spec change.
Next action: phase-B plan names the argument of `countRemaining(` and the reviewer checks it against the merged page.tsx.
Must not:    pass the filtered array to countRemaining, or add a count-per-filter (out of scope in §13).
Doc drift:   none
Escalate:    none
```
