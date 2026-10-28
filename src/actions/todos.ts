'use server';

import type { ActionResult } from '@/lib/action-result';
import { NotImplementedError } from '@/lib/errors';
import type { Todo } from '@/lib/todos';

// Signature fits React's useActionState: (previousState, formData) => newState.
export async function createTodoAction(
  previous: ActionResult<Todo> | null,
  formData: FormData,
): Promise<ActionResult<Todo>> {
  const title = formData.get('title');
  const shownTitle = typeof title === 'string' ? title : '<no title>';
  return Promise.reject(
    new NotImplementedError(`createTodoAction(previous.ok=${String(previous?.ok)}, title=${shownTitle})`),
  );
}

export async function toggleTodoAction(id: string): Promise<ActionResult<Todo>> {
  return Promise.reject(new NotImplementedError(`toggleTodoAction(${id})`));
}
