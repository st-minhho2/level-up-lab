---
name: add-migration
description: Change prisma/schema.prisma and create the matching Prisma migration against the local docker-compose Postgres only, then update prisma/seed.ts and regenerate the client. Use whenever a feature needs a new table, column, index, enum or relation. Never for prisma db push, migrate reset, editing an existing migration, or any non-local DATABASE_URL.
---

# add-migration

## Steps

1. Confirm the target host is local without printing the URL:
   `node -e "const h=new URL(process.env.DATABASE_URL).hostname;if(!['localhost','127.0.0.1','postgres'].includes(h)){console.error('non-local host');process.exit(1)}"`
   (load `.env` with `set -a; . ./.env; set +a` in the same shell first). Non-local → stop and tell the human.
2. Make sure Postgres is up: `docker compose up -d` and wait for `docker compose ps` to show `healthy`.
3. Edit `prisma/schema.prisma` following `.claude/rules/prisma.md` (PascalCase model, `@@map` snake_case plural, cuid id,
   `createdAt`/`updatedAt`, index on `orderBy`/`where` columns).
4. `pnpm db:migrate --name <verb-noun>` (for example `add-todos`). Read the generated
   `prisma/migrations/<timestamp>_<name>/migration.sql`; if it drops or rewrites a column with data, stop and ask.
5. Update `prisma/seed.ts` so `pnpm db:seed` still runs and seeds the new table with two or three rows a developer
   can see in the UI. Seeds are idempotent (`upsert` or delete-then-create inside a transaction).
6. `pnpm db:generate && pnpm typecheck && pnpm test`.
7. Stage schema, migration folder and seed together. The commit belongs to the skeleton step:
   `chore(FEAT-xxx): add <table> table` (or fold into the slice skeleton commit if asked).

## Guardrails

- Never edit a migration directory that already exists on `main`.
- Never run `prisma migrate deploy` from this skill; CI and `scripts/worktree.sh` own that.
- A migration without a schema diff (or the reverse) is a bug; both or neither.
