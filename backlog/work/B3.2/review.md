# B3.2 review

## Plan review (round 1)

SCOPE: all (`src/lib`, `src/components`, `e2e`; no `src/actions`, no `prisma/`)

Read: `plan.md` (92aa66a), `spec/contracts/16-title-counter.md`, `analysis.md`, `advice.md`, D-5, D-7, D-21, card
B3.2, `spec/features-map.md`, `src/components/todo-form.tsx` and its test, `src/lib/todo-schema.ts`,
`scripts/ci/check-features-map.sh`, `scripts/ci/plan-files.sh`, `scripts/ci/check-suppressions.sh`. Ran:
`pnpm test` → `Tests  169 passed (169)` (baseline confirmed); `grep -cE '^\s*test\(' e2e/*.spec.ts` → 32 (baseline
confirmed); react-dom 19.1.0 `react-dom-client.development.js`: `recursivelyResetForms` at 13422 runs inside the
mutation pass, `flushMutationEffects()` 15401 precedes `flushLayoutEffects()` 15402 (agrees with the advice);
`eslint-plugin-react-hooks` is 5.2.0, which has no set-state-in-effect rule, so approach A needs no suppression.

| Check                                                                             | Result                                                                                                                                                                                                                                                                    |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| every file in the plan belongs to the section's features (map)                    | pass: `title-count.ts` and its test form the new F16 row (✗ in the skeleton, which `check-features-map.sh` allows for missing paths); `todo-form.tsx` and its test are already F4/F8 and D-21 assigns that file to B3.2; `e2e/18-title-counter.spec.ts` is §18's own file |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: two pure exports with explicit return types, no Prisma, no `server-only` (client-importable, imports only `todo-schema.ts` → `zod`); `TodoForm(): ReactNode` unchanged; no action, schema or message touched                                                        |
| plan follows `advice.md`'s recommendation or states the deviation                 | fail: approach A as recommended, but the plan also pre-authorizes fallback B as "a code-writer choice" without the cost the advice lists (reason 1)                                                                                                                       |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: 7 criteria, every Then is exact text, counts, values or an accessible description; no banned adjective                                                                                                                                                              |
| verification lists exact commands with expected numbers                           | pass, with a note: commands are exact; baselines 169 and 32 are right; targets are written "about 6" / "~175" although the plan fixes 1 test per AC (reason 2, minor)                                                                                                     |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: `chore(todos): B3.2 skeleton` → `test(todos): B3.2 … (red)` → `feat(todos): B3.2 …` → `docs(map): F16 … [B3.2]` → `docs(backlog): B3.2 review …`                                                                                                                    |
| the section has a `Lead approves spec` box, ticked only by a human                | pass: `- [ ] Lead approves spec (lead, <date>)` present and unticked; the plan says approval ticks it (D-7); not touched by this review                                                                                                                                   |
| no settled D-n contradicted                                                       | pass: D-21 (no `page.tsx`, `todo-due-date.tsx`, `todo-item.tsx`, `todos.ts`, `actions/todos.ts`, `logger.ts`, `src/*/CLAUDE.md` in Files); D-5 (200 imported as `TITLE_MAX_LENGTH`, one definition); D-19 (no config change)                                              |
| `scripts/next-task.sh --check B3.2` on the committed plan says no overlap         | pass: `[next-task] B3.2: no overlap with any Doing or Review card` (exit 0, run on 92aa66a)                                                                                                                                                                               |

Verdict: changes requested

1. **Fallback B is pre-approved without its cost, and B breaks the Function contract.** `plan.md` line 6: "Fallback
   B (`onReset` → `setDraft(kept)`) stays inside the same two files." Approving the plan would let the code-writer
   switch to B with no re-approval. B sets the counter from the `defaultValue` prop (`kept`) and never reads the
   box after the reset. The contract says the counter "is derived from the box itself, read after every input event
   and after every form reset" (`16-title-counter.md`, Function contracts). `advice.md` lists the cost: "Dropped by
   B: reading the real box value after reset (REQ-18.6's wording)". B also lets box and counter disagree whenever a
   script cancels the `reset` event or `kept` changes without the handler. The lead would be approving a mechanism the
   spec excludes without seeing that. Fix: either delete the fallback sentence, or say that switching to B (or to
   `onReset` + `queueMicrotask`) is a plan change that needs re-approval and a §18 ruling because it drops the
   read-from-the-box property.
2. (minor) Verification: replace "about 6 new" and "169 → ~175" with the exact targets the Files table implies
   (`title-count.test.ts` 2 + `todo-form.test.tsx` 4 = 6; 169 → 175; e2e 32 → 33), and keep the sentence that a
   different count goes in the red commit.

Costs the lead approves with approach A (stated here so approval happens with them in view):

- The component is not mutation-tested (Stryker covers `src/lib` and `src/actions` only), so the 4 component tests
  AC-18.3 to AC-18.6 are the only guard of the reset logic. Their exact literals (`'0 / 200'`, `'8 / 200'`,
  `'12 / 200'`) are what make them a guard; `titleCounterText(box.value)` alone (AC-18.4 b) proves only agreement.
- A depends on TodoForm re-rendering in the commit that resets the form, so that its layout effect runs. React
  19.1.0 source supports this, but only AC-18.4 to AC-18.6 going red then green prove it.
- The layout effect with no dependency array also runs on the first commit after hydration, so text typed before
  hydration shows its count at hydration instead of `0 / 200`. §18 puts this case out of scope (allowed, not
  required) and no AC asserts either way. No existing behavior is dropped: `kept` still reads `draft` only after a
  `form` failure, and `onSubmit` still sets `draft` again on every submit.

Riskiest unfalsified: approach A assumes the reset commit re-renders TodoForm and runs its layout effect. I checked
the react-dom 19.1.0 commit order by reading it, not by running it.
