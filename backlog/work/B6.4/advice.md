# B6.4 advice

Read first: §32 (`spec/contracts/30-clear-completed-count.md`) fixes the paths, both signatures, the label format and the
count source (`filterCounts(todos).completed`, `src/lib/filter-counts.ts:11`). This file settles placement, the red/green
split and the test boundary. Nothing was run. The `Lead approves spec` box (`30-clear-completed-count.md:5`) is unticked;
per D-7 the plan gate's "approve" may tick it.

## Approaches

### Approach A (recommended): the spec's shape: pure `clearCompletedLabel`, optional `completedCount` prop, page passes `filterCounts(todos).completed`

- Change: add `src/lib/clear-completed-label.ts` (pure, header `// §32`); `ClearCompletedButton` gains
  `completedCount?: number` and renders `clearCompletedLabel(completedCount ?? 0)`; `page.tsx:48` passes
  `completedCount={filterCounts(todos).completed}` (`filterCounts` is already imported at `page.tsx:14`).
- Pros: matches the Function contracts block exactly, so `check-spec-sections.sh` and `/spec-trace` agree; the five
  existing component tests (`clear-completed-button.test.tsx:40-85`, no prop, name "Clear completed") stay green
  untouched; the first red test is a missing export (`NotImplementedError` from a skeleton), per `testing.md`; no second
  query; the count is computed on the server, so it is in the first HTML and `revalidatePath('/')` refreshes it (REQ-32.4)
  with no client state.
- Cons: one new lib file and its test; the label format has two readers (lib test, component test).
- Fits rules: invariants 1, 3, 4 (no action, no Prisma, no schema); `ts-style` (`readonly` prop, explicit return type).

### Approach B (alternative): inline the template literal in the component, no lib file

- Change: `` `Clear completed (${n})` `` inside `clear-completed-button.tsx`; no `src/lib/clear-completed-label.ts`.
- Pros: one file fewer.
- Cons: contradicts the §32 Function contracts block (`clearCompletedLabel` is a named export; AC-32.1 targets it);
  the card's `Test:` line (`src/lib/clear-completed-label.test.ts`) would have no subject; the first red would be a
  component assertion. Drops: the pure, importable label. Not compliant with spec-fidelity ("signatures are exact").
  Rejected, not merely disfavoured.

## Recommendation

Approach A. No migration, no dependency, no Server Action, no Zod schema.

## Impact

| File                                                   | Add/Change  | Signature                                                                                                                   | ACs                                  |
| ------------------------------------------------------ | ----------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `src/lib/clear-completed-label.ts`                     | Add         | `export function clearCompletedLabel(completed: number): string`                                                            | AC-32.1                              |
| `src/components/clear-completed-button.tsx`            | Change      | `ClearCompletedButton({ disabled, completedCount }: { readonly disabled: boolean; readonly completedCount?: number })`      | AC-32.2, AC-32.3, AC-32.4            |
| `src/app/page.tsx`                                     | Change      | `<ClearCompletedButton disabled={…} completedCount={filterCounts(todos).completed} />`; header adds `§32`                   | AC-32.5, AC-32.6, AC-32.7            |
| `src/lib/clear-completed-label.test.ts`                | Add (red)   | unit                                                                                                                        | AC-32.1                              |
| `src/components/clear-completed-button-count.test.tsx` | Add (red)   | component; new file so the §9/§10 test file stays untouched                                                                 | AC-32.2, AC-32.3, AC-32.4            |
| `e2e/32-clear-completed-count.spec.ts`                 | Add (red)   | Playwright                                                                                                                  | AC-32.5, AC-32.6, AC-32.7            |
| `src/lib/CLAUDE.md`, `src/components/CLAUDE.md`        | Change      | one line each naming §32                                                                                                    | none (docs, in the `docs(map)` step) |
| `spec/features-map.md`                                 | Add row F30 | §32 row: the three src paths, the three test paths, status flipped at close (map row is absent today: grep of F28/F29 only) | none                                 |

Client component `clear-completed-button.tsx`, one line per approach:

- A, server-rendered markup: the same `<div><button type="button" disabled=…>` today and after; only the text node
  changes (`Clear completed` to `Clear completed (n)`); no new element, role or attribute.
- A, JavaScript off: today the button is inert (`type="button"`, `onClick` only, no form); after, inert too, but the
  label still shows the right count because it is server-rendered. No behavior dropped.
- A, submit before hydration: today a click does nothing until hydrated; after, the same; the count is visible
  before hydration. No behavior dropped.
- B: identical markup, JS-off and pre-hydration behavior to A; the con is the spec departure above.

## Risks

- Migration: none. Security: none (read-only number, no input). Performance: one extra `filter` over the list already
  in memory; no query.
- Isolation: `page.tsx` is the batch's one `page.tsx` card (`E6-todos-cues.md:63`); run `scripts/next-task.sh --check B6.4`
  before the plan review. `todos.ts`, `actions/todos.ts`, `filter-counts.ts` are not touched (§32 says so).
- Existing tests that could turn red: Playwright `getByRole('button', { name: 'Clear completed' })` in
  `e2e/09`, `12`, `13`, `16`, `22`, `26`, `30` is a substring match, so it still resolves. Do not add `exact: true`.
  Unit `getByRole(..., { name: 'Clear completed' })` in `clear-completed-button.test.tsx` renders with no count, so
  exact text holds. Any other test that finds the button by exact name with completed todos rendered from `page.tsx`
  would break; the grep found none.
- Test-file rule: do not edit `clear-completed-button.test.tsx`; the new component tests go in a separate file
  (`add a key, never remove one` for the `vi.hoisted` action mock).
- Layering: the client component imports a pure lib file, which is allowed because it has no `server-only` and no Prisma.
- Doc drift: `features-map.md` F30 row and the two CLAUDE.md lines move in `docs(map)` right after `feat`; §9
  (`07-clear-completed.md`) is not edited.

## Test strategy

| Layer     | File                                                   | ACs                       | Mocks                                                                                                                    |
| --------- | ------------------------------------------------------ | ------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| unit      | `src/lib/clear-completed-label.test.ts`                | AC-32.1 (0, 1, 12)        | none (pure)                                                                                                              |
| component | `src/components/clear-completed-button-count.test.tsx` | AC-32.2, AC-32.3, AC-32.4 | `vi.mock('@/actions/todos')` with `vi.hoisted` `clearCompletedTodosAction`; assert exact names, 0 `status`/`alert` roles |
| e2e       | `e2e/32-clear-completed-count.spec.ts`                 | AC-32.5, AC-32.6, AC-32.7 | none; seed through `src/lib`/DB as sibling specs do; AC-32.6 counts document navigations                                 |

Red on behavior: the lib test fails on the skeleton's `NotImplementedError`; the component tests fail on text assertions
("Clear completed (3)" not found); e2e fails on the name. Count is `pnpm test` plus 1 new e2e file.

## Mutation hot spots

- `clearCompletedLabel`: the `>= 1` boundary (`> 0`, `>= 2`, `> 1` survive unless 0 and 1 are both asserted, as AC-32.1
  does); the 12 case catches string-concatenation and padding mutants (`(012)`).
- Component: `completedCount ?? 0` (a mutant to `?? 1` is killed by AC-32.3's no-prop case); label tied to the prop and
  not to `pending` or the action result (AC-32.4 asserts the name stays "(2)" after resolve).
- `page.tsx` is outside the mutation scope (`src/lib` + `src/actions`); AC-32.5 covers the filtered/searched source.
  Mutation target stays at least 70 % on `src/lib`.

## Questions settled / escalated

Question: Is `completedCount` optional or required?
Class: P0 no conflict
Sources: spec/contracts/30-clear-completed-count.md:51 "readonly completedCount?: number;"
Conflict: none
Verdict: Optional; REQ-32.6 and the §9 unchanged-behavior proofs require the no-prop render.
Next action: Skeleton with the optional prop.
Must not: Make it required and rewrite the §9 component tests.
Doc drift: none
Escalate: none

Question: Where does the new count come from, and may `page.tsx` add a query?
Class: P0 no conflict
Sources: spec/contracts/30-clear-completed-count.md:24 "The count is the `completed` figure of the one `filterCounts(todos)` result (§30)"
Conflict: none
Verdict: `filterCounts(todos).completed` from the unfiltered `todos`; no second query, no new count function.
Next action: Pass it at `page.tsx:48`.
Must not: Count from `shown` or add `todos.filter(...)`/a new `listTodos()` call.
Doc drift: none
Escalate: none

Question: Does `spec/features-map.md` need an F30 row and who writes it?
Class: P2 spec silent (map only, the section is clear)
Sources: spec/features-map.md:37 "| F29 | §31 | Say due today"
Conflict: none (no F30 row exists; the card says `F30 · section 32`)
Verdict: The code-writer adds it in its `docs(map)` commit right after `feat`, per `spec/CLAUDE.md`.
Next action: Plan lists `spec/features-map.md` in Files as a `docs(map)` step.
Must not: Edit the map before the feat commit or edit §9 to mention §32.
Doc drift: `spec/features-map.md` row F30 and the section status in `spec/technical-requirements.md`, in the `docs(map)` and closing commits.
Escalate: none
