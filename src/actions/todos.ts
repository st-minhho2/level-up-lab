'use server';

// §5, §6, §9, §15: Server Actions for the todo list; §10: a failed create, toggle, edit, clear or due-date change
// resolves to a `form` error; §11: that swallowed failure is logged once, with the action's name and the thrown
// value only.
import { revalidatePath } from 'next/cache';
import { failure, fieldErrorsOf, MUTATION_FAILED_MESSAGE, type ActionResult } from '@/lib/action-result';
import { setTodoDueDateSchema } from '@/lib/todo-due-date';
import { createTodoSchema, toggleTodoSchema, updateTodoTitleSchema } from '@/lib/todo-schema';
import {
  clearCompletedTodos,
  createTodo,
  setTodoDueDate,
  TodoNotFoundError,
  toggleTodo,
  updateTodoTitle,
  type Todo,
} from '@/lib/todos';
import { logMutationFailure } from '@/lib/logger';

// Signature fits React's useActionState: (previousState, formData) => newState.
export async function createTodoAction(
  _previous: ActionResult<Todo> | null,
  formData: FormData,
): Promise<ActionResult<Todo>> {
  const rawTitle = formData.get('title');
  const parsed = createTodoSchema.safeParse({ title: typeof rawTitle === 'string' ? rawTitle : '' });
  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrorsOf(parsed.error) };
  }
  try {
    const todo = await createTodo(parsed.data.title);
    revalidatePath('/');
    return { ok: true, data: todo };
  } catch (error) {
    // §10: the form shows the message and nothing is revalidated; §11: the cause is logged, never returned.
    logMutationFailure('createTodoAction', error);
    return failure('form', MUTATION_FAILED_MESSAGE);
  }
}

export async function toggleTodoAction(id: string): Promise<ActionResult<Todo>> {
  const parsed = toggleTodoSchema.safeParse({ id });
  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrorsOf(parsed.error) };
  }
  try {
    const todo = await toggleTodo(parsed.data.id);
    revalidatePath('/');
    return { ok: true, data: todo };
  } catch (error) {
    if (error instanceof TodoNotFoundError) {
      return failure('id', 'Todo not found');
    }
    // §10 / D-11: the row shows the message and nothing is revalidated; §11: the cause is logged, never returned.
    logMutationFailure('toggleTodoAction', error);
    return failure('form', MUTATION_FAILED_MESSAGE);
  }
}

// §6 edit title.
export async function updateTodoTitleAction(id: string, title: string): Promise<ActionResult<Todo>> {
  const parsed = updateTodoTitleSchema.safeParse({ id, title });
  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrorsOf(parsed.error) };
  }
  try {
    const todo = await updateTodoTitle(parsed.data.id, parsed.data.title);
    revalidatePath('/');
    return { ok: true, data: todo };
  } catch (error) {
    if (error instanceof TodoNotFoundError) {
      return failure('id', 'Todo not found');
    }
    // §10 / D-11, §11: same as toggle.
    logMutationFailure('updateTodoTitleAction', error);
    return failure('form', MUTATION_FAILED_MESSAGE);
  }
}

// §9 clear completed: no input to parse, so there is no Zod step; `/` is revalidated even when nothing was deleted
// (REQ-9.3, REQ-9.7). §10: a failed delete resolves to the `form` error with nothing revalidated; §11: and is logged.
export async function clearCompletedTodosAction(): Promise<ActionResult<{ deleted: number }>> {
  try {
    const deleted = await clearCompletedTodos();
    revalidatePath('/');
    return { ok: true, data: { deleted } };
  } catch (error) {
    logMutationFailure('clearCompletedTodosAction', error);
    return failure('form', MUTATION_FAILED_MESSAGE);
  }
}

// §15 due date: set or clear ('' parses to undefined) one todo's due date.
export async function setTodoDueDateAction(id: string, dueDate: string): Promise<ActionResult<Todo>> {
  const parsed = setTodoDueDateSchema.safeParse({ id, dueDate });
  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrorsOf(parsed.error) };
  }
  try {
    const todo = await setTodoDueDate(parsed.data.id, parsed.data.dueDate);
    revalidatePath('/');
    return { ok: true, data: todo };
  } catch (error) {
    if (error instanceof TodoNotFoundError) {
      return failure('id', 'Todo not found');
    }
    // §10 (REQ-15.10), §11: same as toggle.
    logMutationFailure('setTodoDueDateAction', error);
    return failure('form', MUTATION_FAILED_MESSAGE);
  }
}
