'use server';

// §5, §6: Server Actions for the todo list.
import { revalidatePath } from 'next/cache';
import { failure, fieldErrorsOf, type ActionResult } from '@/lib/action-result';
import { createTodoSchema, toggleTodoSchema, updateTodoTitleSchema } from '@/lib/todo-schema';
import { createTodo, TodoNotFoundError, toggleTodo, updateTodoTitle, type Todo } from '@/lib/todos';

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
  const todo = await createTodo(parsed.data.title);
  revalidatePath('/');
  return { ok: true, data: todo };
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
    throw error;
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
    throw error;
  }
}
