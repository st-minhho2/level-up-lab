# prisma — schema, migrations, seed (§3)

Conventions in §3. Change the schema, then `pnpm db:migrate --name <verb-noun>` against the local compose database
(`DATABASE_URL` host must be localhost / 127.0.0.1 / postgres; the hook checks). Read the generated SQL; schema,
migration and seed go in one commit. A migration on `main` is immutable: fix forward. Never `db push`, never
`migrate reset`, never hand-written SQL files. `seed.ts` is idempotent (`upsert`).
