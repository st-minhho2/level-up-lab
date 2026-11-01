# src/lib — domain logic, schemas, the Prisma client, env (§3–§19)

Read `.claude/rules/invariants.md` before touching `todos.ts` or `prisma.ts`.

| Module                   | Section            | Role                                                                                                                                                                                              |
| ------------------------ | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `prisma.ts`              | §3                 | the only Prisma client; `server-only`; never import from client code                                                                                                                              |
| `env.ts`                 | §4                 | `parseEnv`, `getEnv`, `cacheKey`; fail fast                                                                                                                                                       |
| `todo-schema.ts`         | §5, §6             | Zod schemas; the 200-character limit and messages live here                                                                                                                                       |
| `todos.ts`               | §5, §6, §9, §15    | `Todo`, `TodoNotFoundError`, `listTodos`, `createTodo`, `toggleTodo`, `updateTodoTitle` (§6), `clearCompletedTodos` (§9), `setTodoDueDate` (§15); `select` the fields the UI needs                |
| `action-result.ts`       | §7, §10            | `ActionResult<T>`, `failure`, `fieldErrorsOf`, `MUTATION_FAILED_MESSAGE` (§10)                                                                                                                    |
| `errors.ts`, `health.ts` | §7                 | skeleton error, health report                                                                                                                                                                     |
| `logger.ts`              | §11, §14, §15, §19 | `logMutationFailure`: one JSON line on stderr, `DATABASE_URL` redacted; `MutationActionName` gains a member per mutating action; no `server-only`, configuration only via `getEnv()`              |
| `todo-filter.ts`         | §12                | `TodoFilter`, `parseTodoFilter`, `filterTodos`, `emptyListMessage`; pure: no Prisma, no `server-only`                                                                                             |
| `todo-count.ts`          | §13                | `countRemaining`, `remainingLabel`; pure: no Prisma, no `server-only`                                                                                                                             |
| `todo-complete-all.ts`   | §14                | `completeAllTodos`: one `updateMany` over the open todos, returns the count                                                                                                                       |
| `todo-due-date.ts`       | §15                | `DUE_DATE_INVALID_MESSAGE`, `setTodoDueDateSchema`, `dueDateToDate`, `dueDateOf`; pure: no Prisma, no `server-only`                                                                               |
| `todo-search.ts`         | §16                | `SEARCH_QUERY_MAX_LENGTH`, `parseSearchQuery`, `searchTodos`, `searchEmptyMessage`; pure: no Prisma, no `server-only`                                                                             |
| `todo-overdue.ts`        | §17                | `OVERDUE_LABEL`, `todayOf`, `isOverdue(dueDate, today, completed)`: string comparison of two `YYYY-MM-DD` days (the browser's local day), never when completed; pure: no Prisma, no `server-only` |
| `title-count.ts`         | §18                | `titleCharacterCount`, `titleCounterText`: the trimmed UTF-16 length §5 judges; pure, imported by the client form                                                                                 |
| `todo-delete.ts`         | §19                | `deleteTodo`: one `deleteMany`, `TodoNotFoundError` (from `todos.ts`) when nothing matched                                                                                                        |

Queries: query builder only; `$queryRaw` needs a comment, a reviewer and a card. `null` only at the database
boundary. Mutation testing covers this folder: a branch without an assertion is a survivor.
