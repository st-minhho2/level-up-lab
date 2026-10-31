# §3 Database schema

Prisma, PostgreSQL. Conventions: model PascalCase singular, fields camelCase, table `@@map` snake_case plural,
`id` cuid, `createdAt`/`updatedAt` on every table, an index on every column used by a list `orderBy`.

```prisma
model Todo {
  id        String    @id @default(cuid())
  title     String    @db.VarChar(200)
  completed Boolean   @default(false)
  dueDate   DateTime? @db.Date
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@index([createdAt])
  @@map("todos")
}
```

Migrations are created only with `pnpm db:migrate --name <verb-noun>` against the local compose database and are
immutable once on `main`. `dueDate` (§15) is a nullable calendar date with no time of day and no time zone; null
means the todo has none, and it is not indexed because no list is ordered by it. The seed (`prisma/seed.ts`)
upserts three sample todos.

# §4 Environment and configuration

Validated once, at first use, by `src/lib/env.ts` (Zod). The process fails fast on a missing or malformed key.

| Key             | Default                       | Meaning                                                  |
| --------------- | ----------------------------- | -------------------------------------------------------- |
| `DATABASE_URL`  | — (required, `postgresql://`) | compose PostgreSQL; `?schema=wt_<slug>` per worktree     |
| `PORT`          | 3000                          | dev/start port; each worktree gets its own               |
| `NEXT_DIST_DIR` | `.next`                       | build output directory                                   |
| `UPLOAD_DIR`    | `./storage/uploads`           | per-worktree storage                                     |
| `CACHE_PREFIX`  | `main`                        | prefix for any cache or queue key (`cacheKey(env, key)`) |
| `NODE_ENV`      | `development`                 |                                                          |

## Function contracts

```ts
export function parseEnv(source: Record<string, string | undefined>): Env; // throws EnvError listing every issue
export function getEnv(): Env; // cached parseEnv(process.env)
export function cacheKey(env: Pick<Env, 'CACHE_PREFIX'>, key: string): string; // `${prefix}:${key}`
```

## Acceptance criteria

| ID     | Then                                                                                                                                                                                                 |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-4.1 | `parseEnv({ DATABASE_URL })` applies every default above                                                                                                                                             |
| AC-4.2 | a missing `DATABASE_URL`, a non-postgres URL, `PORT` outside 1–65535 or non-integer, or a `CACHE_PREFIX` outside `[a-z0-9_]+` throws `EnvError` whose message lists every failing key joined by `; ` |
