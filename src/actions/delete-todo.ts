'use server';

// §19 delete a todo; §10 failure feedback and §11 logging as toggleTodoAction. Skeleton: the body is written by the
// green commit.
import type { ActionResult } from '@/lib/action-result';
import { NotImplementedError } from '@/lib/errors';

export async function deleteTodoAction(id: string): Promise<ActionResult<{ id: string }>> {
  return Promise.reject(new NotImplementedError(`deleteTodoAction(${id})`));
}
