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

## Plan review (round 2)

SCOPE: all (`src/lib`, `src/components`, `e2e`; no `src/actions`, no `prisma/`)

Read: `plan.md` at d5de514, `git diff 92aa66a d5de514 -- backlog/work/B3.2/plan.md` (+5 −4 lines, Approach paragraph
and Verification only), `spec/contracts/16-title-counter.md`, `advice.md`, `analysis.md`, card B3.2, D-21 (batch 3),
`src/components/todo-form.tsx`, `scripts/ci/plan-files.sh`, `scripts/ci/check-plan-scope.sh`. Ran:
`git diff 92aa66a HEAD --stat -- src e2e prisma` → empty (no code moved since round 1); `pnpm test` →
`Tests  169 passed (169)`; `grep -cE '^\s*test\(' e2e/*.spec.ts` summed → 32; no `e2e/18-*` yet;
`scripts/ci/plan-files.sh --any B3.2` → the 5 Files rows exactly (`title-count.ts`, `title-count.test.ts`,
`todo-form.tsx`, `todo-form.test.tsx`, `e2e/18-title-counter.spec.ts`), so `check-plan-scope.sh` will hold the build to them.

Round 1 reasons:

1. Applied. The fallback sentence is gone; the plan now reads "No fallback without the lead: B (`onReset` →
   `setDraft(kept)`) or `onReset` + `queueMicrotask` would not read the box after the reset (§18 Function contracts),
   so switching is a plan change that needs re-approval and a §18 ruling."
2. Applied. "6 new", "169 → 175", "32 → 33"; the different-count sentence is kept.

| Check                                                                             | Result                                                                                                                                                                                                                                                       |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| every file in the plan belongs to the section's features (map)                    | pass: unchanged from round 1; `plan-files.sh --any` prints the 5 rows, all F16 (`title-count.*`, `e2e/18`) or the D-21 mount `todo-form.*`; paperwork (`spec/features-map.md`, `docs/metrics.md`) is exempt in `check-plan-scope.sh`                         |
| interfaces follow `ts-style.md`; mutations only in actions; Prisma only in lib    | pass: two pure exports with explicit return types copied from §18 Function contracts; `TodoForm(): ReactNode` unchanged; no action, schema, message or Prisma touched                                                                                        |
| plan follows `advice.md`'s recommendation or states the deviation                 | pass: approach A as recommended; the one deviation (advice calls a switch to B "a code-writer choice … no plan change", the plan makes it a re-approval plus a §18 ruling) is stated in the Approach paragraph with its reason                               |
| ≤ 7 criteria, every Then measurable, no banned adjective without a number         | pass: 7 criteria (AC-18.1 to AC-18.7), each Then is exact counts, texts, values, role counts or an accessible description                                                                                                                                    |
| verification lists exact commands with expected numbers                           | pass: `verify-red.sh B3.2` exit 0 with 6 failing (2 + 4), e2e 1 failed in red; `pnpm test` 169 → 175 (baseline re-run: 169); `pnpm test:e2e` 32 → 33 (baseline re-counted: 32); mutation ≥ 70 with `title-count.ts` 100; `pnpm build`; `check-plan-scope.sh` |
| work breakdown has skeleton → red → green → map → review with convention subjects | pass: `chore(todos): B3.2 skeleton` → `test(todos): B3.2 … (red)` → `feat(todos): B3.2 …` → `docs(map): F16 … [B3.2]` → `docs(backlog): B3.2 review …`                                                                                                       |
| the section has a `Lead approves spec` box, ticked only by a human                | pass: `- [ ] Lead approves spec (lead, <date>)` present and unticked at d5de514; the plan says the lead's approval ticks it (D-7); not touched by this review                                                                                                |
| no settled D-n contradicted                                                       | pass: D-21 batch 3 (UI only in `todo-form.tsx`, no `page.tsx`, no sibling component, no `src/*/CLAUDE.md`); D-5 (200 imported as `TITLE_MAX_LENGTH`); D-19 (no config change)                                                                                |
| `scripts/next-task.sh --check B3.2` on the committed plan says no overlap         | pass: `[next-task] B3.2: no overlap with any Doing or Review card` (exit 0, run on d5de514)                                                                                                                                                                  |

Verdict: approved (ready for the lead's gate, not approved for build)

Costs the lead approves with approach A (carried from round 1, still true):

- The component is not mutation-tested (Stryker covers `src/lib` and `src/actions` only); the 4 component tests
  AC-18.3 to AC-18.6, with their exact literals `'0 / 200'`, `'8 / 200'`, `'12 / 200'`, are the only guard of the reset
  logic. AC-18.4 (b) asserts only `titleCounterText(box.value)` agreement, by the spec's own wording.
- A depends on TodoForm re-rendering in the reset commit so its layout effect runs; only AC-18.4 to AC-18.6 going red
  then green prove it. If they stay red, the plan stops at the lead (no silent switch to B): that is a re-approval and a
  §18 ruling, and it costs at least one more lead round-trip on this card.
- The no-dependency layout effect also runs on the first commit after hydration, so text typed before hydration shows
  its count then instead of `0 / 200` until the next event. §18 Out of scope allows this; no AC asserts either way.
- No existing behavior is dropped: `kept` still reads `draft` only after a `form` failure, and `onSubmit` still re-seeds
  `draft` on every submit, so the 6 existing `todo-form.test.tsx` tests keep their oracle.

Notes (not blocking, for the lead):

- `plan.md` is 59 lines against `planning.md`'s "≈ 40 lines"; the Files table and Interfaces block are the bulk and
  carry no second task, so I did not split it (round 1 passed the same shape at 58 lines).
- `backlog/00-decisions.md` holds two rows with id `D-21` (lines 41 and 47: §16 `searchTodos` length rule, and batch 3).
  The plan means the batch-3 row. Ids are "permanent, never reused" (`backlog/CLAUDE.md`); this predates the card and is
  not this plan's to fix, but "D-21" is ambiguous wherever it is cited.

Riskiest unfalsified: approach A's layout effect running in the same commit as React 19.1.0's `form.reset()` (read in
react-dom source in round 1, not run); AC-18.4 to AC-18.6 are the first execution of that assumption.
