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

## Ship a feature

The backlog is `docs/specs/` (one folder per task, see [docs/pipeline.md](docs/pipeline.md)). `/work-next` picks
the next ready task and runs the role chain `spec-analyst → advisor → dev-lead → (you approve the plan) →
tech-lead → skeleton → test-writer → implementer → tech-lead → pull request`. CI (lint, types, unit, e2e, mutation
≥ 70%, Semgrep, guards) and one human review gate the merge.

Manual fallback, same commits: spec (`docs(FEAT-xxx)`) → `scripts/worktree.sh` → skeleton (`new-feature-slice`,
`chore`) → red (`write-spec-tests`, `scripts/verify-red.sh`, `test`) → green (`implementer`, `feat`) → PR with the
template's Plan section.
