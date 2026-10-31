'use server';

// §14 mark all complete; §10 failure feedback and §11 logging as clearCompletedTodosAction. Skeleton: the body is
// written by the green commit.
import type { ActionResult } from '@/lib/action-result';
import { NotImplementedError } from '@/lib/errors';

export async function completeAllTodosAction(): Promise<ActionResult<{ updated: number }>> {
  return Promise.reject(new NotImplementedError('completeAllTodosAction'));
}
