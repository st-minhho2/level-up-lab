---
name: write-spec-tests
description: Turn the acceptance criteria table of an approved spec (docs/specs/FEAT-xxx-<slug>/spec.md) into failing Vitest and Playwright tests - one test per AC-n with the id at the start of the title, unit tests for actions and Zod schemas, component tests for UI, exactly one e2e file per spec - verify they fail for an assertion reason with scripts/verify-red.sh, and commit them alone as test(FEAT-xxx). Use at the TDD red step, after the skeleton exists and before any implementation. Never writes or edits files outside tests.
---

# write-spec-tests

This is the hands-on form of the `test-writer` agent (`.claude/agents/test-writer.md`); same rules.

## Steps

1. Read the spec sections 2–5 and the skeleton files. Refuse if the spec is not `approved` or has more than 7 ACs.
2. For every `AC-n` write exactly one test whose title starts with `AC-n:` and whose assertion matches the
   measurable "Then" column word for word (same status, same keys, same count, same message).
   - Schema and `src/lib` functions → `src/lib/*.test.ts` (project `unit`, Prisma mocked via `vi.mock('@/lib/prisma')`).
   - Server Actions → `src/actions/*.test.ts` (mock `@/lib/<slice>` and `next/cache`; assert on the returned
     `ActionResult` and on `revalidatePath` only when the spec names the revalidated path).
   - Client components → `src/components/*.test.tsx` (Testing Library, `userEvent`; assert roles and text).
   - End-to-end flow → `e2e/FEAT-xxx-<slice>.spec.ts`; one file, `beforeEach` resets the rows it uses.
     An AC may appear in more than one layer; it must appear in at least one.
3. Replace the `it.todo` stubs from the skeleton; keep no `todo` or `skip`.
4. `pnpm lint && pnpm typecheck`, then `pnpm test` must show every new test failing with an assertion or
   `NotImplementedError`, never "Cannot find module" / syntax errors. Then `scripts/verify-red.sh FEAT-xxx` must exit 0.
5. Fill the Traceability table in the spec (test file :: title per AC); leave commit columns empty.
6. Commit only test files + the spec: `test(FEAT-xxx): failing acceptance tests for <feature>`.

## Guardrails

- Never touch `src/lib/*.ts`, `src/actions/*.ts`, components or pages (non-test). If a test cannot be written
  without an implementation change, report it; the skeleton commit is amended by a human decision, not here.
- Never make a test pass by asserting on the stub's error. Assert on the behavior the spec promises.
- No snapshot-only tests; no shared mutable state; no fixed ids.
