# src/actions — Server Actions (§5, §6, §7, §9, §10, §11, §14, §15, §19)

`'use server'` at the top. An action is thin: parse input with a schema from `src/lib/todo-schema.ts`
(`setTodoDueDateAction`'s comes from `src/lib/todo-due-date.ts`, §15; input is `unknown`/`FormData` at the boundary),
call one `src/lib` function, `revalidatePath('/')`, return `ActionResult<T>`. Errors travel as `{ ok: false,
fieldErrors }`; actions never reject for an expected failure (§10, D-11): in `createTodoAction`, `toggleTodoAction`,
`updateTodoTitleAction`, `clearCompletedTodosAction`, `setTodoDueDateAction` (`todos.ts`), `completeAllTodosAction`
(`complete-all.ts`, §14, no input so no Zod step) and `deleteTodoAction` (`delete-todo.ts`, §19; reuses
`toggleTodoSchema`) any error other than `TodoNotFoundError` becomes `failure('form', MUTATION_FAILED_MESSAGE)` with
nothing revalidated and the cause written once by `logMutationFailure('<the action's name>', error)` (§11) before the
return (the Zod parse stays outside the `try`, so a title error keeps its `title` key and is not logged). Signatures
are the section's "Function contracts" block; `createTodoAction(previous, formData)` fits `useActionState`.
Mutation-tested.
