'use server';

// §19 delete a todo; §10 failure feedback and §11 logging as toggleTodoAction.
import { revalidatePath } from 'next/cache';
import { failure, fieldErrorsOf, MUTATION_FAILED_MESSAGE, type ActionResult } from '@/lib/action-result';
import { logMutationFailure } from '@/lib/logger';
import { deleteTodo } from '@/lib/todo-delete';
import { toggleTodoSchema } from '@/lib/todo-schema';
import { TodoNotFoundError } from '@/lib/todos';

export async function deleteTodoAction(id: string): Promise<ActionResult<{ id: string }>> {
  // REQ-19.7: the §5 id rule, so an empty id never reaches storage.
  const parsed = toggleTodoSchema.safeParse({ id });
  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrorsOf(parsed.error) };
  }
  try {
    await deleteTodo(parsed.data.id);
    revalidatePath('/');
    return { ok: true, data: { id: parsed.data.id } };
  } catch (error) {
    // REQ-19.8: a missing id is not a §10 failure: no log, no refresh.
    if (error instanceof TodoNotFoundError) {
      return failure('id', 'Todo not found');
    }
    // REQ-19.9: any other thrown value (lib or revalidatePath) is logged once and resolves to the §10 form failure.
    logMutationFailure('deleteTodoAction', error);
    return failure('form', MUTATION_FAILED_MESSAGE);
  }
}
