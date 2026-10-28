# src/actions — Server Actions (§5, §6, §7)

`'use server'` at the top. An action is thin: parse input with a schema from `src/lib/todo-schema.ts` (input is
`unknown`/`FormData` at the boundary), call one `src/lib` function, `revalidatePath('/')`, return `ActionResult<T>`.
Errors travel as `{ ok: false, fieldErrors }`; only unexpected errors are rethrown. Signatures are the section's
"Function contracts" block; `createTodoAction(previous, formData)` fits `useActionState`. Mutation-tested.
