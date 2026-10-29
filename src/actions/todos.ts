'use server';

// §5, §6, §9: Server Actions for the todo list; §10: a failed create, toggle, edit or clear resolves to a `form` error.
import { revalidatePath } from 'next/cache';
import { failure, fieldErrorsOf, MUTATION_FAILED_MESSAGE, type ActionResult } from '@/lib/action-result';
import { createTodoSchema, toggleTodoSchema, updateTodoTitleSchema } from '@/lib/todo-schema';
import {
  clearCompletedTodos,
  createTodo,
  TodoNotFoundError,
  toggleTodo,
  updateTodoTitle,
  type Todo,
} from '@/lib/todos';

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
  } catch {
    // §10: the form shows the message and nothing is revalidated; the cause is not logged until a logger card lands.
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
    // §10 / D-11: the row shows the message and nothing is revalidated; the cause is not logged until a logger card lands.
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
    // §10 / D-11: same as toggle.
    return failure('form', MUTATION_FAILED_MESSAGE);
  }
}

// §9 clear completed: no input to parse, so there is no Zod step; `/` is revalidated even when nothing was deleted
// (REQ-9.3, REQ-9.7). §10: a failed delete resolves to the `form` error with nothing revalidated.
export async function clearCompletedTodosAction(): Promise<ActionResult<{ deleted: number }>> {
  try {
    const deleted = await clearCompletedTodos();
    revalidatePath('/');
    return { ok: true, data: { deleted } };
  } catch {
    return failure('form', MUTATION_FAILED_MESSAGE);
  }
}
