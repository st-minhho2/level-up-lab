# B7.2 advice

## Approaches

**A (recommended): copy §32's pattern.** Pure `src/lib/complete-all-label.ts` exports `completeAllLabel(open: number)`; `CompleteAllButton` gains optional `count` and renders `completeAllLabel(count ?? 0)`; `page.tsx` passes `filterCounts(todos).active`.

- Pros: reference is `clear-completed-label.ts` and `clear-completed-button.tsx` (§32); the label module is importable from a client component; no action, schema, query or migration; the count comes from the one `listTodos()` call.
- Cons: none found.
- Fits rules: yes (invariants 1, 3, 4: no new mutation, no Prisma outside `src/lib`; spec-fidelity: signatures copied from §36).

**B: compute the count inside the button from a todos prop.** Pros: none over A. Cons: contradicts the §36 contract (`count?: number`), moves domain logic into a client component, and breaks REQ-36.6. Rejected.

## Recommendation

A. Whether the §14 edits are on this branch: yes, they are already there (commit c155c3a) and no further `docs(spec)` commit is needed.

- REQ-14.4 (`12-complete-all.md:20`) reads "contains "Mark all complete" (exactly that text when no count is given, §36)".
- REQ-14.5 (line 21) is unchanged and still reads exactly "Mark all complete", which is right at 0.
- The §14 contract block (lines 52-53) has the `count?` prop and `count={filterCounts(todos).active}`.
- The Out of scope line (line 67) is deliberately not edited. D-37 says to "state" that it does not apply. §36 lines 27-28 state it: "This label count is not §14's 'message showing how many were changed'".
- AC-14.4 and AC-14.6 are untouched, as analysis.md Q4 proposed.

## Impact

| File                                                | Add/Change | Signature                                                                                                    | ACs                 |
| --------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------ | ------------------- |
| `src/lib/complete-all-label.ts`                     | Add        | `completeAllLabel(open: number): string`                                                                     | AC-36.1             |
| `src/components/complete-all-button.tsx`            | Change     | `CompleteAllButton({ disabled, count }: { readonly disabled: boolean; readonly count?: number }): ReactNode` | AC-36.2 to AC-36.4  |
| `src/app/page.tsx`                                  | Change     | `<CompleteAllButton disabled={…} count={filterCounts(todos).active} />`                                      | AC-36.5 to AC-36.7  |
| `spec/features-map.md`                              | Change     | new row F34 (§36), in code-writer's `docs(map)` commit after `feat`                                          | none (CI map check) |
| `src/lib/complete-all-label.test.ts`                | Add (test) | red commit                                                                                                   | AC-36.1             |
| `src/components/complete-all-button-count.test.tsx` | Add (test) | red commit, mocks `@/actions/complete-all`                                                                   | AC-36.2 to AC-36.4  |
| `e2e/36-complete-all-count.spec.ts`                 | Add (test) | red commit                                                                                                   | AC-36.5 to AC-36.7  |

The red commit needs a skeleton `complete-all-label.ts` whose stub throws `NotImplementedError`. The file does not exist yet. The skeleton belongs in the `test(...)` commit, and the `feat` commit replaces the body.

Client component `CompleteAllButton`, one line per approach:

- **A, server-rendered markup:** the `<button>` text goes from "Mark all complete" to the §36 label, and it is the same element and wrapper. It is server-rendered with the count from the page.
- **A, JavaScript off:** the button renders with the count but does nothing, as today (`type="button"` with `onClick`, no form). No behavior is dropped.
- **A, submit before hydration:** same as today, a click does nothing until hydrated. No behavior is dropped.
- **B:** the markup is the same as A. It drops REQ-36.6 and the contract's prop.

## Risks

- Migration: none. Security: none (no input, no mutation). Performance: one `filter` over the list the page already holds. Isolation: no env or port.
- Existing tests: the `complete-all-button.test.tsx` tests render without `count`, so the name stays exact. The e2e files 14, 16, 22 and 30 find the button by Playwright's substring name (analysis.md, grep checked), so they stay green. Re-run them before the PR. `page.test.ts` mocks `@/lib/todos` and should be unaffected.
- A mutation hot spot here is the `>= 1` boundary. A `> 1` or `>= 0` mutant is killed by the 0, 1 and 12 cases.
- No new dependency.

## Test strategy

| Layer     | File                                                | ACs                | Mocks                                                    |
| --------- | --------------------------------------------------- | ------------------ | -------------------------------------------------------- |
| unit      | `src/lib/complete-all-label.test.ts`                | AC-36.1            | none (pure)                                              |
| component | `src/components/complete-all-button-count.test.tsx` | AC-36.2 to AC-36.4 | `@/actions/complete-all` via `vi.hoisted`                |
| e2e       | `e2e/36-complete-all-count.spec.ts`                 | AC-36.5 to AC-36.7 | none (real database; hydrated page, count 0 navigations) |

Name the e2e file after the section file's convention as §32 did (`32-clear-completed-count.spec.ts`). The component test is a new file because the existing test file may not be edited without cause (add, never weaken).

## Mutation hot spots

- `completed >= 1` boundary in `completeAllLabel`, and the template text with the parentheses and no padding.
- `count ?? 0` in the button (a mutant to `count ?? 1` is killed by AC-36.3, enabled with no `count`).
- `filterCounts(todos).active` versus `.all`, killed by AC-36.5 (D open, C done, B open gives 2, not 3).

## Questions settled / escalated

Question: Are the §14 edits (REQ-14.4, REQ-14.5, contract, Out of scope line) already on this branch?
Class: P0 no conflict
Sources: spec/contracts/12-complete-all.md:20 "exactly that text when no count is given, §36"; spec/contracts/34-complete-all-count.md:27 "This label count is not §14's"; backlog/00-decisions.md:62 "states §14's \"a message showing how many were changed\" does not apply"
Conflict: none
Verdict: c155c3a landed REQ-14.4, the contract and §36's statement; REQ-14.5 needs no text change. D-37 asks to state, not delete, the Out of scope line, and §36 does so. This follows the authority order: D-37, then the contracts.
Next action: no `docs(spec)` commit; start at the red test commit.
Must not: Edit §14's Out of scope line or REQ-14.5 to match.
Doc drift: none (the features-map row F34 comes with `feat`, in `docs(map)`)
Escalate: none

Question: Open questions 1 to 4 of analysis.md (count with disabled true, negative count, deleted in REQ-36.4, unchanged AC-14.x).
Class: P2 spec silent (Q1, Q2), P0 (Q3, Q4)
Sources: spec/contracts/34-complete-all-count.md:27 "Whether the button is enabled stays the `disabled` prop of §14"; spec/contracts/34-complete-all-count.md:46 "`Mark all complete (n)` for n >= 1, `Mark all complete` for 0"
Conflict: none
Verdict: The spec governs. `disabled` alone drives enablement, and the label follows `count`. `completeAllLabel` writes no count below 1. No guard and no new test for either case.
Next action: implement as the contract says.
Must not: Add a guard or a rule tying `count` to `disabled`.
Doc drift: none
Escalate: none
