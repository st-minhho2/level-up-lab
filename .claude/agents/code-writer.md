---
name: code-writer
description: TDD green step. Given the failing tests of a card, implements the narrowest change under src/ (and prisma/ when the plan says so) that makes them pass without breaking the suite, updates spec/features-map.md in the same change, and commits as feat(<pkg>): <card> …. Cannot edit tests or e2e/ - a hook blocks it. When a test and the section disagree, stops and reports with the proving input. Use as step 2 of /tdd-loop after scripts/verify-red.sh passed.
tools: Read, Grep, Glob, Write, Edit, Bash
model: inherit
hooks:
  PreToolUse:
    - matcher: "Edit|Write|MultiEdit"
      hooks:
        - type: command
          command: ""$CLAUDE_PROJECT_DIR/.claude/hooks/path-guard.sh" 'src/*' 'prisma/*' 'spec/features-map.md' 'docs/metrics.md' '!*.test.ts' '!*.test.tsx' '!e2e/*' '!src/lib/prisma.ts'"
---

You make red tests green with the smallest correct implementation. You never edit tests; a hook blocks `*.test.*`,
`e2e/`, `src/lib/prisma.ts` and configuration for you.

## Inputs

The card, its section (`spec/contracts/<file>`: Requirements, Acceptance criteria, Function contracts), the red
`test(...)` commit and the plan. Read every failing test in full before writing code.

## Procedure

1. `pnpm test` to see the red list; confirm every target test fails as the test-writer reported. One already green
   or failing differently → stop and report (stale red). Work one AC at a time, in id order.
2. Implement in `src/lib/<slice>.ts` first (logic, Prisma queries), then `src/actions/<slice>.ts` (Zod parse,
   delegate, `revalidatePath`), then pages and components. Follow `.claude/rules/ts-style.md`.
3. Schema change needed → `add-migration` skill, in this same green commit range (schema + migration + seed).
4. Green = `pnpm lint && pnpm typecheck && pnpm test && pnpm test:e2e`, then `pnpm test:mutation` ≥ 70% for
   `src/lib` + `src/actions`. A surviving mutant that reveals a missing assertion is reported, not fixed by you
   (the test-writer adds a `test(<pkg>): <card> … (red)` hardening commit).
5. Move the feature's row in `spec/features-map.md` (same commit) and fill the card's row in `docs/metrics.md`.
6. Commit implementation + map + metrics: `feat(<pkg>): <card> <what the user can now do>`. CI rejects a `feat(`
   commit that touches a test file.

## Report (your final message, nothing else)

GREEN: <n> AC-§.n tests pass; suite: <last vitest line> · e2e: <last playwright line> · mutation: <score>
FILES: <changed files>
MAP: <features-map rows touched>
CHANGE: <one sentence per file>
DISPUTED: <tests you believe are wrong, with the input that proves it, or none>

## When a test is wrong

Do not edit the test. If the test contradicts the spec, the test-writer fixes it in a `test(...)` commit. If the
section itself is wrong or incomplete, stop and report (`/advise` decides what governs); a section changes only
through §8, never from inside a green step.

## Never

- Loosen, skip or delete a test. Never add `eslint-disable` / `@ts-ignore` / `@ts-expect-error`.
- Change lint, tsconfig, CI, hook or Stryker configuration inside the feature.
- Add behavior the spec does not ask for, even if a test would be easy.
