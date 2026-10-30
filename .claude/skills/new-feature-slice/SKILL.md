---
name: new-feature-slice
description: 'Scaffold the skeleton for a card whose spec section exists and whose plan is approved - stubs under src/lib, src/actions, src/components and src/app that reject with NotImplementedError, the Zod schema shape, and it.todo stubs titled with each AC-§.n - so the red tests fail on behavior instead of on imports. Commit as chore(<pkg>): <card> skeleton. Do not use to write real tests (/tdd-loop) or real logic (code-writer).'
---

# new-feature-slice

Input: the card id, its section file and a slice name in kebab-case (`todo-list` → files `todo-list.*`, exports `camelCase`).

## Steps

1. Read the section and `backlog/work/<card>/plan.md`. Refuse if the plan has no `Plan approved by:` line.
2. Create, in this order, nothing more:
   - `src/lib/<slice>-schema.ts`: one Zod schema per action input, inferred types exported. Limits come from the
     section's function contracts, never invented.
   - `src/lib/<slice>.ts`: one exported async function per behavior, each body `throw new NotImplementedError('<fn>')`.
     Export `NotImplementedError` from `src/lib/errors.ts` if it does not exist.
   - `src/actions/<slice>.ts`: `'use server'`; one action per mutation; parses with the schema, returns
     `ActionResult`, delegates to `src/lib/<slice>.ts`. The delegate throws, so the action is red by construction.
   - `src/app/<slice>/page.tsx` (or `src/app/page.tsx` when the spec says the slice is the home page): Server
     Component that calls the list function and renders a placeholder `<main>` with an `<h1>`.
   - `src/components/<slice>-*.tsx` client components only if the spec needs interactivity; empty shells.
   - Test stubs: `src/lib/<slice>-schema.test.ts`, `src/lib/<slice>.test.ts`, `src/actions/<slice>.test.ts`,
     component `*.test.tsx` as needed, `e2e/<nn>-<slice>.spec.ts`; each contains only
     `it.todo('AC-§.n: <criterion summary>')` lines so `pnpm test` stays green and the AC list is visible.
3. If the spec needs a table, stop and run the `add-migration` skill first, then continue.
4. `pnpm lint && pnpm typecheck && pnpm test` must pass (todos are not failures).
5. Commit alone: `chore(<pkg>): <card> skeleton`. No behavior, no real assertions in this commit.

## Guardrails

- Never implement behavior here, even "obvious" one-liners; the green commit owns them.
- Never create files outside the list above. If the section seems to need more, the section changes first (§8).
