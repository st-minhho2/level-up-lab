# level-up-lab

Next.js 15 (App Router) + Prisma 6 + PostgreSQL lab for SupremeTech's AI-Driven Development playbook, target L6
(spec-driven + TDD). README.md has the narrative; this file has only what an agent cannot read from the code.
Claude Code is the single approved agent for this repo.

## Commands

```bash
pnpm install --frozen-lockfile   # pnpm only; never npm/yarn
pnpm dev                         # next dev on $PORT (default 3000); no --turbopack flag anywhere
pnpm build && pnpm start
pnpm lint                        # eslint + prettier --check   (pnpm lint:fix to repair)
pnpm typecheck                   # tsc --noEmit
pnpm test                        # vitest: unit (node) + component (jsdom); no DB needed
pnpm test:e2e                    # playwright; needs `docker compose up -d` and `pnpm db:deploy`
pnpm test:mutation               # stryker on src/lib + src/actions; fails below 70%
pnpm db:migrate --name <change>  # prisma migrate dev against the local compose DB only
pnpm db:deploy | db:generate | db:seed | db:studio
scripts/verify-red.sh FEAT-xxx   # proves the test(FEAT-xxx) commit fails for the right reason
```

## Layout

- `src/app/` Server Components by default; `src/app/api/**/route.ts` Route Handlers are read-only (GET).
- `src/actions/*.ts` Server Actions (`'use server'`): the only place mutations happen. Zod-validate, delegate to `src/lib`.
- `src/lib/` domain logic + `prisma.ts` (the one Prisma client, `server-only`) + `env.ts` (validated env). Mutation-tested.
- `src/components/` client components (`'use client'`) only when they need state or events.
- `prisma/` schema, migrations, `seed.ts`. `docs/specs/FEAT-xxx-<slug>/` one folder per task: `spec.md` (EARS, frontmatter = state) + role artifacts.
- Tests sit next to code: `*.test.ts` (node), `*.test.tsx` (jsdom). `e2e/` holds one Playwright file per spec.
- `docs/levels/LN.md` checklists, `docs/metrics.md`, `docs/mistake-log.md`. Scripts in `scripts/`.

## Boundaries (hooks in .claude/settings.json enforce the first three)

- Never read or print `.env*` (except `.env.example`), key files, `~/.ssh`, `~/.aws`, or secret-looking variables.
- Never run `rm -rf`, `git push --force`, `prisma migrate reset`, `prisma db push`, or any Prisma command against a
  non-local `DATABASE_URL`.
- Never edit a migration that is already on `main`; add a new one.
- Never import `@/lib/prisma` (or anything from `src/lib` that touches it) from a client component or `src/app/api`.
- Never add `eslint-disable`, `@ts-ignore`, `@ts-expect-error`; never change lint, tsconfig, CI, hooks or Stryker
  config inside a feature PR (CI rejects it without the `config-change-approved` label).
- Never edit `*.test.*` or `e2e/**` in a `feat(...)` commit; never weaken an assertion to make a test pass.
- No spec, no code: a feature starts as `docs/specs/FEAT-xxx-<slug>/spec.md` with the lead-approval box ticked.
- Pipeline roles write only inside their hook-enforced paths (task folder, tests, or src); state changes only
  through `scripts/task-status.sh`. The plan gate (`Plan approved by:` in `plan.md`) is never skipped.
- A change under `src/`, `prisma/`, `e2e/` ends with `/review-loop` (≤ 3 passes) and `mark-reviewed.sh`; the Stop
  hook blocks once otherwise. Rulings in `docs/decisions.md` (D-n) are settled: follow, never re-ask; a question
  only a person can answer goes through `/advise` and ends as `blocked`, not as a guess.

## Session rules

- One task per session. A task is one spec (or one skeleton, one red, or one green step of it). Finish or hand off;
  do not start a second task in the same context.
- `/clear` between tasks; `/compact` when the context is about half full or before a long test run. Stale context
  makes the agent repeat mistakes already logged in `docs/mistake-log.md`.
- Claude Code is the only approved agent here. If the team ever switches tool, convert `CLAUDE.md`, `.claude/rules`,
  `.claude/skills` and `.claude/agents` once, in one PR, and delete the old copies. Never maintain two sets.
- Multi-file or unclear work starts in plan mode (`.claude/rules/planning.md`). One-sentence diffs skip it.
- `/work-next [FEAT-xxx]` runs the backlog pipeline (`docs/pipeline.md`): one task per invocation, stops once for
  plan approval, ends with a pull request.
- One task = one worktree = one branch (`scripts/worktree.sh <task>`); never work in someone else's checkout.
