---
paths:
  - 'prisma/**'
  - 'src/lib/**'
---

# Prisma: schema conventions and migration discipline

**Mistake this prevents:** a schema edited without a migration (works locally with `db push`, breaks CI and every
other worktree), an applied migration rewritten in place, and raw SQL pasted into an action to "save a round trip".

Derived from `../nodejs-typescript-coding-conventions.md` §4 (naming), §5 (no DB access outside the service layer),
§3 (`null` vs `undefined` is a project-wide choice).

## Schema

- Model names PascalCase singular (`Todo`), fields camelCase, table mapped with `@@map("todos")` (snake_case plural),
  columns mapped only when the name differs from camelCase.
- Every model: `id String @id @default(cuid())`, `createdAt DateTime @default(now())`, `updatedAt DateTime @updatedAt`.
- Enums only for fixed sets shared by several models; otherwise a string literal union in TypeScript.
- Index every column used in a `where` or `orderBy` of a list query (`@@index([createdAt])`).

## Migrations

- Change the schema, then run `pnpm db:migrate --name <verb-noun>` against the local compose database. That is the
  only way a migration is created. Never `prisma db push`, never `prisma migrate reset`, never hand-write SQL files.
- Schema change and its migration go in the same commit; read the generated SQL before committing.
- A migration that is on `main` is immutable. Fix forward with a new migration.
- `DATABASE_URL` must point at localhost / 127.0.0.1 / the compose `postgres` host. Check it with node
  (`node -e "console.log(new URL(process.env.DATABASE_URL).host)"`), never by printing the variable.
- Update `prisma/seed.ts` in the same commit when a table the seed touches changes.

## Queries

- `src/lib/prisma.ts` is the only client. Functions in `src/lib/<slice>.ts` own all queries for a slice.
- Raw SQL (`$queryRaw`, `$executeRaw`) only as a tagged template, only in `src/lib`, with a comment saying why the
  query builder could not express it, and called out in the PR so a reviewer reads it.
- `null` only at the database boundary; app types use `undefined` and optional fields. Map in `src/lib`.
- Never return a Prisma model to a client component as-is; select the fields the UI needs.
