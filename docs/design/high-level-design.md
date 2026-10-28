# High-level design

```
browser ──RSC HTML──▶ src/app/page.tsx ──▶ src/lib/todos.ts ──▶ src/lib/prisma.ts ──▶ PostgreSQL (schema per worktree)
   │                                                        ▲
   └─form / click──▶ src/components/* ──▶ src/actions/todos.ts ──Zod (src/lib/todo-schema.ts)──┘  → revalidatePath('/')
```

- **Reads** happen in Server Components through `src/lib`; nothing is fetched from the browser.
- **Writes** happen only in Server Actions: parse at the boundary, one domain call, revalidate, return
  `ActionResult`. Errors are data, not exceptions, once they cross to the client.
- **Persistence**: Prisma with a single client (`server-only`), schema in §3, migrations immutable on `main`.
- **Isolation**: every task runs in its own worktree with its own port, PostgreSQL schema, build and cache
  directories (`scripts/worktree.sh`); nothing stateful is hard-coded (§4).
- **Quality gates** (§2) run locally (hooks, Lefthook) and in CI (lint, types, unit, e2e, mutation, Semgrep, guards).
- **Agents**: `dev-lead` orchestrates cards; `spec-analyst`, `advisor`, `test-writer`, `code-writer`, `reviewer`
  each own one step with hook-enforced write scopes; one human decision per card (plan approval); rulings as D-n.
