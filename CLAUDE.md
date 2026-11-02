# level-up-lab

Next.js 15 (App Router) + Prisma 6 + PostgreSQL. A single-person todo list is the vehicle; the point is the way
work flows: numbered spec → backlog card → red test → green code → independent review → PR. README.md is for people;
this file and the nested `CLAUDE.md` files are what an agent needs to act.

| Need                           | Read                                                                                |
| ------------------------------ | ----------------------------------------------------------------------------------- |
| What `src/` must do            | `spec/technical-requirements.md` (index) → `spec/contracts/<§>.md`                  |
| Which feature lives where      | `spec/features-map.md`                                                              |
| What to work on, in what order | `backlog/README.md`, cards in `backlog/plan/`, rulings in `backlog/00-decisions.md` |
| How code is laid out           | `src/CLAUDE.md`, then the package's `CLAUDE.md`                                     |
| How a task is run end to end   | `.claude/agents/dev-lead.md`, `.claude/docs/git-workflow.md`                        |
| What the hooks block           | `.claude/docs/hooks.md`                                                             |

## Non-negotiables

- **The spec wins.** Every function in `src/` implements a numbered section. Changing behavior without a section to
  point at is a bug, not a feature. Code and spec disagree → report (`/spec-trace`), never edit the spec to match.
- **Tests first, tests untouched.** A card's tests land red in their own `test(...)` commit, proven by
  `scripts/verify-red.sh`; the `feat(...)` commit that turns them green touches no test file (CI rejects it).
- **Mutations only through Server Actions**, Zod at the boundary, Prisma only in `src/lib` (`server-only`), no raw SQL.
- **Open the session in the repo root** (or a worktree), never a parent folder: Claude Code loads `.claude/settings.json`
  hooks only from the launch directory. Without them `scripts/require-hooks.sh` refuses commits and new worktrees.
- **The main checkout is never edited.** Work in a worktree (`scripts/worktree.sh`), commit, push the branch, open a
  PR; never merge, never force push, never bypass a hook.
- **Secrets stay out.** Never read or print `.env*` (except `.env.example`), keys, `~/.ssh`, `~/.aws`; hooks block it.
- **Ask before** any dependency, tool, CI, hook or configuration change: the lead approves it in the plan, then the
  agent adds the `config-change-approved` label to the PR (D-19); merging stays the lead's.

## Rules

Every `.claude/rules/*.md` loads at launch into each session and subagent (none has `paths:` frontmatter):

| File               | Holds                                                                     |
| ------------------ | ------------------------------------------------------------------------- |
| `invariants.md`    | the eight things that may never bend; a task that needs one bent stops    |
| `spec-fidelity.md` | the spec is the contract; signatures, constants and messages come from it |
| `ts-style.md`      | TypeScript, App Router and Prisma conventions                             |
| `testing.md`       | placement, `AC-§.n` titles, mocks at boundaries only, never weaken        |
| `planning.md`      | one-screen plan, one human approval, diff compared to plan                |

## Commands

Run from the worktree you were given (`.worktrees/<slug>/`), never from the main checkout.

```bash
pnpm install --frozen-lockfile    # pnpm only
pnpm lint · pnpm typecheck · pnpm test · pnpm test:e2e · pnpm test:mutation · pnpm build
pnpm db:migrate --name <verb-noun> # local compose PostgreSQL only; migrations are immutable once on main
scripts/verify-red.sh B1.2        # proves the card's test commit is red on behavior
scripts/next-task.sh [--list]     # the next eligible card / the board
scripts/card-status.sh B1.2 Done "<evidence>"
.claude/hooks/mark-reviewed.sh    # clears the review gate after /review-loop
```

`pnpm test` needs no database; `test:e2e`, `db:*` need `docker compose up -d` (PostgreSQL on localhost:5433).

## Map

| Path              | Contents                                                   | Spec §                       |
| ----------------- | ---------------------------------------------------------- | ---------------------------- |
| `src/app/`        | Server Components, `api/health` Route Handler              | §7, §12–§14, §16             |
| `src/actions/`    | Server Actions (`'use server'`): the only mutations        | §5–§7, §9–§11, §14, §15, §19 |
| `src/lib/`        | domain logic, Zod schemas, the Prisma client, env          | §3–§7, §9–§22                |
| `src/components/` | client components (`'use client'`)                         | §6, §7, §9, §10, §12–§22     |
| `prisma/`         | schema, migrations, seed                                   | §3                           |
| `e2e/`            | Playwright, one file per section (`05-todos.spec.ts`)      | §2                           |
| `spec/`           | the contract (`contracts/`, `features-map.md`)             | —                            |
| `backlog/`        | cards, board, decisions, `work/<card>/` artifacts          | —                            |
| `docs/`           | design, ADRs, metrics, mistake log                         | —                            |
| `scripts/`        | worktree, verify-red, next-task, card-status, `ci/` guards | —                            |

## Architecture in one pass

`page.tsx` (RSC) → `src/lib/todos.ts` → `src/lib/prisma.ts` → PostgreSQL for reads. Client components call a Server
Action in `src/actions/todos.ts` → Zod schema in `src/lib/todo-schema.ts` → `src/lib/todos.ts` → `revalidatePath('/')`
→ the RSC re-renders. `src/lib/env.ts` validates configuration once. Nothing else talks to the database.

## How coding tasks finish here

```
implement → /review-loop → disposition every finding → fix → re-verify → re-review if needed (≤ 3 passes)
```

- **Stop hook**: ending a turn blocks once while `src/`, `prisma/` or `e2e/` changed without a recorded review.
  Only `.claude/hooks/mark-reviewed.sh` clears it (lint, typecheck, tests re-run). Stopping deliberately with the
  review incomplete: say so and name what is unreviewed; never clear the gate to silence it.
- **PostToolUse hook**: prettier and `eslint --fix` after each edit.
- **Report**: answer first, numbers over adjectives, `[unverified]` for anything not run, one "Waiting on you" list.

## Skills

| Skill                                  | When                                                                                                    |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `/work-next [B1.2]`                    | run a card end to end as `dev-lead`: analyse → advise → plan → **human approval** → build → review → PR |
| `/tdd-loop`                            | test-writer → red gate → code-writer → green gate                                                       |
| `/review-loop`                         | the mandatory finish for any `src/`, `prisma/`, `e2e/` change                                           |
| `/advise`                              | a blocking question about what governs (spec vs code, silence, conflict, needs a ruling)                |
| `/spec-trace`                          | code vs spec § drift, both directions                                                                   |
| `/new-feature-slice`, `/add-migration` | skeleton for a section; schema change with migration                                                    |
