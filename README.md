# level-up-lab

Personal lab for reaching **L6 (spec-driven + TDD)** of SupremeTech's AI-Driven Development level-up playbook, with
Claude Code as the single approved agent. A small Next.js 15 full-stack app (todos in Postgres) is the vehicle; the
point is the scaffolding around it: rules, skills, hooks, CI gates, worktree isolation and EARS specs.

| Level | Theme                                  | Checklist                              |
| ----- | -------------------------------------- | -------------------------------------- |
| L1    | Basic setup, "ready on day one"        | [docs/levels/L1.md](docs/levels/L1.md) |
| L2    | Advanced setup, controlled environment | [docs/levels/L2.md](docs/levels/L2.md) |
| L3    | Plan-first                             | [docs/levels/L3.md](docs/levels/L3.md) |
| L4    | Isolation, tasks never collide         | [docs/levels/L4.md](docs/levels/L4.md) |
| L5    | Enforcement, checks that never forget  | [docs/levels/L5.md](docs/levels/L5.md) |
| L6    | Spec-driven + TDD, specs define done   | [docs/levels/L6.md](docs/levels/L6.md) |

Metrics for every level: [docs/metrics.md](docs/metrics.md). Repeated agent mistakes and what now prevents them:
[docs/mistake-log.md](docs/mistake-log.md).

## Stack

Next.js 15 App Router (Server Components, Route Handlers, Server Actions), TypeScript strict, pnpm, PostgreSQL +
Prisma 6, Zod, Vitest + Testing Library, Playwright, Stryker, Docker Compose, GitHub Actions, Lefthook, gitleaks,
Semgrep.

## Run it

```bash
scripts/setup-env.sh          # .env from .env.example, deps from the shared pnpm store, prisma generate
docker compose up -d          # Postgres on localhost:5433
pnpm db:deploy && pnpm db:seed
pnpm dev                      # http://localhost:3000
```

Checks: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e`, `pnpm test:mutation`, `pnpm build`.

## Ship a feature (L6 flow)

1. `specs/FEAT-xxx-<name>.md` from `specs/TEMPLATE.md`; lead ticks "approves spec". Commit `docs(FEAT-xxx): ...`.
2. `scripts/worktree.sh FEAT-xxx-<name>` and work there.
3. Skeleton (`new-feature-slice` skill) → `chore(FEAT-xxx): ...`.
4. Red tests (`write-spec-tests` skill / `test-writer` agent) → `scripts/verify-red.sh FEAT-xxx` → `test(FEAT-xxx): ...`.
5. Green (`implementer` agent, never touches tests) → `feat(FEAT-xxx): ...`.
6. PR with the template's Plan section; CI (lint, types, unit, e2e, mutation ≥ 70%, Semgrep, guards) and one human
   review gate the merge.
