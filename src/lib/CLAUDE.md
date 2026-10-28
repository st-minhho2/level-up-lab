# src/lib — domain logic, schemas, the Prisma client, env (§3–§6)

Read `.claude/rules/invariants.md` before touching `todos.ts` or `prisma.ts`.

| Module                   | Section | Role                                                                                              |
| ------------------------ | ------- | ------------------------------------------------------------------------------------------------- |
| `prisma.ts`              | §3      | the only Prisma client; `server-only`; never import from client code                              |
| `env.ts`                 | §4      | `parseEnv`, `getEnv`, `cacheKey`; fail fast                                                       |
| `todo-schema.ts`         | §5, §6  | Zod schemas; the 200-character limit and messages live here                                       |
| `todos.ts`               | §5, §6  | `listTodos`, `createTodo`, `toggleTodo`, `updateTodoTitle` (§6); `select` the fields the UI needs |
| `action-result.ts`       | §7      | `ActionResult<T>`, `failure`, `fieldErrorsOf`                                                     |
| `errors.ts`, `health.ts` | §7      | skeleton error, health report                                                                     |

Queries: query builder only; `$queryRaw` needs a comment, a reviewer and a card. `null` only at the database
boundary. Mutation testing covers this folder: a branch without an assertion is a survivor.
