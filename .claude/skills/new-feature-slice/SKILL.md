---
name: new-feature-slice
description: Scaffold the skeleton for an approved spec (specs/FEAT-xxx-<name>.md) as one vertical slice - Server Component page under src/app/<slice>, Server Action file under src/actions with Zod-validated stubs that throw NotImplementedError, the Zod schema in src/lib/<slice>-schema.ts, a src/lib/<slice>.ts stub, and it.todo test stubs titled with each AC id. Use when a spec is approved and no files for that slice exist yet; this is the chore(FEAT-xxx) skeleton commit that lets red tests fail on behavior instead of on imports. Do not use to write real tests (write-spec-tests) or real logic (implementer agent).
---

# new-feature-slice

Input: the spec path and a slice name in kebab-case (`todo-list` → files `todo-list.*`, exports `camelCase`).

## Steps

1. Read the spec. Refuse if `Status` is not `approved` or the "Lead approves spec" box is unticked.
2. Create, in this order, nothing more:
   - `src/lib/<slice>-schema.ts`: one Zod schema per action input, inferred types exported. Limits come from the
     spec's REQ table, never invented.
   - `src/lib/<slice>.ts`: one exported async function per behavior, each body `throw new NotImplementedError('<fn>')`.
     Export `NotImplementedError` from `src/lib/errors.ts` if it does not exist.
   - `src/actions/<slice>.ts`: `'use server'`; one action per mutation; parses with the schema, returns
     `ActionResult`, delegates to `src/lib/<slice>.ts`. The delegate throws, so the action is red by construction.
   - `src/app/<slice>/page.tsx` (or `src/app/page.tsx` when the spec says the slice is the home page): Server
     Component that calls the list function and renders a placeholder `<main>` with an `<h1>`.
   - `src/components/<slice>-*.tsx` client components only if the spec needs interactivity; empty shells.
   - Test stubs: `src/lib/<slice>-schema.test.ts`, `src/lib/<slice>.test.ts`, `src/actions/<slice>.test.ts`,
     component `*.test.tsx` as needed, `e2e/FEAT-xxx-<slice>.spec.ts`; each contains only
     `it.todo('AC-n: <criterion summary>')` lines so `pnpm test` stays green and the AC list is visible.
3. If the spec needs a table, stop and run the `add-migration` skill first, then continue.
4. `pnpm lint && pnpm typecheck && pnpm test` must pass (todos are not failures).
5. Commit alone: `chore(FEAT-xxx): scaffold <slice> slice`. No behavior, no real assertions in this commit.

## Guardrails

- Never implement behavior here, even "obvious" one-liners; the green commit owns them.
- Never create files outside the list above. If the spec seems to need more, the spec changes first.
