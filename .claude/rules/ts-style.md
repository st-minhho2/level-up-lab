# TypeScript, App Router and Prisma style

Derived from the team's Node.js/TypeScript conventions; the linters enforce most of it (`pnpm lint`).

- Strict TypeScript, no `any` (use `unknown` + narrowing), no `as unknown as`, explicit return types on exports,
  interfaces for shapes (no `I` prefix), string-literal unions over enums, `readonly` where it never changes,
  `undefined` in app types and `null` only at the database boundary.
- Files kebab-case, one exported component or class per file, names say what they are (`isCompleted`, `listTodos`).
- `async/await` only; no floating promises (`void` with a comment if truly fire-and-forget); `Promise.all` for
  independent calls.
- **App Router.** Server Components by default; `'use client'` only for state, effects, events. Reads in Server
  Components through `src/lib`; mutations only in `src/actions/*.ts` (`'use server'`): Zod parse → one `src/lib`
  call → `revalidatePath` → `ActionResult`. Route Handlers are GET-only. Never fetch your own `/api` from a client.
- **Prisma.** Only `src/lib/prisma.ts` (`server-only`). Query builder with `select`; `$queryRaw` only as a tagged
  template in `src/lib` with a comment and a reviewer. Models PascalCase singular, `@@map` snake_case plural, cuid
  ids, `createdAt`/`updatedAt`, an index on every list `orderBy`. Migrations via `pnpm db:migrate` on the local
  compose database only; immutable once on `main`.
- Errors are classes; `console` is not a logger anywhere in `src/`, unit tests included (spy on
  `process.stderr.write` instead); it is allowed only in config files, `prisma/seed.ts`, `vitest.setup.ts` and
  `e2e/` (`eslint.config.mjs`). No `TODO` without a card id. Comments say why, not what.
