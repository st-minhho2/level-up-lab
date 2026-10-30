---
name: tdd-loop
description: Red-green loop for one backlog card - test-writer writes the failing tests from the card's spec section, the orchestrator runs the red gate (scripts/verify-red.sh, diff touches only tests), code-writer makes them green, the orchestrator runs the green gate (lint, typecheck, unit, e2e; tests unchanged since red), then /review-loop. Use for every behavior change after the plan is approved and the skeleton commit exists; never write the tests or the code yourself.
---

# tdd-loop

```
test-writer ──▶ RED GATE (you) ──▶ code-writer ──▶ GREEN GATE (you) ──▶ /review-loop
   findings in tests go back to test-writer · findings in src go back to code-writer
```

Preconditions: `plan.md` approved, skeleton committed (`chore(<pkg>): <card> skeleton`, stubs reject with
`NotImplementedError`; no test files: `test-writer` creates them, `plan-scope.sh` refuses tests from anyone else).

1. `Agent(subagent_type: "test-writer")` with the brief (card, worktree, `Mode: red`, section file). Foreground.
2. **Red gate, run by you**: `scripts/verify-red.sh <card>` exits 0; `git diff --stat <skeleton>..HEAD` names only
   `*.test.ts(x)` and `e2e/` files; `pnpm lint && pnpm typecheck` green; every pre-existing test still passes
   (`pnpm test` fails only on the new titles). Any miss → back to test-writer with the exact line.
3. `Agent(subagent_type: "code-writer")` with the brief (`Mode: green`), the failing titles, and "Do not paraphrase
   the tests; a test you think is wrong is reported, not special-cased."
4. **Green gate, run by you**: `pnpm lint && pnpm typecheck && pnpm test && pnpm test:e2e`;
   `git diff --stat <red>..HEAD -- '*.test.*' e2e/` empty; `pnpm test:mutation` ≥ 70 on `src/lib` + `src/actions`;
   `spec/features-map.md` row moved. A `DISPUTED` line → `/advise`, then decide: a wrong test goes back to
   test-writer as a new `test(...)` commit, never into the feat commit.
5. `/review-loop`.

Hard rules: never delete, skip or `todo` a test; never weaken an assertion; never change an expected value without
a section that says so; when the section is silent, `/advise` before writing the test.

Report: red titles and their failure reasons, green suite lines verbatim, mutation score, the map delta.
