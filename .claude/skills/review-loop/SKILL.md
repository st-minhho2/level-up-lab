---
name: review-loop
description: The mandatory finish for any change under src/, prisma/ or e2e/ - run the reviewer agent in diff-review mode, give every finding a disposition (fix now / no change needed with the proving input / out of scope), fix narrowly, re-verify, at most 3 passes, then clear the Stop gate with .claude/hooks/mark-reviewed.sh. Use after the green step, when the Stop hook reports an unreviewed change, or when asked to "review this before the PR". Never clears the gate with findings open.
---

# review-loop

```
implement → REVIEW (1) → DISPOSITION every finding (2) → FIX (3) → RE-VERIFY (4) → clean? clear gate
                                                                               : pass < 3? back to 1 : stop, report blocked
```

Hard cap: **3 passes**. Not clean after pass 3 → do not run `mark-reviewed.sh`; report "blocked at pass 3/3"
with the open findings. Stopping deliberately with the review incomplete is allowed only if you say so.

## 0. Scope

`git status --short src prisma e2e` and `git diff --stat main...HEAD`. Re-read every changed file in full.
State honestly what you were unsure about; the reviewer gets that sentence.

## 1. Review

`Agent(subagent_type: "reviewer")` with: card, worktree path, `Mode: diff review`, the changed files,
"I was unsure about: …". Foreground. In parallel, your own pass over `.claude/rules/*.md` as explicit questions
(the eight invariants as questions; Zod at the boundary? Prisma only in `src/lib`? a test weakened? a file outside
`plan.md`? the features map moved?). Then revert one
changed line in your head: would a test fail? If not, that line is untested; say so.

## 2. Disposition table (every finding, both sources)

| Pass | # | Finding (file:line) | Source | Kind | Disposition | Justification |

Dispositions: `fix now` · `no change needed` (**with the input that proves it**) · `out of scope` (named follow-up
task). A dispute about _what governs_ goes to `/advise`, not to opinion.

## 3. Fix

One narrow fix per `fix now`, failing test first when behavior changes (`test(<pkg>): <card> review pass N -- …`,
no `(red)` marker, as `backlog/CLAUDE.md`; then `fix(<pkg>): <card> review pass N -- …`). The test is written by
`test-writer` (dispatch it with `Mode: review pass N` and the finding), never by you: `plan-scope.sh` refuses a test file from any other writer; the fix goes to `code-writer`.
Never weaken an assertion; never special-case a test input.

## 4. Re-verify

`pnpm lint && pnpm typecheck && pnpm test && pnpm test:e2e`, mutation if `src/lib` or `src/actions` changed. A fix
that touched an action or a lib function goes back to step 1 (next pass). Clean → `.claude/hooks/mark-reviewed.sh`
from the worktree.

## Final report (in this order)

1. what changed · 2. the full disposition table · 3. what the review improved · 4. verbatim last lines of lint,
   test, e2e, mutation · 5. the map delta · 6. deferred items with their follow-up card ids · 7. passes N/3.
