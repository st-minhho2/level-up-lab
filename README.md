# level-up-lab

![playbook level](https://img.shields.io/badge/AI--Driven%20Development-L7-2C5F2D) ![spec-driven + TDD](https://img.shields.io/badge/spec--driven-TDD-1E2761) ![agent](https://img.shields.io/badge/agent-Claude%20Code-36454F)

A small Next.js 15 full-stack app (todos in PostgreSQL) used as a personal lab for SupremeTech's AI-Driven
Development practice: numbered spec contract, backlog cards, red-first tests, independent review, one human gate
per card, and parallel delivery (up to three card sessions at once, each in its own worktree), with Claude Code as
the only agent. The app is the vehicle; the point is the scaffolding around it.

This README is for people. Coding agents read `CLAUDE.md`.

## What is here

| Folder                    | Holds                                                                      |
| ------------------------- | -------------------------------------------------------------------------- |
| `spec/`                   | the numbered contract `src/` implements (§1–§22), the features map         |
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
`advisor` fill `backlog/work/<card>/`, `dev-lead` writes a one-screen plan, the `reviewer` reviews it, **you approve
it**, then `/tdd-loop`
(red test commit → green code commit), `/review-loop` (independent reviewer, every finding dispositioned, ≤ 3
passes), and a PR with Item / Plan / Map delta / Review. CI (lint, types, unit, e2e, mutation ≥ 70 %, Semgrep,
guards) and one human review gate the merge. Details: `.claude/docs/git-workflow.md`.

## Parallel delivery

Up to three cards run at once, each in its own session and worktree (`scripts/worktree.sh`: its own port and Postgres
schema). `scripts/next-task.sh` refuses a fourth card in progress and a card whose plan Files overlap one in progress;
the plan-scope hook refuses a write outside the approved plan. Each session opens a draft PR at the plan gate and
marks it ready only after merging `origin/main` with green CI, so the lead reviews plans and PRs in batches.
Batches are measured in `docs/metrics.md` against D-18 (throughput, lead time, change failure rate, uncaught plan
deviations); batches 6 and 7 met every target. The CI reviewer (`.github/workflows/review.yml`) waits for a key (D-26).
