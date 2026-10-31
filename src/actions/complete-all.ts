'use server';

// §14 mark all complete; §10 failure feedback and §11 logging as clearCompletedTodosAction. No input, so no Zod step.
import { revalidatePath } from 'next/cache';
import { failure, MUTATION_FAILED_MESSAGE, type ActionResult } from '@/lib/action-result';
import { logMutationFailure } from '@/lib/logger';
import { completeAllTodos } from '@/lib/todo-complete-all';

export async function completeAllTodosAction(): Promise<ActionResult<{ updated: number }>> {
  try {
    const updated = await completeAllTodos();
    revalidatePath('/');
    return { ok: true, data: { updated } };
  } catch (error) {
    // REQ-14.8: any thrown value (lib or revalidatePath) is logged once and resolves to the §10 form failure.
    logMutationFailure('completeAllTodosAction', error);
    return failure('form', MUTATION_FAILED_MESSAGE);
  }
}
