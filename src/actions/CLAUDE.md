# src/actions — Server Actions (§5, §6, §7, §9, §10)

`'use server'` at the top. An action is thin: parse input with a schema from `src/lib/todo-schema.ts` (input is
`unknown`/`FormData` at the boundary), call one `src/lib` function, `revalidatePath('/')`, return `ActionResult<T>`.
Errors travel as `{ ok: false, fieldErrors }`; actions never reject for an expected failure (§10, D-11): in
`createTodoAction`, `toggleTodoAction`, `updateTodoTitleAction` and `clearCompletedTodosAction` any error other than
`TodoNotFoundError` becomes `failure('form', MUTATION_FAILED_MESSAGE)` with nothing revalidated and nothing logged
(the Zod parse stays outside the `try`, so a title error keeps its `title` key). Signatures are the section's
"Function contracts" block; `createTodoAction(previous, formData)` fits `useActionState`. Mutation-tested.
