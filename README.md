# level-up-lab

![playbook level](https://img.shields.io/badge/AI--Driven%20Development-L6-2C5F2D) ![spec-driven + TDD](https://img.shields.io/badge/spec--driven-TDD-1E2761) ![agent](https://img.shields.io/badge/agent-Claude%20Code-36454F)

A small Next.js 15 full-stack app (todos in PostgreSQL) used as a personal lab for SupremeTech's AI-Driven
Development practice: numbered spec contract, backlog cards, red-first tests, independent review, one human gate,
with Claude Code as the single agent. The app is the vehicle; the point is the scaffolding around it.

This README is for people. Coding agents read `CLAUDE.md`.

## What is here

| Folder                    | Holds                                                                      |
| ------------------------- | -------------------------------------------------------------------------- |
| `spec/`                   | the numbered contract `src/` implements (§1–§8), the features map          |
| `backlog/`                | cards (`B<epic>.<n>`), the board, rulings (`D-n`), per-card role artifacts |
| `src/`, `prisma/`, `e2e/` | the app, its schema, Playwright tests                                      |
| `.claude/`                | agents (roles), skills, rules, hooks, agent docs                           |
| `scripts/`                | worktrees, red-test proof, next card, CI guards                            |
| `docs/`                   | design, ADRs, metrics, mistake log                                         |

## Stack

Next.js 15 App Router (Server Components, Route Handlers, Server Actions), TypeScript strict, pnpm, PostgreSQL +
Prisma 6, Zod, Vitest + Testing Library, Playwright, Stryker, Docker Compose, GitHub Actions, Lefthook, gitleaks,
Semgrep.

## Run it

```bash
scripts/setup-env.sh          # .env from .env.example, deps from the shared pnpm store, prisma generate
docker compose up -d          # PostgreSQL on localhost:5433
pnpm db:deploy && pnpm db:seed
pnpm dev                      # http://localhost:3000 (PORT=3005 if 3000 is taken)
```

Checks: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e`, `pnpm test:mutation`, `pnpm build`.

## How a card ships

`scripts/next-task.sh` picks the next eligible card. `/work-next` runs it as `dev-lead`: `spec-analyst` and
`advisor` fill `backlog/work/<card>/`, the lead writes a one-screen plan, **you approve it**, then `/tdd-loop`
(red test commit → green code commit), `/review-loop` (independent reviewer, every finding dispositioned, ≤ 3
passes), and a PR with Item / Plan / Map delta / Review. CI (lint, types, unit, e2e, mutation ≥ 70 %, Semgrep,
guards) and one human review gate the merge. Details: `.claude/docs/git-workflow.md`.
