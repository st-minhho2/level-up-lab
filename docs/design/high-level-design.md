# High-level design

```
browser ──RSC HTML──▶ src/app/page.tsx ──▶ src/lib/todos.ts ──▶ src/lib/prisma.ts ──▶ PostgreSQL (schema per worktree)
   │                                                        ▲
   └─form / click──▶ src/components/* ──▶ src/actions/todos.ts ──Zod (src/lib/todo-schema.ts)──┘  → revalidatePath('/')
                                                    └─ on failure ──▶ src/lib/logger.ts ──▶ stderr (one JSON line)
```

- **Reads** happen in Server Components through `src/lib`; nothing is fetched from the browser.
- **Writes** happen only in Server Actions: parse at the boundary, one domain call, revalidate, return
  `ActionResult`. Create, toggle, edit title (§6) and clear completed (§9) are the four mutations.
- **Clear completed** (§9): `clearCompletedTodos` deletes every completed todo in one call and returns the count; the
  button is always rendered and disabled while nothing is completed (D-10).
- **Failures are data** (§10, D-11): an action never rejects for an expected failure. `TodoNotFoundError` and invalid
  input keep their §5/§6 results; any other error becomes a `fieldErrors.form` message (`Could not save, try again`)
  with no revalidation. The component shows it beside its control, the create form keeps the typed title, the edit
  row stays open with its draft, and the next success clears the message.
- **Logging** (§11, D-12, ADR-004): each swallowed failure writes one JSON line (`level`, `time`, `msg`, `action`,
  `error`) to stderr from `src/lib/logger.ts`, with the database URL and its secret part replaced by `[redacted]`,
  message and stack cut to 500/2000 characters, and never the typed input. The person sees nothing from it; a logging
  failure never changes the result.
- **Persistence**: Prisma with a single client (`server-only`), schema in §3, migrations immutable on `main`.
- **Isolation**: every task runs in its own worktree with its own port, PostgreSQL schema, build and cache
  directories (`scripts/worktree.sh`); nothing stateful is hard-coded (§4).
- **Quality gates** (§2) run locally (hooks, Lefthook) and in CI (lint, types, unit, e2e, mutation, Semgrep, guards).
- **Agents**: `dev-lead` orchestrates cards; `spec-analyst`, `advisor`, `test-writer`, `code-writer`, `reviewer`
  each own one step with hook-enforced write scopes; one human decision per card (plan approval); rulings as D-n.
